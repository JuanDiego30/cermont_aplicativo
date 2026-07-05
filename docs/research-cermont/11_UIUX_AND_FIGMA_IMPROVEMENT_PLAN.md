# 11 — UI/UX & Figma Improvement Plan

## Executive Summary

Field operations demand visual interfaces that prioritize readability, fast loading, and accessibility. Field technicians often work under harsh outdoor lighting (Arauca oil fields) or while wearing industrial protective gear. Software designed with generic, low-contrast UI templates slows down data entry and introduces errors.

To align CERMONT S.A.S. with elite visual engineering practices, this document defines:
1. **The Core Visual Token System** (calibrated industrial dark mode and light mode color overrides).
2. **Key Visual Components** (Corporate Sidebar, Cockpit, Kanban Cards, ReadinessGate, CostVarianceTable, and OfflineStatus Banner).
3. **Typography & Accessibility Guidelines** (targeting WCAG 2.2 AA standards).
4. **Mobile Responsive Transformation Rules**.
5. **A Figma Design Backlog** detailing the **14 priority screens** that must be constructed in mockup software.

---

## Sources & References

- **Canonical Repository Files**:
  - `docs/design/CERMONT_UIUX_GUIDE.md` — The target color system (Mintlify style, blue `#2154A6`, green `#4CAF50`).
  - `frontend/src/app/globals.css` — Global styling file.
- **Visual Design Benchmarks**:
  - **Fracttal**: Industrial dark-mode asset registry.
  - **MaintainX / Jobber**: Mobile-first touch targets and checklist input layouts.

---

## Visual Design System & Tokens

We establish a unified design token system mapped in CSS variables, ensuring clean style injection in Tailwind CSS v4.

```css
/* Calibrated Industrial Design Tokens */
:root {
  /* Brand Identity */
  --color-brand-primary: #2154A6;     /* Cermont Deep Blue */
  --color-brand-secondary: #4CAF50;   /* Cermont Safety Green */
  --color-brand-accent: #E85D04;      /* Industrial Safety Orange */

  /* Dark Mode Default Theme (Best for outdoor tablet battery life) */
  --color-bg-base: #0B0E14;           /* Carbon Black base canvas */
  --color-bg-surface: #131722;        /* Card and input background */
  --color-bg-elevated: #1E222F;       /* Modals and overlay panels */
  --color-bg-border: #2A3042;         /* High-contrast border lines */

  /* Text Contrast */
  --color-text-primary: #F8FAFC;      /* High readability white */
  --color-text-secondary: #94A3B8;    /* Muted slate for metadata */
  --color-text-disabled: #475569;     /* Disabled state labels */

  /* Step and Stepper States */
  --color-step-completed: #4CAF50;    /* Success - green */
  --color-step-active: #2154A6;       /* Active - blue */
  --color-step-blocked: #EF4444;      /* Blocked - red */
  --color-step-pending: #475569;      /* Pending - slate */
}

/* Light Mode Overrides (Explicit [data-theme="light"] binding) */
[data-theme="light"] {
  --color-bg-base: #F1F5F9;
  --color-bg-surface: #FFFFFF;
  --color-bg-elevated: #F8FAFC;
  --color-bg-border: #E2E8F0;
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
}
```

---

## Functional Components Design Specification

### 1. Unified Corporate Sidebar
- **Features**:
  - Vertical layout with a toggle button to collapse into icons.
  - Nesting of categories in slide-out accordions with subtle micro-motions (150ms transform transitions).
  - Floating indicator highlighting the user's active page.
  - Bottom section contains the user profile avatar and a light/dark mode switch.

### 2. Service Case Cockpit (`/service-cases/[id]`)
Displays a visual 14-step horizontal stepper at the top.
- Completed steps render with a green checkmark badge.
- The active step has an animated pulsing blue outline.
- Blocked steps render in red with an overlay lock icon.
- Renders Radix-UI tabs below for Overview, Checklists, Media Gallery, and Cost Variance tables.

