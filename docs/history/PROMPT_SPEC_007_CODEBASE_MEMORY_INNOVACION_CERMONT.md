# PROMPT MAESTRO — Spec Kit 007: Codebase Memory, Superpowers e Innovación CERMONT

Actúa como un **Principal Software Architect + Product Strategist + Staff Full Stack Engineer + AI Product Architect + SRE + Security Engineer**, experto en GitHub Spec Kit, codebase-memory-mcp, Claude Code, MCP, Superpowers, Next.js 16, React 19, Express 5.2.1, MongoDB/Mongoose, Zod contract-first, FSM, CMMS/GMAO, ERP operativo, PWA offline-first y productos SaaS comercializables.

Este prompt es para **escalar, refactorizar, estabilizar e innovar el aplicativo CERMONT**. No es para crear documentación vacía. El agente debe usar `codebase-memory-mcp` para crear un mapa real del código, detectar oportunidades de mejora y luego implementar por slices verificables.

---

## 0. Problema actual

El agente se está complicando navegando por el código porque el aplicativo tiene muchos módulos, endpoints, contratos, hooks, servicios y pantallas. Ya se han creado prompts/specs, pero varias funcionalidades siguen incompletas.

Problemas observados:

- errores post-deploy;
- assets 404;
- endpoints con 400/401/500;
- módulos simples tipo CRUD;
- vehículos sin gestión profesional;
- herramientas sin fotos/PDF/checklists;
- evidencias sin FSM real;
- checklists poco potentes;
- costos sin profundidad ERP;
- dashboard poco accionable;
- login biométrico móvil incompleto;
- poca navegación del agente por el código;
- falta de visión de producto innovadora y comercializable.

Ahora debes crear una fase nueva de trabajo: **mapear primero, decidir después, implementar por slices**.

---

## 1. Herramientas disponibles

El usuario instaló o quiere usar:

```bash
git clone https://github.com/DeusData/codebase-memory-mcp.git
```

También se trabajará con:

```txt
Claude Code / MCP / Superpowers
```

Si Superpowers está disponible, usar su metodología de brainstorming, spec, plan, implementación, revisión y TDD. Si Superpowers no está disponible, continuar manualmente con Spec Kit.

---

## 2. Reglas anti-alucinación

1. No inventes arquitectura, rutas, módulos, endpoints ni funcionalidades existentes.
2. Antes de tocar un módulo, consulta el mapa del código.
3. Antes de modificar una ruta, identifica consumidores frontend.
4. Antes de modificar un schema, identifica modelos, servicios, controllers, hooks y UI afectados.
5. No hacer cambios masivos sin impact map.
6. No introducir `any`.
7. No romper Zod/shared-types, RBAC, PWA/offline ni deploy.
8. No dejar mocks productivos.
9. No copiar código de repositorios externos.
10. No enviar datos sensibles a servicios AI externos sin aprobación.
11. No afirmar innovación sin prototipo, spec o implementación verificable.
12. No cerrar una fase sin pruebas.
13. No trabajar sobre `main` directamente.

---

## 3. Seguridad antes de usar MCP/skills

Antes de ejecutar herramientas externas:

```bash
git status --short
git checkout -b refactor/spec-007-codebase-memory-innovation
```

Verificar secretos:

```bash
git grep -n "JWT_SECRET\\|MONGODB_URI\\|PRIVATE_KEY\\|BEGIN RSA\\|BEGIN PRIVATE\\|SMTP_PASS\\|TOKEN\\|PASSWORD" || true
git ls-files | grep -E "^\\.env|/\\.env" || true
```

Si `codebase-memory-mcp` requiere permisos, documentar qué lee, qué escribe, qué archivos de configuración modifica, si corre local y si envía datos fuera de la máquina. No ejecutar scripts desconocidos sin inspeccionar.

---

## 4. Crear Spec Kit 007

Crear:

```txt
specs/007-codebase-memory-innovation-cermont/
```

Archivos mínimos:

```txt
spec.md
plan.md
tasks.md
codebase-memory-setup.md
codebase-map.md
domain-map.md
api-route-map.md
frontend-backend-consumption-map.md
dependency-risk-map.md
innovation-opportunity-radar.md
refactor-roadmap.md
implementation-slices.md
agent-navigation-playbook.md
commercialization-roadmap.md
ai-innovation-safety-plan.md
final-report.md
contracts/
  architecture-map-contract.md
  innovation-slice-contract.md
  module-refactor-contract.md
  ai-feature-contract.md
  commercialization-contract.md
```

