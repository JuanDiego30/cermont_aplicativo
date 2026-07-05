# PROMPT MAESTRO — Spec Kit 007: Auditoría total de implementación real, lógica pendiente y navegación CERMONT

Actúa como un **Staff Software Architect + Principal Full Stack Auditor + Product Manager FSM/CMMS/ERP + UX Navigation Architect + QA Lead + Release Engineer**.

Este prompt NO es para implementar de inmediato ni para crear más documentación vacía. Primero debes hacer una **auditoría técnica, funcional y de producto extremadamente completa** para verificar si los planes, prompts y specs anteriores realmente fueron implementados en código. Después de la auditoría, debes crear un plan de implementación ordenado, priorizado y ejecutable para corregir lo que falta.

---

## 0. Contexto

El aplicativo CERMONT S.A.S. ha pasado por varias specs/prompts ubicados en:

```txt
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
.sisyphus/plans/003-implementacion-real-cermont.md
```

Se han planteado muchas mejoras: hotfix post-deploy, assets/PWA, frontend excellence, dashboard/KPIs, fotos y documentos, vehículos con readiness, herramientas con fotos/PDF/checklists, evidencias FSM, checklists bloqueantes, costos tipo ERP, notificaciones, biometría/passkeys, legal/privacidad, autoría, deploy seguro, auditoría de endpoints, navegación y UX.

Pero aún se observan problemas: funcionalidades aparentemente no implementadas, navegación incompleta, formularios simples, módulos no conectados, rutas/botones sin acción y falta de claridad sobre el porcentaje real de implementación.

---

## 1. Objetivo principal

Crear y ejecutar:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/
```

para auditar con evidencia:

1. qué prompts/specs/planes existen;
2. qué tareas fueron realmente implementadas en código;
3. qué tareas solo quedaron documentadas;
4. qué módulos tienen backend pero no frontend;
5. qué módulos tienen frontend pero no backend;
6. qué módulos tienen UI pero no lógica;
7. qué módulos tienen endpoints pero no consumo frontend;
8. qué formularios no cumplen contratos;
9. qué navegación está rota, incompleta o mal organizada;
10. qué botones/acciones no hacen nada;
11. qué funcionalidades críticas faltan;
12. qué errores de deploy siguen abiertos;
13. qué mejoras de frontend no fueron aplicadas;
14. qué falta para llevar CERMONT a nivel profesional FSM/CMMS/ERP;
15. qué implementar primero con un plan realista.

---

## 2. Reglas anti-alucinación obligatorias

1. No inventes archivos. Usa `ls`, `find`, `grep`, `rg` o exploración real.
2. No digas que algo está implementado si no encuentras código real.
3. No marques una tarea como completada solo porque existe un `.md`.
4. No supongas endpoints: lista rutas reales del backend.
5. No supongas pantallas: lista rutas reales de Next.js.
6. No supongas consumo de API: busca `apiClient`, hooks, `useQuery`, `useMutation`, services.
7. No ocultes mocks: todo mock productivo debe quedar marcado.
8. No confundas botón visual con funcionalidad implementada.
9. No crees código antes de completar la auditoría.
10. No rompas WIP existente.
11. No uses `any`.
12. No ignores `quality:strict`.
13. No ignores errores de consola/deploy.
14. No cierres sin matrices y evidencia.
15. No hagas recomendaciones genéricas: cada recomendación debe mapear a archivo, módulo o ruta.
16. No implementes cambios masivos sin plan por slices.

---

## 3. GitHub Spec Kit

Si Spec Kit CLI existe, usa:

```txt
/speckit.specify
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.analyze
```

Si no existe, crea manualmente:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/
  spec.md
  plan.md
  tasks.md
  audit-log.md
  documentation-index.md
  implementation-coverage-matrix.md
  prompt-to-code-traceability.md
  module-status-matrix.md
  navigation-audit.md
  route-inventory.md
  api-consumption-matrix.md
  feature-gap-backlog.md
  frontend-ux-gap-analysis.md
  backend-logic-gap-analysis.md
  contract-compliance-gap.md
  test-coverage-gap.md
  deploy-issue-status.md
  implementation-roadmap.md
  final-audit-report.md
  contracts/
    module-readiness-contract.md
    navigation-contract.md
    feature-implementation-contract.md
    prompt-traceability-contract.md
```

