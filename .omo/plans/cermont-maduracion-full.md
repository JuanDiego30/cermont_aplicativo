# Plan de Maduración Integral — CERMONT S.A.S.

## TL;DR

> **Resumen**: Auditoría Playwright completa de las 94+ rutas de la aplicación Cermont, corrección de 4 bugs críticos encontrados en pruebas manuales, maduración UX/UI de todas las páginas, implementación de innovaciones (offline-first mejorado, dashboard inteligente, costos en tiempo real, notificaciones push) y escalamiento arquitectónico (caché de consultas, lazy loading, virtual scroll, bundle optimization).

> **Entregables**:
> - Suite completa de tests Playwright para cada ruta (happy path + error + empty + loading states)
> - Fixes a 4 bugs con cambios en frontend y backend
> - Refactor UX/UI de todas las páginas con estados consistentes
> - Innovaciones: offline mejorado, dashboard predictivo, costos en tiempo real
> - Escalamiento: lazy loading, virtual scroll, bundle splitting

> **Esfuerzo Estimado**: XL (multiple waves paralelas)
> **Ejecución Paralela**: SI - 5 waves con máximo 8 tareas paralelas
> **Ruta Crítica**: Bug fixes → Tests → UX/UI → Innovación → Escalamiento → Verificación final

---

## Context

### Petición Original
Testear toda la aplicación con Playwright, auditar cada página, crear plan de implementación que incluya corrección de bugs, innovación, escalamiento y maduración de la plataforma. Basado en 4 bugs encontrados en pruebas manuales del flujo WR → SC → Propuesta.

### Resumen de Hallazgos

**Bugs Confirmados**:
1. **CRÍTICO** - Propuesta detail: Query key mismatch `["proposal", id]` vs `["proposals", "detail", id]` - badge status no refresca tras enviar
2. **CRÍTICO** - SC Cockpit: Proposal creada con `serviceCaseId` no actualiza `ServiceCase.artifacts.proposal` - blocker no se desbloquea
3. **BAJO** - Work Request form: Validation errors persisten tras seleccionar sitio temporal manualmente
4. **MEDIO** - Work Request form: No hay opción "Sin sede definida" cuando cliente no tiene sedes

**Arquitectura Actual**:
- Frontend: Next.js 16 App Router + React 19 + TanStack Query 5.x + Zustand 5.x + Tailwind CSS 4.x
- Backend: Express 5.2.1 + Mongoose 9.x + Zod 4.x
- Database: MongoDB
- Tests E2E: Playwright 1.58.x (46 spec files existentes)
- Monorepo: npm workspaces (backend/ + frontend/ + packages/)

**Mapa de Rutas**: 94 rutas documentadas en `docs/architecture/FRONTEND_ROUTE_MAP.md`:
- 91 IMPLEMENTED
- 3 OPTIONAL (forgot-password, reset-password, customers)
- Dashboard: 7 rutas | Work Requests: 3 | Site Visits: 3 | Proposals: 3 | Orders: 10
- Service Cases: 3 | Planning: 3 | Purchase Orders: 3 | Billing: 8 | Payments: 3
- Documents: 2 | Costs: 2 | Assets: 2 | Admin: 9 | Resources: 4 | Portal: 7 | Tools: 5
- Maintenance: 4 | Templates: 2 | Offline: 1 | Profile: 1 | Legal: 3

### Metis Review
**Gaps Identificados**:
- No hay tests e2e de regresión visual para las 94 rutas (solo 46 tests existentes cubren flujos críticos)
- Los loading/error/empty states no son consistentes entre páginas
- Falta cobertura offline en páginas de campo
- No hay métricas de rendimiento (Core Web Vitals)
- El sidebar no tiene tests de navegación RBAC

---

## ⚠️ ANTI-HALLUCINATION EXECUTION PROTOCOL (READ FIRST — THIS IS LAW)

### El Problema
El modelo ejecutor (programador) ha estado marcando tareas como "already implemented" basándose únicamente en que typecheck/lint/build pasan, sin escribir UNA SOLA LÍNEA de código nuevo. Esto NO es implementación.

### La Solución — Reglas de Hierro

**REGLA 1: PROHIBIDO decir "already implemented" o "ya existe".**
- Si una tarea especifica "Crear archivo X", el archivo DEBE ser creado con `write()`. 
- Si el archivo YA EXISTE pero su contenido no coincide con lo especificado, DEBE ser reemplazado.
- La frase "already implemented" está TERMINANTEMENTE PROHIBIDA como razón para saltar una tarea.
- Violación = la tarea se considera FALLIDA y DEBE rehacerse.

**REGLA 2: Cada tarea DEBE producir un archivo .ts/.tsx/.css nuevo o modificado.**
- Evidence no es "typecheck passes". Evidence es `git diff` mostrando las líneas exactas cambiadas.
- Para cada tarea, ejecutar: `git diff --stat` y `git diff --word-diff` para mostrar qué cambió.
- Si `git diff` está vacío después de una tarea, la tarea NO se hizo. REPETIR.

**REGLA 3: Verificación de contenido, no de salida de comandos.**
- NO es suficiente que `npm run typecheck` pase para demostrar que una tarea está hecha.
- Hay que grep-el contenido del archivo para verificar que el cambio ESPECÍFICO existe.
- Ejemplo: Para Bug 1, hay que buscar `["proposals", "detail", id]` en proposals/[id]/page.tsx
- Ejemplo: Para Bug 4, hay que buscar `"Sin sede definida"` en ServiceSiteSelect.tsx

**REGLA 4: Las tareas de innovación/design NO existen hasta que el COMPONENTE existe en disco.**
- No existe "KpiCard" hasta que `frontend/src/core/ui/KpiCard.tsx` tiene código real.
- No existe "BottomNav" hasta que `frontend/src/core/ui/BottomNav.tsx` tiene código real.
- No existe "dark mode" hasta que `globals.css` tiene los tokens CSS y el ThemeProvider existe.
- typecheck pasar SIN el componente creado = FRAUDE. La tarea se rechaza.

**REGLA 5: Cada tarea DEBE terminar con un commit atómico que contenga SOLO los archivos de esa tarea.**
- `git add <archivos específicos>` + `git commit -m "tipo(alcance): descripción"`
- Si el commit contiene archivos de otra tarea, hay CONTAMINACIÓN y se rechaza.
- Si el commit está vacío porque "no había nada que cambiar", se rechaza.

**REGLA 6: Verificación Final (F1-F4) NO puede aprobar si hay tareas sin commits atómicos.**
- F1 cuenta commits: deben ser 42+ (uno por tarea) + 4 de verificación.
- Si faltan commits, las tareas faltantes se marcan como NO IMPLEMENTADAS y se rechazan.

### Consecuencias
- **1ª infracción**: Warning. La tarea se revierte y se rehace.
- **2ª infracción**: Toda la wave se considera fallida. Se reinicia desde cero.
- **3ª infracción**: Plan abortado. Reporte al usuario.

---

## Work Objectives

### Core Objective
Auditar, testear y madurar las 94+ rutas de CERMONT, corrigiendo bugs críticos y estableciendo una base sólida de calidad con Playwright.

### Concrete Deliverables (con verificación de contenido)
| Deliverable | Archivo a verificar | Patrón grep | Acción |
|------------|-------------------|-------------|--------|
| Bug 1 fix | proposals/[id]/page.tsx | `["proposals", "detail", id]` | MODIFICAR queryKey |
| Bug 2 fix | proposal.service.ts | `ServiceCase.findByIdAndUpdate` | AGREGAR update artifacts |
| Bug 3 fix | work-requests/new/page.tsx | `filter((e) => e.field !==` | AGREGAR limpieza errors |
| Bug 4 fix | ServiceSiteSelect.tsx | `Sin sede definida` | AGREGAR opción |
| KpiCard component | core/ui/KpiCard.tsx | `export function KpiCard` | CREAR archivo |
| ProgressRing | core/ui/ProgressRing.tsx | `export function ProgressRing` | CREAR archivo |
| BottomNav | core/ui/BottomNav.tsx | `export function BottomNav` | CREAR archivo |
| FAB | core/ui/FloatingActionButton.tsx | `export function FloatingActionButton` | CREAR archivo |
| ThemeProvider | core/providers/ThemeProvider.tsx | `export function ThemeProvider` | CREAR archivo |
| Dark tokens | globals.css | `--color-canvas: #121212` | MODIFICAR |
| DashboardHero | dashboard/ui/DashboardHero.tsx | `export function DashboardHero` | CREAR archivo |
| CockpitTimeline | core/ui/CockpitTimeline.tsx | `export function CockpitTimeline` | CREAR archivo |
| ErrorState | core/ui/ErrorState.tsx | `export function ErrorState` | CREAR archivo |
| EmptyState | core/ui/EmptyState.tsx | `export function EmptyState` | CREAR archivo |
| OfflineBanner | core/ui/OfflineBanner.tsx | `export function OfflineBanner` | CREAR archivo |
| VarianceChart | costs/ui/VarianceChart.tsx | `export function VarianceChart` | CREAR archivo |
| VirtualTable | core/ui/VirtualTable.tsx | `export function VirtualTable` | CREAR archivo |

### Definition of Done (reforzado)
- [ ] `git log --oneline` muestra 42+ commits (1 por tarea)
- [ ] Cada commit contiene `git diff --stat` con archivos .ts/.tsx/.css modificados
- [ ] `grep -r "KpiCard" frontend/src/core/ui/` encuentra el componente REAL
- [ ] `grep -r "Sin sede definida" frontend/src/modules/customers/` encuentra el texto REAL
- [ ] `grep -r "#121212" frontend/src/app/globals.css` encuentra los tokens dark REALES
- [ ] `npx playwright test --reporter=html` pasa con 0 fallos
- [ ] `npm run typecheck -w frontend` exitoso
- [ ] `npm run lint -w frontend` exitoso
- [ ] `npm run build -w frontend` exitoso
- [ ] `npm run typecheck -w backend` exitoso
- [ ] `npm run build -w backend` exitoso
- [ ] react-doctor reporta 0 issues

### Must Have (con verificación forzada)
- [ ] **Bug 1**: grep `["proposals", "detail", id]` en proposals/[id]/page.tsx
- [ ] **Bug 2**: grep `ServiceCase.findByIdAndUpdate` en proposal.service.ts
- [ ] **Bug 3**: grep `filter((e) => e.field !==` en work-requests/new/page.tsx
- [ ] **Bug 4**: grep `Sin sede definida` en ServiceSiteSelect.tsx
- [ ] **KpiCard**: grep `export function KpiCard` en core/ui/KpiCard.tsx
- [ ] **ProgressRing**: grep `export function ProgressRing` en core/ui/ProgressRing.tsx
- [ ] **BottomNav**: grep `export function BottomNav` en core/ui/BottomNav.tsx
- [ ] **ThemeProvider**: grep `export function ThemeProvider` en core/providers/ThemeProvider.tsx
- [ ] **Dark tokens**: grep `--color-canvas: #121212` en globals.css
- [ ] **ErrorState**: grep `export function ErrorState` en core/ui/ErrorState.tsx
- [ ] **EmptyState**: grep `export function EmptyState` en core/ui/EmptyState.tsx
- [ ] **DashboardHero**: grep `export function DashboardHero` en dashboard/ui/DashboardHero.tsx
- [ ] **CockpitTimeline**: grep `export function CockpitTimeline` en core/ui/CockpitTimeline.tsx
- [ ] **VirtualTable**: grep `export function VirtualTable` en core/ui/VirtualTable.tsx
- [ ] **VarianceChart**: grep `export function VarianceChart` en costs/ui/VarianceChart.tsx

### Must NOT Have (Guardrails)
- NO cambiar stack tecnológico (Express 5, Next.js 16, MongoDB, Zod 4.x)
- NO eliminar funcionalidad existente
- NO duplicar schemas Zod (siempre usar @cermont/shared-types)
- NO introducir any/unknown/null/undefined
- NO modificar package.json sin aprobación
- NO romper tests e2e existentes
- **NO decir "already implemented" como excusa para no programar** ← NUEVO

---

## Verification Strategy (reforzada)

### Test Decision
- **Infrastructure exists**: SI - Playwright 1.58.x configurado
- **Automated tests**: TDD para bugs, tests-after para páginas nuevas
- **Framework**: Playwright (frontend/tests/e2e/)
- **Evidence**: `git diff --word-diff` + screenshot, NO solo "typecheck passes"

### QA Policy (reforzada)
Cada tarea DEBE producir:
1. **Código**: `git diff --stat` mostrando archivos modificados (OBLIGATORIO)
2. **Contenido**: `grep -F "patron" archivo.modificado` confirmando el cambio exacto (OBLIGATORIO)
3. **Test**: Playwright o bash verificando comportamiento (OBLIGATORIO)
4. **Screenshot**: `.sisyphus/evidence/task-N-nombre.png` (OBLIGATORIO)
5. **Commit**: `git commit` con mensaje semántico (OBLIGATORIO)

**Sin evidencia de código → tarea NO realizada → rechazar y rehacer.**

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Base - Bug fixes + Tests scaffolding):
├── Task 1: Fix Bug 1 - Query key mismatch proposal detail
├── Task 2: Fix Bug 2 - Proposal serviceCaseId no actualiza artifacts
├── Task 3: Fix Bug 3 - Validation errors persist in site selection
├── Task 4: Fix Bug 4 - No "sin sede" option
├── Task 5: Create Playwright test helpers + fixtures
├── Task 6: Auth test suite (login, register, logout, RBAC)
├── Task 7: Auth pages test (login, register, forgot-password)
├── Task 8: Dashboard page tests

Wave 2 (Core business pages - MAX PARALLEL):
├── Task 9: Work Requests pages tests (list, new, detail)
├── Task 10: Site Visits pages tests (list, new, detail)
├── Task 11: Proposals pages tests (list, new, detail)
├── Task 12: Orders pages tests (list, new, detail, edit)
├── Task 13: Service Cases + Cockpit tests
├── Task 14: Planning pages tests
├── Task 15: Purchase Orders tests
├── Task 16: Billing pages tests (SES, invoices)

Wave 3 (Advanced pages + UX):
├── Task 17: Payments + Delivery Records tests
├── Task 18: Documents + Reports tests
├── Task 19: Admin pages tests (users, audit, config)
├── Task 20: Portal client pages tests
├── Task 21: Resources + Kits + Tools tests
├── Task 22: Costs + Dashboard analytics tests
├── Task 23: UX Maturation - Loading states refactor
├── Task 24: UX Maturation - Error/Empty states refactor

Wave 4 (Innovation + Scaling):
├── Task 25: Dashboard inteligente con KPIs predictivos
├── Task 26: Costos en tiempo real con gráficos variance
├── Task 27: Offline-first mejorado (colas persistentes)
├── Task 28: Lazy loading + dynamic imports
├── Task 29: Virtual scroll en listas grandes
├── Task 30: Bundle optimization + code splitting

