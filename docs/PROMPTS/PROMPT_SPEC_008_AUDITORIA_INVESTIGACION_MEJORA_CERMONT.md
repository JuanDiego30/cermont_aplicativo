# PROMPT MAESTRO — Spec Kit 008: Auditoría, investigación y plan de mejora continua CERMONT multiusos

Actúa como un **Principal Software Architect + Product Strategist + Staff Full Stack Engineer + DevOps/SRE + Security Engineer + UX Engineer**, experto en GitHub Spec Kit, Context7, Vercel docs, Next.js 16, React 19, Express 5.2.1, MongoDB/Mongoose, Zod 4.x, Contract-First, TanStack Query, RBAC, PWA/offline-first, FSM, CMMS/GMAO, ERP operativo, field service, asset management y refactorización incremental con pruebas.

Este prompt es para que el modelo **verifique, audite, investigue y cree un plan de implementación real** para seguir desarrollando CERMONT como aplicativo web multiusos. No es para crear documentación superficial ni para implementar a ciegas.

---

## 0. Objetivo

Crear y ejecutar una nueva especificación:

```txt
specs/008-auditoria-investigacion-mejora-continua-cermont/
```

La Spec 008 debe producir:

1. baseline técnico real;
2. auditoría de arquitectura;
3. auditoría frontend/backend;
4. auditoría de producto multiservicio;
5. investigación técnica con Context7;
6. análisis de Vercel como referencia, sin reemplazar VPS;
7. roadmap de innovación;
8. plan de implementación P0/P1/P2/P3;
9. slices ejecutables;
10. primer sprint recomendado;
11. Definition of Done por slice.

---

## 1. Contexto del producto

CERMONT debe evolucionar hacia una plataforma tipo:

```txt
FSM + CMMS/GMAO + ERP operativo + PWA offline + motor documental + trazabilidad financiera + SaaS configurable
```

El flujo central del negocio es:

```txt
Solicitud → Visita → Propuesta → PO → Orden → Planeación → Ejecución → Evidencias → Informe → Acta → SES → Factura → Pago → Cierre
```

El sistema debe resolver:

- planeación de recursos;
- evidencias de campo;
- herramientas;
- vehículos;
- checklists;
- documentos;
- costos reales;
- cierre administrativo;
- facturación y pagos;
- trazabilidad;
- auditoría;
- operación móvil;
- offline;
- seguridad;
- experiencia de usuario;
- escalabilidad comercial.

---

## 2. Fuentes obligatorias

Antes de proponer mejoras, leer:

```txt
REGLAS_DESARROLLO_CERMONT.md
LTG_JUAN_DIEGO_AREVALO-3_markdown.md
.specify/memory/constitution.md
specs/001-auditoria-integral-cermont/
specs/002-correcciones-post-auditoria-cermont/
specs/003-profesionalizacion-cermont/
specs/004-deploy-seguro-cermont/
specs/005-post-deploy-hotfix-and-real-implementation/
specs/006-frontend-excellence-cermont/
specs/007-codebase-memory-innovation-cermont/
docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
docs/API_STATUS.md
docs/DEVELOPMENT_STATUS.md
docs/architecture/
docs/product/
docs/security/
docs/deployment/
```

Si algún archivo no existe, registrarlo como faltante. No inventarlo.

---

## 3. Uso obligatorio de Context7

Usa Context7 para consultar documentación actualizada de tecnologías críticas antes de planear cambios.

Consultar como mínimo:

```txt
/vercel/next.js
```

Temas mínimos:

- App Router;
- metadata, icons y manifest;
- route handlers;
- middleware/proxy;
- image optimization;
- caching;
- error boundaries;
- loading/error/not-found files;
- instrumentation;
- performance;
- PWA/manifest;
- production readiness.

Crear:

```txt
specs/008-auditoria-investigacion-mejora-continua-cermont/context7-research.md
```

Formato:

| Tema | Recomendación de Context7 | Aplicación a CERMONT | Acción |
|---|---|---|---|

Regla: si Context7 contradice una implementación actual del repo, no cambiar código de inmediato. Primero registrar hallazgo y crear tarea.

---

## 4. Uso de Vercel como referencia, no reemplazo del VPS

El proyecto tiene regla de **VPS Only Deployment**. Por tanto, Vercel NO debe reemplazar el despliegue VPS salvo autorización explícita.

