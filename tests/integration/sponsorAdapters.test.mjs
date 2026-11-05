import assert from 'node:assert/strict';
import test from 'node:test';

test('PayPal Adapter — Orders v2 intent=AUTHORIZE & Lifecycle', async () => {
  const { paypalClient } = await import('../../src/server/paypal/client.ts');

  // 1. Create Order
  const order = await paypalClient.createOrder({
    referenceId: 'TEST-REF-9901',
    amount: 1500.0,
    currency: 'USD',
    description: 'Apple Store Digital Gift Cards',
  });
  assert.ok(order.id, 'PayPal Order ID generated');
  assert.equal(order.intent, 'AUTHORIZE');

  // 2. Authorize Order (Creates pre-capture hold)
  const auth = await paypalClient.authorizeOrder(order.id);
  const authResource = auth.purchase_units[0]?.payments?.authorizations?.[0];
  assert.ok(authResource?.id, 'Authorization ID generated (2C...)');
  assert.equal(authResource?.status, 'CREATED');

  // 3. Void Authorization (Releases hold)
  const voidRes = await paypalClient.voidAuthorization(authResource.id);
  assert.equal(voidRes.status, 'VOIDED');
});

test('PayPal webhook verification fails closed without a configured webhook ID', async () => {
  const { paypalClient } = await import('../../src/server/paypal/client.ts');
  const verified = await paypalClient.verifyWebhookSignature({
    transmissionId: 'untrusted',
    transmissionTime: new Date().toISOString(),
    certUrl: 'https://example.test/cert',
    authAlgo: 'SHA256withRSA',
    transmissionSig: 'present-but-unverified',
    webhookEvent: { id: 'untrusted-event' },
  });
  assert.equal(verified, false);
});

test('Elastic Knowledge Engine — Semantic & Pattern Grounding', async () => {
  const { elasticScamEngine } = await import('../../src/server/elastic/search.ts');

  const matches = await elasticScamEngine.searchPatterns(
    'The caller said they are an IRS officer and I have an arrest warrant for back taxes unless I buy Apple gift cards.'
  );

  assert.ok(matches.length > 0, 'Matches found in knowledge corpus');
  const top = matches[0];
  assert.equal(top.document.category, 'GOVERNMENT_IMPERSONATION');
  assert.equal(top.document.clusterName, 'cluster-irs-urgent-wire');
  assert.ok(top.document.officialWarningUrl.includes('irs.gov'));
  assert.ok(top.score > 0.5, `Confidence score expected > 0.5, got ${top.score}`);
});

test('Kernel Verification Client — Directory & SSRF Defense', async () => {
  const { kernelVerificationClient } = await import('../../src/server/kernel/client.ts');

  // 1. Official Directory Lookup
  const irsEntry = await kernelVerificationClient.lookupOfficialDirectory('IRS');
  assert.ok(irsEntry, 'IRS directory found');
  assert.equal(irsEntry.officialPhone, '1-800-829-1040');
  assert.equal(irsEntry.officialDomain, 'irs.gov');

  // 2. SSRF Allowlist Validation
  assert.equal(kernelVerificationClient.isUrlAllowed('https://www.irs.gov/help/telephone-assistance'), true);
  assert.equal(kernelVerificationClient.isUrlAllowed('http://127.0.0.1:8080/admin'), false);
  assert.equal(kernelVerificationClient.isUrlAllowed('http://169.254.169.254/latest/meta-data'), false);
  assert.equal(kernelVerificationClient.isUrlAllowed('http://localhost:3000'), false);
});

test('Channel3 Client — Digital Commodity Enrichment', async () => {
  const { channel3Client } = await import('../../src/server/channel3/client.ts');

  const enriched = await channel3Client.enrichProduct('Apple Gift Card $500', 'Digital Gift Cards');
  assert.equal(enriched.isPrepaidVoucher, true);
  assert.equal(enriched.liquidityTier, 'HIGH_LIQUIDITY_GIFT_CARD');
  assert.ok(enriched.resaleVelocityRiskScore > 0.8);
});

test('Zapier Relay — HMAC Signatures and Outbound Events', async () => {
  const previousSecret = process.env.ZAPIER_WEBHOOK_SECRET;
  const previousUrl = process.env.ZAPIER_WEBHOOK_URL;
  const previousFetch = globalThis.fetch;
  process.env.ZAPIER_WEBHOOK_SECRET = 'test-only-secret-with-at-least-32-bytes';
  process.env.ZAPIER_WEBHOOK_URL = 'https://hooks.example.test/scambrake';
  globalThis.fetch = async () => new Response(null, { status: 200 });
  const { ZapierAutomationRelay } = await import('../../src/server/zapier/relay.ts');

  try {
    const relay = new ZapierAutomationRelay();
    const signature = relay.generateSignature('{"test":"payload"}');
    assert.ok(signature.length === 64, 'Valid SHA-256 HMAC generated');

    const result = await relay.triggerEvent({
      eventType: 'HIGH_RISK_INTERVENTION_CREATED',
      paymentId: 'pay_test_zap_01',
      payload: { amount: 2000.0, riskScore: 94 },
    });
    assert.ok(result.deliveryId.startsWith('zap_del_'));
    assert.equal(result.eventType, 'HIGH_RISK_INTERVENTION_CREATED');
    assert.equal(result.status, 'DELIVERED');
  } finally {
    globalThis.fetch = previousFetch;
    if (previousSecret === undefined) delete process.env.ZAPIER_WEBHOOK_SECRET;
    else process.env.ZAPIER_WEBHOOK_SECRET = previousSecret;
    if (previousUrl === undefined) delete process.env.ZAPIER_WEBHOOK_URL;
    else process.env.ZAPIER_WEBHOOK_URL = previousUrl;
  }
});

test('Bryntum Scheduler Manager — Investigation Case Allocation', async () => {
  const { bryntumSchedulerManager } = await import('../../src/server/bryntum/scheduler.ts');

  const data = bryntumSchedulerManager.getSchedulerData();
  assert.ok(data.resources.length >= 2, 'Investigators configured');
  assert.ok(data.events.length >= 2, 'Cases scheduled');

  const updated = bryntumSchedulerManager.assignCase({
    eventId: data.events[0].id,
    resourceId: 'inv_marcus_vance',
  });
  assert.equal(updated.resourceId, 'inv_marcus_vance');
});

