# Módulo: ServiceCase — Entidad Transversal y Cockpit

## Problema empresarial

Cada orden de servicio necesita un expediente único que muestre el progreso en los 14 pasos operacionales, artefactos vinculados (WorkRequest, SiteVisit, Proposal, PurchaseOrder, PlanningPacket, ExecutionSession, TechnicalReport, DeliveryRecord, SES, Invoice, Payment), bloqueadores, documentos, evidencias, costos, timeline y siguiente acción. Sin ServiceCase, cada paso vive en su propio silo sin visibilidad transversal.

## Roles

- **List/View (`INTERNAL_ROLES`)**: Todos los roles internos acceden al listado y detalle
- **Advance step (`SUPERVISORY_ROLES`)**: `gerente`, `residente`, `supervisor` pueden avanzar pasos
- **Close (`MANAGEMENT_ROLES`)**: `gerente`, `residente`
- **Archive**: Solo `gerente`
- **Client portal**: Clientes ven read-only via `/portal/service-cases/[id]`

## Casos de uso

1. **Listar casos** — GET /api/service-cases con filtros (`clientId`, `currentStage`, `search`), paginación
2. **Ver detalle** — GET /api/service-cases/:id con workflow completo: steps, blockers, requirements, nextActions, timeline
3. **Cockpit** — GET /api/service-cases/:id/cockpit (alias de `/workflow`) con vista de 14 pasos, progreso, bloqueadores
4. **Avanzar paso** — POST /api/service-cases/:id/step/advance validado por FSM engine en `@cermont/domain`
5. **Step context** — GET /api/service-cases/:id/step-context?stepCode= para forms de creación
6. **Ver pipeline financiero** — GET /api/service-cases/:id/invoice-pipeline (SES → Invoice → Payment)
7. **Cerrar caso** — POST /api/service-cases/:id/close (requiere stage `paid` o `cancelled`)
8. **Archivar caso** — POST /api/service-cases/:id/archive (solo stages terminales: `paid`, `cancelled`)
9. **Closing evidence bulk** — POST /api/service-cases/:id/closing-evidence/bulk
10. **Ver propuesta vinculada** — GET /api/service-cases/:id/proposal

## Entidades

- **ServiceCase** (Mongoose `backend/src/models/ServiceCase.ts`): `code` (único), `clientId`, `clientName`, `currentStage` (15 stages), `currentStepCode` (14 canonical codes), `operationalStepSchemaVersion`, `artifacts` (WorkRequest, SiteVisit, Proposal, PurchaseOrder, WorkOrder, PlanningPacket, ExecutionSession, TechnicalReport, DeliveryRecord, ServiceEntrySheet, Invoice, Payment), `blockers[]`, `nextActions[]`, `timeline[]`, `financialSummary`, `operationalSummary`, `fileAssets[]`
- **ServiceCaseCockpit** (Zod schema): UI-oriented progress payload con status de 14 pasos
- **ServiceCaseWorkflowViewModel** (computed): Vista completa con steps, requirements, blockers, costs, closure, documents, evidences

## Estados del caso (15 stages)

```
intake → assessment → proposal → authorization → planning → ready_to_execute → in_execution → technical_closure → administrative_closure → ses_pending → billing_pending → receivable_open → paid ──→ archived
                                                                                                                                                                                   └──→ cancelled
```

Calculados por `computeStage()` evaluando artefactos en orden de prioridad inversa (primero pago → `paid`, ultimo trabajo → `intake`).

**Step codes canónicos** (de `@cermont/domain` `OPERATIONAL_STEPS`):
```
step_01_work_request → step_02_site_visit → step_03_proposal → step_04_purchase_order → step_05_planning → step_06_execution → step_07_evidence → step_08_technical_report → step_09_delivery_record → step_10_client_signature → step_11_ses → step_12_invoice → step_13_invoice_approval → step_14_payment
```

## Transiciones

Cada transición validada por FSM engine (`@cermont/domain` `ServiceCaseStateMachine`):
- `pending → work_request` (WORK_REQUEST_CREATED)
- `work_request → site_visit` (SITE_VISIT_COMPLETED)
- `site_visit → proposal` (PROPOSAL_APPROVED)
- `proposal → purchase_order` (PURCHASE_ORDER_APPROVED)
- `purchase_order → planning` (PLANNING_APPROVED)
- `planning → execution` (EXECUTION_COMPLETED)
- `execution → technical_report` (TECHNICAL_REPORT_APPROVED)
- `technical_report → delivery_record` (DELIVERY_RECORD_GENERATED)
- `delivery_record → client_signature` (CLIENT_SIGNATURE_REGISTERED)
- `client_signature → ses` (SES_APPROVED)
- `ses → invoice` (INVOICE_CREATED)
- `invoice → invoice_approval` (INVOICE_APPROVED)
- `invoice_approval → payment` (PAYMENT_REGISTERED)
- `payment → closed` (CASE_CLOSED)

Mapeo DB step ↔ domain state en `advanceServiceCaseState()` via `dbStepToDomainState()` y `domainStateToDbStep()`.

