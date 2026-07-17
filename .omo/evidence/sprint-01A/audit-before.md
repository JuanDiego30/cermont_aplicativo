# Audit Before — Sprint 1A Fleet Core Professional

## Current State of /fleet

**Estado visual:** ✅ Professional — VehicleCard grid with primary photo, readiness badge,
document expiry status chips, filter bar, document alerts banner, pagination.

**Acciones existentes:**
- List vehicles with filters (status, type)
- Create vehicle via NewVehicleDrawer
- View vehicle detail (click card)
- Document alerts banner (expiring/expired)

**Acciones que NO existen:**
- ❌ Bulk operations
- ❌ Export to CSV
- ❌ Maintenance status indicators on grid

## Current State of /fleet/[id]

**Estado visual:** ✅ Professional — Tabbed layout (Info, Documents, Photos, Assignment).
Header card with plate, status, readiness badge, quick stats (km, driver, type).

**Acciones existentes:**
- Info tab: view km, driver, type, capacity, maintenance dates, notes
- Documents tab: view SOAT, tecnomecánica, póliza with traffic-light status
- Photos tab: view/upload/set-primary/delete photos (FleetPhotoGallery)
- Assignment tab: assign, checkout, checkin, history (VehicleAssignmentPanel)

**Acciones que NO existen:**
- ❌ Maintenance tab (separate section with alerta por km vencido)
- ❌ Update maintenance fields from fleet detail
- ❌ Edit vehicle directly from detail

## Formularios básicos

**NewVehicleDrawer (FLT-01 target):**
- Uses local schema `DrawerFormSchema` instead of `CreateVehicleSchema` from shared-types
- Uses `Record<string, unknown>` in useForm type (line 71)
- Uses `as unknown as Resolver<...>` (lines 72-75)
- No photo upload during creation
- No document file attachment (only date fields)
- No driver selector from real users
- No initial maintenance capture
- No visual sections (all fields flat)
- No `lastMaintenanceAt` or `nextMaintenanceKm` fields

## Backend existente pero no expuesto en UI

- **checkoutVehicle**: Backend service (fleet.service.ts:387) has full implementation
  with mileage validation, fuel level, photos. Routes file has WRONG path
  (`/fleet/:id/checkout` should be `/assignments/:assignmentId/checkout`).
- **checkinVehicle**: Same issue — route path mismatch.
- **assignVehicle**: Backend service (fleet.service.ts:341) has implementation.
  Routes file is MISSING the assign endpoint (`/fleet/:id/assignments`).
- **getActiveAssignment**: Backend service (fleet.service.ts:496) exists.
  Routes file is MISSING this endpoint.
- **getVehicleAssignmentHistory**: Route exists at `/fleet/:id/assignments` but
  frontend calls `/fleet/${id}/assignments/history` — path mismatch.

## Backend routes analysis

file: `backend/src/modules/fleet/fleet.routes.ts`

```
Current routes:
  GET  /fleet                               → listVehicles        ✅
  GET  /fleet/expiring-documents            → getExpiringDocuments ✅
  GET  /fleet/:id                           → getVehicle          ✅
  POST /fleet                               → createVehicle       ✅
  PATCH /fleet/:id                         → updateVehicle       ✅
  POST /fleet/:id/checkin                  → checkinVehicle     ❌ (wrong path, expects assignmentId)
  POST /fleet/:id/checkout                 → checkoutVehicle    ❌ (wrong path, expects assignmentId)
  GET  /fleet/:id/assignments               → getAssignmentHistory ❌ (path: /history not /)
  GET/POST/DELETE /fleet/:id/photos         → photo operations   ✅
  
MISSING routes:
  POST /fleet/:id/assignments              → assignVehicle (controller exists)
  POST /fleet/assignments/:assignmentId/checkout → checkoutVehicle (controller exists)
  POST /fleet/assignments/:assignmentId/checkin  → checkinVehicle (controller exists)
  GET  /fleet/:id/assignments/active       → getActiveAssignment (need new controller method)
  GET  /fleet/:id/assignments/history      → getAssignmentHistory (controller exists, wrong path)
```

## Console errors

(Not tested — need dev server running)

## 404 errors

(Not tested — need dev server running)

## Tests relacionados

file: `frontend/tests/modules/fleet/fleet-photo-gallery.test.tsx`
- 2 tests for FleetPhotoGallery (primary photo actions, RBAC)
- No tests for: NewVehicleDrawer, VehicleAssignmentPanel, Fleet detail page, MaintenanceTab
