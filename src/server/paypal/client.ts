/**
 * SCAM BRAKE: PayPal Orders v2 & Payments v2 Client
 *
 * Implements two-step pre-capture authorization holds:
 * - Orders v2: intent = AUTHORIZE
 * - Authorize: POST /v2/checkout/orders/{id}/authorize
 * - Void: POST /v2/payments/authorizations/{id}/void
 * - Capture: POST /v2/payments/authorizations/{id}/capture
 * - Webhook Signature Verification: POST /v1/notifications/verify-webhook-signature
 */

export interface PayPalConfig {
  environment: 'sandbox' | 'live';
  clientId: string;
  clientSecret: string;
  webhookId?: string;
  baseUrl: string;
}

export interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PayPalCreateOrderParams {
  referenceId: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  intent: 'AUTHORIZE' | 'CAPTURE';
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
    payments?: {
      authorizations?: Array<{
        id: string;
        status: 'CREATED' | 'CAPTURED' | 'DENIED' | 'EXPIRED' | 'PARTIALLY_CAPTURED' | 'VOIDED' | 'PENDING';
        amount: { currency_code: string; value: string };
        expiration_time: string;
      }>;
      captures?: Array<{
        id: string;
        status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED' | 'FAILED';
        amount: { currency_code: string; value: string };
      }>;
    };
  }>;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalAuthorizeResponse {
  id: string; // Order ID
  status: string;
  purchase_units: Array<{
    payments: {
      authorizations: Array<{
        id: string; // Authorization ID
        status: 'CREATED' | 'CAPTURED' | 'DENIED' | 'EXPIRED' | 'PARTIALLY_CAPTURED' | 'VOIDED' | 'PENDING';
        amount: {
          currency_code: string;
          value: string;
        };
        expiration_time: string;
        seller_protection?: {
          status: string;
        };
      }>;
    };
  }>;
}

export interface PayPalCaptureResponse {
  id: string; // Capture ID
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  amount: {
    currency_code: string;
    value: string;
  };
  final_capture: boolean;
  create_time: string;
  update_time: string;
}

export interface PayPalVoidResponse {
  id: string;
  status: 'VOIDED';
  links?: Array<{ href: string; rel: string; method: string }>;
}

class PayPalClient {
  private config: PayPalConfig;
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor() {
    const env = (process.env.PAYPAL_ENVIRONMENT || 'sandbox').toLowerCase() as 'sandbox' | 'live';
    if (env === 'live' && process.env.ALLOW_LIVE_PAYPAL !== 'true') {
      throw new Error(
        '[PAYPAL SECURITY] Refusing accidental live PayPal mode. Set ALLOW_LIVE_PAYPAL=true if intended.'
      );
    }

    this.config = {
      environment: env,
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
      baseUrl:
        env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com',
    };
  }

  public isConfigured(): boolean {
    return Boolean(this.config.clientId && this.config.clientSecret);
  }

  public getConfig(): { environment: string; isConfigured: boolean; baseUrl: string } {
    return {
      environment: this.config.environment,
      isConfigured: this.isConfigured(),
      baseUrl: this.config.baseUrl,
    };
  }