---

# PLAN DE AUDITORÍA DETALLADO

---

## FASE 0 — Baseline y estado del repo

Ejecuta:

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
```

Si algún comando no existe, documentarlo.

Crear:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/audit-log.md
```

Tabla:

| Comando | Resultado | Observación |
|---|---|---|

No continuar sin saber si la base compila y qué WIP existe.

---

## FASE 1 — Inventario de documentación y planes

Lee todos los prompts/specs/planes indicados en el contexto y crea:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/documentation-index.md
```

Tabla:

| Documento | Existe | Fecha/estado | Objetivo | Tareas extraídas | Evidencia de implementación | Observación |
|---|---|---|---|---|---|---|

Resultado esperado: lista consolidada de todas las promesas funcionales hechas por los planes anteriores.

---

## FASE 2 — Trazabilidad prompt/spec → código

Crear:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/prompt-to-code-traceability.md
```

Tabla:

| Prompt/Spec | Requisito prometido | Módulo esperado | Archivo backend real | Archivo frontend real | Schema Zod | Test | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|

Estados permitidos:

```txt
implemented
partial
documentation-only
frontend-only
backend-only
schema-only
mock-only
broken
not-found
needs-manual-test
```

Reglas:
- Si solo existe documentación: `documentation-only`.
- Si existe UI sin endpoint: `frontend-only`.
- Si existe endpoint sin UI: `backend-only`.
- Si existe mock: `mock-only`.
- Si existe código pero falla test: `broken`.
- Si no se encuentra: `not-found`.

---

## FASE 3 — Inventario real de rutas frontend y navegación

Buscar rutas:

```bash
find frontend/src/app -maxdepth 6 -type f
find frontend/src/modules -maxdepth 5 -type f
rg "href=|router.push|navigate|Link" frontend/src
rg "sidebar|navigation|navItems|menu|routes" frontend/src
```

Crear:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/route-inventory.md
specs/007-auditoria-implementacion-real-y-navegacion/navigation-audit.md
```

Matriz:

| Ruta | Página existe | Aparece en menú | Tiene permiso RBAC | Tiene loading | Tiene error | Tiene empty | Tiene forbidden | Consume API | Estado UX | Observación |
|---|---|---|---|---|---|---|---|---|---|---|

Auditar:
- Dashboard.
- Work requests.
- Orders/service cases.
- Planning.
- Vehicles/fleet.
- Tools/assets/resources.
- Evidences.
- Documents.
- Checklists.
- Costs.
- Invoices.
- Payments.
- Notifications.
- Users/RBAC.
- Profile.
- Privacy/legal.
- About/autoría.
- Login.
- Biometría/passkeys.

Preguntas obligatorias:
1. ¿Hay rutas existentes que no aparecen en el menú?
2. ¿Hay menú que apunta a rutas inexistentes?
3. ¿Hay rutas bloqueadas por RBAC sin mensaje claro?
4. ¿Hay botones sin acción?
5. ¿Hay navegación duplicada?
6. ¿Hay módulos con nombres inconsistentes?
7. ¿Hay rutas inaccesibles en móvil?
8. ¿Hay deep links rotos?
9. ¿La navegación refleja el flujo de 14 pasos?
10. ¿Se entiende qué debe hacer el usuario después?

---

## FASE 4 — Inventario backend y consumo API real

Backend:

```bash
find backend/src/modules -maxdepth 4 -type f
rg "router\.|app\.use|API_MOUNTS|authenticate|authorize" backend/src
```

Frontend:

```bash
rg "apiClient|useQuery|useMutation|fetch\(" frontend/src
rg "queryKey|queryKeys" frontend/src packages
```

Crear:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/api-consumption-matrix.md
```

Tabla:

| Funcionalidad | Endpoint backend | Service frontend | Hook | Componente/Página | Query key | Auth/RBAC | Estado | Problema |
|---|---|---|---|---|---|---|---|---|

Detectar:
- endpoints huérfanos;
- frontend llama endpoints inexistentes;
- endpoints con método incorrecto;
- payloads incompatibles;
- hooks no usados;
- direct fetch en componentes;
- mocks productivos;
- 400/401/500 pendientes.

---

## FASE 5 — Auditoría de módulos profesionales

