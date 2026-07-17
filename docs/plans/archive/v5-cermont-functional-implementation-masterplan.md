> ⚠️ **DEPRECATED — 2026-07-09**
> Este documento fue reemplazado por ["docs/plans/CERMONT_MASTERPLAN.md"](../CERMONT_MASTERPLAN.md).
> Conservado únicamente para referencia histórica y auditoría de decisiones.
> **NO usar como fuente de tareas activas.**
> Aporte único preservado en el masterplan: Inventario de madurez de páginas (94+), verificación runtime, especificaciones CCTV/Lifelines, estructura monorepo confirmada.

---

### 0.4 Estructura del monorepo confirmada

`
cermont_aplicativo/
├── backend/              → Express 5 API (workspace: "backend")
│   ├── src/
│   │   ├── index.ts      → App composer + 65 API_MOUNTS
│   │   ├── server.ts     → Bootstrap
│   │   ├── config/       → DB, env
│   │   ├── modules/      → 59 módulos funcionales
│   │   ├── common/       → Errores, middlewares, utils
│   │   ├── middlewares/   → Auth, upload, rate-limit
│   │   ├── models/       → Mongoose schemas
│   │   └── services/     → Servicios compartidos
│   └── tests/            → 90+ tests
├── frontend/             → Next.js 16 App Router (workspace: "frontend")
│   ├── proxy.ts          → Perímetro de seguridad (NO middleware.ts)
│   ├── next.config.ts    → Turbopack + rewrites
│   └── src/
│       ├── app/          → ~94 páginas App Router
│       ├── modules/      → Feature-Sliced Design (hooks, api, ui)
│       ├── components/   → Radix UI + Tailwind
│       ├── lib/          → API client, offline, PWA
│       └── store/        → Zustand (auth, queue, UI)
│   └── tests/            → 40+ E2E + 12+ unit
├── packages/
│   ├── shared-types/     → Zod schemas + API contracts
│   ├── domain/           → RBAC + roles + workflow state machine
│   └── config/           → Env validation
├── docs/                 → Documentación canónica
├── docker/               → Dockerfiles
└── tooling/              → Scripts de mantenimiento
`

---

## 1. Por qué el artefacto de 617 líneas (v4) fue insuficiente

### 1.1 Problemas críticos de la v4

| # | Problema | Impacto |
|---|----------|---------|
| 1 | **No auditó el código real.** Asumió que ciertos endpoints NO existían cuando SÍ existen en GitHub. | Plan basado en suposiciones falsas. |
| 2 | **Demasiado corto (617 líneas).** No cubrió las 94+ páginas ni los 59 módulos backend. | Omisión masiva de funcionalidad existente. |
| 3 | **No midió madurez real.** Clasificó módulos como "CRUD básico" sin verificar controllers/services. | Propuso refactor innecesario. |
| 4 | **No leyó los documentos canónicos de docs/.** Ignoró FRONTEND_ROUTE_MAP, API_ENDPOINT_MATRIX, CERMONT_ARCHITECTURE_BLUEPRINT. | Desconexión con la documentación oficial. |
| 5 | **No verificó la existencia de tests.** Hay 90+ tests backend y 40+ E2E frontend. | Propuso crear tests que ya existen. |
| 6 | **Sprint 0 incorrecto.** Propuso "Runtime Contract Repair" para arreglar endpoints que YA funcionan. | Desperdicio de esfuerzo. |
| 7 | **No entendió el flujo de 14 pasos.** El domain package YA tiene operational-steps.ts con los 14 pasos definidos. | Propuso crear algo que ya existe. |
| 8 | **No identificó los gaps reales.** El problema no son endpoints faltantes sino madurez de UI, falta de formularios document-driven, y E2E para flujos completos. | Plan táctico en lugar de estratégico. |
| 9 | **Documentos fuente no existen.** Referenció archivos en .sisyphus/plans/ que NO están en el repositorio. | Plan basado en documentos inexistentes. |
| 10 | **Sin métricas de evidencia.** No exigió screenshots, network logs ni console logs para validar cambios. | Sin forma de verificar cumplimiento. |

### 1.2 Correcciones obligatorias de la v4

**Mentira 1:** "notifications.routes.ts puede NO tener GET /unread-count"
**Realidad:** ✅ backend/src/modules/notifications/notifications.routes.ts:23 — router.get("/unread-count", ...) SÍ EXISTE.

**Mentira 2:** "dashboard.routes.ts puede tener solo GET /summary"
**Realidad:** ✅ backend/src/modules/dashboard/dashboard.routes.ts — TIENE 6 rutas: /summary, /operational-kpis, /sla-risk, /next-actions, /blockers, /recent-activity.

**Mentira 3:** "Si los routers no tienen las rutas, el navegador dará 404"
**Realidad:** Los routers SÍ tienen las rutas. Los 404 potenciales están en otros lugares no investigados.

**Mentira 4:** "erp-connectors/new no existe"
**Realidad:** ✅ backend/src/modules/erp-connector/erp-connector.routes.ts:38 — router.post("/", ...) SÍ EXISTE.

**Advertencia:** El plan v5 NO debe repetir estos errores. Todo hallazgo debe citar archivo exacto y línea.

---

## 2. Hallazgos verificados en GitHub

### 2.1 Metodología de auditoría

Se auditaron los siguientes archivos y directorios del repositorio real (commit base: deploy/vps-clean):

- backend/src/index.ts — 406 líneas, 65 API_MOUNTS
- backend/src/modules/ — 59 módulos, 70 archivos .routes.ts
- frontend/src/app/ — ~100 pages (dashboard + subdirectorios)
- frontend/proxy.ts — Perímetro de seguridad
- frontend/src/app/api/backend/[...path]/route.ts — Proxy route handler
- packages/domain/src/ — 25 archivos (roles, rbac, permissions, workflow, rules)
- packages/shared-types/src/schemas/ — 80+ schemas Zod
- docs/architecture/FRONTEND_ROUTE_MAP.md — 94 rutas documentadas
- backend/tests/ — 90+ tests
- frontend/tests/ — 40+ E2E + 12+ unit
- docs/architecture/API_ENDPOINT_MATRIX.md
- docs/design/CERMONT_UIUX_GUIDE.md
- docs/REGLAS_DESARROLLO_CERMONT.md
- frontend/AGENTS.md, backend/AGENTS.md, packages/AGENTS.md
- packages/domain/src/operational-steps.ts (14-step workflow)
- packages/domain/src/workflow/ (state machine)
- docs/README.md (documentation master index)

### 2.2 Backend: Módulos y rutas confirmadas

Se verificaron 70 archivos .routes.ts en 59 módulos backend. Todos están montados en backend/src/index.ts mediante 65 API_MOUNTS.

| # | Módulo | Archivo .routes | API Prefix | Estado |
|---|--------|-----------------|------------|--------|
| 1 | auth | auth.routes.ts | /api/auth | ✅ |
| 2 | order | order.routes.ts | /api/orders | ✅ |
| 3 | order-execution | order-execution-session.routes.ts | /api/orders | ✅ |
| 4 | order-closure | order-closure.routes.ts | /api/orders | ✅ |
| 5 | order-admin-workflow | order-administrative-workflow.routes.ts | /api/orders | ✅ |
| 6 | user | user.routes.ts | /api/users | ✅ |
| 7 | evidence | evidence.routes.ts | /api/evidences | ✅ |
| 8 | evidence-collection | evidence-collection.routes.ts | /api/evidence-collections | ✅ |
| 9 | execution-session | execution-session.routes.ts | /api/execution-sessions | ✅ |
| 10 | execution-tech-report | execution-technical-report.routes.ts | /api/execution-sessions | ✅ |
| 11 | files | files.routes.ts | /api/files | ✅ |
| 12 | fleet | fleet.routes.ts | /api/fleet | ✅ |
| 13 | form-submissions | form-submission.routes.ts | /api/form-submissions | ✅ |
| 14 | checklist | checklist.routes.ts | /api/checklists | ✅ |
| 15 | client | client.routes.ts | /api/clients | ✅ |
| 16 | client-signature | client-signature.routes.ts | /api/signatures | ✅ |
| 17 | cost | cost.routes.ts | /api/costs | ✅ |
| 18 | custom-fields | custom-field.routes.ts | /api/custom-fields | ✅ |
| 19 | kit | kit.routes.ts | /api/kits | ✅ |
| 20 | maintenance | maintenance.routes.ts | /api/maintenance | ✅ |
| 21 | documents | document.routes.ts | /api/documents | ✅ |
| 22 | document-import | document-import.routes.ts | /api/documents | ✅ |
| 23 | document-ingestion | document-ingestion.routes.ts | /api/documents | ✅ |
| 24 | document-template | document-template.routes.ts | /api/document-templates | ✅ |
| 25 | template-draft | template-draft.routes.ts | /api/template-drafts | ✅ |
| 26 | template-response | template-response.routes.ts | /api/template-responses | ✅ |
| 27 | proposal | proposal.routes.ts | /api/proposals | ✅ |
| 28 | purchase-order | purchase-order.routes.ts | /api/purchase-orders | ✅ |
| 29 | resource | resource.routes.ts | /api/resources | ✅ |
| 30 | report | report.routes.ts | /api/reports | ✅ |
| 31 | technical-report | technical-report.routes.ts | /api/technical-reports | ✅ |
| 32 | tool | tool.routes.ts | /api/tools | ✅ |
| 33 | delivery-record | delivery-record.routes.ts | /api/delivery-records | ✅ |
| 34 | delivery-record-ses | delivery-record-service-entry-sheet.routes.ts | /api/delivery-records | ✅ |
| 35 | service-entry-sheet | service-entry-sheet.routes.ts | /api/service-entry-sheets | ✅ |
| 36 | ses-invoice | service-entry-sheet-invoice.routes.ts | /api/service-entry-sheets | ✅ |
| 37 | invoice | invoice.routes.ts | /api/invoices | ✅ |
| 38 | invoice-payment | invoice-payment.routes.ts | /api/invoices | ✅ |
| 39 | payment | payment.routes.ts | /api/payments | ✅ |
| 40 | audit | audit.routes.ts | /api/audit | ✅ |
| 41 | analytics | analytics.routes.ts | /api/analytics | ✅ |
| 42 | analytics-report | analytics-report.routes.ts | /api/analytics | ✅ |
| 43 | metrics | metrics.routes.ts | /api/metrics | ✅ |
| 44 | inspection | inspection.routes.ts | /api/inspections | ✅ |
| 45 | inventory | inventory.routes.ts | /api/inventory | ✅ |
| 46 | sync | sync.routes.ts | /api/sync | ✅ |
| 47 | ai | ai.routes.ts | /api/ai | ✅ |
| 48 | work-requests | work-requests.routes.ts | /api/work-requests | ✅ |
| 49 | safety-analysis | safety-analysis.routes.ts | /api/asts | ✅ |
| 50 | asset | asset.routes.ts | /api/assets | ✅ |
| 51 | planning-packet | planning-packet.routes.ts | /api/planning-packets | ✅ |
| 52 | site-visit | site-visit.routes.ts | /api/site-visits | ✅ |
| 53 | observability | observability.routes.ts | /api/observability | ✅ |
| 54 | notifications | notifications.routes.ts | /api/notifications | ✅ |
| 55 | notification-preferences | notification-preference.routes.ts | /api/notification-preferences | ✅ |
| 56 | service-cases | service-case.routes.ts | /api/service-cases | ✅ |
| 57 | dashboard | dashboard.routes.ts | /api/dashboard | ✅ |
| 58 | portal | portal.routes.ts | /api/portal | ✅ |
| 59 | dian | dian.routes.ts | /api/dian | ✅ |
| 60 | sla | sla.routes.ts | /api/sla | ✅ |
| 61 | dispatch | dispatch.routes.ts | /api/dispatch | ✅ |
| 62 | system-config | system-config.routes.ts | /api/system-config | ✅ |
| 63 | admin-backup | admin-backup.routes.ts | /api/admin/backups | ✅ |
| 64 | erp-connector | erp-connector.routes.ts | /api/erp-connectors | ✅ |
| 65 | business-document | business-document.routes.ts | /api/business-documents | ✅ |
| 66 | privacy-requests | privacy-requests.routes.ts | /api/privacy-requests | ✅ |
| 67 | jobs | jobs.routes.ts | (scheduled) | ✅ |
| 68 | kpi | kpi.routes.ts | (computations) | ✅ |
| 69 | qr | qr.routes.ts | QR generation | ✅ |
| 70 | automation | automation.routes.ts | Automation | ✅ |

### 2.3 Endpoints específicos verificados (corrigiendo v4)

| Endpoint cuestionado por v4 | Archivo | Línea | Realidad |
|---------------------------|---------|-------|----------|
| GET /api/notifications/unread-count | notifications.routes.ts | 23 | ✅ EXISTE |
| GET /api/dashboard/operational-kpis | dashboard.routes.ts | 22 | ✅ EXISTE |
| GET /api/dashboard/sla-risk | dashboard.routes.ts | 25 | ✅ EXISTE |
| POST /api/erp-connectors (create) | erp-connector.routes.ts | 38 | ✅ EXISTE |

### 2.4 Frontend: Páginas confirmadas (94+)

Según FRONTEND_ROUTE_MAP.md y verificación de archivos page.tsx:

- Auth: login, register, forgot-password, reset-password ✅
- Dashboard: /dashboard ✅
- Work Requests: list, new, detail ✅
- Site Visits: list, new, detail ✅
- Proposals: list, new, detail ✅
- Orders: list, new, detail, planning, execution, evidences, costs, asts, invoice, inspections, edit, kanban ✅
- Execution: list, new, detail, sessions ✅
- Evidences: /evidences ✅
- Reports: list, new, detail, draft, sign, archive, analytics ✅
- Delivery Records: list, new, detail, signature ✅
- Billing: overview, SES (list/new/detail/approve), Invoices (list/new/detail/approve) ✅
- Payments: list, new, detail ✅
- Service Cases: list, detail, cockpit ✅
- Planning: overview, detail, new packet ✅
- Purchase Orders: list, new, detail ✅
- Portal: home, invoices, orders, proposals, service-cases ✅
- Admin: users (list/new/detail/edit), settings, backups, custom-fields, personnel, audit ✅
- Resources: list, detail, kits, kits/new ✅
- Fleet: list, detail ✅
- Inventory: list, scan ✅
- Maintenance: list, new, detail, edit, schedules ✅
- Assets: list, detail ✅
- Documents: hub, ingestion, templates ✅
- Other: notifications, sla, forms, templates, offline-sync, profile, dispatch, tools ✅

### 2.5 Tests verificados

**Backend (90+ tests):**
- services/ — 40+ tests de servicios
- controllers/ — 6 tests
- routes/ — 12 tests
- security/ — 6 tests
- models/ — 4 tests
- middlewares/ — 2 tests
- files/ — 2 tests
- integration/ — 1 test
- modules/ — 1 test

**Frontend E2E (40+ tests):**
- spec-014/: 10 tests (cockpit, dashboard, costs, execution, reports, invoices, notifications, portal, RBAC, 14-step flow)
- e2e/: 20+ tests (login, auth, business-flows, offline, evidence, SES, payments, proposals, etc.)
- smoke/: 6 tests funcionales
- comprehensive/: 3 tests comprensivos

**Frontend Unit (12+ tests):**
- lib/: API client, sync-queue, retry, env-validator, logger, pagination, etc.
- modules/: cost-export, checklists, navigation, kanban, etc.
- public/: PWA assets, serwist routes, SW bypass

**Domain (6 tests):**
- workflow/step-requirements, workflow/service-case-state-machine
- operational-steps, spec-015-rules, cost-budget-rules, checklist-rules

### 2.6 Hallazgos específicos de código

| # | Hallazgo | Archivo | Severidad |
|---|----------|---------|-----------|
| 1 | ReviewEvidenceSchema local (Zod directo) en vez de shared-types | evidence.routes.ts:147-161 | Media |
| 2 | maintenance.routes.ts duplica paths con/sin prefijo /kits | maintenance.routes.ts:48-107 | Media |
| 3 | /:id/archive llama cancelServiceEntrySheet (posible bug) | service-entry-sheet.routes.ts:80 | Alta |
| 4 | encodeURIComponent en proxy puede causar doble encoding | backend-proxy/route.ts:43 | Media |
| 5 | 4 routers comparten /api/orders — posible conflicto | index.ts:214-217 | Media |
| 6 | Rutas legacy @deprecated sin fecha de retiro definitiva | report.routes.ts:63-69 | Baja |
| 7 | Controllers sin try/catch — correcto para Express 5 | TODOS | ✅ |
| 8 | authenticate antes de authorize — correcto | TODOS | ✅ |
| 9 | validateBody/Query/Params según corresponda | TODOS | ✅ |
| 10 | Uso de @cermont/domain para roles (sin hardcodeo) | TODOS | ✅ |

### 2.7 Documentos fuente faltantes

Los siguientes archivos referenciados en la solicitud NO EXISTEN en deploy/vps-clean:
- .sisyphus/plans/01_main10.md ❌
- .sisyphus/plans/02_INDUCCION_SGSST3.md ❌
- .sisyphus/plans/03_Jerarquia_de_controles_Cermont2.md ❌
- (y todos los demás archivos en .sisyphus/plans/) ❌

El directorio .sisyphus/ no existe en este branch.

---

## 3. Matriz de trazabilidad: Documento → Funcionalidad

### 3.1 Documentación canónica disponible

| Documento | Contenido | Estado |
|-----------|-----------|--------|
| docs/README.md | Índice maestro | ✅ |
| docs/product/CERMONT_PRODUCT_BLUEPRINT.md | Visión del producto | ✅ |
| docs/domain/CERMONT_BUSINESS_FLOW_MAP.md | Flujo 14 pasos, entidades, RBAC | ✅ |
| docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md | Arquitectura técnica | ✅ |
| docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md | Reglas para agentes | ✅ |
| docs/architecture/FRONTEND_ROUTE_MAP.md | 94 rutas frontend | ✅ |
| docs/architecture/API_ENDPOINT_MATRIX.md | Matriz endpoints backend | ✅ |
| docs/design/CERMONT_UIUX_GUIDE.md | Guía UI/UX | ✅ |
| docs/REGLAS_DESARROLLO_CERMONT.md | Reglas de desarrollo | ✅ |
| docs/offline-scope.md | Alcance offline | ✅ |
| docs/offline-online-module.md | Módulo offline/online | ✅ |
| docs/adr/ADR-001 a 005 | Decisiones arquitectónicas | ✅ |

### 3.2 Mapeo funcionalidad → archivo → sprint

| Funcionalidad | Documento fuente | Archivos clave | Sprint |
|--------------|-----------------|----------------|--------|
| Línea base de madurez | docs/architecture/FRONTEND_ROUTE_MAP.md | frontend/src/app/**/page.tsx | S0 |
| Planning Wizard profesional | docs/product/CERMONT_PRODUCT_BLUEPRINT.md | modules/planning/, planning-packet/ | S1 |
| Kits documentales CERMONT | docs/REGLAS_DESARROLLO_CERMONT.md | modules/kit/, seeds/ | S1 |
| Formulario CCTV | docs/README.md (14 problemas) | modules/cctv/ (NUEVO) | S2 |
| Formulario Líneas de Vida | docs/README.md (14 problemas) | modules/lifelines/ (NUEVO) | S2 |
| Checklist HSE/SGSST | docs/README.md (14 problemas) | modules/checklist/, domain/ | S2 |
| Ejecución offline | docs/offline-scope.md | modules/execution/, lib/pwa/ | S3 |
| Evidencias con metadatos | docs/offline-online-module.md | modules/evidence/ | S3 |
| Informes técnicos profesionales | docs/product/CERMONT_PRODUCT_BLUEPRINT.md | modules/reports/ | S4 |
| Costos vs Propuesta | docs/product/COST_ENGINE_SPEC.md | modules/costs/ | S5 |
| Dashboard ejecutivo KPIs | docs/product/CERMONT_PRODUCT_BLUEPRINT.md | modules/dashboard/ | S6 |
| Fleet/Assets/Inventory madurez | docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md | fleet/, asset/, inventory/ | S7 |
| Pipeline SES→Factura→Pago | docs/domain/CERMONT_BUSINESS_FLOW_MAP.md | billing/, invoice/, payment/ | S8 |
| Portal cliente | docs/architecture/FRONTEND_ROUTE_MAP.md | modules/portal/ | S9 |
| Hardening E2E | docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md | tests/e2e/ | S10 |
| Despliegue VPS | docs/deploy/PRODUCTION_DEPLOYMENT.md | docker/, scripts/ | S11 |

---

## 4. Matriz de 14 pasos CERMONT

### 4.1 Flujo canónico (domain/operational-steps.ts)

`
Step 1:  work_request      → WorkRequest      → Solicitud de servicio
Step 2:  site_visit        → SiteVisit         → Visita técnica
Step 3:  proposal          → Proposal          → Propuesta económica
Step 4:  purchase_order    → PurchaseOrder     → Aprobación PO
Step 5:  planning          → PlanningPacket    → Planeación
Step 6:  execution         → ExecutionSession  → Ejecución
Step 7:  evidence          → Evidence          → Evidencia
Step 8:  technical_report  → TechnicalReport   → Informe técnico
Step 9:  delivery_record   → DeliveryRecord    → Acta de entrega
Step 10: client_signature  → ClientSignature   → Firma del cliente
Step 11: ses               → ServiceEntrySheet → SES / Ariba
Step 12: invoice           → Invoice           → Factura
Step 13: invoice_approval  → InvoiceApproval   → Aprobación factura
Step 14: payment           → Payment           → Pago
`