Usa Vercel solo como referencia para:

- builds productivos;
- variables de entorno;
- preview deployments opcionales para QA;
- logs;
- rollback conceptual;
- observabilidad;
- production readiness;
- source maps;
- comparación con pipeline VPS.

Crear:

```txt
specs/008-auditoria-investigacion-mejora-continua-cermont/vercel-reference-audit.md
```

Formato:

| Tema Vercel | Buena práctica | Equivalente en VPS CERMONT | Acción |
|---|---|---|---|

Toda propuesta con Vercel debe marcarse como una de estas:

```txt
REFERENCE_ONLY
OPTIONAL_PREVIEW_QA
BLOCKED_BY_VPS_ONLY_RULE
APPROVED_BY_USER
```

---

## 5. Reglas obligatorias del proyecto

1. No eliminar funcionalidad sin reemplazarla, mejorarla o escalarla.
2. Seguir Contract-First:
   ```txt
   Zod → tipo → modelo → service → controller → route → frontend service → query key → hook → UI → tests
   ```
3. SSOT para schemas, roles, permisos, rutas, estados, query keys y constantes.
4. Cero `any`.
5. Cero `unknown`, `null`, `undefined` explícitos si violan quality strict.
6. No hardcodear roles.
7. No fetch directo en componentes.
8. No lógica de negocio compleja en UI.
9. Loading/error/empty/offline/forbidden en módulos críticos.
10. RBAC en backend y frontend.
11. Auditoría en acciones críticas.
12. Idempotencia en mutaciones críticas.
13. Seguridad por diseño.
14. Offline-first en campo.
15. No deploy si fallan gates.
16. Documentación viva actualizada.
17. No crear módulos duplicados como `MediaAsset` si `FileAsset` ya es SSOT.
18. No prometer innovación sin MVP, test o plan verificable.

---

# PLAN DE IMPLEMENTACIÓN

## Fase 0 — Baseline y estado real

Ejecutar:

```bash
git status --short
git branch --show-current
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
npx react-doctor@latest
```

Crear:

```txt
specs/008-auditoria-investigacion-mejora-continua-cermont/baseline.md
```

Tabla:

| Gate | Resultado | Error principal | Bloquea avance | Acción |
|---|---|---|---|---|

Criterio: no planear implementación sin conocer los gates actuales.

---

## Fase 1 — Auditoría del mapa real del código

Usar `codebase-memory-mcp` si está disponible. Si no, usar `rg`, inspección local y mapas manuales.

Actualizar o crear:

```txt
docs/architecture/CODEBASE_MAP.md
docs/architecture/API_ROUTE_MAP.md
docs/architecture/FRONTEND_BACKEND_MATRIX.md
docs/architecture/DOMAIN_MODULE_MAP.md
docs/architecture/RBAC_PERMISSION_MAP.md
docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md
docs/architecture/PWA_OFFLINE_FLOW_MAP.md
```

Matriz frontend/backend:

| Pantalla | Hook/service | Endpoint llamado | Ruta backend real | Schema | RBAC | Estado | Acción |
|---|---|---|---|---|---|---|---|

Detectar:

- endpoints sin consumidor;
- consumidores sin endpoint;
- rutas con 400/401/500;
- schemas duplicados;
- módulos duplicados;
- direct fetch;
- lógica de negocio en UI;
- query keys inestables;
- RBAC inconsistente;
- formularios sin default values;
- mocks productivos;
- PWA/offline incompleto.

---

## Fase 2 — Auditoría de producto multiservicio

Crear:

```txt
docs/product/CERMONT_MULTISERVICE_PRODUCT_AUDIT.md
```

Evaluar módulos:

| Módulo | Estado actual | Nivel 0-5 | Falla que resuelve | Brecha profesional | Acción P0/P1/P2 |
|---|---|---|---|---|---|

Módulos mínimos:

- work requests;
- site visits;
- proposals;
- purchase orders;
- service cases / work orders;
- planning packets;
- execution sessions;
- evidences;
- file assets/documents;
- fleet/vehicles;
- tools/assets/resources;
- checklists;
- costs;
- reports;
- delivery records;
- SES;
- invoices;
- payments;
- dashboard;
- notifications;
- users/RBAC;
- offline sync;
- audit logs;
- settings;
- legal/privacy;
- deploy/observability.

---

