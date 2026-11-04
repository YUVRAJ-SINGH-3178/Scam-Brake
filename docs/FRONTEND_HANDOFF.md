# SCAM BRAKE — FRONTEND HANDOFF & ARCHITECTURE SPECIFICATION

This document outlines the codebase architecture, folder structure, state management patterns, and implementation contracts for Phase 2 engineers.

---

## 1. Stack & Runtime Environment

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Language:** TypeScript 5.x (strict null checks, exhaustive union validation)
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss";`) with CSS variable tokens
- **Component Primitives:**
  - `Button`: Active click scale `0.97`, spring cubic-bezier, no gradient resting states.
  - `Badge`: Polymorphic support for `RiskLevel`, `AuthorizationStatus`, and `InterventionStatus`.
  - `Drawer`: 480px fixed width, slide-over with `--ease-drawer`.
  - `Modal`: Centered popup scaling from 0.96 to 1.0.
  - `CommandPalette`: `cmdk` quick navigation menu bound to `⌘K` / `Ctrl+K`.
- **Data Visualizations:**
  - `Recharts`: Monthly protected volume area chart, risk bucket distribution bar chart.
- **Icons:** `lucide-react` (consistent 1.5px to 2px stroke, explicit dimensions).
- **Toast Notifications:** `sonner` with custom styled alerts.

---

## 2. Directory Structure

```
src/
├── app/
│   ├── layout.tsx                     # Root layout with fonts & metadata
│   ├── globals.css                    # Tailwind CSS v4 setup & root tokens
│   ├── page.tsx                       # Public Marketing Homepage (editorial-report)
│   ├── how-it-works/page.tsx          # 5-phase protocol explanation
│   ├── merchant-integration/page.tsx  # Developer docs & integration guide
│   ├── security/page.tsx              # Privacy boundaries & security controls
│   ├── faq/page.tsx                   # Product FAQs & boundaries
│   ├── demo/page.tsx                  # Dedicated interactive simulator
│   ├── not-found.tsx                  # 404 state screen
│   ├── error.tsx                      # Global error boundary
│   ├── system-states/page.tsx         # Catalog of all 12 edge case states
│   ├── checkout/
│   │   ├── page.tsx                   # Merchant checkout simulation
│   │   ├── authorizing/page.tsx       # Pre-capture authorization hold screen
│   │   └── status/page.tsx            # Payment status screen
│   ├── intervention/
│   │   ├── page.tsx                   # Customer safety intervention hub
│   │   ├── chat/page.tsx              # Full-page conversational safety check-in
│   │   ├── verify/page.tsx            # Kernel out-of-band directory check
│   │   ├── trusted-contact/page.tsx   # Explicit-consent trusted contact flow
│   │   ├── resolved/page.tsx          # Outcome confirmation
│   │   └── summary/page.tsx           # Printable protection certificate
│   └── merchant/
│       ├── page.tsx                   # Operations Overview Dashboard
│       ├── payments/
│       │   ├── page.tsx               # Full ledger with AG Grid view & filters
│       │   └── [id]/page.tsx          # Direct deep-link payment detail
│       ├── interventions/page.tsx     # Active interventions queue & countdowns
│       ├── investigations/
│       │   └── [id]/page.tsx          # Forensic case view (AI hypothesis, logs)
│       ├── risk-intelligence/page.tsx # Threat taxonomy & script indicators
│       ├── simulator/page.tsx         # Scenario center to trigger test holds
│       ├── analytics/page.tsx         # Protection metrics & Recharts graphs
│       ├── audit-log/page.tsx         # Cryptographic SHA-256 sealed audit log
│       ├── policies/page.tsx          # Hold duration & risk threshold sliders
│       ├── integrations/page.tsx      # 11 partner/sponsor connectors & test ping
│       ├── docs/page.tsx              # REST API contract viewer & code samples
│       └── settings/page.tsx          # Merchant organization & API keys
├── components/
│   ├── brand/
│   │   ├── ScamBrakeMark.tsx          # Signature interrupted authorization emblem
│   │   └── AuthorizationPath.tsx      # Core signature visual motif
│   ├── ui/
│   │   ├── Button.tsx                 # Snappy micro-interaction button
│   │   ├── Badge.tsx                  # Polymorphic semantic badge
│   │   ├── Drawer.tsx                 # 480px slide-over master-detail
│   │   ├── Modal.tsx                  # Centered accessible dialog
│   │   └── CommandPalette.tsx         # Instant cmdk command bar
│   ├── marketing/
│   │   ├── MarketingNav.tsx           # Top navigation bar
│   │   ├── MarketingFooter.tsx        # Institutional footer
│   │   └── InteractiveDemo.tsx        # 3-scenario interactive walk-through
│   └── merchant/
│       ├── AppShell.tsx               # Framed-sheet L-chrome layout
│       ├── PaymentTable.tsx           # Sortable, searchable financial ledger
│       └── PaymentDetailDrawer.tsx    # Slide-out payment inspector
├── data/
│   └── seedData.ts                    # Reconciled seed dataset ($16,349 total)
├── services/
│   └── index.ts                       # ScamBrakeMockStore reactive service singleton
└── types/
    └── index.ts                       # Complete domain TypeScript definitions
```

---

## 3. Mock Service Layer & Phase 2 Transition Plan

The frontend is driven by `mockStore` (`src/services/index.ts`), which maintains a fully reactive in-memory state:
- All writes (`capturePayment`, `voidPayment`, `createPaymentFromScenario`, `grantTrustedContactConsent`, `addInterventionMessage`) automatically create immutable SHA-256 audit log records.
- All metrics (`totalProtectedVolume`, `activeHoldAmount`, `voidedFraudAmount`, `capturedLegitimateAmount`) dynamically recompute to maintain mathematical ledger integrity.

### Phase 2 Swap Checklist
1. **PayPal Sandbox:** Replace `mockStore.capturePayment` and `mockStore.voidPayment` with real PayPal REST API calls (`/v2/payments/authorizations/{id}/capture` and `/v2/payments/authorizations/{id}/void`).
2. **Database Persistence:** Swap in-memory arrays with PostgreSQL / Prisma or Drizzle ORM.
3. **AI Backend:** Replace static rule responses in `sendCustomerMessage` with real streaming LLM calls (e.g. Gemini API) with guardrails.
4. **Out-of-band Communications:** Wire `grantTrustedContactConsent` to live Twilio / Zapier Webhook APIs.

