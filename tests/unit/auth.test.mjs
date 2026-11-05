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

test('Merchant sessions are accepted only while the persisted session and membership are active', async () => {
  const { createSignedSession, getActiveMerchantSession } = await import('../../src/server/auth/session.ts');
  const { prisma } = await import('../../src/server/db/client.ts');
  const originalFindUnique = prisma.merchantSession.findUnique;
  const { token, session } = createSignedSession({ userId: 'session-user', email: 'merchant@example.test', name: 'Merchant', role: 'ADMIN', merchantId: 'merchant-a' }, 300);
  let storedSession = {
    id: session.jti,
    userId: session.userId,
    merchantId: session.merchantId,
    expiresAt: new Date(session.exp * 1000),
    revokedAt: null,
    user: { merchantUsers: [{ role: 'ADMIN' }] },
  };
  prisma.merchantSession.findUnique = async () => storedSession;
  try {
    assert.equal((await getActiveMerchantSession(token))?.merchantId, 'merchant-a');
    storedSession = { ...storedSession, revokedAt: new Date() };
    assert.equal(await getActiveMerchantSession(token), null);
    storedSession = { ...storedSession, revokedAt: null, user: { merchantUsers: [{ role: 'VIEWER' }] } };
    assert.equal(await getActiveMerchantSession(token), null);
  } finally {
    prisma.merchantSession.findUnique = originalFindUnique;
  }
});

test('Logout revokes the persisted session ID and does not store the raw cookie token', async () => {
  const { createSignedSession, revokeMerchantSession } = await import('../../src/server/auth/session.ts');
  const { prisma } = await import('../../src/server/db/client.ts');
  const originalUpdateMany = prisma.merchantSession.updateMany;
  const { token, session } = createSignedSession({ userId: 'logout-user', email: 'merchant@example.test', name: 'Merchant', role: 'ADMIN', merchantId: 'merchant-a' });
  let where;
  prisma.merchantSession.updateMany = async (query) => { where = query.where; return { count: 1 }; };
  try {
    const request = new NextRequest('http://localhost/api/auth/logout', { headers: { cookie: `sb_merchant_session=${token}` } });
    assert.equal(await revokeMerchantSession(request), true);
    assert.deepEqual(where, { id: session.jti, userId: session.userId, revokedAt: null });
    assert.equal(where.id.includes(token), false);
  } finally {
    prisma.merchantSession.updateMany = originalUpdateMany;
  }
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
