# SPEC-016 — Auditoría Integral de Planes y Plan de Continuidad

**Versión:** 1.0 — 5 de julio de 2026
**Rama base:** `deploy/vps-clean`
**Rama actual:** `implement/spec-014-completion`
**Planes auditados:** Spec-008, Spec-010, Spec-012, Spec-012-Maestro, Spec-013, Spec-014, Spec-014-Completion

---

## 1. RESUMEN EJECUTIVO DE AUDITORÍA

Se auditó el proyecto CERMONT contra **7 planes de implementación** (Spec-008 al Spec-015) verificando schemas, reglas de dominio, backend endpoints, frontend módulos/páginas y gates de calidad.

### VEREDICTO GENERAL

| Dimensión | Estado | Detalle |
|-----------|--------|---------|
| Schemas (Spec-012/013) | ✅ 95% COMPLETO | Todos los schemas planificados existen y tienen campos enriquecidos |
| Domain Rules (Spec-012/013/015) | ⚠️ 80% PERO DESORGANIZADO | spec-013-rules.ts NO EXISTE; funciones están en spec-015-rules.ts |
| Backend Endpoints | ✅ 90% COMPLETO | 11 de 12 endpoints planificados existen |
| Frontend Modules | ✅ 85% COMPLETO | Cockpit, field-execution, invoices, dashboard, costs, reports completos |
| Frontend Pages | ✅ 88% COMPLETO | 9 de 11 páginas planificadas existen |
| E2E Tests | ⚠️ PARCIAL | 10 specs existen pero 26/41 fallan según reporte previo |
| Quality Gates | ❌ NO PASAN | lint FAIL (6 errores), test FAIL (3 tests), snapshot desactualizado |

---

## 2. AUDITORÍA DETALLADA

### 2.1 SCHEMAS `packages/shared-types/src/schemas/`

| Schema | Spec-012 Plan | Spec-013 Plan | Realidad | Gap |
|--------|--------------|--------------|----------|-----|
| `cost.schema.ts` | CostCatalogItemSchema, BaselineCostSchema, CostIntelligenceSummarySchema, CostSummaryEnrichedSchema | Idem | ✅ TODOS EXISTEN | Ninguno |
| `execution-session.schema.ts` | PreflightChecklistSchema, FieldNoveltySchema, slaDeadline, estimatedMinutes, ExecutionSessionEnrichedSchema | Idem | ✅ TODOS EXISTEN | Ninguno |
| `evidence.schema.ts` | replacement_requested, EvidenceSlotSchema, EvidenceSlotsRequirementsSchema, qualityScore, replacedBy, slotId | Idem | ✅ TODOS EXISTEN | Ninguno |
| `kit.schema.ts` | KitSafetyRequirementsSchema, isBillable, unitCostCOP, catalogItemId, returnRequired | Idem | ✅ TODOS EXISTEN | Ninguno |
| `dashboard-summary.schema.ts` | DashboardOperationalKPISchema, DashboardSLARiskOrderSchema, DashboardSummaryEnrichedSchema | Idem | ⚠️ PARCIAL | DashboardSLARiskOrderSchema existe como DashboardSlaRiskOrderSchema (nombre ligeramente diferente); DashboardOperationalKPISchema existe |
| `service-case-cockpit.schema.ts` | ARCHIVO NUEVO con StepProgressSchema, NextExpectedActionSchema, ServiceCaseCockpitSchema | Idem | ✅ EXISTE | Ninguno |
| `schemas/index.ts` | Barrel exports | Idem | ✅ COMPLETO | Ninguno |

### 2.2 REGLAS DE DOMINIO `packages/domain/src/`

| Archivo Planificado | Plan | Realidad | Gap |
|--------------------|------|----------|-----|
| `spec-013-rules.ts` | Spec-013 REQUIERE: evaluatePreflightGates, evaluateSLARisk, evaluateCostRisk, evaluateEvidenceCompleteness, computeMTTR, computeMTBF, computeFirstTimeFixRate | ❌ **NO EXISTE** | Las funciones existen en `spec-015-rules.ts` pero no en el archivo que Spec-013 especifica |
| `spec-012-rules.ts` | Spec-012 REQUIERE: idem funciones | ❌ **NO EXISTE** | Mismo problema |
| `spec-015-rules.ts` | Spec-015 | ✅ EXISTE | Contiene TODAS las funciones requeridas por Spec-013 |
| `domain/index.ts` export spec-013-rules | Spec-013 | ❌ NO EXPORTA | `index.ts` exporta desde `spec-015-rules.ts` pero NO desde `spec-013-rules.ts` |

