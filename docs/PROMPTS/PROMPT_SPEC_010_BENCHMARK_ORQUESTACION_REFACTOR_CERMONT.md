# PROMPT MAESTRO — Spec Kit 010: Benchmark, orquestación y plan de refactor CERMONT con Context7

Actúa como un **Principal Software Architect + Product Strategist FSM/CMMS/ERP + Senior Full Stack Engineer + Refactoring Lead + QA Lead + Technical Researcher**.

Este prompt parte del resultado de la **Spec 009 — Auditoría de Lógica y Optimización**, donde se confirmó:

```txt
Baseline técnico: PASS
Tests: 1091 PASS
Build: PASS
quality:strict: FAIL — 29 violaciones
Plan 003 completado: 11/40 tasks, 27.5%
Wave 3 frontend: 0/12
Wave 4 tests: 0/7
WIP: 151 modificados + ~70 untracked
Score madurez: 2.8/6
Objetivo mínimo: Nivel 3 profesional
Objetivo futuro: Nivel 5/6 comercializable
```

Este prompt NO es para implementar de inmediato. Primero debes **auditar, orquestar, investigar software profesional y repositorios GitHub**, y luego crear un **plan de implementación/refactorización detallado**, con cambios por archivo, módulo, endpoint, contrato, hook, componente, test y criterio de aceptación.

---

## 1. Objetivo

Crear y ejecutar:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/
```

para:

1. Verificar el estado real después de Spec 009.
2. Investigar software profesional FSM, CMMS/GMAO, ERP, ITSM, asset management y gestión documental.
3. Investigar repositorios GitHub relevantes sin copiar código.
4. Comparar CERMONT contra esos referentes.
5. Extraer patrones funcionales y arquitectónicos aplicables.
6. Revisar licencias y riesgos de copiar código.
7. Crear un mapa de refactor de lógica, módulos, navegación, frontend, backend, tests y performance.
8. Crear un plan de implementación por waves P0/P1/P2/P3/P4/P5/P6.
9. Especificar exactamente qué debe desarrollar/refactorizar el siguiente agente.
10. Preparar una Spec 011 de implementación real.

---

## 2. Reglas anti-alucinación

1. No implementes código todavía.
2. No inventes archivos, módulos ni endpoints.
3. No digas que algo existe sin verificarlo en el repo.
4. No marques como implementado algo que solo existe en documentación.
5. No copies código de repositorios externos.
6. No uses patrones de repositorios externos sin revisar licencia.
7. No recomiendes APIs sin consultar Context7.
8. No recomiendes dependencias nuevas sin justificar impacto, licencia y alternativa interna.
9. No ignores `quality:strict`.
10. No ignores los 151 modificados + ~70 untracked.
11. No uses `any`.
12. No rompas Contract-First, API envelope ni RBAC.
13. No uses mocks productivos.
14. No propongas mejoras genéricas: toda mejora debe mapear a archivo, ruta, módulo o contrato.
15. No digas “mejorar lógica” sin explicar regla de negocio, datos, validación y test.
16. No digas “optimizar” sin indicar query, componente, endpoint, índice o bundle.
17. No avances a implementación hasta entregar plan y pedir aprobación.

---

## 3. Fuentes internas obligatorias

Leer antes de auditar o investigar:

```txt
LTG_JUAN_DIEGO_AREVALO-3_markdown.md
docs/pdf/01_main10.md
REGLAS_DESARROLLO_CERMONT.md
DESIGN.md
.specify/memory/constitution.md

.sisyphus/plans/009-implementacion-logica-optimizacion.md
.sisyphus/plans/007-auditoria-roadmap.md
.sisyphus/plans/003-implementacion-real-cermont.md

specs/007-auditoria-implementacion-real-y-navegacion/
specs/008-implementacion-roadmap-007-cermont/
specs/009-auditoria-logica-optimizacion-context7/

docs/audits/IMPLEMENTATION_REALITY_AUDIT.md
docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
docs/API_STATUS.md
docs/DEVELOPMENT_STATUS.md
docs/CHANGELOG.md
```

Si un archivo no existe, registrarlo en:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/missing-inputs.md
```

---

## 4. Uso obligatorio de Context7

Antes de proponer cambios técnicos, consultar Context7:

