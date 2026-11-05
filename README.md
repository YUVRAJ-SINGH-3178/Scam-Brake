# SCAM BRAKE

**Stop. Verify. Stay protected.**

> AI-Powered Pre-Capture Payment Protection Protocol for PayPal Commerce.

Scam Brake introduces an empathetic verification hold between PayPal payment authorization and final settlement capture. It is purpose-built to safeguard consumers from Authorized Push Payment (APP) fraud and social engineering coercion (e.g. IRS impersonation, remote desktop tech support, and retail gift card scams).

---

## 1. Core Innovation: The Pre-Capture Protection Model

Traditional fraud engines operate post-capture: funds settle into the merchant's balance, and when a manipulated victim realizes the deceit hours later, they face 14 to 90 day chargeback battles, non-refundable dispute fees ($15 to $35), and likely claim denial under the "Authorized Payment Rule."

**Scam Brake inverts this model:**
1. Orders are created with PayPal Orders v2 `intent = 'AUTHORIZE'`.
2. Funds are temporarily held in the consumer's wallet, but **never captured**.
3. Real-time telemetry evaluates digital voucher risk and remote screen sharing indicators.
4. If risk is elevated, an unhurried, calm conversational check-in begins.
5. Independent out-of-band verification (Kernel public switchboard) breaks psychological isolation.
6. If coercion is detected or the customer aborts, Scam Brake issues a **pre-capture void** (`POST /v2/payments/authorizations/{id}/void`).
7. **Result:** $0 in processing fees, 0 chargebacks, zero dispute friction, and 100% preservation of customer balance.

---

## 2. Technology Stack & Sponsor Integrations

- **Frontend:** Next.js 16 (App Router, Turbopack, React 19), Tailwind CSS v4, Switzer & Commit Mono typography, AG Grid.
- **Backend:** Next.js Server Modules, TypeScript, Zod schema validation, authoritative payment state machine.
- **Database:** PostgreSQL with Prisma ORM (`prisma/schema.prisma`) and fallback transactional repository.
- **Payment Infrastructure:** PayPal Orders API v2 & Payments API v2 (`intent = 'AUTHORIZE'`).
- **AI Agent:** Empathetic Intervention Agent (Astropods API / OpenAI / deterministic fallback).
- **Search & Vector Grounding:** Elastic threat vector clustering (`scambrake-threat-vectors-2026`).
- **Identity & Anti-Spoofing:** KERNEL out-of-band public directory verification.
- **Commodity Intelligence:** Channel3 product & gift card liquidity enrichment.
- **Operations Scheduling:** Bryntum investigation response scheduler.
- **API Governance:** APIMatic OpenAPI 3.1 specification (`docs/openapi.json`).
- **API Testing:** Postman automated test collection (`docs/postman_collection.json`).
- **Cloud Infrastructure:** Render Web Services, PostgreSQL, and background worker (`render.yaml`).
- **Automation Relay:** Zapier HMAC-signed outbound merchant automation relay.

---

## 3. Quickstart & Local Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YUVRAJ-SINGH-3178/Scam-Brake.git
cd scambrake
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
Populate your PayPal Sandbox credentials if available. The system automatically runs high-fidelity deterministic simulators if credentials are not yet supplied.

### 3. Generate Prisma ORM Client & Seed Data
```bash
npm run prisma:generate
```

### 4. Run the Automated Test Suite (15/15 Tests Passing)
```bash
npm test
```

### 5. Start the Application
```bash
npm run dev
# Or production build & start:
npm run build
npm run start
```
Visit `http://localhost:3000` to access the application.

---

## 4. Key Application Routes