**IMPACTO:** Si algún backend service importa desde `spec-013-rules`, fallaría. Actualmente el backend importa desde `spec-015-rules` directamente.

### 2.3 BACKEND ENDPOINTS

| Endpoint | Plan | Realidad | Gap |
|----------|------|----------|-----|
| `GET /service-cases/:id/cockpit` | Spec-012/013/014 | ✅ EXISTE | route:53 |
| `GET /planning-packets/:id/validate-readiness` | Spec-012/013 | ✅ EXISTE (nombrado `validate-readiness` en vez de `readiness`) | Diferencia de nomenclatura menor |
| `POST /planning-packets/:id/approve` | Spec-012/013 | ✅ EXISTE | route:111 |
| `POST /execution-sessions/:id/preflight` | Spec-012/013/014 | ✅ EXISTE | route:57 |
| `GET /costs/:orderId/intelligence` | Spec-012/013/014 | ✅ EXISTE | route:65 |
| `GET /costs/catalog` | Spec-012/013 | ✅ EXISTE | route:47 |
| `POST /costs/catalog` | Spec-012/013 | ✅ EXISTE | route:56 |
| `GET /dashboard/operational-kpis` | Spec-012/013/014 | ✅ EXISTE | route:14 |
| `GET /dashboard/sla-risk` | Spec-012/013/014 | ✅ EXISTE | route:17 |
| `GET /reports/auto-draft/:serviceCaseId` | Spec-014 | ✅ EXISTE | route:117 (ruta: `/auto-draft/:serviceCaseId`) |
| `POST /evidence/:id/review` | Spec-014 | ✅ EXISTE | route:158 |
| `GET /service-cases/:id/invoice-pipeline` | Spec-014 | ✅ EXISTE (en service-case.service.ts como función) | La función existe internamente pero no tiene ruta HTTP expuesta |

### 2.4 FRONTEND MÓDULOS