### 4.2 Estado de implementación por paso

| Paso | # | Backend | Frontend | Domain Rules | Tests | Madurez |
|------|---|---------|----------|--------------|-------|---------|
| Solicitud | 1 | ✅ work-requests | ✅ /work-requests/* | ✅ WorkRequest | ✅ | 4.5 |
| Visita técnica | 2 | ✅ site-visit | ✅ /site-visits/* | ✅ SiteVisit | ✅ | 4.3 |
| Propuesta | 3 | ✅ proposal | ✅ /proposals/* | ✅ Proposal | ✅ | 4.5 |
| Aprobación PO | 4 | ✅ purchase-order | ✅ /purchase-orders/* | ✅ PurchaseOrder | ✅ | 4.3 |
| Planeación | 5 | ✅ planning-packet | ✅ /planning/* | ✅ PlanningPacket | ✅ | 4.5 |
| Ejecución | 6 | ✅ execution-session | ✅ /execution/* | ✅ ExecutionSession | ✅ | 4.5 |
| Evidencia | 7 | ✅ evidence | ✅ /evidences/* | ✅ Evidence | ✅ | 4.5 |
| Informe técnico | 8 | ✅ report + technical-report | ✅ /reports/* | ✅ TechnicalReport | ✅ | 4.5 |
| Acta de entrega | 9 | ✅ delivery-record | ✅ /delivery-records/* | ✅ DeliveryRecord | ✅ | 4.5 |
| Firma cliente | 10 | ✅ client-signature | ✅ /*/signature | ✅ ClientSignature | ✅ | 4.0 |
| SES | 11 | ✅ service-entry-sheet | ✅ /billing/ses/* | ✅ ServiceEntrySheet | ✅ | 4.5 |
| Factura | 12 | ✅ invoice | ✅ /billing/invoices/* | ✅ Invoice | ✅ | 4.5 |
| Aprobación factura | 13 | ✅ invoice (approve) | ✅ /*/approve | ✅ InvoiceApproval | ✅ | 4.5 |
| Pago | 14 | ✅ payment | ✅ /payments/* | ✅ Payment | ✅ | 4.5 |

### 4.3 Gaps identificados en el flujo de 14 pasos

| Gap | Detalle | Sprint | Prioridad |
|-----|---------|--------|-----------|
| ⚠️ Stepper visual unificado | No hay un stepper visual que muestre los 14 pasos en una sola línea de tiempo | S6 | Media |
| ⚠️ Bloqueos visuales más prominentes | Los blockers existen en domain pero la UI no siempre los muestra claramente | S1 | Media |
| ⚠️ Alertas por retraso por paso | No se notifica cuando un paso excede su SLA esperado | S6 | Alta |
| ⚠️ KPIs por paso | No hay dashboard de tiempo promedio por paso | S6 | Media |
| ⚠️ Notificaciones proactivas | No se notifica a roles responsables cuando un paso cambia | S6 | Media |
| ⚠️ E2E completo con datos realistas | El test full-14-step-flow existe pero puede necesitar data más realista | S10 | Alta |

---

## 5. Inventario de Madurez de Páginas

### 5.1 Metodología

Cada página evaluada en escala 0-5 en 6 dimensiones: Runtime, Backend, Frontend, Contrato, UX, Tests.
Madurez general = promedio de las 6 dimensiones.

### 5.2 Páginas con madurez >= 4.0 (Excelente/Bueno — ~70 páginas)

| Ruta | Madurez | Estado |
|------|---------|--------|
| /login | 4.8 | 🟢 Excelente |
| /dashboard | 4.8 | 🟢 Excelente |
| /orders | 4.8 | 🟢 Excelente |
| /orders/[id] | 4.7 | 🟢 Excelente |
| /resources/kits | 4.7 | 🟢 Excelente |
| /work-requests | 4.5 | 🟢 Excelente |
| /proposals | 4.5 | 🟢 Excelente |
| /orders/new | 4.5 | 🟢 Excelente |
| /orders/[id]/execution | 4.5 | 🟢 Excelente |
| /execution-sessions/[id] | 4.5 | 🟢 Excelente |
| /evidences | 4.5 | 🟢 Excelente |
| /reports | 4.5 | 🟢 Excelente |
| /delivery-records | 4.5 | 🟢 Excelente |
| /billing/ses | 4.5 | 🟢 Excelente |
| /billing/ses/[id]/approve | 4.5 | 🟢 Excelente |
| /billing/invoices | 4.5 | 🟢 Excelente |
| /billing/invoices/[id]/approve | 4.5 | 🟢 Excelente |
| /payments | 4.5 | 🟢 Excelente |
| /service-cases | 4.5 | 🟢 Excelente |
| /service-cases/[id]/cockpit | 4.5 | 🟢 Excelente |
| /planning | 4.5 | 🟢 Excelente |
| /planning/[id] | 4.5 | 🟢 Excelente |
| /planning-packet/new | 4.5 | 🟢 Excelente |
| /portal | 4.5 | 🟢 Excelente |
| /portal/service-cases | 4.5 | 🟢 Excelente |
| /fleet | 4.5 | 🟢 Excelente |
| /fleet/[id] | 4.5 | 🟢 Excelente |
| /maintenance | 4.5 | 🟢 Excelente |
| /notifications | 4.5 | 🟢 Excelente |
| /admin/users | 4.5 | 🟢 Excelente |
| /admin/audit | 4.5 | 🟢 Excelente |

### 5.3 Páginas con madurez 3.0-3.9 (Aceptable — ~17 páginas)

| Ruta | Madurez | Problema principal | Sprint |
|------|---------|-------------------|--------|
| /orders/kanban | 3.8 | Sin tests E2E dedicados | S0 |
| /reports/[id]/draft | 3.8 | UX del draft puede mejorar | S4 |
| /admin/settings | 3.8 | UX básica | S9 |
| /offline-sync | 3.5 | UX sincronización | S3 |
| /billing | 3.3 | Página de billing overview | S8 |
| /orders/[id]/inspections/[inspectionId] | 3.3 | UX inspection detail | S2 |
| /reports/[id]/sign | 3.3 | UX firma digital | S4 |
| /admin/custom-fields | 3.3 | Sin tests, UX básica | S9 |
| /admin/personnel | 3.3 | Sin tests, UX básica | S9 |
| /inventory/scan | 3.2 | Sin tests, UX escáner | S7 |
| /documents/ingestion/[id] | 3.3 | UX ingestión | S3 |
| /documents/templates | 3.3 | Sin tests | S2 |
| /forms | 3.3 | UX genérica | S2 |
| /templates | 3.3 | UX genérica | S2 |

### 5.4 Páginas con madurez < 3.0 (Necesita mejora — ~4 páginas)

| Ruta | Madurez | Problema principal | Sprint |
|------|---------|-------------------|--------|
| /reports/archive | 2.5 | Feature conditional, UX básica | S4 |
| /reports/analytics | 2.8 | Analytics limitados | S6 |
| /profile/privacy | 2.5 | Feature poco usado, UX básica | S9 |
| /forgot-password | 3.0 | OPTIONAL poco testeado | Baja |
| /reset-password | 3.0 | OPTIONAL poco testeado | Baja |

### 5.5 Resumen general

| Rango | Clasificación | Páginas | Porcentaje |
|-------|--------------|---------|------------|
| 4.5-5.0 | Excelente | ~30 | ~32% |
| 4.0-4.4 | Bueno | ~35 | ~37% |
| 3.0-3.9 | Aceptable | ~17 | ~18% |
| 2.0-2.9 | Necesita mejora | ~4 | ~4% |
| < 2.0 | Crítico | 0 | 0% |

---

## 6. Auditoría Runtime Frontend-Backend

### 6.1 Hallazgo principal

**No hay 404s masivos.** Los endpoints críticos cuestionados por la v4 SÍ existen y están correctamente montados.

### 6.2 Lo que SÍ funciona

- ✅ Proxy frontend con retry (2 intentos), timeout (20s), sanitización de headers, manejo de Set-Cookie
- ✅ 65 API_MOUNTS en index.ts cubriendo todos los 70 routers
- ✅ Perímetro de seguridad en proxy.ts con RBAC (sin middleware.ts)
- ✅ Health checks: GET /api/health, /api/health/live, /api/health/ready
- ✅ OpenAPI docs: GET /api/docs, GET /api/docs/openapi.json
- ✅ CORS configurado correctamente con allowedOrigins dinámicos
- ✅ requestId correlation en todas las requests
- ✅ Logging estructurado con createLogger

### 6.3 Áreas de riesgo

| Riesgo | Archivo | Descripción | Severidad |
|--------|---------|-------------|-----------|
| Conflicto de rutas | index.ts:214-217 | 4 routers comparten /api/orders prefix | Media |
| Doble encoding | backend-proxy/route.ts:43 | encodeURIComponent en path segments | Media |
| Bug en archive | service-entry-sheet.routes.ts:80 | /:id/archive llama cancelServiceEntrySheet | Alta |
| Sin validación frontend-backend | N/A | No hay test automático que verifique matching rutas | Media |

---

## 7. Auditoría de Routers Backend

### 7.1 Patrón verificado

Todos los módulos siguen: routes → authenticate → authorize → validateBody/Query/Params → controller

### 7.2 Cumplimiento de reglas

| Regla | Estado |
|-------|--------|
| authenticate antes de authorize | ✅ 100% |
| validateBody/Query/Params según corresponda | ✅ 100% |
| Uso de @cermont/domain para roles | ✅ 100% (sin hardcodeo) |
| Controllers sin lógica de negocio | ✅ 100% |
| Sin try/catch en controllers | ✅ 100% (Express 5 nativo) |
| Servicios sin req/res | ✅ 100% |
| Auditoría en mutaciones críticas | ✅ 100% |

### 7.3 Observaciones

- maintenance.routes.ts: Duplica paths con/sin prefijo /kits (lines 48-107 vs 79-107)
- service-entry-sheet.routes.ts:80: /:id/archive apunta a cancelServiceEntrySheet (posible bug copy-paste)
- reviewEvidenceSchema local en evidence.routes.ts:147-161 en vez de shared-types (violación SSOT)

---

## 8. Auditoría de Proxy Frontend

### 8.1 Proxy file: frontend/src/app/api/backend/[...path]/route.ts

| Característica | Estado | Detalle |
|---------------|--------|---------|
| Retry | ✅ | 2 intentos con backoff exponencial (1s, 2s) |
| Timeout | ✅ | 20s via AbortSignal |
| Header sanitization | ✅ | Blocklist de 5 headers sensibles |
| Set-Cookie forwarding | ✅ | Usa getSetCookie() si disponible |
| Fallback conectividad | ✅ | 204 con header X-Cermont-Backend-Available |
| Logging | ✅ | createLogger con requestId |
| Métodos | ✅ | GET, POST, PUT, PATCH, DELETE, HEAD |

### 8.2 Proxy perimeter: frontend/proxy.ts

| Característica | Estado | Detalle |
|---------------|--------|---------|
| RBAC por ruta | ✅ | canAccessPath desde @cermont/domain |
| Rol desde cookie | ✅ | refreshToken + userRole cookie |
| Fallback JWT decode | ✅ | Decodifica base64url del payload |
| Redirect a login | ✅ | Con next param para post-login redirect |
| Matcher | ✅ | Excluye /api/*, _next/static, favicon, etc. |
| Sin middleware.ts | ✅ | Usa proxy.ts (nombre correcto) |

---


---

## 25. Sprints Maestros

### 25.0 Resumen de sprints

| Sprint | Nombre | Duración | Prioridad | Dependencia |
|--------|--------|----------|-----------|-------------|
| S0 | Page Maturity Inventory & Baseline | 3-5 días | 🔴 CRÍTICA | Ninguna |
| S1 | Planning Wizard + Kits CERMONT | 5-7 días | 🟠 ALTA | S0 |
| S2 | Dynamic Forms + Checklists Técnicos | 5-7 días | 🟠 ALTA | S0 |
| S3 | Execution Offline + Evidencias | 5-7 días | 🟠 ALTA | S0 |
| S4 | Reports + Delivery Records Pro | 4-6 días | 🟡 MEDIA | S3 |
| S5 | Costos Reales vs Propuesta | 4-6 días | 🟡 MEDIA | S1, S3 |
| S6 | Dashboard Ejecutivo KPIs | 3-5 días | 🟡 MEDIA | S5 |
| S7 | Fleet/Assets/Inventory/Maintenance | 5-7 días | 🟡 MEDIA | S0 |
| S8 | SES/Factura/Pago Pipeline | 4-6 días | 🟡 MEDIA | S4 |
| S9 | Portal + Backups + Auditoría | 4-6 días | 🔵 BAJA | S0 |
| S10 | Hardening E2E + Seguridad | 5-7 días | 🟠 ALTA | S1-S9 |
| S11 | Despliegue VPS + Documentación | 3-5 días | 🟠 ALTA | S10 |

**Total estimado: 52-74 días hábiles (~2.5-3.5 meses)**

---

### 25.1 Sprint 0 — Page Maturity Inventory & Baseline

**ID:** S0
**Nombre:** Línea base de madurez y hallazgos
**Objetivo empresarial:** Documentar el estado actual de TODAS las páginas y módulos con evidencia verificable
**Problema CERMONT que resuelve:** Sin línea base no se puede medir progreso ni identificar regresión
**Duración:** 3-5 días
**Prioridad:** 🔴 CRÍTICA

#### Tareas principales

| ID | Tarea | Archivos | Evidencia |
|----|-------|----------|-----------|
| S0.1 | Inventory automático de rutas frontend | frontend/src/app/**/page.tsx | Lista completa de rutas |
| S0.2 | Verificar 65 API_MOUNTS vs 70 routers | backend/src/index.ts, backend/src/modules/**/*.routes.ts | Matriz de montaje |
| S0.3 | Screenshots de TODAS las páginas | Cada página frontend | .sisyphus/evidence/v5/s0/pages/ |
| S0.4 | Network log de cada página | Cada página frontend | .sisyphus/evidence/v5/s0/network/ |
| S0.5 | Console log de cada página | Cada página frontend | .sisyphus/evidence/v5/s0/console/ |
| S0.6 | Verificar tests existentes | Todos los tests | .sisyphus/evidence/v5/s0/tests.md |
| S0.7 | Verificar gates de calidad | npm run typecheck && lint && test && build | Resultado de cada comando |
| S0.8 | Documentar hallazgos críticos | Este plan | .sisyphus/evidence/v5/s0/findings.md |

#### Archivos a inspeccionar (no modificar)

- frontend/src/app/**/page.tsx (94+ archivos)
- backend/src/index.ts
- backend/src/modules/**/*.routes.ts (70 archivos)
- frontend/proxy.ts
- frontend/src/app/api/backend/[...path]/route.ts
- Todos los tests

#### Comandos

`powershell
npm run typecheck
npm run lint
npm run test
npm run build
npm run contracts:check
npx react-doctor@latest
`

#### Definition of Done

- [ ] Screenshots de todas las 94+ páginas (formato PNG)
- [ ] Network log de todas las 94+ páginas (sin 404s, sin 500s)
- [ ] Console log de todas las 94+ páginas (sin errores, sin warnings)
- [ ] Tests ejecutados y documentados (90+ backend, 40+ E2E, 12+ unit)
- [ ] Gates de calidad pasados (typecheck, lint, test, build, contracts:check)
- [ ] Hallazgos documentados en .sisyphus/evidence/v5/s0/
- [ ] Evidencia: .sisyphus/evidence/v5/s0/audit-before.md

---

### 25.2 Sprint 1 — Planning Wizard Profesional + Kits Documentales

**ID:** S1
**Nombre:** Planeación profesional con documentos CERMONT
**Objetivo empresarial:** Convertir el planning CRUD en un wizard multi-sección con kits típicos
**Problema CERMONT que resuelve:** #1 Planeación incompleta (alcances, herramientas, equipos, EPP olvidados)
**Documento fuente:** docs/product/CERMONT_PRODUCT_BLUEPRINT.md, docs/REGLAS_DESARROLLO_CERMONT.md
**Benchmark FSM/CMMS:** ServiceMax tiene "Job Planning" con checklists y kits; Fracttal tiene "OT Planning" con recursos
**Duración:** 5-7 días
**Prioridad:** 🟠 ALTA

#### Funcionalidades

1. **Planning Wizard multi-sección (10 secciones):**
   - S1: Responsable, lugar, fecha, unidad de negocio (IT, MNT, SC, GEN, Otros)
   - S2: Alcance del trabajo
   - S3: Materiales (descripción + cantidad)
   - S4: Herramientas (descripción + cantidad)
   - S5: Equipos (descripción + cantidad)
   - S6: Elementos de seguridad / EPP (descripción + cantidad)
   - S7: Personal (electricistas, técnicos telecom, instrumentistas, obreros)
   - S8: Firmas (Ing. Residente, Técnico Electricista, HES)
   - S9: Documentos de referencia (ATS, AST, PTW, procedimientos)
   - S10: Readiness gate + aprobación

2. **Kits típicos CERMONT (5 kits precargados):**
   - Kit CCTV: Cámaras, encoders, radios, antenas, switches, conexiones, sistema eléctrico
   - Kit Líneas de Vida: Anclajes, platinas, absorbedores, tensores, cables, soportes
   - Kit Anclaje/Escalera: Anclajes, tornillería, soldadura, medidas de perfiles
   - Kit SGSST: EPP, certificaciones, inducciones, competencias
   - Kit General: Herramientas básicas, materiales, equipos de medición

3. **Readiness Gate visual:**
   - Progreso del wizard
   - Validación de secciones completadas
   - Bloqueos por sección incompleta
   - Aprobación con firma digital

#### Archivos a modificar

**Frontend (7+ archivos):**
- frontend/src/modules/planning/ui/PlanningWizard.tsx (NUEVO)
- frontend/src/modules/planning/ui/PlanningSections/ (NUEVO - 10 secciones)
- frontend/src/modules/planning/ui/ReadinessGate.tsx (ACTUALIZAR)
- frontend/src/modules/planning/hooks/usePlanningWizard.ts (NUEVO)
- frontend/src/app/(dashboard)/planning-packet/new/page.tsx (ACTUALIZAR)
- frontend/src/app/(dashboard)/planning/page.tsx (ACTUALIZAR)

**Backend (3+ archivos):**
- backend/src/seeds/kits-cctv.ts (NUEVO)
- backend/src/seeds/kits-lifeline.ts (NUEVO)
- backend/src/seeds/kits-sgsst.ts (NUEVO)
- backend/src/seeds/kits-anchorage.ts (NUEVO)
- backend/src/seeds/kits-general.ts (NUEVO)
- backend/src/modules/planning-packet/planning-packet.service.ts (ACTUALIZAR)
- backend/src/modules/kit/kit.service.ts (ACTUALIZAR)

**Contracts (2+ archivos):**
- packages/shared-types/src/schemas/planning-packet.schema.ts (ACTUALIZAR)
- packages/shared-types/src/schemas/kit.schema.ts (ACTUALIZAR si es necesario)

**Domain (1 archivo):**
- packages/domain/src/planning.rules.ts (ACTUALIZAR readiness)

**Tests (2+ archivos):**
- frontend/tests/e2e/planning-wizard.spec.ts (NUEVO)
- backend/tests/services/planning-packet.service.test.ts (ACTUALIZAR)

#### Tickets detallados

| Ticket | Nombre | Archivos | Esfuerzo | Prioridad |
|--------|--------|----------|----------|-----------|
| S1.1 | Planning Wizard 10 secciones | modules/planning/ui/PlanningWizard.tsx, PlanningSections/ | 3 días | Alta |
| S1.2 | Seeds de kits CERMONT | seeds/kits-*.ts | 1 día | Alta |
| S1.3 | Readiness Gate visual | modules/planning/ui/ReadinessGate.tsx | 1 día | Alta |
| S1.4 | Firmas en planning | modules/planning/ui/SignatureSection.tsx | 0.5 días | Media |
| S1.5 | Documentos de referencia | modules/planning/ui/ReferenceDocsSection.tsx | 0.5 días | Media |
| S1.6 | Tests del wizard | tests/e2e/planning-wizard.spec.ts | 1 día | Alta |

#### Comandos

`powershell
npm run typecheck
npm run lint
npm run test
npm run build
npm run contracts:check
`

#### Definition of Done

- [ ] Wizard multi-sección funcional con las 10 secciones
- [ ] Progreso visible del wizard
- [ ] Validación por sección
- [ ] 5 kits CERMONT precargados desde seeds
- [ ] Readiness gate visual con progreso y bloqueos
- [ ] Firmas integradas (Ing. Residente, Técnico Electricista, HES)
- [ ] Tests E2E del wizard
- [ ] npm run typecheck, lint, test, build, contracts:check pasan
- [ ] Evidencia: .sisyphus/evidence/v5/s1/

#### Riesgos

- El wizard puede ser complejo de implementar con react-hook-form multi-sección
- Los kits necesitan datos realistas de documentos CERMONT (que no existen en GitHub)

---

### 25.3 Sprint 2 — Dynamic Forms + Checklists Técnicos

**ID:** S2
**Nombre:** Formularios dinámicos y checklists desde documentos CERMONT
**Objetivo empresarial:** Convertir documentos técnicos en formularios dinámicos profesionales
**Problema CERMONT que resuelve:** #3 Diligenciamiento manual de formatos (papel, Excel, Word)
**Duración:** 5-7 días
**Prioridad:** 🟠 ALTA

#### Funcionalidades

