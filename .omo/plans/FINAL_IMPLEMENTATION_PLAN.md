# PLAN DE IMPLEMENTACIÓN FINAL — CERMONT S.A.S.

## TL;DR

> **Quick Summary**: Llevar CERMONT S.A.S. de readiness ~55% a producción 95%+ implementando los 7 pasos del flujo 14 que no tienen frontend, saneando deuda técnica (weak tokens, español, React Doctor), agregando motor de templates dinámicos, PDF export, y desplegando en VPS Contabo.
>
> **Deliverables**:
> - 7 módulos frontend nuevos: Work Requests, Planning, Execution (offline-first), Delivery Records (firma digital), SES/Invoices, Payments
> - 0 weak tokens, <1000 tokens español, React Doctor ≥95/100
> - RBAC SSOT 10 roles sin arrays hardcodeados
> - Motor templates dinámicos con 5 formatos CERMONT reales
> - PDF/Excel export engine (5 endpoints)
> - CI/CD GitHub Actions + Deploy VPS Contabo
> - ≥1500 tests pasando
>
> **Estimated Effort**: Large (19 días)
> **Parallel Execution**: YES — 5 waves
> **Critical Path**: F0.1 → F1.1 → F1.3 → F2.3 → F2.5 → F3.5 → Deploy

---

## Context

### Original Request
Plan de implementación completo basado en auditoría de código, roadmaps previos (v2-v7), reglas de desarrollo CERMONT, y análisis de 15+ planes previos. El documento fuente contiene especificaciones detalladas de cada módulo, fragmentos de código, estructura de archivos, y cronograma día por día.

### Current State (baseline, Julio 2026)
| Métrica | Valor |
|---------|-------|
| Tests pasando | ~1228 |
| React Doctor | 67/100 (9 spread-key issues) |
| Weak tokens | ~782 (1 above baseline) |
| Tokens español | ~2753 |
| Flujo 14 pasos con UI | ~6/14 |
| Módulos backend | 58 |
| Rutas frontend | 131 |
| Typecheck | ✅ 0 errores |
| Lint | ✅ 0 errores |
| Build | ✅ 5/5 |
| Contracts check | ✅ |
| Docker smoke test | 38/38 |

### Metis Review
> Metis no disponible por límite de balance. Se aplicó auto-revisión estructurada.

**Gaps identificados y resueltos**:
- **Scope creep**: El plan original incluye "Scheduling/calendario de personal" (F3.3) que es nice-to-have, no blocking. Se mantiene como tarea de baja prioridad al final.
- **Riesgo de regresión**: La limpieza masiva de tokens débiles (F0.1) y español (F0.2) toca cientos de archivos simultáneamente. Se divide en waves secuenciales con QA intermedio.
- **Dependencia externa**: Las nuevas dependencias npm (idb-keyval, browser-image-compression, react-signature-canvas, html5-qrcode, qrcode.react, exceljs) requieren aprobación explícita según REGLAS_DESARROLLO_CERMONT.md (no modificar package.json sin aprobación).
- **Pruebas de módulos bloqueantes**: Los tests de los nuevos módulos deben incluirse en la misma tarea (no postergar).

---

## Work Objectives

### Core Objective
Completar el flujo de 14 pasos operativos de CERMONT S.A.S. con frontend funcional, calidad de código ≥95%, y despliegue en producción VPS Contabo.

### Concrete Deliverables
- Fase 0: Infraestructura saneada (0 weak tokens, <1000 español, React Doctor ≥95, RBAC SSOT, shared components)
- Fase 1: 7 módulos frontend bloqueantes implementados (Work Requests, Planning, Execution, Delivery Records, SES, Invoices, Payments)
- Fase 2: Dashboard reactivo, Kanban, template engine, inventory, PDF export, polish general
- Fase 3: Tests (≥1500), CI/CD, deploy VPS, notificaciones corregidas

### Definition of Done
- [ ] `npm run typecheck` → 0 errores en los 3 workspaces
- [ ] `npm run lint` → 0 errores Biome
- [ ] `npm run build` → 5/5 tareas exitosas
- [ ] `npm run test` → ≥1500 tests pasando
- [ ] `npx react-doctor@latest` → score ≥95/100
- [ ] `npm run quality:weak-tokens` → 0 findings
- [ ] `npm run quality:language` → <1000 findings
- [ ] Flujo 14 pasos con UI funcional → 14/14
- [ ] CI/CD GitHub Actions → pipeline verde
- [ ] Docker smoke test → 38/38
- [ ] Deploy VPS Contabo → producción funcional

### Must Have
- Todos los módulos nuevos siguen Contract-First: shared-types → Mongoose → backend → frontend
- Cada mutación crítica usa `clientMutationId` para idempotencia
- Cada página tiene loading/error/empty/offline states
- Zero `any`, `null`, `undefined` introducidos
- Gate `typecheck && lint && build && test` antes de cada commit

### Must NOT Have (Guardrails)
- No modificar `package.json` o `package-lock.json` sin aprobación explícita
- No instalar dependencias sin aprobación explícita
- No introducir `any`, `null`, `undefined` explícitos
- No duplicar schemas Zod, enums de estado, roles, rutas
- No `console.log` en código de producción
- No fetch directo en componentes — siempre `apiClient` + TanStack Query
- No roles hardcodeados — siempre `canAccessModule()`
- No páginas en blanco si falla API — loading/error/empty/offline states
- No deploy a Vercel — solo VPS Contabo con Docker
- No eliminar funcionalidad existente sin reemplazo

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: ✅ Sí (Vitest + Playwright)
- **Automated tests**: Tests-after (tests se escriben después de implementación)
- **Framework**: Vitest (frontend + backend)
- **Gates obligatorios**: `typecheck && lint && build && test` antes de cada commit

### QA Policy
Cada tarea incluye:
- QA scenarios ejecutables por agente
- Evidencia guardada en `.sisyphus/evidence/task-{N}/`
- Happy path + al menos 1 escenario de error/edge case

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Días 1-3 — Fundación, MAX PARALLEL):
├── F0.1: Infra fixes (MONGODB_URI, dockerignore, CMD, NODE_ENV)
├── F0.2: Weak tokens cleanup (4 sub-waves)
├── F0.3: Spanish→English rename
├── F0.4: React Doctor P1 bugs
├── F0.5: RBAC SSOT 10 roles
├── F0.6: Shared components library
└── F0.7: Design tokens + tipografía

Wave 2 (Días 4-7 — Módulos bloqueantes 1):
├── F1.1: Work Requests (paso 1)
├── F1.2: Planning wizard (paso 5)
├── F1.3: Execution offline-first (paso 6)
└── F1.4: Delivery Records + firma digital (pasos 8-9)

Wave 3 (Días 8-10 — Módulos bloqueantes 2):
├── F1.5: SES + Invoices (pasos 10-13)
├── F1.6: Payments + auto-cierre (paso 14)
└── F2.1: Dashboard KPIs reactivos

Wave 4 (Días 11-15 — Calidad y completitud):
├── F2.2: Service Cases Kanban
├── F2.3: Dynamic Template Engine + 5 seeds
├── F2.4: Inventory + Assets + Fleet
├── F2.5: PDF/Excel Export Engine
└── F2.6: Polish módulos existentes

Wave 5 (Días 16-19 — Innovación + Deploy):
├── F3.1: New tests (1228→1500+)
├── F3.2: Fix notification mapping steps 7-10
├── F3.3: Scheduling + mejoras finales
├── F3.4: CI/CD GitHub Actions
└── F3.5: Deploy VPS Contabo + smoke test

