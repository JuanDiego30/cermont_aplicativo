# SPEC-014 Completion — Cierre del Plan de Profesionalización Frontend

**Versión:** 1.0 — 4 de julio de 2026
**Rama base:** `deploy/vps-clean`
**Rama de trabajo:** `implement/spec-014-completion`
**Plan padre:** `.sisyphus/plans/spec-014-frontend-profesionalizacion-cierre-ciclo.md`

---

## TL;DR

> **Quick Summary**: Completar los gaps del plan SPEC-014 original — 3 endpoints backend faltantes, 3 módulos frontend nuevos completos, 25 componentes en módulos existentes, 11 páginas nuevas, suite E2E y gates de calidad.

> **Deliverables**:
> - 3 backend endpoints (auto-draft reports, invoice pipeline, evidence review)
> - 3 nuevos módulos frontend (cockpit, field-execution, invoices)
> - 25 componentes nuevos en módulos existentes
> - 11 páginas/rutas nuevas
> - Suite E2E `spec-014/` con 10 specs

> **Estimated Effort**: Large
> **Parallel Execution**: YES — 5 waves
> **Critical Path**: Wave 0 → Wave 1 → Wave 2 → Wave 3 → Wave 4 → FINAL

---

## Context

### Original Request
Completar la implementación del plan SPEC-014 que quedó en estado parcial (~35%). La auditoría del código reveló: backend base sólido con endpoints de execution/planning/notifications/portal, y módulos frontend dashboard/costs/reports parciales.

### Audit Summary — Ya implementado (NO repetir)
- **Backend**: `POST /execution-sessions/:id/preflight`, `POST /planning-packets/:id/approve`, `GET /planning-packets/:id/readiness`, `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/mark-all-read`, `GET /portal/*`
- **Frontend**: `modules/dashboard/` (DashboardCommandCenter, SlaRiskOrdersTable, Charts), `modules/costs/` (CostCatalogPanel, CostBudgetStatus, CostComparisonChart, CostPanel, CostForm), `modules/reports/` (ReportPanel, ReportDownloadButton, ReportStatusBadge), `modules/notifications/` (vacío), `modules/portal/` (solo api/portal-api.ts)

---

## Work Objectives

### Core Objective
Completar toda funcionalidad frontend y backend especificada en SPEC-014 que no fue implementada en la ejecución parcial, cerrando con tests E2E y gates verdes.

### Concrete Deliverables
- 3 endpoints backend (contract-first: Zod → service → controller → route)
- 3 módulos frontend feature-sliced nuevos (api/ hooks/ ui/ model/ utils/)
- 25 componentes React en módulos existentes con loading/error/empty states
- 11 páginas Next.js App Router nuevas con RBAC
- 10 specs Playwright E2E en `frontend/tests/e2e/spec-014/`
- Evidencia de quality gates en `.sisyphus/evidence/`

### Definition of Done
- [ ] `npm run typecheck` → PASS (todo el monorepo)
- [ ] `npm run lint` → PASS
- [ ] `npm test` → PASS (tests baseline intactos)
- [ ] `npm run build` → PASS
- [ ] `npm run test:e2e -w frontend -- tests/e2e/spec-014/` → 10/10 specs pass
- [ ] `npx react-doctor@latest` → ≥87/100
- [ ] No `any`, `unknown`, `null`, `undefined` nuevos
- [ ] No `console.log` en producción
- [ ] No hardcodeo de roles
- [ ] `FileAsset` sigue siendo SSOT

### Must Have
- Módulo cockpit funcional con progress bar 14 pasos
- Módulo field-execution con preflight gates y captura de evidencias
- Módulo invoices con pipeline visual SES→Factura→Pago
- Endpoint auto-draft reports
- Suite E2E completa

### Must NOT Have (Guardrails)
- ❌ No modificar schemas existentes (solo agregar campos `.optional()`)
- ❌ No crear `MediaAsset` — `FileAsset` es SSOT
- ❌ No `any`, `unknown`, `null`, `undefined` explícitos
- ❌ No hardcodear roles en componentes — usar `@cermont/domain`
- ❌ No `fetch` directo en componentes — usar `apiClient` + TanStack Query
- ❌ No `try/catch` en controllers Express 5
- ❌ No modificar `package.json` sin justificación
- ❌ No eliminar funcionalidad existente
- ❌ No mock data en producción

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: Tests-after (implementación primero, tests después)
- **Framework**: Vitest (unitarios) + Playwright (E2E)
- **Agent-Executed QA**: MANDATORY para cada tarea

