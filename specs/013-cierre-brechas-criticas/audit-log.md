# Spec-013 — Fase 0: Auditoría verificada (archivos reales leídos en sesión)

Fecha: 2026-07-03
Rama auditada: `implement/spec-010-modulos-14-pasos` (checkout local con trabajo spec-012 integrado)
Gates al momento de la auditoría: `npm run verify` → **PASS** (typecheck, lint, tests, build de los 5 workspaces + contracts:check + quality:strict + React Doctor 86/100).

## Tabla de auditoría

| Archivo/Endpoint | ¿Existe? | Evidencia leída | Campos/funciones confirmados | Gap vs. spec | Severidad |
|---|---|---|---|---|---|
| `packages/shared-types/src/schemas/cost.schema.ts` | ✅ | 157 líneas leídas | `CostSummarySchema` con `approvedBudget`, `budgetConsumptionPercent`, `budgetRisk` (within/threshold/over), `grossProfit`, `grossMarginPercent`, `actualCostWithTax`, `byCategory` con `tax` y `variance` | La "inteligencia de costos" existe con nombres canónicos distintos a los del prompt (`budgetRisk` en vez de `isAtRisk`/`isCritical`). No es gap funcional. | MENOR |
| `packages/shared-types/src/schemas/cost-cart.schema.ts` | ✅ | 128 líneas leídas | `CostCatalogItemSchema` (code, name, category, unit, unitPrice COP, isActive), `ListCostCatalogQuerySchema`, `CostCatalogListSchema`, `CostCartSchema` con estado `frozen` y `baselineSnapshotId`, `CostDeviationSchema`, `CostComparisonSchema` | Falta schema de **creación** de ítem de catálogo (`CreateCostCatalogItemSchema`) | BLOQUEANTE (para gestionar catálogo desde la app) |
| `GET /api/costs/catalog` | ✅ | `cost.routes.ts:36-42` | authenticate → authorize(INTERNAL_ROLES) → validateQuery → `getCostCatalog`; servicio `cost-catalog.service.ts` con paginación y filtro por categoría | — | — |
| `POST /api/costs/catalog` | ❌ | `cost.routes.ts` completo leído (139 líneas) | No existe creación de ítems de catálogo (solo lectura) | **GAP REAL**: el catálogo no se puede administrar desde el aplicativo | BLOQUEANTE |
| Baseline congelado de costos | ✅ | `planning-packet.service.ts:328-341, 422-463, 499-541` | `computeCostBaseline()` congela `costBaselineSnapshot` al aprobar planeación; actualizar costos después lanza `COST_BASELINE_FROZEN`. `order.schema.ts:107-118` tiene `CostBaselineSchema` | El baseline se congela en la **aprobación de planeación** (no de propuesta). Funcionalmente cubre el requisito LTG "estimado vs. real". `computeCostBaseline` usa tarifas fijas (50000/25000 COP) en vez del catálogo — mejora futura. | MENOR |
| `GET /api/costs/:orderId/intelligence` | ❌ (equivalente ✅) | `cost.routes.ts:54-61` | `GET /api/costs/order/:orderId/summary` retorna `CostSummarySchema` con toda la inteligencia (riesgo, margen, consumo de presupuesto) | Crear un alias `/intelligence` duplicaría rutas (prohibido por REGLAS §DRY). No se implementa. | MENOR (no acción) |
| Frontend costos | ✅ | `frontend/src/modules/costs/` listado + `CostCatalogPanel.tsx` (94 líneas) + `queries.ts` (421 líneas) | `CostCatalogPanel` (tabla con filtro por categoría), `CostBudgetStatus`, `CostSummaryCard`, `CostComparisonChart`, `CostExportButton` (export existe), `useCostCatalog`, `useOrderCostSummary`, query keys estables | Falta mutación de creación de ítem de catálogo + formulario RBAC | IMPORTANTE |
| `packages/shared-types/src/schemas/kit.schema.ts` | ✅ | 308 líneas leídas | `KitTemplateSchema` con arrays separados tools/materials/epp/instruments/vehicles, `requiredCertifications`, `requiredPermits`, `requiredAst`, `readinessRules` (severity blocker), `KitUsageRecordSchema` con readinessStatus, `ApplyKitToPlanningResultSchema` con `missingCriticalItems` + `readinessScore` | `KitSafetyRequirementsSchema` del prompt ya está cubierto por campos existentes (`requiredAst`≈requiresAST, `requiredPermits`≈requiresPTW, `epp[]`≈eppList, `requiredCertifications`≈minimumTechnicianCertifications). Faltan en `KitItemSchema`: `isBillable`, `catalogItemId` (vínculo al catálogo de costos), `returnRequired` | IMPORTANTE |
| `GET /api/planning-packets/:id/readiness` | ❌ (parcial ✅) | `planning-packet.routes.ts:84-89`, `planning-packet.service.ts:40-147, 377-420, 466-540` | Existe `POST /:id/validate-readiness` que recalcula estado ready/incomplete con 7 verificaciones (checklist, blockers, header, recursos con `tool.available`, responsables, AST/PTW, certificaciones). `approvePlanningPacket` **rechaza** si status ≠ "ready" (403/AppError) | **GAP REAL**: no hay endpoint GET de solo lectura que devuelva `canExecute` + `blockingReasons[]` explícitos — el técnico ve "incomplete" pero no QUÉ falta | BLOQUEANTE |
| Gate de ejecución | ✅ | `execution-session.service.ts:87, 384` | Blocker `planning_not_approved`; sesión solo inicia "ready" si planning aprobado | — | — |
| `GET /api/service-cases/:id/cockpit` | ✅ | `service-case.routes.ts:43-53` | Endpoint cockpit existe como read-model alias de workflow (14 pasos) | — | — |
| `dashboard-summary.schema.ts` MTTR/MTBF | ✅ (spec-012 WIP integrado) | diff verificado + `dashboard-efficiency.service.ts` | `DashboardMaintenanceEfficiencySchema` (mttrHours, mtbfDays, maintenanceCompletionRate, activeWorkOrders, overdueWorkOrders, technicianUtilizationPct opcional) calculado desde `ExecutionSession` real | `firstTimeFixRate` no implementado (requiere tracking de retornos por orden — no existe el dato fuente) | MENOR |
| Módulos tool / fleet / evidence / maintenance / erp-connector / dian / privacy-requests | ✅ | Listado de `backend/src/modules` (59 módulos) | Confirmados todos | — | — |
| `packages/domain` rules | ✅ | Listado | `cost.rules.ts`, `kit.rules.ts`, `planning.rules.ts`, `fleet-readiness.rules.ts`, `checklist.rules.ts`, `billing.rules.ts` | — | — |

