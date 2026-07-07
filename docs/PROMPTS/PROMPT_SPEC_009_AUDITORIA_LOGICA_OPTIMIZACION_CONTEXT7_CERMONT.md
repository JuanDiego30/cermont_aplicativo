# PROMPT MAESTRO — Spec Kit 009: Auditoría de lógica, optimización y plan de implementación con Context7

Actúa como un **Staff Software Architect + Principal Full Stack Auditor + Product Engineer FSM/CMMS/ERP + Performance Engineer + QA Lead + Security Engineer**.

Este prompt NO es para implementar de inmediato. Primero debes hacer una **auditoría profunda, verificación técnica y plan de implementación detallado** para descubrir por qué el aplicativo CERMONT no ha mejorado lo suficiente en lógica, optimización, navegación, UX y funcionalidad profesional, a pesar de las specs/prompts anteriores.

Debes usar **GitHub Spec Kit** para estructurar la auditoría y **Context7** para consultar documentación actualizada de las librerías/frameworks antes de recomendar cambios técnicos. No inventes APIs ni patrones obsoletos.

---

## 0. Contexto del proyecto CERMONT

CERMONT es un aplicativo web para gestión de órdenes de trabajo, trazabilidad operativa y cierre administrativo de procesos operativos. Según el libro de trabajo de grado, el sistema debe responder a un flujo operativo-administrativo de **14 pasos**, conectar planeación, ejecución, evidencias, informes, actas, SES, facturación, pagos y costos reales.

El objetivo real del sistema no es ser un CRUD de formularios. Debe comportarse como una plataforma profesional:

```txt
FSM + CMMS/GMAO + ERP operativo + Gestión documental + PWA de campo
```

La auditoría anterior concluyó:

- base técnica sólida;
- 1091 tests pasando;
- build funcionando;
- 83 rutas frontend;
- 55 módulos backend;
- `quality:strict` falla por 29 violaciones nuevas;
- Plan 003 completado solo 27.5%;
- Wave 3 frontend está 0/12;
- Wave 4 tests está 0/7;
- WIP actual: 151 archivos modificados + ~70 untracked;
- muchos cambios siguen solo documentados;
- falta mejorar lógica de negocio, optimización, navegación y módulos profesionales.

---

## 1. Objetivo principal

Crear y ejecutar una nueva especificación:

```txt
specs/009-auditoria-logica-optimizacion-context7/
```

para:

1. leer la documentación y planes previos;
2. verificar qué lógica está implementada realmente;
3. detectar lógica incompleta, duplicada, débil o mal ubicada;
4. detectar módulos con UI sin reglas de negocio;
5. detectar backend con endpoints sin consumo o sin lógica suficiente;
6. detectar frontend con componentes desconectados, formularios planos o navegación débil;
7. analizar optimización de frontend, backend, queries, DB, PWA y build;
8. usar Context7 para validar patrones actuales de Next.js, React, TanStack Query, Zod, Radix, Playwright, Mongoose, SimpleWebAuthn y Spec Kit;
9. crear un plan de implementación profesional por waves/slices;
10. especificar exactamente qué cambios debe hacer el modelo después;
11. evitar alucinaciones y evitar seguir creando documentación que no se implementa.

---

## 2. Reglas anti-alucinación obligatorias

1. No implementes código antes de terminar la auditoría y el plan.
2. No inventes archivos: usa exploración real del repo.
3. No digas que una funcionalidad existe si no encuentras schema, backend, frontend, hook, UI y test.
4. No marques una mejora como implementada solo porque existe documentación `.md`.
5. No recomiendes cambios de librerías sin consultar Context7.
6. No inventes APIs de Next.js, React, TanStack Query, Zod, Radix, Mongoose o Playwright.
7. No ignores `quality:strict`.
8. No ignores WIP: 151 modificados + ~70 untracked.
9. No uses `any`.
10. No rompas Contract-First.
11. No rompas API envelope.
12. No rompas RBAC.
13. No uses mocks productivos.
14. No escondas errores de consola o deploy.
15. No propongas optimizaciones genéricas: cada mejora debe mapear a archivo, módulo, ruta o contrato.
16. No digas “mejorar frontend” sin indicar componentes, rutas y criterios de aceptación.
17. No digas “optimizar backend” sin indicar queries, índices, servicios, endpoints y tests.
18. No cierres sin matrices de evidencia.
19. No crees un roadmap sin prioridades P0/P1/P2/P3.
20. No avances a implementación hasta que el usuario apruebe el plan.

---

## 3. Uso obligatorio de Context7

