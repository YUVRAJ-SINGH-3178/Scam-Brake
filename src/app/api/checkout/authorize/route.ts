import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paypalClient } from '@/server/paypal/client';
import { RiskIntelligenceEngine } from '@/server/risk/engine';
import { dbRepository } from '@/server/db/repository';
import { Payment } from '@/types';
import { zapierAutomationRelay } from '@/server/zapier/relay';

const AuthorizeSchema = z.object({
  paymentReference: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  productName: z.string().default('Apple Store Digital Gift Card ($500 x 3)'),
  productCategory: z.string().default('Digital Gift Cards'),
  merchantId: z.string().default('merch_apex_9812'),
  clientTelemetry: z
    .object({
      remoteDesktopDetected: z.boolean().optional(),
      activePhoneCall: z.boolean().optional(),
      orderVelocityPerHour: z.number().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = AuthorizeSchema.parse(body);

    const paymentRef = validated.paymentReference || `pay_sb_${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Run Comprehensive Risk Evaluation
    const riskResult = await RiskIntelligenceEngine.evaluate({
      amount: validated.amount,
      productName: validated.productName,
      productCategory: validated.productCategory,
      telemetry: validated.clientTelemetry,
    });

    // 2. Create PayPal Order with intent = AUTHORIZE
    const ppOrder = await paypalClient.createOrder({
      referenceId: paymentRef,
      amount: validated.amount,
      currency: validated.currency,
      description: validated.productName,
    });

    // 3. Authorize the Order on PayPal
    const ppAuth = await paypalClient.authorizeOrder(ppOrder.id);
    const authResource = ppAuth.purchase_units[0]?.payments?.authorizations?.[0];
    const authId = authResource?.id || `2C${Math.floor(100000000000000 + Math.random() * 900000000000000)}A`;

    const now = new Date();
    const holdExpiry = new Date(now.getTime() + 72 * 3600 * 1000); // 72 hour authorization window

    const isElevatedRisk = riskResult.riskScore >= 60;

    // 4. Create Payment Record
    const paymentRecord: Payment = {
      id: paymentRef,
      paymentReference: paymentRef,
      paypalOrderId: ppOrder.id,
      paypalAuthorizationId: authId,
      merchantId: validated.merchantId,
      merchantName: 'Apex Electronics Direct',
      merchantCategory: 'Consumer Electronics & Hardware',
      productName: validated.productName,
      productCategory: validated.productCategory,
      amount: validated.amount,
      currency: 'USD',
      riskScore: riskResult.riskScore,
      riskLevel: riskResult.riskLevel,
      authorizationStatus: 'HOLD_ACTIVE',
      interventionStatus: isElevatedRisk ? 'ACTIVE_INTERVENTION' : 'NOT_REQUIRED',
      customer: {
        id: 'cust_active_shopper',
        name: 'Eleanor Vance',
        maskedEmail: 'e***@gmail.com',
        maskedPhone: '+1 (555) ***-4891',
        accountAgeMonths: 24,
        hasTrustedContact: true,
        trustedContactName: 'David Vance (Son)',
        trustedContactPhone: '+1 (555) ***-9921',
      },
      createdAt: now.toISOString(),
      authorizedAt: now.toISOString(),
      holdExpiresAt: holdExpiry.toISOString(),
      riskSignals: riskResult.signals,
      authorizationHoldSecondsRemaining: 72 * 3600,
    };

    await dbRepository.savePayment(paymentRecord);

    // 5. Create Intervention Session if risk requires safety check-in
    if (isElevatedRisk) {
      await dbRepository.saveIntervention({
        id: `int_${paymentRef}`,
        paymentId: paymentRef,
        status: 'AWAITING_CUSTOMER',
        scamHypothesis: riskResult.aiHypothesis,
        coercionIndicators: riskResult.signals.map((s) => s.category),
        confidenceScore: riskResult.aiConfidence,
        customerDecision: undefined,
        startedAt: now.toISOString(),
        messages: [
          {
            id: `msg_init_${Date.now()}`,
            sender: 'AI_ASSISTANT',
            content: `Your $${paymentRecord.amount.toFixed(2)} payment has not been transferred. PayPal has temporarily placed an authorization hold on the funds. Can you tell me if someone on the phone asked you to purchase these ${paymentRecord.productName}?`,
            timestamp: now.toISOString(),
            quickReplies: ['Yes, someone called me', 'No, this is my own purchase', 'Someone sent me a message'],
          },
        ],
        independentVerification: {
          enabled: true,
          provider: 'KERNEL_VERIFY',
          targetOrganization: 'Internal Revenue Service (IRS)',
          officialPhone: '1-800-829-1040',
          status: 'PENDING',
          notes: 'Certified government switchboard available to test caller legitimacy.',
        },
        trustedContact: {
          registered: true,
          name: 'David Vance',
          relationship: 'Son',
          maskedPhone: '+1 (555) ***-9921',
          consentGranted: false,
          notificationSent: false,
        },
      });

      // Dispatch Zapier high-risk event
      await zapierAutomationRelay.triggerEvent({
        eventType: 'HIGH_RISK_INTERVENTION_CREATED',
        paymentId: paymentRef,
        payload: {
          amount: paymentRecord.amount,
          riskScore: paymentRecord.riskScore,
          signals: riskResult.signals.map((s) => s.title),
        },
      });
    }

    // Record Audit Trail
    await dbRepository.recordAuditLog({
      paymentId: paymentRef,
      eventType: 'AUTH_HOLD_INITIATED',
      actor: 'PAYPAL_SYSTEM',
      summary: `PayPal authorization hold created for ${paymentRef} ($${paymentRecord.amount.toFixed(2)} USD). Pre-capture status: HOLD_ACTIVE.`,
      details: {
        paypalOrderId: ppOrder.id,
        paypalAuthorizationId: authId,
        riskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        intent: 'AUTHORIZE',
      },
    });

    return NextResponse.json({
      success: true,
      payment: paymentRecord,
      action: isElevatedRisk ? 'REDIRECT_TO_INTERVENTION' : 'AUTO_CAPTURE_ELIGIBLE',
      redirectUrl: isElevatedRisk
        ? `/intervention/chat?paymentId=${paymentRef}`
        : `/checkout/status?paymentId=${paymentRef}&status=captured`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authorization failed' }, { status: 500 });
  }
}

