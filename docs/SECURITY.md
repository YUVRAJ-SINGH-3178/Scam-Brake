# SCAM BRAKE: SECURITY & THREAT MODEL SPECIFICATION

---

## 1. Core Threat Model & Attack Vectors

| Attack Vector | Threat Level | Defense & Architectural Control |
|---|---|---|
| **Replay & Duplicate Financial Action** | CRITICAL | Mandatory unique `idempotencyKey` stored in `PaymentOperation` ledger. Concurrent requests blocked by in-memory mutex (`PaymentStateMachine.withLock`). |
| **Unauthorized Capture / Void** | CRITICAL | State machine enforces allowable transitions. Once a payment is `CAPTURED` or `VOIDED`, it reaches a terminal state and cannot be mutated. |
| **Server-Side Request Forgery (SSRF)** | HIGH | Kernel out-of-band verification enforces strict allowlist (`ALLOWED_DOMAINS`). Private IPs (`127.0.0.1`, `10.*`, `192.168.*`, `169.254.*`) are rejected. |
| **Prompt Injection in Intervention Chat** | HIGH | Customer input is sanitized and processed strictly via non-evaluating schema extraction. The AI agent has zero tools to trigger PayPal void or capture APIs directly. |
| **Unsigned Fake Webhook Injection** | HIGH | PayPal webhooks are cryptographically validated against PayPal’s public certificates via `POST /v1/notifications/verify-webhook-signature`. Unsigned or fake payloads return HTTP 400. |
| **Insecure Direct Object Reference (IDOR)** | MEDIUM | Payment records are bound to specific `merchantId` and signed customer session tokens (`src/server/auth/session.ts`). |
| **Eavesdropping / PII Leakage** | HIGH | Telemetry is strictly limited to cart and session attributes. Customer phone numbers and emails are masked in memory and audit logs (`e***@gmail.com`). We never record phone calls. |

---

## 2. Cryptographic State Audit Seals

Every payment state transition writes an immutable audit record containing:
- `paymentId`
- `eventType`
- `actor` (`CUSTOMER`, `PAYPAL_SYSTEM`, `SCAM_BRAKE_AI`, `MERCHANT_POLICY`, `SYSTEM_WORKER`)
- `timestamp`
- `prevHash` (previous audit record's hash)
- `immutableHash` ($H_n = \text{SHA256}(P_n : E_n : T_n : A_n : H_{n-1})$)

Any retroactive alteration of the audit log invalidates the cryptographic Merkle chain.

---

## 3. Data Minimization Principles
- No raw credit card primary account numbers (PAN) or CVVs are ever received, stored, or processed by Scam Brake (handled exclusively within the sandboxed PayPal wallet).
- Customer conversation logs are retained only for merchant fraud policy compliance and never sold to third parties or used for public foundation model training.

