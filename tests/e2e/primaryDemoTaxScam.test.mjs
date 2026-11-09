import assert from 'node:assert/strict';
import test from 'node:test';

test('Local mock scenario: tax impersonation risk signals and simulated void transition', async () => {
  const { paypalClient } = await import('../../src/server/paypal/client.ts');
  const { RiskIntelligenceEngine } = await import('../../src/server/risk/engine.ts');
  const { PaymentStateMachine } = await import('../../src/server/payments/stateMachine.ts');
  const { ScamBrakeInterventionAgent } = await import('../../src/server/ai/agent.ts');
  const { kernelVerificationClient } = await import('../../src/server/kernel/client.ts');
  const { dbRepository } = await import('../../src/server/db/repository.ts');
  const { zapierAutomationRelay } = await import('../../src/server/zapier/relay.ts');

  console.log('\n--- LOCAL MOCK SCENARIO: TAX IMPERSONATION ---');

  // Step 1: Customer visits checkout with $2,000 in gift cards while on phone with fake officer
  const cart = {
    amount: 2000.0,
    currency: 'USD',
    productName: 'Apple Store Digital Gift Card ($500 x 4)',
    productCategory: 'Digital Gift Cards',
    telemetry: {
      remoteDesktopDetected: false,
      activePhoneCall: true,
      cartItemIsGiftCard: true,
    },
  };

  // Step 2: Risk Engine evaluates preliminary signals
  const initialRisk = await RiskIntelligenceEngine.evaluate({
    amount: cart.amount,
    productName: cart.productName,
    productCategory: cart.productCategory,
    telemetry: cart.telemetry,
  });

  assert.ok(initialRisk.riskScore >= 60, `Risk score must be high, got ${initialRisk.riskScore}`);
  assert.equal(initialRisk.policyOutcome, 'RECOMMEND_CANCELLATION');
  console.log(`✓ Step 2: Telemetry analyzed. Risk Score: ${initialRisk.riskScore}/100 (${initialRisk.riskLevel}).`);

  // Step 3: PayPal Order created with intent = AUTHORIZE (NOT CAPTURE)
  const orderRef = `DEMO-IRS-${Date.now()}`;
  const ppOrder = await paypalClient.createOrder({
    referenceId: orderRef,
    amount: cart.amount,
    currency: cart.currency,
    description: cart.productName,
  });

  assert.equal(ppOrder.intent, 'AUTHORIZE');
  console.log(`✓ Step 3: Mock adapter returned an order-shaped result (${ppOrder.id}); no PayPal request was made.`);

  // Step 4: Customer approves in PayPal wallet -> Server authorizes hold
  const ppAuth = await paypalClient.authorizeOrder(ppOrder.id);
  const authResource = ppAuth.purchase_units[0]?.payments?.authorizations?.[0];
  const authId = authResource.id;

  assert.ok(authId.startsWith('2C'), 'Valid authorization ID');
  console.log(`✓ Step 4: Mock adapter returned authorization-shaped data (${authId}); no funds were held.`);

  // Step 5: Scam Brake initiates safety intervention and pauses capture
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
    riskScore: initialRisk.riskScore,
    riskLevel: initialRisk.riskLevel,
    authorizationStatus: 'HOLD_ACTIVE',
    interventionStatus: 'ACTIVE_INTERVENTION',
    customer: {
      id: 'cust_eleanor_vance',
      name: 'Eleanor Vance',
      maskedEmail: 'e***@gmail.com',
      maskedPhone: '+1 (555) ***-4891',
      accountAgeMonths: 36,
      hasTrustedContact: true,
      trustedContactName: 'David Vance (Son)',
      trustedContactPhone: '+1 (555) ***-9921',
    },
    createdAt: new Date().toISOString(),
    authorizedAt: new Date().toISOString(),
    holdExpiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    riskSignals: initialRisk.signals,
    authorizationHoldSecondsRemaining: 72 * 3600,
  };

  await dbRepository.savePayment(paymentRecord);
  await dbRepository.recordAuditLog({
    paymentId: orderRef,
    eventType: 'AUTH_HOLD_INITIATED',
    actor: 'PAYPAL_SYSTEM',
    summary: `PayPal authorization hold created for ${orderRef} ($2,000.00 USD).`,
  });

  // Step 6: Customer voluntarily shares context in the calm intervention check-in
  await dbRepository.saveIntervention({
    id: `int_${orderRef}`,
    paymentId: orderRef,
    status: 'AWAITING_CUSTOMER',
    scamHypothesis: 'Potential impersonation scam',
    coercionIndicators: [],
    confidenceScore: 0,
    messages: [],
    independentVerification: { enabled: false, provider: 'KERNEL_VERIFY', targetOrganization: '', officialPhone: '', status: 'PENDING', notes: '' },
    trustedContact: { registered: false, name: '', relationship: '', maskedPhone: '', consentGranted: false, notificationSent: false },
    startedAt: new Date().toISOString(),
  });
  const customerReply = 'An officer from the IRS named Agent Miller told me I have an active arrest warrant and must pay $2,000 in Apple cards immediately.';
  const aiAnalysis = await ScamBrakeInterventionAgent.processCustomerMessage({
    paymentId: orderRef,
    customerMessage: customerReply,
  });

  assert.ok(aiAnalysis.coercionIndicatorsDetected.includes('AUTHORITY_IMPERSONATION'));
  assert.ok(aiAnalysis.message.includes('IRS'));
  console.log(`✓ Step 6: AI Agent analyzed voluntary response. Impersonation indicators confirmed.`);

  // Step 7: Independent Out-of-Band Verification via Kernel
  const officialIrs = await kernelVerificationClient.lookupOfficialDirectory('IRS');
  assert.equal(officialIrs.officialPhone, '1-800-829-1040');
  console.log(`✓ Step 7: Local fixture returned a directory value (${officialIrs.officialPhone}); no live verification was performed.`);

  // Step 8: Customer decides to cancel payment
  console.log('✓ Step 8: Test invokes the local simulated state transition; no PayPal request is made.');

  const voidResult = await PaymentStateMachine.executeVoid({
    paymentId: orderRef,
    actor: 'CUSTOMER',
    reason: 'Customer identified IRS impersonation coercion during intervention and chose to cancel.',
    idempotencyKey: `idem_void_demo_${orderRef}`,
    interventionOutcome: 'SCAM_CONFIRMED',
  });

  assert.equal(voidResult.authorizationStatus, 'VOIDED');
  assert.equal(voidResult.interventionStatus, 'SCAM_CONFIRMED');
  console.log('✓ Step 9: Local state changed to VOIDED; there was no provider authorization or held balance.');

  // Verify Audit Log was sealed with SHA-256
  const logs = await dbRepository.getAuditLogs(orderRef);
  assert.ok(logs.length >= 2);
  assert.ok(logs[0].immutableHash.length === 64, 'Valid SHA-256 Merkle seal present');
  console.log(`✓ Step 10: Local audit entry contains a SHA-256 value: ${logs[0].immutableHash.substring(0, 16)}...`);
  console.log('--- LOCAL MOCK SCENARIO COMPLETED ---\n');
});