---

# PLAN DE IMPLEMENTACIÓN

## FASE 0 — Verificar codebase-memory-mcp

```bash
codebase-memory-mcp --version || true
which codebase-memory-mcp || true
```

Desde la raíz del repo CERMONT, indexar el proyecto:

```txt
Index this project
```

Si está disponible la UI:

```bash
codebase-memory-mcp --ui=true --port=9749
```

Crear `specs/007-codebase-memory-innovation-cermont/codebase-memory-setup.md` con:

| Paso | Comando | Resultado | Riesgo | Decisión |
|---|---|---|---|---|

---

## FASE 1 — Crear mapa real del código

Usar `codebase-memory-mcp` para obtener:

- módulos backend;
- módulos frontend;
- rutas HTTP backend;
- rutas App Router frontend;
- schemas Zod;
- modelos Mongoose;
- controllers;
- services;
- middlewares;
- api clients;
- hooks TanStack Query;
- query keys;
- permisos RBAC;
- flujos PWA/offline;
- sistema de archivos/evidencias;
- auth/session/login;
- dashboard/KPIs;
- costos;
- vehículos;
- herramientas;
- checklists;
- notificaciones.

Crear:

```txt
docs/architecture/CODEBASE_MAP.md
docs/architecture/API_ROUTE_MAP.md
docs/architecture/FRONTEND_BACKEND_MATRIX.md
docs/architecture/DOMAIN_MODULE_MAP.md
docs/architecture/RBAC_PERMISSION_MAP.md
docs/architecture/PWA_OFFLINE_FLOW_MAP.md
docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md
```

Matriz frontend/backend:

| Frontend screen | Hook/service | Method | Endpoint | Backend route | Schema | RBAC | Estado |
|---|---|---|---|---|---|---|---|

No implementar todavía. Primero entender el sistema.

---

## FASE 2 — Detectar riesgos de arquitectura y refactor

Usar el mapa para encontrar:

1. endpoints no consumidos;
2. llamadas frontend a endpoints inexistentes;
3. modelos duplicados;
4. schemas duplicados;
5. componentes gigantes;
6. lógica de negocio en UI;
7. rutas sin RBAC;
8. endpoints sin tests;
9. formularios sin default values estables;
10. query keys duplicadas;
11. direct fetch en componentes;
12. módulos mezclados;
13. dependencias circulares;
14. funciones hub demasiado grandes;
15. archivos de alto riesgo;
16. errores silenciosos;
17. mocks productivos;
18. deuda post-deploy.

Crear:

```txt
docs/architecture/REFACTOR_RISK_REGISTER.md
specs/007-codebase-memory-innovation-cermont/dependency-risk-map.md
```

Formato:

| Riesgo | Módulo | Evidencia del mapa | Impacto | Refactor propuesto | Prioridad |
|---|---|---|---|---|---|

---

## FASE 3 — Radar de innovación multiservicios

Crear:

```txt
specs/007-codebase-memory-innovation-cermont/innovation-opportunity-radar.md
docs/product/INNOVATION_OPPORTUNITY_RADAR.md
```

Cada oportunidad debe tener:

| Oportunidad | Problema | Módulos afectados | Datos necesarios | Complejidad | Impacto | Riesgo | MVP | Métrica |
|---|---|---|---|---|---|---|---|---|

Evaluar como mínimo:

### 3.1 CERMONT Operating System
Unificar el flujo completo:

```txt
Solicitud → Visita → Propuesta → PO → Orden → Planeación → Ejecución → Evidencias → Informe → Acta → SES → Factura → Pago → Cierre
```

Debe mostrar estado, bloqueos, responsable, siguiente acción, documentos faltantes, evidencia faltante, costo y riesgo.

### 3.2 Copiloto operativo con IA
Asistente que resume órdenes, detecta documentos faltantes, evidencia insuficiente, siguiente acción, borrador de informe, checklist desde PDF, explicación de bloqueos y borradores de correo/acta/SES. Todo resultado AI debe ser borrador revisable y no debe enviar datos personales a IA externa sin autorización.

### 3.3 Motor de evidencia inteligente
Evidencias con fase before/during/after/correction/HSE, calidad de imagen, GPS opcional, EXIF, duplicados, checklist, bloqueos, auditoría de descarga.

### 3.4 Planeación inteligente de recursos
Sugerir técnicos, herramientas, vehículos, kits, documentos, permisos, ruta, disponibilidad, vencimientos y conflictos.