Wave FINAL — Verification:
├── F4.1: Plan Compliance Audit (oracle)
├── F4.2: Code Quality Review (unspecified-high)
├── F4.3: Real Manual QA (unspecified-high + playwright)
└── F4.4: Scope Fidelity Check (deep)
```

---

## TODOs

> Cada tarea sigue Contract-First: `shared-types (Zod) → Mongoose model → backend service → controller → route → API service frontend → query keys → TanStack Query hook → UI components → tests → commit`

- [ ] F0.1. **Infra fixes críticos**

  **What to do**:
  - Corregir `MONGODB_URI` puerto 27018→27017 en `.env` y `.env.production`
  - Agregar `NODE_ENV=production` en `.env.production`
  - Agregar `UPLOAD_DIR=/app/uploads` y `MAX_FILE_SIZE=52428800` faltantes
  - Crear `.dockerignore` en raíz del monorepo excluyendo: `node_modules/`, `.git/`, `docs/`, `.cursor/`, `.windsurf/`, `.claude/`, `*.log`, `.env*`, `coverage/`, `.nyc_output/`, `dist/`
  - Corregir `backend/Dockerfile` CMD: `CMD ["node", "dist/index.js"]` (no `npm run start:backend`)
  - Verificar que `frontend/Dockerfile` también tenga CMD correcto

  **Must NOT do**:
  - No modificar lógica de negocio
  - No cambiar variables que no sean las listadas

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Tareas de configuración y archivos de infraestructura, cambios puntuales
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with F0.2, F0.3, F0.4, F0.5, F0.6, F0.7)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `.env` — Archivo de configuración actual (verificar puerto)
  - `backend/Dockerfile` — CMD actual
  - `docker-compose.yml` — Puerto MongoDB expuesto
  - `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` — Variables de entorno documentadas

  **Acceptance Criteria**:
  - [ ] `.dockerignore` existe en raíz y contiene las exclusiones listadas
  - [ ] `.env` tiene `MONGODB_URI=mongodb://admin:PASSWORD@mongodb:27017/cermont?authSource=admin`
  - [ ] `.env.production` tiene `NODE_ENV=production`
  - [ ] `backend/Dockerfile` CMD es `node dist/index.js`
  - [ ] `npm run build` pasa (5/5)

  **QA Scenarios**:
  ```
  Scenario: Verificar dockerignore creado
    Tool: Bash
    Preconditions: .dockerignore no existe inicialmente
    Steps:
      1. Test-Path -LiteralPath ".dockerignore" → debe retornar True
      2. Get-Content ".dockerignore" | Select-String "node_modules" → debe encontrar match
    Expected Result: .dockerignore existe y excluye node_modules/
    Evidence: .sisyphus/evidence/f0.1-dockerignore.txt

  Scenario: Verificar corrección puerto MongoDB
    Tool: Bash
    Preconditions: Archivo .env existe
    Steps:
      1. Select-String "MONGODB_URI" ".env" → debe mostrar puerto 27017
    Expected Result: URI contiene :27017/ no :27018/
    Evidence: .sisyphus/evidence/f0.1-mongodb-uri.txt
  ```

  **Commit**: YES
  - Message: `fix: infra — mongodb port 27017, dockerignore, NODE_ENV production, backend CMD`
  - Files: `.env`, `.env.production`, `.dockerignore`, `backend/Dockerfile`, `frontend/Dockerfile`
  - Pre-commit: `npm run build`

- [ ] F0.2. **Saneamiento de tokens débiles (~3028 findings → 0)**

  **What to do**:
  - 4 waves secuenciales para evitar regresión:
    - **Wave 1**: `catch (e: any)` → `catch (e: unknown)` en todos los `.ts/.tsx`
    - **Wave 2**: `as any` → tipos concretos (verificar inferencia primero)
    - **Wave 3**: `return null` → status objects (`{ status: "not_found" }` etc.)
    - **Wave 4**: `: any` type annotations → tipos concretos
  - Archivos críticos: `service-cases.service.ts` (46 tokens), test files (132 tokens), `order-closure.service.ts`, `logger.ts`, `api-client.ts` (76 tokens)
  - Verificar con `npm run quality:weak-tokens` → 0 findings después de cada wave

  **Must NOT do**:
  - No cambiar comportamiento en runtime
  - No refactorizar lógica de negocio
  - No usar `unknown` como escape hatch

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Cambios masivos en cientos de archivos requieren cuidado para no introducir errores de tipo
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (secuencial por wave para evitar regresión)
  - **Parallel Group**: Wave 1 (sequential sub-waves)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `.sisyphus/evidence/quality-strict-baseline.txt` — Baseline actual de weak tokens
  - `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` — Reglas de tipos estrictos
  - Regla 5 de REGLAS_DESARROLLO_CERMONT.md: Zero Any, Zero Unknown, Zero Null, Zero Undefined

  **Acceptance Criteria**:
  - [ ] Wave 1 completada: `catch (e: any)` reemplazado
  - [ ] Wave 2 completada: `as any` eliminado
  - [ ] Wave 3 completada: `return null` reemplazado por status objects
  - [ ] Wave 4 completada: `: any` type annotations eliminadas
  - [ ] `npm run quality:weak-tokens` → 0 findings
  - [ ] `npm run typecheck` → 0 errores

  **QA Scenarios**:
  ```
  Scenario: Verificar 0 weak tokens
    Tool: Bash
    Preconditions: Todas las waves completadas
    Steps:
      1. npm run quality:weak-tokens → stdout debe decir "0 findings" o similar
    Expected Result: 0 weak tokens
    Evidence: .sisyphus/evidence/f0.2-weak-tokens-zero.txt
  ```
  **Commit**: YES (multiple commits por wave)
  - Message: `fix: weak-tokens wave 1 — catch(e: any)→unknown`
  - Pre-commit: `npm run typecheck && npm run quality:weak-tokens`

- [ ] F0.3. **Saneamiento de tokens español (~2850 findings → <1000)**

  **What to do**:
  - Renombrar variables, funciones, tipos en español a inglés en módulos prioritarios:
    - `planning/` — mayor concentración
    - `costs/`
    - `dashboard/`
    - `reports/`
    - `execution/`
  - Estrategia: `ast_grep_search` para encontrar patrones, luego `lsp_rename` para renombrar
  - NO traducir strings de UI visibles al usuario (interfaz en español es correcta)
  - Verificar: `npm run quality:language` → <1000 findings

  **Must NOT do**:
  - No traducir strings de UI visibles al usuario
  - No cambiar nombres de rutas de API expuestas
  - No cambiar nombres de colecciones MongoDB

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Renombrado masivo requiere precisión para no romper referencias
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (riesgo de conflictos)
  - **Parallel Group**: Wave 1 (sequential)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `.sisyphus/evidence/quality-language-before.txt` — Baseline actual
  - `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` — Regla English Code Naming

  **Acceptance Criteria**:
  - [ ] Variables/funciones/tipos en español renombrados a inglés en módulos prioritarios
  - [ ] `npm run quality:language` → <1000 findings
  - [ ] `npm run typecheck` → 0 errores
  - [ ] `npm run test` → todos pasan (sin regresión)

  **QA Scenarios**:
  ```
  Scenario: Verificar reducción de tokens español
    Tool: Bash
    Preconditions: Renombrado completado
    Steps:
      1. npm run quality:language → salida debe mostrar <1000 findings
    Expected Result: Menos de 1000 tokens en español
    Evidence: .sisyphus/evidence/f0.3-language-under-1000.txt
  ```
  **Commit**: YES (multiple commits por módulo)
  - Message: `refactor: rename spanish→english in [module]`
  - Pre-commit: `npm run typecheck && npm run quality:language`

- [ ] F0.4. **React Doctor P1 bugs (67/100 → ≥95/100)**

  **What to do**:
  - Ejecutar: `cd frontend && npx react-doctor@latest --verbose`
  - Fixes obligatorios (basados en reporte actual: 9 spread-key issues):
    1. **Array-index keys** — en toda lista: `key={item._id}` no `key={index}`
    2. **Derived state shadowing props** — eliminar `useState` inicializado desde props; usar `useMemo`
    3. **Render-in-render** — extraer funciones que retornan JSX a componentes separados
    4. **27 a11y issues** — cada `input` con `htmlFor`/`label`, botones con texto o `aria-label`, `focus-visible` ring
    5. **Chain state updates** — usar `setState(prev => ...)` o agrupar en un solo objeto
  - Landing pages afectadas: About, Hero, Method, Resources (x2), Services, Trust
  - Custom fields page, CostComparisonPanel

  **Must NOT do**:
  - No refactorizar componente completos — solo los fixes mínimos
  - No agregar tests nuevos aquí (son parte de F3.1)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Issues de React son mayormente de UI/componentes
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with F0.1, F0.2, F0.3, F0.5, F0.6, F0.7)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `.sisyphus/evidence/react-doctor-baseline.txt` — Reporte actual
  - `.sisyphus/evidence/current-quality-snapshot.md` — Estado actual (67/100, 9 issues)

  **Acceptance Criteria**:
  - [ ] `npx react-doctor@latest` → score ≥95/100
  - [ ] `cd frontend && npx react-doctor@latest --verbose` → 0 P1 issues
  - [ ] `npm run build` → 5/5 OK

  **QA Scenarios**:
  ```
  Scenario: Verificar React Doctor score
    Tool: Bash
    Preconditions: Todos los fixes aplicados
    Steps:
      1. cd frontend
      2. npx react-doctor@latest --verbose | Select-String "score" → debe mostrar ≥95
    Expected Result: Score ≥95/100
    Evidence: .sisyphus/evidence/f0.4-react-doctor-95.txt
  ```
  **Commit**: YES
  - Message: `fix: react-doctor P1 bugs — stable keys, derived state, a11y, render-in-render`
  - Pre-commit: `cd frontend && npx react-doctor@latest --verbose`

