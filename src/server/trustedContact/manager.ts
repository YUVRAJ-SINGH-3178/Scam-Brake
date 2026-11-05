import type { TrustedContactConsentState } from '../../types/index.ts';
import { dbRepository } from '../db/repository.ts';
import { zapierAutomationRelay } from '../zapier/relay.ts';

export interface RegisterContactParams {
  customerId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export class TrustedContactManager {
  /**
   * Grants explicit opt-in consent for trusted contact notification
   */
  public static async grantConsent(params: {
    paymentId: string;
    consentGranted: boolean;
    ipAddress?: string;
  }): Promise<TrustedContactConsentState> {
    const { paymentId, consentGranted, ipAddress } = params;
    const session = await dbRepository.getInterventionByPaymentId(paymentId);
    if (!session) throw new Error(`Intervention session for payment ${paymentId} not found.`);

    session.trustedContact.consentGranted = consentGranted;
    await dbRepository.saveIntervention(session);

    await dbRepository.recordAuditLog({
      paymentId,
      eventType: 'CUSTOMER_CHECK_IN_ANSWERED',
      actor: 'CUSTOMER',
      summary: consentGranted
        ? `Customer granted explicit consent to notify trusted contact (${session.trustedContact.name}).`
        : 'Customer declined/revoked trusted contact notification consent.',
      details: { consentGranted, ipAddress },
    });

    return session.trustedContact;
  }

  /**
   * Dispatches advisory notification to trusted contact
   */
  public static async dispatchNotification(params: {
    paymentId: string;
    ipAddress?: string;
  }): Promise<{ status: string; dispatchReference: string }> {
    const { paymentId, ipAddress } = params;
    const session = await dbRepository.getInterventionByPaymentId(paymentId);
    if (!session) throw new Error(`Intervention session for payment ${paymentId} not found.`);

    if (!session.trustedContact.consentGranted) {
      throw new Error(
        '[SECURITY_VIOLATION] Cannot dispatch trusted contact notification without explicit customer opt-in consent.'
      );
    }

    const payment = await dbRepository.getPaymentById(paymentId);
    const dispatchReference = `sms_relay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Outbound limited-information non-alarmist message
    const alertMessage =
      `Hello ${session.trustedContact.name}, Scam Brake Safety Alert: A payment authorization at ${payment?.merchantName || 'a participating merchant'} has been temporarily held for your family member/contact. No funds have left their account. We invite you to call them calmly to confirm they are safe.`;

    // Dispatch via Zapier relay if configured
    await zapierAutomationRelay.triggerEvent({
      eventType: 'TRUSTED_CONTACT_ALERT_DISPATCHED',
      paymentId,
      payload: {
        recipientName: session.trustedContact.name,
        recipientPhone: session.trustedContact.maskedPhone,
        dispatchReference,
        alertMessage,
      },
    });

    // Update state
    session.trustedContact.notificationSent = true;
    session.trustedContact.sentAt = new Date().toISOString();
    await dbRepository.saveIntervention(session);

    // Record immutable audit entry
    await dbRepository.recordAuditLog({
      paymentId,
      eventType: 'TRUSTED_CONTACT_NOTIFIED',
      actor: 'CUSTOMER',
      summary: `Trusted contact notification dispatched to ${session.trustedContact.name} (${session.trustedContact.maskedPhone}).`,
      details: { dispatchReference, channel: 'SMS_RELAY', ipAddress },
    });

    return { status: 'DISPATCHED', dispatchReference };
  }
}
