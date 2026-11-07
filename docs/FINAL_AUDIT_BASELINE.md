# Final audit baseline

> **Current status update (2026-11-07):** This report's original findings below are a historical 2026-11-05 baseline. The ordered remediation is tracked in [RELEASE_REMEDIATION_TRACKER.md](RELEASE_REMEDIATION_TRACKER.md). Buyer approval, customer decisions, AI conversation persistence, policy worker changes, and atomic webhook claiming/reconciliation have since been implemented in code. TypeScript and Prisma schema validation pass. The user confirmed the configured database is disposable, but its PostgreSQL host could not be reached from this environment; no migration was applied. The DB integration run failed its reachability precondition. No PayPal Sandbox transaction or webhook was verified. Current disposition remains **NO-GO**.

Audit date: 2026-11-05  
Repository baseline: `7750a6e` on `main`; safety branch `backup-final-release-20261105` created before edits.

## Initial verification

| Check | Result | Evidence and limit |
|---|---|---|
| `npm test` | PASSED, 15/15 | Includes risk, state-machine, sponsor-adapter unit cases and two scripted demonstrations. PayPal operations are deterministic simulations in this suite; no provider request was made. |
| `npm run lint` | FAILED | Existing lint errors include explicit `any` in API, seed, repository and adapter code; JSX comment errors; plus many unused-variable warnings. |
| `npm run build` | PASSED before edits | Next.js 16.4.5 production build and type checking completed. This does not validate external services. |
| Production dependency audit | PASSED, 0 reported | `npm.cmd audit --omit=dev --audit-level=high`; development dependencies were excluded. |
| Prisma validation | NOT RECORDED | The initial combined command output was truncated. Re-run separately before release. |
| PayPal Sandbox transaction | BLOCKED | No credentials or configured webhook ID were available. The customer approval UI and API did not use a real PayPal approval flow. |
| PostgreSQL persistence | BLOCKED | No database connection was configured or exercised. The repository falls back to in-memory seeded data outside production. |

## Confirmed and reproduced defects

- `GET /api/auth/session` returned a hardcoded authenticated merchant session without a credential.
- Payment list/detail, merchant administration, intervention, and worker endpoints did not consistently authenticate callers.
- Capture and void accepted an `actor` field supplied by the caller. Payment lookup was not tenant scoped at the route boundary.
- Checkout advanced using timers and the old authorize endpoint created and authorized an order in the same request, without buyer approval.
- PayPal adapter methods silently simulated transactions when credentials were absent. Webhook verification accepted the presence of two signature headers when provider configuration was absent.
- Checkout creation returned random references without persisting an order or checkout record.
- The repository uses in-memory seeded fallback data. It is not durable, and seed data is visible to all callers unless protected at the API layer.
- Payment operation locks remain process-local. Capture and void now make a durable unique-key reservation before calling PayPal when PostgreSQL is available; duplicate and unknown outcomes stop for reconciliation. This path is not yet verified across instances or restarts. Webhook event claiming still needs atomic durable processing.
- Capture webhook handling looked up the capture resource ID as though it were the authorization ID.
- Health response inferred sponsor integration status from environment variable presence and reported the in-memory fallback as a healthy data mode.
- Sponsor connection test endpoint marked a sponsor connected after a randomized fake latency. The Render worker command referenced `dist/server/worker/scheduler.js`, although the repository has no build step producing `dist/`.
- README and product docs asserted successful holds, capture/void, certification, fee savings, or chargeback outcomes without provider evidence. Several UI states presented simulated events as completed transactions.

## Existing implementations observed

- A PayPal REST adapter contains Orders v2 create/authorize and Payments v2 capture/void calls, with PayPal request IDs.
- A Prisma PostgreSQL schema and initial migration exist, with payment, authorization, capture, operation, webhook, intervention, and audit entities.
- Payment state transition functions and deterministic adapter tests exist.
- Webhook signature verification calls PayPal's verification endpoint when configured.
- Risk scoring, AI response, Kernel, Elastic, Channel3, Zapier and scheduling adapters have code and local tests. A test or adapter is not proof of live sponsor use.
- `.gitignore` excludes `.env*`; no tracked `.env` files or API-key-pattern matches remained after replacing the demo credential in the Postman environment. Git history does contain fixed demo credentials, detailed below.

## Changes made after baseline

- Created a signed-session verifier that fails closed without a 32-byte `SESSION_SECRET`; removed the default authenticated demo identity from the session endpoint.
- Required merchant session and tenant match for payment listing, detail, capture, void, metrics, and merchant audit access. Caller-selected actor values are no longer accepted by capture/void routes.
- Required a constant-time `INTERNAL_WORKER_SECRET` check on the worker tick endpoint.
- Restricted PayPal mode to sandbox; live mode is rejected. Simulated adapter behavior requires explicit local demo mode; missing sandbox credentials no longer silently switch to simulation. Missing webhook verification configuration now rejects events.
- Disabled legacy checkout create/authorize endpoints and the checkout button until real PayPal buyer approval and persistent checkout records exist.
- Disabled customer intervention, trusted-contact consent, and notification endpoints until a customer-bound session and consent evidence exist.
- Prevented capture/void unless the local record says PayPal has an active authorization, and only mark capture complete when the provider returns `COMPLETED`.
- Mapped capture webhooks through PayPal's related authorization ID.
- Made production database absence or failure fail closed instead of falling back to memory; split liveness and database readiness.
- Disabled fake sponsor “test ping” success and made the local scenario simulation endpoint unavailable in production.
- Added a source TypeScript worker entry point and updated Render to run it instead of a nonexistent `dist/` artifact.
- Added a database-backed merchant login using scrypt password verification, same-origin checks, an expiring signed HTTP-only session cookie, a sign-out route, and a protected merchant route layout. Local demo seeding now requires explicit opt-in and a supplied 16+ character password; fixed demo password/API/webhook values were removed from the current tree.
- Added an honest prototype notice to the merchant shell and removed false “partner active/live sandbox” labels and fabricated intervention badges. Client-side mock capture/void now do not mutate payment status.
- Updated sponsor API status output to report evidence classifications rather than seeded “connected” states.
- Fixed all ESLint errors found during the pass; the command still reports unused-variable warnings.

