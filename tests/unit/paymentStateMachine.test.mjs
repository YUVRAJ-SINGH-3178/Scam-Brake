import assert from 'node:assert/strict';
import test from 'node:test';

test('Payment State Machine — Valid State Transitions', async () => {
  const { PaymentStateMachine } = await import('../../src/server/payments/stateMachine.ts');

  assert.equal(PaymentStateMachine.canTransition('CREATED', 'BUYER_APPROVED'), true);
  assert.equal(PaymentStateMachine.canTransition('BUYER_APPROVED', 'AUTHORIZING'), true);
  assert.equal(PaymentStateMachine.canTransition('AUTHORIZING', 'AUTHORIZED'), true);
  assert.equal(PaymentStateMachine.canTransition('AUTHORIZED', 'AWAITING_CUSTOMER'), true);
  assert.equal(PaymentStateMachine.canTransition('AWAITING_CUSTOMER', 'CAPTURE_PENDING'), true);
  assert.equal(PaymentStateMachine.canTransition('AWAITING_CUSTOMER', 'VOID_PENDING'), true);
  assert.equal(PaymentStateMachine.canTransition('CAPTURE_PENDING', 'CAPTURED'), true);
  assert.equal(PaymentStateMachine.canTransition('VOID_PENDING', 'VOIDED'), true);
});

test('Payment State Machine — Prohibits Invalid Financial Transitions', async () => {
  const { PaymentStateMachine } = await import('../../src/server/payments/stateMachine.ts');

  // Terminal states cannot transition to anything
  assert.equal(PaymentStateMachine.canTransition('CAPTURED', 'VOIDED'), false);
  assert.equal(PaymentStateMachine.canTransition('VOIDED', 'CAPTURED'), false);
  assert.equal(PaymentStateMachine.canTransition('CREATED', 'CAPTURED'), false);
  assert.equal(PaymentStateMachine.canTransition('AUTHORIZATION_DENIED', 'CAPTURED'), false);
});

test('Payment State Machine — Rejects Void on Already Captured Payment', async () => {
  const { PaymentStateMachine } = await import('../../src/server/payments/stateMachine.ts');
  const { dbRepository } = await import('../../src/server/db/repository.ts');

  const testId = `pay_test_cap_${Date.now()}`;
  await dbRepository.savePayment({
    id: testId,
    paymentReference: testId,
    paypalOrderId: '5O_TEST_123',
    paypalAuthorizationId: '2C_TEST_456',
    merchantId: 'merch_apex_9812',
    merchantName: 'Apex Electronics',
    merchantCategory: 'Electronics',
    productName: 'Test Item',
    productCategory: 'Electronics',
    amount: 100.0,
    currency: 'USD',
    riskScore: 10,
    riskLevel: 'LOW',
    authorizationStatus: 'CAPTURED', // ALREADY CAPTURED
    interventionStatus: 'VERIFIED_SAFE',
    customer: {
      id: 'cust_1',
      name: 'Test Customer',
      maskedEmail: 't***@test.com',
      maskedPhone: '+1 (555) ***-1234',
      accountAgeMonths: 12,
      hasTrustedContact: false,
    },
    createdAt: new Date().toISOString(),
    authorizedAt: new Date().toISOString(),
    holdExpiresAt: new Date().toISOString(),
    riskSignals: [],
    authorizationHoldSecondsRemaining: 0,
  });

  await assert.rejects(
    async () => {
      await PaymentStateMachine.executeVoid({
        paymentId: testId,
        actor: 'CUSTOMER',
        reason: 'Attempting invalid void on captured payment',
        idempotencyKey: `idem_${testId}`,
      });
    },
    /already been CAPTURED/
  );
});

test('Payment State Machine — Idempotent Duplicate Capture Handled Gracefully', async () => {
  const { PaymentStateMachine } = await import('../../src/server/payments/stateMachine.ts');
  const { dbRepository } = await import('../../src/server/db/repository.ts');

  const testId = `pay_test_idem_${Date.now()}`;
  await dbRepository.savePayment({
    id: testId,
    paymentReference: testId,
    paypalOrderId: '5O_TEST_IDEM',
    paypalAuthorizationId: '2C_TEST_IDEM',
    merchantId: 'merch_apex_9812',
    merchantName: 'Apex Electronics',
    merchantCategory: 'Electronics',
    productName: 'Test Item',
    productCategory: 'Electronics',
    amount: 250.0,
    currency: 'USD',
    riskScore: 15,
    riskLevel: 'LOW',
    authorizationStatus: 'HOLD_ACTIVE',
    interventionStatus: 'NOT_REQUIRED',
    customer: {
      id: 'cust_idem',
      name: 'Test Customer',
      maskedEmail: 't***@test.com',
      maskedPhone: '+1 (555) ***-1234',
      accountAgeMonths: 12,
      hasTrustedContact: false,
    },
    createdAt: new Date().toISOString(),
    authorizedAt: new Date().toISOString(),
    holdExpiresAt: new Date(Date.now() + 86400000).toISOString(),
    riskSignals: [],
    authorizationHoldSecondsRemaining: 86400,
  });

  const idemKey = `idem_cap_key_${testId}`;

  // First capture
  const res1 = await PaymentStateMachine.executeCapture({
    paymentId: testId,
    actor: 'MERCHANT_POLICY',
    notes: 'First capture execution',
    idempotencyKey: idemKey,
  });
  assert.equal(res1.authorizationStatus, 'CAPTURED');

  // Second duplicate capture with same key
  const res2 = await PaymentStateMachine.executeCapture({
    paymentId: testId,
    actor: 'MERCHANT_POLICY',
    notes: 'Duplicate capture execution',
    idempotencyKey: idemKey,
  });
  assert.equal(res2.authorizationStatus, 'CAPTURED');
});

test('Payment State Machine rejects capture while intervention is unresolved', async () => {
  const { PaymentStateMachine } = await import('../../src/server/payments/stateMachine.ts');
  const { dbRepository } = await import('../../src/server/db/repository.ts');
  const testId = `pay_test_intervention_${Date.now()}`;
  await dbRepository.savePayment({
    id: testId,
    paymentReference: testId,
    paypalOrderId: `order-${testId}`,
    paypalAuthorizationId: `auth-${testId}`,
    merchantId: 'merchant-test-intervention',
    merchantName: 'Test Merchant',
    merchantCategory: 'Test',
    productName: 'Test item',
    productCategory: 'Test',
    amount: 50,
    currency: 'USD',
    riskScore: 90,
    riskLevel: 'CRITICAL',
    authorizationStatus: 'HOLD_ACTIVE',
    interventionStatus: 'ACTIVE_INTERVENTION',
    customer: { id: 'customer-test-intervention', name: 'Test', maskedEmail: 't***@example.test', maskedPhone: '', accountAgeMonths: 1, hasTrustedContact: false },
    createdAt: new Date().toISOString(),
    authorizedAt: new Date().toISOString(),
    holdExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    riskSignals: [],
    authorizationHoldSecondsRemaining: 60,
  });
  await assert.rejects(
    PaymentStateMachine.executeCapture({ paymentId: testId, actor: 'MERCHANT_POLICY', idempotencyKey: `capture-${testId}` }),
    /intervention is unresolved/i,
  );
});

