# PROMPT MAESTRO — Spec Kit 010: Escalamiento profesional de módulos CERMONT 14 pasos

Actúa como un **Principal Product Architect + Staff Full Stack Engineer + Software Architect + UX Engineer + QA Lead + Security Engineer + SRE**, experto en GitHub Spec Kit, Context7, Next.js 16, React 19, Express 5.2.1, MongoDB/Mongoose, Zod 4.x, Contract-First, TanStack Query, RBAC, PWA/offline-first, FSM, CMMS/GMAO, ERP operativo, EAM, asset management, field service, arquitectura SaaS configurable y refactorización incremental sin romper producción.

Este prompt es para **escalar, robustecer y desarrollar aún más los módulos creados de CERMONT**, especialmente los **14 pasos del flujo operativo-administrativo** documentados en el LTG de Juan Diego Arévalo Pidiache.

Repositorio objetivo:

```txt
https://github.com/JuanDiego30/cermont_aplicativo.git
```

Fuente académica principal:

```txt
LTG_JUAN_DIEGO_AREVALO-3_markdown(4).md
```

---

## 0. Propósito

Crear y ejecutar una nueva especificación:

```txt
specs/010-escalamiento-modulos-14-pasos-cermont/
```

para convertir CERMONT en una plataforma profesional tipo:

```txt
FSM + CMMS/GMAO + ERP operativo + PWA offline + motor documental + trazabilidad financiera + SaaS configurable
```

El aplicativo no debe quedarse como CRUD. Debe transformarse en una herramienta robusta, comercializable y útil para una empresa contratista multiservicio como CERMONT S.A.S.

---

## 1. Fuentes obligatorias

Antes de diseñar o modificar código, leer:

```txt
LTG_JUAN_DIEGO_AREVALO-3_markdown(4).md
REGLAS_DESARROLLO_CERMONT.md
.specify/memory/constitution.md

specs/008-auditoria-investigacion-mejora-continua-cermont/
specs/009-ejecucion-escalamiento-cermont/

docs/architecture/CODEBASE_MAP.md
docs/architecture/API_ROUTE_MAP.md
docs/architecture/FRONTEND_BACKEND_MATRIX.md
docs/architecture/DOMAIN_MODULE_MAP.md
docs/architecture/RBAC_PERMISSION_MAP.md
docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md
docs/architecture/PWA_OFFLINE_FLOW_MAP.md

docs/product/CERMONT_MULTISERVICE_PRODUCT_AUDIT.md
docs/product/CERMONT_INNOVATION_ROADMAP.md
docs/product/CERMONT_NEXT_DEVELOPMENT_PLAN.md

docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
docs/API_STATUS.md
docs/DEVELOPMENT_STATUS.md
```

Si un archivo no existe, reportarlo. No inventar contenido.

---

## 2. Reglas duras del proyecto

1. No eliminar funcionalidad sin reemplazo validado.
2. No trabajar en `main`.
3. No inventar rutas, endpoints, módulos ni schemas.
4. No crear módulos duplicados.
5. `FileAsset` debe mantenerse como SSOT para fotos, documentos, evidencias y adjuntos.
6. Todo cambio debe seguir Contract-First:

```txt
Zod schema → tipo inferido → modelo Mongoose → service → controller → route → frontend API service → query keys → hook TanStack Query → UI → tests → docs
```

7. No introducir `any`.
8. No introducir `unknown`, `null` o `undefined` explícitos si violan `quality:strict`.
9. No hardcodear roles.
10. No fetch directo en componentes.
11. No lógica de negocio compleja en UI.
12. Cada página crítica debe tener loading/error/empty/offline/forbidden.
13. RBAC debe existir en backend y frontend.
14. Toda acción crítica debe auditarse.
15. Mutaciones críticas deben ser idempotentes.
16. No introducir mocks productivos.
17. No modificar `package.json` sin justificar y pedir autorización.
18. No deploy sin gates, backup, smoke tests y rollback.
19. No afirmar que una funcionalidad está implementada sin tests y evidencia.
20. No avanzar a innovación P2/P3 si P0/P1 no están estables.

---

## 3. Crear Spec Kit 010

