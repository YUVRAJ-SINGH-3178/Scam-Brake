# Security verification matrix

Updated 2026-11-07. Local code/test evidence is not equivalent to deployment or provider verification.

| Control | Implementation | Current evidence | Status / remaining verification |
|---|---|---|---|
| Customer session | Random HTTP-only token; only SHA-256 hash persisted; customer ownership checked for intervention read/message/decision. | Unit hash/session test; full database path not yet exercised. | PARTIAL: run migration and customer checkout/decision integration against disposable PostgreSQL. |
| Payment eligibility | Capture requires active authorization and persistent `PROCEED_PAYMENT` intervention outcome. | Local state-machine regression suite. | PARTIAL: PostgreSQL and browser flow pending. |
| Operation idempotency | Durable unique reservation before provider execution; duplicate and unknown outcomes stop for reconciliation. | Fallback tests; Prisma capture/void integration added. | PENDING DB: execute the new integration and add multi-process race/restart verification. |
| PayPal order approval | SDK approval followed by server retrieval and checks of status, intent, amount, currency, reference, and payer. | Code inspection only. | NOT VERIFIED: no Sandbox credentials/accounts/transaction. |
| Capture/void persistence | Capture row, authorization state, operation result, payment state, and audit data persisted. | Database integration test added. | PENDING DB: run against the user-confirmed disposable database; provider response still simulated. |
| Webhook authenticity | PayPal signature verification is required before event claim. | Fail-closed adapter tests. | NOT VERIFIED: valid Sandbox delivery/signature not exercised. |
| Webhook replay/concurrency | Unique event row atomically claims processing; failed/stale claim recovery; raw verified payload retained; provider resource queried before reconcile. | Code inspection only. | NOT VERIFIED: DB race, duplicate delivery, restart, stale-claim, and out-of-order tests pending. |
| Tenant isolation | Merchant-filtered repository access and route authentication. | Local fallback unit coverage. | PARTIAL: PostgreSQL tenant integration still required. |
| AI grounding | Stored history, local retrieved evidence, strict structured output validation. | Local tests and type checks; no vendor call. | NOT VERIFIED: provider grounding, refusal/error path, timeout, and rate limits. |

## Current disposition

**NO-GO for payment use.** The configured database was confirmed by the user as disposable, but migrations and PostgreSQL integration have not yet run. No PayPal Sandbox transaction or webhook delivery has been verified. Do not enable live payment handling.
