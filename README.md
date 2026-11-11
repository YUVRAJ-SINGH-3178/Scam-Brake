# Scam Brake

**Stop. Verify. Stay protected.**

Scam Brake is a prototype for merchant-integrated payment checks that gives a customer time to review a suspicious purchase before a merchant captures a PayPal authorization. It remains an engineering prototype and is **not ready to handle payments**. Buyer approval, customer decisions, persistence, and webhook handling are implemented locally, but PostgreSQL and PayPal Sandbox verification are incomplete. Merchant account provisioning and MFA are also not production-ready.

## Release status

**NO-GO for payment use or claims of a verified payment lifecycle.** Checkout uses the PayPal JavaScript SDK and validates buyer approval against the authoritative order before server-side authorization. No PayPal Sandbox transaction or webhook delivery has been recorded as verified. See the [release tracker](docs/RELEASE_REMEDIATION_TRACKER.md), [security verification matrix](docs/SECURITY_VERIFICATION.md), and [sponsor evidence](docs/SPONSOR_INTEGRATIONS.md).

## What is present

- Next.js App Router and React interface.
- Prisma schema and PostgreSQL migrations.
- Risk scoring, AI/provider adapters, and local fallback data.
- PayPal Orders v2 and Payments v2 Sandbox adapter.
- Buyer approval flow, customer-bound intervention, payment state machine, webhook verification, and deterministic tests.
- Render web and worker configuration.

Several screens contain prototype content. Seeded payments and local scenario tests do not represent real customers or provider activity.

## Local setup

Requirements: Node.js 22+, npm, and PostgreSQL for persistent operation.

```powershell
npm install
Copy-Item .env.example .env
```

Set unique random `SESSION_SECRET` and `INTERNAL_WORKER_SECRET` values of at least 32 bytes. `PAYMENT_MODE=demo` is for local adapter simulation only. `PAYMENT_MODE=paypal_sandbox` requires Sandbox app credentials, `CHECKOUT_MERCHANT_ID`, a configured webhook ID, and a reachable PostgreSQL database. Live PayPal is rejected.

With a local PostgreSQL database configured in `DATABASE_URL`:

```powershell
npx prisma migrate deploy
npm run prisma:generate
npm run dev
```

For an explicitly opted-in local demo merchant account, set `DEMO_AUTH_ENABLED=true` and supply a unique `DEMO_ADMIN_PASSWORD` of at least 16 characters, then run `npm run prisma:seed`. The seed refuses production and has no embedded default password.

Without PostgreSQL, development uses process-memory seed data. That mode is not persistent and must not be used for checkout. Production refuses that fallback.

## Checks

```powershell
npm test
npm run lint
npm run build
npm.cmd audit --omit=dev --audit-level=high
```

The test suite includes deterministic simulations and a PostgreSQL capture/void integration test gated by `DATABASE_URL`. A skipped database test is not a pass. Local results do not verify PayPal Sandbox, live webhook delivery, AI vendors, or sponsor services. See the release tracker for recorded results.

## PayPal Sandbox

The existing checkout UI loads the PayPal JavaScript SDK with authorization intent. The server checks the approved order, persists the authorization, and starts a customer intervention when policy flags the payment. Use Sandbox buyer/seller accounts only. Do not enable payment handling until the migrations, database-backed capture/void tests, complete Sandbox lifecycle, and verified webhooks pass.

## Deployment and limitations

`render.yaml` describes a web service, PostgreSQL instance, and worker. Deploy only after release gates pass. No security certification or scam-detection guarantee is claimed. No verified payment screenshots or demonstration video exist yet. A public license also remains to be selected by the rights holder.
# derrr
# derrr