```txt
/github/spec-kit
/vercel/next.js
/reactjs/react.dev
/tanstack/query
/colinhacks/zod
/radix-ui/primitives
/microsoft/playwright
/masterkale/simplewebauthn
/websites/mongoosejs
/owasp/devguide
```

Crear:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/context7-evidence.md
```

Tabla:

| Tecnología | Library ID Context7 | Tema consultado | Regla aplicada al plan CERMONT | Riesgo si se ignora |
|---|---|---|---|---|

Temas mínimos:

- Spec Kit: specify, clarify, plan, tasks, implement, acceptance criteria.
- Next.js: App Router, layouts, loading/error, assets, metadata, caching.
- React: composición, estado, hooks, performance.
- TanStack Query: query keys, enabled, invalidation, mutations, retries.
- Zod: contratos compartidos, params/query/body, errores.
- Radix: accesibilidad, dialogs, focus, keyboard navigation.
- Playwright: E2E, mobile, smoke tests.
- SimpleWebAuthn: passkeys, RP ID, origin HTTPS, platform authenticator.
- Mongoose: índices, paginación, lean queries, performance.
- OWASP: secure design, uploads, auth/session, logging, privacy.

---

## 5. Crear estructura Spec Kit 010

Si Spec Kit CLI existe:

```txt
/speckit.specify
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.analyze
```

Si no existe, crear manualmente:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/
  spec.md
  plan.md
  tasks.md
  audit-log.md
  missing-inputs.md
  context7-evidence.md
  wip-map.md
  ltg-product-intent.md
  professional-software-benchmark.md
  github-repository-benchmark.md
  license-risk-review.md
  pattern-extraction-matrix.md
  cermont-gap-vs-benchmark.md
  logic-refactor-map.md
  module-refactor-map.md
  architecture-decision-records.md
  implementation-roadmap.md
  implementation-slices.md
  risk-register.md
  final-orchestration-report.md
  contracts/
    benchmark-research-contract.md
    refactor-slice-contract.md
    professional-module-contract.md
    logic-implementation-contract.md
    test-acceptance-contract.md
```

---

# PLAN DE AUDITORÍA, INVESTIGACIÓN Y ORQUESTACIÓN

## FASE 0 — Baseline y protección del WIP

Ejecutar:

```bash
git status --short
git branch --show-current
git diff --stat
git diff --name-only
git ls-files --others --exclude-standard
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

Crear:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/audit-log.md
specs/010-benchmark-orquestacion-refactor-cermont/wip-map.md
```

WIP map:

| Archivo | Estado Git | Categoría | Pertenece a spec | Riesgo | Acción recomendada |
|---|---|---|---|---|---|

Categorías:

```txt
hotfix
contracts
backend-gap
frontend-gap
tests
docs
generated/cache
unknown
```

Criterio:
- si hay riesgo de pérdida, recomendar `git stash -u` o commit temporal;
- no implementar sin WIP protegido.

---

## FASE 1 — Revisión de intención del producto según LTG

Extraer del LTG:

- flujo de 14 pasos;
- cinco fallas críticas;
- stakeholders;
- módulos esperados;
- alcance implementado, parcial y futuro;
- validación y pruebas;
- limitaciones;
- recomendaciones técnicas.

Crear:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/ltg-product-intent.md
```

Tabla:

| Elemento LTG | Qué exige el producto | Módulo relacionado | Evidencia actual | Brecha |
|---|---|---|---|---|

Criterio:
- el plan debe priorizar mejoras que ataquen las 5 fallas críticas;
- no priorizar funcionalidades que no aporten a trazabilidad, cierre, ejecución, planeación o costos.

---

## FASE 2 — Investigación de software profesional

Crear:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/professional-software-benchmark.md
```

Investigar:

### FSM / Field Service

```txt
Odoo Field Service
OCA Field Service
FieldPro
Jobber
ServiceTitan
Microsoft Dynamics 365 Field Service
```

Patrones:
- órdenes de servicio;
- técnicos;
- rutas;
- worksheets;
- evidencias;
- portal cliente;
- facturación conectada;
- SLA;
- mobile field mode.

### CMMS / GMAO

```txt
ERPNext Maintenance
Grash / Atlas CMMS
openMAINT / CMDBuild
Fiix
MaintainX
UpKeep
Limble CMMS
```