Si Spec Kit CLI existe, usar:

```txt
/speckit.specify
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.implement
```

Si no existe, crear manualmente:

```txt
specs/010-escalamiento-modulos-14-pasos-cermont/
  spec.md
  plan.md
  tasks.md
  implementation-log.md
  impact-maps.md
  module-maturity-matrix.md
  fourteen-step-module-gap-analysis.md
  backend-frontend-package-impact-map.md
  ui-page-content-blueprint.md
  data-field-expansion-plan.md
  professionalization-roadmap.md
  test-plan.md
  final-report.md
  slices/
    slice-01-foundation-gates.md
    slice-02-servicecase-cockpit-14-steps.md
    slice-03-workrequest-sitevisit-proposal-po.md
    slice-04-planning-packet-readiness.md
    slice-05-execution-session-field-mode.md
    slice-06-evidence-fsm-fileasset.md
    slice-07-reports-delivery-records-signatures.md
    slice-08-ses-invoice-payment-closure.md
    slice-09-fleet-tools-assets-gmao.md
    slice-10-checklist-blocking-engine.md
    slice-11-dashboard-operating-system.md
    slice-12-cost-intelligence-erp.md
    slice-13-notifications-automation-rules.md
    slice-14-client-portal-and-saas-foundation.md
  contracts/
    servicecase-cockpit-contract.md
    operational-step-contract.md
    planning-readiness-contract.md
    execution-session-contract.md
    evidence-fsm-contract.md
    delivery-record-signature-contract.md
    financial-closure-contract.md
    asset-readiness-contract.md
    checklist-blocking-contract.md
    dashboard-os-contract.md
    automation-rule-contract.md
```

---

# PLAN DE IMPLEMENTACIÓN

## Fase 0 — Clonar o abrir repo y baseline

Si no existe localmente:

```bash
git clone https://github.com/JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo
```

Si ya existe:

```bash
cd <ruta-del-repo-cermont>
git status --short
git branch --show-current
```

Crear rama:

```bash
git checkout -b implement/spec-010-modulos-14-pasos
```

