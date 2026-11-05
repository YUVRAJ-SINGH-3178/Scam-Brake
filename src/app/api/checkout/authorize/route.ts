import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Authorization is disabled until buyer approval is verified from a PayPal Sandbox order.' },
    { status: 503 }
  );
}
