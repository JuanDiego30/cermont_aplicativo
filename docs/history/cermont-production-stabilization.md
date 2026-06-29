# Cermont Production Stabilization & Deployment

## TL;DR

> **Quick Summary**: Estabilizar, corregir y preparar el aplicativo CERMONT S.A.S. para despliegue productivo, garantizando que typecheck, lint, tests, build y verify pasen limpiamente, que todos los módulos estén conectados E2E (contratos → backend → frontend), y que la configuración de despliegue (Docker, PM2, env vars, seguridad) esté lista para producción.
>
> **Deliverables**:
> - TypeScript clean en todos los workspaces (0 errores)
> - Biome lint clean (0 errores)
> - Test suites passing (backend 100%+, frontend 95%+ pass rate)
> - Build exitoso: shared-types → domain → config → backend → frontend
> - `npm run verify` passing completo
> - `npx react-doctor` clean
> - Contratos Zod alineados con modelos Mongoose y API endpoints
> - Frontend: todas las rutas de sidebar funcionales, estados visuales completos
> - Dark/light theme consistente en todas las páginas
> - Seguridad: RBAC, CORS, rate limiting, helmet, JWT verificados
> - Docker compose funcional, PM2 ecosystem config validado
> - Documentación actualizada al estado real del código
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 6 waves
> **Critical Path**: Wave 1 (Foundation) → Wave 2 (Contracts) → Wave 3 (Backend) → Wave 4 (Frontend) → Wave 5 (Deploy Config) → Wave FINAL (Verification)

---

## Context

### Original Request
Estabilizar, optimizar y preparar el aplicativo web CERMONT S.A.S. para despliegue productivo, garantizando integración correcta de todos los módulos funcionales, contratos de datos, servicios backend, interfaces frontend, base de datos, autenticación, control de acceso, auditoría, operación offline, documentación técnica y pruebas de calidad, alineados con el flujo operativo-administrativo real de la empresa.

### Interview Summary
**Puntos Clave**:
- El usuario tiene el código en rama `audit/business-logic-state` con cambios masivos sin commitear (~200 archivos entre modificados y nuevos)
- Existen nuevos módulos implementados (DIAN, SLA, Dispatch, Fleet, Inventory, CRM, AST, Signature) que deben integrarse
- La arquitectura fue reestructurada a DDD bounded contexts
- Se requiere que `npm run verify` pase completamente como compuerta final
- El despliegue usa Docker + PM2 en VPS

**Estado Actual del Código**:
- ~100 archivos modificados (M), ~100 archivos nuevos (??), ~7 archivos eliminados (D)
- proxy.ts fue eliminado y recreado (posible conflicto)
- EmptyState.tsx eliminado del path original, movido a core/ui/
- Nuevos servicios: reminder-worker, case-closure-lock, evidence-reference-integrity, invoice-integrity, workflow-audit
- Tests existentes en backend (80+), frontend, shared-types
- Quality tooling robusto: biome, vitest, playwright, react-doctor, contracts:check, quality:strict

### Research Findings
- Monorepo npm workspaces bien estructurado
- Documentación canónica en `docs/` (10 DOC-CANON + guías de arquitectura)
- Roadmap de 23 fases documentado en `docs/plans/CERMONT_REBUILD_ROADMAP.md`
- Stack inmutable: Express 5.2.1, Mongoose 9.x, Zod 4.x, Next.js 16, React 19
- RBAC via `@cermont/domain`, auth via JWT + cookies HttpOnly
- Quality gates: typecheck, lint, test, build, verify, react-doctor, quality:strict, contracts:check

---

## Work Objectives

### Core Objective
Lograr que el monorepo CERMONT compile, pase todos los tests, verifique contratos, construya assets de producción, y esté configurado correctamente para despliegue en VPS, con todos los módulos funcionales conectados E2E y la documentación alineada con la implementación real.

### Concrete Deliverables
- `npm run typecheck` → 0 errores en los 5 workspaces
- `npm run lint` → 0 errores Biome en los 5 workspaces
- `npm run test` → todos los tests pasando (backend + frontend + shared-types)
- `npm run build` → builds exitosos en orden: shared-types → domain → config → backend → frontend
- `npm run verify` → pipeline completo exitoso
- `npm run contracts:check` → contratos validados
- `npx react-doctor` → clean report
- `docker compose up --build -d` → contenedores funcionales
- Frontend: 0 rutas huérfanas, 0 páginas 404, todos los estados visuales implementados

### Definition of Done
- [ ] `npm run verify` pasa sin errores
- [ ] `npx react-doctor --verbose` reporta 0 issues críticos
- [ ] `npm run quality:strict` pasa
- [ ] `npm run contracts:check` pasa
- [ ] Docker compose levanta backend + frontend + MongoDB exitosamente
- [ ] Health checks: `/api/health/live` y `/api/health/ready` responden 200
- [ ] Login flow funcional E2E (Playwright o curl)
- [ ] Navegación por sidebar: todas las rutas accesibles según RBAC

### Must Have
- TypeScript strict 0 errores
- Biome lint 0 errores
- Build de producción exitoso
- Test suites pasando
- Contratos Zod alineados con modelos Mongoose
- RBAC funcional en backend y frontend
- proxy.ts como perímetro de seguridad funcional
- Variables de entorno validadas con Zod
- Docker compose para despliegue
- Documentación actualizada

### Must NOT Have (Guardrails)
- NO introducir `any`, `unknown`, `null`, `undefined`
- NO usar `middleware.ts` (solo proxy.ts)
- NO duplicar schemas Zod, tipos, roles, rutas
- NO hardcodear roles
- NO fetch directo en componentes
- NO mock data en producción
- NO `console.log` en producción
- NO eliminar funcionalidad existente sin reemplazo
- NO modificar package.json sin necesidad justificada
- NO instalar nuevas dependencias sin aprobación explícita
- NO deshabilitar lint, tests, o typecheck

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: Tests-after (tests already exist, verify they pass; add tests where coverage gaps found)
- **Framework**: Vitest (unit/integration) + Playwright (E2E)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright - Navigate, interact, assert DOM, screenshot
- **CLI/Backend**: Use Bash - Run commands, assert output, check exit codes
- **API**: Use Bash (curl) - Send requests, assert status + response fields

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - start immediately, 8 tasks MAX PARALLEL):
├── T1: Git state stabilization + lockfile integrity
├── T2: Dependency audit + npm install clean verification
├── T3: Biome configuration audit + lint baseline capture
├── T4: TypeScript config audit across all workspaces
├── T5: Environment variables validation (Zod schemas)
├── T6: Tooling scripts audit (quality/, contracts/, ghost check)
├── T7: Documentation inventory vs actual code state
└── T8: Deleted/moved files reconciliation (proxy.ts, EmptyState, etc.)

Wave 2 (Contracts & Shared Packages - after Wave 1, 5 tasks):
├── T9:  shared-types build + typecheck fix
├── T10: @cermont/domain build + typecheck fix
├── T11: @cermont/config build + typecheck fix
├── T12: Contract guard verification (contracts:check)
└── T13: Schema-Model alignment audit (Zod ↔ Mongoose)

Wave 3 (Backend Stabilization - after Wave 2, 7 tasks):
├── T14: Backend typecheck fix (tsc --noEmit)
├── T15: Backend lint fix (biome)
├── T16: Backend test suite fix (vitest)
├── T17: Backend build fix (tsc → dist/)
├── T18: Module route/controller/service alignment audit
├── T19: Middleware chain verification (auth → authorize → validate)
└── T20: New modules integration (DIAN, SLA, Dispatch, SystemConfig)

Wave 4 (Frontend Stabilization - after Wave 3, 8 tasks):
├── T21: Frontend typecheck fix (tsc --noEmit)
├── T22: Frontend lint fix (biome)
├── T23: Frontend test suite fix (vitest)
├── T24: Frontend build fix (next build)
├── T25: Route map verification (0 orphan routes, 0 404s)
├── T26: UI states audit (loading/error/empty/offline/forbidden)
├── T27: Dark/light theme consistency audit
└── T28: Accessibility baseline audit (WCAG AA)

Wave 5 (Deployment & Security - after Wave 4, 6 tasks):
├── T29: Docker configuration validation + fix
├── T30: PM2 ecosystem config validation
├── T31: CORS + Helmet + Rate Limiting verification
├── T32: JWT auth flow E2E verification
├── T33: Health checks configuration (live + ready)
└── T34: Production env vars + secrets validation

Wave FINAL (after ALL tasks — 4 parallel reviews, then user okay):
├── F1: Plan compliance audit (oracle)
├── F2: Full verify pipeline execution
├── F3: E2E smoke tests (Playwright)
└── F4: react-doctor + quality:strict final check
-> Present consolidated results -> Get explicit user okay

Critical Path: T1 → T4 → T9 → T10 → T11 → T14 → T17 → T21 → T24 → T29 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 8 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| T1-T8 | None | T9-T20 | 1 |
| T9 | T4 | T12, T13, T14 | 2 |
| T10 | T4 | T14 | 2 |
| T11 | T4 | T14 | 2 |
| T12 | T9 | T13 | 2 |
| T13 | T9, T12 | T14 | 2 |
| T14 | T9, T10, T11 | T17, T18, T19, T20 | 3 |
| T15 | T3 | T17 | 3 |
| T16 | T14 | T17 | 3 |
| T17 | T14, T15, T16 | T21 | 3 |
| T18 | T14 | T20 | 3 |
| T19 | T14 | T31, T32 | 3 |
| T20 | T14, T18 | T21 | 3 |
| T21 | T17, T20 | T24, T25, T26, T27, T28 | 4 |
| T22 | T3 | T24 | 4 |
| T23 | T21 | T24 | 4 |
| T24 | T21, T22, T23 | T29, F1-F4 | 4 |
| T25 | T21 | F3 | 4 |
| T26 | T21 | F3 | 4 |
| T27 | T21 | F3 | 4 |
| T28 | T21 | F3 | 4 |
| T29 | T24 | F1-F4 | 5 |
| T30 | T24 | F1-F4 | 5 |
| T31 | T19 | F2 | 5 |
| T32 | T19 | F3 | 5 |
| T33 | T29 | F2 | 5 |
| T34 | T29 | F2 | 5 |
| F1-F4 | T29-T34 | Done | FINAL |

---

## TODOs

