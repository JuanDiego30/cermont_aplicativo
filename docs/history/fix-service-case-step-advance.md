# Fix: Service Case Step Advance + Proposal Linking + Data Inheritance

## TL;DR

> **Quick Summary**: Corregir el flujo de trabajo de 14 pasos del Service Case donde: (1) la propuesta económica no actualiza el estado del caso, (2) los pasos no están correctamente enlazados, y (3) los datos de pasos anteriores no se heredan forzando re-diligenciamiento.
>
> **Deliverables**:
> - Fix auto-advance mapping para que la creación de propuesta avance el paso
> - Link automático de propuesta al service case al crear desde contexto
> - Fix bloqueo de avanzar paso cuando la propuesta está en draft (no aprobada)
> - Herencia completa de datos del paso anterior en formularios
> - Invalidación de cache del service case después de crear propuesta
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 3 → Task 5 → Task 7

---

## Context

### Original Request
El usuario reporta que al crear una propuesta económica desde el caso de servicio (paso 3), el sistema:
1. No actualiza el estado del caso de servicio
2. No permite continuar al siguiente paso
3. No recuerda datos de pasos anteriores, forzando al usuario a volver a llenar la misma información

### Research Findings

**Root Cause Analysis (Backend)**:

1. **Auto-advance mapping bug** (`service-case.service.ts:ARTIFACT_TO_NEXT_STEP`):
   - El mapa dice `proposal: "step_04_purchase_order"` 
   - La función `tryAutoAdvanceServiceCase` verifica: `if (serviceCase.currentStepCode !== expectedNextStep)` y retorna temprano
   - Cuando se crea una propuesta, el paso actual es `step_03_proposal`, NO `step_04_purchase_order`
   - Resultado: el auto-advance NUNCA se ejecuta para propuestas
   - **Fix**: El mapa debe decir `proposal: "step_03_proposal"` (avanzar DESDE este paso)

2. **Proposal creation no linkea al Service Case** (`proposal.service.ts:createProposal`):
   - La función `createProposal` no recibe `serviceCaseId` como parámetro
   - El frontend pasa `serviceCaseId` como query param en la URL pero el backend no lo procesa
   - Resultado: la propuesta se crea pero no se vincula al `artifacts.proposal` del caso

3. **Blocker logic too strict** (`cermont-workflow-gate.service.ts:resolveProposalBlockers`):
   - Requiere `p.status === "approved"` para desbloquear el paso 3
   - Una propuesta recién creada está en status `draft`
   - Resultado: el botón "Avanzar al Paso 4" nunca se habilita después de crear la propuesta

4. **Frontend doesn't invalidate service case cache** (`proposals/queries.ts:useCreateProposal`):
   - Solo invalida `PROPOSALS_KEYS.all` después de crear
   - No invalida `SERVICE_CASE_KEYS.detail(id)` del service case
   - Resultado: el cockpit no se refresca automáticamente

**Root Cause Analysis (Data Inheritance)**:

5. **Partial data inheritance** (`proposals/new/page.tsx`):
   - Solo hereda `clientName` del contexto del paso
   - No hereda `location`, `generalScope`, `priority`, `requestedDate`, `workTypeName`
   - El componente `InheritedFieldGroup` muestra datos pero el form no los consume

6. **Step context API exists but is underutilized**:
   - `service-case-step-context.service.ts` ya tiene lógica completa de herencia por paso
   - El endpoint `GET /api/service-cases/:id/step-context?stepCode=step_03_proposal` retorna campos heredados
   - El frontend lo llama pero solo usa `clientName`

### Solutions from Research

**Pattern 1: Auto-advance after entity creation** (from Laravel Rails workflow package):
- After creating an entity, call `checkAutoAdvance()` which dispatches a queued job
- The job re-checks conditions at execution time to handle race conditions
- If current state has no outgoing forms → auto-advance via background job

