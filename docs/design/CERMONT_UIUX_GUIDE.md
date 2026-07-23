# CERMONT UI/UX GUIDE

**Date:** 2026-05-13  
**Version:** 1.0 — Canonical  
**Status:** CURRENT_SOURCE_OF_TRUTH  
**Based on:** Cermont operational product requirements + professional field-service UI references  
**Complements:** `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` and the canonical Cermont blue/green brand system

---

## 1. Design System Foundation

The canonical design system lives in this guide. It defines the Cermont-specific UI/UX rules for implementation. **Do not create a second design system.**

### Quick Reference (from DESIGN.md)
- **Primary brand:** Cermont Blue `#2154A6` — card borders, titles, CTAs (never as surface background)
- **Secondary brand:** Cermont Green `#4CAF50` — SLA borders, compliance, success (never as surface background)
- **Dark mode backgrounds:** True black-gray (`#121212` canvas, `#1A1A1A` surfaces, `#0A0A0A` deep) — never blue-tinted
- **Primary font:** Inter (human content), Geist Mono (technical labels)
- **Signature shape:** Full pill (9999px radius) for buttons and inputs
- **Depth:** Border-driven (5% opacity) + luminance stepping in dark mode, not shadow-heavy
- **Mood:** Calm, confident, engineered for legibility

> **⚠️ Critical color rule:** Cermont Blue and Cermont Green are **border-and-title accent colors only**. Never use them as card backgrounds, page backgrounds, or large-area fills. See `DESIGN.md` sections `card-dashboard` and `card-sla` for correct usage.
### Professional Field-Service Reference Standard

The reviewed reference image uses a highly disciplined product-service layout: off-white canvas, strong black typography, controlled green accents, circular icon chips, compact cards, fine borders, and a clear top-to-bottom service journey. CERMONT keeps its blue + green identity, but applies the same discipline to operational modules.

Required interpretation for CERMONT:
- **Typography:** titles use strong neutral ink; metric and module labels stay compact and scannable. No negative letter spacing in operational pages.
- **Icon color system:** each module icon uses one semantic accent only: blue for workflow/control, green for completed/ready/evidence, amber for pending/risk, red for blocked/expired, slate for neutral metadata.
- **Card standard:** cards are for entities and repeated records only: order, vehicle, evidence, cost, kit, checklist item, notification. Use `8px` radius for dense operational screens unless a shared component already defines the radius.
- **Visual hierarchy:** every page starts with the operational object, status, next action, and risk signal before secondary copy.
- **Field use:** mobile and tablet layouts must prioritize camera, offline queue, checklist progress, evidence upload, and signature actions above decorative content.

### CSS Token Reference
```css
:root, [data-theme="light"] {
  /* Brand — border-and-title accent colors only */
  --color-cermont-blue: #2154A6;           /* Card borders, titles, CTAs */
  --color-cermont-blue-deep: #0F2C59;      /* Hover/active states */
  --color-cermont-blue-light: #3A78D8;     /* Info badges */
  --color-cermont-green: #4CAF50;          /* SLA borders, compliance */
  --color-cermont-green-deep: #1B4212;
  --color-cermont-green-light: #7CD966;    /* Success borders */
  
  /* Surface — neutral gray, no blue tints */
  --color-canvas: #FFFFFF;
  --color-canvas-dark: #1A1A1A;
  --color-surface: #F8FAFC;
  --color-surface-soft: #F1F5F9;
  --color-hairline: #E2E8F0;
  
  /* Text — neutral grays */
  --color-ink: #1A1A1A;
  --color-charcoal: #2E2E2E;
  --color-slate: #555555;
  --color-steel: #808080;
  
  --color-brand: var(--color-cermont-blue);
  --color-focus-ring: var(--color-cermont-green);
}

[data-theme="dark"] {
  /* Surface — true black-gray, NO blue tints */
  --color-canvas: #121212;
  --color-canvas-dark: #0A0A0A;
  --color-surface: #1A1A1A;
  --color-surface-soft: #242424;
  --color-hairline: #2E2E2E;
  
  /* Brand — lightened for dark bg contrast */
  --color-cermont-blue: #3A78D8;
  --color-cermont-green: #4ADE80;
  
  /* Text — neutral */
  --color-ink: #F5F5F5;
  --color-charcoal: #E0E0E0;
  --color-slate: #A0A0A0;
  --color-steel: #808080;
  
  --color-brand: var(--color-cermont-blue);
  --color-focus-ring: var(--color-cermont-green);
}
```