Crear:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/module-status-matrix.md
```

Tabla:

| Módulo | Backend | Frontend | Zod | API | RBAC | UI/UX | Tests | Estado profesional | Brechas |
|---|---|---|---|---|---|---|---|---|---|

Estados profesionales:

```txt
0 inexistente
1 básico
2 funcional
3 profesional
4 avanzado
5 comercializable
```

Auditar especialmente:

### Vehículos / flota
- fotos;
- galería;
- documentos PDF;
- vencimientos;
- readiness score;
- estado ready/incomplete/expired/blocked;
- alertas;
- historial;
- auditoría;
- UI profesional.

### Herramientas / activos
- fotos;
- PDF/manual/ficha/certificado;
- calibración;
- checklist;
- historial de asignación;
- bloqueo por vencimiento;
- auditoría;
- UI profesional.

### Evidencias
- cámara;
- ownerType/ownerId;
- fase before/during/after;
- aprobación/rechazo;
- GPS/metadata;
- auditoría descarga;
- bloqueo si usada en informe;
- galería FSM.

### Checklists
- plantillas;
- versionado;
- ítems obligatorios;
- ítems bloqueantes;
- comentario/foto requerida;
- integración con órdenes/herramientas/vehículos;
- mobile-first.

### Costos
- estimado vs real;
- mano de obra;
- materiales;
- herramientas;
- vehículos;
- terceros;
- margen;
- desviación;
- relación con factura/pago;
- UI ERP.

### Dashboard/KPIs
- KPIs accionables;
- flujo 14 pasos;
- alertas;
- documentos vencidos;
- evidencias pendientes;
- herramientas bloqueadas;
- vehículos incompletos;
- costos/margen;
- navegación a módulos.

### Notificaciones
- campana;
- unread count;
- mark as read;
- eventos reales;
- rutas directas;
- no 401 spam.

### Login/biometría
- login normal estable;
- refresh;
- passkeys/WebAuthn;
- fallback móvil;
- mensajes claros;
- no promesas sin catch.

---

## FASE 6 — Auditoría de lógica faltante

Crear:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/backend-logic-gap-analysis.md
specs/007-auditoria-implementacion-real-y-navegacion/frontend-ux-gap-analysis.md
specs/007-auditoria-implementacion-real-y-navegacion/contract-compliance-gap.md
```

Tabla:

| Brecha | Tipo | Módulo | Severidad | Impacto | Archivo afectado | Solución recomendada | Prioridad |
|---|---|---|---|---|---|---|---|

Tipos:
```txt
business-logic
frontend-ui
frontend-state
backend-service
backend-validation
api-contract
rbac
navigation
accessibility
offline-pwa
file-upload
security
test-gap
documentation
```

---

## FASE 7 — Auditoría de frontend/UI/UX/navegación

Crear:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/frontend-ux-gap-analysis.md
```

Revisar:
- layout general;
- sidebar/navbar;
- breadcrumbs;
- rutas activas;
- mobile navigation;
- formularios;
- tabs;
- cards;
- empty/loading/error/forbidden/offline states;
- modals/dialogs;
- tablas;
- filtros;
- búsqueda;
- paginación;
- acciones masivas;
- iconos;
- accesibilidad;
- consistencia con `DESIGN.md`.

Tabla:

| Pantalla | Problema UX | Evidencia | Impacto | Mejora recomendada | Prioridad |
|---|---|---|---|---|---|

---

## FASE 8 — Verificación de errores post-deploy

Crear:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/deploy-issue-status.md
```

Revisar si fueron corregidos:
- favicon 404;
- PWA icons 404;
- logo 404;
- async listener error;
- notifications 401;
- users detail 500;
- work requests 400;
- documents 400;
- Radix DialogTitle;
- WebAuthn/huella móvil.

Tabla:

| Error deploy | Estado actual | Evidencia | Solución aplicada | Falta | Prioridad |
|---|---|---|---|---|---|

---

## FASE 9 — Plan real de implementación por slices

