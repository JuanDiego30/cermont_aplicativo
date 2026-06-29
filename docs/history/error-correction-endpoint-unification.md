# Plan de Corrección de Errores HTTP y Unificación de Endpoints — Cermont S.A.S.

## TL;DR

> **Resumen**: Auditoría y corrección completa de errores HTTP (404, 401, 500, 403) en la aplicación Cermont. Se identificó que la documentación (API_ENDPOINT_MATRIX.md, FRONTEND_ROUTE_MAP.md) está **significativamente desactualizada** — reporta 58 endpoints como "REQUIRED_NOT_IMPLEMENTED" cuando en realidad la mayoría YA están implementados en el backend modular. El plan unifica rutas, endurece el manejo de errores, sincroniza la documentación, y garantiza que los 7 workspaces funcionen correctamente.
>
> **Entregables**:
> - Documentación actualizada (API_ENDPOINT_MATRIX, FRONTEND_ROUTE_MAP)
> - Endurecimiento del error handler (unhandledRejection, Mongoose errors)
> - Error boundaries faltantes agregadas al frontend
> - Verificación de todas las rutas frontend ↔ backend
> - Workspace configuration audit y fix
> - Tests de escenarios de error
>
> **Esfuerzo**: Medium-Large (8-12 horas de ejecución en paralelo)
> **Ejecución en Paralelo**: SÍ — 4 Waves, máximo 6 tareas simultáneas
> **Ruta Crítica**: T1 → T3 → T7 → T11 → T14 → F1-F4

---

## Context

### Petición Original
Corregir todos los errores 404, 401, 500 y otros que tenga el aplicativo Cermont. Unir endpoints y asegurar que todos los workspaces funcionen correctamente.

### Hallazgos de la Auditoría

**Backend (52 route mounts):**
- La infraestructura de manejo de errores es **sólida**: AppError hierarchy (12 tipos), errorHandler centralizado, ERROR_CODES registry (30+ códigos), helpers de respuesta, retry logic en frontend con token refresh, rate limiting con MongoDB store, propagación de requestId.
- El backend usa módulos por feature (`backend/src/modules/`) y NO la estructura plana que describe la documentación.
- La gran mayoría de endpoints documentados como "REQUIRED_NOT_IMPLEMENTED" YA existen y funcionan.

**Documentación desactualizada:**
- API_ENDPOINT_MATRIX.md: reporta 40 implementados / 58 required / 2 optional — REAL: ~90+ implementados
- FRONTEND_ROUTE_MAP.md: reporta 18 implementados / 25 required / 4 optional — REAL: ~35+ implementados
- Muchas rutas frontend existen con error.tsx, loading.tsx, page.tsx

**Áreas de mejora identificadas:**
1. `unhandledRejection` en server.ts hace `process.exit(1)` — muy agresivo
2. Algunas rutas frontend sin error.tsx boundary
3. Algunas convenciones de ruta difieren entre frontend y backend
4. Posibles race conditions en token refresh
5. Errores de Mongoose pueden aparecer como 500 en vez de 400

---

## Work Objectives

### Core Objective
Eliminar errores HTTP en producción identificando y corrigiendo todas las discrepancias entre frontend y backend, endureciendo el manejo de errores, y sincronizando la documentación.

### Concrete Deliverables
- API_ENDPOINT_MATRIX.md actualizado con estado real (52 mounts documentados)
- FRONTEND_ROUTE_MAP.md actualizado con rutas reales
- Error handler endurecido (unhandledRejection graceful, Mongoose errors → 400)
- Error boundaries agregadas a rutas frontend críticas sin ellas
- Pruebas de escenarios de error (404, 401, 500) para cada módulo
- Todos los workspaces pasan typecheck, lint, build, test

### Must Have
- Sincronizar documentación con la realidad del código
- Endurecer errorHandler para cubrir edge cases (Mongoose, unhandledRejection)
- Verificar que cada llamada frontend tenga su ruta backend correspondiente
- Agregar error boundaries faltantes en frontend
- No romper funcionalidad existente

### Must NOT Have (Guardrails)
- No implementar nuevas features (solo corregir errores)
- No eliminar endpoints legacy sin plan de migración
- No cambiar arquitectura (mantener módulos actuales)
- No tocar lógica de negocio en services
- No modificar schemas de MongoDB
- No cambiar response envelope existente

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest backend + frontend, Playwright E2E)
- **Automated tests**: YES (tests-after)
- **Framework**: Vitest + Playwright

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Backend**: Use curl to verify endpoint responses (status codes, error formats)
- **Frontend**: Use Playwright to verify error pages render correctly
- **Integration**: Verify frontend→backend→MongoDB flow

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — 5 tasks, MAX PARALLEL):
├── T1: Run current quality gates (baseline) [quick]
├── T2: Update API_ENDPOINT_MATRIX.md (52 mounts) [unspecified-high]
├── T3: Update FRONTEND_ROUTE_MAP.md [unspecified-high]
├── T4: Audit all frontend API calls vs backend routes [unspecified-high]
└── T5: Audit workspace configuration (package.json, tsconfig, turbo) [quick]

