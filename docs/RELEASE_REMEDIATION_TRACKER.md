# Final release remediation tracker

Updated: 2026-11-07. Scope follows the requested priority order. This tracker records local implementation separately from external verification.

| Priority | Work | Current state | Evidence / remaining gate |
|---|---|---|---|
| P0 | PostgreSQL `recordOperation()` and capture/void | Implemented; the successful update returns directly and database failures fail closed. Integration test uses actual Prisma records and the demo provider adapter. | `tests/integration/paymentOperationsPostgres.test.mjs`. Migration and test were attempted after the user confirmed the DB is disposable, but the configured PostgreSQL host could not be reached from this environment. |
| P0 | PayPal buyer approval | Implemented using the existing checkout view and PayPal JS SDK authorization intent. Server creates the order, retrieves authoritative approval details, checks buyer/order/amount/reference, then authorizes and persists the result. | Requires Sandbox credentials and buyer/seller accounts. No provider transaction has been verified. |
| P0 | Customer decision management | Implemented expiring customer-bound hashed session and explicit proceed/cancel decision endpoints; decisions are persisted and capture requires the recorded proceed outcome. | Database migration and authenticated HTTP/browser flow need integration verification. |
| P0 | Database consistency | Checkout/order, authorization, capture, intervention, and conversation writes use Prisma paths. Webhook capture reconciliation verifies provider state and persists capture/authorization relations. | Needs migration and real database-backed integration execution; payment state changes and related writes have not all been fault-injection tested. |
| P1 | Concurrency and webhooks | Capture/void reserve durable unique operation keys. Webhooks use atomic unique event claims, retain verified payloads, recover failed/stale claims, verify provider resource state, and reconcile to stored payments. | PostgreSQL race/restart tests, PayPal signature delivery, retry, duplicate, and out-of-order Sandbox evidence remain. Provider calls across multiple app instances are not verified. |
| P1 | AI integration | Customer chat now loads persisted conversation history, supplies retrieved local evidence, validates structured output, and persists both sides of the conversation. | External AI provider, grounding quality, rate limits/timeouts, and independently repeatable customer workflow remain unverified. |
| P1 | Worker and policy | Merchant-scoped risk policy is persisted; timeouts are measured from intervention start; outcomes distinguish scam confirmation, customer cancellation, timeout, and reconciliation. | PostgreSQL worker execution, multi-instance behavior, provider recovery, and policy cases need integration coverage. |
| P2 | Submission readiness | `.env.example`, README, migrations, and security/release docs are maintained. | PostgreSQL migration/tests and security tests remain to verify. No license selected, no verified demo video, and no verified sponsor evidence. Do not claim these as complete. |

## Verification recorded for this remediation

- `npm.cmd test`: 27 passed, 0 failed, 1 PostgreSQL test skipped because the process did not expose `DATABASE_URL`. The suite logged that the `.env` database endpoint was unreachable for tests using the development fallback.
- Explicit DB integration run (`node --env-file=.env --experimental-strip-types tests/runAllTests.mjs`): 27 passed, 1 failed at the PostgreSQL reachability precondition; no database fixtures were created.
- `npx.cmd tsc --noEmit --pretty false`: passed after final webhook changes.
- `npx prisma validate`: passed after the schema changes.
- `npx prisma migrate deploy`: attempted; Prisma schema engine failed before applying migrations because the database endpoint was unreachable.
- `npx prisma generate`: passed on retry after a transient Windows `EPERM` while renaming the generated query engine file.
- Targeted ESLint for the PayPal webhook route, repository, and PayPal client: 0 errors, 1 existing unused `METRICS` warning in the repository.
- `git diff --check`: rerun before handoff.
- Hosted database: user confirmed it is disposable. It appears configured with an internal host that is unreachable from this machine; no migration was applied.
- PayPal Sandbox lifecycle and live webhook delivery: not run; Sandbox credentials/accounts are not available in this session.
- Lint: not recorded as passing; the targeted run stalled without output.

## Release disposition

**NO-GO for payment use and for claims of a verified payment lifecycle.** Implementation is materially more complete, but database execution, provider evidence, cross-instance behavior, and submission artifacts remain release gates. No migration has been applied yet.