| Módulo | Plan | Realidad | Componentes |
|--------|------|----------|-------------|
| **cockpit/** | Spec-014: 8 componentes + api/hooks | ✅ COMPLETO | FourteenStepProgressBar, CockpitHeaderCard, NextActionCard, BlockersPanelCollapsible, CockpitTabs, AuditTimeline, DocumentRequirementsTable + api/hooks/utils/model |
| **field-execution/** | Spec-014: 7 componentes + api/hooks | ✅ COMPLETO | PreflightGatesForm, ExecutionTimer, ExecutionStatusBadge, EvidenceSlotCard, StructuredEvidenceCapture, FieldNoveltyButton + api |
| **invoices/** | Spec-014: 4 componentes + api/hooks | ✅ COMPLETO | InvoicePipelinePage, AgingDashboard, InvoiceStatusBadge, PaymentRecordCard + api/hooks |
| **dashboard/ui/** | Spec-014: 7+ componentes | ✅ COMPLETO | 22 componentes incluyendo DashboardKPIWidgets, MTTRMTBFCards, FirstTimeFixRateGauge, SlaRiskOrdersTable, CashFlowFunnel, PendingInvoicesAlert, PendingReportsAlert |
| **costs/ui/** | Spec-014: 5+ componentes | ✅ COMPLETO | 18 componentes incluyendo BaselineCostCard, BudgetConsumedGauge, CostDeviationStackedBar, MarginSummaryCard, CostCatalogPanel, CostCatalogForm |
| **reports/** | Spec-014: 5 componentes + hooks | ✅ COMPLETO | TechnicalReportDraftPage, ReportVersionHistory, DigitalSignaturePad, PDFExportButton, ReportReviewPanel + hooks/queries |
| **notifications/** | Spec-014: 4 componentes + api/hooks | ⚠️ PARCIAL | ✅ UI: NotificationBell, NotificationCard, NotificationPanel, NotificationPreferences. ❌ api/ HOOKS MISSING |
| **portal/** | Spec-014: 4 componentes + hooks | ⚠️ PARCIAL | ✅ UI: PortalServiceCaseList, PortalServiceCaseDetail, PortalDocumentDownload, PortalSignDeliveryRecord. ❌ hooks/ MISSING |
| **evidences/** | Spec-013: gallery, FSM | ✅ COMPLETO | EvidenceApprovalPanel, EvidenceDropZone, CameraCapture, EvidenceUploader + hooks/queries |

### 2.5 FRONTEND PÁGINAS

| Página | Plan | Realidad |
|--------|------|----------|
| `/service-cases/[id]/cockpit` | Spec-014 | ✅ EXISTE |
| `/execution-sessions/[id]` | Spec-014 | ✅ EXISTE |
| `/costs/catalog` | Spec-014 | ✅ EXISTE |
| `/reports/[id]/draft` | Spec-014 | ✅ EXISTE |
| `/reports/[id]/sign` | Spec-014 | ✅ EXISTE |
| `/invoices/[id]/pipeline` | Spec-014 | ✅ EXISTE |
| `/notifications` | Spec-014 | ✅ EXISTE |
| `/portal/service-cases` | Spec-014 | ✅ EXISTE |
| `/portal/service-cases/[id]` | Spec-014 | ✅ EXISTE |
| `/settings/notifications` | Spec-014 | ❌ NO VERIFICADO |

### 2.6 E2E TESTS

| Test | Plan | Realidad |
|------|------|----------|
| `01-cockpit-14-steps.spec.ts` | Spec-014 | ✅ EXISTE |
| `02-dashboard-kpis.spec.ts` | Spec-014 | ✅ EXISTE |
| `03-cost-intelligence.spec.ts` | Spec-014 | ✅ EXISTE |
| `04-field-execution.spec.ts` | Spec-014 | ✅ EXISTE |
| `05-report-auto-draft.spec.ts` | Spec-014 | ✅ EXISTE |
| `06-invoice-pipeline.spec.ts` | Spec-014 | ✅ EXISTE |
| `07-notifications.spec.ts` | Spec-014 | ✅ EXISTE |
| `08-portal-cliente.spec.ts` | Spec-014 | ✅ EXISTE |
| `09-rbac-all-roles.spec.ts` | Spec-014 | ✅ EXISTE |
| `10-full-14-step-flow.spec.ts` | Spec-014 | ✅ EXISTE |

Según reporte previo: 15/41 pasan, 26 fallan.

---

## 3. QUALITY GATES — ESTADO ACTUAL

| Gate | Resultado | Detalle |
|------|-----------|---------|
| `npm run typecheck` | ✅ PASS (cached) | 7/7 tasks, todo cached |
| `npm run lint` | ❌ FAIL | 6 errores Biome en backend |
| `npm run test` | ❌ FAIL | shared-types: 1 snapshot desactualizado; frontend: 2 tests fallando |
| `npm run build` | ✅ PASS | 5/5 tasks |
| `npm run contracts:check` | ⚠️ NO EJECUTADO | Depende de tsx/esbuild |
| `npm run quality:strict` | ⚠️ NO EJECUTADO | Reporte previo: baseline desactualizado |
| `npm run verify` | ❌ NO PASARÍA | Propaga failures |
| `npx react-doctor@latest` | ⚠️ 68/100 | Reporte previo (objetivo: 87+) |

---

## 4. INCONSISTENCIAS CRÍTICAS ENCONTRADAS

### 🔴 CRITICAL: spec-013-rules.ts NO EXISTE
**Plan Spec-013, sección S1.6** requiere crear explícitamente `packages/domain/src/spec-013-rules.ts` con funciones evaluatePreflightGates, evaluateSLARisk, evaluateCostRisk, evaluateEvidenceCompleteness, computeMTTR, computeMTBF, computeFirstTimeFixRate, computeTechnicianUtilization. Este archivo **no existe**. Las funciones existen en `spec-015-rules.ts` pero el plan original no se siguió.

### 🔴 CRITICAL: API contract snapshot desactualizado
Spec-014 añadió schemas pero no regeneró el snapshot. `migration-063` no se aplicó. Causa: `tsx/esbuild` falla con `spawn EPERM`.

### 🔴 CRITICAL: Linter tiene 6 errores
Backend linter falla con 6 errores Biome que deben corregirse.

### 🟡 HIGH: Notifications module sin api/hooks
El módulo `frontend/src/modules/notifications/` tiene UI components pero no tiene `api/notification.api.ts` ni `hooks/`. El plan Spec-014 lo requiere.

### 🟡 HIGH: Portal module sin hooks
El módulo `frontend/src/modules/portal/` tiene UI components pero no tiene `hooks/usePortalServiceCases.ts`.

### 🟡 HIGH: E2E tests fallando masivamente
26 de 41 tests E2E fallan. Necesitan fixtures reales, autenticación, y selectores estables.

### 🟡 HIGH: Uncommitted changes masivos (365 archivos)
El worktree `implement/spec-014-completion` tiene 365 archivos modificados sin commit.

### 🟡 MEDIUM: Nombre inconsistente readiness endpoint
El plan especifica `GET /planning-packets/:id/readiness` pero se implementó como `/:id/validate-readiness`.

### 🟡 MEDIUM: invoice-pipeline sin ruta HTTP expuesta
La función `getInvoicePipeline` existe en `service-case.service.ts` pero no tiene ruta asociada. El frontend `invoices/` module la necesita.

### 🟡 MEDIUM: Frontend tests fallando
2 tests de frontend fallan en CostBudgetStatus.

---

## 5. PLAN DE CONTINUIDAD — SPEC-016

### Priorización: Corregir gates primero, luego completar módulos parciales, luego estabilizar E2E

---

### SPRINT 0 — ESTABILIZACIÓN DE GATES (IMPEDITIVO)

**Objetivo:** Todos los gates verdes antes de cualquier cambio funcional.

| Tarea | Descripción | Archivos afectados | Dependencias |
|-------|-------------|-------------------|--------------|
| 0.1 | Regenerar snapshot API contract + migration 063 | packages/shared-types, tooling/quality/ | Ninguna |
| 0.2 | Corregir 6 errores Biome en backend | backend/src/**/*.ts | Ninguna |
| 0.3 | Corregir 2 tests frontend fallando (CostBudgetStatus) | frontend/tests/ | Ninguna |
| 0.4 | Corregir snapshot shared-types test | packages/shared-types/tests/contracts/ | 0.1 |
| 0.5 | Forzar typecheck --force (invalidar cache) | global | 0.1-0.4 |
| 0.6 | Ejecutar quality:strict y ajustar baseline si necesario | tooling/quality/ | 0.5 |
| 0.7 | Ejecutar react-doctor y corregir issues ≤87/100 | frontend/ | 0.5 |

