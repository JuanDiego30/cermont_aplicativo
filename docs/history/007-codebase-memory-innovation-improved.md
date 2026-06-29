# Plan Mejorado: Spec 007 — Codebase Memory + Innovation Radar CERMONT

> **Versión mejorada del plan original** `PROMPT_SPEC_007_CODEBASE_MEMORY_INNOVACION_CERMONT.md`
> **Mejoras clave**: Scope realista, detección de artefactos existentes, paralelización máxima, QA scenarios concretos por tarea, evidencia capturable, dependencias explícitas, perfiles de agente por tarea.

---

## TL;DR

> **Objetivo**: Mapear la base de código real de CERMONT (evitando alucinaciones), detectar brechas de arquitectura, generar un radar de innovación priorizado y entregar 1-2 slices implementados de alto valor.
> 
> **Enfoque**: No recrear lo que ya existe. No generar 20 documentos que nadie leerá. Priorizar mapas que desbloquean decisiones → radar accionable → 1 slice de producto real.
>
> **Lo que YA existe y NO se recrea**: `API_ENDPOINT_MATRIX.md`, `FRONTEND_ROUTE_MAP.md`, `CERMONT_ARCHITECTURE_BLUEPRINT.md`, `MODULE_ARCHITECTURE.md`, `MODULE_MATURITY_MATRIX.md`, `EVIDENCE_PAGE_FUNCTIONAL_REQUIREMENTS.md`, `AGENT_IMPLEMENTATION_PLAYBOOK.md`, `Multi-ERP Maturity Plan` (análisis detallado).
>
> **Brechas reales a cubrir**: `CODEBASE_MAP.md` (mapa físico de archivos), `FRONTEND_BACKEND_MATRIX.md` (consumo frontend→endpoint), `RBAC_PERMISSION_MAP.md` (matriz real), `MEDIA_EVIDENCE_FLOW_MAP.md` (flujo archivos subidos), `INNOVATION_OPPORTUNITY_RADAR.md` (priorizado, no lista de deseos).
>
> **Deliverables**:
> - 4 mapas de código reales (no especulativos)
> - 1 radar de innovación con 6 oportunidades priorizadas (no 15)
> - 1-2 slices implementados: Unified Media Engine + Fleet/Tools layer
> - 1 Agent Navigation Playbook actualizado
> - QA evidence en `.sisyphus/evidence/`
>
> **Estimated Effort**: Large (3-4 waves paralelas, ~40 tareas)
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: T1 (Secure Branch) → T2-T7 (Codebase Maps paralelos) → T10 (Innovation Radar) → T11-T14 (Slice Implementation) → F1-F4 (Verificación final)

---

## Context

### Análisis del Plan Original — Gaps Detectados

| Problema | Impacto | Solución en este plan |
|----------|---------|----------------------|
| Asume `codebase-memory-mcp` instalado. No lo está. | Bloqueo total si el MCP falla | Fallback: usar `explore`, `grep`, `codebase_search`, `glob` como herramientas de mapeo. No depende de un MCP externo no instalado. |
| 15 oportunidades de innovación sin priorizar | Parálisis por análisis | Reducir a 6 oportunidades con peso impacto/esfuerzo. Solo las top 3 pasan a diseño. |
| ~20 documentos de salida | Saturación de archivos, la mayoría se vuelve stale en 1 semana | Solo 6 mapas + 1 radar + 1 playbook. Usar tablas existentes como base, no recrear. |
| No detecta artefactos existentes | Recrea lo que ya existe, desperdicia tokens y tiempo | Mapeo previo de lo existente. Referencias a docs canónicos. Solo crear lo faltante. |
| Tareas sin QA scenarios | Ejecutor no puede verificar logro | Cada TODO tiene 2+ escenarios de verificación con comandos exactos. |
| Sin paralelización | Ejecución secuencial, 3x más lenta | Ondas paralelas identificadas con dependencias. 4 waves, 7-8 tareas paralelas por wave. |
| Sin evidencia capture | No hay rastro de ejecución | `./sisyphus/evidence/task-N-scenario.ext` obligatorio por tarea. |
| Perfiles de agente ausentes | El orquestador no sabe qué agente asignar | Cada tarea tiene Recommended Agent Profile + skills. |
| Dependencia externa no verificada | `codebase-memory-mcp` puede no existir o no funcionar | Verificación explícita en Fase 0. Si no disponible, fallback inmediato. |

### Estado Actual del Proyecto (Verificado)