## Remaining blockers and external dependencies

- Merchant login verifies scrypt hashes and issues an expiring signed HTTP-only cookie backed by a persistent revocable session row. The schema/migration are present; no database was available to apply or exercise them. Account provisioning, email verification, password reset, MFA, distributed rate limiting, and customer identity/session remain incomplete.
- Checkout is intentionally unavailable: official PayPal JavaScript SDK buyer approval, server order retrieval/validation, checkout persistence and order-to-payment mapping still need implementation.
- No PayPal Sandbox credentials, buyer/seller test accounts, webhook ID, or externally verified order/authorization/capture/void IDs were supplied.
- Payment/intervention/operation/audit persistence and atomic idempotency need live PostgreSQL implementation and integration tests. The current repository's Prisma paths are incomplete and the local fallback remains process memory.
- Customer intervention, conversation access, trusted-contact verification, consent and notification are disabled pending customer-bound authorization.
- No actual integration calls or deployment evidence exist for the sponsors. See `SPONSOR_INTEGRATIONS.md`.
- Remaining product and integration docs include historical or design-only claims. Status notices are being added to the most operationally misleading docs; review legacy docs before public submission.
- No screenshots were captured from a verified running application, no demo video was recorded, and no public repository was created or published.
- No LICENSE file was present at audit time. Adding a public license requires ownership confirmation.
- Git history contains a fixed demo password and fixed demo merchant API/webhook values from the original seed and Postman environment. These values have been removed from the current files. If any were ever used outside local demo data, rotate them; removing them from the latest tree does not invalidate historical values.

## Release status

**NO-GO.** This repository is not safe to use for payments or to describe as a functioning protected checkout. Merchant session revocation is implemented in code but not verified against a deployed database. Critical blockers include disabled buyer approval, unverified webhook/payment lifecycle, and non-durable or non-atomic persistence. Do not enable live PayPal.

## Remediation update: tenant isolation

- Reproduced a PostgreSQL tenant-filter defect in `getPayments()` and a matching unscoped fallback query. Both now apply `merchantId`; dashboard metrics use the required merchant scope.
- Payment detail, capture, void, and audit handlers now pass the signed merchant ID into repository lookups. PostgreSQL audit retrieval filters through the related payment's merchant ID.
- Added `tests/unit/tenantIsolation.test.mjs`; list, detail, metrics, and audit isolation pass against the local fallback and tenant predicate builder. This does not substitute for a live PostgreSQL multi-tenant integration test.
- Capture now rejects all payments with an unresolved intervention status. A state-machine regression test verifies that a merchant policy actor cannot capture an actively reviewed payment.
- Added persistent merchant-session records with server-side revocation and role/membership revalidation on authenticated requests. Login rotates prior sessions; logout revokes the current session. The migration and session-state unit test are present, but no PostgreSQL integration test could run here.
- Capture and void now reserve an operation row before contacting PayPal and persist unknown/non-final results as `RECONCILIATION_REQUIRED`. Default API keys are stable by payment and action, so retries cannot silently become new operations. The test covers fallback reservation only; PostgreSQL races and provider timeout recovery remain unverified.
- See [RELEASE_REMEDIATION_TRACKER.md](RELEASE_REMEDIATION_TRACKER.md) for unresolved release priorities.

## Final verification after changes

| Check | Result | Evidence and limit |
|---|---|---|
| `npm.cmd test` | PASSED, 26/26 | Includes mocked session checks, logout revocation helper, password/worker/origin, webhook fail-closed, tenant filtering, operation reservation fallback, and unresolved-intervention capture tests. Scenario tests use local mock adapters. No real payment was made. |
| `npm.cmd run lint` | PASSED with warnings | 0 errors, 94 warnings, primarily unused variables. |
| `npm.cmd run build` | PASSED after operation reservation changes | Next.js 16 production build and TypeScript completed; merchant routes are dynamic behind cookie validation. |
| `npx.cmd prisma validate` | PASSED | Validated with a temporary non-connecting placeholder `DATABASE_URL`; no database connection or migration was run. |
| `npm.cmd audit --omit=dev --audit-level=high` | PASSED, 0 reported | Production dependencies only. |
| Worker startup | STARTED | `src/server/worker/entry.ts` started in local demo mode and was interrupted before its first 30-second sweep. No database/provider work verified. |
| Secret scan | PASSED for current tree | No tracked `.env*` files or matching active API/private-key patterns found. Git history contains fixed demo values; rotate if they were ever used outside local demo data. |
| `git diff --check` | PASSED | No whitespace errors after final edits. |
| PostgreSQL integration / migrations | NOT RUN | No connection supplied. |
| PayPal Sandbox order, approval, authorization, capture, void, webhooks | BLOCKED | No credentials or sandbox accounts supplied; buyer approval UI is not implemented. |
| E2E browser suite, isolation, external AI/sponsor calls | NOT RUN | Current automated demonstration tests are in-process simulations. |
| Screenshots / video / public repository | NOT RUN | No verified transaction exists to capture. Screenshot capture was blocked because no browser surface was available (`iab` unavailable); repository was not published. |
