# PayPal AI Hackathon: judge setup and project notes

Updated 2026-11-12. Confirm all claims against the build and provider behavior you submit. See the [official hackathon rules](https://paypalaihackathon.devpost.com/rules) for current submission and judging requirements.

## Project

**Scam Brake** is a merchant checkout prototype for helping customers review possible social-engineering pressure before a PayPal authorization is captured. Its flow is designed to connect PayPal buyer approval and authorization with risk assessment, a customer-bound intervention, and an explicit continue-or-cancel decision.

The AI assistant uses conversation history, risk indicators, and retrieved local evidence to form a structured response. It is intended to help the customer think through the situation; it is not a definitive fraud classifier and cannot guarantee that a payment is safe.

## Tools used

- **PayPal Sandbox:** PayPal JavaScript SDK checkout plus server-side Orders v2 and Payments v2 operations. Configure Sandbox credentials to run the provider flow. Live PayPal is not supported.
- **OpenAI-compatible API:** Optional structured chat completion for intervention responses, configured with `OPENAI_API_KEY` and `OPENAI_MODEL`.
- **Astropods:** Optional intervention provider, configured with `ASTROPODS_API_KEY` and `ASTROPODS_AGENT_ID`.
- **Local evidence search:** Elastic adapter with local pattern data available as fallback; external Elastic behavior requires provider configuration.
- **Next.js, React, and TypeScript:** Web app and server route handlers.
- **Prisma and PostgreSQL:** Persistent customer, checkout, payment, intervention, operation, and webhook records.

When no AI provider key is configured or a provider response is invalid/unavailable, the app can use a deterministic local fallback. Identify that behavior as a local fallback; do not call it an OpenAI or Astropods result. Local payment adapter tests are simulations, not PayPal Sandbox transactions.

## Run locally

### Requirements

- Node.js 22 or newer
- npm
- PostgreSQL
- PayPal Sandbox app credentials and buyer/seller test accounts for the actual checkout flow
- An AI provider key for an external AI response

### Install and configure

```powershell
npm install
Copy-Item .env.example .env
```

Set `DATABASE_URL` to a reachable PostgreSQL database. Set unique random values for `SESSION_SECRET` and `INTERNAL_WORKER_SECRET` (at least 32 bytes each). For a real Sandbox checkout, set:

```text
PAYMENT_MODE=paypal_sandbox
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=<sandbox-client-id>
PAYPAL_CLIENT_SECRET=<sandbox-secret>
PAYPAL_WEBHOOK_ID=<sandbox-webhook-id>
CHECKOUT_MERCHANT_ID=<database-merchant-id>
```

Keep credentials in the local `.env` or deployment secret store. Never commit them or place them in screenshots, video, or public setup instructions. Use only PayPal Sandbox accounts; the application rejects live PayPal mode.

Apply the schema and run the app:

```powershell
npx prisma migrate deploy
npm run prisma:generate
npm run dev
```

Open `http://localhost:3000`. Use the checkout route and a PayPal Sandbox buyer account. Follow the customer intervention if the risk policy requires one. The intervention's continue/cancel actions are customer decisions; do not claim a successful capture or void unless the app and PayPal Sandbox confirm it.

To use the external AI path, configure either `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) or `ASTROPODS_API_KEY` (and optionally `ASTROPODS_AGENT_ID`). Do not put actual keys in public judge instructions. A no-key run may use the deterministic local fallback.

## Checks

```powershell
npm test
npm run lint
npm run build
```

The test suite contains local simulations. PostgreSQL integration coverage is meaningful only when run with a reachable disposable database and all required migrations applied. A skipped or unreachable-database test is not PostgreSQL verification. See [RELEASE_REMEDIATION_TRACKER.md](RELEASE_REMEDIATION_TRACKER.md) and [SECURITY_VERIFICATION.md](SECURITY_VERIFICATION.md) for recorded results and limitations.

## Verification status and limitations

At the last recorded verification, the configured PostgreSQL host could not be reached from the development environment, so migrations and database-backed integration tests did not complete. No PayPal Sandbox transaction or webhook delivery was recorded as verified. Before describing those paths as working, rerun them against a reachable database and PayPal Sandbox accounts and update the evidence. Do not use real payment credentials or production payments for judging.

This prototype is not a certified fraud-detection service. Its risk rules and AI output can be wrong. The customer should remain in control, verify claims independently, and never share passwords, one-time codes, or payment credentials in the chat.

## Submission checklist

- Public source repository with this README, setup steps, and root MIT license.
- Working demo judges can access, or complete reproducible local instructions and required non-production test access.
- Project description names PayPal and the AI tools actually used and explains their roles.
- Video under three minutes, hosted publicly on YouTube, showing the real app running on its intended device.
- No secrets, private customer details, fabricated provider results, or unlicensed music/media in the submission.
