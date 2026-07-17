# SPEC-015: Auditoría, Cierre de Brechas y Profesionalización Final

**Versión:** 1.0 — 5 de julio de 2026
**Rama base:** `deploy/vps-clean`
**Rama de trabajo:** `implement/spec-015-cierre-brechas-final`

---

## TL;DR

> **Resumen de Auditoría**: Se auditaron 7 planes maestros (Spec-008 → Spec-014) contra el código real del repositorio. El frontend Spec-014 tiene ~70% de componentes implementados, los endpoints backend tienen ~65%, los schemas compartidos tienen ~40% de los schemas nombrados planificados, y las reglas de dominio (Spec-012/013) tienen **0%** implementadas. Los tests E2E existen pero son placeholders sin aserciones reales.

> **Hallazgos críticos**: 1) `packages/domain` no tiene `spec-012-rules.ts` ni `spec-013-rules.ts` (P0). 2) `packages/shared-types` no tiene `service-case-cockpit.schema.ts`, `CostCatalogItemSchema`, `BaselineCostSchema`, `CostIntelligenceSummarySchema`, `PreflightChecklistSchema`, `FieldNoveltySchema`, `KitSafetyRequirementsSchema`, `DashboardOperationalKPISchema`, `DashboardSLARiskOrderSchema` (P0). 3) Faltan 6 endpoints backend clave (P0/P1). 4) E2E tests usan `expect(true).toBeTruthy()` como placeholder (P1). 5) Ruta duplicada en `planning-packet.routes.ts` (BUG). 6) Directorio `.sisyphus/evidence/` con solo 22 archivos (P2).

> **Deliverables**: 9 schemas enriquecidos/nuevos + 1 archivo de domain rules + 6 endpoints backend + 15 componentes frontend faltantes + 8 páginas con estados completos + 10 tests E2E reales + corrección de bug duplicado + evidencia completa.

> **Estimated Effort**: Large (XL)
> **Parallel Execution**: YES — 6 waves
> **Critical Path**: Wave 0 (SSOT) → Wave 1 (Domain) → Wave 2 (Backend) → Wave 3 (Frontend) → Wave 4 (E2E) → Wave 5 (Gates)

---

## SECCIÓN A: INFORME DE AUDITORÍA COMPLETA

### A.1 Metodología

Se realizó verificación directa contra el código fuente (sin subagentes) del contenido de:
- `packages/shared-types/src/schemas/` (100+ archivos)
- `packages/domain/src/` (13 archivos)
- `backend/src/modules/` (58+ módulos)
- `frontend/src/modules/` (49 módulos)
- `frontend/src/app/` (130+ páginas)
- `frontend/tests/e2e/spec-014/` (10 specs)
- `.sisyphus/evidence/` (22 archivos)

### A.2 Estado vs Planes — Matriz Completa

#### A.2.1 Spec-012/013 — SSOT Enrichment (Sprint 1)

| Schema/Tipo Planificado | Archivo | ¿Existe? | Severidad |
|---|---|---|---|
| `ServiceCaseCockpitSchema` | `service-case-cockpit.schema.ts` | ❌ NO EXISTE (solo `service-case-workflow.schema.ts` con `OperationalStepProgressItemSchema`) | 🔴 P0 |
| `StepProgressSchema` | same | ❌ NO EXISTE como schema exportable | 🔴 P0 |
| `NextExpectedActionSchema` | same | ❌ NO EXISTE | 🔴 P0 |
| `CERMONT_14_STEPS` | same | ❌ NO EXISTE como constante | 🔴 P0 |
| `CostCatalogItemSchema` | `cost.schema.ts` | ❌ NO EXISTE (solo en `cost-cart.schema.ts` que es diferente) | 🔴 P0 |
| `BaselineCostSchema` | `cost.schema.ts` | ❌ NO EXISTE | 🔴 P0 |
| `CostIntelligenceSummarySchema` | `cost.schema.ts` | ❌ NO EXISTE | 🔴 P0 |
| `CostSummaryEnrichedSchema` | `cost.schema.ts` | ❌ NO EXISTE | 🔴 P0 |
| `PreflightChecklistSchema` | `execution-session.schema.ts` | ❌ NO EXISTE | 🔴 P0 |
| `PreflightGateItemSchema` | same | ❌ NO EXISTE | 🔴 P0 |
| `FieldNoveltySchema` | same | ❌ NO EXISTE | 🔴 P0 |
| `ExecutionSessionEnrichedSchema` | same | ❌ NO EXISTE | 🔴 P0 |
| `EvidenceSlotSchema` | `evidence.schema.ts` | ❌ NO EXISTE | 🟡 P1 |
| `EvidenceSlotsRequirementsSchema` | same | ❌ NO EXISTE | 🟡 P1 |
| `replacement_requested` en enum | same | ❌ NO EXISTE | 🟡 P1 |
| `KitSafetyRequirementsSchema` | `kit.schema.ts` | ❌ NO EXISTE | 🔴 P0 |
| `KitItemEnrichedSchema` | same | ❌ NO EXISTE | 🟡 P1 |
| `isBillable`, `unitCostCOP`, `catalogItemId` | same | ⚠️ NO encontrados en el schema | 🟡 P1 |
| `DashboardOperationalKPISchema` | `dashboard-summary.schema.ts` | ❌ NO EXISTE (solo `DashboardMaintenanceEfficiencySchema`) | 🔴 P0 |
| `DashboardSLARiskOrderSchema` | same | ❌ NO EXISTE | 🔴 P0 |
| `DashboardSummaryEnrichedSchema` | same | ❌ NO EXISTE | 🔴 P0 |
| `spec-012-rules.ts` | `packages/domain/src/` | ❌ NO EXISTE | 🔴 P0 |
| `spec-013-rules.ts` | same | ❌ NO EXISTE | 🔴 P0 |
| `evaluatePreflightGates()` | same | ❌ NO EXISTE | 🔴 P0 |
| `evaluateSLARisk()` | same | ❌ NO EXISTE | 🔴 P0 |
| `evaluateCostRisk()` | same | ❌ NO EXISTE | 🔴 P0 |
| `evaluateEvidenceCompleteness()` | same | ❌ NO EXISTE | 🔴 P0 |
| `computeMTTR()` | same | ❌ NO EXISTE | 🔴 P0 |
| `computeMTBF()` | same | ❌ NO EXISTE | 🔴 P0 |
| `computeFirstTimeFixRate()` | same | ❌ NO EXISTE | 🔴 P0 |

