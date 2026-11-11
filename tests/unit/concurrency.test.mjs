import assert from 'node:assert/strict';
import test from 'node:test';

test('Concurrency: Parallel double-capture calls handle duplicate captures gracefully without corruption', async () => {
  const { PaymentStateMachine } = await import('../../src/server/payments/stateMachine.ts');
  const { dbRepository } = await import('../../src/server/db/repository.ts');

  const testId = `pay_race_cap_${Date.now()}`;
  await dbRepository.savePayment({
    id: testId,
    paymentReference: testId,
    paypalOrderId: `5O_${testId}`,
    paypalAuthorizationId: `2C_${testId}`,
    merchantId: 'merch_apex_9812',
    merchantName: 'Apex Electronics',
    merchantCategory: 'Electronics',
    productName: 'Race Test Item',
    productCategory: 'Electronics',
    amount: 199.99,
    currency: 'USD',
    riskScore: 10,
    riskLevel: 'LOW',
    authorizationStatus: 'HOLD_ACTIVE',
    interventionStatus: 'NOT_REQUIRED',
    customer: {
      id: 'cust_race_1',
      name: 'Race Customer',
      maskedEmail: 'race***@test.com',
      maskedPhone: '+1 (555) ***-9999',
      accountAgeMonths: 24,
      hasTrustedContact: false,
    },
    createdAt: new Date().toISOString(),
    authorizedAt: new Date().toISOString(),
    holdExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    riskSignals: [],
    authorizationHoldSecondsRemaining: 3600,
  });

  await dbRepository.saveIntervention({
    id: `int_${testId}`,
    paymentId: testId,
    status: 'RESOLVED_CAPTURE',
    customerDecision: 'PROCEED_PAYMENT',
    startedAt: new Date().toISOString(),
    messages: [],
  });

  // Launch 10 simultaneous capture executions with the same idempotency key
  const idempotencyKey = `idem_race_${testId}`;
  const results = await Promise.allSettled(
    Array.from({ length: 10 }).map((_, i) =>
      PaymentStateMachine.executeCapture({
        paymentId: testId,
        actor: 'MERCHANT_POLICY',
        idempotencyKey,
        notes: `Parallel capture attempt ${i}`,
      })
    )
  );

  const fulfilled = results.filter((r) => r.status === 'fulfilled');

  // All parallel attempts must either succeed idempotently or be safely handled
  assert.ok(fulfilled.length >= 1, 'At least one capture attempt must succeed');
  for (const f of fulfilled) {
    assert.equal(f.value.authorizationStatus, 'CAPTURED');
  }

  // The persisted payment must be in CAPTURED state
  const finalPayment = await dbRepository.getPaymentById(testId);
  assert.equal(finalPayment?.authorizationStatus, 'CAPTURED');
  assert.equal(finalPayment?.interventionStatus, 'VERIFIED_SAFE');
});

test('Concurrency: Competing Capture vs Void race resolves to exactly one terminal state', async () => {
  const { PaymentStateMachine } = await import('../../src/server/payments/stateMachine.ts');
  const { dbRepository } = await import('../../src/server/db/repository.ts');

  const testId = `pay_race_clash_${Date.now()}`;
  await dbRepository.savePayment({
    id: testId,
    paymentReference: testId,
    paypalOrderId: `5O_${testId}`,
    paypalAuthorizationId: `2C_${testId}`,
    merchantId: 'merch_apex_9812',
    merchantName: 'Apex Electronics',
    merchantCategory: 'Electronics',
    productName: 'Clash Test Item',
    productCategory: 'Electronics',
    amount: 500.0,
    currency: 'USD',
    riskScore: 20,
    riskLevel: 'LOW',
    authorizationStatus: 'HOLD_ACTIVE',
    interventionStatus: 'NOT_REQUIRED',
    customer: {
      id: 'cust_clash_1',
      name: 'Clash Customer',
      maskedEmail: 'clash***@test.com',
      maskedPhone: '+1 (555) ***-8888',
      accountAgeMonths: 18,
      hasTrustedContact: false,
    },
    createdAt: new Date().toISOString(),
    authorizedAt: new Date().toISOString(),
    holdExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    riskSignals: [],
    authorizationHoldSecondsRemaining: 3600,
  });

  await dbRepository.saveIntervention({
    id: `int_${testId}`,
    paymentId: testId,
    status: 'RESOLVED_CAPTURE',
    customerDecision: 'PROCEED_PAYMENT',
    startedAt: new Date().toISOString(),
    messages: [],
  });

  // Launch competing capture and void simultaneously
  const [captureResult, voidResult] = await Promise.allSettled([
    PaymentStateMachine.executeCapture({
      paymentId: testId,
      actor: 'MERCHANT_POLICY',
      idempotencyKey: `idem_cap_${testId}`,
    }),
    PaymentStateMachine.executeVoid({
      paymentId: testId,
      actor: 'CUSTOMER',
      idempotencyKey: `idem_void_${testId}`,
      reason: 'Competing customer cancellation',
    }),
  ]);

  const outcomes = [captureResult.status, voidResult.status];
  assert.ok(outcomes.includes('fulfilled'), 'At least one operation must succeed');

  // Verify that the final record has only one definitive terminal state
  const finalPayment = await dbRepository.getPaymentById(testId);
  assert.ok(
    finalPayment?.authorizationStatus === 'CAPTURED' || finalPayment?.authorizationStatus === 'VOIDED',
    `Expected terminal state CAPTURED or VOIDED, got ${finalPayment?.authorizationStatus}`
  );

  // If one won, the loser must either have failed or state machine prevented dual terminal execution
  if (captureResult.status === 'fulfilled' && voidResult.status === 'fulfilled') {
    assert.equal(finalPayment?.authorizationStatus, captureResult.value.authorizationStatus);
  }
});

test('Concurrency: Atomic idempotency reservation rejects parallel duplicate operations', async () => {
  const { dbRepository } = await import('../../src/server/db/repository.ts');

  const testId = `pay_race_reserve_${Date.now()}`;
  const opKey = `race_key_${Date.now()}`;

  // Fire 5 simultaneous reservation requests
  const reservations = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      dbRepository.reserveOperation({
        paymentId: testId,
        operationType: 'CREATE_ORDER',
        idempotencyKey: opKey,
        executedBy: 'CUSTOMER',
      })
    )
  );

  const granted = reservations.filter((r) => r.reserved === true);
  const rejected = reservations.filter((r) => r.reserved === false);

  assert.equal(granted.length, 1, 'Exactly one reservation must be granted');
  assert.equal(rejected.length, 4, 'All concurrent duplicate reservations must be rejected');
});
