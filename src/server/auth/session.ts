import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { prisma } from '../db/client.ts';

const SESSION_COOKIE = 'sb_merchant_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

export type MerchantRole = 'OWNER' | 'ADMIN' | 'RISK_ANALYST' | 'OPERATOR' | 'VIEWER';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: MerchantRole;
  merchantId: string;
  iat: number;
  exp: number;
  jti: string;
}

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  return secret && Buffer.byteLength(secret, 'utf8') >= 32 ? secret : null;
}

export function createSignedSession(payload: Omit<AuthSession, 'iat' | 'exp' | 'jti'>, ttlSeconds = SESSION_TTL_SECONDS): { token: string; session: AuthSession } {
  const secret = getSessionSecret();
  if (!secret) throw new Error('SESSION_SECRET must contain at least 32 bytes.');
  const now = Math.floor(Date.now() / 1000);
  const data: AuthSession = { ...payload, iat: now, exp: now + ttlSeconds, jti: crypto.randomUUID() };
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return { token: `${encoded}.${signature}`, session: data };
}

export function createSignedToken(payload: Omit<AuthSession, 'iat' | 'exp' | 'jti'>, ttlSeconds = SESSION_TTL_SECONDS): string {
  return createSignedSession(payload, ttlSeconds).token;
}

export function verifySignedToken(token: string): AuthSession | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  const [encoded, signature, extra] = token.split('.');
  if (!encoded || !signature || extra) return null;
  const expected = crypto.createHmac('sha256', secret).update(encoded).digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

  try {
    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<AuthSession>;
    const roles: MerchantRole[] = ['OWNER', 'ADMIN', 'RISK_ANALYST', 'OPERATOR', 'VIEWER'];
    const now = Math.floor(Date.now() / 1000);
    if (typeof data.userId !== 'string' || typeof data.merchantId !== 'string' ||
      typeof data.email !== 'string' || typeof data.name !== 'string' ||
      typeof data.exp !== 'number' || typeof data.iat !== 'number' || typeof data.jti !== 'string' ||
      !roles.includes(data.role as MerchantRole) || data.exp <= now || data.iat > now + 60) return null;
    return data as AuthSession;
  } catch {
    return null;
  }
}

// In-memory fallback session tracking for local development & disconnected environments
const fallbackSessions = new Map<
  string,
  {
    userId: string;
    merchantId: string;
    role: MerchantRole;
    expiresAt: number;
    revokedAt: number | null;
  }
>();

export function recordFallbackSession(session: AuthSession): void {
  fallbackSessions.set(session.jti, {
    userId: session.userId,
    merchantId: session.merchantId,
    role: session.role,
    expiresAt: session.exp * 1000,
    revokedAt: null,
  });
}

export function isFallbackSessionActive(jti: string): boolean {
  const stored = fallbackSessions.get(jti);
  if (!stored) return false;
  if (stored.revokedAt || stored.expiresAt <= Date.now()) return false;
  return true;
}

export function revokeFallbackSession(jti: string): boolean {
  const stored = fallbackSessions.get(jti);
  if (stored) {
    stored.revokedAt = Date.now();
    return true;
  }
  return false;
}

export async function getActiveMerchantSession(token: string): Promise<AuthSession | null> {
  const session = verifySignedToken(token);
  if (!session) return null;

  if (isFallbackSessionActive(session.jti)) {
    return session;
  }

  try {
    const stored = await prisma.merchantSession.findUnique({
      where: { id: session.jti },
      include: { user: { include: { merchantUsers: { where: { merchantId: session.merchantId } } } } },
    });
    const membership = stored?.user.merchantUsers[0];
    if (!stored || stored.revokedAt || stored.expiresAt.getTime() <= Date.now() ||
      stored.userId !== session.userId || stored.merchantId !== session.merchantId ||
      !membership || membership.role !== session.role) return null;
    return session;
  } catch {
    // If Prisma is unavailable but session signature is valid and demo auth is active:
    if (process.env.NODE_ENV !== 'production' && process.env.DEMO_AUTH_ENABLED === 'true') {
      const demoEmail = (process.env.DEMO_ADMIN_EMAIL || 'admin@scambrake.local').toLowerCase();
      if (session.email.toLowerCase() === demoEmail) {
        return session;
      }
    }
    return null;
  }
}

export async function getMerchantSession(request: NextRequest): Promise<AuthSession | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return token ? getActiveMerchantSession(token) : null;
}

export async function revokeMerchantSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySignedToken(token) : null;
  if (!session) return true;
  revokeFallbackSession(session.jti);
  try {
    await prisma.merchantSession.updateMany({
      where: { id: session.jti, userId: session.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return true;
  } catch {
    return true;
  }
}

export function hasMerchantPermission(session: AuthSession, allowed: MerchantRole[]): boolean {
  return allowed.includes(session.role);
}

export function workerAuthorized(request: NextRequest): boolean {
  const expected = process.env.INTERNAL_WORKER_SECRET;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!expected) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length < 32 || suppliedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function allowLoginAttempt(ip: string): boolean {
  const now = Date.now();
  const current = loginAttempts.get(ip);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  current.count += 1;
  return current.count <= 8;
}

export function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export const merchantSessionCookie = {
  name: SESSION_COOKIE,
  maxAge: SESSION_TTL_SECONDS,
};
