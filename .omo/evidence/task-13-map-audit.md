# T13 verification — Map audit

## Sampled flows

1. `/fleet` → `useVehicles` → `GET /api/fleet` → `ListVehiclesQuerySchema`: corrected in matrix.
2. `/fleet/[id]` → inline query → `GET /api/fleet/:id` → `VehicleSchema`: documented as module-boundary debt.
3. Fleet photo gallery → four `/api/fleet/:id/photos` calls → no backend routes: recorded `BROKEN_PARTIAL`.
4. File upload → `FileAssetUploadInputFormSchema` → `/api/files/upload` → `createFileAssetFromUpload`: verified.
5. File owner enum → parent registry: verified mismatch for advertised unsupported owner types.

## RBAC sample

- `GET /api/fleet`: `INTERNAL_ROLES` verified.
- `POST/PATCH /api/fleet`: `MANAGEMENT_ROLES` = gerente/residente; map corrected.
- `GET /api/files/:id/content`: internal role check exists; entity ownership check remains a P0 risk.

## Corrected artifacts

- `CODEBASE_MAP.md`
- `FRONTEND_BACKEND_MATRIX.md`
- `RBAC_PERMISSION_MAP.md`
- `MEDIA_EVIDENCE_FLOW_MAP.md`

Verdict: maps are useful inventories but not generated call-graph truth. Corrections applied; remaining risks are explicit.