### 3.5 Optimización de agenda y despacho
Planificador por prioridad, ubicación, habilidades, herramientas, vehículo disponible, ventanas de tiempo, duración estimada y riesgos.

### 3.6 Mantenimiento preventivo/predictivo
Para vehículos, herramientas, CCTV, líneas de vida y activos: calendario preventivo, vencimiento de certificados/calibración, MTBF/MTTR, alertas por tendencia, órdenes automáticas e historial.

### 3.7 Digital Twin documental por orden
Cada orden tiene gemelo digital: timeline, documentos, fotos, costos, decisiones, responsables, auditoría, estado legal/contractual y riesgo.

### 3.8 Formularios dinámicos comerciales
Constructor con plantillas versionadas, reglas, condicionales, firmas, fotos requeridas, cálculos, aprobación y exportación PDF.

### 3.9 Portal cliente/proveedor
Estado de orden, aprobación de propuesta, carga de PO, firma de acta, seguimiento de factura, comentarios y descarga de informe.

### 3.10 Cost Intelligence / ERP operativo
Estimado vs real, margen, desviaciones, rentabilidad por cliente/tipo de servicio, alertas de sobrecosto y proyección de facturación.

### 3.11 QR/NFC para herramientas, vehículos y activos
Escanear herramienta/vehículo, ver ficha, check-in/check-out, checklist preuso, reportar daño y asignar a orden.

### 3.12 Offline field app avanzada
Sync queue, resolución de conflictos, idempotencia, evidencias offline, checklists offline, firmas offline y estado de sincronización.

### 3.13 Multiempresa / SaaS comercializable
Tenants, branding por empresa, dominios, planes, feature flags, límites, auditoría por tenant, roles por tenant y facturación de suscripción.

### 3.14 Marketplace de plantillas
Plantillas para CCTV, líneas de vida, mantenimiento, inspección HSE, vehículos, herramientas, informes y actas.

### 3.15 Motor de automatizaciones no-code
Reglas tipo:

```txt
SI documento vence en 15 días → notificar responsable
SI evidencia rechazada → devolver orden a ejecución
SI costo real supera 80% del estimado → alertar gerencia
SI checklist crítico falla → bloquear cierre
SI factura aprobada → crear tarea de seguimiento de pago
```

---

## FASE 4 — Roadmap de refactorización incremental

Crear:

```txt
docs/architecture/REFACTOR_ROADMAP.md
specs/007-codebase-memory-innovation-cermont/refactor-roadmap.md
```

Capas:

- Capa A — Estabilidad: deploy bugs, assets/PWA, 400/401/500, DialogTitle, logs, smoke tests.
- Capa B — Navegabilidad: CODEBASE_MAP, API_ROUTE_MAP, frontend-backend matrix, agent playbook.
- Capa C — Arquitectura: modular monolith limpio, domain events, unified attachments/media, workflow engine, state machines, audit events, notification event bus.
- Capa D — Producto profesional: vehículos, herramientas, evidencias, checklists, costos, dashboard, planificación.
- Capa E — Innovación: AI copilot, scheduling optimizer, predictive maintenance, digital twin, dynamic forms, QR/NFC, tenant SaaS.

---

## FASE 5 — Implementación por slices

Elegir slices de alto impacto. Cada slice debe seguir:

```txt
Spec → Contract Zod → Model → Service → Controller → Route → Frontend API → Query key → Hook → UI → Tests → Docs
```

Slices sugeridos:

1. **Codebase navigation infrastructure**: mapas, scripts, agent playbook.
2. **Unified Media/Evidence Engine**: Attachment/MediaAsset, ownerType/ownerId, camera/upload/PDF, metadata, permissions, audit, gallery UI.
3. **Fleet/Tools Professional Asset Layer**: fotos, documentos, certificados, vencimientos, readiness, QR, checklists.
4. **Workflow/Digital Twin per Order**: timeline, blockers, next action, missing evidence/docs, status engine.
5. **Automation Rules Engine**: triggers, conditions, actions, notifications, audit.
6. **AI Copilot MVP**: order summary, missing docs/evidence detector, report draft, safe AI boundary, human approval.
7. **Commercial SaaS Foundation**: tenant model, tenant-aware RBAC, feature flags, branding, audit per tenant.

---

## FASE 6 — Agent Navigation Playbook

Crear:

