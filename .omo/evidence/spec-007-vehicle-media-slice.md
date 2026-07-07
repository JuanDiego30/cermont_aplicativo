# Spec 007 — Vehicle media vertical slice

## Impact map

- Contract: FileAsset owner/category plus Vehicle media DTO/state.
- Backend: Vehicle model, files parent registry, fleet service/controller/routes.
- Frontend: fleet API typing, hook, gallery identifiers and mutation RBAC.
- Offline: existing FileAsset outbox remains the only binary queue.
- Storage: existing private FileAsset pipeline; no new collection or `/api/media` dependency.

## TDD receipts

### RED

- Shared contracts: 3 expected failures (`vehicle`, defaults, `VehiclePhotoSchema`).
- Backend: unsupported vehicle owner plus missing list/primary methods.
- Frontend: gallery passed `undefined` because it used `_id` instead of canonical `id`.
- RBAC UI: read-only test found upload/mutation controls visible.
- Audit: first-photo and primary-deletion tests found no primary-change audit event.

### GREEN

- Shared focused tests: 23 passed.
- Backend focused tests: 12 passed.
- Frontend focused tests: 2 passed.
- Baseline before implementation: 1043 passed.

## Implemented behavior

- `vehicle` and `vehicle_image` are canonical FileAsset values.
- Vehicle embeds bounded FileAsset refs and a discriminated `primaryPhoto` status object.
- Fleet photo list/upload/primary/delete routes delegate to FileAsset.
- Cross-vehicle mutations are rejected.
- First upload becomes primary; deleting primary selects the next file or records absent state.
- Primary changes are audited with the existing `ASSET_PRIMARY_PHOTO_CHANGED` action.
- Read-only roles can view photos but do not see upload/delete/primary controls.

## Open gate

Root backend typecheck is currently blocked by concurrent, untracked `backend/src/modules/media/*` changes that were not created by this slice. They implement the rejected duplicate MediaAsset direction and remain preserved for owner review.