- [ ] F0.5. **RBAC SSOT — Jerarquía 10 roles**

  **What to do**:
  - Crear/verificar en `packages/domain/src/roles.ts`:
    ```ts
    export const CERMONT_ROLES = [
      'gerente_general', 'gerente_operaciones', 'residente_obra',
      'supervisor_hseq', 'tecnico_campo', 'administrativo',
      'almacenista', 'cliente_externo', 'auditor_interno', 'super_admin',
    ] as const;
    export type CermontRole = typeof CERMONT_ROLES[number];
    ```
  - Crear `MODULE_ACCESS` map con permisos por módulo
  - Implementar `canAccessModule(role, moduleKey): boolean`
  - Buscar y reemplazar TODOS los arrays de roles hardcodeados en:
    - `frontend/proxy.ts` — perímetro de seguridad
    - Componentes de sidebar/navegación
    - Backend controllers/middlewares
    - Cualquier `includes(['gerente', 'residente', ...])`
  - Verificar con `ast_grep_search` de arrays de strings con roles

  **Must NOT do**:
  - No cambiar lógica de autorización — solo centralizar los arrays
  - No eliminar módulo `@cermont/domain` si existe — extenderlo

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Cambio transversal que toca frontend y backend, requiere búsqueda exhaustiva
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with F0.1, F0.2, F0.3, F0.4, F0.6, F0.7)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `packages/domain/src/roles.ts` — Archivo target
  - AGENTS.md — Stack rules (no Auth.js, no NextAuth)
  - `frontend/proxy.ts` — Perímetro de seguridad actual

  **Acceptance Criteria**:
  - [ ] `packages/domain/src/roles.ts` existe con 10 roles + `canAccessModule()`
  - [ ] `ast_grep_search` con pattern de arrays de roles → 0 resultados
  - [ ] `npm run typecheck && npm run build && npm run test` → pass

  **QA Scenarios**:
  ```
  Scenario: Verificar rol hardcodeado no existe
    Tool: Bash
    Preconditions: Reemplazo completado
    Steps:
      1. ast_grep_search pattern="['gerente', 'residente', 'supervisor']" lang=typescript → 0 resultados
    Expected Result: 0 arrays de roles hardcodeados
    Evidence: .sisyphus/evidence/f0.5-no-hardcoded-roles.txt
  ```
  **Commit**: YES
  - Message: `feat: rbac ssot — 10-role hierarchy, canAccessModule helper, remove hardcoded role arrays`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] F0.6. **Shared components library**

  **What to do**:
  - Crear en `frontend/src/components/shared/` los siguientes componentes:
    - `PageHeader/` — title, subtitle, breadcrumb, badge (step/section/status), actions, backLink
    - `Breadcrumb/` — dentro de PageHeader
    - `KpiCard/` — label, value, icon, trend{value,direction,period}, variant, onClick, isLoading + KpiCardSkeleton
    - `EmptyState/` — icon, title, description, primaryAction, secondaryAction, illustrationVariant
    - `DataTable/` — sorting server-side, pagination, row selection, genéricos `<TData>`, TableSkeleton, BulkActions
    - `FilterBar/` — colapsable con framer-motion, items: FilterItem[], FilterChip removible
    - `StatusBadge/` — mapas de color por dominio: WorkOrder | Proposal | ServiceCase | Invoice
    - `SearchInput/` — debounce 300ms con useDebounce interno
    - `ConfirmDialog/` — shadcn AlertDialog wrapper con onConfirm/onCancel
    - `FileUploadZone/` — drag-drop + click, accept string[], maxSize, onFiles
    - `OfflineBanner/` — useOnlineStatus hook + pendingOpsCount desde IndexedDB
    - `FloatingAssistant/` — drawer lateral fixed right-0 z-50, colapsable a 44px

  **Must NOT do**:
  - No duplicar componentes existentes en `frontend/src/components/`
  - No crear dependencias externas nuevas (usar solo shadcn/ui existente)
  - No crear barrel exports que afecten tree-shaking

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Componentes de UI reutilizables con diseño y estados
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with F0.1-F0.5, F0.7)
  - **Blocks**: F1.1, F1.2, F1.3, F1.4, F1.5, F1.6, F2.6 (todos los módulos los usan)
  - **Blocked By**: None

  **References**:
  - `frontend/src/components/` — Componentes existentes para seguir patrones
  - `docs/design/CERMONT_UIUX_GUIDE.md` — Guía de diseño CERMONT
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` — Rutas que usarán estos componentes

  **Acceptance Criteria**:
  - [ ] 12 componentes creados en `frontend/src/components/shared/`
  - [ ] Cada componente tiene su archivo `.tsx` y tipos
  - [ ] `npm run typecheck -w frontend` → 0 errores
  - [ ] `npm run lint -w frontend` → 0 errores

  **QA Scenarios**:
  ```
  Scenario: Verificar componentes existen
    Tool: Bash
    Preconditions: Componentes creados
    Steps:
      1. Get-ChildItem -Path "frontend/src/components/shared" -Recurse -Filter "*.tsx" | Measure-Object → ≥12 archivos
    Expected Result: Al menos 12 archivos .tsx en shared/
    Evidence: .sisyphus/evidence/f0.6-shared-components.txt
  ```
  **Commit**: YES
  - Message: `feat: add shared component library (PageHeader, KpiCard, EmptyState, DataTable, FilterBar, StatusBadge, SearchInput, OfflineBanner, FloatingAssistant)`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run build`

- [ ] F0.7. **Design tokens + tipografía**

  **What to do**:
  - Agregar en `tailwind.config.ts` la escala tipográfica CERMONT:
    ```js
    fontSize: {
      'heading-xl': ['1.5rem', { fontWeight: '700', letterSpacing: '-0.025em', lineHeight: '2rem' }],
      'heading-lg': ['1.25rem', { fontWeight: '600', lineHeight: '1.75rem' }],
      'heading-sm': ['0.875rem', { fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }],
      'body-lg': ['1rem', { lineHeight: '1.5rem' }],
      'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'label': ['0.75rem', { fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase' }],
    }
    ```
  - Verificar colores CERMONT existentes: primary `#2154A6`, green `#4CAF50`

  **Must NOT do**:
  - No crear un segundo sistema de diseño
  - No duplicar tokens existentes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Cambio puntual en archivo de configuración
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with F0.1-F0.6)
  - **Blocks**: Todos los módulos UI (F1.1-F1.6, F2.1-F2.6)
  - **Blocked By**: None

  **References**:
  - `frontend/tailwind.config.ts` — Archivo a modificar
  - `docs/design/CERMONT_UIUX_GUIDE.md` — Guía de diseño

  **Acceptance Criteria**:
  - [ ] `tailwind.config.ts` tiene fontSize extendido con heading-xl, heading-lg, heading-sm, body-lg, body-sm, label
  - [ ] `npm run build` pasa

  **Commit**: YES (with F0.6)
  - Message: `feat: design tokens — typography scale (heading-xl→label)`
  - Pre-commit: `npm run build`

---

## FASE 1 — BLOQUEANTES DEL FLUJO 14 PASOS (Días 4-10)

