import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/server/db/repository';

export async function GET() {
  const sponsors = await dbRepository.getSponsors();
  return NextResponse.json({
    integrations: sponsors,
    total: sponsors.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { sponsorKey } = await req.json();
    // Simulate test ping
    const latency = Math.floor(15 + Math.random() * 25);
    const updated = await dbRepository.updateSponsorStatus(sponsorKey, 'CONNECTED', latency);
    return NextResponse.json({ success: true, integration: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