- [ ] 1. **Git State Stabilization & Lockfile Integrity**

  **What to do**:
  - Run `git status` to capture full working tree state
  - Verify `package-lock.json` is the only lockfile in the entire repo (no yarn.lock, pnpm-lock.yaml, or nested package-lock.json files)
  - Remove any stray lockfiles from `apps/`, `.codex/worktrees/`, or any subdirectory
  - Verify `.gitignore` covers `node_modules/`, `.next/`, `dist/`, `.turbo/`, `uploads/`, `.env` (not `.env.example`)
  - Check for files marked as both deleted (D) and untracked (??) — these indicate conflicts (e.g., `proxy.ts`, `EmptyState.tsx`)
  - Run `npm run ghost:check` to verify no ghost directories
  - Document the current branch state and any unresolved conflicts

  **Must NOT do**:
  - Do NOT commit, merge, or rebase without explicit approval
  - Do NOT delete any `.codex/worktrees/` directory
  - Do NOT run `git clean -fd` without confirmation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File system audit, no complex logic
  - **Skills**: [`bash-defensive-patterns`]
    - `bash-defensive-patterns`: Safe shell commands for git operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5, 6, 7, 8)
  - **Blocks**: T9 (shared-types depends on clean workspace)
  - **Blocked By**: None

  **References**:
  - `package.json:7-13` - Valid workspace list
  - `package.json:9` - "Lockfile único en la raíz" rule
  - `AGENTS.md` - "Canonical Repository Structure" section
  - Root `.gitignore` - verify exclusions

  **Acceptance Criteria**:
  - [ ] Only one lockfile exists: root `package-lock.json`
  - [ ] No `yarn.lock` or `pnpm-lock.yaml` anywhere
  - [ ] `.gitignore` covers all generated directories
  - [ ] `npm run ghost:check` exits 0
  - [ ] Git working tree documented (saved to `.sisyphus/evidence/task-1-git-state.txt`)

  **QA Scenarios**:

  ```
  Scenario: Verify single lockfile across entire repo
    Tool: Bash
    Steps:
      1. Get-ChildItem -Recurse -Filter "package-lock.json" | Select-Object FullName
      2. Get-ChildItem -Recurse -Filter "yarn.lock" | Select-Object FullName
      3. Get-ChildItem -Recurse -Filter "pnpm-lock.yaml" | Select-Object FullName
    Expected Result: Exactly 1 package-lock.json at root, 0 yarn.lock, 0 pnpm-lock.yaml
    Evidence: .sisyphus/evidence/task-1-lockfiles.txt

  Scenario: Ghost directory check passes
    Tool: Bash
    Steps:
      1. npm run ghost:check
    Expected Result: Exit code 0, no ghost directories reported
    Evidence: .sisyphus/evidence/task-1-ghost-check.txt
  ```

  **Commit**: NO (audit-only task)

- [ ] 2. **Dependency Audit & npm install Clean Verification**

  **What to do**:
  - Run `npm install` from root and verify it completes without errors
  - Check for peer dependency warnings — document any that need resolution
  - Verify `node_modules/` is at root only (not in individual workspaces)
  - Run `npm ls --depth=0` to verify workspace dependencies resolve correctly
  - Check for any deprecated packages reported by npm
  - Verify that all `workspace:*` references resolve to local packages
  - Run `npm audit` and document any HIGH/CRITICAL vulnerabilities
  - Verify Node.js version meets `engines` requirement (>=22.20.0)

  **Must NOT do**:
  - Do NOT run `npm audit fix` without explicit approval
  - Do NOT upgrade or install new packages
  - Do NOT modify any `package.json` files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Dependency installation and audit
  - **Skills**: [`bash-defensive-patterns`]
    - `bash-defensive-patterns`: Safe npm operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5, 6, 7, 8)
  - **Blocks**: T9 (shared-types build needs deps)
  - **Blocked By**: None

  **References**:
  - `package.json:7-13` - Workspace definitions
  - `package.json:14-17` - Engine requirements
  - Each workspace `package.json` - workspace:* dependencies

  **Acceptance Criteria**:
  - [ ] `npm install` exits 0 with no errors
  - [ ] All `workspace:*` packages resolve (no "UNMET DEPENDENCY")
  - [ ] Node version >= 22.20.0 confirmed
  - [ ] Dependency audit report saved

  **QA Scenarios**:

  ```
  Scenario: Clean npm install from root
    Tool: Bash
    Steps:
      1. node --version
      2. npm --version
      3. npm install 2>&1
    Expected Result: Exit 0, no error messages, "added N packages" message
    Evidence: .sisyphus/evidence/task-2-install.txt

  Scenario: Workspace dependencies resolve correctly
    Tool: Bash
    Steps:
      1. npm ls --depth=0 2>&1
    Expected Result: No "UNMET DEPENDENCY" or "missing" errors for workspace packages
    Evidence: .sisyphus/evidence/task-2-workspace-deps.txt
  ```

  **Commit**: NO (audit-only)

- [ ] 3. **Biome Configuration Audit & Lint Baseline Capture**

  **What to do**:
  - Read all `biome.json` or `biome.jsonc` config files across workspaces
  - Verify consistent configuration (same rules, same severity levels)
  - Run `npm run lint` from root and capture ALL current errors/warnings
  - Categorize errors by: (a) auto-fixable, (b) manual fix needed, (c) rule conflict
  - Check if `lint-staged` config in root `package.json` covers all file patterns
  - Verify `.husky/pre-commit` hook exists and calls lint-staged correctly
  - Save baseline report for subsequent tasks to reference

  **Must NOT do**:
  - Do NOT auto-fix lint errors yet (just capture baseline)
  - Do NOT change biome rules without documenting rationale

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration audit, no code changes
  - **Skills**: [`bash-defensive-patterns`]
    - `bash-defensive-patterns`: Safe shell operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5, 6, 7, 8)
  - **Blocks**: T15 (backend lint fix) and T22 (frontend lint fix)
  - **Blocked By**: None

  **References**:
  - `package.json:83-101` - lint-staged configuration
  - `.husky/pre-commit` - git hook
  - Each workspace for biome config files (glob: `**/biome.json*`)

  **Acceptance Criteria**:
  - [ ] All biome config files found and catalogued
  - [ ] Current lint error count captured per workspace
  - [ ] Errors categorized by type (auto-fixable / manual / conflict)
  - [ ] Baseline report saved to `.sisyphus/evidence/task-3-lint-baseline.md`

  **QA Scenarios**:

  ```
  Scenario: Capture lint baseline for all workspaces
    Tool: Bash
    Steps:
      1. npm run lint 2>&1 | Select-Object -Last 50
    Expected Result: Output shows lint results per workspace with error counts
    Evidence: .sisyphus/evidence/task-3-lint-output.txt

  Scenario: Verify biome config files exist and are parseable
    Tool: Bash
    Steps:
      1. Get-ChildItem -Recurse -Filter "biome.json*" | ForEach-Object { Write-Output "---$_---"; Get-Content $_.FullName }
    Expected Result: At least 1 biome config file found with valid JSON content
    Evidence: .sisyphus/evidence/task-3-biome-configs.txt
  ```

  **Commit**: NO (audit-only)

- [ ] 4. **TypeScript Config Audit Across All Workspaces**

  **What to do**:
  - Read all `tsconfig.json` files: root, backend, frontend, packages/shared-types, packages/domain, packages/config
  - Verify `strict: true` in all configs
  - Verify `compilerOptions.paths` and project references are consistent
  - Check for `skipLibCheck: true` (acceptable) vs missing type roots
  - Run `npm run typecheck` from root and capture ALL current errors
  - Categorize errors by workspace and by error type (type mismatch, missing module, etc.)
  - Save categorized error report for T14 (backend) and T21 (frontend) to reference

  **Must NOT do**:
  - Do NOT fix type errors yet (just capture baseline)
  - Do NOT change `strict: true` or add `@ts-ignore`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration audit with error capture
  - **Skills**: [`typescript-advanced-types`]
    - `typescript-advanced-types`: Understanding TS config and error patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5, 6, 7, 8)
  - **Blocks**: T9-T11 (shared packages typecheck), T14 (backend), T21 (frontend)
  - **Blocked By**: None

  **References**:
  - `tsconfig.json` (root) - base configuration
  - `backend/tsconfig.json` - backend TypeScript config
  - `frontend/tsconfig.json` - frontend TypeScript config
  - `packages/*/tsconfig.json` - package configs

  **Acceptance Criteria**:
  - [ ] All tsconfig.json files read and catalogued
  - [ ] `strict: true` confirmed in all configs
  - [ ] Current typecheck error count captured per workspace
  - [ ] Errors categorized (type mismatch / missing module / unused / other)
  - [ ] Report saved to `.sisyphus/evidence/task-4-typecheck-baseline.md`

  **QA Scenarios**:

  ```
  Scenario: Full typecheck baseline capture
    Tool: Bash
    Steps:
      1. npm run typecheck 2>&1 | Select-Object -Last 80
    Expected Result: Output shows type errors per workspace (even if many errors)
    Evidence: .sisyphus/evidence/task-4-typecheck-output.txt

  Scenario: Verify strict mode in all tsconfig files
    Tool: Bash
    Steps:
      1. Get-ChildItem -Recurse -Filter "tsconfig.json" | ForEach-Object { Write-Output "=== $($_.DirectoryName) ==="; Get-Content $_.FullName | Select-String "strict" }
    Expected Result: All tsconfig.json files show `"strict": true`
    Evidence: .sisyphus/evidence/task-4-strict-check.txt
  ```

  **Commit**: NO (audit-only)

