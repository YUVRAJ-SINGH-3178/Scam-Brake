import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PaymentStateMachine } from '@/server/payments/stateMachine';
import { zapierAutomationRelay } from '@/server/zapier/relay';

const CaptureSchema = z.object({
  idempotencyKey: z.string().optional(),
  notes: z.string().optional(),
  actor: z.enum(['CUSTOMER', 'MERCHANT_POLICY', 'SYSTEM_WORKER']).default('MERCHANT_POLICY'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const validated = CaptureSchema.parse(body);

    const idempotencyKey = validated.idempotencyKey || `idem_cap_${id}_${Date.now()}`;

    const updatedPayment = await PaymentStateMachine.executeCapture({
      paymentId: id,
      actor: validated.actor,
      notes: validated.notes || 'Verified safe; PayPal pre-capture hold released to settlement capture.',
      idempotencyKey,
    });

    // Notify Zapier
    await zapierAutomationRelay.triggerEvent({
      eventType: 'PAYMENT_CAPTURED',
      paymentId: id,
      payload: {
        paymentReference: updatedPayment.paymentReference,
        amount: updatedPayment.amount,
        capturedAt: updatedPayment.resolvedAt,
      },
    });

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      authorizationStatus: updatedPayment.authorizationStatus,
      interventionStatus: updatedPayment.interventionStatus,
      resolvedAt: updatedPayment.resolvedAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Capture failed' }, { status: 400 });
  }
}

