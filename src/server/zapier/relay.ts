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
  status: 'DELIVERED' | 'FAILED' | 'RETRY_QUEUED';
  sentAt: string;
}

class ZapierAutomationRelay {
  private webhookSecret: string;
  private deliveries: ZapierDeliveryRecord[] = [];

  constructor() {
    this.webhookSecret = process.env.ZAPIER_WEBHOOK_SECRET || 'zapier_relay_secret_default_hash_2026';
  }

  public getStatus(): { isConfigured: boolean; status: string } {
    const isConfigured = Boolean(process.env.ZAPIER_WEBHOOK_URL || process.env.ZAPIER_WEBHOOK_SECRET);
    return {
      isConfigured,
      status: isConfigured ? 'REAL_INTEGRATION' : 'MOCK_MODE',
    };
  }

  /**
   * Generates HMAC-SHA256 signature for outgoing webhook payload
   */
  public generateSignature(payloadString: string): string {
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadString)
      .digest('hex');
  }

  /**
   * Triggers an outbound event to configured Zapier webhook endpoints
   */
  async triggerEvent(event: ZapierEventPayload): Promise<ZapierDeliveryRecord> {
    const deliveryId = `zap_del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = event.timestamp || new Date().toISOString();
    const zapierUrl = process.env.ZAPIER_WEBHOOK_URL;

    const fullPayload = {
      deliveryId,
      eventType: event.eventType,
      paymentId: event.paymentId,
      timestamp,
      data: event.payload,
    };

    const payloadStr = JSON.stringify(fullPayload);
    const signature = this.generateSignature(payloadStr);

    let status: ZapierDeliveryRecord['status'] = 'DELIVERED';
    let statusCode = 200;

    if (zapierUrl) {
      try {
        const res = await fetch(zapierUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-ScamBrake-Delivery-Id': deliveryId,
            'X-ScamBrake-Signature': signature,
            'X-ScamBrake-Event': event.eventType,
          },
          body: payloadStr,
        });
        statusCode = res.status;
        if (!res.ok) {
          status = 'RETRY_QUEUED';
        }
      } catch (err) {
        console.warn('[ZAPIER] Outbound dispatch failed, queuing retry:', err);
        status = 'RETRY_QUEUED';
        statusCode = 500;
      }
    }

    const record: ZapierDeliveryRecord = {
      deliveryId,
      eventType: event.eventType,
      targetUrl: zapierUrl || 'https://hooks.zapier.com/hooks/catch/scambrake/default-mock',
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