- [ ] 5. **Environment Variables Validation (Zod Schemas)**

  **What to do**:
  - Read `backend/src/config/env.ts` — verify it uses Zod to validate env vars at startup
  - Read `packages/config/` — verify shared env validation logic
  - Check for `.env.example` files in backend and frontend
  - Verify `FRONTEND_URL`, `MONGO_URI`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET` are all validated
  - Verify `MONGO_URI` uses `127.0.0.1` (not `localhost`) per Ley 2
  - Check that `NODE_ENV` is validated and used to toggle production-only features
  - Document any missing env vars that schemas require but examples don't show

  **Must NOT do**:
  - Do NOT check actual `.env` files for secrets (only `.env.example`)
  - Do NOT log or display secret values

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration audit, read-only
  - **Skills**: [`zod`]
    - `zod`: Understanding Zod schema validation patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 6, 7, 8)
  - **Blocks**: T14 (backend build), T34 (production env vars)
  - **Blocked By**: None

  **References**:
  - `backend/src/config/env.ts` - Backend env validation
  - `packages/config/` - Shared config package
  - `backend/.env.example` - Backend env template
  - `frontend/.env.local.example` - Frontend env template
  - `README.md` "Variables de entorno requeridas" section

  **Acceptance Criteria**:
  - [ ] Backend env.ts uses Zod schema to validate all required vars
  - [ ] Frontend env validation exists and validates `NEXT_PUBLIC_API_URL`
  - [ ] `MONGO_URI` template uses `127.0.0.1`
  - [ ] All env var names consistent between .env.example and validation schemas
  - [ ] Report saved to `.sisyphus/evidence/task-5-env-audit.md`

  **QA Scenarios**:

  ```
  Scenario: Verify backend env schema covers required vars
    Tool: Bash
    Steps:
      1. Get-Content backend/src/config/env.ts | Select-String -Pattern "z\.(string|number|boolean|enum|object)"
    Expected Result: Zod schema found with fields for PORT, MONGO_URI, JWT_SECRET, FRONTEND_URL, NODE_ENV
    Evidence: .sisyphus/evidence/task-5-backend-env-schema.txt

  Scenario: Verify MONGO_URI uses 127.0.0.1
    Tool: Bash
    Steps:
      1. Get-Content backend/.env.example | Select-String "MONGO_URI"
      2. Get-Content backend/src/config/db.ts | Select-String "127.0.0.1"
    Expected Result: MONGO_URI contains 127.0.0.1, db.ts uses family: 4
    Evidence: .sisyphus/evidence/task-5-mongo-ipv4.txt
  ```

  **Commit**: NO (audit-only)

- [ ] 6. **Tooling Scripts Audit**

  **What to do**:
  - Read all scripts in `tooling/quality/` directory — verify each script runs without crashing
  - Run `npm run quality:strict` and capture output
  - Read `tooling/contracts/check-contract-guard.ts` — verify contract validation logic
  - Read `tooling/prevent-ghost-dirs.ts` — verify ghost directory detection
  - Check that all tooling scripts use `tsx` and have proper shebangs/imports
  - Document any tooling script that fails to execute

  **Must NOT do**:
  - Do NOT modify tooling scripts yet (just audit)
  - Do NOT add new quality rules

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Script execution audit
  - **Skills**: [`bash-defensive-patterns`]
    - `bash-defensive-patterns`: Safe execution of verification scripts

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 5, 7, 8)
  - **Blocks**: T12 (contracts:check)
  - **Blocked By**: None

  **References**:
  - `package.json:31-40` - quality:* scripts
  - `tooling/quality/` - Quality check scripts
  - `tooling/contracts/` - Contract validation scripts
  - `tooling/prevent-ghost-dirs.ts` - Ghost directory check

  **Acceptance Criteria**:
  - [ ] All tooling scripts listed and read
  - [ ] `npm run quality:strict` executed, output captured
  - [ ] Any failing scripts documented
  - [ ] Report saved to `.sisyphus/evidence/task-6-tooling-audit.md`

  **QA Scenarios**:

  ```
  Scenario: Run quality:strict and capture results
    Tool: Bash
    Steps:
      1. npm run quality:strict 2>&1
    Expected Result: Scripts execute; pass/fail status captured for each
    Evidence: .sisyphus/evidence/task-6-quality-strict.txt
  ```

  **Commit**: NO (audit-only)

- [ ] 7. **Documentation Inventory vs Actual Code State**

  **What to do**:
  - Read `docs/README.md` — verify index accuracy
  - Read `docs/architecture/FRONTEND_ROUTE_MAP.md` — compare against actual `frontend/src/app/` routes
  - Read `docs/architecture/API_ENDPOINT_MATRIX.md` — compare against actual `backend/src/modules/*/` routes
  - Check for docs referencing deprecated paths (`apps/backend`, `apps/frontend`)
  - Flag any documented module that has NO corresponding code
  - Flag any implemented module that has NO documentation
  - Verify AGENTS.md files exist in: root, backend, frontend, packages

  **Must NOT do**:
  - Do NOT rewrite documentation yet (just audit)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Documentation-to-code comparison
  - **Skills**: []
    - No specialized skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 5, 6, 8)
  - **Blocks**: T25 (route map verification)
  - **Blocked By**: None

  **References**:
  - `docs/README.md` - Documentation index
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` - All frontend routes
  - `docs/architecture/API_ENDPOINT_MATRIX.md` - All API endpoints
  - `AGENTS.md` (root, backend/, frontend/, packages/)

  **Acceptance Criteria**:
  - [ ] Route map vs actual routes compared
  - [ ] API matrix vs actual endpoints compared
  - [ ] All AGENTS.md files present and verified
  - [ ] Deprecated path references (apps/) flagged
  - [ ] Report saved to `.sisyphus/evidence/task-7-docs-audit.md`

  **QA Scenarios**:

  ```
  Scenario: Count actual frontend page routes
    Tool: Bash
    Steps:
      1. Get-ChildItem -Path frontend/src/app -Recurse -Filter "page.tsx" | Select-Object FullName
    Expected Result: List of all page.tsx files found
    Evidence: .sisyphus/evidence/task-7-frontend-pages.txt

  Scenario: Count actual backend route files
    Tool: Bash
    Steps:
      1. Get-ChildItem -Path backend/src -Recurse -Filter "*.routes.ts" | Select-Object FullName
    Expected Result: List of all route files found
    Evidence: .sisyphus/evidence/task-7-backend-routes.txt
  ```

  **Commit**: NO (audit-only)

- [ ] 9. **@cermont/shared-types Build & Typecheck Fix**

  **What to do**:
  - Run `npm run typecheck -w @cermont/shared-types` → capture all errors
  - Run `npm run build -w @cermont/shared-types` → capture all errors
  - Fix type errors: check for missing exports, circular imports, incorrect type inference
  - Verify all schemas in `src/schemas/` are exported from barrel (`src/schemas/index.ts`)
  - Check that new schemas (dian, sla, dispatch, system-config, analytics) have tests in `tests/schemas/`
  - Verify `exports` field in `package.json` matches actual file structure
  - Ensure no schemas reference deleted or renamed types from other packages
  - Run shared-types tests: `npm run test -w @cermont/shared-types`

  **Must NOT do**:
  - Do NOT add new schemas beyond what's already started
  - Do NOT change Zod version or API patterns
  - Do NOT use `any` or `unknown` types

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Type resolution and build fixing across package
  - **Skills**: [`typescript-advanced-types`, `zod`]
    - `typescript-advanced-types`: Complex type fixes, export resolution
    - `zod`: Schema validation patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T10, T11)
  - **Parallel Group**: Wave 2 (with Tasks 10, 11)
  - **Blocks**: T12, T13, T14
  - **Blocked By**: T1 (clean workspace), T4 (typecheck baseline)

  **References**:
  - `packages/shared-types/package.json` - exports map, build config
  - `packages/shared-types/src/schemas/index.ts` - schema barrel
  - `packages/shared-types/src/index.ts` - main barrel
  - `packages/shared-types/tsconfig.json` - TypeScript config

  **Acceptance Criteria**:
  - [ ] `npm run typecheck -w @cermont/shared-types` exits 0
  - [ ] `npm run build -w @cermont/shared-types` exits 0
  - [ ] `npm run test -w @cermont/shared-types` passes
  - [ ] All schema barrel exports verified

  **QA Scenarios**:

  ```
  Scenario: shared-types typecheck passes clean
    Tool: Bash
    Steps:
      1. npm run typecheck -w @cermont/shared-types 2>&1
    Expected Result: Exit 0, no TypeScript errors
    Evidence: .sisyphus/evidence/task-9-typecheck.txt

  Scenario: shared-types build produces dist/
    Tool: Bash
    Steps:
      1. npm run build -w @cermont/shared-types 2>&1
      2. Test-Path packages/shared-types/dist/index.js
      3. Test-Path packages/shared-types/dist/index.d.ts
    Expected Result: Exit 0, dist/ exists with index.js and index.d.ts
    Evidence: .sisyphus/evidence/task-9-build.txt

  Scenario: shared-types tests pass
    Tool: Bash
    Steps:
      1. npm run test -w @cermont/shared-types 2>&1
    Expected Result: All tests pass, no failures
    Evidence: .sisyphus/evidence/task-9-tests.txt
  ```

  **Commit**: YES (groups with T10, T11)
  - Message: `fix(shared-types): resolve typecheck and build errors`
  - Files: `packages/shared-types/`

- [ ] 10. **@cermont/domain Build & Typecheck Fix**

  **What to do**:
  - Run `npm run typecheck -w @cermont/domain` → capture errors
  - Run `npm run build -w @cermont/domain` → capture errors
  - Verify RBAC role strings: `gerente`, `residente`, `HES`, `supervisor`, `operador`, `tecnico`, `administrativo`, `cliente`
  - Verify `canAccessRoute()`, `canAccessModule()`, and permission helpers are exported
  - Check that `src/rbac.ts` and `src/roles.ts` exports are consistent with barrel
  - Ensure no circular dependency with shared-types or config

  **Must NOT do**:
  - Do NOT add or remove roles without explicit approval
  - Do NOT hardcode role arrays outside domain package

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Focused type fix on small package
  - **Skills**: [`typescript-advanced-types`]
    - `typescript-advanced-types`: Type export resolution

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T11)
  - **Parallel Group**: Wave 2 (with Tasks 9, 11)
  - **Blocks**: T14
  - **Blocked By**: T4 (typecheck baseline)

  **References**:
  - `packages/domain/package.json` - build config
  - `packages/domain/src/index.ts` - main barrel
  - `packages/domain/src/rbac.ts` - RBAC helpers
  - `packages/domain/src/roles.ts` - Role definitions

  **Acceptance Criteria**:
  - [ ] `npm run typecheck -w @cermont/domain` exits 0
  - [ ] `npm run build -w @cermont/domain` exits 0
  - [ ] All 8 role strings exported correctly

  **QA Scenarios**:

  ```
  Scenario: domain package typecheck and build pass
    Tool: Bash
    Steps:
      1. npm run typecheck -w @cermont/domain 2>&1
      2. npm run build -w @cermont/domain 2>&1
    Expected Result: Both exit 0
    Evidence: .sisyphus/evidence/task-10-build.txt
  ```

  **Commit**: YES (groups with T9, T11)
  - Message: `fix(domain): resolve typecheck and build errors`
  - Files: `packages/domain/`

- [ ] 11. **@cermont/config Build & Typecheck Fix**

  **What to do**:
  - Run `npm run typecheck -w @cermont/config` → capture errors
  - Run `npm run build -w @cermont/config` → capture errors
  - Verify config exports match what backend and frontend import
  - Check env validation schemas are consistent with T5 findings

  **Must NOT do**:
  - Do NOT put secrets or business logic in config package

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small package, focused fix
  - **Skills**: [`typescript-advanced-types`]
    - `typescript-advanced-types`: Export resolution

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T10)
  - **Parallel Group**: Wave 2 (with Tasks 9, 10)
  - **Blocks**: T14
  - **Blocked By**: T4, T5

  **References**:
  - `packages/config/package.json` - build config
  - `packages/config/src/index.ts` - main barrel

  **Acceptance Criteria**:
  - [ ] `npm run typecheck -w @cermont/config` exits 0
  - [ ] `npm run build -w @cermont/config` exits 0

  **QA Scenarios**:

  ```
  Scenario: config package typecheck and build pass
    Tool: Bash
    Steps:
      1. npm run typecheck -w @cermont/config 2>&1
      2. npm run build -w @cermont/config 2>&1
    Expected Result: Both exit 0
    Evidence: .sisyphus/evidence/task-11-build.txt
  ```

  **Commit**: YES (groups with T9, T10)
  - Message: `fix(config): resolve typecheck and build errors`
  - Files: `packages/config/`

- [ ] 12. **Contract Guard Verification (contracts:check)**

  **What to do**:
  - Run `npm run contracts:check` and capture output
  - Read `tooling/contracts/check-contract-guard.ts` to understand validation rules
  - Fix any contract mismatches: Zod schema vs API response shape
  - Verify `packages/shared-types/contracts/api-contract.snapshot.json` is up to date
  - If snapshot is stale, run `npm run contracts:snapshot:update`
  - Verify contract migrations in `contract-migrations.json` are documented

  **Must NOT do**:
  - Do NOT modify contract guard rules without understanding impact

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Contract validation and potential schema fixes
  - **Skills**: [`zod`, `typescript-advanced-types`]
    - `zod`: Schema validation patterns
    - `typescript-advanced-types`: Type alignment

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on T9)
  - **Blocks**: T13
  - **Blocked By**: T9 (shared-types must build first)

  **References**:
  - `tooling/contracts/check-contract-guard.ts` - Contract validation logic
  - `packages/shared-types/contracts/api-contract.snapshot.json` - Current snapshot
  - `packages/shared-types/contracts/contract-migrations.json` - Migration history

  **Acceptance Criteria**:
  - [ ] `npm run contracts:check` exits 0
  - [ ] All schema-to-response mismatches resolved
  - [ ] Snapshot updated if needed

  **QA Scenarios**:

  ```
  Scenario: Contract check passes
    Tool: Bash
    Steps:
      1. npm run contracts:check 2>&1
    Expected Result: Exit 0, no contract violations
    Evidence: .sisyphus/evidence/task-12-contracts-check.txt
  ```

  **Commit**: YES
  - Message: `fix(contracts): align schemas with API contract snapshot`
  - Files: `packages/shared-types/contracts/`, affected schemas

- [ ] 13. **Schema-Model Alignment Audit (Zod ↔ Mongoose)**

  **What to do**:
  - For each core entity, verify Zod schema in `@cermont/shared-types` matches Mongoose model in `backend/src/models/`
  - Key entities to verify: User, Order, ServiceCase, Evidence, Invoice, Document, Proposal, AuditLog, Notification
  - Check field name consistency (e.g., `createdAt` vs `created_at`, `workOrderId` vs `orderId`)
  - Check type consistency (e.g., Zod `z.string()` vs Mongoose `String`, `z.date()` vs `Date`)
  - Check required/optional alignment
  - Check enum values match between Zod and Mongoose
  - Document any mismatches found; fix where clear

  **Must NOT do**:
  - Do NOT change Mongoose model fields without updating Zod schema
  - Do NOT change Zod schema without updating Mongoose model

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Systematic cross-package alignment audit
  - **Skills**: [`zod`, `typescript-advanced-types`]
    - `zod`: Understanding Zod schema definitions
    - `typescript-advanced-types`: Type alignment between packages

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: T14 (backend typecheck depends on aligned schemas)
  - **Blocked By**: T9, T12

  **References**:
  - `packages/shared-types/src/schemas/` - All Zod schemas
  - `backend/src/models/` - All Mongoose models
  - `packages/shared-types/tests/schemas/` - Schema tests

  **Acceptance Criteria**:
  - [ ] All core entity schemas audited
  - [ ] Field name mismatches resolved or documented
  - [ ] Type mismatches fixed
  - [ ] Enum values aligned
  - [ ] Report saved to `.sisyphus/evidence/task-13-schema-model-audit.md`

  **QA Scenarios**:

  ```
  Scenario: User schema aligned between Zod and Mongoose
    Tool: Bash
    Steps:
      1. Read packages/shared-types/src/schemas/ (find User/User schema)
      2. Read backend/src/models/User.ts
      3. Compare field names, types, required flags
    Expected Result: Fields consistent: email, password, role, name, etc.
    Evidence: .sisyphus/evidence/task-13-user-alignment.txt

  Scenario: Order schema aligned
    Tool: Bash
    Steps:
      1. Read packages/shared-types/src/schemas/ (find Order/WorkOrder schema)
      2. Read backend/src/models/Order.ts
    Expected Result: Core fields (status, assignee, client, dates) aligned
    Evidence: .sisyphus/evidence/task-13-order-alignment.txt
  ```

  **Commit**: YES (if fixes made)
  - Message: `fix(schemas): align Zod schemas with Mongoose models`
  - Files: `packages/shared-types/src/schemas/`, `backend/src/models/` (if modified)

  **What to do**:
  - From `git status`, identify all files marked as deleted (D):
    - `frontend/src/components/common/EmptyState.tsx` → check if replaced by `frontend/src/core/ui/EmptyState.tsx`
    - `frontend/src/modules/custom-fields/ui/DynamicFormField.tsx` → check for replacement
    - `frontend/src/modules/maintenance/ui/MaintenanceKitForm.tsx` → check for replacement
    - `frontend/src/modules/planning/ui/PlanningKitSuggestionBanner.tsx` → check for replacement
    - `frontend/src/modules/planning/ui/PlanningPacketForm.tsx` → check for replacement
    - `frontend/proxy.ts` → check untracked `frontend/proxy.ts` (recreated?)
    - `frontend/tests/e2e/fixtures/.auth/deploy-ui-state.json` → verify not needed
  - For each deleted file: verify imports referencing it have been updated or removed
  - Run `npm run typecheck` specifically looking for "Cannot find module" errors that reference deleted files
  - Document all orphans found

  **Must NOT do**:
  - Do NOT restore deleted files without verifying they're needed
  - Do NOT git checkout deleted files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File reconciliation audit
  - **Skills**: [`bash-defensive-patterns`]
    - `bash-defensive-patterns`: Safe git operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 5, 6, 7)
  - **Blocks**: T14 (backend typecheck), T21 (frontend typecheck)
  - **Blocked By**: None

  **References**:
  - `git status` output (captured in T1)
  - `frontend/src/core/ui/EmptyState.tsx` - potential replacement
  - `frontend/proxy.ts` (untracked) - recreated security perimeter

  **Acceptance Criteria**:
  - [ ] All 7 deleted files reconciled (replacement found OR confirmed obsolete)
  - [ ] 0 imports referencing deleted files (verified via typecheck)
  - [ ] proxy.ts conflict resolved (one canonical version)
  - [ ] Report saved to `.sisyphus/evidence/task-8-deleted-files.md`

  **QA Scenarios**:

  ```
  Scenario: Check for imports of deleted EmptyState.tsx
    Tool: Bash
    Steps:
      1. grep -r "EmptyState" frontend/src/ --include="*.ts" --include="*.tsx" | Select-String -NotMatch "core/ui/EmptyState"
    Expected Result: No imports from the old path; all should reference core/ui/EmptyState
    Evidence: .sisyphus/evidence/task-8-emptystate-imports.txt

  Scenario: Verify proxy.ts is present and not deleted
    Tool: Bash
    Steps:
      1. Test-Path frontend/proxy.ts
      2. Get-Content frontend/proxy.ts | Select-Object -First 20
    Expected Result: File exists and contains security perimeter logic
    Evidence: .sisyphus/evidence/task-8-proxy-exists.txt
  ```

  **Commit**: NO (audit-only)

- [ ] 9. **@cermont/shared-types Build & Typecheck Fix**

  **What to do**:
  - Run `npm run typecheck -w @cermont/shared-types` → capture all errors
  - Run `npm run build -w @cermont/shared-types` → capture all errors
  - Fix type errors: check for missing exports, circular imports, incorrect type inference
  - Verify all schemas in `src/schemas/` are exported from barrel (`src/schemas/index.ts`)
  - Check that new schemas (dian, sla, dispatch, system-config, analytics) have tests in `tests/schemas/`
  - Verify `exports` field in `package.json` matches actual file structure
  - Ensure no schemas reference deleted or renamed types from other packages
  - Run shared-types tests: `npm run test -w @cermont/shared-types`

  **Must NOT do**:
  - Do NOT add new schemas beyond what's already started
  - Do NOT change Zod version or API patterns
  - Do NOT use `any` or `unknown` types

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Type resolution and build fixing across shared package
  - **Skills**: [`typescript-advanced-types`, `zod`]
    - `typescript-advanced-types`: Complex type fixes, export resolution
    - `zod`: Schema validation patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T10, T11)
  - **Parallel Group**: Wave 2 (with Tasks 10, 11)
  - **Blocks**: T12, T13, T14
  - **Blocked By**: T1 (clean workspace), T4 (typecheck baseline)

  **References**:
  - `packages/shared-types/package.json` - exports map, build config
  - `packages/shared-types/src/schemas/index.ts` - schema barrel
  - `packages/shared-types/src/index.ts` - main barrel
  - `packages/shared-types/tsconfig.json` - TypeScript config

  **Acceptance Criteria**:
  - [ ] `npm run typecheck -w @cermont/shared-types` exits 0
  - [ ] `npm run build -w @cermont/shared-types` exits 0
  - [ ] `npm run test -w @cermont/shared-types` passes
  - [ ] All schema barrel exports verified

  **QA Scenarios**:

  ```
  Scenario: shared-types typecheck passes clean
    Tool: Bash
    Steps:
      1. npm run typecheck -w @cermont/shared-types 2>&1
    Expected Result: Exit 0, no TypeScript errors
    Evidence: .sisyphus/evidence/task-9-typecheck.txt

  Scenario: shared-types build produces dist/
    Tool: Bash
    Steps:
      1. npm run build -w @cermont/shared-types 2>&1
      2. Test-Path packages/shared-types/dist/index.js
    Expected Result: Exit 0, dist/ exists with index.js and index.d.ts
    Evidence: .sisyphus/evidence/task-9-build.txt
  ```

  **Commit**: YES (groups with T10, T11)
  - Message: `fix(shared-types): resolve typecheck and build errors`
  - Files: `packages/shared-types/`

- [ ] 10. **@cermont/domain Build & Typecheck Fix**

  **What to do**:
  - Run `npm run typecheck -w @cermont/domain` → capture errors
  - Run `npm run build -w @cermont/domain` → capture errors
  - Verify RBAC role exports: all 8 roles (`gerente`, `residente`, `HES`, `supervisor`, `operador`, `tecnico`, `administrativo`, `cliente`)
  - Verify `canAccessRoute()`, `canAccessModule()` helpers are exported and functional
  - Check `src/rbac.ts` and `src/roles.ts` exports consistent with barrel
  - Ensure no circular dependency with shared-types or config
  - Verify backend and frontend import from this package correctly

  **Must NOT do**:
  - Do NOT add or remove roles without explicit approval
  - Do NOT hardcode role arrays outside domain package

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Focused type fix on small package
  - **Skills**: [`typescript-advanced-types`]
    - `typescript-advanced-types`: Type export resolution

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T11)
  - **Parallel Group**: Wave 2 (with Tasks 9, 11)
  - **Blocks**: T14
  - **Blocked By**: T4 (typecheck baseline)

  **References**:
  - `packages/domain/package.json` - build config
  - `packages/domain/src/index.ts` - main barrel
  - `packages/domain/src/rbac.ts` - RBAC helpers
  - `packages/domain/src/roles.ts` - Role definitions

  **Acceptance Criteria**:
  - [ ] `npm run typecheck -w @cermont/domain` exits 0
  - [ ] `npm run build -w @cermont/domain` exits 0
  - [ ] All 8 role strings exported correctly
  - [ ] RBAC helpers importable by backend and frontend

  **QA Scenarios**:

  ```
  Scenario: domain package typecheck and build pass
    Tool: Bash
    Steps:
      1. npm run typecheck -w @cermont/domain 2>&1
      2. npm run build -w @cermont/domain 2>&1
    Expected Result: Both exit 0
    Evidence: .sisyphus/evidence/task-10-build.txt
  ```

  **Commit**: YES (groups with T9, T11)
  - Message: `fix(domain): resolve typecheck and build errors`
  - Files: `packages/domain/`

- [ ] 11. **@cermont/config Build & Typecheck Fix**

  **What to do**:
  - Run `npm run typecheck -w @cermont/config` → capture errors
  - Run `npm run build -w @cermont/config` → capture errors
  - Verify config exports match what backend and frontend import
  - Check env validation schemas are consistent with T5 findings

  **Must NOT do**:
  - Do NOT put secrets or business logic in config package

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small package, focused fix
  - **Skills**: [`typescript-advanced-types`]
    - `typescript-advanced-types`: Export resolution

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T10)
  - **Parallel Group**: Wave 2 (with Tasks 9, 10)
  - **Blocks**: T14
  - **Blocked By**: T4, T5

  **References**:
  - `packages/config/package.json` - build config
  - `packages/config/src/index.ts` - main barrel

  **Acceptance Criteria**:
  - [ ] `npm run typecheck -w @cermont/config` exits 0
  - [ ] `npm run build -w @cermont/config` exits 0

  **QA Scenarios**:

  ```
  Scenario: config package typecheck and build pass
    Tool: Bash
    Steps:
      1. npm run typecheck -w @cermont/config 2>&1
      2. npm run build -w @cermont/config 2>&1
    Expected Result: Both exit 0
    Evidence: .sisyphus/evidence/task-11-build.txt
  ```

  **Commit**: YES (groups with T9, T10)
  - Message: `fix(config): resolve typecheck and build errors`
  - Files: `packages/config/`

- [ ] 12. **Contract Guard Verification (contracts:check)**

  **What to do**:
  - Run `npm run contracts:check` and capture output
  - Read `tooling/contracts/check-contract-guard.ts` to understand validation rules
  - Fix any contract mismatches: Zod schema vs API response shape
  - Verify `packages/shared-types/contracts/api-contract.snapshot.json` is up to date
  - If snapshot is stale, run `npm run contracts:snapshot:update`
  - Verify contract migrations in `contract-migrations.json` are documented

  **Must NOT do**:
  - Do NOT modify contract guard rules without understanding impact

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Contract validation and potential schema fixes
  - **Skills**: [`zod`, `typescript-advanced-types`]
    - `zod`: Schema validation patterns
    - `typescript-advanced-types`: Type alignment

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T9 shared-types build)
  - **Parallel Group**: Wave 2 sequential
  - **Blocks**: T13
  - **Blocked By**: T9

  **References**:
  - `tooling/contracts/check-contract-guard.ts` - Contract validation
  - `packages/shared-types/contracts/` - Snapshots and migrations

  **Acceptance Criteria**:
  - [ ] `npm run contracts:check` exits 0
  - [ ] All schema-to-response mismatches resolved
  - [ ] Snapshot updated if needed

  **QA Scenarios**:

  ```
  Scenario: Contract check passes
    Tool: Bash
    Steps:
      1. npm run contracts:check 2>&1
    Expected Result: Exit 0, no contract violations
    Evidence: .sisyphus/evidence/task-12-contracts-check.txt
  ```

  **Commit**: YES
  - Message: `fix(contracts): align schemas with API contract snapshot`
  - Files: `packages/shared-types/contracts/`, affected schemas

- [ ] 13. **Schema-Model Alignment Audit (Zod ↔ Mongoose)**

  **What to do**:
  - For each core entity, verify Zod schema in `@cermont/shared-types` matches Mongoose model in `backend/src/models/`
  - Key entities: User, Order, ServiceCase, Evidence, Invoice, Document, Proposal, AuditLog, Notification, WorkRequest
  - Check field name, type, required/optional, and enum consistency
  - Document mismatches found; fix where the intended design is clear
  - Flag ambiguous mismatches for manual review

  **Must NOT do**:
  - Do NOT change Mongoose model fields without updating Zod schema
  - Do NOT change Zod schema without checking impact on frontend forms

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Systematic cross-package alignment audit
  - **Skills**: [`zod`, `typescript-advanced-types`]
    - `zod`: Understanding Zod schema definitions
    - `typescript-advanced-types`: Type alignment between packages

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 sequential
  - **Blocks**: T14 (backend typecheck needs aligned schemas)
  - **Blocked By**: T9, T12

  **References**:
  - `packages/shared-types/src/schemas/` - All Zod schemas
  - `backend/src/models/` - All Mongoose models
  - `packages/shared-types/tests/schemas/` - Schema tests

  **Acceptance Criteria**:
  - [ ] All core entity schemas audited (min 10 entities)
  - [ ] Field name mismatches resolved or documented
  - [ ] Type mismatches fixed
  - [ ] Report saved to `.sisyphus/evidence/task-13-schema-model-audit.md`

  **QA Scenarios**:

  ```
  Scenario: Compare User Zod schema with Mongoose model
    Tool: Bash
    Steps:
      1. Search packages/shared-types/src/schemas/ for User-related Zod schema
      2. Read backend/src/models/User.ts for Mongoose fields
      3. Compare field names and types
    Expected Result: Core fields consistent (email, role, name, status etc.)
    Evidence: .sisyphus/evidence/task-13-user-alignment.txt
  ```

  **Commit**: YES
  - Message: `fix(schemas): align Zod schemas with Mongoose models`
  - Files: `packages/shared-types/src/schemas/`, `backend/src/models/` (if modified)

- [ ] 14. **Backend Typecheck Fix (tsc --noEmit)**

  **What to do**:
  - Run `npm run typecheck -w backend` using baseline from T4
  - Fix errors by category (priority order):
    - "Cannot find module" → fix import paths after DDD restructure
    - "Property does not exist on type" → align with schemas from T13
    - "Type X is not assignable to type Y" → fix type mismatches
    - "Parameter implicitly has 'any' type" → add explicit types
    - "Object is possibly undefined" → add type guards
  - Remove any `as any`, `@ts-ignore`, `@ts-expect-error` that can be properly typed
  - Ensure all new modules (DIAN, SLA, Dispatch, SystemConfig, AnalyticsReport) typecheck clean

  **Must NOT do**:
  - Do NOT add `as any` or `@ts-ignore` to silence errors
  - Do NOT remove strict type checks
  - Do NOT change shared-types schemas just to make backend compile

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex type resolution across many files post-restructure
  - **Skills**: [`typescript-advanced-types`, `zod`, `nodejs-backend-patterns`]
    - `typescript-advanced-types`: Complex type inference and generics
    - `zod`: Zod inference patterns
    - `nodejs-backend-patterns`: Express 5 async patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO (core dependency)
  - **Parallel Group**: Wave 3 start
  - **Blocks**: T16, T17, T18, T19, T20
  - **Blocked By**: T9, T10, T11, T13

  **References**:
  - `backend/tsconfig.json` - TypeScript configuration
  - `backend/src/modules/` - All module directories
  - `packages/shared-types/dist/` - Built types (must exist from T9)
  - Typecheck baseline from T4

  **Acceptance Criteria**:
  - [ ] `npm run typecheck -w backend` exits 0
  - [ ] 0 `as any` or `@ts-ignore` added
  - [ ] All new modules typecheck clean

  **QA Scenarios**:

  ```
  Scenario: Backend typecheck passes clean
    Tool: Bash
    Steps:
      1. npm run typecheck -w backend 2>&1
    Expected Result: Exit 0, no TypeScript errors
    Evidence: .sisyphus/evidence/task-14-typecheck.txt
  ```

  **Commit**: YES
  - Message: `fix(backend): resolve all TypeScript type errors`
  - Files: `backend/src/**/*.ts`
  - Pre-commit: `npm run typecheck -w backend`

- [ ] 15. **Backend Lint Fix (Biome)**

  **What to do**:
  - Using baseline from T3, run `npm run lint -w backend`
  - Auto-fix safe errors: `npx biome check --write backend/src/`
  - Manually fix remaining: unused imports, naming violations, complexity issues
  - Re-run lint to confirm 0 errors

  **Must NOT do**:
  - Do NOT disable lint rules
  - Do NOT use `// biome-ignore` without strong justification

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Mechanical lint fixes
  - **Skills**: [`bash-defensive-patterns`]
    - `bash-defensive-patterns`: Safe biome operations

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T16)
  - **Parallel Group**: Wave 3 (with Task 16)
  - **Blocks**: T17
  - **Blocked By**: T14, T3

  **Acceptance Criteria**:
  - [ ] `npm run lint -w backend` exits 0

  **QA Scenarios**:

  ```
  Scenario: Backend lint passes clean
    Tool: Bash
    Steps:
      1. npm run lint -w backend 2>&1
    Expected Result: Exit 0, "No errors found" or equivalent
    Evidence: .sisyphus/evidence/task-15-lint.txt
  ```

  **Commit**: YES
  - Message: `style(backend): fix all biome lint errors`
  - Files: `backend/src/**/*.ts`

