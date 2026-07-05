# Slice 02 — FileAsset Unification Specification

## 1. Objective
Standardize file attachment operations by ensuring `FileAsset` is the absolute Single Source of Truth (SSOT). Prevent other modules from implementing custom file storing schemas.

## 2. Technical Scope
- **FileAsset entityTypes**: Align entity types: `kit`, `tool`, `vehicle`, `evidence`, `delivery_record`, `technical_report`, `planning`, `checklist_item`, `work_order`, and `execution_session`.
- **Parent Adapters**: Implement parent service handlers in `backend/src/modules/files/files.service.ts` to automatically associate uploaded FileAssets to their parent entities (e.g., updating `vehicle.photos` when a vehicle image is uploaded).
- **Consolidation**: Remove redundant upload routes or schemas. Ensure all file requests flow through `/api/files`.

## 3. Impacted Files
- [MODIFY] `backend/src/modules/files/files.service.ts`
- [MODIFY] `backend/src/modules/fleet/fleet.service.ts`
- [MODIFY] `backend/src/modules/tool/tool.service.ts`
- [MODIFY] `packages/shared-types/src/schemas/file-asset.schema.ts`

## 4. Verification Scenario
Verify vehicle or tool image uploads automatically trigger `FileAsset` registrations and update parent records cleanly.