**Pattern 2: State machine with event sourcing** (from Symfony Workflow):
- Store state transitions as events
- Use marking stores to track current state
- Automatic validation before transitions

**Pattern 3: Cache invalidation after mutation** (TanStack Query):
- Invalidate related queries after successful mutation
- Use `queryClient.invalidateQueries({ queryKey: [...] })` for cascade refresh

---

## Work Objectives

### Core Objective
Fix the service case 14-step workflow so that creating a proposal advances the step, data is inherited between steps, and the cockpit reflects real-time state.

### Concrete Deliverables
- Fixed auto-advance mapping in `service-case.service.ts`
- Proposal creation links to service case artifacts
- Relaxed blocker logic allows "propuesta draft" to satisfy step 3
- Frontend invalidates service case cache after proposal creation
- All inherited fields populate proposal form from step context
- E2E flow: create case → create proposal → advance to step 4

### Definition of Done
- [ ] Creating a proposal from service case context auto-links it to artifacts
- [ ] Service case step advances from 3 to 4 after proposal creation
- [ ] Proposal form pre-fills clientName, location, scope, priority from previous steps
- [ ] Cockpit refreshes automatically showing updated step
- [ ] `npm run typecheck && npm run lint && npm run build && npm run test` all pass

### Must Have
- Proposal creation from service case context links to `artifacts.proposal`
- Auto-advance fires after proposal creation
- Proposal form pre-fills inherited data
- Cache invalidation refreshes cockpit

### Must NOT Have (Guardrails)
- No changes to the domain state machine (`@cermont/domain`)
- No new API endpoints (use existing ones)
- No new UI components (enhance existing)
- No breaking changes to proposal creation for non-service-case context
- No `any` types introduced
- No console.log in production code

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (vitest + playwright)
- **Automated tests**: YES (tests-after for this fix)
- **Framework**: vitest (unit), playwright (E2E)

### QA Policy
Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Backend**: Use Bash (curl) - Send requests, assert status + response fields
- **Frontend**: Use Playwright - Navigate, interact, assert DOM, screenshot

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - backend fixes):
├── Task 1: Fix auto-advance mapping + proposal linking [deep]
├── Task 2: Fix proposal blocker logic [quick]
└── Task 3: Add serviceCaseId to proposal creation flow [quick]

Wave 2 (After Wave 1 - frontend fixes):
├── Task 4: Frontend cache invalidation after proposal creation [quick]
├── Task 5: Proposal form data inheritance [quick]
└── Task 6: Step context hook integration [quick]

Wave 3 (After Wave 2 - integration + tests):
├── Task 7: E2E integration test [deep]
└── Task 8: Regression test suite [unspecified-high]