- [ ] F1.1. **Work Requests — Paso 1 (frontend completo)**

  **What to do**:
  - **Contract**: Verificar `WorkRequestSchema` en `packages/shared-types/` con:
    - `prioridad: z.enum(['alta','media','baja'])`
    - `status: z.enum(['draft','submitted','validated','converted','cancelled'])`
    - `clientId: z.string()`
  - **Backend**: Verificar `GET /api/work-requests?page&limit&priority&status&search` con paginación
  - **Frontend** — crear `modules/work-requests/`:
    - `api/work-request.service.ts` — apiClient wrapper
    - `hooks/use-work-requests.ts` — useQuery con WorkRequestFilters
    - `hooks/use-create-work-request.ts` — useMutation + clientMutationId
    - `ui/WorkRequestsPage.tsx` — página principal
    - `ui/WorkRequestTable.tsx` — DataTable + expandable row inline
    - `ui/WorkRequestForm.tsx` — Sheet lateral (no nueva página)
    - `ui/WorkRequestFilters.tsx` — chips ALTA/MEDIA/BAJA + estado
    - `model/work-request.types.ts` — tipos inferidos desde schema
  - Estados: loading (TableSkeleton) / error / empty (ClipboardList) / offline
  - Botón contextual "→ Propuesta" visible solo cuando `status === 'validated'`
  - Bulk actions: checkbox + BulkActions component

  **Must NOT do**:
  - No crear ruta duplicada si backend ya existe
  - No mock data en producción

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Módulo frontend completo con tabla, formulario, filtros
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depende de F0.6 shared components)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: F0.6, F0.7

  **References**:
  - `packages/shared-types/src/schemas/` — Contractos actuales
  - `backend/src/modules/work-request/` — Backend existente
  - `docs/architecture/API_ENDPOINT_MATRIX.md` — Endpoints documentados
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` — Ruta /work-requests

  **Acceptance Criteria**:
  - [ ] `modules/work-requests/` creado con todos los archivos listados
  - [ ] GET /api/work-requests funciona con paginación y filtros
  - [ ] Loading state: TableSkeleton mostrado
  - [ ] Error state: mensaje de error + retry
  - [ ] Empty state: EmptyState con ClipboardList icon
  - [ ] Bulk actions funcionales
  - [ ] Botón "→ Propuesta" solo en status 'validated'
  - [ ] `npm run typecheck -w frontend && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: WorkRequests carga y filtra
    Tool: Bash
    Preconditions: Backend corriendo con datos de prueba
    Steps:
      1. curl -s http://localhost:4000/api/work-requests?page=1&limit=10 | jq '.success' → true
      2. curl -s http://localhost:4000/api/work-requests?priority=alta | jq '.data | length' → ≥0
    Expected Result: API responde con datos paginados
    Evidence: .sisyphus/evidence/f1.1-work-requests-api.txt

  Scenario: WorkRequestForm Sheet lateral
    Tool: Bash
    Preconditions: Frontend dev server corriendo
    Steps:
      1. Verificar que la ruta /work-requests carga sin errores 500
      2. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/work-requests → 200
    Expected Result: Página carga correctamente
    Evidence: .sisyphus/evidence/f1.1-work-requests-page.txt
  ```
  **Commit**: YES
  - Message: `feat: work-requests — full frontend paso 1, contract-first, filters, bulk-actions`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run test && npm run build`