Antes de proponer cualquier cambio técnico, usar Context7 para documentación actualizada.

### 3.1 Resolver librerías

Consultar con Context7:

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

Si Context7 devuelve otro ID más preciso, usar el recomendado.

### 3.2 Crear evidencia Context7

Crear:

```txt
specs/009-auditoria-logica-optimizacion-context7/context7-evidence.md
```

Formato:

| Tecnología | Context7 library ID usado | Temas consultados | Decisión aplicada en CERMONT | Riesgo si no se aplica |
|---|---|---|---|---|

### 3.3 Temas mínimos a consultar

#### GitHub Spec Kit
- flujo `specify → clarify → plan → tasks → implement`;
- uso de constitución;
- estructura de specs;
- criterios de aceptación;
- trazabilidad.

#### Next.js 16 / App Router
- routing;
- metadata;
- static assets;
- layouts;
- server/client components;
- performance;
- caching;
- error/loading states.

#### React 19
- componentes;
- composición;
- estado;
- hooks;
- performance;
- manejo de errores.

#### TanStack Query
- query keys;
- `enabled`;
- invalidation;
- optimistic updates;
- mutations;
- manejo de errores;
- no hacer requests antes de sesión.

#### Zod 4
- schemas;
- `infer`;
- validación de params/query/body;
- contratos compartidos;
- errores de validación.

#### Radix UI
- accesibilidad;
- DialogTitle/DialogDescription;
- keyboard navigation;
- focus management.

#### Playwright
- E2E;
- flujos críticos;
- testing mobile;
- smoke tests post-deploy.

#### SimpleWebAuthn / WebAuthn
- passkeys;
- platform authenticator;
- RP ID;
- origin HTTPS;
- register/login options;
- fallback móvil.

#### Mongoose
- schemas;
- índices;
- paginación;
- consultas;
- validación;
- performance.

#### OWASP Developer Guide
- secure design;
- auth/session;
- upload security;
- logging;
- privacy;
- error handling.

---

## 4. Fuentes del proyecto que debes leer

Lee antes de auditar:

```txt
LTG_JUAN_DIEGO_AREVALO-3_markdown.md
REGLAS_DESARROLLO_CERMONT.md
DESIGN.md
.specify/memory/constitution.md

.sisyphus/plans/007-auditoria-roadmap.md
.sisyphus/plans/003-implementacion-real-cermont.md

docs/PROMPTS/spec-005-hotfix.md
docs/PROMPTS/PROMPT_SPEC_006_FRONTEND_EXCELLENCE_CERMONT.md
docs/PROMPTS/PROMPT_IMPLEMENTACION_SPEC_KIT_POST_AUDITORIA_CERMONT.md
docs/PROMPTS/PROMPT_SPEC_005_HOTFIX_POST_DEPLOY_CERMONT.md
docs/PROMPTS/PROMPT_SPEC_004_DEPLOY_SEGURO_CERMONT.md
docs/PROMPTS/PROMPT_IMPLEMENTACION_MODULOS_PROFESIONALES_CERMONT.md
docs/PROMPTS/PROMPT_SPEC_003_IMPLEMENTACION_REAL_CERMONT.md
docs/PROMPTS/PROMPT_SPEC_003_PROFESIONALIZACION_CERMONT.md
docs/PROMPTS/PROMPT_AUDITORIA_SPEC_KIT_CERMONT.md
docs/PROMPTS/PROMPT_FOTOS_CAMARA_DOCUMENTOS_CERMONT.md
docs/PROMPTS/PROMPT_MEJORA_KPIS_E_IMPLEMENTACION_DESIGN.md

specs/001-auditoria-integral-cermont/
specs/002-correcciones-post-auditoria-cermont/
specs/003-profesionalizacion-cermont/
specs/004-deploy-seguro-cermont/
specs/005-post-deploy-hotfix-and-real-implementation/
specs/006-frontend-excellence-cermont/
specs/007-auditoria-implementacion-real-y-navegacion/
specs/008-implementacion-roadmap-007-cermont/

docs/audits/IMPLEMENTATION_REALITY_AUDIT.md
docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
docs/API_STATUS.md
docs/DEVELOPMENT_STATUS.md
docs/CHANGELOG.md
```

Si un archivo no existe, registrarlo en:

```txt
specs/009-auditoria-logica-optimizacion-context7/missing-inputs.md
```

No inventar su contenido.

---