- [ ] 16. **Backend Test Suite Fix (Vitest)**

  **What to do**:
  - Run `npm run test -w backend` and capture failures
  - For each failing test: check imports (DDD restructure), mock data (schema changes), service dependencies
  - Fix test logic if implementation changed; fix implementation if test reveals bug
  - Document any skipped tests with reason
  - Run until all pass

  **Must NOT do**:
  - Do NOT delete failing tests without understanding purpose
  - Do NOT change assertions to match broken code

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Test debugging across large suite
  - **Skills**: [`vitest`]
    - `vitest`: Vitest patterns, mocking, assertions

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T15)
  - **Parallel Group**: Wave 3 (with Task 15)
  - **Blocks**: T17
  - **Blocked By**: T14

  **References**:
  - `backend/vitest.config.ts` - Test configuration
  - `backend/tests/` - All test files

  **Acceptance Criteria**:
  - [ ] `npm run test -w backend` exits 0
  - [ ] 0 test failures
  - [ ] Skipped tests documented

  **QA Scenarios**:

  ```
  Scenario: All backend tests pass
    Tool: Bash
    Steps:
      1. npm run test -w backend 2>&1
    Expected Result: Exit 0, all tests pass
    Evidence: .sisyphus/evidence/task-16-tests.txt
  ```

  **Commit**: YES (groups with T15)
  - Message: `test(backend): fix all failing tests`
  - Files: `backend/tests/`, `backend/vitest.config.ts`

