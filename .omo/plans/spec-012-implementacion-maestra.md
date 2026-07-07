# CERMONT — Spec-012: Plan de Implementación Detallado

> **Plan de ejecución para el arquitecto IA.** Basado en el documento `CERMONT — Spec 012: Plan Maestro de Escalamiento Post Spec-009/010/011.md` y el análisis del código actual del repositorio.

---

## TL;DR

> **Objetivo**: Implementar el Plan Maestro de Escalamiento Spec-012 en el repositorio CERMONT, elevando los módulos críticos del flujo de 14 pasos de nivel 2-3 a nivel 4-5 con campos enriquecidos, nuevos endpoints backend (cockpit, readiness, KPIs), componentes frontend (cockpit de 14 pasos, dashboard OS, cost intelligence) e informes automáticos.

> **Scope**: 6 sprints atómicos sobre ramas dedicadas. Cada sprint produce `typecheck ✅ · lint ✅ · test ✅ · build ✅ · contracts:check ✅`.

> **Regla cardinal**: No romper funcionalidad existente. Todos los campos nuevos en schemas existentes deben ser `optional()` o tener `.default()`. Los 1013+ tests del baseline deben seguir pasando.

> **Entregables**: 6 schemas enriquecidos + 1 archivo nuevo de schema + reglas de dominio + 8 endpoints backend + 8+ componentes frontend + 5 páginas nuevas.

---

## Contexto

### Documento Fuente
- **Spec-012**: `CERMONT — Spec 012: Plan Maestro de Escalamiento Post Spec-009/010/011.md` (875 líneas)
- **Flujo de negocio (14 pasos)**: Documento `07_DESARROLLO_DE_UN_APLICATIVO_WEB...` que describe los 14 pasos operativos desde solicitud hasta pago
- **Tesis académica**: `01_main10.md` (203 páginas) — arquitectura general, flujo de 14 pasos, stack tecnológico

### Estado Actual del Código (Verificado)

| Archivo | Líneas | Estado Actual |
|---------|--------|---------------|
| `execution-session.schema.ts` | 554 | Tiene `ExecutionSessionSchema`, blocker codes, comandos. **Sin** preflight gates, field novelties, SLA deadline |
| `evidence.schema.ts` | 341 | Tiene `EvidenceSchemaV2`, `EvidenceWorkflowStatusSchema`. **Sin** `replacement_requested`, slot system, qualityScore |
| `kit.schema.ts` | 307 | Tiene `KitItemSchema` con categorías. **Sin** `isBillable`, `unitCostCOP`, `catalogItemId`, `KitSafetyRequirementsSchema` |
| `dashboard-summary.schema.ts` | 269 | Tiene `DashboardMaintenanceEfficiencySchema` con mttrHours/mtbfDays. **Sin** `DashboardOperationalKPISchema`, `DashboardSLARiskOrderSchema` |
| `cost.schema.ts` | 157 | Tiene `CostSummarySchema`. **Sin** `CostCatalogItemSchema`, `BaselineCostSchema`, `CostIntelligenceSummarySchema` |
| `execution.ts` (domain) | 223 | Tiene `canStartExecution`, `calculateExecutionBlockers`. **Sin** preflight evaluation, SLA risk |
| `cost.rules.ts` (domain) | 126 | Tiene `evaluateCostBudgetRisk`, `calculateGrossMargin`. **Sin** margin intelligence extendida |
| `planning.rules.ts` (domain) | 146 | Tiene `isPlanningReady`, `getPlanningBlockers`. **Sin** readiness gates de vehículos/herramientas |
| `schemas/index.ts` | 208 | **Necesita** nuevos barrel exports |

### Guardrails Absolutos (del Spec-012 y REGLAS_DESARROLLO)

1. ❌ No crear módulo `MediaAsset` — `FileAsset` es el SSOT
2. ❌ No agregar campos `required` sin `default()` en schemas existentes — rompe 1013+ tests
3. ❌ No introducir `any`, `unknown`, `null`, `undefined` explícitos
4. ❌ No hardcodear roles en el frontend — usar JWT claims y RBAC del domain
5. ❌ No avanzar a Sprint 3 (UI) sin que el endpoint `/service-cases/:id/cockpit` exista en Sprint 2
6. ❌ No pedir 20 especificaciones por herramienta — usar catálogo + campos mínimos
7. ❌ No agregar nuevas dependencias a `package.json` sin justificación
8. ❌ No introducir AI Copilot (P2) antes de que cockpit e informes automáticos (P1) estén estables

---

## Work Objectives

### Core Objective
Implementar el Plan Maestro de Escalamiento Spec-012 en 6 sprints, comenzando por el enriquecimiento de contratos (SSOT), seguido de backend, frontend cockpit, dashboard OS, cost intelligence, e informes automáticos.

### Concrete Deliverables

**Sprint 1 — SSOT Enrichment:**
- `execution-session.schema.ts` enriquecido con `PreflightChecklistSchema`, `FieldNoveltySchema`, `slaDeadline`, `estimatedMinutes`
- `evidence.schema.ts` enriquecido con `replacement_requested`, `EvidenceSlotSchema`, `EvidenceSlotsRequirementsSchema`, `qualityScore`
- `kit.schema.ts` enriquecido con `isBillable`, `unitCostCOP`, `catalogItemId`, `KitSafetyRequirementsSchema`
- `dashboard-summary.schema.ts` enriquecido con `DashboardOperationalKPISchema`, `DashboardSLARiskOrderSchema`
- `cost.schema.ts` enriquecido con `CostCatalogItemSchema`, `BaselineCostSchema`, `CostIntelligenceSummarySchema`
- `service-case-cockpit.schema.ts` **NUEVO** — `ServiceCaseCockpitSchema` completo
- `schemas/index.ts` actualizado con todos los nuevos exports
- `packages/domain` enriquecido con funciones de evaluación (preflight, SLA, cost risk, evidence completeness, KPI computation)

**Sprint 2 — Backend Endpoints:**
- `GET /service-cases/:id/cockpit` — servicio compuesto que agrega datos de 14 módulos
- `GET /planning-packets/:id/readiness` — gate de disponibilidad
- `POST /planning-packets/:id/approve` — aprobación con readiness check
- `POST /execution-sessions/:id/preflight` — registro de preflight gates
- `GET /costs/:orderId/intelligence` — baseline vs actual, margin
- `GET/POST /costs/catalog` — CRUD de catálogo de costos
- `GET /dashboard/operational-kpis` — MTTR, MTBF, first-time fix rate
- `GET /dashboard/sla-risk` — órdenes en riesgo de SLA

**Sprint 3 — Frontend Cockpit 14 Pasos:**
- `FourteenStepProgressBar`, `NextActionCard`, `BlockersPanelCollapsible`, `CockpitTabs`
- `PreflightGatesForm`, `ExecutionTimer`, `StructuredEvidenceCapture`, `FieldNoveltyButton`

**Sprint 4 — Dashboard OS:**
- MTTR/MTBF cards, FirstTimeFixRateGauge, SLARiskOrdersTable, CashFlowFunnel

**Sprint 5 — Cost Intelligence:**
- `/costs/catalog` page, CostCatalogSearch, BaselineCostCard, BudgetConsumedGauge

**Sprint 6 — Auto-generated Reports:**
- Auto-draft endpoint, TechnicalReportDraftPage, DigitalSignaturePad, PDF export

### Definition of Done
- [ ] Cada sprint: `npm run typecheck` PASS
- [ ] Cada sprint: `npm run lint` PASS
- [ ] Cada sprint: `npm run test` PASS (baseline 1013+ tests intactos)
- [ ] Cada sprint: `npm run build` PASS
- [ ] Cada sprint: `npm run contracts:check` PASS

### Must Have
- Todos los nuevos campos en schemas existentes SON opcionales o tienen default
- Nuevos archivos de schema tienen barrel export en `schemas/index.ts`
- Backend endpoints siguen patrón: `authenticate → authorize → validateParams → controller → service`
- Frontend componentes tienen loading/error/empty states
- RBAC validado en todos los nuevos endpoints

### Must NOT Have
- ❌ `any`, `unknown`, `null`, `undefined` explícitos
- ❌ `console.log` en producción
- ❌ Mock data en producción
- ❌ `try/catch` en controllers de Express 5
- ❌ Llamadas directas a `fetch` en componentes frontend
- ❌ `useEffect` para data fetching
- ❌ Roles hardcodeados en componentes

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES — 1013+ tests (Vitest backend + frontend)
- **Automated tests**: Tests-after (no TDD para este plan)
- **Framework**: Vitest 4.x (backend), Vitest 4.x (frontend)
- **Agent-Executed QA**: MANDATORY — cada tarea incluye escenarios QA con curl para APIs y Playwright para UI

### QA Policy
Cada tarea debe tener escenarios QA ejecutables por el agente:
- **API endpoints**: curl → assert status/body
- **Frontend**: direct verification of file existence and imports
- **Evidence**: `.sisyphus/evidence/task-{N}-{scenario}.{ext}`

---

## Execution Strategy

### Secuencia Correcta de Sprints
```
Sprint 1: SSOT enrichment → solo packages/ (sin tocar backend/frontend)
Sprint 2: Backend endpoints cockpit + readiness + cost intelligence
Sprint 3: Frontend cockpit 14 pasos + preflight + evidence slots
Sprint 4: Dashboard OS con KPIs reales (MTTR/MTBF/SLA risk)
Sprint 5: Cost catalog + intelligence UI
Sprint 6: Auto-generated reports + digital signatures + PDF export
```

### Ramas por Sprint
- Sprint 1: `implement/spec-012-ssot-enrichment`
- Sprint 2: `implement/spec-012-backend-cockpit-readiness`
- Sprint 3: `implement/spec-012-cockpit-ui`
- Sprint 4: `implement/spec-012-dashboard-os`
- Sprint 5: `implement/spec-012-cost-intelligence`
- Sprint 6: `implement/spec-012-reports-signatures`

### Dependency Chain
```
Sprint 1 → Sprint 2 → Sprint 3
                   ↓
              Sprint 4 ← Sprint 5
                        ↓
                   Sprint 6
```

---

## SPRINT 1 — SSOT Enrichment (packages/shared-types + packages/domain)

