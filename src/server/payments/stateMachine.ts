import type { Payment, AuthorizationStatus } from '../../types/index.ts';
import { dbRepository } from '../db/repository.ts';
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
  }): Promise<Payment> {
    const { payment, nextState, actor, reason, idempotencyKey, details } = params;

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
      payment.interventionStatus = 'SCAM_CONFIRMED';
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

      // Check idempotency table
      const alreadyRun = await dbRepository.checkIdempotency(params.idempotencyKey);
      if (alreadyRun) {
        return payment;
      }

      // Execute on PayPal
      const captureResult = await paypalClient.captureAuthorization(
        payment.paypalAuthorizationId,
        { currency: payment.currency, value: payment.amount },
        params.idempotencyKey
      );

      // Record operation
      await dbRepository.recordOperation({
        paymentId: payment.id,
        operationType: 'CAPTURE',
        idempotencyKey: params.idempotencyKey,
        status: captureResult.status,
        responsePayload: captureResult,
        executedBy: params.actor,
      });

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

      const alreadyRun = await dbRepository.checkIdempotency(params.idempotencyKey);
      if (alreadyRun) {
        return payment;
      }

      // Execute on PayPal
      const voidResult = await paypalClient.voidAuthorization(
        payment.paypalAuthorizationId,
        params.idempotencyKey
      );

      // Record operation
      await dbRepository.recordOperation({
        paymentId: payment.id,
        operationType: 'VOID',
        idempotencyKey: params.idempotencyKey,
        status: voidResult.status,
        responsePayload: voidResult,
        executedBy: params.actor,
      });

      // Transition state
      return this.transition({
        payment,
        nextState: 'VOIDED',
        actor: params.actor,
        reason: params.reason,
        idempotencyKey: params.idempotencyKey,
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
