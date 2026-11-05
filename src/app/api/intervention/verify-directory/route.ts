import { NextRequest, NextResponse } from 'next/server';
import { kernelVerificationClient } from '@/server/kernel/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || 'IRS';

  const entry = await kernelVerificationClient.lookupOfficialDirectory(query);

  if (!entry) {
    return NextResponse.json({ error: 'Organization not found in verified registry' }, { status: 404 });
  }

  return NextResponse.json(entry);
}

