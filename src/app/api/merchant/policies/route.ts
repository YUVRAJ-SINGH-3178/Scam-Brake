import { NextRequest, NextResponse } from 'next/server';
import { getMerchantSession, hasMerchantPermission } from '@/server/auth/session';

export async function GET(req: NextRequest) {
  const session = await getMerchantSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ error: 'Tenant-scoped policy storage is not available in this release.' }, { status: 501 });
}

export async function PUT(request: NextRequest) {
  const session = await getMerchantSession(request);
  if (!session || !hasMerchantPermission(session, ['OWNER', 'ADMIN'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({ error: 'Tenant-scoped policy persistence is not available in this release.' }, { status: 501 });
}

