import crypto from 'crypto';
import type { NextRequest } from 'next/server';

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

export function createSignedToken(payload: Omit<AuthSession, 'iat' | 'exp' | 'jti'>, ttlSeconds = SESSION_TTL_SECONDS): string {
  const secret = getSessionSecret();
  if (!secret) throw new Error('SESSION_SECRET must contain at least 32 bytes.');
  const now = Math.floor(Date.now() / 1000);
  const data: AuthSession = { ...payload, iat: now, exp: now + ttlSeconds, jti: crypto.randomUUID() };
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
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

export function getMerchantSession(request: NextRequest): AuthSession | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return token ? verifySignedToken(token) : null;
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