Wave FINAL (Verification):
├── Task F1: Plan compliance audit (all must-haves verified)
├── Task F2: Code quality + typecheck + lint + build
├── Task F3: Full Playwright regression suite
├── Task F4: Scope fidelity check
```

---

## Detailed Dependency Matrix

### Complete Task Dependencies

```
TASK  DEPENDS_ON          BLOCKS              PARALLEL_WITH
1     -                    5                  -
2     -                    5                  -
3     -                    5                  -
4     -                    5                  -
5     1,2,3,4             6,7,8              -
6     5                    -                  7,8
7     5                    9-22              6,8
8     5                    9-22              6,7
9     6,7                  10                 -
10    6,7                  -                  9
11    6,7                  -                  9,10
12    8                    14-17             9-11
13    8                    -                  12
14    8                    -                  12,13
15    8                    -                  12-14
16    8                    -                  12-15
17    8                    -                  12-16
18    8                    -                  12-17
19    8                    -                  12-18
20    7                    -                  12-19
21    8                    -                  12-20
22    8                    -                  12-21
23    9-22                 25-30             24
24    9-22                 25-30             23
25    23,24                27-30             26
26    23,24                27-30             25
27    23,24                -                  25-26
28    23,24                -                  25-27
29    23,24                -                  25-28
30    23,24                -                  25-29
31    6,7                  -                  9-30
32    6,7                  -                  9-31
33    12,18                -                  31-32, 34-36
34    18                   -                  31-33, 35-36
35    8                    -                  31-34, 36
36    30                   -                  31-35
F1    1-36                 F2,F3,F4           -
F2    F1                   -                  F3,F4
F3    F1+F2                -                  F4
F4    F1+F2+F3             -                  -
```

### Critical Path
```
Task 1 → Task 5 → Task 6 → Task 7 → Task 9-22 → Task 23-24 → Task 25-30 → Task 31-36 → F1 → F2+F3+F4 → USER OKAY
```

### Parallelism Strategy
- **Wave 1** (4 tareas en paralelo): Tasks 1,2,3,4 (bug fixes - independientes entre sí)
- **Wave 2** (2 en paralelo): Task 5 (helpers) builds on fixes; Tasks 6,7,8 en paralelo después
- **Wave 3** (14 en paralelo MAX): Tasks 9-22 - todos los tests de páginas (independientes entre sí)
- **Wave 4** (2 en paralelo): Tasks 23-24 - UX maturation
- **Wave 5** (6 en paralelo MAX): Tasks 25-30 - Innovation + scaling
- **Wave 6** (6 en paralelo): Tasks 31-36 - Remaining pages + performance
- **Wave FINAL** (4 en paralelo): F1, F2, F3, F4 - Verification

---

## Agent Dispatch Summary

```
WAVE  TASKS  AGENT_PROFILES                    MAX_PARALLEL
1     1-4    deep (backend) + quick (frontend)  4
2     5-8    quick (helpers+auth)               3
3     9-22   unspecified-high (test writing)    14
4     23-24  visual-engineering (UX)            2
5     25-30  deep (backend) + visual (charts)   6
6     31-36  unspecified-high (tests)           6
FINAL F1-F4  oracle + deep + unspecified        4
```

---

## References by Module

### Codebase References for Executors

**Proposal Module**:
- `backend/src/modules/proposal/proposal.service.ts:104-130` - createProposal() - serviceCaseId handling
- `backend/src/modules/proposal/proposal.controller.ts:94-98` - createProposal controller
- `backend/src/services/cermont-workflow-gate.service.ts:201-221` - resolveProposalBlockers()
- `frontend/src/app/(dashboard)/proposals/[id]/page.tsx:110-123` - ProposalDetailPage con queryKey
- `frontend/src/modules/proposals/queries.ts:75-93` - useUpdateProposal con invalidation
- `frontend/src/modules/proposals/ui/ProposalActions.tsx:46-59` - handleSend mutation
- `frontend/src/modules/proposals/proposal-status.ts` - normalizeProposalStatus
- `backend/src/models/Proposal.ts` - Proposal mongoose schema
- `backend/src/models/ServiceCase.ts:36-62` - artifacts schema (proposal field)

**Work Request Module**:
- `frontend/src/app/(dashboard)/work-requests/new/page.tsx:626-704` - Form state + validation
- `frontend/src/app/(dashboard)/work-requests/new/page.tsx:661-668` - handleSiteSelected (Bug 3)
- `frontend/src/modules/customers/ui/ServiceSiteSelect.tsx:98-364` - Site selector component (Bug 4)
- `frontend/src/app/(dashboard)/work-requests/[id]/page.tsx` - WR detail
- `frontend/src/app/(dashboard)/work-requests/page.tsx` - WR list
- `backend/src/models/WorkRequest.ts` - WorkRequest mongoose schema

**Service Case Module**:
- `backend/src/modules/service-cases/service-case.service.ts:504-619` - getServiceCaseById con blockers
- `backend/src/modules/service-cases/service-case.service.ts:1466-1600` - advanceServiceCaseState
- `backend/src/services/cermont-workflow-gate.service.ts:926-945` - calculateStepBlockers
- `frontend/src/app/(dashboard)/service-cases/[id]/page.tsx` - SC detail + workflow cockpit
- `frontend/src/modules/service-cases/components/ServiceCaseWorkflowCockpit.tsx` - Workflow UI

**Dashboard Module**:
- `backend/src/modules/service-cases/service-case.service.ts:637-708` - getServiceCaseSummary
- `frontend/src/app/(dashboard)/dashboard/page.tsx` - Dashboard page
- `frontend/src/modules/dashboard/` - Dashboard hooks, api

**Cost Module**:
- `backend/src/modules/costs/cost.service.ts` - Cost service
- `backend/src/models/Cost.ts` - Cost mongoose schema
- `frontend/src/app/(dashboard)/costs/[orderId]/page.tsx` - Cost details
- `frontend/src/modules/costs/` - Cost hooks, UI

**Offline Module**:
- `frontend/src/lib/pwa/offline-queue.ts` - Offline queue implementation
- `frontend/src/lib/http/api-client.ts` - HTTP client with offline support
- `frontend/src/app/~offline/page.tsx` - Offline fallback page

**Core UI Components**:
- `frontend/src/core/ui/Skeleton.tsx` - Loading skeleton component
- `frontend/src/core/ui/StatusBadge.tsx` - Status badge
- `frontend/src/core/ui/Button.tsx` - Button component

**Playwright Config**:
- `frontend/playwright.config.ts` - PW config with chromium + mobile projects
- `frontend/tests/e2e/global-setup.ts` - Global setup (seed DB, auth)
- `frontend/tests/e2e/login.spec.ts` - Existing login tests (pattern reference)

---

## TODOs

  **What to do**:
  - Root cause: `frontend/src/app/(dashboard)/proposals/[id]/page.tsx` line 120 usa `queryKey: ["proposal", id]` pero la mutation `useUpdateProposal` en `frontend/src/modules/proposals/queries.ts` line 89 invalida `PROPOSALS_KEYS.detail(id)` = `["proposals", "detail", id]`
  - Fix: Cambiar `queryKey: ["proposal", id]` a `queryKey: ["proposals", "detail", id]` en ProposalDetailPage
  - Verificar que `useQueryClient.invalidateQueries({ queryKey: ["proposals", "detail", id] })` exista en `useUpdateProposal` onSuccess (ya existe en queries.ts line 89)
  - Verificar que `ProposalActions.tsx` use el mismo queryKey pattern

  **Files to modify**:
  - `frontend/src/app/(dashboard)/proposals/[id]/page.tsx:120` - Cambiar queryKey de `["proposal", id]` a `["proposals", "detail", id]`
  - `frontend/src/modules/proposals/queries.ts:88-91` - Verificar invalidation

  **Acceptance Criteria**:
  - [ ] QueryKey cambiado en page.tsx
  - [ ] typecheck pasa
  - [ ] Al enviar propuesta, el badge de estado cambia de DRAFT a ENVIADA sin recargar página

  **QA Scenarios**:
  ```
  Scenario: Proposal status updates reactively after "Send" action
    Tool: Playwright
    Preconditions: Usuario autenticado como gerente. Propuesta en estado DRAFT existe
    Steps:
      1. Navigate to /proposals/[id] donde id = proposal DRAFT
      2. Assert StatusBadge muestra "draft"
      3. Click button "Enviar"
      4. Wait for toast "Propuesta enviada correctamente"
      5. Assert StatusBadge ahora muestra "sent" o "enviada"
    Expected Result: Badge de estado se actualiza sin recargar página
    Evidence: .sisyphus/evidence/task-1-status-update.png

  Scenario: Proposal list count updates after status change
    Tool: Playwright
    Preconditions: Same as above
    Steps:
      1. Navigate to /proposals
      2. Assert contador ENVIADAS incrementó
    Expected Result: Lista refleja nuevo estado
    Evidence: .sisyphus/evidence/task-1-list-count.png
  ```

  **Commit**: YES
  - Message: `fix(proposals): query key mismatch in ProposalDetailPage - use PROPOSALS_KEYS.detail`
  - Files: `frontend/src/app/(dashboard)/proposals/[id]/page.tsx`, `frontend/src/modules/proposals/queries.ts`

- [ ] 2. Fix Bug 2 - Proposal serviceCaseId no actualiza ServiceCase artifacts

  **What to do**:
  - Root cause: `backend/src/modules/proposal/proposal.service.ts` createProposal() guarda proposal con `serviceCaseId` (line 122) pero NO actualiza el documento ServiceCase
  - El workflow gate service `backend/src/services/cermont-workflow-gate.service.ts` line 201-221 (resolveProposalBlockers) chequea `serviceCase.artifacts.proposal.id` que nunca se setea
  - Fix: En `proposal.service.ts` después de `await proposal.save()`, buscar el ServiceCase por `serviceCaseId` y actualizar `artifacts.proposal` con id/code/status/updatedAt
  - También actualizar el controller `proposal.controller.ts` si es necesario para pasar `serviceCaseId`
  - Agregar auditoría del cambio

  **Files to modify**:
  - `backend/src/modules/proposal/proposal.service.ts:125-130` - Agregar actualización de ServiceCase.artifacts.proposal después de guardar proposal

  **Detailed implementation**:
  ```typescript
  // Después de await proposal.save() en createProposal(), agregar:
  if (data.serviceCaseId) {
    await ServiceCase.findByIdAndUpdate(data.serviceCaseId, {
      $set: {
        'artifacts.proposal': {
          id: proposal._id,
          code: proposal.code,
          status: proposal.status,
          updatedAt: new Date(),
        },
      },
    });
    await createAuditLog({
      userId,
      entity: 'ServiceCase',
      entityId: data.serviceCaseId,
      action: 'PROPOSAL_LINKED',
      after: { proposalId: proposal._id, proposalCode: proposal.code },
      metadata: { source: 'proposal-service.createProposal' },
    });
  }
  ```
  - Importar `ServiceCase` model en proposal.service.ts (validar que existe en models)

  **Acceptance Criteria**:
  - [ ] Al crear propuesta con serviceCaseId, ServiceCase.artifacts.proposal se actualiza
  - [ ] Blocker "Falta la propuesta económica" desaparece del cockpit
  - [ ] typecheck + lint + build backend pasa
  - [ ] Tests backend pasan

  **QA Scenarios**:
  ```
  Scenario: Proposal creation updates ServiceCase artifacts
    Tool: Bash (curl)
    Preconditions: ServiceCase en paso 3 existe. Token JWT válido.
    Steps:
      1. curl -X POST /api/proposals -H "Authorization: Bearer $TOKEN"
         -d '{"serviceCaseId":"SC_ID","title":"Test","clientName":"Test","items":[{"description":"Item","quantity":1,"unitCost":1000,"unit":"unidad"}],"validUntil":"2026-12-31"}'
      2. curl /api/service-cases/SC_ID | jq '.data.artifacts.proposal'
      3. Assert proposal.id no es null
      4. Assert proposal.status === "draft"
    Expected Result: ServiceCase.artifacts.proposal tiene id, code, status, updatedAt
    Evidence: .sisyphus/evidence/task-2-artifacts-updated.json

  Scenario: Cockpit blocker clears after proposal creation
    Tool: Playwright
    Preconditions: SC en paso 3 sin propuesta. Login como gerente.
    Steps:
      1. Navigate to /proposals/new?serviceCaseId=SC_ID
      2. Fill form with valid data
      3. Submit
      4. Navigate to /service-cases/SC_ID
      5. Assert NO hay blocker "Falta la propuesta económica"
    Expected Result: Blocker desaparece
    Evidence: .sisyphus/evidence/task-2-blocker-cleared.png
  ```

  **Commit**: YES
  - Message: `fix(proposals): update ServiceCase artifacts when proposal created with serviceCaseId`
  - Files: `backend/src/modules/proposal/proposal.service.ts`

- [ ] 3. Fix Bug 3 - Validation errors persist on site selection

  **What to do**:
  - Root cause: `frontend/src/app/(dashboard)/work-requests/new/page.tsx` function `handleSiteSelected()` (line 661-668) actualiza form state pero NO limpia `validationErrors`
  - Fix: En `handleSiteSelected()`, agregar `setValidationErrors([])` para limpiar errores visuales del campo serviceSite
  - También aplicar mismo fix en `handleCustomerSelected()` y `handleContactSelected()` y `updateField()` para limpiar errores del campo específico cuando el usuario interactúa

  **Files to modify**:
  - `frontend/src/app/(dashboard)/work-requests/new/page.tsx:661-668` - Agregar limpieza de validationErrors

  **Detailed implementation**:
  ```typescript
  function handleSiteSelected(siteId: string | undefined, snapshot: SiteSnapshot) {
    setValidationErrors((prev) => prev.filter((e) => e.field !== 'serviceSite'));
    setForm((current) => ({
      ...current,
      serviceSiteId: siteId,
      serviceSiteSnapshot: snapshot,
      serviceSite: snapshot.name,
    }));
  }
  // Similar para handleCustomerSelected: limpiar clientName errors
  // Similar para handleContactSelected: limpiar requesterName errors
  ```

  **Acceptance Criteria**:
  - [ ] Al seleccionar sitio temporal después de submit fallido, el error "Too small" desaparece
  - [ ] Al seleccionar cliente después de submit fallido, el error clientName desaparece
  - [ ] typecheck pasa

  **QA Scenarios**:
  ```
  Scenario: Validation error clears after selecting temporary site
    Tool: Playwright
    Preconditions: Login como gerente. Cliente sin sedes registradas.
    Steps:
      1. Navigate to /work-requests/new
      2. Select customer
      3. Click "Crear solicitud" sin llenar campos obligatorios
      4. Assert error "Too small: expected string" visible en serviceSite
      5. Open site selector → "Sitio temporal / no registrado"
      6. Fill "Nombre del sitio" con "Sitio de prueba"
      7. Click "Usar sitio temporal"
      8. Assert error "Too small" NO está visible
    Expected Result: Error de validación se limpia al seleccionar sitio
    Evidence: .sisyphus/evidence/task-3-validation-cleared.png
  ```

  **Commit**: YES
  - Message: `fix(work-requests): clear validation errors on field interaction`
  - Files: `frontend/src/app/(dashboard)/work-requests/new/page.tsx`

- [ ] 4. Fix Bug 4 - Add "Sin sede definida" option when customer has no sites

  **What to do**:
  - Root cause: `frontend/src/modules/customers/ui/ServiceSiteSelect.tsx` line 304-308 muestra "No hay sedes registradas" pero no da opción de continuar
  - Fix: Cuando `activeSites.length === 0` y `showTemporaryOption` es true, agregar botón "Sin sede definida" que llame `onChange(void 0, { name: 'Sin sede definida' })`
  - También modificar el componente para que el mensaje "No hay sedes registradas" incluya la opción de crear sitio temporal

  **Files to modify**:
  - `frontend/src/modules/customers/ui/ServiceSiteSelect.tsx:304-308` - Agregar opción "Sin sede definida"

  **Detailed implementation**:
  ```tsx
  {!isError && activeSites.length === 0 && (
    <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">
      No hay sedes registradas para este cliente.
    </div>
  )}
  {!isError && activeSites.length === 0 && showTemporaryOption && (
    <button
      type="button"
      onClick={() => {
        onChange(void 0, { name: 'Sin sede definida' });
        dispatch({ type: 'CLOSE' });
      }}
      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-brand)] transition-colors hover:bg-[var(--surface-secondary)]"
    >
      <MapPin className="size-4" />
      Sin sede definida
    </button>
  )}
  ```

  **Acceptance Criteria**:
  - [ ] Cuando cliente no tiene sedes, aparece opción "Sin sede definida"
  - [ ] Al seleccionar "Sin sede definida", el campo se marca como válido
  - [ ] Formulario se puede enviar con "Sin sede definida"

  **QA Scenarios**:
  ```
  Scenario: "Sin sede definida" option appears when customer has no sites
    Tool: Playwright
    Preconditions: Login. Cliente without registered sites exists.
    Steps:
      1. Navigate to /work-requests/new
      2. Select customer without sites
      3. Open site selector dropdown
      4. Assert "No hay sedes registradas" visible
      5. Assert "Sin sede definida" button visible
      6. Click "Sin sede definida"
      7. Assert field shows "Sin sede definida"
      8. Fill remaining required fields
      9. Submit form
    Expected Result: Form submits successfully with "Sin sede definida"
    Evidence: .sisyphus/evidence/task-4-no-site-option.png
  ```

  **Commit**: YES
  - Message: `feat(customers): add "Sin sede definida" option for customers without sites`
  - Files: `frontend/src/modules/customers/ui/ServiceSiteSelect.tsx`

- [ ] 5. Create Playwright test helpers + fixtures

  **What to do**:
  - Crear archivo de helpers con utilities reutilizables para tests Playwright
  - Ubicación: `frontend/tests/e2e/helpers/auth-helper.ts`
  - Crear fixtures con datos de test (usuarios, tokens, IDs)
  - Crear funciones helper: `loginAsGerente()`, `loginAsCliente()`, `navigateToPage()`, `assertLoadingState()`, `assertErrorState()`, `assertEmptyState()`
  - Basado en el patrón existente en `frontend/tests/e2e/login.spec.ts` y `frontend/tests/e2e/global-setup.ts`

  **Files to create/modify**:
  - `frontend/tests/e2e/helpers/auth-helper.ts` (CREATE)
  - `frontend/tests/e2e/helpers/page-helper.ts` (CREATE)
  - `frontend/tests/e2e/global-setup.ts` - Verificar que exporta token para reutilizar

  **Acceptance Criteria**:
  - [ ] Helper `loginAsGerente()` retorna page autenticada
  - [ ] Helper `loginAsCliente()` retorna page autenticada
  - [ ] Helper `assertLoadingState()` verifica skeleton/spinner visible
  - [ ] Helper `assertErrorState()` verifica error card visible
  - [ ] Helper `assertEmptyState()` verifica empty state visible
  - [ ] typecheck pasa

  **QA Scenarios**:
  ```
  Scenario: Auth helper logs in successfully
    Tool: Playwright
    Preconditions: Backend + frontend running. Test DB seeded.
    Steps:
      1. Import loginAsGerente from helpers
      2. Call loginAsGerente()
      3. Assert URL contains /dashboard
    Expected Result: Login helper returns authenticated page
    Evidence: .sisyphus/evidence/task-5-auth-helper.png
  ```

  **Commit**: YES
  - Message: `test(e2e): create Playwright test helpers and fixtures`
  - Files: `frontend/tests/e2e/helpers/auth-helper.ts`, `frontend/tests/e2e/helpers/page-helper.ts`

- [ ] 6. Auth test suite

  **What to do**:
  - Crear test exhaustivo de autenticación: login exitoso, login fallido, logout, token expiry, RBAC redirect
  - Ubicación: `frontend/tests/e2e/auth-full.spec.ts`
  - Basado en `frontend/tests/e2e/auth.spec.ts` y `frontend/tests/e2e/01-auth.spec.ts`
  - Cubrir: login gerente, login cliente, login residente, login HES, login supervisor
  - Cubrir: credenciales inválidas, usuario bloqueado, token expirado
  - Cubrir: redirect a login cuando no autenticado
  - Cubrir: RBAC en sidebar (cada rol ve diferentes opciones)

  **Acceptance Criteria**:
  - [ ] Test login exitoso para cada rol
  - [ ] Test login fallido muestra error
  - [ ] Test redirect a /login cuando no autenticado
  - [ ] Test sidebar muestra opciones correctas por rol

  **Commit**: YES
  - Message: `test(auth): comprehensive auth test suite with RBAC verification`
  - Files: `frontend/tests/e2e/auth-full.spec.ts`

- [ ] 7. Login page + Register page Playwright tests

  **What to do**:
  - Test específico para `/login` y `/register`
  - Verificar: campos, validación, submit, error states, loading states
  - Ubicación: `frontend/tests/e2e/pages/auth-pages.spec.ts`
  - Login: email/password campos, botón submit, link registro, link forgot-password
  - Register: todos los campos, validación Zod, submit exitoso, error de email duplicado
  - Forgot-password: campo email, submit, success state

  **Acceptance Criteria**:
  - [ ] Login page tests pasan
  - [ ] Register page tests pasan
  - [ ] Forgot-password tests pasan (si existe)

  **Commit**: YES
  - Message: `test(auth): login and register page Playwright tests`
  - Files: `frontend/tests/e2e/pages/auth-pages.spec.ts`

- [ ] 8. Dashboard page tests

  **What to do**:
  - Test para `/dashboard` - página principal con KPIs, órdenes activas, costos, alertas
  - Verificar: loading state, KPIs cards visibles, gráficos cargados, active orders table
  - Verificar: empty state (sin datos), error state (API falla), offline banner
  - Basado en `frontend/tests/e2e/comprehensive/full-app-smoke-e2e.spec.ts`
  - Ubicación: `frontend/tests/e2e/pages/dashboard-page.spec.ts`

  **Acceptance Criteria**:
  - [ ] KPIs cards visibles
  - [ ] Active orders table carga
  - [ ] Error state muestra retry button
  - [ ] Responsive: mobile layout funciona

  **Commit**: YES
  - Message: `test(dashboard): Playwright tests for main dashboard page`
  - Files: `frontend/tests/e2e/pages/dashboard-page.spec.ts`

- [ ] 9. Work Requests pages tests (list, new, detail)

  **What to do**:
  - Tests para 3 rutas: `/work-requests`, `/work-requests/new`, `/work-requests/[id]`
  - **List page**: tabla con solicitudes, paginación, filtros por estado, loading/error/empty states
  - **New page**: formulario completo con cliente, contacto, sitio, detalles, documentos adjuntos
  - **Detail page**: información de WR, tabs de visitas, botón "Calificar solicitud"
  - Ubicación: `frontend/tests/e2e/pages/work-requests-pages.spec.ts`
  - Verificar la creación completa de WR flujo: seleccionar cliente → contacto → sitio → tipo servicio → submit
  - Verificar que WR crea SC automáticamente (toast "Caso de servicio: SC-XXXX")
  - Verificar botón "Calificar solicitud" avanza paso

  **Acceptance Criteria**:
  - [ ] List page: tabla carga, filtros funcionan, paginación ok
  - [ ] New page: todos los campos, validación Zod antes de submit
  - [ ] New page: creación exitosa con toast de SC
  - [ ] Detail page: datos cargan, botón calificar funciona
  - [ ] Loading/error/empty states para cada página

  **Referencias**:
  - `frontend/src/app/(dashboard)/work-requests/page.tsx` - List page
  - `frontend/src/app/(dashboard)/work-requests/new/page.tsx` - New form (865 líneas)
  - `frontend/src/app/(dashboard)/work-requests/[id]/page.tsx` - Detail page

  **QA Scenarios**:
  ```
  Scenario: Create work request full flow
    Tool: Playwright
    Preconditions: Login como gerente. Cliente "Cenit" existe con contactos.
    Steps:
      1. Navigate to /work-requests/new
      2. Select customer "Cenit Transporte"
      3. Select contact "Pedro Alvarado"
      4. Click "Sitio temporal / no registrado"
      5. Fill "Instalaciones principales Cenit"
      6. Select service type "Mantenimiento"
      7. Select urgency "Media"
      8. Fill shortDescription "Solicitud de mantenimiento preventivo HVAC"
      9. Fill description "Mantenimiento preventivo HVAC con coordinación"
      10. Click "Crear solicitud"
      11. Assert toast "Solicitud creada. Caso de servicio: SC-"
      12. Assert redirected to /work-requests/[id]
    Expected Result: WR creado, SC generado, redirect a detalle
    Evidence: .sisyphus/evidence/task-9-wr-created.png
  ```

  **Commit**: YES
  - Message: `test(work-requests): Playwright tests for list, new, detail pages`
  - Files: `frontend/tests/e2e/pages/work-requests-pages.spec.ts`

- [ ] 10. Site Visits pages tests

  **What to do**:
  - Tests para 3 rutas: `/site-visits`, `/site-visits/new`, `/site-visits/[id]`
  - List: tabla con visitas técnicas, filtros
  - New: formulario de programación de visita, selección de WR/SC, fecha, técnico asignado
  - Detail: información de visita, estado, acciones
  - Ubicación: `frontend/tests/e2e/pages/site-visits-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] List page carga con datos
  - [ ] New form crea visita exitosamente
  - [ ] Detail muestra info completa
  - [ ] Loading/error/empty states

  **Commit**: YES
  - Message: `test(site-visits): Playwright tests for site visits pages`
  - Files: `frontend/tests/e2e/pages/site-visits-pages.spec.ts`

