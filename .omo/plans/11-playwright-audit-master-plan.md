# CERMONT Playwright Audit + Master Implementation Plan

## TL;DR

> **Objective**: Comprehensive Playwright E2E test suite for all 92+ frontend pages, fix 4 critical bugs, mature pages with proper states (loading/error/empty/offline/RBAC), and add innovation for scalability.
>
> **Deliverables**:
> - 4 bug fixes (3 critical query/coupling fixes + 2 UX improvements)
> - 20+ new Playwright test suites covering all route groups
> - Page state maturation across 20+ priority pages
> - Performance optimization (query key centralization, stale times)
> - Accessibility improvements (form labels, ARIA, keyboard nav)
> - All gates pass: typecheck, lint, test, build, verify
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 6 waves
> **Critical Path**: Bug fixes → Playwright infrastructure → Dashboard/auth tests → Remaining page tests → Maturation

---

## Context

### Original Request
Create a comprehensive Playwright test suite for all Cermont frontend pages, fix known manual-test bugs, and mature the application beyond just corrective fixes — including innovation, scalability, and production hardening.

### Interview Summary

**Key Discussions**:
- User manually tested CRUD flow (WR → SC → Proposal) and found 4 bugs
- Playwright infrastructure exists but needs extension to cover all 92+ pages
- Plan must be ~3000 lines with exact file paths and implementation detail
- Scope includes innovation and maturation, not just bug fixes

**Research Findings**:
- **Structure**: frontend/src/app/ with 4 route groups: (dashboard) ~70 pages, (auth) ~4, (portal) ~6, (legal) ~3, plus special pages ~8
- **Existing tests**: 40+ spec files in frontend/tests/e2e/ covering core flows
- **Playwright config**: 2 projects (chromium + mobile), 90s timeout, auto-start backend + frontend
- **Bug 1 root cause**: Query key mismatch PROPOSALS_KEYS.detail vs raw `["proposal", id]`
- **Bug 2 root cause**: Proposal never updates ServiceCase.artifacts.proposal after creation
- **Bug 3 root cause**: Validation error not cleared on temporary site selection
- **Bug 4 root cause**: ServiceSiteSelect lacks empty state when no sites exist

### Metis Review
(Not available due to balance limits — self-gap-analysis applied below)

**Self-Identified Gaps**:
- Need to clarify if existing tests should be refactored or extended
- Innovation scope needs concrete definition (metrics-based)
- Error pages (404, 500) counted in 92 pages
- Need to confirm which pages get full maturation vs smoke-only

---

## Work Objectives

### Core Objective
Transform Cermont into a fully-tested, mature production application with comprehensive E2E coverage, proper state handling, and scalable architecture.

### Concrete Deliverables
- 4 bug fixes applied to frontend + backend source code
- Playwright test suite with page objects for all 4 route groups
- Page state maturation (loading/error/empty/offline/forbidden) for 25 priority pages
- Centralized query key system replacing ad-hoc keys
- RBAC validation tests covering all 8 roles
- Accessibility audit results with fixes for top issues

### Must Have
- Bug 1 fixed: query key alignment in proposals detail page
- Bug 2 fixed: proposal → service case artifact linking
- Bug 3 fixed: site validation error clearing
- Bug 4 fixed: empty state for site selection
- Every page has at least 1 Playwright test (200 status, renders)
- All quality gates pass after changes

### Must NOT Have (Guardrails)
- No changes to package.json or package-lock.json without explicit approval
- No adding new npm dependencies
- No modifying backend models/schemas without explicit approval
- No removing existing tests — only extend or improve
- No altering Playwright base config (chromium + mobile)
- No breaking existing functionality — all existing tests must pass

---

## Verification Strategy

> ZERO HUMAN INTERVENTION — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES — Playwright 1.58.2 + Vitest 4.x
- **Automated tests**: TESTS-AFTER (tests added after implementation)
- **Existing E2E suites**: 40+ spec files — all must PASS before/after changes

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{slug}.{ext}`.

- **Playwright tests**: Run via `npm run test:e2e -w frontend` with HTML report
- **Unit tests**: Run via `npm run test -w frontend`
- **TypeScript**: `npm run typecheck -w frontend`
- **Lint**: `npm run lint -w frontend`
- **Build**: `npm run build -w frontend`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Bug Fixes — 4 tasks, dependencies known):
├── Task 1: Fix query key mismatch in ProposalDetailPage
├── Task 2: Link Proposal to ServiceCase artifacts on creation
├── Task 3: Clear site validation error on temporary site select
├── Task 4: Add empty state to ServiceSiteSelect

Wave 2 (Playwright Infrastructure — 4 tasks):
├── Task 5: Create test utilities + page object base
├── Task 6: Create auth test helper (login as role)
├── Task 7: Dashboard + auth route tests
├── Task 8: Create shared test data (seed) helpers

Wave 3 (Page Tests — 8 tasks, parallel):
├── Task 9: Proposals module tests
├── Task 10: Service Cases + Work Requests tests
├── Task 11: Orders module tests
├── Task 12: Costs + Planning + Execution tests
├── Task 13: Evidences + Reports + Documents tests
├── Task 14: Billing (SES/Invoices) + Payments tests
├── Task 15: Customers + Resources + Fleet + Tools tests
├── Task 16: Portal client route tests

Wave 4 (Page Maturation — 6 tasks):
├── Task 17: Add missing loading/error states to priority pages
├── Task 18: Add empty state handling to list pages
├── Task 19: Add OfflineBanner + RBAC forbidden states
├── Task 20: Fix a11y issues (form labels, ARIA, keyboard)
├── Task 21: Centralize query keys (PROPOSALS_KEYS pattern)
├── Task 22: Optimize stale times + cache invalidation

Wave 5 (Innovation + Scalability — 4 tasks):
├── Task 23: Create PageMaturity audit report generator
├── Task 24: Add performance budgets + lazy loading
├── Task 25: Add RBAC role-switching test utilities
├── Task 26: Add CI workflow optimization (test sharding)

Wave FINAL (Verification):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review
├── Task F3: Full E2E test run + verification
├── Task F4: Scope fidelity check
```

---

## TODOs

- [ ] 1. **Fix ProposalDetailPage query key mismatch**

  **What to do**:
  - Edit `frontend/src/app/(dashboard)/proposals/[id]/page.tsx`
  - Change line 120 from `queryKey: ["proposal", id]` to use `PROPOSALS_KEYS.detail(id)`
  - Import `PROPOSALS_KEYS` from `@/modules/proposals/queries` (or define equivalent)
  - Ensure `useQuery` uses the same key structure that mutations invalidate: `["proposals", "detail", id]`
  - Verify: after clicking "Send" on a draft proposal, the badge and actions update to "sent" reactively

  **Must NOT do**:
  - Do NOT change query key pattern for list queries — only detail key
  - Do NOT remove existing `queryClient.invalidateQueries` from mutations — they already work once key is aligned

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: No skills needed — simple 2-line fix

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2-4)
  - **Parallel Group**: Wave 1 (Tasks 1-4)
  - **Blocks**: Task 9 (proposals test suite)
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/proposals/queries.ts:17-22` — PROPOSALS_KEYS definition (`detail: (id) => ["proposals", "detail", id]`)
  - `frontend/src/modules/proposals/queries.ts:75-93` — useUpdateProposal mutation invalidates `PROPOSALS_KEYS.detail(id)`
  - `frontend/src/app/(dashboard)/proposals/[id]/page.tsx:115-123` — Current broken queryKey `["proposal", id]`

  **Acceptance Criteria**:
  - [ ] `useQuery` queryKey matches `PROPOSALS_KEYS.detail(id)` format
  - [ ] After status change mutation, badge and actions update without manual refresh

  **QA Scenarios**:
  ```
  Scenario: Proposal detail reactive update after status change
    Tool: Bash (curl) — test via API first
    Preconditions: Test proposal exists in DB
    Steps:
      1. Get proposal detail via API: GET /api/proposals/{id}
      2. Record current status
      3. Send status update: PATCH /api/proposals/{id}/status with { status: "sent" }
      4. GET /api/proposals/{id} again — confirm status changed
    Expected Result: Second GET returns updated status
    Evidence: .sisyphus/evidence/task-1-api-status-update.txt

  Scenario: Frontend reactive update via Playwright
    Tool: Playwright
    Preconditions: Login as gerente, navigate to draft proposal detail
    Steps:
      1. Navigate to /proposals/{id} (draft proposal)
      2. Assert StatusBadge shows "BORRADOR" — use `.find('text=BORRADOR')`
      3. Click "Enviar" button — use `.click('text=Enviar')`
      4. Wait for toast: text=Propuesta enviada correctamente, timeout: 10s
      5. Assert StatusBadge now shows "ENVIADA" — use `.find('text=ENVIADA')`
      6. Assert "Enviar" button no longer visible (should now show "Aprobar"/"Rechazar")
    Expected Result: UI updates reactively after mutation
    Evidence: .sisyphus/evidence/task-1-reactive-update.png
  ```

  **Evidence to Capture**:
  - [ ] task-1-query-key-fix.diff — the actual diff showing the change
  - [ ] task-1-reactive-update.png — screenshot showing status updated
  - [ ] task-1-api-status-update.txt — API verification

  **Commit**: YES
  - Message: `fix(proposals): align query key between detail page and mutation invalidation`
  - Files: `frontend/src/app/(dashboard)/proposals/[id]/page.tsx`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 2. **Link Proposal to ServiceCase artifacts on creation**

  **What to do**:
  - Edit `backend/src/modules/proposal/proposal.service.ts`
  - After line 125 (`await proposal.save()`), add code to update ServiceCase if `serviceCaseId` is provided:
  ```typescript
  if (data.serviceCaseId) {
    await ServiceCase.findByIdAndUpdate(data.serviceCaseId, {
      $set: {
        "artifacts.proposal.id": proposal._id,
        "artifacts.proposal.code": proposal.code,
        "artifacts.proposal.status": proposal.status,
        "artifacts.proposal.updatedAt": new Date(),
      },
    });
  }
  ```
  - Import `ServiceCase` model at top of file if not already imported
  - This ensures `resolveProposalBlockers()` in `cermont-workflow-gate.service.ts` finds the proposal via `serviceCase.artifacts.proposal`

  **Must NOT do**:
  - Do NOT remove existing `serviceCaseId` field from Proposal schema — keep both the direct link and the ServiceCase artifact
  - Do NOT add try/catch — let Express 5 handle async errors

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["nodejs-backend-patterns"]`
  - `nodejs-backend-patterns`: Need to understand Express service patterns and Mongoose update patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 3, 4)
  - **Parallel Group**: Wave 1 (Tasks 1-4)
  - **Blocks**: Task 10 (service case tests)
  - **Blocked By**: None

  **References**:
  - `backend/src/modules/proposal/proposal.service.ts:104-130` — createProposal function
  - `backend/src/services/cermont-workflow-gate.service.ts:201-221` — resolveProposalBlockers (checks `serviceCase.artifacts.proposal`)
  - `backend/src/models/ServiceCase.ts` — ServiceCase model with artifacts field
  - `backend/src/modules/service-cases/service-case.service.ts` — Existing patterns for artifact updates

  **Acceptance Criteria**:
  - [ ] Proposal created with `serviceCaseId` updates ServiceCase.artifacts.proposal
  - [ ] Step 3 blocker resolves when proposal is approved
  - [ ] All existing tests pass

  **QA Scenarios**:
  ```
  Scenario: Proposal creation links to ServiceCase artifacts
    Tool: Bash (curl)
    Preconditions: ServiceCase exists with step_02_site_visit active
    Steps:
      1. POST /api/proposals with body containing serviceCaseId
      2. GET /api/service-cases/{serviceCaseId}
      3. Check response.data.artifacts.proposal — must have id, status="draft"
    Expected Result: ServiceCase artifacts include the new proposal
    Evidence: .sisyphus/evidence/task-2-artifact-link.txt

  Scenario: Step 3 blocker resolves after proposal creation
    Tool: Bash (curl)
    Preconditions: ServiceCase at step 3 with blocker
    Steps:
      1. GET /api/service-cases/{id}/context?step=step_03_proposal
      2. Confirm blockers array is empty or doesn't include MISSING_STEP_REQUIRED_DOCUMENT for proposal
    Expected Result: Proposal blocker no longer active
    Evidence: .sisyphus/evidence/task-2-blocker-resolved.txt
  ```

  **Evidence to Capture**:
  - [ ] task-2-artifact-link.diff — diff of proposal.service.ts
  - [ ] task-2-artifact-link.txt — API verification output

  **Commit**: YES (groups with Task 4 if same file touched)
  - Message: `fix(proposals): link created proposal to service case artifacts`
  - Files: `backend/src/modules/proposal/proposal.service.ts`
  - Pre-commit: `npm run typecheck -w backend && npm run lint -w backend && npm run test -w backend`

