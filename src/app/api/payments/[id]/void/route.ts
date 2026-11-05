import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PaymentStateMachine } from '@/server/payments/stateMachine';
import { zapierAutomationRelay } from '@/server/zapier/relay';

const VoidSchema = z.object({
  idempotencyKey: z.string().optional(),
  reason: z.string().optional(),
  actor: z.enum(['CUSTOMER', 'MERCHANT_POLICY', 'SYSTEM_WORKER']).default('CUSTOMER'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const validated = VoidSchema.parse(body);

    const idempotencyKey = validated.idempotencyKey || `idem_void_${id}_${Date.now()}`;

    const updatedPayment = await PaymentStateMachine.executeVoid({
      paymentId: id,
      actor: validated.actor,
      reason: validated.reason || 'Customer intervention identified coercive scam indicators. Authorization voided with $0 fee.',
      idempotencyKey,
    });

    // Notify Zapier
    await zapierAutomationRelay.triggerEvent({
      eventType: 'AUTHORIZATION_VOIDED',
      paymentId: id,
      payload: {
        paymentReference: updatedPayment.paymentReference,
        amount: updatedPayment.amount,
        voidedAt: updatedPayment.resolvedAt,
        reason: updatedPayment.resolutionNotes,
      },
    });

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      authorizationStatus: updatedPayment.authorizationStatus,
      interventionStatus: updatedPayment.interventionStatus,
      resolvedAt: updatedPayment.resolvedAt,
      fee: 0.0,
      chargebackCount: 0,
      message: 'Authorization successfully voided. Customer funds preserved in full.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Void failed' }, { status: 400 });
  }
}