### QA Policy
Cada tarea incluye escenarios QA ejecutables por agente. Evidencia en `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.
- **Frontend/UI**: Playwright — navegación, interacción, aserción de DOM, screenshot
- **API/Backend**: Bash (curl) — enviar request, validar status + response body

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 0 (Backend Gaps — 3 tasks parallel, sin dependencias):
├── Task 0.1: GET /reports/:serviceCaseId/auto-draft
├── Task 0.2: GET /service-cases/:id/invoice-pipeline
└── Task 0.3: POST /evidence/:id/review

Wave 1 (Frontend Modules NUEVOS — 3 tasks parallel):
├── Task 1.1: Módulo cockpit completo (8 components + api/hooks + page)
├── Task 1.2: Módulo field-execution completo (7 components + api/hooks + page)
└── Task 1.3: Módulo invoices completo (4 components + api/hooks + page)

Wave 2 (Componentes en módulos EXISTENTES — 3 tasks parallel):
├── Task 2.1: Dashboard missing components (7 componentes)
├── Task 2.2: Costs missing components (5 componentes)
└── Task 2.3: Reports missing components (5 componentes + 2 pages)

Wave 3 (Notifications + Portal + Pages — 3 tasks parallel):
├── Task 3.1: Notifications frontend (4 componentes + 2 pages)
├── Task 3.2: Portal frontend (4 componentes + 2 pages)
└── Task 3.3: Páginas huérfanas (verificación + costs/catalog page)

Wave 4 (E2E Tests + Gates — secuencial):
└── Task 4.1: Suite E2E spec-014/ (10 specs Playwright)

Wave FINAL (4 parallel reviews):
├── Task F1: Plan Compliance Audit (oracle)
├── Task F2: Code Quality Review
├── Task F3: Real Manual QA (Playwright)
└── Task F4: Scope Fidelity Check

Critical Path: Wave 0 → Wave 1 → Wave 2 → Wave 3 → Wave 4 → FINAL
Parallel Speedup: ~60% más rápido que secuencial
Max Concurrent: 3 (Waves 0-3)
```

---

## TODOs

### Wave 0 — Backend Gaps (PARALLEL — 3 tasks)

- [ ] 0.1. Endpoint `GET /reports/:serviceCaseId/auto-draft`

  **What to do**:
  - Crear `submitAutoDraft` en `backend/src/modules/technical-report/` (service + controller)
  - Agregar ruta `GET /reports/:serviceCaseId/auto-draft` en `technical-report.routes.ts`
  - El endpoint consulta `ServiceCase` poblado, extrae `ExecutionSessions`, `PlanningPacket`, `Evidences`, `Novelties`
  - Genera borrador con: serviceCaseCode, clientName, workDescription, activityType, executionPeriod, teamMembers, activitiesPerformed, materialsUsed, evidences, novelties, technicalConclusion editable
  - Guarda como `TechnicalReport` con status `draft` y `autoGenerated: true`
  - RBAC: TECHNICAL_EXECUTION_ROLES. Sin try/catch en controller. Auditoría: `AUTO_DRAFT_GENERATED`.

  **Must NOT do**: No modificar schema `TechnicalReport` existente. No generar PDF.

  **Recommended Agent Profile**: `quick` + [`nodejs-express-server`, `zod`]

  **Parallelization**: YES (Wave 0 con 0.2, 0.3). Blocks: Task 2.3.

  **References**:
  - `backend/src/modules/technical-report/technical-report.routes.ts` — Patrón de rutas
  - `backend/src/modules/execution-session/execution-session.service.ts` — Patrón servicio con populate
  - `backend/src/modules/planning-packet/planning-packet.controller.ts` — Patrón controller thin

  **QA Scenarios**:

  ```
  Scenario: Auto-draft generado exitosamente
    Tool: Bash (curl)
    Preconditions: ServiceCase con execution sessions y evidencias
    Steps:
      1. POST /api/auth/login → token JWT (rol: tecnico)
      2. curl GET /api/reports/{serviceCaseId}/auto-draft (Authorization: Bearer $TOKEN)
      3. Validar: success=true, data.status="draft", data.autoGenerated=true, data.draftData.serviceCaseCode no vacío
    Expected Result: 200 con borrador estructurado
    Evidence: .sisyphus/evidence/task-0.1-auto-draft-success.txt

  Scenario: Service case no encontrado
    Tool: Bash (curl)
    Preconditions: Token JWT válido
    Steps:
      1. curl GET /api/reports/000000000000000000000000/auto-draft
      2. Validar: success=false, error.code="SERVICE_CASE_NOT_FOUND", status 404
    Expected Result: 404 con error tipado
    Evidence: .sisyphus/evidence/task-0.1-auto-draft-404.txt
  ```

  **Commit**: `feat(backend): add GET /reports/:serviceCaseId/auto-draft for automatic report generation`

---

- [ ] 0.2. Endpoint `GET /service-cases/:id/invoice-pipeline`

  **What to do**:
  - Crear `getInvoicePipeline` en `backend/src/modules/invoice/` (service + controller)
  - Agregar ruta en invoice routes
  - Consulta: ServiceEntrySheet → Invoice → Payment asociados al serviceCase
  - Retorna pipeline con: ses (status, monto, fecha), invoice (status, monto, fecha, aging), payment (status, monto, fecha)
  - Cada etapa: completado/en_progreso/pendiente con fechas y montos COP
  - RBAC: INTERNAL_ROLES

  **Must NOT do**: No crear schemas duplicados para SES/Invoice/Payment.

  **Recommended Agent Profile**: `quick` + [`nodejs-express-server`]

  **Parallelization**: YES (Wave 0 con 0.1, 0.3). Blocks: Task 1.3.

  **References**:
  - `backend/src/modules/invoice/invoice.routes.ts` — Rutas invoice existentes
  - `backend/src/modules/service-entry-sheet/` — Módulo SES
  - `backend/src/modules/payment/` — Módulo payment

  **QA Scenarios**:

  ```
  Scenario: Pipeline invoice con datos completos
    Tool: Bash (curl)
    Preconditions: ServiceCase con SES aprobada, invoice emitida, payment registrado
    Steps:
      1. curl GET /api/service-cases/{id}/invoice-pipeline (token INTERNAL_ROLES)
      2. Validar: success=true, pipeline con stages ses/invoice/payment, aging calculado
    Expected Result: 200 con pipeline estructurado
    Evidence: .sisyphus/evidence/task-0.2-pipeline-success.txt

  Scenario: Service case sin factura (pipeline vacío)
    Tool: Bash (curl)
    Preconditions: ServiceCase sin SES ni invoice
    Steps:
      1. curl GET /api/service-cases/{id}/invoice-pipeline
      2. Validar: success=true, pipeline.ses.status="not_created"
    Expected Result: 200 con pipeline en estado inicial
    Evidence: .sisyphus/evidence/task-0.2-pipeline-empty.txt
  ```

  **Commit**: `feat(backend): add GET /service-cases/:id/invoice-pipeline for SES→Invoice→Payment tracking`