## Fase 3 — Investigación de oportunidades de innovación

Crear:

```txt
docs/product/CERMONT_INNOVATION_ROADMAP.md
specs/008-auditoria-investigacion-mejora-continua-cermont/innovation-roadmap.md
```

Cada idea debe tener:

| Idea | Problema | Módulos afectados | MVP | Datos necesarios | Riesgo | Impacto | Prioridad |
|---|---|---|---|---|---|---|---|

Evaluar obligatoriamente:

### 3.1 CERMONT Operating System
Vista central por orden con timeline, bloqueos, siguiente acción, documentos faltantes, evidencias faltantes, responsable, costo, margen, estado administrativo y riesgo de cierre.

### 3.2 Digital Twin por orden
Gemelo digital con eventos, archivos, fotos, decisiones, aprobaciones, costos, auditoría e historial.

### 3.3 Motor unificado FileAsset
Unificar fotos, PDFs, evidencias, documentos, adjuntos, vehículos, herramientas, checklists e informes.

### 3.4 Motor de automatizaciones
Reglas tipo:

```txt
SI evidencia rechazada → devolver a ejecución
SI SOAT vence en 15 días → notificar
SI costo real > 80% estimado → alertar
SI checklist crítico falla → bloquear cierre
SI SES aprobada → crear tarea de factura
```

### 3.5 Copiloto operativo IA
MVP: resumir orden, detectar faltantes, generar borrador de informe, generar checklist desde PDF, explicar bloqueos y sugerir próxima acción.

Restricciones: todo resultado IA es borrador, no enviar datos sensibles sin consentimiento y registrar auditoría.

### 3.6 Planeación inteligente
Sugerir técnicos, herramientas, vehículos, kits, permisos, certificados, ruta, disponibilidad y conflictos.

### 3.7 QR/NFC para activos
Escanear herramienta/vehículo, ver ficha, check-in/check-out, checklist, reporte de daño y asignación a orden.

### 3.8 Constructor de formularios dinámicos
Plantillas versionadas, ítems condicionales, fotos requeridas, firmas, cálculos y exportación PDF.

### 3.9 Portal cliente/proveedor
Aprobar propuesta, subir PO, firmar acta, descargar informe, seguimiento SES/factura y comentarios.

### 3.10 SaaS multiempresa
Tenant model, branding, roles por tenant, feature flags, planes, auditoría por tenant y aislamiento de datos.

---

## Fase 4 — Priorización y roadmap

Crear:

```txt
specs/008-auditoria-investigacion-mejora-continua-cermont/implementation-roadmap.md
```

Priorizar con matriz:

| Slice | Impacto | Riesgo | Esfuerzo | Dependencias | Valor comercial | Prioridad |
|---|---|---|---|---|---|---|

Orden recomendado:

### P0 — Estabilización
1. Gates en verde.
2. Errores post-deploy.
3. `FileAsset` SSOT.
4. Auth/session.
5. Assets/PWA.
6. 400/401/500.
7. Smoke tests.

### P1 — Producto profesional
1. FileAsset completo.
2. Vehículos profesionales.
3. Herramientas profesionales.
4. Evidencias FSM.
5. Checklists bloqueantes.
6. Dashboard accionable.
7. Costos ERP.

### P2 — Innovación
1. Digital Twin por orden.
2. Automatizaciones.
3. Planeación inteligente.
4. QR/NFC.
5. Formularios dinámicos.
6. Copiloto IA.

### P3 — Comercialización
1. Multiempresa.
2. Feature flags.
3. Portal cliente.
4. Marketplace de plantillas.
5. Observabilidad avanzada.
6. Billing SaaS.

---

## Fase 5 — Crear slices ejecutables

Cada slice debe tener:

```txt
Objetivo
Estado actual
Archivos a revisar
Contratos Zod
Backend
Frontend
RBAC
PWA/offline
Auditoría
Tests
Docs
Riesgos
Criterios de aceptación
```

Crear estos slices:

```txt
slice-01-stabilization-and-gates.md
slice-02-fileasset-unification.md
slice-03-fleet-professionalization.md
slice-04-tools-assets-professionalization.md
slice-05-evidence-fsm.md
slice-06-checklists-blocking-engine.md
slice-07-dashboard-operating-system.md
slice-08-cost-intelligence.md
slice-09-automation-rules-engine.md
slice-10-digital-twin-order.md
slice-11-ai-copilot-safe-mvp.md
slice-12-saas-multitenancy-foundation.md
```