### 3. Kanban Board Cards
Used inside the case overview grid:
- Grouped in columns matching planning, execution, and billing stages.
- Cards show the Case ID, customer name, date, and a prominent **blocker badge** (in red) if the case is stuck at any step.

### 4. ReadinessGate Component
A clean checklist panel with a top-level traffic-light status banner:
- **🟢 READY**: All safety checks green. Habilita el check-in de ejecución.
- **⚠️ WARNING**: Minor issues pending (e.g., certificate expires in 3 days). Button is active but triggers warning toasts.
- **🔴 BLOCKED**: Critical items missing (e.g., AST upload missing). Hides check-in button.

### 5. CostVarianceTable Component
A precise financial reporting grid:
- Compare Budget items vs Real costs.
- Automatically calculate variance and variance percentages.
- **Semaphore Alerting**:
  - Variance ≤ 0%: Renders a green status dot (`bg-emerald-500`).
  - Variance between 0% and 10%: Renders a yellow caution triangle (`text-amber-500`).
  - Variance > 10%: Renders a red pulsing alert ring (`bg-red-500 animate-pulse`), warning managers of budget overruns.

### 6. OfflineStatus Banner
A highly visible notice bar fixed to the top:
- Renders with an amber background (`bg-amber-500`) and black text for optimal readability.
- Renders an icon showing rotating sync arrows if network is detected and synchronization has started.

---

## Typography & Accessibility Rules (WCAG 2.2 AA)

- **Typography**: General interface text is set to `Inter, system-ui, sans-serif` (extremely readable on low-resolution displays). Dynamic codes, case IDs, and financial totals are set to `JetBrains Mono, monospace`.
- **Keyboard Traversal**: Every interactive button, input field, and card must render an outline ring when focused: `focus-visible:ring-2 focus-visible:ring-[#2154A6] focus-visible:outline-none`.
- **Contrast Ratios**: Body text has a contrast ratio ≥ 4.5:1 against the dark or light canvas. Badges and alerts maintain a ratio ≥ 3:1.
- **Icon Accompanying labels**: Icon-only buttons must provide explicit `aria-label` tags for screen readers.

---

## Mobile Responsive Guidelines

- **Tables to Card Views**: Grid tables collapse into stacked cards on viewports `< 640px`.
- **Horizontal Stepper Wraps**: The 14-step timeline in the Cockpit shifts into a swipeable horizontal container on mobile screens, displaying only the active step and its immediate neighbors.
- **Camera Capture Bindings**: Upload inputs bind directly to mobile camera capture APIs when clicked: `<input type="file" accept="image/*" capture="environment">`.

---

## Figma Mockup Backlog (14 Priority Screens)

The design team must construct pixel-perfect mockups inside Figma for these 14 key interfaces before front-end styling.

1. **Dashboard ejecutivo**: High-level variance widgets, case status bars, and active alert overlays.
2. **Service Case Cockpit**: 14-step timeline stepper with Tab 1 Overview loaded.
3. **Work Request Form**: Step 1 creation screen with file upload drag zone.
4. **Site Visit Checklist**: Mobile layout view showing checklist question forms.
5. **Proposal Budget Builder**: Economic table showing pricing calculations.
6. **Planning Packet & Readiness Gate**: Planning details side-by-side with the Readiness Gate checkmarks.
7. **Active Execution Cockpit**: Dark-mode mobile view for onsite technicians, featuring timer, pause button, and checklists.
8. **Evidence Gallery Manager**: Dynamic media grid categorized by Before/During/After tabs.
9. **Technical Report Editor**: Live canvas where engineers select photo evidence cards to embed.
10. **Delivery Record & Customer Signature**: The landscape-oriented client signature canvas pad screen.
11. **Service Entry Sheet Panel**: Form field to enter SAP Ariba SES codes.
12. **Invoice Tracker Dashboard**: Administrative billing screen highlighting invoice payment countdowns.
13. **Cost Variance Dashboard**: Aggregated financial charts comparing overall budgets vs real margins.
14. **Document Library File Picker**: Left-column filters with right-column list and PDF viewer drawer.