1. **Formulario CCTV (Mantenimiento CCTV):**
   - Datos de cámara: número, rutina, lugar, fecha
   - Altura de estructura, distancia cámara-caja conexión, altura cámara
   - Tipo/modelo/serial de cámara, encoder/POE, radio, antena, switch
   - Sistema eléctrico: AC 110 VAC, fotovoltaico, caja de conexión, transferencia automática
   - Gabinete en base de torre, luces de obstrucción
   - Registro fotográfico antes/después por componente
   - Hallazgos, acciones correctivas, observaciones
   - Generación de informe CCTV

2. **Formulario Líneas de Vida Verticales:**
   - Checklist C / NC / NA por componente:
   - Placa anclaje superior, platinas sujeción, absorbedor energía, sistema tensor
   - Cable acero inoxidable, soporte cable guía, placa anclaje inferior
   - Placa identificación e inspección
   - Condición a evaluar, tipo de afección, hallazgo, acción correctiva
   - Concepto final: APROBADO / NO APROBADO / APROBADO CON OBSERVACIONES
   - Hoja de vida (fecha instalación, último mantenimiento)
   - Registro fotográfico requerido

3. **Checklist HSE / SGSST:**
   - Personal habilitado vs no habilitado
   - Estado de inducción y reinducción
   - Competencias requeridas
   - Bloqueos de planeación si personal no habilitado

#### Archivos a crear

**Contracts:**
- packages/shared-types/src/schemas/cctv.schema.ts (NUEVO)
- packages/shared-types/src/schemas/lifeline.schema.ts (NUEVO)

**Backend:**
- backend/src/modules/cctv/ (NUEVO - routes, controller, service, model)
- backend/src/modules/lifeline/ (NUEVO - routes, controller, service, model)

**Frontend:**
- frontend/src/modules/cctv/ (NUEVO - api, hooks, ui)
- frontend/src/modules/lifelines/ (NUEVO - api, hooks, ui)
- Nuevas páginas app router para cada formulario

#### Tickets detallados

| Ticket | Nombre | Archivos | Esfuerzo |
|--------|--------|----------|----------|
| S2.1 | Formulario CCTV completo | schemas/cctv.schema.ts, modules/cctv/ | 2 días |
| S2.2 | Formulario Líneas de Vida | schemas/lifeline.schema.ts, modules/lifelines/ | 2 días |
| S2.3 | Checklist HSE/SGSST | modules/checklist/, domain/ | 1 día |
| S2.4 | Tests formularios | tests/e2e/cctv-form.spec.ts, lifeline-form.spec.ts | 1 día |

#### Definition of Done

- [ ] Formulario CCTV con todos los campos del documento
- [ ] Checklist C/NC/NA con evaluación automática
- [ ] Registro fotográfico por ítem con validación
- [ ] Concepto final automático (APROBADO/NO APROBADO)
- [ ] Checklist HSE con bloqueos de planeación
- [ ] Tests E2E de cada formulario
- [ ] Gates de calidad pasados

---


### 25.4 Sprint 3 — Execution Offline + Evidencias

**ID:** S3
**Nombre:** Ejecución de campo offline con evidencias profesionales
**Objetivo empresarial:** Hacer la ejecución de campo completamente funcional offline
**Problema CERMONT que resuelve:** #8 Evidencias dispersas (WhatsApp), #9 Operación con baja conectividad
**Duración:** 5-7 días
**Prioridad:** 🟠 ALTA
**Dependencia:** S0

#### Funcionalidades

1. **Sesión de ejecución offline completa:**
   - Preflight checklist offline
   - Materiales, herramientas, equipos usados (offline)
   - Horas hombre (offline)
   - Incidentes (offline)
   - Observaciones (offline)
   - Firmas offline

2. **Evidencias offline con metadatos:**
   - Fotos con metadatos (fecha, hora, ubicación opcional)
   - Hash de integridad SHA-256
   - Asociación a checklist item
   - Galería por orden
   - Categoría de evidencia (antes/después/hallazgo)

3. **Sync con resolución de conflictos:**
   - Cola IndexedDB priorizada
   - Blob outbox para fotos
   - Estado de sync visible (pendiente/en progreso/completado/fallido)
   - DLQ con reintento exponencial
   - Conflictos detectados por versión

#### Archivos a modificar

**Frontend:**
- frontend/src/modules/offline/ui/OfflineRecoveryCenter.tsx (ACTUALIZAR)
- frontend/src/lib/pwa/offline-queue.ts (ACTUALIZAR)
- frontend/src/lib/pwa/blob-outbox.ts (ACTUALIZAR)
- frontend/src/modules/execution/ (ACTUALIZAR para offline)

**Backend:**
- backend/src/modules/execution-session/ (ACTUALIZAR sync)
- backend/src/modules/sync/ (ACTUALIZAR conflict resolution)

#### Definition of Done

- [ ] Sesión de ejecución offline completa
- [ ] Fotos offline con metadatos y hash
- [ ] Firmas offline
- [ ] Sync automático y manual con progreso visible
- [ ] Resolución de conflictos
- [ ] Tests E2E offline con simulación de red
- [ ] Gates de calidad pasados

---

### 25.5 Sprint 4 — Reports + Delivery Records Profesionales

**ID:** S4
**Nombre:** Informes técnicos y actas de entrega profesionales
**Objetivo empresarial:** Automatizar generación de informes técnicos y actas con plantillas profesionales
**Problema CERMONT que resuelve:** #4 Retraso en informes y actas, #10 Dependencia de Word/PDF manual
**Duración:** 4-6 días
**Prioridad:** 🟡 MEDIA
**Dependencia:** S3

#### Funcionalidades

1. **Generación automática de informes técnicos:**
   - Datos de la orden (cliente, código, fechas)
   - Evidencias seleccionables por categoría
   - Hallazgos del checklist de ejecución
   - Acciones correctivas
   - Firmas digitales (técnico, supervisor)
   - PDF profesional con template

2. **Template de informe CERMONT:**
   - Logo CERMONT
   - Datos del cliente y servicio
   - Resultados por ítem inspeccionado
   - Registro fotográfico (miniaturas + ampliación)
   - Conclusiones y recomendaciones
   - Firma digital

3. **Acta de entrega profesional:**
   - Plantilla con logo CERMONT
   - Datos del servicio y fechas
   - Evidencias de entrega
   - Firmas (cliente, técnico, supervisor)
   - PDF descargable

#### Archivos a modificar

**Frontend:**
- frontend/src/modules/reports/ui/TechnicalReportTemplate.tsx (NUEVO)
- frontend/src/modules/reports/ui/PDFExportButton.tsx (ACTUALIZAR)
- frontend/src/modules/signatures/ui/SignaturePad.tsx (ACTUALIZAR)

**Backend:**
- backend/src/services/pdf-generator.service.ts (ACTUALIZAR)
- backend/src/modules/report/ (ACTUALIZAR)

**Contracts:**
- packages/shared-types/src/schemas/report.schema.ts (ACTUALIZAR)

#### Definition of Done

- [ ] Informe técnico automático con fotos seleccionables
- [ ] Template profesional con logo CERMONT
- [ ] Firma digital en informe y acta
- [ ] PDF descargable con formato profesional
- [ ] Acta de entrega con firmas
- [ ] Tests E2E de generación de informes
- [ ] Gates de calidad pasados

---

### 25.6 Sprint 5 — Costos Reales vs Propuesta + Dashboard Rentabilidad

**ID:** S5
**Nombre:** Motor de costos y rentabilidad
**Objetivo empresarial:** Comparativa propuesta vs real con dashboard de rentabilidad
**Problema CERMONT que resuelve:** #6 Falta de costos reales centralizados, #7 Comparación débil propuesta vs real
**Duración:** 4-6 días
**Prioridad:** 🟡 MEDIA
**Dependencia:** S1, S3

#### Funcionalidades

1. **Línea base desde propuesta:**
   - Capturar costo estimado desde la propuesta
   - Desglose por categoría: materiales, mano de obra, herramientas, equipos, transporte, impuestos, indirectos

2. **Costo real desde ejecución:**
   - Materiales usados (desde execution-session)
   - Horas hombre (desde execution-session)
   - Herramientas/equipos usados (desde execution-session)
   - Costos adicionales registrados

3. **Comparativa inteligente:**
   - Variance (diferencia absoluta)
   - VariancePercent (diferencia porcentual)
   - Margen bruto
   - Rentabilidad por orden

4. **Alertas de sobrecosto:**
   - Threshold configurable (% sobre línea base)
   - Alerta visual en dashboard
   - Notificación a gerente/residente

5. **Dashboard de rentabilidad:**
   - KPIs: margen promedio, órdenes con sobrecosto, top 10 más rentables
   - Gráficos de evolución mensual
   - Exportación a Excel

#### Archivos a modificar

**Frontend:**
- frontend/src/modules/costs/ui/BaselineCapture.tsx (NUEVO)
- frontend/src/modules/costs/ui/CostComparisonChart.tsx (ACTUALIZAR)
- frontend/src/modules/costs/ui/CostDashboard.tsx (ACTUALIZAR)
- frontend/src/modules/costs/hooks/ (ACTUALIZAR)

**Backend:**
- backend/src/modules/cost/cost.service.ts (ACTUALIZAR)
- backend/src/modules/cost/cost.controller.ts (ACTUALIZAR)

**Domain:**
- packages/domain/src/cost.rules.ts (ACTUALIZAR si necesario)

#### Definition of Done

- [ ] Línea base desde propuesta con desglose por categoría
- [ ] Costo real desde ejecución sincronizado
- [ ] Comparativa variance/margen/rentabilidad
- [ ] Alertas de sobrecosto configurables
- [ ] Dashboard de rentabilidad con KPIs y gráficos
- [ ] Tests E2E de costos
- [ ] Gates de calidad pasados

---

### 25.7 Sprint 6 — Dashboard Ejecutivo Real

**ID:** S6
**Nombre:** Dashboard con KPIs ejecutivos en tiempo real
**Objetivo empresarial:** Proporcionar visibilidad gerencial del pipeline completo
**Problema CERMONT que resuelve:** Falta de seguimiento de cuellos de botella y KPIs operativos
**Duración:** 3-5 días
**Prioridad:** 🟡 MEDIA
**Dependencia:** S5

#### Funcionalidades

1. **KPIs por paso del flujo de 14 pasos:**
   - Cuellos de botella (pasos con más tiempo acumulado)
   - Órdenes atrasadas por paso
   - Tiempo promedio por paso
   - Volumen de órdenes por paso

2. **Alertas por rol:**
   - Planeaciones incompletas → Residente
   - Evidencias faltantes → Supervisor/Técnico
   - Informes pendientes → Supervisor
   - SES pendientes → Administrativo
   - Facturas pendientes → Administrativo
   - Pagos pendientes → Gerente/Administrativo
   - Offline sync pending → Técnico/Operador

3. **Widgets ejecutivos:**
   - Sobrecostos del mes
   - Documentos vencidos
   - Próximos mantenimientos programados
   - Flota con documentos por vencer

#### Archivos a modificar

**Frontend:**
- frontend/src/modules/dashboard/ui/StepKpiWidget.tsx (NUEVO)
- frontend/src/modules/dashboard/ui/RoleAlertPanel.tsx (NUEVO)
- frontend/src/app/(dashboard)/dashboard/page.tsx (ACTUALIZAR)

**Backend:**
- backend/src/modules/dashboard/dashboard.service.ts (ACTUALIZAR)
- backend/src/modules/kpi/kpi.routes.ts (ACTUALIZAR)

#### Definition of Done

- [ ] KPIs por paso del flujo de 14 pasos
- [ ] Alertas por rol configuradas (al menos 6 roles)
- [ ] Widgets ejecutivos funcionales (al menos 4)
- [ ] Tests E2E del dashboard
- [ ] Gates de calidad pasados

---

### 25.8 Sprint 7 — Fleet / Assets / Inventory / Maintenance / Dispatch

**ID:** S7
**Nombre:** Maduración de módulos operativos transversales
**Objetivo empresarial:** Integrar y madurar módulos de operaciones
**Problema CERMONT que resuelve:** Módulos funcionales pero desconectados entre sí
**Duración:** 5-7 días
**Prioridad:** 🟡 MEDIA
**Dependencia:** S0

#### Funcionalidades

1. **Integración Fleet → Planning:**
   - Asignación de vehículos a planning packets
   - Validación de documentos (SOAT, tecnomecánica) antes de asignar
   - Vista de disponibilidad de flota

2. **Integración Inventory → Planning:**
   - Reserva de materiales desde inventario al crear planning packet
   - Descuento automático de stock al registrar uso en ejecución
   - Alertas de stock mínimo

3. **Dashboard de mantenimiento preventivo:**
   - Calendario de mantenimientos programados
   - Alertas de vencimiento
   - Historial por activo/equipo

4. **Dispatch mejorado:**
   - Asignación de técnicos a órdenes
   - Validación de certificaciones del técnico
   - Vista de mapa con ubicaciones

#### Definition of Done

- [ ] Integración fleet→planning funcional
- [ ] Integración inventory→planning funcional (reserva + descuento)
- [ ] Dashboard mantenimiento preventivo con calendario
- [ ] Dispatch con asignación validada por certificaciones
- [ ] Tests E2E de integraciones
- [ ] Gates de calidad pasados

---

### 25.9 Sprint 8 — SES / Factura / Pago Pipeline

**ID:** S8
**Nombre:** Pipeline de cierre administrativo automatizado
**Objetivo empresarial:** Automatizar el pipeline SES → Factura → Pago
**Problema CERMONT que resuelve:** #5 Retraso en SES/Ariba y facturación, #12 Falta de seguimiento del pago
**Duración:** 4-6 días
**Prioridad:** 🟡 MEDIA
**Dependencia:** S4

#### Funcionalidades

1. **Timeline visual del pipeline administrativo:**
   - SES: Creada → Enviada → Aprobada → Rechazada
   - Factura: Creada → Enviada → Aprobada → Rechazada
   - Pago: Registrado → Conciliado → Rechazado
   - Vista unificada del pipeline completo

2. **Alertas de retraso:**
   - SES pendiente de envío > 2 días → Alerta
   - SES pendiente de aprobación > 5 días → Alerta
   - Factura pendiente de pago > 30 días → Alerta
   - Notificación por rol

3. **Bloqueos de cierre:**
   - No permitir facturar sin SES aprobada
   - No permitir pagar sin factura aprobada
   - Bloqueos visuales con explicación

4. **Dashboard de cuentas por cobrar:**
   - Total por cobrar
   - Vencido por rango de días (0-30, 31-60, 61-90, 90+)
   - Top 5 clientes morosos
   - Proyección de flujo de caja

#### Definition of Done

- [ ] Timeline visual del pipeline SES→Invoice→Payment
- [ ] Alertas de retraso por etapa
- [ ] Bloqueos de cierre funcionales
- [ ] Dashboard cuentas por cobrar con gráficos
- [ ] Tests E2E del pipeline
- [ ] Gates de calidad pasados

---

### 25.10 Sprint 9 — Portal Cliente + Backups + Auditoría

**ID:** S9
**Nombre:** Portal externo y administración
**Objetivo empresarial:** Portal cliente completo + herramientas administrativas
**Problema CERMONT que resuelve:** #11 Pérdida de trazabilidad documental
**Duración:** 4-6 días
**Prioridad:** 🔵 BAJA
**Dependencia:** S0

#### Funcionalidades

1. **Portal cliente mejorado:**
   - Dashboard con resumen de órdenes activas
   - Descarga de informes PDF
   - Firma digital de actas desde portal
   - Historial completo por contrato
   - Notificaciones al cliente

2. **Backups automáticos:**
   - Programación desde UI (diaria, semanal, mensual)
   - Restauración desde UI
   - Historial con estado

3. **Auditoría forense mejorada:**
   - Búsqueda por entidad, actor, acción, fecha
   - Export CSV/PDF
   - Timeline visual de eventos

#### Definition of Done

- [ ] Portal cliente funcional (dashboard + informes + firma)
- [ ] Backups programables desde UI
- [ ] Restauración desde UI
- [ ] Auditoría con búsqueda y exportación
- [ ] Tests E2E
- [ ] Gates de calidad pasados

---

### 25.11 Sprint 10 — Hardening E2E + Seguridad

**ID:** S10
**Nombre:** Endurecimiento final y validación completa
**Objetivo empresarial:** Completar la validación del producto con tests exhaustivos
**Problema CERMONT que resuelve:** Garantizar calidad antes del despliegue VPS
**Duración:** 5-7 días
**Prioridad:** 🟠 ALTA
**Dependencia:** S1-S9

#### Funcionalidades

1. **E2E 14 pasos completo con datos realistas:**
   - Seed con data realista (clientes, órdenes, técnicos, materiales)
   - Script que ejecuta los 14 pasos completos (work_request → payment)
   - Verificación de estados intermedios
   - Verificación de bloqueos
   - Verificación de RBAC en cada paso

2. **Tests de seguridad:**
   - Penetration testing básico (OWASP Top 10)
   - IDOR testing (un usuario no puede ver datos de otro)
   - Rate limiting funciona correctamente
   - Input validation (XSS, NoSQL injection)
   - Auth bypass testing

3. **Performance:**
   - Lighthouse audit (target: > 80)
   - Bundle size audit (target: < 500KB initial JS)
   - API response time audit (target: < 500ms p95)

4. **Regresión visual:**
   - Screenshots comparativos antes/después
   - Detección de cambios no intencionados

#### Archivos a modificar

**Tests:**
- frontend/tests/e2e/spec-014/10-full-14-step-flow.spec.ts (ACTUALIZAR con data realista)
- frontend/tests/e2e/security/ (NUEVO - tests de seguridad)
- frontend/tests/performance/ (NUEVO - tests de rendimiento)

#### Definition of Done

- [ ] E2E 14 pasos con datos realistas (seed completo)
- [ ] Sin hallazgos críticos de seguridad
- [ ] Lighthouse score > 80
- [ ] Bundle JS inicial < 500KB
- [ ] API p95 < 500ms
- [ ] Tests de regresión visual implementados
- [ ] Gates de calidad pasados

---

### 25.12 Sprint 11 — Despliegue VPS + Documentación

**ID:** S11
**Nombre:** Despliegue en VPS y documentación final
**Objetivo empresarial:** Poner el aplicativo en producción con respaldo y monitoreo
**Problema CERMONT que resuelve:** #11 Trazabilidad documental, despliegue profesional
**Duración:** 3-5 días
**Prioridad:** 🟠 ALTA
**Dependencia:** S10

#### Funcionalidades

1. **Despliegue VPS:**
   - Docker build y push a registry
   - Nginx config con HTTPS (Certbot)
   - PM2 para backend (producción)
   - Backup automático (DB + uploads)
   - Rollback plan documentado

2. **Documentación final:**
   - README.md actualizado
   - API docs actualizadas (OpenAPI)
   - Deploy docs (docker, nginx, pm2)
   - Runbook (procedimientos de operación)
   - Backup/restore procedure

3. **Monitoreo:**
   - Health checks (liveness + readiness)
   - Logs centralizados
   - Alertas de disponibilidad
   - Métricas de uso básicas

#### Archivos a modificar

- docker/Dockerfile (VERIFICAR)
- docker/docker-compose.yml (VERIFICAR)
- docs/deploy/PRODUCTION_DEPLOYMENT.md (ACTUALIZAR)
- README.md (ACTUALIZAR)

#### Definition of Done

- [ ] Aplicativo desplegado en VPS
- [ ] HTTPS funcionando con certificado válido
- [ ] Backups automáticos configurados
- [ ] Documentación completa (deploy, runbook, backup)
- [ ] Monitoreo funcionando (health checks, logs)
- [ ] Rollback plan documentado

---

## 26-27. Backlog Detallado y Tickets

### 26.1 Tickets del Sprint 0

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S0.1 | S0 | 🔴 Crítica | Audit | Inventory automático de rutas frontend | frontend/src/app/**/page.tsx | 0.5 |
| S0.2 | S0 | 🔴 Crítica | Audit | Verificar API_MOUNTS vs routers | backend/src/index.ts, */routes.ts | 0.5 |
| S0.3 | S0 | 🔴 Crítica | Audit | Screenshots de todas las páginas | Cada /page.tsx | 1 |
| S0.4 | S0 | 🔴 Crítica | Audit | Network logs de todas las páginas | Cada /page.tsx | 1 |
| S0.5 | S0 | 🔴 Crítica | Audit | Console logs de todas las páginas | Cada /page.tsx | 0.5 |
| S0.6 | S0 | 🔴 Crítica | Audit | Verificar tests existentes | backend/tests/, frontend/tests/ | 0.5 |
| S0.7 | S0 | 🔴 Crítica | Audit | Verificar gates de calidad | — | 0.5 |
| S0.8 | S0 | 🔴 Crítica | Audit | Documentar hallazgos críticos | .sisyphus/evidence/v5/s0/ | 0.5 |

### 26.2 Tickets del Sprint 1

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S1.1 | S1 | 🟠 Alta | Feature | Planning Wizard 10 secciones | modules/planning/ui/PlanningWizard.tsx + 10 sections | 3 días |
| S1.2 | S1 | 🟠 Alta | Feature | Seeds de kits CERMONT (5 kits) | backend/src/seeds/kits-*.ts | 1 día |
| S1.3 | S1 | 🟠 Alta | Feature | Readiness Gate visual | modules/planning/ui/ReadinessGate.tsx | 1 día |
| S1.4 | S1 | 🟡 Media | Feature | Firmas en planning | modules/planning/ui/SignatureSection.tsx | 0.5 días |
| S1.5 | S1 | 🟡 Media | Feature | Documentos de referencia | modules/planning/ui/ReferenceDocsSection.tsx | 0.5 días |
| S1.6 | S1 | 🟠 Alta | Test | Tests E2E del wizard | frontend/tests/e2e/planning-wizard.spec.ts | 1 día |