## 5. Crear Spec Kit 009

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
specs/009-auditoria-logica-optimizacion-context7/
  spec.md
  plan.md
  tasks.md
  audit-log.md
  context7-evidence.md
  missing-inputs.md
  business-logic-audit.md
  frontend-logic-audit.md
  backend-logic-audit.md
  api-contract-audit.md
  data-model-optimization-audit.md
  query-performance-audit.md
  navigation-flow-audit.md
  pwa-offline-audit.md
  uiux-implementation-audit.md
  module-readiness-scorecard.md
  implementation-plan.md
  implementation-slices.md
  risk-register.md
  final-report.md
  contracts/
    logic-readiness-contract.md
    optimization-readiness-contract.md
    module-slice-contract.md
    navigation-flow-contract.md
    testing-gate-contract.md
```

---

# PLAN DE AUDITORÍA Y VERIFICACIÓN

---

## FASE 0 — Baseline técnico y protección de WIP

### Acciones

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
specs/009-auditoria-logica-optimizacion-context7/audit-log.md
```

Tabla:

| Comando | Resultado | Observación | Bloquea avance |
|---|---|---|---|

Crear matriz de WIP:

| Archivo | Estado git | Categoría | Riesgo | Acción |
|---|---|---|---|---|

Categorías:

```txt
hotfix
backend-gap
frontend-gap
test-gap
docs
generated
unknown
```

Criterio:
- no auditar cambios con riesgo de pérdida sin clasificarlos;
- si hay WIP alto, recomendar stash/commit temporal antes de implementación.

---

## FASE 1 — Lectura y extracción de requisitos reales del LTG

### Objetivo
Comparar el software real contra el objetivo académico y operativo.

Buscar en el LTG:

- flujo operativo de 14 pasos;
- cinco fallas críticas;
- planeación;
- ejecución en campo;
- evidencias;
- informes/actas;
- cierre administrativo;
- costos reales;
- PWA/offline;
- Contract-First;
- RBAC;
- Zod;
- pruebas;
- módulos implementados/parciales/futuros.

Crear:

```txt
specs/009-auditoria-logica-optimizacion-context7/ltg-requirements-traceability.md
```

Tabla:

| Requisito del LTG | Sección/fuente | Módulo esperado | Evidencia de código | Estado | Brecha |
|---|---|---|---|---|---|

Criterio:
- el plan de implementación debe responder al flujo de 14 pasos y a las cinco fallas críticas;
- no priorizar funcionalidades que no atacan una falla real.

---

## FASE 2 — Auditoría de lógica de negocio

Crear:

```txt
specs/009-auditoria-logica-optimizacion-context7/business-logic-audit.md
```

Auditar si existen reglas reales para:

### 2.1 Flujo de 14 pasos

- WorkRequest;
- SiteVisit;
- Proposal;
- PurchaseOrder;
- PlanningPacket;
- ExecutionSession;
- TechnicalReport;
- DeliveryRecord;
- ClientAcceptance;
- ServiceEntrySheet;
- SESApproval;
- InvoiceTracking;
- InvoiceApproval;
- PaymentRecord.

Verificar:
- entidad;
- estado;
- transición;
- validación;
- bloqueo;
- evidencia/documento requerido;
- permiso;
- auditoría;
- notificación.

Tabla:

| Paso | Entidad | Estado implementado | Regla de transición | Bloqueo documental | RBAC | UI | Test | Brecha |
|---|---|---|---|---|---|---|---|---|

### 2.2 Cinco fallas críticas

Auditar:

1. Planeación incompleta.
2. Ejecución/evidencias dispersas.
3. Informes/actas con recaptura.
4. Cierre administrativo fragmentado.
5. Costos reales no centralizados.

Tabla:

| Falla | Módulo que debe resolverla | Lógica encontrada | Lógica faltante | Prioridad |
|---|---|---|---|---|

### 2.3 Reglas profesionales FSM/CMMS/ERP

Auditar:
- gates de avance;
- readiness;
- documentos vencidos;
- herramientas no disponibles;
- vehículos bloqueados;
- evidencias obligatorias;
- checklists bloqueantes;
- costos excedidos;
- SLA;
- aprobación/rechazo;
- timeline.

---

## FASE 3 — Auditoría de backend y contratos

Crear:

```txt
specs/009-auditoria-logica-optimizacion-context7/backend-logic-audit.md
specs/009-auditoria-logica-optimizacion-context7/api-contract-audit.md
```

Buscar:

```bash
find backend/src/modules -maxdepth 4 -type f
find packages/shared-types/src/schemas -maxdepth 3 -type f
rg "validateBody|validateQuery|validateParams|authorize|authenticate" backend/src
rg "router\.|app\.use|API_MOUNTS" backend/src
```

