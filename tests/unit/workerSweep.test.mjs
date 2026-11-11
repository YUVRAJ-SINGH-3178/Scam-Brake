import assert from 'node:assert/strict';
import test from 'node:test';

test('Worker Sweep: Automatically voids timed-out active holds and preserves non-expired holds', async () => {
  const { BackgroundWorker } = await import('../../src/server/worker/scheduler.ts');
  const { dbRepository } = await import('../../src/server/db/repository.ts');

  const now = Date.now();
  const expiredId = `pay_worker_expired_${now}`;
  const activeId = `pay_worker_active_${now}`;

  // 1. Setup expired payment (started 30 minutes ago, 10 min timeout)
  await dbRepository.savePayment({
    id: expiredId,
    paymentReference: expiredId,
    paypalOrderId: `5O_${expiredId}`,
    paypalAuthorizationId: `2C_${expiredId}`,
    merchantId: 'merch_apex_9812',
    merchantName: 'Apex Electronics',
    merchantCategory: 'Electronics',
    productName: 'Expired Gift Cards',
    productCategory: 'Stored Value',
    amount: 500.0,
    currency: 'USD',
    riskScore: 85,
    riskLevel: 'HIGH',
    authorizationStatus: 'HOLD_ACTIVE',
    interventionStatus: 'ACTIVE_INTERVENTION',
    customer: {
      id: 'cust_w1',
      name: 'Timeout Customer',
      maskedEmail: 't***@example.com',
      maskedPhone: '+1 (555) ***-1111',
      accountAgeMonths: 12,
      hasTrustedContact: false,
    },
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
    authorizedAt: new Date(now - 30 * 60 * 1000).toISOString(),
    holdExpiresAt: new Date(now + 24 * 3600 * 1000).toISOString(),
    riskSignals: [],
    authorizationHoldSecondsRemaining: 24 * 3600,
  });

  await dbRepository.saveIntervention({
    id: `int_${expiredId}`,
    paymentId: expiredId,
    status: 'ACTIVE_INTERVENTION',
    scamHypothesis: 'Impersonation timeout test',
    startedAt: new Date(now - 30 * 60 * 1000).toISOString(),
    messages: [],
  });

  // 2. Setup active payment (started 2 minutes ago, 10 min timeout)
  await dbRepository.savePayment({
    id: activeId,
    paymentReference: activeId,
    paypalOrderId: `5O_${activeId}`,
    paypalAuthorizationId: `2C_${activeId}`,
    merchantId: 'merch_apex_9812',
    merchantName: 'Apex Electronics',
    merchantCategory: 'Electronics',
    productName: 'Active Camera Purchase',
    productCategory: 'Electronics',
    amount: 1200.0,
    currency: 'USD',
    riskScore: 70,
    riskLevel: 'HIGH',
    authorizationStatus: 'HOLD_ACTIVE',
    interventionStatus: 'ACTIVE_INTERVENTION',
    customer: {
      id: 'cust_w2',
      name: 'Active Customer',
      maskedEmail: 'a***@example.com',
      maskedPhone: '+1 (555) ***-2222',
      accountAgeMonths: 18,
      hasTrustedContact: false,
    },
    createdAt: new Date(now - 2 * 60 * 1000).toISOString(),
    authorizedAt: new Date(now - 2 * 60 * 1000).toISOString(),
    holdExpiresAt: new Date(now + 24 * 3600 * 1000).toISOString(),
    riskSignals: [],
    authorizationHoldSecondsRemaining: 24 * 3600,
  });

  await dbRepository.saveIntervention({
    id: `int_${activeId}`,
    paymentId: activeId,
    status: 'ACTIVE_INTERVENTION',
    scamHypothesis: 'Active intervention',
    startedAt: new Date(now - 2 * 60 * 1000).toISOString(),
    messages: [],
  });

  // 3. Execute sweep
  const worker = new BackgroundWorker();
  const summary = await worker.executeSweep();

  assert.ok(summary.processedHolds >= 2, `Processed holds expected >= 2, got ${summary.processedHolds}`);
  assert.ok(summary.voidedTimeouts >= 1, `Voided timeouts expected >= 1, got ${summary.voidedTimeouts}`);

  // 4. Verify expired payment transitioned to VOIDED
  const updatedExpired = await dbRepository.getPaymentById(expiredId);
  assert.equal(updatedExpired?.authorizationStatus, 'VOIDED');
  assert.equal(updatedExpired?.interventionStatus, 'ABANDONED');

  // 5. Verify non-expired payment remains HOLD_ACTIVE
  const updatedActive = await dbRepository.getPaymentById(activeId);
  assert.equal(updatedActive?.authorizationStatus, 'HOLD_ACTIVE');
  assert.equal(updatedActive?.interventionStatus, 'ACTIVE_INTERVENTION');

  // 6. Verify audit trail was created for the automated timeout void
  const auditLogs = await dbRepository.getAuditLogs(expiredId);
  const timeoutVoidAudit = auditLogs.find((log) => log.actor === 'SYSTEM_WORKER');
  assert.ok(timeoutVoidAudit, 'Expected SYSTEM_WORKER audit event');
});