- [ ] 11. Proposals pages tests (list, new, detail)

  **What to do**:
  - Tests para 3 rutas: `/proposals`, `/proposals/new`, `/proposals/[id]`
  - **List**: tabla con todas las propuestas, filtros por estado (BORRADOR, ENVIADA, APROBADA, RECHAZADA), contadores
  - **New**: formulario completo con items (descripción, cantidad, unidad, valor unitario), heredar datos de SC si `?serviceCaseId=`, cálculo automático subtotal/IVA/total
  - **Detail**: información general, StatusBadge, cost breakdown, ProposalActions (Enviar, Aprobar, Rechazar)
  - Verificar Bug 1 fix: StatusBadge se actualiza reactivamente
  - Ubicación: `frontend/tests/e2e/pages/proposals-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] List page: tabla carga con datos reales, filtros por estado
  - [ ] New page: formulario con items, cálculo automático de totales
  - [ ] New page: herencia de datos desde SC via serviceCaseId
  - [ ] Detail page: StatusBadge reactivo tras "Enviar" (verifica Bug 1 fix)
  - [ ] Detail page: cost breakdown carga
  - [ ] Aprobar propuesta rechazada por RBAC (rol gerente no puede)

  **Referencias**:
  - `frontend/src/app/(dashboard)/proposals/page.tsx`
  - `frontend/src/app/(dashboard)/proposals/new/page.tsx`
  - `frontend/src/app/(dashboard)/proposals/[id]/page.tsx`
  - `frontend/src/modules/proposals/queries.ts`
  - `backend/src/modules/proposal/proposal.service.ts`

  **QA Scenarios**:
  ```
  Scenario: Create proposal with service case inheritance
    Tool: Playwright
    Preconditions: Login como gerente. SC-2026-0002 en paso 3.
    Steps:
      1. Navigate to /proposals/new?serviceCaseId=SC_MONGO_ID
      2. Assert clientName heredado del SC
      3. Assert location heredado
      4. Add item: "Mantenimiento HVAC", qty: 1, unitCost: 4500000
      5. Add item: "Materiales", qty: 1, unitCost: 850000
      6. Assert subtotal = 5350000
      7. Assert IVA = 1016500
      8. Assert total = 6366500
      9. Click "Guardar propuesta"
      10. Assert redirect to /proposals/[id]
      11. Assert StatusBadge = "draft"
    Expected Result: Propuesta creada con valores correctos
    Evidence: .sisyphus/evidence/task-11-proposal-created.png

  Scenario: Send proposal and verify reactive status (Bug 1 fix)
    Tool: Playwright
    Preconditions: Proposal in DRAFT state exists.
    Steps:
      1. Navigate to /proposals/[DRAFT_ID]
      2. Assert StatusBadge = "draft"
      3. Assert "Enviar" button visible
      4. Click "Enviar"
      5. Wait for toast "Propuesta enviada correctamente"
      6. Assert StatusBadge now shows "sent"
      7. Assert "Enviar" button gone, "Aprobar"/"Rechazar" buttons visible
    Expected Result: Status updates reactively without page reload
    Evidence: .sisyphus/evidence/task-11-reactive-status.png
  ```

  **Commit**: YES
  - Message: `test(proposals): Playwright tests for proposals CRUD pages`
  - Files: `frontend/tests/e2e/pages/proposals-pages.spec.ts`

- [ ] 12. Orders pages tests (list, new, detail, edit)

  **What to do**:
  - Tests para 7+ rutas: `/orders`, `/orders/new`, `/orders/[id]`, `/orders/[id]/edit`, `/orders/kanban`, `/orders/[id]/planning`, `/orders/[id]/execution`
  - **List**: tabla con órdenes, kanban board con drag & drop
  - **New**: formulario creación con asignación de recursos
  - **Detail**: información completa, tabs (planning, execution, costs, evidences, ASTs, invoice)
  - **Edit**: modificar orden existente
  - **Kanban**: drag & drop entre columnas de estado
  - **Planning**: planning packet detalle
  - **Execution**: execution session
  - Ubicación: `frontend/tests/e2e/pages/orders-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] List page: tabla y kanban funcionan
  - [ ] New: creación de orden exitosa
  - [ ] Detail: tabs funcionan, datos cargan
  - [ ] Kanban: drag & drop cambia estado
  - [ ] Planning: packet info carga
  - [ ] Loading/error/empty states

  **Commit**: YES
  - Message: `test(orders): comprehensive orders pages Playwright tests`
  - Files: `frontend/tests/e2e/pages/orders-pages.spec.ts`

- [ ] 13. Service Cases + Cockpit tests

  **What to do**:
  - Tests para 3 rutas: `/service-cases`, `/service-cases/[id]`, `/service-cases/[id]/cockpit`
  - **List**: tabla de casos de servicio con estado, cliente, paso actual
  - **Detail**: pipeline de 14 pasos, blockers, next actions, timeline, cost traceability
  - **Cockpit**: vista completa con workflow (redirect a detail por ahora)
  - Verificar Bug 2 fix: blocker "Falta propuesta económica" desaparece tras crear propuesta vinculada
  - Verificar avance de paso manual ("Calificar solicitud" o "Avanzar paso")
  - Verificar blockers se muestran correctamente en cada paso
  - Ubicación: `frontend/tests/e2e/pages/service-cases-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] List page: casos cargan con paginación
  - [ ] Detail page: 14-step pipeline visual, paso actual resaltado
  - [ ] Blockers visibles con código, mensaje, ownerRole, recommendedAction
  - [ ] Avance de paso funciona (si no hay blockers)
  - [ ] Bug 2 fix: blocker propuesta desaparece tras crear propuesta vinculada

  **Referencias**:
  - `frontend/src/app/(dashboard)/service-cases/page.tsx`
  - `frontend/src/app/(dashboard)/service-cases/[id]/page.tsx`
  - `frontend/src/modules/service-cases/components/ServiceCaseWorkflowCockpit.tsx`
  - `backend/src/services/cermont-workflow-gate.service.ts`

  **QA Scenarios**:
  ```
  Scenario: Blocker clears after linked proposal (Bug 2 fix)
    Tool: Playwright
    Preconditions: SC en paso 3 sin propuesta vinculada.
    Steps:
      1. Navigate to /service-cases/SC_ID
      2. Assert blocker "Falta la propuesta económica" visible
      3. Navigate to /proposals/new?serviceCaseId=SC_ID
      4. Create proposal with items and submit
      5. Navigate back to /service-cases/SC_ID
      6. Assert blocker "Falta la propuesta económica" NOT visible
      7. Assert next action available
    Expected Result: Blocker clears after proposal created via serviceCaseId
    Evidence: .sisyphus/evidence/task-13-blocker-cleared.png
  ```

  **Commit**: YES
  - Message: `test(service-cases): Playwright tests for SC list, detail, cockpit`
  - Files: `frontend/tests/e2e/pages/service-cases-pages.spec.ts`

- [ ] 14. Planning pages tests

  **What to do**:
  - Tests para 3 rutas: `/planning`, `/planning/[id]`, `/planning-packet/new`
  - List: overview de planeación con recursos asignados
  - Detail: planning packet completo con crew, tools, checklists
  - New: crear planning packet asociado a orden
  - Ubicación: `frontend/tests/e2e/pages/planning-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] List: planning items cargan
  - [ ] Detail: planning packet completo
  - [ ] New: creación exitosa

  **Commit**: YES
  - Message: `test(planning): Playwright tests for planning pages`
  - Files: `frontend/tests/e2e/pages/planning-pages.spec.ts`

- [ ] 15. Purchase Orders tests

  **What to do**:
  - Tests para 3 rutas: `/purchase-orders`, `/purchase-orders/new`, `/purchase-orders/[id]`
  - List: POs con estados
  - New: formulario con proveedor, items, valores
  - Detail: PO info, aprobación
  - Ubicación: `frontend/tests/e2e/pages/purchase-orders-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] List: POs cargan
  - [ ] New: creación exitosa
  - [ ] Detail: información completa

  **Commit**: YES
  - Message: `test(purchase-orders): Playwright tests for PO pages`
  - Files: `frontend/tests/e2e/pages/purchase-orders-pages.spec.ts`

- [ ] 16. Billing pages tests (SES, Invoices)

  **What to do**:
  - Tests para 8 rutas de billing: `/billing/ses`, `/billing/ses/new`, `/billing/ses/[id]`, `/billing/ses/[id]/approve`, `/billing/invoices`, `/billing/invoices/new`, `/billing/invoices/[id]`, `/billing/invoices/[id]/approve`
  - SES: list, create, detail, approve
  - Invoices: list, create, detail, approve
  - Verificar cálculo de valores SES desde delivery record
  - Verificar flujo SES → Invoice
  - Ubicación: `frontend/tests/e2e/pages/billing-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] SES list: tabla carga
  - [ ] SES new: creación desde delivery record
  - [ ] SES approve: aprobación funciona
  - [ ] Invoice list: tabla carga
  - [ ] Invoice new: creación desde SES
  - [ ] Invoice approve: aprobación funciona

  **Commit**: YES
  - Message: `test(billing): Playwright tests for SES and invoices pages`
  - Files: `frontend/tests/e2e/pages/billing-pages.spec.ts`

- [ ] 17. Payments + Delivery Records tests

  **What to do**:
  - Tests para 6 rutas: `/payments`, `/payments/new`, `/payments/[id]`, `/delivery-records`, `/delivery-records/new`, `/delivery-records/[id]`
  - Payments: list, create from invoice, detail con conciliación
  - Delivery Records: list, create from technical report, detail con firma
  - Verificar flujo Delivery Record → Signature
  - Ubicación: `frontend/tests/e2e/pages/payments-delivery-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] Payments list carga
  - [ ] Payment creation from invoice
  - [ ] Delivery records list carga
  - [ ] Delivery record creation + signature

  **Commit**: YES
  - Message: `test(payments-delivery): Playwright tests for payments and delivery records`
  - Files: `frontend/tests/e2e/pages/payments-delivery-pages.spec.ts`

- [ ] 18. Documents + Reports tests

  **What to do**:
  - Tests para 5 rutas: `/documents`, `/documents/templates`, `/reports`, `/reports/new`, `/reports/[id]`
  - Documents: list, upload, templates
  - Reports: list, auto-draft from execution, detail con PDF
  - Ubicación: `frontend/tests/e2e/pages/documents-reports-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] Documents list carga
  - [ ] Reports list carga
  - [ ] Report draft desde execution session
  - [ ] Report detail muestra PDF

  **Commit**: YES
  - Message: `test(documents-reports): Playwright tests for documents and reports`
  - Files: `frontend/tests/e2e/pages/documents-reports-pages.spec.ts`

- [ ] 19. Admin pages tests

  **What to do**:
  - Tests para 9 rutas admin: `/admin/users`, `/admin/users/new`, `/admin/users/[id]`, `/admin/users/[id]/edit`, `/admin/audit`, `/admin/backups`, `/admin/custom-fields`, `/admin/personnel`, `/admin/settings`
  - Users: CRUD completo, roles, edición
  - Audit: tabla de auditoría, paginación, filtros
  - Settings: configuración del sistema
  - Ubicación: `frontend/tests/e2e/pages/admin-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] User CRUD completo
  - [ ] Audit log paginado
  - [ ] Settings carga

  **Commit**: YES
  - Message: `test(admin): Playwright tests for admin pages (users, audit, settings)`
  - Files: `frontend/tests/e2e/pages/admin-pages.spec.ts`

- [ ] 20. Portal client pages tests

  **What to do**:
  - Tests para 7 rutas portal: `/portal`, `/portal/invoices`, `/portal/orders`, `/portal/orders/[id]`, `/portal/proposals`, `/portal/service-cases`, `/portal/service-cases/[id]`
  - Login como role `cliente`
  - Verificar vista limitada (solo sus propios datos)
  - Portal home: dashboard resumido para clientes
  - Portal proposals: lista propuestas, aprobar/rechazar
  - Portal service-cases: pipeline simplificado
  - Ubicación: `frontend/tests/e2e/pages/portal-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] Portal home carga con datos del cliente
  - [ ] Portal proposals lista propuestas del cliente
  - [ ] Portal proposals: aprobar propuesta (rol cliente) funciona
  - [ ] Portal invoices lista facturas del cliente
  - [ ] Portal service-cases lista y detalle

  **QA Scenarios**:
  ```
  Scenario: Client approves proposal via portal
    Tool: Playwright
    Preconditions: Login como cliente. Proposal ENVIADA exists for this client.
    Steps:
      1. Navigate to /portal/proposals
      2. Assert proposal list shows only client's proposals
      3. Click on proposal ENVIADA
      4. Click "Aprobar"
      5. Assert toast "Propuesta aprobada correctamente"
      6. Assert status changed to "approved"
    Expected Result: Client can approve proposals via portal
    Evidence: .sisyphus/evidence/task-20-client-approve.png
  ```

  **Commit**: YES
  - Message: `test(portal): Playwright tests for client portal pages`
  - Files: `frontend/tests/e2e/pages/portal-pages.spec.ts`

- [ ] 21. Resources + Kits + Tools tests

  **What to do**:
  - Tests para 5 rutas: `/resources`, `/resources/[id]`, `/resources/kits`, `/resources/kits/new`, `/tools`
  - Resources: list, detail
  - Kits: list, create nuevo kit con herramientas
  - Tools: readiness catalog con fotos y checklists
  - Ubicación: `frontend/tests/e2e/pages/resources-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] Resources list carga
  - [ ] Kit CRUD funciona
  - [ ] Tools catalog carga

  **Commit**: YES
  - Message: `test(resources): Playwright tests for resources, kits, tools`
  - Files: `frontend/tests/e2e/pages/resources-pages.spec.ts`

- [ ] 22. Costs + Dashboard analytics tests

  **What to do**:
  - Tests para 3 rutas: `/costs`, `/costs/catalog`, `/costs/[orderId]`
  - Costs overview: dashboard de costos con resumen
  - Catalog: items de costos (materiales, labor, equipos)
  - Order costs: costos reales vs propuesta, gráficos de variación
  - Verificar cálculo de variance (presupuesto vs real)
  - Ubicación: `frontend/tests/e2e/pages/costs-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] Costs overview carga con KPIs
  - [ ] Catalog items listos
  - [ ] Order costs muestra variance

  **Commit**: YES
  - Message: `test(costs): Playwright tests for costs pages`
  - Files: `frontend/tests/e2e/pages/costs-pages.spec.ts`

- [ ] 23. UX Maturation - Loading states refactor

  **What to do**:
  - Auditoría de todas las páginas para verificar loading states consistentes
  - Cada página con datos async debe mostrar: Skeleton o spinner
  - Páginas a verificar (de la route map):
    - Dashboard, WR list/new/detail, SV list/new/detail, Proposals list/new/detail
    - Orders list/new/detail/edit/kanban, SC list/detail/cockpit
    - Planning, PO, Billing (SES + invoices), Payments, Delivery Records
    - Documents, Reports, Admin (users, audit), Portal, Resources, Tools, Costs
  - Estándar: usar `<Skeleton>` component de `@/core/ui/Skeleton` en todas las páginas
  - Crear HOC o hook `usePageLoadingState()` si no existe
  - Revisar cada page.tsx: si falta loading state, agregarlo
  - Ubicación: refactor en cada page.tsx según necesidad
  - Prioridad: páginas con datos críticos (SC cockpit, dashboard, proposals, orders)

  **Files to review/modify (no exhaustivo)**:
  - `frontend/src/app/(dashboard)/service-cases/[id]/page.tsx` - Ya tiene skeleton
  - `frontend/src/app/(dashboard)/proposals/[id]/page.tsx` - Ya tiene loading
  - `frontend/src/app/(dashboard)/work-requests/page.tsx` - Verificar
  - `frontend/src/app/(dashboard)/orders/[id]/execution/page.tsx` - Verificar
  - `frontend/src/app/(dashboard)/billing/ses/page.tsx` - Verificar
  - `frontend/src/app/(dashboard)/payments/page.tsx` - Verificar
  - `frontend/src/app/(dashboard)/documents/page.tsx` - Verificar
  - `frontend/src/app/(dashboard)/admin/users/page.tsx` - Verificar
  - `frontend/src/app/(portal)/portal/page.tsx` - Verificar

  **Acceptance Criteria**:
  - [ ] Todas las páginas con datos async tienen loading state
  - [ ] Loading states usan Skeleton component consistente
  - [ ] typecheck pasa

  **Commit**: YES
  - Message: `feat(ux): add consistent loading states to all data-driven pages`
  - Files: Various page.tsx files

- [ ] 24. UX Maturation - Error/Empty states refactor

  **What to do**:
  - Auditoría de todas las páginas para verificar error y empty states
  - Cada página con datos debe tener:
    - **Error state**: card con mensaje de error + botón "Reintentar" que llama `refetch()`
    - **Empty state**: ilustración/icono + mensaje descriptivo + CTA para crear/accionar
    - **Offline state**: banner persistente en páginas de campo
    - **Forbidden state**: card "No tienes permiso" en páginas protegidas
  - Estándares (de frontend/AGENTS.md):
    ```tsx
    // Error state pattern
    {isError && (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <h3>Error al cargar datos</h3>
        <p>{error.message}</p>
        <button onClick={() => refetch()}>Reintentar</button>
      </div>
    )}
    // Empty state pattern
    {data && data.length === 0 && (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <InboxIcon className="mx-auto size-12" />
        <h3>No hay datos</h3>
        <p>Descripción del estado vacío</p>
        <Link href="/new">Crear primero</Link>
      </div>
    )}
    ```
  - Crear componentes reutilizables: `ErrorState`, `EmptyState`, `OfflineBanner`, `ForbiddenState`
  - Ubicación: `frontend/src/core/ui/ErrorState.tsx`, `frontend/src/core/ui/EmptyState.tsx`

  **Acceptance Criteria**:
  - [ ] Componentes `ErrorState`, `EmptyState`, `OfflineBanner` creados
  - [ ] Todas las páginas con datos usan estos componentes
  - [ ] Cada página tiene al menos error + empty states
  - [ ] Páginas de campo tienen offline banner

  **Commit**: YES
  - Message: `feat(ux): create reusable ErrorState, EmptyState, OfflineBanner components`
  - Files: `frontend/src/core/ui/ErrorState.tsx`, `frontend/src/core/ui/EmptyState.tsx`, `frontend/src/core/ui/OfflineBanner.tsx`, various page.tsx

