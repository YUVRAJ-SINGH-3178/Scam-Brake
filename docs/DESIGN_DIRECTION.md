# SCAM BRAKE — DESIGN DIRECTION RATIONALE

This document details the selection criteria, design skill tool execution, and compositional rationale behind Scam Brake's visual architecture.

---

## 1. Skill Execution & Available Options

Using the `design-taste-frontend` skill direction generation tool (`scripts/draw.mjs`), two separate design evaluations were executed for Scam Brake:

### A. Marketing Website Direction Generation
```bash
node skills/design-taste-frontend/scripts/draw.mjs \
  --sector finance \
  --brief "Scam Brake is a merchant-integrated payment protection product that gives customers an AI-guided verification step after PayPal authorization and before capture." \
  --sections showcase,how-it-works,features,faq,cta,footer \
  --tone editorial \
  --keep palette \
  --options 3 \
  --out .taste-skill/marketing
```
- **Generated Direction:** `editorial-report` (The printed annual, financial gravitas, institutional trust).
- **Key Compositional Rules:**
  - Strict 42% editorial axis with asymmetric content framing.
  - Dark institutional background ground (`#0C0C14` / `#11121C`) creating contrast with crisp typography.
  - Real Scam Brake interface fragment embedded in the hero showcase (`data-ui="fragment"`).
  - No decorative AI gradient orbs, no floating 3D shields, no vanity icons.

### B. Merchant Application Direction Generation
```bash
node skills/design-taste-frontend/scripts/draw.mjs \
  --app \
  --kind commerce \
  --brief "Scam Brake is a merchant payment protection workspace for reviewing PayPal authorizations, contextual social-engineering investigations and capture or void outcomes." \
  --screens overview,analytics,list,detail,settings,inbox,wallet \
  --theme light \
  --keep palette,type \
  --options 3 \
  --out .taste-skill/app
```
- **Selected Style:** `framed-sheet` (Light commerce, inset white sheet on a neutral `#FAFAFC` chrome frame).
- **Why Framed-Sheet was Chosen over Achromatic-Ledger:**
  - An *achromatic ledger* is optimal for pure single-column financial transaction logs.
  - However, Scam Brake is a multi-dimensional merchant operations control room: it requires active queue timers, live investigation dossiers, threat taxonomy explorers, Recharts analytics graphs, and partner webhook integrations.
  - The `framed-sheet` style provides an elegant L-chrome framing (48px top bar, 240px sidebar, 16px inset) where the central work surface sits on an elevated `#FFFFFF` rounded sheet. This clearly bounds operational density without cluttering the eye.

---

## 2. Customer Application Alignment

The Customer Payment Protection Experience (`/checkout/*`, `/intervention/*`) shares the same brand typography, palette, and icon system as the merchant application, but adapts the compositional hierarchy for high-stress consumer safety:
- Elevated whitespace around conversational prompts to reduce cognitive load.
- High-contrast reassuring banners anchored at the top of the viewport.
- Unambiguous primary buttons with generous touch targets ($\ge 44\text{px}$) for canceling or confirming payments.

---

## 3. The Core Signature Visual Motif: The Authorization Path

Rather than adopting a generic security padlock or shield, Scam Brake's signature emblem and interface motif are derived directly from the mathematical mechanism of the product:
- A straight horizontal and vertical pathway representing the flow of money.
- A controlled gate/pause midway through the trajectory representing the PayPal authorization hold.
- A fork at the terminal end resolving into either **Capture** (settlement) or **Pre-Capture Void** ($0 fee cancellation).
- This motif is codified in `<AuthorizationPath />` and `<ScamBrakeMark />`.
