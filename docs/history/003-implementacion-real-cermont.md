# PLAN: Spec 003 — Implementación Real CERMONT

## TL;DR

> **Quick Summary**: Ejecución de 5 vertical slices funcionales sobre el aplicativo CERMONT: (1) módulo de fotos de vehículos con cámara integrada, (2) formularios de evidencia con títulos y generación de PDF, (3) tracking de costos, (4) optimización del módulo ERP, (5) mejora de GMAO/FSM. Basado en los specs SPEC-003 y documentos de auditoría.

> **Deliverables**:
> - Galería de fotos de vehículos con cámara directa y upload
> - Sistema de evidencias con formulario + títulos + PDF estructurado
> - Panel de costos con desglose por orden
> - Módulo ERP optimizado con conectores funcionales
> - Sección GMAO/FSM mejorada con mantenimiento preventivo
>
> **Estimated Effort**: XL (40-60 tasks across 5 vertical slices)
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Contracts (Wave 1) → Backend modules (Wave 2) → Frontend pages (Wave 3) → Integration tests (Wave 4)

---

## Context

### Original Request
Implementar las siguientes funcionalidades en el aplicativo CERMONT:
1. Módulo de fotos de vehículos con campo de upload dedicado e integración de cámara directa para captura de evidencia en tiempo real
2. Sistema para organizar formularios de evidencia y fotos, permitiendo a usuarios agregar títulos y generar documentos PDF estructurados
3. Capacidades de tracking de costos
4. Optimización del módulo ERP existente
5. Mejora de la sección GMAO/FSM (CMMS) del aplicativo

### Specification Documents
- `PROMPT_SPEC_003_PROFESIONALIZACION_CERMONT.md` — Master spec 003 (18 fases, 28 principios)
- `PROMPT_IMPLEMENTACION_SPEC_KIT_POST_AUDITORIA_CERMONT.md` — Post-audit COMPLAN
- `PROMPT_AUDITORIA_SPEC_KIT_CERMONT.md` — Auditoría integral con Spec Kit
- `PROMPT_FOTOS_CAMARA_DOCUMENTOS_CERMONT.md` — Sistema unificado de fotos/cámara/evidencias/documentos
- `PROMPT_SPEC_003_IMPLEMENTACION_REAL_CERMONT.md` — Implementación real con slices

### Current Codebase State (confirmed)
- **Backend**: 52+ modules, Express 5.2.1, MongoDB + Mongoose 9.x
- **Frontend**: Next.js 16 + React 19 + Turbopack, 83 routes
- **Fleet module** (`backend/src/modules/fleet/`): controller, routes, service — exists
- **Evidence module** (`backend/src/modules/evidence/`): controller, routes, service × 2 — exists
- **Cost module** (`backend/src/modules/cost/`): controller, routes, service — exists
- **ERP connector** (`backend/src/modules/erp-connector/`): controller, routes, service — exists
- **Maintenance module** (`backend/src/modules/maintenance/`): controller, routes, service — exists
- **Files module** (`frontend/src/modules/files/`): CameraCapture (recycled), AttachmentGallery (integrated), DocumentList (integrated), AttachmentList, ImageUploadField, FileUploadField, FileAttachmentsSection
- **Evidence frontend** (`frontend/src/modules/evidences/`): CameraCapture, EvidenceUploader, EvidenceDropZone, EvidencePhotoCard, EvidenceGpsCapture, EvidenceSubmitBar
- **Fleet frontend** (`frontend/src/modules/fleet/`): api, ui, index.ts, queries.ts, readiness.ts
- **Costs frontend** (`frontend/src/modules/costs/`): CostBreakdownTable, CostForm, CostPanel, CostSummaryCard, hooks
- **React Doctor**: 100/100 (clean)
- **Verification pipeline**: all gates pass

### Key Architectural Decisions (from specs)
- Contract-first: Zod schema → TypeScript type → DTO → Mongoose model → Service → Controller → Route → API client → Hook → UI
- No `any`, no `unknown`, no `null`, no `undefined` as escape hatches
- RBAC with 8 roles from `@cermont/domain`
- proxy.ts security perimeter (no middleware.ts)
- CameraCapture as reusable component already recycled into evidences module
- PWA/Serwist for offline support

---

## Work Objectives

### Core Objective
Implement 5 vertical slices across backend + frontend + tests + documentation, transforming CERMONT from functional to professional.

### Concrete Deliverables
1. **Vehicle Photo Module**: CameraCapture integration in fleet detail page, photo upload with categories (frontal, trasera, lateral, placa, odómetro, interior), gallery view, readiness score update on photo status
2. **Evidence Forms + PDF**: Evidence creation form with title, description, category, photos; PDF generation endpoint; structured PDF download with metadata
3. **Cost Tracking**: Cost breakdown by work order, budget vs actual comparison, cost summary cards, execution cost tracking
4. **ERP Module Optimization**: Connector refinement, sync status dashboard, error handling, mapping validation
5. **GMAO/FSM Enhancement**: Preventive maintenance scheduling, maintenance logs, asset readiness integration, SLA tracking

### Definition of Done
- [ ] All backend routes return proper response envelope (`{ success, data }`)
- [ ] All frontend pages show loading/error/empty states
- [ ] typecheck: PASS
- [ ] lint: PASS
- [ ] test: PASS (all existing + new)
- [ ] build: PASS
- [ ] contracts:check: PASS
- [ ] quality:strict: no regression
- [ ] react-doctor: no new issues

### Must Have
- Vehicle photo upload + camera integration working in fleet/[id] page
- Evidence form with title + photo capture → PDF generation
- Cost panel per order showing actual vs budget
- ERP connector with at least sync status
- Maintenance module with preventive scheduling

### Must NOT Have (Guardrails)
- No new `any`/`unknown`/`null`/`undefined` violations
- No removal of existing functionality
- No changes to response envelope format
- No modification to shared-types contracts without migration
- No direct `fetch` in components
- No business logic in UI components
- No breaking PWA/offline functionality
- No mock data in production paths
- No hardcoded roles or routes

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: YES (TDD — tests before implementation)
- **Framework**: Vitest (unit/integration), Playwright (E2E)

### QA Policy
Every task includes agent-executed QA scenarios:
- **Frontend/UI**: Use Playwright — navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — send requests, assert status + response fields
- **Library/Module**: Use Bash (bun/node REPL) — import, call functions, compare output

Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Contracts & Shared — foundation):
├── Task 1: Fleet photo schemas + types (Zod)
├── Task 2: Evidence form schemas + types (Zod)
├── Task 3: PDF generation schemas + types (Zod)
├── Task 4: Cost tracking schemas + types (Zod)
├── Task 5: ERP connector schemas (Zod)
├── Task 6: Maintenance preventive schemas (Zod)
├── Task 7: FileAsset category updates (fleet photo types)
└── Task 8: Domain/role permission updates

