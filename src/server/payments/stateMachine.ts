import type { Payment, AuthorizationStatus } from '../../types/index.ts';
import { Prisma } from '@prisma/client';
import { dbRepository } from '../db/repository.ts';
import { checkDatabaseConnection, prisma } from '../db/client.ts';
import { paypalClient } from '../paypal/client.ts';

export type PaymentState =
  | 'CREATED'
  | 'BUYER_APPROVED'
  | 'AUTHORIZING'
  | 'AUTHORIZED'
  | 'REVIEW_PENDING'
  | 'AWAITING_CUSTOMER'
  | 'CAPTURE_PENDING'
  | 'CAPTURED'
  | 'VOID_PENDING'
  | 'VOIDED'
  | 'AUTHORIZATION_DENIED'
  | 'AUTHORIZATION_EXPIRED'
  | 'CAPTURE_DENIED'
  | 'PROCESSING_ERROR';

/**
 * Strict allowable payment state machine transitions
 */
const VALID_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  CREATED: ['BUYER_APPROVED', 'PROCESSING_ERROR', 'VOIDED'],
  BUYER_APPROVED: ['AUTHORIZING', 'PROCESSING_ERROR', 'VOIDED'],
  AUTHORIZING: ['AUTHORIZED', 'AUTHORIZATION_DENIED', 'PROCESSING_ERROR'],
  AUTHORIZED: ['REVIEW_PENDING', 'AWAITING_CUSTOMER', 'CAPTURE_PENDING', 'VOID_PENDING', 'CAPTURED', 'VOIDED'],
  REVIEW_PENDING: ['AWAITING_CUSTOMER', 'CAPTURE_PENDING', 'VOID_PENDING', 'CAPTURED', 'VOIDED'],
  AWAITING_CUSTOMER: ['CAPTURE_PENDING', 'VOID_PENDING', 'AUTHORIZATION_EXPIRED', 'CAPTURED', 'VOIDED'],
  CAPTURE_PENDING: ['CAPTURED', 'CAPTURE_DENIED', 'PROCESSING_ERROR'],
  CAPTURED: [], // Terminal
  VOID_PENDING: ['VOIDED', 'PROCESSING_ERROR'],
  VOIDED: [], // Terminal
  AUTHORIZATION_DENIED: [], // Terminal
  AUTHORIZATION_EXPIRED: [], // Terminal
  CAPTURE_DENIED: ['VOID_PENDING', 'PROCESSING_ERROR', 'VOIDED'],
  PROCESSING_ERROR: ['REVIEW_PENDING', 'CAPTURE_PENDING', 'VOID_PENDING', 'VOIDED'],
};

// In-memory mutex for payment operation concurrency
const paymentLocks = new Set<string>();

export class PaymentStateMachine {
  /**
   * Acquires a concurrency lock for a payment ID
   */
  public static async withLock<T>(paymentId: string, action: () => Promise<T>): Promise<T> {
    if (paymentLocks.has(paymentId)) {
      throw new Error(`[CONCURRENCY_LOCK] Payment ${paymentId} is currently undergoing another financial operation.`);
    }
    paymentLocks.add(paymentId);
    try {
      return await action();
    } finally {
      paymentLocks.delete(paymentId);
    }
  }