---

- [ ] 0.3. Endpoint `POST /evidence/:id/review`

  **What to do**:
  - Crear `reviewEvidence` en `backend/src/modules/evidence/` (service + controller)
  - Agregar ruta `POST /evidence/:id/review`
  - Body Zod: `{ action: "approve" | "reject", reason?: string }`
  - approve → status approved. reject → status rejected + motivo + notificación opcional
  - Auditoría: `EVIDENCE_REVIEWED`. RBAC: MANAGEMENT_ROLES + supervisor.

  **Must NOT do**: No modificar schema Evidence existente.

  **Recommended Agent Profile**: `quick` + [`nodejs-express-server`, `zod`]

  **Parallelization**: YES (Wave 0 con 0.1, 0.2). Blocks: Task 2.3.

  **References**:
  - `backend/src/modules/evidence/` — Módulo evidence existente
  - `backend/src/modules/technical-report/technical-report.routes.ts` — Patrón approve/reject
  - `backend/src/modules/notifications/notification.service.ts` — Disparo de notificaciones

  **QA Scenarios**:

  ```
  Scenario: Evidencia aprobada
    Tool: Bash (curl)
    Preconditions: Evidence status "pending_review"
    Steps:
      1. curl POST /api/evidence/{id}/review -d '{"action":"approve"}' (token MANAGEMENT_ROLES)
      2. Validar: success=true, data.status="approved"
    Expected Result: 200 con status approved
    Evidence: .sisyphus/evidence/task-0.3-review-approve.txt

  Scenario: Evidencia rechazada con motivo
    Tool: Bash (curl)
    Preconditions: Evidence status "pending_review"
    Steps:
      1. curl POST /api/evidence/{id}/review -d '{"action":"reject","reason":"Foto borrosa"}'
      2. Validar: success=true, data.status="rejected", data.reviewReason no vacío
    Expected Result: 200 con status rejected y motivo
    Evidence: .sisyphus/evidence/task-0.3-review-reject.txt
  ```

  **Commit**: `feat(backend): add POST /evidence/:id/review for evidence approval/rejection workflow`

---

### Wave 1 — Frontend Modules NUEVOS (PARALLEL — 3 tasks)

- [ ] 1.1. Módulo Cockpit 14 Pasos

  **What to do**:
  - Crear `frontend/src/modules/cockpit/` feature-sliced:
    - `api/cockpit.api.ts` → `fetchCockpit(serviceCaseId)`, `triggerNextAction()`
    - `hooks/useCockpit.ts` → `useQuery` para cockpit
    - `hooks/useCockpitMutations.ts` → `useMutation` para acciones
    - `utils/cockpitKeys.ts` → Query keys
    - `model/cockpit.types.ts` → Tipos locales
  - Componentes UI:
    - `ui/FourteenStepProgressBar.tsx` — 14 burbujas con semáforo, conectores, tooltip, horizontal scroll mobile
    - `ui/CockpitHeaderCard.tsx` — Código SC, cliente, descripción, riesgo, SLA countdown
    - `ui/NextActionCard.tsx` — "⚠️ Próxima acción requerida" con deep-link
    - `ui/BlockersPanelCollapsible.tsx` — Bloqueos con severidad, colapsable
    - `ui/CockpitTabs.tsx` — 5 tabs (Docs, Evidencias, Costos, Timeline, Admin) lazy loading
    - `ui/AuditTimeline.tsx` — Timeline eventos auditados
    - `ui/DocumentRequirementsTable.tsx` — Adjunto/faltante por fase
  - Página: `frontend/src/app/(dashboard)/service-cases/[id]/cockpit/page.tsx`
  - Estados: loading (skeleton), error, empty, offline, forbidden
  - Mobile-first 375px, touch ≥44px. lucide-react, Recharts, Framer Motion.

  **Must NOT do**: No hardcodear 14 pasos. No mock data en prod. No fetch directo.

  **Recommended Agent Profile**: `visual-engineering` + [`vercel-react-best-practices`, `tailwind-css-patterns`]

  **Parallelization**: YES (Wave 1 con 1.2, 1.3). Blocks: Task 3.3, 4.1.

  **References**:
  - `frontend/src/modules/dashboard/ui/DashboardCommandCenter.tsx` — Patrón loading/empty states
  - `frontend/src/modules/costs/ui/CostCatalogPanel.tsx` — Patrón useQuery + RBAC
  - `frontend/src/modules/reports/queries.ts` — Patrón query keys + apiClient
  - `frontend/src/app/(dashboard)/service-cases/[id]/page.tsx` — Layout referencia

  **QA Scenarios**:
  ```
  Scenario: Cockpit carga con progress bar 14 pasos
    Tool: Playwright
    Steps: 1) Navigate /service-cases/{id}/cockpit 2) Assert 14 step bubbles 3) Assert HeaderCard con código SC 4) Assert NextActionCard con "Próxima acción" 5) Screenshot
    Evidence: .sisyphus/evidence/task-1.1-cockpit-loaded.png

  Scenario: Cockpit forbidden para rol cliente
    Tool: Playwright
    Steps: 1) Login rol cliente 2) Navigate /service-cases/{id}/cockpit 3) Assert "No tienes permisos" 4) Assert NO progress bar
    Evidence: .sisyphus/evidence/task-1.1-cockpit-forbidden.png

  Scenario: Mobile responsive
    Tool: Playwright
    Steps: 1) Resize 375x812 2) Assert horizontal scroll en progress bar 3) Assert touch targets ≥44px
    Evidence: .sisyphus/evidence/task-1.1-cockpit-mobile.png
  ```

  **Commit**: `feat(ui): add cockpit module with 14-step progress bar, header card, next action, blockers, and tabs`

