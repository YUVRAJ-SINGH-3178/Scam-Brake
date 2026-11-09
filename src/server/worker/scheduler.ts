import { createHash } from 'node:crypto';
import { dbRepository } from '../db/repository.ts';
import { PaymentStateMachine } from '../payments/stateMachine.ts';

export class BackgroundWorker {
  private isRunning = false;
  private intervalTimer: NodeJS.Timeout | null = null;

  /**
   * Single idempotent execution sweep
   */
  public async executeSweep(): Promise<{
    processedHolds: number;
    voidedTimeouts: number;
    errors: string[];
  }> {
    const now = new Date();
    const payments = await dbRepository.getPayments();

    let processedHolds = 0;
    let voidedTimeouts = 0;
    const errors: string[] = [];

    for (const payment of payments) {
      if (payment.authorizationStatus === 'HOLD_ACTIVE' && payment.interventionStatus === 'ACTIVE_INTERVENTION') {
        processedHolds++;
        const policy = await dbRepository.getRiskPolicy(payment.merchantId);
        const holdExpiry = new Date(payment.holdExpiresAt);
        const intervention = await dbRepository.getInterventionByPaymentId(payment.id);
        if (!intervention) {
          errors.push(`${payment.id}: active intervention is missing its persisted start time.`);
          continue;
        }
        const policyDeadline = new Date(new Date(intervention.startedAt).getTime() + policy.interventionTimeoutMinutes * 60 * 1000);
        const timeoutReached = now >= policyDeadline;
        const providerHoldExpired = now >= holdExpiry;
        if (timeoutReached || providerHoldExpired) {
          if (!timeoutReached || policy.timeoutAction !== 'VOID' || providerHoldExpired) {
            const status = providerHoldExpired ? 'RECONCILIATION_REQUIRED' : policy.timeoutAction === 'ESCALATE' ? 'TIMED_OUT_ESCALATED' : 'TIMED_OUT_MANUAL_REVIEW';
            await dbRepository.updateInterventionStatus({
              paymentId: payment.id,
              status,
              customerDecision: 'TIMED_OUT',
            });
            await dbRepository.recordAuditLog({
              paymentId: payment.id,
              eventType: 'HOLD_EXPIRED',
              actor: 'SYSTEM_WORKER',
              summary: providerHoldExpired ? 'Provider hold expiry requires reconciliation.' : `Intervention timed out; policy action is ${policy.timeoutAction}.`,
              details: { interventionStartedAt: intervention.startedAt, timeoutMinutes: policy.interventionTimeoutMinutes, timeoutAction: policy.timeoutAction },
            });
            continue;
          }
          try {
            await PaymentStateMachine.executeVoid({
              paymentId: payment.id,
              actor: 'SYSTEM_WORKER',
              reason: `Automated intervention timeout reached (${policy.interventionTimeoutMinutes}m). Merchant policy pre-capture void executed to preserve customer balance.`,
              idempotencyKey: createHash('sha256').update(`timeout-void:${payment.id}`).digest('hex').slice(0, 36),
              interventionOutcome: 'ABANDONED',
            });
            voidedTimeouts++;
            await dbRepository.updateInterventionStatus({
              paymentId: payment.id,
              status: 'RESOLVED_VOID',
              customerDecision: 'TIMED_OUT',
              completedAt: now,
            });
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown worker error';
            console.error(`[WORKER] Failed to execute timeout void on ${payment.id}.`);
            await dbRepository.updateInterventionStatus({ paymentId: payment.id, status: 'RECONCILIATION_REQUIRED' });
            errors.push(`${payment.id}: ${message}`);
          }
        }
      }
    }

    return { processedHolds, voidedTimeouts, errors };
  }

  public start(intervalMs = 30000): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[BACKGROUND_WORKER] Started payment hold monitor (sweep every ${intervalMs / 1000}s)`);
    this.intervalTimer = setInterval(() => {
      this.executeSweep().catch((err) => {
        console.error('[BACKGROUND_WORKER] Sweep error:', err);
      });
    }, intervalMs);
  }

  public stop(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    this.isRunning = false;
    console.log('[BACKGROUND_WORKER] Stopped.');
  }
}

export const backgroundWorker = new BackgroundWorker();