Ejecutar baseline:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
npx react-doctor@latest
```

Registrar resultados en:

```txt
specs/010-escalamiento-modulos-14-pasos-cermont/implementation-log.md
```

Tabla:

| Gate | Estado | Error | Bloquea | Acción |
|---|---|---|---|---|

No modificar código hasta tener baseline.

---

## Fase 1 — Extraer requerimientos reales del LTG

Del LTG extraer:

1. flujo de 14 pasos;
2. cinco fallas críticas;
3. actores/roles;
4. módulos existentes;
5. módulos propuestos;
6. criterios de validación;
7. componentes de arquitectura;
8. requisitos legales;
9. requisitos PWA/offline;
10. trazabilidad documental y financiera.

Crear:

```txt
specs/010-escalamiento-modulos-14-pasos-cermont/ltg-requirements-extraction.md
```

Formato:

| Sección LTG | Requisito | Módulo afectado | Prioridad | Implementación propuesta |
|---|---|---|---|---|

---

## Fase 2 — Matriz de madurez de módulos

Crear:

```txt
specs/010-escalamiento-modulos-14-pasos-cermont/module-maturity-matrix.md
```

Evaluar cada módulo con nivel 0–5:

```txt
0 = no existe
1 = existe CRUD básico
2 = validado con backend/frontend
3 = tiene estados, RBAC, auditoría y tests
4 = profesional FSM/GMAO/ERP
5 = SaaS/comercializable con automatización/IA/analytics
```

Módulos mínimos:

```txt
WorkRequest
SiteVisit
Proposal
PurchaseOrder
ServiceCase / WorkOrder
PlanningPacket
ExecutionSession
Evidence
TechnicalReport
DeliveryRecord
ClientAcceptance
ServiceEntrySheet
SESApproval
InvoiceTracking
InvoiceApproval
PaymentRecord
Fleet / Vehicles
Tools / Assets / Resources
Checklists
Costs
Dashboard
Notifications
Users / RBAC
Audit
PWA / Offline Sync
Legal / Privacy
Portal Client
AI
Automation Rules
```

Tabla:

| Módulo | Nivel actual | Nivel objetivo | Brecha | Archivos backend | Archivos frontend | Packages | Prioridad |
|---|---|---|---|---|---|---|---|

---

## Fase 3 — Blueprint de contenido por página

Crear:

```txt
specs/010-escalamiento-modulos-14-pasos-cermont/ui-page-content-blueprint.md
```

Para cada página, definir:

```txt
1. Objetivo de la página
2. Usuario principal
3. Secciones requeridas
4. Campos nuevos
5. Acciones principales
6. Estados visuales
7. Permisos RBAC
8. Datos backend requeridos
9. Componentes frontend
10. Tests E2E
```

Páginas mínimas:

```txt
/dashboard
/service-cases
/service-cases/:id
/work-requests
/site-visits
/proposals
/purchase-orders
/planning-packets
/execution-sessions
/evidences
/reports
/delivery-records
/service-entry-sheets
/invoices
/payments
/fleet
/tools
/assets
/checklists
/costs
/notifications
/users
/settings/roles
/portal
/privacy
```

---

## Fase 4 — Plan de campos nuevos por workspace

Crear:

```txt
specs/010-escalamiento-modulos-14-pasos-cermont/data-field-expansion-plan.md
```

Para cada módulo, definir campos en:

```txt
packages/shared-types
packages/domain
backend
frontend
```

Formato:

| Módulo | Campo | Tipo | Workspace | Schema/Modelo/Componente | Obligatorio | Regla de negocio | Test |
|---|---|---|---|---|---|---|---|

Campos guía:

```txt
ServiceCaseCockpit: stepProgress, nextExpectedAction, blockers, evidenceRequirements, documentRequirements, costSummary, administrativeClosureStatus, riskLevel.
PlanningReadiness: hasApprovedProposal, allAssignedTechsHaveValidCerts, allVehiclesHaveValidDocuments, allToolsHaveValidCalibration, safetyChecklistComplete, canExecute, blockingReasons.
ExecutionSession: startTime, endTime, elapsedMinutes, estimatedMinutes, offlineQueueSize, evidenceQueue, fieldNovelties, supervisorSignature.
EvidenceFSM: phase, source, status, reviewStatus, rejectionReason, replacementOf, lockedByReport, usedInReport, gpsMetadata, qualityScore.
AssetReadiness: documentStatus, certificationStatus, calibrationStatus, maintenanceStatus, availabilityStatus, readinessScore, blockingReasons.
FinancialClosure: sesStatus, invoiceStatus, paymentStatus, agingDays, estimatedCost, actualCost, margin, deviation, riskLevel.
```

---

## Fase 5 — Slices ejecutables por los 14 pasos

### Slice 01 — Foundation, gates y deuda crítica

Objetivo:
- dejar gates verdes;
- corregir quality:strict;
- mejorar React Doctor;
- corregir 400/401/500;
- asegurar FileAsset SSOT.

No avanzar si esto falla.

---

### Slice 02 — ServiceCase Cockpit 14 pasos

Objetivo:
Crear una vista unificada por orden con:

- barra de progreso de 14 pasos;
- paso actual;
- siguiente acción esperada;
- bloqueos;
- documentos faltantes;
- evidencias faltantes;
- checklists pendientes;
- costos;
- margen;
- estado administrativo;
- timeline auditado.

Contratos:

```txt
ServiceCaseCockpit
OperationalStepProgress
NextExpectedAction
ServiceCaseBlocker
DocumentRequirementStatus
EvidenceRequirementStatus
CostSummary
AdministrativeClosureSummary
```

Backend:
- endpoint cockpit:
  ```txt
  GET /service-cases/:id/cockpit
  ```
- service que agregue datos de módulos existentes;
- RBAC.

Frontend:
- `ServiceCaseCockpitPage`;
- `FourteenStepProgress`;
- `NextActionCard`;
- `BlockersPanel`;
- `DocumentRequirementsPanel`;
- `EvidenceRequirementsPanel`;
- `CostSummaryCard`;
- `AuditTimeline`.

Tests:
- cockpit con datos reales;
- bloqueo por evidencia faltante;
- permiso denegado;
- empty state.

---

### Slice 03 — WorkRequest → SiteVisit → Proposal → PO

Objetivo:
Robustecer los pasos 1–4.

WorkRequest:
- canal de entrada;
- cliente;
- ubicación;
- prioridad;
- SLA inicial;
- tipo de servicio;
- descripción técnica;
- adjuntos;
- origen.

SiteVisit:
- fecha programada;
- técnico/residente asignado;
- hallazgos;
- fotos;
- mediciones;
- recomendación técnica;
- requiere propuesta.

Proposal:
- alcance;
- actividades;
- materiales;
- mano de obra;
- impuestos;
- margen;
- condiciones;
- versión;
- aprobación.

PurchaseOrder:
- número PO;
- PDF;
- fecha;
- monto;
- cliente;
- relación con propuesta;
- validación contra monto aprobado.

---

### Slice 04 — PlanningPacket Readiness

Objetivo:
Planificación profesional.

Implementar:
- readiness gates;
- técnico con certificaciones;
- vehículo con documentos vigentes;
- herramienta con calibración;
- EPP;
- permisos;
- AST;
- kit típico;
- bloqueo antes de ejecución.

Endpoints:

```txt
GET /planning-packets/:id/readiness
POST /planning-packets/:id/approve
```

---

### Slice 05 — ExecutionSession Field Mode

Objetivo:
Modo campo robusto.

Implementar:
- inicio/fin/pausa;
- checklists offline;
- evidencia por fase;
- novedad/anomalía;
- firma supervisor/cliente;
- sync queue visible;
- idempotencia.

---

### Slice 06 — Evidence FSM + FileAsset

Objetivo:
Formalizar evidencias.

Estados:

```txt
captured
uploaded
under_review
verified
rejected
replacement_requested
locked
archived
```

Implementar:
- revisión;
- rechazo con motivo;
- reemplazo;
- bloqueo si usada en informe;
- ownerType/ownerId;
- fase;
- metadatos;
- auditoría.

---

### Slice 07 — TechnicalReport + DeliveryRecord + Signatures

Objetivo:
Generación documental profesional.

Implementar:
- informe desde orden;
- plantilla por tipo de servicio;
- vista previa;
- versiones;
- firma;
- acta;
- aprobación cliente;
- auditoría.

---

### Slice 08 — SES → Invoice → Payment → Closure

Objetivo:
Cierre administrativo y financiero.

Implementar:
- SES creation;
- SES approval;
- invoice draft;
- invoice approval;
- payment tracking;
- aging 30/60/90;
- closure status;
- alerts.

---

### Slice 09 — Fleet + Tools + Assets GMAO

Objetivo:
Robustecer activos.

Vehículos:
- fotos;
- SOAT;
- tecnomecánica;
- seguro;
- check-in/out;
- mantenimiento;
- readiness;
- bloqueo.

Herramientas:
- fotos;
- manual PDF;
- ficha técnica;
- certificado;
- calibración;
- check-in/out;
- checklist preuso;
- mantenimiento.

---

### Slice 10 — Checklists Blocking Engine

Objetivo:
Checklists profesionales.

Implementar:
- plantillas versionadas;
- ítems obligatorios;
- ítems bloqueantes;
- foto requerida;
- comentario requerido;
- firma;
- integración con fases;
- reglas de cierre.

---

### Slice 11 — Dashboard Operating System

Objetivo:
Dashboard que indique qué hacer.

Implementar:
- KPIs por rol;
- next actions;
- blockers;
- documentos vencidos;
- evidencias pendientes;
- costos en riesgo;
- vehículos/herramientas bloqueadas;
- alertas;
- timeline.

---

### Slice 12 — Cost Intelligence ERP

Objetivo:
Costos profesionales.

Implementar:
- catálogo costos;
- estimado vs real;
- desviación;
- margen;
- presupuesto consumido;
- alertas >80%;
- rentabilidad por cliente;
- exportación.

---

### Slice 13 — Notifications + Automation Rules

Objetivo:
Motor SI-ENTONCES.

Eventos:
- evidencia rechazada;
- documento vencido;
- costo excedido;
- checklist crítico falla;
- SES aprobada;
- factura vencida.

Acciones:
- notificar;
- crear tarea;
- bloquear transición;
- devolver a ejecución;
- solicitar evidencia.

---

### Slice 14 — Client Portal + SaaS Foundation

Objetivo:
Preparar comercialización.

Portal:
- ver órdenes propias;
- aprobar propuesta;
- cargar PO;
- firmar acta;
- ver factura;
- descargar informe.

SaaS:
- tenantId;
- branding;
- feature flags;
- roles por tenant;
- auditoría por tenant.

---

## Fase 6 — Tareas Spec Kit

Crear `tasks.md` con numeración continua:

```md
# Tasks — Spec 010 Escalamiento 14 pasos