---

- [ ] 1.2. Módulo Field Execution

  **What to do**:
  - Crear `frontend/src/modules/field-execution/` feature-sliced:
    - `api/field-execution.api.ts` → `submitPreflight`, `fetchSession`, `startExecution`, `completeExecution`
    - `hooks/usePreflightSubmit.ts`, `hooks/useExecutionSession.ts`, `hooks/useStartExecution.ts`, `hooks/useCompleteExecution.ts`
  - Componentes UI:
    - `ui/PreflightGatesForm.tsx` — Checklist EPP, AST, PTW, herramientas, vehículo, certificaciones + dinámicos. Botón inicio deshabilitado hasta gates OK.
    - `ui/ExecutionTimer.tsx` — HH:MM:SS, barra progreso (verde<80%, amarillo 80-100%, rojo>100%), pausa/reanudar
    - `ui/ExecutionStatusBadge.tsx` — Badge estados: draft/ready/in_progress/paused/completed/cancelled
    - `ui/ExecutionSessionPage.tsx` — Timer + tabs (checklist, evidencias, materiales, labor, novedades)
    - `ui/evidence/StructuredEvidenceCapture.tsx` — 3 slots BEFORE/DURING/AFTER con thumbnail, upload state
    - `ui/evidence/FieldNoveltyButton.tsx` — FAB flotante, modal: descripción, severidad, foto, checkbox WorkRequest
    - `ui/evidence/EvidenceSlotCard.tsx` — Slot individual con estados
  - Página: `frontend/src/app/(dashboard)/execution-sessions/[id]/page.tsx`
  - Estados: loading, error, empty, offline (crítico para campo), forbidden
  - Offline-first: IndexedDB, sync state, retry

  **Must NOT do**: No hardcodear gates. No bloquear UI sin cámara.

  **Recommended Agent Profile**: `visual-engineering` + [`vercel-react-best-practices`, `tailwind-css-patterns`]

  **Parallelization**: YES (Wave 1 con 1.1, 1.3). Blocks: Task 3.3, 4.1.

  **References**:
  - `backend/src/modules/execution-session/execution-session.routes.ts` — Endpoints
  - `packages/shared-types/src/schemas/` — SubmitPreflightChecklistCommandSchema
  - `frontend/src/lib/pwa/offline-queue.ts` — Offline queue
  - `frontend/src/modules/evidences/` — Patrón upload

  **QA Scenarios**:
  ```
  Scenario: Preflight gates bloquean inicio hasta completar
    Tool: Playwright
    Steps: 1) Navigate /execution-sessions/{id} 2) Assert 6 checkboxes 3) Assert botón disabled 4) Check all → botón enabled 5) Click iniciar → redirect a sesión activa con timer
    Evidence: .sisyphus/evidence/task-1.2-preflight-success.png

  Scenario: Evidence capture 3 slots funcionales
    Tool: Playwright
    Steps: 1) Tab "Evidencias" 2) Assert BEFORE/DURING/AFTER visibles 3) Click BEFORE → upload 4) Assert thumbnail + status "uploaded"
    Evidence: .sisyphus/evidence/task-1.2-evidence-capture.png

  Scenario: Timer alerta al exceder estimado
    Tool: Playwright
    Steps: 1) Assert timer HH:MM:SS 2) Assert barra roja >100% 3) Assert alerta "Tiempo excedido"
    Evidence: .sisyphus/evidence/task-1.2-timer-alert.png
  ```

  **Commit**: `feat(ui): add field execution mode with preflight gates, timer, evidence capture, and novelty reporting`

---