Evaluar cada módulo:

| Módulo | Schema Zod | Model | Service | Controller | Route | Validation | RBAC | Tests | Lógica faltante |
|---|---|---|---|---|---|---|---|---|---|

Detectar:
- controllers con lógica de negocio;
- services vacíos;
- rutas sin validación;
- rutas sin RBAC;
- endpoints no usados;
- response envelope inconsistente;
- errores 500 por validación;
- falta de auditoría;
- falta de tests.

---

## FASE 4 — Auditoría de frontend, navegación y UX lógica

Crear:

```txt
specs/009-auditoria-logica-optimizacion-context7/frontend-logic-audit.md
specs/009-auditoria-logica-optimizacion-context7/navigation-flow-audit.md
specs/009-auditoria-logica-optimizacion-context7/uiux-implementation-audit.md
```

Buscar:

```bash
find frontend/src/app -maxdepth 7 -type f
find frontend/src/modules -maxdepth 6 -type f
rg "useQuery|useMutation|apiClient|queryKeys|FormProvider|zodResolver" frontend/src
rg "href=|router.push|Link|navigation|Sidebar|MobileNavigation" frontend/src
```

Evaluar pantallas:

| Pantalla/Ruta | Consume API real | Usa hook | Usa schema | Tiene loading | Error | Empty | Forbidden | Acción principal funciona | UX profesional | Brecha |
|---|---|---|---|---|---|---|---|---|---|---|

Revisar especialmente:
- dashboard;
- fleet/vehicles;
- tools/assets/resources;
- evidences;
- documents;
- checklists;
- costs;
- maintenance;
- ERP connector;
- privacy;
- login/passkeys;
- notifications;
- order detail.

---

## FASE 5 — Auditoría de optimización

Crear:

```txt
specs/009-auditoria-logica-optimizacion-context7/data-model-optimization-audit.md
specs/009-auditoria-logica-optimizacion-context7/query-performance-audit.md
```

### Backend/Mongo/Mongoose

Auditar:
- índices;
- paginación;
- filtros;
- sort;
- lean queries;
- population excesiva;
- N+1 queries;
- consultas sin límite;
- conteos caros;
- agregaciones;
- tamaño de payload;
- uploads grandes;
- logs.

Tabla:

| Módulo | Query/Endpoint | Riesgo performance | Evidencia | Mejora propuesta | Prioridad |
|---|---|---|---|---|---|

### Frontend/React/Next/TanStack Query

Auditar:
- queries sin `enabled`;
- invalidaciones inexistentes;
- query keys duplicadas;
- refetch excesivo;
- componentes cliente innecesarios;
- bundles grandes;
- imágenes no optimizadas;
- formularios con renders excesivos;
- modales pesados;
- estados globales innecesarios;
- PWA cache.

Tabla:

| Pantalla | Problema | Evidencia | Mejora | Impacto |
|---|---|---|---|---|

---

## FASE 6 — Auditoría PWA/offline y archivos

Crear:

```txt
specs/009-auditoria-logica-optimizacion-context7/pwa-offline-audit.md
```

Auditar:
- Serwist/service worker;
- precache;
- assets 404;
- offline fallback;
- IndexedDB;
- outbox;
- sync de evidencias;
- subida de archivos;
- reintentos;
- deduplicación;
- error recovery.

Tabla:

| Capacidad offline | Implementado | Evidencia | Riesgo | Mejora |
|---|---|---|---|---|

---

## FASE 7 — Scorecard de madurez por módulo

Crear:

```txt
specs/009-auditoria-logica-optimizacion-context7/module-readiness-scorecard.md
```

Escala:

```txt
0 inexistente
1 documentación
2 backend/schema
3 frontend básico
4 funcional end-to-end
5 profesional con reglas, UX, tests y auditoría
6 comercializable
```

Tabla:

| Módulo | Score | Backend | Frontend | Lógica | UX | Tests | Optimización | Próximo salto |
|---|---|---|---|---|---|---|---|---|

Módulos obligatorios:
- Work Requests;
- Site Visits;
- Proposals;
- Purchase Orders;
- Orders/Service Cases;
- Planning;
- Execution;
- Evidences;
- Documents;
- Technical Reports;
- Delivery Records;
- SES;
- Invoices;
- Payments;
- Costs;
- Fleet;
- Tools/Assets;
- Checklists;
- Maintenance;
- Notifications;
- Dashboard;
- Privacy/Consent;
- WebAuthn;
- PWA/Offline.

---

# PLAN DE IMPLEMENTACIÓN QUE DEBES CREAR