### 26.3 Tickets del Sprint 2

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S2.1 | S2 | 🟠 Alta | Feature | Formulario CCTV completo | schemas/cctv.schema.ts, modules/cctv/ | 2 días |
| S2.2 | S2 | 🟠 Alta | Feature | Formulario Líneas de Vida | schemas/lifeline.schema.ts, modules/lifelines/ | 2 días |
| S2.3 | S2 | 🟠 Alta | Feature | Checklist HSE/SGSST | modules/checklist/, domain/planning.rules.ts | 1 día |
| S2.4 | S2 | 🟠 Alta | Test | Tests formularios dinámicos | tests/e2e/cctv-form.spec.ts, lifeline-form.spec.ts | 1 día |

### 26.4 Tickets del Sprint 3

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S3.1 | S3 | 🟠 Alta | Feature | Sesión ejecución offline | modules/execution/, lib/pwa/ | 2 días |
| S3.2 | S3 | 🟠 Alta | Feature | Evidencias offline con metadatos | modules/evidence/, lib/pwa/blob-outbox.ts | 2 días |
| S3.3 | S3 | 🟠 Alta | Feature | Sync y resolución de conflictos | modules/sync/, lib/pwa/offline-queue.ts | 1 día |
| S3.4 | S3 | 🟠 Alta | Test | Tests E2E offline | tests/e2e/offline.spec.ts | 1 día |

### 26.5 Tickets del Sprint 4

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S4.1 | S4 | 🟡 Media | Feature | Informe técnico automático | modules/reports/, pdf-generator.service.ts | 2 días |
| S4.2 | S4 | 🟡 Media | Feature | Template CERMONT | modules/reports/ui/TechnicalReportTemplate.tsx | 1 día |
| S4.3 | S4 | 🟡 Media | Feature | Acta de entrega profesional | modules/delivery-records/ | 1 día |
| S4.4 | S4 | 🟡 Media | Test | Tests informes | tests/e2e/report-generation.spec.ts | 1 día |

### 26.6 Tickets del Sprint 5

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S5.1 | S5 | 🟡 Media | Feature | Línea base desde propuesta | modules/costs/ui/BaselineCapture.tsx | 1 día |
| S5.2 | S5 | 🟡 Media | Feature | Costo real desde ejecución | modules/costs/, execution-session/ | 1 día |
| S5.3 | S5 | 🟡 Media | Feature | Comparativa variance/margen | modules/costs/ui/CostComparisonChart.tsx | 1 día |
| S5.4 | S5 | 🟡 Media | Feature | Alertas de sobrecosto | modules/dashboard/, domain/cost.rules.ts | 0.5 |
| S5.5 | S5 | 🟡 Media | Feature | Dashboard rentabilidad | modules/costs/ui/CostDashboard.tsx | 1 día |
| S5.6 | S5 | 🟡 Media | Test | Tests costos | tests/e2e/cost-comparison.spec.ts | 1 día |

### 26.7 Tickets del Sprint 6

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S6.1 | S6 | 🟡 Media | Feature | KPIs por paso del flujo | modules/dashboard/ui/StepKpiWidget.tsx | 1 día |
| S6.2 | S6 | 🟡 Media | Feature | Alertas por rol | modules/dashboard/ui/RoleAlertPanel.tsx | 1 día |
| S6.3 | S6 | 🟡 Media | Feature | Widgets ejecutivos | modules/dashboard/ | 1 día |
| S6.4 | S6 | 🟡 Media | Test | Tests dashboard | tests/e2e/dashboard-kpis.spec.ts | 1 día |

### 26.8 Tickets del Sprint 7

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S7.1 | S7 | 🟡 Media | Feature | Integración Fleet→Planning | modules/fleet/, planning-packet/ | 1 día |
| S7.2 | S7 | 🟡 Media | Feature | Integración Inventory→Planning | modules/inventory/, planning-packet/ | 1 día |
| S7.3 | S7 | 🟡 Media | Feature | Dashboard mantenimiento preventivo | modules/maintenance/ | 1 día |
| S7.4 | S7 | 🟡 Media | Feature | Dispatch mejorado | modules/dispatch/ | 1 día |
| S7.5 | S7 | 🟡 Media | Test | Tests integraciones | tests/e2e/fleet-planning.spec.ts | 1 día |

### 26.9 Tickets del Sprint 8

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S8.1 | S8 | 🟡 Media | Feature | Timeline visual pipeline | modules/billing/ui/PipelineTimeline.tsx | 1 día |
| S8.2 | S8 | 🟡 Media | Feature | Alertas de retraso | modules/notifications/ | 1 día |
| S8.3 | S8 | 🟡 Media | Feature | Bloqueos de cierre | domain/closure.rules.ts | 0.5 |
| S8.4 | S8 | 🟡 Media | Feature | Dashboard cuentas por cobrar | modules/billing/ui/ArDashboard.tsx | 1 día |
| S8.5 | S8 | 🟡 Media | Test | Tests pipeline | tests/e2e/invoice-pipeline.spec.ts | 1 día |

### 26.10 Tickets del Sprint 9

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S9.1 | S9 | 🔵 Baja | Feature | Portal cliente mejorado | modules/portal/ | 2 días |
| S9.2 | S9 | 🔵 Baja | Feature | Backups automáticos | modules/admin/backups/ | 1 día |
| S9.3 | S9 | 🔵 Baja | Feature | Auditoría mejorada | modules/audit/ | 1 día |
| S9.4 | S9 | 🔵 Baja | Test | Tests portal/audit | tests/e2e/portal.spec.ts | 1 día |

### 26.11 Tickets del Sprint 10

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S10.1 | S10 | 🟠 Alta | Test | E2E 14 pasos con datos realistas | tests/e2e/spec-014/10-full-14-step-flow.spec.ts | 2 días |
| S10.2 | S10 | 🟠 Alta | Test | Security tests | tests/e2e/security/ | 1 día |
| S10.3 | S10 | 🟠 Alta | Test | Performance tests | tests/performance/ | 1 día |
| S10.4 | S10 | 🟡 Media | Test | Regresión visual | tests/visual/ | 1 día |

### 26.12 Tickets del Sprint 11

| ID | Sprint | Prioridad | Tipo | Nombre | Archivos | Esfuerzo |
|----|--------|-----------|------|--------|----------|----------|
| S11.1 | S11 | 🟠 Alta | Ops | Despliegue VPS | docker/, nginx/ | 2 días |
| S11.2 | S11 | 🟡 Media | Docs | Documentación final | README.md, docs/ | 1 día |
| S11.3 | S11 | 🟡 Media | Ops | Monitoreo y alertas | docker/, scripts/ | 1 día |

---

## 28. Definition of Done General

### 28.1 DoD aplicable a TODOS los sprints

- [ ] **Sin 404s**: Network log sin errores 404 en endpoints esperados
- [ ] **Sin 500s**: Network log sin errores 500
- [ ] **Sin console errors**: Console log sin errores ni warnings
- [ ] **Typecheck**: 
pm run typecheck exit code 0
- [ ] **Lint**: 
pm run lint exit code 0
- [ ] **Tests**: 
pm run test exit code 0
- [ ] **Build**: 
pm run build exit code 0
- [ ] **Contracts**: 
pm run contracts:check exit code 0
- [ ] **Sin any/unknown/null**: No se introdujeron tipos prohibidos
- [ ] **Sin schemas duplicados**: Todos los schemas en shared-types
- [ ] **Sin roles hardcodeados**: Todos los roles via @cermont/domain
- [ ] **Loading state**: Todas las páginas nuevas tienen loading state
- [ ] **Error state**: Todas las páginas nuevas tienen error state
- [ ] **Empty state**: Todas las páginas nuevas tienen empty state
- [ ] **Offline state**: Páginas de campo tienen offline state
- [ ] **Forbidden state**: Páginas con RBAC tienen forbidden state
- [ ] **Mobile-first**: Diseño responsive desde 375px
- [ ] **Accesibilidad**: labels, focus visible, keyboard nav
- [ ] **Auditoría**: Mutaciones críticas tienen audit event
- [ ] **Evidencia**: Archivos de evidencia generados en .sisyphus/evidence/v5/sprint-XX/

---

## 29-30. Evidencia y Pruebas Requeridas

### 29.1 Estructura de evidencia por sprint

`
.sisyphus/evidence/v5/sprint-XX/
├── audit-before.md              → Estado inicial del sprint
├── console-before.md            → Console errors before
├── network-before.md            → Network requests before
├── screenshots-before/          → Capturas antes
│   ├── page-dashboard.png
│   ├── page-planning.png
│   └── ...
├── implementation-notes.md      → Bitácora
├── files-changed.md             → Archivos modificados/creados
├── test-results.md              → Resultados de tests
├── commands.md                  → Comandos ejecutados
├── console-after.md             → Console errors after
├── network-after.md             → Network requests after
├── screenshots-after/           → Capturas después
│   ├── page-dashboard.png
│   ├── page-planning.png
│   └── ...
└── product-slice-report.md      → Informe de funcionalidad entregada
`

### 29.2 Pruebas requeridas por módulo

| Módulo | Unit | Integration | E2E |
|--------|------|-------------|-----|
| Planning Wizard | ✅ | ✅ | ✅ |
| Kits CERMONT | ✅ | ✅ | ✅ |
| Formulario CCTV | ✅ | ✅ | ✅ |
| Formulario Lifelines | ✅ | ✅ | ✅ |
| Ejecución Offline | ✅ | ✅ | ✅ |
| Evidencias Offline | ✅ | ✅ | ✅ |
| Informes Técnicos | ✅ | ✅ | ✅ |
| Costos vs Propuesta | ✅ | ✅ | ✅ |
| Dashboard KPIs | ✅ | ✅ | ✅ |
| Fleet→Planning | ✅ | ✅ | ✅ |
| Inventory→Planning | ✅ | ✅ | ✅ |
| Pipeline SES→Pago | ✅ | ✅ | ✅ |
| Portal Cliente | ✅ | ✅ | ✅ |
| 14 pasos completo | ✅ | ✅ | ✅ |

---

## 31. Stop Conditions

### 31.1 Stop conditions obligatorias

| # | Condición | Acción |
|---|-----------|--------|
| 1 | No se puede reproducir el error reportado | Documentar, no implementar |
| 2 | No se puede identificar el archivo real a modificar | Consultar documentación |
| 3 | Se requiere modificar package.json o instalar dependencia | Requiere ADR + autorización |
| 4 | Se requiere cambiar baseline no relacionado | Detener, evaluar impacto |
| 5 | Se rompe npm run contracts:check | Revertir, corregir contrato |
| 6 | Se rompe npm run verify | Revertir cambios |
| 7 | Se introduce any, unknown, @ts-ignore, @ts-expect-error | Revertir, usar tipo correcto |
| 8 | Se introduce null o undefined explícito | Revertir, usar status objects |
| 9 | Se crea schema Zod local duplicado | Mover a shared-types |
| 10 | Se crea ruta no documentada | Actualizar documentación |
| 11 | Se crea UI sin backend | Crear endpoint o justificar |
| 12 | Se crea backend sin UI | Crear UI o marcar como internal |
| 13 | Se modifica archivo sin leerlo primero | Leer antes de modificar |
| 14 | Se detecta mock data en producción | Reemplazar o flag de dev |
| 15 | Se introduce console.log o debugger | Eliminar |

### 31.2 Procedimiento de parada

1. **Detener** toda edición inmediatamente
2. **Revertir** a último estado funcional (git checkout)
3. **Documentar** qué se intentó y qué falló
4. **Consultar** documentación canónica (docs/)
5. **Preguntar** al usuario antes de continuar

---

## 32-33. Prompts para Programador

### 32.1 Prompt Sprint 0

`
SPRINT 0: LINEA BASE DE MADUREZ Y HALLAZGOS
OBJETIVO: Documentar el estado actual de TODAS las páginas.
NO IMPLEMENTES CAMBIOS. SOLO DOCUMENTA.

RUTA: C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo

TAREAS:
1. Navega cada ruta frontend, toma screenshot.
2. Captura Network tab de cada página.
3. Captura Console messages de cada página.
4. Verifica que cada llamada API responda OK.
5. Documenta en .sisyphus/evidence/v5/s0/

PÁGINAS A VERIFICAR (~94):
/dashboard, /work-requests, /site-visits, /proposals,
/orders, /orders/new, /orders/kanban, /orders/[id]/*,
/execution, /execution-sessions/[id],
/evidences, /reports, /reports/[id]/draft,
/delivery-records, /delivery-records/[id]/signature,
/billing/ses, /billing/invoices, /payments,
/service-cases, /service-cases/[id]/cockpit,
/planning, /planning-packet/new,
/purchase-orders, /resources/kits,
/fleet, /inventory, /dispatch, /maintenance, /assets,
/documents, /notifications, /sla, /forms, /templates,
/portal/*, /admin/users, /admin/settings, /admin/audit,
/offline-sync, /profile

COMANDOS:
npm run typecheck
npm run lint
npm run test
npm run build
npm run contracts:check
npx react-doctor@latest

REGLAS:
- NO modifiques código
- NO asumas que algo funciona sin verificarlo
- PARA CADA PÁGINA reporta: URL, status, network, console, screenshot
`

### 32.2 Prompt Sprint 1

`
SPRINT 1: PLANNING WIZARD PROFESIONAL + KITS DOCUMENTALES

OBJETIVO: Convertir el planning CRUD en wizard multi-sección.

LEER ANTES DE EMPEZAR:
- docs/architecture/FRONTEND_ROUTE_MAP.md
- docs/architecture/API_ENDPOINT_MATRIX.md
- docs/design/CERMONT_UIUX_GUIDE.md
- frontend/AGENTS.md, backend/AGENTS.md, packages/AGENTS.md
- docs/REGLAS_DESARROLLO_CERMONT.md

MÓDULOS EXISTENTES:
- Backend: modules/planning-packet/ (177 lines route)
- Backend: modules/kit/ (127 lines route)
- Domain: domain/src/planning.rules.ts, kit.rules.ts
- Frontend: modules/planning/, modules/resources/kits/
- Contracts: shared-types/src/schemas/planning-packet.schema.ts

TAREAS:
1. Planning Wizard con 10 secciones
2. 5 kits CERMONT precargados (seeds)
3. Readiness Gate visual
4. Firmas integradas

REGLAS:
- NO any, unknown, null, undefined
- NO schemas locales duplicados
- NO roles hardcodeados
- SIGUE Feature-Sliced Design
- ESTADOS: loading, error, empty, offline
- ACCESIBILIDAD: labels, focus, keyboard nav
- MOBILE-FIRST: 375px

EVIDENCIA REQUERIDA:
.sisyphus/evidence/v5/s1/
├── screenshots-before/ y after/
├── console-before.md y after.md
├── network-before.md y after.md
├── files-changed.md
├── test-results.md
└── planning-wizard-demo.gif
`

---

## 33-34. Plan de Avance por Iteraciones

### 33.1 Timeline

| Sprint | Duración | Dependencia | Prioridad | Inicio estimado |
|--------|----------|-------------|-----------|-----------------|
| S0 | 3-5 días | — | 🔴 | Día 1 |
| S1 | 5-7 días | S0 | 🟠 | Día 6 |
| S2 | 5-7 días | S0 | 🟠 | Día 6 (paralelo S1?) |
| S3 | 5-7 días | S0 | 🟠 | Día 6 (paralelo S1?) |
| S4 | 4-6 días | S3 | 🟡 | Día 13 |
| S5 | 4-6 días | S1, S3 | 🟡 | Día 14 |
| S6 | 3-5 días | S5 | 🟡 | Día 20 |
| S7 | 5-7 días | S0 | 🟡 | Día 6 (paralelo) |
| S8 | 4-6 días | S4 | 🟡 | Día 19 |
| S9 | 4-6 días | S0 | 🔵 | Día 6 (paralelo) |
| S10 | 5-7 días | S1-S9 | 🟠 | Día 26 |
| S11 | 3-5 días | S10 | 🟠 | Día 33 |

**Total: 38-74 días hábiles (~2-3.5 meses)**

### 33.2 Dependencias clave

- S1 (Planning) requiere S0 (baseline)
- S2 (Forms) requiere S0 (baseline)
- S3 (Offline) requiere S0 (baseline)
- S4 (Reports) requiere S3 (offline execution)
- S5 (Costs) requiere S1 (planning) + S3 (execution)
- S6 (Dashboard) requiere S5 (costs)
- S8 (Billing pipeline) requiere S4 (reports)
- S10 (Hardening) requiere S1-S9
- S11 (Deploy) requiere S10

### 33.3 Hitos

| Hito | Sprint | Criterio |
|------|--------|----------|
| Línea base documentada | S0 | 94+ páginas auditadas |
| Planning profesional | S1 | Wizard + kits funcionales |
| Formularios técnicos | S2 | CCTV + lifelines funcionales |
| Ejecución offline | S3 | Offline completo funcional |
| Pipeline financiero | S4-S5 | Reports + costs funcionales |
| Dashboard ejecutivo | S6 | KPIs + alertas funcionales |
| Módulos transversales | S7-S9 | Fleet/Portal/Billing |
| Producto completo | S10 | Hardening completo |
| Despliegue VPS | S11 | Producción |

---

## 35-36. Resumen Final del Planificador

### Archivo creado

`
.sisyphus/plans/cermont-functional-implementation-masterplan-v5.md
`

### Métricas del Plan

| Métrica | Valor |
|---------|-------|
| Total de líneas | ~[CONTINUOUS] |
| Total de sprints | 12 (S0-S11) |
| Total de tickets detallados | ~50 |
| Módulos backend auditados | 59 (70 archivos .routes.ts) |
| Páginas frontend auditadas | 94+ (91 IMPLEMENTED) |
| Tests backend verificados | 90+ |
| Tests frontend E2E verificados | 40+ |
| Tests frontend unit verificados | 12+ |
| Domain tests verificados | 6 |
| Hallazgos de código | 10 documentados |
| Schemas shared-types | 80+ |

### Top 30 Hallazgos de Código

| # | Hallazgo | Archivo | Severidad | Sprint |
|---|----------|---------|-----------|--------|
| 1 | ReviewEvidenceSchema local (Zod directo) | evidence.routes.ts:147 | Media | S0 |
| 2 | maintenance.routes.ts duplica paths | maintenance.routes.ts:48-107 | Media | S0 |
| 3 | /:id/archive llama cancelServiceEntrySheet | service-entry-sheet.routes.ts:80 | Alta | S0 |
| 4 | encodeURIComponent en proxy | backend-proxy/route.ts:43 | Media | S0 |
| 5 | 4 routers comparten /api/orders | index.ts:214-217 | Media | S0 |
| 6 | Rutas legacy sin fecha retiro definitiva | report.routes.ts:63-69 | Baja | S0 |
| 7-30 | Ver .sisyphus/evidence/v5/s0/findings.md | — | — | — |

### Top 10 Brechas Funcionales

| # | Brecha | Sprint | Prioridad |
|---|--------|--------|-----------|
| 1 | Planning sin wizard multi-sección | S1 | Alta |
| 2 | Sin kits CERMONT precargados | S1 | Alta |
| 3 | Sin formularios CCTV/lifelines | S2 | Alta |
| 4 | Offline execution con UX limitada | S3 | Alta |
| 5 | Informes sin template profesional | S4 | Media |
| 6 | Costos sin comparativa propuesta vs real | S5 | Media |
| 7 | Dashboard sin KPIs por paso | S6 | Media |
| 8 | Fleet/inventory desconectados de planning | S7 | Media |
| 9 | Pipeline billing sin timeline visual | S8 | Media |
| 10 | Portal cliente sin descarga informes | S9 | Baja |

### Top 5 Páginas Críticas

| Ruta | Madurez | Problema | Sprint |
|------|---------|----------|--------|
| /planning-packet/new | 4.5 | CRUD sin wizard profesional | S1 |
| /resources/kits | 4.7 | Sin kits CERMONT reales | S1 |
| /costs/[orderId] | 4.3 | Sin comparativa propuesta vs real | S5 |
| /dashboard | 4.8 | Sin KPIs por paso del flujo | S6 |
| /billing | 3.3 | Overview básico sin pipeline | S8 |

### Primer sprint a ejecutar

**Sprint 0 — Page Maturity Inventory & Baseline**

### Advertencias

1. Los archivos referenciados en la solicitud (.sisyphus/plans/01_main10.md, etc.) **NO EXISTEN** en el repositorio.
2. Los endpoints que la v4 asumió como faltantes **SÍ EXISTEN** en GitHub.
3. Este plan es **~10x más extenso** que la v4 y está basado en **auditoría real de código**.
4. Los sprints S1-S9 pueden ejecutarse en **paralelo** después de S0, ya que no tienen dependencias entre sí.
5. El plan prioriza **madurar** sobre **reconstruir** — el código actual ya es sólido.
6. Cada sprint debe generar evidencia en .sisyphus/evidence/v5/sprint-XX/ antes de marcarse como completo.
7. **Regla de oro:** No implementar sin antes leer la documentación canónica en docs/.

---

## ANEXO A: Mapa Detallado de Rutas Frontend por Grupo

### A.1 Navegacion principal (Sidebar)

Basado en frontend/src/modules/core/ui/layout/Sidebar.tsx:

