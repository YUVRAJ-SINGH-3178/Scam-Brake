import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'scambrake_session_secret_default_development_key_32bytes!';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'RISK_ANALYST' | 'OPERATOR' | 'VIEWER';
  merchantId: string;
  createdAt: number;
  expiresAt: number;
}

export interface CustomerSession {
  sessionId: string;
  paymentReference?: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Creates a signed HMAC session token
 */
export function createSignedToken(payload: Record<string, unknown>, expiresInHours = 24): string {
  const data = {
    ...payload,
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };
  const json = JSON.stringify(data);
  const b64Payload = Buffer.from(json).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(b64Payload)
    .digest('base64url');
  return `${b64Payload}.${signature}`;
}

/**
 * Verifies a signed HMAC session token
 */
export function verifySignedToken<T = any>(token: string): T | null {
  if (!token || !token.includes('.')) return null;
  const [b64Payload, signature] = token.split('.');
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(b64Payload)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const json = Buffer.from(b64Payload, 'base64url').toString('utf8');
    const data = JSON.parse(json);
    if (data.exp && Date.now() > data.exp) {
      return null; // Expired
    }
    return data as T;
  } catch {
    return null;
  }
}

/**
 * Default merchant demo session for development and preview
 */
export const DEFAULT_DEMO_MERCHANT_SESSION: AuthSession = {
  userId: 'usr_sarah_chen',
  email: 'analyst@scambrake.internal',
  name: 'Sarah Chen (Lead Risk Analyst)',
  role: 'RISK_ANALYST',
  merchantId: 'merch_apex_9812',
  createdAt: Date.now(),
  expiresAt: Date.now() + 86400000,
};

// In-memory sliding window rate limiter
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, maxRequests = 100, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

