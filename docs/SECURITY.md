# Scam Brake security status and threat model

Updated: 2026-11-07. This document describes the repository as it exists. It is not a security certification or a claim that the product is safe for payment processing. See [SECURITY_VERIFICATION.md](SECURITY_VERIFICATION.md) for test evidence and [RELEASE_REMEDIATION_TRACKER.md](RELEASE_REMEDIATION_TRACKER.md) for open findings.

## Protected assets and trust boundaries

- Merchant users, merchant membership, payments and audit events are tenant-sensitive.
- PayPal order, authorization, capture and void status must be provider-confirmed.
- Customer decisions, contact information, consent and conversation history require a customer-bound identity.
- Browser input, AI output, webhook payloads, and external directory content are untrusted until validated.
- PostgreSQL is intended to be authoritative. The development fallback is process memory and must not be used for real payment data.

## Controls implemented in the current branch

- Merchant list, detail, metric and audit repository queries can apply `merchantId` predicates. The payment API passes the authenticated tenant into detail, capture, void and audit lookups. The fallback rejects writes that collide with another merchant's payment ID or reference.
- Payment capture rejects a payment with an active or unresolved intervention. Checkout and customer decision APIs use expiring customer-bound sessions and persisted decisions, but need PostgreSQL integration verification.
- Merchant login hashes passwords with scrypt and issues an HTTP-only SameSite cookie with a signed, expiring token. The database stores the token ID, not the raw cookie token. Each authenticated request checks the active session, tenant membership and current role; login revokes older sessions and logout revokes the current one.
- State-changing merchant routes enforce same-origin requests. Worker tick requires a separate high-entropy bearer secret.
- PayPal live mode is rejected. Missing webhook verification configuration fails closed. Checkout requires a configured Sandbox app, checkout merchant, and reachable PostgreSQL. Approval is checked against PayPal's authoritative order state.
- Production database absence or failure does not silently grant access to the memory fallback.

## Open risks and limitations

- The tenant tests use the local fallback and a query-predicate helper. The user confirmed the configured PostgreSQL database is disposable, but it could not be reached from this environment, so migrations and PostgreSQL fixtures remain unverified.
- The `MerchantSession` migration is present but must be applied before login/session checks can operate. MFA, password reset, email verification, account provisioning, and shared rate limiting are not implemented.
- Payment operation reservations and webhook event claims use PostgreSQL uniqueness/conditional updates. Their concurrency behavior across instances, restarts, and provider timeouts still requires database-backed tests.
- No buyer-approved PayPal Sandbox order, capture, void, or webhook has been verified. Do not enable payments.
- Customer decisions and intervention conversations are persisted in code. Trusted-contact consent/delivery and independently verified evidence remain incomplete or disabled.
- Merchant views still contain sample/mock data and must not be used with real customer data. Some optional integrations are adapters only and have not been externally verified.
- Login throttling is process-local. Review all outbound requests and rate limits before deployment.

## Release rule

The current disposition is **NO-GO** for live or Sandbox payment handling. Do not represent the prototype as a functioning payment protection service until tenant isolation is verified on PostgreSQL, customer identity and clearance are durable, payment operations are idempotent across instances, and the Sandbox lifecycle and webhook reconciliation pass end-to-end tests.
