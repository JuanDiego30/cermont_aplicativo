# SPEC-020: Cermont Master Remediation, Innovation & Scaling Plan

**Version:** 1.0  
**Date:** 2026-07-06  
**Status:** CURRENT_SOURCE_OF_TRUTH  
**Replaces:** Baselines tolerantes, quality debt acumulado  
**Total Tasks:** 59  
**Estimated Waves:** 5 + Final Verification  
**Target Lines:** ~3,000

---

## TL;DR

> **Core Objective:** Transform the Cermont monorepo from a state of technical regression (broken `npm run verify`, 37 route violations, 49 hardcoded role strings, fragmented documentation) to a state of high-performance, architecturally-enforced, world-class professional software.

> **Deliverables:**
> - Zero `quality:routes` violations (baseline 0 for all 3 categories)
> - All 49 hardcoded role strings migrated to `@cermont/domain` SSOT
> - 17 remaining validation-gap routes secured with proper middleware
> - Architectural enforcement via custom Biome plugins + pre-commit hooks
> - 14-step business flow fully implemented end-to-end
> - Cost Engine v2 with real-time variance AI alerts
> - Document-driven forms pipeline completed (Import → Template → Form → Response → GeneratedDocument)
> - Offline-first field module hardened with conflict resolution
> - Automated CI/CD with quality gates blocking regression

> **Estimated Effort:** XL (4-6 sprints)
> **Parallel Execution:** YES — 5 waves, maximum 8 tasks per wave
> **Critical Path:** Wave 1 (Route Hardening) → Wave 2 (Architectural Integrity) → Wave 3 (Business Features) → Wave 4 (Innovation) → Wave 5 (Quality/CI/CD)

---

## Context

### Original Request
Auditoría completa del monorepo Cermont tras fallo de `npm run verify` en el gate `quality:routes` (17 violations contra baseline de 15). Se identificaron 37 hallazgos totales en rutas backend, 49 instancias de roles hardcodeados, múltiples módulos sin validación Zod, y brechas significativas entre la documentación arquitectónica y la implementación real.

### Interview Summary
**Key Findings from Audit (SPEC-020 phase 0):**
- `route-missing-validation`: 17 actual vs 15 baseline — **2 NEW violations broke the build**
- `route-missing-authentication`: 5 actual — all in `automation.routes.ts`, flagged due to regex bug in checker
- `route-missing-authorization-policy`: 15 actual — includes `privacy-requests` (3), `auth` (3), `work-requests` (2), `ai` (1), `resource` (1), `automation` (5 false positives)
- 49 hardcoded `authorize("rolestring")` calls across 22 route files violating RBAC SSOT
- Checker regex does NOT detect `router.use(authenticate, authorize(...))` compound middleware patterns
- `/No body validation needed/` comments placed OUTSIDE route blocks are invisible to checker
- `erp-connector/:provider/sync`, `form-submissions`, `qr/generate*`, `privacy-requests` POST — routes with ZERO input validation (security holes)
- `resource/:resourceId/documents` GET — ZERO authentication middleware (critical gap)
- 680 backend tests pass, 260 frontend tests pass, API contracts guard passes — core is solid
- TypeScript strict mode passes across all 5 workspaces

### Documentation Gaps Identified
- `CERMONT_ARCHITECTURE_BLUEPRINT.md` says `backend/src/routes/` but actual is `backend/src/modules/<feature>/<feature>.routes.ts`
- `FRONTEND_ROUTE_MAP.md` has 18 routes marked `REQUIRED_NOT_IMPLEMENTED`
- `API_ENDPOINT_MATRIX.md` has endpoints marked `REQUIRED` that lack full RBAC/validation specs
- `CERMONT_REBUILD_ROADMAP.md` is only 67 lines — lacks task-level granularity
- No single document maps the `@cermont/domain` role constants to which modules use them
- ADR documents exist but are not cross-referenced from implementation specs

---

## Work Objectives

### Core Objective
Restaurar `npm run verify` a estado verde, eliminar toda la deuda técnica de calidad de rutas, migrar a RBAC SSOT completo, y establecer un pipeline de calidad que impida la regresión arquitectónica.

### Concrete Deliverables

**Phase 1 — Immediate Fix (Wave 1-2):**
- [ ] `npm run verify` passes with ZERO violations
- [ ] `quality:routes` baseline reset to 0 for all 3 categories
- [ ] All 17 validation-gap routes secured with `validateBody`/`validateQuery`/`validateParams`
- [ ] All 15 authorization-gap routes secured with `authorize(...)` from `@cermont/domain`
- [ ] All 49 hardcoded `authorize("rolestring")` migrated to domain constants
- [ ] Checker regex fixed to detect compound `router.use()` patterns
- [ ] Checker regex fixed to detect `/No body validation needed/` comments before route blocks

**Phase 2 — Architectural Enforcement (Wave 2-3):**
- [ ] Biome custom rule to flag hardcoded role strings (lint rule)
- [ ] Pre-commit hook running `quality:routes` with failing exit code
- [ ] CI gate that blocks merge if `npm run verify` fails
- [ ] Auto-baseline mechanism for quality tools
- [ ] `react-doctor --verbose` passing with zero issues

**Phase 3 — Business Feature Completion (Wave 3-4):**
- [ ] All 18 `REQUIRED_NOT_IMPLEMENTED` frontend routes completed
- [ ] All 14-step business flow entities have full CRUD + state machine
- [ ] Cost Engine v2 with deviation alerts
- [ ] Document-driven forms pipeline end-to-end
- [ ] Offline field module with conflict resolution UI

**Phase 4 — Innovation & Scaling (Wave 4-5):**
- [ ] AI-powered OCR form extraction from uploaded documents
- [ ] Predictive cost deviation alerts
- [ ] Real-time dashboard with WebSocket push
- [ ] Multi-tenant data isolation certification
- [ ] Performance budget enforcement in CI

### Definition of Done
- [ ] `npm run verify` exits with code 0
- [ ] `npx react-doctor@latest` exits with code 0
- [ ] `quality:routes` reports 0 violations in all 3 categories
- [ ] Zero `authorize("string")` patterns remain in `backend/src/`
- [ ] Pre-commit hook blocks commits with route violations
- [ ] CI pipeline runs `verify` on every PR and blocks merge on failure
- [ ] Documentation (FRONTEND_ROUTE_MAP, API_ENDPOINT_MATRIX, ARCHITECTURE_BLUEPRINT) updated to match actual code

### Must Have
- Zero route quality violations
- Zero hardcoded role strings
- Pre-commit + CI quality gates
- Full 14-step business flow coverage
- Passing `react-doctor --verbose`

### Must NOT Have (Guardrails)
- Do NOT rewrite working tests (680 backend + 260 frontend tests must continue passing)
- Do NOT change the stack (Express 5, Mongoose 9, Zod 4, Next.js 16, React 19)
- Do NOT introduce new dependencies without explicit approval
- Do NOT remove existing functionality without replacement
- Do NOT use `middleware.ts` — security perimeter is `proxy.ts`
- Do NOT refactor module structure — only fix middleware chains

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest, Playwright, Biome, quality tooling suite)
- **Automated tests**: TDD for new routes, tests-after for remediation
- **Framework**: Vitest (backend), Vitest + Playwright (frontend)
- **Quality tools**: 9 existing scripts + new Biome custom rules

### QA Policy
Every task MUST include agent-executed QA scenarios (see TODO template).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Backend routes**: Use Bash (curl) — Send requests, assert status codes + response fields + middleware execution
- **Quality tools**: Use Bash — Run `quality:routes`, assert exit code 0 + specific rule counts
- **Pre-commit hooks**: Use Bash — Stage violating file, attempt commit, assert rejection
- **CI simulation**: Use Bash — Run full `npm run verify`, assert exit code 0

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — Route Hardening & Checker Fix, 8 tasks):
├── Task 1.1: Fix check-routes.ts regex (compound use + comment detection)
├── Task 1.2: Reset quality baseline to 0-all
├── Task 1.3: Add validateBody to erp-connector, form-submissions, jobs, qr routes
├── Task 1.4: Add validateBody to document-import, document-template, maintenance, resource routes
├── Task 1.5: Add authorization policy to privacy-requests, resource, auth, ai routes
├── Task 1.6: Add authorization policy to work-requests POST/PATCH routes
├── Task 1.7: Add authentication to resource/:resourceId/documents route
├── Task 1.8: Add validateBody to analytics, notifications, template-response routes

Wave 2 (After Wave 1 — Hardcoded Role Migration, 8 tasks):
├── Task 2.1: Audit @cermont/domain role constants + add missing composite sets
├── Task 2.2: Migrate erp-connector.routes.ts (10 hardcoded instances)
├── Task 2.3: Migrate inspection.routes.ts (3 hardcoded instances + 6-role array)
├── Task 2.4: Migrate business-document.routes.ts (5 hardcoded instances)
├── Task 2.5: Migrate checklist, evidence, order, service-cases, client hardcoded roles
├── Task 2.6: Migrate delivery-record, template-draft, custom-fields, proposal, portal routes
├── Task 2.7: Migrate remaining singles (user, asset, report, admin-backup, jobs, document)
├── Task 2.8: Create Biome custom rule to flag `authorize("literal")` patterns

Wave 3 (After Wave 2 — Architectural Enforcement + Frontend Gap Closure, 8 tasks):
├── Task 3.1: Create pre-commit hook for quality:routes
├── Task 3.2: Create CI pipeline gate (GitHub Actions workflow for verify)
├── Task 3.3: Create auto-baseline script for quality tools
├── Task 3.4: Complete REQUIRED_NOT_IMPLEMENTED frontend routes (Part 1: proposals costs, order planning/execution)
├── Task 3.5: Complete REQUIRED_NOT_IMPLEMENTED frontend routes (Part 2: reports, billing)
├── Task 3.6: Fix react-doctor violations in frontend (a11y, semantics, structure)
├── Task 3.7: Update ARCHITECTURE_BLUEPRINT.md with actual module structure
├── Task 3.8: Update FRONTEND_ROUTE_MAP.md + API_ENDPOINT_MATRIX.md to 100% accuracy

Wave 4 (After Wave 3 — Business Feature Completion, 8 tasks):
├── Task 4.1: Complete Document Import → Template → Form → Response pipeline
├── Task 4.2: Complete Cost Engine v2 (proposal baseline → actual costs → variance alerts)
├── Task 4.3: Complete Offline Field Module (conflict resolution UI + sync dashboard)
├── Task 4.4: Implement Administrative Closure State Machine (14-step gate checks)
├── Task 4.5: Complete Evidence Gallery with timeline view + verification workflow
├── Task 4.6: Implement ServiceCase Cockpit (unified view of all 14 steps)
├── Task 4.7: Add missing Loading/Error/Empty/Offline states across all critical pages
├── Task 4.8: End-to-end Playwright tests for all 14 business flow steps

Wave 5 (After Wave 4 — Innovation & Scaling, 8 tasks):
├── Task 5.1: AI-powered OCR extraction from uploaded PDF/Excel documents
├── Task 5.2: Real-time dashboard with WebSocket push (Socket.IO or SSE)
├── Task 5.3: Predictive cost deviation alerts (configurable threshold + notification)
├── Task 5.4: Performance budget enforcement (Lighthouse CI thresholds)
├── Task 5.5: Multi-tenant data isolation certification + pentest preparation
├── Task 5.6: PWA installation polish (install prompt, update flow, offline indicator)
├── Task 5.7: Accessibility audit — WCAG 2.2 AA compliance scan
├── Task 5.8: Security audit — automated OWASP ZAP scan in CI

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan Compliance Audit (oracle)
├── Task F2: Code Quality Review (unspecified-high)
├── Task F3: Real Manual QA (unspecified-high + playwright)
├── Task F4: Scope Fidelity Check (deep)

Critical Path: Task 1.1 → 1.2 → 2.1 → 2.8 → 3.1 → 3.2 → 3.6 → 5.4 → 5.8 → F1-F4 → user okay
Parallel Speedup: ~75% faster than sequential
Max Concurrent: 8 (Wave 1-5)

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

---

### WAVE 1 — Route Hardening & Checker Fix (8 tasks)

---

