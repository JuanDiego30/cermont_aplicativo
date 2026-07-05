# Slice 01 — Stabilization & Gates Specification

## 1. Objective
Achieve zero regressions on all validation gates, improve React Doctor score (aiming for >= 87/100), and resolve critical production bugs like `PayloadTooLargeError`.

## 2. Technical Scope
- **Express Payload limits**: Configure body parser limits in `backend/src/app.ts` to support larger JSON payloads (e.g., base64 avatar submissions in profile editing).
- **React Doctor fixes**:
  - Await `params` and `searchParams` in Next.js 16 pages.
  - Resolve hydration mismatch in `FleetAlertsBanner.tsx` (move dynamic `Date.now()` to client-side `useEffect`).
  - Add search engine preview metadata to `consent/page.tsx` and `privacy/page.tsx`.
  - Fix modal focus trapping or convert standard modals to native `<dialog>` wrappers in `ConsentGate.tsx` and `NewVehicleDrawer.tsx`.
  - Delete unused/zombie files listed in React Doctor's maintainability warnings.

## 3. Impacted Files
- [MODIFY] `backend/src/app.ts`
- [MODIFY] `frontend/src/modules/dashboard/ui/FleetAlertsBanner.tsx`
- [MODIFY] `frontend/src/app/(legal)/consent/page.tsx`
- [MODIFY] `frontend/src/app/(legal)/privacy/page.tsx`
- [DELETE] `frontend/src/modules/media/` (dead code)
- [DELETE] `frontend/src/modules/privacy-requests/` (dead code)

## 4. Verification Scenario
```bash
# Run full verification
npm run verify
```
Confirm React Doctor score matches or exceeds 87/100 and no new quality baseline checks fail.
