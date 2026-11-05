import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    status: 'HEALTHY',
    service: 'SCAM_BRAKE_PAYMENT_PROTECTION',
    timestamp: new Date().toISOString(),
  });
}

