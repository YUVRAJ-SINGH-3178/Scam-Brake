import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CUSTOMER_SESSION_COOKIE, findActiveCustomerSession } from '@/server/auth/customerSession';
import { checkDatabaseConnection, prisma } from '@/server/db/client';
import { dbRepository } from '@/server/db/repository';
import { PaymentStateMachine } from '@/server/payments/stateMachine';
import { hasSameOrigin } from '@/server/auth/session';

const DecisionSchema = z.object({ decision: z.enum(['CANCEL_PAYMENT', 'PROCEED_PAYMENT']) });

export async function POST(req: NextRequest, context: { params: Promise<{ paymentId: string }> }) {
  if (!hasSameOrigin(req)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!(await checkDatabaseConnection())) return NextResponse.json({ error: 'Persistent customer sessions are required.' }, { status: 503 });
  const parsed = DecisionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Choose whether to cancel or continue.' }, { status: 400 });
  const token = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  const customerSession = token ? await findActiveCustomerSession(token) : null;
  if (!customerSession?.customerId) return NextResponse.json({ error: 'Active customer session required.' }, { status: 401 });

  const { paymentId } = await context.params;
  const checkout = await prisma.checkoutSession.findFirst({
    where: { customerSessionId: customerSession.id, payments: { some: { id: paymentId } } },
    include: { payments: { where: { id: paymentId }, include: { interventionSession: true } } },
  });
  const payment = checkout?.payments[0];
  const intervention = payment?.interventionSession;
  if (!payment || payment.customerId !== customerSession.customerId || !intervention) {
    return NextResponse.json({ error: 'Payment not found for this customer session.' }, { status: 404 });
  }
  if (payment.authorizationStatus !== 'HOLD_ACTIVE') {
    return NextResponse.json({ error: 'This payment does not have an active authorization hold.' }, { status: 409 });
  }
  if (intervention.customerDecision) {
    if (intervention.customerDecision === parsed.data.decision && intervention.status.startsWith('RESOLVED_')) {
      return NextResponse.json({ decision: intervention.customerDecision, status: intervention.status });
    }
    return NextResponse.json({ error: 'A decision is already recorded or awaiting reconciliation.' }, { status: 409 });
  }
  if (!['AWAITING_CUSTOMER', 'IN_CONVERSATION'].includes(intervention.status)) {
    return NextResponse.json({ error: 'This intervention is not accepting a decision.' }, { status: 409 });
  }

  const started = await prisma.interventionSession.updateMany({
    where: { id: intervention.id, customerDecision: null, status: { in: ['AWAITING_CUSTOMER', 'IN_CONVERSATION'] } },
    data: {
      customerDecision: parsed.data.decision,
      status: parsed.data.decision === 'CANCEL_PAYMENT' ? 'RESOLVING_VOID' : 'RESOLVING_CAPTURE',
    },
  });
  if (started.count !== 1) return NextResponse.json({ error: 'A decision was recorded concurrently.' }, { status: 409 });

  if (parsed.data.decision === 'PROCEED_PAYMENT') {
    await prisma.$transaction(async (tx) => {
      await tx.interventionSession.update({
        where: { id: intervention.id },
        data: { status: 'RESOLVED_CAPTURE', completedAt: new Date() },
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          interventionStatus: 'VERIFIED_SAFE',
          resolvedAt: new Date(),
          resolutionNotes: 'Customer explicitly chose to proceed after the Scam Brake safety check-in.',
        },
      });
    });
    await dbRepository.recordAuditLog({
      paymentId: payment.id,
      eventType: 'CUSTOMER_CHECK_IN_ANSWERED',
      actor: 'CUSTOMER',
      summary: 'Customer explicitly chose to proceed; authorization remains on hold until merchant capture.',
      details: { decision: 'PROCEED_PAYMENT', interventionSessionId: intervention.id },
    });
    return NextResponse.json({ decision: 'PROCEED_PAYMENT', status: 'RESOLVED_CAPTURE', authorizationStatus: 'HOLD_ACTIVE' });
  }

  const idempotencyKey = createHash('sha256').update(`customer-void:${payment.id}`).digest('hex').slice(0, 36);
  try {
    const voided = await PaymentStateMachine.executeVoid({
      paymentId: payment.id,
      actor: 'CUSTOMER',
      reason: 'Customer explicitly cancelled the payment during the Scam Brake safety check-in.',
      idempotencyKey,
    });
    await prisma.$transaction(async (tx) => {
      await tx.interventionSession.update({ where: { id: intervention.id }, data: { status: 'RESOLVED_VOID', completedAt: new Date() } });
      await tx.checkoutSession.update({ where: { id: checkout.id }, data: { status: 'CANCELLED_BY_CUSTOMER' } });
    });
    return NextResponse.json({ decision: 'CANCEL_PAYMENT', status: 'RESOLVED_VOID', authorizationStatus: voided.authorizationStatus });
  } catch {
    await prisma.interventionSession.update({ where: { id: intervention.id }, data: { status: 'RECONCILIATION_REQUIRED' } });
    return NextResponse.json({ error: 'The provider outcome is not confirmed. Do not retry; reconciliation is required.' }, { status: 503 });
  }
}
