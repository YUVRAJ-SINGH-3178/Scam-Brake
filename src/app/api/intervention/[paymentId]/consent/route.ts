import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TrustedContactManager } from '@/server/trustedContact/manager';

const ConsentSchema = z.object({
  consentGranted: z.boolean(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const body = await req.json();
    const validated = ConsentSchema.parse(body);

    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const consentState = await TrustedContactManager.grantConsent({
      paymentId,
      consentGranted: validated.consentGranted,
      ipAddress: clientIp,
    });

    return NextResponse.json({
      success: true,
      trustedContact: consentState,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Consent update failed' }, { status: 400 });
  }
}

