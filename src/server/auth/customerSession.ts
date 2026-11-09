import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../db/client.ts';

export const CUSTOMER_SESSION_COOKIE = 'scambrake_customer_session';
export const CUSTOMER_SESSION_TTL_MS = 30 * 60 * 1000;

export function createCustomerSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashCustomerSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function findActiveCustomerSession(token: string) {
  return prisma.customerSession.findFirst({
    where: {
      sessionTokenHash: hashCustomerSessionToken(token),
      expiresAt: { gt: new Date() },
    },
    include: { customer: true, checkoutSessions: true },
  });
}
