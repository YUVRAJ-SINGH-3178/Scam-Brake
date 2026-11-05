import assert from 'node:assert/strict';
import test from 'node:test';

test('database payment predicates always support merchant ownership filters', async () => {
  const { buildPaymentWhere } = await import('../../src/server/db/repository.ts');
  assert.deepEqual(buildPaymentWhere({ merchantId: 'merchant-a' }), { merchantId: 'merchant-a' });
  assert.deepEqual(
    buildPaymentWhere({ merchantId: 'merchant-b', riskLevel: 'HIGH', status: 'HOLD_ACTIVE' }),
    { merchantId: 'merchant-b', riskLevel: 'HIGH', authorizationStatus: 'HOLD_ACTIVE' },
  );
});

test('fallback repository scopes payment lists, detail, metrics, and audit logs by tenant', async () => {
  const { dbRepository } = await import('../../src/server/db/repository.ts');
  const now = new Date().toISOString();
  const makePayment = (id, merchantId) => ({
    id,
    paymentReference: id,
    paypalOrderId: `order-${id}`,
    paypalAuthorizationId: `auth-${id}`,
    merchantId,
    merchantName: merchantId,
    merchantCategory: 'Test merchant',
    productName: 'Test item',
    productCategory: 'Test',
    amount: 12.5,
    currency: 'USD',
    riskScore: 10,
    riskLevel: 'LOW',
    authorizationStatus: 'HOLD_ACTIVE',
    interventionStatus: 'NOT_REQUIRED',
    customer: { id: `customer-${id}`, name: 'Sample Customer', maskedEmail: 's***@example.test', maskedPhone: '', accountAgeMonths: 1, hasTrustedContact: false },
    createdAt: now,
    authorizedAt: now,
    holdExpiresAt: now,
    riskSignals: [],
    authorizationHoldSecondsRemaining: 0,
  });

  await dbRepository.savePayment(makePayment('tenant-test-payment-a', 'merchant-test-a'));
  await dbRepository.savePayment(makePayment('tenant-test-payment-b', 'merchant-test-b'));
  await assert.rejects(
    dbRepository.savePayment(makePayment('tenant-test-payment-a', 'merchant-test-b')),
    /belongs to another merchant/i,
  );
  await dbRepository.recordAuditLog({ paymentId: 'tenant-test-payment-a', eventType: 'AUTH_HOLD_INITIATED', actor: 'CUSTOMER', summary: 'A record' });
  await dbRepository.recordAuditLog({ paymentId: 'tenant-test-payment-b', eventType: 'AUTH_HOLD_INITIATED', actor: 'CUSTOMER', summary: 'B record' });

  assert.deepEqual((await dbRepository.getPayments({ merchantId: 'merchant-test-a' })).map((p) => p.id), ['tenant-test-payment-a']);
  assert.deepEqual((await dbRepository.getPayments({ merchantId: 'merchant-test-b' })).map((p) => p.id), ['tenant-test-payment-b']);
  assert.equal(await dbRepository.getPaymentById('tenant-test-payment-b', 'merchant-test-a'), undefined);
  assert.equal((await dbRepository.getPaymentById('tenant-test-payment-b', 'merchant-test-b'))?.id, 'tenant-test-payment-b');
  assert.equal((await dbRepository.getMetrics('merchant-test-a')).totalTransactionsReviewed, 1);
  assert.deepEqual((await dbRepository.getAuditLogs('tenant-test-payment-b', 'merchant-test-a')), []);
  assert.deepEqual((await dbRepository.getAuditLogs(undefined, 'merchant-test-a')).map((event) => event.paymentId), ['tenant-test-payment-a']);
});

test('fallback operation reservation is created before execution and duplicates cannot reserve', async () => {
  const { dbRepository } = await import('../../src/server/db/repository.ts');
  const operation = {
    paymentId: 'tenant-test-payment-a',
    operationType: 'CAPTURE',
    idempotencyKey: 'tenant-test-capture-reservation',
    executedBy: 'MERCHANT_POLICY',
  };
  assert.deepEqual(await dbRepository.reserveOperation(operation), { reserved: true, status: 'PROCESSING' });
  assert.deepEqual(await dbRepository.reserveOperation(operation), { reserved: false, status: 'PROCESSING' });
  await dbRepository.recordOperation({ ...operation, status: 'RECONCILIATION_REQUIRED' });
  assert.deepEqual(await dbRepository.reserveOperation(operation), { reserved: false, status: 'RECONCILIATION_REQUIRED' });
});
