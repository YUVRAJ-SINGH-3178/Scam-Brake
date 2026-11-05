# SCAM BRAKE: MASTER COPY DECK & VOICE GUIDELINES

**Product Tagline:** Stop. Verify. Stay protected.  
**Tone of Voice:**
- Public Website: Institutional, authoritative, analytical, rigorous.
- Merchant Operations: Precise, terse, financial control room, zero fluff.
- Customer Intervention: Calm, empathetic, non-punitive, non-alarmist, reassuring.

---

## 1. Marketing Copy & Value Propositions

### Headline Rules
- Strict House Rule: Headlines $\le 2$ lines at all viewport widths.
- No rhetorical questions as primary hero display text.
- No generic cybersecurity cliches ("Military grade protection", "Hack-proof your checkout").

### Primary Hero (Homepage `/`)
- **Headline:** Payment protection before the money leaves.
- **Sub-headline:** Scam Brake introduces an AI-assisted verification hold between PayPal authorization and capture: stopping social-engineering fraud before irreversible settlement.
- **Primary CTA:** Explore Interactive Demo
- **Secondary CTA:** Read Technical Specification

### How It Works (`/how-it-works`)
- **Headline:** Five phases between checkout and settlement.
- **Sub-headline:** How Scam Brake transforms payment authorizations into an active shield against voluntary coercion and authorized push payment fraud.

---

## 2. Customer Intervention Reassurance Copy

The customer experiencing an active intervention may be under intense psychological pressure from a scammer on their phone. All messaging must be calm and de-escalating.

### Reassurance Banner (`/intervention`, `/intervention/chat`)
> *"Your payment has not been captured yet. PayPal has temporarily authorized this hold so that you can verify this transaction in complete privacy. No money will leave your account without your explicit confirmation."*

### AI Dialogue Prompts
- *"We noticed indicators of urgency or unusual purchase patterns. Take a slow breath: you have plenty of time. Did someone instruct you to make this payment today?"*
- *"Official agencies (like the IRS, Sheriff's Office, or your bank) will never ask you to purchase store vouchers or gift cards. You are completely safe to hang up the phone right now."*
- *"Would you like to cancel this payment? There is no charge, no fee, and your funds will remain safe in your PayPal account."*

### Kernel Directory Copy (`/intervention/verify`)
- **Headline:** Why Caller ID Cannot Be Trusted
- **Body:** *"Scammers routinely use inexpensive software to display the exact phone number and name of official government agencies or banks on your caller ID. This is called Caller ID Spoofing. Scam Brake provides verified public directories so you can independently verify who you are dealing with."*

### Trusted Contact Consent Copy (`/intervention/trusted-contact`)
- **Headline:** Get a Second Opinion From Someone You Trust
- **Consent Label:** *"I give permission to send an SMS advisory to [Contact Name]. An automated message will explain that your current payment is paused and invite them to review this situation with you."*
- **Privacy Assurance:** *"We will never share your full bank account numbers, passwords, or browsing history with anyone."*

---

## 3. Merchant Operations Micro-Copy

### Dashboard Banner (`/merchant`)
- **Summary:** *"Pre-capture verification holds active across 2 checkouts. 0 dispute fees incurred."*

### Actions
- *"Capture Payment"* (Tooltip: *"Execute settlement via PayPal Orders API (`intent: CAPTURE`)."*)
- *"Void Authorization"* (Tooltip: *"Terminate hold via PayPal Orders API (`intent: VOID`). $0 fee, 0 chargeback."*)
- *"Export Signed JSON"* (Tooltip: *"Export Merkle-sealed SHA-256 audit log."*)