Wave 2 (Backend endpoints — parallel per module):
├── Task 9: Fleet photo upload endpoint (POST /fleet/:id/photos)
├── Task 10: Fleet photo gallery endpoint (GET /fleet/:id/photos)
├── Task 11: Fleet readiness update on photo status
├── Task 12: Evidence create endpoint with title/category/photos
├── Task 13: Evidence PDF generation endpoint
├── Task 14: Evidence download audit endpoint
├── Task 15: Cost breakdown endpoint (GET /orders/:id/costs)
├── Task 16: Cost tracking update endpoint (budget vs actual)
├── Task 17: ERP connector sync status endpoint
├── Task 18: ERP connector mapping validation endpoint
├── Task 19: Maintenance preventive schedule CRUD
├── Task 20: Maintenance log create/list endpoint
└── Task 21: Service case SLA status endpoint

Wave 3 (Frontend pages — parallel per module):
├── Task 22: Fleet photo gallery component (uses AttachmentGallery)
├── Task 23: Fleet camera capture integration (uses CameraCapture)
├── Task 24: Fleet readiness score display with photo status
├── Task 25: Evidence form component with title + photos
├── Task 26: Evidence PDF preview/download button
├── Task 27: Cost panel in order detail page
├── Task 28: Cost execution tracking form
├── Task 29: ERP connector admin page
├── Task 30: ERP connector sync trigger UI
├── Task 31: Maintenance preventive schedule UI
├── Task 32: Maintenance work order integration
└── Task 33: SLA status indicator component

Wave 4 (Integration & Polish):
├── Task 34: Fleet photo E2E test
├── Task 35: Evidence form + PDF E2E test
├── Task 36: Cost tracking integration test
├── Task 37: ERP connector integration test
├── Task 38: Maintenance module integration test
├── Task 39: Full verify pipeline
└── Task 40: Documentation updates