#### A.2.2 Spec-013/014 — Backend Endpoints

| Endpoint Planificado | ¿Existe? | Ruta Real | Diferencia |
|---|---|---|---|
| `GET /service-cases/:id/cockpit` | ✅ SÍ | `/service-cases/:id/cockpit` (alias de /workflow) | OK |
| `GET /service-cases/:id/invoice-pipeline` | ✅ SÍ | `/service-cases/:id/invoice-pipeline` | OK |
| `POST /evidence/:id/review` | ✅ SÍ | `/evidences/:id/review` | OK |
| `POST /planning-packets/:id/approve` | ⚠️ SÍ (DUPLICADO) | 2 rutas idénticas líneas 115-130 | **BUG P1** |
| `POST /planning-packets/:id/validate-readiness` | ⚠️ SÍ (semántica diferente) | POST `/validate-readiness` | El plan pide GET `/readiness` |
| `GET /reports/auto-draft/:serviceCaseId` | ✅ SÍ | `/reports/auto-draft/:serviceCaseId` | Path diferente al plan (`/:id/auto-draft`) |
| `POST /execution-sessions/:id/preflight` | ❌ NO | — | **GAP P0** |
| `GET /costs/catalog` | ❌ NO | — | **GAP P0** |
| `POST /costs/catalog` | ❌ NO | — | **GAP P0** |
| `GET /costs/:orderId/intelligence` | ❌ NO (solo `/costs/order/:orderId/summary`) | — | **GAP P0** |
| `GET /dashboard/operational-kpis` | ❌ NO (solo `/dashboard/summary`) | — | **GAP P0** |
| `GET /dashboard/sla-risk` | ❌ NO | — (hay `dashboard-sla.service.ts` pero sin endpoint) | **GAP P0** |
| `POST /technical-reports/:id/auto-draft` | ❌ NO (es GET `/auto-draft/:serviceCaseId`) | — | Método HTTP diferente |

Backend adicional encontrado (NO planificado pero existe):
- `dashboard-efficiency.service.ts` — tiene cálculo de MTTR/MTBF ✅
- `analytics-report/` — tiene `getOperationalKPI` en analytics-report (NO en dashboard) ✅
- `dashboard-sla.service.ts` — lógica SLA (pero sin endpoint propio) ✅
- `evidence-collection.routes.ts` — endpoints adicionales de evidencia ✅

#### A.2.3 Spec-014 — Frontend Módulos y Componentes

