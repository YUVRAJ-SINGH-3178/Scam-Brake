import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RiskIntelligenceEngine } from '@/server/risk/engine';

const CreateCheckoutSchema = z.object({
  merchantId: z.string().default('merch_apex_9812'),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  productName: z.string(),
  productCategory: z.string(),
  isGiftCard: z.boolean().default(false),
  clientTelemetry: z
    .object({
      remoteDesktopDetected: z.boolean().optional(),
      activePhoneCall: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateCheckoutSchema.parse(body);

    const sessionId = `chk_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const paymentRef = `pay_sb_${Math.floor(100000 + Math.random() * 900000)}`;

    // Evaluate preliminary risk
    const preliminaryRisk = await RiskIntelligenceEngine.evaluate({
      amount: validated.amount,
      productName: validated.productName,
      productCategory: validated.productCategory,
      telemetry: {
        cartItemIsGiftCard: validated.isGiftCard,
        remoteDesktopDetected: validated.clientTelemetry?.remoteDesktopDetected,
        activePhoneCall: validated.clientTelemetry?.activePhoneCall,
      },
    });

    return NextResponse.json(
      {
        checkoutSessionId: sessionId,
        paymentReference: paymentRef,
        amount: validated.amount,
        currency: validated.currency,
        productName: validated.productName,
        isGiftCard: validated.isGiftCard,
        riskScore: preliminaryRisk.riskScore,
        riskLevel: preliminaryRisk.riskLevel,
        policyOutcome: preliminaryRisk.policyOutcome,
        signals: preliminaryRisk.signals,
        intent: 'AUTHORIZE',
        expiresAt: new Date(Date.now() + 1800000).toISOString(),
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid checkout payload' }, { status: 400 });
  }
}