Después de la auditoría, crear:

```txt
specs/009-auditoria-logica-optimizacion-context7/implementation-plan.md
specs/009-auditoria-logica-optimizacion-context7/implementation-slices.md
specs/009-auditoria-logica-optimizacion-context7/tasks.md
```

## El plan debe decir exactamente:

1. Qué archivo modificar.
2. Qué módulo afecta.
3. Qué lógica falta.
4. Qué contrato Zod crear/ajustar.
5. Qué endpoint crear/ajustar.
6. Qué service/hook frontend crear/ajustar.
7. Qué componente UI crear/ajustar.
8. Qué test agregar.
9. Qué criterio de aceptación usar.
10. Qué comando ejecutar.

---

## WAVE P0 — Bloqueantes de lógica/calidad

Debe incluir:
- proteger WIP;
- corregir `quality:strict`;
- corregir endpoints sin validación/RBAC;
- corregir rutas/acciones que no guardan;
- cerrar 400/401/500 si reaparecen;
- arreglar navegación crítica;
- eliminar mocks productivos.

## WAVE P1 — Lógica core del flujo 14 pasos

Debe incluir:
- gates de transición por paso;
- matriz de estado por orden;
- documentos requeridos por paso;
- evidencias requeridas;
- checklists bloqueantes;
- reglas de avance;
- timeline de orden;
- notificaciones de bloqueo.

## WAVE P2 — Módulos profesionales

Debe incluir:
- fleet readiness completo;
- herramientas con fotos/PDF/calibración/checklists;
- evidencias FSM con cámara/PDF/auditoría;
- costos ERP por orden;
- mantenimiento schedule/logs/SLA;
- dashboard KPIs accionables;
- notificaciones reales.

## WAVE P3 — Optimización

Debe incluir:
- índices Mongo;
- query limits;
- paginación;
- invalidación TanStack Query;
- lazy loading;
- reducción bundle;
- memoización donde tenga sentido;
- image optimization;
- PWA caching;
- reducción de refetch innecesario.

## WAVE P4 — Tests y calidad

Debe incluir:
- contract tests;
- backend integration tests;
- frontend component tests;
- Playwright E2E;
- mobile E2E;
- accessibility checks;
- smoke tests production-like.

---

# TASKS SPEC KIT 009

Si Spec 008 terminó en T297, continuar desde T298:

```md
# Tasks — Spec 009 Auditoría de Lógica, Optimización y Plan con Context7

## P0 — Setup y Context7
- [ ] T298 Crear spec 009.
- [ ] T299 Ejecutar baseline y clasificar WIP.
- [ ] T300 Consultar Context7 para Spec Kit.
- [ ] T301 Consultar Context7 para Next.js/React.
- [ ] T302 Consultar Context7 para TanStack Query/Zod.
- [ ] T303 Consultar Context7 para Radix/Playwright.
- [ ] T304 Consultar Context7 para Mongoose/SimpleWebAuthn/OWASP.
- [ ] T305 Crear context7-evidence.md.

## P0 — Auditoría
- [ ] T306 Extraer requisitos del LTG.
- [ ] T307 Auditar flujo de 14 pasos.
- [ ] T308 Auditar cinco fallas críticas vs módulos.
- [ ] T309 Auditar backend/contratos.
- [ ] T310 Auditar frontend/navegación.
- [ ] T311 Auditar optimización backend/frontend.
- [ ] T312 Auditar PWA/offline/archivos.
- [ ] T313 Crear scorecard de madurez.

## P1 — Plan
- [ ] T314 Crear implementation-plan.md.
- [ ] T315 Crear implementation-slices.md.
- [ ] T316 Crear tasks.md priorizado.
- [ ] T317 Crear risk-register.md.
- [ ] T318 Crear final-report.md.
```

---

# FORMATO DE RESPUESTA FINAL DEL AGENTE

```txt
# Spec 009 — Auditoría de lógica y optimización con Context7

## 1. Resumen ejecutivo
## 2. Fuentes leídas
## 3. Context7 consultado
## 4. Estado real de lógica de negocio
## 5. Estado del flujo de 14 pasos
## 6. Estado de cinco fallas críticas
## 7. Backend y contratos
## 8. Frontend, navegación y UX
## 9. Optimización backend/frontend/PWA
## 10. Scorecard por módulo
## 11. Plan de implementación
## 12. Tasks priorizadas
## 13. Riesgos
## 14. Comandos ejecutados
```

No implementes todavía. Entrega primero la auditoría, verificación y plan detallado.
