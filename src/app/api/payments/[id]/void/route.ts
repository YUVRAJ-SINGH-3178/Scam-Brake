import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PaymentStateMachine } from '@/server/payments/stateMachine';
import { zapierAutomationRelay } from '@/server/zapier/relay';
import { getMerchantSession, hasMerchantPermission, hasSameOrigin } from '@/server/auth/session';
import { dbRepository } from '@/server/db/repository';
import { errorMessage } from '@/server/errors';

const VoidSchema = z.object({
  idempotencyKey: z.string().optional(),
  reason: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getMerchantSession(req);
  if (!hasSameOrigin(req)) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  if (!session || !hasMerchantPermission(session, ['OWNER', 'ADMIN', 'RISK_ANALYST', 'OPERATOR'])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const payment = await dbRepository.getPaymentById(id);
    if (!payment || payment.merchantId !== session.merchantId) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    const body = await req.json().catch(() => ({}));
    const validated = VoidSchema.parse(body);

    const idempotencyKey = validated.idempotencyKey || `idem_void_${id}_${Date.now()}`;

    const updatedPayment = await PaymentStateMachine.executeVoid({
      paymentId: id,
      actor: 'MERCHANT_POLICY',
      reason: validated.reason || 'Authorized merchant operator requested an authorization void.',
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
      message: 'Provider operation completed. Consult the returned authorization status; issuer timing can affect when a hold is released.',
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error, 'Void failed') }, { status: 400 });
  }
}

