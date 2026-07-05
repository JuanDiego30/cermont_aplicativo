# Spec 005 — Hotfix Post-Deploy + Implementación Real

## TL;DR

> **Quick Summary**: Reproducir y corregir 7 errores P0 de producción en cermontsas.shop (assets 404, PWA/manifest, 401 notifications, 500 users, 400 work-requests, 400 documents, DialogTitle), luego implementar WebAuthn y 2 slices funcionales pendientes, y redeployar con smoke tests.

> **Deliverables**:
> - Matriz de errores de producción (production-error-matrix.md)
> - Corrección de assets estáticos (favicon, iconos PWA, logo)
> - Corrección de ruta notifications (401→200)
> - Corrección de validación users/:id (500→400/200)
> - Corrección de validación work-requests POST (400→201)
> - Corrección de documents upload (400→201)
> - Corrección de Radix DialogTitle en todos los DialogContent
> - WebAuthn/passkeys (funcional o bloqueo técnico documentado)
> - 2 slices funcionales completos (vehículos + herramientas)
> - Tests de regresión
> - Smoke tests en producción
> - Post-fix report

> **Estimated Effort**: XL (30+ tareas)
> **Parallel Execution**: YES — 6 waves
> **Critical Path**: FASE 0 → FASE 1 → FASE 3 → FASE 9 → FASE 10

---

## Context

### Original Request
Spec 005 completo: reproducir errores de producción en cermontsas.shop, corregir P0 (assets 404, PWA, 401, 500, 400x2, DialogTitle), implementar WebAuthn/biometría, retomar 2+ slices funcionales (vehículos, herramientas, evidencias, dashboard/KPIs, checklists), agregar regresión, smoke tests y redeploy.

### Interview Summary
**Key Decisions**:
- **Branch**: hotfix/spec-005-post-deploy (clean from current production commit 7b5f415)
- **Acceso VPS**: SSH directo para logs y reproducción
- **Assets 404**: assets EXISTEN en `frontend/public/`, 404 es por deploy/build issue
- **Notifications**: ruta backend es `/api/notifications`, frontend llama `/api/backend/analytics/notifications` → bug de ruta
- **Users 500**: falta manejo de ObjectId inválido antes de consulta
- **WebAuthn**: construir con @simplewebauthn o dejar bloqueo técnico
- **Slices**: priorizar VEHÍCULOS (ya existe VehiclePhotoSection/VehicleDocumentSection) y HERRAMIENTAS (ToolPhotoSection/ToolDocumentSection) como extensión de lo existente

**Research Findings**:
- `frontend/public/` contiene: favicon.png, manifest.json, icons/icon-192.png, icons/icon-512.png, icons/maskable-icon-192.png, icons/maskable-icon-512.png, icons/logo-cermont.png
- `manifest.json` referencia correctamente los iconos
- No hay `frontend/src/app/manifest.ts` ni `frontend/src/app/icon*.*` (no usa metadata API de Next.js)
- Backend notifications route: GET /api/notifications (router.get("/"))
- Backend users route: GET /api/users/:id con validateParams(UserIdParamsSchema) (requiere ObjectId)
- Backend work-requests: POST /api/work-requests con validateBody(CreateWorkRequestSchema)
- Backend documents: POST /api/documents con upload.single("file") + validateBody(UploadDocumentSchema)
- No hay WebAuthn/fingerprint code existente (0 hits para navigator.credentials)
- DialogContent warning suprimido en E2E test (line 1432 video-demo-cermont.spec.ts)
- 231 líneas de cambios sin commit en working tree

### Metis Review
- **Nota**: Metis no estuvo disponible. Análisis realizado directamente.
- **Guardrails identificados:**
  - No eliminar seguridad para hacer funcionar algo
  - No introducir `any`
  - No romper RBAC ni API envelope
  - No ocultar errores 400/401/500
  - No desplegar sin rollback y smoke tests
  - No agregar funcionalidades nuevas antes de corregir P0
- **Scope creep areas**: Dashboard/KPIs es un redesign completo → limitar a mejoras puntuales
- **Riesgo**: npm audit tiene vulnerabilidades existentes en multer, undici, postcss via next

---

## Work Objectives

### Core Objective
Reproducir, clasificar y corregir 7 errores P0 de producción, implementar WebAuthn/biometría y 2 slices funcionales (vehículos y herramientas), con tests, smoke tests y redeploy documentado.

### Concrete Deliverables
- `specs/005-post-deploy-hotfix-and-real-implementation/` — spec kit completo
- `scripts/check-static-assets.mjs` — validador de assets
- Corrección de assets 404 en producción
- Corrección de async listener error
- Corrección de 401 notifications
- Corrección de 500 users/:id
- Corrección de 400 work-requests
- Corrección de 400 documents
- Corrección de todos los DialogContent sin DialogTitle
- WebAuthn endpoints + UI de passkey/login
- Vehículos: fotos, documentos, readiness funcionales
- Herramientas: fotos, documentos, checklists funcionales
- Tests de regresión
- Smoke tests en producción
- Post-fix report

### Must Have
- Todos los assets estáticos devuelven 200
- manifest.json no referencia rutas 404
- notifications no generan 401 spam en login
- users/:id no devuelve 500
- work-requests POST funciona o muestra error Zod legible
- documents POST funciona o muestra error Zod legible
- Todos los DialogContent tienen DialogTitle
- Biometría móvil tiene WebAuthn funcional o bloqueo técnico documentado
- 2 slices funcionales implementados con código real
- Build, contracts:check, verify pasan
- Smoke tests en producción pasan
- Sin `any` introducido
- Sin RBAC roto

### Must NOT Have (Guardrails)
- No eliminar seguridad para solucionar errores
- No ocultar errores 400/401/500
- No introducir `any`, `@ts-ignore`, `@ts-expect-error`
- No desplegar sin rollback plan
- No agregar funcionalidades nuevas antes de corregir P0
- No modificar `package.json`/`package-lock.json` sin aprobación explícita

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (vitest + Playwright E2E)
- **Automated tests**: YES (TDD for functional slices, tests-after for hotfixes)
- **Framework**: vitest (backend + frontend), Playwright (E2E)

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **API/Backend**: Bash (curl) — Send requests, assert status + response fields
- **Frontend/UI**: Playwright — Navigate, interact, assert DOM, screenshot
- **Static assets**: Bash (curl -I) — Assert HTTP 200
- **Library/Module**: Bash (bun/node) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — baseline + scaffolding + VPS access):
├── T1: Crear spec kit structure + scripts
├── T2: Reproducir errores producción (curl + SSH logs + browser)
├── T3: Crear matriz de errores
└── T4: Stash working tree changes + crear branch clean