Wave FINAL (After ALL tasks):
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Real manual QA [unspecified-high]
└── F4: Scope fidelity check [deep]
-> Present results -> Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | - | 4, 7 |
| 2 | - | 7 |
| 3 | - | 4, 5 |
| 4 | 1, 3 | 7 |
| 5 | 3 | 7 |
| 6 | 3 | 7 |
| 7 | 4, 5, 6 | F1-F4 |
| 8 | 7 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 3 tasks - T1 → `deep`, T2 → `quick`, T3 → `quick`
- **Wave 2**: 3 tasks - T4 → `quick`, T5 → `quick`, T6 → `quick`
- **Wave 3**: 2 tasks - T7 → `deep`, T8 → `unspecified-high`
- **FINAL**: 4 tasks - F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Fix auto-advance mapping + link proposal to service case artifacts

  **What to do**:
  - In `backend/src/modules/service-cases/service-case.service.ts`, fix `ARTIFACT_TO_NEXT_STEP` mapping:
    - Change `proposal: "step_04_purchase_order"` to `proposal: "step_03_proposal"`
  - In `backend/src/modules/proposal/proposal.service.ts` `createProposal()`:
    - Accept optional `serviceCaseId` parameter
    - After saving proposal, if `serviceCaseId` provided, update `ServiceCase.artifacts.proposal` with `{ id: proposal._id, status: proposal.status, updatedAt: new Date() }`
    - Call `tryAutoAdvanceServiceCase(serviceCaseId, "proposal")` after linking
  - In `backend/src/modules/proposal/proposal.controller.ts`:
    - Pass `serviceCaseId` from request body to `createProposal()`
  - In `packages/shared-types/src/schemas/` find `CreateProposalInputSchema`:
    - Add optional `serviceCaseId` field

  **Must NOT do**:
  - Do not modify the domain state machine in `@cermont/domain`
  - Do not change the auto-advance logic for other artifact types
  - Do not add new database indexes

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Backend business logic across multiple files with database mutations
  - **Skills**: [`zod`, `nodejs-backend-patterns`]
    - `zod`: Schema modification for CreateProposalInput
    - `nodejs-backend-patterns`: Service/controller pattern compliance

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 7
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `backend/src/modules/service-cases/service-case.service.ts:ARTIFACT_TO_NEXT_STEP` (line ~580) - The broken mapping that needs fixing
  - `backend/src/modules/service-cases/service-case.service.ts:tryAutoAdvanceServiceCase` (line ~595) - The auto-advance function that never fires for proposals

  **API/Type References**:
  - `backend/src/modules/proposal/proposal.service.ts:createProposal` - The function that needs serviceCaseId param
  - `backend/src/modules/proposal/proposal.controller.ts` - Controller that needs to pass serviceCaseId
  - `packages/shared-types` - CreateProposalInput type definition

  **Test References**:
  - `backend/tests/services/service-case.service.test.ts` - Existing service tests to follow patterns
  - `backend/tests/services/service-case-step-context.service.test.ts` - Step context tests

  **WHY Each Reference Matters**:
  - The ARTIFACT_TO_NEXT_STEP mapping is the root cause: it checks if currentStep === step_04 but current is step_03
  - createProposal needs to accept and process serviceCaseId to link the artifact
  - The controller must forward serviceCaseId from the request body

  **Acceptance Criteria**:
  - [ ] ARTIFACT_TO_NEXT_STEP maps `proposal` to `step_03_proposal`
  - [ ] createProposal accepts optional serviceCaseId
  - [ ] When serviceCaseId provided, proposal is linked to ServiceCase.artifacts.proposal
  - [ ] tryAutoAdvanceServiceCase is called after linking
  - [ ] `npm run typecheck` passes
  - [ ] `npm run lint` passes

  **QA Scenarios**:

  ```
  Scenario: Proposal creation links to service case and auto-advances
    Tool: Bash (curl)
    Preconditions: Service case SC-2026-0001 exists at step_03_proposal with valid auth token
    Steps:
      1. POST /api/proposals with { title: "Test", clientName: "Test Client", serviceCaseId: "<sc_id>", items: [{ description: "test", unit: "lote", quantity: 1, unitCost: 100000 }], validUntil: "2026-07-01" }
      2. Assert response has success: true and data._id exists
      3. GET /api/service-cases/<sc_id>/workflow
      4. Assert data.currentStepCode is NOT step_03_proposal (should have advanced)
      5. Assert data.artifacts.proposal.id matches the created proposal ID
    Expected Result: Proposal linked to service case, step advanced from 3 to 4
    Failure Indicators: currentStepCode still step_03_proposal, artifacts.proposal is null
    Evidence: .sisyphus/evidence/task-1-proposal-link-advance.json

  Scenario: Proposal creation without serviceCaseId still works (backward compat)
    Tool: Bash (curl)
    Preconditions: Valid auth token
    Steps:
      1. POST /api/proposals with { title: "Standalone", clientName: "Client", items: [...], validUntil: "2026-07-01" } (NO serviceCaseId)
      2. Assert response has success: true
      3. Assert no service case was modified
    Expected Result: Proposal created successfully without linking
    Evidence: .sisyphus/evidence/task-1-standalone-proposal.json
  ```

  **Commit**: YES
  - Message: `fix(backend): correct auto-advance mapping and link proposal to service case`
  - Files: `service-case.service.ts`, `proposal.service.ts`, `proposal.controller.ts`
  - Pre-commit: `npm run typecheck && npm run lint`

