# Implementation Notes — Sprint 1A Fleet Core Professional

## FLT-01: NewVehicleDrawer Refactoring

### What was done
- Removed `Record<string, unknown>` from useForm type (was line 71)
- Removed `as unknown as Resolver` cast (was lines 72-75)
- Removed local `DrawerFormSchema` — replaced with explicit `VehicleCreateFormValues` interface
- Created `VehicleCreateFormSchema` (Zod) for form-level validation (YYYY-MM-DD dates)
- Created `toCreateVehicleInput` adapter function converting form values to `CreateVehicleInput`
- Added 6 professional sections: Identificación, Documentos, Asignación, Mantenimiento inicial, Fotos iniciales, Notas
- Added `lastMaintenanceAt` and `nextMaintenanceKm` fields for initial maintenance capture
- Added photo queue with preview (local File[] array, uploaded after vehicle creation)
- Adapter normalizes plate to uppercase, skips empty optional fields

### Files modified
- `frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx` — Complete rewrite

### Constraints
- No driver selector from real users (no existing hook found — documented as improvement)
- Photos use local queue with blob URLs (upload needs vehicleId, happens after creation)

## FLT-02: Checkout/Checkin Routes Fix

### What was done
- Added `getActiveAssignment` controller method to `fleet.controller.ts`
- Fixed `fleet.routes.ts`:
  - Added `POST /fleet/:id/assignments` → `assignVehicle`
  - Added `GET /fleet/:id/assignments/active` → `getActiveAssignment`
  - Added `GET /fleet/:id/assignments/history` → `getAssignmentHistory`
  - Added `POST /fleet/assignments/:assignmentId/checkout` → `checkoutVehicle`
  - Added `POST /fleet/assignments/:assignmentId/checkin` → `checkinVehicle`
  - Removed broken routes: `/:id/checkin`, `/:id/checkout`, `/:id/assignments`
- Frontend `fleet-api.ts` already had the correct API calls — now they match the backend
- VehicleAssignmentPanel already used the correct hooks — now the backend responds
- Added `updateVehicle` to `fleet-api.ts` and `useUpdateVehicle` to `queries.ts`

### Files modified
- `backend/src/modules/fleet/fleet.controller.ts` — Added `getActiveAssignment`
- `backend/src/modules/fleet/fleet.routes.ts` — Fixed assignment/checkout/checkin routes
- `frontend/src/modules/fleet/api/fleet-api.ts` — Added `updateVehicle`
- `frontend/src/modules/fleet/queries.ts` — Added `useUpdateVehicle`

## FLT-03A: Maintenance Tab

### What was done
- Created `MaintenanceTab` component with:
  - Kilometers vs next-maintenance-km status cards
  - Alert banner when `kilometers >= nextMaintenanceKm`
  - Form to update `lastMaintenanceAt`, `nextMaintenanceKm`, `notes`
  - Uses `useUpdateVehicle` mutation with existing `PATCH /fleet/:id` endpoint
- Added "Mantenimiento" tab to fleet detail page (`fleet/[id]/page.tsx`)

### Files created
- `frontend/src/modules/fleet/ui/MaintenanceTab.tsx`

### Files modified
- `frontend/src/app/(dashboard)/fleet/[id]/page.tsx` — Added maintenance tab + Wrench icon

## Tests Created
- `frontend/tests/modules/fleet/NewVehicleDrawer.test.tsx` — 5 tests
- `frontend/tests/modules/fleet/VehicleAssignmentPanel.test.tsx` — 4 tests
- `frontend/tests/modules/fleet/MaintenanceTab.test.tsx` — 4 tests

## Important Notes
- Photo upload during vehicle creation is queued locally; actual upload needs vehicleId from create response
- Driver selector from real user list is pending — needs cross-module hook (future improvement)
- The assignment routes were previously broken (wrong paths) — this has been fixed
