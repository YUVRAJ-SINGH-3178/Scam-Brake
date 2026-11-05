# SCAM BRAKE: PRODUCT SPECIFICATION (PHASE 1)

> **Status (2026-11-05):** Historical product concept, not a statement of shipped capability. Metrics, outcomes, sponsor references, and provider lifecycle descriptions below are illustrative and unverified. See [FINAL_AUDIT_BASELINE.md](FINAL_AUDIT_BASELINE.md).

**Product Name:** SCAM BRAKE  
**Tagline:** Stop. Verify. Stay protected.  
**Product Category:** AI-powered, merchant-integrated payment protection.  
**Core Mechanism:** Pre-capture PayPal authorization verification hold against social-engineering coercion.

---

## 1. Executive Summary & Problem Space

### 1.1 The Vulnerability
Modern fraud defense has excelled at detecting unauthorized account takeover (credential theft, stolen cards, session hijacking). However, the fastest-growing financial crime globally is **Authorized Push Payment (APP) and Voluntary Coercion Fraud**.

In these schemes:
- The customer genuinely enters their own credentials and MFA.
- The customer approves the transaction in their own PayPal wallet.
- The fraud occurs because the customer is being manipulated through psychological coercion, urgency, threats, or false authority (e.g. IRS tax warrants, fake bank fraud departments, remote desktop tech support scams, family emergency extortion).

Traditional fraud filters classify these payments as "low risk" because the device, IP, and credentials match the genuine account holder. The money is captured instantly, and once the victim realizes the deceit hours later, the funds have been laundered through digital store cards or untraceable corridors.

### 1.2 The Solution
**Scam Brake** introduces a calm verification stage between PayPal payment authorization and final settlement capture.
- **Authorization** places a temporary hold on the customer's funds without debiting or completing settlement.
- If real-time behavioral and checkout signals detect social engineering or extortion markers, Scam Brake **pauses the capture trigger**.
- The customer is presented with an empathetic, non-alarmist conversational check-in.
- Out-of-band verification tools (Kernel public directories, registered trusted contact advocacy) break the psychological isolation demanded by scammers.
- If coercion is confirmed or the customer decides to abort, the merchant executes a **pre-capture void** via the PayPal Orders API (`/v2/payments/authorizations/{id}/void`).
- **Result:** $0 in transaction fees, 0 chargeback penalties, zero dispute friction, and 100% preservation of customer capital.

---

## 2. Product Boundaries & Non-Negotiable Tenets

To ensure strict compliance with privacy standards, payment networks, and ethical AI guidelines, Scam Brake enforces the following hard boundaries:

1. **Merchant-Integrated Protected Checkout:** Scam Brake is embedded by participating merchants via the PayPal JavaScript SDK and server-side authorization webhooks. It is **not** a universal browser extension or unauthorized interceptor.
2. **Selective Surveillance Rejection:** Scam Brake does not monitor every payment indiscriminately, does not record keystrokes outside checkout, and does **not** listen in on phone calls.
3. **Voluntary Evidence Supply:** All conversational inputs and situational details are provided voluntarily by the customer during the safety check-in.
4. **Human Agency Priority:** AI never unilaterally authorizes, captures, or voids a payment without policy rules and customer agency.
5. **Pre-Capture Distinction:** An authorization is a temporary hold on available balance, not a settled payment. Voiding an uncaptured authorization terminates the hold instantly without refund delays or card network dispute fees.

---

## 3. The Three Unified Experiences

Scam Brake delivers three distinct experiences connected by a single art-directed visual identity:

### A. Public Marketing Website (`/`, `/how-it-works`, `/merchant-integration`, `/security`, `/faq`, `/demo`)
- **Tone:** Institutional trust, editorial rigor, financial authority (Direction: `editorial-report`).
- **Core Visual Motif:** The Authorization Path (`CHECKOUT → AUTHORIZED → REVIEW → DECISION → CAPTURE / VOID`).
- **Target Audience:** Enterprise merchants, payment operations leads, risk directors, and consumer advocacy groups.

### B. Merchant Operations Application (`/merchant/*`)
- **Tone:** High-density, framed-sheet financial control room (Direction: `framed-sheet`).
- **Visual Budget:** Strict Mercury palette, $<3\text{--}5\%$ color saturation on chrome, tabular numbers right-aligned, typography-first KPIs.
- **Key Modules:**
  - **Ledger:** AG Grid-style table with live holds, captured volume, and void records.
  - **Interventions Queue:** Countdown timers, severity filters, active session links.
  - **Investigation Case View:** Multi-tab forensic view (AI hypothesis, dialogue transcript, Channel3 telemetry, Kernel verification audit).
  - **Risk Intelligence:** 5-scheme threat taxonomy, extortion script citations, countermeasure protocols.
  - **Simulator Center:** Pre-configured scenarios to test authorization holds.
  - **Analytics:** Recharts-powered monthly efficacy, loss prevention, and resolution velocity.
  - **Cryptographic Audit Log:** Tamper-evident SHA-256 state seals with raw payload inspection.

### C. Customer Payment Protection Experience (`/checkout/*`, `/intervention/*`)
- **Tone:** Empathetic, calm, non-alarmist, crystal clear.
- **Key Workflows:**
  - **Authorizing Hold:** Visual animation showing payment hold creation before capture.
  - **Safety Check-in:** Calm conversational dialogue questioning urgency and secrecy.
  - **Kernel Directory Verification:** Verified public switchboard phone lookup to bypass spoofing.
  - **Trusted Contact Outreach:** Explicit, opt-in consent before dispatching SMS to registered advocate.
  - **Customer Resolution:** One-click pre-capture void or confirmed capture with certificate generation.

---

## 4. Architectural Domain Model

```typescript
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type AuthorizationStatus = 'PENDING_REVIEW' | 'HOLD_ACTIVE' | 'CAPTURED' | 'VOIDED' | 'EXPIRED';
type InterventionStatus = 'NOT_REQUIRED' | 'ACTIVE_INTERVENTION' | 'VERIFIED_SAFE' | 'SCAM_CONFIRMED' | 'ABANDONED';
```

### Mathematical Reconciled Baseline:
- **Active Hold Volume:** $2,200.00 USD
- **Confirmed Voided Fraud:** $3,500.00 USD
- **Captured Legitimate:** $10,649.00 USD
- **Total Protected Volume:** $16,349.00 USD
- **False Positive Dispute Rate:** 0.00%