- [ ] F1.2. **Planning — Paso 5 (Wizard multi-sección)**

  **What to do**:
  - **Contract**: Verificar `PlanningPacketSchema` con:
    - `assignedPersonnel[]`, `tools[]`, `materials[]`, `epp[]`
    - `schedule{start,end}`, `ptwReference`, `approvalStatus`, `workOrderId`
  - **Frontend** — crear `modules/planning/`:
    - `api/planning.service.ts`
    - `hooks/use-planning-packets.ts`
    - `hooks/use-create-planning.ts`
    - `ui/PlanningPage.tsx` — página principal
    - `ui/PlanningTable.tsx`
    - `ui/PlanningForm.tsx` — Wizard multi-sección: Cronograma → Personal → Herramientas → Materiales → AST/PTW → Firmas
    - `ui/PlanningDetail.tsx` — WorkflowGate blockers + documentos adjuntos
    - `ui/PlanningApprovalBadge.tsx`
  - WorkflowGate blockers visibles inline en vista detalle con CTA de resolución
  - Integrar con formato real "Planeación de Obra" CERMONT

  **Must NOT do**:
  - No duplicar lógica de validación (usar schema compartido)
  - No crear wizard si ya existe implementación parcial

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Wizard multi-sección con formularios complejos
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depende de F0.6)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: F0.6, F0.7

  **References**:
  - `packages/shared-types/src/schemas/` — Contractos
  - `backend/src/modules/planning/` — Backend existente
  - `.sisyphus/evidence/planning-packet-audit.md` — Auditoría previa

  **Acceptance Criteria**:
  - [ ] `modules/planning/` creado con todos los archivos listados
  - [ ] Wizard multi-sección funcional con navegación entre pasos
  - [ ] WorkflowGate blockers visibles
  - [ ] `npm run typecheck && npm run test && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Planning wizard navega entre secciones
    Tool: Bash
    Preconditions: Frontend dev server corriendo
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/planning → 200
    Expected Result: Página carga
    Evidence: .sisyphus/evidence/f1.2-planning-page.txt
  ```
  **Commit**: YES
  - Message: `feat: planning — full frontend paso 5, contract-first, wizard multi-seccion, approval workflow`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] F1.3. **Execution — Paso 6 (Offline-First)**

  **What to do**:
  - **Contract**: Verificar `ExecutionSessionSchema` con:
    - `workOrderId`, `technicianId`, `startTime`, `endTime`
    - `materials[]{itemId,qty,unit}`, `laborHours`
    - `ptwSigned`, `astSigned`, `checklistItems[]`
    - `status`, `signatures[]`, `clientMutationId`
  - **Dependencias**: `npm install idb-keyval browser-image-compression` ✅ aprobado
  - **Frontend** — crear `modules/execution/`:
    - `api/execution.service.ts`
    - `hooks/use-execution-sessions.ts`
    - `hooks/use-create-execution.ts` — useMutation + clientMutationId + IndexedDB fallback
    - `store/execution-offline.store.ts` — idb-keyval: guardar sesión pendiente
    - `ui/ExecutionPage.tsx`
    - `ui/ExecutionSessionForm.tsx` — PTW checklist + AST + materiales + timer
    - `ui/ExecutionTimer.tsx` — cronómetro horas:minutos trabajados
    - `ui/MaterialsUsedList.tsx`
    - `ui/OfflineSyncIndicator.tsx` — usa OfflineBanner + pendingOps count
    - `model/execution.types.ts`
  - **Formularios digitales de campo** (estáticos):
    - `ui/PtwForm.tsx` — Permiso Trabajo Alturas: zona, vigencia, autorización, firmantes
    - `ui/AstForm.tsx` — AST: tarea, peligros, medida de control
    - `ui/EppChecklist.tsx` — checkbox EPP
    - `ui/ToolChecklist.tsx` — herramientas verificadas
  - **Offline flow**:
    ```ts
    async function submitExecution(data: ExecutionPayload) {
      const mutationId = data.clientMutationId ?? crypto.randomUUID();
      try {
        if (!navigator.onLine) throw new Error('offline');
        return await executionService.create({ ...data, clientMutationId: mutationId });
      } catch {
        await set(`execution:pending:${mutationId}`, { ...data, clientMutationId: mutationId });
      }
    }
    window.addEventListener('online', async () => {
      const pendingKeys = await keys();
      for (const key of pendingKeys.filter(k => String(k).startsWith('execution:pending:'))) {
        const payload = await get(key);
        await executionService.create(payload);
        await del(key);
      }
    });
    ```

  **Must NOT do**:
  - No guardar server state en Zustand
  - No implementar mock data en producción
  - No modificar package.json sin aprobación

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Módulo más crítico con offline-first, IndexedDB sync, formularios complejos
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depende de F0.6)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: F0.6, F0.7

  **References**:
  - `packages/shared-types/src/schemas/` — Contractos
  - `backend/src/modules/execution/` — Backend existente
  - `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` — Offline-First section
  - Regla 8 de REGLAS_DESARROLLO_CERMONT.md: Offline-First / Graceful Degradation

  **Acceptance Criteria**:
  - [ ] `modules/execution/` creado con todos los archivos listados
  - [ ] Offline submit guarda en IndexedDB cuando no hay conexión
  - [ ] Sync automático al recuperar conexión
  - [ ] PTW Form, AST Form, EPP Checklist, Tool Checklist funcionales
  - [ ] `npm run typecheck && npm run test && npm run build` → pass
  - [ ] `npm run quality:weak-tokens` → 0 nuevos findings

  **QA Scenarios**:
  ```
  Scenario: Execution session API
    Tool: Bash
    Preconditions: Backend corriendo
    Steps:
      1. curl -s http://localhost:4000/api/execution?page=1 | jq '.success' → true
    Expected Result: API responde
    Evidence: .sisyphus/evidence/f1.3-execution-api.txt

  Scenario: Offline storage simulation
    Tool: Bash
    Preconditions: Frontend dev server corriendo
    Steps:
      1. Verificar que la ruta /execution carga sin errores
      2. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/execution → 200
    Expected Result: Página carga correctamente
    Evidence: .sisyphus/evidence/f1.3-execution-page.txt
  ```
  **Commit**: YES
  - Message: `feat: execution — offline-first paso 6, PTW/AST forms, IndexedDB sync, session timer`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] F1.4. **Delivery Records — Detalle + Firma Digital (Pasos 8-9)**

  **What to do**:
  - **Dependencia**: `npm install react-signature-canvas @types/react-signature-canvas` ✅ aprobado
  - **Frontend** — crear/extender `modules/delivery-records/`:
    - `ui/DeliveryRecordDetail.tsx` — ítems entregados, observaciones, estado firma
    - `ui/DeliveryRecordSignature.tsx` — react-signature-canvas, guardar como PNG
    - `ui/DeliveryRecordPdfButton.tsx` — GET /api/delivery-records/:id/export/pdf
  - **Backend** — verificar/agregar:
    - `GET /api/delivery-records/:id` — ya debe existir
    - `POST /api/delivery-records/:id/sign` — guardar firma PNG en /uploads/signatures/
    - `GET /api/delivery-records/:id/export/pdf` — pdf-lib con firma embebida

  **Must NOT do**:
  - No modificar package.json sin aprobación
  - No almacenar firmas en base de datos (solo ruta del archivo)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Interfaz de firma digital + PDF export
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depende de F0.6)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: F0.6, F0.7

  **References**:
  - `packages/shared-types/src/schemas/` — Contractos
  - `backend/src/modules/delivery-record/` — Backend existente
  - `docs/architecture/API_ENDPOINT_MATRIX.md` — Endpoints documentados

  **Acceptance Criteria**:
  - [ ] `DeliveryRecordDetail.tsx` muestra ítems entregados, observaciones, estado firma
  - [ ] `DeliveryRecordSignature.tsx` permite dibujar firma y guardar como PNG
  - [ ] POST /api/delivery-records/:id/sign guarda firma correctamente
  - [ ] GET /api/delivery-records/:id/export/pdf genera PDF con firma
  - [ ] `npm run typecheck && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Delivery record detail carga
    Tool: Bash
    Preconditions: Backend + Frontend corriendo
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/delivery-records → 200
    Expected Result: Página carga
    Evidence: .sisyphus/evidence/f1.4-delivery-page.txt
  ```
  **Commit**: YES
  - Message: `feat: delivery-records — detail view, digital signature canvas, PDF export pasos 8-9`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] F1.5. **Billing — SES (Pasos 10-11) + Invoices (Pasos 12-13)**

  **What to do**:
  - **Contract**: Verificar/actualizar schemas:
    - `ServiceEntrySheetSchema`: `poReference`, `sesAriba`, `amount`, `items[]`, `status: draft|submitted|approved|rejected`, `workOrderId`, `proposalId`
    - `InvoiceSchema`: `sesId`, `invoiceNumber`, `dianReference`, `amount`, `status: draft|submitted|approved|paid`, `issueDate`, `dueDate`
  - **Backend validación cruzada**:
    - SES amount vs Proposal approved amount (±5% tolerancia)
    - Invoice amount debe coincidir con SES amount
  - **Frontend SES** — crear `modules/ses/`:
    - `api/ses.service.ts`
    - `hooks/use-ses.ts`
    - `hooks/use-create-ses.ts` — clientMutationId
    - `ui/SesPage.tsx`
    - `ui/SesForm.tsx` — PO ref, SES Ariba ref, monto, ítems, adjunto
    - `ui/SesStatusTimeline.tsx` — draft→submitted→approved→rejected
  - **Frontend Invoices** — crear `modules/invoices/`:
    - `api/invoice.service.ts`
    - `hooks/use-invoices.ts`
    - `hooks/use-create-invoice.ts` — clientMutationId
    - `ui/InvoicesPage.tsx`
    - `ui/InvoiceForm.tsx` — vincular SES aprobada, DIAN ref
    - `ui/InvoicePdfButton.tsx` — GET /api/invoices/:id/export/pdf
  - **Billing Dashboard**: `ui/BillingDashboard.tsx` — orquestador estado SES→Factura→Pago por caso
  - **Blocker Indicator**: `ui/BillingBlockerIndicator.tsx` — visual de bloqueos por caso activo

  **Must NOT do**:
  - No duplicar schemas SES/Invoice (usar shared-types)
  - No omitir `clientMutationId` en creación de SES e Invoice

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Flujo billing complejo con validación cruzada y múltiples módulos
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depende de F0.6)
  - **Parallel Group**: Wave 3
  - **Blocks**: F1.6 (Payments depende de Invoices)
  - **Blocked By**: F0.6, F0.7

  **References**:
  - `packages/shared-types/src/schemas/` — Contractos SES/Invoice
  - `backend/src/modules/service-entry-sheet/` — Backend SES
  - `backend/src/modules/invoice/` — Backend Invoice
  - `docs/architecture/API_ENDPOINT_MATRIX.md` — Endpoints

  **Acceptance Criteria**:
  - [ ] `modules/ses/` y `modules/invoices/` creados con archivos listados
  - [ ] SES Form: PO ref, Ariba ref, monto, ítems
  - [ ] Invoice Form: vincular SES aprobada, DIAN ref
  - [ ] Validación cruzada backend: SES vs Proposal (±5%)
  - [ ] Validación cruzada backend: Invoice vs SES
  - [ ] `clientMutationId` en create SES y create Invoice
  - [ ] `npm run typecheck && npm run build && npm run test` → pass

  **QA Scenarios**:
  ```
  Scenario: SES API funciona
    Tool: Bash
    Preconditions: Backend corriendo
    Steps:
      1. curl -s http://localhost:4000/api/service-entry-sheets?page=1 | jq '.success' → true
    Expected Result: API SES responde
    Evidence: .sisyphus/evidence/f1.5-ses-api.txt

  Scenario: Invoice API funciona
    Tool: Bash
    Preconditions: Backend corriendo
    Steps:
      1. curl -s http://localhost:4000/api/invoices?page=1 | jq '.success' → true
    Expected Result: API Invoice responde
    Evidence: .sisyphus/evidence/f1.5-invoice-api.txt
  ```
  **Commit**: YES
  - Message: `feat: billing — SES paso 10-11, invoices paso 12-13, cross-validation, PDF export`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] F1.6. **Payments — Paso 14 + Auto-cierre ServiceCase**

  **What to do**:
  - **Contract**: Verificar `PaymentSchema` con:
    - `invoiceId`, `serviceCaseId`, `amount`, `reference`, `bank`, `paymentDate`
    - `receiptFile`, `status: pending|registered|confirmed`
    - `clientMutationId` OBLIGATORIO
  - **Backend**:
    - `payment.service.ts` — `registerPayment()` con auto-cierre de ServiceCase
    - Al registrar pago: cambiar ServiceCase a `paid` y registrar auditoría
  - **Frontend** — crear `modules/payments/`:
    - `api/payment.service.ts`
    - `hooks/use-payments.ts`
    - `hooks/use-register-payment.ts` — clientMutationId, idempotencia
    - `ui/PaymentsPage.tsx`
    - `ui/PaymentTable.tsx` — cliente, factura, monto, vencimiento, mora, estado
    - `ui/AgingChart.tsx` — BarChart recharts: 0-30 / 31-60 / 61-90 / +90 días
    - `ui/RegisterPaymentForm.tsx` — referencia, banco, fecha, comprobante

  **Must NOT do**:
  - No omitir `clientMutationId` (crítico para idempotencia de pagos)
  - No eliminar lógica de cierre de ServiceCase existente

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Tabla de pagos con aging chart + formulario registro
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depende de F1.5)
  - **Parallel Group**: Wave 3
  - **Blocks**: None (último paso del flujo)
  - **Blocked By**: F0.6, F0.7, F1.5

  **References**:
  - `packages/shared-types/src/schemas/` — Contractos Payment
  - `backend/src/modules/payment/` — Backend existente
  - `backend/src/modules/service-case/` — Backend ServiceCase
  - `docs/architecture/API_ENDPOINT_MATRIX.md` — Endpoints

  **Acceptance Criteria**:
  - [ ] `modules/payments/` creado con archivos listados
  - [ ] PaymentTable: cliente, factura, monto, vencimiento, mora
  - [ ] AgingChart: 4 barras (0-30/31-60/61-90/+90)
  - [ ] RegisterPaymentForm: referencia, banco, fecha, comprobante
  - [ ] Auto-cierre ServiceCase al registrar pago
  - [ ] Auditoría: PAYMENT_REGISTERED
  - [ ] `npm run typecheck && npm run build && npm run test` → pass

  **QA Scenarios**:
  ```
  Scenario: Payments API
    Tool: Bash
    Preconditions: Backend corriendo
    Steps:
      1. curl -s http://localhost:4000/api/payments?page=1 | jq '.success' → true
    Expected Result: API Payments responde
    Evidence: .sisyphus/evidence/f1.6-payments-api.txt
  ```
  **Commit**: YES
  - Message: `feat: payments — full frontend paso 14, aging chart, auto-close service case, idempotency`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

---

## FASE 2 — CALIDAD Y COMPLETITUD (Días 11-15)