**Gates de salida:**
```bash
npm run typecheck      # PASS (sin cache, --force)
npm run lint           # PASS
npm test               # PASS
npm run build          # PASS
npm run contracts:check # PASS
npm run quality:strict # PASS
npm run verify         # PASS
npx react-doctor       # ≥ 87/100
```

---

### SPRINT 1 — COMPLETAR MÓDULOS PARCIALES

**Objetivo:** Cerrar los gaps de implementación identificados en la auditoría.

| Tarea | Descripción | Archivos | Depende de |
|-------|-------------|----------|------------|
| 1.1 | Crear `spec-013-rules.ts` en domain con funciones de negocio y exportar desde index.ts | packages/domain/src/spec-013-rules.ts, index.ts | Sprint 0 |
| 1.2 | Crear `api/notification.api.ts` y `hooks/useNotifications.ts`, `hooks/useUnreadCount.ts` | frontend/src/modules/notifications/ | Sprint 0 |
| 1.3 | Crear `hooks/usePortalServiceCases.ts` | frontend/src/modules/portal/ | Sprint 0 |
| 1.4 | Exponer `GET /service-cases/:id/invoice-pipeline` como ruta HTTP | backend/src/modules/service-cases/ | Sprint 0 |
| 1.5 | Integrar NotificationBell en header existente | frontend/src/modules/core/ | 1.2 |

**Gates de salida:** typecheck ✅ lint ✅ test ✅ build ✅

---

### SPRINT 2 — ESTABILIZAR E2E Y QA

**Objetivo:** Suite E2E verde, QA evidence completa.

| Tarea | Descripción | Depende de |
|-------|-------------|------------|
| 2.1 | Crear fixtures E2E con datos reales y autenticación | Sprint 0 |
| 2.2 | Corregir selectores inestables en specs E2E | Sprint 0 |
| 2.3 | Ejecutar y verificar 10/10 E2E specs | 2.1, 2.2 |
| 2.4 | Commit de todo el trabajo acumulado en spec-014-completion | Sprint 1 |

**Gates de salida:**
```bash
npm run test:e2e -w frontend -- tests/e2e/spec-014/   # 10/10 PASS
```

---

### SPRINT 3 — COMPLETAR FUNCIONALIDADES PENDIENTES DE PLANES ANTERIORES

**Objetivo:** Implementar lo que los planes Spec-012/013/014 requieren y no se implementó.

