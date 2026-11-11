import { register } from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server.js';

register(`data:text/javascript,
import fs from "node:fs";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") {
    return nextResolve("next/server.js", context);
  }
  if (specifier.startsWith("@/")) {
    const rel = specifier.slice(2);
    const basePath = "/home/lav/Documents/paypal/Scam-Brake/src/" + rel;
    let finalPath = basePath;
    if (fs.existsSync(basePath + ".ts")) finalPath = basePath + ".ts";
    else if (fs.existsSync(basePath + "/index.ts")) finalPath = basePath + "/index.ts";
    return nextResolve("file://" + finalPath, context);
  }
  return nextResolve(specifier, context);
}
`);

process.env.SESSION_SECRET = 'test-only-session-secret-at-least-32-bytes';
process.env.INTERNAL_WORKER_SECRET = 'test-only-worker-secret-at-least-32-bytes';
process.env.APP_BASE_URL = 'http://localhost';

test('API Route: GET /api/health returns healthy service status', async () => {
  const { GET } = await import('../../src/app/api/health/route.ts');
  const response = await GET();
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.status, 'HEALTHY');
  assert.equal(data.service, 'SCAM_BRAKE_PAYMENT_PROTECTION');
});

test('API Route: GET /api/checkout/config returns sandbox configuration', async () => {
  const { GET } = await import('../../src/app/api/checkout/config/route.ts');
  const response = await GET(new NextRequest('http://localhost/api/checkout/config'));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(typeof data.available, 'boolean');
  assert.equal(data.environment, 'sandbox');
});

test('API Route: POST /api/payments/[id]/capture enforces CSRF same-origin check', async () => {
  const { POST } = await import('../../src/app/api/payments/[id]/capture/route.ts');
  const crossOriginReq = new NextRequest('http://localhost/api/payments/pay_test/capture', {
    method: 'POST',
    headers: { origin: 'https://attacker-site.example' },
  });
  const res = await POST(crossOriginReq, { params: Promise.resolve({ id: 'pay_test' }) });
  assert.equal(res.status, 403);
  const data = await res.json();
  assert.equal(data.error, 'Invalid request origin');
});

test('API Route: POST /api/payments/[id]/capture enforces merchant authentication', async () => {
  const { POST } = await import('../../src/app/api/payments/[id]/capture/route.ts');
  const unauthReq = new NextRequest('http://localhost/api/payments/pay_test/capture', {
    method: 'POST',
    headers: { origin: 'http://localhost' },
  });
  const res = await POST(unauthReq, { params: Promise.resolve({ id: 'pay_test' }) });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.error, 'Unauthorized');
});

test('API Route: POST /api/payments/[id]/void enforces merchant authentication', async () => {
  const { POST } = await import('../../src/app/api/payments/[id]/void/route.ts');
  const unauthReq = new NextRequest('http://localhost/api/payments/pay_test/void', {
    method: 'POST',
    headers: { origin: 'http://localhost' },
  });
  const res = await POST(unauthReq, { params: Promise.resolve({ id: 'pay_test' }) });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.error, 'Unauthorized');
});

test('API Route: POST /api/webhooks/paypal rejects invalid JSON with 400', async () => {
  const { POST } = await import('../../src/app/api/webhooks/paypal/route.ts');
  const invalidJsonReq = new NextRequest('http://localhost/api/webhooks/paypal', {
    method: 'POST',
    body: 'this is not json {',
  });
  const res = await POST(invalidJsonReq);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Invalid webhook JSON');
});

test('API Route: POST /api/webhooks/paypal fails closed on missing headers or invalid payload', async () => {
  const { POST } = await import('../../src/app/api/webhooks/paypal/route.ts');
  const invalidPayloadReq = new NextRequest('http://localhost/api/webhooks/paypal', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ unexpected: 'shape' }),
  });
  const res = await POST(invalidPayloadReq);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Malformed webhook event');
});

test('API Route: POST /api/intervention/[paymentId]/decision enforces CSRF origin validation', async () => {
  const { POST } = await import('../../src/app/api/intervention/[paymentId]/decision/route.ts');
  const req = new NextRequest('http://localhost/api/intervention/pay_invalid/decision', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://attacker.example' },
    body: JSON.stringify({ decision: 'CANCEL_PAYMENT' }),
  });
  const res = await POST(req, { params: Promise.resolve({ paymentId: 'pay_invalid' }) });
  assert.equal(res.status, 403);
  const data = await res.json();
  assert.equal(data.error, 'Invalid request origin.');
});

test('API Route: POST /api/auth/login rejects wrong credentials', async () => {
  const { POST } = await import('../../src/app/api/auth/login/route.ts');
  const req = new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost' },
    body: JSON.stringify({ email: 'unknown@example.com', password: 'wrongpassword123' }),
  });
  const res = await POST(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.error, 'Invalid email or password');
});

test('API Route: POST /api/auth/login accepts demo admin credentials and mints session', async () => {
  process.env.DEMO_AUTH_ENABLED = 'true';
  process.env.DEMO_ADMIN_EMAIL = 'admin@scambrake.local';
  process.env.DEMO_ADMIN_PASSWORD = 'DemoAdminPass2026!';
  const { POST } = await import('../../src/app/api/auth/login/route.ts');
  const { getActiveMerchantSession } = await import('../../src/server/auth/session.ts');

  const req = new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost' },
    body: JSON.stringify({ email: 'admin@scambrake.local', password: 'DemoAdminPass2026!' }),
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.authenticated, true);
  assert.equal(data.user.email, 'admin@scambrake.local');
  assert.equal(data.user.role, 'ADMIN');

  // Verify cookie was set
  const cookieHeader = res.headers.get('set-cookie');
  assert.ok(cookieHeader, 'Expected set-cookie header');
  assert.ok(cookieHeader.includes('sb_merchant_session='), 'Expected sb_merchant_session cookie');

  // Verify token works with getActiveMerchantSession
  const tokenMatch = cookieHeader.match(/sb_merchant_session=([^;]+)/);
  assert.ok(tokenMatch, 'Expected token extraction');
  const session = await getActiveMerchantSession(tokenMatch[1]);
  assert.ok(session, 'Expected active merchant session');
  assert.equal(session.email, 'admin@scambrake.local');
  assert.equal(session.role, 'ADMIN');
});