- [ ] 25. Design System v4.0 Implementation - Tokens CSS + Dark/Light Mode

  **What to do**:
  - Implementar DESIGN.md v4.0 completo: tokens CSS, dark mode default, light mode alternativo
  - Basado estrictamente en `DESIGN.md` (897 líneas de especificación)
  - **Tokens CSS**: Actualizar `frontend/src/app/globals.css` con todos los tokens de DESIGN.md sección 18
  - **Dark mode default**: Configurar `next.config.ts` para `darkMode: 'class'`, agregar `data-theme` en html
  - **Light mode**: Implementar via `[data-theme="light"]` override de todos los tokens dark
  - **CSS variables**: 
    ```css
    :root, [data-theme="dark"] {
      --color-canvas: #121212;
      --color-surface: #1A1A1A;
      --color-surface-elevated: #242424;
      --color-surface-highlight: #2E2E2E;
      --color-canvas-deep: #0A0A0A;
      --color-border-subtle: rgba(255,255,255,0.06);
      --color-border-default: rgba(255,255,255,0.10);
      --color-border-strong: rgba(255,255,255,0.16);
      --color-text-primary: #F5F5F5;
      --color-text-secondary: #A0A0A0;
      --color-text-muted: #606060;
      --color-accent: #3A78D8; /* CERMONT Blue dark */
      --color-cermont-blue: #2154A6;
      --color-success: #4ADE80;
      --color-warning: #FBBF24;
      --color-danger: #EF4444;
      --color-info: #60A5FA;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 24px;
      --radius-2xl: 32px;
      --radius-pill: 9999px;
      --space-1: 4px; --space-2: 8px; --space-3: 12px;
      --space-4: 16px; --space-5: 20px; --space-6: 24px;
      --space-8: 32px; --space-10: 40px; --space-12: 48px; --space-16: 64px;
    }
    [data-theme="light"] {
      --color-canvas: #F8FAFC;
      --color-surface: #FFFFFF;
      /* ... all light tokens from DESIGN.md section 4.3 ... */
    }
    ```
  - **Theme toggle**: Componente `ThemeToggle` que cambia data-theme entre "dark" y "light", persiste en localStorage
  - **Tailwind config**: Mapear tokens CSS a clases Tailwind custom (colores, radios, spacing)
  - **Refactor páginas existentes**: Reemplazar hardcoded colors por CSS variables
  
  **Files to modify**:
  - `frontend/src/app/globals.css` - Tokens CSS completos
  - `frontend/src/app/layout.tsx` - Theme provider wrapper
  - `frontend/src/core/ui/ThemeToggle.tsx` - Componente toggle (CREATE)
  - `frontend/src/core/providers/ThemeProvider.tsx` - Provider con persistencia (CREATE)
  - `frontend/tailwind.config.ts` - Extender con tokens custom
  - Various page.tsx - Reemplazar colores hardcodeados por vars

  **Acceptance Criteria**:
  - [ ] Tokens CSS completos de DESIGN.md implementados
  - [ ] Dark mode es default
  - [ ] Light mode funciona via data-theme toggle
  - [ ] ThemeToggle component funcional con persistencia
  - [ ] Sin colores hardcodeados en páginas principales
  - [ ] typecheck + lint + build pasan

  **QA Scenarios**:
  ```
  Scenario: Dark mode default with light mode toggle
    Tool: Playwright
    Preconditions: Fresh browser without localStorage theme.
    Steps:
      1. Navigate to /dashboard
      2. Assert CSS variable --color-canvas = #121212 (dark default)
      3. Assert body/HTML has data-theme="dark" or class="dark"
      4. Click ThemeToggle button
      5. Assert data-theme changes to "light"
      6. Assert --color-canvas = #F8FAFC
      7. Refresh page
      8. Assert theme persists as light (from localStorage)
    Expected Result: Dark mode default, toggle works, preference persists
    Evidence: .sisyphus/evidence/task-25-theme-toggle.png
  ```

  **Commit**: YES
  - Message: `feat(design): implement DESIGN.md v4.0 tokens CSS with dark/light mode`
  - Files: `frontend/src/app/globals.css`, `frontend/src/core/ui/ThemeToggle.tsx`, `frontend/src/core/providers/ThemeProvider.tsx`, `frontend/tailwind.config.ts`

- [ ] 26. Component Library v4.0 - KpiCard, Badge, ProgressRing, SectionHeader

  **What to do**:
  - Crear librería de componentes reutilizables basados en DESIGN.md sección 10
  - **KpiCard** (DESIGN.md sección 10.2 - KPI Card):
    - Icon capsule (48px, pill, --bg-surface-elevated background)
    - Label (body-sm, --text-secondary)
    - Value (metric 32px, --text-primary)
    - Delta opcional (▲/▼ con color semántico)
    - Accepted props: `{ icon, label, value, delta?, trend?: 'up'|'down', subtitle?, loading? }`
  - **StatusBadge** mejorado (DESIGN.md sección 10.4):
    - Background semitransparente (15% opacity)
    - Texto semántico
    - Icono Lucide + texto
    - Variants: success, warning, danger, info, neutral
    - Accepted props: `{ status, label?, icon?, size?: 'sm'|'md' }`
  - **ProgressRing** (DESIGN.md sección 10.6):
    - SVG circular con stroke-dashoffset animation
    - Sizes: 48px (sm), 64px (md), 80px (lg)
    - Stroke: 4px track, 4px progress
    - Color semántico según valor (<30% danger, <70% warning, >=70% success)
    - Label central opcional
    - Animation 600ms ease-out
  - **SectionHeader**:
    - Título + subtítulo + acción opcional + badge contador
    - Usado en dashboard, lists, sections
  - **EmptyStateCard** (DESIGN.md sección 14):
    - Icon-xl en capsule
    - Título (h3)
    - Descripción (body)
    - CTA button opcional
  - **MetricDelta**:
    - ▲ o ▼ + valor + "vs ayer/semana/mes"
    - Color verde (subida positiva), rojo (bajada positiva para ciertas métricas)

  **Files to create**:
  - `frontend/src/core/ui/KpiCard.tsx` (CREATE)
  - `frontend/src/core/ui/StatusBadge.tsx` (REFACTOR from existing)
  - `frontend/src/core/ui/ProgressRing.tsx` (CREATE)
  - `frontend/src/core/ui/SectionHeader.tsx` (CREATE)
  - `frontend/src/core/ui/EmptyStateCard.tsx` (CREATE)
  - `frontend/src/core/ui/MetricDelta.tsx` (CREATE)
  - `frontend/src/core/ui/index.ts` - Barrel export (CREATE)

  **Design tokens to use**: CSS variables de Task 25

  **Acceptance Criteria**:
  - [ ] KpiCard renderiza con icon capsule + metric + delta
  - [ ] StatusBadge tiene variants success/warning/danger/info/neutral
  - [ ] ProgressRing anima con stroke-dashoffset
  - [ ] SectionHeader con título + subtítulo + acción
  - [ ] EmptyStateCard con icon + text + CTA
  - [ ] MetricDelta muestra ▲ verde / ▼ rojo según contexto
  - [ ] Todos los componentes aceptan props loading (skeleton variant)
  - [ ] typecheck pasa

  **QA Scenarios**:
  ```
  Scenario: KpiCard renders with all visual elements
    Tool: Playwright
    Preconditions: Dashboard page using KpiCard component.
    Steps:
      1. Navigate to /dashboard
      2. Assert KpiCard visible with icon capsule (48px rounded)
      3. Assert label text visible (e.g., "Casos activos")
      4. Assert value in metric font (32px bold)
      5. Assert delta indicator (▲ or ▼) with color
    Expected Result: KpiCard shows complete KPI with visual hierarchy
    Evidence: .sisyphus/evidence/task-26-kpi-card.png

  Scenario: ProgressRing animates on render
    Tool: Playwright
    Preconditions: Component with ProgressRing > 0% value.
    Steps:
      1. Navigate to service case cockpit or dashboard
      2. Assert ProgressRing visible with SVG
      3. Assert stroke-dashoffset animation completes
      4. Assert color changes based on value (green > 70%, yellow > 30%, red < 30%)
    Expected Result: ProgressRing renders and animates
    Evidence: .sisyphus/evidence/task-26-progress-ring.png
  ```

  **Commit**: YES
  - Message: `feat(design): implement DESIGN.md v4.0 component library - KpiCard, ProgressRing, Badge, SectionHeader`
  - Files: `frontend/src/core/ui/KpiCard.tsx`, `frontend/src/core/ui/ProgressRing.tsx`, `frontend/src/core/ui/SectionHeader.tsx`, `frontend/src/core/ui/EmptyStateCard.tsx`, `frontend/src/core/ui/MetricDelta.tsx`, `frontend/src/core/ui/StatusBadge.tsx`

- [ ] 27. Dashboard Hero + KPI Grid Redesign

  **What to do**:
  - Rediseñar el dashboard `/dashboard` siguiendo DESIGN.md sección 12 y PROMPT_MEJORA_KPIS
  - **DashboardHero** (PROMPT sección 5.B):
    - Saludo + rol del usuario
    - Resumen ejecutivo corto ("Hoy tienes 12 casos activos...")
    - 2-4 métricas destacadas en fila
    - CTA o acción rápida (ej: "Nueva solicitud")
    - Diseño premium: card con fondo sutil, gradiente suave o acento CERMONT Blue
  - **KpiGrid** (PROMPT sección 5.C):
    - Grid 2 columnas mobile, 3 tablet, 4-6 desktop
    - KPIs prioritarios: Casos activos, En ejecución, Completados mes, Facturado mes, Bloqueados, SLA
    - Cada KPI usa el nuevo componente KpiCard
  - **Flujo 14 pasos** (PROMPT sección 5.D):
    - Tabs por fase: Comercial / Operativo / Cierre / Financiero
    - Cards por paso con contador + badge semántico
    - Mobile: carrusel o apilado
  - **Cadena documental** (PROMPT sección 5.E):
    - Timeline visual del pipeline documental
    - Stepper horizontal desktop, vertical mobile
  - **ChartCards** (PROMPT sección 5.F):
    - Título + subtítulo + área gráfico + leyenda
    - Empty state elegante si no hay datos
    - Gráficos: tendencia mensual, distribución por estado, casos por etapa
  - **RecentOrdersTable / RecentActivityFeed / AlertSummaryCard** (PROMPT sección 5.G)
  - **Estructura narrativa** (DESIGN.md sección 12.1):
    1. Pulso operativo — Hero
    2. KPIs estratégicos
    3. Flujo 14 pasos
    4. Gráficos
    5. Actividad reciente
    6. Alertas y bloqueos
  - Usar TanStack Query para todos los datos
  - Backend: endpoint `/api/dashboard/predictive-kpis` extendido con nuevos KPIs

  **Files to modify**:
  - `frontend/src/app/(dashboard)/dashboard/page.tsx` - Rediseño completo
  - `frontend/src/modules/dashboard/ui/DashboardHero.tsx` (CREATE)
  - `frontend/src/modules/dashboard/ui/KpiGrid.tsx` (CREATE)
  - `frontend/src/modules/dashboard/ui/FlowStepCard.tsx` (CREATE)
  - `frontend/src/modules/dashboard/ui/FlowStageTabs.tsx` (CREATE)
  - `frontend/src/modules/dashboard/ui/DocumentChainCard.tsx` (CREATE)
  - `frontend/src/modules/dashboard/ui/ChartCard.tsx` (CREATE)
  - `frontend/src/modules/dashboard/ui/RecentOrdersTable.tsx` (CREATE)
  - `frontend/src/modules/dashboard/ui/RecentActivityFeed.tsx` (CREATE)
  - `frontend/src/modules/dashboard/ui/AlertSummaryCard.tsx` (CREATE)
  - `frontend/src/modules/dashboard/hooks/useDashboardKPIs.ts` (CREATE)
  - `backend/src/modules/dashboard/dashboard.routes.ts` - Nuevos endpoints
  - `backend/src/modules/dashboard/dashboard.controller.ts` - Nuevos controllers
  - `backend/src/modules/dashboard/dashboard.service.ts` - Lógica de KPIs

  **Acceptance Criteria**:
  - [ ] DashboardHero muestra saludo + rol + métricas destacadas + CTA
  - [ ] KpiGrid con 6+ KPIS usando KpiCard component
  - [ ] Flujo 14 pasos con tabs por fase
  - [ ] Cadena documental visual
  - [ ] ChartCards con Recharts
  - [ ] RecentOrdersTable con última actividad
  - [ ] RecentActivityFeed tipo timeline
  - [ ] AlertSummaryCard con blockers
  - [ ] Responsive: mobile stack, desktop grid 12 col
  - [ ] Dark/light mode funcional
  - [ ] typecheck + lint + build pasan

  **QA Scenarios**:
  ```
  Scenario: Dashboard shows complete narrative structure
    Tool: Playwright
    Preconditions: service cases and orders exist in DB.
    Steps:
      1. Navigate to /dashboard
      2. Assert DashboardHero visible with greeting and role
      3. Assert KpiGrid with 6+ KpiCards
      4. Assert Flow 14 steps section with phase tabs
      5. Assert ChartCards render with Recharts
      6. Assert RecentOrdersTable has rows
      7. Assert AlertSummaryCard shows blockers if any
      8. Resize to mobile (375px)
      9. Assert layout stacks vertically, all sections accessible
    Expected Result: Dashboard tells complete operational story
    Evidence: .sisyphus/evidence/task-27-dashboard-redesign.png
    Evidence: .sisyphus/evidence/task-27-dashboard-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): redesign with DESIGN.md v4.0 - Hero, KPI Grid, 14-step flow, charts, activity feed`
  - Files: dashboard module components + backend dashboard endpoints

- [ ] 28. Mobile Navigation - Bottom Nav + FAB

  **What to do**:
  - Implementar navegación móvil según DESIGN.md sección 7
  - **Bottom Navigation** (DESIGN.md sección 7 - Bottom navigation):
    - Altura 64px (56px contenido + 8px safe area)
    - Background: `--bg-surface` con `backdrop-filter: blur(12px)`
    - Border top: `--border-subtle`
    - 5 ítems: Dashboard, Casos, + (FAB), Evidencias, Perfil
    - Iconos unicolor: icon-md (20px)
    - Label: caption (12px), siempre presente
    - Active state: icono + texto en `--icon-accent` (CERMONT Blue)
    - Inactive: icono + texto en `--icon-muted`
  - **FAB** (Floating Action Button) (DESIGN.md sección 7 - FAB):
    - Posición: centrado sobre bottom nav, offset -28px
    - Tamaño: 56x56px, radio pill
    - Background: `--cermont-blue`
    - Sombra: `0 4px 12px rgba(33,84,166,0.25)`
    - Icono: Plus (24px, blanco)
    - Animación: pulse sutil en idle, rotate en open
    - Acción: abrir menú rápido o navegar a "nueva solicitud"
  - **Sidebar desktop** (DESIGN.md sección 8):
    - Ancho: 240px (64px colapsada)
    - Background: `--bg-canvas-deep`
    - Active item: `--bg-surface-highlight` + borde izquierdo accent
    - Responsive: oculta en mobile (reemplazada por bottom nav)
  - **App Shell**: Refactor layout para detectar mobile vs desktop y mostrar nav correcta

  **Files to modify/create**:
  - `frontend/src/core/ui/BottomNav.tsx` (CREATE)
  - `frontend/src/core/ui/FloatingActionButton.tsx` (CREATE)
  - `frontend/src/components/layout/AppShell.tsx` - Refactor para mobile nav
  - `frontend/src/components/layout/Sidebar.tsx` - Refactor responsive
  - `frontend/src/app/layout.tsx` - Integrar AppShell
  - `frontend/src/modules/navigation/navigation-config.ts` - Config centralizada de rutas

  **iOS Safe Area**: Usar `env(safe-area-inset-bottom)` para bottom nav en dispositivos con notch
  **Responsive breakpoints**: < 640px bottom nav, >= 640px sidebar

  **Acceptance Criteria**:
  - [ ] Bottom Nav con 5 ítems + FAB centrado
  - [ ] FAB 56x56 pill azul CERMONT con pulse animation
  - [ ] Bottom Nav muestra active state correcto según ruta actual
  - [ ] Desktop sidebar 240px, colapsable a 64px
  - [ ] Mobile (<640px): bottom nav visible, sidebar oculta
  - [ ] Tablet (640-1024): bottom nav visible o sidebar compacta
  - [ ] Desktop (>=1024): sidebar visible, bottom nav oculta
  - [ ] FAB abre menú rápido o navega a /work-requests/new
  - [ ] iOS safe area respetada en bottom nav
  - [ ] typecheck + lint + build pasan

  **QA Scenarios**:
  ```
  Scenario: Mobile bottom nav navigation
    Tool: Playwright
    Preconditions: Login as gerente. Viewport 375px.
    Steps:
      1. Navigate to /dashboard on mobile viewport
      2. Assert BottomNav visible at bottom (64px height)
      3. Assert FAB centered above bottom nav (56x56px, blue)
      4. Assert 5 nav items with icons and labels
      5. Assert Dashboard item is active (blue accent)
      6. Click "Casos" nav item
      7. Assert navigated to /service-cases
      8. Assert "Casos" item is now active
    Expected Result: Bottom nav provides mobile navigation
    Evidence: .sisyphus/evidence/task-28-bottom-nav.png

  Scenario: Desktop sidebar replaces bottom nav
    Tool: Playwright
    Preconditions: Login as gerente. Viewport 1280px.
    Steps:
      1. Navigate to /dashboard on desktop viewport
      2. Assert Sidebar visible at left (240px)
      3. Assert BottomNav NOT visible
      4. Assert FAB NOT visible
    Expected Result: Desktop uses sidebar, no mobile nav
    Evidence: .sisyphus/evidence/task-28-desktop-sidebar.png
  ```

  **Commit**: YES
  - Message: `feat(navigation): implement mobile bottom nav + FAB per DESIGN.md v4.0`
  - Files: `frontend/src/core/ui/BottomNav.tsx`, `frontend/src/core/ui/FloatingActionButton.tsx`, `frontend/src/components/layout/AppShell.tsx`, `frontend/src/components/layout/Sidebar.tsx`