---

## 2. Page Layouts

### Landing Page (`/`)
- Atmospheric gradient hero: blue-blue-green-white cloud wash
- Headline: 64px Inter weight 600, letter-spacing -1.28px
- Subtitle: 18px Inter weight 400, color #666666
- Dual CTA: Cermont blue pill + ghost white pill
- Trust bar with company logos in muted grayscale

### Login Page (`/login`)
- Clean white card on gradient or white background
- Centered form: email + password + submit
- Brand logo top
- "Forgot password?" link
- No sidebar, no header — pure focus

### Dashboard (`/dashboard`)
- Header: sticky, backdrop blur, user avatar + notifications
- Sidebar: left, role-filtered navigation, Cermont blue active state
- Main: KPI cards (4-column grid) using **`card-dashboard`** pattern (2px Cermont Blue `#2154A6` border, neutral white bg, KPI value in blue text), active orders table, SLA cards using **`card-sla`** pattern (2px Cermont Green `#4CAF50` border), cost chart, alerts
- **Color rule:** KPI cards use blue border only — never blue background. SLA cards use green border only — never green background. The neutral canvas does the readability work.
- Mobile: sidebar becomes drawer (hamburger trigger)

### Detail Pages (orders, proposals, etc.)
- Header: breadcrumb + title + status badge + action buttons
- Tabs: info, planning, execution, evidences, costs, reports
- Content: cards with 16px radius, 24px padding

### Form Pages (create, edit)
- Single column, max-width 720px
- Sections with clear headers
- Inline validation errors (red, below field)
- Submit button: Cermont blue pill, full width on mobile

---

## 3. Components

### Buttons
```
Primary:   bg #2154A6 (Cermont Blue), text white, radius 9999px, padding 8px 24px
Secondary: bg white, text #1A1A1A, border 1px rgba(0,0,0,0.08), radius 9999px
Danger:    bg #DC2626, text white, radius 9999px
Ghost:     bg transparent, text #1A1A1A, radius 8px
```

### Cards
```
Standard:      bg white, border 1px rgba(0,0,0,0.05), radius 8px, padding 16px-24px
Featured:      bg white, border 1px rgba(0,0,0,0.05), radius 12px, padding 24px-32px
Dashboard KPI: bg white, border 2px solid #2154A6 (Cermont Blue), radius 16px, padding 24px
SLA Card:      bg white, border 2px solid #4CAF50 (Cermont Green), radius 16px, padding 24px
```

> **Card color rule:** Cermont Blue and Cermont Green are used exclusively as border colors on dashboard and SLA cards. Card backgrounds are always neutral white (`#FFFFFF` light / `#1A1A1A` dark).

### Tables
- Headers: Inter 13px weight 500, uppercase, tracking 0.65px
- Rows: Inter 14px, alternating subtle background (optional)
- Responsive: horizontal scroll on mobile
- Sortable columns with arrow indicators
- Pagination: bottom, centered

### Forms
- Labels: Inter 14px weight 500, above input
- Inputs: border 1px rgba(0,0,0,0.08), radius 8px, padding 8px 12px
- Focus: border Cermont green `#4CAF50`, outline 1px Cermont green
- Error: border `#d45656`, error text below
- Select/Combobox: same styling as inputs

### Badges
```
Success: bg #7CD966, text #1B4212
Warning: bg #c37d0d (amber tint), text dark
Error:   bg #d45656, text white
Info:    bg #3772cf, text white
Neutral: bg #e5e5e5, text #333333
```

### Dialogs / Modals
- Centered overlay with backdrop (rgba(0,0,0,0.3))
- White card, radius 16px, padding 24px
- Focus trap (accessibility)
- Close on Escape, click outside

---

## 4. State Patterns

### Loading States
- Skeleton screens: gray animated pulse, matching layout
- Spinner: only for small areas or buttons
- Never: blank white page while loading

### Error States
- Card with error icon + message + retry button
- Distinguish: network error, server error, forbidden
- Error codes displayed for debugging (dev only)