---

## Wave 3 — Integration + Tests

- [ ] 7. E2E integration test for proposal → step advance flow

  **What to do**:
  - Create or update E2E test in `frontend/tests/` or `backend/tests/`:
    - Test scenario: Create service case → Create proposal → Verify step advanced
    - Test scenario: Create proposal without serviceCaseId → Verify standalone works
    - Test scenario: Create proposal → Verify cockpit shows updated state
  - Use existing test patterns from `backend/tests/services/service-case.service.test.ts`
  - Mock external dependencies (database, auth) as needed
  - Assert:
    - Proposal is created with correct data
    - Service case artifacts.proposal is populated
    - currentStepCode advances from step_03_proposal
    - Timeline entry is created
    - Blockers are recalculated

  **Must NOT do**:
  - Do not test unrelated workflow steps
  - Do not modify existing test infrastructure
  - Do not add new test dependencies

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Integration test spanning multiple services
  - **Skills**: [`vitest`]
    - `vitest`: Test framework patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential after Wave 2)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5, 6

  **References**:
  - `backend/tests/services/service-case.service.test.ts` - Existing test patterns
  - `backend/tests/services/service-case-step-context.service.test.ts` - Step context test patterns
  - `backend/tests/controllers/service-case.controller.test.ts` - Controller test patterns

  **Acceptance Criteria**:
  - [ ] E2E test passes for proposal creation + step advance
  - [ ] Test covers backward compatibility (standalone proposal)
  - [ ] Test verifies cockpit state update
  - [ ] `npm run test` passes

  **QA Scenarios**:

  ```
  Scenario: E2E proposal creation advances service case step
    Tool: Bash (npm run test)
    Preconditions: Test database with seeded service case at step_03
    Steps:
      1. Run: npm run test -- --grep "proposal.*service case"
      2. Assert all test cases pass
      3. Verify proposal artifact linked to service case
      4. Verify step advanced from step_03 to step_04
    Expected Result: All E2E tests pass
    Evidence: .sisyphus/evidence/task-7-e2e-test-results.txt
  ```

  **Commit**: YES
  - Message: `test: add E2E integration test for proposal step advance flow`
  - Files: test files
  - Pre-commit: `npm run test`

---

- [ ] 8. Regression test suite for existing workflow steps

  **What to do**:
  - Run existing test suite to verify no regressions:
    - `npm run typecheck` — TypeScript compilation
    - `npm run lint` — Code style
    - `npm run build` — Production build
    - `npm run test` — Unit tests
    - `npm run verify` — Quality gates
  - Fix any failures caused by the changes
  - Document any known issues in the commit message

  **Must NOT do**:
  - Do not skip failing tests
  - Do not modify test configurations
  - Do not disable quality gates

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Quality gate execution and fix-forward
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential after Task 7)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 7

  **References**:
  - `package.json` — Scripts for typecheck, lint, build, test, verify
  - `AGENTS.md` — Required gates checklist

  **Acceptance Criteria**:
  - [ ] `npm run typecheck` passes with 0 errors
  - [ ] `npm run lint` passes with 0 errors
  - [ ] `npm run build` succeeds
  - [ ] `npm run test` passes all tests
  - [ ] `npm run verify` passes all quality gates
  - [ ] `npx react-doctor@latest` scores 100/100

  **QA Scenarios**:

  ```
  Scenario: All quality gates pass
    Tool: Bash
    Preconditions: All changes applied, clean working directory
    Steps:
      1. Run: npm run typecheck
      2. Run: npm run lint
      3. Run: npm run build
      4. Run: npm run test
      5. Run: npm run verify
      6. Run: npx react-doctor@latest
      7. Assert all commands exit with code 0
    Expected Result: All quality gates green
    Evidence: .sisyphus/evidence/task-8-quality-gates.txt
  ```

  **Commit**: YES (if fixes needed)
  - Message: `fix: resolve regression issues from proposal workflow fix`
  - Files: varies
  - Pre-commit: `npm run verify`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck` + `npm run lint` + `npm run test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1 (Tasks 1-3)**: Single commit `fix(backend): correct auto-advance mapping, relax proposal blocker, add serviceCaseId flow`