---

## Fase 6 — Plan técnico por slice

Para cada slice, seguir:

```txt
1. Impact Map
2. Contract update
3. Backend implementation
4. Frontend service/hook
5. UI
6. RBAC
7. Audit events
8. Offline/idempotency si aplica
9. Tests
10. Docs
11. Gates
```

Formato obligatorio:

```txt
## Impact Map
Cambio:
Módulo:
Schemas afectados:
Backend afectado:
Frontend afectado:
Tests afectados:
RBAC afectado:
PWA/offline afectado:
Deploy afectado:
Riesgo:
Rollback:
```

---

## Fase 7 — Validación final del plan

Ejecutar:

```bash
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
specs/008-auditoria-investigacion-mejora-continua-cermont/final-plan-report.md
docs/product/CERMONT_NEXT_DEVELOPMENT_PLAN.md
```

Formato final:

```txt
# CERMONT Next Development Plan

## 1. Estado actual
## 2. Hallazgos técnicos
## 3. Hallazgos de producto
## 4. Riesgos críticos
## 5. Investigación Context7
## 6. Investigación Vercel
## 7. Roadmap P0/P1/P2/P3
## 8. Slices ejecutables
## 9. Primer sprint recomendado
## 10. Definition of Done
```

---

# TASKS SPEC KIT 008

```md
# Tasks — Spec 008 Auditoría, investigación y mejora continua

## P0 — Investigación y baseline
- [ ] T253 Crear spec 008.
- [ ] T254 Ejecutar baseline de gates.
- [ ] T255 Consultar Context7 para Next.js.
- [ ] T256 Consultar Vercel docs como referencia.
- [ ] T257 Crear context7-research.md.
- [ ] T258 Crear vercel-reference-audit.md.

## P0 — Mapas
- [ ] T259 Actualizar CODEBASE_MAP.
- [ ] T260 Actualizar API_ROUTE_MAP.
- [ ] T261 Actualizar FRONTEND_BACKEND_MATRIX.
- [ ] T262 Actualizar RBAC_PERMISSION_MAP.
- [ ] T263 Actualizar MEDIA_EVIDENCE_FLOW_MAP.
- [ ] T264 Crear auditoría multiservicio.

## P1 — Producto e innovación
- [ ] T265 Crear CERMONT_MULTISERVICE_PRODUCT_AUDIT.md.
- [ ] T266 Crear CERMONT_INNOVATION_ROADMAP.md.
- [ ] T267 Priorizar CERMONT Operating System.
- [ ] T268 Priorizar Digital Twin por orden.
- [ ] T269 Priorizar FileAsset unificado.
- [ ] T270 Priorizar automatizaciones.
- [ ] T271 Priorizar Copiloto IA seguro.
- [ ] T272 Priorizar SaaS multiempresa.

## P1 — Plan ejecutable
- [ ] T273 Crear implementation-roadmap.md.
- [ ] T274 Crear 12 slices ejecutables.
- [ ] T275 Crear primer sprint recomendado.
- [ ] T276 Crear Definition of Done por slice.
- [ ] T277 Crear final-plan-report.md.

## P2 — Preparación implementación
- [ ] T278 Seleccionar slice P0.
- [ ] T279 Crear impact map.
- [ ] T280 Implementar primer slice si el usuario autoriza.
- [ ] T281 Ejecutar gates.
```

---

# DEFINITION OF DONE

La Spec 008 solo queda cerrada si:

1. se leyeron reglas del proyecto;
2. se consultó Context7;
3. se consultó Vercel como referencia, no como sustituto del VPS;
4. se actualizaron mapas de arquitectura;
5. se creó matriz frontend/backend;
6. se creó auditoría de producto multiservicio;
7. se creó roadmap de innovación;
8. se creó roadmap P0/P1/P2/P3;
9. se crearon slices ejecutables;
10. se definió primer sprint;
11. no se inventaron rutas ni módulos;
12. no se propuso romper reglas del proyecto;
13. todo está alineado con Contract-First, SSOT, RBAC, offline-first, auditoría y cero `any`;
14. quedó claro qué se implementa primero y qué se deja para después.

Empieza por Fase 0. No implementes código todavía: primero audita, investiga y crea el plan ejecutable.
