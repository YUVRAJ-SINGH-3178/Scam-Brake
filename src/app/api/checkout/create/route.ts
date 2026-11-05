import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Protected checkout is unavailable until the PayPal Sandbox buyer approval flow is configured.' },
    { status: 503 }
  );
}