- [ ] 1.3. Módulo Invoices

  **What to do**:
  - Crear `frontend/src/modules/invoices/`:
    - `api/invoice.api.ts` → `fetchInvoicePipeline`, `fetchAgingData`
    - `hooks/useInvoicePipeline.ts`, `hooks/useAgingDashboard.ts`
  - Componentes UI:
    - `ui/InvoicePipelinePage.tsx` — Pipeline 3 etapas (SES→Factura→Pago) con conexiones, colores, alerta >30d
    - `ui/AgingDashboard.tsx` — Tarjetas: Corriente, 30d, 60d, 90d+. Color verde→rojo, conteo + COP
    - `ui/InvoiceStatusBadge.tsx` — Badge workflow states
    - `ui/PaymentRecordCard.tsx` — Monto, fecha, método, referencia
  - Página: `frontend/src/app/(dashboard)/invoices/[id]/pipeline/page.tsx`
  - Estados: loading, error, empty, forbidden

  **Must NOT do**: No calcular aging en frontend.

  **Recommended Agent Profile**: `visual-engineering` + [`vercel-react-best-practices`, `tailwind-css-patterns`]

  **Parallelization**: YES (Wave 1 con 1.1, 1.2). Blocked by: Task 0.2. Blocks: Task 3.3, 4.1.

  **References**:
  - `frontend/src/modules/dashboard/ui/DashboardCommandCenter.tsx` — Pipeline stages pattern
  - `frontend/src/modules/costs/ui/CostBudgetStatus.tsx` — Gauge pattern
  - `frontend/src/app/(dashboard)/billing/invoices/[id]/page.tsx` — Página invoice existente

  **QA Scenarios**:
  ```
  Scenario: Pipeline 3 etapas con estados
    Tool: Playwright
    Steps: 1) Navigate /invoices/{id}/pipeline 2) Assert SES completado (verde) 3) Assert Factura completado (verde) 4) Assert Pago pendiente (gris) 5) Assert conexiones visibles
    Evidence: .sisyphus/evidence/task-1.3-pipeline-partial.png

  Scenario: Aging dashboard buckets con montos
    Tool: Playwright
    Steps: 1) Assert tarjeta "Corriente" con conteo + monto 2) Assert "Vencido 30d" amarillo 3) Assert "Vencido 90d+" rojo
    Evidence: .sisyphus/evidence/task-1.3-aging-dashboard.png
  ```

  **Commit**: `feat(ui): add invoice pipeline, aging dashboard, and payment record components`

---

### Wave 2 — Missing Components in EXISTING Modules (PARALLEL — 3 tasks)

- [ ] 2.1. Dashboard: 7 componentes

  **What to do**:
  - `ui/DashboardKPIWidgets.tsx` — Grid 2x2 KPIStatCards (MTTR, MTBF, FTR, Utilization)
  - `ui/KPIStatCard.tsx` — Icono + valor + label + sparkline (Recharts) + tooltip
  - `ui/MTTRMTBFCards.tsx` — MTTR (min) + MTBF (días) side-by-side
  - `ui/FirstTimeFixRateGauge.tsx` — Gauge circular Recharts: verde>75%, amarillo 60-75%, rojo<60%. Framer Motion.
  - `ui/PendingInvoicesAlert.tsx` — Alerta facturas pendientes (FALLA 4)
  - `ui/PendingReportsAlert.tsx` — Alerta informes pendientes (FALLA 3)
  - `ui/CashFlowFunnel.tsx` — Funnel: Ejecutado→SES→Factura→Pagado con COP

  **Must NOT do**: No duplicar DashboardCommandCenter existente. No hardcodear KPIs.

  **Recommended Agent Profile**: `visual-engineering` + [`vercel-react-best-practices`, `tailwind-css-patterns`]

  **Parallelization**: YES (Wave 2 con 2.2, 2.3). Blocks: Task 4.1.

  **References**: `frontend/src/modules/dashboard/hooks/useDashboardSummary.ts`, `frontend/src/modules/dashboard/ui/SlaRiskOrdersTable.tsx`, `frontend/src/modules/costs/ui/CostComparisonChart.tsx`

  **QA Scenarios**:
  ```
  Scenario: KPI widgets con datos reales
    Tool: Playwright
    Steps: 1) Navigate /dashboard 2) Assert 4 KPIStatCards 3) Assert MTTR con valor en minutos 4) Assert FTR gauge circular 5) Screenshot
    Evidence: .sisyphus/evidence/task-2.1-kpi-widgets.png

  Scenario: Cash flow funnel con montos
    Tool: Playwright
    Steps: 1) Assert 4 etapas funnel 2) Assert montos COP 3) Assert decrecimiento funnel shape
    Evidence: .sisyphus/evidence/task-2.1-funnel.png
  ```

  **Commit**: `feat(ui): add dashboard KPI widgets, MTTR/MTBF cards, FTR gauge, alerts, and cash flow funnel`

---

- [ ] 2.2. Costs: 5 componentes

  **What to do**:
  - `ui/BaselineCostCard.tsx` — Costo congelado propuesta (inmutable), badge baseline
  - `ui/BudgetConsumedGauge.tsx` — Gauge circular: verde<60%, amarillo 60-80%, rojo 80-100%, pulso>100%
  - `ui/CostDeviationStackedBar.tsx` — Barras Recharts por categoría, par estimado/real, % desviación
  - `ui/MarginSummaryCard.tsx` — Ingreso vs costo real, badge margen %
  - `ui/CostCatalogForm.tsx` — Formulario crear/editar con Zod + react-hook-form. Integrar con CostCatalogPanel.

  **Must NOT do**: No duplicar CostCatalogPanel. No crear endpoint catálogo nuevo.

  **Recommended Agent Profile**: `visual-engineering` + [`vercel-react-best-practices`, `tailwind-css-patterns`, `react-hook-form`]

  **Parallelization**: YES (Wave 2 con 2.1, 2.3). Blocks: Task 3.3, 4.1.

  **References**: `frontend/src/modules/costs/ui/CostBudgetStatus.tsx`, `frontend/src/modules/costs/ui/CostCatalogPanel.tsx`, `frontend/src/modules/costs/queries.ts`

  **QA Scenarios**:
  ```
  Scenario: Budget gauge 70% en amarillo
    Tool: Playwright
    Steps: 1) Navigate /costs/{orderId} 2) Assert gauge "70%" amarillo 3) Assert tooltip presupuesto estimado vs real
    Evidence: .sisyphus/evidence/task-2.2-gauge.png

  Scenario: Deviation stacked bars por categoría
    Tool: Playwright
    Steps: 1) Assert barras agrupadas labor/materials/equipment/subcontractor 2) Assert pares estimado/real 3) Assert % desviación >20% en rojo
    Evidence: .sisyphus/evidence/task-2.2-deviation.png
  ```

  **Commit**: `feat(ui): add baseline cost card, budget consumed gauge, cost deviation chart, margin summary, and catalog form`

