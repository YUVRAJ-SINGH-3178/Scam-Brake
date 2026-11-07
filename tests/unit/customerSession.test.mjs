import assert from 'node:assert/strict';
import test from 'node:test';

test('customer session cookie is opaque and only a SHA-256 hash is stored', async () => {
  const { createCustomerSessionToken, hashCustomerSessionToken } = await import('../../src/server/auth/customerSession.ts');
  const token = createCustomerSessionToken();
  const hash = hashCustomerSessionToken(token);
  assert.equal(typeof token, 'string');
  assert.ok(token.length >= 40);
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.notEqual(hash, token);
  assert.equal(hashCustomerSessionToken(token), hash);
});
