import { NextRequest, NextResponse } from 'next/server';
import { paypalClient } from '@/server/paypal/client';
import { dbRepository } from '@/server/db/repository';
import { PaymentStateMachine } from '@/server/payments/stateMachine';
import { errorMessage } from '@/server/errors';

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource?: {
    id?: unknown;
    supplementary_data?: { related_ids?: { authorization_id?: unknown } };
  };
}

export async function POST(req: NextRequest) {
  let claimedEventId: string | undefined;
  try {
    const rawBody = await req.text();
    let parsedEvent: unknown;
    try {
      parsedEvent = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid webhook JSON' }, { status: 400 });
    }
    if (!parsedEvent || typeof parsedEvent !== 'object'
      || typeof (parsedEvent as Record<string, unknown>).id !== 'string'
      || typeof (parsedEvent as Record<string, unknown>).event_type !== 'string') {
      return NextResponse.json({ error: 'Malformed webhook event' }, { status: 400 });
    }
    const event = parsedEvent as PayPalWebhookEvent;

    const transmissionId = req.headers.get('paypal-transmission-id') || '';
    const isValid = await paypalClient.verifyWebhookSignature({
      transmissionId,
      transmissionTime: req.headers.get('paypal-transmission-time') || '',
      certUrl: req.headers.get('paypal-cert-url') || '',
      authAlgo: req.headers.get('paypal-auth-algo') || '',
      transmissionSig: req.headers.get('paypal-transmission-sig') || '',
      webhookEvent: event,
    });
    if (!isValid) {
      console.warn('[WEBHOOK SECURITY] Rejected invalid PayPal webhook signature.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const eventId: string = event.id;
    claimedEventId = eventId;
    const eventType: string = event.event_type;
    const resource = event.resource || {};
    const resourceId = typeof resource.id === 'string' ? resource.id : undefined;
    const claim = await dbRepository.claimWebhookEvent(eventId, eventType, resourceId, event);
    if (claim === 'PROCESSED') return NextResponse.json({ received: true, status: 'DUPLICATE_IGNORED' });
    if (claim === 'IN_PROGRESS') return NextResponse.json({ received: true, status: 'PROCESSING' }, { status: 202 });

    let paymentId: string | undefined;
    if (eventType === 'PAYMENT.AUTHORIZATION.VOIDED' && resourceId) {
      const providerAuth = await paypalClient.getAuthorization(resourceId);
      if (providerAuth.id !== resourceId || providerAuth.status !== 'VOIDED') {
        throw new Error('PayPal authorization state does not confirm this void event.');
      }
      paymentId = (await dbRepository.getPaymentById(resourceId))?.id;
      if (!paymentId) throw new Error('Verified PayPal authorization is not linked to a local payment yet.');
      await dbRepository.persistVoidFromWebhook(paymentId, resourceId);
      await PaymentStateMachine.reconcile(paymentId, 'VOIDED', eventId);
    } else if (eventType === 'PAYMENT.CAPTURE.COMPLETED' && resourceId) {
      const providerCapture = await paypalClient.getCapture(resourceId);
      const authorizationId = resource.supplementary_data?.related_ids?.authorization_id;
      if (providerCapture.id !== resourceId || providerCapture.status !== 'COMPLETED') {
        throw new Error('PayPal capture state does not confirm this completed event.');
      }
      const verifiedAuthorizationId = providerCapture.supplementary_data?.related_ids?.authorization_id;
      if (typeof authorizationId !== 'string' || verifiedAuthorizationId !== authorizationId) {
        throw new Error('PayPal capture authorization relation could not be verified.');
      }
      paymentId = (await dbRepository.getPaymentById(authorizationId))?.id;
      if (!paymentId) throw new Error('Verified PayPal capture is not linked to a local payment yet.');
      await dbRepository.persistCaptureFromWebhook(paymentId, providerCapture, authorizationId, providerCapture);
      await PaymentStateMachine.reconcile(paymentId, 'CAPTURED', eventId);
    }

    if (eventType === 'PAYMENT.AUTHORIZATION.VOIDED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      await dbRepository.recordAuditLog({
        paymentId,
        eventType: eventType === 'PAYMENT.AUTHORIZATION.VOIDED' ? 'AUTHORIZATION_VOIDED' : 'AUTHORIZATION_CAPTURED',
        actor: 'PAYPAL_SYSTEM',
        summary: `Verified PayPal webhook processed: ${eventType} (Event ID: ${eventId}).`,
        details: { eventId, eventType, resourceId, paymentId },
      });
    }
    await dbRepository.completeWebhookEvent(eventId);
    claimedEventId = undefined;
    return NextResponse.json({ received: true, eventId, eventType });
  } catch (error: unknown) {
    console.error('[WEBHOOK ERROR] Error handling PayPal webhook.');
    if (claimedEventId) {
      try { await dbRepository.failWebhookEvent(claimedEventId, errorMessage(error, 'Webhook processing failed')); }
      catch { /* Preserve the original failure; stale PROCESSING claims are reclaimed after five minutes. */ }
    }
    return NextResponse.json({ error: errorMessage(error, 'Webhook processing failed') }, { status: 500 });
  }
}
