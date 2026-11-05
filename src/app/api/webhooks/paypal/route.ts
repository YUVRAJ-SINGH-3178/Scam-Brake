import { NextRequest, NextResponse } from 'next/server';
import { paypalClient } from '@/server/paypal/client';
import { dbRepository } from '@/server/db/repository';
import { PaymentStateMachine } from '@/server/payments/stateMachine';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    const transmissionId = req.headers.get('paypal-transmission-id') || '';
    const transmissionTime = req.headers.get('paypal-transmission-time') || '';
    const certUrl = req.headers.get('paypal-cert-url') || '';
    const authAlgo = req.headers.get('paypal-auth-algo') || '';
    const transmissionSig = req.headers.get('paypal-transmission-sig') || '';

    // 1. Verify Webhook Signature
    const isValid = await paypalClient.verifyWebhookSignature({
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      webhookEvent: event,
    });

    if (!isValid) {
      console.warn('[WEBHOOK SECURITY] Rejected invalid PayPal webhook signature.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const eventId = event.id || transmissionId;
    const eventType = event.event_type;

    // 2. Deduplicate Delivery
    const alreadyProcessed = await dbRepository.isWebhookProcessed(eventId);
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, status: 'DUPLICATE_IGNORED' });
    }

    const resource = event.resource || {};
    const authorizationId = resource.id;

    // 3. Reconcile Payment State based on PayPal Event
    if (eventType === 'PAYMENT.AUTHORIZATION.VOIDED') {
      const payment = await dbRepository.getPaymentById(authorizationId);
      if (payment) {
        await PaymentStateMachine.reconcile(payment.id, 'VOIDED', eventId);
      }
    } else if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const payment = await dbRepository.getPaymentById(authorizationId);
      if (payment) {
        await PaymentStateMachine.reconcile(payment.id, 'CAPTURED', eventId);
      }
    }

    // 4. Mark Webhook Processed
    await dbRepository.markWebhookProcessed(eventId, eventType, authorizationId);

    // 5. Audit Log
    await dbRepository.recordAuditLog({
      paymentId: authorizationId,
      eventType: eventType === 'PAYMENT.AUTHORIZATION.VOIDED' ? 'AUTHORIZATION_VOIDED' : 'AUTHORIZATION_CAPTURED',
      actor: 'PAYPAL_SYSTEM',
      summary: `Verified PayPal webhook processed: ${eventType} (Event ID: ${eventId}).`,
      details: { eventId, eventType, resourceId: authorizationId },
    });

    return NextResponse.json({ received: true, eventId, eventType });
  } catch (err: any) {
    console.error('[WEBHOOK ERROR] Error handling PayPal webhook:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}

