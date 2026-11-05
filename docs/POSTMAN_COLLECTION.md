# SCAM BRAKE: POSTMAN API TEST COLLECTION GUIDE

**Sponsor:** Postman  
**Classification:** `REAL_INTEGRATION` (Collection files: `docs/postman_collection.json`, `docs/postman_environment.json`).

---

## 1. Overview of the Test Suite

The Postman collection provides automated integration test coverage across the entire pre-capture payment lifecycle:

1. **Authentication & Session:** Verifies merchant identity and HMAC session cookies.
2. **Checkout & Authorization:** Tests `POST /api/checkout/create` and `POST /api/checkout/authorize` (`intent=AUTHORIZE`).
3. **Customer Safety Intervention:** Tests empathetic conversational AI response generation and Kernel directory lookup.
4. **Pre-Capture Void:** Tests `POST /api/payments/{id}/void` ($0 fee, 0 chargeback).
5. **Settlement Capture:** Tests `POST /api/payments/{id}/capture` for verified legitimate purchases.
6. **Merchant Analytics:** Verifies real-time KPI computation from the PostgreSQL database.
7. **PayPal Webhook Receiver:** Simulates cryptographically signed `PAYMENT.AUTHORIZATION.VOIDED` webhook delivery.

---

## 2. Importing and Running in Postman

1. Open Postman.
2. Click **Import**.
3. Select `docs/postman_collection.json` and `docs/postman_environment.json`.
4. Set the active environment to **Scam Brake Sandbox Environment**.
5. Click **Run Collection**.

All requests include embedded JavaScript assertions (`pm.test(...)`) validating HTTP status codes, payload structures, and state machine transitions.