Patrones:
- activos;
- mantenimiento preventivo;
- órdenes de mantenimiento;
- historial;
- calendarios;
- checklist;
- prioridades;
- costos de mantenimiento.

### Asset Management

```txt
Snipe-IT
GLPI Assets
Ralph
Open-AudIT
```

Patrones:
- asset tag;
- checkin/checkout;
- responsable;
- ubicación;
- fotos;
- documentos;
- licencias;
- historial;
- auditoría;
- vencimientos.

### ERP operativo / costos / cierre

```txt
ERPNext
Odoo
Dolibarr
Idempiere
metasfresh
```

Patrones:
- costos estimados vs reales;
- facturación;
- pagos;
- workflow de aprobación;
- documentos comerciales;
- integraciones;
- contabilidad;
- margen y rentabilidad.

### Gestión documental/evidencias

```txt
Paperless-ngx
Mayan EDMS
Documenso
Docuseal
```

Patrones:
- metadata;
- firmas;
- versionado;
- auditoría;
- permisos;
- retención;
- previews;
- descargas auditadas.

Tabla:

| Software | Categoría | Patrón observado | Módulo CERMONT relacionado | Brecha actual | Adaptación propuesta | Prioridad |
|---|---|---|---|---|---|---|

---

## FASE 3 — Investigación de repositorios GitHub

Crear:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/github-repository-benchmark.md
specs/010-benchmark-orquestacion-refactor-cermont/license-risk-review.md
```

Repositorios mínimos:

```txt
OCA/field-service
frappe/erpnext
frappe/frappe
snipe/snipe-it
glpi-project/glpi
grashjs/cmms
odoo/odoo
dolibarr/dolibarr
paperless-ngx/paperless-ngx
mayan-edms/Mayan-EDMS
documenso/documenso
docusealco/docuseal
```

Tabla:

| Repositorio | Licencia | Stack | Módulo/patrón relevante | Qué puede aprender CERMONT | Riesgo legal/técnico | No copiar |
|---|---|---|---|---|---|---|

Reglas:
- no copiar código;
- revisar licencia;
- usar ideas/patrones;
- si licencia GPL/AGPL, marcar riesgo de copiar código.

---

## FASE 4 — Matriz de patrones aplicables

Crear:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/pattern-extraction-matrix.md
```

Tabla:

| Patrón profesional | Fuente | Problema CERMONT que resuelve | Módulo destino | Implementación propuesta | Datos necesarios | Test requerido |
|---|---|---|---|---|---|---|

Patrones obligatorios:

1. Readiness score para vehículos/herramientas.
2. Checkin/checkout de herramientas.
3. Calendario de mantenimiento.
4. Documento requerido por paso del flujo.
5. Gate de avance por evidencia/checklist.
6. Timeline único de orden.
7. Dashboard accionable.
8. Notificación por bloqueo.
9. Costos estimado vs real.
10. Auditoría de descarga.
11. Offline outbox de evidencias.
12. Formularios dinámicos por tipo de servicio.
13. Plantillas de checklist versionadas.
14. Firma/aceptación del cliente.
15. Panel de cierre administrativo por orden.

---

## FASE 5 — CERMONT vs benchmark

Crear:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/cermont-gap-vs-benchmark.md
```

Tabla:

| Módulo CERMONT | Nivel actual | Referente profesional | Gap funcional | Gap UI/UX | Gap backend | Gap tests | Próximo cambio |
|---|---:|---|---|---|---|---|---|

Escala:

```txt
0 inexistente
1 documentación
2 backend/schema
3 frontend básico
4 end-to-end funcional
5 profesional
6 comercializable
```

Módulos obligatorios:

```txt
Dashboard
Work Requests
Site Visits
Proposals
Purchase Orders
Orders / Service Cases
Planning
Execution
Evidences
Documents
Technical Reports
Delivery Records
SES
Invoices
Payments
Costs
Fleet
Tools / Assets
Checklists
Maintenance
Notifications
Privacy / Consent
WebAuthn
PWA / Offline
Admin / Settings
```

---

## FASE 6 — Mapa de refactor y lógica

Crear:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/logic-refactor-map.md
specs/010-benchmark-orquestacion-refactor-cermont/module-refactor-map.md
```