> **Rama**: `implement/spec-012-ssot-enrichment`
> **Objetivo**: Enriquecer contratos Zod sin romper tests existentes.
> **Regla**: Todos los campos nuevos deben ser `optional()` o tener `.default()` para backward compatibility.
> **Gate de salida**: `npm run typecheck ✅ · npm test ✅ · npm run contracts:check ✅`

---

- [ ] S1.1. **Enriquecer `execution-session.schema.ts`**

  **What to do**:
  1. Agregar `PreflightGateItemSchema` — schema `.strict()` con: `key` (z.string().min(1).max(80)), `label` (z.string().min(1).max(200)), `isBlocking` (z.boolean().default(true)), `isChecked` (z.boolean().default(false)), `checkedAt` (z.string().datetime().optional()), `checkedBy` (ObjectIdSchema.optional())
  2. Agregar `PreflightChecklistSchema` — schema `.strict()` con: `eppComplete` (z.boolean().default(false)), `astSigned` (z.boolean().default(false)), `ptwObtained` (z.boolean().default(false)), `toolsValidated` (z.boolean().default(false)), `vehicleDocumentsOk` (z.boolean().default(false)), `items` (z.array(PreflightGateItemSchema).default([])), `completedAt` (z.string().datetime().optional()), `completedBy` (ObjectIdSchema.optional())
  3. Agregar `FieldNoveltySchema` — schema `.strict()` con: `noveltyId` (z.string().uuid()), `description` (z.string().min(5).max(2000)), `severity` (z.enum(["low", "medium", "high", "critical"])), `evidenceIds` (z.array(ObjectIdSchema).default([])), `generatesWorkRequest` (z.boolean().default(false)), `workRequestId` (ObjectIdSchema.optional()), `reportedAt` (z.string().datetime()), `reportedBy` (ObjectIdSchema)
  4. En `EXECUTION_BLOCKER_VALUES` agregar: `"preflight_not_completed"`, `"sla_deadline_exceeded"`
  5. En `EXECUTION_NEXT_ACTION_VALUES` agregar: `"complete_preflight_checklist"`
  6. En `ExecutionSessionSchema` agregar los siguientes campos (todos opcionales o con default):
     - `scheduledStartDate: z.string().datetime().optional()`
     - `slaDeadline: z.string().datetime().optional()`
     - `estimatedMinutes: z.number().int().positive().optional()`
     - `elapsedMinutes: z.number().int().nonneg().optional()`
     - `preflightChecklist: PreflightChecklistSchema.optional()`
     - `fieldNovelties: z.array(FieldNoveltySchema).default([])`
  7. Exportar todos los nuevos schemas y tipos

  **Must NOT do**:
  - No modificar campos existentes de `ExecutionSessionSchema` — solo agregar
  - No cambiar tipos de campos existentes

  **Parallelization**: Wave 1 (with S1.2, S1.3, S1.4, S1.5, S1.6)
  **Blocks**: Domain rules depend on these schemas

  **QA Scenarios**:
  ```
  Scenario: Verify new schemas compile
    Tool: Bash
    Steps:
      1. Run: npm run typecheck -w @cermont/shared-types
      2. Check: exit code 0
    Expected Result: Typecheck passes with new schemas
    Evidence: .sisyphus/evidence/s1-1-typecheck.txt

  Scenario: Verify backward compatibility
    Tool: Bash
    Steps:
      1. Run: npm run test -w @cermont/shared-types
      2. Check: all existing tests pass (baseline tests not broken)
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/s1-1-tests.txt
  ```

  **Commit**: YES
  - Message: `feat(schemas): enrich execution-session with preflight gates and field novelties`
  - Pre-commit: `npm run typecheck -w @cermont/shared-types && npm run test -w @cermont/shared-types`

---

- [ ] S1.2. **Enriquecer `evidence.schema.ts`**

  **What to do**:
  1. En `EvidenceWorkflowStatusSchema` agregar `"replacement_requested"` al enum (entre `"rejected"` y `"locked"`)
  2. Agregar `EvidenceSlotSchema` — schema `.strict()` con: `slotId` (z.string().min(1).max(80)), `phase` (EvidencePhaseSchema), `label` (z.string().min(1).max(200)), `category` (EvidenceCategorySchema.optional()), `isRequired` (z.boolean().default(true)), `isBlocking` (z.boolean().default(false)), `evidenceId` (ObjectIdSchema.optional()), `fulfilledAt` (z.string().datetime().optional())
  3. Agregar `EvidenceSlotsRequirementsSchema` — schema `.strict()` con: `serviceCaseId` (ObjectIdSchema), `slots` (z.array(EvidenceSlotSchema)), `requiredCount` (z.number().int().nonneg()), `fulfilledCount` (z.number().int().nonneg()), `pendingCount` (z.number().int().nonneg()), `blockingPendingCount` (z.number().int().nonneg()), `canClosePhase` (z.boolean())
  4. En `EvidenceSchemaV2` agregar (todos opcionales):
     - `qualityScore: z.number().int().min(0).max(100).optional()`
     - `reviewedAt: z.string().datetime().optional()`
     - `reviewedBy: ObjectIdSchema.optional()`
     - `reviewNote: z.string().max(1000).optional()`
     - `replacedBy: ObjectIdSchema.optional()`
     - `isRequired: z.boolean().default(false)`
     - `slotId: z.string().max(80).optional()`
  5. Exportar todos los nuevos schemas y tipos

  **Must NOT do**:
  - No modificar la posición de los valores existentes en el enum (solo agregar al final o entre valores)
  - No cambiar la estructura de `EvidenceWorkflowFields` existente

  **Parallelization**: Wave 1 (with S1.1, S1.3, S1.4, S1.5, S1.6)

  **QA Scenarios**:
  ```
  Scenario: Verify new evidence schemas compile
    Tool: Bash
    Steps:
      1. Run: npm run typecheck -w @cermont/shared-types
      2. Check: exit code 0
    Expected Result: Typecheck passes
    Evidence: .sisyphus/evidence/s1-2-typecheck.txt

  Scenario: Verify replacement_requested is valid enum value
    Tool: Bash
    Steps:
      1. Run a Node one-liner to verify the Zod enum parses correctly
    Expected Result: "replacement_requested" is accepted by EvidenceWorkflowStatusSchema
    Evidence: .sisyphus/evidence/s1-2-enum.txt
  ```

  **Commit**: YES
  - Message: `feat(schemas): enrich evidence with slot requirements and replacement_requested`
  - Pre-commit: `npm run typecheck -w @cermont/shared-types && npm run test -w @cermont/shared-types`

---

- [ ] S1.3. **Enriquecer `kit.schema.ts`**

  **What to do**:
  1. En `KitItemSchema` agregar los siguientes campos:
     - `isBillable: z.boolean().default(false)` — solo aplica a materials
     - `unitCostCOP: z.number().nonneg().optional()` — precio de referencia COP
     - `catalogItemId: z.string().optional()` — vínculo al catálogo global de costos
     - `returnRequired: z.boolean().default(true)` — solo aplica a tools/equipment
  2. Agregar `KitSafetyRequirementsSchema` — schema `.strict()` con:
     - `eppList: z.array(z.string().min(1).max(100)).default([])` — ej: ["casco", "arnes", "gafas"]
     - `requiresAST: z.boolean().default(false)`
     - `requiresPTW: z.boolean().default(false)`
     - `riskAssessmentRequired: z.boolean().default(false)`
     - `minimumTechnicianCertifications: z.array(z.string()).default([])`
  3. En `KitTemplateSchema` agregar:
     - `safetyRequirements: KitSafetyRequirementsSchema.optional()`

  **Must NOT do**:
  - No modificar campos existentes de `KitItemSchema` — solo agregar
  - No cambiar la estructura de `KitTemplateSchema` más allá de agregar `safetyRequirements`

  **Parallelization**: Wave 1

  **QA Scenarios**:
  ```
  Scenario: Verify kit schemas compile
    Tool: Bash
    Steps:
      1. Run: npm run typecheck -w @cermont/shared-types
    Expected Result: Typecheck passes
    Evidence: .sisyphus/evidence/s1-3-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(schemas): enrich kit with billable fields, catalog link, and safety requirements`
  - Pre-commit: `npm run typecheck -w @cermont/shared-types && npm run test -w @cermont/shared-types`

---

- [ ] S1.4. **Enriquecer `dashboard-summary.schema.ts`**

  **What to do**:
  1. Agregar `DashboardOperationalKPISchema` — schema `.strict()` con:
     - `mttrMinutes: z.number().nonneg()` — Mean Time To Repair
     - `mtbfDays: z.number().nonneg()` — Mean Time Between Failures
     - `firstTimeFixRate: z.number().min(0).max(100)` — % órdenes resueltas sin retorno
     - `technicianUtilizationRate: z.number().min(0).max(100)` — % tiempo productivo
     - `averageResponseTimeHours: z.number().nonneg()`
     - `onTimeCompletionRate: z.number().min(0).max(100)`
     - `currency: z.string().default("COP")`
     - `periodFrom: z.string().datetime()`
     - `periodTo: z.string().datetime()`
  2. Agregar `DashboardSLARiskOrderSchema` — schema `.strict()` con:
     - `orderId: z.string()`
     - `orderCode: z.string()`
     - `clientName: z.string().optional()`
     - `slaDeadline: z.string().datetime()`
     - `hoursRemaining: z.number()`
     - `currentStep: z.number().int().min(1).max(14)`
     - `riskLevel: z.enum(["warning", "critical"])`
     - `assignedTechnicianName: z.string().optional()`
  3. En `DashboardSummarySchema` agregar (opcionales):
     - `operationalKPIs: DashboardOperationalKPISchema.optional()`
     - `slaRiskOrders: z.array(DashboardSLARiskOrderSchema).default([])`

  **Must NOT do**:
  - No modificar campos existentes del `DashboardSummarySchema`
  - `DashboardMaintenanceEfficiencySchema` ya existe en el schema y tiene mttrHours/mtbfDays — el nuevo `DashboardOperationalKPISchema` es complementario (más campos y formato de minutos/días exactos)

  **Parallelization**: Wave 1

  **QA Scenarios**:
  ```
  Scenario: Verify dashboard schemas compile
    Tool: Bash
    Steps:
      1. Run: npm run typecheck -w @cermont/shared-types
    Expected Result: Typecheck passes
    Evidence: .sisyphus/evidence/s1-4-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(schemas): enrich dashboard-summary with operational KPIs and SLA risk orders`
  - Pre-commit: `npm run typecheck -w @cermont/shared-types && npm run test -w @cermont/shared-types`