- [ ] 17. **Backend Build Fix (tsc → dist/)**

  **What to do**:
  - Run `npm run build -w backend` and capture errors
  - Fix build-specific issues not caught by `--noEmit`
  - Verify `dist/server.js` is produced
  - Test built server starts briefly: `node dist/server.js` (kill after 3s if starts OK)

  **Must NOT do**:
  - Do NOT skip type checking during build

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Build pipeline verification
  - **Skills**: [`nodejs-backend-patterns`]
    - `nodejs-backend-patterns`: Express server startup

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 end
  - **Blocks**: T21
  - **Blocked By**: T14, T15, T16

  **Acceptance Criteria**:
  - [ ] `npm run build -w backend` exits 0
  - [ ] `backend/dist/server.js` exists
  - [ ] Server starts without immediate crash

  **QA Scenarios**:

  ```
  Scenario: Backend builds and starts
    Tool: Bash (timeout: 10s)
    Steps:
      1. npm run build -w backend 2>&1
      2. Test-Path backend/dist/server.js
    Expected Result: Exit 0, dist/server.js exists
    Evidence: .sisyphus/evidence/task-17-build.txt
  ```

  **Commit**: YES
  - Message: `fix(backend): resolve build errors and verify dist output`
  - Files: `backend/tsconfig.json`, affected source files

- [ ] 18. **Module Route/Controller/Service Alignment Audit**

  **What to do**:
  - For each module in `backend/src/modules/`, verify MVC separation:
    - Routes: endpoint wiring + middleware binding only
    - Controllers: thin HTTP layer (req → service → res), no direct Mongoose
    - Services: business logic only, no req/res/next imports
  - Verify middleware order per route: authenticate → authorize(roles?) → validate → controller
  - Flag any `try/catch` in controllers (Express 5 handles natively)
  - Verify all routes are registered in `backend/src/index.ts`
  - Fix violations found

  **Must NOT do**:
  - Do NOT restructure module architecture beyond fixing violations
  - Do NOT change route URLs without updating frontend

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Systematic architecture audit
  - **Skills**: [`nodejs-backend-patterns`, `nodejs-express-server`]
    - `nodejs-backend-patterns`: MVC architecture patterns
    - `nodejs-express-server`: Express 5 route/middleware patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: T19, T20
  - **Blocked By**: T14

  **Acceptance Criteria**:
  - [ ] All modules have route/controller/service separation
  - [ ] 0 controllers calling Mongoose directly
  - [ ] 0 services importing req/res/next
  - [ ] All routes registered in index
  - [ ] Report saved to `.sisyphus/evidence/task-18-module-audit.md`

  **QA Scenarios**:

  ```
  Scenario: Verify services don't import Express types
    Tool: Bash
    Steps:
      1. grep -r "Request\|Response\|NextFunction" backend/src/modules/ --include="*.service.ts"
    Expected Result: No matches (services should not import Express types)
    Evidence: .sisyphus/evidence/task-18-service-clean.txt
  ```

  **Commit**: YES
  - Message: `fix(backend): align module architecture with MVC pattern`
  - Files: `backend/src/modules/`