- [ ] F2.1. **Dashboard KPIs reactivos**

  **What to do**:
  - Conectar KPIs a backend real (`GET /api/dashboard/kpis?from=&to=&clientId=`) — no mock data
  - Reemplazar KPI planos por `KpiCard` con trend positivo/negativo
  - **OperationalFlowMap**: pipeline horizontal 14 pasos con conteo real por estado
  - **AreaChart** recharts tema oscuro + gradiente verde-cermont
  - **RadialBarChart** distribución de estados
  - Dashboard personalizable: `@dnd-kit/core` (ya instalado), persistir layout en localStorage `cermont:dashboard:layout`
  - **Quick Actions bar**: Nueva OT / Nueva Solicitud / Crear Planeación / Registrar Visita

  **Must NOT do**:
  - No guardar server state en Zustand — usar TanStack Query con staleTime
  - No mock data en producción

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Gráficos recharts, dashboard personalizable con drag-and-drop
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with F1.5, F1.6)
  - **Blocks**: None
  - **Blocked By**: F0.6, F0.7

  **References**:
  - `frontend/src/modules/dashboard/` — Código existente del dashboard
  - `backend/src/modules/dashboard/` — Backend dashboard endpoints
  - `docs/architecture/API_ENDPOINT_MATRIX.md` — Endpoint /api/dashboard/kpis
  - `docs/design/CERMONT_UIUX_GUIDE.md` — Guía visual

  **Acceptance Criteria**:
  - [ ] KPIs conectados a backend real
  - [ ] KpiCard con trend (flecha arriba/abajo, color verde/rojo)
  - [ ] OperationalFlowMap con 14 pasos + conteos reales
  - [ ] AreaChart + RadialBarChart con datos reales
  - [ ] Dashboard personalizable (drag-drop, layout persistido)
  - [ ] `npm run typecheck && npm run test && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Dashboard KPIs API
    Tool: Bash
    Preconditions: Backend corriendo con datos
    Steps:
      1. curl -s http://localhost:4000/api/dashboard/kpis | jq '.success' → true
      2. curl -s http://localhost:4000/api/dashboard/kpis | jq '.data | has("totalOrders")' → true
    Expected Result: API KPIs responde con datos reales
    Evidence: .sisyphus/evidence/f2.1-dashboard-kpis-api.txt
  ```
  **Commit**: YES
  - Message: `feat: dashboard — reactive KPIs, OperationalFlowMap, recharts dark theme, customizable layout`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] F2.2. **Service Cases Kanban**

  **What to do**:
  - Vista Kanban con `@dnd-kit`: columnas por fase del flujo (Comercial / Planeación / Ejecución / Cierre Técnico / Cierre Admin)
  - SLA countdown badge: días restantes, rojo pulsante < 3 días
  - Sheet detalle lateral: timeline flujo, blockers activos, acciones disponibles
  - Toggle Kanban/Lista persistido en localStorage

  **Must NOT do**:
  - No duplicar página de lista existente — agregar toggle
  - No modificar lógica de negocio de ServiceCase

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Kanban con drag-and-drop, animaciones, badges
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with F2.3, F2.4, F2.5)
  - **Blocks**: None
  - **Blocked By**: F0.6, F0.7

  **References**:
  - `frontend/src/modules/service-cases/` — Módulo existente
  - `packages/domain/src/roles.ts` — RBAC para acciones disponibles

  **Acceptance Criteria**:
  - [ ] Vista Kanban con 5 columnas
  - [ ] Drag-and-drop entre columnas funcional
  - [ ] SLA countdown badge (<3 días rojo)
  - [ ] Sheet detalle lateral con timeline y blockers
  - [ ] Toggle Kanban/Lista persistido
  - [ ] `npm run typecheck && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Kanban page loads
    Tool: Bash
    Preconditions: Frontend corriendo
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/service-cases/kanban → 200
    Expected Result: Página Kanban carga
    Evidence: .sisyphus/evidence/f2.2-kanban-page.txt
  ```
  **Commit**: YES
  - Message: `feat: service-cases — kanban view, SLA countdown, detail sheet, @dnd-kit`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build`

- [ ] F2.3. **Motor de Templates Dinámicos + 5 seeds CERMONT**

  **What to do**:
  - **Contract** en `packages/shared-types/src/schemas/template.schema.ts`:
    ```ts
    export const FieldDefinitionSchema = z.object({
      key: z.string(), label: z.string(),
      type: z.enum(['text','number','select','photo','signature','date','checkbox-group']),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
      validation: z.object({ min: z.number().optional(), max: z.number().optional(), pattern: z.string().optional() }).optional(),
    });
    export const TemplateSchema = z.object({
      templateId: z.string(), name: z.string(),
      category: z.enum(['inspeccion','mantenimiento','seguridad','ejecucion','entrega']),
      version: z.number().int().min(1),
      fields: z.array(FieldDefinitionSchema),
      createdBy: z.string(),
    });
    ```
  - **Seeds** en `backend/src/seeds/templates.seed.ts`:
    1. **Líneas de Vida**: condiciones, afecciones, estado, hallazgo, foto, firma
    2. **CCTV**: cámara, modelo, serial, radio, antena, switch, alimentación, fotos
    3. **AST**: tarea, peligros (checkbox-group), medida control, responsable, firma HSE
    4. **PTW**: zona, altura, vigencia, EPP (checkbox-group), autorización, firmas
    5. **Anclajes**: tipo, ubicación, carga, estado, certificación, foto
  - **Componente `DynamicForm`** en `frontend/src/components/shared/DynamicForm/`:
    ```tsx
    interface DynamicFormProps {
      template: Template;
      onSubmit: (responses: Record<string, FieldResponse>) => void;
      defaultValues?: Record<string, FieldResponse>;
      isSubmitting?: boolean;
    }
    ```
    - `photo` → FileUploadZone
    - `signature` → react-signature-canvas
    - `checkbox-group` → grupo de checkboxes
    - `select` → shadcn Select

  **Must NOT do**:
  - No modificar package.json sin aprobación
  - No duplicar schemas de template

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Sistema de templates dinámicos con renderizado condicional por tipo de campo
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with F2.2, F2.4, F2.5)
  - **Blocks**: None
  - **Blocked By**: F0.6, F0.7

  **References**:
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — Formatos CERMONT reales
  - `docs/pdf/` — PDFs de formatos originales
  - `packages/shared-types/src/schemas/` — Schemas existentes

  **Acceptance Criteria**:
  - [ ] TemplateSchema en shared-types
  - [ ] 5 seeds de templates CERMONT reales
  - [ ] DynamicForm component con renderizado por tipo
  - [ ] `photo`, `signature`, `checkbox-group`, `select` funcionales
  - [ ] `npm run typecheck && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Templates API
    Tool: Bash
    Preconditions: Backend corriendo con seeds
    Steps:
      1. curl -s http://localhost:4000/api/templates | jq '.data | length' → ≥5
    Expected Result: 5 templates seed disponibles
    Evidence: .sisyphus/evidence/f2.3-templates-seeded.txt
  ```
  **Commit**: YES
  - Message: `feat: template-engine — DynamicForm, 5 real Cermont templates seeded (lineas-de-vida, CCTV, AST, PTW, anclajes)`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] F2.4. **Inventory + Assets + Fleet**

  **What to do**:
  - **Dependencias**: `npm install html5-qrcode qrcode.react` ✅ aprobado
  - **Inventory**: catálogo por categorías (herramientas, EPP, materiales, repuestos)
    - Vista lista + filtros por categoría
    - Escaneo QR: `html5-qrcode`, leer código → redirige a ficha del ítem
  - **Assets**: ficha técnica de cada activo
    - QR code generado con `qrcode.react`
    - Campos: placa, serial, modelo, ubicación, estado
  - **Fleet**: vehículos de la flota
    - Próximo mantenimiento con alerta 7 días antes
    - Vista de calendario con mantenimientos programados

  **Must NOT do**:
  - No modificar package.json sin aprobación
  - No duplicar módulo fleet existente

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Múltiples vistas de catálogo con escaneo QR
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with F2.2, F2.3, F2.5)
  - **Blocks**: None
  - **Blocked By**: F0.6, F0.7

  **References**:
  - `frontend/src/modules/fleet/` — Módulo fleet existente
  - `backend/src/modules/inventory/` — Backend inventory
  - `backend/src/modules/asset/` — Backend assets
  - `backend/src/modules/fleet/` — Backend fleet

  **Acceptance Criteria**:
  - [ ] Inventory: catálogo por categorías + escaneo QR
  - [ ] Assets: ficha técnica + QR generado
  - [ ] Fleet: próximo mantenimiento + alertas 7 días
  - [ ] `npm run typecheck && npm run build && npm run test` → pass

  **QA Scenarios**:
  ```
  Scenario: Inventory API
    Tool: Bash
    Preconditions: Backend corriendo
    Steps:
      1. curl -s http://localhost:4000/api/inventory?page=1 | jq '.success' → true
    Expected Result: API Inventory responde
    Evidence: .sisyphus/evidence/f2.4-inventory-api.txt
  ```
  **Commit**: YES
  - Message: `feat: inventory + assets + fleet — catalog, QR scan, preventive maintenance alerts`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] F2.5. **PDF + Excel Export Engine**

  **What to do**:
  - **Backend** — `backend/src/services/pdf-export.service.ts` usando `pdf-lib` (ya instalada)
  - **Endpoints a implementar/verificar**:
    - `GET /api/proposals/:id/export/pdf`
    - `GET /api/reports/:id/export/pdf`
    - `GET /api/delivery-records/:id/export/pdf` — con firma embebida
    - `GET /api/invoices/:id/export/pdf`
    - `GET /api/orders/export/xlsx` — con `exceljs` ✅ aprobado
    - `GET /api/reports/analytics/export/xlsx`
  - **Frontend**: Botones de descarga PDF en cada módulo correspondiente

  **Must NOT do**:
  - No modificar package.json sin aprobación
  - No duplicar lógica de export si ya existe

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Generación de PDFs server-side con pdf-lib, formato CERMONT
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with F2.2, F2.3, F2.4)
  - **Blocks**: None
  - **Blocked By**: F0.6, F0.7

  **References**:
  - `backend/src/services/` — Servicios existentes para patrón
  - `packages/shared-types/src/schemas/` — Schemas Proposal, Report, etc.

  **Acceptance Criteria**:
  - [ ] GET /api/proposals/:id/export/pdf → PDF descargable
  - [ ] GET /api/delivery-records/:id/export/pdf → PDF con firma
  - [ ] GET /api/invoices/:id/export/pdf → PDF descargable
  - [ ] GET /api/orders/export/xlsx → Excel descargable
  - [ ] `npm run typecheck && npm run build && npm run test` → pass

  **QA Scenarios**:
  ```
  Scenario: Proposal PDF export
    Tool: Bash
    Preconditions: Backend corriendo, proposal existe
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" "http://localhost:4000/api/proposals/FAKE_ID/export/pdf" → verificar código
      2. curl -s -o proposal-test.pdf "http://localhost:4000/api/proposals/REAL_ID/export/pdf" && Test-Path "proposal-test.pdf" → true
    Expected Result: PDF generado
    Evidence: .sisyphus/evidence/f2.5-pdf-export.txt
  ```
  **Commit**: YES
  - Message: `feat: pdf-excel export engine — proposals, reports, delivery-records, invoices, orders`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] F2.6. **Polish módulos existentes**

  **What to do**:
  Aplicar shared components y fixes a módulos ya implementados:

  | Módulo | Fix |
  |--------|-----|
  | `/proposals` | PageHeader unificado, columna Margen%, timeline aprobación, PDF button |
  | `/purchase-orders` | PageHeader paso 4, alerta vencimiento <30d, clientMutationId |
  | `/orders` | Vista Kanban @dnd-kit, exportar Excel |
  | `/evidences` | Verificar uploader post-refactor, compresión browser-image-compression |
  | `/dispatch` | PageHeader, panel técnicos |
  | `/sla` | Fix tipografía P5, KpiCard trend, toast casos vencidos |
  | `/reports` | Vista detalle técnica, recharts analytics |
  | `/costs` | Fix tipografía P5, KpiCard margen real, tabla varianza |
  | `/documents` | PageHeader, preview react-pdf, toggle galería/lista |
  | `/customers` | Layout dual tarjetas/tabla, health score badge |
  | `/admin/personnel` | PageHeader, certificaciones con vencimiento, exportar Excel |
  | `/admin/audit` | Filtros requestId, timeline por ServiceCase, exportar CSV |

  **Must NOT do**:
  - No refactorizar componentes completos — solo aplicar PageHeader + tipografía
  - No cambiar lógica de negocio

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Aplicación consistente de shared components en 12 módulos
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with F2.2, F2.3, F2.4, F2.5)
  - **Blocks**: None
  - **Blocked By**: F0.6, F0.7

  **References**:
  - `frontend/src/modules/` — Cada módulo a pulir
  - `frontend/src/components/shared/PageHeader/` — Componente PageHeader base

  **Acceptance Criteria**:
  - [ ] PageHeader unificado en proposals, purchase-orders, dispatch, documents, customers, admin/personnel, admin/audit
  - [ ] KpiCard trend en sla, costs
  - [ ] Alertas vencimiento en purchase-orders
  - [ ] Exportar Excel en orders, admin/personnel
  - [ ] `npm run typecheck && npm run lint && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Módulos pulidos cargan
    Tool: Bash
    Preconditions: Frontend corriendo
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/proposals → 200
      2. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/costs → 200
      3. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/reports → 200
    Expected Result: Todos los módulos cargan sin error 500
    Evidence: .sisyphus/evidence/f2.6-modules-polished.txt
  ```
  **Commit**: YES
  - Message: `feat: module polish — PageHeader unified, typography scale P5, recharts dark theme across all modules`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build`