- **Public Marketing Website:**
  - [`/`](http://localhost:3000/): Master homepage with live interactive interface fragment.
  - [`/how-it-works`](http://localhost:3000/how-it-works): 5-phase pre-capture verification protocol.
  - [`/merchant-integration`](http://localhost:3000/merchant-integration): Three-endpoint developer integration guide.
  - [`/security`](http://localhost:3000/security): Anti-surveillance tenets and data boundaries.
  - [`/demo`](http://localhost:3000/demo): Interactive multi-scenario walk-through.

- **Customer Payment Protection Experience:**
  - [`/checkout`](http://localhost:3000/checkout): Protected merchant checkout simulation.
  - [`/checkout/authorizing`](http://localhost:3000/checkout/authorizing): Pre-capture hold creation visualization.
  - [`/intervention/chat?paymentId=pay_sb_881901`](http://localhost:3000/intervention/chat?paymentId=pay_sb_881901): Conversational safety check-in.
  - [`/intervention/verify`](http://localhost:3000/intervention/verify): Kernel certified public directory switchboard.
  - [`/intervention/trusted-contact`](http://localhost:3000/intervention/trusted-contact): Explicit opt-in trusted contact advocacy.
  - [`/intervention/summary?paymentId=pay_sb_881901`](http://localhost:3000/intervention/summary?paymentId=pay_sb_881901): Printable Protected Payment Certificate.

- **Merchant Operations Application:**
  - [`/merchant`](http://localhost:3000/merchant): Operations dashboard answering *"Which payments need attention now?"*
  - [`/merchant/payments`](http://localhost:3000/merchant/payments): Full financial ledger with AG Grid filtering and CSV export.
  - [`/merchant/investigations/pay_sb_881901`](http://localhost:3000/merchant/investigations/pay_sb_881901): Forensic investigation dossier with AI hypothesis and telemetry.
  - [`/merchant/audit-log`](http://localhost:3000/merchant/audit-log): Tamper-evident SHA-256 Merkle-sealed state audit log.
  - [`/merchant/policies`](http://localhost:3000/merchant/policies): Hold duration and risk threshold sliders.
  - [`/merchant/integrations`](http://localhost:3000/merchant/integrations): Live health and latency of all 11 sponsor integrations.
  - [`/merchant/docs`](http://localhost:3000/merchant/docs): OpenAPI 3.1 specification viewer.

---

## 5. Primary Verification Scenarios

### Demo 1: The $2,000 IRS Tax Official Gift-Card Scam (Void Flow)
1. Customer visits `/checkout` and attempts to buy $2,000 in Apple gift cards while on a call with a fake IRS caller.
2. Scam Brake detects high-velocity digital card telemetry and sets `intent = 'AUTHORIZE'`.
3. PayPal places an uncaptured hold on funds.
4. Customer enters `/intervention/chat` and discloses that an agent threatened arrest.
5. AI detects `AUTHORITY_IMPERSONATION`, checks Elastic threat vectors, and offers Kernel directory lookup (`1-800-829-1040`).
6. Customer clicks *"Cancel & Void Payment"*.
7. PayPal executes `POST /v2/payments/authorizations/{id}/void`.
8. $2,000 saved, $0 merchant fee, 0 chargeback penalties.

### Demo 2: Legitimate $1,299 MacBook Air Purchase (Capture Flow)
1. Customer initiates $1,299 purchase for personal use.
2. PayPal authorizes hold.
3. Telemetry confirms clean parameters.
4. Customer confirms purchase volition.
5. Scam Brake executes `POST /v2/payments/authorizations/{id}/capture`.
6. Webhook reconciles payment as `CAPTURED`.

---

## 6. Complete Documentation Directory

- [Architecture Specification](docs/ARCHITECTURE.md)
- [Database & Prisma Schema](docs/DATABASE.md)
- [Payment Lifecycle (Sequence Diagrams)](docs/PAYMENT_LIFECYCLE.md)
- [PayPal Sandbox Setup Guide](docs/PAYPAL_SANDBOX_SETUP.md)
- [AI Engine & Threat Taxonomy](docs/AI_ENGINE.md)
- [Astropods Agent Integration](docs/ASTROPODS_INTEGRATION.md)
- [Elastic Knowledge Engine](docs/ELASTIC_KNOWLEDGE_ENGINE.md)
- [KERNEL Verification System](docs/KERNEL_VERIFICATION.md)
- [Sponsor Integrations Matrix](docs/SPONSOR_INTEGRATIONS.md)
- [REST API Reference](docs/API_REFERENCE.md)
- [Security & Threat Model](docs/SECURITY.md)
- [Test Plan & Verification Matrix](docs/TEST_PLAN.md)
- [Render Deployment Guide](docs/DEPLOYMENT.md)
- [Render Background Workflows](docs/RENDER_WORKFLOWS.md)
- [Postman Collection Guide](docs/POSTMAN_COLLECTION.md)
- [OpenAPI 3.1 Specification](docs/openapi.json)