- [ ] 19. **Middleware Chain Verification**

  **What to do**:
  - Verify auth middleware: JWT extraction from cookie, token verification, user attachment to req
  - Verify upload middleware: MIME whitelist, size limits, magic bytes validation
  - Verify idempotency middleware: `clientMutationId` deduplication
  - Verify rate limiter: MongoDB-backed, per-route scoping
  - Verify middleware order in all route files: authenticate → authorize → validate → controller
  - Run `backend/tests/security/` test suite

  **Must NOT do**:
  - Do NOT weaken security checks
  - Do NOT remove rate limiting

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Security-critical middleware verification
  - **Skills**: [`nodejs-express-server`, `nodejs-backend-patterns`]
    - `nodejs-express-server`: Express middleware patterns
    - `nodejs-backend-patterns`: Security middleware best practices

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: T31, T32
  - **Blocked By**: T14, T18

  **Acceptance Criteria**:
  - [ ] Auth middleware correctly extracts and verifies JWT
  - [ ] Upload middleware validates MIME, size, magic bytes
  - [ ] Idempotency prevents duplicate mutations
  - [ ] Rate limiter uses MongoDB store
  - [ ] Middleware order correct in all route files
  - [ ] Security tests pass

  **QA Scenarios**:

  ```
  Scenario: Unauthenticated request returns 401
    Tool: Bash (curl)
    Steps:
      1. curl -s -o nul -w "%{http_code}" http://127.0.0.1:4000/api/orders
    Expected Result: HTTP 401
    Evidence: .sisyphus/evidence/task-19-auth-reject.txt

  Scenario: Security test suite passes
    Tool: Bash
    Steps:
      1. npm run test -w backend -- tests/security/ 2>&1
    Expected Result: All security tests pass
    Evidence: .sisyphus/evidence/task-19-security-tests.txt
  ```

  **Commit**: YES
  - Message: `fix(backend): verify and harden middleware chain`
  - Files: `backend/src/middlewares/`, `backend/src/index.ts`

- [ ] 20. **New Modules Integration (DIAN, SLA, Dispatch, SystemConfig, AnalyticsReport)**

  **What to do**:
  - For each new module in backend: verify routes registered in index.ts, controller+service exist, Zod schemas in shared-types, tests pass
  - Verify background workers (reminder, outbox, SLA, token cleanup) register in `server.ts`
  - Check integration points with existing services (audit, workflow-gate)
  - Ensure new modules follow MVC pattern

  **Must NOT do**:
  - Do NOT remove existing module functionality
  - Do NOT change API contracts without updating frontend

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multi-module integration verification
  - **Skills**: [`nodejs-backend-patterns`, `zod`]
    - `nodejs-backend-patterns`: Service integration
    - `zod`: Schema validation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 end
  - **Blocks**: T21
  - **Blocked By**: T14, T18

  **Acceptance Criteria**:
  - [ ] All 5 new modules registered and functional
  - [ ] Module tests pass
  - [ ] Background workers boot without errors
  - [ ] Report saved to `.sisyphus/evidence/task-20-new-modules.md`

  **QA Scenarios**:

  ```
  Scenario: New module tests pass
    Tool: Bash
    Steps:
      1. npm run test -w backend -- tests/services/dian.service.test.ts tests/services/sla.service.test.ts tests/services/dispatch.service.test.ts tests/services/system-config.service.test.ts tests/services/analytics-report.service.test.ts 2>&1
    Expected Result: All test files pass
    Evidence: .sisyphus/evidence/task-20-module-tests.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): integrate new modules (DIAN, SLA, Dispatch, SystemConfig, Analytics)`
  - Files: `backend/src/index.ts`, `backend/src/modules/{dian,sla,dispatch,system-config,analytics-report}/`

- [ ] 21. **Frontend Typecheck Fix (tsc --noEmit)**

  **What to do**:
  - Run `npm run typecheck -w frontend` using baseline from T4
  - Fix errors by category:
    - "Cannot find module" → fix import paths (check deleted files from T8)
    - "Property does not exist on type" → align with shared-types
    - Next.js 16 async APIs: `cookies()`, `headers()`, `params`, `searchParams` must be awaited
    - Component prop mismatches → fix interface alignment
  - Remove any `as any`, `@ts-ignore`
  - Verify `proxy.ts` (recreated) typechecks correctly
  - Ensure all new frontend modules (audit, sla, dispatch, etc.) typecheck clean

  **Must NOT do**:
  - Do NOT add `as any` or `@ts-ignore`
  - Do NOT change shared-types to accommodate frontend shortcuts

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex type resolution across frontend with Next.js 16 specifics
  - **Skills**: [`typescript-advanced-types`, `vercel-react-best-practices`]
    - `typescript-advanced-types`: Complex type fixes
    - `vercel-react-best-practices`: Next.js 16 async API patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO (core dependency)
  - **Parallel Group**: Wave 4 start
  - **Blocks**: T23, T24, T25, T26, T27, T28
  - **Blocked By**: T17, T20

  **References**:
  - `frontend/tsconfig.json` - TypeScript configuration
  - `frontend/src/` - All frontend source
  - Next.js 16 async APIs (Ley 10 in AGENTS.md)
  - Typecheck baseline from T4

  **Acceptance Criteria**:
  - [ ] `npm run typecheck -w frontend` exits 0
  - [ ] 0 `as any` or `@ts-ignore` added
  - [ ] proxy.ts typechecks clean
  - [ ] All async cookies/headers/params/searchParams properly awaited

  **QA Scenarios**:

  ```
  Scenario: Frontend typecheck passes clean
    Tool: Bash
    Steps:
      1. npm run typecheck -w frontend 2>&1
    Expected Result: Exit 0, no TypeScript errors
    Evidence: .sisyphus/evidence/task-21-typecheck.txt
  ```

  **Commit**: YES
  - Message: `fix(frontend): resolve all TypeScript type errors`
  - Files: `frontend/src/**/*.ts`, `frontend/src/**/*.tsx`
  - Pre-commit: `npm run typecheck -w frontend`

- [ ] 22. **Frontend Lint Fix (Biome)**

  **What to do**:
  - Run `npm run lint -w frontend` using baseline from T3
  - Auto-fix safe errors: `npx biome check --write frontend/src/`
  - Manually fix remaining issues
  - Re-run to confirm 0 errors

  **Must NOT do**:
  - Do NOT disable lint rules

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Mechanical lint fixes
  - **Skills**: [`bash-defensive-patterns`]
    - `bash-defensive-patterns`: Safe biome operations

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T23)
  - **Parallel Group**: Wave 4 (with Task 23)
  - **Blocks**: T24
  - **Blocked By**: T21, T3

  **Acceptance Criteria**:
  - [ ] `npm run lint -w frontend` exits 0

  **QA Scenarios**:

  ```
  Scenario: Frontend lint passes clean
    Tool: Bash
    Steps:
      1. npm run lint -w frontend 2>&1
    Expected Result: Exit 0, no errors
    Evidence: .sisyphus/evidence/task-22-lint.txt
  ```

  **Commit**: YES
  - Message: `style(frontend): fix all biome lint errors`
  - Files: `frontend/src/**/*.{ts,tsx}`

- [ ] 23. **Frontend Test Suite Fix (Vitest)**

  **What to do**:
  - Run `npm run test -w frontend` and capture failures
  - Fix: import path changes, mock data alignment, component test assertions
  - Run until all pass

  **Must NOT do**:
  - Do NOT delete tests without understanding purpose

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Test debugging across frontend suite
  - **Skills**: [`vitest`, `vercel-react-best-practices`]
    - `vitest`: Vitest patterns
    - `vercel-react-best-practices`: React testing patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T22)
  - **Parallel Group**: Wave 4 (with Task 22)
  - **Blocks**: T24
  - **Blocked By**: T21

  **Acceptance Criteria**:
  - [ ] `npm run test -w frontend` exits 0

  **QA Scenarios**:

  ```
  Scenario: All frontend tests pass
    Tool: Bash
    Steps:
      1. npm run test -w frontend 2>&1
    Expected Result: Exit 0, all tests pass
    Evidence: .sisyphus/evidence/task-23-tests.txt
  ```

  **Commit**: YES (groups with T22)
  - Message: `test(frontend): fix all failing tests`
  - Files: `frontend/tests/`, `frontend/vitest.config.ts`

- [ ] 24. **Frontend Build Fix (next build)**

  **What to do**:
  - Run `npm run build -w frontend` and capture errors
  - Fix: Next.js build errors, static generation issues, Turbopack-specific issues
  - Verify `.next/` output directory is produced
  - Check for build warnings about large bundles, missing Suspense, etc.
  - Run `npx react-doctor --verbose` after build

  **Must NOT do**:
  - Do NOT disable strict mode or type checking during build

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Next.js build pipeline debugging
  - **Skills**: [`vercel-react-best-practices`, `vite`]
    - `vercel-react-best-practices`: Next.js build optimization
    - `vite`: Turbopack understanding

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 end
  - **Blocks**: T25-T28, T29-T34
  - **Blocked By**: T21, T22, T23

  **Acceptance Criteria**:
  - [ ] `npm run build -w frontend` exits 0
  - [ ] `.next/` directory produced
  - [ ] `npx react-doctor` shows no critical issues

  **QA Scenarios**:

  ```
  Scenario: Frontend builds successfully
    Tool: Bash (timeout: 120s)
    Steps:
      1. npm run build -w frontend 2>&1
      2. Test-Path frontend/.next
    Expected Result: Exit 0, .next/ directory exists
    Evidence: .sisyphus/evidence/task-24-build.txt
  ```

  **Commit**: YES
  - Message: `fix(frontend): resolve build errors`
  - Files: `frontend/src/`, `frontend/next.config.ts`

