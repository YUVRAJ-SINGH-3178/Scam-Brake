# SCAM BRAKE — SCREEN & STATE MATRIX

This matrix enumerates all application routes, user states, loading states, empty states, and error handling mechanisms across the three unified experiences.

---

## 1. Route & Experience Inventory

| Route | Experience | Direction | Key Purpose | Primary Actions |
|---|---|---|---|---|
| `/` | Marketing | `editorial-report` | Public narrative, mechanism explanation | Explore Demo, Review Spec, Start Checkout |
| `/how-it-works` | Marketing | `editorial-report` | 5-phase verification protocol | View Architecture, Learn Mechanics |
| `/merchant-integration` | Marketing | `editorial-report` | Developer integration & sponsor matrix | Inspect SDK code, Copy Webhook snippet |
| `/security` | Marketing | `editorial-report` | Privacy boundaries & anti-surveillance | Review Security Principles, Verify Opt-in |
| `/faq` | Marketing | `editorial-report` | Clear answers to consumer & merchant questions | Browse Categories, Read Policy |
| `/demo` | Marketing / Interactive | `editorial-report` | 3-scenario interactive simulator | Switch scenarios, Step through verification |
| `/checkout` | Customer Checkout | Brand Neutral | Simulated merchant shopping cart | Select PayPal, Start Pre-Capture Hold |
| `/checkout/authorizing` | Customer Hold | Framed Sheet | PayPal authorization & telemetry hold screen | Watch status, Transition to intervention |
| `/checkout/status` | Customer Hold | Framed Sheet | Order hold / capture confirmation | Return to store, View Merchant Ops |
| `/intervention` | Customer Safety | Safety Focus | Primary safety intervention hub | Chat with AI, Run Kernel check, Notify contact |
| `/intervention/chat` | Customer Safety | Safety Focus | Dedicated safety dialogue screen | Answer questions, Void payment, Confirm capture |
| `/intervention/verify` | Customer Safety | Safety Focus | Kernel out-of-band directory verification | Select agency, View official switchboard |
| `/intervention/trusted-contact` | Customer Safety | Safety Focus | Explicit-consent advocate outreach | Check consent box, Dispatch SMS, View reply |
| `/intervention/resolved` | Customer Safety | Safety Focus | Outcome confirmation screen | View Certificate, Return to Merchant Console |
| `/intervention/summary` | Customer Safety | Safety Focus | Printable Protected Payment Certificate | Print / Download Certificate, View Audit Hash |
| `/merchant` | Merchant Ops | `framed-sheet` | Operations control room & urgent actions | Review KPIs, Inspect active holds |
| `/merchant/payments` | Merchant Ops | `framed-sheet` | Full payments ledger with filter tabs | Search, Filter by risk, Export CSV |
| `/merchant/payments/[id]` | Merchant Ops | `framed-sheet` | Deep-link payment detail inspector | Manual Capture, Manual Void, View signals |
| `/merchant/interventions` | Merchant Ops | `framed-sheet` | Active interventions queue & countdowns | Open customer view, Investigate case |
| `/merchant/investigations/[id]` | Merchant Ops | `framed-sheet` | Forensic investigation dossier | AI hypothesis, Transcript, Channel3/Elastic |
| `/merchant/risk-intelligence` | Merchant Ops | `framed-sheet` | Threat taxonomy & script indicators | Explore threat schemes, View quotes |
| `/merchant/simulator` | Merchant Ops | `framed-sheet` | Scenario center to launch test holds | Run test orders, Reset ledger state |
| `/merchant/analytics` | Merchant Ops | `framed-sheet` | Efficacy analytics & Recharts volume graphs | Export monthly report, Inspect resolution times |
| `/merchant/audit-log` | Merchant Ops | `framed-sheet` | Cryptographic SHA-256 sealed audit ledger | Copy hashes, Inspect raw JSON payloads |
| `/merchant/policies` | Merchant Ops | `framed-sheet` | Hold duration & risk threshold sliders | Adjust hold window, Configure auto-void |
| `/merchant/integrations` | Merchant Ops | `framed-sheet` | 11 partner/sponsor technology connectors | Ping webhooks, Check latency, Open docs |
| `/merchant/docs` | Merchant Ops | `framed-sheet` | REST API contract viewer & code samples | Test endpoints, Copy request/response schemas |
| `/merchant/settings` | Merchant Ops | `framed-sheet` | Organization settings & production API keys | Copy API secret, Configure webhook URL |
| `/system-states` | System Utility | Design System | Interactive gallery of all 12 edge case states | Inspect error treatments & recovery rules |
| `/not-found` | Global Exception | Brand Neutral | 404 resource not located | Return to Home, Open Merchant Dashboard |

---

## 2. The 12 Standardized System States

1. **404 Not Found:** Handled via `src/app/not-found.tsx` with clear return pathways to marketing or merchant ops.
2. **403 Forbidden:** Displayed when an operator attempts to access unmasked PII or override unauthorized rules.
3. **500 Internal Error:** Handled via `src/app/error.tsx` with error logging, reassuring users that pre-capture holds remain safely preserved in PayPal.
4. **Offline / Connectivity Interrupted:** Illustrated in `/system-states` with client reconnect guidance.
5. **Gateway Timeout (504):** Handled gracefully when upstream PayPal API exceeds 10,000ms latency.
6. **Session Timeout:** Illustrated when customer leaves intervention inactive for >30 minutes.
7. **Invalid Checkout Intent:** Clear developer diagnostic when merchant sends `intent: CAPTURE` instead of `AUTHORIZE`.
8. **Authorization Expired:** Handled when 29-day PayPal hold window lapses without capture.
9. **Capture Rejection:** Displayed if customer funding source fails settlement at final capture.
10. **Empty Ledger Data:** Rendered in `PaymentTable` with a clean prompt to adjust filters.
11. **Telemetry Loading State:** High-precision pulse bar during risk scan (<800ms).
12. **Service Maintenance (503):** Status page link with fail-safe PayPal authorization hold preserving funds.

