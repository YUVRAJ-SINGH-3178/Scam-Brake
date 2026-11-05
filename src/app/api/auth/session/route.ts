import { NextResponse } from 'next/server';
import { DEFAULT_DEMO_MERCHANT_SESSION } from '@/server/auth/session';

export async function GET() {
  return NextResponse.json({
    authenticated: true,
    user: DEFAULT_DEMO_MERCHANT_SESSION,
  });
}