- [ ] 25. **Route Map Verification (0 orphan routes, 0 404s)**

  **What to do**:
  - Compare `docs/architecture/FRONTEND_ROUTE_MAP.md` against actual `frontend/src/app/` pages
  - List all `page.tsx` files and map to routes
  - Check sidebar navigation (`modules/core/navigation.ts`) for routes pointing to non-existent pages
  - Check `lib/routes.ts` centralized route config
  - Flag any route in sidebar that 404s
  - Verify `proxy.ts` allows correct public paths and protects authenticated routes
  - Fix any mismatches

  **Must NOT do**:
  - Do NOT add mock/empty pages just to fill routes
  - Do NOT remove routes from sidebar without checking if they're needed

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Route mapping and navigation verification
  - **Skills**: [`vercel-react-best-practices`]
    - `vercel-react-best-practices`: Next.js App Router patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T26, T27, T28)
  - **Parallel Group**: Wave 4 (with Tasks 26, 27, 28)
  - **Blocks**: F3
  - **Blocked By**: T21, T24

  **References**:
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` - Canonical route map
  - `frontend/src/app/` - Actual pages
  - `frontend/src/modules/core/navigation.ts` - Sidebar config
  - `frontend/src/lib/routes.ts` - Route definitions
  - `frontend/proxy.ts` - Auth perimeter

  **Acceptance Criteria**:
  - [ ] All sidebar routes have working pages
  - [ ] 0 sidebar routes pointing to 404
  - [ ] proxy.ts public paths cover all unauthenticated routes
  - [ ] Report saved to `.sisyphus/evidence/task-25-route-map.md`

  **QA Scenarios**:

  ```
  Scenario: Count and list all page.tsx routes
    Tool: Bash
    Steps:
      1. Get-ChildItem -Path frontend/src/app -Recurse -Filter "page.tsx" | ForEach-Object { $_.FullName -replace ".*frontend/src/app","" -replace "\\page.tsx","" -replace "\\","/" }
    Expected Result: Complete list of all frontend routes
    Evidence: .sisyphus/evidence/task-25-routes-list.txt
  ```

  **Commit**: YES
  - Message: `fix(frontend): align route map with actual pages`
  - Files: `frontend/src/modules/core/navigation.ts`, `frontend/src/lib/routes.ts`, `docs/architecture/FRONTEND_ROUTE_MAP.md`

- [ ] 26. **UI States Audit (loading/error/empty/offline/forbidden)**

  **What to do**:
  - For each page under `frontend/src/app/(dashboard)/`, verify:
    - Loading state: skeleton or spinner, not blank page
    - Error state: error card with message and retry
    - Empty state: illustration with CTA
    - Offline state: banner visible when network disabled (field pages)
    - Forbidden state: "No permission" card (RBAC pages)
  - Check that `EmptyState`, `ModuleErrorPage`, `OfflineBanner` components are used consistently
  - Verify `frontend/src/core/ui/EmptyState.tsx` is the canonical component (old path deleted in T8)
  - Document pages missing states

  **Must NOT do**:
  - Do NOT rewrite page logic; add missing state wrappers
  - Do NOT remove existing state handling

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI state verification across pages
  - **Skills**: [`vercel-react-best-practices`, `playwright-best-practices`]
    - `vercel-react-best-practices`: React state patterns
    - `playwright-best-practices`: Browser-based state verification

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T25, T27, T28)
  - **Parallel Group**: Wave 4 (with Tasks 25, 27, 28)
  - **Blocks**: F3
  - **Blocked By**: T21, T24

  **Acceptance Criteria**:
  - [ ] All dashboard pages have loading and error states
  - [ ] Empty states present where applicable
  - [ ] Offline banner integrated in field pages
  - [ ] Report saved to `.sisyphus/evidence/task-26-ui-states.md`

  **QA Scenarios**:

  ```
  Scenario: Verify EmptyState component exists at canonical path
    Tool: Bash
    Steps:
      1. Test-Path frontend/src/core/ui/EmptyState.tsx
      2. Get-Content frontend/src/core/ui/EmptyState.tsx | Select-Object -First 15
    Expected Result: File exists and exports EmptyState component
    Evidence: .sisyphus/evidence/task-26-emptystate.txt

  Scenario: Verify SyncBanner/OfflineBanner integration
    Tool: Bash
    Steps:
      1. grep -r "OfflineBanner\|SyncBanner" frontend/src/app/ --include="*.tsx" -l
    Expected Result: OfflineBanner used in layout or field-related pages
    Evidence: .sisyphus/evidence/task-26-offline-banner.txt
  ```

  **Commit**: YES
  - Message: `fix(frontend): ensure all pages have loading/error/empty/offline states`
  - Files: `frontend/src/app/(dashboard)/`, `frontend/src/core/ui/`

- [ ] 27. **Dark/Light Theme Consistency Audit**

  **What to do**:
  - Verify `ThemeToggle` component (`frontend/src/core/ui/ThemeToggle.tsx`) is functional
  - Check that all pages respect theme (no hardcoded white backgrounds in dark mode)
  - Verify CSS variables / Tailwind tokens for colors, not hardcoded hex values
  - Check contrast ratios in both themes (WCAG AA minimum)
  - Verify Cermont blue (#2154A6) and green (#4CAF50) used correctly per UI guide
  - Test theme toggle persists across page navigation
  - Document any pages with theme inconsistencies

  **Must NOT do**:
  - Do NOT create a second design system
  - Do NOT change the Cermont blue/green palette
  - Do NOT remove ThemeToggle functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Visual consistency across themes
  - **Skills**: [`tailwind-css-patterns`, `accessibility`]
    - `tailwind-css-patterns`: Tailwind dark mode patterns
    - `accessibility`: Contrast ratio verification

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T25, T26, T28)
  - **Parallel Group**: Wave 4 (with Tasks 25, 26, 28)
  - **Blocks**: F3
  - **Blocked By**: T21, T24

  **References**:
  - `docs/design/CERMONT_UIUX_GUIDE.md` - Design system guide
  - `frontend/src/core/ui/ThemeToggle.tsx` - Theme toggle component
  - `frontend/src/app/layout.tsx` - Root layout with theme provider

  **Acceptance Criteria**:
  - [ ] ThemeToggle switches between light and dark
  - [ ] All pages legible in both themes
  - [ ] Cermont blue/green used consistently
  - [ ] Report saved to `.sisyphus/evidence/task-27-theme-audit.md`

  **QA Scenarios**:

  ```
  Scenario: ThemeToggle component exists and is used in layout
    Tool: Bash
    Steps:
      1. Test-Path frontend/src/core/ui/ThemeToggle.tsx
      2. grep -r "ThemeToggle" frontend/src/app/layout.tsx
    Expected Result: ThemeToggle exists and is mounted in root layout
    Evidence: .sisyphus/evidence/task-27-theme-toggle.txt

  Scenario: Check for hardcoded colors in components
    Tool: Bash
    Steps:
      1. grep -rn "#[0-9a-fA-F]\{6\}" frontend/src/modules/ --include="*.tsx" | Select-Object -First 20
    Expected Result: Minimal hardcoded colors; most should use Tailwind classes or CSS variables
    Evidence: .sisyphus/evidence/task-27-hardcoded-colors.txt
  ```

  **Commit**: YES
  - Message: `fix(frontend): ensure dark/light theme consistency across all pages`
  - Files: `frontend/src/`

- [ ] 28. **Accessibility Baseline Audit (WCAG AA)**

  **What to do**:
  - Run accessibility audit on key pages (login, dashboard, orders list, order detail, evidences)
  - Verify: inputs have labels, buttons have text/aria-label, focus visible, keyboard navigation works
  - Check color contrast meets WCAG AA minimum
  - Verify modals have focus traps and Escape to close
  - Check `prefers-reduced-motion` is respected
  - Document issues found

  **Must NOT do**:
  - Do NOT remove existing accessibility features

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Accessibility audit
  - **Skills**: [`accessibility`, `playwright-best-practices`]
    - `accessibility`: WCAG 2.2 guidelines
    - `playwright-best-practices`: Automated a11y testing

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T25, T26, T27)
  - **Parallel Group**: Wave 4 (with Tasks 25, 26, 27)
  - **Blocks**: F3
  - **Blocked By**: T21, T24

  **References**:
  - `frontend/src/core/ui/` - Shared UI components
  - `docs/design/CERMONT_UIUX_GUIDE.md` - Accessibility section
  - `frontend/AGENTS.md` - "Accessibility (Non-Negotiable)" section

  **Acceptance Criteria**:
  - [ ] All inputs on key pages have labels
  - [ ] All buttons have accessible names
  - [ ] Focus rings visible (Cermont green)
  - [ ] Color contrast meets AA minimum
  - [ ] Report saved to `.sisyphus/evidence/task-28-a11y-audit.md`

  **QA Scenarios**:

  ```
  Scenario: Check for inputs without labels
    Tool: Bash
    Steps:
      1. grep -rn "<input" frontend/src/modules/ --include="*.tsx" | Select-Object -First 30
    Expected Result: Inputs should have associated labels or aria-label
    Evidence: .sisyphus/evidence/task-28-input-labels.txt
  ```

  **Commit**: YES
  - Message: `fix(frontend): address accessibility issues on key pages`
  - Files: `frontend/src/modules/`, `frontend/src/core/ui/`

- [ ] 29. **Docker Configuration Validation & Fix**

  **What to do**:
  - Read all Docker files: `docker/` directory, root `docker-compose.yml`, `docker-compose.dev.yml`
  - Verify Dockerfile for backend: Node.js 22 base, proper build steps, health check
  - Verify Dockerfile for frontend: Next.js production build, proper port exposure
  - Check MongoDB service configuration in compose: port 27017, volume for persistence
  - Verify `docker:up`, `docker:down`, `docker:reset` scripts work correctly
  - Check `.dockerignore` covers node_modules, .next, dist, uploads
  - Run `docker compose up --build -d` and verify containers start healthy
  - Verify backend health endpoints: `/api/health/live` and `/api/health/ready`

  **Must NOT do**:
  - Do NOT change Docker to use different database (keep MongoDB)
  - Do NOT remove volumes (data persistence)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Docker configuration and testing
  - **Skills**: [`nodejs-backend-patterns`]
    - `nodejs-backend-patterns`: Server health check patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T30)
  - **Parallel Group**: Wave 5 (with Tasks 30, 31, 32, 33, 34)
  - **Blocks**: F1-F4
  - **Blocked By**: T24

  **References**:
  - `docker/` - Dockerfiles
  - `docker-compose.yml` - Production compose
  - `docker-compose.dev.yml` - Development compose
  - `.dockerignore` - Build exclusions
  - `package.json:53-57` - Docker scripts

  **Acceptance Criteria**:
  - [ ] `docker compose up --build -d` succeeds
  - [ ] Backend container responds on port 4000
  - [ ] MongoDB container responds on port 27017
  - [ ] Health checks return 200
  - [ ] `docker compose down` cleans up correctly

  **QA Scenarios**:

  ```
  Scenario: Docker compose starts all services
    Tool: Bash (timeout: 120s)
    Steps:
      1. docker compose up --build -d 2>&1
      2. Start-Sleep -Seconds 10
      3. docker compose ps
    Expected Result: All services show "healthy" or "running"
    Evidence: .sisyphus/evidence/task-29-docker-ps.txt

  Scenario: Health endpoints respond
    Tool: Bash
    Preconditions: Docker containers running
    Steps:
      1. curl -s http://127.0.0.1:4000/api/health/live
      2. curl -s http://127.0.0.1:4000/api/health/ready
    Expected Result: Both return 200 with JSON success response
    Evidence: .sisyphus/evidence/task-29-health-check.txt
  ```

  **Commit**: YES
  - Message: `fix(deploy): validate and fix Docker configuration`
  - Files: `docker/`, `docker-compose.yml`, `docker-compose.dev.yml`, `.dockerignore`

- [ ] 30. **PM2 Ecosystem Config Validation**

  **What to do**:
  - Read `ecosystem.config.cjs` — verify app name, script path, env vars, instances
  - Verify PM2 config references correct `dist/` paths (not source paths)
  - Check `deploy:pm2:*` scripts in root `package.json`
  - Ensure PM2 config includes proper `error_file` and `out_file` log paths
  - Verify `NODE_ENV=production` is set in PM2 env
  - Document PM2 startup sequence for VPS deployment

  **Must NOT do**:
  - Do NOT remove PM2 config (required for VPS deploy)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration file verification
  - **Skills**: [`bash-defensive-patterns`]
    - `bash-defensive-patterns`: Safe PM2 operations

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T29, T31, T32, T33, T34)
  - **Parallel Group**: Wave 5
  - **Blocks**: F1-F4
  - **Blocked By**: T24

  **References**:
  - `ecosystem.config.cjs` - PM2 configuration
  - `package.json:61-66` - PM2 deploy scripts

  **Acceptance Criteria**:
  - [ ] ecosystem.config.cjs is valid CommonJS
  - [ ] Script paths reference dist/ correctly
  - [ ] PM2 scripts documented for deployment

  **QA Scenarios**:

  ```
  Scenario: PM2 config is parseable
    Tool: Bash
    Steps:
      1. node -e "const c = require('./ecosystem.config.cjs'); console.log('apps:', c.apps.length)"
    Expected Result: Outputs number of apps without crashing
    Evidence: .sisyphus/evidence/task-30-pm2-config.txt
  ```

  **Commit**: YES
  - Message: `fix(deploy): validate PM2 ecosystem configuration`
  - Files: `ecosystem.config.cjs`

- [ ] 31. **CORS + Helmet + Rate Limiting Verification**

  **What to do**:
  - Verify CORS configuration in backend allows only `FRONTEND_URL` origin
  - Verify Helmet headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
  - Verify rate limiting: 20 req/15min on `/api/auth`, 100 req/min global
  - Test CORS rejection: request from different origin should be blocked
  - Test rate limiting: rapid requests should return 429
  - Verify security headers present in response
  - Run `backend/tests/security/http-hardening.test.ts`

  **Must NOT do**:
  - Do NOT disable CORS or rate limiting
  - Do NOT weaken CSP

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Security configuration verification
  - **Skills**: [`nodejs-express-server`]
    - `nodejs-express-server`: Express security middleware

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T29, T30, T32, T33, T34)
  - **Parallel Group**: Wave 5
  - **Blocks**: F2
  - **Blocked By**: T19

  **Acceptance Criteria**:
  - [ ] CORS blocks non-whitelisted origins
  - [ ] Security headers present (CSP, HSTS, X-Frame-Options, etc.)
  - [ ] Rate limiting returns 429 on excess
  - [ ] HTTP hardening tests pass

  **QA Scenarios**:

  ```
  Scenario: CORS blocks unauthorized origin
    Tool: Bash (curl)
    Steps:
      1. curl -s -H "Origin: https://evil.com" -o nul -w "%{http_code}" http://127.0.0.1:4000/api/health/live
    Expected Result: Response does not include Access-Control-Allow-Origin for evil.com
    Evidence: .sisyphus/evidence/task-31-cors.txt

  Scenario: Security headers present
    Tool: Bash (curl)
    Steps:
      1. curl -sI http://127.0.0.1:4000/api/health/live | Select-String -Pattern "X-|Content-Security|Strict-Transport"
    Expected Result: Multiple security headers visible
    Evidence: .sisyphus/evidence/task-31-headers.txt
  ```

  **Commit**: YES
  - Message: `fix(security): verify CORS, Helmet, and rate limiting configuration`
  - Files: `backend/src/index.ts`, `backend/src/common/security/`

- [ ] 32. **JWT Auth Flow E2E Verification**

  **What to do**:
  - Test complete auth flow via curl (or Playwright):
    - POST `/api/auth/login` with valid credentials → receive HttpOnly cookie + access token
    - GET `/api/auth/me` with cookie → return user profile
    - POST `/api/auth/refresh` with cookie → receive new access token
    - POST `/api/auth/logout` → clear cookie
  - Verify access token is short-lived (15 min or less)
  - Verify refresh token is HttpOnly + Secure + SameSite
  - Test invalid credentials → 401
  - Test expired token → 401 with refresh flow
  - Test accessing protected route without token → 401
  - Verify frontend auth store (`auth.store.ts`) correctly handles token lifecycle

  **Must NOT do**:
  - Do NOT change auth mechanism (JWT + cookies)
  - Do NOT disable HttpOnly on cookies

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Security-critical auth flow verification
  - **Skills**: [`nodejs-express-server`]
    - `nodejs-express-server`: Express auth patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T29, T30, T31, T33, T34)
  - **Parallel Group**: Wave 5
  - **Blocks**: F3
  - **Blocked By**: T19

  **References**:
  - `backend/src/modules/auth/` - Auth routes, controller, service
  - `frontend/src/store/auth.store.ts` - Auth state management
  - `frontend/src/app/api/auth/login/route.ts` - Next.js auth proxy
  - `AGENTS.md` Ley 3 - proxy.ts as security perimeter

  **Acceptance Criteria**:
  - [ ] Login returns HttpOnly cookie + access token
  - [ ] /auth/me returns user profile when authenticated
  - [ ] Invalid credentials return 401
  - [ ] Protected routes reject unauthenticated requests
  - [ ] Logout clears cookie

  **QA Scenarios**:

  ```
  Scenario: Login with valid credentials returns tokens
    Tool: Bash (curl)
    Steps:
      1. curl -s -X POST http://127.0.0.1:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cermont.com","password":"Admin123!"}' -c cookies.txt -w "\nHTTP %{http_code}"
    Expected Result: HTTP 200, response contains user data
    Evidence: .sisyphus/evidence/task-32-login-success.txt

  Scenario: Login with invalid credentials returns 401
    Tool: Bash (curl)
    Steps:
      1. curl -s -X POST http://127.0.0.1:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cermont.com","password":"wrong"}' -w "\nHTTP %{http_code}"
    Expected Result: HTTP 401, error message
    Evidence: .sisyphus/evidence/task-32-login-fail.txt

  Scenario: Access protected route without auth returns 401
    Tool: Bash (curl)
    Steps:
      1. curl -s -o nul -w "%{http_code}" http://127.0.0.1:4000/api/orders
    Expected Result: HTTP 401
    Evidence: .sisyphus/evidence/task-32-unauthorized.txt
  ```

  **Commit**: YES
  - Message: `fix(auth): verify and harden JWT auth flow`
  - Files: `backend/src/modules/auth/`, `backend/src/middlewares/auth.middleware.ts`

- [ ] 33. **Health Checks Configuration (live + ready)**

  **What to do**:
  - Verify `/api/health/live` endpoint: returns 200 if server is running (no DB dependency)
  - Verify `/api/health/ready` endpoint: returns 200 if MongoDB is connected
  - Check health routes are registered without authentication (public)
  - Verify health check tests: `backend/tests/common/health-routes.test.ts`
  - Verify Docker healthcheck uses appropriate endpoint
  - Test that `/api/health/ready` returns 503 when MongoDB is down

  **Must NOT do**:
  - Do NOT require authentication on health endpoints
  - Do NOT combine live and ready into single check

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Health endpoint verification
  - **Skills**: [`nodejs-backend-patterns`]
    - `nodejs-backend-patterns`: Health check patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T29, T30, T31, T32, T34)
  - **Parallel Group**: Wave 5
  - **Blocks**: F2
  - **Blocked By**: T29

  **Acceptance Criteria**:
  - [ ] `/api/health/live` returns 200 without auth
  - [ ] `/api/health/ready` returns 200 when MongoDB connected
  - [ ] Health routes in proxy.ts public paths

  **QA Scenarios**:

  ```
  Scenario: Live health check returns 200
    Tool: Bash (curl)
    Steps:
      1. curl -s http://127.0.0.1:4000/api/health/live | ConvertFrom-Json | Select-Object success
    Expected Result: success: true
    Evidence: .sisyphus/evidence/task-33-live.txt

  Scenario: Ready health check returns 200
    Tool: Bash (curl)
    Steps:
      1. curl -s http://127.0.0.1:4000/api/health/ready | ConvertFrom-Json
    Expected Result: success: true, includes database status
    Evidence: .sisyphus/evidence/task-33-ready.txt
  ```

  **Commit**: YES
  - Message: `fix(health): configure live and ready health check endpoints`
  - Files: `backend/src/` (health routes)

- [ ] 34. **Production Env Vars & Secrets Validation**

  **What to do**:
  - Create production `.env` template (or verify `.env.example` is production-ready)
  - Verify all required env vars: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `NEXTAUTH_SECRET`
  - Verify secrets are NOT in source code or committed files
  - Check `backend/src/config/env.ts` validates all required vars on startup
  - Verify `dotenv` is configured to NOT override existing env vars in production
  - Verify `npm run ci:secrets` or equivalent check exists
  - Document which vars are required vs optional
  - Verify production MongoDB URI uses authentication (if applicable)

  **Must NOT do**:
  - Do NOT commit actual secrets or .env files
  - Do NOT log env var values

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Environment configuration audit
  - **Skills**: [`zod`]
    - `zod`: Env schema validation

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T29-T33)
  - **Parallel Group**: Wave 5
  - **Blocks**: F2
  - **Blocked By**: T29

  **Acceptance Criteria**:
  - [ ] All required env vars documented
  - [ ] Env validation fails fast on startup if vars missing
  - [ ] No secrets in committed files
  - [ ] Production env template created

  **QA Scenarios**:

  ```
  Scenario: Backend fails to start with missing JWT_SECRET
    Tool: Bash
    Steps:
      1. $env:JWT_SECRET=''; node -e "require('./backend/dist/server.js')" 2>&1 | Select-Object -First 5
    Expected Result: Error message about missing JWT_SECRET
    Evidence: .sisyphus/evidence/task-34-missing-secret.txt

  Scenario: Verify no .env in git tracked files
    Tool: Bash
    Steps:
      1. git ls-files | Select-String "\.env$"
    Expected Result: Only .env.example, no actual .env files
    Evidence: .sisyphus/evidence/task-34-no-env-committed.txt
  ```

  **Commit**: YES
  - Message: `chore(config): validate production environment variables`
  - Files: `.env.example`, `backend/src/config/env.ts`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Full Verify Pipeline Execution** — `unspecified-high`
  Run complete verification pipeline: `npm run verify`. If any step fails, document exact errors. Run `npm run quality:strict`. Run `npx react-doctor --verbose`. Run `npm run contracts:check`.
  Output: `typecheck [PASS/FAIL] | lint [PASS/FAIL] | test [PASS/FAIL] | build [PASS/FAIL] | verify [PASS/FAIL] | doctor [PASS/FAIL] | contracts [PASS/FAIL] | VERDICT`

- [ ] F3. **E2E Smoke Tests** — `unspecified-high` (+ `playwright` skill)
  From clean state: login flow, navigate all sidebar routes, verify each page loads without console errors. Test critical paths: create work request → view order → upload evidence. Test offline banner appears when network disabled.
  Output: `Login [PASS/FAIL] | Routes [N/N working] | Critical Paths [N/N] | Console Errors [N] | VERDICT`

- [ ] F4. **react-doctor + Quality Final** — `unspecified-high`
  Run `npx react-doctor --verbose` and `npm run quality:strict`. Verify 0 critical issues. Check for AI slop patterns, unused imports, dead code.
  Output: `react-doctor issues [N] | quality:strict [PASS/FAIL] | Slop patterns [N] | VERDICT`

---

## Commit Strategy

- **T1**: `chore(git): stabilize working tree state` - package-lock.json, .gitignore
- **T3-T4**: `chore(config): align biome and typescript configs across workspaces` - biome.json, tsconfig.json files
- **T5**: `fix(config): validate and fix environment variable schemas` - packages/config/, .env files
- **T9-T11**: `fix(shared): resolve typecheck and build errors in shared packages` - packages/
- **T14-T17**: `fix(backend): resolve typecheck, lint, test, and build errors` - backend/
- **T18-T20**: `fix(backend): align modules and integrate new services` - backend/src/modules/
- **T21-T24**: `fix(frontend): resolve typecheck, lint, test, and build errors` - frontend/
- **T25-T28**: `fix(frontend): audit routes, UI states, theme, and accessibility` - frontend/src/
- **T29-T34**: `feat(deploy): configure docker, pm2, and production security` - docker/, ecosystem.config.cjs
- **F1-F4**: `chore(verify): final quality gates and documentation update` - docs/

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck        # Expected: 0 errors in all workspaces
npm run lint             # Expected: 0 errors in all workspaces
npm run test             # Expected: all test suites passing
npm run build            # Expected: all builds successful
npm run verify           # Expected: complete pipeline success
npm run contracts:check  # Expected: all contracts valid
npm run quality:strict   # Expected: all quality checks pass
npx react-doctor --verbose  # Expected: 0 critical issues
docker compose up --build -d  # Expected: all containers healthy
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass (backend + frontend + shared-types)
- [ ] TypeScript 0 errors across all workspaces
- [ ] Biome lint 0 errors across all workspaces
- [ ] Build artifacts generated correctly
- [ ] `npm run verify` exits with code 0
- [ ] Docker compose functional
- [ ] Auth flow E2E verified
- [ ] RBAC enforced on all protected routes
- [ ] Documentation matches implementation
- [ ] No `any`, `unknown`, `null`, `undefined` introduced
- [ ] No hardcoded roles, routes, or permissions