**Ya existe — NO recrear:**
- `docs/architecture/API_ENDPOINT_MATRIX.md` — 52+ endpoints documentados con schemas, RBAC, audit, status
- `docs/architecture/FRONTEND_ROUTE_MAP.md` — 80+ rutas App Router con hooks, estados, RBAC
- `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` — Visión técnica
- `docs/architecture/MODULE_ARCHITECTURE.md` — 40+ módulos backend documentados
- `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — 14 pasos del flujo de negocio
- `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` — Visión de producto
- `docs/product/MODULE_MATURITY_MATRIX.md` — 26 módulos evaluados (nivel 0-5)
- `docs/product/EVIDENCE_PAGE_FUNCTIONAL_REQUIREMENTS.md` — Spec detallada de evidencias
- `docs/product/COST_ENGINE_SPEC.md` — Spec motor de costos
- `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md` — Playbook para agentes AI
- `docs/domain/notification-events.md` — Eventos de notificación
- `docs/plans/CERMONT_REBUILD_ROADMAP.md` — Roadmap 23 fases
- `docs/architecture/MODULE_ARCHITECTURE.md` — Mapa de módulos backend
- `.sisyphus/plans/cermont-multi-erp-maturity-plan.md` — Análisis profundo multi-ERP

**NO existe — CREAR:**
- `docs/architecture/CODEBASE_MAP.md` — Mapa físico archivo-por-archivo
- `docs/architecture/FRONTEND_BACKEND_MATRIX.md` — Matriz consumo frontend→endpoint
- `docs/architecture/RBAC_PERMISSION_MAP.md` — Matriz permisos real por rol/endpoint
- `docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md` — Flujo de archivos subidos
- `docs/product/INNOVATION_OPPORTUNITY_RADAR.md` — Radar priorizado
- `docs/architecture/AGENT_NAVIGATION_PLAYBOOK.md` — Playbook actualizado con impact map
- `specs/007-codebase-memory-innovation-cermont/` — Directorio con informes

### Herramienta codebase-memory-mcp

**Estado**: NO INSTALADA (`Get-Command codebase-memory-mcp` → no output)

**Decisión**: Usar herramientas nativas como fallback:
- `glob` + `grep` → mapeo de archivos
- `codebase_search` → búsqueda semántica de módulos
- `explore` agent → análisis estructural
- `lsp_find_references` → rastreo de dependencias
- Análisis manual de `backend/src/modules/` y `frontend/src/modules/` como fuente única de verdad

---

## Work Objectives

### Core Objective
Transformar CERMONT de una aplicación con documentación parcial a una base de código completamente mapeada, con un radar de innovación priorizado y 1-2 slices de producto profesional implementados y verificados.

### Concrete Deliverables
1. **CODEBASE_MAP.md** — Mapa físico: cada archivo backend/frontend/packages con propósito y conexiones
2. **FRONTEND_BACKEND_MATRIX.md** — Cada pantalla frontend → hook → endpoint → schema → estado
3. **RBAC_PERMISSION_MAP.md** — Matriz real de permisos por rol/endpoint/ruta
4. **MEDIA_EVIDENCE_FLOW_MAP.md** — Flujo completo: upload → almacenamiento → metadata → delivery
5. **INNOVATION_OPPORTUNITY_RADAR.md** — 6 oportunidades priorizadas con MVP definido
6. **AGENT_NAVIGATION_PLAYBOOK.md** — Playbook actualizado con sección "Impact Map" obligatoria
7. **Slice implementado #1**: Unified Media Engine (Attachment/MediaAsset unificado)
8. **Slice implementado #2**: Fleet/Tools layer profesional (vehículos, herramientas)
9. **Evidencia de QA** en `.sisyphus/evidence/`

### Definition of Done
- [ ] Todos los mapas existen en `docs/architecture/`
- [ ] El radar de innovación existe en `docs/product/`
- [ ] El playbook actualizado existe en `docs/agents/`
- [ ] Slice Unified Media Engine: schema, modelo, servicio, ruta, hook, UI implementados
- [ ] Slice Fleet/Tools: schema, modelo, servicio, ruta, hook, UI implementados
- [ ] `npm run typecheck` → exit 0
- [ ] `npm run lint` → exit 0 (sin nuevos issues)
- [ ] `npm run test` → exit 0
- [ ] `npm run build` → exit 0
- [ ] `npm run contracts:check` → PASS
- [ ] `npm run quality:strict` → PASS (o delta documentado)
- [ ] 0 `any` introducidos
- [ ] No se rompió deploy (health check ok si aplica)

### Must Have
- Mapas basados en código REAL, no especulación
- Unified Media Engine con ownerType/ownerId genérico
- Fleet/Tools con fotos, documentos, certificados, vencimientos
- QA evidence capturada para cada tarea
- Plan verificado contra implementación real

### Must NOT Have (Guardrails)
- NO recrear API_ENDPOINT_MATRIX.md, FRONTEND_ROUTE_MAP.md ni otros docs existentes
- NO inventar endpoints, módulos, schemas ni componentes
- NO código duplicado — si existe Attachment, extenderlo, no crear otro
- NO `any`, `unknown`, `null` ni `undefined` por ausencia
- NO romper PWA/offline existente
- NO modificar `package.json` sin aprobación explícita
- NO mock data en producción
- NO introducir dependencias externas sin aprobación

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (vitest, Playwright, 1091 tests existentes)
- **Automated tests**: YES (TDD) — cada slice implementado sigue RED→GREEN→REFACTOR
- **Framework**: vitest (backend), vitest+Playwright (frontend)
- **Existing tests must pass**: `npm run test` antes y después de cada cambio

### QA Policy
Cada TODO incluye 2+ escenarios de verificación ejecutables por agente:
- **Mapas/archivos**: `Test-Path`, `Get-Content`, `Select-String` para verificar existencia y contenido
- **Backend**: curl/Bash para verificar endpoints
- **Frontend**: Playwright para verificar UI
- **TypeScript**: `tsc --noEmit` para verificar tipos
- **Evidence**: captura siempre en `.sisyphus/evidence/task-{N}-{scenario}.{ext}`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 — Setup + Codebase Independence (arranque inmediato):
├── T1: Secure branch + secret audit [quick]
├── T2: CODEBASE_MAP.md — backend [explore]
├── T3: CODEBASE_MAP.md — frontend [explore]
├── T4: CODEBASE_MAP.md — packages [explore]
├── T5: FRONTEND_BACKEND_MATRIX.md [explore]
├── T6: RBAC_PERMISSION_MAP.md + MEDIA_EVIDENCE_FLOW_MAP.md [explore]
├── T7: AGENT_NAVIGATION_PLAYBOOK.md actualizado [writing]
└── T8: Innovation Radar — research [librarian]

Wave 2 — Consolidación + Diseño de Slices (después de Wave 1):
├── T9: Innovation Radar — síntesis y priorización [deep]
├── T10: Diseño Unified Media Engine — contract + spec [deep]
├── T11: Diseño Fleet/Tools — contract + spec [deep]
├── T12: Refactor risk register [unspecified-high]
└── T13: Verificación de mapas vs código real [explore]

Wave 3 — Implementación de Slices (después de Wave 2):
├── T14: Implementar Unified Media Engine — schema + modelo [quick]
├── T15: Implementar Unified Media Engine — service + controller + route [unspecified-high]
├── T16: Implementar Unified Media Engine — frontend hooks + UI [visual-engineering]
├── T17: Implementar Fleet/Tools — schema + modelo [quick]
├── T18: Implementar Fleet/Tools — service + controller + route [unspecified-high]
├── T19: Implementar Fleet/Tools — frontend hooks + UI [visual-engineering]
└── T20: Tests de regresión + integración [deep]

Wave FINAL — Verificación:
├── F1: Plan Compliance Audit (oracle)
├── F2: Code Quality Review (unspecified-high)
├── F3: Real QA + evidence consolidation (unspecified-high)
└── F4: Scope Fidelity Check (deep)
→ Presentar resultados → Esperar OK del usuario

Critical Path: T1 → T2-T8 (paralelo) → T9 → T10-T11 → T14-T16 → F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 7 tasks (Wave 1)
```

### Dependency Matrix
- **T1** (branch + secrets): blocks all others
- **T2, T3, T4** (CODEBASE_MAP): parallel, unblock T5, T9
- **T5** (FRONTEND_BACKEND_MATRIX): depends T2,T3, unblocks T9, T12
- **T6** (RBAC + MEDIA): parallel with T5, unblocks T9
- **T7** (AGENT PLAYBOOK): parallel, no downstream dependencies
- **T8** (INNOVATION RESEARCH): independent, unblocks T9
- **T9** (INNOVATION RADAR): depends T5,T6,T8, unblocks T10,T11
- **T10** (MEDIA ENGINE DESIGN): depends T9, unblocks T14,T15,T16
- **T11** (FLEET DESIGN): depends T9, unblocks T17,T18,T19
- **T12** (RISK REGISTER): depends T5,T6, unblocks nothing (doc only)
- **T13** (VERIFY MAPS): depends T2,T3,T4,T5, verifies quality
- **T14-T19** (IMPLEMENTATION): depends T10,T11, parallel groups
- **T20** (TESTS): depends T14-T19, unblocks F1-F4
- **F1-F4** (FINAL): depends T20, parallel

### Agent Dispatch Summary
- **Wave 1** (8 tasks): 4× explore, 1× quick, 1× writing, 1× librarian, 1× explore
- **Wave 2** (5 tasks): 1× deep, 2× deep, 1× unspecified-high, 1× explore
- **Wave 3** (7 tasks): 2× quick, 2× unspecified-high, 2× visual-engineering, 1× deep
- **Final** (4 tasks): 1× oracle, 1× unspecified-high, 1× unspecified-high, 1× deep

---

## TODOs

### Wave 1 — Setup + Codebase Mapping (Start Immediately, 8 tasks in parallel)

