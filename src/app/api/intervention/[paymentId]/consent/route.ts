import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _req: NextRequest,
  _context: { params: Promise<{ paymentId: string }> }
) {
  return NextResponse.json({ error: 'Customer identity and consent evidence are not implemented.' }, { status: 503 });
}

