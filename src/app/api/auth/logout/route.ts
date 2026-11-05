import { NextRequest, NextResponse } from 'next/server';
import { hasSameOrigin, merchantSessionCookie } from '@/server/auth/session';

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(merchantSessionCookie.name, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