---

- [ ] S1.5. **Enriquecer `cost.schema.ts`**

  **What to do**:
  1. Agregar `CostCatalogItemSchema` — schema `.strict()` con:
     - `_id: ObjectIdSchema.optional()`
     - `code: z.string().min(1).max(40)`
     - `name: z.string().min(1).max(200)`
     - `category: CostCategorySchema`
     - `unitCostCOP: z.number().nonneg()`
     - `unit: z.string().min(1).max(50)` — "hora", "m2", "unidad", "kg"
     - `isBillable: z.boolean().default(true)`
     - `isActive: z.boolean().default(true)`
     - `description: z.string().max(500).optional()`
     - `createdAt: z.string().datetime()`
     - `updatedAt: z.string().datetime()`
  2. Agregar `BaselineCostSchema` — schema `.strict()` con:
     - `proposalId: ObjectIdSchema`
     - `proposalCode: z.string().min(1).max(40)`
     - `frozenAt: z.string().datetime()` — inmutable desde aprobación
     - `totalEstimatedCOP: z.number().nonneg()`
     - `byCategory: z.array(CostByCategorySchema)`
  3. Agregar `CostIntelligenceSummarySchema` — schema `.strict()` con:
     - `orderId: z.string()`
     - `orderCode: z.string()`
     - `baselineCost: BaselineCostSchema.optional()`
     - `totalEstimated: z.number().nonneg()`
     - `totalActual: z.number().nonneg()`
     - `totalMargin: z.number()`
     - `marginPercent: z.number()`
     - `budgetConsumedPercent: z.number().nonneg()`
     - `isAtRisk: z.boolean()`
     - `isCritical: z.boolean()`
     - `deviationByCategory: z.array(CostByCategorySchema)`
     - `lastUpdatedAt: z.string().datetime()`
  4. En `CostSummarySchema` agregar (opcionales):
     - `baselineCost: BaselineCostSchema.optional()`
     - `totalMarginCOP: z.number()`
     - `marginPercent: z.number()`
     - `budgetConsumedPercent: z.number().min(0)`
     - `isAtRisk: z.boolean()` — true si budgetConsumedPercent > 80%
     - `isCritical: z.boolean()` — true si budgetConsumedPercent > 100%
  5. Exportar todos los nuevos schemas y tipos

  **Must NOT do**:
  - No modificar campos existentes de `CostSummarySchema` — solo agregar

  **Parallelization**: Wave 1

  **QA Scenarios**:
  ```
  Scenario: Verify cost schemas compile
    Tool: Bash
    Steps:
      1. Run: npm run typecheck -w @cermont/shared-types
    Expected Result: Typecheck passes
    Evidence: .sisyphus/evidence/s1-5-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(schemas): enrich cost with catalog, baseline, and intelligence summary`
  - Pre-commit: `npm run typecheck -w @cermont/shared-types && npm run test -w @cermont/shared-types`

---

- [ ] S1.6. **Crear `service-case-cockpit.schema.ts` (ARCHIVO NUEVO)**

  **What to do**:
  1. Crear archivo `packages/shared-types/src/schemas/service-case-cockpit.schema.ts`
  2. Importar: `z` de "zod", `ObjectIdSchema` de "./common.schema"
  3. Importar `ExecutionSessionBlockerSchema` de "./execution-session.schema"
  4. Importar `EvidenceSlotsRequirementsSchema` de "./evidence.schema"
  5. Importar `CostIntelligenceSummarySchema` de "./cost.schema"
  6. Definir `StepStatusEnum` = z.enum(["pending", "in_progress", "completed", "blocked", "skipped"])
  7. Definir `StepProgressSchema` — schema `.strict()` con:
     - `step: z.number().int().min(1).max(14)`
     - `label: z.string().min(1).max(100)`
     - `moduleKey: z.string().min(1).max(80)` — ej: "work_request", "site_visit"
     - `status: StepStatusEnum`
     - `completedAt: z.string().datetime().optional()`
     - `completedBy: ObjectIdSchema.optional()`
     - `blockerReason: z.string().max(500).optional()`
     - `deepLink: z.string().max(300).optional()`
  8. Definir `NextExpectedActionSchema` — schema `.strict()` con:
     - `stepNumber: z.number().int().min(1).max(14)`
     - `description: z.string().min(1).max(500)`
     - `assignedRoles: z.array(z.string().min(1).max(50))`
     - `dueDate: z.string().datetime().optional()`
     - `deepLink: z.string().max(300)`
     - `urgency: z.enum(["normal", "urgent", "overdue"])`
  9. Definir `ServiceCaseCockpitSchema` — schema `.strict()` con:
     - `serviceCaseId: ObjectIdSchema`
     - `serviceCaseCode: z.string().min(1).max(40)`
     - `clientName: z.string().max(200).optional()`
     - `workDescription: z.string().max(1000).optional()`
     - `stepProgress: z.array(StepProgressSchema)` — 14 pasos
     - `currentStep: z.number().int().min(1).max(14)`
     - `completedSteps: z.number().int().min(0).max(14)`
     - `nextExpectedAction: NextExpectedActionSchema`
     - `blockers: z.array(ExecutionSessionBlockerSchema)` — reutiliza blocker existente
     - `documentRequirements: z.array(...).default([])` — array con documentType, label, step, status, fileAssetId
     - `evidenceRequirements: EvidenceSlotsRequirementsSchema.optional()`
     - `costSummary: CostIntelligenceSummarySchema.optional()`
     - `riskLevel: z.enum(["low", "medium", "high", "critical"])`
     - `slaDeadline: z.string().datetime().optional()`
     - `slaStatus: z.enum(["on_track", "at_risk", "overdue"]).optional()`
     - `lastAuditEvents: z.array(...).default([])` — array con event, entityType, actorName, occurredAt
     - `generatedAt: z.string().datetime()`
  10. Exportar todos los schemas y tipos

  **Must NOT do**:
  - No importar schemas que no existan aún en el proyecto
  - Usar nombres únicos para evitar colisiones con exportaciones existentes

  **Parallelization**: Wave 1 (depende de S1.1, S1.2, S1.5 para imports)

  **QA Scenarios**:
  ```
  Scenario: New cockpit schema file exists
    Tool: Bash
    Steps:
      1. Check: test -f packages/shared-types/src/schemas/service-case-cockpit.schema.ts
    Expected Result: File exists
    Evidence: .sisyphus/evidence/s1-6-file-exists.txt

  Scenario: Cockpit schema compiles
    Tool: Bash
    Steps:
      1. Run: npm run typecheck -w @cermont/shared-types
    Expected Result: Typecheck passes
    Evidence: .sisyphus/evidence/s1-6-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(schemas): create service-case-cockpit schema with 14-step progress tracker`
  - Pre-commit: `npm run typecheck -w @cermont/shared-types && npm run test -w @cermont/shared-types`

---

- [ ] S1.7. **Actualizar `schemas/index.ts` con nuevos exports**

  **What to do**:
  1. Agregar al archivo `packages/shared-types/src/schemas/index.ts` los exports para `service-case-cockpit.schema`:
     ```
     export * from "./service-case-cockpit.schema";
     ```
  2. Verificar que todos los nuevos schemas de S1.1-S1.6 estén correctamente exportados desde sus respectivos archivos (los barrel exports `export *` ya están configurados para `execution-session.schema`, `evidence.schema`, `kit.schema`, `dashboard-summary.schema`, `cost.schema` — solo agregar el nuevo archivo)

  **Must NOT do**:
  - No eliminar exports existentes
  - No cambiar el orden de los exports

  **Parallelization**: Wave 1 (después de S1.6)

  **QA Scenarios**:
  ```
  Scenario: All schemas index compiles
    Tool: Bash
    Steps:
      1. Run: npm run typecheck -w @cermont/shared-types
    Expected Result: Typecheck passes without errors
    Evidence: .sisyphus/evidence/s1-7-index-typecheck.txt
  ```

  **Commit**: YES (group with S1.6)
  - Message: `feat(schemas): add service-case-cockpit barrel export`

---