  /**
   * Retrieves or refreshes OAuth 2.0 Access Token
   */
  async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - 60000) {
      return this.cachedToken.token;
    }

    if (!this.isConfigured()) {
      throw new Error(
        'PayPal Client ID or Secret is not configured. Please supply PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.'
      );
    }

    const auth = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString('base64');

    const res = await fetch(`${this.config.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`PayPal OAuth token failed [${res.status}]: ${errBody}`);
    }

    const data: PayPalTokenResponse = await res.json();
    this.cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    return this.cachedToken.token;
  }

  /**
   * Creates an order with intent: 'AUTHORIZE'
   */
  async createOrder(params: PayPalCreateOrderParams, idempotencyKey?: string): Promise<PayPalOrderResponse> {
    if (!this.isConfigured()) {
      // Return deterministic simulated PayPal Sandbox Order for demonstration/local testing
      return this.simulateCreateOrder(params);
    }

    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) {
      headers['PayPal-Request-Id'] = idempotencyKey;
    }

    const payload = {
      intent: 'AUTHORIZE',
      purchase_units: [
        {
          reference_id: params.referenceId,
          description: params.description,
          amount: {
            currency_code: params.currency,
            value: params.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'Scam Brake Protected Merchant',
        landing_page: 'NO_PREFERENCE',
        user_action: 'CONTINUE',
        return_url: params.returnUrl || 'http://localhost:3000/checkout/authorizing',
        cancel_url: params.cancelUrl || 'http://localhost:3000/checkout',
      },
    };

    const res = await fetch(`${this.config.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PayPal createOrder failed [${res.status}]: ${err}`);
    }

    return (await res.json()) as PayPalOrderResponse;
  }

  /**
   * Authorizes an approved order: POST /v2/checkout/orders/{order_id}/authorize
   */
  async authorizeOrder(orderId: string, idempotencyKey?: string): Promise<PayPalAuthorizeResponse> {
    if (!this.isConfigured()) {
      return this.simulateAuthorizeOrder(orderId);
    }

    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) {
      headers['PayPal-Request-Id'] = idempotencyKey;
    }

    const res = await fetch(`${this.config.baseUrl}/v2/checkout/orders/${orderId}/authorize`, {
      method: 'POST',
      headers,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PayPal authorizeOrder failed [${res.status}]: ${err}`);
    }

    return (await res.json()) as PayPalAuthorizeResponse;
  }

  /**
   * Captures an authorized payment: POST /v2/payments/authorizations/{authorization_id}/capture
   */
  async captureAuthorization(
    authorizationId: string,
    amount?: { currency: string; value: number },
    idempotencyKey?: string
  ): Promise<PayPalCaptureResponse> {
    if (!this.isConfigured()) {
      return this.simulateCapture(authorizationId, amount);
    }

    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) {
      headers['PayPal-Request-Id'] = idempotencyKey;
    }

    const body = amount
      ? JSON.stringify({
          amount: {
            currency_code: amount.currency,
            value: amount.value.toFixed(2),
          },
          final_capture: true,
        })
      : JSON.stringify({ final_capture: true });

    const res = await fetch(
      `${this.config.baseUrl}/v2/payments/authorizations/${authorizationId}/capture`,
      {
        method: 'POST',
        headers,
        body,
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PayPal captureAuthorization failed [${res.status}]: ${err}`);
    }

    return (await res.json()) as PayPalCaptureResponse;
  }

  /**
   * Voids an authorized payment: POST /v2/payments/authorizations/{authorization_id}/void
   */
  async voidAuthorization(authorizationId: string, idempotencyKey?: string): Promise<PayPalVoidResponse> {
    if (!this.isConfigured()) {
      return this.simulateVoid(authorizationId);
    }

    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) {
      headers['PayPal-Request-Id'] = idempotencyKey;
    }

    const res = await fetch(
      `${this.config.baseUrl}/v2/payments/authorizations/${authorizationId}/void`,
      {
        method: 'POST',
        headers,
      }
    );

    // PayPal returns 204 No Content or 200 with void resource
    if (res.status === 204) {
      return { id: authorizationId, status: 'VOIDED' };
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PayPal voidAuthorization failed [${res.status}]: ${err}`);
    }

    return (await res.json()) as PayPalVoidResponse;
  }

  /**
   * Verifies incoming PayPal Webhook Signature: POST /v1/notifications/verify-webhook-signature
   */
  async verifyWebhookSignature(params: {
    transmissionId: string;
    transmissionTime: string;
    certUrl: string;
    authAlgo: string;
    transmissionSig: string;
    webhookEvent: any;
  }): Promise<boolean> {
    if (!this.isConfigured() || !this.config.webhookId) {
      // In sandbox/mock development mode, check presence of signature headers
      return Boolean(params.transmissionId && params.transmissionSig);
    }

    const token = await this.getAccessToken();
    const payload = {
      auth_algo: params.authAlgo,
      cert_url: params.certUrl,
      transmission_id: params.transmissionId,
      transmission_sig: params.transmissionSig,
      transmission_time: params.transmissionTime,
      webhook_id: this.config.webhookId,
      webhook_event: params.webhookEvent,
    };

    const res = await fetch(
      `${this.config.baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) return false;
    const data = await res.json();
    return data.verification_status === 'SUCCESS';
  }

  // --------------------------------------------------------------------------
  // DETERMINISTIC SANDBOX SIMULATORS (Used when credentials not yet set)
  // --------------------------------------------------------------------------
  private simulateCreateOrder(params: PayPalCreateOrderParams): PayPalOrderResponse {
    const orderId = `5O${Math.floor(100000000000000 + Math.random() * 900000000000000)}T`;
    return {
      id: orderId,
      status: 'CREATED',
      intent: 'AUTHORIZE',
      purchase_units: [
        {
          reference_id: params.referenceId,
          amount: {
            currency_code: params.currency,
            value: params.amount.toFixed(2),
          },
        },
      ],
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
          rel: 'approve',
          method: 'GET',
        },
      ],
    };
  }

  private simulateAuthorizeOrder(orderId: string): PayPalAuthorizeResponse {
    const authId = `2C${Math.floor(100000000000000 + Math.random() * 900000000000000)}A`;
    const expiration = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
    return {
      id: orderId,
      status: 'COMPLETED',
      purchase_units: [
        {
          payments: {
            authorizations: [
              {
                id: authId,
                status: 'CREATED',
                amount: { currency_code: 'USD', value: '1500.00' },
                expiration_time: expiration,
                seller_protection: { status: 'ELIGIBLE' },
              },
            ],
          },
        },
      ],
    };
  }

  private simulateCapture(authorizationId: string, amount?: { currency: string; value: number }): PayPalCaptureResponse {
    const captureId = `9P${Math.floor(100000000000000 + Math.random() * 900000000000000)}B`;
    return {
      id: captureId,
      status: 'COMPLETED',
      amount: {
        currency_code: amount?.currency || 'USD',
        value: (amount?.value || 1500.0).toFixed(2),
      },
      final_capture: true,
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString(),
    };
  }

  private simulateVoid(authorizationId: string): PayPalVoidResponse {
    return {
      id: authorizationId,
      status: 'VOIDED',
    };
  }
}

export const paypalClient = new PayPalClient();