  /**
   * Validates if transition is allowed
   */
  public static canTransition(current: PaymentState, next: PaymentState): boolean {
    const allowed = VALID_TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  /**
   * Transitions payment state with idempotency check and audit logging
   */
  public static async transition(params: {
    payment: Payment;
    nextState: PaymentState;
    actor: 'CUSTOMER' | 'PAYPAL_SYSTEM' | 'SCAM_BRAKE_AI' | 'MERCHANT_POLICY' | 'SYSTEM_WORKER';
    reason: string;
    idempotencyKey?: string;
    details?: Record<string, unknown>;
    interventionOutcome?: 'ABANDONED' | 'SCAM_CONFIRMED';
  }): Promise<Payment> {
    const { payment, nextState, actor, reason, idempotencyKey, details, interventionOutcome } = params;

    // Map currentState
    let currentState: PaymentState = 'AUTHORIZED';
    if (payment.authorizationStatus === 'CAPTURED') currentState = 'CAPTURED';
    else if (payment.authorizationStatus === 'VOIDED') currentState = 'VOIDED';
    else if (payment.authorizationStatus === 'EXPIRED') currentState = 'AUTHORIZATION_EXPIRED';
    else if (payment.interventionStatus === 'ACTIVE_INTERVENTION') currentState = 'AWAITING_CUSTOMER';

    // Verify valid transition
    if (currentState === nextState) {
      return payment; // Idempotent no-op
    }

    if (!this.canTransition(currentState, nextState)) {
      throw new Error(
        `[STATE_MACHINE_ERROR] Invalid transition from ${currentState} to ${nextState} for payment ${payment.paymentReference}.`
      );
    }

    // Map next state into domain fields
    let authStatus: AuthorizationStatus = payment.authorizationStatus;
    if (nextState === 'CAPTURED') authStatus = 'CAPTURED';
    else if (nextState === 'VOIDED') authStatus = 'VOIDED';
    else if (nextState === 'AUTHORIZATION_EXPIRED') authStatus = 'EXPIRED';
    else if (nextState === 'AUTHORIZED' || nextState === 'AWAITING_CUSTOMER') authStatus = 'HOLD_ACTIVE';

    payment.authorizationStatus = authStatus;
    if (nextState === 'CAPTURED') {
      payment.interventionStatus = 'VERIFIED_SAFE';
      payment.resolvedAt = new Date().toISOString();
      payment.resolutionNotes = reason;
      payment.authorizationHoldSecondsRemaining = 0;
    } else if (nextState === 'VOIDED') {
      payment.interventionStatus = interventionOutcome || 'ABANDONED';
      payment.resolvedAt = new Date().toISOString();
      payment.resolutionNotes = reason;
      payment.authorizationHoldSecondsRemaining = 0;
    }

    // Persist updated payment
    await dbRepository.savePayment(payment);

    // Record audit event
    await dbRepository.recordAuditLog({
      paymentId: payment.id,
      eventType: nextState === 'CAPTURED' ? 'AUTHORIZATION_CAPTURED' : nextState === 'VOIDED' ? 'AUTHORIZATION_VOIDED' : 'AUTH_HOLD_INITIATED',
      actor,
      summary: `${nextState}: ${reason}`,
      details: {
        from: currentState,
        to: nextState,
        idempotencyKey,
        ...details,
      },
    });

    return payment;
  }

  /**
   * Executes authoritative Capture through PayPal
   */
  public static async executeCapture(params: {
    paymentId: string;
    actor: 'CUSTOMER' | 'MERCHANT_POLICY' | 'SYSTEM_WORKER';
    notes?: string;
    idempotencyKey: string;
  }): Promise<Payment> {
    return this.withLock(params.paymentId, async () => {
      const payment = await dbRepository.getPaymentById(params.paymentId);
      if (!payment) throw new Error(`Payment ${params.paymentId} not found.`);

      // Check if already captured (idempotent)
      if (payment.authorizationStatus === 'CAPTURED') {
        return payment;
      }

      if (payment.authorizationStatus === 'VOIDED') {
        throw new Error(`Cannot capture payment ${params.paymentId} because authorization has already been VOIDED.`);
      }
      if (payment.authorizationStatus !== 'HOLD_ACTIVE') {
        throw new Error(`Cannot capture payment ${params.paymentId} unless PayPal confirms an active authorization hold.`);
      }
      if (payment.interventionStatus === 'VERIFIED_SAFE') {
        const decision = await prisma.interventionSession.findUnique({
          where: { paymentId: payment.id },
          select: { customerDecision: true, status: true },
        });
        if (decision?.customerDecision !== 'PROCEED_PAYMENT' || decision.status !== 'RESOLVED_CAPTURE') {
          throw new Error('Cannot capture a reviewed payment without a persisted customer continuation decision.');
        }
      } else if (payment.interventionStatus !== 'NOT_REQUIRED') {
        throw new Error(
          `Cannot capture payment ${params.paymentId} while an intervention is unresolved or lacks a verified customer decision.`
        );
      }

      const reservation = await dbRepository.reserveOperation({
        paymentId: payment.id,
        operationType: 'CAPTURE',
        idempotencyKey: params.idempotencyKey,
        executedBy: params.actor,
      });
      if (!reservation.reserved) {
        throw new Error(`Capture operation already exists (${reservation.status || 'unknown'}); reconcile provider status before retrying.`);
      }

      let captureResult;
      try {
        captureResult = await paypalClient.captureAuthorization(
          payment.paypalAuthorizationId,
          { currency: payment.currency, value: payment.amount },
          params.idempotencyKey
        );
      } catch (error: unknown) {
        await dbRepository.recordOperation({
          paymentId: payment.id,
          operationType: 'CAPTURE',
          idempotencyKey: params.idempotencyKey,
          status: 'RECONCILIATION_REQUIRED',
          errorMessage: 'Provider outcome is unknown; reconcile before retrying.',
          executedBy: params.actor,
        });
        throw new Error('PayPal capture outcome is unknown; reconcile provider status before retrying.', { cause: error });
      }

      const captureMatches = captureResult.amount.currency_code === payment.currency &&
        Number(captureResult.amount.value).toFixed(2) === Number(payment.amount).toFixed(2) &&
        captureResult.final_capture === true;
      if (captureResult.status !== 'COMPLETED' || !captureMatches) {
        await dbRepository.recordOperation({
          paymentId: payment.id,
          operationType: 'CAPTURE',
          idempotencyKey: params.idempotencyKey,
          status: 'RECONCILIATION_REQUIRED',
          responsePayload: JSON.parse(JSON.stringify(captureResult)) as Prisma.InputJsonValue,
          errorMessage: 'Provider response is non-final or does not match the authorized amount.',
          executedBy: params.actor,
        });
        throw new Error(`PayPal capture is not complete (provider status: ${captureResult.status}).`);
      }

      // Keep the capture, authorization, and idempotency result consistent in PostgreSQL.
      if (await checkDatabaseConnection()) {
        try {
          await prisma.$transaction(async (tx) => {
            await tx.paymentCapture.create({
              data: {
                paymentId: payment.id,
                paypalCaptureId: captureResult.id,
                status: captureResult.status,
                amount: captureResult.amount.value,
                currency: captureResult.amount.currency_code,
                finalCapture: captureResult.final_capture,
                rawResponse: JSON.parse(JSON.stringify(captureResult)) as Prisma.InputJsonValue,
              },
            });
            await tx.paymentAuthorization.update({
              where: { paymentId: payment.id },
              data: { status: 'CAPTURED' },
            });
            await tx.paymentOperation.update({
              where: { idempotencyKey: params.idempotencyKey },
              data: { status: 'SUCCEEDED', responsePayload: JSON.parse(JSON.stringify(captureResult)) as Prisma.InputJsonValue },
            });
          });
        } catch {
          await dbRepository.recordOperation({
            paymentId: payment.id,
            operationType: 'CAPTURE',
            idempotencyKey: params.idempotencyKey,
            status: 'RECONCILIATION_REQUIRED',
            errorMessage: 'PayPal confirmed capture but database persistence failed.',
            executedBy: params.actor,
          });
          throw new Error('PayPal confirmed capture but local persistence failed; reconciliation is required.');
        }
      } else {
        await dbRepository.recordOperation({
          paymentId: payment.id,
          operationType: 'CAPTURE',
          idempotencyKey: params.idempotencyKey,
          status: 'SUCCEEDED',
          responsePayload: JSON.parse(JSON.stringify(captureResult)) as Prisma.InputJsonValue,
          executedBy: params.actor,
        });
      }

      // Transition state
      return this.transition({
        payment,
        nextState: 'CAPTURED',
        actor: params.actor,
        reason: params.notes || 'Payment verified safe and captured.',
        idempotencyKey: params.idempotencyKey,
        details: { captureId: captureResult.id, providerStatus: captureResult.status },
      });
    });
  }

  /**
   * Executes authoritative Void through PayPal
   */
  public static async executeVoid(params: {
    paymentId: string;
    actor: 'CUSTOMER' | 'MERCHANT_POLICY' | 'SYSTEM_WORKER';
    reason: string;
    idempotencyKey: string;
    interventionOutcome?: 'ABANDONED' | 'SCAM_CONFIRMED';
  }): Promise<Payment> {
    return this.withLock(params.paymentId, async () => {
      const payment = await dbRepository.getPaymentById(params.paymentId);
      if (!payment) throw new Error(`Payment ${params.paymentId} not found.`);

      // If already voided, return idempotent response
      if (payment.authorizationStatus === 'VOIDED') {
        return payment;
      }

      if (payment.authorizationStatus === 'CAPTURED') {
        throw new Error(`Cannot void payment ${params.paymentId} because it has already been CAPTURED.`);
      }
      if (payment.authorizationStatus !== 'HOLD_ACTIVE') {
        throw new Error(`Cannot void payment ${params.paymentId} unless PayPal confirms an active authorization hold.`);
      }

      const reservation = await dbRepository.reserveOperation({
        paymentId: payment.id,
        operationType: 'VOID',
        idempotencyKey: params.idempotencyKey,
        executedBy: params.actor,
      });
      if (!reservation.reserved) {
        throw new Error(`Void operation already exists (${reservation.status || 'unknown'}); reconcile provider status before retrying.`);
      }

      let voidResult;
      try {
        voidResult = await paypalClient.voidAuthorization(payment.paypalAuthorizationId, params.idempotencyKey);
      } catch (error: unknown) {
        await dbRepository.recordOperation({
          paymentId: payment.id,
          operationType: 'VOID',
          idempotencyKey: params.idempotencyKey,
          status: 'RECONCILIATION_REQUIRED',
          errorMessage: 'Provider outcome is unknown; reconcile before retrying.',
          executedBy: params.actor,
        });
        throw new Error('PayPal void outcome is unknown; reconcile provider status before retrying.', { cause: error });
      }

      if (voidResult.status !== 'VOIDED') {
        await dbRepository.recordOperation({
          paymentId: payment.id,
          operationType: 'VOID',
          idempotencyKey: params.idempotencyKey,
          status: 'RECONCILIATION_REQUIRED',
          responsePayload: JSON.parse(JSON.stringify(voidResult)) as Prisma.InputJsonValue,
          errorMessage: `Provider returned non-final status ${voidResult.status}.`,
          executedBy: params.actor,
        });
        throw new Error(`PayPal authorization void is not confirmed (provider status: ${voidResult.status}).`);
      }

      if (await checkDatabaseConnection()) {
        try {
          await prisma.$transaction(async (tx) => {
            await tx.paymentAuthorization.update({
              where: { paymentId: payment.id },
              data: { status: 'VOIDED' },
            });
            await tx.payPalOrder.updateMany({ where: { paymentId: payment.id }, data: { status: 'VOIDED' } });
            await tx.paymentOperation.update({
              where: { idempotencyKey: params.idempotencyKey },
              data: { status: 'SUCCEEDED', responsePayload: JSON.parse(JSON.stringify(voidResult)) as Prisma.InputJsonValue },
            });
          });
        } catch {
          await dbRepository.recordOperation({
            paymentId: payment.id,
            operationType: 'VOID',
            idempotencyKey: params.idempotencyKey,
            status: 'RECONCILIATION_REQUIRED',
            errorMessage: 'PayPal confirmed void but database persistence failed.',
            executedBy: params.actor,
          });
          throw new Error('PayPal confirmed void but local persistence failed; reconciliation is required.');
        }
      } else {
        await dbRepository.recordOperation({
          paymentId: payment.id,
          operationType: 'VOID',
          idempotencyKey: params.idempotencyKey,
          status: 'SUCCEEDED',
          responsePayload: JSON.parse(JSON.stringify(voidResult)) as Prisma.InputJsonValue,
          executedBy: params.actor,
        });
      }

      // Transition state
      return this.transition({
        payment,
        nextState: 'VOIDED',
        actor: params.actor,
        reason: params.reason,
        idempotencyKey: params.idempotencyKey,
        interventionOutcome: params.interventionOutcome || 'ABANDONED',
        details: { voidResult },
      });
    });
  }

  /**
   * Reconciles application state with PayPal Webhook or direct status lookup
   */
  public static async reconcile(paymentId: string, providerStatus: string, eventId?: string): Promise<Payment> {
    return this.withLock(paymentId, async () => {
      const payment = await dbRepository.getPaymentById(paymentId);
      if (!payment) throw new Error(`Payment ${paymentId} not found for reconciliation.`);

      if (providerStatus === 'CAPTURED' && payment.authorizationStatus !== 'CAPTURED') {
        return this.transition({
          payment,
          nextState: 'CAPTURED',
          actor: 'PAYPAL_SYSTEM',
          reason: `Reconciled from PayPal status ${providerStatus}`,
          details: { eventId },
        });
      }

      if (providerStatus === 'VOIDED' && payment.authorizationStatus !== 'VOIDED') {
        return this.transition({
          payment,
          nextState: 'VOIDED',
          actor: 'PAYPAL_SYSTEM',
          reason: `Reconciled from PayPal status ${providerStatus}`,
          details: { eventId },
        });
      }

      return payment;
    });
  }
}
