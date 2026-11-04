# SCAM BRAKE — ARCHITECTURAL & PRODUCT DECISIONS (ADR)

This document records the foundational product and technical decisions established for Scam Brake Phase 1.

---

## ADR 01: Pre-Capture Authorization vs. Post-Capture Chargeback / Refund

### Context
Card networks and payment processors have standard dispute mechanisms (chargebacks, claims). However, once funds are captured:
1. The merchant is assessed non-refundable chargeback fees ($15 to $35 per incident).
2. The merchant's chargeback ratio increases, risking account termination.
3. The victim waits 14 to 90 days for dispute adjudication, often suffering profound financial and emotional distress.
4. If the victim voluntarily authorized the charge, payment schemes historically rule in favor of the scammer ("Authorized Payment Rule").

### Decision
Scam Brake operates strictly **pre-capture**. Orders are created with PayPal Orders API `intent: 'AUTHORIZE'`. When social engineering is confirmed or the customer cancels:
- Scam Brake calls `POST /v2/payments/authorizations/{id}/void`.
- The hold terminates immediately.
- The merchant incurs **$0 in transaction fees** and 0 chargebacks.
- Customer funds are released back into their account balance instantly without waiting for claims departments.

---

## ADR 02: Voluntary Evidence Supply vs. Inbound Call Surveillance

### Context
Some fraud prevention concepts propose recording phone audio or intercepting device calls to detect coercion scripts.

### Decision
Scam Brake **explicitly rejects** passive call recording, audio eavesdropping, or keystroke tracking outside the merchant checkout.
- Surveillance destroys consumer trust and violates multi-jurisdictional wiretapping laws (e.g. California two-party consent, GDPR).
- All situational context in Scam Brake is provided **voluntarily** by the customer in response to empathetic prompts during the intervention.
- Technical telemetry is strictly limited to standard checkout parameters (order velocity, digital card denomination, concurrent device indicators).

---

## ADR 03: Kernel Independent Directory Verification vs. Relying on Caller ID

### Context
Scammers consistently spoof official caller IDs (showing "IRS Criminal Investigation", "Internal Revenue Service", or the victim's local bank branch). Showing a generic warning to "call your bank" often fails because victims call back the spoofed number.

### Decision
Scam Brake embeds **Kernel Out-of-Band Directory Verification**:
- The system maintains an independently audited, cryptographically verified registry of public agency switchboards.
- The interface prominently warns the customer: *"Scammers can easily display any name or phone number on your phone. You cannot trust incoming caller ID."*
- It presents the authentic, certified switchboard (e.g. 1-800-829-1040 for IRS) and advises the customer to hang up and call independently.

---

## ADR 04: Explicit Opt-In Consent for Trusted Contact Notification

### Context
Elder fraud advocates frequently emphasize notifying family or designated advocates. However, notifying third parties without consent can violate financial privacy and cause embarrassment.

### Decision
Scam Brake enforces an **explicit opt-in consent gate**:
- The customer must actively review the notification text and check an explicit consent box before any SMS or email is dispatched.
- The outbound notification is non-alarmist: it explains that a payment hold is paused for safety review and invites a calm consultation.

---

## ADR 05: Cryptographic State Audit Seals

### Context
Merchants and regulators require proof that an authorization hold or pre-capture void was executed in compliance with policy and customer instructions.

### Decision
Every state transition (authorization created, intervention opened, directory verified, contact consent granted, void executed) writes an immutable record sealed with a **deterministic SHA-256 hash**:
- Merkle hashes chain previous event states to prevent retroactive alteration.
- Available for merchant audit export as signed JSON.