- [ ] 29. Cockpit 14 pasos Redesign + Timeline Component

  **What to do**:
  - Rediseñar el cockpit de 14 pasos según DESIGN.md sección 11
  - **Desktop**: Timeline horizontal con conectores
    ```
    [1]───[2]───[3]───[4]───[5]───[6]───[7]───[8]───[9]───[10]───[11]───[12]───[13]───[14]
     ●    ●    ●    ●    ●    ◉    ○    ○    ○    ○     ○     ○     ○     ○
     ✅   ✅   ✅   ✅   ✅   🔄   ⏳   ⏳   ⏳   ⏳    ⏳    ⏳    ⏳    ⏳
    ```
  - **Mobile**: Timeline vertical con línea conectora
    ```
      ●  ───  Solicitud formal         ✅ Completado
      │
      ●  ───  Visita técnica           ✅ Completado
      │
      ◉  ───  Propuesta económica      🔄 En ejecución
      │
      ○  ───  PO / Autorización        ⏳ Pendiente
    ```
  - **Componentes** (DESIGN.md sección 11):
    - `CockpitHeader` - Filtros por fase, resumen de avance, progress ring
    - `CockpitTimeline` - Timeline horizontal (desktop) o vertical (mobile)
    - `CockpitStepCard` - Card por paso con icono, estado, fechas, responsable
    - `CockpitNextAction` - Card destacada con siguiente acción requerida
    - `CockpitBlockers` - Lista de bloqueos activos con severidad y recommendedAction
    - `CockpitSummary` - Resumen del caso: cliente, PO, valor, fechas
  - **Fase grouping**: Comercial (1-4), Operativo (5-8), Cierre (9-11), Financiero (12-14)
  - **Estados visuales** (DESIGN.md sección 4.5):
    - Completado: verde + check
    - En ejecución: azul + spinner
    - Pendiente: gris + clock
    - Bloqueado: rojo + X
    - SLA riesgo: naranja + alert
  - Refactor `ServiceCaseWorkflowCockpit.tsx` para usar nuevos componentes
  - Ubicación: `frontend/src/modules/service-cases/components/`

  **Files to create/modify**:
  - `frontend/src/core/ui/CockpitTimeline.tsx` (CREATE)
  - `frontend/src/core/ui/CockpitStepCard.tsx` (CREATE)
  - `frontend/src/core/ui/CockpitNextAction.tsx` (CREATE)
  - `frontend/src/core/ui/CockpitBlockers.tsx` (CREATE)
  - `frontend/src/core/ui/CockpitSummary.tsx` (CREATE)
  - `frontend/src/modules/service-cases/components/ServiceCaseWorkflowCockpit.tsx` (REFACTOR)

  **Acceptance Criteria**:
  - [ ] Desktop: timeline horizontal 14 pasos con conectores
  - [ ] Mobile: timeline vertical con línea conectora (48px touch target)
  - [ ] Cada paso muestra: número, label, estado (color + icono)
  - [ ] Paso actual tiene glow y badge "Actual"
  - [ ] Blockers se muestran con severidad y acción sugerida
  - [ ] NextAction card destacada con CTA
  - [ ] Progress ring muestra % de avance general
  - [ ] Responsive: desktop horizontal, mobile vertical
  - [ ] typecheck pasa

  **QA Scenarios**:
  ```
  Scenario: Cockpit shows 14-step timeline with correct states
    Tool: Playwright
    Preconditions: Service case at step 03 (proposal) with blockers.
    Steps:
      1. Navigate to /service-cases/[id]
      2. Assert CockpitTimeline renders 14 steps
      3. Assert steps 1-2 are completed (green)
      4. Assert step 3 is current (blue glow + "Actual" badge)
      5. Assert step 4+ are pending (gray)
      6. Assert progress ring shows ~21% (3/14)
      7. Assert blockers section visible if any
      8. Assert NextAction card visible with CTA button
      9. Switch to mobile viewport (375px)
      10. Assert timeline becomes vertical with connector line
    Expected Result: Complete 14-step cockpit per DESIGN.md
    Evidence: .sisyphus/evidence/task-29-cockpit-desktop.png
    Evidence: .sisyphus/evidence/task-29-cockpit-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(cockpit): redesign 14-step timeline per DESIGN.md v4.0 with horizontal/vertical layout`
  - Files: cockpit components + workflow cockpit refactor

- [ ] 30. Evidence Gallery + Camera Integration Redesign

  **What to do**:
  - Rediseñar galería de evidencias según DESIGN.md sección 13
  - **Gallery grid**: 3-4 columnas en mobile, expandido en desktop
  - **EvidenceCard**: thumbnail + categoría + metadata + sync status
  - **Categorías visuales**: Antes (camera, neutral), Después (camera check, green), Hallazgo (alert, red), Corrección (check, green)
  - **Upload flow**: Botón grande "Tomar foto" con preview inmediato
  - **Metadata visible**: geolocalización, timestamp, usuario, hash, sync status, paso del flujo
  - **Offline**: cola local con badge de pendientes de sync
  - **Lightbox**: al click en evidencia, lightbox con navegación

  **Files to modify/create**:
  - `frontend/src/modules/evidences/ui/EvidenceGrid.tsx` (CREATE)
  - `frontend/src/modules/evidences/ui/EvidenceCard.tsx` (REFACTOR)
  - `frontend/src/modules/evidences/ui/EvidenceLightbox.tsx` (CREATE)
  - `frontend/src/modules/evidences/ui/CameraCapture.tsx` (REFACTOR)
  - `frontend/src/app/(dashboard)/evidences/page.tsx` - Rediseño
  - `frontend/src/app/(dashboard)/orders/[id]/evidences/page.tsx` - Rediseño

  **Acceptance Criteria**:
  - [ ] Gallery grid 3-4 columnas mobile
  - [ ] EvidenceCard con thumbnail + categoría + metadata
  - [ ] Lightbox funcional con navegación
  - [ ] Camera capture con preview inmediato
  - [ ] Badge de sync offline visible
  - [ ] Responsive
  - [ ] typecheck pasa

  **Commit**: YES
  - Message: `feat(evidences): redesign evidence gallery per DESIGN.md v4.0 with lightbox and camera`
  - Files: evidence module redesign

- [ ] 31. Dashboard Inteligente con KPIs Predictivos

  **What to do**:
  - Innovación: Mejorar el dashboard `/dashboard` con KPIs predictivos y analíticos
  - **KPIs actuales**: totalCases, activeCases, pendingApproval, inProgress, completedThisMonth, revenue
  - **KPIs nuevos a agregar**:
    - Tasa de conversión propuesta → orden (%)
    - Tiempo promedio por paso (días)
    - Costos proyectados vs reales (variance %)
    - Alertas predictivas: casos próximos a vencer, blockers sin resolver > 7 días
    - Pipeline value: valor total de propuestas en curso
  - **Backend**: Extender `getServiceCaseSummary()` en `backend/src/modules/service-cases/service-case.service.ts`
  - **Frontend**: Agregar cards y gráficos en `frontend/src/app/(dashboard)/dashboard/page.tsx`
  - Usar Recharts para gráficos (ya instalado)
  - Crear hook `useDashboardPredictiveKPIs()`
  - Agregar endpoint `/api/dashboard/predictive-kpis`

  **Files to modify**:
  - `backend/src/modules/service-cases/service-case.service.ts:637-708` - Extender summary con KPIs predictivos
  - `backend/src/modules/dashboard/dashboard.routes.ts` - Nuevo endpoint
  - `backend/src/modules/dashboard/dashboard.controller.ts` - Nuevo controller
  - `frontend/src/app/(dashboard)/dashboard/page.tsx` - Agregar cards predictivos
  - `frontend/src/modules/dashboard/hooks/usePredictiveKPIs.ts` - Nuevo hook
  - `frontend/src/modules/dashboard/api/dashboard-api.ts` - API calls

  **Acceptance Criteria**:
  - [ ] Backend retorna KPIs predictivos en endpoint
  - [ ] Frontend muestra KPIs en cards con gráficos
  - [ ] Variance chart muestra propuesta vs real
  - [ ] Alertas predictivas visibles
  - [ ] typecheck + lint + build pasan en frontend y backend

  **QA Scenarios**:
  ```
  Scenario: Predictive KPIs display on dashboard
    Tool: Playwright
    Preconditions: Login como gerente. Service cases with data exist.
    Steps:
      1. Navigate to /dashboard
      2. Assert predictive KPI cards visible (conversion rate, avg time per step)
      3. Assert variance chart renders
      4. Assert alerts section shows if any blockers > 7 days
    Expected Result: Dashboard shows enhanced predictive KPIs
    Evidence: .sisyphus/evidence/task-25-predictive-kpis.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add predictive KPIs with conversion rate and variance charts`
  - Files: Backend dashboard module + frontend dashboard page

- [ ] 26. Costos en Tiempo Real con Gráficos Variance

  **What to do**:
  - Innovación: Sistema de costos en tiempo real con comparación propuesta vs ejecución
  - **Backend**: 
    - Endpoint `/api/costs/[orderId]/variance` que retorna comparativo detallado
    - Cálculo de variance por categoría (materiales, labor, equipo)
    - Alertas cuando variance > 15%
  - **Frontend**:
    - Página `/costs/[orderId]` rediseñada con gráficos Recharts
    - Variance chart (barras: estimado vs real por categoría)
    - Cost trend line (evolución de costos en el tiempo)
    - Tabla detallada de costos con colores (verde = bajo presupuesto, rojo = sobrecosto)
    - Indicador de health del proyecto basado en costos
  - **Datos**: Usar `Cost` model y `getOrderSummary()` existente
  - Ubicación: `backend/src/modules/costs/` y `frontend/src/modules/costs/`

  **Files to modify**:
  - `backend/src/modules/costs/cost.service.ts` - Agregar getCostVariance()
  - `backend/src/modules/costs/cost.routes.ts` - Agregar ruta variance
  - `backend/src/modules/costs/cost.controller.ts` - Agregar controller
  - `frontend/src/app/(dashboard)/costs/[orderId]/page.tsx` - Rediseñar con gráficos
  - `frontend/src/modules/costs/hooks/useCostVariance.ts` - Nuevo hook
  - `frontend/src/modules/costs/ui/VarianceChart.tsx` - Componente gráfico

  **Acceptance Criteria**:
  - [ ] Endpoint variance retorna datos correctos
  - [ ] Variance chart muestra barras estimado vs real
  - [ ] Cost trend line muestra evolución
  - [ ] Health indicator funcional
  - [ ] typecheck + lint + build pasan

  **QA Scenarios**:
  ```
  Scenario: Cost variance page shows comparison charts
    Tool: Playwright
    Preconditions: Order with both estimated and actual costs exists.
    Steps:
      1. Navigate to /costs/[orderId]
      2. Assert variance chart visible (bar chart with estimated vs actual)
      3. Assert cost trend line renders
      4. Assert health indicator shows status (ok/warning/loss)
      5. Assert detailed cost table with color coding
    Expected Result: Cost variance analysis fully rendered
    Evidence: .sisyphus/evidence/task-26-cost-variance.png
  ```

  **Commit**: YES
  - Message: `feat(costs): real-time cost variance with charts and health indicator`
  - Files: Backend cost module + frontend costs pages

- [ ] 27. Offline-First Mejorado - Colas Persistentes

  **What to do**:
  - Innovación: Mejorar el soporte offline para trabajo en campo
  - **Estado actual**: offline queue existe en `frontend/src/lib/pwa/offline-queue.ts`
  - **Mejoras**:
    - Cola de reintentos con backoff exponencial (30s, 1min, 2min, 5min)
    - DLQ (dead letter queue) con UI para revisar fallos
    - Estado de sincronización visible en cada página de campo
    - Indicador de "pendiente de sincronizar" en evidencias no subidas
    - Service worker más robusto con caché de assets críticos
  - **Backend**: Endpoint `/api/sync/offline` para recibir mutations offline
  - **Frontend**:
    - `frontend/src/lib/pwa/offline-queue.ts` - Backoff exponencial
    - `frontend/src/app/~offline/page.tsx` - Página offline mejorada
    - `frontend/src/app/(dashboard)/execution/page.tsx` - Sync indicator
    - `frontend/src/app/(dashboard)/evidences/page.tsx` - Pending upload badge
  - Leer `docs/offline-scope.md` y `docs/offline-known-limitations.md` para alinear

  **Files to modify**:
  - `frontend/src/lib/pwa/offline-queue.ts` - Backoff + DLQ
  - `frontend/src/app/~offline/page.tsx` - Fallback mejorado
  - `frontend/src/modules/execution/api/execution-api.ts` - Sync mutations
  - `frontend/src/modules/evidences/api/evidences-api.ts` - Pending uploads
  - `backend/src/modules/sync/sync.service.ts` - Batch sync endpoint
  - `backend/src/modules/sync/sync.routes.ts` - Nueva ruta

  **Acceptance Criteria**:
  - [ ] Offline queue implementa backoff exponencial
  - [ ] DLQ accesible desde UI
  - [ ] Sync status badge visible en páginas de campo
  - [ ] Evidence pending upload badge funcional
  - [ ] typecheck + lint + build pasan

  **QA Scenarios**:
  ```
  Scenario: Offline queue retries with exponential backoff
    Tool: Playwright + Bash
    Preconditions: Offline mode enabled via service worker.
    Steps:
      1. Simulate offline (block network requests)
      2. Submit evidence upload
      3. Assert evidence queued with "pending" status
      4. Restore network
      5. Assert evidence syncs automatically
      6. Assert DLQ shows any failed attempts
    Expected Result: Offline queue retries and syncs when back online
    Evidence: .sisyphus/evidence/task-27-offline-sync.png
  ```

  **Commit**: YES
  - Message: `feat(offline): exponential backoff retry, DLQ UI, sync status badges`
  - Files: Frontend PWA queue + backend sync endpoint

- [ ] 28. Lazy Loading + Dynamic Imports

  **What to do**:
  - Escalamiento: Implementar lazy loading para componentes pesados
  - **next/dynamic** para:
    - Gráficos Recharts (dashboard, costs)
    - FullCalendar (planning)
    - Editor de documentos (documents)
    - Mapas o componentes GPS
    - Modales pesados (ContextualDocumentUploadModal)
  - **Estrategia**:
    ```typescript
    // Ejemplo: lazy load Recharts
    const VarianceChart = dynamic(() => import('@/modules/costs/ui/VarianceChart'), {
      loading: () => <Skeleton variant="chart" />,
      ssr: false,
    });
    ```
  - Crear `loading.tsx` para rutas que no lo tienen (generar skeleton automático)
  - Crear `error.tsx` para rutas que no lo tienen
  - Verificar cada página en `frontend/src/app/` y agregar archivos faltantes
  - Basado en route map: 94 rutas, verificar cuáles tienen error.tsx y loading.tsx

  **Files to modify**:
  - `frontend/src/app/(dashboard)/dashboard/page.tsx` - Dynamic import de charts
  - `frontend/src/app/(dashboard)/costs/[orderId]/page.tsx` - Dynamic import
  - `frontend/src/app/(dashboard)/planning/page.tsx` - Dynamic FullCalendar
  - Various `loading.tsx` and `error.tsx` files as needed

  **Acceptance Criteria**:
  - [ ] Recharts charts loaded dynamically (no SSR)
  - [ ] FullCalendar loaded dynamically
  - [ ] Document editor loaded dynamically
  - [ ] Al menos 4 componentes con dynamic import
  - [ ] Bundle size reducido en initial load
  - [ ] typecheck pasa

  **QA Scenarios**:
  ```
  Scenario: Dynamic imports reduce initial bundle
    Tool: Playwright + Browser devtools
    Preconditions: Login as gerente.
    Steps:
      1. Navigate to /dashboard
      2. Capture network requests
      3. Assert Recharts chunk NOT loaded on dashboard initial load (if not needed)
      4. Navigate to /costs/[orderId]
      5. Assert Recharts chunk loaded on demand
    Expected Result: Heavy components load only when needed
    Evidence: .sisyphus/evidence/task-28-dynamic-imports.txt
  ```

  **Commit**: YES
  - Message: `perf(frontend): implement lazy loading with next/dynamic for heavy components`
  - Files: Various page.tsx files + loading.tsx + error.tsx

- [ ] 29. Virtual Scroll en Listas Grandes

  **What to do**:
  - Escalamiento: Implementar virtual scroll en listas que pueden tener 100+ items
  - **Listas candidatas**:
    - `/orders` - Tabla de órdenes
    - `/work-requests` - Solicitudes
    - `/proposals` - Propuestas
    - `/admin/users` - Usuarios
    - `/billing/ses` - SES
    - `/billing/invoices` - Facturas
    - `/payments` - Pagos
    - `/documents` - Documentos
    - `/admin/audit` - Auditoría
  - **Implementación**: Usar `react-virtual` (o `@tanstack/react-virtual` si ya existe)
  - Verificar dependencias: si no está instalado, agregar `@tanstack/react-virtual`
  - No reemplazar la paginación server-side, sino mejorar UX con virtual scroll local
  - Crear hook `useVirtualList()` reusable
  - Crear componente `VirtualTable` que envuelva la tabla con windowing

  **Files to modify**:
  - `frontend/package.json` - Agregar `@tanstack/react-virtual` (si no existe)
  - `frontend/src/core/ui/VirtualTable.tsx` - Componente virtual scroll
  - `frontend/src/modules/orders/ui/OrdersTable.tsx` - Aplicar virtual scroll
  - `frontend/src/modules/proposals/ui/ProposalsTable.tsx` - Aplicar
  - `frontend/src/app/(dashboard)/admin/audit/page.tsx` - Aplicar

  **Acceptance Criteria**:
  - [ ] `@tanstack/react-virtual` instalado (si es necesario)
  - [ ] VirtualTable component creado
  - [ ] Orders table usa virtual scroll
  - [ ] Proposals table usa virtual scroll
  - [ ] Audit log usa virtual scroll
  - [ ] typecheck pasa

  **QA Scenarios**:
  ```
  Scenario: Virtual scroll renders only visible rows
    Tool: Playwright
    Preconditions: Orders list with 50+ items.
    Steps:
      1. Navigate to /orders
      2. Assert table renders
      3. Scroll to bottom of table
      4. Assert rows render smoothly without layout shift
      5. Assert DOM has limited number of rows rendered
    Expected Result: Virtual scroll renders only visible rows
    Evidence: .sisyphus/evidence/task-29-virtual-scroll.txt
  ```

  **Commit**: YES
  - Message: `perf(frontend): implement virtual scroll for large lists with @tanstack/react-virtual`
  - Files: `frontend/src/core/ui/VirtualTable.tsx`, various table components

- [ ] 30. Bundle Optimization + Code Splitting

  **What to do**:
  - Escalamiento: Optimizar bundle de producción
  - **Análisis**: Ejecutar `npm run build -w frontend` y analizar bundle con `next/dynamic` support
  - **Estrategias**:
    - Dynamic imports para: Recharts, FullCalendar, pdf-lib (client-side), react-dnd
    - Verificar barrel imports en `packages/shared-types/src/index.ts` y `@cermont/domain`
    - Eliminar imports no usados en todas las páginas
    - Agrupor chunks comunes en `next.config.ts`
    - Verificar tree-shaking de lucide-react (usar imports específicos, no `*`)
    - Configurar `experimental.clientRouterFilter` en next.config.ts
  - **Métricas objetivo**: 
    - Initial JS bundle < 300KB (gzip)
    - Lighthouse Performance score > 85
    - First Contentful Paint < 1.5s
  - Ubicación: `frontend/next.config.ts`, varias páginas

  **Files to modify**:
  - `frontend/next.config.ts` - Configuración de bundling
  - `frontend/src/app/(dashboard)/dashboard/page.tsx` - Dynamic Recharts
  - `frontend/src/app/(dashboard)/planning/page.tsx` - Dynamic FullCalendar
  - `frontend/src/app/(dashboard)/reports/[id]/page.tsx` - Dynamic pdf-lib

  **Acceptance Criteria**:
  - [ ] next.config.ts optimizado
  - [ ] Todos los componentes pesados con dynamic import
  - [ ] lucide-react imports específicos
  - [ ] Lighthouse Performance > 85
  - [ ] bundle analyzer muestra reducción de tamaño
  - [ ] typecheck + build pasan

  **QA Scenarios**:
  ```
  Scenario: Production build is optimized
    Tool: Bash
    Preconditions: Frontend project with production config.
    Steps:
      1. npm run build -w frontend
      2. Check output for chunk sizes
      3. Assert main JS chunk < 300KB gzipped
      4. Assert no large vendor chunks
    Expected Result: Optimized production bundle
    Evidence: .sisyphus/evidence/task-30-bundle-report.txt
  ```

  **Commit**: YES
  - Message: `perf(frontend): bundle optimization with code splitting and dynamic imports`
  - Files: `frontend/next.config.ts`, various page.tsx imports

- [ ] 31. Remaining pages tests batch 1 (Assets, Maintenance, Templates)

  **What to do**:
  - Tests para rutas restantes:
    - `/assets`, `/assets/[id]`, `/assets/new` - Asset list/detail/create
    - `/maintenance`, `/maintenance/new`, `/maintenance/[id]`, `/maintenance/[id]/edit`
    - `/templates`, `/templates/new`, `/templates/[id]`
    - `/sla` - SLA management page
    - `/notifications` - Notification center
  - Ubicación: `frontend/tests/e2e/pages/remaining-pages-1.spec.ts`

  **Acceptance Criteria**:
  - [ ] Asset pages tests pasan
  - [ ] Maintenance pages tests pasan
  - [ ] Templates pages tests pasan
  - [ ] SLA page tests pasan
  - [ ] Notifications page tests pasan

  **Commit**: YES
  - Message: `test(remaining): Playwright tests for assets, maintenance, templates, SLA, notifications`
  - Files: `frontend/tests/e2e/pages/remaining-pages-1.spec.ts`