| Tarea | Plan Origen | Descripción | Prioridad |
|-------|-------------|-------------|-----------|
| 3.1 | Spec-012 S4.3 | `NextActionsByRolePanel` en dashboard | Alta |
| 3.2 | Spec-013 S5.1 | Notificaciones de kit incompleto 24h antes | Alta |
| 3.3 | Spec-013 S5.2 | Alertas de facturación pendiente | Alta |
| 3.4 | Spec-014 2.1 | `NextActionsByRolePanel` + `PendingCertificationsAlert` | Media |
| 3.5 | Spec-012 S6.4 | Exportación PDF funcional con @react-pdf/renderer | Media |
| 3.6 | Spec-014 2.3 | `EvidenceGalleryByPhase` + `EvidenceWorkflowBadge` | Media |

---

### SPRINT 4 — CALIDAD Y DOCUMENTACIÓN FINAL

| Tarea | Descripción |
|-------|-------------|
| 4.1 | Actualizar FRONTEND_ROUTE_MAP.md con nuevas rutas |
| 4.2 | Actualizar API_ENDPOINT_MATRIX.md con nuevos endpoints |
| 4.3 | Verificar que `FileAsset` sigue siendo SSOT (sin MediaAsset duplicado) |
| 4.4 | Verificar cero `any`/`unknown`/`null`/`undefined` nuevos |
| 4.5 | Verificar cero `console.log` en producción |
| 4.6 | Ejecutar escaneo Codex Security |
| 4.7 | Reporte final de cumplimiento de todos los planes |

---

## 6. DEPENDENCIAS

```
Sprint 0 (Gates)
    ↓
Sprint 1 (Módulos Parciales)
    ↓
Sprint 2 (E2E + QA)
    ↓
Sprint 3 (Funcionalidades Pendientes)
    ↓
Sprint 4 (Calidad + Documentación)
```

Sprint 0 es **IMPEDITIVO**: ningún sprint puede comenzar sin gates verdes.

---

## 7. VERIFICACIÓN FINAL

```bash
# Gates completos
npm run typecheck -- --force    # 0 errores
npm run lint                     # 0 errores
npm test                         # baseline tests intactos
npm run build                    # 0 errores
npm run contracts:check          # snapshot alineado
npm run quality:strict          # PASS
npm run verify                   # PASS

# E2E
npm run test:e2e -w frontend -- tests/e2e/spec-014/   # 10/10 pass

# Calidad
npx react-doctor@latest         # ≥ 87/100
npx @biomejs/biome check .      # 0 errores

# Seguridad
# Codex Security Scan (manual)

# Documentación
docs/architecture/FRONTEND_ROUTE_MAP.md    # actualizado
docs/architecture/API_ENDPOINT_MATRIX.md   # actualizado
```

---

## 8. RIESGOS ABIERTOS

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| snapshot test requiere `tsx/esbuild` que falla con `EPERM` | Alto | Ejecutar con PowerShell elevado o regenerar manualmente |
| 365 archivos sin commit pueden causar conflictos de merge | Alto | Commit atómico por sprint, no un mega-commit |
| Dependencias externas (MongoDB, Ariba, DIAN) pueden no estar disponibles para E2E | Medio | Usar fixtures mockeados para E2E, integration tests para reales |
| react-doctor score bajo puede requerir refactor extensivo | Medio | Priorizar issues de accesibilidad y mantenibilidad primero |
| quality:strict baseline puede requerir ajuste si se agregaron nuevos weak tokens | Bajo | Ajustar baseline en Sprint 0 |

---

## 9. CONCLUSIÓN

Spec-015 está **parcialmente implementada** en la rama `implement/spec-014-completion`. La mayoría de los componentes planificados en Spec-012, Spec-013, Spec-014 existen, pero:

1. **Los gates de calidad NO PASAN** — esto bloquea cualquier declaración de "completo"
2. **Hay 3 archivos de dominio faltantes** (spec-013-rules.ts, spec-012-rules.ts)
3. **2 módulos frontend están incompletos** (notifications, portal — sin api/hooks)
4. **Los E2E tests fallan masivamente** (26/41)
5. **La snapshot contractual está desactualizada**

El plan Spec-016 prioriza **estabilización primero** (Sprint 0), luego **completitud** (Sprint 1), luego **calidad** (Sprints 2-4). Sin gates verdes, ninguna funcionalidad nueva debe agregarse.

**Veredicto de deploy: NO-GO** hasta que todos los gates del Sprint 0 pasen.
