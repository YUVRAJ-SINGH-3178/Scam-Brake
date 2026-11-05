import { NextResponse } from 'next/server';
import { getMerchantSession } from '@/server/auth/session';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const user = await getMerchantSession(request);
  return NextResponse.json({
    authenticated: Boolean(user),
    user: user ? { userId: user.userId, email: user.email, name: user.name, role: user.role, merchantId: user.merchantId } : null,
  });
}

