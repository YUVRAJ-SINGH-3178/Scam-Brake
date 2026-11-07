import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { PaymentStateMachine } from '@/server/payments/stateMachine';
import { zapierAutomationRelay } from '@/server/zapier/relay';
import { getMerchantSession, hasMerchantPermission, hasSameOrigin } from '@/server/auth/session';
import { dbRepository } from '@/server/db/repository';
import { errorMessage } from '@/server/errors';

const CaptureSchema = z.object({
  idempotencyKey: z.string().min(1).max(36).optional(),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMerchantSession(req);
  if (!hasSameOrigin(req)) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  if (!session || !hasMerchantPermission(session, ['OWNER', 'ADMIN'])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const payment = await dbRepository.getPaymentById(id, session.merchantId);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    const body = await req.json().catch(() => ({}));
    const validated = CaptureSchema.parse(body);

    const idempotencyKey = validated.idempotencyKey || createHash('sha256').update(`capture:${id}`).digest('hex').slice(0, 36);

    const updatedPayment = await PaymentStateMachine.executeCapture({
      paymentId: id,
      actor: 'MERCHANT_POLICY',
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
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error, 'Capture failed') }, { status: 400 });
  }
}

