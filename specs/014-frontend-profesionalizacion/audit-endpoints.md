# Spec-014 — Auditoría previa: endpoints existentes vs UI necesaria

> Fecha: 2026-07-04 · Verificado físicamente contra el checkout principal
> (rama `implement/spec-010-modulos-14-pasos` + WIP de spec-012/013 sin commitear).
> Regla aplicada (memoria spec-013): *no confiar en claims externos de "falta X" — verificar nombres canónicos*.

## Tabla de auditoría (sección 1.2 del plan)

| Endpoint (plan Spec-014) | ¿Existe? | Nombre canónico real | UI existente | Acción Spec-014 |
|---|---|---|---|---|
| `GET /service-cases/:id/cockpit` | ✅ | `service-case.routes.ts:53` — contrato `ServiceCaseWorkflowViewSchema` (`service-case-workflow.schema.ts`: `OperationalStepProgressItem`, `WorkflowNextAction`, `ClosureWorkflowSummary`, `CostTraceabilitySummary`) | `frontend/src/modules/service-cases/components/ServiceCaseWorkflowCockpit.tsx` | **Enriquecer** (progress bar 14 pasos, tabs, blockers) — NO crear módulo `cockpit/` duplicado |
| `GET /planning-packets/:id/readiness` | ✅ | `planning-packet.routes.ts:102` + `planning-readiness.service.ts` + hook `usePlanningReadiness` | Panel parcial | Completar `ReadinessGatesPanel` visual |
| `POST /planning-packets/:id/approve` | ✅ | `planning-packet.routes.ts:129` — ya gated por readiness (spec-013) | — | Nada backend |
| `POST /execution-sessions/:id/preflight` | ❌ | No existe ruta ni `PreflightChecklistSchema` en shared-types | No existe | **Crear** schema + endpoint + `PreflightGatesForm` (Sprint 3) |
| `GET /costs/:orderId/intelligence` | △ | `GET /costs/order/:orderId/summary` — `CostSummarySchema` ya tiene `budgetRisk`, `grossMarginPercent`, `budgetConsumptionPercent` | `CostComparisonChart` wired | UI: gauge + desviación por categoría sobre summary existente |
| `GET /costs/catalog` | ✅ | `cost.routes.ts:42` + `cost-catalog.service.ts` | `CostCatalogPanel` | Nada backend |
| `POST /costs/catalog` | ✅ | `cost.routes.ts:51` (MANAGEMENT_ROLES, audit COST_CATALOG_ITEM_CREATED) | Form en `CostCatalogPanel` | Nada |
| `GET /dashboard/operational-kpis` | △ | Embebido en `GET /dashboard/summary` → `maintenanceEfficiency` (`mttrHours`, `mtbfDays`, `maintenanceCompletionRate`, `technicianUtilizationPct`) vía `dashboard-efficiency.service.ts` | Sin widgets MTTR/MTBF | UI: `MTTRMTBFCards`, gauge FTR (falta `firstTimeFixRate` en schema — agregar opcional) |
| `GET /dashboard/sla-risk` | ❌ | No hay lista de órdenes en riesgo SLA; existen `blockers`, `nextActions`, `financialAging` en summary | `DashboardSlaWidget` (agregados) | Evaluar: extender summary con `slaRiskOrders` opcional (Sprint 2) |
| `GET /execution-sessions/:id` | ✅ | `execution-session.routes.ts:48` + start/pause/resume/complete/evidences/materials/labor/signatures/sync | Módulo `execution` | UI field mode: timer + slots evidencia (Sprint 3) |
| `GET /reports/:serviceCaseId/auto-draft` | △ | `POST /technical-reports/:id/generate` + `execution-technical-report.routes.ts` (GET+POST) generan desde datos | Página reports | Verificar cobertura; completar draft editable (Sprint 4) |
| `POST /evidence/:id/review` | ✅ | FSM spec-009: `POST /evidence/:id/verify` + `POST /evidence/:id/replace` + gallery `GET /evidence/order/:orderId/gallery` | Galería evidencias | UI review panel + badges FSM (Sprint 3) |
| `GET /notifications` | ✅ | `notifications.routes.ts:19` + `PATCH /:id/read` + `POST /mark-all-read` | Módulo `notifications` básico | UI bell+panel (Sprint 5) |
| `GET /notifications/unread-count` | ❌ | No existe | — | **Crear** endpoint (Sprint 5) |
| `GET /service-cases/:id/invoice-pipeline` | ❌ | Invoice tiene workflow (submit/approve/reject/payment) pero no vista pipeline agregada | — | **Crear** o derivar de `administrativeClosure`/`financialAging` (Sprint 4) |
| `POST /reports/:id/sign` | △ | `technical-report` submit/approve; firma acta: `POST /portal/delivery-records/:id/sign` + módulo `client-signature` | `delivery-records/[id]/signature` page | Completar firma técnica (Sprint 4) |
| `GET /portal/service-cases` | ✅ | `portal.routes.ts`: `/dashboard`, `/orders`, `/orders/:id`, `/invoices`, `/proposals`, `/delivery-records/:id/sign` | Módulo `portal` frontend | Completar vistas (Sprint 5) |

## Hallazgos estructurales

1. **El worktree de Claude está desactualizado** — el WIP de spec-012/013 (dependencia dura de Spec-014) vive sin commitear en el checkout principal. Todo Spec-014 se ejecuta sobre el checkout principal.
2. **El plan Spec-014 asume nombres que no son los canónicos.** El cockpit ya existe como `ServiceCaseWorkflowView` / `ServiceCaseWorkflowCockpit`. Crear `frontend/src/modules/cockpit/` violaría la regla "no módulos duplicados" (REGLAS_DESARROLLO §2). Se enriquece lo existente.
3. **Frontend ya tiene 44 módulos** — dashboard, costs, evidences, execution, notifications, portal, reports existen. Spec-014 = enriquecimiento, no creación.
4. Gaps reales confirmados a crear: `PreflightChecklistSchema` + endpoint preflight, `unread-count`, `firstTimeFixRate`, lista SLA-risk, pipeline visual facturación, UI de campo (timer/slots), bell de notificaciones.
