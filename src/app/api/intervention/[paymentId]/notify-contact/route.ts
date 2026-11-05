import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _req: NextRequest,
  _context: { params: Promise<{ paymentId: string }> }
) {
  return NextResponse.json({ error: 'Customer-bound trusted contact authorization is not implemented.' }, { status: 503 });
}

