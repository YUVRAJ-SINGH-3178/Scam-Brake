import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CUSTOMER_SESSION_COOKIE, findActiveCustomerSession } from '@/server/auth/customerSession';
import { ScamBrakeInterventionAgent } from '@/server/ai/agent';
import { checkDatabaseConnection, prisma } from '@/server/db/client';
import { dbRepository } from '@/server/db/repository';
import { hasSameOrigin } from '@/server/auth/session';

const MessageSchema = z.object({ message: z.string().trim().min(1).max(2000) });

export async function POST(req: NextRequest, context: { params: Promise<{ paymentId: string }> }) {
  if (!hasSameOrigin(req)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!(await checkDatabaseConnection())) return NextResponse.json({ error: 'Persistent intervention storage is required.' }, { status: 503 });
  const parsed = MessageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Message must contain 1 to 2000 characters.' }, { status: 400 });
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
  if (payment.authorizationStatus !== 'HOLD_ACTIVE' || !['AWAITING_CUSTOMER', 'IN_CONVERSATION'].includes(intervention.status)) {
    return NextResponse.json({ error: 'This intervention is not accepting messages.' }, { status: 409 });
  }

  await dbRepository.addInterventionMessage(payment.id, { sender: 'CUSTOMER', content: parsed.data.message });
  const reply = await ScamBrakeInterventionAgent.processCustomerMessage({ paymentId: payment.id, customerMessage: parsed.data.message });
  await dbRepository.addInterventionMessage(payment.id, {
    sender: 'AI_ASSISTANT',
    content: reply.message,
    quickReplies: reply.quickReplies,
    flaggedKeywords: reply.flaggedKeywords,
  });

  const session = await dbRepository.getInterventionByPaymentId(payment.id);
  if (!session) return NextResponse.json({ error: 'Intervention history could not be reloaded.' }, { status: 503 });
  session.status = 'IN_CONVERSATION';
  session.confidenceScore = Math.max(session.confidenceScore, reply.updatedConfidenceScore);
  session.coercionIndicators = [...new Set([...session.coercionIndicators, ...reply.coercionIndicatorsDetected])];
  await dbRepository.saveIntervention(session);
  await prisma.payment.update({
    where: { id: payment.id },
    data: { interventionStatus: 'ACTIVE_INTERVENTION' },
  });

  return NextResponse.json({
    reply: {
      id: session.messages.at(-1)?.id,
      sender: 'AI_ASSISTANT',
      content: reply.message,
      quickReplies: reply.quickReplies || [],
      timestamp: session.messages.at(-1)?.timestamp || new Date().toISOString(),
    },
    intervention: { id: session.id, status: session.status, confidenceScore: session.confidenceScore },
    decisionRequired: true,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