Wave 2 (P0 — assets + PWA + async listener):
├── T5: Corregir assets 404 y static serving
├── T6: Corregir manifest + PWA/precache
├── T7: Crear check-static-assets.mjs
└── T8: Diagnosticar async listener error

Wave 3 (P0 — API errors, MAX PARALLEL):
├── T9: Corregir 401 notifications
├── T10: Corregir 500 users/:id
├── T11: Corregir 400 work-requests
├── T12: Corregir 400 documents
├── T13: Corregir DialogTitle Radix
└── T14: Tests de regresión API

Wave 4 (P1 — WebAuthn + biometría):
├── T15: Contrato WebAuthn + endpoints backend
├── T16: UI passkey/login + detección soporte
└── T17: Tests WebAuthn

Wave 5 (P1 — Functional slices, MAX PARALLEL):
├── T18: Vehículos — fotos, documentos, readiness
├── T19: Herramientas — fotos, documentos, checklists
├── T20: Tests de integración vehículos
└── T21: Tests de integración herramientas

Wave 6 (P2 — Gates finales + deploy):
├── T22: typecheck + lint + test + build + contracts + verify
├── T23: Smoke tests producción
├── T24: Redeploy con rollback
└── T25: Post-fix report

Critical Path: T2 → T5 → T9 → T18/T19 → T22 → T23 → T24
```

### Dependency Matrix
- **T1-T4**: — — T5-T8
- **T5**: T1-T4 — T6, T7
- **T6**: T5 — T7
- **T7**: T5, T6 — T22
- **T8**: T1-T4 — T22
- **T9-T14**: T1-T4 — T22, T15
- **T15**: T9 — T16, T17
- **T16**: T15 — T17
- **T17**: T15, T16 — T22
- **T18-T19**: T9-T14 — T20, T21
- **T20-T21**: T18, T19 — T22
- **T22**: T7, T8, T14, T17, T20, T21 — T23
- **T23-T24**: T22 — T25
- **T25**: T23, T24 — DONE

---

## TODOs

- [x] 1. **Crear spec kit 005 structure + scripts**

  **What to do**:
  - Create `specs/005-post-deploy-hotfix-and-real-implementation/` directory
  - Create `spec.md`, `tasks.md`, `plan.md` with initial structure
  - Create `scripts/check-static-assets.mjs` — script that checks all required static assets exist and returns exit code 1 if any missing
  - Copy PROMPT_SPEC_005 as `specs/005-post-deploy-hotfix-and-real-implementation/original-prompt.md`

  **Must NOT do**:
  - No empty files — each file must have meaningful content
  - No commit artifacts or draft files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: T2, T3, T4
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] spec/005 directory exists with 4 files
  - [ ] check-static-assets.mjs validates all icons exist

  **QA Scenarios**:
  ```
  Scenario: Verify spec kit structure created
    Tool: Bash
    Steps:
      1. ls specs/005-post-deploy-hotfix-and-real-implementation/
      2. head -5 specs/005-post-deploy-hotfix-and-real-implementation/spec.md
    Expected Result: Directory exists with spec.md, tasks.md, plan.md
    Evidence: .sisyphus/evidence/task-1-spec-kit.txt

  Scenario: Verify check-static-assets.mjs works
    Tool: Bash
    Steps:
      1. node scripts/check-static-assets.mjs
    Expected Result: Exit code 0, lists all found assets
    Evidence: .sisyphus/evidence/task-1-check-assets.txt
  ```

  **Commit**: YES
  - Message: `chore(spec): create spec-005 kit structure and asset checker`

- [ ] 2. **Reproducir errores producción (curl + SSH logs + browser)**

  **What to do**:
  - Run curl commands against production URLs to reproduce 404s
  - SSH into VPS and run `docker compose logs --tail=300 backend`, `docker compose logs --tail=300 frontend`, `docker compose logs --tail=300 nginx` or `pm2 logs` equivalents
  - Check backend logs for 500/400 errors with request paths
  - Check nginx error.log for asset 404s
  - Open browser to login and capture console errors (async listener)
  - Record ALL findings in reproduction log

  **Must NOT do**:
  - No guessing — actual reproduction required
  - No fixes until reproduction is complete

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: T3
  - **Blocked By**: T1

  **Acceptance Criteria**:
  - [ ] All production errors reproduced and logged
  - [ ] Backend logs reviewed for stack traces
  - [ ] Nginx error.log reviewed for 404 patterns

  **QA Scenarios**:
  ```
  Scenario: Reproduce asset 404 via curl
    Tool: Bash
    Steps:
      1. curl -I https://cermontsas.shop/favicon.png
      2. curl -I https://cermontsas.shop/icons/icon-192.png
      3. curl -I https://cermontsas.shop/icons/icon-512.png
      4. curl -I https://cermontsas.shop/manifest.json
    Expected Result: Record status codes for each
    Evidence: .sisyphus/evidence/task-2-curl-results.txt
  ```
  ```
  Scenario: SSH VPS backend log review
    Tool: Bash
    Preconditions: SSH access configured
    Steps:
      1. ssh diego@cermontsas.shop "pm2 logs cermont-backend --lines 200" 2>/dev/null
      2. ssh diego@cermontsas.shop "tail -100 /var/log/nginx/error.log" 2>/dev/null
    Expected Result: Capture error lines for analysis
    Evidence: .sisyphus/evidence/task-2-vps-logs.txt
  ```

  **Commit**: YES (groups with T3)
  - Message: `docs(spec): production error reproduction log`

- [ ] 3. **Crear matriz de errores de producción**

  **What to do**:
  - Create `specs/005-post-deploy-hotfix-and-real-implementation/production-error-matrix.md`
  - Table with columns: Error | Ruta | Severidad | Reproducible | Causa raíz | Evidencia | Fix | Test | Estado
  - Populate from all findings in T2
  - Include: assets 404, manifest/PWA, async listener, 401 notifications, 500 users, 400 work-requests, 400 documents, DialogTitle

  **Must NOT do**:
  - No empty cells — every row must be complete

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Blocks**: T5-T14
  - **Blocked By**: T2

  **Acceptance Criteria**:
  - [ ] Matrix has rows for ALL known errors
  - [ ] Each row has severity, root cause, evidence reference

  **QA Scenarios**:
  ```
  Scenario: Verify matrix completeness
    Tool: Bash
    Steps:
      1. grep -c "|" specs/005-post-deploy-hotfix-and-real-implementation/production-error-matrix.md
      2. grep "P0\|P1" specs/005-post-deploy-hotfix-and-real-implementation/production-error-matrix.md | wc -l
    Expected Result: Matrix has all P0/P1 errors classified
    Evidence: .sisyphus/evidence/task-3-matrix-ok.txt
  ```

  **Commit**: YES (groups with T2)

- [ ] 4. **Stash working tree + crear branch clean**

  **What to do**:
  - Stash current working tree changes: `git stash --include-untracked`
  - Create new branch from current commit: `git checkout -b hotfix/spec-005-post-deploy 7b5f415`
  - Verify clean working tree
  - Run baseline gates: `npm run typecheck && npm run lint && npm test && npm run build`

  **Must NOT do**:
  - No losing WIP changes
  - No force pushing

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: T5-T14
  - **Blocked By**: T1

  **Acceptance Criteria**:
  - [ ] Branch hotfix/spec-005-post-deploy created
  - [ ] git status is clean
  - [ ] All baseline gates pass

  **QA Scenarios**:
  ```
  Scenario: Verify branch and gate status
    Tool: Bash
    Steps:
      1. git branch --show-current
      2. git status --short
      3. npm run typecheck
    Expected Result: Branch is hotfix/spec-005-post-deploy, clean working tree, typecheck PASS
    Evidence: .sisyphus/evidence/task-4-baseline.txt
  ```

  **Commit**: NO (no code changes)

- [x] 5. **Corregir assets 404 y static serving**

  **What to do**:
  - SSH into VPS and identify why existing `frontend/public/icons/*.png` are 404
  - Check if Next.js standalone build output includes `public/` folder
  - Check nginx config for static file serving rules
  - Fix root cause: could be:
    a) Nginx not configured to serve `/icons/` and `/favicon.png` from Next.js `public/`
    b) Standalone `.next/` output missing static assets
    c) Missing `public` dir copy in deployment script
  - Verify ALL required assets exist locally:
    - `frontend/public/favicon.png`
    - `frontend/public/icons/logo-cermont.png`
    - `frontend/public/icons/icon-192.png`
    - `frontend/public/icons/icon-512.png`
    - `frontend/public/icons/maskable-icon-192.png`
    - `frontend/public/icons/maskable-icon-512.png`
  - If any missing locally, create placeholder SVGs/PNGs and document

  **Must NOT do**:
  - No removing security headers to serve assets
  - No symlinks that bypass nginx

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: T6, T7
  - **Blocked By**: T4

  **Acceptance Criteria**:
  - [ ] curl -I https://cermontsas.shop/favicon.png → 200
  - [ ] curl -I https://cermontsas.shop/icons/icon-192.png → 200
  - [ ] curl -I https://cermontsas.shop/icons/icon-512.png → 200
  - [ ] curl -I https://cermontsas.shop/icons/maskable-icon-192.png → 200
  - [ ] curl -I https://cermontsas.shop/icons/maskable-icon-512.png → 200
  - [ ] curl -I https://cermontsas.shop/icons/logo-cermont.png → 200

  **QA Scenarios**:
  ```
  Scenario: Verify all static assets return 200
    Tool: Bash
    Steps:
      1. for f in favicon.png icons/logo-cermont.png icons/icon-192.png icons/icon-512.png icons/maskable-icon-192.png icons/maskable-icon-512.png; do curl -sI "https://cermontsas.shop/$f" | head -1; done
    Expected Result: All return HTTP/2 200
    Evidence: .sisyphus/evidence/task-5-assets-200.txt

  Scenario: Verify production build includes public assets
    Tool: Bash
    Steps:
      1. npm run build -w frontend
      2. ls -la frontend/.next/standalone/frontend/public/icons/ 2>/dev/null || echo "check build output structure"
    Expected Result: Build copies public/ to standalone output
    Evidence: .sisyphus/evidence/task-5-build-output.txt
  ```

  **Commit**: YES
  - Message: `fix(assets): serve static icons and favicon correctly in production`

- [x] 6. **Corregir manifest + PWA/precache**

  **What to do**:
  - Verify `frontend/public/manifest.json` has correct icon paths (all relative to /)
  - Create `frontend/src/app/manifest.ts` for Next.js metadata API generation of manifest
  - Review serwist configuration in `frontend/next.config.ts`:
    - Verify `withSerwist` wrapper doesn't break static serving
    - Check that precache manifest excludes non-existent files
  - If `manifest.webmanifest` is expected by some browsers, create redirect or copy
  - Verify PWA registration doesn't fail due to missing icons

  **Must NOT do**:
  - No removing service worker validation
  - No adding Webpack/Next.js plugins without understanding

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`next-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5)
  - **Blocks**: T7
  - **Blocked By**: T4

  **Acceptance Criteria**:
  - [ ] curl -I https://cermontsas.shop/manifest.json → 200
  - [ ] manifest references only existing assets
  - [ ] serwist build does not fail

  **QA Scenarios**:
  ```
  Scenario: Verify manifest is valid and served correctly
    Tool: Bash
    Steps:
      1. curl -s https://cermontsas.shop/manifest.json | python3 -c "import json,sys; d=json.load(sys.stdin); [print(i['src']) for i in d['icons']]"
    Expected Result: All icon src paths listed
    Evidence: .sisyphus/evidence/task-6-manifest.txt

  Scenario: Verify build with serwist
    Tool: Bash
    Steps:
      1. npm run build -w frontend 2>&1 | tail -20
    Expected Result: Build succeeds, serwist compiles
    Evidence: .sisyphus/evidence/task-6-build.txt
  ```

  **Commit**: YES (groups with T5, T7)
  - Message: `fix(pwa): correct manifest and serwist precache configuration`

- [x] 7. **Crear script check-static-assets.mjs**

  **What to do**:
  - Create `scripts/check-static-assets.mjs` that:
    - Lists all required static assets
    - Checks each exists in `frontend/public/`
    - Returns exit code 0 if all found, 1 if any missing
    - Prints report of found/missing assets
  - Required assets to check:
    - favicon.png, robots.txt, manifest.json
    - icons/icon-192.png, icons/icon-512.png
    - icons/maskable-icon-192.png, icons/maskable-icon-512.png
    - icons/logo-cermont.png, icons/logo-cermont.svg
    - fonts/outfit-*.ttf

  **Must NOT do**:
  - No shell scripts — use Node.js ESM

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T6)
  - **Blocks**: T22
  - **Blocked By**: T5, T6

  **Acceptance Criteria**:
  - [ ] node scripts/check-static-assets.mjs exits 0 when all present
  - [ ] Script produces readable report

  **QA Scenarios**:
  ```
  Scenario: Script finds all assets
    Tool: Bash
    Steps:
      1. node scripts/check-static-assets.mjs
    Expected Result: Exit 0, "All required static assets found"
    Evidence: .sisyphus/evidence/task-7-check-pass.txt
  ```

  **Commit**: YES (groups with T5, T6)

- [x] 8. **Diagnosticar async listener error**

  **What to do**:
  - Search for patterns: `return true` in message listeners, `addEventListener.*message`, `chrome.runtime`, `postMessage`, `navigator.credentials`
  - Reproduce in incognito mode without extensions
  - Test with service worker disabled via `serviceWorkers: "block"` in Playwright
  - If reproducible without extensions: it's an app bug
  - If only with extensions: document as non-app with evidence
  - If SW-related: fix the waitUntil/promise handling
  - Search in: `frontend/src/app/serwist-provider.tsx`, `frontend/src/lib/pwa/`, any service-worker code
  - Check for AbortError, NotAllowedError, NotSupportedError handling

  **Must NOT do**:
  - No blaming extensions without reproducing in incognito

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5-T7)
  - **Blocks**: T22
  - **Blocked By**: T4

  **Acceptance Criteria**:
  - [ ] Root cause identified and documented
  - [ ] If app bug: fixed
  - [ ] If extension: documented with evidence

  **QA Scenarios**:
  ```
  Scenario: Reproduce in incognito
    Tool: Playwright
    Preconditions: Launch browser in incognito context
    Steps:
      1. Navigate to https://cermontsas.shop/login
      2. Listen for console errors with "listener indicated" pattern
      3. Navigate to /reports/analytics
    Expected Result: Either error reproduces (app bug) or doesn't (extension)
    Evidence: .sisyphus/evidence/task-8-async-listener-test.txt
  ```

  **Commit**: YES
  - Message: `fix(sw): handle async message listener promise rejection`

- [x] 9. **Corregir 401 notifications**

  **What to do**:
  - Identify the frontend code that calls `/api/backend/analytics/notifications`
  - The backend route is `GET /api/notifications` (mounted at `/api/notifications` in Express)
  - Through Next.js rewrite `/api/backend/:path*` → `http://127.0.0.1:4000/api/:path*`, calling `/api/backend/analytics/notifications` becomes `/api/analytics/notifications` — NOT `/api/notifications`
  - Fix options:
    a) Change frontend API call to `/api/backend/notifications` (correct)
    b) Or add rewrite rule in next.config.ts for `/api/backend/notifications/:path*`
  - Also fix: ensure notifications hook doesn't call the endpoint before user is authenticated
  - Check for `enabled: Boolean(user)` in the TanStack Query hook
  - If role lacks notification permission: adjust UI to show forbidden state gracefully

  **Must NOT do**:
  - No removing the auth check from the notification endpoint
  - No making notification endpoint public

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T10, T11, T12, T13)
  - **Blocks**: T15, T22
  - **Blocked By**: T4

  **Acceptance Criteria**:
  - [ ] `curl -H "Authorization: Bearer $TOKEN" https://cermontsas.shop/api/backend/notifications?limit=5` → 200
  - [ ] Login page does not trigger 401 notification calls
  - [ ] After login, notifications work without errors

  **QA Scenarios**:
  ```
  Scenario: Notifications work with valid session
    Tool: Bash
    Steps:
      1. Login via API to get token
      2. curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "https://cermontsas.shop/api/backend/notifications?limit=5"
    Expected Result: HTTP 200
    Evidence: .sisyphus/evidence/task-9-notifications-200.txt

  Scenario: No 401 spam on login page
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Capture all network requests for 60s
      3. Filter for 401 responses on /api/backend/notifications
    Expected Result: Zero 401 on notifications before login
    Evidence: .sisyphus/evidence/task-9-no-401-spam.txt
  ```

  **Commit**: YES
  - Message: `fix(notifications): correct API route and guard unauthenticated calls`

- [x] 10. **Corregir 500 users/:id**

  **What to do**:
  - Find backend `UserIdParamsSchema` in `packages/shared-types/src/schemas/`
  - Verify it validates MongoDB ObjectId format (24 hex chars)
  - If the 500 is from an invalid ID (e.g., `6a32adb0ffecdac02881d6db` might be 23 chars), the validation should catch it
  - But if the 500 is from a valid ID not found in DB:
    - The controller should return 404 `USER_NOT_FOUND` instead of 500
    - Check the user service/controller for proper error handling
  - Add frontend guard: don't call `/api/users/:id` with empty/invalid ID
  - Ensure error handler returns `INVALID_USER_ID` (400) or `USER_NOT_FOUND` (404), never 500

  **Must NOT do**:
  - No swallowing errors
  - No returning 500 for expected errors

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T11, T12, T13)
  - **Blocks**: T22
  - **Blocked By**: T4

  **Acceptance Criteria**:
  - [ ] GET /api/users/invalid-id → 400 INVALID_USER_ID
  - [ ] GET /api/users/000000000000000000000000 (valid ObjectId, no match) → 404 USER_NOT_FOUND
  - [ ] GET /api/users/valid-id → 200
  - [ ] Frontend never calls with empty/invalid ID

  **QA Scenarios**:
  ```
  Scenario: Invalid user ID returns 400
    Tool: Bash
    Steps:
      1. curl -s -H "Authorization: Bearer $TOKEN" "https://cermontsas.shop/api/backend/users/invalid" | python3 -c "import json,sys; print(json.load(sys.stdin))"
    Expected Result: status 400, error.code = "INVALID_USER_ID"
    Evidence: .sisyphus/evidence/task-10-user-400.txt

  Scenario: Valid ObjectId but not found returns 404
    Tool: Bash
    Steps:
      1. curl -s -H "Authorization: Bearer $TOKEN" "https://cermontsas.shop/api/backend/users/000000000000000000000000" | python3 -c "import json,sys; print(json.load(sys.stdin))"
    Expected Result: status 404, error.code = "USER_NOT_FOUND"
    Evidence: .sisyphus/evidence/task-10-user-404.txt
  ```

  **Commit**: YES
  - Message: `fix(users): handle invalid ObjectId with 400 and not-found with 404`

- [x] 11. **Corregir 400 work-requests**

  **What to do**:
  - Find `CreateWorkRequestSchema` in `packages/shared-types/src/schemas/`
  - Capture the actual JSON payload the frontend sends via browser DevTools or Playwright
  - Compare field-by-field:
    - Field names match exactly
    - Enum values are correct (serviceType, urgency, sourceChannel)
    - Date formats are ISO 8601
    - Required fields are present
  - Fix frontend to send exactly what schema expects
  - Ensure backend returns Zod validation errors with field-level detail (not generic 400)

  **Must NOT do**:
  - No changing the Zod schema to match wrong frontend format
  - No removing validation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`zod`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T10, T12, T13)
  - **Blocks**: T22
  - **Blocked By**: T4

  **Acceptance Criteria**:
  - [ ] POST /api/work-requests with valid payload → 201/200
  - [ ] POST with invalid payload → 400 with field-level error details
  - [ ] Frontend form submits without 400

  **QA Scenarios**:
  ```
  Scenario: Create work request with valid data
    Tool: Bash
    Steps:
      1. Login → get token
      2. curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"requesterName":"Test","requesterEmail":"test@test.com","requesterPhone":"3000000000","clientName":"Client","serviceSite":"Site","serviceType":"maintenance","sourceChannel":"email","shortDescription":"Test WR","description":"Test","requiresSiteVisit":false,"urgency":"medium","tags":[],"classifications":[],"initialEvidences":[],"customFields":{}}' "https://cermontsas.shop/api/backend/work-requests"
    Expected Result: HTTP 201
    Evidence: .sisyphus/evidence/task-11-wr-201.txt
  ```

  **Commit**: YES
  - Message: `fix(work-requests): align frontend payload with CreateWorkRequestSchema`

- [x] 12. **Corregir 400 documents**

  **What to do**:
  - Find `UploadDocumentSchema` in `packages/shared-types/src/schemas/`
  - Backend POST /api/documents uses:
    - `upload.single("file")` (multer middleware expecting field name "file")
    - `validateBody(UploadDocumentSchema)`
    - `processUploadedFile` middleware
  - Check frontend FormData construction:
    - Field name must be "file" (not "document" or "attachment")
    - Must include `ownerType`, `ownerId`, `category`
    - Content-Type must be `multipart/form-data`
  - Fix any mismatch
  - Ensure backend returns clear validation errors

  **Must NOT do**:
  - No Swallowing multer errors (file too large, wrong MIME)
  - No making upload endpoint public

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T10, T11, T13)
  - **Blocks**: T22
  - **Blocked By**: T4

  **Acceptance Criteria**:
  - [ ] POST /api/documents with multipart file → 201
  - [ ] Missing file field → 400 with clear message
  - [ ] Wrong MIME → 400

  **QA Scenarios**:
  ```
  Scenario: Upload document with valid PDF
    Tool: Bash
    Steps:
      1. echo "test" > /tmp/test.pdf
      2. curl -s -X POST -H "Authorization: Bearer $TOKEN" -F "file=@/tmp/test.pdf" -F "ownerType=serviceCase" -F "ownerId=000000000000000000000000" -F "category=report_support" "https://cermontsas.shop/api/backend/documents"
    Expected Result: HTTP 201
    Evidence: .sisyphus/evidence/task-12-doc-201.txt
  ```

  **Commit**: YES
  - Message: `fix(documents): correct multipart upload field mapping`

- [x] 13. **Corregir DialogTitle Radix**

  **What to do**:
  - Find ALL files using `DialogContent` from Radix:
    - Search `frontend/src/` for `@radix-ui/react-dialog` and `DialogContent`
  - For each `DialogContent`, add a `DialogTitle` (visible or wrapped in `VisuallyHidden`)
  - Import `DialogTitle` from `@radix-ui/react-dialog`
  - If `VisuallyHidden` is already imported from Radix, use it for modal labels where visual title isn't needed

  **Must NOT do**:
  - No removing existing content inside DialogContent
  - No breaking modal functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`accessibility`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9-T12)
  - **Blocks**: T22
  - **Blocked By**: T4

  **Acceptance Criteria**:
  - [ ] No console warnings about missing DialogTitle
  - [ ] All modals have accessible labels

  **QA Scenarios**:
  ```
  Scenario: No DialogContent warnings in console
    Tool: Bash
    Steps:
      1. grep -r "DialogContent" frontend/src --include="*.tsx" -l
      2. For each file found, verify DialogTitle is imported and used
    Expected Result: All DialogContent have DialogTitle
    Evidence: .sisyphus/evidence/task-13-dialog-title-audit.txt

  Scenario: Build passes after fix
    Tool: Bash
    Steps:
      1. npm run typecheck -w frontend
    Expected Result: TypeScript compiles without errors
    Evidence: .sisyphus/evidence/task-13-typecheck.txt
  ```

  **Commit**: YES (groups with T9-T12)
  - Message: `fix(a11y): add DialogTitle to all DialogContent`

- [ ] 14. **Tests de regresión API**

  **What to do**:
  - Create `specs/005-post-deploy-hotfix-and-real-implementation/regression-test-plan.md`
  - Add backend integration tests for each fix:
    - `GET /notifications` — returns 200 with valid token
    - `GET /users/:id` — returns 400 for invalid ID, 404 for not found, 200 for valid
    - `POST /work-requests` — returns 201 for valid, 400 for invalid
    - `POST /documents` — returns 201 for valid multipart, 400 for missing fields
  - Add frontend unit tests for:
    - Notification hook doesn't call API without user
    - Work request form sends correct payload
    - Document upload constructs correct FormData
  - Add Playwright E2E scenarios:
    - No 401 notification spam on login
    - Work request creation flow
    - Document upload flow

  **Must NOT do**:
  - No duplicated tests (if test already exists, reference it)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vitest`, `playwright-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9-T13)
  - **Blocks**: T22
  - **Blocked By**: T9-T13

  **Acceptance Criteria**:
  - [ ] All regression tests pass: `npm test`
  - [ ] E2E tests pass: `npm run test:e2e -w frontend`
  - [ ] Regression test plan documented

  **QA Scenarios**:
  ```
  Scenario: Run regression test suite
    Tool: Bash
    Steps:
      1. npm test 2>&1 | tail -20
    Expected Result: All tests pass, no regressions
    Evidence: .sisyphus/evidence/task-14-regression-tests.txt
  ```

  **Commit**: YES
  - Message: `test(regression): add integration tests for hotfix endpoints`

- [ ] 15. **Contrato WebAuthn + endpoints backend**

  **What to do**:
  - Create `packages/shared-types/src/schemas/webauthn.schema.ts` with Zod schemas:
    - `WebAuthnRegistrationOptionsSchema`
    - `WebAuthnRegistrationVerifySchema`
    - `WebAuthnLoginOptionsSchema`
    - `WebAuthnLoginVerifySchema`
    - `WebAuthnDeviceSchema`
  - Create Express backend routes:
    - `POST /api/auth/webauthn/register/options` — generate registration challenge
    - `POST /api/auth/webauthn/register/verify` — verify registration
    - `POST /api/auth/webauthn/login/options` — generate authentication challenge
    - `POST /api/auth/webauthn/login/verify` — verify authentication
    - `GET /api/auth/webauthn/devices` — list user's registered devices
    - `DELETE /api/auth/webauthn/devices/:id` — revoke a device
  - Create Mongoose model `WebAuthnDevice` storing: credentialId, publicKey, counter, deviceName, lastUsedAt
  - Backend requirements:
    - RP ID: `cermontsas.shop`
    - Origin: `https://cermontsas.shop`
    - Challenges must be time-limited (5 min)
    - Counter must be verified on authentication
  - **If `@simplewebauthn` package is not installed:**
    - Use `npm install @simplewebauthn/server@latest @simplewebauthn/browser@latest` (requires approval)
    - Or implement raw WebAuthn using `crypto.subtle` and standard WebAuthn API
    - Document dependency decision clearly

  **Must NOT do**:
  - No implementing fake/pretend biometric
  - No storing private keys or raw fingerprints
  - No skipping HTTPS requirement

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`nodejs-backend-patterns`, `zod`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T18, T19)
  - **Blocks**: T16, T17
  - **Blocked By**: T9

  **Acceptance Criteria**:
  - [ ] WebAuthn registration options endpoint returns challenge
  - [ ] Registration verify validates and stores credential
  - [ ] Login options returns allowCredentials for registered devices
  - [ ] Login verify validates assertion
  - [ ] Device list and revocation work
  - [ ] npm run typecheck passes
  - [ ] npm test passes

  **QA Scenarios**:
  ```
  Scenario: WebAuthn registration options
    Tool: Bash
    Steps:
      1. POST /api/auth/webauthn/register/options with auth token
      2. Assert response contains challenge, rp, user info
    Expected Result: 200 with registration options (challenge, rp.id="cermontsas.shop")
    Evidence: .sisyphus/evidence/task-15-webauthn-options.txt
  ```

  **Commit**: YES
  - Message: `feat(webauthn): add passkey authentication schemas and backend endpoints`

- [ ] 16. **UI passkey/login + detección de soporte**

  **What to do**:
  - Add "Ingresar con huella/passkey" button on `/login` page
  - Add "Activar acceso biométrico" button in `/profile` settings
  - Detect platform authenticator availability:
    ```ts
    const available = await PublicKeyCredential
      .isUserVerifyingPlatformAuthenticatorAvailable();
    ```
  - If unavailable: show informative message with fallback to normal login
  - Handle errors: `AbortError`, `NotAllowedError`, `NotSupportedError` with user-friendly messages
  - UI states: loading, unsupported, available, registered, error

  **Must NOT do**:
  - No hiding the login button if passkey unavailable
  - No showing technical error messages to end users

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T15, T18, T19)
  - **Blocks**: T17, T22
  - **Blocked By**: T15

  **Acceptance Criteria**:
  - [ ] Login page shows passkey button on supported browsers
  - [ ] Passkey button hidden on unsupported browsers with fallback
  - [ ] Registration flow in /profile works
  - [ ] Error states are user-friendly

  **QA Scenarios**:
  ```
  Scenario: Passkey detection on login page
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Check for button with text "huella" or "passkey"
      3. Check console for detection errors
    Expected Result: Button present if supported, hidden gracefully if not
    Evidence: .sisyphus/evidence/task-16-passkey-ui.txt
  ```

  **Commit**: YES (groups with T15)
  - Message: `feat(webauthn): add passkey UI for login and profile settings`

- [ ] 17. **Tests WebAuthn**

  **What to do**:
  - Add backend unit tests for WebAuthn:
    - Registration options generation
    - Registration verification (mock credential)
    - Login options for registered user
    - Login verification
    - Device revocation
  - Add frontend tests:
    - Detection logic
    - UI rendering for all states
    - Error handling
  - Mock `@simplewebauthn` functions for backend tests
  - Mock `PublicKeyCredential` for frontend tests

  **Must NOT do**:
  - No calling real WebAuthn API in unit tests

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T18, T19)
  - **Blocks**: T22
  - **Blocked By**: T15, T16

  **Acceptance Criteria**:
  - [ ] npm test — WebAuthn tests pass
  - [ ] Backend tests cover success + error paths
  - [ ] Frontend tests cover UI states

  **QA Scenarios**:
  ```
  Scenario: WebAuthn test suite
    Tool: Bash
    Steps:
      1. npm test -w backend -- -t "webauthn"
      2. npm test -w frontend -- -t "passkey|webauthn"
    Expected Result: All WebAuthn tests pass
    Evidence: .sisyphus/evidence/task-17-webauthn-tests.txt
  ```

  **Commit**: YES (groups with T15)
  - Message: `test(webauthn): add unit tests for passkey authentication`

- [ ] 18. **Vehículos — fotos, documentos, readiness**

  **What to do**:
  - Extend existing vehicle module (`/fleet`):
    - `VehiclePhotoSection` — galería de fotos con subida (cámara/gallery), thumbnail grid
    - `VehicleDocumentSection` — documentos PDF con SOAT, tecnomecánica, seguro
    - Readiness score badge (ready/incomplete/expired/blocked)
    - Document expiry alerts (próximo a vencer / vencido)
    - Primary photo selector
    - Upload endpoints for vehicle photos and documents
  - Wire up missing backend endpoints:
    - `POST /api/fleet/:id/photos`
    - `POST /api/fleet/:id/documents`
    - `GET /api/fleet/:id/attachments`
  - Use existing `FileAsset` model (entityType: "vehicle")
  - Perfil profesional de vehículo (ya existe parcialmente en `/api/fleet/:id/profile`)

  **Must NOT do**:
  - No duplicating code — extend existing vehicle components
  - No breaking existing fleet module

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`zod`, `vercel-react-best-practices`, `tailwind-css-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T15, T16, T17, T19)
  - **Blocks**: T20
  - **Blocked By**: T9-T14

  **Acceptance Criteria**:
  - [ ] Vehicle detail page shows photo gallery
  - [ ] Vehicle detail shows document list with expiry dates
  - [ ] Readiness badge visible on fleet list
  - [ ] Upload photo from camera/gallery works
  - [ ] Upload PDF document works
  - [ ] Expiry alerts display correctly
  - [ ] npm test passes
  - [ ] npm run build passes

  **QA Scenarios**:
  ```
  Scenario: Vehicle profile with photos and documents
    Tool: Playwright
    Steps:
      1. Login as gerente
      2. Navigate to /fleet/[vehicle-id]
      3. Verify photo gallery renders
      4. Verify document list renders with SOAT/technomechanics
      5. Click "Subir imagen" and verify upload flow
    Expected Result: All sections render, upload works
    Evidence: .sisyphus/evidence/task-18-vehicle-profile.txt
  ```

  **Commit**: YES
  - Message: `feat(fleet): vehicle photos, documents, and readiness display`

- [ ] 19. **Herramientas — fotos, documentos, checklists**

  **What to do**:
  - Extend existing tool/asset module (`/assets`):
    - `ToolPhotoSection` — galería de fotos con subida (cámara/gallery)
    - `ToolDocumentSection` — documentos PDF (ficha técnica, manual, certificado calibración)
    - Tool readiness: disponibilidad, bloqueo por documento vencido
    - Upload endpoints for tool photos and documents
  - Add/verify backend endpoints:
    - `POST /api/assets/:id/photos`
    - `POST /api/assets/:id/documents`
    - `GET /api/assets/:id/attachments`
  - Use existing `FileAsset` model (entityType: "asset")
  - Add tool checklist integration:
    - Crear checklist items para verificación pre-operacional
    - Items obligatorios y bloqueantes
  - Perfil profesional de herramienta (ya existe parcialmente en `/api/assets/:id/profile`)

  **Must NOT do**:
  - No duplicating code — extend existing asset components
  - No breaking existing asset module

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`zod`, `vercel-react-best-practices`, `tailwind-css-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T15, T16, T17, T18)
  - **Blocks**: T21
  - **Blocked By**: T9-T14

  **Acceptance Criteria**:
  - [ ] Tool detail page shows photo gallery
  - [ ] Tool detail shows document list with expiry/calibration dates
  - [ ] Readiness/availability badge visible
  - [ ] Upload photo from camera/gallery works
  - [ ] Upload PDF document works
  - [ ] Checklist items render correctly
  - [ ] npm test passes
  - [ ] npm run build passes

  **QA Scenarios**:
  ```
  Scenario: Tool profile with photos, documents, and checklists
    Tool: Playwright
    Steps:
      1. Login
      2. Navigate to /resources/[asset-id]
      3. Verify photo gallery renders
      4. Verify document list renders
      5. Verify checklist section renders with items
    Expected Result: All sections render correctly
    Evidence: .sisyphus/evidence/task-19-tool-profile.txt
  ```

  **Commit**: YES
  - Message: `feat(assets): tool photos, documents, and pre-operational checklists`

- [ ] 20. **Tests de integración vehículos**

  **What to do**:
  - Add backend integration tests:
    - POST /api/fleet/:id/photos → 201
    - POST /api/fleet/:id/documents → 201
    - GET /api/fleet/:id/attachments → 200
    - Invalid fleet ID → 400
    - Unauthorized → 401
  - Add frontend tests:
    - VehiclePhotoSection renders empty and populated states
    - VehicleDocumentSection renders document list
    - Readiness score calculations
    - Upload dialog flow

  **Must NOT do**:
  - No testing real file uploads in frontend unit tests

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vitest`, `playwright-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T21)
  - **Blocks**: T22
  - **Blocked By**: T18

  **Acceptance Criteria**:
  - [ ] All vehicle integration tests pass
  - [ ] npm test — fleet tests pass

  **QA Scenarios**:
  ```
  Scenario: Vehicle integration test suite
    Tool: Bash
    Steps:
      1. npm test -w backend -- -t "fleet|vehicle"
    Expected Result: All fleet tests pass
    Evidence: .sisyphus/evidence/task-20-vehicle-tests.txt
  ```

  **Commit**: YES (groups with T18)

- [ ] 21. **Tests de integración herramientas**

  **What to do**:
  - Add backend integration tests:
    - POST /api/assets/:id/photos → 201
    - POST /api/assets/:id/documents → 201
    - GET /api/assets/:id/attachments → 200
    - Invalid asset ID → 400
    - Unauthorized → 401
  - Add frontend tests:
    - ToolPhotoSection renders empty and populated states
    - ToolDocumentSection renders document list
    - Asset readiness calculations
    - Checklist item rendering

  **Must NOT do**:
  - No testing real file uploads in frontend unit tests

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vitest`, `playwright-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T20)
  - **Blocks**: T22
  - **Blocked By**: T19

  **Acceptance Criteria**:
  - [ ] All asset integration tests pass
  - [ ] npm test — asset tests pass

  **QA Scenarios**:
  ```
  Scenario: Asset/tool integration test suite
    Tool: Bash
    Steps:
      1. npm test -w backend -- -t "asset|tool"
    Expected Result: All asset tests pass
    Evidence: .sisyphus/evidence/task-21-asset-tests.txt
  ```

  **Commit**: YES (groups with T19)

- [ ] 22. **Gates finales: typecheck + lint + test + build + contracts + verify**

  **What to do**:
  - Run ALL quality gates in sequence:
    1. `npm run typecheck` — 7 workspaces
    2. `npm run lint` — all packages
    3. `npm test` — all packages
    4. `npm run build` — all packages
    5. `npm run contracts:check` — shared contract snapshots
    6. `npm run quality:strict` — quality baselines
    7. `npm run verify` — typecheck + build
  - Fix any failures immediately
  - Document any pre-existing failures that aren't from this branch

  **Must NOT do**:
  - No skipping gates
  - No modifying test baselines to hide failures

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential gates)
  - **Blocks**: T23
  - **Blocked By**: T7, T8, T14, T17, T20, T21

  **Acceptance Criteria**:
  - [ ] typecheck PASS
  - [ ] lint PASS
  - [ ] test PASS
  - [ ] build PASS
  - [ ] contracts:check PASS
  - [ ] quality:strict PASS
  - [ ] verify PASS

  **QA Scenarios**:
  ```
  Scenario: All gates pass
    Tool: Bash
    Steps:
      1. npm run typecheck; npm run lint; npm test; npm run build; npm run contracts:check; npm run verify
    Expected Result: ALL gates PASS
    Evidence: .sisyphus/evidence/task-22-gates.txt
  ```

  **Commit**: NO (verification only)

- [ ] 23. **Smoke tests producción**

  **What to do**:
  - Using SSH, deploy to VPS staging location or production with rollback ready
  - Run smoke tests from external perspective:
    1. Open https://cermontsas.shop/login
    2. Verify no 404 of assets
    3. Login with valid credentials
    4. Verify notifications load without 401
    5. Navigate to users page
    6. Create a work request
    7. Upload a document
    8. Open a modal (verify no DialogTitle warning)
    9. Navigate to fleet (verify vehicle profile)
    10. Navigate to assets (verify tool profile)
    11. Logout
  - Check browser console for errors
  - Check backend logs for 4xx/5xx

  **Must NOT do**:
  - No deploying without rollback plan
  - No verifying only in local, must test in production

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential)
  - **Blocks**: T24
  - **Blocked By**: T22

  **Acceptance Criteria**:
  - [ ] All smoke test steps pass
  - [ ] No console errors
  - [ ] No backend 4xx/5xx from user actions
  - [ ] No 404 on assets

  **QA Scenarios**:
  ```
  Scenario: Production smoke test
    Tool: Bash
    Steps:
      1. curl -I https://cermontsas.shop/favicon.png
      2. curl -I https://cermontsas.shop/login
    Expected Result: HTTP 200 for both
    Evidence: .sisyphus/evidence/task-23-smoke-test.txt
  ```

  **Commit**: NO

- [ ] 24. **Redeploy con rollback**

  **What to do**:
  - SSH into VPS
  - Backup current state: `mongodump` + git tag
  - Pull branch `hotfix/spec-005-post-deploy`
  - Run `npm ci` in production
  - Run `npm run build`
  - PM2 restart: `pm2 restart cermont-backend cermont-frontend`
  - Verify processes: `pm2 list`
  - Verify health: `curl https://cermontsas.shop/api/backend/health/ready`
  - Document rollback steps:
    - Code: `git checkout previous-tag && npm ci && pm2 restart`
    - DB: `mongorestore` from backup

  **Must NOT do**:
  - No deploying without backup
  - No skipping PM2 verification

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`bash-defensive-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: T25
  - **Blocked By**: T22, T23

  **Acceptance Criteria**:
  - [ ] PM2 processes online
  - [ ] Health endpoint returns 200
  - [ ] Rollback plan documented

  **QA Scenarios**:
  ```
  Scenario: Verify production health after deploy
    Tool: Bash
    Steps:
      1. curl -s https://cermontsas.shop/api/backend/health/ready
      2. pm2 list (via SSH)
    Expected Result: Health OK, processes online
    Evidence: .sisyphus/evidence/task-24-deploy-health.txt
  ```

  **Commit**: NO

- [ ] 25. **Post-fix report**

  **What to do**:
  - Create `specs/005-post-deploy-hotfix-and-real-implementation/post-fix-report.md`
  - Sections:
    - Summary of all fixes applied
    - Error matrix before/after
    - Files modified/created/deleted
    - Tests executed and results
    - Gates status
    - Smoke test results
    - Known remaining issues
    - Rollback procedure
    - Deploy verdict
  - Update `docs/KNOWN_ISSUES.md` with new resolved issues
  - Update `docs/API_STATUS.md` if API contracts changed
  - Update `docs/TECHNICAL_DEBT.md` if any debt resolved

  **Must NOT do**:
  - No empty sections
  - No claiming fixes without evidence

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: DONE
  - **Blocked By**: T23, T24

  **Acceptance Criteria**:
  - [ ] Post-fix report created with ALL sections
  - [ ] Known issues updated
  - [ ] Evidence files referenced

  **QA Scenarios**:
  ```
  Scenario: Verify report completeness
    Tool: Bash
    Steps:
      1. wc -l specs/005-post-deploy-hotfix-and-real-implementation/post-fix-report.md
      2. grep "## " specs/005-post-deploy-hotfix-and-real-implementation/post-fix-report.md
    Expected Result: Report has all required sections, substantial content
    Evidence: .sisyphus/evidence/task-25-report.txt
  ```

  **Commit**: YES
  - Message: `docs(spec): add post-fix report for spec-005 hotfix`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck` + `npm run lint` + `npm test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **T1**: `chore(spec): create spec-005 kit structure`
- **T2-T3**: `docs(spec): production error matrix`
- **T5-T7**: `fix(assets): serve static assets and PWA icons correctly`
- **T8**: `fix(service-worker): diagnose async listener error`
- **T9**: `fix(notifications): correct API route to /api/notifications`
- **T10**: `fix(users): handle invalid ObjectId with 400`
- **T11**: `fix(work-requests): align frontend payload with CreateWorkRequestSchema`
- **T12**: `fix(documents): correct multipart upload field and validation`
- **T13**: `fix(a11y): add DialogTitle to all DialogContent`
- **T15-T17**: `feat(webauthn): add passkey authentication`
- **T18-T21**: `feat(fleet): vehicle photos/documents/readiness` + `feat(tools): tool photos/documents/checklists`
- **T22-T25**: `chore(release): spec-005 hotfix deploy`

---

## Success Criteria

### Verification Commands
```bash
curl -I https://cermontsas.shop/favicon.png         # 200
curl -I https://cermontsas.shop/icons/icon-192.png   # 200
curl -I https://cermontsas.shop/icons/icon-512.png   # 200
curl -I https://cermontsas.shop/manifest.json        # 200
npm run typecheck                                    # PASS
npm run lint                                         # PASS
npm test                                             # PASS
npm run build                                        # PASS
npm run contracts:check                              # PASS
npm run quality:strict                               # PASS
npm run verify                                       # PASS
```

### Final Checklist
- [ ] favicon e iconos devuelven 200
- [ ] manifest/PWA no referencia assets inexistentes
- [ ] async listener error corregido o clasificado
- [ ] notifications sin 401 spam
- [ ] users/:id sin 500
- [ ] work-requests POST funciona
- [ ] documents POST funciona
- [ ] DialogContent tiene DialogTitle
- [ ] WebAuthn funcional o bloqueo técnico
- [ ] 2 slices funcionales implementados
- [ ] tests de regresión existen
- [ ] build pasa
- [ ] contracts:check pasa
- [ ] verify pasa
- [ ] smoke tests pasan
- [ ] sin `any` introducido
- [ ] sin RBAC roto
- [ ] errores no ocultados
