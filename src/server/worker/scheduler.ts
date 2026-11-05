import { dbRepository } from '../db/repository.ts';
import { PaymentStateMachine } from '../payments/stateMachine.ts';
import { zapierAutomationRelay } from '../zapier/relay.ts';

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
    const policy = await dbRepository.getRiskPolicy();

    let processedHolds = 0;
    let voidedTimeouts = 0;
    const errors: string[] = [];

    for (const payment of payments) {
      if (payment.authorizationStatus === 'HOLD_ACTIVE' || payment.authorizationStatus === 'PENDING_REVIEW') {
        processedHolds++;

        const holdExpiry = new Date(payment.holdExpiresAt);
        const authorizedAt = new Date(payment.authorizedAt);
        const maxHoldMs = policy.interventionTimeoutMinutes * 60 * 1000;
        const policyDeadline = new Date(authorizedAt.getTime() + maxHoldMs);

        // Check if either PayPal hold expired or policy deadline passed
        const isExpired = now >= holdExpiry || now >= policyDeadline;

        if (isExpired && payment.interventionStatus === 'ACTIVE_INTERVENTION') {
          try {
            await PaymentStateMachine.executeVoid({
              paymentId: payment.id,
              actor: 'SYSTEM_WORKER',
              reason: `Automated intervention timeout reached (${policy.interventionTimeoutMinutes}m). Merchant policy pre-capture void executed to preserve customer balance.`,
              idempotencyKey: `timeout_void_${payment.id}_${Math.floor(now.getTime() / 60000)}`,
            });

            voidedTimeouts++;

            await zapierAutomationRelay.triggerEvent({
              eventType: 'AUTHORIZATION_VOIDED',
              paymentId: payment.id,
              payload: {
                paymentReference: payment.paymentReference,
                amount: payment.amount,
                reason: 'INTERVENTION_TIMEOUT_EXPIRED',
              },
            });
          } catch (err: any) {
            console.error(`[WORKER] Failed to execute timeout void on ${payment.id}:`, err);
            errors.push(`${payment.id}: ${err.message}`);
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

// Standalone execution entrypoint when run as a worker process
if (require.main === module) {
  backgroundWorker.start(30000);
}