---

## FASE 3 — INNOVACIÓN Y TESTS (Días 16-19)

- [ ] F3.1. **Tests nuevos (1228 → ≥1500)**

  **What to do**:
  - Tests backend:
    - `backend/src/services/cermont-workflow-gate.service.spec.ts` — WorkflowGate steps 1-14
    - `backend/src/modules/notifications/notification.service.spec.ts` — Notification mapping steps 7-10
  - Tests frontend para módulos bloqueantes:
    - `frontend/src/modules/work-requests/__tests__/` — WorkRequestTable, form submit, filters
    - `frontend/src/modules/planning/__tests__/` — Planning wizard navigation, form submit
    - `frontend/src/modules/execution/__tests__/` — Offline sync, session timer, IndexedDB fallback
    - `frontend/src/modules/payments/__tests__/` — PaymentTable rendering, aging chart data

  **Must NOT do**:
  - No eliminar tests existentes
  - No crear tests que pasen sin implementación real (no triviales)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Tests de integración y unitarios para flujos críticos
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with F3.2, F3.3, F3.4)
  - **Blocks**: None
  - **Blocked By**: F1.1, F1.2, F1.3, F1.6 (los módulos a testear)

  **References**:
  - `backend/src/services/` — Patrones de tests backend existentes
  - `frontend/src/modules/` — Tests existentes en otros módulos (copiar patrón)

  **Acceptance Criteria**:
  - [ ] WorkflowGate service spec: steps 1-14 tested
  - [ ] Notification service spec: mapping steps 7-10 tested
  - [ ] WorkRequest tests: table, form, filters
  - [ ] Planning tests: wizard, submit
  - [ ] Execution tests: offline sync, IndexedDB
  - [ ] Payments tests: table, aging chart
  - [ ] `npm run test` → ≥1500 pass

  **QA Scenarios**:
  ```
  Scenario: Test count ≥1500
    Tool: Bash
    Preconditions: Todos los tests escritos
    Steps:
      1. npm run test 2>&1 | Select-String "Tests:" → debe mostrar ≥1500
    Expected Result: ≥1500 tests pasando
    Evidence: .sisyphus/evidence/f3.1-tests-1500.txt
  ```
  **Commit**: YES
  - Message: `test: add tests for blocking modules — workflow-gate, notifications, offline-sync, payments`
  - Pre-commit: `npm run typecheck && npm run lint && npm run test`

- [ ] F3.2. **Fix notificaciones pasos 7-10**

  **What to do**:
  - Corregir `DB_STEP_TO_DOMAIN_STATE` en `notification.service.ts`:
    ```ts
    const DB_STEP_TO_DOMAIN_STATE: Record<string, string> = {
      'step_07_technical_report':  'technical_report',   // ERA: 'evidences'
      'step_08_delivery_record':   'delivery_record',    // ERA: 'technical_report'
      'step_09_client_signature':  'client_signature',   // ERA: 'delivery_record'
      'step_10_ses_submission':    'ses',                // ERA: 'client_signature'
    };
    ```
  - Verificar pasos 11-14 si tienen el mismo desplazamiento

  **Must NOT do**:
  - No modificar el orden de pasos 1-6 (están correctos)
  - No cambiar la lógica de envío de notificaciones

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Fix de mapeo en un solo archivo
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with F3.1, F3.3, F3.4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `backend/src/modules/notifications/notification.service.ts` — Archivo a corregir
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — Mapa de flujo 14 pasos

  **Acceptance Criteria**:
  - [ ] DB_STEP_TO_DOMAIN_STATE corregido para steps 7-10
  - [ ] Pasos 11-14 verificados sin desplazamiento
  - [ ] `npm run typecheck -w backend` → 0 errores
  - [ ] `npm run test -w backend` → tests de notification service pasan

  **QA Scenarios**:
  ```
  Scenario: Verificar mapeo corregido
    Tool: Bash
    Preconditions: Fix aplicado
    Steps:
      1. ast_grep_search pattern="step_07_technical_report" lang=typescript → verificar que mapea a 'technical_report'
    Expected Result: Mapeo correcto
    Evidence: .sisyphus/evidence/f3.2-notification-mapping.txt
  ```
  **Commit**: YES
  - Message: `fix: notification mapping steps 7-10 — correct domain state alignment`
  - Pre-commit: `npm run typecheck -w backend && npm run test -w backend`

