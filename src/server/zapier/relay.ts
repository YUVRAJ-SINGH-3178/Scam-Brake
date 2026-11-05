import crypto from 'crypto';

export interface ZapierEventPayload {
  eventType:
    | 'HIGH_RISK_INTERVENTION_CREATED'
    | 'SUSPICIOUS_PAYMENT_CANCELLED'
    | 'AUTHORIZATION_VOIDED'
    | 'PAYMENT_CAPTURED'
    | 'TRUSTED_CONTACT_ALERT_DISPATCHED'
    | 'INCIDENT_ESCALATED'
    | 'DAILY_SAFETY_SUMMARY';
  paymentId?: string;
  timestamp?: string;
  payload: Record<string, unknown>;
}

export interface ZapierDeliveryRecord {
  deliveryId: string;
  eventType: string;
  targetUrl: string;
  statusCode?: number;
  status: 'DELIVERED' | 'FAILED';
  sentAt: string;
}

export class ZapierAutomationRelay {
  private webhookSecret: string;
  private deliveries: ZapierDeliveryRecord[] = [];

  constructor() {
    this.webhookSecret = process.env.ZAPIER_WEBHOOK_SECRET || '';
  }

  public getStatus(): { isConfigured: boolean; status: string } {
    const isConfigured = Boolean(process.env.ZAPIER_WEBHOOK_URL && this.webhookSecret.length >= 32);
    return { isConfigured, status: isConfigured ? 'CONFIGURED_UNVERIFIED' : 'UNAVAILABLE' };
  }

  public generateSignature(payloadString: string): string {
    if (this.webhookSecret.length < 32) throw new Error('ZAPIER_WEBHOOK_SECRET must contain at least 32 characters.');
    return crypto.createHmac('sha256', this.webhookSecret).update(payloadString).digest('hex');
  }

  async triggerEvent(event: ZapierEventPayload): Promise<ZapierDeliveryRecord> {
    const deliveryId = `zap_del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = event.timestamp || new Date().toISOString();
    const zapierUrl = process.env.ZAPIER_WEBHOOK_URL;
    const payloadStr = JSON.stringify({ deliveryId, eventType: event.eventType, paymentId: event.paymentId, timestamp, data: event.payload });
    let status: ZapierDeliveryRecord['status'] = 'FAILED';
    let statusCode: number | undefined;

    if (zapierUrl && this.webhookSecret.length >= 32) {
      try {
        const res = await fetch(zapierUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-ScamBrake-Delivery-Id': deliveryId,
            'X-ScamBrake-Signature': this.generateSignature(payloadStr),
            'X-ScamBrake-Event': event.eventType,
          },
          body: payloadStr,
        });
        statusCode = res.status;
        if (res.ok) status = 'DELIVERED';
      } catch (error) {
        console.warn('[ZAPIER] Outbound dispatch failed:', error);
      }
    }

    const record: ZapierDeliveryRecord = {
      deliveryId,
      eventType: event.eventType,
      targetUrl: zapierUrl || '',
      statusCode,
      status,
      sentAt: timestamp,
    };
    this.deliveries.unshift(record);
    return record;
  }

  public getDeliveryHistory(): ZapierDeliveryRecord[] {
    return [...this.deliveries];
  }
}

export const zapierAutomationRelay = new ZapierAutomationRelay();
