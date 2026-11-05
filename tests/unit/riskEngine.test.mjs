import assert from 'node:assert/strict';
import test from 'node:test';

// Import Risk Engine logic directly
test('Risk Intelligence Engine — Low Risk Clean Baseline', async () => {
  const { RiskIntelligenceEngine } = await import('../../src/server/risk/engine.ts');

  const result = await RiskIntelligenceEngine.evaluate({
    amount: 85.0,
    productName: 'Ergonomic Mechanical Keyboard',
    productCategory: 'Computer Accessories',
    telemetry: {
      remoteDesktopDetected: false,
      activePhoneCall: false,
      cartItemIsGiftCard: false,
    },
  });

  assert.equal(result.riskLevel, 'LOW');
  assert.ok(result.riskScore < 25, `Expected score < 25, got ${result.riskScore}`);
  assert.equal(result.policyOutcome, 'NORMAL_PROCESSING');
  assert.equal(result.recommendedAction, 'allow');
  assert.equal(result.needsTrustedContact, false);
});

test('Risk Intelligence Engine — High Value Gift Card Trigger', async () => {
  const { RiskIntelligenceEngine } = await import('../../src/server/risk/engine.ts');

  const result = await RiskIntelligenceEngine.evaluate({
    amount: 2000.0,
    productName: 'Apple Store Digital Gift Card ($500 x 4)',
    productCategory: 'Digital Gift Cards',
    telemetry: {
      cartItemIsGiftCard: true,
      remoteDesktopDetected: false,
      activePhoneCall: true,
    },
  });

  assert.ok(result.riskScore >= 60, `Expected score >= 60, got ${result.riskScore}`);
  assert.ok(result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL');
  assert.equal(result.policyOutcome, 'RECOMMEND_CANCELLATION');
  assert.equal(result.needsTrustedContact, true);
  assert.ok(result.signals.length >= 2, 'Expected multiple signals');
  assert.ok(result.signals.some((s) => s.category === 'UNUSUAL_GIFT_CARD'));
});

test('Risk Intelligence Engine — Remote Desktop Active Coercion Vector', async () => {
  const { RiskIntelligenceEngine } = await import('../../src/server/risk/engine.ts');

  const result = await RiskIntelligenceEngine.evaluate({
    amount: 1500.0,
    productName: 'Google Play Gift Card',
    productCategory: 'Digital Prepaid Cards',
    telemetry: {
      cartItemIsGiftCard: true,
      remoteDesktopDetected: true,
      reportedSecrecyDemand: true,
    },
  });

  assert.ok(result.riskScore >= 80, `Expected score >= 80, got ${result.riskScore}`);
  assert.equal(result.riskLevel, 'CRITICAL');
  assert.ok(result.signals.some((s) => s.category === 'REMOTE_ACCESS_ACTIVE'));
  assert.ok(result.signals.some((s) => s.category === 'SECRECY_COERCION'));
  assert.equal(result.recommendedAction, 'recommend_void');
});