## P0 Foundation
- [ ] T282 Crear spec 010.
- [ ] T283 Ejecutar baseline.
- [ ] T284 Extraer requisitos del LTG.
- [ ] T285 Crear module-maturity-matrix.
- [ ] T286 Crear ui-page-content-blueprint.
- [ ] T287 Crear data-field-expansion-plan.
- [ ] T288 Corregir gates P0.

## P1 14 pasos
- [ ] T289 Implementar ServiceCase Cockpit.
- [ ] T290 Robustecer WorkRequest.
- [ ] T291 Robustecer SiteVisit.
- [ ] T292 Robustecer Proposal.
- [ ] T293 Robustecer PurchaseOrder.
- [ ] T294 Implementar Planning Readiness.
- [ ] T295 Implementar Execution Field Mode.
- [ ] T296 Implementar Evidence FSM.
- [ ] T297 Implementar TechnicalReport/DeliveryRecord.
- [ ] T298 Implementar SES/Invoice/Payment Closure.

## P1 módulos soporte
- [ ] T299 Implementar Fleet GMAO.
- [ ] T300 Implementar Tools/Assets GMAO.
- [ ] T301 Implementar Checklists Blocking Engine.
- [ ] T302 Implementar Dashboard Operating System.
- [ ] T303 Implementar Cost Intelligence.

