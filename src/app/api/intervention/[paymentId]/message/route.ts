import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ScamBrakeInterventionAgent } from '@/server/ai/agent';
import { dbRepository } from '@/server/db/repository';

const MessageSchema = z.object({
  message: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const body = await req.json();
    const validated = MessageSchema.parse(body);

    // 1. Record Customer Message
    const customerMsg = await dbRepository.addInterventionMessage(paymentId, {
      sender: 'CUSTOMER',
      content: validated.message,
    });

    // 2. Process with AI Agent
    const agentResponse = await ScamBrakeInterventionAgent.processCustomerMessage({
      paymentId,
      customerMessage: validated.message,
    });

    // 3. Record AI Message
    const aiMsg = await dbRepository.addInterventionMessage(paymentId, {
      sender: 'AI_ASSISTANT',
      content: agentResponse.message,
      quickReplies: agentResponse.quickReplies,
      flaggedKeywords: agentResponse.flaggedKeywords,
    });

    // 4. Update Session Hypothesis if indicators detected
    const session = await dbRepository.getInterventionByPaymentId(paymentId);
    if (session && agentResponse.coercionIndicatorsDetected.length > 0) {
      session.coercionIndicators = Array.from(
        new Set([...(session.coercionIndicators || []), ...agentResponse.coercionIndicatorsDetected])
      );
      session.confidenceScore = agentResponse.updatedConfidenceScore;
      await dbRepository.saveIntervention(session);
    }

    // 5. Audit Log
    await dbRepository.recordAuditLog({
      paymentId,
      eventType: 'CUSTOMER_CHECK_IN_ANSWERED',
      actor: 'CUSTOMER',
      summary: `Customer replied to check-in. Indicators detected: ${agentResponse.coercionIndicatorsDetected.join(', ') || 'None'}.`,
      details: {
        customerMessage: validated.message,
        aiProvider: agentResponse.provider,
        nextStep: agentResponse.recommendedNextStep,
      },
    });

    return NextResponse.json({
      success: true,
      customerMessage: customerMsg,
      agentReply: aiMsg,
      reply: agentResponse.message,
      quickReplies: agentResponse.quickReplies,
      flaggedKeywords: agentResponse.flaggedKeywords,
      coercionIndicatorsDetected: agentResponse.coercionIndicatorsDetected,
      recommendedNextStep: agentResponse.recommendedNextStep,
      aiProvider: agentResponse.provider,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Intervention message processing failed' }, { status: 400 });
  }
}

