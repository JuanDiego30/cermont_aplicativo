# Slice 07 — Dashboard OS Cockpit Specification

## 1. Objective
Build the "Cermont OS Cockpit", a central operational interface that provides real-time tracking of active orders, cost indicators, and pending requirements.

## 2. Technical Scope
- **Interactive Timeline**: Render a visual status tracker for each order from WorkRequest (Step 1) to Payment (Step 14).
- **Missing Items Alert**: Explicitly list what files, signatures, or checklists are currently missing to unlock the next workflow stage.
- **KPI Summary Cards**: Show operating margins, estimated vs. actual cost comparisons, and deviation warning gauges.

## 3. Impacted Files
- [NEW] `frontend/src/modules/dashboard/ui/OrderTimelineCockpit.tsx`
- [MODIFY] `frontend/src/app/(dashboard)/dashboard/page.tsx`
- [NEW] `backend/src/modules/dashboard/dashboard.controller.ts`

## 4. Verification Scenario
Verify dashboard renders and filters by active role, displaying alerts for missing signatures or checklists for selected orders.