---

- [ ] 3. **Clear site validation error on temporary site selection**

  **What to do**:
  - Edit `frontend/src/app/(dashboard)/work-requests/new/page.tsx`
  - In the `onFieldChange` handler, when `serviceSiteSnapshot` is set (temporary site selected), also clear any validation errors for `serviceSite` field
  - The validation error comes from `getFieldErrors()` which reads from API error response
  - If validation errors are stored in state (e.g., `fieldErrors` useState), clear them when temporary site is selected
  - Check if there's a state variable like `serverErrors` or `apiErrors` and add cleanup logic on site selection
  - If errors are computed from `getRequiredFormErrors()`, the error should automatically clear when form state updates — verify that both `serviceSiteSnapshot` and `serviceSite` state are properly synced

  **Must NOT do**:
  - Do NOT make site field optional — it's required for business flow
  - Do NOT remove Zod validation — only fix UI persistence issue

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 2, 4)
  - **Parallel Group**: Wave 1 (Tasks 1-4)
  - **Blocks**: Task 10 (work request tests)
  - **Blocked By**: None

  **References**:
  - `frontend/src/app/(dashboard)/work-requests/new/page.tsx` — entire form component
  - `frontend/src/app/(dashboard)/work-requests/new/page.tsx:175-205` — getRequiredFormErrors function
  - `frontend/src/app/(dashboard)/work-requests/new/page.tsx:159-164` — getFieldErrors function
  - `frontend/src/modules/customers/ui/ServiceSiteSelect.tsx` — ServiceSiteSelect component that emits site snapshots

  **Acceptance Criteria**:
  - [ ] Selecting a temporary site clears previous validation errors
  - [ ] Form can be submitted after site selection without site-related errors
  - [ ] No regression in site validation for other scenarios

  **QA Scenarios**:
  ```
  Scenario: Temporary site selection clears validation error
    Tool: Playwright
    Preconditions: Login as gerente, navigate to /work-requests/new
    Steps:
      1. Select a customer from the combobox
      2. Click "Agregar sitio temporal" button
      3. Fill "Instalaciones principales Cenit" as site name
      4. Fill address: "Calle 100 # 50-20"
      5. Click "Guardar" or confirm
      6. Check that any previous validation error for "serviceSite" is no longer visible
      7. Fill remaining required fields
      8. Click submit
    Expected Result: Form submits successfully without site validation error
    Evidence: .sisyphus/evidence/task-3-site-validation.png
  ```

  **Evidence to Capture**:
  - [ ] task-3-site-fix.diff
  - [ ] task-3-site-validation.png

  **Commit**: YES
  - Message: `fix(work-requests): clear validation error on temporary site selection`
  - Files: `frontend/src/app/(dashboard)/work-requests/new/page.tsx`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 4. **Add empty state to ServiceSiteSelect when no sites exist**

  **What to do**:
  - Edit `frontend/src/modules/customers/ui/ServiceSiteSelect.tsx`
  - When `customerId` is provided, `useCustomerServiceSites` query returns either loading, error, or empty data
  - If the query returns successfully but with 0 sites, show a message: "No hay sedes registradas para este cliente"
  - Add a button/link: "Agregar sitio temporal" that directly opens the temporary site form
  - When no sites exist, the dropdown should show the empty state instead of an empty list
  - Also add the `showTemporaryOption` prop behavior — when `showTemporaryOption` is true and no sites exist, default to showing the temporary site form automatically

  **Must NOT do**:
  - Do NOT make site selection optional in the parent form — the empty state is informational, not a bypass
  - Do NOT change the signature of `onChange` callback

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-3)
  - **Parallel Group**: Wave 1 (Tasks 1-4)
  - **Blocks**: Task 15 (customers tests)
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/customers/ui/ServiceSiteSelect.tsx` — component source
  - `frontend/src/modules/customers/queries.ts` — useCustomerServiceSites hook
  - `frontend/src/app/(dashboard)/work-requests/new/page.tsx:224-280` — CustomerSection using ServiceSiteSelect
  - `frontend/src/core/ui/EmptyState.tsx` — existing EmptyState component for patterns

  **Acceptance Criteria**:
  - [ ] Empty state message visible when client has no registered sites
  - [ ] "Agregar sitio temporal" button opens temporary site form
  - [ ] All existing functionality unchanged

  **QA Scenarios**:
  ```
  Scenario: No sites registered shows empty state
    Tool: Playwright
    Preconditions: Login as gerente, navigate to /work-requests/new, select a customer with NO registered sites
    Steps:
      1. Select a customer known to have 0 sites
      2. Click on the site selection dropdown/field
      3. Observe the dropdown content
      4. Assert text "No hay sedes registradas" is visible
      5. Assert "Agregar sitio temporal" link/button is present
      6. Click "Agregar sitio temporal"
      7. Temporary site form should open
    Expected Result: Empty state guides user to create temporary site
    Evidence: .sisyphus/evidence/task-4-empty-state.png
  ```

  **Evidence to Capture**:
  - [ ] task-4-empty-state.diff
  - [ ] task-4-empty-state.png

  **Commit**: YES (with Task 2 if same PR)
  - Message: `fix(customers): add empty state to site selector when no sites exist`
  - Files: `frontend/src/modules/customers/ui/ServiceSiteSelect.tsx`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run test -w frontend`

---

