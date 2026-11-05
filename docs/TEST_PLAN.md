# SCAM BRAKE: TEST PLAN & QUALITY ASSURANCE SPECIFICATION

This document outlines the testing strategy, test cases, verification matrix, and automated quality gates for Scam Brake Phase 1.

---

## 1. Automated Quality Gates

Every build and commit must pass three automated quality gates:

1. **Type Safety & Compilation:**
   ```bash
   npx tsc --noEmit
   npm run build
   ```
   *Gate Requirement:* Zero TypeScript errors, zero prerender blocking issues, 100% route generation across all 31 routes.

2. **Design Skill House Rules Linter:**
   ```bash
   node skills/design-taste-frontend/scripts/lint.mjs src/app
   ```
   *Gate Requirement:* Zero unexempted `[shadow]`, `[purple]`, `[micro-label]`, or `[numbering]` fails.

3. **Mathematical Ledger Consistency Assertion:**
   ```typescript
   assert(activeHoldAmount + voidedFraudAmount + capturedLegitimateAmount === totalProtectedVolume);
   // In seed data: $2,200.00 + $3,500.00 + $10,649.00 === $16,349.00
   ```

---

## 2. Test Cases & Verification Matrix

### Suite A: Customer Protected Checkout & Hold Creation
- **TC-01: Low Risk Immediate Capture Simulation**
  - *Action:* On `/checkout`, select "Professional Mirrorless Camera" ($1,499.00) and click "Approve in PayPal".
  - *Expected Result:* Passes through `/checkout/authorizing`, evaluates risk score <30, redirects to `/checkout/status?outcome=captured`.
- **TC-02: Critical Risk Hold & Intervention Trigger**
  - *Action:* On `/checkout`, select "Apple Gift Card Voucher Multi-Pack ($500 x 3)" ($1,500.00) and approve.
  - *Expected Result:* Triggers Scam Brake pre-capture hold (`intent: AUTHORIZE`), evaluates risk score 94/100, redirects to `/intervention` hub.

### Suite B: Customer Safety Intervention & Verification Tools
- **TC-03: AI Dialogue Interaction**
  - *Action:* In `/intervention/chat`, select quick reply *"Yes, I was told this was urgent"*.
  - *Expected Result:* AI responds calmly with IRS extortion advisory and options to verify or void.
- **TC-04: Kernel Independent Directory Check**
  - *Action:* In `/intervention/verify`, select "IRS / Tax Dept" and click "Run Kernel Verification".
  - *Expected Result:* Displays official 1-800-829-1040 switchboard and logs `INDEPENDENT_VERIFICATION_ATTEMPTED` in audit chain.
- **TC-05: Trusted Contact Explicit Consent**
  - *Action:* In `/intervention/trusted-contact`, verify button is disabled until consent checkbox is checked. Click send.
  - *Expected Result:* Dispatches simulated SMS, displays confirmation, and renders simulated reply from advocate.
- **TC-06: Pre-Capture Void Settlement**
  - *Action:* Click *"Cancel & Void Payment"*.
  - *Expected Result:* State changes to `VOIDED`, audit event created, redirects to `/intervention/resolved?action=voided`, and generates printable certificate.

### Suite C: Merchant Operations Workflows
- **TC-07: Ledger Search & Filtering**
  - *Action:* In `/merchant/payments`, filter by "Holds Active" and search "Martha".
  - *Expected Result:* Filters ledger to `SB-2026-8819`, displays hold countdown.
- **TC-08: Master-Detail Slide Drawer**
  - *Action:* Click any row in `/merchant/payments`.
  - *Expected Result:* 480px slide drawer opens smoothly, showing risk breakdown and capture/void action controls.
- **TC-09: Cryptographic Audit Inspection**
  - *Action:* In `/merchant/audit-log`, click "Inspect" on any record.
  - *Expected Result:* Modal opens displaying SHA-256 seal and raw structured JSON event payload.
- **TC-10: Quick Command Palette (`⌘K`)**
  - *Action:* Press `⌘K` or `Ctrl+K`.
  - *Expected Result:* Palette opens instantly without perceptual delay; typing navigates across all operational routes.

---

## 3. Responsive & Cross-Browser Verification

All screens tested and verified at:
- **Desktop:** 1440 × 900 (Full L-chrome, multi-column metrics).
- **Tablet:** 768 × 1024 (Collapsible sidebar, two-column reflow).
- **Mobile:** 390 × 844 (Single-column stacked sheet, touch targets $\ge 44\text{px}$).
- **Accessibility:** High contrast ratios ($\ge 4.5:1$), keyboard tab-index traversal, screen reader aria labels.

