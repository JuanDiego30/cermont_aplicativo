# Product Slice Report — Sprint 1A Fleet Core Professional

## Sprint Executed
Sprint 1A — Fleet Core Professional (subset of Sprint 1 from masterplan v4)

## Tickets Completed
- **FLT-01** — NewVehicleDrawer refactored (professional sections, typed adapter, photo queue)
- **FLT-02** — Checkout/checkin routes fixed (backend routes aligned with frontend API calls)
- **FLT-03A** — Maintenance tab added to fleet detail page

## Tickets Blocked
None.

## What Changed Functionally in /fleet
- Create vehicle drawer now has 6 professional sections (was flat form)
- New fields: `lastMaintenanceAt`, `nextMaintenanceKm` for initial maintenance data
- Photo queue during creation (local preview before vehicle is created)
- Form is contract-first: `toCreateVehicleInput` adapter converts to `CreateVehicleInput`

## What Changed Functionally in /fleet/[id]
- New "Mantenimiento" tab with:
  - Kilometers vs next-maintenance status cards
  - Alert banner when maintenance is overdue by km
  - Form to update lastMaintenanceAt, nextMaintenanceKm, notes
- Assignment/checkout/checkin routes now correctly connected (were previously broken)

## Backend Logic Connected
- `assignVehicle` — POST /fleet/:id/assignments (was missing)
- `checkoutVehicle` — POST /fleet/assignments/:assignmentId/checkout (was wrong path)
- `checkinVehicle` — POST /fleet/assignments/:assignmentId/checkin (was wrong path)
- `getActiveAssignment` — GET /fleet/:id/assignments/active (was missing)
- `getAssignmentHistory` — GET /fleet/:id/assignments/history (was wrong path)

## Forms Refactored
- **NewVehicleDrawer**: Complete rewrite — typed form, sections, adapter, no Record<string,unknown>

## Tests Created/Modified
- `frontend/tests/modules/fleet/NewVehicleDrawer.test.tsx` — 5 tests (NEW)
- `frontend/tests/modules/fleet/VehicleAssignmentPanel.test.tsx` — 4 tests (NEW)
- `frontend/tests/modules/fleet/MaintenanceTab.test.tsx` — 4 tests (NEW)

## Bugs Fixed (Sisyphus — 2026-07-07)

### 1. Query invalidation mismatch (CRITICAL)
The Fleet detail page used `["vehicle", id]` as its TanStack Query key, but ALL mutations in `queries.ts` only invalidated `["fleet", ...]` keys. After any mutation (assign, checkout, checkin, maintenance update), the detail page showed stale data.

**Fix:**
- Added `FLEET_KEYS.detail(id)` and exported `FLEET_KEYS`
- Updated `useUpdateVehicle` to invalidate detail key
- Updated `useCheckoutVehicle`/`useCheckinVehicle` to invalidate detail + activeAssignment + history
- Updated detail page to use `FLEET_KEYS.detail(id)` instead of inline `["vehicle", id]`

### 2. React Doctor: State synced to prop in useEffect
`NewVehicleDrawer` used `useEffect` to reset form + photo state when `open` prop changed. This caused a brief render with stale values.

**Fix:** Moved reset logic to `onOpenChange` event handler. React Doctor improved 83→98.

## Quality Gate Results (Updated 2026-07-07)
| Gate | Result | Notes |
|------|--------|-------|
| Typecheck (frontend) | ✅ | 0 errors |
| Typecheck (backend) | ✅ | 0 errors |
| Lint (frontend) | ✅ | 859 files, 0 errors |
| Frontend tests | ✅ | 70 files, 302 passed |
| Fleet-specific tests | ✅ | 4 files, 15 passed |
| Contracts check | ✅ | Snapshot hash verified |
| React Doctor | ✅ (98/100) | Was 83 — 1 maintainability warning (pre-existing) |
| Frontend build | ❌ | Pre-existing Serwist service worker failure (exists on clean branch) |

**Pre-existing build failure note:** The Serwist service worker bundling fails with exit code 4294967295 on the base branch (deploy/vps-clean). This is NOT caused by Sprint 1A changes. Verified by stashing all changes and building on clean branch — same failure.

## Files Modified (Sisyphus — 2026-07-07)
| File | Change |
|------|--------|
| `frontend/src/modules/fleet/queries.ts` | Added `detail` key, exported `FLEET_KEYS`, fixed mutation invalidations |
| `frontend/src/app/(dashboard)/fleet/[id]/page.tsx` | Switched to `FLEET_KEYS.detail(id)` import |
| `frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx` | `useEffect` reset → `onOpenChange` handler |

## Screenshots
No screenshots could be taken (browser automation tools unavailable in current environment — Playwright MCP reports "Not connected").
Visual verification should be done by running `npm run dev` and navigating to:
- http://localhost:3000/fleet — click "Nuevo vehículo" to see refactored drawer
- http://localhost:3000/fleet/[id]?tab=maintenance — to see maintenance tab

## What Could NOT Be Completed
- Driver selector from real user list (no cross-module hook available — uses text field)
- Photo upload integration in creation flow (needs vehicleId from create response)
- Full E2E test with Playwright (browser tools not available)
- Build passing (pre-existing Serwist failure)

## Can Pass to Sprint 1B?
**Verdict: YES** — Sprint 1A is complete. All 3 tickets FLT-01, FLT-02, FLT-03A are implemented
and verified:
1. ✅ FLT-01: NewVehicleDrawer — no Record<string,unknown>, no as unknown as Resolver, professional sections, contract-first adapter
2. ✅ FLT-02: Checkout/checkin — assign, checkout, checkin, active assignment, history all connected
3. ✅ FLT-03A: Maintenance section with overdue alert and update form
4. ✅ Query invalidation fixed for all mutations
5. ✅ React Doctor 98/100
6. ✅ All quality gates pass (except pre-existing build failure)