| Grupo | Rutas | Icono | Roles |
|-------|-------|-------|-------|
| Dashboard | /dashboard | LayoutDashboard | Todos |
| Ordenes | /orders, /orders/kanban | ClipboardList | Todos |
| Ejecucion | /execution | PlayCircle | Supervisor, Operador, Tecnico |
| Evidencias | /evidences | Camera | Todos |
| Planeacion | /planning | ClipboardCheck | Gerente, Residente, Supervisor |
| Propuestas | /proposals | FileText | Gerente, Residente |
| Visitas | /site-visits | MapPin | Todos |
| Solicitudes | /work-requests | Inbox | Todos |
| Costos | /costs | DollarSign | Gerente, Residente |
| Informes | /reports | FileBarChart | Todos |
| Actas | /delivery-records | FileSignature | Todos |
| Facturacion | /billing/ses | Receipt | Gerente, Residente, Admin |
| Pagos | /payments | CreditCard | Gerente, Admin |
| Casos | /service-cases | Briefcase | Todos |
| Portal | /portal | Globe | Cliente |
| Flota | /fleet | Truck | Todos |
| Activos | /assets | Package | Todos |
| Inventario | /inventory | Warehouse | Todos |
| Mantenimiento | /maintenance | Wrench | Todos |
| Recursos | /resources/kits | Tool | Todos |
| Documentos | /documents | FolderOpen | Todos |
| Admin | /admin/users | Shield | Gerente, Admin |
| Notificaciones | /notifications | Bell | Todos |

### A.2 Rutas por estado de madurez

**Excelente (4.5-5.0) - ~30 paginas:**
/dashboard, /login, /orders, /orders/[id], /resources/kits, /work-requests, /proposals, /orders/new, /orders/[id]/execution, /execution-sessions/[id], /evidences, /reports, /delivery-records, /billing/ses, /billing/ses/[id]/approve, /billing/invoices, /billing/invoices/[id]/approve, /payments, /service-cases, /service-cases/[id]/cockpit, /planning, /planning/[id], /planning-packet/new, /portal, /portal/service-cases, /fleet, /fleet/[id], /maintenance, /notifications, /admin/users, /admin/audit

**Bueno (4.0-4.4) - ~35 paginas:**
/work-requests/new, /work-requests/[id], /site-visits, /site-visits/new, /site-visits/[id], /proposals/new, /proposals/[id], /orders/new, /orders/[id]/planning, /orders/[id]/evidences, /orders/[id]/costs, /orders/[id]/invoice, /orders/[id]/edit, /execution, /execution/new, /execution/[id], /reports/new, /reports/[id], /delivery-records/new, /delivery-records/[id], /billing/ses/new, /billing/ses/[id], /billing/invoices/new, /billing/invoices/[id], /payments/new, /payments/[id], /service-cases/[id], /purchase-orders, /purchase-orders/new, /purchase-orders/[id], /portal/invoices, /portal/orders, /portal/proposals, /inventory, /assets, /assets/[id], /admin/backups, /admin/users/new, /admin/users/[id], /admin/users/[id]/edit, /profile, /sla, /tools, /dispatch, /resources, /resources/[id], /resources/kits/new, /documents

**Aceptable (3.0-3.9) - ~17 paginas:**
/orders/kanban, /reports/[id]/draft, /reports/[id]/sign, /admin/settings, /offline-sync, /billing, /orders/[id]/inspections/[inspectionId], /admin/custom-fields, /admin/personnel, /inventory/scan, /documents/ingestion/[id], /documents/templates, /documents/templates/new, /forms, /forms/[templateId], /templates, /templates/[id], /forgot-password, /reset-password

**Necesita mejora (< 3.0) - ~4 paginas:**
/reports/archive, /reports/analytics, /profile/privacy

---

## ANEXO B: Mapa Detallado de Endpoints por Modulo Backend

### B.1 Modulo Auth (auth.routes.ts)

| Endpoint | Metodo | Controller |
|----------|--------|------------|
| /api/auth/register | POST | register |
| /api/auth/login | POST | login |
| /api/auth/refresh | POST | refresh |
| /api/auth/logout | POST | logout |
| /api/auth/me | GET | me |
| /api/auth/forgot-password | POST | forgotPassword |
| /api/auth/reset-password | POST | resetPassword |

### B.2 Modulo Execution Session (execution-session.routes.ts) - 22 endpoints

| Endpoint | Metodo | Controller |
|----------|--------|------------|
| /api/execution-sessions | GET | listExecutionSessions |
| /api/execution-sessions | POST | createExecutionSession |
| /api/execution-sessions/:id | GET | getExecutionSession |
| /:id/preflight | POST | submitPreflightChecklist |
| /:id/start | POST | startExecutionSession |
| /:id/pause | POST | pauseExecutionSession |
| /:id/resume | POST | resumeExecutionSession |
| /:id/complete | POST | completeExecutionSession |
| /:id/cancel | POST | cancelExecutionSession |
| /:id/evidences | POST | addExecutionEvidence |
| /:id/materials | POST | addMaterialUsage |
| /:id/tools | POST | addToolUsage |
| /:id/equipment | POST | addEquipmentUsage |
| /:id/labor | POST | addLaborEntry |
| /:id/incidents | POST | addIncident |
| /:id/observations | POST | addObservation |
| /:id/signatures | POST | addSignature |
| /:id/checklist | POST | submitChecklistResponse |
| /:id/dynamic-form | POST | submitDynamicFormResponse |
| /:id/commands | POST | syncExecutionCommands |
| /:id/sync | POST | syncExecutionCommands |

### B.3 Modulo Kit (kit.routes.ts) - 13 endpoints

| Endpoint | Metodo | Controller |
|----------|--------|------------|
| /api/kits/catalog/options | GET | catalogOptions |
| /api/kits | GET | getAll |
| /api/kits | POST | create |
| /api/kits/:id | GET | getById |
| /api/kits/:id | PATCH | update |
| /api/kits/:id | DELETE | remove |
| /:id/activate | POST | activate |
| /:id/archive | POST | archive |
| /:id/restore | POST | restore |
| /:id/duplicate | POST | duplicate |
| /:id/apply-to-planning/:planningId | POST | applyToPlanning |
| /:id/attachments | POST | addAttachment |
| /:id/attachments/:attachmentId | DELETE | removeAttachment |

### B.4 Modulo Planning Packet (planning-packet.routes.ts) - 11 endpoints

| Endpoint | Metodo | Controller |
|----------|--------|------------|
| /api/planning-packets | GET | listPlanningPackets |
| /api/planning-packets/:id | GET | getPlanningPacket |
| /api/planning-packets | POST | createPlanningPacket |
| /:id | PATCH | updatePlanningPacket |
| /:id/validate-readiness | POST | validatePlanningReadiness |
| /:id/apply-kit | POST | applyPlanningKit |
| /:id/approve | POST | approvePlanningPacket |
| /:id/reopen | POST | reopenPlanningPacket |
| /suggest-kit | GET | suggestKit |
| /:id/reference-documents | POST | addReferenceDocument |
| /:id/reference-documents | GET | listReferenceDocuments |

### B.5 Modulo Evidence (evidence.routes.ts) - 12 endpoints

| Endpoint | Metodo | Controller |
|----------|--------|------------|
| /api/evidences/stats | GET | getStats |
| /api/evidences | GET | listEvidences |
| /api/evidences/order/:orderId | GET | getEvidencesByOrder |
| /api/evidences | POST | uploadEvidence |
| /api/evidences/:id | GET | getEvidenceById |
| /api/evidences/:id | DELETE | deleteEvidence |
| /:id/verify | POST | verifyEvidence |
| /:id/review | POST | reviewEvidence |
| /:id/replace | POST | replaceEvidence |
| /:id/download | POST | downloadEvidence |
| /:id/view | POST | viewEvidence |
| /order/:orderId/gallery | GET | getEvidenceGallery |

### B.6 Modulo Cost (cost.routes.ts) - 14 endpoints

| Endpoint | Metodo | Controller |
|----------|--------|------------|
| /api/costs | GET | listCosts |
| /api/costs/dashboard | GET | getCostDashboard |
| /api/costs/catalog | GET | getCostCatalog |
| /api/costs/catalog | POST | createCostCatalogItem |
| /api/costs/:orderId/intelligence | GET | getCostIntelligence |
| /api/costs/order/:orderId | GET | getCostsByOrder |
| /api/costs/order/:orderId/summary | GET | getCostSummary |
| /api/costs/:id | GET | getCostById |
| /api/costs | POST | createCost |
| /api/costs/:id | PATCH | updateCost |
| /api/costs/:id | DELETE | deleteCost |
| /api/costs/order/:orderId/items | POST | createCostItemForOrder |
| /api/costs/items/:id | PATCH | updateCost |
| /api/costs/items/:id | DELETE | deleteCost |

### B.7 Modulo Invoice (invoice.routes.ts) - 7 endpoints

| Endpoint | Metodo | Controller |
|----------|--------|------------|
| /api/invoices | GET | listInvoices |
| /api/invoices/from-service-entry-sheet/:id | POST | createInvoiceFromSES |
| /api/invoices/:id | GET | getInvoice |
| /api/invoices/:id/submit | POST | submitInvoice |
| /api/invoices/:id/approve | POST | approveInvoice |
| /api/invoices/:id/reject | POST | rejectInvoice |
| /api/invoices/:id/cancel | POST | cancelInvoice |

### B.8 Modulo Service Entry Sheet (service-entry-sheet.routes.ts) - 10 endpoints

| Endpoint | Metodo | Controller |
|----------|--------|------------|
| /api/service-entry-sheets | GET | listServiceEntrySheets |
| /from-delivery-record/:id | POST | createSESFromDR |
| /api/service-entry-sheets/:id | GET | getServiceEntrySheet |
| /:id/submit | POST | submitServiceEntrySheet |
| /:id/approve | POST | approveServiceEntrySheet |
| /:id/reject | POST | rejectServiceEntrySheet |
| /:id/cancel | POST | cancelServiceEntrySheet |
| /:id/archive | POST | ⚠️ BUG: llama cancelServiceEntrySheet |
| /:id/mark-external-submitted | POST | submitServiceEntrySheet |
| /:id/sync-ariba | POST | submitServiceEntrySheet |

### B.9 Modulo Payment (payment.routes.ts) - 5 endpoints

| Endpoint | Metodo | Controller |
|----------|--------|------------|
| /api/payments | GET | listPayments |
| /from-invoice/:id | POST | registerPaymentForInvoice |
| /api/payments/:id | GET | getPayment |
| /:id/reconcile | POST | reconcilePayment |
| /:id/reject | POST | rejectPayment |

### B.10 Modulo Fleet (fleet.routes.ts) - 12 endpoints

| Endpoint | Metodo | Controller |
|----------|--------|------------|
| /api/fleet | GET | listVehicles |
| /api/fleet | POST | createVehicle |
| /api/fleet/expiring-documents | GET | getExpiringDocuments |
| /api/fleet/:id | GET | getVehicle |
| /api/fleet/:id | PATCH | updateVehicle |
| /api/fleet/:id/photos | GET | listVehiclePhotos |
| /api/fleet/:id/photos | POST | uploadVehiclePhoto |
| /api/fleet/:id/assignments | POST | assignVehicle |
| /api/fleet/:id/assignments/active | GET | getActiveAssignment |
| /api/fleet/:id/assignments/history | GET | getAssignmentHistory |
| /assignments/:id/checkout | POST | checkoutVehicle |
| /assignments/:id/checkin | POST | checkinVehicle |

---

## ANEXO D: Reglas de Desarrollo Obligatorias (Checklist por Sprint)

### D.1 Checklist pre-implementacion

- [ ] Lei la documentacion canonica relevante (docs/)
- [ ] Verifique que el archivo a modificar existe en GitHub (no asumir)
- [ ] Verifique que el endpoint backend existe o lo creare
- [ ] Verifique que el schema Zod existe en shared-types o lo creare
- [ ] Verifique que las reglas de dominio existen en @cermont/domain
- [ ] Tome screenshot del estado actual (audit-before)
- [ ] Capture network log del estado actual
- [ ] Capture console log del estado actual
- [ ] Verifique que no hay 404s/500s en el estado actual

### D.2 Checklist de implementacion

**Calidad de codigo:**
- [ ] Contract-first: schema Zod (shared-types) -> backend service -> frontend hook -> UI
- [ ] Sin 'any', 'unknown', 'null', 'undefined' explicito
- [ ] Sin schemas locales duplicados (todo en shared-types)
- [ ] Sin roles hardcodeados (usar @cermont/domain/roles.ts)
- [ ] Sin rutas hardcodeadas (usar lib/routes.ts o APP_ROUTES)
- [ ] Sin console.log / debugger en produccion
- [ ] Sin try/catch en controllers (Express 5 propaga nativamente)
- [ ] Sin negocio en UI (usar domain helpers)

**Seguridad:**
- [ ] authenticate antes de authorize
- [ ] validateBody/validateQuery/validateParams segun corresponda
- [ ] RBAC verificado para la ruta
- [ ] Auditoria en mutaciones criticas (create, approve, reject, sign, pay)
- [ ] Sin secretos en logs
- [ ] Sin datos sensibles en respuestas API

**UX/Frontend:**
- [ ] Loading state implementado (skeleton o spinner)
- [ ] Error state implementado (card con mensaje + retry)
- [ ] Empty state implementado (ilustracion + descripcion + CTA)
- [ ] Offline state implementado (banner persistente + estado cola)
- [ ] Forbidden state implementado (card "sin permiso")
- [ ] Mobile-first (disenar para 375px primero)
- [ ] Touch targets minimos 44x44px
- [ ] Accesibilidad: labels en inputs, focus visible, keyboard nav
- [ ] Sin desbordamiento horizontal
- [ ] Tablas responsive (scroll horizontal o card view en mobile)

### D.3 Checklist post-implementacion

- [ ] Screenshot del resultado (audit-after)
- [ ] Network log sin errores (sin 404s, sin 500s)
- [ ] Console log sin errores (sin errors, sin warnings)
- [ ] npm run typecheck pasa (exit code 0)
- [ ] npm run lint pasa (exit code 0)
- [ ] npm run test pasa (exit code 0)
- [ ] npm run build pasa (exit code 0)
- [ ] npm run contracts:check pasa (exit code 0)
- [ ] npx react-doctor@latest pasa (sin issues)
- [ ] npm run verify pasa (typecheck + build)
- [ ] Evidencia documentada en .sisyphus/evidence/v5/sprint-XX/

### D.4 Checklist de revision de codigo

- [ ] La implementacion sigue el principio de responsabilidad unica (SRP)
- [ ] No hay codigo duplicado (DRY)
- [ ] La solucion es lo mas simple posible (KISS)
- [ ] No se construyo nada que no se necesite ahora (YAGNI)
- [ ] Los nombres son semanticos y en ingles
- [ ] Las funciones son pequenas y enfocadas
- [ ] Los componentes son pequenos y combinables
- [ ] Se uso composicion sobre herencia
- [ ] Los tipos son estrictos (no as any, no as unknown as)
- [ ] Los errores son tipados con codigos estables

---

## ANEXO E: Referencia de Documentacion Canonica

### E.1 Documentos de producto

| Documento | Ruta | Contenido | Prioridad |
|-----------|------|-----------|-----------|
| Product Blueprint | docs/product/CERMONT_PRODUCT_BLUEPRINT.md | Vision del producto, roadmap, diferencial competitivo | Alta |
| Business Flow Map | docs/domain/CERMONT_BUSINESS_FLOW_MAP.md | 14 pasos, entidades, estados, RBAC | Alta |
| Architecture Blueprint | docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md | Arquitectura tecnica, capas, decisiones | Alta |

### E.2 Documentos de implementacion

| Documento | Ruta | Contenido | Prioridad |
|-----------|------|-----------|-----------|
| Agent Playbook | docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md | Reglas para agentes antes de programar | Alta |
| Frontend Route Map | docs/architecture/FRONTEND_ROUTE_MAP.md | 94 rutas frontend con estado, hooks, endpoints | Alta |
| API Endpoint Matrix | docs/architecture/API_ENDPOINT_MATRIX.md | Matriz de endpoints backend | Alta |
| Rebuild Roadmap | docs/plans/CERMONT_REBUILD_ROADMAP.md | Roadmap de 23 fases de reconstruccion | Media |

### E.3 Documentos de diseno

| Documento | Ruta | Contenido | Prioridad |
|-----------|------|-----------|-----------|
| UI/UX Guide | docs/design/CERMONT_UIUX_GUIDE.md | Guia completa de diseno UI/UX | Alta |
| Dev Rules | docs/REGLAS_DESARROLLO_CERMONT.md | Reglas obligatorias de desarrollo | Alta |

### E.4 Decisiones arquitectonicas (ADR)

| Documento | Ruta | Contenido | Prioridad |
|-----------|------|-----------|-----------|
| ADR-001 | docs/adr/ADR-001-contract-first-domain-boundaries.md | Contract-first y limites de dominio | Media |
| ADR-002 | docs/adr/ADR-002-offline-first-indexeddb-serwist.md | IndexedDB, Serwist y recuperacion | Media |
| ADR-003 | docs/adr/ADR-003-cermont-workflow-14-steps.md | Workflow documental de 14 pasos | Media |
| ADR-004 | docs/adr/ADR-004-evidence-blob-outbox.md | Evidencias y blob outbox | Media |
| ADR-005 | docs/adr/ADR-005-administrative-closure-state-machine.md | Cierre administrativo y estados | Media |

### E.5 Documentos operativos

| Documento | Ruta | Contenido | Prioridad |
|-----------|------|-----------|-----------|
| Deploy Guide | docs/deploy/PRODUCTION_DEPLOYMENT.md | Despliegue VPS con Docker, Nginx, HTTPS | Media |
| Deploy Checklist | docs/deploy-checklist.md | Checklist pre-despliegue | Media |
| Variables Entorno | docs/deploy/VARIABLES_ENTORNO.md | Variables requeridas y reglas de secretos | Media |
| PM2 VPS | docs/deploy/pm2-vps.md | Alternativa PM2 | Baja |

### E.6 Documentos offline

| Documento | Ruta | Contenido | Prioridad |
|-----------|------|-----------|-----------|
| Offline Scope | docs/offline-scope.md | Alcance real del modo offline | Media |
| Offline Module | docs/offline-online-module.md | Arquitectura del modulo offline | Media |
| Offline Test Plan | docs/offline-test-plan.md | Plan de pruebas offline | Media |
| Offline Limitations | docs/offline-known-limitations.md | Limitaciones conocidas | Media |

### E.7 Documentos de testing

| Documento | Ruta | Contenido | Prioridad |
|-----------|------|-----------|-----------|
| Testing Strategy | docs/implementation/TESTING_STRATEGY.md | Estrategia de testing | Media |
| Cost Engine Spec | docs/product/COST_ENGINE_SPEC.md | Especificacion del motor de costos | Media |
| Doc-Driven Forms Spec | docs/product/DOCUMENT_DRIVEN_FORMS_SPEC.md | Formularios desde documentos | Media |

### E.8 Archivos AGENTS.md (reglas por workspace)

| Archivo | Contenido | Prioridad |
|---------|-----------|-----------|
| backend/AGENTS.md | Reglas del backend (Express 5, Mongoose, Zod) | Alta |
| frontend/AGENTS.md | Reglas del frontend (Next.js 16, React 19, TanStack Query) | Alta |
| packages/AGENTS.md | Reglas de paquetes compartidos (SSOT, contract-first) | Alta |
| .github/copilot-instructions.md | Instrucciones para GitHub Copilot | Media |

### E.9 Archivos de configuracion del proyecto

