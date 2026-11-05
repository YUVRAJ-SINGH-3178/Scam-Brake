import assert from 'node:assert/strict';
import test from 'node:test';

test('E2E Demonstration 2: Legitimate $1,299 MacBook Purchase Verified & Captured', async () => {
  const { paypalClient } = await import('../../src/server/paypal/client.ts');
  const { RiskIntelligenceEngine } = await import('../../src/server/risk/engine.ts');
  const { PaymentStateMachine } = await import('../../src/server/payments/stateMachine.ts');
  const { dbRepository } = await import('../../src/server/db/repository.ts');

  console.log('\n--- STARTING DEMO 2: LEGITIMATE $1,299 MACBOOK PURCHASE ---');

  // Step 1: Customer buys a MacBook Air for college
  const cart = {
    amount: 1299.0,
    currency: 'USD',
    productName: 'Apple MacBook Air 15" M3',
    productCategory: 'Laptops & Computers',
    telemetry: {
      remoteDesktopDetected: false,
      activePhoneCall: false,
      cartItemIsGiftCard: false,
    },
  };

  // Step 2: Risk Engine evaluation
  const risk = await RiskIntelligenceEngine.evaluate({
    amount: cart.amount,
    productName: cart.productName,
    productCategory: cart.productCategory,
    telemetry: cart.telemetry,
  });

  // Score is moderate solely due to $1,299 amount, but no scam markers
  console.log(`✓ Step 2: Risk evaluated: Score ${risk.riskScore}/100. Policy Outcome: ${risk.policyOutcome}.`);

  // Step 3: PayPal Order created with intent = AUTHORIZE
  const orderRef = `DEMO-LEGIT-${Date.now()}`;
  const ppOrder = await paypalClient.createOrder({
    referenceId: orderRef,
    amount: cart.amount,
    currency: cart.currency,
    description: cart.productName,
  });

  // Step 4: PayPal Authorizes hold
  const ppAuth = await paypalClient.authorizeOrder(ppOrder.id);
  const authId = ppAuth.purchase_units[0]?.payments?.authorizations?.[0]?.id;
  console.log(`✓ Step 4: PayPal hold created: Authorization ID ${authId}.`);

  // Step 5: Save Payment
  const paymentRecord = {
    id: orderRef,
    paymentReference: orderRef,
    paypalOrderId: ppOrder.id,
    paypalAuthorizationId: authId,
    merchantId: 'merch_apex_9812',
    merchantName: 'Apex Electronics Direct',
    merchantCategory: 'Consumer Electronics',
    productName: cart.productName,
    productCategory: cart.productCategory,
    amount: cart.amount,
    currency: 'USD',
    riskScore: risk.riskScore,
    riskLevel: risk.riskLevel,
    authorizationStatus: 'HOLD_ACTIVE',
    interventionStatus: 'NOT_REQUIRED',
    customer: {
      id: 'cust_marcus_brody',
      name: 'Marcus Brody',
      maskedEmail: 'm***@college.edu',
      maskedPhone: '+1 (555) ***-7732',
      accountAgeMonths: 48,
      hasTrustedContact: false,
    },
    createdAt: new Date().toISOString(),
    authorizedAt: new Date().toISOString(),
    holdExpiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    riskSignals: risk.signals,
    authorizationHoldSecondsRemaining: 72 * 3600,
  };

  await dbRepository.savePayment(paymentRecord);

  // Step 6: Customer confirms purchase volition
  console.log(`✓ Step 6: Customer explicitly confirms legitimate purchase. Triggering PayPal Capture API.`);

  // Step 7: Authoritative Capture
  const captureResult = await PaymentStateMachine.executeCapture({
    paymentId: orderRef,
    actor: 'CUSTOMER',
    notes: 'Customer confirmed purchase volition without caller coercion. Captured successfully.',
    idempotencyKey: `idem_cap_demo_${orderRef}`,
  });

  assert.equal(captureResult.authorizationStatus, 'CAPTURED');
  assert.equal(captureResult.interventionStatus, 'VERIFIED_SAFE');
  console.log(`✓ Step 7: PayPal Capture completed. Funds settled to merchant.`);

  // Step 8: Webhook reconciliation
  const reconciled = await PaymentStateMachine.reconcile(orderRef, 'CAPTURED', 'WH-CAPTURED-CONFIRM-99');
  assert.equal(reconciled.authorizationStatus, 'CAPTURED');
  console.log(`✓ Step 8: PayPal webhook PAYMENT.CAPTURE.COMPLETED verified and reconciled.`);
  console.log('--- DEMO 2 COMPLETED SUCCESSFULLY ---\n');
});

