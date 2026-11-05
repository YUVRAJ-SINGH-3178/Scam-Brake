# SCAM BRAKE — SPONSOR & PARTNER INTEGRATION MATRIX

This document details the exact status, capabilities, and authentication requirements for all 11 hackathon sponsors and technology partners powering Scam Brake.

---

## 1. Complete Sponsor Classification Matrix

| Sponsor / Partner | Category | Status Classification | Runtime Interface / Location | Authentication Required | Notes |
|---|---|---|---|---|---|
| **PayPal** | Core Payment Infrastructure | `REAL_INTEGRATION` (Sandbox) / `MOCK_MODE` (Deterministic Simulator fallback) | `src/server/paypal/client.ts` | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` | Official Sandbox endpoint (`api-m.sandbox.paypal.com`). Orders v2 `intent=AUTHORIZE`. |
| **AG Grid** | Frontend Data Engine | `REAL_INTEGRATION` | `src/components/merchant/PaymentTable.tsx` | AG Grid Community (Open Source) | Real-time sorting, search, risk badge filtering, pagination, and data export. |
| **APIMatic** | API Tooling & Documentation | `REAL_INTEGRATION` | `docs/openapi.json`, `/merchant/docs` | OpenAPI 3.1 Spec | Version-controlled OpenAPI 3.1 specification and contract viewer. |
| **Astropods** | Edge Compute / AI Agent | `MOCK_MODE` (Deterministic Fallback) / `REAL_INTEGRATION` (when Key is set) | `src/server/ai/agent.ts` | `ASTROPODS_API_KEY` | Empathetic conversational safety check-in agent with structured signal extraction. |
| **Bryntum** | Interaction & Scheduler | `MOCK_MODE` | `src/server/bryntum/scheduler.ts` | Commercial License (Not supplied in environment) | Fraud response scheduling, investigator availability, and case allocations. |
| **Channel3** | Commodity & Telemetry Enrichment | `MOCK_MODE` (Deterministic Fallback) / `REAL_INTEGRATION` (when Key is set) | `src/server/channel3/client.ts` | `CHANNEL3_API_KEY` | Detects untraceable gift cards and rapid P2P liquidity resale vectors. |
| **Elastic** | Search & Vector Match | `MOCK_MODE` (Local Hybrid Fallback) / `REAL_INTEGRATION` (when Key is set) | `src/server/elastic/search.ts` | `ELASTICSEARCH_URL`, `ELASTICSEARCH_API_KEY` | Curated extortion scripts and semantic vector clustering against IRS/Bank scams. |
| **Kernel** | Out-of-Band Directory Verification | `MOCK_MODE` (Certified Local Registry) / `REAL_INTEGRATION` (when Key is set) | `src/server/kernel/client.ts` | `KERNEL_API_KEY` | Certified public directory telephone lookup to bypass caller ID spoofing with SSRF defense. |
| **Postman** | API Testing & Governance | `REAL_INTEGRATION` | `docs/postman_collection.json`, `docs/postman_environment.json` | None (Environment template provided) | 8 comprehensive request tests covering the entire pre-capture lifecycle and webhooks. |
| **Render** | Cloud Hosting & Workflows | `CONFIGURED_UNVERIFIED` (IaC Ready) | `render.yaml`, `src/server/worker/scheduler.ts` | Render Account | Complete `render.yaml` with Web service, managed PostgreSQL, and background worker. |
| **Zapier** | Merchant Automation Relay | `MOCK_MODE` (HMAC Signed) / `REAL_INTEGRATION` (when Webhook is set) | `src/server/zapier/relay.ts` | `ZAPIER_WEBHOOK_URL`, `ZAPIER_WEBHOOK_SECRET` | Outbound HMAC-SHA256 signed event webhook dispatch for trusted contact alerts and fraud voids. |

---

## 2. Operational Health Verification Endpoint

The current health and operational status of every sponsor integration can be queried via:
```bash
GET /api/health
```

Sample output:
```json
{
  "status": "HEALTHY",
  "service": "SCAM_BRAKE_PAYMENT_PROTECTION",
  "sponsors": {
    "paypal": "MOCK_MODE",
    "ag_grid": "REAL_INTEGRATION",
    "apimatic": "REAL_INTEGRATION",
    "astropods": "MOCK_MODE",
    "bryntum": "MOCK_MODE",
    "channel3": "MOCK_MODE",
    "elastic": "LOCAL_HYBRID_FALLBACK",
    "kernel": "MOCK_MODE",
    "postman": "REAL_INTEGRATION",
    "render": "CONFIGURED_UNVERIFIED",
    "zapier": "MOCK_MODE"
  }
}
```