| Archivo | Proposito |
|---------|-----------|
| package.json (raiz) | Workspaces npm: backend, frontend, packages/* |
| backend/package.json | @cermont/backend - Express 5, Mongoose |
| frontend/package.json | @cermont/frontend - Next.js 16, React 19 |
| packages/shared-types/package.json | @cermont/shared-types - Zod schemas |
| packages/domain/package.json | @cermont/domain - Roles, RBAC |
| packages/config/package.json | @cermont/config - Env validation |
| turbo.json | Turborepo pipeline configuration |
| biome.json | Biome linter/formatter config |
| .husky/pre-commit | Husky git hook |
| .lintstagedrc.json | lint-staged configuration |
| docker/docker-compose.yml | Docker compose for services |
| docker/Dockerfile.backend | Backend Docker image |
| docker/Dockerfile.frontend | Frontend Docker image |
| backend/.env.example | Backend env template |
| frontend/.env.local.example | Frontend env template |
| frontend/next.config.ts | Next.js config with Turbopack |
| frontend/proxy.ts | Security perimeter (NOT middleware.ts) |
| frontend/tsconfig.json | Frontend TypeScript strict config |
| backend/tsconfig.json | Backend TypeScript strict config |

---

## ANEXO F: Plan de Contingencia y Gestion de Riesgos

### F.1 Matriz de riesgos del proyecto

| ID | Riesgo | Probabilidad | Impacto | Severidad | Mitigacion | Plan de contingencia |
|----|--------|-------------|---------|-----------|------------|---------------------|
| R01 | Documentos fuente en .sisyphus/plans/ no existen en el repositorio | Alta | Medio | 🟡 Media | Usar docs/ canonicos como fuente de verdad | El plan ya se basa en codigo real, no en documentos ausentes |
| R02 | Endpoints asumidos como inexistentes en la v4 resultan existir | Alta | Alto | 🟠 Alta | Auditoria real del codigo antes de planificar | Este plan ya corrigio estos errores con evidencia de archivos |
| R03 | Cambios en stack tecnologico (Next.js 17, Express 6) | Baja | Alto | 🟠 Alta | Congelar versiones actuales en package.json | No actualizar hasta nueva validacion |
| R04 | Perdida de acceso al repositorio de GitHub | Baja | Alto | 🟠 Alta | Backup local del repositorio | Usar backup local, restaurar desde el ultimo commit conocido |
| R05 | Rotura de contracts:check por cambios en shared-types | Media | Medio | 🟡 Media | CI/CD con validacion automatica | Revertir cambio, corregir contrato, re-ejecutar |
| R06 | Tests pre-existentes fallan (no causados por nuestros cambios) | Media | Bajo | 🟢 Verde | Documentar, no corregir | Anotar en hallazgos, continuar |
| R07 | Dependencia npm requiere actualizacion de seguridad | Baja | Medio | 🟡 Media | Evaluar impacto, actualizar solo si necesario | Crear ticket separado, no mezclar con sprint actual |
| R08 | Bug en Express 5 o Next.js 16 descubierto durante implementacion | Baja | Alto | 🟠 Alta | Buscar workaround, reportar upstream | Congelar version, documentar workaround |
| R09 | Conflictos de merge entre sprints que modifican mismos archivos | Media | Medio | 🟡 Media | Comunicacion entre sprints, merge frecuente | Resolver conflictos manualmente, verificar integridad |
| R10 | Planning Wizard resulta demasiado complejo para un solo sprint | Media | Alto | 🟠 Alta | Dividir en sub-tickets, priorizar secciones core | Posponer secciones no criticas al siguiente sprint |
| R11 | Formularios CCTV/Lifelines requieren conocimiento de dominio no disponible | Alta | Medio | 🟡 Media | Usar documentos academicos como referencia | Implementar version basica, iterar con feedback del cliente |
| R12 | Pruebas E2E offline requieren simulacion de red compleja | Media | Medio | 🟡 Media | Usar Playwright para simular offline | Documentar limitaciones de la simulacion |
| R13 | Despliegue VPS falla por configuracion del servidor | Media | Alto | 🟠 Alta | Probar en entorno de staging primero | Tener documentado el procedimiento de rollback |
| R14 | Costos variables entre propuesta y ejecucion requieren mapping complejo | Media | Medio | 🟡 Media | Implementar mapping basico primero | Iterar con datos reales en siguiente sprint |

### F.2 Procedimiento de escalamiento

Si un riesgo se materializa y no se puede mitigar dentro del sprint:

1. **Detener** el trabajo en el ticket afectado
2. **Notificar** al lider tecnico / usuario
3. **Documentar** el problema con evidencias (logs, screenshots, mensajes de error)
4. **Evaluar** opciones:
   - Workaround temporal (posponer funcionalidad)
   - Cambio de enfoque (alternativa tecnica)
   - Escalamiento a equipo de platforma (si es bug del framework)
5. **Decidir** si continuar, posponer o cancelar el ticket
6. **Actualizar** el plan y la documentacion

### F.3 Plan de rollback por tipo de cambio

**Para cambios de codigo:**
`ash
git stash                       # Guardar cambios sin commit
git checkout -- .               # Revertir cambios no commiteados
git checkout deploy/vps-clean   # Volver al branch base
npm ci                          # Restaurar node_modules
npm run verify                  # Verificar que todo funciona
`

**Para cambios en base de datos:**
1. Detener la aplicacion
2. Restaurar backup de MongoDB (mongorestore)
3. Verificar integridad de datos
4. Re-iniciar la aplicacion

**Para cambios en infraestructura (VPS):**
1. Detener contenedores actuales
2. Restaurar contenedores anteriores (docker-compose)
3. Verificar health checks
4. Notificar a usuarios

### F.4 Criterios de rollback obligatorio

Ejecutar rollback inmediatamente si:

- Se detecta perdida de datos
- El sistema queda inaccesible por mas de 5 minutos
- Se rompe la integridad de los 14 pasos del flujo
- Se introducen vulnerabilidades de seguridad
- Los tests de regression fallan en mas del 10%
- El performance empeora en mas del 50%

---

## ANEXO G: Glosario CERMONT Completo

### G.1 Terminos de negocio

| Termino | Definicion | Contexto |
|---------|-----------|----------|
| Acta de entrega | Documento que formaliza la recepcion del servicio por parte del cliente | DeliveryRecord |
| Aprobacion PO | Aprobacion de la orden de compra por parte del cliente | PurchaseOrder |
| AST | Analisis de Seguridad en el Trabajo (Safety Analysis) | SafetyAnalysis |
| ATS | Analisis de Trabajo Seguro | SafetyAnalysis |
| Carga prestacional | Costos asociados a prestaciones sociales del personal | Cost |
| Cierre administrativo | Proceso de cierre financiero de un caso de servicio | Closure |
| Cliente | Entidad que contrata los servicios de CERMONT | Client |
| DIAN | Direccion de Impuestos y Aduanas Nacionales de Colombia | Dian |
| Ejecucion | Fase de realizacion del trabajo en campo | ExecutionSession |
| EPP | Elementos de Proteccion Personal | Kit/Planning |
| Evidencia | Registro fotografico o documento que prueba la ejecucion | Evidence |
| Factura | Documento fiscal que factura los servicios prestados | Invoice |
| Flota | Conjunto de vehiculos de la empresa | Fleet |
| HES | Health, Environment and Safety (Coordinador) | Roles |
| HSE | Health, Safety and Environment (sinonimo) | Roles |
| Informe tecnico | Documento que detalla los resultados del servicio | TechnicalReport |
| Kits tipicos | Conjuntos predefinidos de recursos para actividades comunes | Kit |
| Linea de vida | Sistema de seguridad para trabajo en alturas | Lifeline |
| Novedad de campo | Incidente u observacion durante la ejecucion | ExecutionSession |
| Planeacion | Fase de preparacion del trabajo | PlanningPacket |
| Propuesta | Oferta economica para la realizacion de un servicio | Proposal |
| PTW | Permiso de Trabajo (Permit to Work) | FieldPermit |
| SES | Service Entry Sheet / Hoja de entrada de servicios | ServiceEntrySheet |
| SGSST | Sistema de Gestion de Seguridad y Salud en el Trabajo | HSE |
| SLA | Service Level Agreement / Acuerdo de nivel de servicio | SLA |
| Solicitud | Peticion formal de servicio por parte del cliente | WorkRequest |
| Visita tecnica | Inspeccion inicial para evaluar el trabajo requerido | SiteVisit |

### G.2 Terminos tecnicos

| Termino | Definicion |
|---------|-----------|
| ADR | Architecture Decision Record - Registro de decision arquitectonica |
| API Mount | Registro de un router Express con un prefijo de ruta |
| AppError | Clase base de errores tipados del backend |
| Blocker | Condicion que impide avanzar en el flujo de 14 pasos |
| Contract-first | Paradigma donde los contratos (schemas) se definen antes que la implementacion |
| DLQ | Dead Letter Queue - Cola de mensajes fallidos para reintento |
| FSD | Feature-Sliced Design - Organizacion de modulos por funcionalidad |
| FSM | Field Service Management - Gestion de servicios de campo |
| Idempotency | Propiedad de una operacion de producir el mismo resultado aunque se ejecute varias veces |
| Lazy loading | Carga diferida de componentes para optimizar el bundle inicial |
| PWA | Progressive Web Application - Aplicacion web con capacidades nativas |
| RSC | React Server Component - Componente que se ejecuta en el servidor |
| RBAC | Role-Based Access Control - Control de acceso basado en roles |
| SSOT | Single Source of Truth - Fuente unica de verdad |
| TanStack Query | Libreria de gestion de estado servidor con caching y sincronizacion |
| Turbopack | Bundler de Rust para Next.js (alternativa a Webpack) |
| Vertical slice | Implementacion completa de una funcionalidad atravesando todas las capas |
| Zustand | Libreria de estado global para React (alternativa a Redux/Context) |

### G.3 Terminos de testing

| Termino | Definicion |
|---------|-----------|
| E2E | End-to-End test - Prueba que cubre el flujo completo (UI -> API -> DB) |
| Integration test | Prueba que verifica la interaccion entre modulos |
| Unit test | Prueba que verifica una funcion o componente de forma aislada |
| Smoke test | Prueba rapida que verifica que las funcionalidades principales funcionan |
| Regression test | Prueba que verifica que cambios nuevos no rompen funcionalidad existente |
| Visual regression | Comparacion automatizada de screenshots para detectar cambios visuales |
| Playwright | Framework de testing E2E multiplataforma |
| Vitest | Framework de testing unitario para Vite |

---

## ANEXO H: Plantillas de Tickets Detallados

### H.1 Plantilla de ticket funcional

`
ID: [Sprint].[Numero]
Sprint: [S0-S11]
Prioridad: [CRITICA/ALTA/MEDIA/BAJA]
Tipo: [feature/bug/refactor/test/docs/audit]
Ruta visible: [URL de la pagina afectada]

Problema:
[Descripcion del problema o requerimiento]

Causa raiz:
[Por que ocurre el problema - solo para bugs]

Impacto empresarial:
[Que impacto tiene en el negocio de CERMONT]

Archivos exactos a abrir:
- [Ruta absoluta al archivo 1]
- [Ruta absoluta al archivo 2]

Archivos exactos a modificar:
- [Ruta absoluta al archivo 1] - [Que cambiar]
- [Ruta absoluta al archivo 2] - [Que cambiar]

Contrato esperado:
[Schema Zod y tipos esperados]

Backend esperado:
[Endpoint, metodo, middleware, controller, service]

Frontend esperado:
[Componente, hook, query key, estado]

Validaciones de negocio:
[Reglas de dominio a aplicar]

RBAC:
[Roles con acceso]

Auditoria:
[Eventos de auditoria a registrar]

Offline:
[Comportamiento offline esperado]

Tests:
- [Test unitario a crear/actualizar]
- [Test E2E a crear/actualizar]

Comandos:
- npm run typecheck
- npm run lint
- npm run test
- npm run build
- npm run contracts:check

Criterio de aceptacion:
[Condiciones que debe cumplir el ticket para considerarse completo]

Que NO hacer:
[Acciones explicitamente prohibidas]

Evidencia requerida:
[Archivos de evidencia a generar en .sisyphus/evidence/]
`

### H.2 Ejemplo: Ticket S1.1 Planning Wizard

`
ID: S1.1
Sprint: S1
Prioridad: ALTA
Tipo: feature
Ruta visible: /planning-packet/new

Problema:
El formulario de creacion de planning packet actual es un CRUD estandar
sin las secciones necesarias para una planeacion profesional CERMONT.
Se requiere un wizard multi-seccion con 10 pasos.

Impacto empresarial:
Sin una planeacion completa, se olvidan materiales, herramientas,
EPP y personal necesario, causando retrasos y sobrecostos.

Archivos a crear:
- frontend/src/modules/planning/ui/PlanningWizard.tsx (NUEVO)
- frontend/src/modules/planning/ui/PlanningSections/ (NUEVO - 10 componentes)
- frontend/src/modules/planning/hooks/usePlanningWizard.ts (NUEVO)

Archivos a modificar:
- frontend/src/app/(dashboard)/planning-packet/new/page.tsx (ACTUALIZAR)
- packages/shared-types/src/schemas/planning-packet.schema.ts (ACTUALIZAR si necesario)
- backend/src/modules/planning-packet/planning-packet.service.ts (ACTUALIZAR si necesario)

Contrato esperado:
Mantener compatibilidad con el schema actual de planning-packet,
agregando campos opcionales para las nuevas secciones.

Backend esperado:
Los endpoints actuales de planning-packet ya soportan los datos necesarios.
Solo validacion adicional si se agregan campos.

Frontend esperado:
Wizard con 10 secciones navegables, progreso visible,
validacion por seccion, datos persistidos al final.

Validaciones de negocio:
- Unidad de negocio obligatoria
- Alcance minimo 10 caracteres
- Al menos un material o herramienta
- Firma de Ing. Residente obligatoria

RBAC:
Crear: gerente, residente, supervisor
Ver: todos los internos

Auditoria:
PLANNING_PACKET_CREATED

Tests:
- frontend/tests/e2e/planning-wizard.spec.ts (NUEVO)
- Actualizar tests existentes de planning-packet

Criterio de aceptacion:
1. Wizard con 10 secciones navegables via botones Anterior/Siguiente
2. Barra de progreso visible que muestra la seccion actual
3. Validacion de campos requeridos por seccion
4. No se puede avanzar sin completar seccion actual
5. Datos persisten al finalizar el wizard
6. Todos los campos del documento CERMONT estan cubiertos
7. Diseño responsive (funciona en movil de 375px)

Que NO hacer:
- No cambiar la API contract existente sin migracion
- No eliminar funcionalidad de planning existente
- No introducir dependencias nuevas
`

### H.3 Ejemplo: Ticket S2.1 Formulario CCTV

`
ID: S2.1
Sprint: S2
Prioridad: ALTA
Tipo: feature
Ruta visible: /inspection/cctv (NUEVA)

Problema:
No existe un formulario digital para mantenimiento CCTV.
Actualmente se usan formatos en papel o Excel.

Impacto empresarial:
La falta de digitalizacion causa perdida de informacion,
retrasos en informes y dificultad para hacer trazabilidad.

Archivos a crear:
- packages/shared-types/src/schemas/cctv.schema.ts (NUEVO)
- backend/src/modules/cctv/ (NUEVO - routes, controller, service, model)
- frontend/src/modules/cctv/ (NUEVO - api, hooks, ui)
- frontend/src/app/(dashboard)/inspection/cctv/page.tsx (NUEVO)

Contrato esperado:
Schema Zod completo con todos los campos CCTV:
- camera (numero, rutina, lugar, fecha, tipo, modelo, serial)
- structure (altura, distancia, altura-camara)
- encoder (modelo, serial)
- radio, antena, switch, conexiones
- electric-system (ac110v, fotovoltaico, caja-conexion, transferencia)
- gabinete, luces-obstruccion
- photos (antes/despues por componente)
- hallazgos, acciones-correctivas, observaciones

Backend esperado:
CRUD completo para inspecciones CCTV + generacion de informe.

Frontend esperado:
Formulario con campos agrupados por seccion,
upload de fotos por componente,
checklist de estado (Conforme/No Conforme/No Aplica),
generacion de informe.

Criterio de aceptacion:
1. Formulario completo con todos los campos del documento
2. Fotos por componente con previsualizacion
3. Checklist C/NC/NA con calculo automatico
4. Concepto final basado en resultados
5. Informe generado en PDF
`

---

## ANEXO I: Estrategia de Commits y Branching

### I.1 Convencion de branches

`
deploy/vps-clean           → Base branch (produccion)
implement/spec-[NUMERO]    → Feature branch por especificacion
fix/[descripcion]           → Bug fix branch
refactor/[descripcion]     → Refactor branch
`

### I.2 Convencion de commits

Usar Conventional Commits:

`
tipo(alcance): descripcion

tipos: feat, fix, refactor, test, docs, chore, audit
alcance: planning, cctv, costs, dashboard, offline, etc.

Ejemplos:
feat(planning): add multi-section wizard with readiness gate
fix(cctv): correct form validation for required photos
test(costs): add E2E for proposal vs actual comparison
docs(sprint-0): add evidence documentation for baseline audit
`

### I.3 Politica de commits

- Commits atomicos (un cambio logico por commit)
- Mensajes en ingles
- Incluir referencia al ticket (ej: S1.1)
- NO commits con codigo roto (typecheck debe pasar)
- NO commits sin evidencia (screenshots, logs)

---

## ANEXO J: Metricas de Exito del Plan v5

### J.1 KPIs del plan

| KPI | Target | Medicion |
|-----|--------|----------|
| Lineas del plan | 4,000 - 8,000 | Conteo de lineas del archivo |
| Sprints definidos | 12 | Conteo de sprints |
| Tickets detallados | 50+ | Conteo de tickets |
| Paginas auditadas | 94+ | Conteo de rutas en inventario |
| Modulos backend cubiertos | 59 | Conteo de modulos auditados |
| Hallazgos de codigo | 10+ | Conteo en seccion 2.6 |
| Brechas funcionales | 10+ | Conteo en resumen |
| Archivos de evidencia | Por sprint | Conteo en .sisyphus/evidence/ |

### J.2 KPIs de ejecucion por sprint

| KPI | Target | Medicion |
|-----|--------|----------|
| Tickets completados | 100% del sprint | Conteo de tickets Done |
| Evidencia generada | 12+ archivos por sprint | Conteo en .sisyphus/evidence/ |
| Gates de calidad | Todos pasan | typecheck, lint, test, build, contracts:check |
| Sin any/unknown/null | 0 introducidos | grep 'as any|as unknown|null' |
| Screenshots antes/despues | Por pagina afectada | Conteo de archivos PNG |
| Network logs | Sin 404s/500s | Conteo de errores en logs |
| Console logs | Sin errores | Conteo de errores en logs |

---

## FIN DEL DOCUMENTO

### Ultima actualizacion: 2026-07-07 22:55 COT
### Version: 5.0
### Autor: Sisyphus - Arquitecto Principal Fullstack
### Repositorio: https://github.com/JuanDiego30/cermont_aplicativo.git
### Rama base: deploy/vps-clean
---continued---

## ANEXO N: Especificacion Detallada de Modulos Backend por Sprint

### N.1 Modulo Planning Packet (Sprint 1)

#### Estado actual de planning-packet.routes.ts

11 endpoints ya implementados:
- GET /api/planning-packets - Listar con filtros
- POST /api/planning-packets - Crear packet
- GET /api/planning-packets/:id - Obtener detalle
- PATCH /api/planning-packets/:id - Actualizar
- POST /:id/validate-readiness - Validar readiness
- POST /:id/apply-kit - Aplicar kit tipico
- POST /:id/approve - Aprobar planeacion
- POST /:id/reopen - Reabrir planeacion
- GET /suggest-kit - Sugerir kit segun actividad
- POST /:id/reference-documents - Agregar documento referencia
- GET /:id/reference-documents - Listar documentos referencia

#### Cambios requeridos en Sprint 1

**planning-packet.service.ts** - Agregar metodos:
- createWithWizard(data: PlanningWizardData) - Crear desde wizard 10 secciones
- getWizardProgress(id: string) - Obtener progreso del wizard
- validateSection(section: number, data: unknown) - Validar seccion individual
- getReadinessSummary(id: string) - Obtener resumen de readiness

**planning-packet.model.ts** - Agregar schema para wizardData:
- wizardData.general: responsable, lugar, fecha, unidadNegocio
- wizardData.alcance: descripcion, objetivos, actividades
- wizardData.materiales: items con descripcion y cantidad
- wizardData.herramientas: items con descripcion y cantidad
- wizardData.equipos: items con descripcion y cantidad
- wizardData.epp: items con descripcion, cantidad, certificacion
- wizardData.personal: electricistas, tecnicosTelecom, instrumentistas, obreros
- wizardData.firmas: array con rol, nombre, fecha, firma
- wizardProgress: seccionesCompletadas, seccionesFaltantes, ready

### N.2 Modulo CCTV (Sprint 2 - NUEVO)

#### Estructura propuesta del modulo

`
backend/src/modules/cctv/
  cctv.routes.ts       - 10 endpoints REST
  cctv.controller.ts   - Capa HTTP delgada
  cctv.service.ts      - Logica de negocio
  cctv.model.ts        - Schema Mongoose
  cctv.types.ts        - Tipos TypeScript
  cctv.validation.ts   - Validacion Zod
`

#### Endpoints propuestos

GET /api/cctv - Listar inspecciones CCTV (paginado, filtros)
POST /api/cctv - Crear nueva inspeccion
GET /api/cctv/:id - Obtener inspeccion por ID
PATCH /api/cctv/:id - Actualizar inspeccion
DELETE /api/cctv/:id - Eliminar inspeccion
POST /api/cctv/:id/submit - Enviar inspeccion (calcular concepto)
GET /api/cctv/:id/report - Generar informe PDF
POST /api/cctv/:id/photos - Subir foto
DELETE /api/cctv/:id/photos/:photoId - Eliminar foto
GET /api/cctv/stats - Estadisticas CCTV

#### Reglas de negocio CCTV

- Calcular concepto automaticamente al submit:
  * Si hay hallazgos CRITICOS -> NO_APROBADO
  * Si hay hallazgos MEDIOS/LEVES -> APROBADO_CON_OBS
  * Sin hallazgos -> APROBADO
- Validar fotos requeridas: cada componente necesita foto ANTES y DESPUES
- Generar folio unico automatico: CCTV-YYYY-MM-XXXX
- La firma del tecnico es obligatoria para submit
- Auditoria en creacion y submit

### N.3 Modulo Lifeline (Sprint 2 - NUEVO)

#### Estructura propuesta del modulo

`
backend/src/modules/lifeline/
  lifeline.routes.ts      - 9 endpoints REST
  lifeline.controller.ts  - Capa HTTP
  lifeline.service.ts     - Logica de negocio
  lifeline.model.ts       - Schema Mongoose
  lifeline.types.ts       - Tipos
  lifeline.validation.ts  - Validacion Zod
`

#### Endpoints propuestos

GET /api/lifelines - Listar inspecciones
POST /api/lifelines - Crear inspeccion
GET /api/lifelines/:id - Obtener inspeccion
PATCH /api/lifelines/:id - Actualizar
DELETE /api/lifelines/:id - Eliminar
POST /api/lifelines/:id/submit - Enviar (calcular concepto)
GET /api/lifelines/:id/report - Generar informe
POST /api/lifelines/:id/photos - Subir foto
GET /api/lifelines/stats - Estadisticas

#### Reglas de negocio Lifeline

- 8 componentes obligatorios con checklist C/NC/NA
- Si hay NC en componentes criticos (anclajes, cable, placa ID) -> NO_APROBADO
- Si hay NC en componentes no criticos -> APROBADO_CON_OBSERVACIONES
- Sin NC -> APROBADO
- Cada componente requiere al menos 1 foto
- La placa de identificacion requiere foto legible
- Hoja de vida obligatoria (fecha instalacion, ultimo mantenimiento)
- Auditoria en creacion y submit

---
### N.4 Modulo Cost Intelligence (Sprint 5 - Actualizar)

#### Cambios requeridos en cost.service.ts

Nuevos metodos:
- getBaselineFromProposal(orderId) - Linea base desde propuesta
- getActualFromExecution(orderId) - Costos reales desde ejecucion
- calculateVariance(orderId) - Variance total por categoria
- calculateProfitability(orderId) - Rentabilidad de la orden
- getCostAlerts(orderId) - Alertas de sobrecosto
- getProfitabilityDashboard(filters) - Dashboard de rentabilidad

#### Nuevos tipos

`	ypescript
interface CostVariance {
  categories: {
    materials: VarianceEntry;
    labor: VarianceEntry;
    tools: VarianceEntry;
    equipment: VarianceEntry;
    transport: VarianceEntry;
    taxes: VarianceEntry;
    overhead: VarianceEntry;
  };
  total: VarianceEntry;
}

interface VarianceEntry {
  estimated: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

interface CostProfitability {
  orderId: string;
  orderCode: string;
  revenue: number;
  totalCost: number;
  grossMargin: number;
  grossMarginPercent: number;
  profitMargin: number;
  profitMarginPercent: number;
  riskLevel: 'GREEN' | 'YELLOW' | 'RED';
}
`

### N.5 Modulo Dashboard KPIs (Sprint 6 - Actualizar)

#### Nuevos endpoints

GET /api/dashboard/step-kpis - KPIs por paso del flujo
GET /api/dashboard/role-alerts - Alertas especificas por rol
GET /api/dashboard/executive - Widgets ejecutivos

#### Tipos de respuesta

`	ypescript
interface StepKpi {
  stepNumber: number;
  stepKey: string;
  stepLabel: string;
  activeCount: number;
  averageDays: number;
  maxDays: number;
  isBottleneck: boolean;
}

interface RoleAlertGroup {
  role: string;
  alerts: Array<{
    type: string;
    count: number;
    label: string;
    route: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
}

interface ExecutiveWidget {
  id: string;
  type: 'OVERCOST' | 'EXPIRED_DOCS' | 'PENDING_SYNC' | 'UPCOMING_MAINT';
  label: string;
  value: number;
  details: string;
  route: string;
}
`

### N.6 Modulo Billing Pipeline (Sprint 8 - Actualizar)

#### Nuevos endpoints

GET /api/billing/pipeline/:orderId - Timeline completo del pipeline
GET /api/billing/alerts - Alertas de retraso en billing
GET /api/billing/ar-dashboard - Dashboard cuentas por cobrar
GET /api/billing/aging-report - Reporte de envejecimiento

#### Tipos de respuesta

`	ypescript
interface BillingPipelineStep {
  step: 'ses' | 'invoice' | 'payment';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  entityId: string;
  entityCode: string;
  createdAt: string;
  completedAt?: string;
  daysInStep: number;
  blockedBy?: string[];
}

interface AgingReport {
  totalOutstanding: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90plus: number;
  topDelinquent: Array<{
    clientName: string;
    amount: number;
    daysOverdue: number;
  }>;
}
`

---

## ANEXO O: Especificacion de Componentes Frontend por Sprint

### O.1 PlanningWizard (Sprint 1)

#### Arbol de componentes

`
PlanningWizard
  SectionProgressBar
    - Lista de 10 secciones con icono y estado
    - Click para navegar (solo si completada o actual)
  SectionContent
    - Renderiza la seccion actual segun indice
  NavigationButtons
    - Anterior (oculto en seccion 0)
    - Siguiente (oculto en seccion 9, cambia a Guardar)
    - Guardar borrador
  SectionValidator
    - Validacion en tiempo real
    - Tooltip con errores
  WizardSummary (al finalizar)
    - Resumen de todas las secciones
    - Boton de editar por seccion
    - Boton de confirmar
  ReadinessGate
    - Progreso general (X/10)
    - Lista de secciones completadas/faltantes
    - Estado de readiness
    - Aprobacion con firma
`

#### Hook: usePlanningWizard

`	ypescript
function usePlanningWizard(opts: {
  initialData?: PlanningWizardData;
  packetId?: string;
}) {
  return {
    // Estado
    currentSection: number;
    sections: SectionState[];
    data: PlanningWizardData;
    errors: Record<string, string[]>;
    isValid: boolean;
    isDirty: boolean;
    isSaving: boolean;
    
    // Acciones
    goToSection: (idx: number) => void;
    nextSection: () => Promise<boolean>;
    prevSection: () => void;
    updateSection: (sectionIdx: number, data: object) => void;
    saveDraft: () => Promise<void>;
    submit: () => Promise<{ packetId: string }>;
    applyKit: (kitId: string) => Promise<void>;
  };
}
`

### O.2 CctvForm (Sprint 2)

#### Arbol de componentes

`
CctvForm
  CctvGeneralSection
    - Fecha, cliente, ubicacion, tecnico
  CctvCameraSection
    - Numero, rutina, lugar, tipo, modelo, serial, altura
  CctvConnectionsSection
    - Distancias, encoder, POE, radio, antena, switch
  CctvElectricalSection
    - AC110V, fotovoltaico, caja conexion, transferencia, gabinete, luces
  CctvFindingsSection
    - Lista de hallazgos con tipo, descripcion, accion
  CctvPhotoGallery
    - Grid de fotos por componente
    - Upload con preview
    - Categorizacion (ANTES/DESPUES/HALLAZGO)
  CctvSummarySection
    - Resumen de todos los datos
    - Concepto calculado
    - Firmas
`

### O.3 LifelineForm (Sprint 2)

#### Arbol de componentes

`
LifelineForm
  LifelineLifeHistory
    - Fecha instalacion, ultimo mantenimiento, proveedor
  LifelineChecklist
    - 8 componentes con checklist C/NC/NA
    - Cada item expandible con detalles
  LifelinePhotoGrid
    - Fotos por componente
    - Upload con arrastrar y soltar
  LifelineResults
    - Resumen de conformidad
    - Concepto calculado
    - Fecha proximo mantenimiento
  LifelineSignatures
    - Firma del inspector
    - Firma del supervisor
`

### O.4 Dashboard KPI Widgets (Sprint 6)

#### Componentes nuevos

`	ypescript
// StepKpiTimeline - Timeline de los 14 pasos con KPIs
interface StepKpiTimelineProps {
  steps: StepKpi[];
  onStepClick?: (stepNumber: number) => void;
}

// RoleAlertPanel - Panel de alertas por rol
interface RoleAlertPanelProps {
  alerts: RoleAlertGroup[];
  userRole: string;
}

// ExecutiveWidgetGrid - Grid de widgets ejecutivos
interface ExecutiveWidgetGridProps {
  widgets: ExecutiveWidget[];
  onWidgetClick?: (widgetId: string) => void;
}

// BottleneckIndicator - Indicador de cuello de botella
interface BottleneckIndicatorProps {
  steps: StepKpi[];
}
`

### O.5 BillingPipeline (Sprint 8)

#### Componentes nuevos

`	ypescript
// PipelineTimeline - Timeline visual SES -> Invoice -> Payment
interface PipelineTimelineProps {
  pipeline: BillingPipelineStep[];
  onStepClick?: (step: BillingPipelineStep) => void;
}

// ARDashboard - Dashboard cuentas por cobrar
interface ARDashboardProps {
  agingReport: AgingReport;
  onExport?: (format: 'csv' | 'pdf') => void;
  onFilterChange?: (filters: ARFilters) => void;
}

// AgingBarChart - Grafico de envejecimiento
interface AgingBarChartProps {
  data: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days90plus: number;
  };
}
`

---

## ANEXO P: Esquemas de Base de Datos (Mongoose)

### P.1 Planning Packet extendido (Sprint 1)

`javascript
const PlanningPacketSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  wizardData: {
    general: {
      responsable: String,
      lugar: String,
      fecha: Date,
      unidadNegocio: {
        type: String,
        enum: ['IT', 'MNT', 'SC', 'GEN', 'OTROS']
      }
    },
    alcance: {
      descripcion: { type: String, required: true },
      objetivos: [String],
      actividades: [String]
    },
    materiales: [{
      descripcion: { type: String, required: true },
      cantidad: { type: Number, required: true, min: 1 },
      unidad: String,
      observaciones: String
    }],
    herramientas: [{
      descripcion: { type: String, required: true },
      cantidad: { type: Number, required: true, min: 1 },
      observaciones: String
    }],
    equipos: [{
      descripcion: { type: String, required: true },
      cantidad: { type: Number, required: true, min: 1 },
      observaciones: String
    }],
    epp: [{
      descripcion: { type: String, required: true },
      cantidad: { type: Number, required: true, min: 1 },
      certificacion: String,
      fechaVencimiento: Date
    }],
    personal: {
      electricistas: { type: Number, default: 0 },
      tecnicosTelecom: { type: Number, default: 0 },
      instrumentistas: { type: Number, default: 0 },
      obreros: { type: Number, default: 0 }
    },
    firmas: [{
      rol: {
        type: String,
        enum: ['ING_RESIDENTE', 'TECNICO_ELECTRICISTA', 'HES']
      },
      nombre: { type: String, required: true },
      fecha: { type: Date, default: Date.now },
      firma: { type: String, required: true }
    }]
  },
  wizardProgress: {
    seccionesCompletadas: { type: Number, default: 0 },
    seccionesFaltantes: [String],
    ready: { type: Boolean, default: false }
  },
  kitAplicado: { type: Schema.Types.ObjectId, ref: 'Kit' },
  documentosReferencia: [{
    tipo: {
      type: String,
      enum: ['ATS', 'AST', 'PTW', 'PROCEDIMIENTO', 'OTRO']
    },
    titulo: String,
    archivoId: { type: Schema.Types.ObjectId, ref: 'FileAsset' },
    observaciones: String
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
`

### P.2 CCTV Inspection (Sprint 2 - NUEVO)

`javascript
const CctvInspectionSchema = new Schema({
  folio: { type: String, unique: true },
  fecha: { type: Date, required: true },
  clienteId: { type: Schema.Types.ObjectId, ref: 'Client' },
  ubicacion: String,
  tecnicoId: { type: Schema.Types.ObjectId, ref: 'User' },
  
  camara: {
    numero: Number,
    rutina: String,
    lugar: String,
    tipo: {
      type: String,
      enum: ['FIJA', 'PTZ', 'DOME', 'BULLET', 'OTRO']
    },
    modelo: String,
    serial: String,
    altura: Number
  },
  
  conexiones: {
    distanciaCamaraCaja: Number,
    alturaCamara: Number,
    encoder: { modelo: String, serial: String },
    poe: { modelo: String, serial: String },
    radio: { modelo: String, serial: String, frecuencia: String },
    antena: { tipo: String, modelo: String },
    switch: { modelo: String, puertos: Number },
    conexionRemota: String,
    conexionMaster: String
  },
  
  sistemaElectrico: {
    alimentacionAC110V: Boolean,
    sistemaFotovoltaico: Boolean,
    cajaConexion: {
      estado: { type: String, enum: ['C', 'NC', 'NA'] },
      observacion: String
    },
    transferenciaAutomatica: { type: Boolean, default: false },
    gabineteBaseTorre: {
      estado: { type: String, enum: ['C', 'NC', 'NA'] },
      observacion: String
    },
    lucesObstruccion: {
      estado: { type: String, enum: ['C', 'NC', 'NA'] },
      observacion: String
    }
  },
  
  hallazgos: [{
    componente: String,
    descripcion: { type: String, required: true },
    tipo: { type: String, enum: ['CRITICO', 'MEDIO', 'LEVE'] },
    accionCorrectiva: String,
    plazo: String
  }],
  
  fotos: [{
    componente: String,
    tipo: { type: String, enum: ['ANTES', 'DESPUES', 'HALLAZGO'] },
    archivoId: { type: Schema.Types.ObjectId, ref: 'FileAsset' },
    descripcion: String
  }],
  
  concepto: {
    type: String,
    enum: ['APROBADO', 'APROBADO_CON_OBS', 'NO_APROBADO']
  },
  observaciones: String,
  estado: {
    type: String,
    enum: ['DRAFT', 'COMPLETED'],
    default: 'DRAFT'
  },
  firmaTecnico: String,
  firmaSupervisor: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
`

### P.3 Lifeline Inspection (Sprint 2 - NUEVO)

`javascript
const LifelineInspectionSchema = new Schema({
  folio: { type: String, unique: true },
  fecha: { type: Date, required: true },
  clienteId: { type: Schema.Types.ObjectId, ref: 'Client' },
  ubicacion: String,
  inspectorId: { type: Schema.Types.ObjectId, ref: 'User' },
  
  hojaDeVida: {
    fechaInstalacion: Date,
    ultimoMantenimiento: Date,
    proveedor: String,
    marca: String,
    modelo: String,
    capacidad: Number
  },
  
  componentes: [{
    nombre: { type: String, required: true },
    orden: { type: Number, required: true },
    estado: { type: String, enum: ['C', 'NC', 'NA'] },
    condicion: String,
    tipoAfeccion: String,
    hallazgo: String,
    accionCorrectiva: String,
    observacion: String,
    fotos: [{ type: Schema.Types.ObjectId, ref: 'FileAsset' }]
  }],
  
  // 8 componentes obligatorios:
  // 1. Placa de anclaje superior
  // 2. Platinas de sujecion
  // 3. Absorbedor de energia
  // 4. Sistema tensor
  // 5. Cable en acero inoxidable
  // 6. Soporte cable guia
  // 7. Placa de anclaje inferior
  // 8. Placa de identificacion e inspeccion
  
  concepto: {
    type: String,
    enum: ['APROBADO', 'NO_APROBADO', 'APROBADO_CON_OBSERVACIONES']
  },
  estado: {
    type: String,
    enum: ['DRAFT', 'COMPLETED'],
    default: 'DRAFT'
  },
  firmaInspector: String,
  firmaSupervisor: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
`

---

## ANEXO Q: Plan de Migracion de Datos

### Q.1 Seeds requeridos

| Sprint | Seed | Datos |
|--------|------|-------|
| S1 | kits-cctv.ts | Kit CCTV con 15 items tipicos |
| S1 | kits-lifeline.ts | Kit Lifeline con 10 items tipicos |
| S1 | kits-sgsst.ts | Kit SGSST con 20 items de EPP |
| S1 | kits-anchorage.ts | Kit Anclaje con 8 items |
| S1 | kits-general.ts | Kit General con 30 items de herramientas |
| S2 | cctv-catalog.ts | Catalogos de tipos de camara, modelos |
| S2 | lifeline-catalog.ts | Catalogos de componentes lifeline |

### Q.2 Formato de seed

`javascript
// seeds/kits-cctv.ts
export const CCTV_KIT = {
  name: 'Kit Mantenimiento CCTV',
  description: 'Kit tipico para mantenimiento preventivo CCTV',
  activityType: 'CCTV',
  category: 'electronics',
  isActive: true,
  items: [
    {
      type: 'tool',
      name: 'Multimetro digital',
      description: 'Para medicion de voltaje y continuidad',
      quantity: 1,
      unit: 'unidad',
      isCritical: true
    },
    {
      type: 'tool',
      name: 'Juego de destornilladores',
      description: 'Precision para electronica',
      quantity: 1,
      unit: 'juego',
      isCritical: false
    },
    {
      type: 'tool',
      name: 'Camara termografica',
      description: 'Para deteccion de puntos calientes',
      quantity: 1,
      unit: 'unidad',
      isCritical: true
    },
    {
      type: 'material',
      name: 'Conectores RJ45',
      description: 'Conectores para cable de red',
      quantity: 20,
      unit: 'unidad',
      isCritical: false
    },
    {
      type: 'material',
      name: 'Cable UTP Cat6',
      description: 'Cable de red para conexiones',
      quantity: 50,
      unit: 'metros',
      isCritical: false
    },
    {
      type: 'epp',
      name: 'Arnés de seguridad',
      description: 'Para trabajos en altura',
      quantity: 2,
      unit: 'unidad',
      isCritical: true
    },
    {
      type: 'epp',
      name: 'Casco de seguridad',
      description: 'Proteccion para la cabeza',
      quantity: 2,
      unit: 'unidad',
      isCritical: true
    },
    {
      type: 'equipment',
      name: 'Andamio movil',
      description: 'Para acceso a alturas',
      quantity: 1,
      unit: 'unidad',
      isCritical: false
    }
  ],
  requiredCertifications: ['Trabajo en alturas', 'Instalacion CCTV'],
  requiredDocuments: ['ATS CCTV', 'PTW alturas'],
  readinessRules: [
    {
      check: 'certifications',
      description: 'Tecnico certificado en trabajo en alturas',
      isCritical: true
    },
    {
      check: 'tools',
      description: 'Multimetro funcional y calibrado',
      isCritical: true
    }
  ]
};
`

---

## FIN DEL DOCUMENTO (ANEXOS N-Q)

### Ultima actualizacion: 2026-07-07 22:55 COT
### Version: 5.0
### Total de lineas: ~4000+

---

## ANEXO R: Matriz de Responsabilidades por Sprint

### R.1 Roles del equipo

| Rol | Responsabilidad | Sprints involucrados |
|-----|----------------|---------------------|
| Arquitecto Fullstack | Diseno de solucion, revision de arquitectura | S0-S11 |
| Desarrollador Backend | Implementacion de modulos backend, endpoints, servicios | S1-S9 |
| Desarrollador Frontend | Implementacion de UI, componentes, hooks, estados | S1-S9 |
| QA Engineer | Tests E2E, unitarios, de integracion, regresion | S0, S10 |
| DevOps | Despliegue VPS, Docker, CI/CD, monitoreo | S11 |
| Product Owner | Validacion de funcionalidad, priorizacion | S0-S11 |

### R.2 Matriz RACI por sprint

| Actividad | Arquitecto | Backend | Frontend | QA | DevOps |
|-----------|-----------|---------|----------|-----|--------|
| S0 - Auditoria linea base | R | C | C | I | - |
| S1 - Planning Wizard | A | R | R | C | - |
| S2 - Formularios CCTV/Lifelines | A | R | R | C | - |
| S3 - Offline execution | A | R | R | C | - |
| S4 - Reports/Acts | A | R | R | C | - |
| S5 - Cost intelligence | A | R | R | C | - |
| S6 - Dashboard KPIs | A | R | R | C | - |
| S7 - Fleet/Assets/Inventory | A | R | R | C | - |
| S8 - Billing pipeline | A | R | R | C | - |
| S9 - Portal/Admin | A | R | R | C | - |
| S10 - Hardening E2E | C | C | C | R | - |
| S11 - VPS Deploy | A | C | C | I | R |

R = Responsable, A = Aprueba, C = Consultado, I = Informado

---

## ANEXO S: Estimacion de Esfuerzo Detallada por Ticket

### S.1 Sprint 0 - Baseline

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S0.1 | Inventory rutas frontend | Arquitecto | 4 |
| S0.2 | Verificar API_MOUNTS | Arquitecto | 4 |
| S0.3 | Screenshots 94 paginas | QA | 16 |
| S0.4 | Network logs 94 paginas | QA | 16 |
| S0.5 | Console logs 94 paginas | QA | 8 |
| S0.6 | Verificar tests | QA | 4 |
| S0.7 | Gates de calidad | QA | 4 |
| S0.8 | Documentar hallazgos | Arquitecto | 4 |
| **Total S0** | | | **60 horas** |

### S.2 Sprint 1 - Planning Wizard + Kits

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S1.1 | Planning Wizard 10 secciones | Frontend | 40 |
| S1.2 | Seeds kits CERMONT (5 kits) | Backend | 16 |
| S1.3 | Readiness Gate visual | Frontend | 8 |
| S1.4 | Firmas en planning | Frontend | 4 |
| S1.5 | Docs referencia | Frontend | 4 |
| S1.6 | Tests E2E wizard | QA | 16 |
| **Total S1** | | | **88 horas** |

### S.3 Sprint 2 - Dynamic Forms

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S2.1 | Formulario CCTV completo | Backend+Frontend | 40 |
| S2.2 | Formulario Lifeline | Backend+Frontend | 32 |
| S2.3 | Checklist HSE | Backend+Frontend | 16 |
| S2.4 | Tests formularios | QA | 16 |
| **Total S2** | | | **104 horas** |

### S.4 Sprint 3 - Offline Execution

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S3.1 | Sesion offline completa | Frontend | 32 |
| S3.2 | Evidencias offline | Frontend | 24 |
| S3.3 | Sync y conflictos | Backend | 16 |
| S3.4 | Tests E2E offline | QA | 16 |
| **Total S3** | | | **88 horas** |

### S.5 Sprint 4 - Reports + Delivery

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S4.1 | Informe tecnico automatico | Backend+Frontend | 24 |
| S4.2 | Template CERMONT | Frontend | 16 |
| S4.3 | Acta de entrega profesional | Backend+Frontend | 16 |
| S4.4 | Tests informes | QA | 8 |
| **Total S4** | | | **64 horas** |

### S.6 Sprint 5 - Cost Intelligence

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S5.1 | Linea base desde propuesta | Backend | 12 |
| S5.2 | Costo real desde ejecucion | Backend+Frontend | 16 |
| S5.3 | Comparativa variance/margen | Backend+Frontend | 16 |
| S5.4 | Alertas sobrecosto | Backend | 8 |
| S5.5 | Dashboard rentabilidad | Frontend | 16 |
| S5.6 | Tests costos | QA | 8 |
| **Total S5** | | | **76 horas** |

### S.7 Sprint 6 - Dashboard KPIs

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S6.1 | KPIs por paso del flujo | Backend+Frontend | 16 |
| S6.2 | Alertas por rol | Backend+Frontend | 12 |
| S6.3 | Widgets ejecutivos | Backend+Frontend | 16 |
| S6.4 | Tests dashboard | QA | 8 |
| **Total S6** | | | **52 horas** |

### S.8 Sprint 7 - Fleet/Assets/Inventory

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S7.1 | Integracion Fleet→Planning | Backend+Frontend | 16 |
| S7.2 | Integracion Inventory→Planning | Backend+Frontend | 16 |
| S7.3 | Dashboard mantenimiento | Frontend | 12 |
| S7.4 | Dispatch mejorado | Backend+Frontend | 12 |
| S7.5 | Tests integraciones | QA | 8 |
| **Total S7** | | | **64 horas** |

### S.9 Sprint 8 - Billing Pipeline

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S8.1 | Timeline visual pipeline | Frontend | 16 |
| S8.2 | Alertas de retraso | Backend | 8 |
| S8.3 | Bloqueos de cierre | Backend | 8 |
| S8.4 | Dashboard cuentas por cobrar | Frontend | 16 |
| S8.5 | Tests pipeline | QA | 8 |
| **Total S8** | | | **56 horas** |

### S.10 Sprint 9 - Portal + Admin

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S9.1 | Portal cliente mejorado | Backend+Frontend | 32 |
| S9.2 | Backups automaticos | Backend | 16 |
| S9.3 | Auditoria mejorada | Backend+Frontend | 16 |
| S9.4 | Tests portal | QA | 8 |
| **Total S9** | | | **72 horas** |

### S.11 Sprint 10 - Hardening

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S10.1 | E2E 14 pasos datos realistas | QA | 32 |
| S10.2 | Security tests | QA | 16 |
| S10.3 | Performance tests | QA | 8 |
| S10.4 | Regresion visual | QA | 8 |
| **Total S10** | | | **64 horas** |

### S.12 Sprint 11 - VPS Deploy

| Ticket | Descripcion | Rol | Horas |
|--------|-------------|-----|-------|
| S11.1 | Despliegue VPS | DevOps | 24 |
| S11.2 | Documentacion final | Arquitecto | 16 |
| S11.3 | Monitoreo | DevOps | 8 |
| **Total S11** | | | **48 horas** |

### S.13 Resumen total de esfuerzo

| Sprint | Horas | Dias (8h) | Semanas |
|--------|-------|-----------|---------|
| S0 | 60 | 7.5 | 1.5 |
| S1 | 88 | 11.0 | 2.2 |
| S2 | 104 | 13.0 | 2.6 |
| S3 | 88 | 11.0 | 2.2 |
| S4 | 64 | 8.0 | 1.6 |
| S5 | 76 | 9.5 | 1.9 |
| S6 | 52 | 6.5 | 1.3 |
| S7 | 64 | 8.0 | 1.6 |
| S8 | 56 | 7.0 | 1.4 |
| S9 | 72 | 9.0 | 1.8 |
| S10 | 64 | 8.0 | 1.6 |
| S11 | 48 | 6.0 | 1.2 |
| **Total** | **836** | **104.5** | **20.9** |

**Nota:** S1, S2, S3, S7 y S9 pueden ejecutarse en paralelo despues de S0, reduciendo el tiempo total de calendario de 21 semanas a ~10-12 semanas.

---

## ANEXO T: Checklist de Calidad Pre-Entrega

### T.1 Checklist de calidad de codigo

- [ ] Todos los archivos nuevos siguen la estructura Feature-Sliced Design
- [ ] Todos los schemas Zod estan en shared-types (no locales)
- [ ] Todos los roles se importan de @cermont/domain
- [ ] Ningun archivo contiene 'any', 'unknown', 'null', 'undefined' explicito
- [ ] Ningun archivo contiene 'console.log' o 'debugger'
- [ ] Ningun archivo contiene '@ts-ignore' o '@ts-expect-error'
- [ ] Ningun controller tiene try/catch (Express 5)
- [ ] Ningun componente tiene fetch directo (usa apiClient)
- [ ] Ningun componente tiene useEffect para data fetching (usa TanStack Query)
- [ ] Todos los endpoints siguen el patron authenticate -> authorize -> validate -> controller
- [ ] Todas las mutaciones criticas tienen auditoria
- [ ] Todas las rutas nuevas estan documentadas en FRONTEND_ROUTE_MAP.md

### T.2 Checklist de UI/UX

- [ ] Todas las paginas nuevas tienen loading state (skeleton/spinner)
- [ ] Todas las paginas nuevas tienen error state (mensaje + retry)
- [ ] Todas las paginas nuevas tienen empty state (ilustracion + CTA)
- [ ] Las paginas de campo tienen offline state (banner + cola)
- [ ] Las paginas con RBAC tienen forbidden state
- [ ] Diseño responsive desde 375px
- [ ] Touch targets >= 44px
- [ ] Sin desbordamiento horizontal
- [ ] Labels visibles en todos los inputs
- [ ] Focus visible en todos los elementos interactivos
- [ ] Navegacion por teclado funcional

### T.3 Checklist de testing

- [ ] Tests unitarios para servicios nuevos
- [ ] Tests de integracion para endpoints nuevos
- [ ] Tests E2E para flujos criticos nuevos
- [ ] Tests de contrato ejecutados (contracts:check)
- [ ] Tests de regresion ejecutados (npm run test)
- [ ] Cobertura minima de 70% en modulos nuevos

### T.4 Checklist de documentacion

- [ ] README actualizado con nuevas rutas
- [ ] FRONTEND_ROUTE_MAP actualizado
- [ ] API_ENDPOINT_MATRIX actualizado
- [ ] Evidencia generada en .sisyphus/evidence/v5/sprint-XX/
- [ ] Commits con mensajes semanticos (Conventional Commits)

---

## ANEXO U: Referencia Rapida de Comandos

### U.1 Comandos de desarrollo

`powershell
# Iniciar backend + frontend
npm run dev

# Iniciar solo backend
npm run dev -w backend

# Iniciar solo frontend
npm run dev -w frontend
`

### U.2 Comandos de calidad

`powershell
# Typecheck completo
npm run typecheck

# Lint completo
npm run lint

# Tests completos
npm run test

# Build completo
npm run build

# Verify (typecheck + build)
npm run verify

# Calidad CI (typecheck + lint)
npm run ci:quality
`

### U.3 Comandos de testing especificos

`powershell
# Tests backend
npm run test -w backend

# Tests backend con cobertura
npm run test -w backend -- --coverage

# Tests frontend unit
npm run test -w frontend

# Tests frontend E2E
npm run test:e2e -w frontend

# Test E2E especifico
npm run test:e2e -w frontend -- planning-wizard

# Tests contracts
npm run contracts:check

# React doctor
npx react-doctor@latest
`

### U.4 Comandos de verificacion de endpoints

`powershell
# Health checks
Invoke-WebRequest http://localhost:4000/api/health -UseBasicParsing
Invoke-WebRequest http://localhost:4000/api/health/live -UseBasicParsing
Invoke-WebRequest http://localhost:4000/api/health/ready -UseBasicParsing

# OpenAPI docs
Invoke-WebRequest http://localhost:4000/api/docs/openapi.json -UseBasicParsing

# Frontend health
Invoke-WebRequest http://localhost:3000/api/health -UseBasicParsing

# Endpoints criticos
Invoke-WebRequest http://localhost:4000/api/notifications/unread-count -UseBasicParsing
Invoke-WebRequest http://localhost:4000/api/dashboard/summary -UseBasicParsing
Invoke-WebRequest http://localhost:4000/api/dashboard/operational-kpis -UseBasicParsing
Invoke-WebRequest http://localhost:4000/api/dashboard/sla-risk -UseBasicParsing
Invoke-WebRequest http://localhost:4000/api/kits/catalog/options -UseBasicParsing
`

### U.5 Comandos de git

`powershell
# Ver estado
git status

# Ver cambios
git diff

# Commit
git add .
git commit -m "feat(planning): add multi-section wizard with readiness gate"

# Push
git push origin implement/spec-015
`

---

## FIN DEL DOCUMENTO (COMPLETO)

### Total: 4000+ lineas
### Version: 5.0
### Fecha: 2026-07-07 22:55 COT
### Repositorio: https://github.com/JuanDiego30/cermont_aplicativo.git

### V.4 Ejemplo: CctvService (Sprint 2)

```typescript
// backend/src/modules/cctv/cctv.service.ts
import { CctvModel } from "./cctv.model";
import { AuditService } from "../../services/audit.service";
import { AppError } from "../../common/errors";
import type { CctvInspection, CreateCctvDto } from "./cctv.types";

export class CctvService {
  async create(data: CreateCctvDto, userId: string): Promise<CctvInspection> {
    const inspection = await CctvModel.create({
      ...data,
      estado: "DRAFT",
      createdBy: userId,
    });
    await AuditService.log({
      action: "CCTV_INSPECTION_CREATED",
      entity: "CctvInspection",
      entityId: inspection._id,
      userId,
    });
    return inspection;
  }

  async submit(id: string, userId: string): Promise<CctvInspection> {
    const inspection = await CctvModel.findById(id);
    if (!inspection) {
      throw new AppError({ code: "NOT_FOUND", message: "Inspeccion no encontrada" });
    }
    // Validar fotos requeridas
    const missingPhotos = this.validateRequiredPhotos(inspection);
    if (missingPhotos.length > 0) {
      throw new AppError({
        code: "CCTV_REQUIRED_PHOTOS_MISSING",
        message: "Faltan fotos requeridas: " + missingPhotos.join(", "),
      });
    }
    // Calcular concepto
    inspection.concepto = this.calculateConcept(inspection);
    inspection.estado = "COMPLETED";
    inspection.folio = await this.generateFolio();
    await inspection.save();
    await AuditService.log({
      action: "CCTV_INSPECTION_SUBMITTED",
      entity: "CctvInspection",
      entityId: id,
      userId,
      metadata: { concepto: inspection.concepto },
    });
    return inspection;
  }

  private calculateConcept(inspection: CctvInspection): string {
    const hasCritical = inspection.hallazgos.some(h => h.tipo === "CRITICO");
    if (hasCritical) return "NO_APROBADO";
    if (inspection.hallazgos.length > 0) return "APROBADO_CON_OBS";
    return "APROBADO";
  }

  private validateRequiredPhotos(inspection: CctvInspection): string[] {
    const missing: string[] = [];
    const components = ["camara", "encoder", "radio", "antena", "switch",
      "caja-conexion", "gabinete", "luces"];
    for (const comp of components) {
      const hasBefore = inspection.fotos.some(f => f.componente === comp && f.tipo === "ANTES");
      const hasAfter = inspection.fotos.some(f => f.componente === comp && f.tipo === "DESPUES");
      if (!hasBefore) missing.push(comp + ": falta foto ANTES");
      if (!hasAfter) missing.push(comp + ": falta foto DESPUES");
    }
    return missing;
  }

  private async generateFolio(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const count = await CctvModel.countDocuments({
      createdAt: { operator_gte: startOfMonth }
    });
    return "CCTV-" + year + "-" + month + "-" + String(count + 1).padStart(4, "0");
  }
}
```

---

## FIN DEL DOCUMENTO (VERSION COMPLETA)

### Total de lineas: 4000+
### Sprints: 12 (S0-S11)
### Tickets detallados: 50+
### Archivo: .sisyphus/plans/cermont-functional-implementation-masterplan-v5.md
### Version: 5.0
### Fecha: 2026-07-07
### Repositorio: https://github.com/JuanDiego30/cermont_aplicativo.git
### Rama base: deploy/vps-clean
### Autor: Sisyphus - Arquitecto Principal Fullstack

---

## ANEXO X: Referencia de Convenciones de Codigo

### X.1 Convenciones de nombres

**Archivos:**
- Modulos: kebab-case (planning-packet.routes.ts, cctv.service.ts)
- Componentes React: PascalCase (PlanningWizard.tsx, CctvForm.tsx)
- Hooks: camelCase con prefijo use (usePlanningWizard.ts)
- Schemas: kebab-case con sufijo .schema (cctv.schema.ts)
- Tests: mismo nombre del archivo + .test.ts (cctv.service.test.ts)

**Codigo TypeScript:**
- Interfaces: PascalCase con prefijo I? NO - usar PascalCase sin I
- Tipos: PascalCase
- Funciones: camelCase
- Constantes: UPPER_SNAKE_CASE
- Enums: PascalCase
- Variables: camelCase
- Props de componentes: PascalCase con sufijo Props

### X.2 Convenciones de importacion

```typescript
// Orden de imports:
// 1. Modulos de Node
import { readFileSync } from "node:fs";

// 2. Modulos de terceros
import { Router } from "express";
import { z } from "zod";

// 3. Modulos internos del mismo workspace
import { authenticate } from "../../middlewares/auth.middleware";

// 4. Modulos de otros workspaces del monorepo
import { INTERNAL_ROLES } from "@cermont/domain";
import { CreateKitSchema } from "@cermont/shared-types";

// 5. Modulos de config
import { env } from "@cermont/config";

// NO usar:
import * from "./types";  // Barrel imports en paths criticos
import { ... } from "@/components/common";  // Solo en frontend
```

### X.3 Convenciones de JSX

```tsx
// Correcto: fragmentos explicitos, aria labels, HTML semantico
<section aria-label="Lista de ordenes">
  <h2>Ordenes Activas</h2>
  {items.length === 0 ? (
    <EmptyState />
  ) : (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )}
</section>

// Incorrecto: divs sin sentido, sin aria labels, sin estados
<div>
  <div>Ordenes</div>
  {items.map((item) => <div>{item.name}</div>)}
</div>
```

### X.4 Convenciones de Tailwind CSS

```tsx
// Usar variables CSS del design system
<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)]
  bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
</div>

// NO hardcodear colores
<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md">
</div>
```

### X.5 Convenciones de TanStack Query

```typescript
// Query keys estables y centralizadas
export const planningKeys = {
  all: ["planning"] as const,
  lists: () => [...planningKeys.all, "list"] as const,
  list: (filters: PlanningFilters) => [...planningKeys.lists(), filters] as const,
  details: () => [...planningKeys.all, "detail"] as const,
  detail: (id: string) => [...planningKeys.details(), id] as const,
};

// Hook tipado
export function usePlanningList(filters: PlanningFilters) {
  return useQuery({
    queryKey: planningKeys.list(filters),
    queryFn: () => planningApi.list(filters),
  });
}
```

### X.6 Convenciones de React Hook Form

```typescript
// Schema Zod para el formulario
const planningFormSchema = z.object({
  responsable: z.string().min(1, "Responsable es requerido"),
  lugar: z.string().min(1, "Lugar es requerido"),
  fecha: z.string().min(1, "Fecha es requerida"),
  unidadNegocio: z.enum(["IT", "MNT", "SC", "GEN", "OTROS"]),
});

type PlanningFormData = z.infer<typeof planningFormSchema>;

// Hook form con resolver Zod
const form = useForm<PlanningFormData>({
  resolver: zodResolver(planningFormSchema),
  defaultValues: {
    responsable: "",
    lugar: "",
    fecha: new Date().toISOString().split("T")[0],
    unidadNegocio: "OTROS",
  },
});
```

### X.7 Convenciones de testing

```typescript
// Describe + It en ingles
describe("PlanningWizard", () => {
  it("should render all 10 sections", () => {
    // ...
  });

  it("should validate required fields before advancing", () => {
    // ...
  });

  it("should persist data when saving draft", () => {
    // ...
  });
});

// Test IDs para selectores
// Usar data-testid en componentes
<button data-testid="wizard-next-button">Siguiente</button>

// Playwright selector
await page.getByTestId("wizard-next-button").click();
```

---

## ANEXO Y: Mapa de Archivos por Sprint

### Y.1 Sprint 0 - Solo lectura/auditoria (sin modificaciones)

### Y.2 Sprint 1 - Planning + Kits

**Archivos NUEVOS:**
- frontend/src/modules/planning/ui/PlanningWizard.tsx
- frontend/src/modules/planning/ui/WizardProgressBar.tsx
- frontend/src/modules/planning/ui/sections/GeneralSection.tsx
- frontend/src/modules/planning/ui/sections/AlcanceSection.tsx
- frontend/src/modules/planning/ui/sections/MaterialesSection.tsx
- frontend/src/modules/planning/ui/sections/HerramientasSection.tsx
- frontend/src/modules/planning/ui/sections/EquiposSection.tsx
- frontend/src/modules/planning/ui/sections/EppSection.tsx
- frontend/src/modules/planning/ui/sections/PersonalSection.tsx
- frontend/src/modules/planning/ui/sections/FirmasSection.tsx
- frontend/src/modules/planning/ui/sections/DocumentosSection.tsx
- frontend/src/modules/planning/hooks/usePlanningWizard.ts
- backend/src/seeds/kits-cctv.ts
- backend/src/seeds/kits-lifeline.ts
- backend/src/seeds/kits-anchorage.ts
- backend/src/seeds/kits-sgsst.ts
- backend/src/seeds/kits-general.ts

**Archivos MODIFICADOS:**
- frontend/src/app/(dashboard)/planning-packet/new/page.tsx
- frontend/src/modules/planning/ui/ReadinessGate.tsx
- packages/shared-types/src/schemas/planning-packet.schema.ts
- backend/src/modules/planning-packet/planning-packet.service.ts

### Y.3 Sprint 2 - CCTV + Lifelines

**Archivos NUEVOS:**
- packages/shared-types/src/schemas/cctv.schema.ts
- packages/shared-types/src/schemas/lifeline.schema.ts
- backend/src/modules/cctv/cctv.routes.ts
- backend/src/modules/cctv/cctv.controller.ts
- backend/src/modules/cctv/cctv.service.ts
- backend/src/modules/cctv/cctv.model.ts
- backend/src/modules/cctv/cctv.types.ts
- backend/src/modules/lifeline/lifeline.routes.ts
- backend/src/modules/lifeline/lifeline.controller.ts
- backend/src/modules/lifeline/lifeline.service.ts
- backend/src/modules/lifeline/lifeline.model.ts
- backend/src/modules/lifeline/lifeline.types.ts
- frontend/src/modules/cctv/api/cctvApi.ts
- frontend/src/modules/cctv/hooks/useCctv.ts
- frontend/src/modules/cctv/ui/CctvForm.tsx
- frontend/src/modules/lifelines/api/lifelineApi.ts
- frontend/src/modules/lifelines/hooks/useLifeline.ts
- frontend/src/modules/lifelines/ui/LifelineForm.tsx
- frontend/src/modules/lifelines/ui/ChecklistItem.tsx

### Y.4 Sprint 5 - Cost Intelligence

**Archivos NUEVOS:**
- frontend/src/modules/costs/ui/BaselineCapture.tsx
- frontend/src/modules/costs/ui/CostDashboard.tsx

**Archivos MODIFICADOS:**
- backend/src/modules/cost/cost.service.ts
- backend/src/modules/cost/cost.controller.ts
- backend/src/modules/cost/cost.routes.ts
- frontend/src/modules/costs/ui/CostComparisonChart.tsx
- frontend/src/modules/costs/ui/MarginSummaryCard.tsx

### Y.5 Sprint 6 - Dashboard KPIs

**Archivos NUEVOS:**
- frontend/src/modules/dashboard/ui/StepKpiWidget.tsx
- frontend/src/modules/dashboard/ui/RoleAlertPanel.tsx
- frontend/src/modules/dashboard/ui/ExecutiveWidgetGrid.tsx

**Archivos MODIFICADOS:**
- backend/src/modules/dashboard/dashboard.service.ts
- backend/src/modules/dashboard/dashboard.routes.ts
- backend/src/modules/kpi/kpi.routes.ts
- frontend/src/app/(dashboard)/dashboard/page.tsx

### Y.6 Sprint 8 - Billing Pipeline

**Archivos NUEVOS:**
- frontend/src/modules/billing/ui/PipelineTimeline.tsx
- frontend/src/modules/billing/ui/ArDashboard.tsx

**Archivos MODIFICADOS:**
- backend/src/modules/invoice/invoice.service.ts
- frontend/src/app/(dashboard)/billing/page.tsx

---

## ANEXO Z: Checklist de Verificacion Pre-Sprint

Antes de iniciar CADA sprint, verificar:

- [ ] El estado actual del codigo esta en GitHub (git pull)
- [ ] Los tests existentes pasan (npm run test)
- [ ] El build existente pasa (npm run build)
- [ ] Los contracts pasan (npm run contracts:check)
- [ ] Se tomo screenshot del estado actual de las paginas afectadas
- [ ] Se capturaron network logs del estado actual
- [ ] Se capturaron console logs del estado actual
- [ ] La documentacion esta actualizada
- [ ] No hay cambios sin commit en el working directory
- [ ] El branch base es deploy/vps-clean

---

## FIN DEL DOCUMENTO
### Total: 4000+ lineas
### Version: 5.0
### Fecha de creacion: 2026-07-07
### Duracion estimada: 52-74 dias habiles
### Total de sprints: 12
### Total de tickets: 50+
### Archivos auditados: 200+
### Modulos backend revisados: 59
### Paginas frontend revisadas: 94+
### Tests verificados: 148+
### Hallazgos de codigo: 10
### Brechas funcionales: 10
### Fuentes de informacion: docs/, packages/, backend/src/, frontend/src/
**Plan creado por: Sisyphus - Arquitecto Principal Fullstack para CERMONT S.A.S.**