Wave 2 (Error Hardening — 5 tasks, MAX PARALLEL):
├── T6: Harden errorHandler — Mongoose errors, unhandledRejection [deep]
├── T7: Add missing frontend error boundaries [visual-engineering]
├── T8: Verify and fix RBAC consistency (proxy.ts ↔ backend) [quick]
├── T9: Add error response schema validation tests [deep]
└── T10: Fix token refresh race conditions [deep]

Wave 3 (Route Unification — 4 tasks, MAX PARALLEL):
├── T11: Unify delivery-record/invoice/payment/SES routes [deep]
├── T12: Unify planning-packet routes (old orders/:id/planning → planning-packets/:id) [deep]
├── T13: Unify report routes (deprecation aliases) [quick]
└── T14: Add compatibility redirects for renamed routes [quick]

Wave FINAL (Verification — 4 parallel, then user approval):
├── F1: Plan Compliance Audit (oracle)
├── F2: Code Quality Review (typecheck + lint + build + test)
├── F3: Real Manual QA (execute ALL QA scenarios)
└── F4: Scope Fidelity Check (no scope creep)
```

### Dependency Matrix
- **T1-T5**: None (Wave 1 — start immediately)
- **T6**: T1 (baseline) - T7, T9, F2
- **T7**: T4 (audit) - F2, F3
- **T8**: T4 (audit) - F2
- **T9**: T6 (handler) - F2, F3
- **T10**: T4 (audit) - F2, F3
- **T11**: T2, T4 (docs + audit) - F2, F3
- **T12**: T2, T4 - F2, F3
- **T13**: T2, T4 - F2, F3
- **T14**: T11 (unification) - F2

---

## TODOs

- [ ] 1. **Run current quality gates (baseline)**

  **What to do**:
  - Run `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` across all workspaces
  - Record current pass/fail count for each gate
  - Save output to `.sisyphus/evidence/baseline/`
  - Identify any pre-existing failures before any changes
  - Check `backend/src/server.ts` for existing `unhandledRejection` and `uncaughtException` handlers

  **Must NOT do**:
  - Do not fix any pre-existing failures yet — just record them
  - Do not modify any code

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T6, T9 (these need baseline)
  - **Blocked By**: None

  **References**:
  - `backend/src/server.ts` - Error handlers to baseline
  - Root `package.json` - Scripts to run

  **Acceptance Criteria**:
  - [ ] All gate output saved to `.sisyphus/evidence/baseline/`
  - [ ] Baseline recorded: typecheck pass/fail count, lint pass/fail count, build success/fail, test pass/fail count

  **QA Scenarios**:
  ```
  Scenario: Baseline gates pass
    Tool: Bash
    Preconditions: Clean working directory
    Steps:
      1. mkdir -p .sisyphus/evidence/baseline/
      2. npm run typecheck > .sisyphus/evidence/baseline/typecheck.txt 2>&1
      3. npm run lint > .sisyphus/evidence/baseline/lint.txt 2>&1
      4. npm run build > .sisyphus/evidence/baseline/build.txt 2>&1
      5. npm run test > .sisyphus/evidence/baseline/test.txt 2>&1
    Expected Result: All gates complete (may have pre-existing failures)
    Evidence: .sisyphus/evidence/baseline/*.txt
  ```

  **Commit**: NO (baseline only)

- [ ] 2. **Update API_ENDPOINT_MATRIX.md — sync with actual 52 backend mounts**

  **What to do**:
  - Read ALL route files in `backend/src/modules/*/*.routes.ts`
  - Map every endpoint (method + path) to its actual prefix from `backend/src/index.ts` `API_MOUNTS`
  - Update `docs/architecture/API_ENDPOINT_MATRIX.md` with REAL implementation status
  - For each module: list ALL endpoints with method, path, purpose, request/response schemas, RBAC, audit, status
  - Mark status as `IMPLEMENTED` where routes exist and have controllers
  - Mark status as `NEEDS_VERIFICATION` where routes exist but controller may be missing
  - Mark status as `REQUIRED_NOT_IMPLEMENTED` only where truly missing (no route file, no controller)

  **Must NOT do**:
  - Do not modify any source code
  - Do not invent endpoints that don't exist yet
  - Do not remove endpoints that are in the docs but not in code — mark them correctly

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **References**:
  - `backend/src/index.ts:API_MOUNTS` - All 52 route mounts with prefixes
  - `backend/src/modules/*/*.routes.ts` - Route files for each module
  - `docs/architecture/API_ENDPOINT_MATRIX.md` - Document to update
  - `backend/src/common/errors/AppError.ts` - Error classes for reference
  - `backend/src/common/errors/error-codes.ts` - Error codes

  **Acceptance Criteria**:
  - [ ] API_ENDPOINT_MATRIX.md now lists ALL active endpoints with correct status
  - [ ] Status column accurately reflects IMPLEMENTED vs REQUIRED_NOT_IMPLEMENTED
  - [ ] All 52 API_MOUNTS accounted for
  - [ ] Response schemas reference actual Zod schemas from shared-types

  **QA Scenarios**:
  ```
  Scenario: Document accuracy verification
    Tool: Bash
    Preconditions: API_ENDPOINT_MATRIX.md updated
    Steps:
      1. For each route mount in index.ts, find the .routes.ts file
      2. For each route in .routes.ts, verify it's documented in the matrix
      3. Count documented IMPLEMENTED routes vs actual routes
    Expected Result: >= 95% of actual routes are documented
    Evidence: .sisyphus/evidence/task-2-accuracy.txt
  ```

  **Commit**: YES
  - Message: `docs(core): sync API_ENDPOINT_MATRIX with actual 52 backend mounts`
  - Files: `docs/architecture/API_ENDPOINT_MATRIX.md`

- [ ] 3. **Update FRONTEND_ROUTE_MAP.md — sync with actual frontend routes**

  **What to do**:
  - Explore ALL route directories in `frontend/src/app/`
  - Map every route to its page component, module, required data, query hook, API endpoint, RBAC, states
  - Update `docs/architecture/FRONTEND_ROUTE_MAP.md` with REAL implementation status
  - Check that every route with `IMPLEMENTED` status actually has a `page.tsx`
  - Check that routes with `error.tsx`, `loading.tsx` have them documented

  **Must NOT do**:
  - Do not modify any source code
  - Do not remove routes that exist in docs but were never built — mark them correctly

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **References**:
  - `frontend/src/app/` - All route directories
  - `frontend/src/modules/*/hooks/*.ts` - Query hooks
  - `frontend/src/modules/*/api/*.ts` - API client calls
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` - Document to update

  **Acceptance Criteria**:
  - [ ] FRONTEND_ROUTE_MAP.md lists ALL active frontend routes
  - [ ] Status column accurately reflects IMPLEMENTED vs REQUIRED_NOT_IMPLEMENTED
  - [ ] States (Loading, Error, Empty, Offline) correctly documented
  - [ ] Query hooks reference actual files

  **QA Scenarios**:
  ```
  Scenario: Frontend route accuracy verification
    Tool: Bash
    Preconditions: FRONTEND_ROUTE_MAP.md updated
    Steps:
      1. Count actual page.tsx files in frontend/src/app/ (excluding api/ and layout)
      2. Compare with documented IMPLEMENTED routes
      3. Check each route has proper error.tsx and loading.tsx
    Expected Result: All actual pages are documented
    Evidence: .sisyphus/evidence/task-3-route-count.txt
  ```

  **Commit**: YES
  - Message: `docs(core): sync FRONTEND_ROUTE_MAP with actual routes`
  - Files: `docs/architecture/FRONTEND_ROUTE_MAP.md`

- [ ] 4. **Audit all frontend API calls vs backend routes**

  **What to do**:
  - Search ALL frontend files for `apiClient.get|post|put|patch|delete(` calls
  - Extract every API path the frontend calls (e.g., `/work-requests`, `/orders/:id/status`)
  - Cross-reference each path against backend route definitions in `backend/src/modules/*/*.routes.ts`
  - For each mismatch (frontend calls path X, backend doesn't have it), document:
    - The frontend file + line number
    - The called path
    - Whether backend needs a new route or frontend needs fixing
  - Create a report at `.sisyphus/evidence/task-4-path-mismatches.md`

  **Must NOT do**:
  - Do not fix mismatches in this task — just document them for T11-T14

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **References**:
  - Frontend: `grep -r "apiClient\.\(get\|post\|put\|patch\|delete\)" frontend/src/`
  - Backend: `backend/src/modules/*/*.routes.ts`
  - Backend: `backend/src/index.ts` - Route mounts
  - `frontend/src/lib/http/api-client-constants.ts` - API_ROOT

  **Acceptance Criteria**:
  - [ ] All frontend API calls extracted and documented
  - [ ] Cross-reference with backend routes complete
  - [ ] Mismatch report saved to `.sisyphus/evidence/task-4-path-mismatches.md`
  - [ ] Each mismatch has: file, line, called path, resolution recommendation

  **QA Scenarios**:
  ```
  Scenario: Path audit complete
    Tool: Bash
    Preconditions: grep output extracted
    Steps:
      1. Count total frontend API calls found
      2. Count verified matches (backend has the route)
      3. Count mismatches (backend doesn't have the route)
      4. Save report
    Expected Result: Report covers 100% of apiClient calls found
    Evidence: .sisyphus/evidence/task-4-path-mismatches.md
  ```

  **Commit**: YES
  - Message: `audit(frontend): verify all API calls match backend routes`
  - Files: `.sisyphus/evidence/task-4-path-mismatches.md`

- [ ] 5. **Audit workspace configuration**

  **What to do**:
  - Read root `package.json` — verify workspaces array: `["backend", "frontend", "packages/*"]`
  - Read ALL workspaces' `package.json` files
  - Check for:
    - Version mismatches between workspaces (e.g., `zod` in root vs backend vs shared-types)
    - Missing dependencies that would cause 500 errors at runtime
    - Duplicate dependencies
    - Incorrect import paths between workspaces
  - Read `turbo.json` if exists — verify pipeline configuration
  - Read ALL `tsconfig.json` files — verify path aliases
  - Check that `packages/shared-types`, `packages/domain`, `packages/config` exports match what backend/frontend import

  **Must NOT do**:
  - Do not modify package.json or tsconfig without explicit approval per Cermont rules
  - Just document issues found

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **References**:
  - Root `package.json` - Workspace configuration
  - `backend/package.json`
  - `frontend/package.json`
  - `packages/*/package.json`
  - `turbo.json` (if exists)
  - Root and workspace `tsconfig.json` files

  **Acceptance Criteria**:
  - [ ] All package.json files read and analyzed
  - [ ] Version mismatches documented
  - [ ] Missing dependencies identified
  - [ ] Import path issues identified

  **QA Scenarios**:
  ```
  Scenario: Workspace config audit complete
    Tool: Bash
    Preconditions: None
    Steps:
      1. Read all package.json files
      2. Read all tsconfig.json files
      3. Compare dependency versions across workspaces
      4. Generate report
    Expected Result: Report saved with any issues found
    Evidence: .sisyphus/evidence/task-5-workspace-audit.md
  ```

  **Commit**: YES
  - Message: `chore(workspace): audit package.json and tsconfig configuration`
  - Files: `.sisyphus/evidence/task-5-workspace-audit.md`

- [ ] 6. **Harden errorHandler — Mongoose errors and unhandledRejection**

  **What to do**:
  - Modify `backend/src/common/errors/error-handler.ts`:
    - Add handling for Mongoose `ValidationError` → return 400 instead of 500
    - Add handling for Mongoose `CastError` (invalid ObjectId) → return 400 instead of 500
    - Add handling for Mongoose `DocumentNotFoundError` → return 404
    - Ensure ALL Mongoose error codes (11000 duplicate key, etc.) return proper status codes
  - Modify `backend/src/server.ts`:
    - Change `unhandledRejection` handler: log the error but do NOT call `process.exit(1)`
    - Instead, call `logger.error()` with full context (stack, promise)
    - Keep `uncaughtException` handler with process.exit (that's the correct behavior for uncaught exceptions)
    - Add optional in-memory counter for unhandled rejections for observability
  - Add `error-metrics.ts` integration — track error types by path

  **Must NOT do**:
  - Do not remove the `uncaughtException` handler's process.exit (that's correct)
  - Do not add new error types to AppError hierarchy (it's already complete)
  - Do not modify controllers or services

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential with T1 baseline)
  - **Parallel Group**: Wave 2
  - **Blocks**: T9 (tests depend on handler)
  - **Blocked By**: T1 (baseline)

  **References**:
  - `backend/src/common/errors/error-handler.ts` - Main handler to modify
  - `backend/src/server.ts:unhandledRejection` - Lines calling process.exit
  - `backend/src/common/errors/AppError.ts` - Error classes reference
  - `backend/src/common/errors/error-codes.ts` - Error codes
  - `backend/src/common/observability/error-metrics.ts` - Metrics tracking

  **Acceptance Criteria**:
  - [ ] Mongoose ValidationError returns 400 with VALIDATION_FAILED code
  - [ ] Mongoose CastError returns 400 with BAD_REQUEST code
  - [ ] Mongoose DocumentNotFoundError returns 404 with NOT_FOUND code
  - [ ] Duplicate key error (11000) returns 409 with CONFLICT code
  - [ ] unhandledRejection no longer calls process.exit(1)
  - [ ] Error metrics tracked by path and error type

  **QA Scenarios**:
  ```
  Scenario: Mongoose ValidationError → 400
    Tool: Bash (curl)
    Preconditions: Backend running
    Steps:
      1. POST /api/users with invalid email format (e.g., "not-an-email")
      2. Assert status 400
      3. Assert error.code is "VALIDATION_FAILED"
    Expected Result: 400 with proper error envelope
    Evidence: .sisyphus/evidence/task-6-mongoose-validation.txt

  Scenario: Invalid ObjectId → 400
    Tool: Bash (curl)
    Preconditions: Backend running
    Steps:
      1. GET /api/users/invalid-object-id
      2. Assert status 400 (not 500)
      3. Assert error.code is "BAD_REQUEST"
    Expected Result: 400 with proper error envelope
    Evidence: .sisyphus/evidence/task-6-cast-error.txt

  Scenario: unhandledRejection does not crash
    Tool: interactive_bash (tmux)
    Preconditions: Backend running
    Steps:
      1. Cause an unhandled rejection (e.g., via intentional test)
      2. Assert server continues running (no crash)
      3. Assert error is logged
    Expected Result: Server stays alive
    Evidence: .sisyphus/evidence/task-6-unhandled-rejection.txt
  ```

  **Commit**: YES
  - Message: `fix(backend): harden error handler - graceful unhandledRejection, Mongoose→400`
  - Files: `backend/src/common/errors/error-handler.ts`, `backend/src/server.ts`, `backend/src/common/observability/error-metrics.ts`
  - Pre-commit: `npm run typecheck -w backend && npm run test -w backend`

- [ ] 7. **Add missing frontend error boundaries**

  **What to do**:
  - Audit all frontend route directories in `frontend/src/app/` for missing `error.tsx` files
  - For each route that has a `page.tsx` but NO `error.tsx`, create one
  - Error boundaries should follow the existing pattern in `frontend/src/app/(dashboard)/error.tsx`
  - Include: retry button, error message display, support contact info
  - Cover ALL dashboard routes: orders, proposals, work-requests, site-visits, billing, costs, evidences, reports, execution, delivery-records, payments, service-cases, assets, maintenance, resources, documents, templates, admin/*
  - Ensure loading.tsx files exist alongside error.tsx where missing

  **Must NOT do**:
  - Do not modify existing page components
  - Do not change the layout or styling of existing error boundaries
  - Do not add error boundaries to auth routes (login, register, forgot-password) — they handle errors inline

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (must read all routes first)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T4 (path audit)

  **References**:
  - `frontend/src/app/(dashboard)/error.tsx` - Pattern to follow
  - `frontend/src/app/(dashboard)/admin/audit/error.tsx` - Another reference pattern
  - All dashboard route directories

  **Acceptance Criteria**:
  - [ ] Every dashboard route has error.tsx
  - [ ] Every dashboard route has loading.tsx
  - [ ] Error boundaries show: error message, retry button, contact info
  - [ ] Auth routes (login, register) excluded from this change

  **QA Scenarios**:
  ```
  Scenario: Error boundary renders on API failure
    Tool: Playwright
    Preconditions: Frontend running, user authenticated
    Steps:
      1. Navigate to /admin/audit (should have error.tsx)
      2. Intercept API to return 500
      3. Assert error boundary renders with retry button
    Expected Result: Error UI shown, not blank page
    Evidence: .sisyphus/evidence/task-7-error-boundary.png
  ```

  **Commit**: YES
  - Message: `feat(frontend): add missing error boundaries to dashboard routes`
  - Files: `frontend/src/app/*/error.tsx` (multiple new files)
  - Pre-commit: `npm run typecheck -w frontend`

- [ ] 8. **Verify and fix RBAC consistency**

  **What to do**:
  - Read `frontend/proxy.ts` — verify the `matcher` config and route protection logic
  - Read `packages/domain/src/` — RBAC role definitions, permission helpers
  - Read backend route files and verify `authorize()` calls use roles from `@cermont/domain`
  - Check for hardcoded role strings in route files (e.g., `authorize("gerente")` vs `authorize(...MANAGEMENT_ROLES)`)
  - Check `proxy.ts` role extraction from JWT cookie matches backend's role values
  - Verify `canAccessPath()` in domain matches backend authorize middleware
  - Document any discrepancies found

  **Must NOT do**:
  - Do not modify proxy.ts security logic (only document issues)
  - Do not change backend authorize middleware

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T4 (path audit)

  **References**:
  - `frontend/proxy.ts` - Proxy RBAC guard
  - `packages/domain/src/` - RBAC helpers
  - `backend/src/middlewares/authorize.middleware.ts` - Backend authorization
  - Route files: `backend/src/modules/*/*.routes.ts` - authorize() calls

  **Acceptance Criteria**:
  - [ ] All hardcoded role strings in routes documented
  - [ ] proxy.ts role extraction matches backend role format
  - [ ] No RBAC discrepancies between proxy.ts and backend

  **QA Scenarios**:
  ```
  Scenario: RBAC consistency verified
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. grep for hardcoded role strings in route files
      2. Compare with @cermont/domain exports
      3. Document findings
    Expected Result: All roles use domain package or are documented exceptions
    Evidence: .sisyphus/evidence/task-8-rbac-audit.md
  ```

  **Commit**: YES
  - Message: `fix(auth): verify RBAC consistency across proxy and backend`
  - Files: `.sisyphus/evidence/task-8-rbac-audit.md`

- [ ] 9. **Add error response schema validation tests**

  **What to do**:
  - Create integration tests for error response schemas in `backend/src/tests/errors/`
  - Test that ALL error types return the correct envelope shape: `{ success: false, error: { code, message } }`
  - Test that AppError subclasses return correct HTTP status codes
  - Test that Zod validation errors return 400 with field-level details
  - Test that 404 errors return NOT_FOUND code
  - Test that 401 errors return UNAUTHORIZED code
  - Test that 403 errors return FORBIDDEN code
  - Test that 500 errors hide stack traces in production mode
  - Use `supertest` or direct `app` import for integration tests

  **Must NOT do**:
  - Do not modify error handler or controllers — only test them
  - Do not add E2E tests here (those go in frontend)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T6 (handler changes must be applied first)

  **References**:
  - `backend/src/common/errors/error-handler.ts` - Handler being tested
  - `backend/src/common/errors/AppError.ts` - Error classes
  - `backend/src/tests/controllers/` - Existing test patterns
  - `backend/src/index.ts` - App export for supertest

  **Acceptance Criteria**:
  - [ ] Test file created at `backend/src/tests/errors/error-handler.test.ts`
  - [ ] All AppError types tested for correct envelope and status code
  - [ ] Zod validation error format verified
  - [ ] Production mode hides stack traces
  - [ ] All tests pass

  **QA Scenarios**:
  ```
  Scenario: Error handler tests pass
    Tool: Bash
    Preconditions: None
    Steps:
      1. npm run test -w backend -- src/tests/errors/error-handler.test.ts
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-9-error-tests.txt

  Scenario: 404 returns correct envelope
    Tool: Bash (curl)
    Preconditions: Backend running
    Steps:
      1. GET /api/non-existent-route
      2. Assert status 404
      3. Assert body.success === false
      4. Assert body.error.code === "NOT_FOUND"
    Expected Result: Proper 404 envelope
    Evidence: .sisyphus/evidence/task-9-404-envelope.txt
  ```

  **Commit**: YES
  - Message: `test(backend): add error response schema validation tests`
  - Files: `backend/src/tests/errors/error-handler.test.ts`
  - Pre-commit: `npm run test -w backend`

- [ ] 10. **Fix token refresh race conditions**

  **What to do**:
  - Read `frontend/src/lib/http/api-client.ts` — analyze `waitForRefresh()` and `refreshAccessToken()` logic
  - Identify race conditions:
    - Multiple simultaneous API calls triggering parallel refresh attempts
    - Pending requests queue handling
    - Retry loop timing
  - Fix identified issues:
    - Ensure `isRefreshing` flag prevents parallel refresh calls
    - Ensure pending queue resolves correctly on success AND failure
    - Add timeout to refresh call (e.g., 10s) to prevent hanging
    - Add circuit breaker: if 3 consecutive refreshes fail, clear auth and redirect to login
  - Read `frontend/src/modules/auth/hooks/useAuth.ts` — verify refresh flow in auth hooks

  **Must NOT do**:
  - Do not change the dedicated auth route handlers in `src/app/api/auth/*/route.ts`
  - Do not modify the refresh token cookie handling

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T4 (path audit)

  **References**:
  - `frontend/src/lib/http/api-client.ts` - Main API client with refresh logic
  - `frontend/src/lib/http/api-client-constants.ts` - Constants
  - `frontend/src/modules/auth/hooks/useAuth.ts` - Auth hooks
  - `frontend/src/app/api/auth/refresh/route.ts` - Dedicated refresh handler

  **Acceptance Criteria**:
  - [ ] isRefreshing flag prevents parallel refresh calls
  - [ ] Pending request queue resolves correctly on success
  - [ ] Pending request queue rejects on failure (doesn't hang)
  - [ ] Refresh call has timeout protection
  - [ ] Circuit breaker: 3 consecutive failures → clear auth → redirect login

  **QA Scenarios**:
  ```
  Scenario: Parallel refreshes don't race
    Tool: Playwright
    Preconditions: Frontend running, user authenticated
    Steps:
      1. Clear access token from memory (simulate page refresh)
      2. Fire 5 simultaneous API calls
      3. Assert only ONE refresh request was made
      4. Assert all 5 calls eventually succeed
    Expected Result: Single refresh, all calls succeed
    Evidence: .sisyphus/evidence/task-10-parallel-refresh.txt

  Scenario: Circuit breaker on repeated failures
    Tool: Playwright
    Preconditions: Frontend running, user authenticated
    Steps:
      1. Mock refresh endpoint to return 500
      2. Fire API call that triggers refresh
      3. After 3 consecutive failures, assert user is redirected to login
    Expected Result: Circuit breaker trips after 3 failures
    Evidence: .sisyphus/evidence/task-10-circuit-breaker.txt
  ```

  **Commit**: YES
  - Message: `fix(auth): prevent token refresh race conditions with circuit breaker`
  - Files: `frontend/src/lib/http/api-client.ts`
  - Pre-commit: `npm run typecheck -w frontend && npm run test -w frontend`

- [ ] 11. **Unify billing routes (delivery-record, invoice, payment, SES)**

  **What to do**:
  - Based on the mismatch report from T4, identify paths that need alignment
  - Current state: Frontend calls `/delivery-records/from-technical-report/:id`, backend has it ✅
  - Frontend calls `/invoices/from-service-entry-sheet/:id`, backend has it ✅
  - Frontend calls `/payments/from-invoice/:id`, backend has it ✅
  - Frontend calls `/service-entry-sheets/from-delivery-record/:id`, backend has it ✅
  - Verify each created resource returns correct 201 status with location header
  - Verify error responses for each validation failure scenario
  - Add `OPTIONS` handler routes for CORS preflight where missing (check index.ts already handles this globally)
  - Ensure all billing routes have consistent response envelope (`{ success, data }` not `{ data }` only)

  **Must NOT do**:
  - Do not change existing endpoint behavior
  - Do not remove any route paths
  - Do not modify service layer

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T14 (compat redirects)
  - **Blocked By**: T2, T4 (docs + audit)

  **References**:
  - `backend/src/modules/delivery-record/delivery-record.routes.ts`
  - `backend/src/modules/invoice/invoice.routes.ts`
  - `backend/src/modules/payment/payment.routes.ts`
  - `backend/src/modules/service-entry-sheet/service-entry-sheet.routes.ts`
  - `backend/src/modules/order/administrative-workflow.controller.ts` - Shared controller
  - `.sisyphus/evidence/task-4-path-mismatches.md` - Mismatch report

  **Acceptance Criteria**:
  - [ ] All billing routes return consistent 201 on creation
  - [ ] All billing routes return consistent error envelope on failure
  - [ ] No breaking changes to existing frontend calls
  - [ ] Validation errors return 400 with field-level details
  - [ ] Auth errors return 401 with UNAUTHORIZED code

  **QA Scenarios**:
  ```
  Scenario: Delivery record creation returns 201
    Tool: Bash (curl)
    Preconditions: Backend running, valid auth token, valid technical report exists
    Steps:
      1. POST /api/delivery-records/from-technical-report/:id with valid body
      2. Assert status 201
      3. Assert body.success === true
      4. Assert body.data has _id
    Expected Result: 201 with proper envelope
    Evidence: .sisyphus/evidence/task-11-delivery-201.txt

  Scenario: Invoice creation validation error
    Tool: Bash (curl)
    Preconditions: Backend running, valid auth token
    Steps:
      1. POST /api/invoices/from-service-entry-sheet/:id with INVALID body
      2. Assert status 400
      3. Assert body.error.code === "VALIDATION_FAILED"
      4. Assert body.error.details has field-level errors
    Expected Result: 400 with validation details
    Evidence: .sisyphus/evidence/task-11-invoice-validation.txt
  ```

  **Commit**: YES
  - Message: `refactor(backend): unify billing routes (delivery-record, invoice, payment, SES)`
  - Files: Multiple billing route files
  - Pre-commit: `npm run typecheck -w backend && npm run test -w backend`

- [ ] 12. **Unify planning-packet routes**

  **What to do**:
  - Current state: One route at `/api/orders/:orderId/planning-packet` (in order.routes.ts), another at `/api/planning-packets/:id` (in planning-packet.routes.ts)
  - Verify the frontend calls the correct path (check T4 report)
  - If frontend calls `/planning-packets` directly, ensure backend mounts at prefix `/api/planning-packets` (already done in index.ts)
  - If frontend also calls `/orders/:id/planning`, add alias route in order.routes.ts
  - Add deprecation notes on old paths with redirect to new canonical paths
  - Ensure both paths return identical response format

  **Must NOT do**:
  - Do not remove the `/orders/:orderId/planning-packet` path (it's documented)
  - Do not modify planning-packet service

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: T2, T4 (docs + audit)

  **References**:
  - `backend/src/modules/order/order.routes.ts` - Has `/planning-packet` route
  - `backend/src/modules/planning-packet/planning-packet.routes.ts` - Canonical planning routes
  - `backend/src/modules/planning-packet/planning-packet.controller.ts` - Controller
  - `.sisyphus/evidence/task-4-path-mismatches.md`

  **Acceptance Criteria**:
  - [ ] Both `/orders/:id/planning-packet` and `/planning-packets/:id` work
  - [ ] Old path has deprecation header `X-Deprecated: true`
  - [ ] Both return identical data format
  - [ ] Frontend can use either path

  **QA Scenarios**:
  ```
  Scenario: Both planning paths return same data
    Tool: Bash (curl)
    Preconditions: Backend running, valid order exists with planning packet
    Steps:
      1. GET /api/orders/:orderId/planning-packet
      2. GET /api/planning-packets/:planningId
      3. Compare both responses (they should reference the same planning data)
    Expected Result: Both paths work
    Evidence: .sisyphus/evidence/task-12-planning-paths.txt
  ```

  **Commit**: YES
  - Message: `refactor(backend): unify planning-packet routes with deprecation aliases`
  - Files: `backend/src/modules/order/order.routes.ts`, `backend/src/modules/planning-packet/planning-packet.routes.ts`
  - Pre-commit: `npm run typecheck -w backend && npm run test -w backend`

- [ ] 13. **Unify report routes — add deprecation aliases**

  **What to do**:
  - Current state: `report.routes.ts` has deprecated `PATCH /:id/approve` (use `POST /:id/close`)
  - Current state: `report.routes.ts` has deprecated `PATCH /:id/status` (use `PATCH /:id` with UpdateWorkReportSchema)
  - Verify frontend does NOT call the deprecated paths (check T4 report)
  - If frontend still calls any deprecated path, ensure it still works with deprecation warning header
  - Add `X-Deprecated: true` and `X-Deprecated-At: 2026-09-30` headers to deprecated responses
  - Add migration guide comment in route file

  **Must NOT do**:
  - Do not remove deprecated endpoints until their retirement date
  - Do not change response format of deprecated endpoints

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: T2, T4 (docs + audit)

  **References**:
  - `backend/src/modules/report/report.routes.ts` - Route file with deprecations
  - `backend/src/modules/report/report.controller.ts` - Controller
  - `.sisyphus/evidence/task-4-path-mismatches.md`

  **Acceptance Criteria**:
  - [ ] Deprecated endpoints return `X-Deprecated: true` header
  - [ ] Deprecated endpoints still work (no 404)
  - [ ] Deprecation dates documented in route comments
  - [ ] Frontend does not call deprecated paths (or migration is planned)

  **QA Scenarios**:
  ```
  Scenario: Deprecated endpoint still works with warning
    Tool: Bash (curl)
    Preconditions: Backend running, valid auth token, valid report exists
    Steps:
      1. PATCH /api/reports/:id/approve
      2. Assert status 200
      3. Assert response header X-Deprecated === "true"
    Expected Result: 200 with deprecation warning
    Evidence: .sisyphus/evidence/task-13-deprecation.txt
  ```

  **Commit**: YES
  - Message: `refactor(backend): add deprecation headers to report legacy endpoints`
  - Files: `backend/src/modules/report/report.routes.ts`
  - Pre-commit: `npm run typecheck -w backend`

- [ ] 14. **Add compatibility redirects for renamed routes**

  **What to do**:
  - Based on the mismatch report from T4 and changes from T11-T13, add backward-compatible redirects
  - For any routes that changed prefix (e.g., old `/orders/:id/planning` → new `/planning-packets/:id`):
    - Add a middleware in the OLD route that sends `X-Redirect: {new path}` header
    - The old route should still work (not 301 redirect, just serve from old path too)
  - Register any missing aliases in `backend/src/index.ts`

  **Must NOT do**:
  - Do not remove any old paths
  - Do not use HTTP 301/302 redirects (breaks API clients)
  - Do not modify shared-types schemas

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (after T11)
  - **Blocks**: None
  - **Blocked By**: T11 (billing unification)

  **References**:
  - `backend/src/index.ts` - Route mounts
  - `.sisyphus/evidence/task-4-path-mismatches.md`
  - Route files: billing, planning, report

  **Acceptance Criteria**:
  - [ ] All renamed routes have backward-compatible aliases
  - [ ] Aliases return same data as canonical paths
  - [ ] No 404s from frontend API calls due to path changes

  **QA Scenarios**:
  ```
  Scenario: Compatibility aliases work
    Tool: Bash (curl)
    Preconditions: Backend running
    Steps:
      1. Call each alias path identified in T4 report
      2. Assert 200 (not 404)
      3. Assert response matches canonical path response
    Expected Result: All aliases return 200
    Evidence: .sisyphus/evidence/task-14-compat-aliases.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add compatibility redirects for renamed routes`
  - Files: `backend/src/index.ts`, affected route files
  - Pre-commit: `npm run typecheck -w backend`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit approval.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint). For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck && npm run lint && npm run build && npm run test`. Review changed files for violations.
  Output: `Typecheck [PASS/FAIL] | Lint [PASS/FAIL] | Build [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test cross-task integration. Save evidence.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **T2**: `docs(core): sync API_ENDPOINT_MATRIX with actual 52 backend mounts`
- **T3**: `docs(core): sync FRONTEND_ROUTE_MAP with actual routes`
- **T4**: `audit(frontend): verify all API calls match backend routes`
- **T5**: `chore(workspace): fix package.json and tsconfig configuration`
- **T6**: `fix(backend): harden error handler - graceful unhandledRejection, Mongoose 400`
- **T7**: `feat(frontend): add missing error boundaries`
- **T8**: `fix(auth): verify RBAC consistency across proxy and backend`
- **T9**: `test(backend): add error response schema validation tests`
- **T10**: `fix(auth): prevent token refresh race conditions`
- **T11**: `refactor(backend): unify billing routes (delivery-record, invoice, payment, SES)`
- **T12**: `refactor(backend): unify planning-packet routes`
- **T13**: `refactor(backend): add report route deprecation aliases`
- **T14**: `feat(backend): add compatibility redirects for renamed routes`

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck   # TypeScript strict all workspaces
npm run lint        # Biome all workspaces
npm run build       # shared-types → backend → frontend
npm run test        # Vitest all workspaces
npm run test:e2e -w frontend  # Playwright critical paths
```

### Final Checklist
- [ ] All API_ENDPOINT_MATRIX.md entries reflect actual backend routes
- [ ] All FRONTEND_ROUTE_MAP.md entries reflect actual frontend routes
- [ ] Every frontend API call has a matching backend route
- [ ] No `process.exit` on graceful shutdown errors
- [ ] Mongoose validation errors return 400, not 500
- [ ] All frontend routes have error.tsx boundaries
- [ ] Token refresh has no race conditions
- [ ] All deprecated routes have backward-compatible aliases
- [ ] All 7 workspaces typecheck clean
- [ ] All tests pass
