import { NextRequest, NextResponse } from 'next/server';
import { getMerchantSession } from '@/server/auth/session';
import { SPONSORS } from '@/data/seedData';

export async function GET(req: NextRequest) {
  if (!getMerchantSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const statuses: Record<string, 'UNAVAILABLE' | 'CONFIGURED_NOT_DEPLOYED' | 'IMPLEMENTED_UNVERIFIED' | 'MOCK_ONLY' | 'NOT_USED'> = {
    spon_ag_grid: 'NOT_USED',
    spon_apimatic: 'NOT_USED',
    spon_astropods: 'IMPLEMENTED_UNVERIFIED',
    spon_bryntum: 'MOCK_ONLY',
    spon_channel3: 'IMPLEMENTED_UNVERIFIED',
    spon_elastic: 'IMPLEMENTED_UNVERIFIED',
    spon_kernel: 'IMPLEMENTED_UNVERIFIED',
    spon_postman: 'IMPLEMENTED_UNVERIFIED',
    spon_render: 'CONFIGURED_NOT_DEPLOYED',
    spon_zapier: 'IMPLEMENTED_UNVERIFIED',
  };
  const sponsors = SPONSORS.map((sponsor) => ({ ...sponsor, status: statuses[sponsor.id] || 'UNAVAILABLE' }));
  return NextResponse.json({
    integrations: sponsors,
    total: sponsors.length,
  });
}

export async function POST(req: NextRequest) {
  if (!getMerchantSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ error: 'Sponsor status cannot be marked connected by a simulated ping.' }, { status: 501 });
}

