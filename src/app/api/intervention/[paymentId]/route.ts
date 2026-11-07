import { NextRequest, NextResponse } from 'next/server';
import { CUSTOMER_SESSION_COOKIE, findActiveCustomerSession } from '@/server/auth/customerSession';
import { checkDatabaseConnection, prisma } from '@/server/db/client';

export async function GET(req: NextRequest, context: { params: Promise<{ paymentId: string }> }) {
  if (!(await checkDatabaseConnection())) return NextResponse.json({ error: 'Persistent customer sessions are required.' }, { status: 503 });
  const token = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  const customerSession = token ? await findActiveCustomerSession(token) : null;
  if (!customerSession?.customerId) return NextResponse.json({ error: 'Active customer session required.' }, { status: 401 });

  const { paymentId } = await context.params;
  const checkout = await prisma.checkoutSession.findFirst({
    where: { customerSessionId: customerSession.id, payments: { some: { id: paymentId } } },
    include: {
      payments: {
        where: { id: paymentId },
        include: { merchant: { select: { name: true } }, interventionSession: { include: { messages: { orderBy: { timestamp: 'asc' } } } } },
      },
    },
  });
  const payment = checkout?.payments[0];
  if (!payment || payment.customerId !== customerSession.customerId) {
    return NextResponse.json({ error: 'Payment not found for this customer session.' }, { status: 404 });
  }
  const intervention = payment.interventionSession;
  if (!intervention) return NextResponse.json({ error: 'No intervention is active for this payment.' }, { status: 404 });

  return NextResponse.json({
    payment: {
      id: payment.id,
      paymentReference: payment.paymentReference,
      merchantName: payment.merchant.name,
      productName: payment.productName,
      amount: Number(payment.amount),
      currency: payment.currency,
      riskScore: payment.riskScore,
      riskLevel: payment.riskLevel,
      authorizationStatus: payment.authorizationStatus,
      interventionStatus: payment.interventionStatus,
      holdExpiresAt: payment.holdExpiresAt,
    },
    intervention: {
      id: intervention.id,
      status: intervention.status,
      scamHypothesis: intervention.scamHypothesis,
      customerDecision: intervention.customerDecision,
      startedAt: intervention.startedAt,
      completedAt: intervention.completedAt,
      messages: intervention.messages.map((message) => ({
        id: message.id,
        sender: message.sender,
        content: message.content,
        quickReplies: Array.isArray(message.quickReplies) ? message.quickReplies : [],
        timestamp: message.timestamp,
      })),
    },
  }, { headers: { 'Cache-Control': 'no-store' } });
}
