# SCAM BRAKE — DESIGN SYSTEM SPECIFICATION

**Design Directions:**
- **Public Marketing Website:** `editorial-report` (The printed annual, financial gravitas, institutional trust).
- **Merchant Application & Customer Experience:** `framed-sheet` (Light commerce, inset white sheet, crisp borders, Mercury aesthetic).

---

## 1. Palette Architecture & Color Budget

The design system follows a strict financial utility philosophy: color is a semantic signal reserved for data states, never for decorative vanity.

### Chrome & Surfaces
- Canvas Ground: `#FAFAFC` (subtle off-white ledger tone)
- Sheet Surface: `#FFFFFF` (crisp elevated inset sheet)
- Subtle Muted Ground: `#F4F5F8`
- Surface Hover: `#FAFAFC`
- Standard Border: `#E5E7EB` (neutral grey-200)
- Inset / Accent Border: `rgba(45, 91, 255, 0.2)`

### Text & Typography
- Primary Text: `#1E1E2A` (deep ink charcoal, high contrast)
- Secondary Text: `#6B7280` (neutral grey-500)
- Muted / Caption Text: `#9CA3AF` (neutral grey-400)
- Dark Section Ground: `#11121C` (for institutional marketing contrasts)

### Semantic Color Budget (<3-5% surface area)
- **Brand / Focus / Action:** `#2D5BFF` (Royal Cobalt Blue)
- **Safe / Captured / Verified:** `#10B981` / `#059669` (Emerald Green)
- **Hold Active / Under Review:** `#F59E0B` / `#D97706` (Amber Ochre)
- **Critical Risk / Pre-Capture Void:** `#DC2626` / `#B91C1C` (Ruby Red)

---

## 2. Typography Rules & Scales

Following the `type.md` reference from `design-taste-frontend`:
- Primary Sans: System UI / Inter / Geist Sans
- Financial Numerals: Strict Tabular Numbers (`tabular-nums`) with `font-mono` for all currencies, IDs, and timestamps.
- **Strict House Rules:**
  - Headlines $\le 2$ lines at all viewport widths (no runaway display text).
  - No eyebrows or pill badges hovering above main headings.
  - No artificial index numbers (`01`, `02`, `03`).
  - No monospace outside actual code snippets or financial reference identifiers.
  - KPIs are rendered as typography (e.g. `$16,349.00` in 24px semi-bold), **not** vanity cards with icons inside colored circles.

---

## 3. The Core Signature Visual Motif: The Authorization Path

The visual identity of Scam Brake is anchored in the core product mechanism: **A payment that pauses before capture.**

```
[ Merchant Checkout ]
         ↓
[ PayPal Authorization ]  ← Funds held temporarily
         ↓
[ Telemetry Risk Scan ]   ← Channel3 & Elastic analysis
         ↓
[ Safety Intervention ]   ← AI check-in, Kernel directory, Trusted contact
      ↙         ↘
[ CAPTURE ]   [ PRE-CAPTURE VOID ]
```

This motif is rendered with `<AuthorizationPath />` across:
1. Marketing hero and interactive demo.
2. Checkout hold screen.
3. Customer intervention header.
4. Merchant dashboard overview.
5. Payment detail slide-out drawer.
6. Investigation case file.

---

## 4. Interaction & Motion Standards

Guided by `emil-design-eng/SKILL.md` and `animate/SKILL.md`:

### Button Interactions
- Active click scale: `scale(0.97)`
- Easing: `cubic-bezier(0.23, 1, 0.32, 1)` (snappy spring-like release)
- Hover: Subtle background shift, no blur, no glowing drop shadows.

### Drawer Primitive
- Fixed width: `480px` on desktop, `100%` on mobile.
- Easing curve: `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`
- Background overlay: `#000000` with 30% opacity, instant escape dismiss.

### Modal Primitive
- Starts from `scale(0.96); opacity: 0` (never scales from zero).
- Transitions smoothly to `scale(1); opacity: 1` over 180ms.

### Command Palette (`⌘K`)
- Opens instantly without animation. As a high-frequency power-user tool (100+ uses/day), animation causes perceptual lag.

---

## 5. Responsive Layout Architecture

- **Desktop (1440px):** Full L-chrome (48px top bar, 240px sidebar, 16px inset margin, framed sheet layout).
- **Tablet (768px):** Collapsible navigation drawer, two-column reflow for metrics and tables.
- **Mobile (390px):** Single-column stacked sheets, horizontal scrolling tables with sticky primary identifier, full-width touch targets ($\ge 44\text{px}$).

