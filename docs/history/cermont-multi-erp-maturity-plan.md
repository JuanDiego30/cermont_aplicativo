# Cermont Multi-ERP Maturity & Orchestration Plan (Enhanced)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mature the Cermont application into a robust multi-ERP platform (FSSM, GMAO/CSM) by resolving architectural flaws, digitizing all PDF business formats as dynamic templates, and engineering a pluggable ERP abstraction layer inspired by production-grade open-source FSM/CMMS systems.

**Architecture:** Three-layer design: (1) Core operational pipeline enhanced with backend-enforced workflow engine (inspired by Field Platform strict state machines), (2) ERP abstraction layer with FSSM/GMAO/CSM adapters (inspired by FlexDesk manager pattern), (3) Document-driven template engine with dynamic forms (inspired by InspectionPress field inspection OS). Each layer communicates via shared Zod contracts, with RBAC at perimeter and version-based optimistic concurrency.

**Research Sources (Professional Open-Source References):**
| System | Type | Key Patterns |
|--------|------|-------------|
| [Field Platform](https://github.com/SleimaD/field-platform) | FSM | Backend-enforced state machine, version-based concurrency, cursor-based sync |
| [FieldOpt](https://github.com/sys-ae/fieldopt) | Dispatch | AG Grid dispatch console, auto-router, skill-based matching, geofencing |
| [FlexDesk](https://github.com/Paulo-BatistaFerraz/flexdesk) | FSM | Manager pattern, RLS multi-tenant, offline-first sync, job geofence machine |
| [FieldOps Hub](https://github.com/michaelstoffer/fieldops-hub) | FSM | Technician PWA, background sync, 2FA, granular RBAC |
| [Liberu Maintenance](https://github.com/liberu-maintenance/maintenance-laravel) | CMMS | Modular architecture, sensor integration, RBAC, PM scheduler |
| [Atlas CMMS](https://github.com/Grashjs/cmms) | CMMS | Asset hierarchy tree, PM automation, KPI engine |
| [CMMS-THAMMASAT](https://github.com/KaThammasat/CMMS-THAMMASAT) | CMMS | MTTR/MTBF/OEE, AI predictive, Socket.IO real-time |
| [openMAINT](https://www.openmaint.org/) | CMMS | Enterprise SOA, CMDBuild config, georeference |
| [AmigoUK/CMMS](https://github.com/amigouk/cmms) | CMMS | Granular permissions matrix, multi-site, certifications |
| [GMAO-FACTORY](https://github.com/jsbsan/GMAO-FACTORY) | CMMS | Offline-first intranet, print templates, calendar |
| [InspectionPress](https://github.com/inspectionpress/inspection.press) | Field Ops | Dynamic forms, PWA, multi-tenant pricing, API-first |
| [ServiceMax/PTC](https://www.ptc.com/en/products/servicemax) | Enterprise | Asset-centric engine, FieldFX offline ticketing |

---

## Comprehensive Page-by-Page Audit Summary

### Critical Pages Needing Enhancement

| Route | Current Quality | Professional Pattern | Priority |
|-------|----------------|---------------------|----------|
| `/dashboard` | IMPLEMENTED — GSAP heavy, no real-time | Socket.IO real-time KPIs (CMMS-THAMMASAT) | HIGH |
| `/orders` (list) | IMPLEMENTED — basic table | AG Grid split-pane + multi-select + batch ops (FieldOpt) | HIGH |
| `/execution` | IMPLEMENTED — no route optimization | Auto-router with skill matching + haversine distance (FieldOpt) | HIGH |
| `/execution/new` | IMPLEMENTED — no geofence check | Geofence validation for DISPATCHED→IN_PROGRESS (FlexDesk) | CRITICAL |
| `/evidences` | IMPLEMENTED — basic upload | Batch upload with compression + reference cache (Field Platform) | MEDIUM |
| `/planning` | IMPLEMENTED — good structure | Must align exactly with 06_FORMATO_DE_PLANEACION_DE_OBRA.pdf | HIGH |
| `/reports` | IMPLEMENTED — no auto-generation | Print templates from GMAO-FACTORY | HIGH |
| `/admin/users` | IMPLEMENTED — basic RBAC | CRUD × role × module permissions matrix (AmigoUK/CMMS) | HIGH |

### Missing Routes (REQUIRED)

| Route | Priority | Professional Pattern |
|-------|----------|---------------------|
| `/costs` (dashboard) | HIGH | Budget vs actual with overrun alerts (Liberu Maintenance) |
| `/costs/catalog` | HIGH | Dynamic pricing catalog (InspectionPress) |
| `/assets` (hierarchy) | HIGH | Site→Zone→Location→Equipment tree (openMAINT) |
| `/assets/[id]` | HIGH | Equipment health scores + sensor data (CMMS-THAMMASAT) |
| `/dispatch` (console) | HIGH | AG Grid + auto-router + skill matching + map (FieldOpt) |
| `/admin/erp-connectors` | HIGH | Workspace-scoped integration settings (FlexDesk) |
| `/business-documents` | HIGH | Dynamic form templates (InspectionPress) |
| `/documents/templates/[id]/builder` | HIGH | Drag-and-drop field layout editor |
| `/maintenance/[id]/calendar` | MEDIUM | FullCalendar monthly view (GMAO-FACTORY) |

---

## Current State Audit Summary

### Architecture Verified
| Component | Count | Quality | Target |
|-----------|-------|---------|--------|
| Backend modules | ~40 | Good — routes/controllers/services | Manager pattern (Twenty CRM style) |
| Mongoose models | ~55 | Good — soft-delete, tenant isolation | Add version field for optimistic concurrency |
| Zod schemas (shared-types) | 100+ | Good — contract-first | Add OpenAPI 3.0 generation |
| Frontend app routes | ~80+ | Good — feature-sliced | Add AG Grid enterprise tables |
| Frontend modules | ~30+ | Good — api/hooks/ui/queries | Add WebSocket subscriptions |
| PDF business docs | 10 | Unused — need digitization | Dynamic form templates |

### Critical Gaps
1. **No backend-enforced state machine** — Must validate geofence, version, role server-side
2. **10 PDF formats not digitized** — SGSST (49pp), CCTV, lifelines, planning, hierarchy
3. **Missing dispatch console** — AG Grid + auto-router + skill matching + map (FieldOpt pattern)
4. **No version-based optimistic concurrency** — Risk of data conflicts in offline sync
5. **No cursor-based incremental sync** — Page-based sync can drift
6. **No geofencing** — Can't validate technician presence at job site
7. **Missing asset hierarchy** — Flat model, no Site→Zone→Location→Equipment tree
8. **No KPI engine** — MTTR, MTBF, OEE not calculated
9. **No WebSocket real-time** — Dashboard/Kanban polling-based
10. **Granular RBAC** — Need CRUD × role × module permission matrix

---

## Work Objectives

### Core Objective
Evolve Cermont from a single-workflow contractor platform into a mature multi-ERP system supporting FSSM and GMAO/CSM operational paradigms.

### Concrete Deliverables
- 10 PDF business formats digitized as dynamic templates
- AG Grid enterprise dispatch console with auto-routing
- Version-based optimistic concurrency on all 55+ models
- Cursor-based incremental sync engine
- Geofencing validation for field transitions
- ERP abstraction layer with FSSM + GMAO adapters
- Multi-variant workflow engine (Cermont/FSSM/GMAO)
- WebSocket real-time dashboard updates
- KPI engine (MTTR/MTBF/OEE)
- 6 missing routes implemented
- E2E tests for 4 critical flows
- All 10 documentation files updated

### Definition of Done
- [ ] `npm run verify` passes (typecheck + build)
- [ ] `npm run test` — all 1000+ tests green
- [ ] `npm run lint` — zero errors
- [ ] All 10 PDF formats usable as dynamic forms
- [ ] ERP connectors registered and passing health checks
- [ ] Geofencing validates field worker transitions
- [ ] WebSocket dashboard updates in <500ms

### Must Have
- Backend-enforced state machine with version+role+geofence validation
- Multi-ERP abstraction with FSSM + GMAO adapters
- Document-driven template engine digitizing all 10 PDF formats
- AG Grid enterprise dispatch console

### Must NOT Have
- No new database engines (MongoDB only)
- No new packages not in approved stack
- No breaking API changes without backward compatibility
- No removal of existing functionality

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: YES (TDD)
- **Framework**: Vitest + Playwright
- **QA**: Agent-executed scenarios for every task

### QA Policy
Every task includes agent-executed scenarios with evidence saved to `.sisyphus/evidence/`. Each scenario uses concrete selectors, data, assertions, and evidence paths.

---

## Execution Strategy

### Parallel Waves

```
Wave 1 (Foundation — start immediately, 4 parallel):
├── Task 1: Language audit [quick]
├── Task 2: Version concurrency plugin [deep]
├── Task 3: Missing page states [quick]
└── Task 4: Server/client component split [quick]

Wave 2 (Core infrastructure, 4 parallel):
├── Task 5: Business document backend [unspecified-high]
├── Task 6: Seed PDF templates [writing]
├── Task 8: ERP abstraction layer [deep]
└── Task 10: Multi-variant workflow engine [deep]

Wave 3 (Integrations, 4 parallel):
├── Task 7: Dynamic form renderer [visual-engineering]
├── Task 9: ERP management UI [visual-engineering]
├── Task 11: Geofencing service [unspecified-high]
├── Task 12: Cursor-based sync [deep]
└── Task 14: WebSocket real-time [deep]

Wave 4 (Enterprise features, 4 parallel):
├── Task 13: Offline sync manager [unspecified-high]
├── Task 15: KPI engine [unspecified-high]
├── Task 16: AG Grid dispatch console [visual-engineering]
├── Task 17: Auto-router engine [deep]
└── Task 21: Granular RBAC matrix [deep]

Wave 5 (Missing routes + testing, 4 parallel):
├── Task 18: Cost dashboard [visual-engineering]
├── Task 19: Asset hierarchy [visual-engineering]
├── Task 20: Template builder [visual-engineering]
└── Task 22: E2E tests [playwright]

Wave 6 (Quality + docs — sequential, 2 tasks):
├── Task 23: Quality gates [quick]
└── Task 24: Documentation [writing]
```

### Critical Path
Task 1 → Task 5 → Task 6 → Task 7 → Task 22 → Task 23 → Task 24

### Agent Dispatch Summary
- **Wave 1**: 4 tasks — 3 quick, 1 deep
- **Wave 2**: 4 tasks — 2 deep, 1 unspecified-high, 1 writing
- **Wave 3**: 5 tasks — 2 deep, 1 visual-engineering, 2 unspecified-high
- **Wave 4**: 5 tasks — 2 deep, 2 visual-engineering, 1 unspecified-high
- **Wave 5**: 4 tasks — 3 visual-engineering, 1 playwright
- **Wave 6**: 2 tasks — 1 quick, 1 writing

---

## TODOs

- [ ] 1. **Language Audit — Purge Non-English Identifiers**

  **What to do**:
  - Create `tooling/language-audit.sh` to find Spanish-named interfaces/types/variables
  - Rename all Spanish identifiers to English in shared-types
  - Update all backend and frontend imports
  
  **Files**: All `.ts`/`.tsx` in `packages/shared-types/src/`, `backend/src/`, `frontend/src/`

  **Renaming Map**:
  | Before | After |
  |--------|-------|
  | IOrdenTrabajo | IWorkOrder |
  | IFactura | IInvoice |
  | IActaEntrega | IDeliveryRecord |
  | IPlaneacion | IPlanningPacket |
  | IEjecucion | IExecutionSession |
  | IInforme | IReport |
  | IPago | IPayment |
  | IVisita | ISiteVisit |
  | ISolicitud | IWorkRequest |
  | ICosto | ICost |
  | IProveedor | ISupplier |
  | ICliente | IClient |
  | IUsuario | IUser |
  | IEquipo | IEquipment |
  | IHerramienta | ITool |

  **Agent Profile**: `quick` — systematic find-and-replace across typed files
  **Parallelization**: Can run independently | Wave 1 | Blocks: none | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: All Spanish interface names are gone
    Tool: Bash
    Steps:
      1. Run: grep -rn "interface IOrden\|interface IFactura\|interface IActa" packages/shared-types/src/ backend/src/ frontend/src/
      2. Assert count = 0
    Expected Result: Zero occurrences of Spanish-named interfaces
    Evidence: .sisyphus/evidence/task-01-language-audit.txt
  ```

- [ ] 2. **Add Version Field to All Domain Models (Optimistic Concurrency)**

  **What to do**:
  - Create `packages/shared-types/src/schemas/base-entity.schema.ts` with `syncVersion` field
  - Create `backend/src/models/plugins/optimistic-concurrency.ts` Mongoose plugin
  - Apply plugin to all ~55 Mongoose models
  
  **Files**:
  - Create: `packages/shared-types/src/schemas/base-entity.schema.ts`
  - Create: `backend/src/models/plugins/optimistic-concurrency.ts`
  - Modify: All 55 model files in `backend/src/models/*.ts`

  **Agent Profile**: `deep` — systematic application of plugin to all models, careful not to break existing queries
  **Parallelization**: Wave 1 | Blocks: Task 6 (sync endpoint) | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: Version increments on update
    Tool: Bash (curl)
    Steps:
      1. POST /api/orders with test data
      2. GET /api/orders/:id → note syncVersion=1
      3. PUT /api/orders/:id with update
      4. GET /api/orders/:id → assert syncVersion=2
    Expected Result: syncVersion increments on each write
    Evidence: .sisyphus/evidence/task-02-version-concurrency.txt

  Scenario: Version conflict is rejected
    Tool: Bash (curl)
    Steps:
      1. GET /api/orders/:id → get syncVersion=1
      2. PUT with syncVersion=1 → succeeds
      3. PUT again with syncVersion=1 → 409 Conflict
    Expected Result: Second write returns 409 with version conflict error
    Evidence: .sisyphus/evidence/task-02-version-conflict.txt
  ```

- [ ] 3. **Complete Missing Page States (Loading/Error/Empty/Offline)**

  **What to do**:
  - Create state-coverage audit tool at `tooling/state-audit.ts`
  - Add error.tsx for dispatch, fleet, inventory, notifications, forms, planning, sla
  - Add loading.tsx for pages without Suspense boundaries
  - Add offline-aware error handling using `isOfflineLikeError`
  - Add EmptyState for list pages

  **Must NOT do**: Don't refactor working components — only add missing states

  **Agent Profile**: `quick` — systematic addition of error/loading/empty files
  **Parallelization**: Wave 1 | Blocks: none | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: Error boundary catches API failure
    Tool: Playwright
    Preconditions: Backend is stopped
    Steps:
      1. Navigate to /orders
      2. Observe error boundary renders
      3. Click "Try again"
    Expected Result: Error page shows with retry button, retry triggers new request
    Evidence: .sisyphus/evidence/task-03-error-boundary.png

  Scenario: Loading skeleton shows during data fetch
    Tool: Playwright with slow network
    Steps:
      1. Navigate to /dashboard with network throttled to Slow 3G
      2. Observe skeleton UI
    Expected Result: Skeleton/spinner visible while data loads
    Evidence: .sisyphus/evidence/task-03-loading-state.png
  ```

- [ ] 4. **Optimize Server vs Client Component Split**

  **What to do**:
  - Audit all `"use client"` directives in `frontend/src/app/`
  - Split layout/static pages from interactive pages
  - Convert eligible pages: static metadata, pure layout, non-interactive lists

  **Agent Profile**: `quick`
  **Parallelization**: Wave 1 | Blocks: none | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: Build succeeds after component split
    Tool: Bash
    Steps:
      1. Run: npm run build -w frontend
      2. Check exit code
    Expected Result: Build succeeds (exit 0)
    Evidence: .sisyphus/evidence/task-04-build-success.txt
  ```

- [ ] 5. **Create Business Document Schema & Backend CRUD**

  **What to do**:
  - Create `packages/shared-types/src/schemas/business-document.schema.ts` with 8 document types
  - Update `backend/src/models/DocumentTemplate.ts` for business document support
  - Create `backend/src/modules/business-document/` with routes, controller, service
  - Register routes in `backend/src/index.ts`

  **Agent Profile**: `unspecified-high`
  **Parallelization**: Wave 2 | Blocks: Task 6 (seed) | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: Create business document via API
    Tool: Bash (curl)
    Steps:
      1. POST /api/business-documents with {documentType:"work_planning", formatType:"pdf", fieldMappings:[...]}
      2. Assert 201 response with _id
      3. GET /api/business-documents → assert list contains new doc
    Expected Result: Document is created and retrievable
    Evidence: .sisyphus/evidence/task-05-document-crud.txt
  ```

- [ ] 6. **Seed All 10 PDF Formats as Dynamic Templates**

  **What to do**:
  - Create `backend/src/scripts/seed-business-documents.ts` with all 10 PDF formats mapped
  - Each template has complete fieldMappings for every form field
  - Run seed to populate database

  **Formats to digitize**:
  - 06_FORMATO_DE_PLANEACION_DE_OBRA — Work planning (materials, tools, equipment, safety, workers)
  - 10_Formato_Mantenimiento_CCTV — CCTV maintenance (camera, radio, electrical)
  - 08_Formato_Inspeccion_lineas_de_vida_Vertical — Lifeline inspection (OPE-006, 8 sections)
  - 02_INDUCCION_SGSST — SGSST induction (49 pages)
  - 05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA — Ladder anchor photo registry
  - 03_Jerarquia_de_controles_Cermont — Safety control hierarchy
  - Plus field_permit and ast_safety_analysis (existing patterns aligned to new schema)

  **Agent Profile**: `writing` + `quick` — data entry and mapping
  **Parallelization**: Wave 2 | Blocks: Task 7 (dynamic forms) | Blocked by: Task 5

  **QA Scenarios**:
  ```
  Scenario: All 8 document types seeded
    Tool: Bash (curl)
    Steps:
      1. Run seed script: cd backend && npx tsx src/scripts/seed-business-documents.ts
      2. GET /api/business-documents
      3. Count unique documentType values
    Expected Result: 8 distinct document types present
    Evidence: .sisyphus/evidence/task-06-seed-count.txt
  ```

- [ ] 7. **Create Dynamic Form Renderer Frontend**

  **What to do**:
  - Create `frontend/src/modules/dynamic-forms/ui/DynamicFormRenderer.tsx`
  - Support field types: text, number, date, checkbox, select, table, photo, signature, textarea
  - Build Zod schema dynamically from fieldMappings
  - Use react-hook-form + zodResolver
  - Support offline capture with IndexedDB
  - Camera API for photo fields
  - Table field type with add/remove rows

  **Agent Profile**: `visual-engineering` — complex form UI with multiple field types
  **Parallelization**: Wave 3 | Blocks: none | Blocked by: Task 6

  **QA Scenarios**:
  ```
  Scenario: Dynamic form renders all field types
    Tool: Playwright
    Steps:
      1. Navigate to /business-documents/:id
      2. Verify text inputs render
      3. Verify checkbox renders
      4. Verify table field with add row button renders
      5. Verify signature pad renders
      6. Verify photo capture button renders
    Expected Result: All field types visible and interactive
    Evidence: .sisyphus/evidence/task-07-dynamic-form.png

  Scenario: Form validates required fields
    Tool: Playwright
    Steps:
      1. Click submit on empty form
      2. Observe validation errors on required fields
    Expected Result: Required field errors shown, form not submitted
    Evidence: .sisyphus/evidence/task-07-form-validation.png
  ```

- [ ] 8. **Create ERP Abstraction Layer (ERPCoreEngine)**

  **What to do**:
  - Create `packages/shared-types/src/schemas/erp-connector.schema.ts`
  - Create `backend/src/services/erp/erp-core-engine.ts` with manager pattern (Twenty CRM style)
  - Create `backend/src/services/erp/adapters/fssm.adapter.ts` — FSSM adapter
  - Create `backend/src/services/erp/adapters/gmao-csm.adapter.ts` — GMAO/CSM adapter
  - Create `backend/src/models/ErpConnector.ts`
  - Create `backend/src/modules/erp-connector/` with routes, controller, service
  - Register adapters in `backend/src/server.ts`

  **Agent Profile**: `deep` — architecture-level abstraction design
  **Parallelization**: Wave 2 | Blocks: Task 9 (ERP UI) | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: FSSM adapter executes operation
    Tool: Bash (curl)
    Steps:
      1. POST /api/erp-connectors with provider="fssm", name="Test FSSM"
      2. POST /api/erp-connectors/:id/sync with operation="create_order"
      3. Assert success response with local mode
    Expected Result: ERP engine routes to FSSM adapter, returns local-mode result
    Evidence: .sisyphus/evidence/task-08-erp-adapter.txt

  Scenario: ERP engine metrics are available
    Tool: Bash (curl)
    Steps:
      1. GET /api/erp-connectors/:id/metrics
      2. Assert calls count, errors, avgDuration
    Expected Result: Metrics object with performance data
    Evidence: .sisyphus/evidence/task-08-erp-metrics.txt
  ```

- [ ] 9. **Create ERP Connector Management UI**

  **What to do**:
  - Create `frontend/src/modules/erp-connector/queries.ts` with TanStack Query hooks
  - Create `frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx` with list+add+sync
  - Add route to sidebar navigation

  **Agent Profile**: `visual-engineering`
  **Parallelization**: Wave 3 | Blocks: none | Blocked by: Task 8

  **QA Scenarios**:
  ```
  Scenario: ERP connectors list shows registered adapters
    Tool: Playwright
    Steps:
      1. Login as gerente
      2. Navigate to /admin/erp-connectors
      3. Verify FSSM and GMAO/CSM adapters appear
    Expected Result: Both adapters visible with status badges
    Evidence: .sisyphus/evidence/task-09-erp-list.png

  Scenario: Sync button triggers adapter execution
    Tool: Playwright
    Steps:
      1. Click "Sync Now" on FSSM connector
      2. Observe loading state
      3. Verify success notification
    Expected Result: Sync completes with success indicator
    Evidence: .sisyphus/evidence/task-09-erp-sync.png
  ```

- [ ] 10. **Implement Multi-Variant Workflow Engine with Geofencing**

  **What to do**:
  - Enhance `backend/src/common/fsm/fsm-engine.ts` with `GeofenceRequirement` support
  - Create 3 workflow definitions: Cermont 14-step, FSSM standard (with geofence), GMAO maintenance
  - Create `backend/src/services/workflow-variant-registry.ts`
  - Register workflows in `backend/src/server.ts`

  **Geofence transitions** (FSSM workflow):
  - `en_route → on_site`: Requires technician within 100m of job site
  - `on_site → in_progress`: Requires within 50m of job site

  **Agent Profile**: `deep` — state machine design with geospatial validation
  **Parallelization**: Wave 2 | Blocks: Task 11 (geofence) | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: Cermont 14-step workflow transitions
    Tool: Bash (curl)
    Steps:
      1. GET /api/workflows → assert 3 workflows registered
      2. GET /api/workflows/cermont-14step → assert 14 transitions
    Expected Result: Workflow registry returns 3 variants, Cermont has 14 transitions
    Evidence: .sisyphus/evidence/task-10-workflow-list.txt

  Scenario: FSSM geofence transition requires location
    Tool: Bash (curl)
    Steps:
      1. Try to advance FSSM job from en_route to on_site without location
      2. Assert 403 with geofence required error
    Expected Result: Transition rejected with geofence requirement
    Evidence: .sisyphus/evidence/task-10-geofence-reject.txt
  ```

- [ ] 11. **Implement Geofencing Validation Service**

  **What to do**:
  - Create `backend/src/services/geofence/geofence-validator.ts`
  - Implement haversine distance calculation
  - Create geolocation tracking endpoint for technicians
  - Wire geofence check into FSM transition validation

  **Agent Profile**: `unspecified-high`
  **Parallelization**: Wave 3 | Blocks: none | Blocked by: Task 10

  **QA Scenarios**:
  ```
  Scenario: Technician within geofence passes validation
    Tool: Bash (curl)
    Steps:
      1. POST /api/technicians/:id/location with lat/lng at job site
      2. POST /api/service-cases/:id/step/advance with action "arrive_on_site"
      3. Assert 200 success
    Expected Result: Geofence check passes, transition succeeds
    Evidence: .sisyphus/evidence/task-11-geofence-pass.txt
  ```

- [ ] 12. **Create Cursor-Based Incremental Sync Endpoint**

  **What to do**:
  - Create `packages/shared-types/src/schemas/sync.schema.ts` with SyncPullRequest/SyncPushRequest
  - Create `backend/src/modules/sync/sync.controller.ts` with pull/push endpoints
  - Pull uses deterministic ordering (updatedAt + _id composite cursor)
  - Push handles conflict detection via syncVersion
  - Register routes in `backend/src/index.ts`

  **Agent Profile**: `deep` — data synchronization protocol design
  **Parallelization**: Wave 3 | Blocks: Task 13 (frontend sync) | Blocked by: Task 2

  **QA Scenarios**:
  ```
  Scenario: Sync pull returns cursor-paginated results
    Tool: Bash (curl)
    Steps:
      1. POST /api/sync/pull with {entityTypes:["WorkOrder"], limit:10}
      2. Assert hasMore, cursor, entities array
      3. POST /api/sync/pull with cursor from step 2
      4. Assert second page has different items
    Expected Result: Paginated results with deterministic cursor
    Evidence: .sisyphus/evidence/task-12-sync-pull.txt

  Scenario: Push with conflicting version is rejected
    Tool: Bash (curl)
    Steps:
      1. POST /api/sync/push with {mutations:[{entityId:"x", entityType:"WorkOrder", syncVersion: 0, operation:"update", data:{}}]}
      2. Assert status 409 for version conflict
    Expected Result: Conflicting push returns conflict status
    Evidence: .sisyphus/evidence/task-12-sync-conflict.txt
  ```

- [ ] 13. **Update Frontend Offline Sync Manager**

  **What to do**:
  - Enhance `frontend/src/lib/pwa/offline-queue.ts` with cursor-based sync
  - Create `CursorBasedSyncManager` class with pull/push/conflict-resolution
  - Wire into existing offline queue store
  - Handle IndexedDB local cache with syncVersion tracking

  **Agent Profile**: `unspecified-high`
  **Parallelization**: Wave 4 | Blocks: none | Blocked by: Task 12

  **QA Scenarios**:
  ```
  Scenario: Offline mutation queues then syncs
    Tool: Playwright
    Steps:
      1. Set browser offline
      2. Create evidence with offline mutation
      3. Verify "Pending sync" badge shows
      4. Set browser online
      5. Wait for "Sync complete" indicator
    Expected Result: Offline mutation queues and auto-syncs on reconnect
    Evidence: .sisyphus/evidence/task-13-offline-sync.png
  ```

- [ ] 14. **Implement WebSocket Real-Time Updates**

  **What to do**:
  - Install socket.io in backend: `npm install socket.io -w backend`
  - Create `backend/src/services/websocket.ts` with auth middleware + room management
  - Update `backend/src/server.ts` to use httpServer with WebSocket
  - Create `frontend/src/lib/websocket/useWebSocket.ts` hook
  - Wire dashboard to receive real-time updates
  - Wire Kanban board for instant status changes

  **Agent Profile**: `deep` — real-time infrastructure with auth and room management
  **Parallelization**: Wave 3 | Blocks: none | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: Dashboard receives real-time update
    Tool: Playwright + Bash (curl)
    Steps:
      1. Open dashboard in browser, note order count
      2. via curl: POST /api/orders with new order
      3. Observe dashboard order count updates without page refresh (<2s)
    Expected Result: WebSocket pushes update, dashboard refreshes automatically
    Evidence: .sisyphus/evidence/task-14-websocket-dashboard.png
  ```

- [ ] 15. **Add KPI Engine (MTTR, MTBF, OEE)**

  **What to do**:
  - Create `backend/src/services/kpi-engine.ts` with MTTR/MTBF/OEE calculations
  - Add KPI API endpoints in `backend/src/modules/analytics/`
  - Create `frontend/src/modules/analytics/ui/KPIDashboard.tsx` component
  - Add KPI display to dashboard and asset detail pages

  **Metrics**:
  - MTTR (Mean Time To Repair): total downtime / completed orders
  - MTBF (Mean Time Between Failures): operational time / failures
  - OEE (Overall Equipment Effectiveness): availability × performance × quality
  - Work order compliance rate: on-time completions / total
  - Cost per order: average actual cost per work order

  **Agent Profile**: `unspecified-high`
  **Parallelization**: Wave 4 | Blocks: none | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: KPI endpoint returns calculated metrics
    Tool: Bash (curl)
    Steps:
      1. Seed test work orders with known completion times
      2. GET /api/analytics/kpis?assetId=test&start=2025-01-01&end=2026-12-31
      3. Assert mttr, mtbf, oee fields present with numeric values
    Expected Result: KPI object with all 7 metrics
    Evidence: .sisyphus/evidence/task-15-kpi-response.txt
  ```

- [ ] 16. **Implement AG Grid Enterprise Dispatch Console**

  **What to do**:
  - Install: `npm install ag-grid-community ag-grid-react -w frontend`
  - Enhance `frontend/src/app/(dashboard)/dispatch/page.tsx`:
    - AG Grid split-pane layout (left: job table, right: map + timeline)
    - Multi-select rows with batch operations
    - Drag-and-drop technician assignment
    - Day picker with date-filtered view
    - Auto-Route button triggers backend auto-router
  - Create `DispatchMap.tsx` with technician/job markers
  - Create `TechTimeline.tsx` with Gantt-style schedule view
  - Create `SearchPanel.tsx` for job/technician search

  **Agent Profile**: `visual-engineering` — enterprise-grade grid with complex interaction patterns
  **Parallelization**: Wave 4 | Blocks: none | Blocked by: Task 17

  **QA Scenarios**:
  ```
  Scenario: Dispatch console loads with AG Grid
    Tool: Playwright
    Steps:
      1. Login as dispatcher/gerente
      2. Navigate to /dispatch
      3. Verify AG Grid table renders with columns + data
      4. Verify multi-select works (click 2 rows)
    Expected Result: AG Grid visible, multi-select highlights 2 rows
    Evidence: .sisyphus/evidence/task-16-dispatch-grid.png

  Scenario: Drag-and-drop assigns technician
    Tool: Playwright
    Steps:
      1. Drag a job row to a technician in the timeline panel
      2. Verify assignment updates in grid
    Expected Result: Technician name appears in assignedTo column
    Evidence: .sisyphus/evidence/task-16-dispatch-drag.png
  ```

- [ ] 17. **Implement Auto-Router Dispatch Engine Backend**

  **What to do**:
  - Create `backend/src/services/dispatch/auto-router.ts`
  - Multi-factor scoring: skill match (required), distance (haversine), capacity, priority
  - Three modes: standard (closest tech), load_balance (distribute), standard_by_timeslot
  - Create `backend/src/modules/dispatch/` with routes, controller, service
  - Create `backend/src/modules/geolocation/` for technician location tracking

  **Agent Profile**: `deep` — algorithmic optimization with geospatial calculations
  **Parallelization**: Wave 3 | Blocks: Task 16 | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: Auto-router assigns best technician
    Tool: Bash (curl)
    Steps:
      1. Create tech A (close, available, has skills)
      2. Create tech B (far, available, has skills)
      3. POST /api/dispatch/auto-route with job requiring skills
      4. Assert tech A assigned (closest qualified)
    Expected Result: Closest qualified technician selected
    Evidence: .sisyphus/evidence/task-17-auto-router.txt
  ```

- [ ] 18. **Implement Cost Dashboard**

  **What to do**:
  - Create `frontend/src/app/(dashboard)/costs/page.tsx`:
    - Budget vs actual comparison with overrun alerts (red >20%, yellow >10%)
    - Cost by category (materials, labor, equipment, transport, subcontractor)
    - Monthly trend chart (estimated vs actual)
    - Top 10 cost overruns with drill-down
    - Export to Excel
  - Ensure backend cost aggregation endpoint exists

  **Agent Profile**: `visual-engineering` — data visualization with charts and alerts
  **Parallelization**: Wave 5 | Blocks: none | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: Cost dashboard shows budget vs actual
    Tool: Playwright
    Steps:
      1. Login as gerente
      2. Navigate to /costs
      3. Verify KPI cards show totalApproved, totalActual, variance
      4. Verify category breakdown table renders
      5. Verify overrun alerts section shows items
    Expected Result: Complete cost dashboard with all sections
    Evidence: .sisyphus/evidence/task-18-cost-dashboard.png
  ```

- [ ] 19. **Implement Asset Hierarchy Module**

  **What to do**:
  - Enhance `frontend/src/app/(dashboard)/assets/page.tsx` with tree structure:
  - Site → Zone → Location → Equipment hierarchy
  - Tree view with expand/collapse
  - Equipment health score indicator (color: green 80+, yellow 50-80, red <50)
  - Quick actions: schedule maintenance, view history, upload docs

  **Agent Profile**: `visual-engineering` — tree navigation with asset health visualization
  **Parallelization**: Wave 5 | Blocks: none | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: Asset hierarchy tree renders
    Tool: Playwright
    Steps:
      1. Login as gerente
      2. Navigate to /assets
      3. Verify tree structure visible with Site nodes
      4. Expand Site node → Zone nodes appear
      5. Expand Zone → Equipment nodes appear
    Expected Result: Multi-level tree with expand/collapse
    Evidence: .sisyphus/evidence/task-19-asset-tree.png

  Scenario: Equipment health score shows correct color
    Tool: Playwright
    Steps:
      1. Navigate to asset with health > 80
      2. Assert green indicator
      3. Navigate to asset with health < 50
      4. Assert red indicator
    Expected Result: Health score color matches threshold
    Evidence: .sisyphus/evidence/task-19-health-color.png
  ```

- [ ] 20. **Implement Document Template Builder**

  **What to do**:
  - Create `frontend/src/app/(dashboard)/documents/templates/[id]/builder/page.tsx`
  - Drag-and-drop field layout editor
  - Field types: text, number, date, checkbox, select, table, photo, signature, textarea
  - Preview mode with real-time rendering
  - Save template as JSON export

  **Agent Profile**: `visual-engineering` — drag-and-drop builder with live preview
  **Parallelization**: Wave 5 | Blocks: none | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: Template builder drag-and-drop fields
    Tool: Playwright
    Steps:
      1. Login as gerente
      2. Navigate to template builder for existing template
      3. Drag "text" field from palette to form area
      4. Set field label as "Test Field"
      5. Click preview
      6. Verify text input renders with label
    Expected Result: Dragged field appears in preview
    Evidence: .sisyphus/evidence/task-20-template-builder.png
  ```

- [ ] 21. **Add Granular RBAC Permission Matrix**

  **What to do**:
  - Enhance `packages/domain/src/permissions.ts` with CRUD × module × role matrix
  - Create permission table: 8 roles × ~20 modules × 4 operations (create/read/update/delete)
  - Add per-user permission overrides
  - Update `frontend/src/modules/core/hooks/usePermissions.ts`
  - Add permission check to sidebar navigation items
  - Add route-level permission enforcement

  **Agent Profile**: `deep` — security permission matrix with exhaustive coverage
  **Parallelization**: Wave 4 | Blocks: none | Blocked by: none

  **QA Scenarios**:
  ```
  Scenario: Admin user has all permissions
    Tool: Playwright
    Steps:
      1. Login as gerente
      2. Navigate to all admin routes
      3. Verify all accessible
    Expected Result: Gerente can access all routes
    Evidence: .sisyphus/evidence/task-21-rbac-admin.txt

  Scenario: Cliente has limited permissions
    Tool: Playwright
    Steps:
      1. Login as cliente
      2. Try to navigate to /admin/users
      3. Verify 403/Unauthorized
    Expected Result: Cliente cannot access admin routes
    Evidence: .sisyphus/evidence/task-21-rbac-cliente.png
  ```

- [ ] 22. **Add E2E Tests for Critical Flows**

  **What to do**:
  - Create `frontend/tests/e2e/auth-flow.spec.ts`: login, invalid credentials, RBAC
  - Create `frontend/tests/e2e/proposal-to-order.spec.ts`: full pipeline
  - Create `frontend/tests/e2e/billing-flow.spec.ts`: SES → Invoice → Payment
  - Create `frontend/tests/e2e/offline-sync.spec.ts`: offline evidence → online sync

  **Agent Profile**: `unspecified-high` + `playwright-best-practices`
  **Parallelization**: Wave 5 | Blocks: none | Blocked by: none (can run with partial implementation)

  **QA Scenarios**:
  ```
  Scenario: All E2E tests pass
    Tool: Bash
    Steps:
      1. Start test environment: npm run dev
      2. Run: npm run test:e2e -w frontend
      3. Check exit code
    Expected Result: All 4 test files pass (exit 0)
    Evidence: .sisyphus/evidence/task-22-e2e-results.txt
  ```

- [ ] 23. **Run Full Quality Gates**

  **What to do**:
  - `npm run typecheck` — zero errors
  - `npm run lint` — zero errors
  - `npm run test` — all 1000+ tests green
  - `npm run build` — shared-types→backend→frontend success
  - `npm run verify` — exit code 0
  - `npx react-doctor@latest` — score 90/100

  **Agent Profile**: `quick`
  **Parallelization**: Wave 6 (FINAL — sequential gates)
  **Blocks**: none | Blocked by: all previous tasks

  **QA Scenarios**:
  ```
  Scenario: All quality gates pass
    Tool: Bash
    Steps:
      1. npm run verify
      2. Assert exit code 0
    Expected Result: verify passes
    Evidence: .sisyphus/evidence/task-23-quality-gates.txt
  ```

- [ ] 24. **Update Documentation**

  **What to do**:
  - Update `docs/architecture/FRONTEND_ROUTE_MAP.md` with new routes
  - Update `docs/architecture/API_ENDPOINT_MATRIX.md` with new endpoints
  - Update `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` with:
    - ERP abstraction layer
    - Multi-variant workflow engine
    - Cursor-based sync
    - WebSocket real-time
    - KPI engine
    - AG Grid dispatch console

  **Agent Profile**: `writing`
  **Parallelization**: Wave 6 | Blocks: none | Blocked by: all previous tasks

  **QA Scenarios**:
  ```
  Scenario: Documentation builds and links are valid
    Tool: Bash
    Steps:
      1. Read docs/README.md
      2. Verify new routes documented in FRONTEND_ROUTE_MAP
      3. Verify new endpoints in API_ENDPOINT_MATRIX
    Expected Result: All new features documented
    Evidence: .sisyphus/evidence/task-24-docs-verified.txt
  ```

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify each deliverable exists (read file, curl endpoint, run command). Check evidence files in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Tasks [N/N] | VERDICT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + `npm run lint` + `npm run test`. Review for: `as any`, `@ts-ignore`, empty catches, `console.log` in prod, unused imports. Check AI slop: excessive comments, over-abstraction.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N/N] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright`)
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test integration across tasks. Test edge cases: empty state, invalid input, rapid actions.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/issues] | VERDICT`

---

## Commit Strategy

| Task(s) | Message |
|---------|---------|
| 1 | `refactor: rename Spanish identifiers to English across monorepo` |
| 2 | `feat: add version-based optimistic concurrency to all models` |
| 3 | `fix: add missing loading/error/empty/offline states to all pages` |
| 4 | `perf: split pages into server/client components` |
| 5 | `feat: add business document schema catalog and CRUD API` |
| 6 | `feat: seed all 10 PDF business formats as dynamic templates` |
| 7 | `feat: add dynamic form renderer with full field type support` |
| 8 | `feat: add multi-ERP abstraction layer with FSSM/GMAO adapters` |
| 9 | `feat: add ERP connector management UI` |
| 10 | `feat: add multi-variant workflow engine with geofencing` |
| 11 | `feat: add geofencing validation service` |
| 12 | `feat: add cursor-based incremental sync endpoint` |
| 13 | `feat: update offline sync manager with cursor-based protocol` |
| 14 | `feat: add WebSocket real-time updates for dashboard and orders` |
| 15 | `feat: add maintenance KPI engine with MTTR/MTBF/OEE` |
| 16 | `feat: add AG Grid enterprise dispatch console` |
| 17 | `feat: add auto-router dispatch engine with skill matching` |
| 18 | `feat: implement cost dashboard with overrun alerts` |
| 19 | `feat: implement asset hierarchy tree module` |
| 20 | `feat: implement document template builder` |
| 21 | `feat: add granular CRUD×role×module RBAC matrix` |
| 22 | `test: add E2E tests for auth, pipeline, billing, offline` |
| 23 | `chore: pass all quality gates after maturity improvements` |
| 24 | `docs: update architecture documentation with multi-ERP patterns` |

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck        # Expected: zero errors
npm run lint             # Expected: zero errors
npm run test             # Expected: all 1000+ tests pass
npm run build            # Expected: shared-types→backend→frontend builds succeed
npm run verify           # Expected: exit code 0
npx react-doctor@latest  # Expected: score 90/100
npm run test:e2e -w frontend  # Expected: all e2e specs pass
```

### Final Checklist
- [ ] All 10 PDF formats digitized and usable as dynamic forms
- [ ] All "Must Have" present (ERP layer, workflow engine, document engine, dispatch console)
- [ ] All "Must NOT Have" absent (no new DB engines, no stack violations)
- [ ] All quality gates pass
- [ ] All evidence files exist in `.sisyphus/evidence/`
- [ ] All documentation updated