- [x] 1. **Secure Branch + Secret Audit**

  **What to do**:
  - Verify `git status` is clean (stash/discard if needed)
  - Create branch `refactor/spec-007-memory-innovation` desde el branch base correcto (actualmente: audit/business-logic-state o SPEC-003)
  - Run `git grep -n "JWT_SECRET\|MONGODB_URI\|PRIVATE_KEY\|BEGIN RSA\|SMTP_PASS\|PASSWORD"` para detectar secretos en el repo
  - Run `git ls-files | grep -E "^\.env|/\.env"` para detectar archivos .env no ignorados
  - Si se encuentran secretos: notificar, NO commiter, NO pushear
  - Si el repo está limpio: confirmar y proceder

  **Must NOT do**:
  - No exponer secretos en logs o output
  - No modificar `.env` ni `.gitignore`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Tarea operativa simple con comandos conocidos
  - **Skills**: [] (no skills needed)

  **Parallelization**:
  - **Can Run In Parallel**: YES (blocks all others)
  - **Parallel Group**: Wave 1, Foundation
  - **Blocks**: T2-T8
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] Branch exists: `git branch --list refactor/spec-007-memory-innovation`
  - [ ] Secret scan output captured: no secrets found OR issue documented
  - [ ] Evidence file created

  **QA Scenarios**:
  ```
  Scenario: Verify branch creation
    Tool: Bash
    Steps:
      1. git branch --list refactor/spec-007-memory-innovation
      2. Test-Path -Path ".sisyphus/evidence/task-1-branch-created.md"
    Expected Result: Branch exists and evidence captured
    Evidence: .sisyphus/evidence/task-1-branch-created.txt

  Scenario: Verify secret scan
    Tool: Bash
    Steps:
      1. Run git grep for sensitive patterns
      2. Document any hits (or clean status)
    Expected Result: Clean or documented securit issues
    Evidence: .sisyphus/evidence/task-1-secret-scan.txt
  ```

  **Commit**: YES
  - Message: `chore(spec-007): create secure branch and audit secrets`
  - Files: `.sisyphus/evidence/task-1-*`
  - Pre-commit: `npm run typecheck` (no code changes expected)

- [x] 2. **CODEBASE_MAP.md — Backend Modules (40+ modules)**

  **What to do**:
  - Explorar `backend/src/modules/` con `Get-ChildItem -Directory`
  - Para cada módulo: leer su structure, identificar routes, controllers, services, models
  - Leer `backend/src/index.ts` para ver API_MOUNTS y endpoints registrados
  - Leer `backend/src/server.ts` para entender bootstrap
  - Leer `backend/src/common/` para entender middlewares, errores, utils
  - NO inventar modules. Usar SOLO lo que existe en disco.
  - Crear `docs/architecture/CODEBASE_MAP.md` con formato tabular:

  ```markdown
  # CODEBASE MAP — Backend

  ## Module Inventory
  | Module | Routes | Controller | Service | Model | Dependencies | Status |
  |--------|--------|------------|---------|-------|-------------|--------|
  | auth | auth.routes.ts | auth.controller.ts | auth.service.ts | User | jwt, bcrypt | verified |
  ```

  **Must NOT do**:
  - No incluir módulos que no existen en disco
  - No especular sobre funcionalidad
  - Usar `Get-ChildItem` y `Get-Content`, no adivinar

  **Recommended Agent Profile**:
  - **Category**: `explore`
    - Reason: Reconocimiento estructurado de codebase
  - **Skills**: [] (explore tiene herramientas de búsqueda)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T3, T4)
  - **Blocks**: T5, T9, T13
  - **Blocked By**: T1

  **References**:
  - `backend/src/index.ts` — Punto de entrada con API_MOUNTS
  - `backend/src/server.ts` — Bootstrap
  - `backend/src/modules/` — Todos los módulos
  - `docs/architecture/MODULE_ARCHITECTURE.md` — Documento arquitectónico existente (NO reemplazar)

  **Acceptance Criteria**:
  - [ ] `docs/architecture/CODEBASE_MAP.md` creado
  - [ ] Cada módulo backend listado con su estructura real
  - [ ] API_MOUNTS de index.ts documentados
  - [ ] Dependencias entre módulos mapeadas

  **QA Scenarios**:
  ```
  Scenario: Verify CODEBASE_MAP exists and covers modules
    Tool: Bash
    Steps:
      1. Test-Path "docs/architecture/CODEBASE_MAP.md"
      2. Get-ChildItem backend/src/modules | ForEach-Object { Select-String -Path "docs/architecture/CODEBASE_MAP.md" -Pattern $_.Name }
      3. Get-Content "docs/architecture/CODEBASE_MAP.md" | Measure-Object -Line
    Expected Result: File exists with 100+ lines, all modules covered
    Evidence: .sisyphus/evidence/task-2-codebase-map-verified.txt

  Scenario: Verify no hallucinated modules
    Tool: Bash
    Steps:
      1. grep "hallucinated\|fake\|mock\|placeholder" docs/architecture/CODEBASE_MAP.md || echo "CLEAN"
    Expected Result: No hallucinated content markers found
    Evidence: .sisyphus/evidence/task-2-no-hallucinations.txt
  ```

  **Commit**: YES (groups with T3, T4)
  - Message: `docs(spec-007): create CODEBASE_MAP.md with real backend module inventory`
  - Files: `docs/architecture/CODEBASE_MAP.md`

