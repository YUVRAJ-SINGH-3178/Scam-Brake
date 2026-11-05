import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbRepository } from '@/server/db/repository';
import { PaymentStateMachine } from '@/server/payments/stateMachine';
import { Payment } from '@/types';

const ScenarioRunSchema = z.object({
  scenarioKey: z.string().default('TAX_OFFICER_SCAM'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validated = ScenarioRunSchema.parse(body);

    const key = validated.scenarioKey.toUpperCase();
    const now = new Date();
    const simRef = `sim_${key.toLowerCase()}_${Date.now()}`;

    let amount = 2000.0;
    let productName = 'Apple Store Digital Gift Card ($500 x 4)';
    let productCategory = 'Digital Gift Cards';
    let riskScore = 94;
    let expectedOutcome: 'VOID' | 'CAPTURE' = 'VOID';
    let customerName = 'Eleanor Vance';

    if (key.includes('LEGITIMATE')) {
      amount = 1299.0;
      productName = 'Apple MacBook Air 15" M3';
      productCategory = 'Laptops & Computers';
      riskScore = 18;
      expectedOutcome = 'CAPTURE';
      customerName = 'Marcus Brody';
    } else if (key.includes('BANK')) {
      amount = 3500.0;
      productName = 'Target eGift Voucher ($1000 x 3 + $500)';
      productCategory = 'Digital Gift Cards';
      riskScore = 98;
      expectedOutcome = 'VOID';
      customerName = 'Arthur Pendelton';
    } else if (key.includes('TECH')) {
      amount = 850.0;
      productName = 'Google Play Digital Cards';
      productCategory = 'Prepaid Cards';
      riskScore = 88;
      expectedOutcome = 'VOID';
      customerName = 'Beatrice Miller';
    }

    // 1. Create Simulated PayPal Authorization
    const simulatedPayment: Payment = {
      id: simRef,
      paymentReference: simRef,
      paypalOrderId: `5O${Math.floor(100000000000000 + Math.random() * 900000000000000)}T`,
      paypalAuthorizationId: `2C${Math.floor(100000000000000 + Math.random() * 900000000000000)}A`,
      merchantId: 'merch_apex_9812',
      merchantName: 'Apex Electronics Direct',
      merchantCategory: 'Consumer Electronics & Hardware',
      productName,
      productCategory,
      amount,
      currency: 'USD',
      riskScore,
      riskLevel: riskScore >= 75 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : 'LOW',
      authorizationStatus: 'HOLD_ACTIVE',
      interventionStatus: riskScore >= 60 ? 'ACTIVE_INTERVENTION' : 'NOT_REQUIRED',
      customer: {
        id: `cust_${simRef}`,
        name: customerName,
        maskedEmail: 'c***@shopper.test',
        maskedPhone: '+1 (555) ***-9988',
        accountAgeMonths: 36,
        hasTrustedContact: true,
        trustedContactName: 'David Vance',
        trustedContactPhone: '+1 (555) ***-4411',
      },
      createdAt: now.toISOString(),
      authorizedAt: now.toISOString(),
      holdExpiresAt: new Date(now.getTime() + 72 * 3600 * 1000).toISOString(),
      riskSignals: [
        {
          id: `sig_${simRef}_1`,
          category: 'UNUSUAL_GIFT_CARD',
          severity: 'HIGH',
          title: 'High-Value Untraceable Gift Cards',
          description: `Total of $${amount.toFixed(2)} USD in retail gift cards.`,
          source: 'CHANNEL3_ENRICHMENT',
          confidence: 0.98,
          detectedAt: now.toISOString(),
        },
      ],
      authorizationHoldSecondsRemaining: 72 * 3600,
    };

    await dbRepository.savePayment(simulatedPayment);

    // 2. Perform End-to-End Simulation Lifecycle
    let resolutionNotes = '';
    if (expectedOutcome === 'VOID') {
      await PaymentStateMachine.executeVoid({
        paymentId: simRef,
        actor: 'CUSTOMER',
        reason: 'Customer completed intervention check-in, identified coercion, and clicked Cancel Payment.',
        idempotencyKey: `sim_void_${simRef}`,
      });
      resolutionNotes = 'Pre-capture void executed. Hold released with $0 fee and 0 chargebacks.';
    } else {
      await PaymentStateMachine.executeCapture({
        paymentId: simRef,
        actor: 'MERCHANT_POLICY',
        notes: 'Customer confirmed purchase volition without caller coercion. Captured successfully.',
        idempotencyKey: `sim_cap_${simRef}`,
      });
      resolutionNotes = 'Payment verified safe and captured into merchant settlement balance.';
    }

    const finalPayment = await dbRepository.getPaymentById(simRef);

    return NextResponse.json({
      success: true,
      scenarioKey: key,
      expectedOutcome,
      actualOutcome: finalPayment?.authorizationStatus,
      payment: finalPayment,
      resolutionNotes,
      fee: 0.0,
      chargebackRecorded: false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

