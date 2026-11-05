# SCAM BRAKE: API REFERENCE

> **Status (2026-11-05):** This reference includes planned endpoints and examples that are not currently operational. Checkout and intervention endpoints fail closed, and payment lifecycle calls have not been externally verified. Treat responses and IDs in examples as illustrative. See [FINAL_AUDIT_BASELINE.md](FINAL_AUDIT_BASELINE.md).

Complete REST endpoint reference for Scam Brake protected checkout, payments, AI interventions, and webhooks.

---

## 1. Checkout & Payments Endpoints

### `POST /api/checkout/create`
Initializes a protected checkout session.
- **Request Body:**
  ```json
  {
    "merchantId": "merch_apex_9812",
    "amount": 1500.00,
    "currency": "USD",
    "productName": "Apple Store Digital Gift Card ($500 x 3)",
    "productCategory": "Digital Gift Cards",
    "isGiftCard": true
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "checkoutSessionId": "chk_sess_...",
    "paymentReference": "pay_sb_881901",
    "amount": 1500.00,
    "riskScore": 60,
    "riskLevel": "HIGH",
    "intent": "AUTHORIZE"
  }
  ```

### `POST /api/checkout/authorize`
Places a PayPal authorization hold (`intent = 'AUTHORIZE'`) and performs real-time risk assessment.
- **Request Body:**
  ```json
  {
    "amount": 2000.00,
    "productName": "Apple Store Digital Gift Card ($500 x 4)",
    "productCategory": "Digital Gift Cards",
    "clientTelemetry": {
      "remoteDesktopDetected": false,
      "activePhoneCall": true
    }
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "payment": {
      "id": "pay_sb_...",
      "paypalAuthorizationId": "2C...",
      "authorizationStatus": "HOLD_ACTIVE",
      "interventionStatus": "ACTIVE_INTERVENTION"
    },
    "action": "REDIRECT_TO_INTERVENTION",
    "redirectUrl": "/intervention/chat?paymentId=pay_sb_..."
  }
  ```

### `POST /api/payments/{id}/capture`
Captures an authorized payment after safety verification.
- **Request Body:**
  ```json
  {
    "notes": "Customer confirmed deliberate purchase without caller coercion.",
    "idempotencyKey": "idem_cap_881901"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "authorizationStatus": "CAPTURED",
    "interventionStatus": "VERIFIED_SAFE"
  }
  ```

### `POST /api/payments/{id}/void`
Terminates an authorized payment hold ($0 fee, 0 chargeback).
- **Request Body:**
  ```json
  {
    "reason": "Customer recognized IRS impersonation fraud.",
    "idempotencyKey": "idem_void_881901"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "authorizationStatus": "VOIDED",
    "fee": 0.0,
    "message": "Authorization successfully voided. Customer funds preserved in full."
  }
  ```

---

## 2. Customer Safety Intervention Endpoints

### `POST /api/intervention/{paymentId}/message`
Sends a customer message to the empathetic AI intervention agent.
- **Request Body:**
  ```json
  {
    "message": "The officer told me to pay $2,000 immediately."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "reply": "The IRS will never demand payment via gift cards. Would you like to check their official switchboard?",
    "coercionIndicatorsDetected": ["AUTHORITY_IMPERSONATION"],
    "recommendedNextStep": "OFFER_KERNEL_VERIFY"
  }
  ```

### `POST /api/intervention/{paymentId}/consent`
Records explicit opt-in customer consent for trusted contact notification.
- **Request Body:** `{"consentGranted": true}`

### `POST /api/intervention/{paymentId}/notify-contact`
Dispatches advisory alert to registered contact via Zapier/SMS relay.

---

## 3. Webhook Endpoint

### `POST /api/webhooks/paypal`
Receives and cryptographically verifies PayPal webhook notifications:
- `PAYMENT.AUTHORIZATION.CREATED`
- `PAYMENT.AUTHORIZATION.VOIDED`
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`