## Precondiciones

- Cada step requiere que el step anterior esté completo
- Validación por `canAdvanceStep()` en `@cermont/domain` + `calculateStepBlockers()` en backend
- `assertServiceCaseStageMutable()` verifica que el caso no esté en estado terminal (paid/archived/cancelled)
- SLA tracking via `SLAService.recordWorkflowProgress()`

## Blockers

Calculados por `calculateStepBlockers()` en backend. Categorías:
- `MISSING_STEP_REQUIRED_DOCUMENT` — documento obligatorio faltante
- `MISSING_STEP_REQUIRED_EVIDENCE` — evidencia obligatoria faltante
- `MISSING_DYNAMIC_FORM_RESPONSE` — formulario dinámico sin responder
- Bloqueos de `canAdvanceStep()` desde FSM engine
- Cada blocker incluye: `code`, `message`, `severity` (`blocking`|`warning`|`critical`), `field`, `artifactType`, `recommendedAction`, `ownerRole`

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/service-cases` | `INTERNAL_ROLES` | Lista paginada con filtros `clientId`, `currentStage`, `search` |
| GET | `/api/service-cases/summary` | `INTERNAL_ROLES` | KPIs dashboard: totalCases, activeCases, blockedCases, revenue, stepDistribution |
| GET | `/api/service-cases/:id` | `INTERNAL_ROLES` | Detalle con workflow, blockers, requirements, stepsChecklist |
| GET | `/api/service-cases/:id/cockpit` | `INTERNAL_ROLES` | Alias de `/workflow` |
| GET | `/api/service-cases/:id/workflow` | `INTERNAL_ROLES` | WorkflowView: steps, documents, evidences, costs, closure |
| GET | `/api/service-cases/:id/step-context` | `INTERNAL_ROLES` | Step context con campos heredados |
| POST | `/api/service-cases/:id/step/advance` | `SUPERVISORY_ROLES` | Avanzar al siguiente step |
| GET | `/api/service-cases/:id/closing-status` | `INTERNAL_ROLES` | Estado de cierre consolidado |
| POST | `/api/service-cases/:id/closing-evidence/bulk` | `INTERNAL_ROLES` | Bulk upload closing evidence |
| POST | `/api/service-cases/:id/close` | `MANAGEMENT_ROLES` | Cerrar caso |
| POST | `/api/service-cases/:id/archive` | `gerente` | Archivar caso (solo paid/cancelled) |
| GET | `/api/service-cases/:id/proposal` | `INTERNAL_ROLES` | Propuesta vinculada |
| GET | `/api/service-cases/:id/invoice-pipeline` | `INTERNAL_ROLES` | Pipeline SES→Invoice→Payment |

## Pantallas

- **`/service-cases`** — Tabla filtrable y paginada de casos
- **`/service-cases/[id]`** — Pipeline completo 14 pasos + workflow cockpit con tabs: progreso, bloqueadores, documentos, evidencias, timeline, costos
- **`/portal/service-cases/[id]`** — Vista cliente read-only

## Estados UI

- **loading** — Skeleton para cockpit, barra de progreso, lista de bloqueadores
- **empty** — Sin casos (lista) o sin datos de step (detalle)
- **error** — API error banner con retry
- **offline** — Datos cacheados con indicador "última sincronización"
- **blocked** — Panel rojo con razones específicas y links de resolución
- **complete** — Barra de progreso verde 14/14 con resumen de cierre

## Eventos de auditoría

- `case.created` — Creación inicial del ServiceCase (desde work-requests)
- `STATE_TRANSITION` — Avance de step exitoso (incluye `before`/`after` stepCode y state)
- `ARCHIVED` — Archivo de caso
- Timeline interno del ServiceCase registra: `eventId`, `stage`, `command`, `actorId`, `actorRole`, `occurredAt`, `notes`

## Casos negativos

- Transición con blockers → 409 + lista de bloqueadores
- Rol sin permiso → 403
- Caso en estado terminal (paid/archived/cancelled) → transición bloqueada por `assertServiceCaseStageMutable()`
- Step code legacy en payload → normalizado por `normalizeOperationalStepCode()` en Mongoose setter
- Concurrencia → last-write-wins (Phase 1)
- Artefacto no vinculado → mostrado como "not yet created" (opcional)
- Archivar caso no terminal → `409 Conflict: "Cannot archive a service case in stage X"`

## Pruebas E2E

- NP-01: Full pipeline 14 pasos — avanzar cada step, verificar transición
- NP-02: Blocker scenarios — transición sin documento requerido, verificar mensaje
- NP-03: Cockpit loading — step progress, blockers, nextActions renderizan correcto
- NP-04: Role gating — transición como rol no autorizado → 403
- NP-05: Legacy step code normalization — código legacy mapeado a canónico
- NP-06: Timeline integrity — avanzar 3 steps, verificar 3 entries con actor/role
- NP-07: Locked case immutability — caso archivado no acepta transiciones