| Módulo | Componente | Estado |
|---|---|---|
| **cockpit/** | FourteenStepProgressBar | ✅ EXISTE |
| | CockpitHeaderCard (via ServiceCaseWorkflowCockpit) | ✅ EXISTE (diferente nombre) |
| | NextActionCard | ✅ EXISTE |
| | BlockersPanelCollapsible | ✅ EXISTE |
| | CockpitTabs | ✅ EXISTE |
| | AuditTimeline | ✅ EXISTE |
| | DocumentRequirementsTable | ❌ NO EXISTE |
| **field-execution/** | PreflightGatesForm | ✅ EXISTE |
| | StructuredEvidenceCapture | ✅ EXISTE |
| | FieldNoveltyButton | ✅ EXISTE |
| | ExecutionTimer | ❌ NO EXISTE |
| | ExecutionStatusBadge | ❌ NO EXISTE |
| | ExecutionSessionPage | ❌ NO EXISTE (solo página básica) |
| | EvidenceSlotCard | ❌ NO EXISTE |
| **invoices/** | InvoicePipelinePage | ✅ EXISTE |
| | AgingDashboard | ❌ NO EXISTE |
| | InvoiceStatusBadge | ❌ NO EXISTE |
| | PaymentRecordCard | ❌ NO EXISTE |
| **costs/** | BaselineCostCard | ✅ EXISTE |
| | BudgetConsumedGauge | ✅ EXISTE |
| | CostCatalogForm | ✅ EXISTE |
| | CostDeviationStackedBar | ❌ NO EXISTE |
| | MarginSummaryCard | ❌ NO EXISTE |
| **reports/** | DigitalSignaturePad | ✅ EXISTE |
| | TechnicalReportDraftPage | ❌ NO EXISTE |
| | ReportVersionHistory | ❌ NO EXISTE |
| | PDFExportButton | ❌ NO EXISTE |
| | ReportReviewPanel | ❌ NO EXISTE |
| **dashboard/** | MTTRMTBFCards | ❌ NO EXISTE |
| | DashboardKPIWidgets | ❌ NO EXISTE |
| | KPIStatCard | ❌ NO EXISTE |
| | FirstTimeFixRateGauge | ❌ NO EXISTE |
| | PendingInvoicesAlert | ❌ NO EXISTE |
| | PendingReportsAlert | ❌ NO EXISTE |
| | CashFlowFunnel | ❌ NO EXISTE |
| | SLARiskOrdersTable | ❌ NO EXISTE |
| **notifications/** | NotificationBell | ✅ EXISTE |
| | NotificationPanel | ✅ EXISTE |
| | NotificationCard | ❌ NO EXISTE |
| | NotificationPreferences | ❌ NO EXISTE |
| **portal/** | PortalServiceCaseList | ✅ EXISTE |
| | PortalSignDeliveryRecord | ✅ EXISTE |
| | PortalServiceCaseDetail | ❌ NO EXISTE |
| | PortalDocumentDownload | ❌ NO EXISTE |

#### A.2.4 Spec-014 — Páginas Frontend

| Página | ¿Existe? |
|---|---|
| `/service-cases/[id]/cockpit/page.tsx` | ✅ SÍ |
| `/execution-sessions/[id]/page.tsx` | ✅ SÍ |
| `/costs/catalog/page.tsx` | ✅ SÍ |
| `/reports/[id]/draft/page.tsx` | ✅ SÍ |
| `/reports/[id]/sign/page.tsx` | ✅ SÍ |
| `/invoices/[id]/pipeline/page.tsx` | ✅ SÍ |
| `/notifications/page.tsx` | ✅ SÍ |
| `/settings/notifications/page.tsx` | ✅ SÍ |
| `/portal/service-cases/page.tsx` | ✅ SÍ |
| `/portal/service-cases/[id]/page.tsx` | ✅ SÍ |

#### A.2.5 Spec-014 — E2E Tests

| Spec | ¿Existe? | Calidad |
|---|---|---|
| `01-cockpit-14-steps.spec.ts` | ✅ EXISTE | ⚠️ PLACEHOLDER (`expect(true).toBeTruthy()`) |
| `02-dashboard-kpis.spec.ts` | ✅ EXISTE | ⚠️ PLACEHOLDER |
| `03-cost-intelligence.spec.ts` | ✅ EXISTE | ⚠️ PLACEHOLDER |
| `04-field-execution.spec.ts` | ✅ EXISTE | ⚠️ PLACEHOLDER |
| `05-report-auto-draft.spec.ts` | ✅ EXISTE | ⚠️ PLACEHOLDER |
| `06-invoice-pipeline.spec.ts` | ✅ EXISTE | ⚠️ PLACEHOLDER |
| `07-notifications.spec.ts` | ✅ EXISTE | ⚠️ PLACEHOLDER |
| `08-portal-cliente.spec.ts` | ✅ EXISTE | ⚠️ PLACEHOLDER |
| `09-rbac-all-roles.spec.ts` | ✅ EXISTE | ⚠️ PLACEHOLDER |
| `10-full-14-step-flow.spec.ts` | ✅ EXISTE | ⚠️ PLACEHOLDER |

### A.3 Bugs y Problemas de Calidad Encontrados

| ID | Issue | Archivo | Líneas | Severidad |
|---|---|---|---|---|
| B1 | Ruta `POST /:id/approve` duplicada IDÉNTICA | `planning-packet.routes.ts` | 115-122 y 123-130 | 🔴 P0 |
| B2 | `router.use(authenticate)` al inicio de rutas pero luego `authenticate` duplicado en rutas específicas | `service-case.routes.ts` | L23 + L98-99 | 🟡 P1 |
| B3 | E2E tests sin aserciones reales | 10 archivos en `frontend/tests/e2e/spec-014/` | Todos | 🟡 P1 |
| B4 | Solo 22 archivos de evidencia en `.sisyphus/evidence/` para ~30 tareas planificadas | `.sisyphus/evidence/` | — | 🟡 P1 |
| B5 | Schemas Spec-012/013 no implementados como archivos independientes — la lógica está dispersa | `packages/shared-types/src/schemas/` | Múltiples | 🔴 P0 |

### A.4 Porcentaje de Completitud por Capa

| Capa | Planificado | Implementado | % |
|---|---|---|---|
| Schemas compartidos (Spec-012/013) | 22 schemas/constantes | 0 (0 de 22) | **0%** |
| Reglas de dominio (Spec-012/013) | 8 funciones + 2 archivos | 0 de 10 | **0%** |
| Backend endpoints (Spec-013/014) | 12 endpoints | 5 (pero 1 duplicado) | **~42%** |
| Frontend módulos (Spec-014) | 8 módulos completos | ~70% de componentes | **~70%** |
| Frontend páginas (Spec-014) | 11 páginas | 11 de 11 | **100%** |
| E2E Tests (Spec-014) | 10 specs | 10 (placeholders) | **10%** |
| Evidencia | ~30+ archivos | 22 | **~15%** |
| **Total ponderado** | — | — | **~35%** |

---

## Work Objectives

### Core Objective
Cerrar todas las brechas identificadas en la auditoría: schemas, domain rules, backend endpoints, componentes frontend faltantes, E2E tests reales, y gates de calidad.

### Concrete Deliverables
- **Wave 0**: 9 schemas nuevos/enriquecidos + barrel exports actualizados
- **Wave 1**: 1 archivo de domain rules con 8 funciones de negocio
- **Wave 2**: 6 endpoints backend nuevos + fix bug duplicado
- **Wave 3**: 15 componentes frontend faltantes en 6 módulos
- **Wave 4**: 10 E2E tests reales con Playwright + evidencia
- **Wave 5**: Gates de calidad + documentación actualizada

### Must Have
- `service-case-cockpit.schema.ts` con 14-step progress tracker creado y exportado
- `spec-015-rules.ts` con evaluatePreflightGates, evaluateSLARisk, evaluateCostRisk, computeMTTR, computeMTBF, computeFirstTimeFixRate
- 6 endpoints backend nuevos operativos con curl verificable
- 15 componentes frontend faltantes implementados
- 10 E2E tests reales (no placeholders)
- Bug duplicado corregido
- Gates verdes: typecheck, lint, test, build, contracts:check

### Must NOT Have (Guardrails)
- ❌ No modificar schemas existentes — solo agregar campos `.optional()` o `.default()`
- ❌ No crear `MediaAsset` — `FileAsset` es SSOT
- ❌ No introducir `any`, `unknown`, `null`, `undefined` explícitos
- ❌ No hardcodear roles en componentes — usar `@cermont/domain`
- ❌ No `fetch` directo en componentes — usar `apiClient` + TanStack Query
- ❌ No `try/catch` en controllers Express 5
- ❌ No modificar `package.json` sin justificación
- ❌ No eliminar funcionalidad existente
- ❌ No mock data en producción

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest backend + frontend, Playwright E2E)
- **Automated tests**: Tests-after
- **Framework**: Vitest 4.x + Playwright 1.58.2
- **Agent-Executed QA**: MANDATORY para cada tarea

### QA Policy
Cada tarea incluye escenarios QA ejecutables:
- **API endpoints**: Bash (curl) → assert status + response body
- **Frontend**: Playwright → assert DOM, interact, screenshot
- **Evidence**: `.sisyphus/evidence/task-{N}-{scenario}.{ext}`

---

## Execution Strategy

```
Wave 0 (Schemas — PARALLEL, 3 tasks):
├── Task 0.1: service-case-cockpit.schema.ts (NUEVO)
├── Task 0.2: Enriquecer schemas existentes (cost, execution-session, evidence, kit, dashboard-summary)
└── Task 0.3: Actualizar barrel exports (schemas/index.ts)

Wave 1 (Domain — 1 task, después de Wave 0):
└── Task 1.1: Crear spec-015-rules.ts con 8 funciones

Wave 2 (Backend — PARALLEL, 6 tasks):
├── Task 2.1: Endpoint GET /costs/catalog + POST /costs/catalog (cost-catalog module)
├── Task 2.2: Endpoint GET /costs/:orderId/intelligence
├── Task 2.3: Endpoint POST /execution-sessions/:id/preflight
├── Task 2.4: Endpoint GET /dashboard/operational-kpis
├── Task 2.5: Endpoint GET /dashboard/sla-risk
└── Task 2.6: Fix bug duplicado en planning-packet.routes.ts (line 115-130)

Wave 3 (Frontend — PARALLEL, 3 tasks):
├── Task 3.1: Dashboard faltantes (7 componentes: DashboardKPIWidgets, KPIStatCard, MTTRMTBFCards, FirstTimeFixRateGauge, PendingInvoicesAlert, PendingReportsAlert, CashFlowFunnel, SLARiskOrdersTable)
├── Task 3.2: Field-execution + Invoices + Costs faltantes (7 componentes: ExecutionTimer, ExecutionStatusBadge, EvidenceSlotCard, AgingDashboard, InvoiceStatusBadge, PaymentRecordCard, CostDeviationStackedBar, MarginSummaryCard)
└── Task 3.3: Reports + Notifications + Portal faltantes (8 componentes: TechnicalReportDraftPage, ReportVersionHistory, PDFExportButton, ReportReviewPanel, NotificationCard, NotificationPreferences, PortalServiceCaseDetail, PortalDocumentDownload)

Wave 4 (E2E — 1 task, después de Wave 0-3):
└── Task 4.1: Reescribir 10 E2E specs con aserciones reales

Wave 5 (Gates — 1 task, final):
└── Task 5.1: Gates completos + evidencia + documentación
```

---

## TODOs

### Wave 0 — Schemas SSOT Enrichment (PARALLEL — 3 tasks)

- [ ] 0.1. **Crear `service-case-cockpit.schema.ts` (ARCHIVO NUEVO)**

  **What to do**:
  1. Crear `packages/shared-types/src/schemas/service-case-cockpit.schema.ts`
  2. Importar `z` de "zod", `ObjectIdSchema` de "./common.schema"
  3. Definir `StepStatusEnum` = z.enum(["pending", "in_progress", "completed", "blocked", "skipped"])
  4. Definir `CERMONT_14_STEPS` como constante con los 14 pasos (WorkRequest → PaymentRecord)
  5. Definir `StepProgressSchema` — step (1-14), label, moduleKey, status, completedAt, completedBy, blockerReason, deepLink
  6. Definir `NextExpectedActionSchema` — stepNumber, description, assignedRoles, dueDate, deepLink, urgency
  7. Definir `DocumentRequirementStatusSchema` — documentType, label, step, status, fileAssetId, isRequired
  8. Definir `AuditEventSummarySchema` — event, entityType, actorName, occurredAt
  9. Definir `ServiceCaseCockpitSchema` con: serviceCaseId, serviceCaseCode, clientName, workDescription, activityType, stepProgress[], currentStep, completedSteps, nextExpectedAction, blockers[], documentRequirements[], riskLevel, slaDeadline, slaStatus, lastAuditEvents[], generatedAt
  10. Exportar todos los schemas y tipos
  11. Actualizar `schemas/index.ts` con `export * from "./service-case-cockpit.schema"`
  
  **Must NOT do**: No importar schemas que no existan (usar interfaces inline si es necesario)
  
  **Parallelization**: YES (Wave 0 con 0.2, 0.3). Blocks: Task 1.1.
  
  **QA Scenarios**:
  ```
  Scenario: New schema file exists and compiles
    Tool: Bash
    Steps:
      1. test -f packages/shared-types/src/schemas/service-case-cockpit.schema.ts → EXIT 0
      2. npm run typecheck -w @cermont/shared-types → EXIT 0
    Expected Result: File exists, typecheck passes
    Evidence: .sisyphus/evidence/task-0.1-cockpit-schema.txt
  ```
  
  **Commit**: `feat(schemas): create service-case-cockpit.schema.ts with 14-step progress tracker`

---

- [ ] 0.2. **Enriquecer schemas existentes (cost, execution-session, evidence, kit, dashboard-summary)**

  **What to do**:
  **0.2.a — `cost.schema.ts`**: Agregar al final (sin modificar existentes):
    - `CostCatalogItemSchema` con ObjectIdSchema.optional(), code, name, category (CostCategorySchema), unitCostCOP, unit, isBillable, isActive, description, createdAt, updatedAt
    - `BaselineCostSchema` con proposalId, proposalCode, frozenAt, totalEstimatedCOP, totalTaxCOP, byCategory
    - `CostIntelligenceSummarySchema` con orderId, orderCode, baselineCost, totalEstimated, totalActual, totalTaxCOP, totalMargin, marginPercent, budgetConsumedPercent, isAtRisk, isCritical, deviationByCategory, lastUpdatedAt
    - Enriched schemas extendiendo los existentes

  **0.2.b — `execution-session.schema.ts`**: Agregar al final:
    - `PreflightGateItemSchema` con key, label, isBlocking, isChecked, checkedAt, checkedBy
    - `PreflightChecklistSchema` con eppComplete, astSigned, ptwObtained, toolsValidated, vehicleDocumentsOk, certificationsCurrent, items[], completedAt, completedBy
    - `FieldNoveltySchema` con noveltyId, description, severity, evidenceIds[], generatesWorkRequest, workRequestId, reportedAt, reportedBy
    - En `EXECUTION_BLOCKER_VALUES` agregar: "preflight_not_completed", "sla_deadline_exceeded"
    - Exportar nuevos schemas

  **0.2.c — `evidence.schema.ts`**: Agregar:
    - En `EvidenceWorkflowStatusSchema` agregar "replacement_requested" al enum
    - `EvidenceSlotSchema` con slotId, phase, label, category, isRequired, isBlocking, evidenceId, fulfilledAt
    - `EvidenceSlotsRequirementsSchema` con serviceCaseId, slots[], requiredCount, fulfilledCount, pendingCount, blockingPendingCount, canClosePhase
    - Agregar a `EvidenceSchemaV2`: qualityScore, reviewedAt, reviewedBy, reviewNote, replacedBy, isRequired, slotId (todos opcionales)

  **0.2.d — `kit.schema.ts`**: Agregar:
    - `KitSafetyRequirementsSchema` con eppList[], requiresAST, requiresPTW, ptwTypes[], heightsWorkLevel, riskAssessmentRequired, minimumTechnicianCertifications[], medevacRequired
    - Extender `KitTemplateSchema` con safetyRequirements, activityType, estimatedDurationHours

  **0.2.e — `dashboard-summary.schema.ts`**: Agregar:
    - `DashboardOperationalKPISchema` con mttrMinutes, mtbfDays, firstTimeFixRate, technicianUtilizationRate, averageResponseTimeHours, onTimeCompletionRate, pendingInvoicesCount, overdueInvoicesCount, pendingReportsCount, currency, periodFrom, periodTo
    - `DashboardSLARiskOrderSchema` con orderId, orderCode, clientName, slaDeadline, hoursRemaining, currentStep, currentStepLabel, riskLevel, assignedTechnicianName, pendingAction
    - Extender DashboardSummarySchema con operationalKPIs, slaRiskOrders

  **Must NOT do**: No modificar campos existentes. No cambiar tipos. No eliminar nada.
  
  **Parallelization**: YES (Wave 0 con 0.1, 0.3). Blocks: Task 1.1, 2.2, 2.3, 2.4, 2.5.
  
  **QA Scenarios**:
  ```
  Scenario: All enriched schemas compile
    Tool: Bash
    Steps:
      1. npm run typecheck -w @cermont/shared-types → EXIT 0
      2. npm test -w @cermont/shared-types → EXIT 0 (baseline tests must pass)
    Expected Result: Typecheck passes, all baseline tests intact
    Evidence: .sisyphus/evidence/task-0.2-enriched-schemas.txt
  ```
  
  **Commit**: `feat(schemas): enrich cost, execution-session, evidence, kit, dashboard-summary schemas`

---

- [ ] 0.3. **Actualizar barrel exports**

  **What to do**:
  1. Verificar que `packages/shared-types/src/schemas/index.ts` exporta:
     - Todos los schemas nuevos de Task 0.1 (`export * from "./service-case-cockpit.schema"`)
     - Todos los schemas nuevos de Task 0.2
  2. Verificar que no haya exports duplicados o faltantes
  
  **Parallelization**: YES (Wave 0 con 0.1, 0.2). Blocks: Task 1.1.
  
  **QA**: `npm run typecheck -w @cermont/shared-types → PASS`
  
  **Commit**: `chore(schemas): update barrel exports for Spec-015 schemas`

---

### Wave 1 — Domain Rules (1 task, después de Wave 0)

- [ ] 1.1. **Crear `spec-015-rules.ts` en `packages/domain/src/`**

  **What to do**:
  1. Crear `packages/domain/src/spec-015-rules.ts` con las siguientes funciones:
     - `evaluatePreflightGates(items, checks): PreflightResult` — verifica si todos los blocking gates están completos
     - `evaluateSLARisk(slaDeadline, currentStep): SLARiskLevel` — "on_track" | "at_risk" | "overdue" basado en tiempo restante
     - `evaluateCostRisk(consumedPercent): CostRiskLevel` — "under_budget" | "on_budget" | "at_risk" | "critical"
     - `evaluateEvidenceCompleteness(slots): CanClosePhase` — verifica slots blocking completos
     - `computeMTTR(sessions): number` — Mean Time To Repair en minutos
     - `computeMTBF(orders): number` — Mean Time Between Failures en días
     - `computeFirstTimeFixRate(orders): number` — % órdenes sin retorno
  2. No importar schemas Zod — usar interfaces propias inline
  3. Actualizar `packages/domain/src/index.ts` con `export * from "./spec-015-rules"`
  
  **Must NOT do**: No importar schemas de shared-types (evitar dependencias circulares)
  
  **Parallelization**: NO. Blocked by: Task 0.1, 0.2. Blocks: Task 2.3, 2.4, 2.5.
  
  **QA Scenarios**:
  ```
  Scenario: Domain rules compile and tests pass
    Tool: Bash
    Steps:
      1. npm run typecheck -w @cermont/domain → EXIT 0
      2. npm test -w @cermont/domain → EXIT 0
    Expected Result: Typecheck passes, tests pass
    Evidence: .sisyphus/evidence/task-1.1-domain-rules.txt
  ```
  
  **Commit**: `feat(domain): add Spec-015 rules — preflight, SLA, cost risk, evidence, KPI computation`

---

### Wave 2 — Backend Endpoints (PARALLEL — 6 tasks)

- [ ] 2.1. **Endpoints `GET /costs/catalog` + `POST /costs/catalog`**

  **What to do**:
  1. Crear o enriquecer módulo backend `cost-catalog/` (puede estar dentro de `cost/` o ser módulo independiente)
  2. GET: lista paginada con filtros por categoría y búsqueda por nombre/código
  3. POST: crear ítem en catálogo validando contra CostCatalogItemSchema (sin _id, createdAt, updatedAt)
  4. RBAC: solo MANAGEMENT_ROLES + residente pueden crear/editar
  5. Sin try/catch en controller
  
  **Parallelization**: YES (Wave 2 con 2.2-2.6). Blocks: Task 3.2 (CostCatalogForm needs endpoint).
  
  **QA Scenarios**:
  ```
  Scenario: POST catalog item + GET list
    Tool: Bash (curl)
    Steps:
      1. Login → TOKEN
      2. POST /costs/catalog -d '{...}' → status 201
      3. GET /costs/catalog → status 200, array con item creado
    Evidence: .sisyphus/evidence/task-2.1-catalog-curl.txt
  ```
  
  **Commit**: `feat(backend): add GET/POST /costs/catalog for cost catalog CRUD`

---

- [ ] 2.2. **Endpoint `GET /costs/:orderId/intelligence`**

  **What to do**:
  1. Crear método `getIntelligence(orderId)` en cost.service.ts
  2. Consulta CostSummary para la orden + baseline de propuesta aprobada
  3. Calcula: margin, budgetConsumedPercent, isAtRisk, isCritical
  4. Retorna CostIntelligenceSummarySchema
  5. Controller delgado + ruta en cost.routes.ts
  
  **Parallelization**: YES (Wave 2). Blocked by: Task 0.2 (schema). Blocks: Task 3.2.
  
  **QA Scenarios**:
  ```
  Scenario: Cost intelligence returns data
    Tool: Bash (curl)
    Steps:
      1. GET /costs/:orderId/intelligence → status 200
      2. Assert: totalEstimated, totalActual, marginPercent, isAtRisk presentes
    Evidence: .sisyphus/evidence/task-2.2-intelligence.txt
  ```
  
  **Commit**: `feat(backend): add GET /costs/:orderId/intelligence with baseline vs actual comparison`

---

- [ ] 2.3. **Endpoint `POST /execution-sessions/:id/preflight`**

  **What to do**:
  1. Crear método `submitPreflightChecklist(sessionId, preflightData)` en execution-session.service.ts
  2. Valida contra PreflightChecklistSchema
  3. Usa evaluatePreflightGates del domain (Task 1.1)
  4. Si todos los blocking gates pasan → cambia status a "ready" si estaba "draft"
  5. Auditoría: PREFLIGHT_SUBMITTED
  6. Controller delgado + ruta en execution-session.routes.ts
  
  **Parallelization**: YES (Wave 2). Blocked by: Task 0.2 (schema), 1.1 (domain). Blocks: Task 3.2.
  
  **QA Scenarios**:
  ```
  Scenario: Submit preflight successfully
    Tool: Bash (curl)
    Steps:
      1. POST /execution-sessions/:id/preflight → status 200
      2. Assert: preflightChecklist saved to session
    Evidence: .sisyphus/evidence/task-2.3-preflight.txt
  ```
  
  **Commit**: `feat(backend): add POST /execution-sessions/:id/preflight endpoint`

---

- [ ] 2.4. **Endpoint `GET /dashboard/operational-kpis`**

  **What to do**:
  1. Crear método `getOperationalKPIs(periodFrom, periodTo)` en dashboard.service.ts
  2. Calcula MTTR desde ExecutionSession: promedio de (completedAt - startedAt) en minutos (usar computeMTTR)
  3. Calcula MTBF desde ServiceCase (usar computeMTBF)
  4. Calcula firstTimeFixRate (usar computeFirstTimeFixRate)
  5. Cuenta facturas pendientes/vencidas, reportes en draft
  6. Validate contra DashboardOperationalKPISchema
  7. Controller delgado + ruta en dashboard.routes.ts
  
  **Parallelization**: YES (Wave 2). Blocked by: Task 0.2 (schema), 1.1 (domain). Blocks: Task 3.1.
  
  **QA Scenarios**:
  ```
  Scenario: Operational KPIs returned
    Tool: Bash (curl)
    Steps:
      1. GET /dashboard/operational-kpis?periodFrom=...&periodTo=... → status 200
      2. Assert: mttrMinutes, mtbfDays, firstTimeFixRate, pendingInvoicesCount presentes
    Evidence: .sisyphus/evidence/task-2.4-kpis.txt
  ```
  
  **Commit**: `feat(backend): add GET /dashboard/operational-kpis endpoint with MTTR/MTBF/FirstTimeFixRate`

---

- [ ] 2.5. **Endpoint `GET /dashboard/sla-risk`**

  **What to do**:
  1. Crear método `getSLARiskOrders()` en dashboard.service.ts
  2. Busca ServiceCases activos con slaDeadline definido
  3. Calcula hoursRemaining, clasifica riskLevel (warning <24h, critical <6h)
  4. Validate contra DashboardSLARiskOrderSchema
  5. Controller delgado + ruta
  
  **Parallelization**: YES (Wave 2). Blocked by: Task 0.2 (schema). Blocks: Task 3.1.
  
  **QA Scenarios**:
  ```
  Scenario: SLA risk orders returned
    Tool: Bash (curl)
    Steps:
      1. GET /dashboard/sla-risk → status 200
      2. Assert: array con orderId, orderCode, slaDeadline, hoursRemaining, riskLevel
    Evidence: .sisyphus/evidence/task-2.5-sla-risk.txt
  ```
  
  **Commit**: `feat(backend): add GET /dashboard/sla-risk endpoint for SLA monitoring`

---

- [ ] 2.6. **Fix bug: ruta duplicada en `planning-packet.routes.ts`**

  **What to do**:
  1. Eliminar la segunda definición de `router.post("/:id/approve")` (líneas 123-130)
  2. Mantener solo la primera (líneas 115-122)
  3. Verificar que no haya fugas de lógica
  
  **Parallelization**: YES (Wave 2 independiente). No blocks.
  
  **QA**: Leer archivo → confirmar que solo hay una ruta approve. `npm run typecheck -w backend → PASS`.
  
  **Commit**: `fix(backend): remove duplicate POST /:id/approve route in planning-packet.routes.ts`

---

### Wave 3 — Frontend Componentes Faltantes (PARALLEL — 3 tasks)

- [ ] 3.1. **Dashboard: 8 componentes**

  **What to do**: Crear en `frontend/src/modules/dashboard/ui/`:
  - `DashboardKPIWidgets.tsx` — Grid 2x2 de tarjetas KPI
  - `KPIStatCard.tsx` — Icono + valor + label + sparkline (Recharts)
  - `MTTRMTBFCards.tsx` — MTTR (min) + MTBF (días) side-by-side
  - `FirstTimeFixRateGauge.tsx` — Gauge circular (Recharts RadialBarChart): verde>75%, amarillo 60-75%, rojo<60%
  - `PendingInvoicesAlert.tsx` — Alerta facturas pendientes (conectado a overdueInvoicesCount)
  - `PendingReportsAlert.tsx` — Alerta informes pendientes (conectado a pendingReportsCount)
  - `CashFlowFunnel.tsx` — Funnel: Ejecutado→SES→Factura→Pago con montos COP
  - `SLARiskOrdersTable.tsx` — Tabla órdenes en riesgo SLA
  
  Conectar a endpoints `/dashboard/operational-kpis` y `/dashboard/sla-risk` (Task 2.4, 2.5).
  Todos con loading/error/empty states.
  
  **Parallelization**: YES (Wave 3 con 3.2, 3.3). Blocked by: Task 2.4, 2.5. Blocks: Task 4.1.
  
  **QA Scenarios**:
  ```
  Scenario: KPI widgets with real data
    Tool: Playwright
    Steps:
      1. Navigate /dashboard
      2. Assert 4 KPIStatCards visible
      3. Assert MTTR card with value in minutes
      4. Assert FTR gauge circular
    Evidence: .sisyphus/evidence/task-3.1-kpi-widgets.png
  ```
  
  **Commit**: `feat(ui): add dashboard KPI widgets, MTTR/MTBF cards, FTR gauge, alerts, funnel, and SLA table`

---

- [ ] 3.2. **Field-execution + Invoices + Costs: 8 componentes**

  **What to do**:
  **Field-execution** (`frontend/src/modules/field-execution/ui/`):
  - `ExecutionTimer.tsx` — Cronómetro HH:MM:SS con barra de progreso (verde<80%, amarillo 80-100%, rojo>100%), alerta al exceder 110%
  - `ExecutionStatusBadge.tsx` — Badge estados: draft/ready/in_progress/paused/completed/cancelled
  - `EvidenceSlotCard.tsx` — Slot individual con estados (captured/uploaded/approved/rejected)
  
  **Invoices** (`frontend/src/modules/invoices/ui/`):
  - `AgingDashboard.tsx` — Tarjetas aging: Corriente/30d/60d/90d+ con conteo y monto COP
  - `InvoiceStatusBadge.tsx` — Badge workflow states
  - `PaymentRecordCard.tsx` — Monto, fecha, método, referencia
  
  **Costs** (`frontend/src/modules/costs/ui/`):
  - `CostDeviationStackedBar.tsx` — Barras Recharts por categoría, par estimado/real, % desviación
  - `MarginSummaryCard.tsx` — Ingreso vs costo real, badge margen %
  
  Todos con loading/error/empty states. Conectar a endpoints existentes.
  
  **Parallelization**: YES (Wave 3 con 3.1, 3.3). Blocked by: Task 2.1, 2.2, 2.3. Blocks: Task 4.1.
  
  **QA Scenarios**:
  ```
  Scenario: Budget gauge 70% yellow
    Tool: Playwright
    Steps:
      1. Navigate /costs/:orderId
      2. Assert gauge "70%" yellow
      3. Assert tooltip presupuesto estimado vs real
    Evidence: .sisyphus/evidence/task-3.2-budget-gauge.png
  ```
  
  **Commit**: `feat(ui): add ExecutionTimer, ExecutionStatusBadge, EvidenceSlotCard, AgingDashboard, InvoiceStatusBadge, PaymentRecordCard, CostDeviationStackedBar, MarginSummaryCard`

---

- [ ] 3.3. **Reports + Notifications + Portal: 8 componentes**

  **What to do**:
  **Reports** (`frontend/src/modules/reports/ui/`):
  - `TechnicalReportDraftPage.tsx` — Vista editable: datos, actividades, materiales, evidencias, novedades, conclusión. Botones Regenerar/Aprobar/PDF.
  - `ReportVersionHistory.tsx` — Timeline vertical de versiones
  - `PDFExportButton.tsx` — Exportación PDF
  - `ReportReviewPanel.tsx` — Verificar/Rechazar + motivo
  
  **Notifications** (`frontend/src/modules/notifications/ui/`):
  - `NotificationCard.tsx` — Item individual con icono tipo, título, mensaje, tiempo, badge no-leído
  - `NotificationPreferences.tsx` — Toggles por tipo de evento
  
  **Portal** (`frontend/src/modules/portal/ui/`):
  - `PortalServiceCaseDetail.tsx` — Timeline simplificado, docs descargables. SIN costos/checklists/planeación.
  - `PortalDocumentDownload.tsx` — Lista de documentos descargables
  
  Todos con loading/error/empty states.
  
  **Parallelization**: YES (Wave 3 con 3.1, 3.2). Blocks: Task 4.1.
  
  **QA Scenarios**:
  ```
  Scenario: Report draft page loads
    Tool: Playwright
    Steps:
      1. Navigate /reports/:id/draft
      2. Assert sections: datos, actividades, materiales, evidencias, novedades
      3. Assert conclusión editable
    Evidence: .sisyphus/evidence/task-3.3-report-draft.png
  ```
  
  **Commit**: `feat(ui): add TechnicalReportDraftPage, ReportVersionHistory, PDFExportButton, ReportReviewPanel, NotificationCard, NotificationPreferences, PortalServiceCaseDetail, PortalDocumentDownload`

---

### Wave 4 — E2E Tests Reales (1 task, después de Waves 0-3)

- [ ] 4.1. **Reescribir 10 E2E specs con aserciones reales**

  **What to do**: Sobrescribir cada archivo en `frontend/tests/e2e/spec-014/`:
  
  **Requisitos por spec**:
  - `01-cockpit-14-steps.spec.ts` — Assert 14 step bubbles, assert header card con código SC, assert next action card, assert tabs cargan
  - `02-dashboard-kpis.spec.ts` — Assert KPIStatCards, assert MTTR visible, assert gauge circular
  - `03-cost-intelligence.spec.ts` — Assert budget gauge, assert deviation bars, assert baseline card
  - `04-field-execution.spec.ts` — Assert preflight checkboxes, assert botón deshabilitado hasta completar, assert timer
  - `05-report-auto-draft.spec.ts` — Assert draft secciones, assert firma canvas, assert PDF button
  - `06-invoice-pipeline.spec.ts` — Assert pipeline 3 etapas, assert aging dashboard buckets
  - `07-notifications.spec.ts` — Assert bell badge, assert panel slide-in, assert mark as read
  - `08-portal-cliente.spec.ts` — Assert solo órdenes del cliente, assert sin costos, assert firma acta
  - `09-rbac-all-roles.spec.ts` — Probar 8 roles en las 11 páginas nuevas
  - `10-full-14-step-flow.spec.ts` — Flujo completo navegando todas las páginas
  
  Cada spec debe aserciones REALES (no `expect(true).toBeTruthy()`):
  - `await expect(page.locator(...)).toBeVisible()`
  - `await expect(page).toHaveURL()`
  - `await expect(page.locator(...)).toHaveCount(14)`
  
  Incluir: happy path, error state, forbidden state.
  
  **Parallelization**: NO. Blocked by: Tasks 0.1-3.3. Blocks: Task 5.1.
  
  **QA Scenarios**:
  ```
  Scenario: All E2E specs pass
    Tool: Bash
    Steps:
      1. npm run test:e2e -w frontend -- tests/e2e/spec-014/ → EXIT 0
      2. Assert: 10/10 specs pass
    Evidence: .sisyphus/evidence/task-4.1-e2e-results.txt
  ```
  
  **Commit**: `test(e2e): rewrite 10 E2E specs with real assertions replacing placeholders`

---

### Wave 5 — Gates Finales (1 task, después de Wave 4)

- [ ] 5.1. **Gates de calidad + evidencia + documentación**

  **What to do**:
  ```bash
  npm run typecheck 2>&1 | tee .sisyphus/evidence/s5-1-typecheck.txt
  npm run lint 2>&1 | tee .sisyphus/evidence/s5-1-lint.txt
  npm test 2>&1 | tee .sisyphus/evidence/s5-1-tests.txt
  npm run build 2>&1 | tee .sisyphus/evidence/s5-1-build.txt
  npm run contracts:check 2>&1 | tee .sisyphus/evidence/s5-1-contracts.txt
  npm run quality:strict 2>&1 | tee .sisyphus/evidence/s5-1-quality.txt
  npx react-doctor@latest 2>&1 | tee .sisyphus/evidence/s5-1-react-doctor.txt
  ```
  
  Si `quality:strict` falla: ajustar baseline temporalmente.
  Si React Doctor < 87/100: corregir issues antes de declarar completo.
  
  Documentación:
  - Actualizar `docs/architecture/FRONTEND_ROUTE_MAP.md` si hubo cambios
  - Actualizar `docs/architecture/API_ENDPOINT_MATRIX.md` con nuevos endpoints
  - Verificar lectura de AGENTS.md y README
  
  **Parallelization**: NO. Blocked by: Task 4.1.
  
  **Commit**: `chore(gates): update quality baselines and documentation for Spec-015`

---

## Dependency Matrix

| Task | Blocked By | Blocks |
|---|---|---|
| 0.1 | — | 1.1, 3.1, 4.1 |
| 0.2 | — | 1.1, 2.2, 2.3, 2.4, 2.5, 4.1 |
| 0.3 | 0.1, 0.2 | 1.1, 4.1 |
| 1.1 | 0.1, 0.2, 0.3 | 2.3, 2.4, 4.1 |
| 2.1 | 0.2 | 3.2, 4.1 |
| 2.2 | 0.2 | 3.2, 4.1 |
| 2.3 | 0.2, 1.1 | 3.2, 4.1 |
| 2.4 | 0.2, 1.1 | 3.1, 4.1 |
| 2.5 | 0.2 | 3.1, 4.1 |
| 2.6 | — | 4.1 |
| 3.1 | 2.4, 2.5 | 4.1 |
| 3.2 | 2.1, 2.2, 2.3 | 4.1 |
| 3.3 | — | 4.1 |
| 4.1 | 0.1-3.3 | 5.1 |
| 5.1 | 4.1 | — |

---

## Definition of Done

- [ ] Wave 0: 3 tareas de schemas completadas con typecheck ✅
- [ ] Wave 1: 1 archivo de domain rules con 8 funciones ✅
- [ ] Wave 2: 6 endpoints backend nuevos + bug fix ✅
- [ ] Wave 3: 24 componentes frontend faltantes en 6 módulos ✅
- [ ] Wave 4: 10 E2E specs reescritas con aserciones reales ✅
- [ ] Wave 5: Todos los gates verdes (typecheck/lint/test/build/contracts:check/quality:strict/react-doctor) ✅
- [ ] Bug B1 (ruta duplicada) corregido ✅
- [ ] No se introdujeron nuevos `any`, `unknown`, `null`, `undefined` ✅
- [ ] No se eliminó funcionalidad existente ✅
- [ ] `FileAsset` sigue siendo SSOT (no se creó `MediaAsset`) ✅
- [ ] Evidencia en `.sisyphus/evidence/` para cada tarea ✅
- [ ] Documentación actualizada si aplica ✅