Auditar y planear refactor para:

### Lógica de dominio
- workflow 14 pasos;
- gates;
- documentos por paso;
- evidencias por paso;
- checklists bloqueantes;
- permisos por rol;
- auditoría;
- notificaciones.

### Backend
- controllers delgados;
- services con reglas;
- validación Zod;
- errores tipados;
- response envelope;
- auditoría.

### Frontend
- hooks por módulo;
- query keys;
- `enabled` según sesión;
- formularios con schemas;
- componentes reutilizables;
- loading/error/empty/forbidden/offline;
- navegación por flujo.

### Datos/performance
- índices;
- paginación;
- filtros;
- sorting;
- upload metadata;
- lifecycle/retention.

Tabla:

| Refactor | Capa | Archivo actual | Problema | Cambio propuesto | Riesgo | Test |
|---|---|---|---|---|---|---|

---

## FASE 7 — Architecture Decision Records

Crear:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/architecture-decision-records.md
```

ADRs mínimos:

```txt
ADR-001 — Mantener monorepo npm workspaces
ADR-002 — Mantener Contract-First con Zod
ADR-003 — Centralizar lógica de flujo en domain/workflow
ADR-004 — Unificar archivos/evidencias/documentos como Attachment/MediaAsset
ADR-005 — Usar TanStack Query con query keys por módulo
ADR-006 — Usar WebAuthn/passkeys para biometría móvil
ADR-007 — Implementar readiness score y gates por paso
ADR-008 — Mantener PWA offline con outbox para campo
ADR-009 — No copiar código de repos externos; solo patrones
ADR-010 — Dividir implementación por slices verticales
```

Tabla:

| ADR | Decisión | Contexto | Alternativas | Consecuencia | Estado |
|---|---|---|---|---|---|

---

# PLAN DE IMPLEMENTACIÓN QUE DEBES CREAR

Crear:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/implementation-roadmap.md
specs/010-benchmark-orquestacion-refactor-cermont/implementation-slices.md
specs/010-benchmark-orquestacion-refactor-cermont/tasks.md
```

Cada tarea debe tener:

| Task | Prioridad | Módulo | Tipo | Archivos exactos | Cambios requeridos | Tests | Criterio de aceptación |
|---|---|---|---|---|---|---|---|

---

## WAVE P0 — Estabilización y deuda bloqueante

Debe incluir:

1. Proteger WIP.
2. Corregir `quality:strict`.
3. Corregir rutas sin validación/RBAC.
4. Corregir acciones frontend sin backend.
5. Corregir navegación rota.
6. Eliminar mocks productivos.
7. Verificar 400/401/500.
8. Estabilizar login/session/passkey fallback.
9. Actualizar `KNOWN_ISSUES`.

---

## WAVE P1 — Lógica central del flujo 14 pasos

Debe incluir:

1. Timeline de orden.
2. Gate service por paso.
3. Documento requerido por paso.
4. Evidencia requerida por paso.
5. Checklist requerido por paso.
6. RBAC por transición.
7. Notificación por bloqueo.
8. Estado visual del flujo.
9. Tests por transición.
10. UI de flujo en dashboard/order detail.

---

## WAVE P2 — Módulos profesionales prioritarios

Debe incluir:

### Fleet
- galería;
- cámara;
- documentos;
- vencimientos;
- readiness score;
- alertas.

### Tools/Assets
- fotos;
- PDF/manual/certificado;
- checkin/checkout;
- calibración;
- bloqueo por vencimiento.

### Evidences
- FSM gallery;
- cámara;
- fases;
- PDF;
- aprobación/rechazo;
- auditoría de descarga.

### Checklists
- plantillas versionadas;
- ítems bloqueantes;
- foto requerida;
- comentario requerido;
- integración con orden/herramienta/vehículo.

### Costs
- estimated vs actual;
- execution cost form;
- margin;
- deviation chart;
- alerts.

### Maintenance
- schedule CRUD;
- logs;
- SLA;
- asset history.

---

## WAVE P3 — Frontend Excellence y navegación

Debe incluir:

1. Rediseñar dashboard con action cards.
2. Mejorar navegación por flujo de 14 pasos.
3. Mejorar sidebar/mobile navigation.
4. Unificar UI components.
5. Empty/loading/error/forbidden/offline states.
6. Breadcrumbs.
7. Deep links.
8. Acciones rápidas.
9. Accesibilidad Radix.
10. Diseño responsive.