- [x] 3. **CODEBASE_MAP.md — Frontend Modules (30+ modules)**

  **What to do**:
  - Explorar `frontend/src/modules/` con `Get-ChildItem -Directory`
  - Para cada módulo: api/, hooks/, ui/, queries.ts, types/
  - Leer `frontend/src/app/` para mapear rutas App Router
  - Leer `frontend/src/lib/` para api-client, auth store, providers
  - Anexar a `docs/architecture/CODEBASE_MAP.md` sección Frontend

  **Must NOT do**:
  - No inventar módulos
  - No duplicar FRONTEND_ROUTE_MAP.md

  **Recommended Agent Profile**:
  - **Category**: `explore`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T4)
  - **Blocks**: T5, T9, T13
  - **Blocked By**: T1

  **References**:
  - `frontend/src/modules/` — Feature modules
  - `frontend/src/app/` — App Router pages
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` — Ruta existente (NO recrear)

  **Acceptance Criteria**:
  - [ ] CODEBASE_MAP.md actualizado con sección Frontend
  - [ ] Cada módulo frontend listado
  - [ ] Estructura api/hooks/ui/queries documentada

  **QA Scenarios**:
  ```
  Scenario: Frontend modules covered
    Tool: Bash
    Steps:
      1. Get-ChildItem frontend/src/modules | ForEach-Object { Select-String -Path "docs/architecture/CODEBASE_MAP.md" -Pattern $_.Name }
    Expected Result: All frontend modules found in map
    Evidence: .sisyphus/evidence/task-3-frontend-modules.txt
  ```

  **Commit**: YES (groups with T2)

- [x] 4. **CODEBASE_MAP.md — Packages (shared-types, domain, config)**

  **What to do**:
  - Explorar `packages/shared-types/src/` — schemas Zod, types
  - Explorar `packages/domain/src/` — roles, permissions, helpers
  - Explorar `packages/config/src/` — env validation
  - Anexar a `docs/architecture/CODEBASE_MAP.md` sección Packages
  - Documentar qué schemas existen, cuáles son legacy (`zod/` dir) vs modernos (`schemas/` dir)

  **Must NOT do**:
  - No incluir packages que no existen
  - No modificar código de packages

  **Recommended Agent Profile**:
  - **Category**: `explore`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T3)
  - **Blocks**: T5, T9, T13
  - **Blocked By**: T1

  **Acceptance Criteria**:
  - [ ] CODEBASE_MAP.md actualizado con sección Packages
  - [ ] shared-types schemas documentados
  - [ ] domain roles/permissions documentados

  **QA Scenarios**:
  ```
  Scenario: Packages section exists
    Tool: Bash
    Steps:
      1. Select-String -Path "docs/architecture/CODEBASE_MAP.md" -Pattern "Packages"
    Expected Result: Packages section found
    Evidence: .sisyphus/evidence/task-4-packages-section.txt
  ```

  **Commit**: YES (groups with T2, T3)

- [x] 5. **FRONTEND_BACKEND_MATRIX.md**

  **What to do**:
  - Para cada ruta frontend en `FRONTEND_ROUTE_MAP.md`, rastrear:
    - Qué hook TanStack Query usa (useOrders, useProposal, etc.)
    - Qué endpoint backend llama (GET /api/orders, etc.)
    - Qué schema Zod valida la respuesta
    - Qué rol RBAC requiere
    - Estado actual (IMPLEMENTED, REQUIRED, etc.)
  - Leer `frontend/src/modules/*/queries.ts` y `frontend/src/modules/*/api/*.ts`
  - Crear `docs/architecture/FRONTEND_BACKEND_MATRIX.md` con formato:
    ```markdown
    | Frontend Route | Module | Hook | Method | Endpoint | Schema | RBAC | Status |
    |---------------|--------|------|--------|----------|--------|------|--------|
    | /orders | orders | useOrders | GET | /api/orders | OrderSchema | all auth | IMPLEMENTED |
    ```
  - Detectar y marcar:
    - Pantallas cuyo hook llama a endpoint inexistente
    - Endpoints sin schema Zod
    - Discrepancias entre frontend espera y backend entrega

  **Must NOT do**:
  - No inventar hooks, endpoints ni schemas
  - No recrear API_ENDPOINT_MATRIX.md ni FRONTEND_ROUTE_MAP.md

  **Recommended Agent Profile**:
  - **Category**: `explore`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (depends on T2,T3 being done)
  - **Parallel Group**: Wave 1 (after T2,T3 complete)
  - **Blocks**: T9, T12
  - **Blocked By**: T2, T3

  **References**:
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` — Rutas frontend
  - `docs/architecture/API_ENDPOINT_MATRIX.md` — Endpoints backend
  - `frontend/src/modules/*/queries.ts` — Hooks TanStack Query
  - `packages/shared-types/src/schemas/` — Zod schemas

  **Acceptance Criteria**:
  - [ ] `docs/architecture/FRONTEND_BACKEND_MATRIX.md` creado
  - [ ] Cada ruta frontend tiene su hook y endpoint mapeados
  - [ ] Discrepancias detectadas documentadas
  - [ ] Schemas Zod referenciados correctamente

  **QA Scenarios**:
  ```
  Scenario: Matrix covers all FRONTEND_ROUTE_MAP routes
    Tool: Bash
    Steps:
      1. $routes = Select-String -Path "docs/architecture/FRONTEND_ROUTE_MAP.md" -Pattern "^\| \d+ \|" | Measure-Object
      2. $matrix = Select-String -Path "docs/architecture/FRONTEND_BACKEND_MATRIX.md" -Pattern "^\| /" | Measure-Object
    Expected Result: Matrix rows >= 80% of route rows
    Evidence: .sisyphus/evidence/task-5-matrix-coverage.txt

  Scenario: No orphan endpoints or broken references
    Tool: Bash
    Steps:
      1. grep "REQUIRED_NOT_IMPLEMENTED\|BROKEN\|MISSING" docs/architecture/FRONTEND_BACKEND_MATRIX.md || echo "NO_ISSUES"
    Expected Result: Issues are documented, not hidden
    Evidence: .sisyphus/evidence/task-5-discrepancies.txt
  ```

  **Commit**: YES
  - Message: `docs(spec-007): create FRONTEND_BACKEND_MATRIX.md with consumption mapping`
  - Files: `docs/architecture/FRONTEND_BACKEND_MATRIX.md`

- [x] 6. **RBAC_PERMISSION_MAP.md + MEDIA_EVIDENCE_FLOW_MAP.md**

  **What to do**:
  - **RBAC MAP**:
    - Leer `packages/domain/src/` para roles y helpers
    - Leer middlewares `authenticate` y `authorize` en backend
    - Para cada endpoint en API_ENDPOINT_MATRIX: qué rol requiere
    - Para cada ruta en FRONTEND_ROUTE_MAP: qué rol requiere
    - Crear `docs/architecture/RBAC_PERMISSION_MAP.md` con matriz CRUD×rol×módulo
  - **MEDIA EVIDENCE FLOW MAP**:
    - Leer módulo `evidence/` en backend (modelo, servicio, upload)
    - Leer módulo `evidences/` en frontend (hooks, UI, upload)
    - Rastrear: upload → middleware (multer/multipart) → storage (local/S3) → metadata (MongoDB) → delivery (GET /api/files/:id)
    - Leer `docs/product/EVIDENCE_PAGE_FUNCTIONAL_REQUIREMENTS.md` para entender el diseño funcional
    - Crear `docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md` con diagrama de flujo y tabla de componentes

  **Must NOT do**:
  - No asumir permisos — verificar en código
  - No inventar flujos de archivos

  **Recommended Agent Profile**:
  - **Category**: `explore`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (independent of T2-T5)
  - **Parallel Group**: Wave 1
  - **Blocks**: T9, T10 (evidence flow desbloquea diseño de Unified Media Engine)
  - **Blocked By**: T1

  **References**:
  - `packages/domain/src/` — Roles y permisos
  - `backend/src/modules/evidence/` — Backend evidence
  - `frontend/src/modules/evidences/` — Frontend evidences
  - `backend/src/middlewares/` — Auth middlewares
  - `docs/product/EVIDENCE_PAGE_FUNCTIONAL_REQUIREMENTS.md` — Spec funcional

  **Acceptance Criteria**:
  - [ ] `docs/architecture/RBAC_PERMISSION_MAP.md` creado
  - [ ] `docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md` creado
  - [ ] Matriz de permisos completa (80%+ de endpoints mapeados)
  - [ ] Flujo de archivos documentado: upload→storage→metadata→delivery

  **QA Scenarios**:
  ```
  Scenario: RBAC map exists and has content
    Tool: Bash
    Steps:
      1. Get-Content "docs/architecture/RBAC_PERMISSION_MAP.md" | Measure-Object -Line
    Expected Result: File has 50+ lines of content
    Evidence: .sisyphus/evidence/task-6-rbac-map.txt

  Scenario: Media flow map exists and has content
    Tool: Bash
    Steps:
      1. Get-Content "docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md" | Measure-Object -Line
    Expected Result: File has 30+ lines of content
    Evidence: .sisyphus/evidence/task-6-media-flow.txt
  ```

  **Commit**: YES
  - Message: `docs(spec-007): create RBAC_PERMISSION_MAP and MEDIA_EVIDENCE_FLOW_MAP`
  - Files: `docs/architecture/RBAC_PERMISSION_MAP.md`, `docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md`

- [x] 7. **AGENT_NAVIGATION_PLAYBOOK.md actualizado**

  **What to do**:
  - Leer `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md` existente
  - Añadir sección "Pre-Change Impact Map" obligatoria:
    ```markdown
    ## Pre-Change Impact Map (OBLIGATORIO antes de cada cambio)

    Todo agente debe responder antes de modificar código:

    | Campo | Respuesta |
    |-------|-----------|
    | Cambio propuesto | |
    | Módulo(s) afectados | |
    | Schemas Zod afectados | |
    | Backend (routes/controllers/services) | |
    | Frontend (routes/hooks/UI) | |
    | Tests afectados | |
    | RBAC afectado | |
    | PWA/offline afectado | |
    | Deploy afectado | |
    | Riesgo (Alto/Medio/Bajo) | |
    | Plan de rollback | |
    ```
  - Añadir referencia a CODEBASE_MAP.md como fuente de verdad
  - Añadir sección "Documentation Freshness Check" (detectar stale docs)
  - Crear `docs/agents/AGENT_NAVIGATION_PLAYBOOK.md`

  **Must NOT do**:
  - No eliminar contenido existente del playbook
  - No duplicar secciones ya cubiertas

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None (independent)
  - **Blocked By**: T1

  **References**:
  - `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md` — Versión actual
  - `T2-T6` outputs — Mapas que el playbook debe referenciar

  **Acceptance Criteria**:
  - [ ] `docs/agents/AGENT_NAVIGATION_PLAYBOOK.md` actualizado
  - [ ] Sección "Pre-Change Impact Map" presente
  - [ ] Sección "Documentation Freshness Check" presente
  - [ ] Referencia a CODEBASE_MAP.md presente

  **QA Scenarios**:
  ```
  Scenario: Pre-Change Impact Map section exists
    Tool: Bash
    Steps:
      1. Select-String -Path "docs/agents/AGENT_NAVIGATION_PLAYBOOK.md" -Pattern "Pre-Change Impact Map"
    Expected Result: Section found
    Evidence: .sisyphus/evidence/task-7-playbook-impact-map.txt

  Scenario: Documentation freshness check exists
    Tool: Bash
    Steps:
      1. Select-String -Path "docs/agents/AGENT_NAVIGATION_PLAYBOOK.md" -Pattern "Freshness\|stale\|outdated"
    Expected Result: Freshness section found
    Evidence: .sisyphus/evidence/task-7-playbook-freshness.txt
  ```

  **Commit**: YES
  - Message: `docs(spec-007): update AGENT_NAVIGATION_PLAYBOOK with Impact Map requirement`
  - Files: `docs/agents/AGENT_NAVIGATION_PLAYBOOK.md`

- [x] 8. **Innovation Radar — Research (librarian)**

  **What to do**:
  - Investigar referencias profesionales de código abierto para CERMONT:
    - **FSM/CMMS Open Source**: Field Platform, FieldOpt, FlexDesk, FieldOps Hub, Liberu Maintenance, Atlas CMMS, openMAINT
    - **SaaS multi-tenant patterns**: feature flags, planos de suscripción, branding por tenant
    - **AI Copilot patterns**: LLM seguro para resúmenes operativos, detección de documentos faltantes
    - **Digital Twin patterns**: timeline de orden, estado documental, auditoría
    - **Offline-first avanzado**: sync queue, conflict resolution, idempotencia
  - Usar `websearch_web_search_exa` y `grep_app_searchGitHub` para encontrar ejemplos reales
  - Documentar hallazgos en `.sisyphus/evidence/task-8-innovation-research.md`

  **Must NOT do**:
  - No copiar código de repositorios externos
  - No enviar datos sensibles de CERMONT a servicios externos
  - No implementar nada — solo investigar

  **Recommended Agent Profile**:
  - **Category**: `librarian`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T9
  - **Blocked By**: T1

  **Acceptance Criteria**:
  - [ ] Archivo de investigación creado: `.sisyphus/evidence/task-8-innovation-research.md`
  - [ ] Al menos 5 fuentes externas consultadas
  - [ ] Patrones identificados por categoría (FSM, SaaS, AI, Offline)

  **QA Scenarios**:
  ```
  Scenario: Research document exists with sources
    Tool: Bash
    Steps:
      1. Get-Content ".sisyphus/evidence/task-8-innovation-research.md" | Measure-Object -Line
      2. Select-String -Path ".sisyphus/evidence/task-8-innovation-research.md" -Pattern "https://github.com\|https://"
    Expected Result: 50+ lines, 5+ external references
    Evidence: .sisyphus/evidence/task-8-research-verified.txt
  ```

  **Commit**: NO (research evidence, not source code)

### Wave 2 — Consolidación + Diseño (After Wave 1 completes)

- [x] 9. **Innovation Radar — Síntesis y Priorización**

  **What to do**:
  - Usar los hallazgos de T8 (research) + los mapas (T2-T6) + MODULE_MATURITY_MATRIX existente
  - Evaluar cada oportunidad con matriz Impacto × Esfuerzo × Riesgo
  - Reducir de 15 oportunidades a 6 priorizadas (top 6):
    1. **Unified Media/Evidence Engine** (alta prioridad — evidencias son el core del producto)
    2. **Fleet/Tools Professional Asset Layer** (alta — vehículos y herramientas son negocio)
    3. **Digital Twin per Order** (media-alta — diferencial competitivo)
    4. **AI Copilot MVP** (media — resúmenes seguros sin datos personales)
    5. **Automation Rules Engine** (media — reduce error humano)
    6. **Commercial SaaS Foundation** (media-baja — habilitador de negocio, no producto)
  - Para cada oportunidad: problema, módulos afectados, datos necesarios, complejidad, impacto, riesgo, MVP, métrica
  - Crear `docs/product/INNOVATION_OPPORTUNITY_RADAR.md`
  - Las oportunidades 7-15 del plan original pasan a "Visión" (post-MVP)

  **Must NOT do**:
  - No incluir las 15 oportunidades sin priorizar
  - No prometer features sin definir MVP explícito
  - No diseñar AI Copilot que envíe datos personales a APIs externas

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Síntesis de múltiples fuentes, juicio técnico y de negocio
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (gate — depende de T5, T6, T8)
  - **Parallel Group**: Wave 2, Gate task
  - **Blocks**: T10, T11, T12
  - **Blocked By**: T5, T6, T8

  **References**:
  - `.sisyphus/evidence/task-8-innovation-research.md` — Investigación
  - `docs/product/MODULE_MATURITY_MATRIX.md` — Madurez actual
  - `docs/architecture/FRONTEND_BACKEND_MATRIX.md` — Consumo
  - `docs/architecture/RBAC_PERMISSION_MAP.md` — Permisos
  - `docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md` — Flujo evidencias

  **Acceptance Criteria**:
  - [ ] `docs/product/INNOVATION_OPPORTUNITY_RADAR.md` creado
  - [ ] 6 oportunidades priorizadas con Impacto × Esfuerzo × Riesgo
  - [ ] Cada oportunidad tiene MVP definido y métrica de éxito
  - [ ] Oportunidades 7-15 documentadas como "Visión futuro"

  **QA Scenarios**:
  ```
  Scenario: Innovation radar has 6 prioritized opportunities
    Tool: Bash
    Steps:
      1. Get-Content "docs/product/INNOVATION_OPPORTUNITY_RADAR.md"
      2. grep -c "^\| " docs/product/INNOVATION_OPPORTUNITY_RADAR.md
    Expected Result: At least 6 entries with Impact, Effort, Risk columns
    Evidence: .sisyphus/evidence/task-9-innovation-radar.txt

  Scenario: Each opportunity has MVP defined
    Tool: Bash
    Steps:
      1. grep -c "MVP" docs/product/INNOVATION_OPPORTUNITY_RADAR.md
    Expected Result: MVP defined for all 6 opportunities
    Evidence: .sisyphus/evidence/task-9-mvp-defined.txt
  ```

  **Commit**: YES
  - Message: `docs(spec-007): create INNOVATION_OPPORTUNITY_RADAR with 6 prioritized opportunities`
  - Files: `docs/product/INNOVATION_OPPORTUNITY_RADAR.md`

- [x] 10. **Diseño Unified Media Engine — Contract + Spec**

  **What to do**:
  - Basado en MEDIA_EVIDENCE_FLOW_MAP.md y EVIDENCE_PAGE_FUNCTIONAL_REQUIREMENTS.md
  - Diseñar esquema unificado `MediaAsset` (o extender `Attachment` existente):
    - `ownerType` (workOrder, evidence, tool, vehicle, etc.)
    - `ownerId` (ObjectId polimórfico)
    - `fileType` (image, document, video, pdf)
    - `metadata` (EXIF, GPS, tamaño, mimeType)
    - `classification` (before, during, after, correction, HSE)
    - `audit` (createdBy, createdAt, downloadedBy[], consentTimestamps)
    - `lifecycleStatus` (active, deleted, archived)
  - Identificar si ya existe `Attachment` schema en shared-types → extenderlo, no crear duplicado
  - Verificar: `packages/shared-types/src/schemas/attachment*` o similar
  - NO implementar — solo diseñar contrato Zod y spec

  **Must NOT do**:
  - No implementar nada en esta tarea
  - No duplicar schema existente de Attachment
  - No crear archivos en backend o frontend aún

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Diseño de contrato crítico que afecta múltiples módulos

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential with T11)
  - **Blocks**: T14, T15, T16
  - **Blocked By**: T9

  **References**:
  - `docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md` — Flujo actual
  - `docs/product/EVIDENCE_PAGE_FUNCTIONAL_REQUIREMENTS.md` — Spec funcional
  - `packages/shared-types/src/schemas/` — Buscar Attachment existente
  - `backend/src/modules/evidence/` — Modelo existente

  **Acceptance Criteria**:
  - [ ] Contrato Zod diseñado (no implementado) como spec en `specs/007-codebase-memory-innovation-cermont/contracts/architecture-map-contract.md`
  - [ ] Identificado si Attachment existe y cómo extenderlo
  - [ ] OwnerType enum definido
  - [ ] Metadata schema definido

  **QA Scenarios**:
  ```
  Scenario: Design spec exists with contract details
    Tool: Bash
    Steps:
      1. Test-Path "specs/007-codebase-memory-innovation-cermont/contracts/architecture-map-contract.md"
      2. Select-String -Path "specs/007-codebase-memory-innovation-cermont/contracts/architecture-map-contract.md" -Pattern "ownerType\|MediaAsset\|Attachment"
    Expected Result: Spec file exists with contract design
    Evidence: .sisyphus/evidence/task-10-media-engine-spec.txt
  ```

  **Commit**: NO (diseño, no implementación)

- [x] 11. **Diseño Fleet/Tools — Contract + Spec**

  **What to do**:
  - Basado en CODEBASE_MAP.md (módulos vehicle, tool existentes)
  - Identificar modelos existentes: Vehicle, Tool (o similares) en backend y shared-types
  - Diseñar extensión profesional:
    - `Vehicle`: odómetro, SOAT, techMechanical, insurance, certification, readiness, GPS tracker
    - `Tool`: calibrationDate, certificate, lastChecklist, QR/NFC tag, category
    - `FleetChecklist`: pre-use, post-use, findings, photos, signature
  - Crear spec en `specs/007-codebase-memory-innovation-cermont/contracts/module-refactor-contract.md`

  **Must NOT do**:
  - No implementar nada en esta tarea
  - No duplicar modelos existentes

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T10 — independiente)
  - **Parallel Group**: Wave 2
  - **Blocks**: T17, T18, T19
  - **Blocked By**: T9

  **References**:
  - CODEBASE_MAP.md — Módulos vehicle, tool
  - `backend/src/modules/` — Buscar vehicle/tool modules
  - `packages/shared-types/src/schemas/` — Buscar schemas
  - `docs/product/MODULE_MATURITY_MATRIX.md` — Nivel actual: 2

  **Acceptance Criteria**:
  - [ ] Spec creado en `specs/007-codebase-memory-innovation-cermont/contracts/module-refactor-contract.md`
  - [ ] Modelos existentes identificados
  - [ ] Extensiones profesionales diseñadas con campos

  **QA Scenarios**:
  ```
  Scenario: Fleet design spec exists
    Tool: Bash
    Steps:
      1. Test-Path "specs/007-codebase-memory-innovation-cermont/contracts/module-refactor-contract.md"
      2. Select-String -Path "specs/007-codebase-memory-innovation-cermont/contracts/module-refactor-contract.md" -Pattern "Vehicle\|Tool"
    Expected Result: Spec file exists with Vehicle/Tool design
    Evidence: .sisyphus/evidence/task-11-fleet-spec.txt
  ```

  **Commit**: NO (diseño, no implementación)

- [x] 12. **Refactor Risk Register**

  **What to do**:
  - Usando FRONTEND_BACKEND_MATRIX (T5) y CODEBASE_MAP (T2-T4):
  - Detectar y documentar:
    1. Endpoints no consumidos por frontend
    2. Llamadas frontend a endpoints inexistentes
    3. Schemas/models duplicados
    4. Componentes > 300 líneas
    5. Lógica de negocio en UI
    6. Rutas sin RBAC
    7. Query keys no centralizadas
    8. Direct fetch en componentes
    9. Dependencias circulares
    10. Errores silenciosos (catch vacío)
  - Crear `docs/architecture/REFACTOR_RISK_REGISTER.md` con tabla:
    ```markdown
    | # | Riesgo | Módulo | Evidencia | Impacto | Refactor | Prioridad |
    ```

  **Must NOT do**:
  - No implementar refactors — solo registrar
  - No inventar riesgos sin evidencia

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T10, T11)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T5, T6

  **References**:
  - `docs/architecture/FRONTEND_BACKEND_MATRIX.md` — Consumo
  - `docs/architecture/CODEBASE_MAP.md` — Mapa de código
  - `docs/architecture/RBAC_PERMISSION_MAP.md` — Permisos

  **Acceptance Criteria**:
  - [ ] `docs/architecture/REFACTOR_RISK_REGISTER.md` creado
  - [ ] Mínimo 10 riesgos documentados
  - [ ] Cada riesgo con evidencia y prioridad

  **QA Scenarios**:
  ```
  Scenario: Risk register has 10+ entries
    Tool: Bash
    Steps:
      1. Get-Content "docs/architecture/REFACTOR_RISK_REGISTER.md" | Measure-Object -Line
      2. grep -c "^\|" docs/architecture/REFACTOR_RISK_REGISTER.md
    Expected Result: 10+ documented risks
    Evidence: .sisyphus/evidence/task-12-risk-register.txt
  ```

  **Commit**: YES
  - Message: `docs(spec-007): create REFACTOR_RISK_REGISTER with 10+ documented risks`
  - Files: `docs/architecture/REFACTOR_RISK_REGISTER.md`

- [x] 13. **Verificar Mapas vs Código Real**

  **What to do**:
  - Auditoría de calidad de los mapas creados en Wave 1:
  - Para CODEBASE_MAP.md: verificar que cada módulo listado existe realmente en disco
  - Para FRONTEND_BACKEND_MATRIX.md: verificar 3-5 entradas aleatorias siguiendo el flujo real
  - Para RBAC_PERMISSION_MAP.md: verificar 3-5 entradas vs código real de authorize/authenticate
  - Para MEDIA_EVIDENCE_FLOW_MAP.md: ejecutar flujo real de subida (curl POST → GET) para verificar
  - Documentar discrepancias encontradas
  - Corregir mapas si hay errores

  **Must NOT do**:
  - No modificar código de la aplicación
  - Solo corregir mapas si tienen errores

  **Recommended Agent Profile**:
  - **Category**: `explore`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (gate — después de todos los mapas)
  - **Parallel Group**: Wave 2, Gate task
  - **Blocks**: T14-T20 (implementación)
  - **Blocked By**: T2, T3, T4, T5, T6

  **References**:
  - Todos los mapas creados en Wave 1
  - Código fuente real (backend/src, frontend/src)

  **Acceptance Criteria**:
  - [ ] Todos los mapas verificados contra código real
  - [ ] Discrepancias documentadas
  - [ ] Correcciones aplicadas si es necesario

  **QA Scenarios**:
  ```
  Scenario: Random audit of 3 FRONTEND_BACKEND_MATRIX entries
    Tool: Bash
    Steps:
      1. Pick 3 entries from matrix
      2. For each: check that hook exists, endpoint exists, schema exists
    Expected Result: Entries match real code OR discrepancy is documented
    Evidence: .sisyphus/evidence/task-13-matrix-audit.txt
  ```

  **Commit**: YES (only if map corrections needed)
  - Message: `fix(spec-007): correct map inaccuracies after code verification`
  - Files: corrected map files

### Wave 3 — Implementación de Slices (After Wave 2, MAX PARALLEL)

- [x] 14. **Implementar Unified Media Engine — Schema Zod + Mongoose Model**

  **What to do**:
  - Basado en el diseño de T10
  - Si existe `Attachment` en shared-types: EXTENDERLO con campos nuevos (evitar duplicación)
  - Si no existe: crear `MediaAsset` schema en `packages/shared-types/src/schemas/media-asset.ts`
  - Exportar desde `packages/shared-types/src/index.ts`
  - Actualizar `packages/shared-types/src/schemas/index.ts` si existe
  - Agregar Mongoose model en `backend/src/modules/media/models/MediaAsset.ts`
  - Campos mínimos: `ownerType` (enum), `ownerId` (ObjectId), `fileType` (enum), `originalName`, `mimeType`, `size`, `storagePath`, `metadata` (GPS, EXIF), `classification`, `lifecycleStatus`, audit fields
  - Correr `npm run typecheck -w @cermont/shared-types` y `npm run typecheck -w backend`

  **Must NOT do**:
  - No crear schema duplicado de Attachment si ya existe
  - No modificar schemas existentes sin verificar dependencias
  - No introducir `any`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`zod`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T17 — schemas independientes)
  - **Parallel Group**: Wave 3A (schemas + models)
  - **Blocks**: T15, T16
  - **Blocked By**: T10

  **References**:
  - `specs/007-codebase-memory-innovation-cermont/contracts/architecture-map-contract.md`
  - `packages/shared-types/src/schemas/`
  - `backend/src/modules/evidence/models/`

  **Acceptance Criteria**:
  - [ ] Schema Zod creado/extendido en shared-types
  - [ ] Exportado desde shared-types index
  - [ ] Mongoose model creado
  - [ ] `npm run typecheck -w @cermont/shared-types` → PASS
  - [ ] `npm run typecheck -w backend` → PASS

  **QA Scenarios**:
  ```text
  Scenario: Shared-types build passes
    Tool: Bash
    Steps:
      1. npm run build -w @cermont/shared-types
      2. npm run typecheck -w backend
    Expected Result: Build and typecheck pass (exit 0)
    Evidence: .sisyphus/evidence/task-14-shared-types-build.txt
  ```
  **Commit**: YES (groups with T15, T16)
  - Message: `feat(media): add MediaAsset schema and Mongoose model`
  - Files: `packages/shared-types/src/schemas/media-asset.ts`, `backend/src/modules/media/models/MediaAsset.ts`

- [x] 15. **Implementar Unified Media Engine — Service + Controller + Routes**

  **What to do**:
  - Crear `backend/src/modules/media/media.service.ts` con CRUD + upload
  - Crear `backend/src/modules/media/media.controller.ts` (thin HTTP layer)
  - Crear `backend/src/modules/media/media.routes.ts`:
    - POST `/:ownerType/:ownerId/upload`
    - GET `/:ownerType/:ownerId`
    - GET `/:id`
    - DELETE `/:id`
  - Registrar en `backend/src/index.ts` API_MOUNTS
  - Aplicar RBAC: `authenticate` → `authorize` → `validateBody`

  **Must NOT do**:
  - No usar `any`
  - No guardar archivos sin validación de tipo/tamaño

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`nodejs-express-server`, `zod`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T14)
  - **Parallel Group**: Wave 3B
  - **Blocks**: T16
  - **Blocked By**: T14

  **References**:
  - `backend/src/modules/evidence/` — Patrón
  - `backend/src/common/middlewares/`
  - `backend/src/index.ts`

  **Acceptance Criteria**:
  - [ ] media.service.ts con CRUD
  - [ ] media.routes.ts registrado
  - [ ] `npm run typecheck -w backend` → PASS
  - [ ] `npm run lint -w backend` → PASS

  **QA Scenarios**:
  ```text
  Scenario: Backend builds
    Tool: Bash
    Steps:
      1. npm run build -w backend
    Expected Result: Exit 0
    Evidence: .sisyphus/evidence/task-15-build.txt
  ```
  **Commit**: YES (groups with T14)

- [x] 16. **Implementar Unified Media Engine — Frontend API + Hooks + UI**

  **What to do**:
  - Crear `frontend/src/modules/media/api/media.ts`
  - Crear `frontend/src/modules/media/queries.ts` (TanStack Query hooks)
  - Crear `frontend/src/modules/media/ui/MediaGallery.tsx`
  - Crear `frontend/src/modules/media/ui/MediaUploader.tsx`
  - Crear `frontend/src/modules/media/ui/MediaCard.tsx`
  - Seguir patrón de módulo evidences existente
  - Estados: loading, error, empty, offline

  **Must NOT do**:
  - No usar fetch directo (usar apiClient)
  - No usar `any`

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T15)
  - **Parallel Group**: Wave 3C
  - **Blocks**: T20
  - **Blocked By**: T15

  **Acceptance Criteria**:
  - [ ] Módulo media/ con api, queries, ui
  - [ ] `npm run typecheck -w frontend` → PASS
  - [ ] `npm run lint -w frontend` → PASS

  **QA Scenarios**:
  ```text
  Scenario: Frontend builds
    Tool: Bash
    Steps:
      1. npm run build -w frontend
    Expected Result: Exit 0
    Evidence: .sisyphus/evidence/task-16-frontend-build.txt
  ```
  **Commit**: YES (groups with T14, T15)

- [x] 17. **Implementar Fleet/Tools — Schema Zod + Mongoose Model**

  **What to do**:
  - Identificar modelos existentes (Vehicle, Tool) en shared-types y backend
  - Si existen: extender con campos profesionales
  - Si no existen: crear desde cero
  - Schemas: `fleet-vehicle.ts`, `fleet-tool.ts`, `fleet-checklist.ts`
  - Exportar desde shared-types
  - Crear Mongoose models

  **Must NOT do**:
  - No duplicar schemas existentes

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`zod`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T14)
  - **Parallel Group**: Wave 3A
  - **Blocks**: T18, T19
  - **Blocked By**: T11

  **Acceptance Criteria**:
  - [ ] Schemas Zod creados/extendidos
  - [ ] Mongoose models creados
  - [ ] `npm run typecheck -w @cermont/shared-types` → PASS

  **QA Scenarios**:
  ```text
  Scenario: Shared-types build passes
    Tool: Bash
    Steps:
      1. npm run build -w @cermont/shared-types
    Expected Result: Exit 0
    Evidence: .sisyphus/evidence/task-17-fleet-build.txt
  ```
  **Commit**: YES (groups with T18, T19)
  - Message: `feat(fleet): add FleetVehicle, FleetTool, FleetChecklist schemas and models`

- [x] 18. **Implementar Fleet/Tools — Service + Controller + Routes**

  **What to do**:
  - CRUD vehicles + tools
  - `getReadinessStatus(vehicleId)`
  - `getExpiringCertifications(days)`
  - `createChecklist(vehicleId, type, findings)`
  - Registrar en `backend/src/index.ts`

  **Must NOT do**:
  - No usar `any`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`nodejs-express-server`, `zod`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T17)
  - **Parallel Group**: Wave 3B
  - **Blocks**: T19
  - **Blocked By**: T17

  **Acceptance Criteria**:
  - [ ] fleet.service.ts con métodos
  - [ ] fleet.routes.ts registrado
  - [ ] `npm run typecheck -w backend` → PASS

  **QA Scenarios**:
  ```text
  Scenario: Fleet routes registered
    Tool: Bash
    Steps:
      1. grep "fleet" backend/src/index.ts
    Expected Result: fleet routes mounted
    Evidence: .sisyphus/evidence/task-18-fleet-routes.txt
  ```
  **Commit**: YES (groups with T17)

- [x] 19. **Implementar Fleet/Tools — Frontend API + Hooks + UI**

  **What to do**:
  - `frontend/src/modules/fleet/api/fleet.ts`
  - `frontend/src/modules/fleet/queries.ts`
  - `frontend/src/modules/fleet/ui/VehicleList.tsx`
  - `frontend/src/modules/fleet/ui/VehicleDetail.tsx`
  - `frontend/src/modules/fleet/ui/ToolList.tsx`
  - Estados: loading, error, empty, offline

  **Must NOT do**:
  - No usar fetch directo

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T18)
  - **Parallel Group**: Wave 3C
  - **Blocks**: T20
  - **Blocked By**: T18

  **Acceptance Criteria**:
  - [ ] Módulo fleet/ con api, queries, ui
  - [ ] `npm run typecheck -w frontend` → PASS
  - [ ] `npm run lint -w frontend` → PASS

  **QA Scenarios**:
  ```text
  Scenario: Frontend builds
    Tool: Bash
    Steps:
      1. npm run build -w frontend
    Expected Result: Exit 0
    Evidence: .sisyphus/evidence/task-19-frontend-build.txt
  ```
  **Commit**: YES (groups with T17, T18)

- [x] 20. **Tests de Regresión + Integración**

  **What to do**:
  - `npm run test` — verificar 1091+ tests existentes siguen pasando
  - Escribir tests unitarios para MediaEngine schemas
  - Escribir tests unitarios para Fleet schemas
  - Escribir tests de integración: upload → store → retrieve

  **Must NOT do**:
  - No eliminar tests existentes

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (gate — depende de T14-T19)
  - **Parallel Group**: Wave 3D
  - **Blocks**: F1-F4
  - **Blocked By**: T14-T19

  **Acceptance Criteria**:
  - [ ] `npm run test` → PASS (todos los tests)
  - [ ] Nuevos tests para MediaEngine y Fleet

  **QA Scenarios**:
  ```text
  Scenario: All tests pass
    Tool: Bash
    Steps:
      1. npm run test 2>&1 | tail -20
    Expected Result: "Tests: xxx passed, xxx total" with 0 failures
    Evidence: .sisyphus/evidence/task-20-test-results.txt
  ```
  **Commit**: YES
  - Message: `test(media,fleet): add unit and integration tests`
  - Pre-commit: `npm run test`

---

## Final Verification Wave (MANDATORY — after ALL tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed. Wait for user's explicit approval.**
> **Never mark F1-F4 as complete before user confirms.**

- [x] F1. **Plan Compliance Audit** — `oracle`
  - Read plan end-to-end. For each "Must Have": verify implementation exists
  - For each "Must NOT Have": search codebase for forbidden patterns
  - Check evidence files exist in `.sisyphus/evidence/`
  - Compare deliverables against plan
  - Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  - Run `npm run typecheck` + `npm run lint` + `npm run test`
  - Check all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log`, unused imports
  - Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high`
  - Execute EVERY QA scenario from EVERY task
  - Test cross-task integration
  - Save to `.sisyphus/evidence/final-qa/`
  - Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  - For each task: read "What to do" vs actual diff
  - Verify 1:1 — everything built (no missing), nothing beyond spec (no creep)
  - Check "Must NOT do" compliance
  - Detect cross-task contamination
  - Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

| Task(s) | Type | Message | Pre-commit Gate |
|---------|------|---------|-----------------|
| T1 | chore | `chore(spec-007): create secure branch and audit secrets` | — |
| T2, T3, T4 | docs | `docs(spec-007): create CODEBASE_MAP.md` | — |
| T5 | docs | `docs(spec-007): create FRONTEND_BACKEND_MATRIX.md` | — |
| T6 | docs | `docs(spec-007): create RBAC_PERMISSION_MAP and MEDIA_EVIDENCE_FLOW_MAP` | — |
| T7 | docs | `docs(spec-007): update AGENT_NAVIGATION_PLAYBOOK` | — |
| T9 | docs | `docs(spec-007): create INNOVATION_OPPORTUNITY_RADAR` | — |
| T12 | docs | `docs(spec-007): create REFACTOR_RISK_REGISTER` | — |
| T14, T15, T16 | feat | `feat(media): implement Unified Media Engine (schema+backend+frontend)` | `npm run typecheck && npm run lint` |
| T17, T18, T19 | feat | `feat(fleet): implement Fleet/Tools (schema+backend+frontend)` | `npm run typecheck && npm run lint` |
| T20 | test | `test(media,fleet): add unit and integration tests` | `npm run test` |
| F1-F4 | chore | `chore(spec-007): final verification and QA evidence` | `npm run verify` |

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck   # Exit 0
npm run lint        # Exit 0 (no new issues)
npm run test        # Exit 0 (1091+ tests pass)
npm run build       # Exit 0
npm run contracts:check  # PASS
npm run quality:strict   # Exit 0 (delta documented)
```

### Final Checklist
- [ ] All maps created (CODEBASE_MAP, FRONTEND_BACKEND_MATRIX, RBAC_PERMISSION_MAP, MEDIA_EVIDENCE_FLOW_MAP)
- [ ] Innovation Radar with 6 prioritized opportunities
- [ ] AGENT_NAVIGATION_PLAYBOOK updated with Impact Map requirement
- [ ] REFACTOR_RISK_REGISTER with 10+ documented risks
- [ ] Unified Media Engine implemented (schema + backend + frontend)
- [ ] Fleet/Tools implemented (schema + backend + frontend)
- [ ] All QA evidence captured in `.sisyphus/evidence/`
- [ ] 0 `any` introduced
- [ ] No existing functionality broken
- [ ] No existing tests broken
- [ ] User explicitly approved final verification

### Post-Plan Cleanup
```bash
# Clean up draft when done
rm .sisyphus/drafts/{spec-007-improved}.md

# Guide user to execute
echo "Run /start-work to begin execution of this plan"
```
