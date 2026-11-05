import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server.js';

process.env.SESSION_SECRET = 'test-only-session-secret-at-least-32-bytes';
process.env.INTERNAL_WORKER_SECRET = 'test-only-worker-secret-at-least-32-bytes';

test('Session tokens reject tampering, expiry and unknown roles', async () => {
  const { createSignedToken, verifySignedToken } = await import('../../src/server/auth/session.ts');
  const payload = { userId: 'user-a', email: 'merchant@example.test', name: 'Merchant', role: 'ADMIN', merchantId: 'merchant-a' };
  const token = createSignedToken(payload, 60);
  assert.equal(verifySignedToken(token)?.merchantId, 'merchant-a');
  assert.equal(verifySignedToken(`${token}x`), null);
  assert.equal(verifySignedToken(createSignedToken(payload, -1)), null);

  const unknownRoleToken = createSignedToken({ ...payload, role: 'SUPERUSER' });
  assert.equal(verifySignedToken(unknownRoleToken), null);
});

test('Password hashes use scrypt and reject incorrect passwords', async () => {
  const { hashPassword, verifyPassword } = await import('../../src/server/auth/password.ts');
  const encoded = await hashPassword('a unique test password 2026');
  assert.match(encoded, /^scrypt\$/);
  assert.equal(await verifyPassword('a unique test password 2026', encoded), true);
  assert.equal(await verifyPassword('incorrect password', encoded), false);
  assert.equal(await verifyPassword('incorrect password', 'legacy-bcrypt-hash'), false);
});

test('Worker endpoint authorization requires a separate bearer secret', async () => {
  const { workerAuthorized } = await import('../../src/server/auth/session.ts');
  const valid = new NextRequest('http://localhost/api/worker/tick', {
    headers: { authorization: `Bearer ${process.env.INTERNAL_WORKER_SECRET}` },
  });
  const missing = new NextRequest('http://localhost/api/worker/tick');
  assert.equal(workerAuthorized(valid), true);
  assert.equal(workerAuthorized(missing), false);
});

test('Cookie mutations require a same-origin Origin header', async () => {
  const { hasSameOrigin } = await import('../../src/server/auth/session.ts');
  const same = new NextRequest('http://localhost/api/payments/x/void', { headers: { origin: 'http://localhost' } });
  const cross = new NextRequest('http://localhost/api/payments/x/void', { headers: { origin: 'https://attacker.example' } });
  assert.equal(hasSameOrigin(same), true);
  assert.equal(hasSameOrigin(cross), false);
});