## P2 innovación
- [ ] T304 Implementar Automation Rules MVP.
- [ ] T305 Implementar Digital Twin por orden.
- [ ] T306 Implementar AI Copilot seguro.
- [ ] T307 Implementar QR/NFC activos.
- [ ] T308 Implementar Formularios dinámicos.

## P3 SaaS
- [ ] T309 Diseñar tenant model.
- [ ] T310 Implementar feature flags.
- [ ] T311 Implementar portal cliente.
- [ ] T312 Crear reporte final.
```

---

## Fase 7 — Formato obligatorio antes de cada cambio

Antes de modificar código:

```txt
## Impact Map
Slice:
Cambio:
Problema que resuelve:
Módulos afectados:
Packages afectados:
Backend afectado:
Frontend afectado:
Schemas afectados:
Rutas afectadas:
RBAC afectado:
PWA/offline afectado:
Auditoría afectada:
Tests requeridos:
Riesgo:
Rollback:
```

---

## Fase 8 — Validación final

Después de cada slice:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

Evidencia:

```txt
.sisyphus/evidence/spec-010/slice-{N}/
```

Cada slice debe reportar:

```txt
# Slice N — Resultado

## Qué se implementó
## Archivos modificados
## Contratos actualizados
## Backend
## Frontend
## Tests
## Gates
## Riesgos abiertos
## Próximo slice recomendado
```

---

# DEFINITION OF DONE GLOBAL

La Spec 010 solo queda cerrada si:

1. se leyó el LTG;
2. se creó matriz de madurez;
3. se creó blueprint de páginas;
4. se creó plan de campos por workspace;
5. se implementó ServiceCase Cockpit o quedó como primer slice aprobado;
6. se implementaron al menos dos slices P1 con backend + frontend + tests;
7. `FileAsset` sigue siendo SSOT;
8. no hay nuevos `any`;
9. no se rompió RBAC;
10. no se rompió PWA/offline;
11. todos los gates pasan;
12. documentación viva actualizada;
13. se reportaron riesgos abiertos;
14. no se hizo deploy sin autorización.

Empieza por Fase 0 y Fase 1. No implementes P1 hasta que P0 esté verde.