---

- [ ] 2.3. Reports: 5 componentes + 2 páginas

  **What to do**:
  - `hooks/useAutoDraft.ts` → `useQuery` para auto-draft endpoint
  - `hooks/useReportVersions.ts` → `useQuery` para versiones
  - `ui/TechnicalReportDraftPage.tsx` — Vista editable: datos, actividades, materiales, evidencias, novedades, conclusión. Regenerar/Aprobar/PDF.
  - `ui/ReportVersionHistory.tsx` — Timeline vertical versiones con restaurar
  - `ui/DigitalSignaturePad.tsx` — Canvas HTML5 firma. Limpiar/Deshacer/Aceptar. PNG→FileAsset.
  - `ui/PDFExportButton.tsx` — Botón exportación PDF
  - `ui/ReportReviewPanel.tsx` — Verificar/Rechazar + motivo
  - Páginas: `/reports/[id]/draft/page.tsx`, `/reports/[id]/sign/page.tsx`

  **Must NOT do**: No duplicar ReportPanel existente.

  **Recommended Agent Profile**: `visual-engineering` + [`vercel-react-best-practices`, `tailwind-css-patterns`]

  **Parallelization**: YES (Wave 2 con 2.1, 2.2). Blocked by: Task 0.1, 0.3. Blocks: Task 3.3, 4.1.

  **References**: `frontend/src/modules/reports/ui/ReportPanel.tsx`, `frontend/src/app/(dashboard)/delivery-records/[id]/signature/page.tsx`

  **QA Scenarios**:
  ```
  Scenario: Auto-draft con secciones editables
    Tool: Playwright
    Steps: 1) Navigate /reports/{id}/draft 2) Assert secciones: datos, actividades, materiales, evidencias, novedades, conclusión 3) Assert conclusión editable 4) Click "Regenerar" → loading → nuevo borrador
    Evidence: .sisyphus/evidence/task-2.3-autodraft.png

  Scenario: Firma digital capturada
    Tool: Playwright
    Steps: 1) Navigate /reports/{id}/sign 2) Assert canvas firma 3) Simular trazo 4) Click "Aceptar" 5) Assert "Firma registrada"
    Evidence: .sisyphus/evidence/task-2.3-signature.png
  ```

  **Commit**: `feat(ui): add auto-generated report draft, digital signature pad, version history, and PDF export`

---

### Wave 3 — Notifications + Portal + Pages (PARALLEL — 3 tasks)

- [ ] 3.1. Notifications Frontend

  **What to do**:
  - `api/notification.api.ts` → `fetchNotifications`, `markAsRead`, `markAllAsRead`, `fetchUnreadCount`
  - `hooks/useNotifications.ts` → `useQuery` + polling 30s
  - `hooks/useUnreadCount.ts` → `useQuery` para badge
  - `ui/NotificationBell.tsx` — Campana lucide-react + badge rojo conteo (máx 99+), animación
  - `ui/NotificationPanel.tsx` — Slide-in Framer Motion. Items: icono tipo, título, mensaje, tiempo, badge. Mark all read. Loading skeleton. Empty state.
  - `ui/NotificationCard.tsx` — Click → mark read + deep link
  - `ui/NotificationPreferences.tsx` — Toggles por tipo
  - Páginas: `/notifications/page.tsx`, `/settings/notifications/page.tsx`
  - Integrar `NotificationBell` en header existente

  **Must NOT do**: No crear endpoints nuevos. No hardcodear tipos.

  **Recommended Agent Profile**: `visual-engineering` + [`vercel-react-best-practices`, `tailwind-css-patterns`]

  **Parallelization**: YES (Wave 3 con 3.2, 3.3). Blocks: Task 4.1.

  **References**: `backend/src/modules/notifications/notifications.routes.ts`, `frontend/src/modules/core/` (header), `frontend/src/lib/http/api-client.ts`

  **QA Scenarios**:
  ```
  Scenario: Bell badge + panel slide-in
    Tool: Playwright
    Steps: 1) Assert bell badge "3" 2) Click bell → panel slide-in 3) Assert 3 items no-leídos con fondo distintivo
    Evidence: .sisyphus/evidence/task-3.1-bell-panel.png

  Scenario: Mark read + decrement badge
    Tool: Playwright
    Steps: 1) Click primera notificación 2) Assert badge decrementa 3) Assert item sin fondo no-leído 4) Assert navegación deep link
    Evidence: .sisyphus/evidence/task-3.1-mark-read.png

  Scenario: Empty state
    Tool: Playwright
    Steps: 1) Click bell (usuario sin notificaciones) 2) Assert "Sin notificaciones" + icono
    Evidence: .sisyphus/evidence/task-3.1-empty.png
  ```

  **Commit**: `feat(ui): add notifications center with bell, slide-in panel, notification cards, and preferences page`

---