- **Wave 2 (Tasks 4-6)**: Single commit `fix(frontend): cache invalidation, data inheritance, step context integration`
- **Wave 3 (Tasks 7-8)**: Single commit `test: E2E integration test for proposal workflow fix`

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck    # Expected: 0 errors
npm run lint         # Expected: 0 errors
npm run build        # Expected: success
npm run test         # Expected: all pass
npm run verify       # Expected: all gates green
npx react-doctor@latest  # Expected: 100/100
```

### Final Checklist
- [ ] Proposal creation from service case context links to artifacts.proposal
- [ ] Service case step advances from 3 to 4 after proposal creation
- [ ] Proposal form pre-fills clientName, location, scope from previous steps
- [ ] Cockpit refreshes automatically showing updated step
- [ ] Backward compatibility: standalone proposal creation still works
- [ ] All quality gates pass
- [ ] No regressions in existing workflow steps

- [ ] 2. Fix proposal blocker logic — allow draft status to satisfy step 3

  **What to do**:
  - In `backend/src/services/cermont-workflow-gate.service.ts` `resolveProposalBlockers()`:
    - Change the condition from `p.status === "approved"` to `p.status === "approved" || p.status === "draft" || p.status === "sent"`
    - A proposal that EXISTS (even in draft) should satisfy the step 3 requirement
    - The `approved` status is needed for step 4 (purchase order), not step 3
  - Update the blocker message to reflect the new logic:
    - If no proposal: "Falta la propuesta económica elaborada y guardada."
    - If proposal exists but not approved: "Propuesta creada. Pendiente de aprobación del cliente para avanzar a paso 4."
  - Keep severity as `blocking` only when no proposal exists
  - Change severity to `warning` when proposal exists but is not approved

  **Must NOT do**:
  - Do not change blockers for other steps
  - Do not remove the approval requirement for step 4
  - Do not modify the state machine transitions

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file change with clear conditions
  - **Skills**: [`nodejs-backend-patterns`]
    - `nodejs-backend-patterns`: Service pattern compliance

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `backend/src/services/cermont-workflow-gate.service.ts:resolveProposalBlockers` (line ~120) - The blocker resolver that needs condition change

  **API/Type References**:
  - `packages/shared-types/src/` - DomainBlocker type definition

  **WHY Each Reference Matters**:
  - resolveProposalBlockers is the ONLY function that determines if step 3 is blocked
  - Currently requires `approved` which is impossible right after creation
  - Changing to allow `draft` lets the user advance after creating the proposal

  **Acceptance Criteria**:
  - [ ] Proposal in `draft` status produces a `warning` severity blocker (not `blocking`)
  - [ ] Proposal in `approved` status produces no blocker
  - [ ] No proposal at all produces a `blocking` blocker
  - [ ] `npm run typecheck` passes
  - [ ] `npm run lint` passes

  **QA Scenarios**:

  ```
  Scenario: Draft proposal produces warning blocker (not blocking)
    Tool: Bash (curl)
    Preconditions: Service case at step_03 with a proposal in draft status
    Steps:
      1. GET /api/service-cases/<sc_id>/workflow
      2. Find blocker with code "MISSING_STEP_REQUIRED_DOCUMENT" and field "proposal_document"
      3. Assert blocker.severity is "warning" (not "blocking")
      4. Assert canAdvance is true (no critical blockers)
    Expected Result: canAdvance=true, blocker is warning not blocking
    Evidence: .sisyphus/evidence/task-2-draft-blocker-warning.json

  Scenario: No proposal produces blocking blocker
    Tool: Bash (curl)
    Preconditions: Service case at step_03 with no proposal artifact
    Steps:
      1. GET /api/service-cases/<sc_id>/workflow
      2. Find blocker with field "proposal_document"
      3. Assert blocker.severity is "blocking"
      4. Assert canAdvance is false
    Expected Result: canAdvance=false, blocker is blocking
    Evidence: .sisyphus/evidence/task-2-no-proposal-blocking.json
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `fix(backend): relax proposal blocker to allow draft status for step 3 advance`
  - Files: `cermont-workflow-gate.service.ts`
  - Pre-commit: `npm run typecheck && npm run lint`