- [ ] 32. Remaining pages tests batch 2 (Profile, Fleet, Inventory, Legal, Offline)

  **What to do**:
  - Tests para rutas restantes:
    - `/profile`, `/profile/privacy` - User profile
    - `/fleet`, `/fleet/[id]` - Fleet management
    - `/inventory`, `/inventory/scan` - Inventory
    - `/dispatch` - Dispatch management
    - `/legal/terms`, `/legal/privacy`, `/legal/consent` - Legal pages
    - `/offline-sync` - Offline sync queue
    - `/unauthorized` - Access denied page
  - Ubicación: `frontend/tests/e2e/pages/remaining-pages-2.spec.ts`

  **Acceptance Criteria**:
  - [ ] Profile pages tests pasan
  - [ ] Fleet pages tests pasan
  - [ ] Inventory pages tests pasan
  - [ ] Dispatch page tests pasan
  - [ ] Legal pages tests pasan
  - [ ] Offline sync page tests pasan
  - [ ] Unauthorized page muestra correctamente

  **Commit**: YES
  - Message: `test(remaining): Playwright tests for profile, fleet, inventory, legal, offline`
  - Files: `frontend/tests/e2e/pages/remaining-pages-2.spec.ts`

- [ ] 33. Execution pages tests (field execution)

  **What to do**:
  - Tests para rutas de ejecución en campo:
    - `/execution`, `/execution/new`, `/execution/[id]`
    - `/execution-sessions/[id]` - Preflight, FSM, evidencias
    - `/evidences` - Evidence gallery
    - `/orders/[id]/evidences` - Order-specific evidence
    - `/orders/[id]/execution` - Execution tab
    - `/orders/[id]/inspections/[inspectionId]` - Inspection detail
    - `/orders/[id]/asts` - Safety analysis
  - Verificar: offline mode, carga de evidencias, checklists, preflight
  - Ubicación: `frontend/tests/e2e/pages/execution-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] Execution list carga
  - [ ] Execution session with preflight checklist funciona
  - [ ] Evidence upload funciona
  - [ ] Inspection detail carga
  - [ ] ASTs list carga
  - [ ] Offline state se muestra correctamente

  **Commit**: YES
  - Message: `test(execution): Playwright tests for field execution pages with offline mode`
  - Files: `frontend/tests/e2e/pages/execution-pages.spec.ts`

- [ ] 34. Business document + forms pages tests

  **What to do**:
  - Tests para rutas de documentos de negocio y formularios:
    - `/business-documents`, `/business-documents/[id]`
    - `/documents/ingestion/[id]`
    - `/checklists`
    - `/forms`
  - Verificar: document upload, PDF preview, form submission
  - Ubicación: `frontend/tests/e2e/pages/business-docs-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] Business documents list y detail cargan
  - [ ] Document ingestion funciona
  - [ ] Checklists list carga
  - [ ] Forms list carga

  **Commit**: YES
  - Message: `test(documents): Playwright tests for business documents and forms pages`
  - Files: `frontend/tests/e2e/pages/business-docs-pages.spec.ts`

- [ ] 35. Profile + Settings pages tests

  **What to do**:
  - Tests para rutas de configuración personal:
    - `/profile` - Profile detail
    - `/profile/privacy` - Privacy settings
    - `/settings/notifications` - Notification preferences
  - Verificar: edición de perfil, cambio de contraseña, preferencias
  - Ubicación: `frontend/tests/e2e/pages/profile-settings-pages.spec.ts`

  **Acceptance Criteria**:
  - [ ] Profile page carga y permite edición
  - [ ] Privacy settings carga
  - [ ] Notification preferences carga

  **Commit**: YES
  - Message: `test(profile): Playwright tests for profile and settings pages`
  - Files: `frontend/tests/e2e/pages/profile-settings-pages.spec.ts`

- [ ] 36. KB/MB/LB - Performance budget monitoring

  **What to do**:
  - Agregar test de rendimiento que verifique:
    - Tamaño de bundle JS principal < 300KB (gzip)
    - Tiempo de carga de página < 3s
    - Sin errores de consola durante navegación
    - Sin peticiones API fallidas (4xx/5xx)
  - Crear test Playwright que navegue por todas las rutas y capture métricas
  - Ubicación: `frontend/tests/e2e/performance-budget.spec.ts`

  **Acceptance Criteria**:
  - [ ] Performance budget test creado
  - [ ] Bundle size dentro del budget
  - [ ] Sin errores de consola en rutas principales
  - [ ] Sin peticiones API fallidas

  **Commit**: YES
  - Message: `test(perf): add performance budget monitoring with Playwright`
  - Files: `frontend/tests/e2e/performance-budget.spec.ts`

> **CRITICAL**: 4 review agents ejecutan PARALLEL. TODOS deben APPROVE.
> NO auto-proceder. Esperar "okay" explícito del usuario.
> Rechazo → fix → re-run → presentar → esperar okay.
> Cada output debe ser un structured report verificable.

- [ ] F1. **Verificación de Cumplimiento del Plan** — `oracle`

  **Tarea**: Leer plan completo. Verificar CADA "Must Have" contra implementación real.

  **Must Have Checklist**:
  - [ ] Bug 1 fix: Query key cambiado a `["proposals", "detail", id]` en `frontend/src/app/(dashboard)/proposals/[id]/page.tsx` línea 120
  - [ ] Bug 2 fix: `backend/src/modules/proposal/proposal.service.ts` actualiza `ServiceCase.artifacts.proposal` al crear propuesta con serviceCaseId
  - [ ] Bug 3 fix: `validationErrors` se limpia en handleSiteSelected() en `frontend/src/app/(dashboard)/work-requests/new/page.tsx`
  - [ ] Bug 4 fix: Opción "Sin sede definida" existe en `frontend/src/modules/customers/ui/ServiceSiteSelect.tsx`
  - [ ] Tests Playwright: mínimo 1 spec file por módulo en `frontend/tests/e2e/pages/`
  - [ ] Componentes ErrorState/EmptyState/OfflineBanner en `frontend/src/core/ui/`
  - [ ] Dashboard KPIs predictivos: endpoint `GET /api/dashboard/predictive-kpis` responde 200
  - [ ] Cost variance: endpoint `GET /api/costs/[orderId]/variance` responde 200
  - [ ] Offline queue con backoff: `frontend/src/lib/pwa/offline-queue.ts` tiene exponential backoff
  - [ ] Dynamic imports: al menos 4 componentes usan `next/dynamic`
  - [ ] Virtual scroll: `frontend/src/core/ui/VirtualTable.tsx` existe
  - [ ] Bundle optimization: `frontend/next.config.ts` modificado

  **Commands**:
  ```bash
  # Verificar backend endpoints
  curl -s http://localhost:4000/api/dashboard/predictive-kpis -H "Authorization: Bearer $TOKEN" | jq '.success'
  curl -s http://localhost:4000/api/costs/FAKE_ID/variance -H "Authorization: Bearer $TOKEN" | jq '.error'
  ```

  **Evidence check**: Verificar que `.sisyphus/evidence/` contiene screenshots de cada tarea.

  Output: `Must Have [N/N] | Must NOT Have [0 issues] | Tasks [N/N complete] | Evidence [N files] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Revisión de Calidad de Código** — `unspecified-high`

  **Tarea**: Ejecutar quality gates en frontend y backend. Revisar patrones prohibidos.

  **Gates Frontend**:
  ```bash
  cd frontend
  npm run typecheck 2>&1 | tail -20
  npm run lint 2>&1 | tail -20
  npm run build 2>&1 | tail -30
  npx react-doctor@latest 2>&1
  ```

  **Gates Backend**:
  ```bash
  cd backend
  npm run typecheck 2>&1 | tail -20
  npm run lint 2>&1 | tail -20
  npm run build 2>&1 | tail -30
  ```

  **Patrones prohibidos** (grep en archivos modificados por git diff):
  - `as any` → REJECT
  - `@ts-ignore` o `@ts-expect-error` → REJECT
  - `catch {}` o catch vacío → REJECT
  - `console.log` (excepto logger) → REJECT
  - `debugger` → REJECT
  - `alert(` → REJECT
  - `null` como placeholder de ausencia → REJECT
  - `any` explícito en types → REJECT
  - Código comentado >3 líneas → WARN

  **Git diff check**:
  ```bash
  git diff --name-only | grep -E '\.(ts|tsx)$' | head -40
  ```

  Output: `Frontend: typecheck [PASS/FAIL] lint [PASS/FAIL] build [PASS/FAIL] react-doctor [PASS/FAIL] | Backend: typecheck [PASS/FAIL] lint [PASS/FAIL] build [PASS/FAIL] | Code issues [N] | VERDICT: APPROVE/REJECT`

- [ ] F3. **Regresión Playwright Completa** — `unspecified-high` + playwright

  **Tarea**: Ejecutar TODOS los tests desde estado limpio con DB de prueba reseedeada.

  **Setup**:
  ```bash
  # Matar procesos existentes en puertos 3000 y 4000
  # Iniciar backend test + frontend production
  cd frontend
  npx playwright test --reporter=html --workers=1 2>&1 | tail -30
  ```

  **Tests a ejecutar** (por orden):
  1. `tests/e2e/auth-full.spec.ts` - Auth + RBAC
  2. `tests/e2e/pages/auth-pages.spec.ts` - Login/register pages
  3. `tests/e2e/pages/dashboard-page.spec.ts` - Dashboard
  4. `tests/e2e/pages/work-requests-pages.spec.ts` - WR CRUD
  5. `tests/e2e/pages/site-visits-pages.spec.ts` - SV CRUD
  6. `tests/e2e/pages/proposals-pages.spec.ts` - Proposals
  7. `tests/e2e/pages/orders-pages.spec.ts` - Orders
  8. `tests/e2e/pages/service-cases-pages.spec.ts` - SC
  9. `tests/e2e/pages/billing-pages.spec.ts` - SES/Invoices
  10. `tests/e2e/pages/payments-delivery-pages.spec.ts` - Payments/DR
  11. `tests/e2e/pages/admin-pages.spec.ts` - Admin
  12. `tests/e2e/pages/portal-pages.spec.ts` - Portal
  13. `tests/e2e/pages/execution-pages.spec.ts` - Execution
  14. `tests/e2e/performance-budget.spec.ts` - Performance

  **Criterios de aceptación**:
  - 0 fallos
  - 0 tests flaky (pasan al primer intento)
  - Reporte HTML generado en `frontend/test-results/`
  - Screenshots de fallos (si hay) en `test-results/`

  Output: `Tests totales [N] | Pasados [N] | Fallidos [0] | Flaky [0] | HTML report [path] | VERDICT: APPROVE/REJECT`

- [ ] F4. **Verificación de Fidelidad del Alcance** — `deep`

  **Tarea**: Verificar que CADA tarea entregó exactamente lo prometido. Sin más, sin menos.

  **Proceso por tarea**:
  ```bash
  git log --oneline --name-only -5  # Últimos commits y archivos
  git diff HEAD~5 --name-only  # Archivos modificados en este batch
  ```

  **Verificación específica**:
  | Tarea | Archivos esperados | Solo esos archivos? |
  |-------|-------------------|-------------------|
  | 1 | proposals/[id]/page.tsx, queries.ts | SI |
  | 2 | proposal.service.ts | SI (solo backend) |
  | 3 | work-requests/new/page.tsx | SI |
  | 4 | ServiceSiteSelect.tsx | SI |
  | 5-36 | Por especificación en cada tarea | SI |

  **Contaminación cruzada**: Task N no debe modificar archivos de Task M.
  **Cambios no contabilizados**: `git status` debe mostrar 0 archivos no committeados.

  Output: `Tasks [N/N compliant] | Contaminación [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT: APPROVE/REJECT`

---

## Appendix A: Implementation Patterns

### Pattern 1: Query Key Consistency (Bug 1 Fix)

**Problem**: Query key mismatch between page and mutation causes stale UI.

**Solution**: Siempre usar constantes centralizadas para query keys:

```typescript
// ✅ CORRECTO - queries.ts
const PROPOSALS_KEYS = {
  all: ["proposals"] as const,
  list: (status: string, limit: number, offset: number) =>
    [...PROPOSALS_KEYS.all, "list", status, limit, offset] as const,
  detail: (id: string) => [...PROPOSALS_KEYS.all, "detail", id] as const,
} as const;

// ✅ CORRECTO - page.tsx
const { data } = useQuery({
  queryKey: PROPOSALS_KEYS.detail(id),  // ["proposals", "detail", id]
  queryFn: () => fetchProposalDetail(id),
});

// ✅ CORRECTO - mutation invalidation
onSuccess: () => {
  qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.detail(id) });
  qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
}
```

### Pattern 2: ServiceCase Artifact Linking (Bug 2 Fix)

**Problem**: Creating a proposal with serviceCaseId doesn't update ServiceCase artifacts.

**Solution**: After saving the proposal, update the ServiceCase document atomically:

```typescript
// En proposal.service.ts, después de proposal.save()
if (data.serviceCaseId) {
  const serviceCase = await ServiceCase.findById(data.serviceCaseId);
  if (serviceCase) {
    serviceCase.artifacts.proposal = {
      id: proposal._id,
      code: proposal.code,
      status: proposal.status,
      updatedAt: new Date(),
    };
    // Recalcular stage basado en nuevos artifacts
    serviceCase.currentStage = computeStage(serviceCase.artifacts);
    await serviceCase.save();
    
    await createAuditLog({
      userId,
      entity: 'ServiceCase',
      entityId: data.serviceCaseId,
      action: 'PROPOSAL_LINKED',
      after: { proposalId: proposal._id, proposalCode: proposal.code },
    });
  }
}
```

### Pattern 3: Validation Error Clearing (Bug 3 Fix)

**Problem**: Validation errors persist after field interaction.

**Solution**: Limpiar errores específicos del campo en cada handler:

```typescript
// En cada handler del form:
function handleSiteSelected(siteId: string | undefined, snapshot: SiteSnapshot) {
  setValidationErrors((prev) => prev.filter((e) => e.field !== 'serviceSite'));
  setForm((current) => ({
    ...current,
    serviceSiteId: siteId,
    serviceSiteSnapshot: snapshot,
    serviceSite: snapshot.name,
  }));
}