- [ ] 3.2. Portal Cliente Frontend

  **What to do**:
  - `hooks/usePortalServiceCases.ts` → `useQuery` lista órdenes cliente
  - `ui/PortalServiceCaseList.tsx` — Tabla: código, estado, fecha, acción. Filtro estado. Solo `clientId === userId`.
  - `ui/PortalServiceCaseDetail.tsx` — Timeline simplificado, docs descargables. SIN costos/checklists/planeación.
  - `ui/PortalDocumentDownload.tsx` — Lista docs descargables
  - `ui/PortalSignDeliveryRecord.tsx` — Firma acta (reutiliza DigitalSignaturePad)
  - Páginas: `/portal/service-cases/page.tsx`, `/portal/service-cases/[id]/page.tsx`
  - RBAC: solo rol `cliente`. Solo sus órdenes. Solo lectura + firma acta.

  **Must NOT do**: No exponer costos/checklists/planeación al cliente. No permitir crear/editar.

  **Recommended Agent Profile**: `visual-engineering` + [`vercel-react-best-practices`, `tailwind-css-patterns`]

  **Parallelization**: YES (Wave 3 con 3.1, 3.3). Blocks: Task 4.1.

  **References**: `backend/src/modules/portal/portal.routes.ts`, `frontend/src/modules/portal/api/portal-api.ts`, `frontend/src/app/(portal)/portal/orders/page.tsx`

  **QA Scenarios**:
  ```
  Scenario: Cliente ve solo sus órdenes
    Tool: Playwright
    Steps: 1) Login cliente 2) Navigate /portal/service-cases 3) Assert 3 órdenes 4) Assert SIN columnas costos/checklists/planeación 5) Assert botón "Ver detalle"
    Evidence: .sisyphus/evidence/task-3.2-portal-list.png

  Scenario: Firma acta desde portal
    Tool: Playwright
    Steps: 1) Navigate /portal/service-cases/{id} 2) Click "Firmar acta" 3) Assert canvas firma 4) Simular + aceptar 5) Assert "Acta firmada exitosamente"
    Evidence: .sisyphus/evidence/task-3.2-portal-sign.png

  Scenario: Cliente sin acceso a dashboard interno
    Tool: Playwright
    Steps: 1) Login cliente 2) Navigate /dashboard 3) Assert redirect a /portal o forbidden
    Evidence: .sisyphus/evidence/task-3.2-portal-forbidden.png
  ```

  **Commit**: `feat(ui): add client portal with order list, detail view, document download, and delivery record signing`

---

- [ ] 3.3. Páginas huérfanas

  **What to do**:
  - `frontend/src/app/(dashboard)/costs/catalog/page.tsx` — Usa CostCatalogPanel + CostCatalogForm
  - `frontend/src/app/(dashboard)/settings/notifications/page.tsx` — NotificationPreferences page wrapper
  - Verificar que las páginas de Tasks 1.1, 1.2, 1.3, 2.3 existen con layout auth+RBAC correcto
  - Verificar rutas en sidebar si aplica

  **Recommended Agent Profile**: `quick` + [`next-best-practices`]

  **Parallelization**: YES (Wave 3 con 3.1, 3.2). Blocked by: Tasks 1.1, 1.2, 1.3, 2.2, 2.3. Blocks: Task 4.1.

  **References**: `frontend/src/app/(dashboard)/service-cases/[id]/page.tsx`, `docs/architecture/FRONTEND_ROUTE_MAP.md`

  **QA Scenarios**:
  ```
  Scenario: Páginas nuevas navegables sin 404
    Tool: Playwright
    Steps: 1) /costs/catalog → 200 2) /service-cases/{id}/cockpit → 200 3) /execution-sessions/{id} → 200 4) /reports/{id}/draft → 200 5) /notifications → 200 6) /settings/notifications → 200
    Expected Result: 6/6 páginas cargan sin error
    Evidence: .sisyphus/evidence/task-3.3-pages-navigable.txt
  ```

  **Commit**: `feat(ui): add missing pages for costs/catalog and settings/notifications`

---

### Wave 4 — E2E Tests (1 task, depende de Waves 0-3)