## Clasificación de gaps accionables

1. **BLOQUEANTE — POST /api/costs/catalog** (FALLA 5): sin esto el catálogo de costos solo puede poblarse por seed/DB directa. Cierra la administración del "listado centralizado de costos con precio unitario COP".
2. **BLOQUEANTE — GET /api/planning-packets/:id/readiness** (FALLA 1/2): exponer `canExecute` + `blockingReasons[]` legibles para que el técnico/residente sepa exactamente qué herramienta/documento/certificación falta ANTES de salir a campo.
3. **IMPORTANTE — KitItemSchema**: agregar `isBillable`, `catalogItemId`, `returnRequired` (opcionales, no rompen tests).
4. **MENOR (no acción)**: alias `/intelligence`, renombres `isAtRisk`/`isCritical` — funcionalidad ya cubierta con nombres canónicos.

## Correcciones aplicadas antes de la auditoría (errores de verify de spec-012)

- `regenerate-snapshot.ts`: non-null assertion eliminada; escribe manifest con tabs (formato Biome).
- `contract-migrations.json`: entrada duplicada `050-...` eliminada; migración `059-spec-012-maintenance-efficiency-notification-preferences` agregada; snapshot regenerado (hash `d3eeaaae…`).
- `schemas/index.ts`: orden de exports corregido (Biome organize imports).
- Backend: import no usado y `useBlockStatements` en `notification-preference.*`, `jobs.service.ts`; parámetros no usados en `cermont-workflow-gate.service.ts`; modelo `NotificationPreference` (tipos muertos + import type).
- `dashboard.service.ts`: 506→~420 líneas — `buildMaintenanceEfficiency` extraído a `dashboard-efficiency.service.ts` (gate service-size ≤500).
- Frontend: `useBlockStatements` y `noArrayIndexKey` en `tools/page.tsx` y `portal/signatures/[id]/page.tsx`.