function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
  setValidationErrors((prev) => prev.filter((e) => e.field !== key));
  setForm((current) => ({ ...current, [key]: value }));
}
```

### Pattern 4: Component State Machine (UX Maturation)

Cada componente con datos debe seguir esta máquina de estados:

```typescript
function DataComponent() {
  const { data, isLoading, isError, error, refetch } = useQuery(...);

  if (isLoading) return <Skeleton variant="card" count={3} />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!data || data.length === 0) return <EmptyState icon={Inbox} title="Sin datos" description="..." cta={{ label: "Crear", href: "/new" }} />;
  
  return <DataView data={data} />;
}
```

### Pattern 5: TanStack Query Offline-First (Innovation)

Configuración para soporte offline con cola de reintentos:

```typescript
// queries.ts
export function useCreateEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: EvidenceInput) => {
      const response = await apiClient.post("/evidences", data);
      return response.data;
    },
    networkMode: "offlineFirst",  // Intenta online, fallback a offline queue
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff
    onMutate: async (newEvidence) => {
      await qc.cancelQueries({ queryKey: ["evidences"] });
      const previous = qc.getQueryData(["evidences"]);
      qc.setQueryData(["evidences"], (old: unknown) => [...(old as []), newEvidence]);
      return { previous };
    },
    onError: (_err, _newEvidence, context) => {
      qc.setQueryData(["evidences"], context?.previous); // Rollback on error
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["evidences"] });
    },
  });
}
```

### Pattern 6: DESIGN.md v4.0 - Dark/Light Theme Provider

```tsx
// ThemeProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'dark', toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  
  useEffect(() => {
    const stored = localStorage.getItem('cermont-theme') as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cermont-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### Pattern 7: KpiCard Component (DESIGN.md v4.0)

```tsx
// KpiCard.tsx
interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delta?: { value: number; trend: 'up' | 'down'; label?: string };
  subtitle?: string;
  loading?: boolean;
}

export function KpiCard({ icon, label, value, delta, subtitle, loading }: KpiCardProps) {
  if (loading) return <div className="h-[120px] animate-pulse rounded-[var(--radius-lg)] bg-[var(--bg-surface)]" />;
  
  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-default)] p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--bg-surface-elevated)]">
            <span className="text-[var(--icon-accent)]">{icon}</span>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{label}</p>
            <p className="text-[32px] font-bold text-[var(--text-primary)]">{value}</p>
          </div>
        </div>
        {delta && (
          <span className={`inline-flex items-center gap-1 text-sm ${
            delta.trend === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
          }`}>
            {delta.trend === 'up' ? '▲' : '▼'} {delta.value}%
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>}
    </div>
  );
}
```

### Pattern 8: Playwright Test Helper with Login

```typescript
// tests/e2e/helpers/auth-helper.ts
import { test as base, type Page } from '@playwright/test';

export async function loginAs(page: Page, role: string, credentials?: { email: string; password: string }) {
  const creds = credentials ?? getDefaultCredentials(role);
  await page.goto('/login');
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/);
  return page;
}

export async function loginAsGerente(page: Page) {
  return loginAs(page, 'gerente');
}

export async function loginAsCliente(page: Page) {
  return loginAs(page, 'cliente');
}

export const AUTH_CONFIG = {
  gerente: { email: 'gerente@cermont.com', password: 'test-password', name: 'Gerente Test' },
  cliente: { email: 'cliente@cermont.com', password: 'test-password', name: 'Cliente Test' },
  residente: { email: 'residente@cermont.com', password: 'test-password', name: 'Residente Test' },
  supervisor: { email: 'supervisor@cermont.com', password: 'test-password', name: 'Supervisor Test' },
  administrativo: { email: 'admin@cermont.com', password: 'test-password', name: 'Admin Test' },
};

function getDefaultCredentials(role: string) {
  return AUTH_CONFIG[role as keyof typeof AUTH_CONFIG] ?? AUTH_CONFIG.gerente;
}
```

---

## Appendix B: Complete Route Coverage Checklist

### Auth & Public Routes (6 routes)
- [ ] `/` - Landing page
- [ ] `/login` - Login form
- [ ] `/register` - Registration
- [ ] `/forgot-password` - Password recovery (OPTIONAL)
- [ ] `/reset-password` - Password reset (OPTIONAL)
- [ ] `/unauthorized` - Access denied

### Dashboard (1 route)
- [ ] `/dashboard` - Main dashboard with KPIs, charts, activity

### Work Requests - Step 1 (3 routes)
- [ ] `/work-requests` - List with filters, pagination
- [ ] `/work-requests/new` - Create form with customer, site, service type
- [ ] `/work-requests/[id]` - Detail with visit tab

### Site Visits - Step 2 (3 routes)
- [ ] `/site-visits` - List
- [ ] `/site-visits/new` - Schedule visit
- [ ] `/site-visits/[id]` - Visit detail

### Proposals - Steps 2-4 (3 routes)
- [ ] `/proposals` - List with status filters
- [ ] `/proposals/new` - Create with items, totals, serviceCaseId
- [ ] `/proposals/[id]` - Detail with cost breakdown, status actions

### Work Orders - Steps 4-5 (10 routes)
- [ ] `/orders` - List + Kanban
- [ ] `/orders/new` - Create order
- [ ] `/orders/[id]` - Detail with tabs
- [ ] `/orders/[id]/edit` - Edit order
- [ ] `/orders/[id]/planning` - Planning packet
- [ ] `/orders/[id]/execution` - Execution session
- [ ] `/orders/[id]/evidences` - Evidence gallery
- [ ] `/orders/[id]/costs` - Actual costs
- [ ] `/orders/[id]/asts` - Safety analysis
- [ ] `/orders/[id]/invoice` - Order invoice
- [ ] `/orders/[id]/inspections/[inspectionId]` - Inspection detail
- [ ] `/orders/kanban` - Kanban board

### Execution & Evidence - Steps 6-7 (5 routes)
- [ ] `/execution` - Execution session list
- [ ] `/execution/new` - Create execution
- [ ] `/execution/[id]` - Execution detail
- [ ] `/execution-sessions/[id]` - Field execution (preflight, FSM)
- [ ] `/evidences` - All evidence gallery

### Reports & Delivery - Steps 8-10 (6 routes)
- [ ] `/reports` - Technical reports list
- [ ] `/reports/new` - Create report
- [ ] `/reports/[id]` - Report detail + PDF
- [ ] `/reports/[id]/draft` - Auto-generated draft
- [ ] `/reports/[id]/sign` - Handoff to delivery-record
- [ ] `/delivery-records` - List
- [ ] `/delivery-records/new` - Create
- [ ] `/delivery-records/[id]` - Detail + sign
- [ ] `/delivery-records/[id]/signature` - Sign delivery record

### Billing & Financial - Steps 11-14 (9 routes)
- [ ] `/billing/ses` - SES list
- [ ] `/billing/ses/new` - Create SES
- [ ] `/billing/ses/[id]` - SES detail
- [ ] `/billing/ses/[id]/approve` - Approve SES
- [ ] `/billing/invoices` - Invoices list
- [ ] `/billing/invoices/new` - Create invoice
- [ ] `/billing/invoices/[id]` - Invoice detail
- [ ] `/billing/invoices/[id]/approve` - Approve invoice
- [ ] `/payments` - Payments list
- [ ] `/payments/new` - Record payment
- [ ] `/payments/[id]` - Payment detail
- [ ] `/invoices/[id]/pipeline` - Invoice pipeline

### Service Cases & Planning (6 routes)
- [ ] `/service-cases` - Case list
- [ ] `/service-cases/[id]` - Case detail + 14-step pipeline
- [ ] `/service-cases/[id]/cockpit` - Cockpit redirect
- [ ] `/planning` - Planning overview
- [ ] `/planning/[id]` - Planning detail
- [ ] `/planning-packet/new` - Create planning packet

### Purchase Orders (3 routes)
- [ ] `/purchase-orders` - PO list
- [ ] `/purchase-orders/new` - Create PO
- [ ] `/purchase-orders/[id]` - PO detail

### Documents (5 routes)
- [ ] `/documents` - Document hub
- [ ] `/documents/templates` - Template library
- [ ] `/documents/templates/new` - New template
- [ ] `/documents/ingestion/[id]` - Document ingestion
- [ ] `/business-documents` - Business documents
- [ ] `/business-documents/[id]` - Business document detail

### Admin (9 routes)
- [ ] `/admin/users` - User list
- [ ] `/admin/users/new` - Create user
- [ ] `/admin/users/[id]` - User detail
- [ ] `/admin/users/[id]/edit` - Edit user
- [ ] `/admin/audit` - Audit log
- [ ] `/admin/backups` - Database backups
- [ ] `/admin/custom-fields` - Custom fields
- [ ] `/admin/personnel` - Personnel management
- [ ] `/admin/settings` - System configuration

### Portal (Client) (7 routes)
- [ ] `/portal` - Client portal home
- [ ] `/portal/invoices` - Client invoices
- [ ] `/portal/orders` - Client orders
- [ ] `/portal/orders/[id]` - Client order detail
- [ ] `/portal/proposals` - Client proposals
- [ ] `/portal/service-cases` - Client service cases
- [ ] `/portal/service-cases/[id]` - Client SC detail

### Resources & Tools (6 routes)
- [ ] `/resources` - Resource list
- [ ] `/resources/[id]` - Resource detail
- [ ] `/resources/kits` - Kit list
- [ ] `/resources/kits/new` - Create kit
- [ ] `/tools` - Tool readiness catalog
- [ ] `/dispatch` - Dispatch management

### Fleet, Inventory, Assets, Maintenance (8 routes)
- [ ] `/fleet` - Fleet management
- [ ] `/fleet/[id]` - Vehicle detail
- [ ] `/inventory` - Inventory
- [ ] `/inventory/scan` - Inventory scanner
- [ ] `/assets` - Asset list
- [ ] `/assets/[id]` - Asset detail
- [ ] `/assets/new` - Create asset
- [ ] `/maintenance` - Maintenance plans
- [ ] `/maintenance/new` - Create maintenance plan
- [ ] `/maintenance/[id]` - Maintenance plan detail
- [ ] `/maintenance/[id]/edit` - Edit maintenance

### Templates, SLA, Notifications, Profile (6 routes)
- [ ] `/templates` - Template library
- [ ] `/templates/new` - New template
- [ ] `/templates/[id]` - Template detail
- [ ] `/sla` - SLA management
- [ ] `/notifications` - Notifications
- [ ] `/profile` - User profile
- [ ] `/profile/privacy` - Privacy settings
- [ ] `/settings/notifications` - Notification preferences

### Offline & Legal (5 routes)
- [ ] `/offline-sync` - Offline sync queue
- [ ] `/~offline` - Offline fallback
- [ ] `/legal/terms` - Terms of service
- [ ] `/legal/privacy` - Privacy policy
- [ ] `/legal/consent` - Consent management

### Costs (3 routes)
- [ ] `/costs` - Cost overview
- [ ] `/costs/catalog` - Cost catalog
- [ ] `/costs/[orderId]` - Order cost detail
- [ ] `/costs/[orderId]/ejecucion` - Execution costs

**Total Routes: 94+** (91 IMPLEMENTED + 3 OPTIONAL)

---

## Appendix C: Edge Cases and Error Handling Matrix

### Auth & Session
| Edge Case | Expected Behavior | Test |
|-----------|------------------|------|
| Token expired mid-session | Redirect to /login, toast "Sesión expirada" | Task 6 |
| Invalid credentials | Error message "Credenciales inválidas" on /login | Task 6 |
| RBAC: access forbidden page | Card "No tienes permiso" + link to dashboard | Task 6 |
| RBAC: API returns 403 | Error toast + redirect to /unauthorized | Task 6 |
| Refresh token expired | Auto-logout, redirect to /login | Task 6 |
| Multiple rapid login attempts | Rate limit error after 20 attempts in 15min | Task 6 |

### Work Requests
| Edge Case | Expected Behavior | Test |
|-----------|------------------|------|
| Cliente sin sedes registradas | Opción "Sin sede definida" disponible | Task 4 |
| Sitio temporal sin nombre | Validación: "Nombre del sitio requerido" | Task 3 |
| Contacto sin email | Campo email opcional, no bloquea | Task 3 |
| Cliente con NIT inválido | Error de validación Zod | Task 9 |
| Subir documento > 10MB | Error "Archivo excede tamaño máximo" | Task 9 |
| Canal "Otro" sin especificar | Error "Especifica el canal de origen" | Task 9 |
| SC ya existe para WR | Error toast "Caso de servicio ya existe" | Task 9 |

### Proposals
| Edge Case | Expected Behavior | Test |
|-----------|------------------|------|
| Propuesta sin items | Error "Debe agregar al menos un item" | Task 11 |
| Item con cantidad 0 | Error de validación Zod | Task 11 |
| serviceCaseId inválido | Error "Caso de servicio no encontrado" | Task 11 |
| Enviar propuesta ya enviada | Error toast, botón deshabilitado | Task 11 |
| Aprobar propuesta como gerente | Error RBAC "Required role: cliente" | Task 11 |
| Rechazar propuesta sin motivo | OK (motivo opcional) | Task 11 |
| Propuesta vencida | Badge "Expirada", acciones deshabilitadas | Task 11 |
| Propuesta con items 0 valor unitario | Error de validación | Task 11 |

### Service Cases
| Edge Case | Expected Behavior | Test |
|-----------|------------------|------|
| SC sin workOrderId en artifacts | Blockers correctos para paso actual | Task 13 |
| Avanzar paso con blockers activos | Error toast + blocker list visible | Task 13 |
| Avanzar paso final (14) | Error "Caso ya en paso final" | Task 13 |
| SC en estado "archived" | Timeline inmutable, solo lectura | Task 13 |
| Timeline vacío | 0 días en paso actual | Task 13 |
| Blocker con severity "warning" | Bloqueo NO blocking, permitir avance | Task 13 |

### Orders
| Edge Case | Expected Behavior | Test |
|-----------|------------------|------|
| Orden sin planning packet | Blocker "Falta planeación" | Task 12 |
| Orden sin materiales asignados | Blocker "Faltan materiales" | Task 12 |
| Kanban: drag a columna incorrecta | Revertir al estado anterior | Task 12 |
| Orden con execution session incompleta | Blocker "Ejecución no completada" | Task 12 |
| Editar orden ya en ejecución | Campos bloqueados según workflow | Task 12 |

### Billing & Invoices
| Edge Case | Expected Behavior | Test |
|-----------|------------------|------|
| SES sin delivery record vinculado | Blocker "Falta acta de entrega" | Task 16 |
| Invoice sin SES aprobada | Blocker "SES no aprobada" | Task 16 |
| Pago duplicado (mismo invoiceId) | Idempotency: error "Pago ya registrado" | Task 17 |
| Factura con valor 0 | Error de validación | Task 16 |
| SES con valores inconsistentes | Error "Valores no coinciden con DR" | Task 16 |

### Executive Dashboard
| Edge Case | Expected Behavior | Test |
|-----------|------------------|------|
| Dashboard sin datos | All EmptyStateCards visibles | Task 8 |
| KPI con valor 0 | KpiCard muestra "0" con delta neutro | Task 27 |
| Gráfico sin datos para el período | Empty state "Sin datos para este período" | Task 27 |
| Delta negativo en KPI | Flecha roja ▼ con valor absoluto | Task 27 |
| Bloqueos activos en casos | AlertSummaryCard los muestra | Task 27 |

### Offline Mode
| Edge Case | Expected Behavior | Test |
|-----------|------------------|------|
| Perder conexión durante submit | Mutation encolada, badge "Pendiente" | Task 33 |
| Recuperar conexión con cola llena | Backoff: 30s → 1min → 2min → 5min | Task 33 |
| Fallo permanente de mutation | DLQ: tarjeta "Fallo al sincronizar" | Task 33 |
| Conflictos de datos offline | Resolución: server wins + notificación | Task 33 |
| Storage lleno en IndexedDB | Error "Sin espacio para offline" | Task 33 |

### Responsive & Mobile
| Edge Case | Expected Behavior | Test |
|-----------|------------------|------|
| Mobile 375px: bottom nav visible | 5 items + FAB, sidebar oculta | Task 28 |
| Tablet 768px: grid 2 columnas | KPI grid en 2 cols, sidebar colapsada | Task 28 |
| Desktop 1440px: grid 12 columnas | Layout completo con panel derecho | Task 28 |
| iOS notch/bottom safe area | Bottom nav respeta safe-area-inset-bottom | Task 28 |
| Touch target < 44px en mobile | Warning en test de accesibilidad | Task 28 |

### Accessibility
| Edge Case | Expected Behavior | Test |
|-----------|------------------|------|
| Navegación solo teclado | Tab ordenado, focus visible, Enter activa | Task 23 |
| Screen reader en formulario | Labels asociados, aria-required, aria-describedby | Task 23 |
| prefers-reduced-motion | Animaciones 0.01ms duración | Task 23 |
| Contraste insuficiente | WCAG AA: 4.5:1 texto normal | Task 23 |
| Color blindness | Estado comunicado con icono + texto + color | Task 23 |

---

## Appendix D: Performance Budget

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Initial JS bundle (gzip) | < 300KB | `next build` + `next/dynamic` analysis |
| Lighthouse Performance | > 85 | Lighthouse CI |
| First Contentful Paint | < 1.5s | Playwright `performance.budget.spec.ts` |
| Largest Contentful Paint | < 2.5s | Playwright |
| Cumulative Layout Shift | < 0.1 | Playwright |
| Time to Interactive | < 3.5s | Playwright |
| API response time (p50) | < 200ms | Backend metrics |
| API response time (p99) | < 1000ms | Backend metrics |
| Playwright test time | < 30s per test | CI pipeline |
| Lighthouse Accessibility | > 90 | Lighthouse CI |
| Lighthouse Best Practices | > 90 | Lighthouse CI |
| Lighthouse SEO | > 90 | Lighthouse CI |

---

## Appendix E: File Change Manifest

| Task | Files Created | Files Modified | Total |
|------|--------------|----------------|-------|
| 1 | 0 | 2 | 2 |
| 2 | 0 | 1 | 1 |
| 3 | 0 | 1 | 1 |
| 4 | 0 | 1 | 1 |
| 5 | 2 | 0 | 2 |
| 6 | 1 | 0 | 1 |
| 7 | 1 | 0 | 1 |
| 8 | 1 | 0 | 1 |
| 9 | 1 | 0 | 1 |
| 10 | 1 | 0 | 1 |
| 11 | 1 | 0 | 1 |
| 12 | 1 | 0 | 1 |
| 13 | 1 | 0 | 1 |
| 14 | 1 | 0 | 1 |
| 15 | 1 | 0 | 1 |
| 16 | 1 | 0 | 1 |
| 17 | 1 | 0 | 1 |
| 18 | 1 | 0 | 1 |
| 19 | 1 | 0 | 1 |
| 20 | 1 | 0 | 1 |
| 21 | 1 | 0 | 1 |
| 22 | 1 | 0 | 1 |
| 23 | 0 | 10+ | 10+ |
| 24 | 3 | 10+ | 13+ |
| 25 | 2 | 3 | 5 |
| 26 | 6 | 1 | 7 |
| 27 | 12 | 1 | 13 |
| 28 | 2 | 4 | 6 |
| 29 | 5 | 1 | 6 |
| 30 | 4 | 3 | 7 |
| 31 | 2 | 4 | 6 |
| 32 | 3 | 2 | 5 |
| 33 | 2 | 3 | 5 |
| 34 | 1 | 0 | 1 |
| 35 | 1 | 0 | 1 |
| 36 | 1 | 0 | 1 |
| 37 | 1 | 0 | 1 |
| 38 | 1 | 0 | 1 |
| 39 | 1 | 0 | 1 |
| 40 | 0 | 5 | 5 |
| 41 | 1 | 0 | 1 |
| 42 | 0 | 1 | 1 |
| **Total** | **62+** | **53+** | **115+** |

---

## Commit Strategy

- **1-4**: `fix(proposal|work-request): desc` - Bug fixes
- **5-8**: `test(e2e|auth|dashboard): desc` - Test infrastructure
- **9-24**: `test(module): desc` - Page tests
- **25-30**: `feat(design): desc` - DESIGN.md v4.0 implementation
- **31-36**: `feat(innovation): desc` - Innovation features
- **37-42**: `test(remaining): desc` - Remaining pages + performance
- **F1-F4**: `chore(verification): desc` - Final verification

---

## Appendix F: Implementation Timeline (Estimated)

| Phase | Tasks | Estimated Duration | Dependencies |
|-------|-------|-------------------|-------------|
| **Week 1** | Task 1-4: Bug fixes | 1 day | None |
| | Task 5-8: Test helpers + Auth tests | 1 day | Task 1-4 |
| | Task 9-16: Core business tests (first half) | 2 days | Task 5-8 |
| **Week 2** | Task 9-16: Core business tests (second half) | 1 day | Task 5-8 |
| | Task 17-24: Remaining module tests | 2 days | Task 5-8 |
| | Task 23-24: UX loading/error/empty states | 1 day | Task 9-22 |
| **Week 3** | Task 25-26: Design System v4.0 tokens + components | 2 days | Task 23-24 |
| | Task 27: Dashboard redesign | 2 days | Task 25-26 |
| | Task 28: Mobile navigation bottom nav + FAB | 1 day | Task 25-26 |
| **Week 4** | Task 29-30: Cockpit redesign + Evidence gallery | 2 days | Task 25-26 |
| | Task 31-33: Innovation (costs, offline, lazy loading) | 2 days | Task 27-30 |
| | Task 34-36: Virtual scroll + bundle + performance | 1 day | Task 31-33 |
| **Week 5** | Task 37-42: Remaining page tests | 2 days | Task 31-36 |
| | F1-F4: Final verification | 1 day | Task 1-42 |
| | Bug fixes + QA iteration | 2 days | F1-F4 |

**Total estimated: 5 weeks (25 business days)**

---

## Appendix G: Example Playwright Test - Full Structure

### File: `frontend/tests/e2e/pages/work-requests-pages.spec.ts`

```typescript
import { test, expect, type Page } from '@playwright/test';
import { loginAsGerente } from '../helpers/auth-helper';
import { AUTH_CONFIG } from '../helpers/auth-helper';

test.describe('Work Request Pages', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAsGerente(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('WR-01: List page loads with table and filters', async () => {
    await page.goto('/work-requests');
    
    // Loading state (should appear briefly)
    await expect(page.locator('[aria-busy="true"]')).toBeVisible({ timeout: 5000 });
    
    // Data loaded
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
    
    // Filters present
    await expect(page.locator('select[name="status"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Buscar"]').first()).toBeVisible();
    
    // Table has rows
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    
    // Status filter works
    await page.selectOption('select[name="status"]', 'pending');
    await page.waitForTimeout(1000); // Wait for refetch
    // Verify filtered results
  });

  test('WR-02: List page empty state', async () => {
    // This test needs a state with no work requests
    // Could be achieved by filtering to a non-existent status
    test.skip('Requires empty DB state');
    
    await page.goto('/work-requests?status=non_existent');
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No hay solicitudes');
    await expect(page.locator('a[href="/work-requests/new"]')).toBeVisible();
  });

  test('WR-03: New work request form validation', async () => {
    await page.goto('/work-requests/new');
    
    // Try submitting empty form
    await page.click('button[type="submit"]');
    
    // Validation errors should appear
    await expect(page.locator('#clientName-error')).toBeVisible();
    await expect(page.locator('#requesterName-error')).toBeVisible();
    await expect(page.locator('#serviceType-error')).toBeVisible();
    await expect(page.locator('#shortDescription-error')).toBeVisible();
    await expect(page.locator('#description-error')).toBeVisible();
    
    // Root error message
    await expect(page.locator('#root-error')).toBeVisible();
  });

  test('WR-04: Create work request full flow', async () => {
    await page.goto('/work-requests/new');
    
    // Select customer
    await page.click('[data-testid="customer-combobox"]');
    await page.fill('[data-testid="customer-search-input"]', 'Cenit');
    await page.click('text=Cenit Transporte');
    
    // Customer details should appear
    await expect(page.locator('text=NIT')).toBeVisible();
    
    // Select contact
    await page.click('[data-testid="contact-select"]');
    await page.click('text=Pedro Alvarado');
    
    // Assert contact fields populated
    const nameInput = page.locator('#requesterName');
    await expect(nameInput).not.toHaveValue('');
    
    // Select temporary site
    await page.click('button:has-text("Seleccionar sede")');
    await page.click('text=Sitio temporal');
    await page.fill('input[aria-label="Nombre del sitio temporal"]', 'Instalaciones principales Cenit');
    await page.fill('input[aria-label="Dirección del sitio temporal"]', 'Calle 100 # 50-20');
    await page.fill('input[aria-label="Ciudad del sitio temporal"]', 'Bogotá');
    await page.click('button:has-text("Usar sitio temporal")');
    
    // Select service type
    await page.click('[data-testid="service-type-select"]');
    await page.click('text=Mantenimiento');
    
    // Fill description fields
    await page.fill('#shortDescription', 'Solicitud de mantenimiento preventivo para equipos HVAC');
    await page.fill('#description', 'Mantenimiento preventivo HVAC con coordinación de Pedro Alvarado');
    
    // Submit
    await page.click('button:has-text("Crear solicitud")');
    
    // Wait for success toast
    await expect(page.locator('[data-sonner-toast]')).toContainText('Solicitud creada', { timeout: 10000 });
    await expect(page.locator('[data-sonner-toast]')).toContainText('Caso de servicio');
    
    // Should redirect to work request detail
    await expect(page).toHaveURL(/\/work-requests\//);
  });

  test('WR-05: Work request detail page', async () => {
    // Navigate to first WR in list
    await page.goto('/work-requests');
    await page.click('table tbody tr a').first();
    
    // Wait for detail to load
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    
    // Assert key info visible
    await expect(page.locator('text=Cliente')).toBeVisible();
    await expect(page.locator('text=Tipo de servicio')).toBeVisible();
    await expect(page.locator('text=Urgencia')).toBeVisible();
    
    // "Calificar solicitud" button should exist for WRs ready to progress
    const qualifyBtn = page.locator('button:has-text("Calificar solicitud")');
    if (await qualifyBtn.isVisible()) {
      await qualifyBtn.click();
      await expect(page.locator('[data-sonner-toast]')).toContainText('avanzado', { timeout: 10000 });
    }
  });

  test('WR-06: Error state on failed API', async () => {
    // Block API requests
    await page.route('**/api/work-requests/**', (route) => {
      route.abort('connectionrefused');
    });
    
    await page.goto('/work-requests');
    
    // Error state should appear
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Reintentar")')).toBeVisible();
    
    // Unblock and retry
    await page.unroute('**/api/work-requests/**');
    await page.click('button:has-text("Reintentar")');
    
    // Should recover
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  });
});
```

---

## Appendix H: Accessibility Audit Checklist

Each page test debe verificar estos requisitos WCAG 2.2 AA:

### Perceivable
- [ ] All images have meaningful `alt` text
- [ ] Color is not the only means of conveying information
- [ ] Text contrast ratio meets 4.5:1 (normal) / 3:1 (large)
- [ ] Content does not require horizontal scrolling at 375px
- [ ] Touch targets are at least 44x44px on mobile

### Operable
- [ ] All interactive elements are keyboard accessible (Tab, Enter, Escape)
- [ ] Focus indicator is visible (2px outline, offset 2px)
- [ ] Focus order follows visual layout
- [ ] No keyboard traps in modals or dropdowns
- [ ] `prefers-reduced-motion` respected (animations 0.01ms)
- [ ] Skip to main content link available

### Understandable
- [ ] All form inputs have visible `<label>` elements
- [ ] Error messages are associated with inputs via `aria-describedby`
- [ ] Required fields are indicated with `aria-required`
- [ ] Language is declared (`<html lang="es">`)
- [ ] Navigation is consistent across pages
- [ ] Status messages use `aria-live` regions

### Robust
- [ ] ARIA attributes are valid and properly used
- [ ] Custom components have appropriate roles
- [ ] Semantic HTML used (`<nav>`, `<main>`, `<button>`, `<h1-h6>`)
- [ ] No duplicate IDs in the DOM

---

## Appendix I: Detailed Task Mapping for Remaining Innovation Tasks

### Task 31 (Original #25): Dashboard Inteligente con KPIs Predictivos

**Detailed Implementation Steps**:

1. **Backend - Extender ServiceCase summary** (`backend/src/modules/service-cases/service-case.service.ts:637-708`):
   ```typescript
   // Agregar al return de getServiceCaseSummary():
   conversionRate: totalProposals > 0 ? Math.round((approvedProposals / totalProposals) * 100) : 0,
   avgDaysPerStep: computeAverageDaysPerStep(timelineEntries),
   pipelineValue: pendingProposalAmount + pendingInvoiceAmount,
   atRiskCases: casesWhereDaysInStep > 7,
   weeklyTrend: computeWeeklyTrend(weeklyCounts),
   topBlockers: aggregateBlockersByCode(allBlockers),
   ```

2. **Backend - Nuevo endpoint** (`backend/src/modules/dashboard/dashboard.routes.ts`):
   ```typescript
   router.get('/predictive-kpis', authenticate, authorize('gerente', 'residente'), dashboardController.getPredictiveKPIs);
   ```

3. **Frontend - Hook** (`frontend/src/modules/dashboard/hooks/usePredictiveKPIs.ts`):
   ```typescript
   export function usePredictiveKPIs() {
     return useQuery({
       queryKey: ['dashboard', 'predictive-kpis'],
       queryFn: () => apiClient.get('/api/dashboard/predictive-kpis'),
       refetchInterval: 60_000, // Refresh cada minuto
     });
   }
   ```

4. **Frontend - DashboardHero** (`frontend/src/modules/dashboard/ui/DashboardHero.tsx`):
   - Mostrar saludo: "Buenos días, [nombre]" con hora del día
   - Resumen ejecutivo: "Tienes 12 casos activos, 3 requieren atención"
   - Métricas destacadas: 4 KpiCards en fila
   - CTA rápido: "Nueva solicitud" button

5. **Alertas predictivas**: Casos con >7 días en mismo paso, propuestas próximas a vencer, SES sin aprobar >5 días

### Task 32 (Original #26): Real-Time Costs with Variance Charts

**Detailed Implementation Steps**:

1. **Backend - Cost Variance Endpoint** (`backend/src/modules/costs/cost.service.ts`):
   ```typescript
   export async function getCostVariance(orderId: string): Promise<CostVariance> {
     const order = await Order.findById(orderId).lean();
     const actualCosts = await Cost.find({ orderId }).lean();
     const proposalTotal = order?.proposalAmount ?? 0;
     
     // Calcular variance por categoría
     const byCategory = COST_CATEGORIES.map(cat => ({
       category: cat,
       estimated: getEstimatedForCategory(order, cat),
       actual: getActualForCategory(actualCosts, cat),
       variance: actual - estimated,
       variancePercent: estimated > 0 ? ((actual - estimated) / estimated) * 100 : 0,
     }));
     
     // Trend data (costos acumulados por día)
     const trend = buildCostTrend(actualCosts);
     
     // Health score
     const totalVariance = byCategory.reduce((s, c) => s + c.variance, 0);
     const health = totalVariance <= 0 ? 'on_track' 
       : totalVariance <= proposalTotal * 0.15 ? 'at_risk' 
       : 'over_budget';
     
     return { byCategory, trend, health, proposalTotal, actualTotal: actualCosts.reduce((s, c) => s + c.amount, 0) };
   }
   ```

2. **Frontend - VarianceChart** (`frontend/src/modules/costs/ui/VarianceChart.tsx`):
   - Recharts BarChart: grupo por categoría, "Estimado" y "Real" lado a lado
   - Colores: verde si actual <= estimado, rojo si actual > estimado
   - Tooltip con valores exactos y porcentaje de variance
   - Trend line (LineChart): evolución de costos en el tiempo

3. **Frontend - HealthIndicator** (`frontend/src/modules/costs/ui/HealthIndicator.tsx`):
   - ProgressRing con color según health
   - "On track" (verde), "At risk" (amarillo), "Over budget" (rojo)
   - Mensaje: "3% sobre presupuesto" o "12% bajo presupuesto"

### Task 33 (Original #27): Offline-First Mejorado

**Detailed Implementation Steps**:

1. **Offline Queue** (`frontend/src/lib/pwa/offline-queue.ts`):
   ```typescript
   export type QueuedMutation = {
     id: string;
     endpoint: string;
     method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
     body: unknown;
     createdAt: number;
     retryCount: number;
     maxRetries: number;
     lastError?: string;
   };
   
   const BACKOFF_DELAYS = [30_000, 60_000, 120_000, 300_000]; // 30s, 1min, 2min, 5min
   
   export async function enqueueMutation(mutation: Omit<QueuedMutation, 'id' | 'createdAt' | 'retryCount'>) {
     const db = await openDB();
     await db.add('mutations', { ...mutation, id: crypto.randomUUID(), createdAt: Date.now(), retryCount: 0 });
   }
   
   export async function processQueue() {
     const db = await openDB();
     const pending = await db.getAll('mutations');
     for (const mutation of pending) {
       try {
         await apiClient.request(mutation.endpoint, { method: mutation.method, body: mutation.body });
         await db.delete('mutations', mutation.id);
       } catch (error) {
         mutation.retryCount++;
         if (mutation.retryCount >= mutation.maxRetries) {
           await moveToDLQ(mutation);
         } else {
           const delay = BACKOFF_DELAYS[Math.min(mutation.retryCount - 1, BACKOFF_DELAYS.length - 1)];
           setTimeout(() => processQueue(), delay);
         }
       }
     }
   }
   ```

2. **DLQ UI** (`frontend/src/app/offline-sync/page.tsx`):
   - Tabla de mutations fallidas con: endpoint, error, timestamp, retryCount
   - Botón "Reintentar" por item
   - Botón "Reintentar todos"
   - Botón "Descartar" para eliminar de DLQ

3. **Sync Status Badge** (`frontend/src/core/ui/SyncBadge.tsx`):
   - "Sincronizado" (verde check) cuando todo ok
   - "Sincronizando..." (spinner azul) durante proceso
   - "N pendientes" (naranja) cuando hay items en cola
   - "Error de sincronización" (rojo) cuando hay items en DLQ

4. **Evidence Upload con cola offline**:
   - Al subir evidencia sin conexión: guardar en IndexedDB + mostrar badge "Pendiente de sincronizar"
   - En la galería de evidencias, las no sincronizadas tienen overlay semitransparente
   - Auto-sync cuando se recupera conexión

### Task 34 (Original #28): Lazy Loading + Dynamic Imports

**Detailed Check List**:
- [ ] `next/dynamic` para `VarianceChart` en costs page
- [ ] `next/dynamic` para `FullCalendar` en planning page
- [ ] `next/dynamic` para `ReactDnD` en kanban page
- [ ] `next/dynamic` para `PDFPreview` en reports page
- [ ] `loading.tsx` para carpeta `work-requests/`, `proposals/`, `orders/`, `billing/`
- [ ] `error.tsx` para carpeta `service-cases/`, `costs/`, `admin/`
- [ ] Suspense boundaries para cada dynamic import

### Task 35: Virtual Scroll Implementation

**Detailed Implementation**:
```typescript
// frontend/src/core/ui/VirtualTable.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowHeight?: number;
  overscan?: number;
  onRowClick?: (row: T) => void;
}

export function VirtualTable<T>({ data, columns, rowHeight = 48, overscan = 5, onRowClick }: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  return (
    <div ref={parentRef} className="overflow-auto" style={{ height: `${Math.min(data.length * rowHeight, 600)}px` }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const row = data[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className="flex items-center border-b border-[var(--border-subtle)] px-4 hover:bg-[var(--bg-surface-elevated)] cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <div key={col.key} className={col.className}>{col.render(row)}</div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Task 36: Bundle Optimization

**Implementation Steps**:
1. `next.config.ts`:
   ```typescript
   const nextConfig = {
     experimental: {
       optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns'],
     },
   };
   ```
2. Replace `import * as LucideIcons from 'lucide-react'` con imports individuales:
   ```typescript
   import { Check, X, AlertCircle, FileText, Send } from 'lucide-react';
   ```
3. Auditoría de barrel imports en `packages/shared-types/src/index.ts` y `@cermont/domain`
4. Verificar tree-shaking con `next build` + `@next/bundle-analyzer`

---

## Success Criteria

### Verification Commands
```bash
# Frontend gates
cd frontend
npm run typecheck
npm run lint
npm run build
npx playwright test --reporter=html
npx react-doctor@latest

# Backend gates
cd ../backend
npm run typecheck
npm run lint
npm run build

# Performance verification
npm run build -w frontend -- --debug 2>&1 | grep -E 'Page Size|First Load'
npx playwright test tests/e2e/performance-budget.spec.ts
```

### Final Checklist
- [ ] 94+ Playwright tests passing (0 failures, 0 flaky)
- [ ] 4 bugs confirmed fixed (manual + e2e verification)
- [ ] DESIGN.md v4.0 tokens CSS implementados (dark/light mode)
- [ ] Component library creada (KpiCard, ProgressRing, StatusBadge, EmptyStateCard)
- [ ] Dashboard redesigned con Hero + KPI Grid + 14-step flow + charts
- [ ] Mobile navigation: Bottom Nav + FAB (375px+)
- [ ] Cockpit 14 pasos redesigned (horizontal desktop, vertical mobile)
- [ ] Evidence gallery redesigned con lightbox + offline badges
- [ ] All loading/error/empty states consistent across all pages
- [ ] Costos en tiempo real con variance charts + health indicator
- [ ] Offline-first con cola de backoff exponencial + DLQ UI
- [ ] Virtual scroll en listas grandes (orders, proposals, admin)
- [ ] Dynamic imports para componentes pesados (charts, calendar, PDF)
- [ ] Bundle optimized: < 300KB gzipped initial JS
- [ ] Accessibility: WCAG AA verified con Playwright
- [ ] Performance: Lighthouse > 85 en todas las categorías
- [ ] typecheck + lint + build exitosos en frontend y backend
- [ ] react-doctor 0 issues

---

## Appendix J: Executive Summary for Stakeholders

### ¿Qué logra este plan?

1. **CALIDAD**: Suite de 94+ tests Playwright que garantizan que cada ruta funciona correctamente en todos los estados (loading, error, empty, offline, forbidden). Los 4 bugs críticos encontrados en pruebas manuales quedan corregidos con validación automatizada.

2. **MADURACIÓN UX**: Implementación completa del DESIGN.md v4.0 - dark-first con modo claro profesional, bottom navigation para móvil con FAB, KPI cards con jerarquía visual, cockpit de 14 pasos redesigned (timeline horizontal desktop, vertical mobile), galería de evidencias con lightbox, estados vacíos con diseño consistente.

3. **INNOVACIÓN**: Dashboard inteligente con KPIs predictivos (tasa de conversión, tiempo promedio por paso, alertas de riesgo), costos en tiempo real con gráficos de variance y health indicator, offline-first con cola de backoff exponencial y DLQ visible.

4. **ESCALAMIENTO**: Lazy loading con `next/dynamic`, virtual scroll en listas grandes (`@tanstack/react-virtual`), bundle optimization con tree-shaking y dynamic imports, performance budget de 300KB gzip initial JS.

5. **ARQUITECTURA SOSTENIBLE**: Design tokens CSS en lugar de colores hardcodeados, componentes reutilizables (KpiCard, ProgressRing, StatusBadge, EmptyStateCard, SectionHeader), single source of truth para query keys de TanStack Query.

### Riesgos Mitigados

| Riesgo | Mitigación |
|--------|-----------|
| Tests flaky | `--workers=1`, retries en CI, timeouts conservadores |
| Regresión de funcionalidad existente | 46 tests e2e existentes se mantienen + 48 nuevos |
| Diseño inconsistente entre páginas | DESIGN.md v4.0 como SSOT, tokens CSS compartidos |
| Deuda técnica por cambios rápidos | typecheck + lint + build gates antes de cada commit |
| Rotura de backend por cambios frontend | Monorepo npm workspaces, CI verifica ambos |

### Impacto en Usuarios

| Rol | Beneficio Principal |
|-----|-------------------|
| Gerente | Dashboard con KPIs ejecutivos, alertas predictivas, vista de pipeline completo |
| Residente | Cockpit 14 pasos claro, costos en tiempo real, gestión de propuestas reactiva |
| Supervisor | Ejecución offline, evidencias con sync badge, checklist C/NC/NA |
| Técnico | Interfaz mobile-first, bottom nav, cámara integrada, targets 44px |
| Cliente | Portal con propuestas aprobables, pipeline visible, documentos descargables |
| Administrativo | SES/facturación con enlace directo a DR, colas de sync visibles |

---

## Appendix K: BI Metrics & Observability

### KPIs de Plataforma (métricas técnicas a monitorear post-implementación)

**Calidad (Playwright)**:
- % de tests pasando en CI (target: 100%)
- Tiempo promedio de ejecución de suite completa (target: < 15min)
- Tests flaky rate (target: < 1%)

**Rendimiento**:
- Lighthouse Performance score (target: > 85)
- Initial JS bundle size gzip (target: < 300KB)
- API p50 response time (target: < 200ms)
- Tiempo de carga percibido por página (target: < 2s)

**UX/Accesibilidad**:
- Lighthouse Accessibility score (target: > 90)
- Cobertura de estados loading/error/empty (target: 100% de páginas con datos)
- Cobertura de tests de accesibilidad (target: 100% de páginas críticas)

**Adopción (post-deploy)**:
- Tiempo promedio por paso del flujo (target: reducción 20% vs línea base)
- Tasa de conversión propuesta → orden (target: > 60%)
- Reducción de blockers por caso (target: < 2 blockers promedio)
- Tiempo desde ejecución → facturación (target: < 15 días)

**Estabilidad**:
- Error rate en frontend (target: < 0.1% de navegaciones)
- Error rate en backend API (target: < 0.5% de requests)
- Offline queue success rate (target: > 95% de reintentos exitosos)
- Sin fallos de typecheck/lint/build en CI (target: 100%)

---

## Appendix L: Known Limitations Post-Implementation

Las siguientes limitaciones son conocidas y NO serán abordadas en este plan (quedan para futuras iteraciones):

### Scope Excluido Deliberadamente

1. **Monorepo tooling upgrade** - No se actualiza npm workspaces a pnpm ni se migra a Turborepo remote caching
2. **Base de datos** - No se migra de MongoDB ni se agregan réplicas/shards
3. **Docker/VPS** - No se modifican Dockerfiles ni scripts de deploy VPS
4. **E2E en CI pipeline** - Los tests Playwright se ejecutan localmente; la integración CI/CD queda para fase posterior
5. **Traducción i18n** - No se implementa soporte multi-idioma
6. **Notificaciones push** - No se implementan notificaciones push nativas (web push API)
7. **Modo oscuro automático** - El toggle es manual, no basado en `prefers-color-scheme`
8. **PWA install prompt** - No se mejora el prompt de instalación PWA
9. **Servicio de mapas** - No se integra Google Maps/Mapbox para geolocalización visual
10. **Firma digital avanzada** - La firma es táctil (dibujada), no certificada digitalmente

### Bugs Conocidos No Críticos (parchados pero no resueltos de raíz)

1. **WR form**: El CustomizableSelect de tipo de servicio usa estado interno que puede desincronizarse con el form state principal
2. **StatusBadge**: En algunos componentes, el color del badge no coincide con la paleta DESIGN.md v4.0 por CSS legacy
3. **SC timeline**: La fecha de "última actualización" puede diferir entre el SC y sus artifacts individuales (hasta 1 segundo de skew)
4. **Offline**: La cola offline no maneja conflictos de concurrencia (dos mutations simultáneas al mismo recurso)

### Deuda Técnica Acumulada (no abordada)

1. `propString()`, `propNum()`, `propDate()` en proposals/[id]/page.tsx - helpers genéricos que deberían reemplazarse por tipos reales
2. `fn()` en varios lugares (parámetros no tipados)
3. Uso inconsistente de `var(--css-var)` vs clases Tailwind directas
4. Algunos controllers backend retornan datos sin serializar (fechas como Date objects, no ISO strings)
5. Tests unitarios de servicios backend no se han expandido en este plan