- [ ] S1.8. **Enriquecer `packages/domain` con nuevas reglas de negocio**

  **What to do**:
  1. **NUEVO ARCHIVO**: `packages/domain/src/spec-012-rules.ts` — Funciones de evaluación Spec-012:

     ```
     // evaluatePreflightGates(session): PreflightResult
     //   Retorna si TODOS los gates obligatorios están verificados antes de start_execution
     //   Input: { preflightChecklist?: { items: Array<{isBlocking: boolean, isChecked: boolean}> } }
     //   Output: { allBlockingGatesPassed: boolean, pendingBlockingGates: string[], totalGates: number, passedGates: number }

     // evaluateSLARisk(slaDeadline: string, currentStep: number): SLARiskLevel
     //   Retorna "on_track" | "at_risk" | "overdue" basado en tiempo restante y paso actual
     //   Lógica: calcular horas restantes, determinar riesgo según progreso

     // evaluateCostRisk(consumedPercent: number): CostRiskLevel
     //   Retorna "under_budget" (<60) | "on_budget" (60-80) | "at_risk" (80-100) | "critical" (>100)

     // evaluateEvidenceCompleteness(slots): CanClosePhase
     //   Retorna si los slots blocking están todos completos
     //   Input: Array<{isBlocking: boolean, fulfilledAt?: string}>
     //   Output: { canClose: boolean, blockingPendingCount: number }

     // computeMTTR(sessions: ExecutionSession[]): number (minutos)
     //   Calcula Mean Time To Repair desde sesiones completadas
     //   Lógica: promedio de (completedAt - startedAt) en minutos

     // computeMTBF(orders: ServiceCase[]): number (días)
     //   Calcula Mean Time Between Failures
     //   Lógica: diferencia promedio entre fechas de mantenimiento

     // computeFirstTimeFixRate(orders: ServiceCase[]): number (%)
     //   Calcula % de órdenes resueltas sin necesidad de retorno
     //   Lógica: órdenes sin re-apertura / total completadas

     // computeTechnicianUtilization(sessions: ExecutionSession[]): number (%)
     //   Calcula % de tiempo productivo de técnicos
     //   Lógica: suma de tiempo en ejecución / tiempo total disponible
     ```

  2. Los tipos de entrada deben ser interfaces o types definidos localmente (no importar schemas Zod directamente para evitar dependencias circulares)
  3. Todas las funciones deben ser exportables y tener tipos de retorno explícitos

  **Existing domain functions that need updates**:
  4. En `execution.ts`: agregar `"preflight_not_completed"` al type `ExecutionBlockerCode`, agregar `"complete_preflight_checklist"` al type `ExecutionNextActionCode`
  5. En `cost.rules.ts`: agregar función `evaluateCostConsumptionRisk(consumedPercent: number): CostRiskLevel` donde CostRiskLevel = "under_budget" | "on_budget" | "at_risk" | "critical"
  6. Actualizar `packages/domain/src/index.ts` con los nuevos exports

  **Must NOT do**:
  - No importar schemas Zod del paquete shared-types directamente — usar interfaces propias
  - No modificar la firma de funciones existentes
  - No romper tests existentes de domain

  **Parallelization**: Wave 1 (después de S1.1-S1.6 — necesita conocer la estructura de datos)

  **QA Scenarios**:
  ```
  Scenario: Domain rules typecheck
    Tool: Bash
    Steps:
      1. Run: npm run typecheck -w @cermont/domain
    Expected Result: Typecheck passes
    Evidence: .sisyphus/evidence/s1-8-domain-typecheck.txt

  Scenario: Domain tests pass
    Tool: Bash
    Steps:
      1. Run: npm run test -w @cermont/domain
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/s1-8-domain-tests.txt

  Scenario: Full monorepo typecheck after Sprint 1
    Tool: Bash
    Steps:
      1. Run: npm run typecheck
    Expected Result: Typecheck passes across all workspaces
    Evidence: .sisyphus/evidence/s1-8-full-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(domain): add Spec-012 business rules — preflight, SLA, cost risk, evidence completeness, KPI computation`
  - Pre-commit: `npm run typecheck && npm run test && npm run contracts:check`

---