---

- [ ] 3. Add serviceCaseId to proposal creation flow (schema + controller + frontend)

  **What to do**:
  - In `packages/shared-types` find `CreateProposalInputSchema` and add `serviceCaseId: z.string().optional()`
  - In `backend/src/modules/proposal/proposal.controller.ts` `createProposal`:
    - Extract `serviceCaseId` from `req.body` and pass to service
  - In `backend/src/modules/proposal/proposal.service.ts` `createProposal`:
    - Accept `serviceCaseId?: string` parameter
    - After saving proposal, if serviceCaseId is provided:
      - Import ServiceCase model
      - Update `ServiceCase.findByIdAndUpdate(serviceCaseId, { "artifacts.proposal": { id: proposal._id, status: proposal.status, updatedAt: new Date() } })`
      - Call `tryAutoAdvanceServiceCase(serviceCaseId, "proposal")` (import from service-case.service)
  - In `frontend/src/modules/proposals/queries.ts` `useCreateProposal`:
    - After successful mutation, also invalidate `SERVICE_CASE_KEYS.all` if serviceCaseId was in the input
  - In `frontend/src/app/(dashboard)/proposals/new/page.tsx`:
    - Pass `serviceCaseId` in the mutation payload when available from searchParams

  **Must NOT do**:
  - Do not create new API endpoints
  - Do not change the proposal creation for standalone (non-service-case) flow
  - Do not add new database collections

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Schema + controller wiring, straightforward
  - **Skills**: [`zod`, `nodejs-backend-patterns`]
    - `zod`: Schema modification
    - `nodejs-backend-patterns`: Controller/service pattern

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/shared-types/src/schemas/` - Find CreateProposalInputSchema to add field
  - `backend/src/modules/proposal/proposal.controller.ts` - Controller pattern for extracting body params

  **API/Type References**:
  - `frontend/src/modules/proposals/queries.ts:useCreateProposal` - Frontend mutation to modify
  - `frontend/src/app/(dashboard)/proposals/new/page.tsx` - Page that creates proposals

  **WHY Each Reference Matters**:
  - Schema change is the contract that enables serviceCaseId flow end-to-end
  - Controller must forward the field to the service
  - Frontend must include serviceCaseId in the POST body

  **Acceptance Criteria**:
  - [ ] CreateProposalInputSchema includes optional serviceCaseId
  - [ ] Controller passes serviceCaseId to service
  - [ ] Service links proposal to service case when serviceCaseId provided
  - [ ] Frontend sends serviceCaseId in POST body when available
  - [ ] `npm run typecheck` passes
  - [ ] `npm run lint` passes

  **QA Scenarios**:

  ```
  Scenario: serviceCaseId flows through schema validation
    Tool: Bash (curl)
    Preconditions: Valid auth token
    Steps:
      1. POST /api/proposals with serviceCaseId field included
      2. Assert response success: true
      3. Verify the proposal was created with the serviceCaseId context
    Expected Result: Proposal created within service case context
    Evidence: .sisyphus/evidence/task-3-schema-validation.json

  Scenario: Standalone proposal without serviceCaseId still works
    Tool: Bash (curl)
    Preconditions: Valid auth token
    Steps:
      1. POST /api/proposals WITHOUT serviceCaseId field
      2. Assert response success: true
      3. Assert no service case was modified
    Expected Result: Backward compatible standalone creation
    Evidence: .sisyphus/evidence/task-3-standalone-compat.json
  ```

  **Commit**: YES (groups with Tasks 1, 2)
  - Message: `feat: add serviceCaseId to proposal creation schema and flow`
  - Files: `shared-types schema`, `proposal.controller.ts`, `proposal.service.ts`, `queries.ts`, `page.tsx`
  - Pre-commit: `npm run typecheck && npm run lint`

---

## Wave 2 — Frontend Fixes

- [ ] 4. Frontend cache invalidation after proposal creation

  **What to do**:
  - In `frontend/src/modules/proposals/queries.ts` `useCreateProposal`:
    - Modify `onSuccess` to also invalidate service case queries:
      ```ts
      onSuccess: (data, variables) => {
        qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
        if (variables.serviceCaseId) {
          qc.invalidateQueries({ queryKey: SERVICE_CASE_KEYS.detail(variables.serviceCaseId) });
          qc.invalidateQueries({ queryKey: SERVICE_CASE_KEYS.list() });
        }
      },
      ```
  - Import `SERVICE_CASE_KEYS` from `@/modules/service-cases/queries`
  - Ensure the `CreateProposalInput` type in the mutation accepts `serviceCaseId`

  **Must NOT do**:
  - Do not change other proposal mutations
  - Do not add new query keys

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, small change to onSuccess callback
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 1, 3

  **References**:
  - `frontend/src/modules/proposals/queries.ts:useCreateProposal` - The mutation to modify
  - `frontend/src/modules/service-cases/queries.ts:SERVICE_CASE_KEYS` - Keys to import

  **Acceptance Criteria**:
  - [ ] useCreateProposal invalidates SERVICE_CASE_KEYS.detail when serviceCaseId present
  - [ ] Cockpit auto-refreshes after proposal creation
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Service case cockpit refreshes after proposal creation
    Tool: Playwright
    Preconditions: Service case at step_03 open in browser
    Steps:
      1. Navigate to /service-cases/<sc_id>
      2. Note currentStepCode displayed
      3. Click next action to create proposal
      4. Fill and submit proposal form with serviceCaseId
      5. Wait for redirect back to service case
      6. Assert currentStepCode has changed from step_03
    Expected Result: Cockpit shows updated step after proposal creation
    Evidence: .sisyphus/evidence/task-4-cockpit-refresh.png
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `fix(frontend): invalidate service case cache after proposal creation`
  - Files: `queries.ts`
  - Pre-commit: `npm run typecheck && npm run lint`

---

- [ ] 5. Proposal form data inheritance from previous steps

  **What to do**:
  - In `frontend/src/app/(dashboard)/proposals/new/page.tsx` `NewProposalContent`:
    - Already calls `useServiceCaseContext("step_03_proposal", serviceCaseId)`
    - Currently only applies `inheritedClientName`
    - Extend to also apply:
      - `location` → new field or notes
      - `generalScope` → append to notes or title
      - `priority` → display as badge
      - `requestedDate` → set as `validUntil` default (30 days from requested)
    - Use `setValue()` for each inherited field that has a matching form field
  - In `frontend/src/app/(dashboard)/proposals/new/proposal-form-schema.ts`:
    - Add optional `location` and `scope` fields if not present
  - Display inherited fields in a read-only summary above the form (already done by `InheritedFieldGroup`)

  **Must NOT do**:
  - Do not create new form components
  - Do not change the proposal creation API contract
  - Do not make inherited fields editable (they are read-only from previous steps)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Frontend form pre-fill logic, straightforward
  - **Skills**: [`react-hook-form`]
    - `react-hook-form`: Form default values and setValue patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Task 7
  - **Blocked By**: Task 3

  **References**:
  - `frontend/src/app/(dashboard)/proposals/new/page.tsx:NewProposalContent` - The page to modify
  - `frontend/src/modules/service-cases/hooks/useServiceCaseContext.ts` - Hook that returns inheritedFields
  - `frontend/src/modules/workflow/InheritedFieldGroup.tsx` - Component showing inherited data

  **Acceptance Criteria**:
  - [ ] Proposal form pre-fills clientName from inherited fields
  - [ ] Location is displayed in inherited fields summary
  - [ ] General scope is available in form context
  - [ ] Inherited fields show source step label
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Proposal form pre-fills data from service case
    Tool: Playwright
    Preconditions: Service case with work request and site visit completed
    Steps:
      1. Navigate to /proposals/new?serviceCaseId=<sc_id>
      2. Wait for form to load
      3. Assert clientName input has value from work request
      4. Assert inherited fields section shows location, scope, priority
      5. Assert source step labels are visible
    Expected Result: Form pre-filled with inherited data
    Evidence: .sisyphus/evidence/task-5-form-prefill.png
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(frontend): inherit data from previous steps in proposal form`
  - Files: `page.tsx`, `proposal-form-schema.ts`
  - Pre-commit: `npm run typecheck && npm run lint`

