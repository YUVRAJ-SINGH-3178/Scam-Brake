import { NextRequest, NextResponse } from 'next/server';
import { hasSameOrigin, merchantSessionCookie, revokeMerchantSession } from '@/server/auth/session';

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const revoked = await revokeMerchantSession(request);
  const response = NextResponse.json(
    { authenticated: false, sessionRevoked: revoked },
    { status: revoked ? 200 : 503 },
  );
  response.cookies.set(merchantSessionCookie.name, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