Crear:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/implementation-roadmap.md
specs/007-auditoria-implementacion-real-y-navegacion/tasks.md
```

Priorizar:

### P0 — Bloqueantes
- errores de producción;
- navegación rota;
- endpoints 400/401/500;
- assets/PWA;
- login/session;
- permisos/RBAC;
- formularios que no guardan.

### P1 — Módulos core incompletos
- vehículos;
- herramientas;
- evidencias;
- documentos;
- checklists;
- órdenes;
- dashboard;
- notificaciones.

### P2 — Profesionalización
- costos ERP;
- analytics;
- mobile offline;
- WebAuthn/passkeys;
- autoría/legal;
- UX refinado.

### P3 — Comercialización futura
- multiempresa;
- configuración dinámica;
- roles configurables;
- plantillas por cliente;
- suscripción/licencia;
- exportación avanzada;
- API pública;
- auditoría de licencias.

Cada tarea debe tener:

| Task | Módulo | Tipo | Archivos probables | Criterio de aceptación | Tests | Prioridad |
|---|---|---|---|---|---|---|

---

## FASE 10 — Reporte final de auditoría

Crear:

```txt
specs/007-auditoria-implementacion-real-y-navegacion/final-audit-report.md
docs/audits/IMPLEMENTATION_REALITY_AUDIT.md
```

Formato:

```txt
# Auditoría de implementación real CERMONT

## 1. Resumen ejecutivo
## 2. Estado real del repositorio
## 3. Estado de documentación vs código
## 4. Trazabilidad prompt/spec → código
## 5. Estado de navegación
## 6. Estado de frontend
## 7. Estado de backend
## 8. Estado de contratos
## 9. Estado de módulos profesionales
## 10. Errores post-deploy
## 11. Lógica faltante
## 12. Riesgos técnicos
## 13. Riesgos de producto
## 14. Roadmap de implementación
## 15. Próximas acciones
```

---

# TASKS SPEC KIT 007

Si Spec 006 terminó en T216, continuar:

```md
# Tasks — Spec 007 Auditoría Implementación Real y Navegación

## P0 — Baseline y documentación
- [ ] T217 Crear spec 007.
- [ ] T218 Ejecutar baseline del repo.
- [ ] T219 Indexar prompts/specs/planes.
- [ ] T220 Extraer requisitos prometidos.
- [ ] T221 Crear documentation-index.md.
- [ ] T222 Crear prompt-to-code-traceability.md.

## P0 — Rutas, navegación y API
- [ ] T223 Inventariar rutas frontend.
- [ ] T224 Auditar navegación/sidebar/menú.
- [ ] T225 Inventariar endpoints backend.
- [ ] T226 Auditar consumo frontend de API.
- [ ] T227 Detectar mocks productivos.
- [ ] T228 Detectar botones/rutas sin acción.

## P1 — Módulos
- [ ] T229 Auditar vehículos/flota.
- [ ] T230 Auditar herramientas/activos.
- [ ] T231 Auditar evidencias/documentos.
- [ ] T232 Auditar checklists.
- [ ] T233 Auditar costos.
- [ ] T234 Auditar dashboard/KPIs.
- [ ] T235 Auditar notificaciones.
- [ ] T236 Auditar login/passkeys.

## P1 — Gaps
- [ ] T237 Crear module-status-matrix.md.
- [ ] T238 Crear backend-logic-gap-analysis.md.
- [ ] T239 Crear frontend-ux-gap-analysis.md.
- [ ] T240 Crear contract-compliance-gap.md.
- [ ] T241 Crear test-coverage-gap.md.
- [ ] T242 Crear deploy-issue-status.md.

## P2 — Roadmap
- [ ] T243 Crear implementation-roadmap.md.
- [ ] T244 Crear tasks.md priorizado.
- [ ] T245 Crear final-audit-report.md.
- [ ] T246 Actualizar docs/audits/IMPLEMENTATION_REALITY_AUDIT.md.
```

---

# FORMATO DE RESPUESTA DEL AGENTE

Al terminar:

```txt
# Auditoría Spec 007 — Resultado

## 1. Resumen ejecutivo
## 2. Qué documentación fue leída
## 3. Qué se prometió vs qué existe
## 4. Estado real por módulo
## 5. Estado de navegación
## 6. Estado de API/frontend/backend
## 7. Errores de deploy pendientes
## 8. Lógica faltante
## 9. Funcionalidades que solo están documentadas
## 10. Roadmap de implementación recomendado
## 11. Comandos ejecutados
## 12. Riesgos abiertos
```

No implementes todavía. Primero audita completamente y entrega evidencia.