## SPRINT 1 — Gate de Salida

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run contracts:check
```

---

## SPRINT 2 — Backend Endpoints Críticos

> **Rama**: `implement/spec-012-backend-cockpit-readiness`
> **Depende de**: Sprint 1 (schemas y reglas de dominio)
> **Objetivo**: Implementar 8 endpoints backend críticos para cockpit, readiness, cost intelligence y dashboard KPIs.
> **Gate de salida**: Todos los endpoints con tests. `npm run build` PASS.

---

- [ ] S2.1. **Implementar `GET /service-cases/:id/cockpit`**

  **What to do**:
  1. Crear o modificar `backend/src/modules/service-cases/service-cases.service.ts`:
     - Agregar método `getCockpit(serviceCaseId: string)` que:
       a. Obtiene el ServiceCase con populate de cliente
       b. Calcula stepProgress iterando sobre los 14 pasos del flujo
       c. Identifica el currentStep basado en el estado del service case
       d. Calcula nextExpectedAction según currentStep y roles
       e. Agrega blockers desde ExecutionSessionBlockerSchema
       f. Cuenta documentRequirements por fase
       g. Agrega evidenceRequirements si hay execution sessions
       h. Agrega costSummary si hay costos registrados
       i. Calcula riskLevel y slaStatus
       j. Obtiene últimos audit events
  2. Agregar controller `getCockpit` en `service-cases.controller.ts` — solo wiring: authenticate → authorize → validateParams → service.getCockpit → response
  3. Agregar ruta `GET /service-cases/:id/cockpit` en `service-cases.routes.ts`
  4. Registrar endpoint en `backend/src/index.ts` si el módulo no está montado

  **Must NOT do**:
  - No hacer lógica de negocio en el controller
  - No usar try/catch — Express 5 propaga errores automáticamente
  - No agregar mock data

  **Parallelization**: Wave 2 (después de Sprint 1)
  **Blocks**: S3.1-S3.4 (frontend cockpit)

  **QA Scenarios**:
  ```
  Scenario: Cockpit endpoint returns correct structure
    Tool: Bash (curl)
    Steps:
      1. Start backend: npm run dev -w backend
      2. curl -X GET http://127.0.0.1:4000/api/service-cases/:id/cockpit -H "Authorization: Bearer $TOKEN"
      3. Assert: status 200, response has success: true
      4. Assert: data has stepProgress (array), currentStep, nextExpectedAction, blockers, generatedAt
    Expected Result: Cockpit response with complete structure
    Evidence: .sisyphus/evidence/s2-1-cockpit.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add GET /service-cases/:id/cockpit endpoint with 14-step progress`

---

- [ ] S2.2. **Implementar `GET /planning-packets/:id/readiness`**

  **What to do**:
  1. Crear o modificar `backend/src/modules/planning-packets/planning-packets.service.ts`:
     - Agregar método `getReadiness(planningPacketId: string)` que:
       a. Obtiene el PlanningPacket con populate de crew, vehicles, kit
       b. Verifica disponibilidad de técnicos (assignedCrewIds no vacío)
       c. Verifica disponibilidad de vehículos (vehicleIds con documentos vigentes)
       d. Verifica disponibilidad de herramientas (kit con items críticos presentes)
       e. Verifica supervisor asignado (supervisorId presente)
       f. Retorna: { canExecute, readinessGates[], blockingReasons[] }
  2. Agregar controller `getReadiness` y ruta `GET /planning-packets/:id/readiness`
  3. El endpoint debe reutilizar `evaluateFleetReadiness` del domain si existe

  **Must NOT do**:
  - No duplicar lógica de readiness que ya existe en `planning.rules.ts`

  **Parallelization**: Wave 2

  **QA Scenarios**:
  ```
  Scenario: Readiness endpoint returns gate status
    Tool: Bash (curl)
    Steps:
      1. curl GET /api/planning-packets/:id/readiness
      2. Assert: response has canExecute (boolean), readinessGates (array), blockingReasons (array)
    Expected Result: Readiness assessment returned
    Evidence: .sisyphus/evidence/s2-2-readiness.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add GET /planning-packets/:id/readiness endpoint for execution gates`

---

- [ ] S2.3. **Implementar `POST /planning-packets/:id/approve`**

  **What to do**:
  1. Modificar el servicio de planning-packets para agregar `approveWithReadinessCheck(id)`:
     - Primero ejecuta `getReadiness(id)`
     - Si `canExecute === false`, rechazar con error `PLANNING_NOT_READY` y lista de blockingReasons
     - Si `canExecute === true`, proceder con la aprobación normal
  2. El endpoint debe reutilizar la lógica de readiness de S2.2
  3. Agregar ruta `POST /planning-packets/:id/approve` si no existe, o modificar la existente

  **Must NOT do**:
  - No permitir aprobar un planning packet si readiness falla
  - No eliminar la funcionalidad de aprobación existente

  **Parallelization**: Wave 2 (después de S2.2)

  **QA Scenarios**:
  ```
  Scenario: Approve with readiness passes
    Tool: Bash (curl)
    Steps:
      1. POST to /api/planning-packets/:id/approve with valid token
      2. Assert: if readiness passes, status 200
      3. Assert: if readiness fails, status 400 with PLANNING_NOT_READY error
    Expected Result: Approval respects readiness gates
    Evidence: .sisyphus/evidence/s2-3-approve.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add POST /planning-packets/:id/approve with mandatory readiness check`

---

- [ ] S2.4. **Implementar `POST /execution-sessions/:id/preflight`**

  **What to do**:
  1. Crear o modificar `backend/src/modules/execution-sessions/execution-sessions.service.ts`:
     - Agregar método `submitPreflightChecklist(sessionId, preflightData)` que:
       a. Valida el preflightData contra `PreflightChecklistSchema`
       b. Verifica que la sesión esté en estado "draft" o "ready"
       c. Guarda el preflightChecklist en la sesión
       d. Si todos los blocking gates están completos → cambia estado a "ready" si estaba "draft"
       e. Registra auditoría del evento
  2. Agregar controller `submitPreflight` y ruta `POST /execution-sessions/:id/preflight`
  3. El endpoint debe usar `evaluatePreflightGates` del domain

  **Must NOT do**:
  - No permitir submit preflight si la sesión ya está "in_progress" o "completed"

  **Parallelization**: Wave 2

  **QA Scenarios**:
  ```
  Scenario: Submit preflight checklist
    Tool: Bash (curl)
    Steps:
      1. POST to /api/execution-sessions/:id/preflight with valid preflight data
      2. Assert: status 200, preflightChecklist saved
    Expected Result: Preflight checklist stored successfully
    Evidence: .sisyphus/evidence/s2-4-preflight.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add POST /execution-sessions/:id/preflight endpoint`

---

- [ ] S2.5. **Implementar `GET /costs/:orderId/intelligence`**

  **What to do**:
  1. Crear o modificar `backend/src/modules/costs/costs.service.ts`:
     - Agregar método `getIntelligence(orderId)` que:
       a. Obtiene el CostSummary para la orden
       b. Si hay baseline (propuesta aprobada), lo incluye
       c. Calcula margin, budgetConsumedPercent, isAtRisk, isCritical
       d. Retorna `CostIntelligenceSummarySchema`
  2. Agregar controller y ruta `GET /costs/:orderId/intelligence`

  **Must NOT do**:
  - No modificar el endpoint existente de cost summary

  **Parallelization**: Wave 2

  **QA Scenarios**:
  ```
  Scenario: Cost intelligence endpoint
    Tool: Bash (curl)
    Steps:
      1. GET /api/costs/:orderId/intelligence
      2. Assert: response has totalEstimated, totalActual, totalMargin, marginPercent, isAtRisk
    Expected Result: Cost intelligence data returned
    Evidence: .sisyphus/evidence/s2-5-intelligence.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add GET /costs/:orderId/intelligence endpoint with margin and risk assessment`

---

- [ ] S2.6. **Implementar `GET/POST /costs/catalog`**

  **What to do**:
  1. Crear un nuevo módulo backend `backend/src/modules/cost-catalog/`:
     - `cost-catalog.model.ts` — Mongoose model para CostCatalogItem
     - `cost-catalog.service.ts` — CRUD: create, list, search, update, deactivate
     - `cost-catalog.controller.ts` — controller delgado
     - `cost-catalog.routes.ts` — rutas GET /costs/catalog, POST /costs/catalog
  2. O agregar al módulo costs existente si la estructura lo permite
  3. El POST debe validar contra `CostCatalogItemSchema` (sin _id, createdAt, updatedAt)
  4. El GET debe soportar filtros por categoría y búsqueda por nombre/code
  5. RBAC: solo residente/administrativo pueden crear/actualizar

  **Must NOT do**:
  - No hardcodear roles — usar INTERNAL_ROLES del domain

  **Parallelization**: Wave 2

  **QA Scenarios**:
  ```
  Scenario: Catalog CRUD works
    Tool: Bash (curl)
    Steps:
      1. POST /api/costs/catalog with valid catalog item
      2. Assert: status 201, item created
      3. GET /api/costs/catalog
      4. Assert: returns array with created item
    Expected Result: Catalog CRUD functional
    Evidence: .sisyphus/evidence/s2-6-catalog.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add GET/POST /costs/catalog for cost catalog CRUD`

---

- [ ] S2.7. **Implementar `GET /dashboard/operational-kpis`**

  **What to do**:
  1. Crear o modificar `backend/src/modules/dashboard/dashboard.service.ts`:
     - Agregar método `getOperationalKPIs(periodFrom, periodTo)` que:
       a. Calcula MTTR desde ExecutionSession: promedio de (completedAt - startedAt) en minutos
       b. Calcula MTBF desde ServiceCase: diferencia promedio entre fechas de mantenimiento
       c. Calcula firstTimeFixRate: ServiceCases sin re-apertura / total completadas
       d. Calcula technicianUtilizationRate: suma tiempo ejecución / tiempo disponible
       e. Calcula averageResponseTimeHours desde WorkRequest -> SiteVisit
       f. Calcula onTimeCompletionRate desde órdenes completadas antes de SLA deadline
  2. Agregar controller y ruta `GET /dashboard/operational-kpis`
  3. El endpoint debe usar `computeMTTR`, `computeMTBF`, `computeFirstTimeFixRate`, `computeTechnicianUtilization` del domain

  **Must NOT do**:
  - No mockear datos — calcular desde datos reales
  - No devolver datos si no hay suficientes registros

  **Parallelization**: Wave 2

  **QA Scenarios**:
  ```
  Scenario: Operational KPIs endpoint
    Tool: Bash (curl)
    Steps:
      1. GET /api/dashboard/operational-kpis?periodFrom=2026-01-01&periodTo=2026-06-30
      2. Assert: response has mttrMinutes, mtbfDays, firstTimeFixRate, technicianUtilizationRate
    Expected Result: KPIs calculated from real data
    Evidence: .sisyphus/evidence/s2-7-kpis.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add GET /dashboard/operational-kpis endpoint with MTTR/MTBF/firstTimeFixRate`

---

- [ ] S2.8. **Implementar `GET /dashboard/sla-risk`**

  **What to do**:
  1. Modificar `dashboard.service.ts`:
     - Agregar método `getSLARiskOrders()` que:
       a. Encuentra ServiceCases activos con slaDeadline definido
       b. Calcula hoursRemaining para cada uno
       c. Identifica currentStep de cada orden
       d. Clasifica riskLevel: "warning" si < 24h, "critical" si < 6h
       e. Filtra por rol del usuario autenticado (opcional)
  2. Agregar controller y ruta `GET /dashboard/sla-risk`

  **Must NOT do**:
  - No exponer datos sensibles de todas las órdenes a roles no autorizados

  **Parallelization**: Wave 2

  **QA Scenarios**:
  ```
  Scenario: SLA risk endpoint
    Tool: Bash (curl)
    Steps:
      1. GET /api/dashboard/sla-risk
      2. Assert: response is array with orderId, orderCode, slaDeadline, hoursRemaining, riskLevel
    Expected Result: SLA risk orders returned
    Evidence: .sisyphus/evidence/s2-8-sla-risk.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add GET /dashboard/sla-risk endpoint for SLA monitoring`

---

## SPRINT 2 — Gate de Salida

```bash
npm run typecheck
npm run build
npm run test
```

---

## SPRINT 3 — Frontend Cockpit 14 Pasos

> **Rama**: `implement/spec-012-cockpit-ui`
> **Depende de**: Sprint 2 (endpoint `/service-cases/:id/cockpit` debe existir)
> **Objetivo**: Construir los componentes frontend para el cockpit de 14 pasos, preflight gates y evidence slots.
> **Gate de salida**: React Doctor ≥ 92/100 mantenido · E2E smoke tests para cockpit · RBAC correcto por rol.

---

- [ ] S3.1. **Crear `FourteenStepProgressBar` + `CockpitHeaderCard`**

  **What to do**:
  1. Crear directorio `frontend/src/modules/cockpit/` con estructura:
     ```
     cockpit/
       api/
         cockpit.api.ts        → fetchCockpit(serviceCaseId)
       hooks/
         useCockpit.ts         → useQuery para GET /service-cases/:id/cockpit
       ui/
         FourteenStepProgressBar.tsx
         CockpitHeaderCard.tsx
         NextActionCard.tsx
         BlockersPanelCollapsible.tsx
     ```
  2. `FourteenStepProgressBar.tsx`:
     - Barra visual paso 1-14 con semáforo
     - `StepBubble`: completado=verde, en_progreso=amarillo, bloqueado=rojo, pendiente=gris
     - `StepConnector`: línea entre pasos que cambia de color según estado
     - Props: `steps: StepProgress[]`, `currentStep: number`
     - Responsive: horizontal en desktop, vertical/scroll en mobile
  3. `CockpitHeaderCard.tsx`:
     - Muestra: código del servicio, nombre del cliente, descripción del trabajo
     - SLA countdown: "Vence en X horas" con color según urgencia
     - Badge de riesgo: low/medium/high/critical
     - Props: datos del ServiceCaseCockpit
  4. Crear query keys: `cockpitKeys.detail(serviceCaseId)`

  **Must NOT do**:
  - No usar `useEffect` para data fetching — usar TanStack Query
  - No hardcodear colores de estado — usar variables CSS/tailwind del design system

  **Parallelization**: Wave 3 (after Sprint 2)
  **References**:
  - `packages/shared-types/src/schemas/service-case-cockpit.schema.ts` — tipos del cockpit
  - Existing step progress components in codebase for pattern reference

  **QA Scenarios**:
  ```
  Scenario: FourteenStepProgressBar renders correctly
    Tool: Playwright
    Steps:
      1. Navigate to /service-cases/:id/cockpit
      2. Assert: 14 step bubbles visible
      3. Assert: current step has correct color
      4. Assert: completed steps show green
    Expected Result: Progress bar renders with correct step colors
    Evidence: .sisyphus/evidence/s3-1-progressbar.png

  Scenario: CockpitHeaderCard shows SLA data
    Tool: Playwright
    Steps:
      1. Navigate to cockpit page
      2. Assert: service code visible
      3. Assert: client name visible
      4. Assert: SLA countdown or status visible
    Expected Result: Header card displays correctly
    Evidence: .sisyphus/evidence/s3-1-header.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add FourteenStepProgressBar and CockpitHeaderCard components`

---

- [ ] S3.2. **Crear `NextActionCard` + `BlockersPanelCollapsible` + `CockpitTabs`**

  **What to do**:
  1. `NextActionCard.tsx`:
     - Muestra "Quién debe hacer qué ahora" con deep-link al paso correspondiente
     - Props: `action: NextExpectedAction`
     - Muestra: stepNumber, description, assignedRoles, urgency badge, deepLink button
     - Urgency: normal=azul, urgent=naranja, overdue=rojo
  2. `BlockersPanelCollapsible.tsx`:
     - Lista colapsable de bloqueos con links a resolución
     - Props: `blockers: Blocker[]`
     - Cada blocker: code, message, severity badge
     - Collapsible por defecto, expandible
  3. `CockpitTabs.tsx`:
     - Sistema de tabs contenido: Documentos, Evidencias, Costos, Timeline, Resumen Admin
     - Cada tab carga su contenido bajo demanda (lazy loading)
     - Tab "Documentos": tabla con documentType, label, step, status (missing/attached/approved)
     - Tab "Evidencias": EvidenceGalleryByPhase + slots requeridos
     - Tab "Costos": CostComparisonChart + resumen
     - Tab "Timeline": AuditTimeline con avatar + evento + fecha
     - Tab "Resumen Admin": SES/Factura/Pago pipeline visual
  4. Crear la página cockpit en `frontend/src/app/service-cases/[id]/cockpit/page.tsx`

  **Must NOT do**:
  - No implementar tabs que requieran endpoints que no existen (ej: timeline sin endpoint de auditoría)
  - No crear modales dentro de tabs — usar navegación a sub-páginas

  **Parallelization**: Wave 3

  **QA Scenarios**:
  ```
  Scenario: NextActionCard displays correct action
    Tool: Playwright
    Steps:
      1. Navigate to cockpit page
      2. Assert: Next action card visible with step, description, roles
      3. Click: deep-link button
      4. Assert: navigated to correct page
    Expected Result: Next action card is functional
    Evidence: .sisyphus/evidence/s3-2-nextaction.png

  Scenario: Tabs render content
    Tool: Playwright
    Steps:
      1. Navigate to cockpit page
      2. Click each tab
      3. Assert: each tab shows its content without errors
    Expected Result: All tabs render content correctly
    Evidence: .sisyphus/evidence/s3-2-tabs.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add NextActionCard, BlockersPanel, CockpitTabs, and cockpit page`

---

- [ ] S3.3. **Crear `PreflightGatesForm` + `ExecutionTimer`**

  **What to do**:
  1. `PreflightGatesForm.tsx`:
     - Componente para la página de ejecución en campo
     - Checklist de items: EPP, AST, PTW, herramientas, vehículos
     - Cada item: checkbox con label, isBlocking indicator
     - Botón "Iniciar ejecución" deshabilitado hasta completar todos los blocking items
     - Submit: POST /execution-sessions/:id/preflight
     - Props: `sessionId`, `requiresAST`, `requiresPTW` (desde planning packet)
     - Loading state mientras se envía, error state si falla
  2. `ExecutionTimer.tsx`:
     - Cronómetro: tiempo transcurrido vs. tiempo estimado
     - Barra de progreso: elapsedMinutes / estimatedMinutes
     - Alerta si supera 110% del tiempo estimado
     - Props: `estimatedMinutes`, `startedAt`
     - Actualiza cada 30 segundos (o tiempo real con intervalo)
     - Formato: HH:MM:SS
  3. Integrar en la página de ejecución existente (`/execution-sessions/:id`)

  **Must NOT do**:
  - No hacer fetching en el timer — solo calcular desde props
  - No permitir iniciar ejecución si preflight no está completo

  **Parallelization**: Wave 3

  **QA Scenarios**:
  ```
  Scenario: Preflight form blocks execution
    Tool: Playwright
    Steps:
      1. Navigate to /execution-sessions/:id
      2. Assert: "Iniciar ejecución" button is disabled
      3. Check all preflight items
      4. Assert: "Iniciar ejecución" button becomes enabled
    Expected Result: Preflight gates gate execution correctly
    Evidence: .sisyphus/evidence/s3-3-preflight.png

  Scenario: Execution timer displays
    Tool: Playwright
    Steps:
      1. Start execution (if possible) or check timer display
      2. Assert: timer shows elapsed time
      3. Assert: progress bar visible if estimatedMinutes provided
    Expected Result: Timer displays correctly
    Evidence: .sisyphus/evidence/s3-3-timer.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add PreflightGatesForm and ExecutionTimer components`

---

- [ ] S3.4. **Crear `StructuredEvidenceCapture` + `FieldNoveltyButton`**

  **What to do**:
  1. `StructuredEvidenceCapture.tsx`:
     - Slots visuales BEFORE/DURING/AFTER
     - Cada slot: label, required badge, blocking badge, botón de captura
     - Slot "Foto Antes": required, blocking → captura obligatoria antes de iniciar
     - Slot "Foto Durante": required, non-blocking
     - Slot "Foto Después": required, blocking para cierre
     - Cada slot: cámara (mobile) + galería + GPS automático + timestamp
     - Loading state mientras se procesa la imagen
     - Evidence capturada: preview thumbnail, status badge
  2. `FieldNoveltyButton.tsx`:
     - Botón flotante (FAB) "Reportar Novedad"
     - Modal: descripción (textarea), severidad (select), foto (upload), checkbox "¿Genera WorkRequest?"
     - Si genera WorkRequest → POST /work-requests con link al parent order
     - Props: `executionSessionId`, `serviceCaseId`, `workOrderId`
  3. Integrar en la página de ejecución

  **Must NOT do**:
  - No procesar imágenes en el frontend — enviar al backend para procesamiento con sharp
  - No permitir cargar archivos > 10MB (respetar límite del backend)

  **Parallelization**: Wave 3

  **QA Scenarios**:
  ```
  Scenario: Evidence slots render
    Tool: Playwright
    Steps:
      1. Navigate to /execution-sessions/:id
      2. Assert: BEFORE/DURING/AFTER slots visible
      3. Assert: required badges shown correctly
      4. Assert: blocking badges shown correctly
    Expected Result: Evidence slots display with requirements
    Evidence: .sisyphus/evidence/s3-4-evidence-slots.png

  Scenario: Field novelty button opens modal
    Tool: Playwright
    Steps:
      1. Navigate to execution page
      2. Click: field novelty FAB
      3. Assert: modal opens with description, severity, photo upload
      4. Fill description, select severity
      5. Click: submit
      6. Assert: novelty submitted successfully
    Expected Result: Field novelty modal functional
    Evidence: .sisyphus/evidence/s3-4-novelty.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add StructuredEvidenceCapture and FieldNoveltyButton components`

---

## SPRINT 3 — Gate de Salida

```bash
npm run typecheck
npm run lint
npm run build
npm run test -w frontend
npx react-doctor@latest
```

---

## SPRINT 4 — Dashboard Operating System

> **Rama**: `implement/spec-012-dashboard-os`
> **Depende de**: Sprint 2 (endpoints de KPIs y SLA risk)
> **Objetivo**: Conectar el dashboard con datos reales de MTTR/MTBF/SLA risk y agregar nuevos widgets.
> **Gate de salida**: Dashboard muestra datos reales (no mock) para 4 roles distintos.

---

- [ ] S4.1. **Crear `MTTRMTBFCards`**

  **What to do**:
  1. Crear `frontend/src/modules/dashboard/ui/MTTRMTBFCards.tsx`
  2. Componente que muestra dos cards lado a lado:
     - Card MTTR: "Tiempo Promedio de Reparación" con valor en minutos/horas
     - Card MTBF: "Tiempo Promedio Entre Fallas" con valor en días
     - Cada card: valor grande, label, icono, tendencia (vs período anterior si está disponible)
  3. Conectar a `GET /dashboard/operational-kpis`
  4. Query key: `dashboardKeys.operationalKPIs(periodFrom, periodTo)`
  5. Loading state: skeleton cards
  6. Error state: mensaje de error con retry
  7. Empty state: "No hay datos suficientes para calcular KPIs"

  **Must NOT do**:
  - No hardcodear valores de ejemplo
  - No mostrar 0 si no hay datos — mostrar "—" o "Sin datos"

  **Parallelization**: Wave 4

  **QA Scenarios**:
  ```
  Scenario: MTTR/MTBF cards display
    Tool: Playwright
    Steps:
      1. Navigate to /dashboard
      2. Assert: MTTR card visible with value
      3. Assert: MTBF card visible with value
    Expected Result: KPI cards display real calculated data
    Evidence: .sisyphus/evidence/s4-1-kpi-cards.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add MTTR/MTBF KPI cards with real data`

---

- [ ] S4.2. **Crear `FirstTimeFixRateGauge` + `SLARiskOrdersTable`**

  **What to do**:
  1. `FirstTimeFixRateGauge.tsx`:
     - Gauge circular usando Recharts (RadialBarChart)
     - Valor: % con color code (verde > 75%, amarillo > 60%, rojo < 60%)
     - Benchmark: línea de referencia a 75% (estándar industria SAP FSM)
     - Props: rate (0-100), label
  2. `SLARiskOrdersTable.tsx`:
     - Tabla con órdenes en riesgo de SLA
     - Columnas: código, cliente, deadline, horas restantes, paso actual, nivel riesgo, técnico asignado
     - Filtro por riskLevel (warning/critical)
     - Ordenar por hoursRemaining ascendente (más urgentes primero)
     - Row click → navegar a la orden
  3. Conectar: FirstTimeFixRate a `/dashboard/operational-kpis`, SLARiskOrders a `/dashboard/sla-risk`
  4. Loading/error/empty states para ambos componentes

  **Must NOT do**:
  - No implementar paginación sin backend que la soporte

  **Parallelization**: Wave 4

  **QA Scenarios**:
  ```
  Scenario: FirstTimeFixRate gauge renders
    Tool: Playwright
    Steps:
      1. Navigate to /dashboard
      2. Assert: gauge visible with percentage
      3. Assert: benchmark line at 75%
    Expected Result: Gauge displays correctly
    Evidence: .sisyphus/evidence/s4-2-fixrate-gauge.png

  Scenario: SLA risk table shows data
    Tool: Playwright
    Steps:
      1. Navigate to /dashboard
      2. Assert: table visible with at least one row
      3. Assert: columns: orderCode, slaDeadline, hoursRemaining, riskLevel
    Expected Result: SLA risk table populated
    Evidence: .sisyphus/evidence/s4-2-sla-table.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add FirstTimeFixRate gauge and SLARiskOrdersTable`

---

- [ ] S4.3. **Crear `CashFlowFunnel` + `NextActionsByRolePanel` + `PendingCertificationsAlert`**

  **What to do**:
  1. `CashFlowFunnel.tsx`:
     - Funnel visual: dinero atascado en cada etapa
     - Etapas: Ejecutado sin SES → SES sin factura → Factura sin pago
     - Cada etapa: monto total COP, count de órdenes
     - Usar Recharts FunnelChart o barras horizontales
  2. `NextActionsByRolePanel.tsx`:
     - Panel de acciones pendientes filtrado por rol del usuario autenticado
     - Agrupa por: "Tus acciones" (rol del usuario) y "Acciones de otros roles"
     - Cada acción: descripción, orden relacionada, deadline, deep-link
  3. `PendingCertificationsAlert.tsx`:
     - Alerta de certificaciones/herramientas/vehículos por vencer (< 30 días)
     - Lista: ítem, tipo, fecha de vencimiento, días restantes
     - Color code: < 7 días = rojo, < 15 días = naranja, < 30 días = amarillo
  4. Conectar a los endpoints existentes de dashboard summary

  **Must NOT do**:
  - No mockear datos del cash flow — conectar a datos reales
  - Los datos de cash flow requieren cruzar SES + Invoice + Payment data

  **Parallelization**: Wave 4

  **QA Scenarios**:
  ```
  Scenario: Cash flow funnel renders
    Tool: Playwright
    Steps:
      1. Navigate to /dashboard
      2. Assert: funnel visible with 3 stages
      3. Assert: each stage shows amount
    Expected Result: Cash flow funnel displays
    Evidence: .sisyphus/evidence/s4-3-cashflow.png

  Scenario: Pending certifications alert
    Tool: Playwright
    Steps:
      1. Navigate to /dashboard
      2. Assert: certifications alert section visible (or empty state if none pending)
    Expected Result: Certifications alert displayed
    Evidence: .sisyphus/evidence/s4-3-cert-alerts.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add CashFlowFunnel, NextActionsByRolePanel, and PendingCertificationsAlert`

---

## SPRINT 4 — Gate de Salida

```bash
npm run typecheck
npm run lint
npm run build
npm run test -w frontend
npx react-doctor@latest
```

---

## SPRINT 5 — Cost Intelligence + Catálogo

> **Rama**: `implement/spec-012-cost-intelligence`
> **Depende de**: Sprint 2 (endpoints de cost catalog y cost intelligence)
> **Objetivo**: Implementar UI de cost intelligence con catálogo, baseline, gauge de presupuesto y gráficos.
> **Gate de salida**: Página /costs/catalog funcional, CostDeviationGauge operativo.

---

- [ ] S5.1. **Crear página `/costs/catalog` con CRUD**

  **What to do**:
  1. Crear `frontend/src/modules/costs/api/cost-catalog.api.ts`:
     - `fetchCatalog(params)`, `createCatalogItem(data)`, `updateCatalogItem(id, data)`, `deactivateCatalogItem(id)`
  2. Crear `frontend/src/modules/costs/hooks/useCostCatalog.ts`:
     - `useCostCatalog(filters)` — useQuery para listar
     - `useCreateCatalogItem()` — useMutation para crear
  3. Crear `frontend/src/modules/costs/ui/CostCatalogPanel.tsx`:
     - Tabla de ítems con TanStack Table
     - Columnas: código, nombre, categoría, precio COP, unidad, estado (activo/inactivo)
     - Búsqueda por nombre/código
     - Filtro por categoría
     - Botón "Nuevo ítem" → modal/formulario de creación
     - Row actions: editar, desactivar
     - RBAC: solo residente/administrativo pueden crear/editar
  4. Crear página en `frontend/src/app/costs/catalog/page.tsx`
  5. Loading/error/empty states

  **Must NOT do**:
  - No hardcodear roles — usar `canAccessModule` del domain
  - No permitir eliminar ítems del catálogo — solo desactivar

  **Parallelization**: Wave 5

  **QA Scenarios**:
  ```
  Scenario: Catalog page loads
    Tool: Playwright
    Steps:
      1. Navigate to /costs/catalog
      2. Assert: table visible with catalog items
      3. Assert: search and filter controls visible
    Expected Result: Catalog page loads correctly
    Evidence: .sisyphus/evidence/s5-1-catalog.png
  ```

  **Commit**: YES
  - Message: `feat(costs): add CostCatalogPanel page with CRUD and RBAC`

---

- [ ] S5.2. **Crear `CostCatalogSearch` inline en formulario de costos**

  **What to do**:
  1. Crear `CostCatalogSearch.tsx`:
     - Componente de búsqueda inline para agregar costos desde el catálogo
     - Input de búsqueda con autocomplete
     - Resultados: nombre, categoría, precio COP, unidad
     - Al seleccionar: autocompleta los campos del formulario de costo
     - Props: `onSelect(item: CostCatalogItem)`
  2. Integrar en el formulario de registro de costos existente

  **Must NOT do**:
  - No hacer fetch del catálogo completo — implementar búsqueda con debounce (300ms)

  **Parallelization**: Wave 5

  **QA Scenarios**:
  ```
  Scenario: Catalog search works
    Tool: Playwright
    Steps:
      1. Navigate to cost form
      2. Type in catalog search input
      3. Assert: results appear with item name and price
      4. Select an item
      5. Assert: form fields populated
    Expected Result: Catalog search functional
    Evidence: .sisyphus/evidence/s5-2-catalog-search.png
  ```

  **Commit**: YES
  - Message: `feat(costs): add CostCatalogSearch inline component for cost form`

---

- [ ] S5.3. **Crear `BaselineCostCard` + `BudgetConsumedGauge`**

  **What to do**:
  1. `BaselineCostCard.tsx`:
     - Muestra el costo congelado de la propuesta aprobada (inmutable)
     - Datos: propuesta #, total estimado COP, fecha de congelamiento, desglose por categoría
     - Badge: "Congelado" (inmutable) vs "Sin baseline" (si no hay propuesta aprobada)
  2. `BudgetConsumedGauge.tsx`:
     - Gauge circular: % presupuesto consumido
     - Verde < 60%, Amarillo < 80%, Rojo > 80%
     - Alerta automática: "⚠ Presupuesto al {X}%" cuando supera 80%
     - Alerta crítica: "🚫 Presupuesto excedido en {X}%" cuando supera 100%
  3. Conectar a `GET /costs/:orderId/intelligence`
  4. Loading/error/empty states

  **Must NOT do**:
  - No permitir editar el baseline — es inmutable por definición

  **Parallelization**: Wave 5

  **QA Scenarios**:
  ```
  Scenario: Baseline card displays
    Tool: Playwright
    Steps:
      1. Navigate to costs page for an order with approved proposal
      2. Assert: BaselineCostCard shows proposal number, total, frozen date
    Expected Result: Baseline card displays correctly
    Evidence: .sisyphus/evidence/s5-3-baseline.png

  Scenario: Budget gauge shows consumption
    Tool: Playwright
    Steps:
      1. Navigate to costs page
      2. Assert: gauge visible with percentage
      3. Assert: color matches consumption level
    Expected Result: Budget gauge displays correctly
    Evidence: .sisyphus/evidence/s5-3-gauge.png
  ```

  **Commit**: YES
  - Message: `feat(costs): add BaselineCostCard and BudgetConsumedGauge components`

---

- [ ] S5.4. **Crear `CostDeviationStackedBar` + Exportación Excel**

  **What to do**:
  1. `CostDeviationStackedBar.tsx`:
     - Stacked bar chart: estimado vs. real por categoría (labor/materials/equipment/transport/etc.)
     - Usar Recharts BarChart con BarrStacked
     - Tooltip: mostrar valores estimado, real y varianza
     - Leyenda interactiva
  2. Exportación Excel:
     - Botón "Exportar Excel" en la tabla de costos
     - Usar TanStack Table utilities para exportar a CSV/XLSX
     - Incluir: categoría, estimado, real, varianza, %

  **Must NOT do**:
  - No agregar dependencias pesadas para Excel — usar funciones built-in de TanStack Table o csv-stringify simple
  - No incluir datos sensibles en exportación sin verificar RBAC

  **Parallelization**: Wave 5

  **QA Scenarios**:
  ```
  Scenario: Cost deviation chart renders
    Tool: Playwright
    Steps:
      1. Navigate to costs page
      2. Assert: stacked bar chart visible
      3. Hover: tooltip shows values
    Expected Result: Cost deviation chart renders
    Evidence: .sisyphus/evidence/s5-4-chart.png
  ```

  **Commit**: YES
  - Message: `feat(costs): add CostDeviationStackedBar chart and Excel export`

---

## SPRINT 5 — Gate de Salida

```bash
npm run typecheck
npm run lint
npm run build
npm run test -w frontend
npx react-doctor@latest
```

---

## SPRINT 6 — Informes Automáticos + Firma Digital

> **Rama**: `implement/spec-012-reports-signatures`
> **Depende de**: Sprint 3 y Sprint 4
> **Objetivo**: Generación automática de informes desde datos de la orden, firma digital y exportación PDF.
> **Gate de salida**: Informe generado automáticamente desde datos reales, firma funcional, PDF descargable.

---

- [ ] S6.1. **Implementar `GET /reports/:serviceCaseId/auto-draft`**

  **What to do**:
  1. Modificar `backend/src/modules/reports/reports.service.ts`:
     - Agregar método `generateAutoDraft(serviceCaseId)` que:
       a. Obtiene ServiceCase con todos los datos relacionados
       b. Obtiene ExecutionSession con evidencias, materiales, labor
       c. Obtiene DeliveryRecord si existe
       d. Compila: descripción del trabajo, fecha, técnicos, materiales usados, horas laboradas, observaciones, evidencias
       e. Genera un borrador estructurado con `sourceDataSnapshot` (json)
       f. Retorna: autoGeneratedDraft=true, contenido, sourceDataSnapshot
  2. Agregar controller y ruta `GET /reports/:serviceCaseId/auto-draft`
  3. Agregar campos al schema si es necesario: `autoGeneratedDraft`, `sourceDataSnapshot`

  **Must NOT do**:
  - No reemplazar informes existentes — solo generar borrador inicial editable
  - No incluir datos sensibles en el borrador sin verificar permisos

  **Parallelization**: Wave 6

  **QA Scenarios**:
  ```
  Scenario: Auto-draft generates from real data
    Tool: Bash (curl)
    Steps:
      1. GET /api/reports/:serviceCaseId/auto-draft
      2. Assert: status 200
      3. Assert: response has autoGeneratedDraft=true
      4. Assert: response has sourceDataSnapshot with execution data
    Expected Result: Auto-draft generated from order data
    Evidence: .sisyphus/evidence/s6-1-autodraft.txt
  ```

  **Commit**: YES
  - Message: `feat(reports): add auto-draft generation endpoint`

---

- [ ] S6.2. **Crear `TechnicalReportDraftPage`**

  **What to do**:
  1. Crear `frontend/src/modules/reports/ui/TechnicalReportDraftPage.tsx`:
     - Página de vista previa del borrador generado automáticamente
     - Secciones editables: descripción, materiales, labor, observaciones
     - Panel de evidencias: thumbnails arrastrables para ordenar
     - Botón "Aprobar borrador" → crea TechnicalReport oficial
     - Botón "Regenerar desde datos actualizados" → re-ejecuta auto-draft
  2. Crear página en `frontend/src/app/reports/[serviceCaseId]/draft/page.tsx`
  3. Conectar a `GET /reports/:serviceCaseId/auto-draft`

  **Must NOT do**:
  - No permitir editar el sourceDataSnapshot (es solo para trazabilidad)

  **Parallelization**: Wave 6

  **QA Scenarios**:
  ```
  Scenario: Draft page loads
    Tool: Playwright
    Steps:
      1. Navigate to /reports/:serviceCaseId/draft
      2. Assert: draft content visible
      3. Assert: edit buttons functional
    Expected Result: Draft page displays with editable content
    Evidence: .sisyphus/evidence/s6-2-draft.png
  ```

  **Commit**: YES
  - Message: `feat(reports): add TechnicalReportDraftPage with edit capabilities`

---

- [ ] S6.3. **Crear `DigitalSignaturePad`**

  **What to do**:
  1. Crear `DigitalSignaturePad.tsx`:
     - Canvas de firma usando `signature_pad` library
     - Modos: técnico (firma de ejecución), cliente (firma de aceptación)
     - Clear button: reiniciar firma
     - Accept button: capturar firma como base64
     - Responsive: firma con dedo en mobile, mouse en desktop
     - Props: `onSignatureCapture(dataUrl: string)`, `label: string`, `role: "technician" | "client"`
  2. Integrar en la página de DeliveryRecord para firma del cliente
  3. Integrar en la página de ExecutionSession para firma del técnico/supervisor

  **Must NOT do**:
  - No almacenar firma en localStorage — enviar al backend inmediatamente
  - No usar imágenes de firma de prueba en producción

  **Parallelization**: Wave 6

  **QA Scenarios**:
  ```
  Scenario: Signature pad renders and captures
    Tool: Playwright
    Steps:
      1. Navigate to signature page
      2. Assert: canvas visible with draw area
      3. Simulate drawing on canvas
      4. Click: accept
      5. Assert: signature captured (callback called with dataUrl)
    Expected Result: Signature pad captures input
    Evidence: .sisyphus/evidence/s6-3-signature.png
  ```

  **Dependency check**: Instalar `signature_pad` library si no está en package.json
  ```bash
  npm install signature_pad -w frontend
  ```

  **Commit**: YES
  - Message: `feat(reports): add DigitalSignaturePad component with signature_pad`

---

- [ ] S6.4. **Implementar exportación PDF con `@react-pdf/renderer`**

  **What to do**:
  1. Verificar si `@react-pdf/renderer` está instalado; si no, instalarlo:
     ```bash
     npm install @react-pdf/renderer -w frontend
     ```
  2. Crear `frontend/src/modules/reports/ui/ReportPDF.tsx`:
     - Documento PDF reactivo con:
       - Cabecera: logo CERMONT, código de informe, fecha
       - Secciones: descripción del trabajo, materiales, labor, evidencias
       - Firma digital incrustada (desde S6.3)
       - Footer: página X de Y, generado automáticamente
  3. Crear hook `usePDFExport(reportData)` que genera y descarga el PDF
  4. Botón "Descargar PDF" en las páginas de informe y acta de entrega

  **Must NOT do**:
  - No incluir datos sensibles (costos internos, márgenes) en PDFs enviados al cliente
  - No generar PDF en el servidor si el reporte es principalmente frontend

  **Parallelization**: Wave 6

  **QA Scenarios**:
  ```
  Scenario: PDF generation works
    Tool: Playwright + Bash
    Steps:
      1. Navigate to report page
      2. Click: "Descargar PDF"
      3. Assert: PDF file is downloaded
      4. Verify: PDF contains report data
    Expected Result: PDF downloads with content
    Evidence: .sisyphus/evidence/s6-4-pdf.txt
  ```

  **Commit**: YES
  - Message: `feat(reports): add PDF export with @react-pdf/renderer`

---

- [ ] S6.5. **Crear `ReportVersionHistory`**

  **What to do**:
  1. Crear `ReportVersionHistory.tsx`:
     - Historial de versiones del informe
     - Cada versión: número de versión, editor, fecha de edición, changelog
     - Timeline visual con avatar + evento + fecha
     - Botón "Ver versión X" → carga snapshot de esa versión
     - Props: `versions: Array<{versionNumber, editedBy, editedAt, changeLog}>`
  2. Agregar al schema de TechnicalReport el campo `versions` si no existe
  3. Conectar al endpoint de versiones (GET /reports/:id/versions)

  **Must NOT do**:
  - No permitir editar versiones pasadas — son inmutables

  **Parallelization**: Wave 6

  **QA Scenarios**:
  ```
  Scenario: Version history displays
    Tool: Playwright
    Steps:
      1. Navigate to report with versions
      2. Assert: version timeline visible
      3. Click: "Ver versión X"
      4. Assert: version content loaded
    Expected Result: Version history functional
    Evidence: .sisyphus/evidence/s6-5-versions.png
  ```

  **Commit**: YES
  - Message: `feat(reports): add ReportVersionHistory component with versioning support`

---

## SPRINT 6 — Gate de Salida

```bash
npm run typecheck
npm run lint
npm run build
npm run test -w frontend
npx react-doctor@latest
```

---

## Final Verification Wave

> 4 revisiones paralelas después de completar TODOS los sprints. NO auto-proceder — esperar aprobación explícita del usuario.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  - Leer el plan Spec-012 completo. Para cada "Must Have": verificar implementación (leer archivo, curl endpoint, ejecutar comando). Para cada "Must NOT Have": buscar patrones prohibidos — rechazar con file:line si se encuentra.
  - Verificar que los archivos de evidencia existen en `.sisyphus/evidence/`
  - Comparar deliverables contra el plan
  - Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VEREDICTO: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  - Ejecutar: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`
  - Revisar todos los archivos modificados en busca de: `as any`, `@ts-ignore`, `@ts-expect-error`, empty catches, `console.log` en producción, código comentado, imports no usados
  - Detectar AI slop: comentarios excesivos, sobre-abstracción, nombres genéricos (data/result/item/temp)
  - Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VEREDICTO`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` si hay UI)
  - Iniciar desde estado limpio. Ejecutar CADA escenario QA de CADA tarea — seguir pasos exactos, capturar evidencia.
  - Probar integración cross-task (componentes funcionando juntos, no en aislamiento)
  - Probar edge cases: empty state, input inválido, acciones rápidas
  - Guardar en `.sisyphus/evidence/final-qa/`
  - Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VEREDICTO`

- [ ] F4. **Scope Fidelity Check** — `deep`
  - Para cada tarea: leer "What to do", leer el diff real (git log/diff). Verificar 1:1 — todo lo especificado fue construido (sin faltantes), nada más allá de lo especificado fue construido (sin creep).
  - Verificar cumplimiento de "Must NOT do"
  - Detectar contaminación cross-task: Task N tocando archivos de Task M
  - Marcar cambios no contabilizados
  - Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VEREDICTO`