- [ ] 4.1. Suite E2E SPEC-014

  **What to do**:
  Crear `frontend/tests/e2e/spec-014/` con 10 specs:
  - `01-cockpit-14-steps.spec.ts` — Progress bar, tabs, next action, blockers
  - `02-dashboard-kpis.spec.ts` — KPIs, SLA risk table
  - `03-cost-intelligence.spec.ts` — Catálogo, baseline, budget gauge, deviation
  - `04-field-execution.spec.ts` — Preflight, timer, evidence, novelty
  - `05-report-auto-draft.spec.ts` — Borrador, editar, firmar, PDF
  - `06-invoice-pipeline.spec.ts` — Pipeline, aging, badges
  - `07-notifications.spec.ts` — Bell, panel, mark read, preferences
  - `08-portal-cliente.spec.ts` — Lista, detalle, descarga, firma
  - `09-rbac-all-roles.spec.ts` — 8 roles en páginas nuevas
  - `10-full-14-step-flow.spec.ts` — Work request → payment completo

  Cada spec cubre: happy path, loading, error, empty, forbidden. Usar fixtures existentes.

  **Must NOT do**: No depender de datos reales MongoDB. No tests frágiles con selectores dinámicos.

  **Recommended Agent Profile**: `unspecified-high` + [`playwright-best-practices`]

  **Parallelization**: NO. Blocked by: Tasks 0.1-3.3. Blocks: F1-F4.

  **References**: `frontend/tests/e2e/fixtures/base.fixture.ts`, `frontend/tests/e2e/business-flow-14-steps.spec.ts`, `frontend/playwright.config.ts`

  **QA Scenarios**:
  ```
  Scenario: Suite completa ejecuta sin fallos
    Tool: Bash
    Steps: 1) npm run test:e2e -w frontend -- tests/e2e/spec-014/ 2) Validar exit code 0 3) Validar 10/10 specs pass
    Expected Result: Todos los specs verdes
    Evidence: .sisyphus/evidence/task-4.1-e2e-results.txt
  ```

  **Commit**: `test(e2e): add Playwright E2E suite for Spec-014 covering 14-step flow, dashboard, costs, execution, reports, invoices, notifications, portal, and RBAC`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents in PARALLEL. ALL must APPROVE. Present consolidated results and get explicit user "okay".

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verify every "Must Have" (file exists, endpoint responds). For every "Must NOT Have": search codebase for forbidden patterns. Check evidence files in `.sisyphus/evidence/`.
  Output: `Must Have [14/14] | Must NOT Have [N/N] | Tasks [14/14] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck`, `npm run lint`, `npm test`. Review: `as any`, `@ts-ignore`, empty catches, `console.log`, `any`/`unknown`/`null`/`undefined` nuevos, AI slop.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N/N] | Files [N/N] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` + `playwright`
  Execute EVERY QA scenario from EVERY task. Test cross-task integration. Test edge cases. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  Verify 1:1 spec vs implementation. Check Must NOT do compliance. Detect cross-task contamination.
  Output: `Tasks [14/14] | Contamination [CLEAN/N] | Unaccounted [CLEAN/N] | VERDICT`

---

## Commit Strategy

| Wave/Task | Message |
|---|---|
| 0.1 | `feat(backend): add GET /reports/:serviceCaseId/auto-draft` |
| 0.2 | `feat(backend): add GET /service-cases/:id/invoice-pipeline` |
| 0.3 | `feat(backend): add POST /evidence/:id/review` |
| 1.1 | `feat(ui): add cockpit module with 14-step progress bar and tabs` |
| 1.2 | `feat(ui): add field execution with preflight gates and evidence capture` |
| 1.3 | `feat(ui): add invoice pipeline and aging dashboard` |
| 2.1 | `feat(ui): add dashboard KPI widgets, FTR gauge, and cash flow funnel` |
| 2.2 | `feat(ui): add baseline cost card, budget gauge, deviation chart, and catalog form` |
| 2.3 | `feat(ui): add auto-draft reports, digital signatures, and version history` |
| 3.1 | `feat(ui): add notifications center with bell and preferences` |
| 3.2 | `feat(ui): add client portal with orders, documents, and signatures` |
| 3.3 | `feat(ui): add costs/catalog and settings/notifications pages` |
| 4.1 | `test(e2e): add Playwright E2E suite for Spec-014 14-step flow` |

Pre-commit hook (global): `npm run typecheck && npm run test`

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck     # Expected: 0 errors
npm run lint          # Expected: 0 errors
npm test              # Expected: baseline tests intact, ≥95% pass
npm run build         # Expected: exit 0
npm run test:e2e -w frontend -- tests/e2e/spec-014/   # Expected: 10/10 pass
npx react-doctor@latest   # Expected: ≥87/100
```

### Final Checklist
- [ ] `npm run typecheck` → PASS
- [ ] `npm run lint` → PASS
- [ ] `npm test` → PASS
- [ ] `npm run build` → PASS
- [ ] 10/10 E2E specs pass
- [ ] `react-doctor` ≥87/100
- [ ] No `any`/`unknown`/`null`/`undefined` nuevos
- [ ] No funcionalidad eliminada
- [ ] `FileAsset` sigue siendo SSOT
- [ ] No `package.json` modificado sin justificación
- [ ] Evidencia en `.sisyphus/evidence/` para todas las tareas

---

## Dependency Matrix

| Task | Blocked By | Blocks |
|---|---|---|
| 0.1 | - | 2.3, 4.1 |
| 0.2 | - | 1.3, 4.1 |
| 0.3 | - | 2.3, 4.1 |
| 1.1 | - | 3.3, 4.1 |
| 1.2 | - | 3.3, 4.1 |
| 1.3 | 0.2 | 3.3, 4.1 |
| 2.1 | - | 4.1 |
| 2.2 | - | 3.3, 4.1 |
| 2.3 | 0.1, 0.3 | 3.3, 4.1 |
| 3.1 | - | 4.1 |
| 3.2 | - | 4.1 |
| 3.3 | 1.1, 1.2, 1.3, 2.2, 2.3 | 4.1 |
| 4.1 | 0.1-3.3 | F1-F4 |
| F1-F4 | 4.1 | - |

---

## Agent Dispatch Summary

- **Wave 0**: 3 — T0.1-T0.3 → `quick` + `nodejs-express-server` + `zod`
- **Wave 1**: 3 — T1.1-T1.3 → `visual-engineering` + `tailwind-css-patterns` + `vercel-react-best-practices`
- **Wave 2**: 3 — T2.1-T2.3 → `visual-engineering` + `tailwind-css-patterns` + `react-hook-form`
- **Wave 3**: 3 — T3.1-T3.3 → `visual-engineering` + `quick` + `next-best-practices`
- **Wave 4**: 1 — T4.1 → `unspecified-high` + `playwright-best-practices`
- **FINAL**: 4 — F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`+`playwright`, F4→`deep`