- [ ] 5. **Create Playwright test utilities and page object base**

  **What to do**:
  - Create `frontend/tests/e2e/utils/test-utils.ts` with:
    - `navigateTo(path: string)` — wrapper that navigates and waits for network idle
    - `waitForPageLoad()` — waits for loading spinners to disappear
    - `assertPageHeading(text: string)` — checks h1 for expected text
    - `assertErrorState()` — checks for error card
    - `assertEmptyState()` — checks for empty state illustration/text
    - `assertForbiddenState()` — checks for "no permission" message
    - `assertBreadcrumb(text: string)` — checks breadcrumb navigation
    - `takePageSnapshot(name: string)` — saves screenshot evidence
  - Create `frontend/tests/e2e/utils/auth-helper.ts` with:
    - `loginAs(page, role: Role)` — logs in with predefined credentials for each role
    - `getAuthToken(page)` — extracts JWT from localStorage/zustand
    - `setAuthToken(page, token)` — injects auth token for direct API calls
  - Create `frontend/tests/e2e/pages/BasePage.ts` — base page object class:
    - `goto()` — navigate to page route
    - `waitForReady()` — wait for page to finish loading
    - `isLoaded()` — check page loaded without errors
    - `getHeading()` — get page heading text
    - `screenshot()` — take screenshot
  - Ensure all utilities use TypeScript strict mode (no `any`)
  - Export everything from an index file

  **Must NOT do**:
  - Do NOT modify Playwright config — extend, don't change
  - Do NOT add new dependencies — use existing Playwright install
  - Do NOT duplicate existing utils from `page-smoke.spec.ts`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`
  - `playwright-best-practices`: For proper page object patterns, test structure, and utilities

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (Tasks 5-8)
  - **Blocks**: Tasks 9-16 (all page test suites)
  - **Blocked By**: None

  **References**:
  - `frontend/tests/e2e/login.spec.ts` — existing auth test pattern
  - `frontend/tests/e2e/page-smoke.spec.ts` — existing smoke test pattern
  - `frontend/tests/e2e/global-setup.ts` — existing global setup
  - `frontend/playwright.config.ts` — config reference
  - Playwright docs: https://playwright.dev/docs/pom — Page object model patterns

  **Acceptance Criteria**:
  - [ ] All utility functions exported and importable
  - [ ] BasePage class provides navigation + wait + screenshot
  - [ ] auth-helper can authenticate as any of the 8 roles
  - [ ] TypeScript strict compiles (no errors)
  - [ ] test-utils functions work with existing test structure

  **QA Scenarios**:
  ```
  Scenario: Test utilities compile and import correctly
    Tool: Bash
    Preconditions: Files created
    Steps:
      1. Run: npx tsc --noEmit frontend/tests/e2e/utils/test-utils.ts --strict
      2. Run: npx tsc --noEmit frontend/tests/e2e/utils/auth-helper.ts --strict
    Expected Result: No TypeScript errors
    Evidence: .sisyphus/evidence/task-5-typescript-ok.txt

  Scenario: Auth helper can authenticate as gerente
    Tool: Playwright (separate integration test)
    Preconditions: Backend running with seeded data
    Steps:
      1. Import loginAs from auth-helper
      2. Navigate to /login
      3. loginAs(page, 'gerente')
      4. Assert redirected to /dashboard
      5. Assert user name visible in header
    Expected Result: Login succeeds, user authenticated
    Evidence: .sisyphus/evidence/task-5-auth-helper.png
  ```

  **Evidence to Capture**:
  - [ ] task-5-utils-index.diff — creation of utility files
  - [ ] task-5-typescript-ok.txt — typecheck passes
  - [ ] task-5-auth-helper.png — auth test screenshot

  **Commit**: YES
  - Message: `test(e2e): add playwright test utilities and auth helpers`
  - Files: `frontend/tests/e2e/utils/`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 6. **Create auth + dashboard test suite**

  **What to do**:
  - Create `frontend/tests/e2e/auth-flow.spec.ts` with tests:
    - "redirects unauthenticated to /login" — navigate to /dashboard → assert redirected to /login
    - "shows login form" — assert email input, password input, submit button visible
    - "login with valid credentials" — fill form, submit, assert redirected to dashboard
    - "login with invalid credentials shows error" — fill wrong password, assert error message
    - "remember me checkbox functions" — check/uncheck remember me
    - "forgot password link navigates to /forgot-password"
    - "register link navigates to /register"
    - "logout clears session" — login → click logout → assert redirected to login
    - (skip if password reset flow not implemented end-to-end)
  - Create `frontend/tests/e2e/dashboard-smoke.spec.ts` with tests:
    - "dashboard loads for gerente role" — login as gerente, assert KPI cards visible
    - "dashboard shows service case list" — assert table or list with service cases
    - "dashboard shows pending tasks section" — assert pending tasks widget
    - "dashboard shows recent activity" — assert activity feed or similar
    - "dashboard responsive layout" — resize to mobile, assert sidebar is drawer
  - Use the auth-helper from Task 5 for login flow
  - Test each loading state: skeleton/spinner visible before data loads
  - Test error state: mock API failure and assert error card

  **Must NOT do**:
  - Do NOT test password reset flow end-to-end (requires email)
  - Do NOT hardcode credentials — use seed data or env vars

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`
  - `playwright-best-practices`: For handling auth state, test isolation, and assertions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (Tasks 5-8)
  - **Blocks**: None directly — foundation for other tests
  - **Blocked By**: Task 5 (auth-helper utility)

  **References**:
  - `frontend/tests/e2e/login.spec.ts` — existing auth test
  - `frontend/tests/e2e/auth.spec.ts` — existing auth tests
  - `frontend/src/app/(auth)/login/page.tsx` — login page component
  - `frontend/src/app/(dashboard)/dashboard/page.tsx` — dashboard page

  **Acceptance Criteria**:
  - [ ] Auth flow tests: login success, login failure, logout
  - [ ] Dashboard loads with KPI cards and service case list
  - [ ] Error state handled gracefully
  - [ ] All tests pass consistently (non-flaky)

  **QA Scenarios**:
  ```
  Scenario: Run auth-flow.spec.ts and verify all tests pass
    Tool: Bash
    Preconditions: MongoDB seeded, backend + frontend running
    Steps:
      1. Run: cd frontend && npx playwright test tests/e2e/auth-flow.spec.ts
      2. Check exit code (0 = all pass)
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-6-auth-test-results.txt
  ```

  **Evidence to Capture**:
  - [ ] task-6-auth-flow.spec.ts — the test file
  - [ ] task-6-dashboard-smoke.spec.ts — the test file
  - [ ] task-6-auth-test-results.txt — test output

  **Commit**: YES
  - Message: `test(e2e): add auth flow and dashboard smoke tests`
  - Files: `frontend/tests/e2e/auth-flow.spec.ts`, `frontend/tests/e2e/dashboard-smoke.spec.ts`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 7. **Create shared test data and seed helpers**

  **What to do**:
  - Create `frontend/tests/e2e/utils/test-data.ts` with:
    - `TEST_USERS` — object mapping role strings to { email, password, name }
      - gerente, residente, HES, supervisor, operador, tecnico, administrativo, cliente
    - `TEST_PROJECT_NAME` — constant for identifying test-created data
    - `makeTestId(prefix)` — generates unique test identifiers
    - `SAMPLE_WR_DATA` — sample work request input for reuse
    - `SAMPLE_PROPOSAL_DATA` — sample proposal input
    - `SAMPLE_SITE_DATA` — sample temporary site data
  - Create `frontend/tests/e2e/utils/seed-helpers.ts` with:
    - `ensureSeedData()` — function that calls backend seed or checks if data exists
    - `cleanupTestData()` — function to remove test-created records
    - `createTestProposal(page, data)` — creates proposal via API with auth token
    - `createTestWorkRequest(page, data)` — creates WR via API
  - All data includes TypeScript strict types (interfaces, not `any`)
  - Use `@tanstack/react-query` helpers if needed, otherwise direct API calls

  **Must NOT do**:
  - Do NOT commit real user passwords — use seed-only test passwords
  - Do NOT mutate production data — test data must be idempotent

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (Tasks 5-8)
  - **Blocks**: Tasks 9-16 (depends on test data)
  - **Blocked By**: Task 5 (auth-helper for token extraction)

  **References**:
  - `frontend/tests/e2e/global-setup.ts` — existing seed/global setup pattern
  - `backend/src/scripts/seed-demo-data.ts` — backend seed script
  - `frontend/src/modules/proposals/queries.ts` — proposal creation pattern

  **Acceptance Criteria**:
  - [ ] test-data.ts exports typed constants for all 8 roles
  - [ ] seed-helpers.ts functions work with backend API
  - [ ] All TypeScript strict compiles

  **QA Scenarios**:
  ```
  Scenario: Test data constants resolve correctly
    Tool: Bash
    Preconditions: Files created
    Steps:
      1. Run: npx tsx frontend/tests/e2e/utils/test-data.ts
      2. Log TEST_USERS object to verify
    Expected Result: No errors, data well-formed
    Evidence: .sisyphus/evidence/task-7-test-data.txt
  ```

  **Evidence to Capture**:
  - [ ] task-7-test-data.diff
  - [ ] task-7-test-data.txt

  **Commit**: YES (with Task 5 or 6)
  - Message: `test(e2e): add shared test data and seed helpers`
  - Files: `frontend/tests/e2e/utils/test-data.ts`, `frontend/tests/e2e/utils/seed-helpers.ts`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 8. **Create mobile-responsive smoke test suite**

  **What to do**:
  - Create `frontend/tests/e2e/mobile-responsive.spec.ts`
  - Test critical pages at mobile viewport (375×812 — iPhone 13):
    - `/login` — form fits viewport, no horizontal scroll
    - `/dashboard` — KPIs stack vertically, sidebar is drawer
    - `/work-requests` — table scrolls horizontally or uses card layout
    - `/proposals` — list items stack vertically
    - `/orders` — order cards render without overflow
  - Use `page.setViewportSize({ width: 375, height: 812 })` for mobile viewport
  - Test touch targets are ≥44px for critical buttons
  - Test navigation (hamburger menu on mobile opens/closes)
  - Use existing mobile project config pattern from `playwright.config.ts`
  - Assert no horizontal overflow at any breakpoint

  **Must NOT do**:
  - Do NOT test every single page in mobile — focus on 5-8 critical ones
  - Do NOT add new viewport configs — use existing mobile project pattern

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (Tasks 5-8)
  - **Blocks**: None
  - **Blocked By**: Task 5 (auth-helper for login)

  **References**:
  - `frontend/playwright.config.ts:38-42` — existing mobile project config
  - `frontend/src/app/(dashboard)/dashboard/page.tsx` — KPI layout
  - `frontend/src/app/(dashboard)/proposals/page.tsx` — list layout
  - `frontend/src/app/(dashboard)/orders/page.tsx` — kanban/card layout

  **Acceptance Criteria**:
  - [ ] All critical pages at 375px have no horizontal overflow
  - [ ] Touch targets ≥44px for primary buttons
  - [ ] Navigation drawer opens/closes on mobile

  **QA Scenarios**:
  ```
  Scenario: Mobile responsive tests pass
    Tool: Bash
    Preconditions: App running
    Steps:
      1. Run: cd frontend && npx playwright test tests/e2e/mobile-responsive.spec.ts
      2. Check exit code
    Expected Result: All mobile tests pass
    Evidence: .sisyphus/evidence/task-8-mobile-results.txt
  ```

  **Evidence to Capture**:
  - [ ] task-8-mobile-responsive.spec.ts
  - [ ] task-8-mobile-results.txt
  - [ ] task-8-mobile-screenshot.png

  **Commit**: YES
  - Message: `test(e2e): add mobile responsive smoke test suite`
  - Files: `frontend/tests/e2e/mobile-responsive.spec.ts`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 9. **Create Proposals module test suite**

  **What to do**:
  - Create `frontend/tests/e2e/proposals-full.spec.ts` (extending existing `proposals.spec.ts`)
  - Tests to add:
    - "proposals list page loads" — navigate to /proposals, assert table/list renders, check heading
    - "proposals filters work by status" — filter by "ENVIADA", assert only sent proposals shown
    - "proposals empty state shows when no data" — filter by non-existent status, assert empty state
    - "proposals loading state shows skeleton" — slow network simulation
    - "proposals error state shows retry button" — block API → assert error card → retry
    - "proposal detail page loads" — click first proposal → assert code, status, client visible
    - "proposal detail shows cost breakdown" — scroll to cost breakdown section, assert values
    - "proposal create page loads from WR flow" — navigate to /proposals/new?serviceCaseId=X
    - "proposal create form validates required fields" — submit empty form, assert error messages
    - "proposal create form calculates totals" — add items with quantity + price, assert subtotal/total update
    - "draft proposal shows send/approve/reject actions" — login as gerente, verify action buttons
    - "RBAC: cliente cannot approve own proposal" — login as cliente, assert approve button hidden
  - Page Object: Create `frontend/tests/e2e/pages/ProposalsPage.ts`:
    - `goto()` → `/proposals`
    - `gotoDetail(id)` → `/proposals/{id}`
    - `getStatusBadge()` → locator for status
    - `clickAction(action)` → click Send/Approve/Reject
  - Use test utilities from Task 5-7

  **Must NOT do**:
  - Do NOT delete existing `proposals.spec.ts` — extend it or create new file
  - Do NOT test payment flows — those are separate

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`
  - `playwright-best-practices`: For proper assertions, waits, and locator strategies

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 10-16)
  - **Parallel Group**: Wave 3 (Tasks 9-16)
  - **Blocked By**: Tasks 5 (utils), 7 (test data)

  **References**:
  - `frontend/tests/e2e/proposals.spec.ts` — existing proposal tests
  - `frontend/src/app/(dashboard)/proposals/page.tsx` — list page
  - `frontend/src/app/(dashboard)/proposals/[id]/page.tsx` — detail page
  - `frontend/src/app/(dashboard)/proposals/new/page.tsx` — create page

  **Acceptance Criteria**:
  - [ ] List page tests: load, filter, empty state, loading state
  - [ ] Detail page tests: data display, actions, RBAC
  - [ ] Create form tests: validation, totals calculation
  - [ ] All tests pass consistently

  **QA Scenarios**:
  ```
  Scenario: Proposals spec runs
    Tool: Bash
    Steps:
      1. cd frontend && npx playwright test tests/e2e/proposals-full.spec.ts
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-9-test-results.txt
  ```

  **Evidence to Capture**:
  - [ ] task-9-proposals-full.spec.ts
  - [ ] task-9-test-results.txt
  - [ ] task-9-screenshot.png

  **Commit**: YES
  - Message: `test(e2e): add comprehensive proposals module test suite`
  - Files: `frontend/tests/e2e/proposals-full.spec.ts`, `frontend/tests/e2e/pages/ProposalsPage.ts`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 10. **Create Service Cases + Work Requests test suite**

  **What to do**:
  - Create `frontend/tests/e2e/service-cases-full.spec.ts`
  - Tests:
    - "service cases list loads" — /service-cases, assert table, heading
    - "service case detail loads correctly" — navigate to [id], assert code, status, steps
    - "service case cockpit shows 14-step progress" — check OperationalStepProgress renders
    - "service case shows blockers correctly" — verify blocker list when step incomplete
    - "service case advance step (if eligible)" — click "Avanzar paso", assert toast
    - "service case not found shows error" — navigate to fake ID, assert error state
    - "step context shows inherited data" — check canonical data (client name, location)
  - Create `frontend/tests/e2e/work-requests.spec.ts`
  - Tests:
    - "WR list loads" — /work-requests, assert list/table
    - "WR create form loads" — /work-requests/new, assert all fields present
    - "WR create form validates required" — submit empty, assert error messages
    - "WR create selects customer" — select CustomerCombobox, assert client info shows
    - "WR create selects temporary site" — use ServiceSiteSelect, fill site details
    - "WR create validates site" — assert bug 3/4 fixes work
    - "WR detail loads" — navigate to [id], assert data visible
    - "WR qualify advances to step 3" — click "Calificar solicitud", assert toast
  - Page Objects: `ServiceCasesPage`, `WorkRequestsPage`

  **Must NOT do**:
  - Do NOT modify existing `business-flow-14-steps.spec.ts`
  - Keep tests independent — each test should create own data or use shared seed

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 9, 11-16)
  - **Parallel Group**: Wave 3

  **Acceptance Criteria**:
  - [ ] Service case flow tests pass (list, detail, cockpit, blockers, advance)
  - [ ] Work request flow tests pass (create, validate, detail, qualify)
  - [ ] Bug 2 fix verified (proposal blocking no longer stuck)
  - [ ] Bug 3 + 4 fixes verified (site selection works)

  **Evidence to Capture**:
  - [ ] task-10-service-cases-full.spec.ts
  - [ ] task-10-wr.spec.ts
  - [ ] task-10-test-results.txt

  **Commit**: YES
  - Message: `test(e2e): add service cases and work requests test suite`
  - Files: `frontend/tests/e2e/service-cases-full.spec.ts`, `frontend/tests/e2e/work-requests.spec.ts`

---

- [ ] 11. **Create Orders module test suite**

  **What to do**:
  - Create `frontend/tests/e2e/orders-full.spec.ts`
  - Tests:
    - "orders list page loads" — /orders, assert Kanban/table view, heading
    - "orders show correct status columns" — check status columns (pending, in_progress, completed)
    - "orders kanban drag-and-drop" — if react-dnd enabled, drag card between columns
    - "order detail page loads" — /orders/[id], assert title, status, details
    - "order detail shows planning section" — check planning packet link/section
    - "order detail shows execution section" — /orders/[id]/execution renders
    - "order detail shows costs section" — /orders/[id]/costs, assert cost data
    - "order detail shows AST section" — /orders/[id]/asts if applicable
    - "order detail shows invoice section" — /orders/[id]/invoice
    - "order create page loads" — /orders/new, assert form fields
    - "order create validates" — submit empty, assert errors
    - "order edit page loads" — /orders/[id]/edit
    - "order error state" — invalid ID, assert 404/error
    - "order empty state" — filter to show no results
    - "RBAC order access" — login as cliente, assert read-only view
  - Page Objects: `OrdersPage`, `OrderDetailPage`, `OrderCreatePage`

  **Must NOT do**:
  - Do NOT test actual order status transitions via frontend (done in E2E flow)
  - Do NOT test drag-and-drop if not the primary interaction

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3

  **References**:
  - `frontend/src/app/(dashboard)/orders/page.tsx` — orders list/kanban
  - `frontend/src/app/(dashboard)/orders/[id]/page.tsx` — order detail
  - `frontend/src/app/(dashboard)/orders/new/page.tsx` — create
  - `frontend/src/app/(dashboard)/orders/[id]/edit/page.tsx` — edit

  **Acceptance Criteria**:
  - [ ] Orders list (Kanban/table) loads and renders
  - [ ] Order detail shows full information
  - [ ] Order create validates and works
  - [ ] Error/empty states handled

  **Evidence to Capture**:
  - [ ] task-11-orders-full.spec.ts
  - [ ] task-11-test-results.txt

  **Commit**: YES
  - Message: `test(e2e): add orders module comprehensive test suite`

---

- [ ] 12. **Create Costs + Planning + Execution test suite**

  **What to do**:
  - Create `frontend/tests/e2e/costs.spec.ts`
  - Tests:
    - "costs list page loads" — /costs, assert list/table
    - "costs catalog loads" — /costs/catalog, assert catalog items
    - "costs for order loads" — /costs/[orderId], assert budget vs actual
    - "costs execution view loads" — /costs/[orderId]/ejecucion
  - Create `frontend/tests/e2e/planning.spec.ts`
  - Tests:
    - "planning list loads" — /planning, assert list
    - "planning detail loads" — /planning/[id], assert data
    - "planning packet create loads" — /planning-packet/new
  - Create `frontend/tests/e2e/execution.spec.ts`
  - Tests:
    - "execution list loads" — /execution, assert list
    - "execution create loads" — /execution/new, assert form
    - "execution detail loads" — /execution/[id]
    - "execution session detail loads" — /execution-sessions/[id]

  **Must NOT do**:
  - Do NOT test full cost calculation — data validation happens in backend
  - Do NOT test execution photo capture — requires file system access

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3

  **Acceptance Criteria**:
  - [ ] Each page loads without error
  - [ ] All states (loading, error, empty) handled
  - [ ] Tests pass consistently

  **Evidence to Capture**:
  - [ ] task-12-specs — all 3 spec files
  - [ ] task-12-test-results.txt

  **Commit**: YES (group with similar modules)
  - Message: `test(e2e): add costs, planning and execution test suites`

---

- [ ] 13. **Create Evidences + Reports + Documents test suite**

  **What to do**:
  - Create `frontend/tests/e2e/evidences-full.spec.ts`
  - Tests:
    - "evidences list loads" — /evidences, assert gallery/list
    - "evidence detail loads" — /evidences/[id], assert image/document display
    - "evidence report view loads" — /evidences/report
  - Create `frontend/tests/e2e/reports.spec.ts`
  - Tests:
    - "reports list loads" — /reports, assert list
    - "report create loads" — /reports/new
    - "report detail loads" — /reports/[id]
    - "report draft view loads" — /reports/[id]/draft
    - "report sign view loads" — /reports/[id]/sign
    - "report archive loads" — /reports/archive
  - Create `frontend/tests/e2e/documents.spec.ts`
  - Tests:
    - "documents list loads" — /documents
    - "templates list loads" — /documents/templates
    - "template create loads" — /documents/templates/new
    - "template detail loads" — /templates/[id]
    - "ingestion view loads" — /documents/ingestion/[id]

  **Must NOT do**:
  - Do NOT test file upload directly — covered by `file-upload.spec.ts`
  - Do NOT test PDF generation — backend responsibility

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3

  **Acceptance Criteria**:
  - [ ] All evidence/report/document pages load
  - [ ] States covered (loading, empty, error)
  - [ ] All tests pass

  **Evidence to Capture**:
  - [ ] task-13-specs
  - [ ] task-13-test-results.txt

  **Commit**: YES
  - Message: `test(e2e): add evidences, reports and documents test suites`

---

- [ ] 14. **Create Billing (SES/Invoices) + Payments test suite**

  **What to do**:
  - Create `frontend/tests/e2e/billing.spec.ts`
  - Tests:
    - "billing main page loads" — /billing
    - "SES list loads" — /billing/ses
    - "SES detail loads" — /billing/ses/[id]
    - "SES approve view loads" — /billing/ses/[id]/approve
    - "SES create loads" — /billing/ses/new
    - "invoices list loads" — /billing/invoices
    - "invoice detail loads" — /billing/invoices/[id]
    - "invoice approve loads" — /billing/invoices/[id]/approve
  - Create `frontend/tests/e2e/payments.spec.ts` (extend existing)
  - Tests:
    - "payments list loads" — /payments
    - "payment detail loads" — /payments/[id]
    - "payment create loads" — /payments/new
  - Page Objects: `BillingPage`, `PaymentsPage`

  **Must NOT do**:
  - Do NOT test actual payment processing (external system)
  - Do NOT test invoice PDF download

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3

  **Acceptance Criteria**:
  - [ ] All billing pages load without error
  - [ ] All states covered
  - [ ] All tests pass

  **Evidence to Capture**:
  - [ ] task-14-specs
  - [ ] task-14-test-results.txt

  **Commit**: YES
  - Message: `test(e2e): add billing and payments test suites`

---

- [ ] 15. **Create Customers + Resources + Fleet + Tools test suite**

  **What to do**:
  - Create `frontend/tests/e2e/customers.spec.ts`
  - Tests:
    - "customers list loads" — /customers
    - "customer create loads" — /customers/new
    - "customer detail loads" — /customers/[id]
    - "customer error state" — fake ID
  - Create `frontend/tests/e2e/resources.spec.ts`
  - Tests:
    - "resources list loads" — /resources
    - "resource detail loads" — /resources/[id]
    - "kits list loads" — /resources/kits
    - "kits create loads" — /resources/kits/new
  - Create `frontend/tests/e2e/fleet.spec.ts`
  - Tests:
    - "fleet list loads" — /fleet
    - "fleet detail loads" — /fleet/[id]
  - Create `frontend/tests/e2e/tools.spec.ts`
  - Tests:
    - "tools list loads" — /tools
  - Create `frontend/tests/e2e/inventory.spec.ts`
  - Tests:
    - "inventory list loads" — /inventory
    - "inventory scan loads" — /inventory/scan

  **Must NOT do**:
  - Do NOT test fleet dispatch — covered by dispatch module
  - Keep tests as simple smoke tests (load + render)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3

  **Acceptance Criteria**:
  - [ ] All pages in these modules load without error
  - [ ] Test count: minimum 10 total across modules

  **Evidence to Capture**:
  - [ ] task-15-specs
  - [ ] task-15-test-results.txt

  **Commit**: YES
  - Message: `test(e2e): add customers, resources, fleet and tools test suites`

---

- [ ] 16. **Create Portal client routes + legal + special pages test suite**

  **What to do**:
  - Create `frontend/tests/e2e/portal-client.spec.ts`
  - Tests:
    - "portal login as cliente" — login with cliente role
    - "portal home page loads" — /portal
    - "portal proposals list loads" — /portal/proposals
    - "portal orders list loads" — /portal/orders
    - "portal order detail loads" — /portal/orders/[id]
    - "portal invoices list loads" — /portal/invoices
    - "portal service cases list loads" — /portal/service-cases
    - "portal service case detail loads" — /portal/service-cases/[id]
    - "portal signatures loads" — /portal/signatures/[id]
  - Create `frontend/tests/e2e/legal-pages.spec.ts`
  - Tests:
    - "terms page loads" — /terms
    - "privacy page loads" — /privacy
    - "consent page loads" — /consent
  - Create `frontend/tests/e2e/special-pages.spec.ts`
  - Tests:
    - "unauthorized page loads" — /unauthorized
    - "not-found renders for unknown routes" — navigate to /nonexistent, assert 404
    - "offline page loads" — /~offline
    - "landing page loads" — / (root), assert landing content
  - All tests are simple smoke tests: navigate → 200 status → no console errors

  **Must NOT do**:
  - Do NOT test portal registration flow (separate module)
  - Do NOT test service worker registration

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3

  **References**:
  - `frontend/src/app/(portal)/portal/page.tsx`
  - `frontend/src/app/(legal)/terms/page.tsx`
  - `frontend/src/app/(portal)/portal/layout.tsx`
  - `frontend/src/app/not-found.tsx`
  - `frontend/src/app/unauthorized/page.tsx`

  **Acceptance Criteria**:
  - [ ] Portal client routes accessible with cliente role
  - [ ] Legal pages load without auth requirement
  - [ ] Special pages render correctly
  - [ ] No console errors on any page load
  - [ ] All tests pass

  **Evidence to Capture**:
  - [ ] task-16-specs
  - [ ] task-16-console-errors.txt
  - [ ] task-16-test-results.txt

  **Commit**: YES
  - Message: `test(e2e): add portal client, legal and special pages test suites`

---

- [ ] 17. **Add missing loading/error states to priority pages**

  **What to do**:
  - Audit all 92 page.tsx files for loading and error state handling
  - Use `ast_grep_search` to find pages WITHOUT loading/error states
  - Add to priority pages (those with data fetching):
    - Loading state: `<Skeleton>` or spinner component while data loads
    - Error state: error card with message + retry button (follow `frontend/src/app/(dashboard)/service-cases/[id]/page.tsx` pattern)
  - Priority pages (must add states):
    - `/proposals/page.tsx` — list skeleton
    - `/orders/page.tsx` — loading spinner
    - `/service-cases/page.tsx` — list loading state
    - `/work-requests/page.tsx` — list skeleton
    - `/customers/page.tsx` — table skeleton
    - `/costs/page.tsx` — loading state
    - `/evidences/page.tsx` — gallery skeleton
    - `/reports/page.tsx` — list loading
    - `/documents/page.tsx` — loading state
    - `/planning/page.tsx` — loading state
    - `/billing/ses/page.tsx` — loading state
    - `/billing/invoices/page.tsx` — loading state
    - `/payments/page.tsx` — loading state
    - `/fleet/page.tsx` — loading/error
    - `/resources/page.tsx` — loading/error
  - Use existing `<Skeleton>` component from `@/core/ui/Skeleton`
  - Use existing error card pattern from `service-cases/[id]/page.tsx`

  **Must NOT do**:
  - Do NOT change page business logic — only add state wrappers
  - Do NOT wrap every component — only top-level data-fetching pages

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 18-22)
  - **Parallel Group**: Wave 4 (Tasks 17-22)
  - **Blocked By**: None (independent of test tasks)

  **References**:
  - `frontend/src/app/(dashboard)/service-cases/[id]/page.tsx:60-82` — existing loading + error pattern
  - `frontend/src/core/ui/Skeleton.tsx` — skeleton component
  - `frontend/src/app/(dashboard)/work-requests/new/loading.tsx` — loading pattern for new page

  **Acceptance Criteria**:
  - [ ] Minimum 15 priority pages have loading states
  - [ ] Error states show message + retry button
  - [ ] All TypeScript strict compiles

  **QA Scenarios**:
  ```
  Scenario: Priority pages show loading skeleton
    Tool: Playwright
    Steps:
      1. Navigate to each priority page
      2. Before data loads, check for skeleton/spinner element
      3. Wait for data to load
      4. Assert skeleton replaced by actual content
    Expected Result: Loading states visible and transition to content
    Evidence: .sisyphus/evidence/task-17-loading-states/{page}.png
  ```

  **Evidence to Capture**:
  - [ ] task-17-audit-results.txt — which pages were missing states
  - [ ] task-17-loading-states/*.png — screenshots of loading states

  **Commit**: YES (group with Task 18 if related)
  - Message: `feat(ui): add loading and error states to priority pages`

---

- [ ] 18. **Add empty state handling to list pages**

  **What to do**:
  - Audit all list pages (those with `page.tsx` showing data lists) for empty state handling
  - Major list pages to check:
    - `/proposals/page.tsx` — "No hay propuestas" when empty
    - `/service-cases/page.tsx` — "No hay casos de servicio"
    - `/work-requests/page.tsx` — "No hay solicitudes"
    - `/orders/page.tsx` — "No hay órdenes de trabajo"
    - `/costs/page.tsx` — "No hay costos registrados"
    - `/evidences/page.tsx` — "No hay evidencias"
    - `/reports/page.tsx` — "No hay informes"
    - `/documents/page.tsx` — "No hay documentos"
    - `/customers/page.tsx` — "No hay clientes"
    - `/planning/page.tsx` — "No hay planeaciones"
    - `/billing/ses/page.tsx` — "No hay SES"
    - `/billing/invoices/page.tsx` — "No hay facturas"
    - `/payments/page.tsx` — "No hay pagos"
    - `/fleet/page.tsx` — "No hay vehículos"
    - `/resources/page.tsx` — "No hay recursos"
  - Use existing `<EmptyState>` component from `@/core/ui/EmptyState`
  - Each empty state should: show illustration/icon, descriptive message, CTA to create
  - Follow the pattern: `data.length === 0 ? <EmptyState ... /> : <table/list>`

  **Must NOT do**:
  - Do NOT add empty states where they would hide real data (use `isLoading` guard)
  - Do NOT change data fetching logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["tailwind-css-patterns"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **References**:
  - `frontend/src/core/ui/EmptyState.tsx` — existing component
  - `frontend/src/core/ui/EmptyStateIllustration.tsx` — illustration component

  **Acceptance Criteria**:
  - [ ] All 15 list pages show empty state when no data
  - [ ] Empty state includes descriptive message + CTA
  - [ ] TypeScript compiles without errors

  **Evidence to Capture**:
  - [ ] task-18-empty-states.diff
  - [ ] task-18-screenshots/*.png

  **Commit**: YES
  - Message: `feat(ui): add empty state handling to all list pages`

---

- [ ] 19. **Add OfflineBanner + RBAC forbidden states**

  **What to do**:
  - Audit all pages for offline state handling:
    - Pages in field modules (execution, evidence, checklists) must show `<OfflineBanner>`
    - Dashboard, proposals, orders should show connectivity indicator
  - Add offline state to field-critical pages:
    - `execution/page.tsx`, `execution/[id]/page.tsx`
    - `evidences/page.tsx`, `evidences/[id]/page.tsx`
    - `checklists/page.tsx`
    - `inventory/scan/page.tsx`
    - `site-visits/[id]/page.tsx`
  - Use existing `<OfflineBanner>` from `@/components/common/OfflineBanner`
  - Add RBAC forbidden state to admin pages:
    - `/settings/notifications/page.tsx` — "No tienes permisos" if not gerente
    - `/erp-connector/page.tsx` — RBAC guard
    - `/admin-backup` pages — RBAC guard
    - `/sla/page.tsx` — check role access
    - `/dispatch/page.tsx` — check role access
  - Use `usePermissions()` or `canAccessModule(userRole, module)` pattern

  **Must NOT do**:
  - Do NOT add offline banner to non-field pages (dashboard, legal, auth)
  - Do NOT break existing offline infrastructure

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **References**:
  - `frontend/src/components/common/OfflineBanner.tsx` — existing component
  - `frontend/src/components/common/SyncBanner.tsx` — sync status
  - `frontend/src/modules/auth/hooks/useAuth.ts` — auth state
  - `frontend/src/modules/core/hooks/usePermissions.ts` — permissions hook

  **Acceptance Criteria**:
  - [ ] Field pages show offline banner when disconnected
  - [ ] Admin pages show forbidden state for unauthorized roles
  - [ ] All existing functionality preserved

  **Evidence to Capture**:
  - [ ] task-19-offline-rbac.diff
  - [ ] task-19-forbidden-screenshot.png

  **Commit**: YES
  - Message: `feat(ui): add offline banner to field pages and RBAC forbidden states`

---

- [ ] 20. **Fix accessibility issues on forms and interactive components**

  **What to do**:
  - Run `npx react-doctor@latest` to identify a11y issues
  - Fix top issues found:
    - Missing `<label>` on inputs — ensure every `<input>`, `<select>`, `<textarea>` has associated label
    - Missing `aria-label` on icon-only buttons
    - Missing focus rings on interactive elements
    - Color-only status communication — add text labels to StatusBadge
    - Tab order in forms — ensure logical focus progression
  - Focus on high-traffic pages:
    - `/login` — email/password labels, submit button aria-label
    - `/work-requests/new` — all form fields have labels, error messages linked via `aria-describedby`
    - `/proposals/new` — form field accessibility
    - `/orders/new` — form field accessibility
    - `/service-cases/[id]/cockpit` — interactive elements accessibility
  - Use Radix UI patterns for accessible components where applicable
  - Fix any `role` attribute issues found by react-doctor

  **Must NOT do**:
  - Do NOT add large libraries for a11y — use native HTML + ARIA
  - Do NOT change visual design — only semantic/accessibility fixes
  - Do NOT create new components — modify existing ones

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["accessibility"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **References**:
  - `frontend/AGENTS.md:63-70` — Accessibility rules
  - `frontend/src/core/ui/FormField.tsx` — form field component
  - `frontend/src/core/ui/Button.tsx` — button component
  - `frontend/src/core/ui/StatusBadge.tsx` — status display

  **Acceptance Criteria**:
  - [ ] react-doctor report no critical a11y issues
  - [ ] All form inputs have visible labels
  - [ ] All icon-only buttons have aria-label
  - [ ] Focus rings visible on all interactive elements
  - [ ] No color-only status communication

  **QA Scenarios**:
  ```
  Scenario: Login page has proper labels
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Assert input[type="email"] has associated label element via `aria-labelledby` or wrapping
      3. Assert input[type="password"] has associated label
      4. Assert submit button has accessible text (not just icon)
    Expected Result: All inputs have labels, buttons have text
    Evidence: .sisyphus/evidence/task-20-a11y-login.png
  ```

  **Evidence to Capture**:
  - [ ] task-20-react-doctor-report.txt
  - [ ] task-20-a11y-fixes.diff
  - [ ] task-20-a11y-login.png

  **Commit**: YES
  - Message: `fix(a11y): add form labels, aria labels, and fix focus ring issues`

---

- [ ] 21. **Centralize query keys across all modules**

  **What to do**:
  - Audit all `useQuery` and `useMutation` calls for raw/duplicated query keys
  - Modules to refactor:
    - `proposals` — already has PROPOSALS_KEYS (but page uses raw `["proposal", id]`) — FIX BUG 1+align
    - `work-requests` — extract WORK_REQUEST_KEYS
    - `orders` — extract ORDER_KEYS
    - `service-cases` — already has SERVICE_CASE_KEYS — verify usage
    - `costs` — extract COST_KEYS
    - `customers` — extract CUSTOMER_KEYS
    - `evidences` — extract EVIDENCE_KEYS
    - `reports` — extract REPORT_KEYS
    - `documents` — extract DOCUMENT_KEYS
    - `resources` — extract RESOURCE_KEYS
    - `payments` — extract PAYMENT_KEYS
    - `planning` — extract PLANNING_KEYS
    - `fleet` — extract FLEET_KEYS
  - Pattern: `const [MODULE]_KEYS = { all: [...], list: (filters) => [...], detail: (id) => [...] }`
  - Ensure all mutations invalidate the correct keys on success
  - Ensure all `useQuery` calls use the centralized keys, not raw arrays

  **Must NOT do**:
  - Do NOT change API response handling — only query keys
  - Do NOT break cache invalidation — maintain existing invalidation logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 17-20, 22)
  - **Parallel Group**: Wave 4

  **References**:
  - `frontend/src/modules/proposals/queries.ts:17-22` — reference pattern for PROPOSALS_KEYS
  - `frontend/src/modules/service-cases/model/queryKeys.ts` — reference SERVICE_CASE_KEYS pattern
  - `frontend/src/lib/constants/query-options.ts` — shared query options

  **Acceptance Criteria**:
  - [ ] All modules have centralized query keys following PROPOSALS_KEYS pattern
  - [ ] All mutations invalidate using keys, not raw strings
  - [ ] No raw queryKey arrays like `["module", id]` remain
  - [ ] All tests pass

  **Evidence to Capture**:
  - [ ] task-21-query-keys.diff
  - [ ] task-21-typecheck-result.txt

  **Commit**: YES
  - Message: `refactor(queries): centralize query keys across all modules`

---

- [ ] 22. **Optimize stale times and cache invalidation strategy**

  **What to do**:
  - Review `frontend/src/lib/constants/query-config.ts` — current stale time config
  - Create `frontend/src/lib/constants/query-config.ts` if doesn't exist with:
    - `STALE_TIMES` object with different stale times by data type:
      ```typescript
      export const STALE_TIMES = {
        DASHBOARD: 30_000,         // 30s — near real-time
        LIST: 60_000,              // 1m — list data
        DETAIL: 120_000,           // 2m — detail data
        OPTIONS: 300_000,          // 5m — dropdown options, reference data
        CATALOG: 600_000,          // 10m — catalog data
        STATIC: 86_400_000,        // 24h — truly static reference data
      };
      ```
    - `listQueryOptions` — shared options for list queries:
      ```typescript
      export const listQueryOptions = {
        staleTime: STALE_TIMES.LIST,
        retry: 1,
        refetchOnWindowFocus: false,
      };
      ```
  - Apply to all modules: import STALE_TIMES and use appropriate stale time
  - Apply `gcTime` (formerly `cacheTime`) for garbage collection: default 5 min
  - Ensure mutations call `invalidateQueries` with proper `queryKey` (not `exact: true` to invalidate all descendant keys)
  - Review offline cache persistence — ensure TanStack Query persist works with new key structure

  **Must NOT do**:
  - Do NOT set staleTime too high for real-time data (dashboard, case state)
  - Do NOT change default retry behavior except where explicitly needed

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **References**:
  - `frontend/src/lib/constants/query-config.ts` — current config
  - `frontend/src/lib/constants/query-options.ts` — query options
  - `frontend/src/lib/http/api-client.ts` — API client
  - `frontend/src/modules/proposals/queries.ts:56` — existing listQueryOptions usage

  **Acceptance Criteria**:
  - [ ] STALE_TIMES exported and used across all modules
  - [ ] Appropriate stale times by data type
  - [ ] Cache invalidation works correctly after mutations
  - [ ] No stale data displayed after mutation

  **Evidence to Capture**:
  - [ ] task-22-stale-times.diff
  - [ ] task-22-typecheck-result.txt

  **Commit**: YES
  - Message: `perf(queries): optimize stale times and cache invalidation strategy`

---

- [ ] 23. **Create PageMaturity audit report generator**

  **What to do**:
  - Create `frontend/scripts/page-maturity-audit.ts` — script that:
    - Scans all `frontend/src/app/**/page.tsx` files
    - For each page, checks:
      - ✅ Has loading state (imports Skeleton or has loading.tsx)
      - ✅ Has error state (error card or error.tsx)
      - ✅ Has empty state (EmptyState component or conditional check)
      - ✅ Has offline state (OfflineBanner) — field pages only
      - ✅ Has forbidden state (RBAC check) — admin pages only
      - ✅ Has breadcrumb navigation
      - ✅ Has proper `<title>` or heading
      - ✅ Uses TanStack Query (not direct fetch)
      - ✅ Has TypeScript strict types (no `any`)
    - Outputs HTML report with color-coded maturity score per page
    - Aggregates: overall maturity %, pages needing work
  - Save report to `frontend/public/reports/page-maturity.html`
  - Add npm script: `"audit:maturity": "tsx scripts/page-maturity-audit.ts"`
  - Use AST parsing (grep patterns) for accurate detection

  **Must NOT do**:
  - Do NOT modify any page files — report is readonly analysis
  - Do NOT add audit results to git — generate on demand

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 24-26)
  - **Parallel Group**: Wave 5 (Tasks 23-26)
  - **Blocked By**: Tasks 17-20 (state additions — audit measures what's built)

  **References**:
  - `frontend/src/app/` — all page files to scan
  - `frontend/scripts/optimize-images.ts` — existing script pattern for reference

  **Acceptance Criteria**:
  - [ ] Script runs without errors
  - [ ] Report covers all 92+ pages
  - [ ] Report shows clear maturity scoring
  - [ ] HTML report renders in browser

  **QA Scenarios**:
  ```
  Scenario: Run maturity audit
    Tool: Bash
    Steps:
      1. Run: cd frontend && npx tsx scripts/page-maturity-audit.ts
      2. Check exit code
      3. Open frontend/public/reports/page-maturity.html
    Expected Result: Report generated, shows all pages with scores
    Evidence: .sisyphus/evidence/task-23-audit-report.txt
  ```

  **Evidence to Capture**:
  - [ ] task-23-page-maturity-audit.ts
  - [ ] task-23-audit-report.txt

  **Commit**: YES
  - Message: `feat(scripts): add page maturity audit report generator`

---

- [ ] 24. **Add performance budgets and lazy loading**

  **What to do**:
  - Create `frontend/next.config.ts` performance optimizations (verify existing):
    - Enable `reactStrictMode: true` (already Next.js 16 default)
    - Enable `swcMinify: true` (already default in Next.js 16)
    - Add image optimization with sharp for all images
    - Enable `logging` for API route timing in dev
  - Audit large component imports:
    - Use dynamic imports (next/dynamic) for heavy charts (recharts)
    - Use dynamic imports for fullcalendar
    - Use dynamic imports for react-dnd
    - Lazy load evidence gallery
    - Lazy load cost comparison panel
  - Add bundle analyzer script: `"analyze": "cross-env ANALYZE=true next build"`
  - Verify no barrel imports (index.ts re-exports) in performance-critical paths:
    - `@/core/ui/` — check for barrel patterns
    - `@/modules/*/index.ts` — check for barrel patterns
  - Create `frontend/docs/PERFORMANCE_BUDGET.md` with:
    - First Load JS < 150KB
    - LCP < 2.5s
    - TTI < 3.5s
    - Lighthouse score > 85

  **Must NOT do**:
  - Do NOT remove existing imports — only add lazy loading where beneficial
  - Do NOT change routing structure

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["vercel-react-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5

  **References**:
  - `frontend/src/lib/utils/lazy.tsx` — existing lazy loading utility
  - `frontend/src/lib/utils/lazy-monthly-trend-chart.tsx` — example of lazy chart
  - `frontend/src/lib/utils/lazy-orders-by-status-chart.tsx` — example of lazy chart

  **Acceptance Criteria**:
  - [ ] Heavy components (recharts, fullcalendar, react-dnd) loaded dynamically
  - [ ] Bundle analyzer script works
  - [ ] All pages still render correctly after lazy loading changes
  - [ ] TypeScript compiles without errors

  **Evidence to Capture**:
  - [ ] task-24-performance.diff
  - [ ] task-24-build-result.txt

  **Commit**: YES
  - Message: `perf(app): add lazy loading for heavy components and performance budget`

---

- [ ] 25. **Add RBAC role-switching test utilities**

  **What to do**:
  - Create `frontend/tests/e2e/utils/rbac-helper.ts` with:
    - `roles` — array of all 8 roles with credentials
    - `loginAsRole(page, role)` — logs in as specified role
    - `logout(page)` — clears auth state
    - `withRole(role, testFn)` — wraps test in role-specific login/logout
    - `getAccessibleModules(role)` — returns list of modules accessible by role
    - `assertPageAccess(page, url, shouldAccess)` — asserts page is accessible or returns forbidden
    - `assertButtonVisibility(page, buttonText, shouldSee)` — asserts action visibility
  - Add `rol` to test data: match role names from `@cermont/domain`
  - Create `frontend/tests/e2e/rbac-matrix.spec.ts` — comprehensive RBAC test:
    - For each of the 8 roles, test:
      - Dashboard access
      - Proposals list (read-only vs full access)
      - Orders list (view vs edit vs none)
      - Service cases (view vs advance vs none)
      - Customers (view vs manage vs none)
      - Settings (admin only)
      - ERP Connector (admin only)
      - Portal routes (cliente only)
    - Assert proper menu items visible based on role
    - Assert proper action buttons visible based on role
  - Expected: ~64 test cases (8 roles × 8 modules)

  **Must NOT do**:
  - Do NOT test actual backend authorization — frontend RBAC only
  - Do NOT hardcode role strings — use `@cermont/domain` constants

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5

  **References**:
  - `frontend/src/modules/core/hooks/usePermissions.ts` — permissions hook
  - `frontend/src/modules/auth/hooks/useAuth.ts` — auth hook
  - `@cermont/domain` package — role definitions
  - `frontend/proxy.ts` — RBAC middleware

  **Acceptance Criteria**:
  - [ ] rbac-helper functions work for all 8 roles
  - [ ] rbac-matrix spec tests at least 64 combinations
  - [ ] All tests pass (role-based access works as expected)
  - [ ] TypeScript strict compiles

  **QA Scenarios**:
  ```
  Scenario: RBAC matrix test for gerente role
    Tool: Bash
    Steps:
      1. Run: cd frontend && npx playwright test tests/e2e/rbac-matrix.spec.ts --grep "gerente"
    Expected Result: All gerente tests pass (has access to all modules)
    Evidence: .sisyphus/evidence/task-25-rbac-gerente.txt

  Scenario: RBAC matrix test for cliente role
    Tool: Bash
    Steps:
      1. Run: cd frontend && npx playwright test tests/e2e/rbac-matrix.spec.ts --grep "cliente"
    Expected Result: Cliente only has access to portal + limited read
    Evidence: .sisyphus/evidence/task-25-rbac-cliente.txt
  ```

  **Evidence to Capture**:
  - [ ] task-25-rbac-helper.ts
  - [ ] task-25-rbac-matrix.spec.ts
  - [ ] task-25-rbac-results.txt

  **Commit**: YES
  - Message: `test(e2e): add RBAC role-switching test utilities and matrix tests`

---

- [ ] 26. **Add CI workflow optimization (test sharding)**

  **What to do**:
  - Create `.github/workflows/e2e-tests.yml` if not exists:
  - Add Playwright sharding configuration

  **Must NOT do**:
  - Do NOT create CI workflow that runs on every commit — only on push/PR
  - Do NOT add secrets to the workflow file — use GitHub secrets automaticas

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["bash-defensive-patterns"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocked By**: None

  **References**:
  - `frontend/playwright.config.ts` — existing config with CI detection
  - `frontend/package.json` — scripts section
  - Playwright sharding docs

  **Acceptance Criteria**:
  - [ ] CI workflow file created with 4 shards
  - [ ] npm scripts added for CI test variants
  - [ ] Config handles CI vs local correctly
  - [ ] All existing tests pass with sharding

  **QA Scenarios**:
  ```
  Scenario: CI workflow validates
    Tool: Bash
    Steps:
      1. Check .github/workflows/e2e-tests.yml exists
      2. Validate YAML syntax: node -e "require('js-yaml').load(fs.readFileSync('.github/workflows/e2e-tests.yml','utf8'))"
    Expected Result: File valid, syntax correct
    Evidence: .sisyphus/evidence/task-26-ci-file-valid.txt

  Scenario: Playwright test with --shard flag works
    Tool: Bash
    Preconditions: App running
    Steps:
      1. Run: cd frontend && npx playwright test --shard=1/2 --grep "smoke"
    Expected Result: Tests run, only shard 1 of 2 executed
    Evidence: .sisyphus/evidence/task-26-shard-output.txt
  ```

  **Evidence to Capture**:
  - [ ] task-26-ci-workflow.yml
  - [ ] task-26-package-json-scripts.diff
  - [ ] task-26-shard-output.txt

  **Commit**: YES
  - Message: `ci: add e2e test sharding and CI workflow automation`
  - Files: `.github/workflows/e2e-tests.yml`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 27. **Create Profile + Settings + Admin pages test suite**

  **What to do**:
  - Create `frontend/tests/e2e/profile-settings.spec.ts`:
  - Tests for Profile module:
    - "profile page loads" — `/profile` — assert user data visible
    - "profile privacy page loads" — `/profile/privacy` — assert privacy settings form
  - Tests for Settings module:
    - "settings notifications page loads" — `/settings/notifications` — assert notification preferences form
    - "settings RBAC: non-admin cannot access" — login as operador, assert forbidden or redirect
  - Create `frontend/tests/e2e/admin-pages.spec.ts`:
    - "dispatch page loads" — `/dispatch` — assert dispatch board/calendar
    - "dispatch RBAC check" — verify only gerente/residente can access full dispatch features
    - "SLA page loads" — `/sla` — assert SLA metrics/dashboard
    - "SLA RBAC check" — verify gerente-only access if applicable
    - "ERP connector page loads" — `/erp-connector` — assert connector config
    - "ERP connector RBAC" — verify admin-only access
    - "business documents list loads" — `/business-documents` — assert document library
    - "business document detail loads" — `/business-documents/[id]` — assert document view
  - Create `frontend/tests/e2e/legal-pages.spec.ts`:
    - "terms page loads" — `/terms` — public, assert legal content
    - "privacy page loads" — `/privacy` — public, assert privacy content
    - "consent page loads" — `/consent` — public, assert consent form
  - All tests are smoke tests: navigate → 200 → no console errors

  **Must NOT do**:
  - Do NOT change RBAC logic — only test existing behavior
  - Do NOT test notification delivery (external service)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (complemento a tasks 9-16)
  - **Blocked By**: Tasks 5, 7 (utils + test data)

  **References**:
  - `frontend/src/app/(dashboard)/profile/page.tsx` — profile page
  - `frontend/src/app/(dashboard)/settings/notifications/page.tsx` — settings
  - `frontend/src/app/(dashboard)/dispatch/page.tsx` — dispatch
  - `frontend/src/app/(dashboard)/sla/page.tsx` — sla
  - `frontend/src/app/(dashboard)/erp-connector/page.tsx` — erp
  - `frontend/src/app/(dashboard)/business-documents/page.tsx` — business docs
  - `frontend/src/app/(legal)/terms/page.tsx` — legal pages

  **Acceptance Criteria**:
  - [ ] Profile page loads
  - [ ] Settings page loads with proper RBAC
  - [ ] Admin pages (dispatch, SLA, ERP) load with correct role gating
  - [ ] Legal pages are publicly accessible
  - [ ] All tests pass, no console errors

  **QA Scenarios**:
  ```
  Scenario: Profile and settings pages load correctly
    Tool: Playwright
    Preconditions: Login as gerente
    Steps:
      1. Navigate to /profile — assert heading "Mi Perfil" visible
      2. Navigate to /profile/privacy — assert privacy options
      3. Navigate to /settings/notifications — assert notification preferences form
      4. Navigate to /dispatch — assert dispatch view loads
    Expected Result: All pages load without errors
    Evidence: .sisyphus/evidence/task-27-profile-settings.png

  Scenario: Legal pages publicly accessible
    Tool: Playwright
    Preconditions: No auth required
    Steps:
      1. Navigate to /terms — assert status 200
      2. Navigate to /privacy — assert status 200
      3. Navigate to /consent — assert status 200
    Expected Result: All legal pages accessible without login
    Evidence: .sisyphus/evidence/task-27-legal-pages.png
  ```

  **Evidence to Capture**:
  - [ ] task-27-specs — all spec files
  - [ ] task-27-profile-settings.png — screenshot
  - [ ] task-27-legal-pages.png — screenshot
  - [ ] task-27-test-results.txt — test output

  **Commit**: YES
  - Message: `test(e2e): add profile, settings, admin and legal page test suites`
  - Files: `frontend/tests/e2e/profile-settings.spec.ts`, `frontend/tests/e2e/admin-pages.spec.ts`, `frontend/tests/e2e/legal-pages.spec.ts`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 28. **Create Templates + Forms + Checklists test suite**

  **What to do**:
  - Create `frontend/tests/e2e/templates.spec.ts`:
    - "templates list loads" — `/templates` — assert template library grid/list
    - "template detail loads" — `/templates/[id]` — assert template editor/preview
    - "template create loads" — `/templates/new` — assert template creation form
    - "template drafts list loads" — `/templates/drafts` — assert draft templates
    - "template draft detail loads" — `/templates/drafts/[id]` — assert draft editor
  - Create `frontend/tests/e2e/dynamic-forms.spec.ts`:
    - "forms list loads" — `/forms` — assert available form templates
    - "form fill loads" — `/forms/[templateId]` — assert dynamic form loaded from template
  - Create `frontend/tests/e2e/checklists.spec.ts`:
    - "checklists list loads" — `/checklists` — assert checklist items
  - Create `frontend/tests/e2e/site-visits.spec.ts`:
    - "site visits list loads" — `/site-visits` — assert visit reports list
    - "site visit detail loads" — `/site-visits/[id]` — assert visit details
    - "site visit create loads" — `/site-visits/new` — assert visit creation form
  - Page Objects: `TemplatesPage`, `FormsPage`, `SiteVisitsPage`

  **Must NOT do**:
  - Do NOT test PDF/template rendering in detail — visual smoke only
  - Do NOT test file download functionality

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocked By**: Tasks 5, 7

  **References**:
  - `frontend/src/app/(dashboard)/templates/page.tsx`
  - `frontend/src/app/(dashboard)/forms/page.tsx`
  - `frontend/src/app/(dashboard)/checklists/page.tsx`
  - `frontend/src/app/(dashboard)/site-visits/page.tsx`

  **Acceptance Criteria**:
  - [ ] Templates module pages (list, detail, create, drafts) load correctly
  - [ ] Forms module loads dynamic form templates
  - [ ] Checklists page loads
  - [ ] Site visits pages (list, detail, create) load
  - [ ] All tests pass, no console errors

  **QA Scenarios**:
  ```
  Scenario: Template pages load correctly
    Tool: Playwright
    Preconditions: Login as gerente
    Steps:
      1. Navigate to /templates — assert template cards/grid visible
      2. Navigate to /templates/new — assert creation form visible
      3. Navigate to /templates/drafts — assert draft list
      4. Navigate to /forms — assert available forms list
      5. Navigate to /checklists — assert checklist items
    Expected Result: All pages load without console errors
    Evidence: .sisyphus/evidence/task-28-templates.png
  ```

  **Evidence to Capture**:
  - [ ] task-28-specs
  - [ ] task-28-templates.png
  - [ ] task-28-test-results.txt

  **Commit**: YES
  - Message: `test(e2e): add templates, forms, checklists and site visits test suites`
  - Files: `frontend/tests/e2e/templates.spec.ts`, `frontend/tests/e2e/dynamic-forms.spec.ts`, `frontend/tests/e2e/checklists.spec.ts`, `frontend/tests/e2e/site-visits.spec.ts`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 29. **Create full 14-step business flow integration test**

  **What to do**:
  - Create `frontend/tests/e2e/business-flow-14-steps-extended.spec.ts`
  - This test extends existing `business-flow-14-steps.spec.ts` by adding steps that may be missing
  - Full flow test (end-to-end):
    1. Login as gerente
    2. Create work request (WR) → assert SC generated
    3. Qualify WR → assert advance to Step 3
    4. Create proposal → assert blocker resolved (Bug 2 fix verified)
    5. Send proposal → assert status change reactive (Bug 1 fix verified)
    6. Login as cliente → approve proposal
    7. Create purchase order (PO) from proposal
    8. Create planning packet with crew + tools
    9. Approve planning
    10. Start execution session
    11. Add evidence (photo)
    12. Generate technical report
    13. Create delivery record
    14. Sign delivery record
    15. Create service entry sheet (SES)
    16. Approve SES
    17. Create invoice
    18. Approve invoice
    19. Record payment
    20. Assert case marked as paid/complete
  - Use `page` context switching for role changes (gerente → cliente → gerente)
  - Add explicit assertions after each step to verify:
    - Toast message visible
    - Status badge updates
    - Workflow blocker resolves
    - Next step accessible

  **Must NOT do**:
  - Do NOT create duplicate of existing `business-flow-14-steps.spec.ts` — extend/fix it
  - Do NOT skip any of the 14 steps — full chain must be verified
  - Do NOT use hardcoded timeouts — use Playwright `waitFor` with assertions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential steps)
  - **Parallel Group**: Sequential (depends on all Bug fixes being done)
  - **Blocked By**: Tasks 1, 2, 5, 7 (bug fixes + auth helpers)

  **References**:
  - `frontend/tests/e2e/business-flow-14-steps.spec.ts` — existing flow test
  - `frontend/tests/e2e/business-flows.spec.ts` — additional flow tests
  - `frontend/tests/e2e/spec-014/01-cockpit-14-steps.spec.ts` — cockpit step tests
  - `frontend/tests/e2e/spec-014/10-full-14-step-flow.spec.ts` — full flow tests

  **Acceptance Criteria**:
  - [ ] All 14 steps executed successfully
  - [ ] Bug 1 verified: status updates reactive
  - [ ] Bug 2 verified: SC blockers resolve after proposal creation
  - [ ] Bug 3+4 verified: site selection works
  - [ ] Flow completes with case in "paid" state
  - [ ] Test is reliable (non-flaky) — passes 3/3 consecutive runs

  **QA Scenarios**:
  ```
  Scenario: Full 14-step flow executes end-to-end
    Tool: Bash
    Preconditions: Backend seeded, clean state
    Steps:
      1. Run: cd frontend && npx playwright test tests/e2e/business-flow-14-steps-extended.spec.ts --reporter=list
      2. Observe each step passing sequentially
    Expected Result: All 14+ assertions pass, flow reaches payment
    Evidence: .sisyphus/evidence/task-29-full-flow-results.txt

  Scenario: Flow reliability (3 consecutive runs)
    Tool: Bash
    Steps:
      1. For i in 1..3: run the test
      2. Assert all 3 runs pass without flakiness
    Expected Result: 3/3 passes
    Evidence: .sisyphus/evidence/task-29-reliability.txt
  ```

  **Evidence to Capture**:
  - [ ] task-29-business-flow-14-steps-extended.spec.ts
  - [ ] task-29-full-flow-results.txt
  - [ ] task-29-reliability.txt
  - [ ] task-29-flow-screenshots/ — screenshots of key steps

  **Commit**: YES
  - Message: `test(e2e): add complete 14-step business flow integration test with all bug validations`
  - Files: `frontend/tests/e2e/business-flow-14-steps-extended.spec.ts`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 30. **Run comprehensive existing test suite audit**

  **What to do**:
  - Run ALL existing Playwright tests and record results:
    ```bash
    cd frontend && npx playwright test tests/e2e/ --reporter=json 2>&1 | tee test-results/full-e2e-baseline.json
    ```
  - Parse the JSON report to identify:
    - Total test count (specs × tests)
    - Pass/fail/skip counts
    - Flaky tests (run 3 times, check consistency)
    - Tests that timeout frequently
  - For each failing test, analyze root cause:
    - Is it a bug in the app? → add to bug fix tasks
    - Is it a flaky test? → add Playwright fix (better waits, retries)
    - Is it environment-dependent? → note in test config
  - Create `frontend/tests/e2e/TEST_STATUS.md` documenting:
    - Total existing tests: N passing / N failing / N skipped
    - Flaky tests list
    - Test coverage gaps (modules with < 2 tests)
    - Recommendations for improvement
  - If any existing tests FAIL after bug fixes, fix them

  **Must NOT do**:
  - Do NOT delete failing tests — fix or skip with documented reason
  - Do NOT change Playwright config to hide failures
  - Do NOT modify app code to make tests pass — fix underlying issues

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (pure analysis)
  - **Parallel Group**: Wave 5
  - **Blocked By**: Bug fixes (Tasks 1-4) completed

  **References**:
  - All files in `frontend/tests/e2e/` — 40+ spec files
  - `frontend/playwright.config.ts` — test config
  - `frontend/test-results/` — test output directory

  **Acceptance Criteria**:
  - [ ] Baseline test run completed, results recorded
  - [ ] TEST_STATUS.md created with full analysis
  - [ ] All existing tests pass after bug fixes
  - [ ] Flaky tests identified and documented
  - [ ] Coverage gaps documented

  **QA Scenarios**:
  ```
  Scenario: Run full existing test suite
    Tool: Bash
    Preconditions: Backend + frontend running
    Steps:
      1. cd frontend && npx playwright test tests/e2e/ --reporter=json --output=test-results/
      2. Check exit code
      3. Parse test-results/full-e2e-baseline.json for pass/fail counts
    Expected Result: All tests pass (exit 0) or documented failures
    Evidence: .sisyphus/evidence/task-30-baseline-results.txt
  ```

  **Evidence to Capture**:
  - [ ] task-30-baseline-results.txt
  - [ ] task-30-TEST_STATUS.md
  - [ ] task-30-flaky-report.txt

  **Commit**: YES
  - Message: `test(e2e): comprehensive test suite audit and status documentation`
  - Files: `frontend/tests/e2e/TEST_STATUS.md`
  - Pre-commit: `npm run typecheck -w frontend`

---

- [ ] 31. **Add offline-first page tests for field modules**

  **What to do**:
  - Create `frontend/tests/e2e/offline-field-pages.spec.ts`
  - Tests for offline behavior on field pages:
    - "offline banner visible when disconnected" — use Playwright to simulate offline (`page.context().setOffline(true)`)
    - "field forms show sync status" — fill form offline, assert sync queue indicator
    - "field forms save to IndexedDB" — submit execution data offline, verify stored in Dexie
    - "field forms recover after coming online" — submit offline → come online → assert data synced
    - "read-only pages show offline notice" — proposals detail while offline, assert notice
  - Pages to test with offline mode:
    - `/execution` — field execution
    - `/evidences` — evidence capture
    - `/checklists` — checklist completion
    - `/site-visits/[id]` — site visit reports
    - `/inventory/scan` — field inventory scan
  - Use Playwright `page.context().setOffline(true)` for offline simulation
  - After toggling back online, verify:
    - Sync queue processes pending mutations
    - UI updates to reflect synced state
    - No duplicate records created

  **Must NOT do**:
  - Do NOT test every page offline — focus on 5 field-critical pages
  - Do NOT modify offline sync infrastructure — only test it
  - Do NOT leave browser in offline state after test

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (stateful — offline/online toggling)
  - **Parallel Group**: Sequential (requires offline mode)
  - **Blocked By**: Tasks 5, 7 (utilities + test data)

  **References**:
  - `frontend/src/lib/offline/` — offline infrastructure
  - `frontend/src/lib/offline/offline-db.ts` — IndexedDB via Dexie
  - `frontend/src/lib/offline/sync-queue.ts` — sync queue
  - `frontend/src/components/common/OfflineBanner.tsx` — offline UI
  - `frontend/src/components/common/SyncBanner.tsx` — sync status UI
  - `frontend/tests/e2e/offline.spec.ts` — existing offline tests
  - `frontend/tests/e2e/offline-critical-mutations.spec.ts` — existing offline mutation tests

  **Acceptance Criteria**:
  - [ ] Offline banner visible on field pages when disconnected
  - [ ] Data entry works offline (saves to IndexedDB)
  - [ ] Data syncs automatically when back online
  - [ ] No duplicate data after sync
  - [ ] Existing offline tests still pass

  **QA Scenarios**:
  ```
  Scenario: Offline field form saves and syncs
    Tool: Playwright
    Preconditions: Login as supervisor, navigate to /execution/new
    Steps:
      1. Fill execution form with test data
      2. Set offline: page.context().setOffline(true)
      3. Assert OfflineBanner visible
      4. Submit form — assert saved locally (toast: "Guardado localmente")
      5. Set online: page.context().setOffline(false)
      6. Wait for sync — assert SyncBanner shows "Sincronizado"
      7. Navigate to execution list — assert new record appears
    Expected Result: Offline save + auto-sync works
    Evidence: .sisyphus/evidence/task-31-offline-flow.mp4 (video)
  ```

  **Evidence to Capture**:
  - [ ] task-31-offline-field-pages.spec.ts
  - [ ] task-31-offline-flow.mp4 — video of full offline test
  - [ ] task-31-test-results.txt

  **Commit**: YES
  - Message: `test(e2e): add offline-first page tests for field execution modules`
  - Files: `frontend/tests/e2e/offline-field-pages.spec.ts`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 32. **Add error boundary and recovery test suite**

  **What to do**:
  - Create `frontend/tests/e2e/error-boundaries.spec.ts`
  - Tests for error boundaries and recovery:
    - "global error page renders" — navigate to route that throws, assert `global-error.tsx` renders
    - "error.tsx renders for page-level errors" — trigger page error, assert error card with retry
    - "not-found page renders for 404s" — navigate to `/this-does-not-exist`, assert 404 page
    - "API error shows retry button" — intercept API route, return 500, assert error card + retry
    - "network error shows offline mode" — block API, assert graceful degradation
    - "error recovery via retry button" — mock failure → click retry → assert data loads
    - "multiple errors don't cascade" — trigger error in one module, assert other modules unaffected
  - Use Playwright route interception for error simulation:
    ```typescript
    await page.route('**/api/proposals/**', route => {
      route.fulfill({ status: 500, body: 'Server Error' });
    });
    ```
  - Also create `frontend/tests/e2e/concurrent-errors.spec.ts`:
    - "error in proposal list doesn't break order list" — intercept proposals API → assert orders still load
    - "error in sidebar doesn't crash app" — block sidebar data → assert page content still renders
    - "sequential errors handled gracefully" — block → fix → block again, assert recovery each time

  **Must NOT do**:
  - Do NOT add try/catch to app code — only test existing boundaries
  - Do NOT create actual server errors — use route interception

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `["playwright-best-practices"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocked By**: Tasks 5, 7

  **References**:
  - `frontend/src/app/error.tsx` — global error boundary
  - `frontend/src/app/global-error.tsx` — global error page
  - `frontend/src/app/not-found.tsx` — 404 page
  - `frontend/src/components/common/ErrorFallback.tsx` — ErrorFallback component
  - `frontend/src/components/common/ModuleErrorPage.tsx` — ModuleErrorPage component

  **Acceptance Criteria**:
  - [ ] All error boundary pages (404, 500, global error) render correctly
  - [ ] Route interception tests verify recovery via retry
  - [ ] Concurrent error isolation verified (error in one module doesn't affect others)
  - [ ] All tests pass

  **QA Scenarios**:
  ```
  Scenario: Error boundary renders for 404
    Tool: Playwright
    Steps:
      1. Navigate to /nonexistent-route
      2. Assert 404 page rendered — check for: "Página no encontrada" or not-found content
      3. Click "Volver al inicio" link
      4. Assert navigated to landing page
    Expected Result: 404 page shows with recovery option
    Evidence: .sisyphus/evidence/task-32-404-page.png

  Scenario: API error shows retry button
    Tool: Playwright
    Steps:
      1. Intercept: page.route('**/api/proposals/**', route => route.fulfill({status:500}))
      2. Navigate to /proposals
      3. Assert error card visible — check for text: "No se pudo cargar" or equivalent
      4. Assert retry button present
      5. Remove route interception
      6. Click retry — assert proposals load successfully
    Expected Result: Error handled, retry recovers data
    Evidence: .sisyphus/evidence/task-32-api-error.png
  ```

  **Evidence to Capture**:
  - [ ] task-32-error-boundaries.spec.ts
  - [ ] task-32-concurrent-errors.spec.ts
  - [ ] task-32-404-page.png
  - [ ] task-32-api-error.png
  - [ ] task-32-test-results.txt

  **Commit**: YES
  - Message: `test(e2e): add error boundary and recovery test suite`
  - Files: `frontend/tests/e2e/error-boundaries.spec.ts`, `frontend/tests/e2e/concurrent-errors.spec.ts`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---
    ```yaml
    name: E2E Tests
    on: [push, pull_request]
    jobs:
      test:
        runs-on: ubuntu-latest
        services:
          mongodb:
            image: mongo:7
            ports: [27017:27017]
        strategy:
          fail-fast: false
          matrix:
            shard: [1, 2, 3, 4]
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with: { node-version: '22.13.1' }
          - run: npm ci
          - run: npm run build -w packages/shared-types
          - run: npx playwright install --with-deps
          - run: npm run test:e2e -w frontend -- --shard=${{ matrix.shard }}/4
          - uses: actions/upload-artifact@v4
            if: always()
            with:
              name: playwright-report-${{ matrix.shard }}
              path: frontend/playwright-report/
    ```
  - Add `test:e2e:ci` script to frontend `package.json` that uses sharding
  - Ensure existing tests pass with sharding (no shared state between shards)
  - Add `test:e2e:smoke` script that runs only smoke tests (quick check)
  - Configure Playwright retries for CI: `retries: 2` when `CI=true`

  **Must NOT do**:
  - Do NOT create CI workflow that runs on every commit — only on push/PR
  - Do NOT add secrets to the workflow file — use GitHub secrets

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["bash-defensive-patterns"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5

  **References**:
  - `frontend/playwright.config.ts` — existing config with CI detection
  - `frontend/package.json` — scripts section
  - Playwright sharding docs

  **Acceptance Criteria**:
  - [ ] CI workflow file created with sharding
  - [ ] npm scripts added for CI test variants
  - [ ] Config handles CI vs local correctly
  - [ ] All existing tests pass with sharding

  **Evidence to Capture**:
  - [ ] task-26-ci-workflow.yml
  - [ ] task-26-package-json-scripts.diff

  **Commit**: YES
  - Message: `ci: add e2e test sharding and CI workflow automation`

---

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck -w frontend` + `npm run lint -w frontend` + `npm run test -w frontend` + `npm run build -w frontend`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Full E2E Test Run** — `unspecified-high` (+ `playwright` skill)
  Run ALL Playwright tests: `npm run test:e2e -w frontend`. Verify existing + new tests pass. Check HTML report for failures. Test cross-flow integration.
  Output: `Tests [N/N pass] | New tests [N/N pass] | Report [path] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- Task 1-4: bug fixes — `fix(proposals): align query keys for reactive status update`
- Task 5-8: infra — `test(e2e): add playwright test utilities and auth helpers`
- Task 9-16: tests — `test(e2e): add [module] page test suite`
- Task 17-22: maturation — `feat(ui): add [state] handling to [module] pages`
- Task 23-26: innovation — `perf(app): optimize query keys and cache strategy`
- Task F1-F4: verification — `chore: post-implementation verification and cleanup`

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck -w frontend  # Expected: PASS — 0 errors
npm run lint -w frontend       # Expected: PASS — 0 warnings
npm run test -w frontend       # Expected: PASS — all unit tests
npm run test:e2e -w frontend   # Expected: PASS — all existing + new E2E
npm run build -w frontend      # Expected: PASS — build successful
npx react-doctor@latest        # Expected: PASS — no issues
```

### Final Checklist
- [ ] All 4 bugs confirmed fixed (manual + automated verification)
- [ ] All 92+ pages have at least 1 Playwright test
- [ ] All existing E2E tests still pass
- [ ] All quality gates pass
- [ ] No new TypeScript errors
- [ ] No new lint warnings
- [ ] Test evidence saved to `.sisyphus/evidence/`
