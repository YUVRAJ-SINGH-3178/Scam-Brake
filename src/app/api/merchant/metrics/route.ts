import { NextResponse } from 'next/server';
import { dbRepository } from '@/server/db/repository';
import type { NextRequest } from 'next/server';
import { getMerchantSession } from '@/server/auth/session';

export async function GET(request: NextRequest) {
  const session = await getMerchantSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const metrics = await dbRepository.getMetrics(session.merchantId);
  return NextResponse.json(metrics);
}

