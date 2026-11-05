# SCAM BRAKE: SPONSOR & PARTNER INTEGRATION SPECIFICATION

This document outlines the architectural role, integration points, API contracts, and runtime interfaces for all 11 technology partners and sponsors powering Scam Brake.

---

## 1. Sponsor Matrix Summary

| Sponsor / Partner | Category | Core Role in Scam Brake | Integration Mechanism | Status |
|---|---|---|---|---|
| **PayPal** | Payments / Core Platform | Pre-capture authorization hold, void, capture | PayPal Orders & Payments API v2 (`intent: AUTHORIZE`) | Ready |
| **AG Grid** | Frontend Data Engine | High-density financial ledger, sorting, filtering | `ag-grid-react` & `PaymentTable` | Ready |
| **APIMatic** | Developer Tooling | OpenAPI spec generation, SDK generation for merchants | OpenAPI 3.1 Spec (`/merchant/docs`) | Ready |
| **Astropods** | Edge Compute | Edge routing of pre-capture authorization hooks | Distributed Edge Pod Simulation | Ready |
| **Bryntum** | Interaction / Timelines | Pre-capture hold window countdowns & Gantt timers | Real-time hold window scheduler | Ready |
| **Channel3** | Risk Intelligence | Deep telemetry enrichment & phone spoofing detection | Risk pipeline hook (`sig_source: CHANNEL3`) | Ready |
| **Elastic** | Search & Vector Match | Semantic clustering against extortion scripts & vectors | Vector pattern engine (`cluster-irs-urgent-wire`) | Ready |
| **Kernel** | Identity & Anti-Spoofing | Certified public directory verification & switchboards | Out-of-band verification (`/intervention/verify`) | Ready |
| **Postman** | API Governance | Test collections, contract verification, CI mocks | Postman Collections in Docs | Ready |
| **Render** | Cloud Hosting | Zero-downtime serverless runtime, webhook receiver | Production environment orchestrator | Ready |
| **Zapier** | Automation & Relay | Outbound SMS & webhook dispatch to trusted contacts | Twilio / Zapier SMS relay | Ready |

---

## 2. Technical Integration Deep-Dives

### 1. PayPal (Core Payment Infrastructure)
- **API Version:** PayPal Orders API v2 & Payments API v2
- **Required Order Creation Configuration:**
  ```json
  {
    "intent": "AUTHORIZE",
    "purchase_units": [
      {
        "reference_id": "SB-2026-8819",
        "amount": { "currency_code": "USD", "value": "1500.00" }
      }
    ]
  }
  ```
- **Lifecycle Endpoints:**
  - `POST /v2/checkout/orders/{id}/authorize`: Creates the hold.
  - `POST /v2/payments/authorizations/{authorization_id}/capture`: Final settlement upon verified safety.
  - `POST /v2/payments/authorizations/{authorization_id}/void`: Pre-capture void terminating hold ($0 fee, 0 chargeback).

### 2. Channel3 (Social Engineering & Telemetry Intelligence)
- **Role:** Enriches incoming checkout telemetry with telephony signals (active ongoing voice call, caller reputation, VOIP spoof likelihood).
- **Payload Contract:**
  ```typescript
  interface Channel3EnrichmentPayload {
    checkoutSessionId: string;
    customerPhoneHash: string;
    concurrentActiveCallDetected: boolean;
    callerReputationScore: number; // 0 to 1
    impersonationKeywordsMatched: string[];
  }
  ```

### 3. Elastic (Semantic Vector & Extortion Cluster Match)
- **Role:** High-velocity vector index comparing voluntary customer dialogue against known fraud scripts (e.g. IRS tax warrants, fake bank transfers, remote AnyDesk extortion).
- **Index:** `scambrake-threat-vectors-2026`
- **Output:** Returns cluster match name, similarity score (0.0 to 1.0), and recommended policy.

### 4. Kernel (Independent Public Directory Verification)
- **Role:** Bypasses caller ID spoofing by providing certified public telephone numbers and official domains for government and financial institutions.
- **Workflow:** When customer mentions "IRS", "Sheriff", or "Chase", Scam Brake triggers Kernel lookup to display authentic switchboard phone numbers.

### 5. Zapier / Twilio (Trusted Contact Relay)
- **Role:** Delivers outbound SMS advisories to registered trusted contacts only after explicit customer opt-in.
- **Event:** `webhook.zapier.com/hooks/catch/scambrake/trusted-contact-alert`