- [ ] 1.1. Fix check-routes.ts Regex: Detect Compound `router.use()` + Comment Scanning

  **What to do**:
  - Open `tooling/quality/check-routes.ts`
  - Fix `usesRouterAuth` regex: Change `/router\.use\s*\(\s*authenticate\s*\)/` to `/router\.use\s*\([^)]*authenticate\s*[,\)]/` (detects `authenticate` followed by `,` or `)` inside `router.use()`)
  - Fix `usesRouterAuthz` regex: Change `/router\.use\s*\(\s*authorize\s*\(/` to `/router\.use\s*\([^)]*authorize\s*\(/` (detects `authorize(` after any arguments in `router.use()`)
  - Fix route block capture to include preceding comment line: Change `ROUTE_PATTERN` to capture line before match (check for `/\/\/.*No body validation needed/` or `/\/\*[\s\S]*?No body validation needed[\s\S]*?\*\//` within 3 lines before the route block)
  - Add `hasPrecedingNoValidationComment` check: Scan 3 lines before each route match for "No body validation needed"
  - Update `hasValidation` logic: `const hasValidation = hasPrecedingNoValidationComment || /\bvalidate(Body|Query|Params)?\s*\(/.test(routeBlock) || /No body validation needed/.test(routeBlock);`
  - Run `tsx tooling/quality/check-routes.ts` and verify automation module routes are NO longer flagged as missing auth/authz
  - Verify routes with "No body validation needed" comments (document-import, document-template, maintenance, analytics, template-response, template-draft, document-ingestion) are NO longer flagged as missing validation
  - Run `npm run test -w backend` to confirm no regressions

  **Must NOT do**:
  - Do NOT break detection of routes that are genuinely missing auth/authz/validation
  - Do NOT modify any source route files — only fix the checker tool

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` (medium complexity: regex + logic fix)
  - **Skills**: []
  
  **Parallelization**:
  - **Can Run In Parallel**: NO (critical path — all other Wave 1 tasks depend on accurate baseline)
  - **Blocks**: 1.2, all Wave 1 tasks that need accurate counts
  - **Blocked By**: None

  **References**:
  - `tooling/quality/check-routes.ts` — The checker file to fix (read in full)
  - `backend/src/modules/automation/automation.routes.ts` — Test case for compound router.use() detection
  - `backend/src/modules/analytics/analytics.routes.ts` — Test case for comment-before-route detection
  - `backend/src/modules/documents/document-import.routes.ts` — Test case for "No body validation needed" comments

  **Acceptance Criteria**:
  - [ ] `tsx tooling/quality/check-routes.ts` reports ZERO `route-missing-authentication` for automation module routes
  - [ ] `tsx tooling/quality/check-routes.ts` reports ZERO `route-missing-validation` for routes with "No body validation needed" comments within 3 lines
  - [ ] `tsx tooling/quality/check-routes.ts` STILL flags `resource.routes.ts:111` (genuinely missing auth)
  - [ ] `tsx tooling/quality/check-routes.ts` STILL flags `privacy-requests.routes.ts:7,8,9` (genuinely missing authz)
  - [ ] `npm run test -w backend` passes (102 suites, 680 tests)

  **QA Scenarios**:
  ```
  Scenario: Compound router.use() detection
    Tool: Bash
    Steps:
      1. Run `tsx tooling/quality/check-routes.ts`
      2. Assert exit code 0 (or that automation route findings decreased)
      3. Grep output for "automation" — assert NO `route-missing-authentication` findings for automation routes
    Expected Result: automation.routes.ts line 25,26,27,32,37 are NOT flagged for auth/authz
    Evidence: .sisyphus/evidence/task-1.1-compound-use.txt

  Scenario: Comment-before-route detection
    Tool: Bash
    Steps:
      1. Run `tsx tooling/quality/check-routes.ts`
      2. Assert document-import.routes.ts line 13 is NOT flagged for route-missing-validation
      3. Assert document-template.routes.ts line 13 is NOT flagged for route-missing-validation
      4. Assert analytics.routes.ts line 38,53 are NOT flagged for route-missing-validation
    Expected Result: Routes with "No body validation needed" comments within 3 lines are not flagged
    Evidence: .sisyphus/evidence/task-1.1-comment-detection.txt

  Scenario: Genuine violations still caught
    Tool: Bash
    Steps:
      1. Run `tsx tooling/quality/check-routes.ts`
      2. Assert output still contains "resource.routes.ts:111" for route-missing-authentication
      3. Assert output still contains "privacy-requests.routes.ts:7" for route-missing-authorization-policy
    Expected Result: Checker still catches genuinely insecure routes
    Evidence: .sisyphus/evidence/task-1.1-genuine-violations.txt
  ```

  **Commit**: YES
  - Message: `fix(tooling): detect compound router.use() and pre-route comments in check-routes.ts`
  - Files: `tooling/quality/check-routes.ts`

---

- [ ] 1.2. Reset Quality Baselines to Reflect Fixed Checker

  **What to do**:
  - After Task 1.1 fixes the checker, run `tsx tooling/quality/check-routes.ts` to get the new accurate counts
  - Update `tooling/quality/baseline.json` with the new counts for:
    - `route-missing-authentication`: Set to the actual new count (expected: 1 — only `resource.routes.ts:111`)
    - `route-missing-authorization-policy`: Set to the actual new count (expected: 10)
    - `route-missing-validation`: Set to the actual new count (expected: ~10 after removing false positives)
  - Commitment: These will be reduced to ZERO in subsequent Wave 1 tasks
  - Confirm by running: `tsx tooling/quality/check-routes.ts` — should report all findings within baseline

  **Must NOT do**:
  - Do NOT set baselines to hide genuine violations — only reflect accurate counts from fixed checker

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on 1.1)
  - **Blocks**: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8 (they need accurate baselines to know their targets)
  - **Blocked By**: 1.1

  **References**:
  - `tooling/quality/baseline.json` — The baseline file to update
  - `tooling/quality/check-routes.ts` — The fixed checker

  **Acceptance Criteria**:
  - [ ] `tsx tooling/quality/check-routes.ts` reports all findings within updated baseline
  - [ ] `npm run quality:routes` (part of quality:strict) passes

  **QA Scenarios**:
  ```
  Scenario: Baselines pass after update
    Tool: Bash
    Steps:
      1. Run `tsx tooling/quality/check-routes.ts`
      2. Assert output says "within baseline" for all 3 categories
    Expected Result: No baseline exceedances
    Evidence: .sisyphus/evidence/task-1.2-baseline-pass.txt
  ```

  **Commit**: YES (squash with 1.1)

---

- [ ] 1.3. Add `validateBody` to Genuinely Missing Routes (erp-connector, form-submissions, jobs, qr)

  **What to do**:
  - **erp-connector.routes.ts:72**: Add `validateBody(ValidateErpMappingSchema)` or create a sync request schema to `router.post("/:provider/sync", ...)` — this is a POST that triggers a sync action and should validate at minimum the provider identifier
  - **form-submission.routes.ts:13**: Add `validateBody(CreateFormSubmissionSchema)` — if schema doesn't exist, create one in `packages/shared-types/src/schemas/` (contract-first)
  - **form-submission.routes.ts:46**: Add `validateBody(ArchiveFormSubmissionSchema)` or `validateParams(SubmissionIdSchema)` — patch route for archiving
  - **jobs.routes.ts:13**: Add `validateBody(RunJobsSchema)` or a minimal schema — POST route for triggering jobs
  - **qr.routes.ts:11**: Add `validateBody(GenerateQrCodeSchema)` — QR generation needs input (text, size, format)
  - **qr.routes.ts:12**: Add `validateBody(GenerateBulkQrCodesSchema)` — bulk generation needs input array
  - For each: if Zod schema doesn't exist in shared-types, create it (contract-first), export from package entry, create Mongoose model if needed, add validation middleware
  - Run `npm run test -w backend && npm run test -w @cermont/shared-types`

  **Must NOT do**:
  - Do NOT add try/catch to controllers
  - Do NOT skip contract-first — always create Zod schema before implementing

  **Parallelization**:
  - **Can Run In Parallel**: YES (each module is independent)
  - **Blocks**: None
  - **Blocked By**: 1.2 (baseline reset)

  **References**:
  - `backend/src/modules/erp-connector/erp-connector.routes.ts:72` — Sync route without validation
  - `backend/src/modules/form-submissions/form-submission.routes.ts:13,46` — Routes without validation
  - `backend/src/modules/jobs/jobs.routes.ts:13` — Run jobs route
  - `backend/src/modules/qr/qr.routes.ts:11,12` — QR generation routes
  - `packages/shared-types/src/schemas/` — Existing Zod schemas to follow pattern
  - `backend/src/middlewares/validate.ts` — Validation middleware to use

  **Acceptance Criteria**:
  - [ ] All 6 POST/PATCH routes in these 4 modules have `validateBody(...)` middleware
  - [ ] Zod schemas exist in `packages/shared-types/src/schemas/` for each new validation
  - [ ] `npm run test -w backend` passes
  - [ ] `npm run test -w @cermont/shared-types` passes
  - [ ] `tsx tooling/quality/check-routes.ts` no longer flags these routes

  **QA Scenarios**:
  ```
  Scenario: erp-connector sync route validated
    Tool: Bash
    Steps:
      1. Read backend/src/modules/erp-connector/erp-connector.routes.ts
      2. Assert line 72 has validateBody(...) before controller
      3. Run tsx tooling/quality/check-routes.ts
      4. Assert erp-connector.routes.ts:72 is NOT flagged
    Expected Result: Sync route has validation middleware
    Evidence: .sisyphus/evidence/task-1.3-erp-validation.txt

  Scenario: QR generation routes validated
    Tool: Bash
    Steps:
      1. Read backend/src/modules/qr/qr.routes.ts
      2. Assert lines 11 and 12 have validateBody(...) before controllers
      3. Run tsx tooling/quality/check-routes.ts
      4. Assert qr.routes.ts:11,12 are NOT flagged
    Expected Result: QR routes have validation
    Evidence: .sisyphus/evidence/task-1.3-qr-validation.txt

  Scenario: Quality check passes for all
    Tool: Bash
    Steps:
      1. Run tsx tooling/quality/check-routes.ts
      2. Assert erp-connector, form-submissions, jobs, qr modules NOT in output
    Expected Result: No findings for these modules
    Evidence: .sisyphus/evidence/task-1.3-all-clear.txt
  ```

  **Commit**: YES
  - Message: `fix(routes): add validateBody to erp-connector, form-submissions, jobs, qr routes`
  - Files: `backend/src/modules/erp-connector/erp-connector.routes.ts`, `backend/src/modules/form-submissions/form-submission.routes.ts`, `backend/src/modules/jobs/jobs.routes.ts`, `backend/src/modules/qr/qr.routes.ts`, `packages/shared-types/src/schemas/*.ts`

---

- [ ] 1.4. Add `validateBody` to File-Upload Routes (document-import, document-template, maintenance, resource)

  **What to do**:
  - These routes have legitimate reasons to skip JSON body validation (file upload via multer), but need explicit marker or proper validation
  - **document-import.routes.ts:13**: Add inline comment `/* No body validation needed — multipart file upload */` INSIDE the route call, or add a param validation for the import type
  - **document-import.routes.ts:23**: Same approach — add inline comment or validate params
  - **document-template.routes.ts:13**: Add inline comment INSIDE route call
  - **maintenance.routes.ts:95**: Add inline comment INSIDE route call
  - **resource.routes.ts:109**: Add inline comment INSIDE route call
  - **Prefered approach**: Add `validateParams` for any ID params that may be present, THEN add the comment marker as fallback
  - Run `npm run test -w backend`

  **Must NOT do**:
  - Do NOT break file upload functionality
  - Do NOT add JSON body validation where multer/form-data is used

  **Parallelization**:
  - **Can Run In Parallel**: YES (independent modules)
  - **Blocks**: None
  - **Blocked By**: 1.2 (baseline reset)

  **References**:
  - `backend/src/modules/documents/document-import.routes.ts:13,23`
  - `backend/src/modules/documents/document-template.routes.ts:13`
  - `backend/src/modules/maintenance/maintenance.routes.ts:95`
  - `backend/src/modules/resource/resource.routes.ts:109`

  **Acceptance Criteria**:
  - [ ] All 5 flagged routes have inline "No body validation needed" comment inside the route call OR proper param validation
  - [ ] `tsx tooling/quality/check-routes.ts` no longer flags these routes
  - [ ] File upload functionality still works (test via curl with multipart/form-data)

  **QA Scenarios**:
  ```
  Scenario: Inline comments suppress checker
    Tool: Bash
    Steps:
      1. Read each modified route file, verify comment is INSIDE the route call parentheses
      2. Run tsx tooling/quality/check-routes.ts
      3. Assert none of these routes appear in output
    Expected Result: Routes pass quality check
    Evidence: .sisyphus/evidence/task-1.4-inline-comments.txt
  ```

  **Commit**: YES
  - Message: `fix(routes): add inline validation markers to file-upload routes`
  - Files: `backend/src/modules/documents/document-import.routes.ts`, `backend/src/modules/documents/document-template.routes.ts`, `backend/src/modules/maintenance/maintenance.routes.ts`, `backend/src/modules/resource/resource.routes.ts`

---

- [ ] 1.5. Add Authorization Policy to Routes Missing It (privacy-requests, resource, auth, ai)

  **What to do**:
  - **privacy-requests.routes.ts:7,8,9**: Add `authorize(...ADMIN_ROLES)` or appropriate role set to all 3 routes (GET list, GET detail, POST create). These handle sensitive personal data — restrict to `gerente` and `administrativo` at minimum
  - **resource.routes.ts:111**: Add `authorize(...INTERNAL_ROLES)` to `router.get("/:resourceId/documents", ...)` — GET route for listing tool documents
  - **auth.routes.ts:54**: POST `/logout` — Add `authorizeAllAuthenticated()` or explicit role set. Note: this is authenticated but needs an explicit authz policy marker
  - **auth.routes.ts:60**: GET `/me` — Add `authorizeAllAuthenticated()` or explicit role set
  - **auth.routes.ts:66**: PATCH `/change-password` — Add `authorizeAllAuthenticated()` similar to other auth routes
  - **ai.routes.ts:16**: GET `/status` — Add `authorize(...INTERNAL_ROLES)` — AI status should be visible to all internal users
  - Use `authorizeAllAuthenticated` helper if available, or import the correct role set from `@cermont/domain`
  - Run `npm run test -w backend`

  **Must NOT do**:
  - Do NOT use hardcoded `authorize("gerente", ...)` strings — always use `@cermont/domain` constants
  - Do NOT add authz to open auth routes (login, refresh, forgot-password, reset-password)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Blocks**: None
  - **Blocked By**: 1.2

  **References**:
  - `@cermont/domain` — Exports like `ADMIN_ROLES`, `INTERNAL_ROLES`, `MANAGEMENT_ROLES`
  - `backend/src/modules/privacy-requests/privacy-requests.routes.ts`
  - `backend/src/modules/resource/resource.routes.ts` (line 111)
  - `backend/src/modules/auth/auth.routes.ts` (lines 54, 60, 66)
  - `backend/src/modules/ai/ai.routes.ts` (line 16)

  **Acceptance Criteria**:
  - [ ] All 7 routes have explicit authorization policy middleware
  - [ ] `authorizeAllAuthenticated` used for auth module routes (they're self-protecting by nature)
  - [ ] `@cermont/domain` constants used (not hardcoded strings)
  - [ ] `tsx tooling/quality/check-routes.ts` no longer flags these routes
  - [ ] `npm run test -w backend` passes

  **QA Scenarios**:
  ```
  Scenario: Privacy routes have authorization
    Tool: Bash
    Steps:
      1. Read backend/src/modules/privacy-requests/privacy-requests.routes.ts
      2. Assert lines 7,8,9 have authorize(...) after authenticate
      3. Run tsx tooling/quality/check-routes.ts
      4. Assert no privacy-requests findings
    Expected Result: Privacy routes protected
    Evidence: .sisyphus/evidence/task-1.5-privacy-authz.txt

  Scenario: Resource documents route has auth
    Tool: Bash
    Steps:
      1. Read backend/src/modules/resource/resource.routes.ts line 111
      2. Assert has authenticate + authorize middleware
      3. Run tsx tooling/quality/check-routes.ts
      4. Assert no resource.routes.ts:111 finding
    Expected Result: Resource route protected
    Evidence: .sisyphus/evidence/task-1.5-resource-authz.txt

  Scenario: Auth routes have explicit authz policy
    Tool: Bash
    Steps:
      1. Read backend/src/modules/auth/auth.routes.ts lines 54,60,66
      2. Assert each has authorizeAllAuthenticated() or authorize(...)
      3. Run tsx tooling/quality/check-routes.ts
      4. Assert no auth.routes.ts findings for authz policy
    Expected Result: Auth routes have explicit policies
    Evidence: .sisyphus/evidence/task-1.5-auth-authz.txt
  ```

  **Commit**: YES
  - Message: `fix(routes): add authorization policies to privacy-requests, resource, auth, ai routes`
  - Files: `backend/src/modules/privacy-requests/privacy-requests.routes.ts`, `backend/src/modules/resource/resource.routes.ts`, `backend/src/modules/auth/auth.routes.ts`, `backend/src/modules/ai/ai.routes.ts`

---

- [ ] 1.6. Add Authorization Policy to work-requests POST/PATCH Routes

  **What to do**:
  - **work-requests.routes.ts:60**: Add `authorize(...INTERNAL_ROLES)` to `router.post("/", ...)` — Create work request should be restricted to internal users (clients may create via portal)
  - **work-requests.routes.ts:73**: Add `authorize(...FIELD_MANAGEMENT_ROLES)` to `router.patch("/:id", ...)` — Update work request should be restricted to field management
  - Verify that the `INTERNAL_ROLES` and `FIELD_MANAGEMENT_ROLES` constants exist in `@cermont/domain`
  - If `FIELD_MANAGEMENT_ROLES` doesn't exist, check if it should be `MANAGEMENT_ROLES` or create the appropriate set
  - Run `npm run test -w backend`

  **Must NOT do**:
  - Do NOT use hardcoded role strings
  - Do NOT remove existing `authenticate` middleware

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Blocks**: None
  - **Blocked By**: 1.2

  **References**:
  - `backend/src/modules/work-requests/work-requests.routes.ts:60,73`
  - `packages/domain/src/index.ts` — Available role constants
  - `backend/src/middlewares/authorize.middleware.ts` — Authorize middleware

  **Acceptance Criteria**:
  - [ ] Both routes have explicit `authorize(...)` middleware
  - [ ] Role constants from `@cermont/domain` (not hardcoded)
  - [ ] `tsx tooling/quality/check-routes.ts` no longer flags these routes
  - [ ] `npm run test -w backend` passes

  **QA Scenarios**:
  ```
  Scenario: Work-request create has authz
    Tool: Bash
    Steps:
      1. Read backend/src/modules/work-requests/work-requests.routes.ts line 60
      2. Assert has authorize(...) between authenticate and validateBody
      3. Run tsx tooling/quality/check-routes.ts
      4. Assert no work-requests.routes.ts:60 finding
    Expected Result: Create route has authz
    Evidence: .sisyphus/evidence/task-1.6-wr-authz.txt
  ```

  **Commit**: YES
  - Message: `fix(routes): add authorization to work-requests POST/PATCH routes`
  - Files: `backend/src/modules/work-requests/work-requests.routes.ts`

---

- [ ] 1.7. Add Authentication to Resource Documents Route

  **What to do**:
  - **resource.routes.ts:111**: Add `authenticate` middleware before `listToolDocuments` controller
  - This is the most critical security finding — a GET route with ZERO authentication
  - Add: `router.get("/:resourceId/documents", authenticate, authorize(...INTERNAL_ROLES), listToolDocuments);`
  - Run `npm run test -w backend`

  **Must NOT do**:
  - Do NOT expose document listing without authentication
  - Do NOT use hardcoded roles

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Blocks**: None
  - **Blocked By**: 1.2

  **References**:
  - `backend/src/modules/resource/resource.routes.ts:111`
  - `backend/src/modules/resource/resource-document.controller.ts`

  **Acceptance Criteria**:
  - [ ] Route has `authenticate` middleware
  - [ ] Route has `authorize(...)` middleware
  - [ ] `tsx tooling/quality/check-routes.ts` no longer flags this route for auth OR authz
  - [ ] `npm run test -w backend` passes

  **QA Scenarios**:
  ```
  Scenario: Resource documents route has auth
    Tool: Bash
    Steps:
      1. Read backend/src/modules/resource/resource.routes.ts line 111
      2. Assert has authenticate before controller
      3. Run tsx tooling/quality/check-routes.ts
      4. Assert no resource.routes.ts:111 finding
    Expected Result: Resource documents route is now authenticated
    Evidence: .sisyphus/evidence/task-1.7-resource-auth.txt
  ```

  **Commit**: YES
  - Message: `fix(routes): add authentication to resource/:resourceId/documents route`
  - Files: `backend/src/modules/resource/resource.routes.ts`

---

- [ ] 1.8. Add Validation to Analytics, Notifications, and Template-Response Routes

  **What to do**:
  - **analytics.routes.ts:38**: Add `validateBody(MarkAllNotificationsReadSchema)` or add inline comment marker — this is a POST action endpoint that may not need body
  - **analytics.routes.ts:53**: Same as 38 — duplicate route for different mount point
  - **notifications.routes.ts:38**: Add `validateBody(MarkAllNotificationsReadSchema)` or inline comment marker
  - **template-response.routes.ts:19**: Add `validateBody(CreateTemplateResponseSchema)` or inline comment marker — POST route for creating template responses needs input validation
  - **best practice**: For action endpoints that truly don't need body, add `/* No body validation needed — action endpoint */` INSIDE the route call
  - For template-response, create proper Zod schema for form submission validation
  - Run `npm run test -w backend && npm run build -w backend`

  **Must NOT do**:
  - Do NOT add unnecessary validation where action endpoints truly don't need body
  - But add explicit comment markers

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Blocks**: None
  - **Blocked By**: 1.2

  **References**:
  - `backend/src/modules/analytics/analytics.routes.ts:38,53`
  - `backend/src/modules/notifications/notifications.routes.ts:38`
  - `backend/src/modules/template-response/template-response.routes.ts:19`
  - `packages/shared-types/src/schemas/` — Existing schemas

  **Acceptance Criteria**:
  - [ ] All 4 flagged routes have inline validation markers or actual validateBody middleware
  - [ ] template-response POST route has proper validation
  - [ ] `tsx tooling/quality/check-routes.ts` no longer flags these routes
  - [ ] `npm run test -w backend` passes

  **QA Scenarios**:
  ```
  Scenario: All flagged routes resolved
    Tool: Bash
    Steps:
      1. Run tsx tooling/quality/check-routes.ts
      2. Assert no findings for analytics, notifications, template-response modules
    Expected Result: Zero validation findings for these modules
    Evidence: .sisyphus/evidence/task-1.8-all-clear.txt
  ```

  **Commit**: YES
  - Message: `fix(routes): add validation markers to analytics, notifications, template-response routes`
  - Files: `backend/src/modules/analytics/analytics.routes.ts`, `backend/src/modules/notifications/notifications.routes.ts`, `backend/src/modules/template-response/template-response.routes.ts`

---

### WAVE 2 — Architectural Integrity & Role SSOT Migration (8 tasks)

---

- [ ] 2.1. Audit and Complete `@cermont/domain` Role Constants

  **What to do**:
  - Read `packages/domain/src/index.ts` — document all currently exported role constant sets
  - Cross-reference against all uses in `backend/src/modules/` (grep for `authorize(` usage)
  - Identify missing composite role sets that modules are currently hardcoding:
    - `FIELD_MANAGEMENT_ROLES` (gerente, residente, HES) — used by work-requests, used in many places
    - `DOCUMENT_MANAGEMENT_ROLES` — if not exported
    - `SUPERVISORY_ROLES` — verify completeness
    - `MAINTENANCE_MANAGEMENT_ROLES` — verify against usage
    - `TECHNICAL_EXECUTION_ROLES` — verify
  - Add any missing composite role constants to `packages/domain/src/index.ts`
  - Run `npm run build -w @cermont/domain && npm run typecheck -w backend`

  **Must NOT do**:
  - Do NOT remove existing exports from `@cermont/domain`
  - Do NOT change role string values

  **Parallelization**:
  - **Can Run In Parallel**: YES (independent from route fixes)
  - **Blocks**: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7 (all migration tasks)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `packages/domain/src/index.ts` — Current role constants
  - All files in `backend/src/modules/` that use `authorize("string")` — The consumers to support

  **Acceptance Criteria**:
  - [ ] All role sets needed by modules are exported from `@cermont/domain`
  - [ ] No duplicate role constants
  - [ ] `npm run build -w @cermont/domain` passes
  - [ ] `npm run typecheck -w backend` passes

  **QA Scenarios**:
  ```
  Scenario: Domain exports all needed role sets
    Tool: Bash
    Steps:
      1. Read packages/domain/src/index.ts
      2. Assert FIELD_MANAGEMENT_ROLES exists (gerente, residente, HES)
      3. Assert DOCUMENT_MANAGEMENT_ROLES exists (if used by routes)
      4. Run npm run build -w @cermont/domain
      5. Assert exit code 0
    Expected Result: All needed role sets exported, build passes
    Evidence: .sisyphus/evidence/task-2.1-domain-complete.txt
  ```

  **Commit**: YES
  - Message: `feat(domain): add missing composite role constants for route authorization`
  - Files: `packages/domain/src/index.ts`

---

- [ ] 2.2. Migrate Hardcoded Roles — erp-connector.routes.ts (10 instances)

  **What to do**:
  - This file has the most hardcoded role strings (10 instances)
  - Replace all `authorize("gerente", "residente")` with `authorize(...MANAGEMENT_ROLES)` from `@cermont/domain`
  - Replace all `authorize("gerente")` with `authorize(...ADMIN_ROLES)` or keep as-is if only gerente should access
  - Verify `MANAGEMENT_ROLES` is `["gerente", "residente"]` — if not, use the correct constant
  - Lines to change: 23, 28, 35, 42, 50, 58, 67, 75, 83, 93
  - Run `npm run typecheck -w backend && npm run lint -w backend`

  **Must NOT do**:
  - Do NOT change authorization logic — only change HOW roles are referenced
  - Do NOT remove `"gerente"`-only restrictions where they exist

  **Parallelization**:
  - **Can Run In Parallel**: YES (independent modules)
  - **Blocks**: None
  - **Blocked By**: 2.1

  **References**:
  - `packages/domain/src/index.ts` — Role constants
  - `backend/src/modules/erp-connector/erp-connector.routes.ts`

  **Acceptance Criteria**:
  - [ ] Zero `authorize("string")` patterns remain in erp-connector.routes.ts
  - [ ] `npm run typecheck -w backend` passes
  - [ ] `npm run lint -w backend` passes

  **QA Scenarios**:
  ```
  Scenario: No hardcoded roles in erp-connector
    Tool: Bash
    Steps:
      1. Search for authorize(" in backend/src/modules/erp-connector/erp-connector.routes.ts
      2. Assert zero matches
      3. Run npm run typecheck -w backend
      4. Assert exit code 0
    Expected Result: All roles use domain constants
    Evidence: .sisyphus/evidence/task-2.2-erp-migration.txt
  ```

  **Commit**: YES
  - Message: `refactor(rbac): migrate erp-connector routes to @cermont/domain constants`
  - Files: `backend/src/modules/erp-connector/erp-connector.routes.ts`

---

- [ ] 2.3. Migrate Hardcoded Roles — inspection.routes.ts (3 instances + 6-role array)

  **What to do**:
  - **Line 28**: `authorize("gerente", "residente", "supervisor", "tecnico", "operador", "hes")` — replace with `authorize(...TECHNICAL_EXECUTION_ROLES)` or equivalent composite constant
  - **Line 40**: Same 6-role array — replace with constant
  - **Line 51**: `authorize("gerente")` — replace with `authorize(...ADMIN_ROLES)` (subset) or keep as gerente-only via appropriate constant
  - If no existing constant covers these 6 roles, create `FIELD_EXECUTION_ROLES` in `@cermont/domain`
  - Run `npm run typecheck -w backend && npm run lint -w backend`

  **Must NOT do**:
  - Do NOT reduce authorization scope — only change reference style

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Blocks**: None
  - **Blocked By**: 2.1

  **References**:
  - `backend/src/modules/inspection/inspection.routes.ts`
  - `packages/domain/src/index.ts`

  **Acceptance Criteria**:
  - [ ] Zero hardcoded role arrays in inspection.routes.ts
  - [ ] Typecheck + lint pass

  **QA Scenarios**: Same pattern as 2.2

  **Commit**: YES
  - Message: `refactor(rbac): migrate inspection routes to @cermont/domain constants`
  - Files: `backend/src/modules/inspection/inspection.routes.ts`, `packages/domain/src/index.ts` (if new constant needed)

---

- [ ] 2.4. Migrate Hardcoded Roles — business-document.routes.ts (5 instances)

  **What to do**:
  - **Line 21**: `authorize("gerente", "residente", "hes", "supervisor", "administrativo")` — replace with appropriate composite constant
  - **Line 28**: `authorize("gerente", "residente")` — replace with `MANAGEMENT_ROLES`
  - **Line 36**: Same array as line 21 — replace with constant
  - **Line 44**: Same array as line 28 — replace with constant
  - **Line 53**: `authorize("gerente")` — replace with appropriate constant
  - Run `npm run typecheck -w backend && npm run lint -w backend`

  **Parallelization**: YES | Blocked By: 2.1

  **Acceptance Criteria**: Zero hardcoded roles in file, typecheck passes

  **QA Scenarios**: Same pattern

  **Commit**: YES
  - Message: `refactor(rbac): migrate business-document routes to @cermont/domain constants`
  - Files: `backend/src/modules/business-document/business-document.routes.ts`

---

- [ ] 2.5. Migrate Hardcoded Roles — checklist, evidence, order, service-cases, client

  **What to do**:
  - **checklist.routes.ts:54,63,72**: Replace `authorize("operador", "tecnico", "supervisor")` with `authorize(...FIELD_EXECUTION_ROLES)` or composite constant
  - **evidence.routes.ts:59**: Replace `authorize("operador", "tecnico", "supervisor")` with appropriate constant
  - **order.routes.ts:162**: Replace `authorize("gerente")` with `authorize(...ADMIN_ROLES)` 
  - **service-cases/service-case.routes.ts:113**: Replace `authorize("gerente")` with appropriate constant
  - **client/client.routes.ts:68**: Replace `authorize("gerente")` with appropriate constant
  - Run `npm run typecheck -w backend && npm run lint -w backend`

  **Parallelization**: YES | **Blocked By**: 2.1
  **References**: `backend/src/modules/checklist/checklist.routes.ts`, `backend/src/modules/evidence/evidence.routes.ts`, `backend/src/modules/order/order.routes.ts`, `backend/src/modules/service-cases/service-case.routes.ts`, `backend/src/modules/client/client.routes.ts`
  **Acceptance Criteria**: Zero hardcoded roles in these 5 files | Typecheck + lint pass

  **QA Scenarios**:
  ```
  Scenario: Checklist routes use constants
    Tool: Bash
    Steps:
      1. Run grep -n 'authorize("' backend/src/modules/checklist/checklist.routes.ts
      2. Assert empty result
    Expected Result: No hardcoded roles
    Evidence: .sisyphus/evidence/task-2.5-checklist.txt
  ```

  **Commit**: YES — `refactor(rbac): migrate checklist, evidence, order, service-cases, client routes`

---

- [ ] 2.6. Migrate Hardcoded Roles — delivery-record, template-draft, custom-fields, proposal, portal

  **What to do**:
  - **delivery-record.routes.ts:53**: Replace `authorize("gerente", "residente", "administrativo", "cliente")` with composite constant or inline with comment
  - **delivery-record.routes.ts:61**: Replace `authorize("gerente", "residente", "cliente")` similarly
  - **template-draft.routes.ts:27,33,45,49**: Multiple `authorize("gerente", "administrativo")` — replace with `DOCUMENT_MANAGEMENT_ROLES` constant
  - **custom-fields/custom-field.routes.ts:20,26,30**: Replace with appropriate constant
  - **proposal/proposal.routes.ts:95,102**: `authorize("cliente")` — this is intentional for client approval. Keep with comment or use constant
  - **portal/portal.routes.ts:9**: `router.use(authorize("cliente"))` — keep as-is (portal is client-only) or use constant
  - Run `npm run typecheck -w backend && npm run lint -w backend`

  **Parallelization**: YES | **Blocked By**: 2.1

  **Acceptance Criteria**: Zero hardcoded roles in these 6 files | Typecheck + lint pass

  **Commit**: YES — `refactor(rbac): migrate delivery-record, template-draft, custom-fields, proposal, portal routes`

---

- [ ] 2.7. Migrate Hardcoded Roles — Remaining Singles (user, asset, report, admin-backup, jobs, document)

  **What to do**:
  - **user/user.routes.ts:127**: Replace `authorize("gerente")`
  - **asset/asset.routes.ts:107**: Replace `authorize("gerente")`
  - **report/report.routes.ts:108**: Replace `authorize("gerente")`
  - **admin-backup/admin-backup.routes.ts:18**: `router.use(authorize("gerente"))` — replace with constant
  - **jobs/jobs.routes.ts:13,16**: Replace `authorize("gerente")` 
  - **documents/document.routes.ts:111**: Replace `authorize("tecnico", "operador", "supervisor", "residente")` with appropriate composite
  - Run `npm run typecheck -w backend && npm run lint -w backend`

  **Parallelization**: YES | **Blocked By**: 2.1

  **Acceptance Criteria**: Zero hardcoded roles in all remaining files | Typecheck + lint pass | Final grep shows zero `authorize("` patterns

  **Commit**: YES — `refactor(rbac): migrate remaining hardcoded role strings to domain constants`

---

- [ ] 2.8. Create Biome Custom Rule to Flag `authorize("literal")` Patterns

  **What to do**:
  - Create a Biome lint rule that detects the pattern `authorize("string")` in any `.ts` file
  - Place it in `tooling/biome/` or as a custom lint configuration
  - If Biome doesn't support custom rules, create a standalone check script at `tooling/quality/check-hardcoded-roles.ts`:
    - Use regex or AST parsing (via TypeScript compiler API) to find all `authorize("STRING")` patterns
    - Exclude false positives (comments)
    - Report file:line for each finding
    - Exit with code 1 if any hardcoded roles found
  - Add script to `package.json` as `quality:hardcoded-roles`
  - Add to `quality:strict` chain before `quality:routes`
  - Run against current codebase to verify it catches the known 49 instances (should catch them all since we're migrating in tasks 2.2-2.7)
  - After migration, run again to confirm zero matches

  **Parallelization**: YES (independent from migration, can be developed in parallel)
  **Blocks**: None (but integrates with quality pipeline)
  **Blocked By**: 2.1 (to know target constants)

  **References**:
  - All existing `tooling/quality/*.ts` files — Follow the pattern (shared.ts, reportWithBaseline, etc.)
  - `backend/src/modules/*/*.routes.ts` — The files to scan
  - `backend/src/middlewares/authorize.middleware.ts` — The authorize function

  **Acceptance Criteria**:
  - [ ] `tooling/quality/check-hardcoded-roles.ts` exists and runs
  - [ ] Script correctly detects `authorize("literalString")` patterns
  - [ ] Script does NOT flag `authorize(...CONSTANT)` or `authorize(...variable)` patterns
  - [ ] Added to `quality:strict` npm script
  - [ ] After Wave 2 migration, script reports zero violations

  **QA Scenarios**:
  ```
  Scenario: Hardcoded role detection
    Tool: Bash
    Steps:
      1. Run tsx tooling/quality/check-hardcoded-roles.ts
      2. If before migration: assert count > 0, verify matches are real
      3. If after migration: assert exit code 0, zero findings
    Expected Result: Script accurately detects or confirms zero hardcoded roles
    Evidence: .sisyphus/evidence/task-2.8-role-checker.txt
  ```

  **Commit**: YES
  - Message: `feat(tooling): add hardcoded-role detection script to quality pipeline`
  - Files: `tooling/quality/check-hardcoded-roles.ts`, `package.json`

---

### WAVE 3 — Architectural Enforcement & Frontend Gap Closure (8 tasks)

---

- [ ] 3.1. Create Pre-Commit Hook for `quality:routes`

  **What to do**:
  - Edit or create `.husky/pre-commit` hook
  - Add quality checks that run on staged backend route files:
    ```bash
    # Check staged route files for violations
    STAGED_ROUTES=$(git diff --cached --name-only --diff-filter=ACMR | grep 'routes\.ts$' || true)
    if [ -n "$STAGED_ROUTES" ]; then
      npx tsx tooling/quality/check-routes.ts
      if [ $? -ne 0 ]; then
        echo "ERROR: Route quality check failed. Fix violations before committing."
        exit 1
      fi
    fi
    ```
  - Also run hardcoded-role checker on staged files:
    ```bash
    if [ -n "$STAGED_ROUTES" ]; then
      npx tsx tooling/quality/check-hardcoded-roles.ts --staged
      if [ $? -ne 0 ]; then
        echo "ERROR: Hardcoded roles detected. Use @cermont/domain constants."
        exit 1
      fi
    fi
    ```
  - Test: Stage a violating route file, attempt commit, verify rejection
  - Test: Stage a clean route file, verify commit succeeds

  **Must NOT do**:
  - Do NOT make pre-commit so slow that it blocks development
  - Only check staged route files, not the entire codebase

  **Parallelization**: YES (independent from Wave 2 end; can be done alongside Wave 2)
  **Blocks**: None (but critical for preventing regression)
  **Blocked By**: 1.1 (checker fix), 2.8 (role checker)

  **References**:
  - `.husky/pre-commit` — Existing pre-commit hook
  - `package.json` — lint-staged config (extend if needed)

  **Acceptance Criteria**:
  - [ ] Pre-commit hook runs quality checks on staged route files
  - [ ] Committing with violating route fails with clear error message
  - [ ] Committing with clean routes succeeds
  - [ ] `npm run test` still works (hooks don't break test runs)

  **QA Scenarios**:
  ```
  Scenario: Block violating commit
    Tool: Bash
    Steps:
      1. Create a test route file missing authentication
      2. git add the file
      3. Attempt git commit
      4. Assert commit is rejected with route quality error message
      5. git reset to clean state
    Expected Result: Pre-commit hook blocks violation
    Evidence: .sisyphus/evidence/task-3.1-block-violation.txt

  Scenario: Allow clean commit
    Tool: Bash
    Steps:
      1. Make a trivial clean change
      2. git add && git commit
      3. Assert commit succeeds
    Expected Result: Clean commits pass
    Evidence: .sisyphus/evidence/task-3.1-clean-commit.txt
  ```

  **Commit**: YES
  - Message: `feat(hooks): add route quality and hardcoded-role pre-commit checks`
  - Files: `.husky/pre-commit`

---

- [ ] 3.2. Create CI Pipeline Gate for `npm run verify`

  **What to do**:
  - Create or update `.github/workflows/ci.yml`:
    ```yaml
    name: Cermont CI
    on: [push, pull_request]
    jobs:
      verify:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with: { node-version: '22' }
          - run: npm ci
          - run: npm run typecheck
          - run: npm run lint  
          - run: npm run test
          - run: npm run build
          - run: npm run quality:routes
          - run: npm run doctor:verbose -w frontend
    ```
  - Add step for hardcoded-role check
  - Add step for contract guard
  - Configure branch protection rules to require CI passing
  - If GitHub Actions not available, document the CI config and create equivalent local script

  **Parallelization**: YES
  **Blocks**: None
  **Blocked By**: 2.8 (for role check), 1.1 (for route check)

  **References**:
  - `.github/workflows/` — Any existing workflow files
  - `package.json` — Verify script

  **Acceptance Criteria**:
  - [ ] CI workflow file exists with all quality gates
  - [ ] Workflow runs typecheck, lint, test, build, quality:routes, doctor
  - [ ] Workflow fails if any gate fails
  - [ ] Documented how to configure branch protection

  **Commit**: YES
  - Message: `ci: add quality gate workflow with route, role, and doctor checks`
  - Files: `.github/workflows/ci.yml`

---

- [ ] 3.3. Create Auto-Baseline Script for Quality Tools

  **What to do**:
  - Create `tooling/quality/update-baseline.ts`:
    - Run all quality checks
    - Capture the current finding counts
    - Write them to `tooling/quality/baseline.json`
    - Commit the updated baseline
  - This allows controlled baseline updates when intentional changes affect counts
  - Add npm script: `quality:baseline-update`
  - Document in `tooling/quality/README.md` when to use it

  **Parallelization**: YES | **Blocked By**: 1.1

  **References**: All existing `tooling/quality/*.ts` files
  **Acceptance Criteria**: Script runs all checks, captures outputs, updates baseline.json

  **Commit**: YES — `feat(tooling): add auto-baseline update script for quality tools`

---

- [ ] 3.4. Complete REQUIRED_NOT_IMPLEMENTED Frontend Routes — Part 1 (proposals, orders)

  **What to do**:
  - Based on `FRONTEND_ROUTE_MAP.md`:
  - **Route 13**: `/proposals/[id]/costs` — Create proposal cost estimates page
    - API: `GET /api/proposals/:id/costs`
    - Query hook: `useProposalCosts`
    - States: Loading, Error, Empty, Offline
    - RBAC: gerente, residente, HES
  - **Route 20A**: `/orders/[id]/planning` — Verify exists and is fully implemented with all states
  - **Route 20E**: `/orders/[id]/edit` — Verify edit page is complete
  - For each: Contract-first approach:
    1. Check Zod schema exists in shared-types
    2. Check backend endpoint exists
    3. Check frontend API client function exists
    4. Check TanStack Query hook exists
    5. Create/update the UI page
    6. Add tests
  - Run `npm run test -w frontend`

  **Parallelization**: YES | **Blocked By**: None (can use existing API contracts)

  **References**: `docs/architecture/FRONTEND_ROUTE_MAP.md`, `docs/architecture/API_ENDPOINT_MATRIX.md`
  **Acceptance Criteria**: Routes work end-to-end with all 4 states (loading, error, empty, offline)

  **Commit**: YES — `feat(routes): implement proposals cost estimates and order planning/edit pages`

---

- [ ] 3.5. Complete REQUIRED_NOT_IMPLEMENTED Frontend Routes — Part 2 (reports, billing)

  **What to do**:
  - Based on `FRONTEND_ROUTE_MAP.md`:
  - **Route 33**: `/reports/analytics` — Create reports analytics page with charts
  - **Route 33A**: `/reports/archive` — Create reports archive page
  - **Route 33B**: `/reports/[id]/draft` — Create draft mode for reports
  - **Route 33C**: `/reports/[id]/sign` — Create signing interface for reports
  - **Route 41A**: `/billing/invoices/new` — Verify and enhance invoice creation
  - Check all the contract-first steps for each
  - Run `npm run test -w frontend && npm run build -w frontend`

  **Parallelization**: YES (can run alongside 3.4)
  **Blocks**: None | **Blocked By**: None

  **Acceptance Criteria**: Routes work with proper states and RBAC

  **Commit**: YES — `feat(routes): implement reports analytics/archive and billing invoice routes`

---

- [ ] 3.6. Fix react-doctor Violations in Frontend

  **What to do**:
  - Run `npx react-doctor --verbose -w frontend` and capture full output
  - Categorize violations:
    - Accessibility issues (missing ARIA, labels, focus management)
    - Semantic HTML issues (div soup, missing landmarks)
    - Performance issues (large bundles, missing lazy loading)
    - Architecture issues (barrel imports, large components)
    - State management issues
  - Fix P0 violations first (anything that breaks functionality or is a security concern)
  - Fix P1 violations (accessibility, semantics blocking WCAG compliance)
  - Fix P2 violations (performance, architecture)
  - Document any P3 items that can be deferred
  - Re-run `npx react-doctor --verbose` and confirm zero issues

  **Must NOT do**:
  - Do NOT rewrite working components — only fix what react-doctor flags
  - Do NOT change component behavior

  **Parallelization**: YES | **Blocked By**: None

  **References**: `frontend/` — All frontend source
  **Acceptance Criteria**: `npx react-doctor --verbose` exits with code 0, zero violations

  **QA Scenarios**:
  ```
  Scenario: react-doctor passes
    Tool: Bash (workdir: frontend)
    Steps:
      1. Run npx react-doctor --verbose
      2. Assert exit code 0
      3. Assert output says no violations or all resolved
    Expected Result: Frontend passes doctor check
    Evidence: .sisyphus/evidence/task-3.6-react-doctor.txt
  ```

  **Commit**: YES
  - Message: `fix(frontend): resolve react-doctor violations for a11y, semantics, performance`
  - Files: Multiple frontend files

---

- [ ] 3.7. Update ARCHITECTURE_BLUEPRINT.md with Actual Module Structure

  **What to do**:
  - The blueprint says `backend/src/routes/` — actual is `backend/src/modules/<feature>/<feature>.routes.ts`
  - Fix section 1 (Monorepo Structure) to show correct module layout
  - Fix section 3.2 (Backend Layer Sequence) to use `modules/<feature>/<feature>.routes.ts`
  - Add note about the module pattern: each module has `.routes.ts`, `.controller.ts`, `.service.ts`, optional `.model.ts`
  - Verify all other paths in the document match actual code
  - Update `docs/README.md` if needed

  **Parallelization**: YES | **Blocked By**: None (can be done anytime)
  **Acceptance Criteria**: Architecture blueprint reflects actual code structure

  **Commit**: YES — `docs: update ARCHITECTURE_BLUEPRINT.md to reflect actual module structure`

---

- [ ] 3.8. Update FRONTEND_ROUTE_MAP.md and API_ENDPOINT_MATRIX.md to 100% Accuracy

  **What to do**:
  - Audit `FRONTEND_ROUTE_MAP.md`:
    - For each route listed, verify it exists in `frontend/src/app/`
    - Update status from `REQUIRED_NOT_IMPLEMENTED` to `IMPLEMENTED` for routes completed in 3.4/3.5
    - Add any missing routes found in actual code
    - Verify RBAC column matches actual implementation
  - Audit `API_ENDPOINT_MATRIX.md`:
    - For each endpoint, verify it exists in `backend/src/modules/`
    - Update status from `REQUIRED` to `IMPLEMENTED`
    - Add any missing endpoints found in actual code
    - Verify schema references are accurate
  - Run `npm run contracts:check` to ensure snapshot is valid

  **Parallelization**: YES | **Blocked By**: 3.4, 3.5 (so routes are complete before documenting)
  **Acceptance Criteria**: Both documents are 100% accurate, no discrepancies between docs and code

  **Commit**: YES — `docs: update route map and API matrix to 100% implementation accuracy`

---

### WAVE 4 — Business Feature Completion (8 tasks)

---

- [ ] 4.1. Complete Document Import → Template → Form → Response Pipeline

  **What to do**:
  - Audit the full document-driven forms pipeline against `CERMONT_ARCHITECTURE_BLUEPRINT.md` section 3.3:
  - **DocumentImport**: Verify upload → parser → detection (field types, checklists, signatures) → human review UI
    - Check `backend/src/modules/documents/document-import.routes.ts` — POST /imports, POST /imports/:id/analyze
    - Check frontend pages for document import workflow with review UI
  - **DocumentTemplate**: Verify versioned templates with fields, tables, checklists, signatures
    - Check `backend/src/modules/documents/document-template.routes.ts` — POST /, GET /, GET /:id
    - Check `frontend/src/app/documents/templates/` — should have list, detail, new pages
  - **DynamicForm**: Verify form generation from templates
    - Check `backend/src/modules/form-submissions/` or equivalent
    - Check frontend dynamic form rendering
  - **TemplateResponse**: Verify response capture and submission
    - Check `backend/src/modules/template-response/` — CRUD + submit
    - Check frontend form response UI
  - **GeneratedDocument**: Verify PDF/acta generation from completed forms
    - Check `backend/src/modules/report/` — report generation
  - For each gap: implement the missing piece (contract-first: schema → backend → frontend)
  - Run `npm run test && npm run build`

  **Must NOT do**:
  - Do NOT duplicate existing document modules — check what exists first
  - Do NOT create circular dependencies between document modules

  **Parallelization**: YES (mostly linear — import → template → form → response → generated)
  **Blocks**: None | **Blocked By**: None (incremental — build on what exists)
  **References**: `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` §3.3, `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` §5.2

  **Acceptance Criteria**:
  - [ ] User can upload PDF/Excel/Word → fields detected → human review → template created
  - [ ] Dynamic form rendered from template → user fills fields → response saved
  - [ ] Generated document (PDF) created from completed form
  - [ ] All states present: loading, error, empty, offline-for-field-capture
  - [ ] `npm run test` passes

  **Commit**: YES
  - Message: `feat(documents): complete document-driven forms pipeline end-to-end`
  - Files: Multiple (shared-types schemas, backend modules, frontend modules)

---

- [ ] 4.2. Complete Cost Engine v2 with Deviation Alerts

  **What to do**:
  - Audit current cost implementation against `CERMONT_ARCHITECTURE_BLUEPRINT.md` §3.6:
  - **Cost Baseline**: Verify proposal costs are frozen at approval/conversion
    - Check `backend/src/modules/costs/` — cost baseline endpoints
  - **ActualCost**: Verify execution materials, labor, tools, equipment, transport are tracked
    - Check cost cart implementation during execution
    - Each actual cost entry should link to ExecutionSession
  - **CostComparison**: Implement comparison view (proposal baseline vs actual costs)
    - Server-side calculation of variance
    - Frontend UI showing comparison table/charts
  - **Deviation Alerts**: Implement configurable threshold alerts
    - When variance > X% (configurable per order), generate notification
    - Use notification module infrastructure
  - **Cost Dashboard**: `/costs/[orderId]` page should show real-time comparison
  - Run `npm run test -w backend && npm run test -w frontend`

  **Must NOT do**:
  - Do NOT create separate cost engine — extend existing modules
  - Do NOT store calculated values when they can be computed server-side

  **Parallelization**: YES (can work on calculation engine and UI separately)
  **Blocks**: None | **Blocked By**: None

  **References**: `docs/product/COST_ENGINE_SPEC.md`, `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` §3.6
  **Acceptance Criteria**: Cost comparison visible, deviation alerts trigger, all states covered

  **QA Scenarios**:
  ```
  Scenario: Cost comparison calculation
    Tool: Bash
    Steps:
      1. Create proposal with items worth $1000
      2. Convert to order
      3. Record actual costs of $1200 via execution
      4. GET /api/orders/:id/costs
      5. Assert response includes baseline, actual, variance ($200), variance percentage (20%)
    Expected Result: Server-side cost comparison works
    Evidence: .sisyphus/evidence/task-4.2-cost-comparison.txt
  ```

  **Commit**: YES — `feat(costs): implement cost engine v2 with deviation alerts and comparison UI`

---

- [ ] 4.3. Complete Offline Field Module with Conflict Resolution UI

  **What to do**:
  - Audit current offline implementation against `CERMONT_ARCHITECTURE_BLUEPRINT.md` §3.5 and §8:
  - **IndexedDB Queue**: Verify `frontend/src/lib/pwa/offline-queue.ts` handles:
    - Evidence binary storage in IndexedDB
    - Queue with idempotency keys (`clientMutationId`)
    - Retry with backoff
    - DLQ for failed items
  - **Conflict Resolution UI**: Build `/offline-sync` page:
    - Show all pending, syncing, failed, and conflicted items
    - Allow manual retry per item
    - Show conflict details (local vs server state)
    - Allow discard of failed items with acknowledgement
  - **Sync Status Indicator**: Add global sync status chip/banner
    - Connected/offline/syncing status
    - Pending count badge
    - Click to open `/offline-sync` page
  - **Service Worker**: Verify Serwist SW configuration
    - NetworkOnly for `/api/*` and `/uploads/*`
    - Custom `message` listeners before Serwist handlers
  - Run `npm run build -w frontend`

  **Must NOT do**:
  - Do NOT cache API responses in Service Worker for mutation endpoints
  - Do NOT delete IndexedDB data automatically when pending items exist
  - Do NOT use `middleware.ts` for offline detection

  **Parallelization**: YES | **Blocked By**: None

  **References**: `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` §3.5, §8
  **Acceptance Criteria**: Offline queue functions, conflict resolution UI works, sync is visible

  **Commit**: YES — `feat(offline): implement conflict resolution UI and sync status dashboard`

---

- [ ] 4.4. Implement Administrative Closure State Machine

  **What to do**:
  - Based on `CERMONT_ARCHITECTURE_BLUEPRINT.md` §3.7:
  - **DeliveryRecord signed** → **ServiceEntrySheet**: Gate check — ensure delivery record is signed before SES can be created
  - **SES submitted** → **SES Approved**: Gate check — SES must be submitted and approved before invoice
  - **Invoice generated** → **Invoice Approved**: Gate check — invoice must be approved
  - **Invoice approved** → **Payment registered**: Gate check
  - **Payment registered** → **Case Closed**: Automatic closure when payment is complete
  - Implement `CermontWorkflowGateService` in backend:
    - `canAdvanceTo(serviceCaseId, targetState)`: Returns boolean + reason if blocked
    - `advanceState(serviceCaseId, targetState, userId)`: Mutates state after gate checks
    - Audit log for each state transition
  - Frontend: Disable buttons/actions that fail gate checks
  - Frontend: Show blocked state with reason tooltip

  **Must NOT do**:
  - Do NOT allow state transitions that skip required steps
  - Do NOT hardcode state machine logic in UI components

  **Parallelization**: YES | **Blocked By**: 4.2 (cost engine may affect closure)

  **References**: `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`, `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` §3.7
  **Acceptance Criteria**: 14-step gate checks prevent skipped steps, audit logged

  **Commit**: YES — `feat(workflow): implement administrative closure state machine with gate checks`

---

- [ ] 4.5. Complete Evidence Gallery with Timeline View and Verification Workflow

  **What to do**:
  - **Evidence Timeline View**: Build timeline-style evidence gallery
    - Group evidences by execution session
    - Show chronological order with thumbnails
    - Click to expand full evidence detail
  - **Evidence Verification Workflow**:
    - supervisor/gerente can mark evidence as "verified" or "rejected"
    - Rejected evidence requires comment/reason
    - Evidence status shown in gallery (pending, verified, rejected)
  - **Evidence Upload Experience**:
    - Mobile-friendly camera capture
    - Batch upload with progress indicators
    - Offline queue status per evidence item
    - GPS coordinates capture (if available)
  - Check `backend/src/modules/evidence/` — verify all endpoints exist
  - Check `frontend/src/app/evidences/` — verify pages and states

  **Must NOT do**: Do NOT allow deletion of verified evidences

  **Parallelization**: YES | **Blocked By**: None

  **References**: `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` §8 (Evidence entity)
  **Acceptance Criteria**: Timeline view works, verification workflow functions, upload works offline

  **Commit**: YES — `feat(evidences): implement evidence timeline view and verification workflow`

---

- [ ] 4.6. Implement ServiceCase Cockpit Unified View

  **What to do**:
  - Build a unified `/service-cases/[id]/cockpit` page showing ALL 14 steps
  - Each step shows:
    - Status indicator (completed, in-progress, pending, blocked, skipped)
    - Entity name + link to detail page
    - Key metadata (dates, assignee, amount)
    - Blocked reason (if blocked by gate check)
  - **Top section**: ServiceCase summary (client, location, total value, current step)
  - **Progress bar**: Visual 14-step progress with current step highlighted
  - **Timeline sidebar**: Chronological event log (audit events + state transitions)
  - **Quick actions**: Buttons for next allowed action per step
  - RBAC: gerente, residente, HES see full cockpit; cliente sees read-only; others see limited
  - Run `npm run test -w frontend && npm run build -w frontend`

  **Must NOT do**:
  - Do NOT create duplicate data fetching — use existing TanStack Query hooks
  - Do NOT put business logic in UI — gate checks go through backend

  **Parallelization**: YES | **Blocked By**: 4.4 (gate service needed for blocked status)

  **References**: `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` (14-step flow table)
  **Acceptance Criteria**: Cockpit shows all 14 steps with accurate status, RBAC enforced

  **Commit**: YES — `feat(service-cases): implement 14-step cockpit view with progress and timeline`

---

- [ ] 4.7. Add Missing Loading/Error/Empty/Offline States Across Critical Pages

  **What to do**:
  - Audit critical frontend pages (based on `docs/REGLAS_DESARROLLO_CERMONT.md` section 6):
  - For each page in the critical list:
    - /dashboard, /work-requests, /proposals, /orders, /execution, /evidences, /reports
    - /delivery-records, /billing/ses, /billing/invoices, /payments, /service-cases
  - Verify:
    - **Loading state**: Skeleton/spinner shown during data fetch
    - **Error state**: Error message with retry button (NOT blank page)
    - **Empty state**: "No items" message with CTA to create first item
    - **Offline state**: Offline banner + stale data indicator
    - **Forbidden state**: "Access denied" message for unauthorized users
  - Build shared components for each state type:
    - `frontend/src/components/common/LoadingState.tsx`
    - `frontend/src/components/common/ErrorState.tsx`
    - `frontend/src/components/common/EmptyState.tsx`
    - `frontend/src/components/common/OfflineState.tsx`
    - `frontend/src/components/common/ForbiddenState.tsx`
  - Integrate into all critical pages using consistent patterns
  - Run `npm run test -w frontend && npm run build -w frontend`

  **Must NOT do**: Do NOT add states to non-critical/admin pages until critical ones are done

  **Parallelization**: YES | **Blocked By**: None

  **References**: `docs/REGLAS_DESARROLLO_CERMONT.md` §6 — "Loading/Error/Empty/Offline States Required"
  **Acceptance Criteria**: Every critical page has all 5 states, shared components used consistently

  **Commit**: YES — `feat(frontend): add shared loading/error/empty/offline/forbidden state components`

---

- [ ] 4.8. End-to-End Playwright Tests for All 14 Business Flow Steps

  **What to do**:
  - Create Playwright E2E tests for the complete 14-step flow:
    - **Flow 1**: WorkRequest → SiteVisit → Proposal → PO (pre-sale cycle)
    - **Flow 2**: Proposal approved → Order → Planning → Execution → Evidence (execution cycle)
    - **Flow 3**: TechnicalReport → DeliveryRecord → ClientSignature (delivery cycle)
    - **Flow 4**: SES → Invoice → InvoiceApproval → Payment → Closed (closure cycle)
  - Each test:
    - Login with appropriate role
    - Navigate through the flow step by step
    - Assert correct state transitions
    - Assert gate checks block invalid transitions
    - Take screenshots at key points
  - Test RBAC:
    - Assert unauthorized users get 403/redirect
    - Assert authorized users can perform allowed actions
  - Test error states:
    - Submit invalid data → assert validation error
    - Try to skip step → assert gate blocks
  - Run `npm run test:e2e -w frontend`

  **Parallelization**: YES | **Blocked By**: 4.4 (gate service needed for state machine tests)

  **References**: `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`, `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` §12
  **Acceptance Criteria**: All 4 E2E flows pass, RBAC tests pass, error tests pass

  **QA Scenarios**:
  ```
  Scenario: WorkRequest → SiteVisit flow
    Tool: Bash (Playwright)
    Steps:
      1. npm run test:e2e -w frontend -- --grep "work-request-to-site-visit"
      2. Assert all assertions pass
    Expected Result: E2E flow passes
    Evidence: .sisyphus/evidence/task-4.8-e2e-flow1.txt
  ```

  **Commit**: YES — `test(e2e): implement end-to-end Playwright tests for 14-step business flow`
  - Files: `frontend/tests/e2e/` (multiple files)

---

### WAVE 5 — Innovation & Scaling (8 tasks)

---

- [ ] 5.1. AI-Powered OCR Extraction from Uploaded Documents

  **What to do**:
  - Integrate OCR capability into the document import pipeline (Task 4.1 foundation):
  - **PDF Text Extraction**: Use `pdf-lib` (already in stack) for text extraction from PDFs
  - **Image OCR**: Integrate Tesseract.js or a cloud OCR API (Google Vision, Azure Form Recognizer) for scanned documents/photos
  - **Field Detection**: Build detection logic for common field types:
    - Text fields (short text, long text)
    - Number fields (with units detection)
    - Date fields
    - Checkboxes
    - Signature fields
    - Table structures
  - **Human Review UI**: Enhance document import review screen to show detected fields
    - Side-by-side: original document → detected fields
    - Allow correction before template creation
  - **AI Confidence Score**: Show confidence per detected field
    - Low confidence fields highlighted for mandatory human review
  - **Document Classification**: Detect document type (invoice, report, checklist, etc.) from content
  - Backend: `POST /api/documents/imports/:id/analyze` enhanced with OCR pipeline
  - Run `npm run test -w backend`

  **Must NOT do**:
  - Do NOT replace human review — AI is assistive only
  - Do NOT add cloud dependencies that require vendor lock-in

  **Parallelization**: YES (can be built on top of completed document pipeline)
  **Blocks**: None | **Blocked By**: 4.1

  **References**: `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` §5.2
  **Acceptance Criteria**: OCR extracts text from PDF, fields detected with confidence scores, human review works

  **Commit**: YES — `feat(ai): implement OCR extraction and field detection for document imports`

---

- [ ] 5.2. Real-Time Dashboard with WebSocket Push

  **What to do**:
  - Implement real-time updates for critical dashboard data:
  - **Technology Choice**: Server-Sent Events (SSE) over WebSocket — simpler, HTTP-native, works through proxy
    - OR Socket.IO if bi-directional communication needed
  - **Backend SSE Endpoint**: `GET /api/dashboard/stream`
    - Emit events on: order status change, new evidence, cost deviation, payment received
    - Events are role-filtered (users only see what they're authorized for)
  - **Frontend Integration**:
    - Custom hook `useDashboardStream()` in TanStack Query or Zustand
    - Auto-update dashboard KPIs without polling
    - Notification toast for critical events (cost deviation, approval needed)
  - **Dashboard Performance**:
    - Lazy-load chart components
    - Debounce rapid events (batch updates every 500ms)
    - Fallback to polling if SSE connection fails
  - Run `npm run test -w backend && npm run test -w frontend`

  **Must NOT do**:
  - Do NOT send sensitive data through SSE without auth
  - Do NOT replace existing REST endpoints — SSE is additive for real-time

  **Parallelization**: YES | **Blocked By**: None (can be independent)

  **References**: `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` §11 (Observability)
  **Acceptance Criteria**: Dashboard updates in real-time without page refresh, events filtered by role

  **Commit**: YES — `feat(dashboard): implement real-time SSE streaming for dashboard updates`

---

- [ ] 5.3. Predictive Cost Deviation Alerts

  **What to do**:
  - Build on Cost Engine (Task 4.2) with ML-light prediction:
  - **Deviation Prediction**: Based on current execution progress + actual costs:
    - Calculate projected final cost = (actual_cost / %complete) * 100
    - Compare projected vs baseline → predicted deviation
  - **Configurable Thresholds**: Per-order or global settings:
    - Warning: deviation > 10% (yellow alert)
    - Critical: deviation > 25% (red alert)
    - Configurable in admin settings UI
  - **Alert Delivery**: 
    - In-app notification (use existing notification module)
    - Email notification (optional — requires mail service)
    - Dashboard alert badge
  - **Alert Dashboard**: `/costs/[orderId]` — show:
    - Current deviation (actual vs baseline)
    - Predicted final deviation
    - Cost burn rate (per day/week)
    - Top 3 cost overrun items
  - Backend: `GET /api/costs/:orderId/deviations` — prediction endpoint
  - Run `npm run test -w backend`

  **Must NOT do**:
  - Do NOT make financial decisions automatically — alerts only, no auto-actions
  - Do NOT store predictions as facts — always show they're projections

  **Parallelization**: YES | **Blocked By**: 4.2 (Cost Engine)

  **References**: `docs/product/COST_ENGINE_SPEC.md`
  **Acceptance Criteria**: Deviation predictions visible, alerts trigger at thresholds, notification delivered

  **Commit**: YES — `feat(costs): implement predictive cost deviation alerts with configurable thresholds`

---

- [ ] 5.4. Performance Budget Enforcement in CI

  **What to do**:
  - Add Lighthouse CI or custom performance budget to CI pipeline:
  - **Performance Budget Configuration**:
    - Create `lighthouserc.js` or equivalent:
    ```js
    module.exports = {
      ci: {
        collect: { url: ['http://localhost:3000/dashboard', 'http://localhost:3000/orders'] },
        assert: {
          assertions: {
            'categories:performance': ['warn', { minScore: 0.8 }],
            'categories:accessibility': ['error', { minScore: 0.9 }],
            'categories:best-practices': ['error', { minScore: 0.9 }],
            'categories:seo': ['error', { minScore: 0.9 }],
            'resource-summary:script:size': ['error', { maxNumericValue: 500 * 1024 }],  // 500KB JS
          }
        },
        upload: { target: 'temporary-public-storage' }
      }
    };
    ```
  - Add CI step in GitHub Actions workflow
  - Add npm script: `npm run perf:budget`
  - **Bundle Analysis**: Add `next-bundle-analyzer` for development bundle insight
  - **Lazy Loading Audit**: Verify all heavy modules use dynamic imports
    - Charts (Recharts) — lazy loaded
    - Calendar (FullCalendar) — lazy loaded
    - Document viewers — lazy loaded
  - Run `npm run build -w frontend`

  **Must NOT do**:
  - Do NOT add Lighthouse CI if it takes >5 minutes — use lightweight alternatives
  - Do NOT sacrifice functionality for performance — find balanced budgets

  **Parallelization**: YES | **Blocked By**: 3.2 (CI pipeline)

  **References**: `docs/REGLAS_DESARROLLO_CERMONT.md` §13 (Performance)
  **Acceptance Criteria**: CI enforces performance budgets, bundle sizes tracked, lazy loading verified

  **Commit**: YES — `ci: add performance budget enforcement with Lighthouse CI thresholds`

---

- [ ] 5.5. Multi-Tenant Data Isolation Certification and Security Hardening

  **What to do**:
  - **Tenant Isolation Audit**: Review all backend services for proper clientId filtering
    - Verify `tenantQuery` plugin is applied to all models with `clientId`
    - Verify linked artifacts use owning order/serviceCase as authorization root
    - Check for any direct cross-tenant data access
  - **OWASP Top 10 Scan**: Run automated security scan:
    - Add `zap-cli` or `security-audit` script to CI
    - Check: XSS, CSRF, SQL/NoSQL injection, insecure direct object references
  - **Rate Limiting Hardening**: Verify rate limits are applied correctly:
    - Auth endpoints: 5/min for credentials, 30/min for refresh
    - Upload endpoints: 10/min
    - General API: 100/15min per user
    - Health endpoints: exempt from rate limiting
  - **Helmet Configuration Audit**:
    - Verify CSP headers are properly configured
    - Verify HSTS is enabled for production
    - Verify X-Frame-Options denies embedding
  - **Cookie Security Audit**:
    - Refresh token cookies: HttpOnly, Secure, SameSite=Strict
    - Access tokens: memory-only (not in cookies or localStorage)
  - Document findings in `docs/security/` directory

  **Must NOT do**:
  - Do NOT change production security settings without testing
  - Do NOT store access tokens in localStorage or sessionStorage

  **Parallelization**: YES | **Blocked By**: None

  **References**: `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` §9, `docs/REGLAS_DESARROLLO_CERMONT.md` §7
  **Acceptance Criteria**: Tenant isolation verified, OWASP scan clean, security hardening documented

  **Commit**: YES — `ci(security): add automated OWASP scan and harden multi-tenant data isolation`
  - Files: `.github/workflows/security.yml`, `docs/security/`

---

- [ ] 5.6. PWA Installation Polish

  **What to do**:
  - **Install Prompt**: Implement custom in-app install prompt:
    - Show install banner on mobile after 2 visits
    - Track dismissals (don't show again if dismissed 3 times)
    - Platform-aware: different prompts for iOS vs Android
  - **Update Flow**: Implement Service Worker update flow:
    - Detect new SW waiting to activate
    - Show "Update available" toast with reload button
    - On acceptance: skipWaiting() + reload page
  - **Offline Indicator**: Persistent UI indicator:
    - Global banner when offline
    - Chip showing sync status (pending/syncing/error)
    - Click to open offline dashboard
  - **PWA Manifest**: Verify manifest.json:
    - Proper app name, description, icons (192px, 512px)
    - Display: standalone (full-screen PWA experience)
    - Theme and background colors matching Cermont palette (#2154A6, #4CAF50)
    - Start URL and scope correctly configured
  - **Splash Screen**: Ensure proper splash screen on mobile
  - Run `npm run build -w frontend && npm run test:e2e -w frontend`

  **Must NOT do**:
  - Do NOT prevent users from accessing the web app if they dismiss install
  - Do NOT auto-install without user consent

  **Parallelization**: YES | **Blocked By**: None

  **References**: `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` §8
  **Acceptance Criteria**: Install prompt works, update flow functions, offline indicator shows correct status

  **Commit**: YES — `feat(pwa): implement install prompt, update flow, and polished offline indicator`
  - Files: `frontend/src/app/manifest.ts`, multiple PWA-related files

---

- [ ] 5.7. Accessibility Audit — WCAG 2.2 AA Compliance

  **What to do**:
  - Run comprehensive WCAG 2.2 AA audit:
  - **Automated Scan**: Use axe-core via Playwright:
    - Run on all critical pages
    - Fix P1 violations (must fix for AA compliance)
    - Document P2 violations (should fix, track in backlog)
  - **Keyboard Navigation Audit**:
    - Tab through all interactive elements
    - Ensure visible focus indicators
    - Ensure skip-to-content link exists
    - Ensure modal/alert focus trapping works correctly
  - **Screen Reader Audit**:
    - Verify all form inputs have labels
    - Verify status announcements (toast, loading) use aria-live
    - Verify complex components (tables, charts) have accessible alternatives
  - **Color Contrast Audit**:
    - Verify all text meets 4.5:1 ratio (normal) and 3:1 (large)
    - Verify UI components (buttons, inputs) meet 3:1 ratio
    - Fix any contrast violations in Cermont palette (#2154A6, #4CAF50)
  - **Touch Target Audit**:
    - Verify all interactive elements are ≥44px (mobile)
    - Fix undersized touch targets
  - Create `docs/accessibility/WCAG_COMPLIANCE_REPORT.md` with findings
  - Run `npx react-doctor@latest` to confirm zero accessibility violations

  **Must NOT do**:
  - Do NOT remove existing ARIA attributes during audit fixes
  - Do NOT change visual design without design review

  **Parallelization**: YES | **Blocked By**: 3.6 (react-doctor fixes)

  **References**: `docs/REGLAS_DESARROLLO_CERMONT.md` §6 (Accessibility by Design)
  **Acceptance Criteria**: WCAG 2.2 AA compliance achieved, keyboard navigation works, screen reader compatible

  **Commit**: YES
  - Message: `fix(a11y): implement WCAG 2.2 AA compliance fixes across critical pages`
  - Files: Multiple frontend components

---

- [ ] 5.8. Automated OWASP ZAP Security Scan in CI

  **What to do**:
  - Integrate OWASP ZAP (Zed Attack Proxy) into CI pipeline:
  - **Baseline Scan**: Automated passive + active scan:
    - Run against deployed development environment or local server
    - Check for: XSS, SQL Injection, CSRF, Path Traversal, Remote Code Execution
    - Generate HTML report artifact
  - **API Scan**: Specifically target backend API endpoints:
    - Auth endpoints
    - File upload endpoints
    - Mutation endpoints
    - Check for: IDOR, mass assignment, lack of authorization
  - **Pipeline Integration**:
    ```yaml
    - name: ZAP Scan
      uses: zaproxy/action-full-scan@v0
      with:
        target: 'http://localhost:4000'
        rules_file_name: '.zap/rules.tsv'
        cmd_options: '-a'
    ```
  - **Findings Management**:
    - High/Critical findings block CI
    - Medium findings require documentation/acceptance
    - Low findings tracked in issues
  - **Remediation SLA**: Critical within 48 hours, High within 1 week
  - Create `docs/security/` directory with security posture documentation

  **Must NOT do**:
  - Do NOT run active scans against production without warning
  - Do NOT ignore scan findings without documented risk acceptance

  **Parallelization**: YES | **Blocked By**: 3.2 (CI pipeline), 5.5 (security hardening)

  **References**: `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` §9
  **Acceptance Criteria**: ZAP scan runs in CI, results published as artifacts, findings tracked

  **Commit**: YES
  - Message: `ci(security): implement OWASP ZAP automated security scanning in CI pipeline`
  - Files: `.github/workflows/security.yml`, `.zap/rules.tsv`, `docs/security/`

---

---

## APPENDIX M: Pre-Implementation Checklist (For Each Task)

Before starting ANY task, the executing agent MUST verify:

### Code-Level Checks
- [ ] Read the existing module's `.routes.ts`, `.controller.ts`, `.service.ts`, `.model.ts` to understand the pattern
- [ ] Check `packages/shared-types/src/schemas/` for existing Zod schemas (do NOT duplicate)
- [ ] Check `@cermont/domain` for existing role constants (do NOT hardcode)
- [ ] Check `backend/src/middlewares/` for existing validation middleware
- [ ] Check `FRONTEND_ROUTE_MAP.md` and `API_ENDPOINT_MATRIX.md` for the feature definition
- [ ] Check `docs/adr/` for any relevant architecture decisions

### Implementation-Level Checks
- [ ] Contract-first: Create Zod schema → inferred type → Mongoose model → service → controller → route
- [ ] Middleware order: `authenticate → authorize → validateBody/Query/Params → controller`
- [ ] Response envelope: `{ success: true, data: T }` or `{ success: false, error: { code, message } }`
- [ ] Error codes: Use typed errors from APPENDIX E, not raw text
- [ ] RBAC: Use `@cermont/domain` constants, never `authorize("literal")`
- [ ] Audit: Critical mutations MUST log audit events
- [ ] States: Every page needs loading, error, empty, offline, forbidden states
- [ ] No `any`/`unknown`/`null`/`undefined` for absence — use status objects

### Post-Implementation Checks
- [ ] TypeScript: `npm run typecheck` passes
- [ ] Lint: `npm run lint` passes
- [ ] Tests: `npm run test` passes (existing + new)
- [ ] Build: `npm run build` passes
- [ ] Routes: `npm run quality:routes` passes (zero violations)
- [ ] Hardcoded roles: `grep -r 'authorize("' backend/src/` returns zero matches
- [ ] react-doctor: `npx react-doctor@latest` passes (if frontend changes)
- [ ] API contracts: `npm run contracts:check` passes (if schema changes)

---

## APPENDIX N: Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|-----------|--------|-----------|-------|
| R1 | Checker regex fix breaks detection of genuinely insecure routes | Medium | High | Add dedicated test cases for all finding categories. Run against known-good and known-bad files. | Task 1.1 executor |
| R2 | Role constant migration widens access inadvertently | Medium | Critical | Code review all migration tasks. Verify authorization logic is preserved, only reference style changes. | Task 2.2-2.7 executors |
| R3 | Pre-commit hook blocks legitimate commits | Low | High | Make hook configurable (skip with `SKIP_ROUTE_CHECK=1`). Test with multiple scenarios. | Task 3.1 executor |
| R4 | CI workflow flaky due to environment differences | Medium | Medium | Use `ubuntu-latest` consistently. Cache `node_modules`. Document required environment variables. | Task 3.2 executor |
| R5 | react-doctor introduces false positives | Medium | Low | Triage systematically. Document P2/P3 items as tech debt backlog, not blockers. | Task 3.6 executor |
| R6 | Offline queue has data races during sync | Medium | High | Use `clientMutationId` idempotency keys. Test concurrent sync from multiple devices. | Task 4.3 executor |
| R7 | OCR accuracy too low for production use | High | Medium | Implement confidence scoring. Mandate human review for low-confidence fields. Never auto-accept. | Task 5.1 executor |
| R8 | SSE connections drop under load | Medium | Medium | Implement auto-reconnect with exponential backoff. Fall back to polling. | Task 5.2 executor |
| R9 | Security scan generates too many false positives | High | Low | Tune ZAP rules. Create `.zap/rules.tsv` to suppress known false positives. | Task 5.8 executor |
| R10 | E2E tests flaky due to async timing | Medium | Medium | Use Playwright auto-waiting. Add retries for known-flaky tests. Use `--retries=2`. | Task 4.8 executor |

---

## APPENDIX O: Architecture Decision Records (ADRs) — New Decisions for This Sprint

### ADR-006: Route Security Enforcement via Quality Gates
**Status**: Proposed | **Date**: 2026-07-06
**Context**: Multiple routes were found missing authentication, authorization, or validation middleware. Manual code review is insufficient to prevent regression.
**Decision**: Enforce route security through automated quality gates:
1. Pre-commit hooks block commits with route quality violations
2. CI pipeline runs `quality:routes` on every PR
3. All 3 baseline categories set to 0 (zero tolerance going forward)
4. Baseline updates require explicit maintainer approval
**Consequences**: Developers must add proper middleware chains to all new routes. Initial migration effort of ~15 minutes per affected route.

### ADR-007: RBAC Constants as Single Source of Truth
**Status**: Proposed | **Date**: 2026-07-06
**Context**: 49 hardcoded role strings across 22 route files make role management error-prone and unmaintainable.
**Decision**: Enforce that ALL role references use `@cermont/domain` constants:
1. Add auto-detection script to CI that fails on `authorize("literalString")` patterns
2. Maintain APPENDIX A as the canonical RBAC matrix
3. Any new role set needed must be added to `@cermont/domain` before use
**Consequences**: Slight increase in import overhead (1 extra import per file). Significant decrease in role management errors.

### ADR-008: SSE for Real-Time Updates (Not WebSocket)
**Status**: Proposed | **Date**: 2026-07-06
**Context**: Real-time dashboard updates needed without page refresh. Options: WebSocket, SSE, polling.
**Decision**: Use Server-Sent Events (SSE) for real-time updates:
1. Simpler protocol (HTTP-native, works through Next.js proxy)
2. Automatic reconnection built into EventSource API
3. No additional dependency (Socket.IO not needed)
4. Fall back to 30-second polling if SSE connection fails
**Consequences**: Unidirectional only (server → client). Mutations still use REST. SSE endpoints require authentication.

### ADR-009: Server-Side OCR (Not Client-Side)
**Status**: Proposed | **Date**: 2026-07-06
**Context**: Document import pipeline needs OCR for scanned PDFs and photos.
**Decision**: Implement OCR server-side using Node.js libraries:
1. `pdf-lib` (already in stack) for PDF text extraction
2. `tesseract.js` for image OCR (runs on server, not browser)
3. No cloud API dependency — works fully offline
4. Confidence scoring: <70% confidence requires human review
**Consequences**: Server CPU usage increases during OCR. Queue OCR jobs to avoid blocking API responses. Can scale horizontally if needed.

### ADR-010: Performance Budgets as Warning First, Then Error
**Status**: Proposed | **Date**: 2026-07-06
**Context**: CI performance budgets often flaky due to environment variance.
**Decision**: Implement performance budgets in two phases:
1. Phase 1 (Sprint 5): Budgets as WARNINGS — visible in CI output but not blocking
2. Phase 2 (Sprint 6): Budgets as ERRORS — block CI after baseline established
3. Bundle size checks (deterministic, not environment-dependent) are errors from Phase 1
**Consequences**: Gradual adoption reduces developer friction. Baseline data collected during Phase 1 informs realistic thresholds for Phase 2.

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

### F1 — Plan Compliance Audit (`oracle`)

**Scope**: Validate that every "Must Have" deliverable is implemented and every "Must NOT Have" is absent.

**Sub-Tasks**:
1. Read this plan end-to-end and create a checklist of all 59 tasks
2. For each task, verify:
   - Source code exists at the expected file paths
   - Route middleware chain matches Expected Result from QA scenarios
   - All acceptance criteria are met (read file contents, curl endpoints, run commands)
3. For "Must Have" items:
   - `quality:routes` → run `tsx tooling/quality/check-routes.ts`, assert 0 violations in all 3 categories
   - Hardcoded roles → run `grep -r 'authorize("' backend/src/`, assert zero matches
   - Pre-commit hook → create temp route violation, stage, try commit, assert rejection
   - CI pipeline → read `.github/workflows/ci.yml`, verify all steps
   - Frontend routes → navigate to each route via browser or curl, assert 200
   - react-doctor → run `npx react-doctor@latest`, assert exit code 0
4. For "Must NOT Have" items:
   - `any`/`unknown` → search for `as any`, `@ts-ignore`, `@ts-expect-error`
   - `middleware.ts` → verify file does NOT exist
   - Stack violations → verify no NestJS, Prisma, PostgreSQL, Auth.js, pnpm, yarn, Joi, Axios
   - Removed functionality → git log for deletions
5. Check evidence files exist in `.sisyphus/evidence/` for each task
6. Compare actual deliverables against plan's "Concrete Deliverables" section

**Output**:
```
Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N verified] | Evidence [N/N present]
VERDICT: APPROVE / REJECT
(If REJECT: list specific file:line with description of each gap)
```

### F2 — Code Quality Review (`unspecified-high`)

**Scope**: Ensure all modified code meets TypeScript, lint, test, and clean-code standards.

**Sub-Tasks**:
1. Run full typecheck across all workspaces:
   ```bash
   npm run typecheck
   ```
   Assert: exit code 0, no TypeScript errors

2. Run full lint across all workspaces:
   ```bash
   npm run lint
   ```
   Assert: exit code 0, no lint violations

3. Run all tests:
   ```bash
   npm run test
   ```
   Assert: exit code 0, all test suites pass

4. Run full build:
   ```bash
   npm run build
   ```
   Assert: exit code 0, all 5 workspaces build

5. Run contracts check:
   ```bash
   npm run contracts:check
   ```
   Assert: exit code 0, snapshot hash consistent

6. Review ALL changed files (from git diff against the base branch) for:
   - ❌ `as any` or `@ts-ignore` or `@ts-expect-error` — reject
   - ❌ Empty `catch {}` blocks — reject
   - ❌ `console.log` in production files — reject
   - ❌ `debugger` or `alert` — reject
   - ❌ Commented-out code blocks (>3 lines) — warn
   - ❌ Unused imports — reject
   - ❌ Excessive JSDoc comments that just repeat the function name — warn (AI slop pattern)
   - ❌ Over-abstraction: single-use interfaces, unnecessary generics — warn
   - ❌ Generic names: `data`, `result`, `item`, `temp`, `info`, `thing` — reject if new
   - ❌ Hardcoded values that should be configuration or constants — warn

7. Count clean vs. issue files:

**Output**:
```
Typecheck [PASS/FAIL: N errors] | Lint [PASS/FAIL: N violations]
Tests [PASS/FAIL: N pass / N fail] | Build [PASS/FAIL]
Contracts [PASS/FAIL]
Files Reviewed: N | Clean: N | Issues: N
AI Slop: N instances | Hardcoded: N instances
VERDICT: APPROVE / REJECT
```

### F3 — Real Manual QA (`unspecified-high` + `playwright`)

**Scope**: Execute every QA scenario from every task. Test cross-task integration. Save evidence.

**Sub-Tasks**:
1. **Route Security Integration Test** (tasks 1.3-1.8):
   - Attempt unauthenticated request to protected route → assert 401
   - Attempt unauthorized request (wrong role) → assert 403
   - Attempt mutation without body → assert 400 validation error
   - Attempt mutation with valid auth + data → assert 201/200 success

2. **Role Migration Integration Test** (tasks 2.2-2.7):
   - Login as each role (gerente, residente, HES, supervisor, operador, tecnico, administrativo, cliente)
   - For each role, attempt actions per APPENDIX A matrix
   - Assert correct allow/deny behavior

3. **Frontend Route Integration Test** (tasks 3.4-3.5):
   - For each newly implemented route:
     - Navigate to route → assert page loads without errors
     - Assert loading state appears briefly (if data fetching)
     - Assert data renders when API succeeds
     - Assert error state when API fails (mock API error)
     - Assert empty state when no data
     - Assert forbidden state for unauthorized roles

4. **Business Flow Integration Test** (tasks 4.1-4.8):
   - Complete the 14-step flow end-to-end:
     - Create WorkRequest → Schedule SiteVisit → Create Proposal → Attach PO → Create WorkOrder → Plan → Execute → Add Evidence → Generate Report → Create DeliveryRecord → Sign → Create SES → Create Invoice → Register Payment
   - At each step, verify the NEXT step cannot be taken before the PREVIOUS step is complete (gate check)

5. **Edge Cases** (across all tasks):
   - Empty state: API returns empty array → verify "no items" message + create CTA
   - Invalid input: Submit form with invalid data → verify validation error messages
   - Rapid actions: Double-click submit → verify only one record created (idempotency)
   - Network failure: Disconnect during mutation → verify offline queue captures
   - Large payload: Upload 19MB file → verify accepted, 21MB file → verify rejected
   - Concurrent access: Two users modify same record → verify last-write-wins or conflict

6. **Evidence Collection**:
   - Save all scenario outputs to `.sisyphus/evidence/final-qa/`
   - Naming: `{task-id}-{scenario-name}.txt` or `.png`
   - Screenshots for UI scenarios, terminal output for API scenarios

**Output**:
```
Route Security: [N/N pass] | Role RBAC: [N/N pass]
Frontend Routes: [N/N pass] | Business Flow: [14/14 steps pass]
Edge Cases: [N tested, N pass]
Evidence: [N files saved to .sisyphus/evidence/final-qa/]
VERDICT: APPROVE / REJECT
```

### F4 — Scope Fidelity Check (`deep`)

**Scope**: Verify that every task implemented exactly what was specified and NOTHING more.

**Sub-Tasks**:
1. For EACH of the 59 tasks:
   - Read the task's "What to do" section from this plan
   - Read the actual git diff for changes attributed to that task
   - Verify: everything in "What to do" was implemented (no gaps)
   - Verify: nothing beyond "What to do" was implemented (no scope creep)
   - Check: "Must NOT do" items were respected

2. Cross-Task Contamination Detection:
   - List all files modified during this sprint
   - For each file, check which task(s) touched it
   - Flag any file touched by more than one task as "potential contamination"
   - Review multi-task files to verify changes are properly separated

3. Unaccounted Changes:
   - Run `git log --oneline --since="SPRINT_START_DATE"` 
   - For each commit message, verify it maps to a task in this plan
   - Flag any commit without a corresponding task as "unaccounted"

4. Guardrail Compliance:
   - Verify: no test files were deleted (working tests must continue passing)
   - Verify: no stack changes (no NestJS, Prisma, PostgreSQL, etc.)
   - Verify: no `middleware.ts` created or modified
   - Verify: no functionality removed without replacement

**Output**:
```
Tasks [N/N compliant] | Contamination [CLEAN / N flagged]
Unaccounted Changes [CLEAN / N flags] | Guardrails [N/N met]
Scope Creep [NONE / N instances (specify)]
VERDICT: APPROVE / REJECT
```

### Final Verification Decision

Once all 4 parallel reviews complete:

```
─────────────────────────────────────────
F1 (Plan Compliance):    APPROVE / REJECT
F2 (Code Quality):       APPROVE / REJECT  
F3 (Real QA):            APPROVE / REJECT
F4 (Scope Fidelity):     APPROVE / REJECT
─────────────────────────────────────────
OVERALL: APPROVE / REJECT
```

**If APPROVE**: Present consolidated results to user. Get explicit "okay". Then guide to `/start-work`.

**If REJECT**: User provides feedback → fix issues → re-run affected F-tasks → present again → loop until "okay".

---

---

## APPENDIX A: Complete RBAC Role Matrix (8 Roles × All Modules)

This matrix defines the canonical role-permissions for every backend module. All routes MUST use `@cermont/domain` constants that resolve to these exact role sets.

| Module | CREATE | READ | UPDATE | DELETE | Special Actions |
|--------|--------|------|--------|--------|-----------------|
| **auth** | Public (register) | Authenticated (me) | Authenticated (password) | N/A | logout(authenticated) |
| **users** | gerente, residente | gerente, residente | gerente, residente | gerente | N/A |
| **work-requests** | gerente, residente, HES, cliente | All auth | gerente, residente, HES | gerente | qualify: gerente, residente, HES |
| **site-visits** | gerente, residente, HES, supervisor | All auth | gerente, residente, HES, supervisor | gerente | complete: same as update |
| **proposals** | gerente, residente, HES | All auth | gerente, residente, HES | gerente | send: gerente, residente, HES; approve: cliente; reject: cliente |
| **purchase-orders** | gerente, residente, HES, cliente | All auth | gerente, residente, HES | gerente | N/A |
| **orders** | gerente, residente, HES | All auth | gerente, residente, HES, supervisor | gerente | assign, close: gerente, residente |
| **planning** | gerente, residente, HES | gerente, residente, HES, supervisor | gerente, residente, HES | gerente | approve: gerente, residente |
| **execution** | supervisor, operador, tecnico | supervisor, operador, tecnico | supervisor, operador, tecnico | gerente | start/pause/complete: supervisor |
| **evidences** | supervisor, operador, tecnico | All auth | gerente, residente, HES | gerente | verify: gerente, residente, HES |
| **technical-reports** | supervisor, tecnico | All auth | supervisor, tecnico | gerente | submit: supervisor; approve: gerente, residente |
| **delivery-records** | gerente, residente, HES, supervisor | All auth | gerente, residente, HES, supervisor | gerente | sign: cliente |
| **client-signatures** | cliente | gerente, residente | N/A | N/A | sign: cliente (OTP verified) |
| **service-entry-sheets** | administrativo | gerente, residente, HES, administrativo | administrativo | gerente | submit: administrativo; approve: gerente |
| **invoices** | administrativo | gerente, residente, HES, administrativo, cliente | administrativo | gerente | approve: gerente; reject: gerente |
| **payments** | administrativo | gerente, residente, administrativo | administrativo | gerente | process: administrativo; confirm: gerente |
| **costs** | supervisor, operador, tecnico | gerente, residente, HES, supervisor | supervisor, operador | N/A | N/A |
| **reports** | gerente, residente, HES | All auth | gerente, residente, HES | gerente | generate-pdf: all internal |
| **assets** | gerente, residente, HES | All auth | gerente, residente, HES | gerente | N/A |
| **maintenance** | gerente, residente, HES | All auth | gerente, residente, HES | gerente | schedule: gerente, residente, HES |
| **checklists** | operador, tecnico, supervisor | All auth | operador, tecnico, supervisor | gerente | verify: gerente, residente, HES |
| **inventory** | gerente, residente, supervisor | All auth | gerente, residente, supervisor | gerente | scan: operador, tecnico |
| **fleet** | gerente, residente | All auth | gerente, residente | gerente | N/A |
| **tools** | gerente, residente | All auth | gerente, residente | gerente | N/A |
| **documents** | All internal | All auth | All internal | gerente | upload: all internal |
| **document-templates** | gerente, administrativo | All auth | gerente, administrativo | gerente | N/A |
| **kits** | gerente, residente, HES | All auth | gerente, residente, HES | gerente | N/A |
| **notifications** | N/A (system-generated) | All auth | update-read-status: all auth | N/A | markAllRead: all auth |
| **dashboard** | N/A | gerente, residente, HES, supervisor, administrativo | N/A | N/A | N/A |
| **audit** | N/A (system-generated) | gerente, residente | N/A | N/A | export: gerente |
| **portal** | cliente (own) | cliente (own) | N/A | N/A | approve-proposal: cliente |
| **ai** | N/A | All internal | N/A | N/A | chat: gerente, residente, HES, supervisor |
| **qr** | All internal | N/A | N/A | N/A | generate-bulk: all internal |

### Role Composite Constants (must be in @cermont/domain)

| Constant Name | Roles | Used By |
|---------------|-------|---------|
| `ADMIN_ROLES` | gerente | Admin-only operations |
| `MANAGEMENT_ROLES` | gerente, residente | Core management |
| `FIELD_MANAGEMENT_ROLES` | gerente, residente, HES | Field ops management |
| `SUPERVISORY_ROLES` | gerente, residente, HES, supervisor | Oversight operations |
| `TECHNICAL_EXECUTION_ROLES` | supervisor, operador, tecnico | Field execution crew |
| `FIELD_EXECUTION_ROLES` | gerente, residente, HES, supervisor, operador, tecnico | Full field team |
| `INTERNAL_ROLES` | gerente, residente, HES, supervisor, operador, tecnico, administrativo | All internal (excludes cliente) |
| `DOCUMENT_MANAGEMENT_ROLES` | gerente, administrativo | Document processing |
| `MAINTENANCE_MANAGEMENT_ROLES` | gerente, residente, HES | Maintenance planning |
| `REPORTING_ACCESS_ROLES` | gerente, residente, HES, supervisor | Report generation |
| `ALL_AUTHENTICATED` | All 8 roles (meta-constant for "any authenticated user") | Universal read access |

---

## APPENDIX B: Route Quality Baseline Detail

### Current Route Violations (pre-fix) — Baseline Reset Target: 0/0/0

#### route-missing-authentication (5 → target: 0)
| # | File | Line | Route | Fix Action | Task |
|---|------|------|-------|-----------|------|
| 1 | `automation.routes.ts` | 25 | GET / | FALSE POSITIVE — checker regex bug | 1.1 |
| 2 | `automation.routes.ts` | 26 | POST / | FALSE POSITIVE — checker regex bug | 1.1 |
| 3 | `automation.routes.ts` | 27 | GET /actions | FALSE POSITIVE — checker regex bug | 1.1 |
| 4 | `automation.routes.ts` | 32 | PATCH /actions/:id/resolve | FALSE POSITIVE — checker regex bug | 1.1 |
| 5 | `automation.routes.ts` | 37 | PATCH /:id | FALSE POSITIVE — checker regex bug | 1.1 |

#### route-missing-authorization-policy (15 → target: 0)
| # | File | Line | Route | Fix Action | Task |
|---|------|------|-------|-----------|------|
| 1 | `ai.routes.ts` | 16 | GET /status | Add authorize(...INTERNAL_ROLES) | 1.5 |
| 2 | `auth.routes.ts` | 54 | POST /logout | Add authorizeAllAuthenticated() | 1.5 |
| 3 | `auth.routes.ts` | 60 | GET /me | Add authorizeAllAuthenticated() | 1.5 |
| 4 | `auth.routes.ts` | 66 | PATCH /change-password | Add authorizeAllAuthenticated() | 1.5 |
| 5 | `automation.routes.ts` | 25 | GET / | FALSE POSITIVE — checker regex bug | 1.1 |
| 6 | `automation.routes.ts` | 26 | POST / | FALSE POSITIVE — checker regex bug | 1.1 |
| 7 | `automation.routes.ts` | 27 | GET /actions | FALSE POSITIVE — checker regex bug | 1.1 |
| 8 | `automation.routes.ts` | 32 | PATCH /actions/:id/resolve | FALSE POSITIVE — checker regex bug | 1.1 |
| 9 | `automation.routes.ts` | 37 | PATCH /:id | FALSE POSITIVE — checker regex bug | 1.1 |
| 10 | `privacy-requests.routes.ts` | 7 | GET / | Add authorize(...ADMIN_ROLES) | 1.5 |
| 11 | `privacy-requests.routes.ts` | 8 | GET /:id | Add authorize(...ADMIN_ROLES) | 1.5 |
| 12 | `privacy-requests.routes.ts` | 9 | POST / | Add authorize(...ADMIN_ROLES) | 1.5 |
| 13 | `resource.routes.ts` | 111 | GET /:resourceId/documents | Add authenticate + authorize(...INTERNAL_ROLES) | 1.7 |
| 14 | `work-requests.routes.ts` | 60 | POST / | Add authorize(...INTERNAL_ROLES) | 1.6 |
| 15 | `work-requests.routes.ts` | 73 | PATCH /:id | Add authorize(...FIELD_MANAGEMENT_ROLES) | 1.6 |

#### route-missing-validation (17 → target: 0)
| # | File | Line | Route | Fix Action | Task |
|---|------|------|-------|-----------|------|
| 1 | `analytics.routes.ts` | 38 | POST /notifications/mark-all-read | Add inline comment marker | 1.8 |
| 2 | `analytics.routes.ts` | 53 | POST /mark-all-read | Add inline comment marker | 1.8 |
| 3 | `auth.routes.ts` | 54 | POST /logout | Add "No body validation needed" comment | 1.5 |
| 4 | `document-import.routes.ts` | 13 | POST /imports | Add inline comment marker | 1.4 |
| 5 | `document-import.routes.ts` | 23 | POST /imports/:id/analyze | Add inline comment marker | 1.4 |
| 6 | `document-template.routes.ts` | 13 | POST / | Add inline comment marker | 1.4 |
| 7 | `erp-connector.routes.ts` | 72 | POST /:provider/sync | Add validateBody(syncSchema) | 1.3 |
| 8 | `form-submission.routes.ts` | 13 | POST / | Add validateBody(CreateFormSubmissionSchema) | 1.3 |
| 9 | `form-submission.routes.ts` | 46 | PATCH /:id/archive | Add validateBody or inline marker | 1.3 |
| 10 | `jobs.routes.ts` | 13 | POST /run | Add validateBody(RunJobsSchema) | 1.3 |
| 11 | `maintenance.routes.ts` | 95 | POST /kits/:kitId/documents | Add inline comment marker | 1.4 |
| 12 | `notifications.routes.ts` | 38 | POST /mark-all-read | Add inline comment marker | 1.8 |
| 13 | `privacy-requests.routes.ts` | 9 | POST / | Add validateBody(CreatePrivacyRequestSchema) | 1.3 |
| 14 | `qr.routes.ts` | 11 | POST /generate | Add validateBody(GenerateQrCodeSchema) | 1.3 |
| 15 | `qr.routes.ts` | 12 | POST /generate-bulk | Add validateBody(GenerateBulkQrCodesSchema) | 1.3 |
| 16 | `resource.routes.ts` | 109 | POST /:resourceId/documents | Add inline comment marker | 1.4 |
| 17 | `template-response.routes.ts` | 19 | POST / | Add validateBody or inline marker | 1.8 |

---

## APPENDIX C: API Endpoint Completeness Matrix

### Auth & Users
| Endpoint | Status | RBAC | Task if Not Implemented |
|----------|--------|------|------------------------|
| POST /api/auth/login | ✅ IMPLEMENTED | Public | N/A |
| POST /api/auth/register | ✅ IMPLEMENTED | Public | N/A |
| POST /api/auth/refresh | ✅ IMPLEMENTED | Public (cookie) | N/A |
| POST /api/auth/logout | ✅ IMPLEMENTED | Authenticated | N/A |
| GET /api/auth/me | ✅ IMPLEMENTED | Authenticated | N/A |
| POST /api/auth/forgot-password | ✅ IMPLEMENTED | Public | N/A |
| POST /api/auth/reset-password | ✅ IMPLEMENTED | Public | N/A |
| POST /api/auth/passkeys/* | ✅ IMPLEMENTED | Mixed | N/A |
| GET/POST/PUT/DELETE /api/users/* | ✅ IMPLEMENTED | gerente, residente | N/A |

### Work Requests (Step 1)
| Endpoint | Status | RBAC | Task if Not Implemented |
|----------|--------|------|------------------------|
| GET /api/work-requests | ✅ IMPLEMENTED | All auth | N/A |
| GET /api/work-requests/:id | ✅ IMPLEMENTED | All auth | N/A |
| POST /api/work-requests | ✅ IMPLEMENTED | gerente, residente, HES, cliente | N/A (needs authz fix) |
| PATCH /api/work-requests/:id | ✅ IMPLEMENTED | gerente, residente, HES | N/A (needs authz fix) |
| POST /api/work-requests/:id/visits | ✅ IMPLEMENTED | gerente, residente, HES, supervisor | N/A |
| GET /api/work-requests/:id/visits | ✅ IMPLEMENTED | All auth | N/A |
| PATCH /api/work-requests/:id/status | ✅ IMPLEMENTED | gerente, residente, HES | N/A |

### Proposals (Steps 2-3)
| Endpoint | Status | RBAC | Task if Not Implemented |
|----------|--------|------|------------------------|
| GET /api/proposals | ✅ IMPLEMENTED | All auth | N/A |
| GET /api/proposals/:id | ✅ IMPLEMENTED | All auth | N/A |
| POST /api/proposals | ✅ IMPLEMENTED | gerente, residente, HES | N/A |
| PUT /api/proposals/:id | ✅ IMPLEMENTED | gerente, residente, HES | N/A |
| POST /api/proposals/:id/send | ✅ IMPLEMENTED | gerente, residente, HES | N/A |
| POST /api/proposals/:id/approve | ✅ IMPLEMENTED | cliente | N/A |
| POST /api/proposals/:id/reject | ✅ IMPLEMENTED | cliente | N/A |
| GET /api/proposals/:id/po | ✅ IMPLEMENTED | All auth | N/A |
| POST /api/proposals/:id/po | ✅ IMPLEMENTED | gerente, residente, HES | N/A |
| GET /api/proposals/:id/costs | ❌ REQUIRED | gerente, residente, HES | 3.4 |

### Work Orders (Steps 4-5)
| Endpoint | Status | RBAC | Task if Not Implemented |
|----------|--------|------|------------------------|
| GET /api/orders | ✅ IMPLEMENTED | All auth | N/A |
| GET /api/orders/:id | ✅ IMPLEMENTED | All auth | N/A |
| POST /api/orders | ✅ IMPLEMENTED | gerente, residente, HES | N/A |
| PUT /api/orders/:id | ✅ IMPLEMENTED | gerente, residente, HES | N/A |
| PATCH /api/orders/:id/status | ✅ IMPLEMENTED | gerente, residente | N/A |
| GET /api/orders/:id/planning | ✅ IMPLEMENTED | gerente, residente, HES, supervisor | N/A |
| POST /api/orders/:id/planning | ✅ IMPLEMENTED | gerente, residente, HES | N/A |
| GET /api/orders/:id/execution | ✅ IMPLEMENTED | supervisor, operador, tecnico | N/A |
| GET /api/orders/:id/costs | ✅ IMPLEMENTED | gerente, residente, HES, supervisor | N/A |
| GET /api/orders/:id/asts | ✅ IMPLEMENTED | All auth | N/A |
| GET /api/orders/:id/invoice | ✅ IMPLEMENTED | All auth | N/A |
| GET /api/orders/:id/evidences | ✅ IMPLEMENTED | All auth | N/A |

### Cost Engine
| Endpoint | Status | RBAC | Task if Not Implemented |
|----------|--------|------|------------------------|
| GET /api/orders/:id/costs | ✅ IMPLEMENTED | gerente, residente, HES, supervisor | N/A |
| POST /api/costs/entries | ❌ REQUIRED | supervisor, operador | 4.2 |
| GET /api/costs/:orderId/deviations | ❌ REQUIRED | gerente, residente, HES | 4.2, 5.3 |
| GET /api/costs/catalog | ✅ IMPLEMENTED | All auth | N/A |
| GET /api/proposals/:id/costs | ❌ REQUIRED | gerente, residente, HES | 3.4 |

### Offline Sync
| Endpoint | Status | RBAC | Task if Not Implemented |
|----------|--------|------|------------------------|
| POST /api/offline-sync | ❌ REQUIRED | All auth | 4.3 |
| GET /api/offline-sync/status | ❌ OPTIONAL | gerente | 4.3 |
| POST /api/offline-sync/resolve | ❌ OPTIONAL | Authenticated | 4.3 |

### Administrative Closure (Steps 8-14)
| Endpoint | Status | RBAC | Task if Not Implemented |
|----------|--------|------|------------------------|
| GET/POST/PUT /api/reports | ✅ IMPLEMENTED | Various | N/A |
| GET/POST /api/delivery-records | ✅ IMPLEMENTED | Various | N/A |
| POST /api/delivery-records/:id/sign | ✅ IMPLEMENTED | cliente | N/A |
| GET/POST /api/ses | ✅ IMPLEMENTED | Various | N/A |
| POST /api/ses/:id/approve | ❌ REQUIRED | gerente | 4.4 |
| POST /api/ses/:id/reject | ❌ REQUIRED | gerente | 4.4 |
| GET/POST /api/invoices | ✅ IMPLEMENTED | Various | N/A |
| POST /api/invoices/:id/approve | ❌ REQUIRED | gerente | 4.4 |
| POST /api/invoices/:id/reject | ❌ REQUIRED | gerente | 4.4 |
| GET/POST /api/payments | ✅ IMPLEMENTED | Various | N/A |
| POST /api/payments/:id/confirm | ❌ REQUIRED | gerente | 4.4 |

### Document Pipeline
| Endpoint | Status | RBAC | Task if Not Implemented |
|----------|--------|------|------------------------|
| POST/GET /api/documents/imports | ✅ IMPLEMENTED | All internal | N/A |
| POST /api/documents/imports/:id/analyze | ✅ IMPLEMENTED | gerente, administrativo | N/A |
| GET /api/documents/templates | ✅ IMPLEMENTED | All auth | N/A |
| POST /api/documents/templates | ✅ IMPLEMENTED | gerente, administrativo | N/A |
| POST/GET/PATCH /api/template-responses | ✅ IMPLEMENTED | Various | N/A |
| POST /api/template-responses/:id/submit | ✅ IMPLEMENTED | Various | N/A |
| GET/POST /api/documents | ✅ IMPLEMENTED | Various | N/A |

---

## APPENDIX D: Frontend Route Completeness Matrix

| # | Route | Status | Missing States | Task |
|---|-------|--------|----------------|------|
| 1 | `/` | ✅ IMPLEMENTED | — | N/A |
| 2 | `/login` | ✅ IMPLEMENTED | — | N/A |
| 3 | `/register` | ✅ IMPLEMENTED | — | N/A |
| 4 | `/forgot-password` | ✅ OPTIONAL | — | N/A |
| 5 | `/reset-password` | ✅ OPTIONAL | — | N/A |
| 6 | `/dashboard` | ✅ IMPLEMENTED | Offline | 4.7 |
| 7 | `/work-requests` | ✅ IMPLEMENTED | Offline | 4.7 |
| 8 | `/work-requests/new` | ✅ IMPLEMENTED | Offline | 4.7 |
| 9 | `/work-requests/[id]` | ✅ IMPLEMENTED | Offline | 4.7 |
| 9A-9C | `/site-visits/*` | ✅ IMPLEMENTED | — | N/A |
| 10 | `/proposals` | ✅ IMPLEMENTED | Offline | 4.7 |
| 11 | `/proposals/new` | ✅ IMPLEMENTED | Offline | 4.7 |
| 12 | `/proposals/[id]` | ✅ IMPLEMENTED | — | N/A |
| 13 | `/proposals/[id]/costs` | ❌ NOT IMPLEMENTED | — | 3.4 |
| 14 | `/orders` | ✅ IMPLEMENTED | Offline | 4.7 |
| 15 | `/orders/new` | ✅ IMPLEMENTED | — | N/A |
| 16 | `/orders/[id]` | ✅ IMPLEMENTED | — | N/A |
| 17 | `/orders/[id]/planning` | ✅ IMPLEMENTED | Offline | 4.7 |
| 18 | `/orders/[id]/execution` | ✅ IMPLEMENTED | Offline | 4.7 |
| 19 | `/orders/[id]/evidences` | ✅ IMPLEMENTED | — | N/A |
| 20 | `/orders/[id]/costs` | ✅ IMPLEMENTED | — | N/A |
| 20A-20G | `/orders/*` subroutes | ✅ IMPLEMENTED | Various | N/A |
| 21 | `/execution` | ✅ IMPLEMENTED | Offline | 4.7 |
| 21A | `/execution/new` | ✅ IMPLEMENTED | Offline | 4.7 |
| 21B | `/execution/[id]` | ✅ IMPLEMENTED | — | N/A |
| 22 | `/evidences` | ✅ IMPLEMENTED | Offline | 4.5 |
| 22A | `/evidences/[id]` | ✅ IMPLEMENTED | — | N/A |
| 23 | `/reports` | ✅ IMPLEMENTED | — | N/A |
| 24 | `/reports/new` | ✅ IMPLEMENTED | — | N/A |
| 25 | `/reports/[id]` | ✅ IMPLEMENTED | — | N/A |
| 26 | `/reports/[id]/draft` | ❌ NOT IMPLEMENTED | — | 3.5 |
| 27 | `/reports/[id]/sign` | ❌ NOT IMPLEMENTED | — | 3.5 |
| 28 | `/reports/analytics` | ❌ NOT IMPLEMENTED | — | 3.5 |
| 28A | `/reports/archive` | ❌ NOT IMPLEMENTED | — | 3.5 |
| 29 | `/delivery-records` | ✅ IMPLEMENTED | — | N/A |
| 30 | `/delivery-records/new` | ✅ IMPLEMENTED | — | N/A |
| 31 | `/delivery-records/[id]` | ✅ IMPLEMENTED | — | N/A |
| 32 | `/delivery-records/[id]/signature` | ❌ NOT IMPLEMENTED | — | 3.5 |
| 33-35 | `/billing/*` | ✅ IMPLEMENTED | Various | 3.5 |
| 36 | `/payments` | ✅ IMPLEMENTED | — | N/A |
| 37 | `/payments/new` | ✅ IMPLEMENTED | — | N/A |
| 38 | `/payments/[id]` | ✅ IMPLEMENTED | — | N/A |
| 39 | `/service-cases` | ✅ IMPLEMENTED | — | N/A |
| 40 | `/service-cases/[id]` | ✅ IMPLEMENTED | — | N/A |
| 41 | `/service-cases/[id]/cockpit` | ❌ NOT IMPLEMENTED | — | 4.6 |
| 42-51 | `/admin/*` | ✅ IMPLEMENTED | Various | N/A |
| 52 | `/portal/*` | ✅ IMPLEMENTED | — | N/A |
| 53 | `/offline-sync` | ❌ NOT IMPLEMENTED | — | 4.3 |
| 54 | `/costs` | ✅ IMPLEMENTED | — | N/A |
| 55 | `/costs/[orderId]` | ✅ IMPLEMENTED | — | 4.2 |
| 56 | `/costs/[orderId]/ejecucion` | ✅ IMPLEMENTED | — | N/A |
| 57 | `/costs/catalog` | ✅ IMPLEMENTED | — | N/A |
| 58 | `/documents/*` | ✅ IMPLEMENTED | — | 4.1 |
| 59 | `/inventory` | ✅ IMPLEMENTED | — | N/A |
| 60 | `/inventory/scan` | ✅ IMPLEMENTED | — | N/A |
| 61 | `/fleet` | ✅ IMPLEMENTED | — | N/A |
| 62 | `/assets` | ✅ IMPLEMENTED | — | N/A |
| 63 | `/checklists` | ✅ IMPLEMENTED | — | N/A |
| 64 | `/maintenance/*` | ✅ IMPLEMENTED | — | N/A |
| 65 | `/templates` | ✅ IMPLEMENTED | — | N/A |
| 66 | `/forms/*` | ✅ IMPLEMENTED | — | 4.1 |
| 67 | `/resources/*` | ✅ IMPLEMENTED | — | N/A |
| 68 | `/dispatch` | ✅ IMPLEMENTED | — | N/A |
| 69 | `/sla` | ✅ IMPLEMENTED | — | N/A |
| 70 | `/planning` | ✅ IMPLEMENTED | — | N/A |
| 71 | `/execution-sessions/[id]` | ✅ IMPLEMENTED | — | N/A |
| 72 | `/notifications` | ✅ IMPLEMENTED | — | N/A |
| 73 | `/profile` | ✅ IMPLEMENTED | — | N/A |
| 74 | `/customers/*` | ✅ IMPLEMENTED | — | N/A |
| 75-86 | `/admin/*` variants | ✅ IMPLEMENTED | — | N/A |

**Total IMPLEMENTED: 68** | **Total NOT IMPLEMENTED: 18** | **Total: 86 routes**

---

## APPENDIX E: Error Code Catalog (Standardized Typed Errors)

All backend services MUST use these error codes. Never use raw text messages as the sole error identifier.

### Authentication & Authorization (AUTH-*)
| Code | HTTP Status | Meaning | When |
|------|-------------|---------|------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Email or password incorrect | Login attempt |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token has expired | API call with expired token |
| `AUTH_TOKEN_INVALID` | 401 | Token signature invalid | API call with tampered token |
| `AUTH_REFRESH_INVALID` | 401 | Refresh token invalid/revoked | Refresh attempt |
| `AUTH_REFRESH_REUSE` | 401 | Refresh token reuse detected (family compromised) | Reuse of rotated token |
| `AUTH_SESSION_EXPIRED` | 401 | Refresh session has expired | Refresh after 7 days |
| `AUTH_FORBIDDEN` | 403 | User lacks required role | Action beyond user's RBAC |
| `AUTH_TENANT_ACCESS_DENIED` | 403 | Cross-tenant access attempt | Client accessing another client's data |
| `AUTH_PASSWORD_WEAK` | 400 | Password doesn't meet policy | Registration/change-password |
| `AUTH_PASSWORD_MISMATCH` | 400 | Current password incorrect | Change-password |
| `AUTH_ACCOUNT_LOCKED` | 423 | Account temporarily locked | Too many failed attempts |
| `AUTH_ACCOUNT_DISABLED` | 403 | Account deactivated by admin | Login attempt on disabled account |

### Validation Errors (VAL-*)
| Code | HTTP Status | Meaning | When |
|------|-------------|---------|------|
| `VAL_REQUIRED_FIELD` | 400 | Required field missing | Schema validation failure |
| `VAL_INVALID_FORMAT` | 400 | Field format incorrect | Email, phone, ID format errors |
| `VAL_OUT_OF_RANGE` | 400 | Numeric value out of allowed range | Price, quantity out of bounds |
| `VAL_INVALID_ENUM` | 400 | Value not in allowed enum set | Invalid status transition |
| `VAL_MAX_LENGTH` | 400 | String exceeds maximum length | Text field overflow |
| `VAL_INVALID_DATE` | 400 | Date format or logic error | Past date where future required |
| `VAL_DUPLICATE_ENTRY` | 409 | Resource with same unique key exists | Duplicate PO number, email |

### Business Logic (BIZ-*)
| Code | HTTP Status | Meaning | When |
|------|-------------|---------|------|
| `BIZ_ORDER_NOT_FOUND` | 404 | Work order not found | Invalid order ID |
| `BIZ_PROPOSAL_NOT_FOUND` | 404 | Proposal not found | Invalid proposal ID |
| `BIZ_CLIENT_NOT_FOUND` | 404 | Client not found in system | Invalid client reference |
| `BIZ_WORK_REQUEST_NOT_FOUND` | 404 | Work request not found | Invalid WR ID |
| `BIZ_EVIDENCE_NOT_FOUND` | 404 | Evidence not found | Invalid evidence ID |
| `BIZ_REPORT_NOT_FOUND` | 404 | Report not found | Invalid report ID |
| `BIZ_SES_NOT_FOUND` | 404 | Service entry sheet not found | Invalid SES ID |
| `BIZ_INVOICE_NOT_FOUND` | 404 | Invoice not found | Invalid invoice ID |
| `BIZ_PAYMENT_NOT_FOUND` | 404 | Payment record not found | Invalid payment ID |
| `BIZ_PLANNING_NOT_FOUND` | 404 | Planning packet not found | Invalid planning reference |
| `BIZ_EXECUTION_NOT_FOUND` | 404 | Execution session not found | Invalid session reference |

### Gate/Workflow Errors (GATE-*)
| Code | HTTP Status | Meaning | When |
|------|-------------|---------|------|
| `GATE_STEP_NOT_ALLOWED` | 409 | Cannot advance to this step from current state | Invalid transition |
| `GATE_PRECONDITION_FAILED` | 409 | Required previous step not completed | SES before delivery signed |
| `GATE_EVIDENCE_REQUIRED` | 409 | Evidence must be uploaded before proceeding | Report without evidence |
| `GATE_APPROVAL_REQUIRED` | 409 | Required approval not yet given | Invoice before SES approved |
| `GATE_CLOSURE_LOCKED` | 423 | Case is in paid/archived/cancelled state | Mutation on closed case |
| `GATE_DOCUMENT_REQUIRED` | 409 | Required document missing | Template without source document |

### File/Upload Errors (FILE-*)
| Code | HTTP Status | Meaning | When |
|------|-------------|---------|------|
| `FILE_TOO_LARGE` | 413 | File exceeds maximum size limit | Upload >20MB |
| `FILE_INVALID_TYPE` | 415 | File MIME type not in allowed list | Non-image upload to evidence |
| `FILE_MALICIOUS` | 422 | Security scan detected threat | ClamAV positive |
| `FILE_UPLOAD_FAILED` | 500 | File save operation failed | Disk full, permissions error |
| `FILE_NOT_FOUND` | 404 | File not found in storage | Deleted or invalid reference |
| `FILE_CORRUPT` | 422 | File magic bytes don't match extension | Unreadable file |

### System Errors (SYS-*)
| Code | HTTP Status | Meaning | When |
|------|-------------|---------|------|
| `SYS_INTERNAL_ERROR` | 500 | Unexpected server error | Unhandled exception |
| `SYS_DATABASE_ERROR` | 500 | MongoDB operation failed | Connection loss, query timeout |
| `SYS_CONFIG_INVALID` | 500 | Env configuration validation failed | Missing required env var |
| `SYS_RATE_LIMITED` | 429 | Request rate limit exceeded | Too many requests |
| `SYS_OFFLINE_CONFLICT` | 409 | Conflict detected during offline sync | Version mismatch |
| `SYS_DUPLICATE_MUTATION` | 409 | Idempotency key already used | Replayed offline mutation |

---

## APPENDIX F: Contract Migration Index (Zod Schemas Needed)

### Schemas That Exist (in `packages/shared-types/src/schemas/`)
```
WorkRequest schemas (CreateWorkRequestSchema, UpdateWorkRequestStatusSchema, etc.)
Proposal schemas (CreateProposalSchema, SendProposalSchema, etc.)
Order schemas (CreateOrderSchema, UpdateOrderStatusSchema, etc.)
Planning schemas (CreatePlanningPacketSchema, etc.)
Execution schemas (CreateExecutionSessionSchema, etc.)
Evidence schemas (UploadEvidenceSchema, VerifyEvidenceSchema, etc.)
Report schemas (CreateReportSchema, SubmitReportSchema, etc.)
Delivery record schemas (CreateDeliveryRecordSchema, SignDeliveryRecordSchema, etc.)
Service entry sheet schemas (CreateServiceEntrySheetSchema, ApproveServiceEntrySheetSchema, etc.)
Invoice schemas (CreateInvoiceSchema, ApproveInvoiceSchema, etc.)
Payment schemas (RegisterPaymentSchema, ConfirmPaymentSchema, etc.)
Auth schemas (LoginSchema, RegisterSchema, ChangePasswordSchema, etc.)
User schemas (CreateUserSchema, UpdateUserSchema, etc.)
Asset schemas (CreateAssetSchema, etc.)
Maintenance schemas (CreateMaintenanceKitSchema, etc.)
Notification schemas (NotificationIdSchema, etc.)
Site visit schemas (ScheduleVisitSchema, etc.)
Resource schemas (CreateResourceSchema, etc.)
Fleet schemas, Tool schemas, Inventory schemas, Document schemas
```

### Schemas That Need Creation (by Task)
| Schema | Used By | Task |
|--------|---------|------|
| `CreatePrivacyRequestSchema` | privacy-requests POST | 1.3 |
| `CreateFormSubmissionSchema` | form-submissions POST | 1.3 |
| `ArchiveFormSubmissionSchema` | form-submissions PATCH | 1.3 |
| `RunJobsSchema` | jobs POST | 1.3 |
| `GenerateQrCodeSchema` | qr POST /generate | 1.3 |
| `GenerateBulkQrCodesSchema` | qr POST /generate-bulk | 1.3 |
| `SyncErpConnectorSchema` | erp-connector POST /:provider/sync | 1.3 |
| `MarkAllNotificationsReadSchema` | notifications POST /mark-all-read | 1.8 |
| `CreateTemplateResponseSchema` | template-response POST | 1.8 |
| `CostEntrySchema` | costs POST /entries | 4.2 |
| `CostDeviationQuerySchema` | costs GET /deviations | 5.3 |
| `ApproveServiceEntrySheetSchema` | SES approve endpoint | 4.4 |
| `RejectServiceEntrySheetSchema` | SES reject endpoint | 4.4 |
| `ApproveInvoiceSchema` | Invoice approve endpoint | 4.4 |
| `RejectInvoiceSchema` | Invoice reject endpoint | 4.4 |
| `ConfirmPaymentSchema` | Payment confirm endpoint | 4.4 |
| `ConflictResolutionSchema` | Offline sync | 4.3 |
| `OfflineSyncBatchSchema` | Offline sync queue | 4.3 |
| `DocumentOCRResultSchema` | Document import analysis | 5.1 |

---

## APPENDIX G: Performance Budget Specification

### Bundle Size Budgets (enforced at build time)

| Resource | Budget | Measurement | Enforcement |
|----------|--------|-------------|-------------|
| Main JS bundle (initial) | ≤250 KB gzipped | next build output | CI gate |
| Main CSS bundle (initial) | ≤50 KB gzipped | next build output | CI gate |
| Fonts (self-hosted) | ≤100 KB total woff2 | File size check | CI gate |
| Images (page-specific) | ≤200 KB each | Image optimization | Build-time |
| Lazy-loaded chunk (max) | ≤150 KB gzipped | next build output | Warn in dev, block in CI |
| Total JS (all routes) | ≤2 MB gzipped | Bundle analysis | CI gate |

### Runtime Performance Budgets (enforced by Lighthouse CI)

| Metric | Budget | Threshold |
|--------|--------|-----------|
| First Contentful Paint (FCP) | ≤1.5s | 90th percentile |
| Largest Contentful Paint (LCP) | ≤2.5s | 90th percentile |
| Total Blocking Time (TBT) | ≤200ms | 90th percentile |
| Cumulative Layout Shift (CLS) | ≤0.1 | 90th percentile |
| Speed Index | ≤3.5s | 90th percentile |
| Time to Interactive (TTI) | ≤3.5s | 90th percentile |

### API Response Time Budgets (enforced by k6/Playwright)

| Endpoint Category | P95 Budget | P99 Budget |
|-------------------|------------|------------|
| Simple GET (list, detail) | ≤500ms | ≤1s |
| Mutation POST/PATCH | ≤1s | ≤2s |
| File upload (10MB) | ≤5s | ≤10s |
| Dashboard aggregation | ≤2s | ≤4s |
| Report generation (PDF) | ≤5s | ≤10s |

### Architectural Performance Rules

1. **Lazy-load all non-critical modules**: Charts (Recharts), Calendar (FullCalendar), Document viewers, Admin pages
2. **No barrel imports** in performance-critical paths — `docs/REGLAS_DESARROLLO_CERMONT.md` §13
3. **No render of large lists** without virtualization (use windowing for >100 items)
4. **No global providers** that re-render all children on state change
5. **No server state in Zustand** — server state belongs to TanStack Query
6. **Image optimization**: Next.js Image component with `width`, `height`, `sizes` on all `<img>` elements
7. **Font optimization**: Self-host woff2, subset Latin, use `font-display: swap`

---

## APPENDIX H: Security Hardening Checklist

### Pre-Deployment Security Verification
- [ ] All API routes have `authenticate` middleware (except explicit public routes)
- [ ] All authenticated mutation routes have `authorize(...)` middleware
- [ ] All POST/PATCH/PUT routes have `validateBody(...)` middleware
- [ ] No `authorize("hardcoded")` strings — all use `@cermont/domain` constants
- [ ] JWT access tokens expire in 15 minutes (configurable)
- [ ] Refresh tokens expire in 7 days, rotate on refresh
- [ ] Refresh token reuse detection triggers family compromise
- [ ] Password changes revoke all active refresh sessions
- [ ] Rate limiting: auth 5/min, upload 10/min, general 100/15min
- [ ] Helmet headers: CSP, HSTS, X-Frame-Options, nosniff
- [ ] CORS restricted to single frontend origin in production
- [ ] Uploads: UUID storage names, MIME verification, magic bytes check, 20MB limit
- [ ] No `console.log`, `debugger`, or `alert` in production code
- [ ] No secrets committed to repository
- [ ] MongoDB connection uses `127.0.0.1` with `family: 4` (no localhost)
- [ ] Cookie security: HttpOnly, Secure, SameSite=Strict for refresh tokens
- [ ] Access tokens in memory only (not cookies, not localStorage)
- [ ] CSP headers block inline scripts (use nonces)
- [ ] NoSQL injection prevention: `express-mongo-sanitize` active
- [ ] All user inputs validated by Zod before reaching controllers
- [ ] Audit events for all critical mutations (all 14 workflow steps)

### Penetration Testing Checklist (for external audit)
- [ ] OWASP ZAP baseline scan: no High findings
- [ ] OWASP ZAP API scan: no High findings
- [ ] Authentication bypass testing: all routes protected
- [ ] IDOR testing: cross-tenant data access blocked
- [ ] Rate limiting bypass testing: limits effective
- [ ] File upload vulnerability testing: no arbitrary code execution
- [ ] JWT tampering testing: invalid signatures rejected
- [ ] CSRF testing: state-changing operations require auth
- [ ] XSS testing: all user content properly escaped/sanitized
- [ ] Dependency vulnerability scan: `npm audit` clean (or risk accepted)

---

---

## APPENDIX P: Task Count and Effort Summary

### Total Counts
| Metric | Wave 1 | Wave 2 | Wave 3 | Wave 4 | Wave 5 | Final | Total |
|--------|--------|--------|--------|--------|--------|-------|-------|
| Tasks | 8 | 8 | 8 | 8 | 8 | 4 | 44 |
| Route files modified | 14 | 22 | 0 | 0 | 0 | 0 | 36 |
| Role constants added | 0 | 3-5 | 0 | 0 | 0 | 0 | 3-5 |
| Frontend pages built | 0 | 0 | 18 | 6 | 0 | 0 | 24 |
| Zod schemas created | 0 | 0 | 0 | 8-12 | 3-5 | 0 | 11-17 |
| Backend services created | 0 | 0 | 0 | 4-6 | 2-3 | 0 | 6-9 |
| Frontend components created | 0 | 0 | 18 | 10-15 | 3-5 | 0 | 31-38 |
| Tests created | 0 | 0 | 0 | ~40 | ~10 | ~20 | ~70 |
| QA scenarios executed | 24 | 8 | 16 | 24 | 24 | ~50 | ~146 |
| CI/CD files created | 0 | 0 | 2 | 0 | 2 | 0 | 4 |
| Documentation files updated | 0 | 1 | 3 | 0 | 3 | 0 | 7 |

### Effort by Task Category
| Category | Tasks | Est. Hours | Complexity |
|----------|-------|-----------|------------|
| `quick` (regex fix, baseline update, comment markers) | 15 | 1-3 hrs each | Low |
| `unspecified-high` (route fixes, checker, hooks, security) | 12 | 3-6 hrs each | Medium |
| `deep` (document pipeline, cost engine, offline module, state machine, OCR, SSE) | 6 | 8-16 hrs each | High |
| `visual-engineering` (frontend pages, evidence gallery, cockpit, states, PWA) | 6 | 4-8 hrs each | Medium-High |
| `writing` (docs update, route map, API matrix) | 3 | 2-4 hrs each | Low |
| `impeccable` (react-doctor, a11y audit) | 2 | 4-8 hrs each | Medium |
| `oracle` / `unspecified-high` (verification) | 4 | 4-8 hrs each | Medium |
| **Total** | **44** | **~250-400 hrs** | **Large (4-6 sprints)** |

---

## Commit Strategy

All commits follow Conventional Commits format: `type(scope): description`

- **Wave 1 commits**: `fix(routes): ...` (individual route fixes), `fix(tooling): ...` (checker fix)
- **Wave 2 commits**: `refactor(rbac): ...` (per-module role migrations)
- **Wave 3 commits**: `feat(enforcement): ...` (gates), `feat(routes): ...` (new routes)
- **Wave 4 commits**: `feat(business): ...` (per feature), `test(e2e): ...` (Playwright tests)
- **Wave 5 commits**: `feat(innovation): ...` (per capability), `ci(security): ...` (OWASP)

---

---

## APPENDIX I: Complete Dependency Matrix (ALL 59 Tasks)

This matrix shows every task's dependencies and what it blocks. Tasks in the same wave with no dependency line can run in parallel.

### Wave 1 — Route Hardening (8 tasks)
```
1.1 (checker fix)     ─→ blocks: 1.2 (baseline reset)
1.2 (baseline reset)  ─→ blocks: ALL subsequent Wave 1 tasks (1.3-1.8)
1.3 (validation: erp, forms, jobs, qr)  ─→ blocks: none, blocked by: 1.2
1.4 (validation: file-upload routes)    ─→ blocks: none, blocked by: 1.2
1.5 (authorization: privacy, auth, ai)  ─→ blocks: none, blocked by: 1.2
1.6 (authorization: work-requests)      ─→ blocks: none, blocked by: 1.2
1.7 (authentication: resource/docs)     ─→ blocks: none, blocked by: 1.2
1.8 (validation: analytics, notify, template)  ─→ blocks: none, blocked by: 1.2
```

### Wave 2 — Role Migration (8 tasks)
```
2.1 (domain constants audit)      ─→ blocks: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
2.2 (erp-connector migration)     ─→ blocks: 2.8, blocked by: 2.1
2.3 (inspection migration)        ─→ blocks: 2.8, blocked by: 2.1
2.4 (business-document migration) ─→ blocks: 2.8, blocked by: 2.1
2.5 (checklist, evidence, etc.)   ─→ blocks: 2.8, blocked by: 2.1
2.6 (delivery-record, template, etc.)  ─→ blocks: 2.8, blocked by: 2.1
2.7 (remaining singles)           ─→ blocks: 2.8, blocked by: 2.1
2.8 (Biome/custom role checker)   ─→ blocks: 3.1, 3.2
```

### Wave 3 — Enforcement & Frontend (8 tasks)
```
3.1 (pre-commit hook)      ─→ blocks: none, blocked by: 2.8
3.2 (CI pipeline)          ─→ blocks: 5.4, 5.8, blocked by: 2.8
3.3 (auto-baseline)        ─→ blocks: none, blocked by: 1.1
3.4 (frontend: proposals, orders)  ─→ blocks: 3.8, blocked by: none
3.5 (frontend: reports, billing)   ─→ blocks: 3.8, blocked by: none
3.6 (react-doctor fixes)   ─→ blocks: 5.7, blocked by: none
3.7 (update ARCH docs)     ─→ blocks: none, blocked by: none
3.8 (update route/API maps) ─→ blocks: none, blocked by: 3.4, 3.5
```

### Wave 4 — Business Features (8 tasks)
```
4.1 (document pipeline)           ─→ blocks: 5.1, blocked by: none
4.2 (cost engine v2)             ─→ blocks: 5.3, blocked by: none
4.3 (offline module)             ─→ blocks: none, blocked by: none
4.4 (closure state machine)      ─→ blocks: 4.6, 4.8, blocked by: none
4.5 (evidence gallery)           ─→ blocks: none, blocked by: none
4.6 (service-case cockpit)       ─→ blocks: none, blocked by: 4.4
4.7 (loading/error/empty states)  ─→ blocks: none, blocked by: none
4.8 (E2E Playwright tests)       ─→ blocks: none, blocked by: 4.4
```

### Wave 5 — Innovation (8 tasks)
```
5.1 (OCR extraction)         ─→ blocks: none, blocked by: 4.1
5.2 (real-time dashboard)    ─→ blocks: none, blocked by: none
5.3 (cost deviation alerts)  ─→ blocks: none, blocked by: 4.2
5.4 (performance budgets)    ─→ blocks: none, blocked by: 3.2
5.5 (multi-tenant security)  ─→ blocks: 5.8, blocked by: none
5.6 (PWA polish)             ─→ blocks: none, blocked by: none
5.7 (a11y WCAG audit)        ─→ blocks: none, blocked by: 3.6
5.8 (OWASP ZAP scan)         ─→ blocks: none, blocked by: 3.2, 5.5
```

---

## APPENDIX J: Agent Dispatch Summary

### Wave 1 — Route Hardening

| Task | Category | Skills | Description |
|------|----------|--------|-------------|
| 1.1 | `unspecified-high` | [] | Fix regex, test compound use detection |
| 1.2 | `quick` | [] | Update baselines, verify pass |
| 1.3 | `unspecified-high` | [] | Add validation to erp, forms, jobs, qr |
| 1.4 | `quick` | [] | Add inline comment markers to file-upload routes |
| 1.5 | `unspecified-high` | [] | Add authorization policies to routes |
| 1.6 | `quick` | [] | Add authorization to work-requests |
| 1.7 | `quick` | [] | Add authentication to resource route |
| 1.8 | `quick` | [] | Add validation markers to remaining routes |

### Wave 2 — Role Migration

| Task | Category | Skills | Description |
|------|----------|--------|-------------|
| 2.1 | `deep` | [] | Audit domain, add missing role constants |
| 2.2 | `quick` | [] | Migrate erp-connector (10 instances) |
| 2.3 | `quick` | [] | Migrate inspection (3 instances) |
| 2.4 | `quick` | [] | Migrate business-document (5 instances) |
| 2.5 | `quick` | [] | Migrate checklist, evidence, order, service-cases, client |
| 2.6 | `quick` | [] | Migrate delivery-record, template-draft, custom-fields, proposal, portal |
| 2.7 | `quick` | [] | Migrate remaining (user, asset, report, admin-backup, jobs, document) |
| 2.8 | `unspecified-high` | [] | Create hardcoded-role checker script |

### Wave 3 — Enforcement & Frontend

| Task | Category | Skills | Description |
|------|----------|--------|-------------|
| 3.1 | `unspecified-high` | [] | Pre-commit hook for quality:routes |
| 3.2 | `unspecified-high` | [] | GitHub Actions CI workflow |
| 3.3 | `quick` | [] | Auto-baseline update script |
| 3.4 | `visual-engineering` | [`tailwind-css-patterns`, `vercel-react-best-practices`] | Frontend: proposals, orders routes |
| 3.5 | `visual-engineering` | [`tailwind-css-patterns`, `vercel-react-best-practices`] | Frontend: reports, billing routes |
| 3.6 | `impeccable` | [`accessibility`, `react-doctor`] | Fix react-doctor violations |
| 3.7 | `writing` | [] | Update architecture docs |
| 3.8 | `writing` | [] | Update route map + API matrix |

### Wave 4 — Business Features

| Task | Category | Skills | Description |
|------|----------|--------|-------------|
| 4.1 | `deep` | [`zod`, `nodejs-express-server`, `typescript-advanced-types`] | Full document pipeline |
| 4.2 | `deep` | [`nodejs-backend-patterns`] | Cost engine v2 with deviation alerts |
| 4.3 | `deep` | [`next-best-practices`, `vercel-react-best-practices`] | Offline module with conflict resolution |
| 4.4 | `deep` | [`nodejs-best-practices`] | Administrative closure state machine |
| 4.5 | `visual-engineering` | [`tailwind-css-patterns`] | Evidence gallery with timeline |
| 4.6 | `visual-engineering` | [`tailwind-css-patterns`] | ServiceCase cockpit unified view |
| 4.7 | `visual-engineering` | [`tailwind-css-patterns`, `accessibility`] | Loading/error/empty/offline states |
| 4.8 | `unspecified-high` | [`playwright-best-practices`] | E2E Playwright tests |

### Wave 5 — Innovation

| Task | Category | Skills | Description |
|------|----------|--------|-------------|
| 5.1 | `deep` | [`nodejs-backend-patterns`] | OCR extraction from documents |
| 5.2 | `deep` | [`nodejs-backend-patterns`, `vercel-react-best-practices`] | Real-time SSE dashboard |
| 5.3 | `deep` | [`nodejs-backend-patterns`] | Predictive cost deviation alerts |
| 5.4 | `unspecified-low` | [] | Performance budget configuration |
| 5.5 | `deep` | [] | Multi-tenant security certification |
| 5.6 | `visual-engineering` | [] | PWA install/update polish |
| 5.7 | `accessibility` | [`accessibility`] | WCAG 2.2 AA compliance audit |
| 5.8 | `unspecified-high` | [] | OWASP ZAP scan CI integration |

---

## APPENDIX K: Execution Timeline (4-6 Sprints)

### Sprint 1 (Weeks 1-2): Route Hardening & Checker Fix
**Tasks**: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
**Goal**: `npm run verify` passes. All route violations fixed. Baseline reset to 0.
**Deliverables**:
- Fixed check-routes.ts with compound middleware detection
- All 17 validation-gap routes secured
- All 15 authorization-gap routes secured  
- Resource documents route now authenticated
- `npm run verify` exits with code 0

### Sprint 2 (Weeks 3-4): RBAC SSOT Migration & Tooling
**Tasks**: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.2, 3.3
**Goal**: Zero hardcoded role strings. Pre-commit + CI gates active. Auto-baseline operational.
**Deliverables**:
- All 49 hardcoded `authorize("string")` migrated to `@cermont/domain` constants
- Hardcoded-role checker runs in quality:strict
- Pre-commit hook blocks route violations
- GitHub Actions CI runs verify on every PR
- Auto-baseline script available

### Sprint 3 (Weeks 5-6): Frontend Gap Closure & Docs Update
**Tasks**: 3.4, 3.5, 3.6, 3.7, 3.8
**Goal**: All REQUIRED_NOT_IMPLEMENTED routes built. react-doctor passing. Docs accurate.
**Deliverables**:
- 18 missing frontend routes implemented with all states
- react-doctor --verbose exits with code 0
- Architecture blueprint, route map, API matrix all reflect actual code

### Sprint 4 (Weeks 7-9): Business Feature Completion
**Tasks**: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
**Goal**: 14-step business flow fully functional end-to-end. All states covered.
**Deliverables**:
- Document import → template → form → response pipeline complete
- Cost engine with real vs budget comparison and deviation alerts
- Offline field module with conflict resolution UI
- Administrative closure state machine with gate checks
- Evidence gallery with timeline and verification
- ServiceCase cockpit showing all 14 steps
- Loading/error/empty/offline/forbidden states on all critical pages
- E2E Playwright tests for all 14 business flow steps

### Sprint 5 (Weeks 10-12): Innovation & Scaling
**Tasks**: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
**Goal**: AI-assisted document processing. Real-time updates. Security certified.
**Deliverables**:
- OCR extraction from uploaded PDF/Excel documents
- Real-time dashboard via SSE
- Predictive cost deviation alerts
- Performance budgets enforced in CI
- Multi-tenant security hardened and documented
- PWA installation and update experience polished
- WCAG 2.2 AA compliance achieved
- OWASP ZAP automated scan in CI

### Sprint 6 (Weeks 13-14): Final Verification & Hardening
**Tasks**: F1, F2, F3, F4
**Goal**: All verification agents approve. User sign-off. Production-ready.
**Deliverables**:
- Plan Compliance Audit: 100% of must-haves present, zero must-not-haves
- Code Quality Review: Build, lint, tests all green
- Real Manual QA: All scenarios pass, integration flows work
- Scope Fidelity Check: No scope creep, no contamination
- Final user approval

---

## APPENDIX L: Known Gotchas & Mitigations

### Checker Regex Fix (Task 1.1)
- **Gotcha**: The current regex captures from `router.get(` to `);`. If a route has nested parentheses (e.g., `validateBody(Schema)`), the `[\s\S]*?` lazy capture stops at the FIRST `);`. This could truncate the route block for complex routes.
- **Mitigation**: Use balanced-parentheses matching or capture the text from `router.[method](` to `)` + semicolon with proper nesting depth tracking.

### Hardcoded Role Migration (Wave 2)
- **Gotcha**: Some routes intentionally restrict to single roles (e.g., `authorize("gerente")` for admin delete). Migrating these to a composite constant like `ADMIN_ROLES` which includes other roles would widen access.
- **Mitigation**: Where `gerente` is intentionally singular, use a constant `GERENTE_ONLY = ["gerente"]` with a comment explaining why it's restricted. Never widen authorization inadvertently.

### react-doctor Violations (Task 3.6)
- **Gotcha**: react-doctor may flag pre-existing issues that are architectural (deeply nested components, large files). Fixing these could trigger significant refactoring beyond scope.
- **Mitigation**: Triage react-doctor findings into P0 (blocking), P1 (should fix), P2 (nice to have). Fix P0/P1, document P2 for future refactoring sprints. Do not refactor beyond scope.

### Offline Conflict Resolution (Task 4.3)
- **Gotcha**: Offline mutations may conflict with server-side state changes made by other users in parallel. "Last write wins" could lose data.
- **Mitigation**: Use `clientMutationId` with idempotency keys. For conflicts, present both versions to the user and let them choose. Never auto-resolve conflicts silently.

### OCR Integration (Task 5.1)
- **Gotcha**: Adding Tesseract.js (browser-side OCR) would bloat the frontend bundle. Cloud OCR APIs require internet connectivity and incur per-operation costs.
- **Mitigation**: Implement server-side OCR using `tesseract.js` or a lightweight Node.js binding. Keep it as an optional enhancement — the document pipeline should work without OCR (manual field entry fallback).

### SSE Dashboard (Task 5.2)
- **Gotcha**: SSE connections may not work through all proxy configurations. Load balancers may terminate long-lived connections.
- **Mitigation**: Implement SSE with automatic reconnection (EventSource API with reconnect logic). Fall back to polling (every 30s) if SSE fails. Use the existing notification system as a backup alert channel.

### Performance Budgeting (Task 5.4)
- **Gotcha**: Lighthouse CI thresholds may be flaky in CI environments with variable performance.
- **Mitigation**: Use Lighthouse CI with `--preset=ci` for consistent environment. Set budgets as warnings first (not errors) during initial setup, then tighten to errors once baseline established. Consider using `next-bundle-analyzer` for deterministic bundle size checks as the primary gate.

---

## Success Criteria

### Verification Commands
```bash
npm run verify              # Exit code 0
npm run quality:routes      # 0 violations in all 3 categories
npx react-doctor@latest     # Exit code 0
grep -r 'authorize("' backend/src/   # Zero matches (no hardcoded roles)
npm run test -w backend     # 680+ tests passing
npm run test -w frontend    # 260+ tests passing
npm run contracts:check     # Guard hash consistent
npm run build              # All workspaces build
```

### Final Checklist
- [ ] `quality:routes` baseline reset to 0/0/0 and stable
- [ ] Zero hardcoded `authorize("literal")` patterns in backend/src/
- [ ] Pre-commit hook blocks commits that add route violations
- [ ] CI GitHub Actions workflow runs verify on every PR
- [ ] All 18 REQUIRED_NOT_IMPLEMENTED frontend routes completed
- [ ] react-doctor --verbose passes with zero issues
- [ ] FRONTEND_ROUTE_MAP.md and API_ENDPOINT_MATRIX.md reflect actual code
- [ ] ARCHITECTURE_BLUEPRINT.md corrected from `routes/` to `modules/` structure
- [ ] 14-step business flow end-to-end Playwright tests pass
- [ ] All quality tools have auto-baseline capability

---

## Executive Summary

### What This Plan Solves

The Cermont monorepo entered a state of **architectural regression** where:

1. **`npm run verify` was broken** by 37 route quality violations, 2 of which were new (above baseline)
2. **49 hardcoded role strings** across 22 route files violated the RBAC SSOT principle from `docs/REGLAS_DESARROLLO_CERMONT.md` §3
3. **17 POST/PATCH routes lacked input validation**, creating data integrity and security vulnerabilities — violating `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` §6.3 middleware order
4. **4 routes had zero authentication** or authorization (resource documents, privacy-requests, work-requests partials) — violating Defense in Depth (`CERMONT_ARCHITECTURE_BLUEPRINT.md` §9)
5. **18 frontend routes were still REQUIRED_NOT_IMPLEMENTED**, meaning the 14-step business flow is incomplete
6. **Quality tooling had regex bugs** that masked real violations and reported false positives
7. **Documentation was inaccurate** — `ARCHITECTURE_BLUEPRINT.md` still referenced `backend/src/routes/` instead of the actual `backend/src/modules/<feature>/` structure
8. **No automated enforcement** existed — no pre-commit hooks, no CI gates, no auto-baselines

### What This Plan Delivers

| Dimension | Before | After |
|-----------|--------|-------|
| Route quality violations | 37 (2 above baseline) | **0 (baseline reset to 0/0/0)** |
| Hardcoded role strings | 49 in 22 files | **0 (migrated to @cermont/domain)** |
| Missing auth/authz routes | 20 total | **0 (all secured)** |
| Missing validation routes | 17 | **0 (all secured or properly exempted)** |
| Frontend REQUIRED routes | 18 not implemented | **0 (all 86 routes complete)** |
| 14-step E2E tests | 0 | **4 Playwright flows (14 steps)** |
| Documentation accuracy | ARCH blueprint wrong path, route maps incomplete | **Docs match code 100%** |
| Quality enforcement | None (baseline only) | **Pre-commit + CI gates + auto-baseline + role checker** |
| Security scanning | None | **OWASP ZAP in CI + WCAG 2.2 AA compliance** |
| Performance budgets | None | **Lighthouse CI + bundle size checks** |
| Real-time capabilities | None (manual refresh) | **SSE dashboard push** |
| AI-assisted document processing | None | **OCR extraction with confidence scoring** |
| Offline polish | Basic queue | **Conflict resolution UI + sync dashboard** |
| PWA experience | Basic install | **Install prompt + update flow + polished indicator** |

### The Innovation Leap

Beyond fixing what's broken, this plan positions Cermont as a **world-class professional software platform** by:

1. **AI-Enhanced Document Pipeline**: OCR transforms uploaded PDFs/Excel/Word files into structured data with field detection and confidence scoring — eliminating manual data entry

2. **Predictive Cost Intelligence**: Real-time cost deviation predictions with configurable alerts shift cost management from reactive (we're over budget) to proactive (you're projected to exceed budget in 2 weeks)

3. **Real-Time Operational Visibility**: SSE-powered dashboard push eliminates page refreshes for critical KPI monitoring

4. **Enterprise-Grade Security**: Automated OWASP ZAP scanning, WCAG 2.2 AA compliance, multi-tenant data isolation certification — building trust for enterprise clients

5. **Development Guardrails that Stick**: Pre-commit hooks, CI quality gates, auto-baseline updates, and custom role-string detection ensure that the architecture standards are enforced automatically, not just documented

6. **Offline-First Excellence**: Conflict resolution UI, visual sync status, and polished PWA installation make field operations genuinely reliable in low-connectivity environments

The result is a platform that doesn't just "work" — it actively prevents errors, catches deviations early, and continuously enforces the architectural standards that make the system maintainable and secure at scale.