```txt
specs/007-codebase-memory-innovation-cermont/agent-navigation-playbook.md
docs/architecture/AGENT_NAVIGATION_PLAYBOOK.md
```

Antes de cada cambio el agente debe responder:

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
Plan de rollback:
```

---

## FASE 7 — Validación final

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

Si hay deploy:

```bash
curl -fsS https://cermontsas.shop/api/health
curl -I https://cermontsas.shop
```

Crear:

```txt
specs/007-codebase-memory-innovation-cermont/final-report.md
docs/product/INNOVATION_AND_REFACTOR_FINAL_REPORT.md
```

---

# TASKS SPEC KIT 007

Si Spec 006 terminó en T216, continuar:

```md
# Tasks — Spec 007 Codebase Memory + Innovation CERMONT

## P0 — Setup seguro
- [ ] T217 Crear rama/worktree seguro.
- [ ] T218 Auditar secretos antes de MCP.
- [ ] T219 Verificar instalación codebase-memory-mcp.
- [ ] T220 Indexar proyecto CERMONT.
- [ ] T221 Documentar setup MCP.

## P0 — Mapa de código
- [ ] T222 Crear CODEBASE_MAP.md.
- [ ] T223 Crear API_ROUTE_MAP.md.
- [ ] T224 Crear FRONTEND_BACKEND_MATRIX.md.
- [ ] T225 Crear DOMAIN_MODULE_MAP.md.
- [ ] T226 Crear RBAC_PERMISSION_MAP.md.
- [ ] T227 Crear PWA_OFFLINE_FLOW_MAP.md.
- [ ] T228 Crear MEDIA_EVIDENCE_FLOW_MAP.md.

## P1 — Riesgos y refactor
- [ ] T229 Detectar endpoints huérfanos.
- [ ] T230 Detectar llamadas frontend rotas.
- [ ] T231 Detectar duplicación de schemas/enums.
- [ ] T232 Detectar direct fetch en componentes.
- [ ] T233 Detectar lógica de negocio en UI.
- [ ] T234 Detectar dependencias circulares.
- [ ] T235 Crear REFACTOR_RISK_REGISTER.md.

## P1 — Innovación
- [ ] T236 Crear INNOVATION_OPPORTUNITY_RADAR.md.
- [ ] T237 Priorizar oportunidades por impacto/esfuerzo.
- [ ] T238 Diseñar CERMONT Operating System.
- [ ] T239 Diseñar AI Copilot MVP seguro.
- [ ] T240 Diseñar Digital Twin por orden.
- [ ] T241 Diseñar Scheduling/Resource Optimizer.
- [ ] T242 Diseñar Automation Rules Engine.
- [ ] T243 Diseñar SaaS multiempresa.

## P2 — Implementación inicial
- [ ] T244 Implementar agent navigation playbook.
- [ ] T245 Implementar slice Unified Media/Evidence Engine o completar si ya existe.
- [ ] T246 Implementar slice Fleet/Tools Professional Asset Layer.
- [ ] T247 Implementar slice Workflow/Digital Twin MVP.
- [ ] T248 Agregar tests de regresión.
- [ ] T249 Actualizar docs vivas.

## P3 — Validación
- [ ] T250 Ejecutar quality gates.
- [ ] T251 Ejecutar smoke tests.
- [ ] T252 Crear final report.
```

---

# FORMATO DE RESPUESTA OBLIGATORIO

Al terminar cada fase:

```txt
# Fase X — Resultado

## Qué se investigó
## Qué consultó codebase-memory
## Archivos revisados
## Hallazgos
## Oportunidades detectadas
## Cambios implementados
## Tests ejecutados
## Riesgos abiertos
## Siguiente fase
```

---

# DEFINITION OF DONE

Spec 007 solo queda cerrada si:

1. codebase-memory-mcp fue verificado o bloqueado con evidencia;
2. el repo fue indexado;
3. existe mapa real de módulos;
4. existe matriz frontend/backend;
5. existe mapa de endpoints;
6. existe registro de riesgos de refactor;
7. existe radar de innovación priorizado;
8. existe playbook de navegación para agentes;
9. se implementó mínimo un slice real de refactor o producto;
10. se ejecutaron tests;
11. no se introdujo `any`;
12. no se rompieron contratos;
13. no se rompió deploy;
14. documentación viva actualizada;
15. el reporte final explica qué innovaciones son MVP, P1/P2 y cuáles requieren validación con CERMONT.

Empieza por Fase 0. No implementes nada hasta tener el mapa del código.