---

## WAVE P4 — Optimización

### Backend
- índices Mongoose;
- `lean()` donde aplique;
- paginación estándar;
- limits;
- filtros;
- aggregations controladas;
- reducción payload.

### Frontend
- query `enabled`;
- invalidation;
- lazy loading;
- code splitting;
- image optimization;
- evitar refetch innecesario;
- skeletons;
- memoización solo si se mide.

### PWA
- cache strategy;
- offline fallback;
- outbox;
- retry;
- upload queue;
- deduplicación.

---

## WAVE P5 — Tests, calidad y CI

Debe incluir:

1. Contract tests.
2. Backend integration tests.
3. Frontend component tests.
4. Playwright E2E por flujo.
5. Mobile E2E.
6. Accessibility tests.
7. Smoke tests post-deploy.
8. CI gates.
9. Coverage report.
10. Release checklist.

---

## WAVE P6 — Comercialización futura

Debe incluir como investigación, no implementación inmediata:

1. Multiempresa.
2. Plantillas configurables por cliente.
3. Roles configurables.
4. Licenciamiento/suscripción.
5. Auditoría avanzada.
6. API pública.
7. Integración ERP real.
8. App móvil nativa o wrapper.
9. White-label.
10. Manual usuario/admin.

---

# TASKS SPEC KIT 010

Si Spec 009 terminó en T318, continuar:

```md
# Tasks — Spec 010 Benchmark, Orquestación y Refactor CERMONT

## P0 — Setup
- [ ] T319 Crear spec 010.
- [ ] T320 Ejecutar baseline y mapa WIP.
- [ ] T321 Consultar Context7.
- [ ] T322 Extraer intención del LTG.
- [ ] T323 Crear context7-evidence.md.

## P0 — Research
- [ ] T324 Investigar software FSM.
- [ ] T325 Investigar software CMMS/GMAO.
- [ ] T326 Investigar software ERP.
- [ ] T327 Investigar asset management.
- [ ] T328 Investigar gestión documental/evidencias.
- [ ] T329 Investigar UI/UX SaaS B2B.
- [ ] T330 Crear professional-software-benchmark.md.

## P0 — GitHub benchmark
- [ ] T331 Auditar OCA/field-service.
- [ ] T332 Auditar frappe/erpnext.
- [ ] T333 Auditar snipe/snipe-it.
- [ ] T334 Auditar glpi-project/glpi.
- [ ] T335 Auditar grashjs/cmms.
- [ ] T336 Auditar paperless-ngx/paperless-ngx.
- [ ] T337 Auditar documenso/documenso.
- [ ] T338 Crear github-repository-benchmark.md.
- [ ] T339 Crear license-risk-review.md.

## P1 — Gap y patrones
- [ ] T340 Crear pattern-extraction-matrix.md.
- [ ] T341 Crear cermont-gap-vs-benchmark.md.
- [ ] T342 Crear logic-refactor-map.md.
- [ ] T343 Crear module-refactor-map.md.
- [ ] T344 Crear architecture-decision-records.md.

## P1 — Roadmap
- [ ] T345 Crear implementation-roadmap.md.
- [ ] T346 Crear implementation-slices.md.
- [ ] T347 Crear tasks.md.
- [ ] T348 Crear risk-register.md.
- [ ] T349 Crear final-orchestration-report.md.
```

---

# FORMATO DE RESPUESTA FINAL DEL AGENTE

```txt
# Spec 010 — Auditoría, benchmark y orquestación CERMONT

## 1. Resumen ejecutivo
## 2. Fuentes internas leídas
## 3. Context7 consultado
## 4. Software profesional investigado
## 5. Repositorios GitHub investigados
## 6. Patrones aplicables a CERMONT
## 7. Gaps frente a referentes
## 8. Mapa de refactor
## 9. ADRs creados
## 10. Plan de implementación por waves
## 11. Tasks priorizadas
## 12. Riesgos de licencia
## 13. Riesgos técnicos
## 14. Próximo paso recomendado
```

No implementes todavía. Primero entrega benchmark, orquestación y plan de implementación/refactorización.
