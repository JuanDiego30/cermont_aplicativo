# Slice 06 — Checklist Blocking Engine Specification

## 1. Objective
Enforce safety policies by blocking operational steps and final order closure if critical inspections fail or are missing.

## 2. Technical Scope
- **Critical items**: Flag specific checklist items (e.g., life-line inspection, electrical grounding checks) as `isCritical: true`.
- **Block conditions**:
  - If a critical item fails (state: `failed`), block progress to subsequent steps.
  - Require a photo attachment (via `FileAsset`) or a signature (via `ClientSignature`) for specific items before they can be marked `passed`.
- **Order Closure Block**: Check all associated checklists during the `order-closure.service.ts` validation process.

## 3. Impacted Files
- [MODIFY] `backend/src/models/Checklist.ts`
- [MODIFY] `backend/src/modules/order/order-closure.service.ts`
- [MODIFY] `frontend/src/modules/orders/ui/OrderTimeline.tsx`

## 4. Verification Scenario
Add a checklist with a failed critical safety item and assert that the order closure service throws a validation exception.
