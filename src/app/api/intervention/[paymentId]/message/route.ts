import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _req: NextRequest,
  _context: { params: Promise<{ paymentId: string }> }
) {
  return NextResponse.json({ error: 'A customer-bound intervention session is not implemented.' }, { status: 503 });
}

