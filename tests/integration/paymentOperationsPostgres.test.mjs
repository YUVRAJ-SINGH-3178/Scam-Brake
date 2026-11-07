import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
process.env.PAYMENT_MODE = 'demo';

test('PostgreSQL-backed capture and void persist operation status and payment state', { skip: !hasDatabaseUrl }, async () => {
  const [{ prisma, checkDatabaseConnection }, { PaymentStateMachine }, { dbRepository }] = await Promise.all([
    import('../../src/server/db/client.ts'),
    import('../../src/server/payments/stateMachine.ts'),
    import('../../src/server/db/repository.ts'),
  ]);

  assert.equal(await checkDatabaseConnection(), true, 'DATABASE_URL must point to a reachable PostgreSQL test database');

  const suffix = randomUUID();
  const merchant = await prisma.merchant.create({
    data: {
      name: `Payment operation integration ${suffix}`,
      slug: `payment-operation-${suffix}`,
      category: 'Integration test',
      apiKey: `test-${suffix}`,
      webhookSecret: `test-${suffix}`,
    },
  });

  const createAuthorizedPayment = (action) => prisma.payment.create({
    data: {
      paymentReference: `integration-${action}-${suffix}`,
      merchantId: merchant.id,
      amount: '42.50',
      currency: 'USD',
      productName: `Integration ${action}`,
      productCategory: 'Test',
      state: 'AUTHORIZED',
      authorizationStatus: 'HOLD_ACTIVE',
      interventionStatus: 'NOT_REQUIRED',
      riskScore: 5,
      riskLevel: 'LOW',
      authorizedAt: new Date(),
      holdExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      paymentAuthorization: {
        create: {
          paypalAuthorizationId: `test-auth-${action}-${suffix}`,
          status: 'CREATED',
          amount: '42.50',
          currency: 'USD',
        },
      },
    },
  });

  try {
    const capture = await createAuthorizedPayment('capture');
    await prisma.payment.update({ where: { id: capture.id }, data: { interventionStatus: 'VERIFIED_SAFE' } });
    await prisma.interventionSession.create({
      data: {
        paymentId: capture.id,
        status: 'RESOLVED_CAPTURE',
        customerDecision: 'PROCEED_PAYMENT',
        completedAt: new Date(),
      },
    });
    const captureKey = `integration-capture-${suffix}`;
    const captured = await PaymentStateMachine.executeCapture({
      paymentId: capture.id,
      actor: 'MERCHANT_POLICY',
      idempotencyKey: captureKey,
    });
    assert.equal(captured.authorizationStatus, 'CAPTURED');
    const captureRow = await prisma.payment.findUniqueOrThrow({ where: { id: capture.id }, include: { paymentCapture: true, paymentAuthorization: true } });
    assert.equal(captureRow.authorizationStatus, 'CAPTURED');
    assert.equal(captureRow.paymentAuthorization.status, 'CAPTURED');
    assert.match(captureRow.paymentCapture.paypalCaptureId, /^9P/);
    assert.equal((await prisma.paymentOperation.findUniqueOrThrow({ where: { idempotencyKey: captureKey } })).status, 'SUCCEEDED');

    const voidPayment = await createAuthorizedPayment('void');
    await prisma.interventionSession.create({
      data: {
        paymentId: voidPayment.id,
        status: 'AWAITING_CUSTOMER',
        scamHypothesis: 'Integration test conversation',
        messages: { create: { sender: 'SYSTEM', content: 'Test session started.' } },
      },
    });
    await dbRepository.addInterventionMessage(voidPayment.id, { sender: 'CUSTOMER', content: 'This is a persisted integration-test answer.' });
    const storedIntervention = await dbRepository.getInterventionByPaymentId(voidPayment.id);
    assert.ok(storedIntervention?.messages.some((message) => message.content === 'This is a persisted integration-test answer.'));

    const voidKey = `integration-void-${suffix}`;
    const voided = await PaymentStateMachine.executeVoid({
      paymentId: voidPayment.id,
      actor: 'MERCHANT_POLICY',
      reason: 'PostgreSQL integration test',
      idempotencyKey: voidKey,
    });
    assert.equal(voided.authorizationStatus, 'VOIDED');
    const voidRow = await prisma.payment.findUniqueOrThrow({ where: { id: voidPayment.id }, include: { paymentAuthorization: true } });
    assert.equal(voidRow.authorizationStatus, 'VOIDED');
    assert.equal(voidRow.paymentAuthorization.status, 'VOIDED');
    assert.equal((await prisma.paymentOperation.findUniqueOrThrow({ where: { idempotencyKey: voidKey } })).status, 'SUCCEEDED');

    const webhookId = `integration-webhook-${suffix}`;
    const claims = await Promise.all([
      dbRepository.claimWebhookEvent(webhookId, 'TEST.EVENT', 'test-resource', { id: webhookId }),
      dbRepository.claimWebhookEvent(webhookId, 'TEST.EVENT', 'test-resource', { id: webhookId }),
    ]);
    assert.equal(claims.filter((claim) => claim === 'CLAIMED').length, 1);
    assert.equal(claims.filter((claim) => claim === 'IN_PROGRESS').length, 1);
    await dbRepository.completeWebhookEvent(webhookId);
    assert.equal(await dbRepository.claimWebhookEvent(webhookId, 'TEST.EVENT', 'test-resource', { id: webhookId }), 'PROCESSED');
  } finally {
    await prisma.merchant.delete({ where: { id: merchant.id } });
    await prisma.$disconnect();
  }
});
