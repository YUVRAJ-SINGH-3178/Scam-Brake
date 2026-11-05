# Scam Brake

**Stop. Verify. Stay protected.**

Scam Brake is a prototype for merchant-integrated payment checks intended to give customers time to verify a suspicious purchase before a merchant captures a PayPal authorization. The current repository is an engineering prototype. It is **not ready to handle payments**: checkout is disabled, no PayPal Sandbox transaction has been verified, and merchant login is not backed by production account provisioning or session revocation.

## Current release status

**NO-GO for payment use or hackathon claims of a working payment lifecycle.** The adapter has PayPal Sandbox REST calls, but buyer approval, checkout persistence, login/session issuance, complete tenant isolation, and durable idempotency are incomplete. The in-app scenario tests use deterministic simulations and are not PayPal transactions.

See [the final audit baseline](docs/FINAL_AUDIT_BASELINE.md), [security verification matrix](docs/SECURITY_VERIFICATION.md), and [sponsor status](docs/SPONSOR_INTEGRATIONS.md).

## What is present

- Next.js 16 App Router and React 19 interface.
- Prisma schema and PostgreSQL migration.
- Risk scoring and AI/provider adapters with local fallbacks.
- PayPal Orders v2 and Payments v2 adapter methods restricted to Sandbox.
- Payment state machine, webhook verification adapter, and deterministic tests.
- Render web and worker configuration.

Several screens still contain prototype content. Do not interpret seeded payments, the interactive demo, or unit-test outcomes as real customer or provider activity.

## Local setup

Requirements: Node.js 22+, npm, and PostgreSQL for persistent operation.

```powershell
npm install
Copy-Item .env.example .env
```

Set a unique random `SESSION_SECRET` and `INTERNAL_WORKER_SECRET` of at least 32 bytes. Use `PAYMENT_MODE=demo` for local-only adapter simulations. `PAYMENT_MODE=paypal_sandbox` requires PayPal Sandbox app credentials and a webhook ID. Live PayPal is rejected.

With a local PostgreSQL database configured in `DATABASE_URL`:

```powershell
npx prisma migrate deploy
npm run prisma:generate
npm run dev
```

For an explicitly opted-in local demo merchant account, set `DEMO_AUTH_ENABLED=true` and provide a unique `DEMO_ADMIN_PASSWORD` of at least 16 characters, then run `npm run prisma:seed`. The seed script refuses production and no default password is embedded in the repository.

The application may start without PostgreSQL in local development, but then uses process-memory seed data. That mode is not persistent and cannot validate the payment flows. Production refuses that fallback.

## Checks

```powershell
npm test
npm run lint
npm run build
npm.cmd audit --omit=dev --audit-level=high
```

Tests currently exercise deterministic adapter simulations. Passing them does not verify PayPal, PostgreSQL, webhooks, AI vendors, or sponsor services. Record each command's actual result when rerunning; see the audit report for the baseline.

## PayPal Sandbox

Configure only Sandbox app credentials. At present, the checkout UI and `/api/checkout/create` and `/api/checkout/authorize` endpoints are intentionally unavailable because the browser-side buyer approval flow and server-side approval validation are not implemented. Do not attempt to bypass these gates or call the payment adapter as though a customer approved a purchase.

## Deployment

`render.yaml` describes a web service, PostgreSQL instance, and worker. Deploy only after completing the release blockers in the final audit. The worker source entry is `src/server/worker/entry.ts`; Render uses `npm run worker`. Migrations, environment validation, authenticated customer/merchant flows, and external provider checks still require deployment verification.

## Security and limitations

- Sandbox only; no live payment mode is supported.
- No merchant login or customer-bound session issuer is implemented.
- Protected payment routes fail closed without a signed session, so the UI cannot currently perform merchant operations.
- Checkout, customer intervention, trusted-contact consent, and notifications return unavailable until identity and payment verification are implemented.
- Development fallback storage is in-memory. Durable, cross-instance locks and idempotency are incomplete.
- No security certification or guarantee of scam detection is claimed.

## Submission materials

The release audit records the current demo limitations and sponsor evidence. No verified payment screenshots or video exist yet. Do not publish as a functioning payment product until the release recommendation changes from NO-GO.
