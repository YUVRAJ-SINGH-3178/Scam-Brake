# SCAM BRAKE: PAYPAL SANDBOX SETUP GUIDE

Follow these steps to configure live PayPal Sandbox credentials for testing.

---

## 1. Create a PayPal Developer Account

1. Navigate to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Log in with your standard PayPal credentials.
3. Under **Testing Tools** > **Sandbox Accounts**, review your default Sandbox accounts:
   - **Business Account:** Used to receive payments (Merchant).
   - **Personal Account:** Used to approve payments (Shopper).

---

## 2. Create a Sandbox REST App

1. Under **Apps & Credentials**, select the **Sandbox** toggle.
2. Click **Create App**.
3. Name your app `Scam Brake Protected Checkout`.
4. Select your sandbox business account.
5. Copy the generated credentials:
   - **Client ID**
   - **Secret**

---

## 3. Configure Webhooks in PayPal Dashboard

1. In your app details page, scroll to **Sandbox Webhooks** and click **Add Webhook**.
2. Webhook URL: `https://your-domain.onrender.com/api/webhooks/paypal` (or ngrok URL for local dev).
3. Select the following event types:
   - `Payment authorization created` (`PAYMENT.AUTHORIZATION.CREATED`)
   - `Payment authorization voided` (`PAYMENT.AUTHORIZATION.VOIDED`)
   - `Payment capture completed` (`PAYMENT.CAPTURE.COMPLETED`)
   - `Payment capture denied` (`PAYMENT.CAPTURE.DENIED`)
4. Save the webhook and copy the generated **Webhook ID**.

---

## 4. Add Credentials to `.env`

```env
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
```

---

## 5. Test Orders v2 Authorization & Void via CLI

Run the automated integration test:
```bash
node --experimental-strip-types tests/integration/sponsorAdapters.test.mjs
```
The client will automatically authenticate via OAuth2 (`POST /v1/oauth2/token`), create an order with `intent: 'AUTHORIZE'`, authorize the hold, and execute a pre-capture void.

