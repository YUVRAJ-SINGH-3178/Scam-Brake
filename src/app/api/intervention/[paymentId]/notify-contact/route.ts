import { NextRequest, NextResponse } from 'next/server';
import { TrustedContactManager } from '@/server/trustedContact/manager';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const result = await TrustedContactManager.dispatchNotification({
      paymentId,
      ipAddress: clientIp,
    });

    return NextResponse.json({
      success: true,
      status: result.status,
      dispatchReference: result.dispatchReference,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Notification dispatch failed' }, { status: 400 });
  }
}