- [ ] F3.3. **Scheduling + mejoras finales**

  **What to do**:
  - **Dependencia**: `npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid` (requiere aprobación)
  - Calendario de disponibilidad de personal en `/admin/settings`
  - Vista mensual de recursos con FullCalendar
  - Notificaciones push/PWA mejoradas (verificar service worker existente)

  **Must NOT do**:
  - No modificar package.json sin aprobación
  - No duplicar calendarios si FullCalendar ya existe

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Calendario interactivo con FullCalendar
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with F3.1, F3.2, F3.4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/package.json` — Verificar si FullCalendar ya está instalado (README dice que sí: 6.1.20)
  - `frontend/src/app/admin/` — Rutas admin existentes

  **Acceptance Criteria**:
  - [ ] Calendario disponibilidad personal funcional
  - [ ] Vista mensual con FullCalendar
  - [ ] `npm run typecheck -w frontend && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Scheduling page loads
    Tool: Bash
    Preconditions: Frontend corriendo
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/settings → 200
    Expected Result: Página de scheduling carga
    Evidence: .sisyphus/evidence/f3.3-scheduling-page.txt
  ```
  **Commit**: YES
  - Message: `feat: resource scheduling, calendar view for personnel availability`
  - Pre-commit: `npm run typecheck -w frontend && npm run build`

- [ ] F3.4. **CI/CD GitHub Actions**

  **What to do**:
  - Crear `.github/workflows/ci.yml`:
    ```yaml
    name: CI
    on:
      push:
        branches: [main, develop, 'audit/**', 'feat/**', 'fix/**']
      pull_request:
        branches: [main, develop]
    jobs:
      quality:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with: { node-version: '22', cache: 'npm' }
          - run: npm ci
          - run: npm run contracts:check
          - run: npm run typecheck
          - run: npm run lint
          - run: npm run build
          - run: npm run test
            env: { CI: true, NODE_ENV: test }
    ```
  - Verificar que `npm ci` funciona en entorno CI (package-lock.json actualizado)

  **Must NOT do**:
  - No romper CI/CD existente si hay
  - No incluir secrets en el workflow

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Archivo YAML de CI/CD estándar
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with F3.1, F3.2, F3.3)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `.github/workflows/` — Workflows existentes si hay
  - `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` — CI/CD section

  **Acceptance Criteria**:
  - [ ] `.github/workflows/ci.yml` creado
  - [ ] Workflow corre typecheck, lint, build, test
  - [ ] Branch filters: main, develop, audit/**, feat/**, fix/**

  **QA Scenarios**:
  ```
  Scenario: CI file exists and is valid YAML
    Tool: Bash
    Preconditions: Archivo creado
    Steps:
      1. Test-Path ".github/workflows/ci.yml" → true
      2. Get-Content ".github/workflows/ci.yml" | Select-String "typecheck" → true
    Expected Result: CI workflow existe con typecheck job
    Evidence: .sisyphus/evidence/f3.4-ci-file.txt
  ```
  **Commit**: YES
  - Message: `ci: add github actions — typecheck, lint, build, test on push`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] F3.5. **Deploy VPS Contabo + smoke test**

  **What to do**:
  - **Checklist pre-deploy**:
    1. SSH al VPS: verificar OS, CPU/RAM/disco, Docker, Nginx
    2. Configurar UFW: puertos 80, 443, 22 únicamente
    3. SSL/Certbot si hay dominio
    4. Generar secrets de producción frescos (JWT_SECRET, REFRESH_TOKEN_SECRET)
    5. Actualizar `.env.production` con valores correctos
    6. `docker compose -f docker-compose.yml up -d --build`
    7. Ejecutar smoke test (38 endpoints)
  - **Scripts deploy existentes** (verificar):
    ```bash
    bash deploy.sh backup    # backup MongoDB antes de deploy
    bash deploy.sh deploy    # deploy con Docker Compose
    bash deploy.sh status    # verificar estado servicios
    ```
  - **Backup automático** — agregar cron en VPS:
    ```bash
    0 2 * * * /opt/cermont/deploy.sh backup >> /var/log/cermont-backup.log 2>&1
    ```

  **Must NOT do**:
  - No deploy a Vercel (prohibido)
  - No exponer puertos no listados (80, 443, 22)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Deploy en producción VPS con verificación de seguridad
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (secuencial, último paso)
  - **Parallel Group**: Wave 5 (sequential final)
  - **Blocks**: None (final task)
  - **Blocked By**: F3.1, F3.2, F3.3, F3.4

  **References**:
  - `docker-compose.yml` — Composición Docker
  - `deploy.sh` — Scripts de deploy existentes
  - `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` — Deploy section

  **Acceptance Criteria**:
  - [ ] VPS accesible vía SSH
  - [ ] UFW configurado (80, 443, 22)
  - [ ] SSL/Certbot configurado
  - [ ] Secrets de producción generados
  - [ ] `docker compose up -d --build` exitoso
  - [ ] Smoke test 38/38 endpoints pasan
  - [ ] Backup automático con cron

  **QA Scenarios**:
  ```
  Scenario: Docker services running
    Tool: Bash
    Preconditions: Deploy completado
    Steps:
      1. docker compose ps → todos los servicios deben mostrar "Up"
    Expected Result: Todos los servicios Docker están running
    Evidence: .sisyphus/evidence/f3.5-docker-ps.txt

  Scenario: Smoke test
    Tool: Bash
    Preconditions: Servicios corriendo
    Steps:
      1. curl -s http://localhost:4000/api/health/live | jq '.status' → "ok"
      2. curl -s http://localhost:4000/api/health/ready | jq '.status' → "ok"
    Expected Result: Health checks pasan
    Evidence: .sisyphus/evidence/f3.5-smoke-test.txt
  ```
  **Commit**: YES
  - Message: `chore: production deploy — env vars, SSL, UFW, automated backup cron`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

---

## Final Verification Wave

> 4 review agents en PARALELO. TODOS deben APPROVE. Esperar OK explícito del usuario.

- [ ] F4.1. **Plan Compliance Audit** — `oracle`
  Leer plan end-to-end. Verificar cada "Must Have" existe en implementación. Cada "Must NOT Have" no tiene violaciones. Evidence files existen en `.sisyphus/evidence/`. Comparar deliverables contra plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F4.2. **Code Quality Review** — `unspecified-high`
  `tsc --noEmit` + `lint` + `test`. Revisar: `as any`/`@ts-ignore`, empty catches, `console.log` en prod, commented-out code, unused imports.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F4.3. **Real Manual QA** — `unspecified-high` (+ playwright)
  Clean state. Ejecutar CADA QA scenario de CADA tarea. Probar integración cross-task. Edge cases: empty state, invalid input, rapid actions. Evidencia en `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4.4. **Scope Fidelity Check** — `deep`
  Por cada tarea: leer "What to do" vs diff real. Verificar 1:1 — todo lo especificado fue construido, nada no-especificado fue añadido. Detectar contaminación cross-task. Flag cambios no contabilizados.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

Cada commit sigue Conventional Commits:
```
type(scope): desc
```
Types: `fix` `feat` `test` `ci` `chore` `refactor`

Gate pre-commit:
```bash
npm run typecheck && npm run lint && npm run build && npm run test
```

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck       # → 0 errores
npm run lint            # → 0 errores Biome
npm run build           # → 5/5 tasks OK
npm run test            # → ≥1500 pass
npx react-doctor@latest # → ≥95/100
npm run quality:weak-tokens  # → 0 findings
npm run quality:language     # → <1000 findings
npm run verify          # → all gates green
```

### Final Checklist
- [ ] All Must Have present
- [ ] All Must NOT Have absent
- [ ] All gates pass
- [ ] 14/14 flujo pasos con UI funcional
- [ ] CI/CD pipeline verde
- [ ] Docker smoke test 38/38
- [ ] Deploy VPS funcional