---

## Commit Strategy

| Tarea | Mensaje de Commit |
|-------|-------------------|
| S1.1 | `feat(schemas): enrich execution-session with preflight gates and field novelties` |
| S1.2 | `feat(schemas): enrich evidence with slot requirements and replacement_requested` |
| S1.3 | `feat(schemas): enrich kit with billable fields, catalog link, and safety requirements` |
| S1.4 | `feat(schemas): enrich dashboard-summary with operational KPIs and SLA risk orders` |
| S1.5 | `feat(schemas): enrich cost with catalog, baseline, and intelligence summary` |
| S1.6 | `feat(schemas): create service-case-cockpit schema with 14-step progress tracker` |
| S1.7 | `feat(schemas): add service-case-cockpit barrel export` (group con S1.6) |
| S1.8 | `feat(domain): add Spec-012 business rules — preflight, SLA, cost risk, KPI computation` |
| S2.1 | `feat(backend): add GET /service-cases/:id/cockpit endpoint` |
| S2.2 | `feat(backend): add GET /planning-packets/:id/readiness endpoint` |
| S2.3 | `feat(backend): add POST /planning-packets/:id/approve with readiness check` |
| S2.4 | `feat(backend): add POST /execution-sessions/:id/preflight endpoint` |
| S2.5 | `feat(backend): add GET /costs/:orderId/intelligence endpoint` |
| S2.6 | `feat(backend): add GET/POST /costs/catalog for cost catalog CRUD` |
| S2.7 | `feat(backend): add GET /dashboard/operational-kpis endpoint` |
| S2.8 | `feat(backend): add GET /dashboard/sla-risk endpoint` |
| S3.1 | `feat(ui): add FourteenStepProgressBar and CockpitHeaderCard components` |
| S3.2 | `feat(ui): add NextActionCard, BlockersPanel, CockpitTabs, and cockpit page` |
| S3.3 | `feat(ui): add PreflightGatesForm and ExecutionTimer components` |
| S3.4 | `feat(ui): add StructuredEvidenceCapture and FieldNoveltyButton components` |
| S4.1 | `feat(dashboard): add MTTR/MTBF KPI cards with real data` |
| S4.2 | `feat(dashboard): add FirstTimeFixRate gauge and SLARiskOrdersTable` |
| S4.3 | `feat(dashboard): add CashFlowFunnel, NextActionsByRolePanel, and PendingCertificationsAlert` |
| S5.1 | `feat(costs): add CostCatalogPanel page with CRUD and RBAC` |
| S5.2 | `feat(costs): add CostCatalogSearch inline component` |
| S5.3 | `feat(costs): add BaselineCostCard and BudgetConsumedGauge components` |
| S5.4 | `feat(costs): add CostDeviationStackedBar chart and Excel export` |
| S6.1 | `feat(reports): add auto-draft generation endpoint` |
| S6.2 | `feat(reports): add TechnicalReportDraftPage` |
| S6.3 | `feat(reports): add DigitalSignaturePad component` |
| S6.4 | `feat(reports): add PDF export with @react-pdf/renderer` |
| S6.5 | `feat(reports): add ReportVersionHistory component` |

---

## Success Criteria

### Verification Commands (por sprint)
```bash
# Sprint 1 — Solo shared-types + domain
npm run typecheck -w @cermont/shared-types && npm run test -w @cermont/shared-types
npm run typecheck -w @cermont/domain && npm run test -w @cermont/domain

# Sprint 2 — Full monorepo
npm run typecheck && npm run test && npm run build

# Sprint 3-6 — Frontend builds
npm run typecheck && npm run test -w frontend && npm run build -w frontend
npx react-doctor@latest
```

### Final Checklist
- [ ] Todos los "Must Have" implementados y verificados
- [ ] Todos los "Must NOT Have" ausentes (sin any/null/unknown/undefined)
- [ ] Todos los tests existentes siguen pasando (1013+ baseline)
- [ ] `npm run contracts:check` pasa en todos los sprints
- [ ] React Doctor ≥ 92/100 mantenido
- [ ] No se eliminó funcionalidad existente sin reemplazo
- [ ] No se duplicaron schemas, roles, rutas
- [ ] No hay `console.log` en producción
- [ ] No hay rutas huérfanas o componentes muertos
- [ ] Documentación actualizada si aplica