Wave FINAL (Parallel review, then user ok):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
```

---

## TODOs

> **NOTA**: Tasks 1–8 (Wave 1) are shared contracts/types. Tasks 9–21 (Wave 2) are backend endpoints. Tasks 22–33 (Wave 3) are frontend pages/components. Tasks 34–40 (Wave 4) are integration/tests/docs.
>
> **EVERY task MUST have**: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

---

### WAVE 1 — Contracts & Shared (Foundation)

- [x] 1. **Fleet photo Zod schemas + shared types**

  **What to do**:
  - Create/extend Zod schemas in `packages/shared-types/src/schemas/` for fleet photo categories
  - Add `VehiclePhotoCategory` union type with categories: `front`, `back`, `left`, `right`, `plate`, `odometer`, `interior`, `damage`, `general`
  - Add `VehiclePhotoUpload` input schema with fields: `category`, `description?`, `capturedAt?`, `capturedBy?`
  - Add `VehiclePhotoResponse` output schema
  - Export from `packages/shared-types/src/index.ts`
  - Ensure `contracts:check` passes with updated snapshot

  **Must NOT do**:
  - No breaking changes to existing `FileAssetRef` or file schemas
  - No `any`/`unknown`/`null`/`undefined`

  **Recommended Agent Profile**:
  - **Category**: `quick` — schema-only, well-defined pattern
  - **Skills**: [`zod`] — Zod 4.x patterns for union types, input/output schemas
  - **Skills Evaluated but Omitted**: none

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2–8)
  - **Blocks**: Tasks 9, 10, 11, 22, 23, 24
  - **Blocked By**: None (can start immediately)

  **References**:
  - `packages/shared-types/src/schemas/file-asset.schema.ts` — Existing file asset schema pattern
  - `packages/shared-types/src/index.ts` — Export barrel
  - `docs/Intrucciones_para_crear_app_web/DOC-09` — Data dictionary for Zod conventions

  **Acceptance Criteria**:
  - [ ] `npm run typecheck -w @cermont/shared-types` → PASS
  - [ ] `npm run build -w @cermont/shared-types` → PASS
  - [ ] `npm run contracts:check` → PASS (snapshot updated)

  **QA Scenarios**:
  ```
  Scenario: Schema validation — vehicle photo category
    Tool: Bash (bun REPL)
    Preconditions: Build passed, module available
    Steps:
      1. Import VehiclePhotoCategory from @cermont/shared-types
      2. Assert the union includes "front", "back", "left", "right", "plate", "odometer", "interior", "damage", "general"
    Expected Result: TypeScript compilation succeeds, union members match expected
    Evidence: .sisyphus/evidence/task-1-schema-categories.txt

  Scenario: Schema validation — VehiclePhotoUpload input
    Tool: Bash (bun REPL)
    Preconditions: Build passed
    Steps:
      1. Import VehiclePhotoUploadSchema from @cermont/shared-types
      2. Call safeParse with valid payload: { category: "front", description: "Frontal view" }
      3. Call safeParse with invalid payload: { category: "invalid_category" }
    Expected Result: Valid payload → success; invalid → error with description
    Evidence: .sisyphus/evidence/task-1-schema-validation.txt
  ```

  **Evidence to Capture**:
  - [ ] Schema definition output
  - [ ] Build output
  - [ ] Validation test output

  **Commit**: YES (groups with 2–8)
  - Message: `feat(shared-types): add fleet photo schemas and vehicle category types`
  - Files: `packages/shared-types/src/schemas/*`, `packages/shared-types/src/index.ts`
  - Pre-commit: `npm run typecheck -w @cermont/shared-types && npm run build -w @cermont/shared-types && npm run contracts:check`

- [x] 2. **Evidence form + PDF Zod schemas**
- [x] 3. **Cost tracking Zod schemas + types**
- [x] 4. **ERP connector Zod schemas**

  **What to do**:
  - Create `ErpConnectionConfigSchema`: `provider`, `endpoint`, `apiKey?`, `syncInterval`, `enabled`
  - Create `ErpSyncStatusSchema`: `lastSyncAt`, `status`, `recordsSynced`, `errors[]`, `nextSyncAt`
  - Create `ErpMappingSchema`: `sourceField`, `targetField`, `transformation?`, `required`
  - Export from shared-types

  **Must NOT do**:
  - No storing API keys in Zod (handled at env/config level)
  - No `any`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`zod`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 1
  **Blocks**: Tasks 17, 18, 29, 30
  **Blocked By**: None

  **References**:
  - `backend/src/modules/erp-connector/` — Existing ERP module
  - `frontend/src/modules/erp-connector/` — Existing frontend ERP module

  **Acceptance Criteria**: typecheck + build + contracts:check all PASS
  **Commit**: YES (groups with 1–3, 5–8)

- [x] 5. **Maintenance preventive Zod schemas**
- [x] 6. **FileAsset category enum extension**
- [x] 7. **Domain/role permission updates**

  **What to do**:
  - Add permission checks in `packages/domain` if missing for:
    - `fleet:upload-photo`
    - `fleet:delete-photo`
    - `evidence:generate-pdf`
    - `costs:view-detailed`
    - `erp:sync`
    - `maintenance:schedule-preventive`
  - Map permissions to appropriate roles per existing patterns

  **Must NOT do**:
  - No hardcoded roles in frontend components (use domain helpers)
  - No breaking existing permission names

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] — simple type additions
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 1
  **Blocks**: Tasks 9–33 (permission enforcement)
  **Blocked By**: None

  **References**:
  - `packages/domain/src/` — Existing role/permission system
  - `docs/Intrucciones_para_crear_app_web/DOC-10` — API endpoints, roles and payloads

  **Acceptance Criteria**:
  - [ ] `npm run typecheck -w @cermont/domain` → PASS
  - [ ] `npm run build -w @cermont/domain` → PASS
  - **Commit**: YES (groups with 1–6, 8)

- [x] 8. **Snapshots + contracts baseline update**

  **What to do**:
  - Run `npm run contracts:check` to capture new schemas
  - Run `npm run quality:strict` to verify no baseline regression
  - Update snapshot hash in contracts guard

  **Must NOT do**:
  - No code changes — only administrative

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] — administrative
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 1 (last in group)
  **Blocks**: None (post-Wave 1 validation gate)
  **Blocked By**: Tasks 1–7

  **Acceptance Criteria**:
  - [ ] `npm run contracts:check` → PASS
  - [ ] `npm run quality:strict` → PASS (no regression)
  - **Commit**: YES (groups with 1–7)

---

### WAVE 2 — Backend Endpoints

- [x] 9. **Fleet photo upload endpoint**

  **What to do**:
  - Add `POST /api/fleet/:id/photos` to `backend/src/modules/fleet/fleet.routes.ts`
  - Add `fleetPhotoUpload` controller method: receives `multipart/form-data` with file + `category` + `description`
  - Add `fleetPhotoUpload` service method: validates file type/size, saves via file service, creates FileAsset record with `ownerType: 'vehicle'`, `ownerId: vehicleId`, category
  - Use existing multer/sharp pipeline for image processing
  - Apply RBAC middleware for `fleet:upload-photo`
  - Return FileAssetRef response
  - Add Zod validation for body/query/params

  **Must NOT do**:
  - No direct file handling outside multer/sharp pipeline
  - No `any` on file metadata
  - No bypass of existing file validation

  **Recommended Agent Profile**:
  - **Category**: `deep` — new endpoint in existing module, file upload handling
  - **Skills**: [`nodejs-express-server`] — Express route/controller/service pattern; [`zod`] — input validation
  - **Skills Evaluated but Omitted**: none

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 10–21 except those depending on same module)
  - **Parallel Group**: Wave 2 (with Tasks 10, 11)
  - **Blocks**: Tasks 22, 23 (frontend uses this endpoint)
  - **Blocked By**: Tasks 1, 6, 7

  **References**:
  - `backend/src/modules/fleet/fleet.routes.ts` — Existing fleet routes (add middleware chain)
  - `backend/src/modules/fleet/fleet.controller.ts` — Add controller method
  - `backend/src/modules/fleet/fleet.service.ts` — Add service method
  - `backend/src/modules/files/` — Existing file upload handling pattern
  - `backend/src/middlewares/upload.ts` — Multer/sharp config

  **Acceptance Criteria**:
  - [ ] `POST /api/fleet/:id/photos` returns 201 with FileAssetRef
  - [ ] Invalid file type returns 400 with typed error
  - [ ] Unauthorized access returns 401/403
  - [ ] `npm run typecheck -w backend` → PASS
  - [ ] `npm run test -w backend` → PASS

  **QA Scenarios**:
  ```
  Scenario: Upload vehicle photo — happy path
    Tool: Bash (curl)
    Preconditions: Backend running, auth token for role with fleet:upload-photo permission
    Steps:
      1. curl -X POST /api/fleet/:id/photos -H "Authorization: Bearer $TOKEN" -F "file=@test-photo.jpg" -F "category=front" -F "description=Vista frontal"
    Expected Result: 201 response with { success: true, data: { id, url, category: "front" } }
    Evidence: .sisyphus/evidence/task-9-upload-success.txt

  Scenario: Upload invalid file type
    Tool: Bash (curl)
    Preconditions: Backend running, valid auth token
    Steps:
      1. curl -X POST /api/fleet/:id/photos -H "Authorization: Bearer $TOKEN" -F "file=@test.exe" -F "category=front"
    Expected Result: 400 response with validation error
    Evidence: .sisyphus/evidence/task-9-upload-rejected.txt
  ```

  **Commit**: NO (groups with 10, 11)

- [x] 10. **Fleet photo gallery/list endpoint**

  **What to do**:
  - Add `GET /api/fleet/:id/photos` to fleet routes
  - Add `fleetPhotoList` controller: query FileAssets with `ownerType: 'vehicle'`, `ownerId: id`
  - Add optional query params: `category`, `sort` (uploadedAt desc by default)
  - Return paginated response with `meta` envelope
  - Support RBAC read access

  **Must NOT do**:
  - No exposing internal storage paths
  - No `any`

  **Recommended Agent Profile**:
  - **Category**: `quick` — simple query endpoint, follows existing pattern
  - **Skills**: [`nodejs-express-server`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2 (with 9, 11-21)
  **Blocks**: Tasks 22, 24
  **Blocked By**: Tasks 1, 6

  **References**: Same as Task 9

  **Acceptance Criteria**:
  - [ ] `GET /api/fleet/:id/photos` returns paginated file list
  - [ ] Category filter works
  - [ ] Tests pass
  - **Commit**: NO (groups with 9, 11)

- [x] 11. **Fleet readiness score update with photo status**

  **What to do**:
  - Update fleet service to calculate readiness based on:
    - Required photos uploaded (front, back, left, right, plate)
    - Required documents (SOAT, technomechanical, insurance)
    - Expiry status of documents
  - Add `GET /api/fleet/:id/readiness` endpoint or use existing readiness endpoint
  - Return structured readiness with per-category status
  - Do NOT break existing readiness.ts frontend code — extend the response

  **Must NOT do**:
  - No changes to readiness.ts type signatures without updating consumers

  **Recommended Agent Profile**:
  - **Category**: `deep` — business logic for readiness scoring
  - **Skills**: [`nodejs-express-server`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2
  **Blocks**: Task 24
  **Blocked By**: Tasks 1, 6, 7

  **References**:
  - `frontend/src/modules/fleet/readiness.ts` — Existing readiness logic
  - `frontend/src/modules/fleet/readiness.test.ts` — Existing readiness tests

  **Acceptance Criteria**:
  - [ ] Readiness score returns per-category status
  - [ ] Photo status (uploaded/missing) affects readiness
  - [ ] Tests pass
  - **Commit**: NO (groups with 9, 10)

- [ ] 12. **Evidence creation endpoint with title/category/photos**

  **What to do**:
  - Add/update `POST /api/evidences` in evidence module
  - Accept form body with: `title`, `description`, `category`, `photos[]` (file refs), `capturedAt`, `gps?`, `orderId?`, `vehicleId?`, `toolId?`
  - Create `EvidenceRecord` with full metadata
  - Link to existing FileAsset records for photo references
  - Apply RBAC for evidence creation
  - Return created evidence response

  **Must NOT do**:
  - No duplicating file storage logic (use existing FileAsset module)
  - No `any`

  **Recommended Agent Profile**:
  - **Category**: `deep` — new endpoint with relationships to FileAsset, Order, Vehicle
  - **Skills**: [`nodejs-express-server`], [`zod`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2
  **Blocks**: Tasks 25, 26
  **Blocked By**: Tasks 2, 7

  **References**:
  - `backend/src/modules/evidence/evidence.service.ts` — Existing evidence service
  - `backend/src/modules/evidence/evidence.controller.ts` — Existing evidence controller
  - `backend/src/modules/files/` — File storage module

  **Acceptance Criteria**:
  - [ ] `POST /api/evidences` returns 201 with evidence + linked files
  - [ ] Missing required fields return 400
  - [ ] Tests pass
  - **Commit**: NO (groups with 13, 14)

- [ ] 13. **Evidence PDF generation endpoint**

  **What to do**:
  - Add `POST /api/evidences/:id/pdf` endpoint
  - Create service method that:
    1. Fetches evidence with all photos
    2. Generates PDF using pdf-lib (existing dependency)
    3. Includes title, description, category, timestamp, photo placeholders/thumbnails
    4. Saves generated PDF as FileAsset with `ownerType: 'evidence'`, `category: 'report_support'`
  - Add `GET /api/evidences/:id/pdf` to download generated PDF
  - Apply RBAC

  **Must NOT do**:
  - No hardcoded PDF templates (use data-driven approach)
  - No breaking pdf-lib usage patterns

  **Recommended Agent Profile**:
  - **Category**: `deep` — PDF generation with pdf-lib
  - **Skills**: [`nodejs-express-server`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2
  **Blocks**: Task 26
  **Blocked By**: Tasks 2, 12

  **References**:
  - `backend/src/services/pdf-generator.ts` if exists, or `backend/src/modules/report/` — Existing PDF generation patterns
  - `backend/package.json` — pdf-lib dependency confirmed

  **Acceptance Criteria**:
  - [ ] `POST /api/evidences/:id/pdf` returns PDF file URL
  - [ ] Generated PDF contains evidence title + metadata
  - [ ] Tests pass
  - **Commit**: NO (groups with 12, 14)

- [ ] 14. **Evidence download audit endpoint**

  **What to do**:
  - Add audit logging on evidence PDF download/view
  - Register audit event `EVIDENCE_DOWNLOADED` with: `userId`, `evidenceId`, `timestamp`, `ip?`, `userAgent?`
  - Use existing audit module if present, or create minimal audit record
  - Add `GET /api/evidences/:id/download-audit` for admin to view download history

  **Must NOT do**:
  - No logging full file contents
  - No exposing user IPs without necessity

  **Recommended Agent Profile**:
  - **Category**: `quick` — audit pattern
  - **Skills**: [`nodejs-express-server`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2
  **Blocks**: Task 26 (download button with audit)
  **Blocked By**: Tasks 2, 7

  **References**:
  - `backend/src/modules/audit/` — Existing audit module if present
  - `backend/src/modules/evidence/` — Evidence module

  **Acceptance Criteria**:
  - [ ] Download triggers audit log
  - [ ] Admin can query download history
  - [ ] Tests pass
  - **Commit**: NO (groups with 12, 13)

- [ ] 15. **Cost breakdown endpoint**

  **What to do**:
  - Add `GET /api/orders/:orderId/costs` to order or cost routes
  - Return cost breakdown: by category, budget vs actual, totals, variance
  - Use existing cost module service
  - Return `CostSummary` response per new schema
  - Apply RBAC

  **Must NOT do**:
  - No modifying existing cost schema shape
  - No `any`

  **Recommended Agent Profile**:
  - **Category**: `deep` — cost aggregation logic
  - **Skills**: [`nodejs-express-server`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2
  **Blocks**: Tasks 27, 28
  **Blocked By**: Tasks 3, 7

  **References**:
  - `backend/src/modules/cost/cost.service.ts` — Existing cost service
  - `backend/src/modules/order/` — Order module for route binding

  **Acceptance Criteria**:
  - [ ] `GET /api/orders/:orderId/costs` returns budget vs actual
  - [ ] Empty costs return valid empty response
  - [ ] Tests pass
  - **Commit**: NO (groups with 16)

- [ ] 16. **Cost tracking update endpoint**

  **What to do**:
  - Add `POST /api/orders/:orderId/costs` to create/update cost entries
  - Accept `CostEntryInput` payload
  - Validate against budget limits (optional warning if over budget)
  - Return updated cost summary
  - Apply RBAC for `costs:create`

  **Must NOT do**:
  - No allowing negative amounts
  - No `any`

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`nodejs-express-server`], [`zod`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2
  **Blocks**: Task 28
  **Blocked By**: Tasks 3, 15

  **Acceptance Criteria**:
  - [ ] Cost entry created successfully
  - [ ] Over-budget warning returned
  - [ ] Tests pass
  - **Commit**: NO (groups with 15)

- [ ] 17. **ERP connector sync status endpoint**

  **What to do**:
  - Add `GET /api/erp-connector/status` to erp-connector routes
  - Return current connection status, last sync time, records synced count, errors
  - Add `POST /api/erp-connector/sync` to trigger sync manually
  - Add Zod validation for sync trigger payload
  - Apply admin RBAC

  **Must NOT do**:
  - No storing plaintext API keys in response
  - No exposing internal network details

  **Recommended Agent Profile**:
  - **Category**: `deep` — ERP sync orchestration
  - **Skills**: [`nodejs-express-server`], [`nodejs-backend-patterns`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2
  **Blocks**: Tasks 29, 30
  **Blocked By**: Tasks 4, 7

  **References**:
  - `backend/src/modules/erp-connector/` — Existing ERP connector module
  - `frontend/src/modules/erp-connector/` — Frontend ERP module

  **Acceptance Criteria**:
  - [ ] Status endpoint returns sync info
  - [ ] Sync trigger executes without error
  - [ ] Tests pass
  - **Commit**: NO (groups with 18)

- [ ] 18. **ERP connector mapping validation endpoint**

  **What to do**:
  - Add `GET /api/erp-connector/mappings` to list field mappings
  - Add `POST /api/erp-connector/mappings/validate` to test a mapping against sample data
  - Return validation result: `valid`, `errors[]`, `warnings[]`
  - Apply admin RBAC

  **Must NOT do**:
  - No storing source data temporarily (validate in-memory)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`nodejs-express-server`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2
  **Blocks**: Task 30
  **Blocked By**: Tasks 4, 17

  **Acceptance Criteria**:
  - [ ] Mapping validation returns correct status
  - [ ] Tests pass
  - **Commit**: NO (groups with 17)

- [ ] 19. **Maintenance preventive schedule CRUD**

  **What to do**:
  - Add full CRUD for preventive maintenance schedules in maintenance module
  - Routes: `GET /api/maintenance/schedules`, `POST /api/maintenance/schedules`, `PATCH /api/maintenance/schedules/:id`, `DELETE /api/maintenance/schedules/:id`
  - Apply Zod validation for all inputs
  - Apply RBAC: gerente/residente can manage, others read-only
  - Link to assets (vehicles/tools) via `assetId` + `assetType`

  **Must NOT do**:
  - No hardcoded asset type strings (use enum)
  - No `any`

  **Recommended Agent Profile**:
  - **Category**: `deep` — full CRUD module
  - **Skills**: [`nodejs-express-server`], [`zod`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2 (with 20)
  **Blocks**: Tasks 31, 32
  **Blocked By**: Tasks 5, 7

  **References**:
  - `backend/src/modules/maintenance/` — Existing maintenance module
  - `backend/src/modules/tool/` — Tool module for asset reference

  **Acceptance Criteria**:
  - [ ] Full CRUD works
  - [ ] Zod validation enforced
  - [ ] RBAC enforced
  - [ ] Tests pass
  - **Commit**: NO (groups with 20, 21)

- [ ] 20. **Maintenance log create/list endpoint**

  **What to do**:
  - Add `GET /api/maintenance/:assetId/logs` to list maintenance history
  - Add `POST /api/maintenance/:assetId/logs` to create maintenance log entry
  - Each log entry: `scheduleId?`, `completedAt`, `completedBy`, `observations`, `cost`, `nextScheduledAt`
  - Link to asset readiness calculation
  - Apply RBAC

  **Must NOT do**:
  - No allowing log creation without completion details

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`nodejs-express-server`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2
  **Blocks**: Task 32
  **Blocked By**: Tasks 5, 19

  **Acceptance Criteria**:
  - [ ] Log created with all fields
  - [ ] Log history queryable by asset
  - [ ] Tests pass
  - **Commit**: NO (groups with 19, 21)

- [ ] 21. **Service case SLA status endpoint**

  **What to do**:
  - Add `GET /api/service-cases/:id/sla` to return SLA status for a service case
  - Calculate: `responseDeadline`, `resolutionDeadline`, `isOverdue`, `remainingTime`, `escalationLevel`
  - Use existing sla module if present
  - Apply RBAC (read access)
  - Return structured SLA data

  **Must NOT do**:
  - No hardcoded SLA thresholds (read from config)

  **Recommended Agent Profile**:
  - **Category**: `deep` — calculation logic with deadlines
  - **Skills**: [`nodejs-express-server`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 2
  **Blocks**: Task 33
  **Blocked By**: Tasks 5, 7

  **References**:
  - `backend/src/modules/sla/` — Existing SLA module
  - `backend/src/modules/service-cases/` — Service cases module
  - `backend/src/modules/maintenance/` — Maintenance module for linking

  **Acceptance Criteria**:
  - [ ] SLA status returned correctly
  - [ ] Overdue detection works
  - [ ] Tests pass
  - **Commit**: NO (groups with 19, 20)

---

### WAVE 3 — Frontend Pages & Components

- [ ] 22. **Fleet photo gallery component**

  **What to do**:
  - Create `FleetPhotoGallery` component in `frontend/src/modules/fleet/ui/`
  - Use `AttachmentGallery` component with `entityType: 'vehicle'`, `entityId: vehicleId`
  - Add category filter tabs: "Todas", "Frontal", "Trasera", "Laterales", "Placa", "Odómetro", "Interior", "Daños"
  - Add photo count per category
  - Use existing queries.ts hook for fleet data
  - Show loading/error/empty states
  - Mobile responsive grid

  **Must NOT do**:
  - No duplicating AttachmentGallery — reuse it
  - No business logic in component

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — UI component with state management
  - **Skills**: [`tailwind-css-patterns`] — responsive grid; [`vercel-react-best-practices`] — component patterns
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3 (with 23–33)
  **Blocks**: None (leaf component)
  **Blocked By**: Tasks 9, 10

  **References**:
  - `frontend/src/modules/files/ui/AttachmentGallery.tsx` — Reusable gallery (already integrated)
  - `frontend/src/modules/fleet/ui/` — Fleet UI components directory
  - `frontend/src/modules/fleet/api/fleet-api.ts` — Fleet API calls

  **Acceptance Criteria**:
  - [ ] Gallery renders with category filter tabs
  - [ ] Loading state shows skeleton
  - [ ] Empty state shows "No hay fotos"
  - [ ] Mobile responsive
  - **Evidence**: `.sisyphus/evidence/task-22-gallery-screenshot.png`
  - **Commit**: NO (groups with 23, 24)

- [ ] 23. **Fleet camera capture integration**

  **What to do**:
  - Add "Tomar foto" button to fleet detail page using `CameraCapture` component (from files module)
  - On photo capture: upload to `POST /api/fleet/:id/photos`
  - Show upload progress indicator
  - After upload complete: refresh gallery
  - Handle camera permissions with graceful error
  - Fallback to file upload if camera unavailable

  **Must NOT do**:
  - No direct `fetch` calls (use apiClient)
  - No `any`

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — camera integration with upload flow
  - **Skills**: [`tailwind-css-patterns`]; [`vercel-react-best-practices`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3
  **Blocks**: None
  **Blocked By**: Tasks 1, 9

  **References**:
  - `frontend/src/modules/files/ui/CameraCapture.tsx` — Camera component (already recycled)
  - `frontend/src/modules/evidences/ui/EvidenceUploader.tsx` — Evidence upload pattern (uses CameraCapture)
  - `frontend/src/lib/http/api-client.ts` — API client

  **Acceptance Criteria**:
  - [ ] Camera opens and captures photo
  - [ ] Photo uploads and gallery refreshes
  - [ ] Error state on camera denial
  - **Evidence**: `.sisyphus/evidence/task-23-camera-screenshot.png`
  - **Commit**: NO (groups with 22, 24)

- [ ] 24. **Fleet readiness score display with photo status**

  **What to do**:
  - Update fleet detail page to show readiness score
  - Add readiness indicator: "Listo" (green), "Incompleto" (yellow), "Bloqueado" (red)
  - Show checklist of required photos and their status (uploaded/missing)
  - Show checklist of required documents and their status
  - Link to FleetPhotoGallery for adding missing photos
  - Use existing `readiness.ts` logic and extend

  **Must NOT do**:
  - No duplicating readiness calculation (use backend endpoint)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`tailwind-css-patterns`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3
  **Blocks**: None
  **Blocked By**: Tasks 11

  **References**:
  - `frontend/src/modules/fleet/readiness.ts` — Existing readiness logic
  - `frontend/src/app/(dashboard)/fleet/[id]/page.tsx` — Fleet detail page

  **Acceptance Criteria**:
  - [ ] Readiness score visible on fleet detail
  - [ ] Checklist shows photo/document status
  - [ ] Tests pass
  - **Evidence**: `.sisyphus/evidence/task-24-readiness-screenshot.png`
  - **Commit**: NO (groups with 22, 23)

- [ ] 25. **Evidence form component with title + photos**

  **What to do**:
  - Create `EvidenceForm` component in `frontend/src/modules/evidences/ui/`
  - Form fields: `title` (required), `description` (optional), `category` (select from existing categories), `photos[]` (using `CameraCapture` + `FileUploadField`), GPS (optional via `EvidenceGpsCapture`)
  - Use `react-hook-form` + `zodResolver` for validation
  - On submit: call `POST /api/evidences`
  - Show loading/success/error states
  - Integrate into evidence creation page/modal

  **Must NOT do**:
  - No `any` in form types
  - No business logic in component
  - No direct `fetch` (use apiClient + existing evidence hooks)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — form with camera integration
  - **Skills**: [`react-hook-form`] — form validation; [`zod`] — schema resolver
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3
  **Blocks**: None
  **Blocked By**: Tasks 2, 12

  **References**:
  - `frontend/src/modules/evidences/ui/EvidenceUploader.tsx` — Existing evidence upload pattern
  - `frontend/src/modules/evidences/hooks/useEvidenceUpload.ts` — Evidence hooks
  - `frontend/src/modules/files/ui/CameraCapture.tsx` — Camera component

  **Acceptance Criteria**:
  - [ ] Form renders with all required fields
  - [ ] Validation works (title required, photo required)
  - [ ] Submit creates evidence
  - [ ] Loading/error/empty states present
  - **Evidence**: `.sisyphus/evidence/task-25-form-screenshot.png`
  - **Commit**: NO (groups with 26)

- [ ] 26. **Evidence PDF preview/download button**

  **What to do**:
  - Add "Generar PDF" button to evidence detail page
  - On click: call `POST /api/evidences/:id/pdf`
  - Show generation progress (loading spinner)
  - After generation: show download link/button
  - Add PDF preview if browser supports it (embed tag)
  - Add download audit tracking (call backend audit endpoint)
  - Handle error state if generation fails

  **Must NOT do**:
  - No blocking UI while PDF generates (show progress)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`tailwind-css-patterns`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3
  **Blocks**: None
  **Blocked By**: Tasks 13, 14

  **References**:
  - `frontend/src/app/(dashboard)/evidences/` — Evidence pages

  **Acceptance Criteria**:
  - [ ] "Generar PDF" button visible
  - [ ] PDF generates and downloads
  - [ ] Error state on generation failure
  - **Evidence**: `.sisyphus/evidence/task-26-pdf-screenshot.png`
  - **Commit**: NO (groups with 25)

- [ ] 27. **Cost panel in order detail page**

  **What to do**:
  - Integrate `CostPanel` component into order detail page (`/orders/[id]`)
  - Fetch cost data from `GET /api/orders/:id/costs`
  - Show: total budget, total actual, variance, percentage used
  - Show breakdown by category with bar/progress indicators
  - Use existing `CostSummaryCard` and `CostBreakdownTable` components
  - Handle loading/error/empty states

  **Must NOT do**:
  - No modifying order detail page layout beyond adding panel
  - No `any`

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`tailwind-css-patterns`]; [`vercel-react-best-practices`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3
  **Blocks**: None
  **Blocked By**: Tasks 15

  **References**:
  - `frontend/src/modules/costs/ui/CostPanel.tsx` — Existing cost panel
  - `frontend/src/modules/costs/ui/CostSummaryCard.tsx` — Existing summary card
  - `frontend/src/modules/costs/ui/CostBreakdownTable.tsx` — Existing breakdown table
  - `frontend/src/app/(dashboard)/orders/[id]/page.tsx` — Order detail page

  **Acceptance Criteria**:
  - [ ] Cost panel visible on order detail
  - [ ] Budget vs actual comparison renders
  - [ ] Loading/error/empty states
  - **Evidence**: `.sisyphus/evidence/task-27-cost-panel-screenshot.png`
  - **Commit**: NO (groups with 28)

- [ ] 28. **Cost execution tracking form**

  **What to do**:
  - Create `ExecutionCostForm` component for field workers to log costs during execution
  - Form fields: `category` (select: materials, labor, transport, equipment, other), `description`, `amount`, `date`
  - On submit: call `POST /api/orders/:orderId/costs`
  - Integrate into execution page (`/orders/[id]/execution`)
  - Show recent cost entries below form
  - Validation with Zod schema

  **Must NOT do**:
  - No allowing negative costs
  - No `any`

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`react-hook-form`]; [`zod`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3
  **Blocks**: None
  **Blocked By**: Tasks 16

  **References**:
  - `frontend/src/app/(dashboard)/orders/[id]/execution/page.tsx` — Execution page
  - `frontend/src/modules/costs/ui/CostForm.tsx` — Existing cost form

  **Acceptance Criteria**:
  - [ ] Form renders with category/description/amount
  - [ ] Submit creates cost entry
  - [ ] Validation enforces required fields
  - **Evidence**: `.sisyphus/evidence/task-28-exec-cost-form-screenshot.png`
  - **Commit**: NO (groups with 27)

- [ ] 29. **ERP connector admin page**

  **What to do**:
  - Create/update ERP connector page at `/admin/erp-connectors`
  - Show connection status: connected/disconnected, last sync, records synced
  - Show configuration form: endpoint URL, sync interval, enabled toggle
  - Show error log with retry buttons
  - Use TanStack Query for data fetching
  - Apply admin RBAC

  **Must NOT do**:
  - No exposing full API keys in UI
  - No `any`

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`tailwind-css-patterns`]; [`vercel-react-best-practices`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3
  **Blocks**: None
  **Blocked By**: Tasks 17

  **References**:
  - `frontend/src/modules/erp-connector/` — Existing ERP frontend module
  - `frontend/src/app/(dashboard)/admin/` — Admin pages

  **Acceptance Criteria**:
  - [ ] Status panel shows connection state
  - [ ] Sync trigger works
  - [ ] Error log displays
  - **Evidence**: `.sisyphus/evidence/task-29-erp-screenshot.png`
  - **Commit**: NO (groups with 30)

- [ ] 30. **ERP connector sync trigger UI**

  **What to do**:
  - Add "Sincronizar ahora" button to ERP page
  - Show sync progress (in progress, last sync time)
  - Show mapping validation status (valid/invalid fields)
  - Allow testing a single mapping
  - Handle error state with retry

  **Must NOT do**:
  - No allowing concurrent syncs (disable button while syncing)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`tailwind-css-patterns`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3
  **Blocks**: None
  **Blocked By**: Tasks 18

  **Acceptance Criteria**:
  - [ ] Sync button triggers POST
  - [ ] Progress indicator shown
  - [ ] Success/error feedback
  - **Evidence**: `.sisyphus/evidence/task-30-erp-sync-screenshot.png`
  - **Commit**: NO (groups with 29)

- [ ] 31. **Maintenance preventive schedule UI**

  **What to do**:
  - Create preventive maintenance page at `/maintenance/schedules`
  - Show list of schedules: asset, task name, interval, next due date, status
  - Create form for new schedule: asset selector, task name, interval days, description, required documents
  - Edit/delete existing schedules
  - Show overdue/upcoming labels

  **Must NOT do**:
  - No hardcoded asset list (use existing selectors)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`react-hook-form`]; [`tailwind-css-patterns`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3
  **Blocks**: None
  **Blocked By**: Tasks 19

  **References**:
  - `frontend/src/app/(dashboard)/maintenance/` — Existing maintenance pages
  - `frontend/src/modules/maintenance/` — Maintenance module
  - `frontend/src/modules/entity-selectors/` — Entity selector components

  **Acceptance Criteria**:
  - [ ] Schedule list renders with status
  - [ ] Create/edit form works
  - [ ] Overdue detection visible
  - **Evidence**: `.sisyphus/evidence/task-31-maintenance-scheduler-screenshot.png`
  - **Commit**: NO (groups with 32, 33)

- [ ] 32. **Maintenance work order integration**

  **What to do**:
  - Show maintenance history in work order detail page
  - Add "Registrar mantenimiento" button in work order page
  - Link maintenance log to current work order
  - Show equipment readiness status for assigned assets

  **Must NOT do**:
  - No modifying work order status from maintenance log

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`vercel-react-best-practices`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3
  **Blocks**: None
  **Blocked By**: Tasks 20

  **Acceptance Criteria**:
  - [ ] Maintenance log visible in order detail
  - [ ] "Registrar mantenimiento" works
  - **Evidence**: `.sisyphus/evidence/task-32-maintenance-order-relation-screenshot.png`
  - **Commit**: NO (groups with 31, 33)

- [ ] 33. **SLA status indicator component**

  **What to do**:
  - Create `SlaStatusIndicator` component showing: status (on-track/warning/overdue), remaining time, escalation level
  - Integrate into service case detail and maintenance pages
  - Color-coded: green (on-track), yellow (at-risk), red (overdue)
  - Click to show details tooltip/modal
  - Auto-refresh every 60s using TanStack Query refetchInterval

  **Must NOT do**:
  - No hardcoded SLA values

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`tailwind-css-patterns`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 3
  **Blocks**: None
  **Blocked By**: Tasks 21

  **Acceptance Criteria**:
  - [ ] Indicator shows correct status
  - [ ] Color coding works
  - [ ] Tooltip shows details
  - **Evidence**: `.sisyphus/evidence/task-33-sla-screenshot.png`
  - **Commit**: NO (groups with 31, 32)

---

### WAVE 4 — Integration, Tests & Docs

- [ ] 34. **Fleet photo E2E test**

  **What to do**:
  - Create Playwright E2E test: fleet detail page → take photo → verify gallery
  - Test: open fleet/[id], click "Tomar foto", capture, confirm, verify photo appears in gallery
  - Test: upload photo from file, verify category filter
  - Save evidence screenshots

  **Must NOT do**:
  - No testing on actual hardware camera (mock getUserMedia)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — E2E test
  - **Skills**: [`playwright-best-practices`] — Playwright testing patterns
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 4 (with 35-40)
  **Blocks**: None
  **Blocked By**: Tasks 22, 23

  **References**:
  - `frontend/tests/e2e/` — Existing E2E test patterns
  - `frontend/playwright.config.ts` — Playwright config

  **Acceptance Criteria**:
  - [ ] E2E test passes
  - [ ] Screenshots captured as evidence
  - **Commit**: NO (groups with 35-40)

- [ ] 35. **Evidence form + PDF E2E test**

  **What to do**:
  - Create Playwright E2E test: evidence page → fill form → add photos → generate PDF → verify download
  - Test with both camera mock and file upload
  - Verify PDF generation endpoint returns valid PDF

  **Must NOT do**:
  - No testing actual PDF content (verify existence only)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright-best-practices`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 4
  **Blocks**: None
  **Blocked By**: Tasks 25, 26

  **Acceptance Criteria**:
  - [ ] E2E test passes
  - **Commit**: NO (groups with 34, 36-40)

- [ ] 36. **Cost tracking integration test**

  **What to do**:
  - Create backend integration test: create order → add budget costs → add actual costs → verify cost summary
  - Create frontend component test: CostPanel renders with mock data
  - Test budget vs actual calculation accuracy

  **Must NOT do**:
  - No testing with real financial data in CI

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vitest`] — Vitest testing patterns
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 4
  **Blocks**: None
  **Blocked By**: Tasks 15, 16, 27, 28

  **Acceptance Criteria**:
  - [ ] Integration test passes
  - [ ] Component test passes
  - **Commit**: NO (groups with 34, 35, 37-40)

- [ ] 37. **ERP connector integration test**

  **What to do**:
  - Create backend test: configure ERP connector → trigger sync → verify status update
  - Create mapping validation test: valid mapping passes, invalid mapping fails
  - Test error handling for unreachable endpoints

  **Must NOT do**:
  - No testing against real external ERP (mock responses)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vitest`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 4
  **Blocks**: None
  **Blocked By**: Tasks 17, 18, 29, 30

  **Acceptance Criteria**:
  - [ ] Integration tests pass
  - **Commit**: NO (groups with 34-36, 38-40)

- [ ] 38. **Maintenance module integration test**

  **What to do**:
  - Create backend test: create preventive schedule → create maintenance log → verify schedule history
  - Test SLA calculation: case within SLA, case approaching deadline, overdue case
  - Test readiness score with and without recent maintenance

  **Must NOT do**:
  - No testing with real time-sensitive data (mock dates)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vitest`]
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 4
  **Blocks**: None
  **Blocked By**: Tasks 19, 20, 21, 31, 32, 33

  **Acceptance Criteria**:
  - [ ] Integration tests pass
  - **Commit**: NO (groups with 34-37, 39-40)

- [ ] 39. **Full verify pipeline run**

  **What to do**:
  - Run `npm run typecheck` — fix any type errors
  - Run `npm run lint` — fix any lint errors
  - Run `npm run test` — ensure all 1091+ tests pass
  - Run `npm run build` — verify production build succeeds
  - Run `npm run contracts:check` — verify contract snapshot
  - Run `npm run quality:strict` — verify no regression
  - Run `npx react-doctor@latest` — verify score 100/100
  - Run `npm run test:e2e -w frontend` — verify E2E tests pass
  - Document any issues found

  **Must NOT do**:
  - No skipping failed gates

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [] — orchestration
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: NO (sequential — one gate after another)
  **Blocks**: Task 40
  **Blocked By**: Tasks 34-38

  **Acceptance Criteria**:
  - [ ] typecheck: PASS
  - [ ] lint: PASS
  - [ ] test: PASS
  - [ ] build: PASS
  - [ ] contracts:check: PASS
  - [ ] quality:strict: PASS
  - [ ] react-doctor: 100/100
  - **Commit**: NO (groups with 40)

- [ ] 40. **Documentation updates**

  **What to do**:
  - Update `docs/DEVELOPMENT_STATUS.md` — mark fleet photos, evidence PDF, cost tracking, ERP, maintenance as improved
  - Update `docs/API_STATUS.md` — add new endpoints
  - Update `docs/TECHNICAL_DEBT.md` — close resolved items
  - Update `docs/CHANGELOG.md` — add 5 vertical slices
  - Add JSDoc comments to new components and services
  - Document new permissions in domain package

  **Must NOT do**:
  - No empty documentation (each entry must be meaningful)
  - No marking items as done without verification

  **Recommended Agent Profile**:
  - **Category**: `writing` — documentation
  - **Skills**: [] — prose
  - **Skills Evaluated but Omitted**: none

  **Parallelization**: YES, Wave 4
  **Blocks**: None
  **Blocked By**: Tasks 39

  **Acceptance Criteria**:
  - [ ] All doc files updated
  - [ ] CHANGELOG entry created
  - **Commit**: NO (groups with 39)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> Do NOT auto-proceed after verification. Wait for user's explicit approval.

- [ ] F1. **Plan Compliance Audit** (`oracle`)
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run test). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** (`unspecified-high`)
  Run `npm run typecheck` + `npm run lint` + `npm run test` + `npm run build`. Review changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod, commented-out code, unused imports.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Real Manual QA** (`unspecified-high` + `playwright` skill)
  Execute EVERY QA scenario from EVERY task — exact steps, capture evidence. Test cross-task integration. Test edge cases: empty state, invalid input. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** (`deep`)
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything built, nothing beyond spec. Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **Wave 1** (Tasks 1–8): `feat(shared-types): add fleet photo, evidence PDF, cost tracking, ERP, and maintenance schemas`
- **Wave 2** (Tasks 9–21): Per-module commits:
  - `feat(fleet): add photo upload, gallery, and readiness endpoints`
  - `feat(evidence): add evidence form with PDF generation and download audit`
  - `feat(costs): add cost breakdown and tracking endpoints`
  - `feat(erp): add sync status and mapping validation endpoints`
  - `feat(maintenance): add preventive schedule, maintenance log, and SLA endpoints`
- **Wave 3** (Tasks 22–33): Per-module frontend commits
- **Wave 4** (Tasks 34–40): `test: add integration and E2E tests for 5 vertical slices`

Pre-commit per group:
```bash
npm run typecheck && npm run lint && npm run test && npm run build && npm run contracts:check
```

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck        # → PASS (no errors)
npm run lint             # → PASS (0 issues)
npm run test             # → PASS (1091+ tests)
npm run build            # → PASS
npm run contracts:check  # → PASS
npm run quality:strict   # → PASS (no regression)
npx react-doctor@latest  # → 100/100 (no issues)
```

### Final Checklist
- [ ] Fleet photos: upload, camera capture, gallery, category filter — all working
- [ ] Evidence form with title + photos → submit creates evidence
- [ ] Evidence PDF: generation → download → audit tracking
- [ ] Cost tracking: breakdown by category, budget vs actual, execution form
- [ ] ERP connector: sync status, mapping validation, trigger sync
- [ ] Maintenance: preventive schedule CRUD, logs, SLA indicator
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All gates pass
- [ ] React Doctor 100/100
- [ ] Documentation updated