### Empty States
- Illustration + descriptive text + action button
- Examples: "No work orders yet" + "Create first order" button
- Never: blank list or table

### Offline States
- Persistent banner: "You are offline. Changes will sync when connected."
- Queue indicator: "3 items pending sync"
- Offline-capable actions: enabled
- Server-only actions: disabled with tooltip

### Forbidden States
- Card: "You don't have permission to view this page"
- Never: white page or generic error

---

## 5. Mobile-First Design

### Breakpoints
| Name | Width | Changes |
|------|-------|---------|
| Mobile | < 768px | Single column, drawer sidebar, stacked |
| Tablet | 768-1024px | Two columns begin, expanded padding |
| Desktop | > 1024px | Full layout, 3+ column grids |

### Mobile Rules
- Touch targets: minimum 44px × 44px
- Sidebar: drawer triggered by hamburger icon
- Tables: horizontal scroll or card view
- Forms: full width inputs, stacked labels
- Buttons: full width on mobile forms
- No horizontal overflow anywhere

---

## 6. Accessibility Requirements

- **Labels:** Every input has a visible `<label>`
- **Buttons:** Every button has text or `aria-label`
- **Focus:** Visible focus ring (Cermont green) on all interactive elements
- **Keyboard:** All actions reachable via Tab/Enter/Escape
- **Modals:** Focus trap, Escape to close
- **Contrast:** WCAG AA minimum (4.5:1 for text, 3:1 for large text)
- **Color:** Never communicate state by color alone — use icons + text
- **Screen readers:** Semantic HTML, `aria-*` where needed
- **Reduced motion:** Respect `prefers-reduced-motion`

---

## 7. Icons & Imagery

- **Icon library:** lucide-react (already in stack)
- **Size:** 16px-24px for UI, larger for empty states
- **Color:** Inherit from text color or use brand colors
- **Images:** Optimized (sharp), lazy-loaded, responsive containers
- **No heavy decorative images** in operational UI

---

## 8. Animations & Motion

- **Library:** Framer Motion (already in stack)
- **Page transitions:** Subtle fade (opacity 0 → 1, 200ms)
- **Cards:** Subtle hover lift (translateY -2px, shadow increase)
- **Sidebar:** Slide in from left on mobile
- **Toast notifications:** Slide in from top-right (sonner)
- **Respect** `prefers-reduced-motion`: disable animations

---

## 9. Dark Mode

Mirror `DESIGN.md` dark mode section — **true black-gray palette, no blue-tinted surfaces:**
- **Canvas** (page background): `#121212` — neutral near-black
- **Surface** (cards, sections): `#1A1A1A` — dark gray
- **Surface Soft** (hover, elevated): `#242424` — lighter gray
- **Deep** (code blocks, modals): `#0A0A0A` — near-pure black
- **Text primary**: `#F5F5F5` (neutral white, no blue cast)
- **Text secondary**: `#A0A0A0`
- **Cermont Blue** (accent): `#3A78D8` — for borders and titles only
- **Cermont Green** (compliance): `#4ADE80` — for SLA borders and success
- **Borders**: `#2E2E2E` (standard), `rgba(255,255,255,0.05)` (subtle dividers)
- **Depth strategy**: Background luminance stepping (`#0A0A0A` → `#121212` → `#1A1A1A` → `#242424`) replaces traditional shadows

> **Everything above replaces the old `#0d0d0d` / `#141414` / `#0F172A` values.** The operational dark mode is true neutral gray — no blue tint anywhere.

---

## 10. Rules for Agents

1. **No second design system.** Use the tokens and rules in this guide.
2. **No duplicated components.** Check `frontend/src/components/common/` first.
3. **No hardcoded colors.** Use CSS variables or Tailwind tokens.
4. **No giant monolithic components.** Split by responsibility.
5. **Use Radix UI primitives** for complex interactive components.
6. **Mobile-first:** design for 375px width first.
7. **All states required:** loading, error, empty, offline, forbidden.
8. **Semantic HTML:** `header`, `main`, `section`, `nav`, `button`, `label` — not `div` soup.
9. **Accessibility is not optional.**
10. **Run React Doctor** before considering a page complete.