---

- [ ] 6. Step context hook integration for all form fields

  **What to do**:
  - In `frontend/src/modules/service-cases/hooks/useServiceCaseContext.ts`:
    - Ensure the hook returns all inherited fields from the API
    - Add TypeScript interface for the returned fields
    - Export `InheritedFieldType` for use in form components
  - In `frontend/src/app/(dashboard)/proposals/new/page.tsx`:
    - Destructure all relevant fields from `inheritedFields`
    - Map each field to the appropriate form input
    - Show a visual indicator when a field is pre-filled from inheritance
  - Verify the step context API endpoint returns complete data:
    - Check `GET /api/service-cases/:id/step-context?stepCode=step_03_proposal` response
    - Ensure `inheritedFields` array includes all expected fields

  **Must NOT do**:
  - Do not modify the backend step context service
  - Do not add new API endpoints
  - Do not change the InheritedFieldGroup component

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Hook type definition and form field mapping
  - **Skills**: [`react-hook-form`]
    - `react-hook-form`: Form integration patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 7
  - **Blocked By**: Task 3

  **References**:
  - `frontend/src/modules/service-cases/hooks/useServiceCaseContext.ts` - Hook to verify/enhance
  - `backend/src/services/service-case-step-context.service.ts:addFieldsForStep03` - Backend field resolver for step 3

  **Acceptance Criteria**:
  - [ ] useServiceCaseContext returns typed InheritedField[] with all step 3 fields
  - [ ] Form shows visual indicator for pre-filled fields
  - [ ] All inherited fields are accessible in form component
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Step context API returns complete inherited fields
    Tool: Bash (curl)
    Preconditions: Service case at step_03 with work request and site visit
    Steps:
      1. GET /api/service-cases/<sc_id>/step-context?stepCode=step_03_proposal
      2. Assert response has inheritedFields array
      3. Assert inheritedFields includes clientId, clientName, location, generalScope, priority
      4. Assert each field has sourceStepCode and sourceStepLabel
    Expected Result: Complete inherited fields from steps 1 and 2
    Evidence: .sisyphus/evidence/task-6-step-context-complete.json
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(frontend): complete step context hook integration for proposal form`
  - Files: `useServiceCaseContext.ts`, `page.tsx`
  - Pre-commit: `npm run typecheck && npm run lint`

---

