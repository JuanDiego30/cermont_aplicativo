# CERMONT IMPLEMENTATION MASTERPLAN v7.0

## TL;DR
> **Core Objective**: Convert all audit findings into an actionable, verified implementation plan organized in 5 phases. Maintain `npm run verify` green at all times. Raise React Doctor from 88/100 to >= 95/100. Close all ❌ and ⚠️ audit items.
> 
> **Deliverables**:
> - Phase 1: Dead code removal, structural cleanup, 6 structural fixes
> - Phase 2: React quality refactors (useReducer, component splitting, accessibility)
> - Phase 3: 8 product features (dashboard KPIs, costs, billing, reports PDF, offline sync, fleet, portal, cronograma)
> - Phase 4: 2 critical E2E tests (offline execution, 14-step workflow)
> - Phase 5: Tech debt reduction (DTO migration, Spanish tokens, evidence metadata)
> 
> **Estimated Effort**: ~28 days (4 sprints)
> **Parallel Execution**: YES - Phases 1, 2, 5 can run in parallel worktrees; Phases 3, 4 depend on Phase 1
> **Critical Path**: Phase 1 → Phase 3 → Phase 4 → Deploy

---

## Context

### Original Request
Convert complete audit findings of the Cermont monorepo into an actionable Implementation Masterplan v7.0 with verified acceptance criteria per task, respecting REGLAS_DESARROLLO_CERMONT.md.

### Interview Summary
**Research Confirmed**:
- KpiCard.tsx dead code: `frontend/src/components/common/KpiCard.tsx` (102 lines) — zero imports. Two active KPICard variants exist at `components/ui/KPICard.tsx` and `core/ui/KPICard.tsx`.
- Planning-packet/new/: 9 files exist — need audit against `modules/planning/` for duplication.
- ERP connectors /new/ page: Directory does NOT exist (confirmed P1-L).
- PlanningWizard.tsx: 312 lines, 15 useState calls (user reported 16 — the `responsibles` has no setter usage functionally).
- ResourcesStep.tsx: 526 lines (user reported 489 — actual is larger).
- Dashboard backend: 6 endpoints exist (/summary, /operational-kpis, /sla-risk, /next-actions, /blockers, /recent-activity). Frontend `useDashboardSummary.ts` already consumes /dashboard/summary.
- Costs frontend: 13 UI files, backend: 5 service files. CostComparisonChart.tsx exists.
- Billing: frontend has invoices/, ses/ sub-routes plus page.tsx.
- Fleet UI: 5 UI files (PhotoGallery, ReadinessBadge, MaintenanceTab, NewVehicleDrawer, VehicleAssignmentPanel, VehicleCard, VehicleDocumentsTab).
- pdf-lib: Present in backend/package.json at 1.17.1.
- Evidence gallery: Exists at frontend/src/modules/evidences/ with hooks/, model/, ui/.
- Quality baseline: 2850 Spanish tokens, 45 local-api-dto, 639 weak-token-u, 85 weak-token-a.
- Portal routes: invoices, orders, proposals, service-cases, signatures — all have pages.

### Research Findings
- Branch: `plan/contract-first-masterplan-v6` with many modified/untracked files.
- Backend: Express 5.2.1 feature-module architecture. Dashboard, costs, billing, planning endpoints exist.
- Frontend: Next.js 16 App Router, Feature-Sliced Design, centralized navigation.
- Stack: Next.js 16.2.1, React 19.2.4, Tailwind CSS 4.2.2, TanStack Query 5.95.2, Zustand 5.0.12, Zod 4.3.6, Framer Motion 12.38.0, Recharts 3.8.1, Radix UI.
- Testing: Vitest 4.0.18, Playwright 1.58.2, Biome 2.4.11.
- Security: proxy.ts perimeter, JWT auth (no middleware.ts), Helmet, CORS, rate limiting, sanitization.
- Grid independiente: frontend → proxy.ts → Next.js API routes → Express backend.
- Modules: 40+ backend modules, 80+ frontend pages.

### Self-Review Gap Analysis
**Auto-Resolved** (minor gaps fixed without user input):
- KpiCard.tsx dead code → DELETE (zero imports confirmed via grep).
- PlanningWizard useState count correct at 15 (not 16 as reported — `responsibles` has no setter usage).
- ResourcesStep line count corrected to 526 (user reported 489 — actual is larger, reflecting recent changes).
- Planning-packet/new/ has 9 files (user reported 7 — PlanningPacketSignatures and CaseSelector are additional).

**Defaults Applied** (override if needed):
- erp-connectors/new/ → Create redirect page to /admin/erp-connectors with "Próximamente" message.
- PlanningWizard useReducer shape → Consolidated state object covering all 15 fields with step-based validation.
- ResourcesStep split → 5 sub-components by tab: MaterialsTab, ToolsTab, EquipmentTab, SafetyElementsTab, WorkersTab.
- planning-packet/new/ audit → If features are in development (likely from git status showing modified files), move to `_deprecated/` with issue reference rather than deleting.

**Decisions Needed**:
- planning-packet/new/ vs modules/planning/ — Are these files actively being developed or is the modules/planning/ version the canonical one? The git status shows `planning-packet/new/` files as tracked (not untracked), suggesting they're the active feature.

---

## Work Objectives

### Core Objective
Implement all audit findings across 5 phases to achieve production readiness (GA) for the Cermont platform.

### Concrete Deliverables
- Phase 1: 6 structural cleanup tasks completed, React Doctor baseline confirmed at >=88/100
- Phase 2: 5 React quality refactors, React Doctor >= 95/100
- Phase 3: 8 product features with contracts, backend, frontend, and tests
- Phase 4: 2 E2E tests (offline execution + full 14-step workflow) passing in CI
- Phase 5: 4 tech debt reduction tasks, baselines reduced

### Definition of Done
- [ ] `npm run verify` passes on every commit
- [ ] `npx react-doctor@latest --verbose` score >= 95/100
- [ ] All 2 E2E tests pass (`npx playwright test --project=chromium`)
- [ ] All 12 P1 audit items closed
- [ ] Both P0 blockers (C1, C2) resolved
- [ ] Quality baselines reduced (Spanish tokens < 2000, local-api-dto < 30, weak-token-u < 500)
- [ ] Deploy verdict: ✅ GO

### Must Have
- Contract-first for all new/modified endpoints
- Zero `any`, `unknown`, `null`, `undefined` introduced
- Every component < 200 lines for new code
- useReducer for state > 5 fields
- ARIA labels on all interactive elements
- Loading/Error/Empty/Offline states on all pages
- E2E tests before deploy

### Must NOT Have (Guardrails)
- No NestJS, Prisma, PostgreSQL, Auth.js, pnpm/yarn
- No `middleware.ts` — proxy.ts is the security perimeter
- No `// @ts-ignore`, `@ts-expect-error`, `as any`
- No mock data in production code
- No hardcoded roles — use @cermont/domain
- No duplicate components — reuse existing UI library
- No changes to package.json/package-lock.json without explicit approval
- No console.log/debugger/alert in production
- No deletion of existing functionality without replacement
- No modifications to doctor.config.json or baseline.json without actually reducing counts

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES — Vitest, Playwright, Biome
- **Automated tests**: TDD for Phase 3 features, Tests-after for Phases 1-2, E2E for Phase 4
- **Framework**: Vitest 4.0.18 (unit), Playwright 1.58.2 (E2E), Biome 2.4.11 (lint)
- **React Doctor**: Verified after each phase

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **Backend/API**: Use Bash (curl) — Send requests, assert status + response fields
- **Library/Module**: Use Bash (bun/node REPL) — Import, call functions, compare output
- **E2E**: Use Playwright full flow tests

---

## Execution Strategy

### Parallel Execution Waves

```txt
Phase 1 (Wave 1 — Start Immediately):
├── Task 1.1: Delete KpiCard.tsx dead code [quick]
├── Task 1.2: Audit planning-packet/new/ vs modules/planning/ [quick]
├── Task 1.3: Move stepHeaders to module scope in PlanningWizard [quick]
├── Task 1.4: Clean unused exports in flow-categories.ts [quick]
├── Task 1.5: Audit planning/ui/steps/shared-types.ts [quick]
└── Task 1.6: Create erp-connectors/new/page.tsx [quick]

Phase 2 (Wave 2 — Parallel with Phase 1, after shared-types if needed):
├── Task 2.1: Migrate PlanningWizard 15 useState → useReducer [deep]
├── Task 2.2: Split ResourcesStep into 5 sub-components [deep]
├── Task 2.3: Add ARIA labels to ResourcesStep inputs [quick]
├── Task 2.4: Fix KPICard accessibility (components/ui/ and core/ui/) [quick]
└── Task 2.5: Verify stepHeaders already moved (verify TASK-1.3) [quick]

Phase 3 (Wave 3 — After Phase 1, MAX PARALLEL):
├── Task 3.1: Connect Dashboard KPIs to backend [unspecified-high]
├── Task 3.2: Costs Dashboard comparativo [unspecified-high]
├── Task 3.3: Billing Timeline SES→Invoice→Payment [unspecified-high]
├── Task 3.4: Reports PDF post-ejecución [deep]
├── Task 3.5: Offline Sync Status UI [unspecified-high]
├── Task 3.6: Fleet UI checkout/checkin completo [unspecified-high]
├── Task 3.7: Portal Cliente verify all routes [unspecified-high]
└── Task 3.8: Planning Wizard cronograma visual [visual-engineering]

Phase 4 (Wave 4 — After Phase 3):
├── Task 4.1: E2E offline execution flow [deep]
└── Task 4.2: E2E full 14-step workflow [deep]

Phase 5 (Wave 5 — Can overlap with Phase 2):
├── Task 5.1: Migrate 10 most critical local DTOs to shared-types [deep]
├── Task 5.2: Migrate Spanish symbols in 5 high-density modules [unspecified-high]
├── Task 5.3: Evidence gallery metadata enrichment [unspecified-high]
└── Task 5.4: Update quality baselines [quick]

Verification Wave (FINAL — After ALL phases complete):
├── F1: Plan Compliance Audit [oracle]
├── F2: Code Quality Review + React Doctor [unspecified-high]
├── F3: Full QA execution [unspecified-high + playwright]
└── F4: Scope Fidelity Check [deep]
```

### Dependency Matrix

- **Phase 1 tasks**: Independent, can all run in parallel (Wave 1)
- **Phase 2 tasks 2.1, 2.2**: Depend on understanding PlanningWizard/ResourcesStep current state (no Phase 1 dependency), can run in Wave 1
- **Phase 3 tasks**: Blocked by Phase 1.3 (navigation cleanup) and understanding of current module state
- **Phase 4 tasks**: Blocked by Phase 3 features being implemented (E2E tests need real features)
- **Phase 5 tasks**: Independent, can run in parallel with Phase 2

**Critical Path**: Phase 1 cleanup → Phase 3 features → Phase 4 E2E → Verification → Deploy

---

## TODOs

- [ ] 1.1. Eliminar KpiCard.tsx de components/common/ (P1-C)

  **What to do**:
  - Delete `frontend/src/components/common/KpiCard.tsx` (102 lines, confirmed zero imports)
  - Verify no remaining references via grep for `from.*common/KpiCard` or `KpiCard` in any index/barrel file
  - Check if `components/common/index.ts` re-exports it — remove that re-export if present

  **Must NOT do**:
  - Do NOT delete the active KPICard variants at `components/ui/KPICard.tsx` or `core/ui/KPICard.tsx`
  - Do NOT modify the active variants

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] (simple file deletion)
  - **Parallelization**: YES, can run with all Phase 1 tasks
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/components/common/KpiCard.tsx` — Target file to delete
  - `frontend/src/components/common/` — Check for index.ts barrel export

  **Acceptance Criteria**:
  - [ ] `frontend/src/components/common/KpiCard.tsx` file deleted
  - [ ] No imports of `KpiCard` from `@/components/common/KpiCard` remain
  - [ ] `npm run verify` passes (no broken imports)
  - [ ] `npx react-doctor@latest` score >= 88/100

  **QA Scenarios**:
  ```txt
  Scenario: Verify KpiCard.tsx is gone with no broken imports
    Tool: Bash
    Steps:
      1. Test-Path "frontend/src/components/common/KpiCard.tsx" → False
      2. grep -r "from.*common/KpiCard" frontend/src/ → no matches
      3. If barrel file exists at components/common/index.ts, grep for "KpiCard" → no matches
    Expected Result: File deleted, no imports reference it
    Evidence: .sisyphus/evidence/task-1.1-kpicard-removed.txt

  Scenario: Verify npm run verify still green
    Tool: Bash
    Steps:
      1. npm run verify
    Expected Result: Exit code 0, all checks pass
    Evidence: .sisyphus/evidence/task-1.1-verify-green.txt
  ```

  **Commit**: YES
  - Message: `cleanup(frontend): remove dead KpiCard.tsx from components/common`
  - Files: `frontend/src/components/common/KpiCard.tsx`

- [ ] 1.2. Auditar y decidir sobre 9 archivos planning-packet/new/ (P1-D)

  **What to do**:
  - Compare each file in `frontend/src/app/(dashboard)/planning-packet/new/` against equivalent in `frontend/src/modules/planning/`
  - Files to audit: CaseSelector.tsx, constants.ts, page.tsx, PlanningPacketBasicInfo.tsx, PlanningPacketResources.tsx, PlanningPacketSafety.tsx, PlanningPacketSchedule.tsx, PlanningPacketSignatures.tsx, shared-components.tsx
  - For each file determine: (a) dead code, (b) duplicate of modules/planning/, or (c) active feature extension
  - If dead code → DELETE
  - If duplicate → DELETE, ensure modules/planning/ version is canonical
  - If active feature being developed → MOVE to `_deprecated/planning-packet/` with GitHub issue reference
  - Document findings in a short audit report

  **Must NOT do**:
  - Do not delete files that are still actively imported by navigation or routes
  - Do not delete without checking git history for recent commits

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] (audit + file operations)
  - **Parallelization**: YES, with all Phase 1 tasks
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/app/(dashboard)/planning-packet/new/` — 9 files to audit
  - `frontend/src/modules/planning/` — Canonical planning module to compare against
  - `frontend/src/modules/core/navigation.ts` — Check if planning-packet/new/ is in navigation

  **Acceptance Criteria**:
  - [ ] Audit report generated in `.sisyphus/evidence/planning-packet-audit.md`
  - [ ] All files classified as dead/duplicate/active
  - [ ] Dead files deleted, duplicates consolidated into modules/planning/
  - [ ] Active development files moved to `_deprecated/` with issue reference
  - [ ] `npm run verify` passes
  - [ ] No broken navigation routes

  **QA Scenarios**:
  ```txt
  Scenario: Verify no planning-packet/new/ files remain in original location
    Tool: Bash
    Steps:
      1. Get-ChildItem "frontend/src/app/(dashboard)/planning-packet/new/" → empty or only _deprecated/ remains
    Expected Result: Files resolved (deleted or moved)
    Evidence: .sisyphus/evidence/task-1.2-planning-packet-cleaned.txt

  Scenario: Verify navigation still works
    Tool: Bash
    Steps:
      1. grep -r "planning-packet/new" frontend/src/modules/core/navigation.ts
    Expected Result: Route updated to point to canonical planning module or removed if dead
    Evidence: .sisyphus/evidence/task-1.2-navigation-clean.txt
  ```

  **Commit**: YES (groups with TASK-1.3, 1.4, 1.5)
  - Message: `cleanup(planning): consolidate planning-packet/new/ with modules/planning/`
  - Files: (as determined by audit)

- [ ] 1.3. Mover stepHeaders al module scope en PlanningWizard.tsx (P2-E)

  **What to do**:
  - Move `const stepHeaders` (currently at line 141 inside component) to **module scope** outside the function
  - This prevents array rebuild on each render
  - Use `as const` for type safety

  **Must NOT do**:
  - Do not change the step headers content or order
  - Do not refactor other parts of PlanningWizard in this task

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Parallelization**: YES, with all Phase 1 tasks
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/planning/ui/PlanningWizard.tsx:141-147` — `stepHeaders` to move

  **Acceptance Criteria**:
  - [ ] `stepHeaders` defined outside component function
  - [ ] `npm run verify` passes
  - [ ] No change in component behavior

  **QA Scenarios**:
  ```txt
  Scenario: Verify stepHeaders moved to module scope
    Tool: Bash
    Steps:
      1. grep "const stepHeaders" frontend/src/modules/planning/ui/PlanningWizard.tsx
      2. Verify it's outside the export function PlanningWizard block
    Expected Result: stepHeaders defined at module level (before line 33)
    Evidence: .sisyphus/evidence/task-1.3-stepheaders-moved.txt
  ```

  **Commit**: YES (groups with 1.2, 1.4, 1.5)
  - Message: `perf(planning): move stepHeaders to module scope in PlanningWizard`
  - Files: `frontend/src/modules/planning/ui/PlanningWizard.tsx`

- [ ] 1.4. Limpiar exports no usados en flow-categories.ts (P2-C)

  **What to do**:
  - Read `frontend/src/constants/flow-categories.ts`
  - Check which of the 7 exports (CATEGORY_STYLES, STATUS_STYLES, and their subtypes) are actually imported elsewhere
  - Remove unused exports and their definitions
  - Rename remaining to match naming conventions if needed

  **Must NOT do**:
  - Do not remove exports that ARE used by other files
  - Do not change the shape of used exports

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Parallelization**: YES, with all Phase 1 tasks
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/constants/flow-categories.ts:42,76` — CATEGORY_STYLES, STATUS_STYLES exports

  **Acceptance Criteria**:
  - [ ] Unused exports removed
  - [ ] `npm run verify` passes
  - [ ] All used exports still importable

  **QA Scenarios**:
  ```txt
  Scenario: Verify only used exports remain
    Tool: Bash
    Steps:
      1. For each export in flow-categories.ts, grep for its import across frontend/src/
      2. Verify used exports still present, unused ones removed
    Expected Result: Every remaining export has at least one consumer
    Evidence: .sisyphus/evidence/task-1.4-flow-categories-cleaned.txt
  ```

  **Commit**: YES (groups with 1.2, 1.3, 1.5)
  - Message: `cleanup(constants): remove unused exports from flow-categories.ts`
  - Files: `frontend/src/constants/flow-categories.ts`

- [ ] 1.5. Auditar planning/ui/steps/shared-types.ts (P2-D)

  **What to do**:
  - Read `frontend/src/modules/planning/ui/steps/shared-types.ts`
  - Check if its exports are used anywhere
  - If all exports unused → DELETE file
  - If some used → keep only used exports

  **Must NOT do**:
  - Do not remove if types are used by other files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Parallelization**: YES, with all Phase 1 tasks
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/planning/ui/steps/shared-types.ts` — File to audit

  **Acceptance Criteria**:
  - [ ] File cleaned (deleted or trimmed to used exports only)
  - [ ] `npm run verify` passes

  **QA Scenarios**:
  ```txt
  Scenario: Verify no broken imports after cleanup
    Tool: Bash
    Steps:
      1. npm run verify
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-1.5-shared-types-cleaned.txt
  ```

  **Commit**: YES (groups with 1.2, 1.3, 1.4)
  - Message: `cleanup(planning): audit planning/ui/steps/shared-types.ts unused exports`
  - Files: `frontend/src/modules/planning/ui/steps/shared-types.ts`

- [ ] 1.6. Crear page.tsx en /admin/erp-connectors/new/ (P1-L)

  **What to do**:
  - Create `frontend/src/app/(dashboard)/admin/erp-connectors/new/page.tsx`
  - Implement as a simple redirect-to-list page or "Coming Soon" placeholder with:
    - Cermont-styled card layout
    - Icon + title "Nuevo Conector ERP"
    - Message "Módulo en construcción — próximamente disponible"
    - Link/button back to `/admin/erp-connectors`
  - Use existing shared UI components (Card, Button from components/common/)

  **Must NOT do**:
  - Do not build a full form — it's a placeholder
  - Do not add to navigation if navigation doesn't reference it

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] (simple page creation)
  - **Parallelization**: YES, with all Phase 1 tasks
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx` — Parent page for navigation pattern
  - `frontend/src/components/common/Button.tsx` — Reusable button component
  - `frontend/src/components/common/Card.tsx` — Reusable card component

  **Acceptance Criteria**:
  - [ ] `frontend/src/app/(dashboard)/admin/erp-connectors/new/page.tsx` created
  - [ ] Page renders without error
  - [ ] Link back to parent works
  - [ ] `npm run verify` passes

  **QA Scenarios**:
  ```txt
  Scenario: Verify page renders
    Tool: Bash (or Playwright)
    Steps:
      1. Navigate to /admin/erp-connectors/new
      2. Assert page title contains "ERP" or "Conector"
      3. Assert back link points to /admin/erp-connectors
    Expected Result: Page renders with placeholder content
    Evidence: .sisyphus/evidence/task-1.6-erp-connector-new-page.txt
  ```

  **Commit**: YES
  - Message: `feat(admin): add placeholder page for /admin/erp-connectors/new`
  - Files: `frontend/src/app/(dashboard)/admin/erp-connectors/new/page.tsx`

---

## FASE 2 — Refactors de calidad React (Sprint 1-2, ~5 días)

- [ ] 2.1. Migrar PlanningWizard 15 useState → useReducer (P1-A)

  **What to do**:
  - Create a consolidated state interface and reducer for PlanningWizard
  - Current 15 useState calls:
    ```
    currentStep (StepKey), place (string), plannedDate (string), businessUnit (PlanningBusinessUnit),
    responsibleName (string), scope (string), materials (PlanningResourceLine[]), tools (PlanningTool[]),
    equipment (PlanningEquipment[]), safetyElements (PlanningResourceLine[]), workerReqs (WorkerRequirements),
    astRequired (boolean), ptwRequired (boolean), planningNotes (string), certifications (RequiredCertification[])
    ```
  - Design useReducer state shape:
    ```typescript
    interface PlanningWizardState {
      currentStep: StepKey;
      form: {
        place: string;
        plannedDate: string;
        businessUnit: PlanningBusinessUnit;
        responsibleName: string;
        scope: string;
      };
      resources: {
        materials: PlanningResourceLine[];
        tools: PlanningTool[];
        equipment: PlanningEquipment[];
        safetyElements: PlanningResourceLine[];
        workerRequirements: WorkerRequirements;
      };
      safety: {
        astRequired: boolean;
        ptwRequired: boolean;
        planningNotes: string;
      };
      certifications: RequiredCertification[];
    }
    ```
  - Define action types: SET_FIELD, SET_RESOURCES, SET_SAFETY, SET_CERTIFICATIONS, SET_STEP, RESET
  - Refactor component to use dispatch instead of individual setters
  - Keep `responsibles` as a separate useState (computed from getDefaultResponsibles, no setter usage)
  - Create reducer in separate file: `frontend/src/modules/planning/ui/planning-wizard.reducer.ts`

  **Must NOT do**:
  - Do not change component behavior or submission logic
  - Do not change step validation logic (`getStepError`)
  - Do not change prop interfaces of child step components

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  - **Parallelization**: YES, can run alongside Phase 1 cleanup in separate worktree
  - **Blocks**: TASK-2.5
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/planning/ui/PlanningWizard.tsx` — Full component to refactor
  - Pattern: React useReducer — combine related state into single object with typed actions

  **Acceptance Criteria**:
  - [ ] Reducer file created at `planning-wizard.reducer.ts`
  - [ ] All 15 useState replaced with single useReducer
  - [ ] All existing functionality preserved (step navigation, validation, save)
  - [ ] `npm run verify` passes
  - [ ] `npx react-doctor@latest` score >= 88/100 (no regression)
  - [ ] Component still renders and operates identically

  **QA Scenarios**:
  ```txt
  Scenario: Verify PlanningWizard still works after useReducer migration
    Tool: Playwright
    Preconditions: Work order exists in seed data
    Steps:
      1. Navigate to /planning/{orderId}
      2. Step 1: Fill place, date, business unit, responsible name, scope
      3. Click Siguiente → Step 2 visible
      4. Step 2: Add a material, verify it appears in list
      5. Click Anterior → Step 1 with data preserved
      6. Complete all 5 steps
      7. Click Guardar Planeación
    Expected Result: Full wizard flow works identically to before refactor
    Evidence: .sisyphus/evidence/task-2.1-wizard-functional.txt

  Scenario: Verify React Doctor no regression
    Tool: Bash
    Steps:
      1. npx react-doctor@latest --verbose
    Expected Result: Score >= 88/100, no new issues
    Evidence: .sisyphus/evidence/task-2.1-react-doctor.txt
  ```

  **Commit**: YES
  - Message: `refactor(planning): migrate PlanningWizard 15 useState to useReducer`
  - Files: `frontend/src/modules/planning/ui/PlanningWizard.tsx`, `frontend/src/modules/planning/ui/planning-wizard.reducer.ts`

- [ ] 2.2. Dividir ResourcesStep en 5 sub-componentes (P1-B)

  **What to do**:
  - Split `frontend/src/modules/planning/ui/steps/ResourcesStep.tsx` (526 lines) into 5 sub-components organized by tab:
    1. **MaterialsTab** — Materials/resources lines (CRUD list)
    2. **ToolsTab** — Tools selector/manager
    3. **EquipmentTab** — Equipment selector/manager
    4. **SafetyElementsTab** — Safety elements checklist
    5. **WorkersTab** — Worker requirements (electricistas, tecnicos, instrumentistas, obreros)
  - Each sub-component gets its own file in `frontend/src/modules/planning/ui/steps/`
  - Define Props interfaces per sub-component
  - ResourcesStep becomes a thin orchestration component that renders the active tab
  - No business logic changes

  **Props Interfaces**:
  ```typescript
  // MaterialsTab props
  interface MaterialsTabProps {
    materials: PlanningResourceLine[];
    onChange: (materials: PlanningResourceLine[]) => void;
  }

  // ToolsTab props
  interface ToolsTabProps {
    tools: PlanningTool[];
    onChange: (tools: PlanningTool[]) => void;
  }

  // EquipmentTab props
  interface EquipmentTabProps {
    equipment: PlanningEquipment[];
    onChange: (equipment: PlanningEquipment[]) => void;
  }

  // SafetyElementsTab props
  interface SafetyElementsTabProps {
    safetyElements: PlanningResourceLine[];
    onChange: (safetyElements: PlanningResourceLine[]) => void;
  }

  // WorkersTab props
  interface WorkersTabProps {
    workerRequirements: WorkerRequirements;
    onChange: (reqs: WorkerRequirements) => void;
  }
  ```

  **Must NOT do**:
  - Do not change business logic or data handling
  - Do not add new features during split
  - Do not change the parent component's interface (`ResourcesStepProps`)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - **Parallelization**: YES, can run alongside Phase 1
  - **Blocks**: TASK-2.3
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/planning/ui/steps/ResourcesStep.tsx` — Target to split
  - `frontend/src/modules/planning/ui/PlanningWizard.tsx` — Consumer of ResourcesStep

  **Acceptance Criteria**:
  - [ ] 5 sub-component files created
  - [ ] Each file < 200 lines
  - [ ] ResourcesStep.tsx reduced to < 100 lines (tab orchestration only)
  - [ ] `npm run verify` passes
  - [ ] `npx react-doctor@latest` score >= 88/100
  - [ ] Component behavior unchanged

  **QA Scenarios**:
  ```txt
  Scenario: Verify ResourcesStep still works after split
    Tool: Playwright
    Steps:
      1. Navigate to planning wizard step 2 (resources)
      2. Click each tab — verify content renders correctly
      3. Add a material, verify it appears
      4. Switch tabs, switch back — verify data preserved
    Expected Result: All tab operations work identically to before
    Evidence: .sisyphus/evidence/task-2.2-resources-step-split.txt
  ```

  **Commit**: YES
  - Message: `refactor(planning): split ResourcesStep into 5 sub-components`
  - Files: (5 new files + ResourcesStep.tsx)

- [ ] 2.3. Agregar aria-labels a inputs numéricos en ResourcesStep (P2-A)

  **What to do**:
  - Identify numeric inputs at lines 421, 484, 499, 512 in ResourcesStep.tsx (line numbers may shift after TASK-2.2 split)
  - After the split, locate the numeric inputs in WorkersTab.tsx and MaterialsTab.tsx
  - Add descriptive `aria-label` attributes:
    - Worker count for `electricistas`: `aria-label="Cantidad de electricistas requeridos"`
    - Worker count for `tecnicos`: `aria-label="Cantidad de técnicos de telecomunicación requeridos"`
    - Worker count for `instrumentistas`: `aria-label="Cantidad de instrumentistas requeridos"`
    - Worker count for `obreros`: `aria-label="Cantidad de obreros requeridos"`
    - Quantity inputs in MaterialsTab: `aria-label="Cantidad de {descripción del material}"`

  **Must NOT do**:
  - Do not change input behavior, styling, or layout

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Parallelization**: YES (depends on TASK-2.2 file split)
  - **Blocks**: None
  - **Blocked By**: TASK-2.2

  **References**:
  - `frontend/src/modules/planning/ui/steps/ResourcesStep.tsx` (or sub-components after split)

  **Acceptance Criteria**:
  - [ ] All numeric inputs have descriptive `aria-label`
  - [ ] `npm run verify` passes
  - [ ] Accessibility check passes (axe-core)

  **QA Scenarios**:
  ```txt
  Scenario: Verify aria-labels on numeric inputs
    Tool: Playwright with axe-core
    Steps:
      1. Navigate to planning wizard step 2
      2. Run axe-core analysis on all inputs
      3. Assert no "aria-label missing" violations on quantity inputs
    Expected Result: All numeric inputs have proper aria-labels
    Evidence: .sisyphus/evidence/task-2.3-aria-labels.txt
  ```

  **Commit**: YES (groups with TASK-2.1 or 2.2)
  - Message: `a11y(planning): add aria-labels to numeric inputs in ResourcesStep`
  - Files: (relevant tab component files)

- [ ] 2.4. Fix KPICard.tsx accesibilidad — Migrar <article onClick> a <button> (P2-B)

  **What to do**:
  - Apply fix to BOTH active KPICard variants:
    - `frontend/src/components/ui/KPICard.tsx` (111 lines)
    - `frontend/src/core/ui/KPICard.tsx` (95 lines)
  - In each file, find `<article onClick={...}>` and apply WCAG 2.1 fix:
    - If the card is clickable (has `onClick` prop), change `<article>` to `<button>` with proper styling reset
    - Add `type="button"`, `role="button"` if not using native `<button>`
    - Add `aria-disabled` if disabled state exists
    - Ensure keyboard interaction (Enter/Space to activate)
    - OR if onClick is optional, keep <article> but add role="button", tabIndex={0}, onKeyDown handler
  - Update KpiCardProps interface if needed
  - Update test file `frontend/tests/core/kpi-card.test.tsx` to reflect new markup

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`accessibility`]
  - **Parallelization**: YES, independent
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/components/ui/KPICard.tsx` — Active variant 1
  - `frontend/src/core/ui/KPICard.tsx` — Active variant 2
  - `frontend/tests/core/kpi-card.test.tsx` — Tests to update

  **Acceptance Criteria**:
  - [ ] Both KPICard variants use semantic interactive element (button) with `type="button"`
  - [ ] Keyboard navigation works (Tab focus, Enter/Space to activate)
  - [ ] `npm run verify` passes
  - [ ] axe-core finds no violations on KPICard usage pages

  **QA Scenarios**:
  ```txt
  Scenario: Verify KPICard accessibility
    Tool: Playwright + axe-core
    Steps:
      1. Navigate to /dashboard
      2. Run axe-core on KPICard elements
      3. Tab through KPICard elements — verify focus visible
      4. Press Enter on focused KPICard — verify action triggered (if clickable)
    Expected Result: No WCAG violations, keyboard operable
    Evidence: .sisyphus/evidence/task-2.4-kpicard-a11y.txt
  ```

  **Commit**: YES (groups with TASK-2.3)
  - Message: `a11y(ui): fix KPICard semantics for WCAG 2.1 compliance`
  - Files: `frontend/src/components/ui/KPICard.tsx`, `frontend/src/core/ui/KPICard.tsx`, `frontend/tests/core/kpi-card.test.tsx`

- [ ] 2.5. Verificar stepHeaders ya movido (confirmar TASK-1.3)

  **What to do**:
  - Verify that TASK-1.3 was executed and stepHeaders moved to module scope
  - If not, perform the move
  - Re-run React Doctor to confirm score

  **Acceptance Criteria**:
  - [ ] stepHeaders confirmed at module scope
  - [ ] React Doctor no regression

  **Commit**: NO (verification only, grouped with TASK-1.3)

---

## FASE 3 — Funcionalidades P1 de producto (Sprint 2-3, ~10 días)

- [ ] 3.1. Dashboard KPIs conectados a backend (P1-E)

  **What to do**:
  - Audit current dashboard frontend: `frontend/src/app/(dashboard)/dashboard/page.tsx`
  - Identify which KPI data is mocked vs real
  - Backend endpoints already exist:
    - GET /api/dashboard/summary (consumed by useDashboardSummary)
    - GET /api/dashboard/operational-kpis
    - GET /api/dashboard/sla-risk
    - GET /api/dashboard/next-actions
    - GET /api/dashboard/blockers
    - GET /api/dashboard/recent-activity
  - If `useDashboardSummary` already works, create/verify additional hooks for remaining endpoints
  - Create `useOperationalKpis` and `useSlaRisk` hooks if missing
  - Replace any mock data in dashboard/page.tsx with real API calls
  - Each KPI card must show loading/error/empty states

  **Must NOT do**:
  - Do not modify existing working endpoints

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Parallelization**: YES, with other Phase 3 tasks
  - **Blocks**: None
  - **Blocked By**: Phase 1 completion

  **References**:
  - `backend/src/modules/dashboard/dashboard.routes.ts` — 6 routes available
  - `backend/src/modules/dashboard/dashboard.service.ts` — Service implementations
  - `frontend/src/modules/dashboard/hooks/useDashboardSummary.ts` — Existing hook pattern
  - `frontend/src/app/(dashboard)/dashboard/page.tsx` — Dashboard page
  - `packages/shared-types/src/schemas/dashboard-summary.schema.ts` — Dashboard schemas

  **Acceptance Criteria**:
  - [ ] All KPI cards show real data from backend
  - [ ] Loading state shows skeleton/spinner
  - [ ] Error state shows error card with retry
  - [ ] Data loads in < 2s
  - [ ] `npm run verify` passes

  **QA Scenarios**:
  ```txt
  Scenario: Verify dashboard loads real data
    Tool: Playwright
    Preconditions: Backend running with seeded data
    Steps:
      1. Navigate to /dashboard
      2. Wait for data to load (< 2s timeout)
      3. Assert KPI cards contain numeric values (not "—" or "0" unless actual)
      4. Assert no loading spinners visible after 3s
    Expected Result: Dashboard shows real KPIs from backend
    Evidence: .sisyphus/evidence/task-3.1-dashboard-kpis.txt

  Scenario: Verify error state
    Tool: Playwright
    Steps:
      1. Stop backend
      2. Navigate to /dashboard
      3. Assert error card visible with retry button
    Expected Result: Graceful error state
    Evidence: .sisyphus/evidence/task-3.1-dashboard-error.txt
  ```

  **Commit**: YES
  - Message: `feat(dashboard): connect KPIs to backend endpoints`
  - Files: `frontend/src/modules/dashboard/hooks/*.ts`, `frontend/src/app/(dashboard)/dashboard/page.tsx`

- [ ] 3.2. Costs Dashboard comparativo (P1-F)

  **What to do**:
  - Verify backend service `backend/src/modules/cost/cost.service.ts` has endpoint for comparison data
  - If no dedicated endpoint, create GET /api/costs/{orderId}/comparison returning planned vs actual costs
  - Schema: create/verify `CostComparisonDto` in `packages/shared-types/src/schemas/cost.schema.ts`
  - Frontend: `frontend/src/modules/costs/ui/CostComparisonChart.tsx` already exists — verify it renders real data
  - Create comparison dashboard in `/costs` or within order detail
  - Use Recharts for side-by-side visualization

  **Must NOT do**:
  - Do not duplicate existing cost service logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Parallelization**: YES, with other Phase 3 tasks
  - **Blocks**: None
  - **Blocked By**: Phase 1 completion

  **References**:
  - `backend/src/modules/cost/cost.service.ts` — 803 lines, check for comparison endpoint
  - `backend/src/modules/cost/cost.routes.ts` — Cost routes
  - `packages/shared-types/src/schemas/cost.schema.ts` — Cost schemas
  - `frontend/src/modules/costs/ui/CostComparisonChart.tsx` — Existing chart component
  - `frontend/src/modules/costs/ui/CostBreakdownTable.tsx` — Existing table

  **Acceptance Criteria**:
  - [ ] `CostComparisonDto` schema in shared-types
  - [ ] Backend endpoint returns comparison data
  - [ ] Frontend chart shows planned vs actual cost comparison
  - [ ] Loading/Error/Empty states handled
  - [ ] `npm run verify` passes

  **QA Scenarios**:
  ```txt
  Scenario: Verify cost comparison loads real data
    Tool: Playwright
    Preconditions: Order with planned and actual costs exists
    Steps:
      1. Navigate to /orders/{id} or /costs/{id}
      2. Assert comparison chart renders with data labels
      3. Assert values are numeric (not zeros unless actual)
    Expected Result: Cost comparison visual displays real data
    Evidence: .sisyphus/evidence/task-3.2-costs-comparison.txt
  ```

  **Commit**: YES
  - Message: `feat(costs): implement planned vs actual cost comparison dashboard`
  - Files: `packages/shared-types/src/schemas/cost.schema.ts`, `backend/src/modules/cost/*`, `frontend/src/modules/costs/*`

- [ ] 3.3. Billing Timeline SES→Invoice→Payment (P1-G)

  **What to do**:
  - Create visual timeline component `frontend/src/modules/billing/ui/BillingTimeline.tsx`
  - Timeline shows: SES (Service Entry Sheet) → Invoice → Payment
  - Each stage shows: status (pending/approved/rejected), date, responsible, amount
  - Backend: create GET /api/billing/{orderId}/pipeline endpoint if missing
  - Schema: create `BillingPipelineDto` in shared-types
  - Use existing billing frontend at `frontend/src/app/(dashboard)/billing/`

  **Must NOT do**:
  - Do not modify existing billing endpoints without compatibility check

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - **Parallelization**: YES, with other Phase 3 tasks
  - **Blocks**: None
  - **Blocked By**: Phase 1

  **References**:
  - `frontend/src/app/(dashboard)/billing/` — Existing billing pages
  - `backend/src/modules/service-entry-sheet/` — SES module
  - `backend/src/modules/invoice/` — Invoice module
  - `backend/src/modules/payment/` — Payment module
  - `packages/shared-types/src/schemas/` — Schemas for billing entities

  **Acceptance Criteria**:
  - [ ] BillingTimeline component created
  - [ ] Backend pipeline endpoint exists (or use existing endpoints)
  - [ ] Component shows SES, Invoice, Payment status timeline
  - [ ] `npm run verify` passes

  **QA Scenarios**:
  ```txt
  Scenario: Verify billing timeline renders
    Tool: Playwright
    Preconditions: Order with SES and invoice created
    Steps:
      1. Navigate to /billing/{orderId}
      2. Assert timeline component visible
      3. Assert SES item shows status and date
      4. Assert invoice item links correctly
    Expected Result: Billing pipeline visualized chronologically
    Evidence: .sisyphus/evidence/task-3.3-billing-timeline.txt
  ```

  **Commit**: YES
  - Message: `feat(billing): add SES→Invoice→Payment timeline component`
  - Files: (multiple — shared-types, backend, frontend)

- [ ] 3.4. Reports PDF post-ejecución (P1-H)

  **What to do**:
  - pdf-lib@1.17.1 confirmed in backend package.json
  - Create professional CERMONT PDF template with:
    - CERMONT logo header
    - Report metadata (title, date, author, status)
    - Sections: execution summary, evidence gallery, resources used, observations
    - Digital signature placeholder
    - Footer with page numbers and confidentiality notice
  - Endpoint: POST /api/reports/{id}/generate-pdf
  - Frontend: `frontend/src/modules/reports/ui/PDFExportButton.tsx` exists — verify integration
  - Auto-generate PDF when execution is completed (in `order-closure.service.ts`)

  **Must NOT do**:
  - Do not store PDFs in MongoDB — use file system or blob storage
  - Do not implement complex template engine — use pdf-lib programmatic generation

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  - **Parallelization**: NO (sequential — depends on backend understanding)
  - **Blocks**: None
  - **Blocked By**: Phase 1

  **References**:
  - `backend/package.json` — pdf-lib@1.17.1 confirmed present
  - `backend/src/modules/report/report.routes.ts` — Report endpoints
  - `frontend/src/modules/reports/ui/PDFExportButton.tsx` — Existing export button
  - `backend/src/modules/order/order-closure.service.ts` — Auto-generate on closure

  **Acceptance Criteria**:
  - [ ] PDF generation endpoint working
  - [ ] PDF contains CERMONT branding, sections, metadata
  - [ ] Auto-generation on execution completion
  - [ ] PDF downloadable from frontend
  - [ ] `npm run verify` passes

  **QA Scenarios**:
  ```txt
  Scenario: Verify PDF generation
    Tool: Bash (curl)
    Steps:
      1. POST /api/reports/{id}/generate-pdf as authenticated user
      2. Assert response is application/pdf
      3. Assert response size > 0 bytes
      4. Verify PDF opens with valid structure (pdfinfo or similar)
    Expected Result: Valid CERMONT-branded PDF generated
    Evidence: .sisyphus/evidence/task-3.4-pdf-generated.pdf

  Scenario: Verify auto-generation on execution complete
    Tool: Playwright + Bash
    Steps:
      1. Complete an execution in frontend
      2. Check that PDF exists via GET /api/reports/{orderId}/pdf
    Expected Result: PDF auto-generated after execution
    Evidence: .sisyphus/evidence/task-3.4-pdf-autogen.txt
  ```

  **Commit**: YES
  - Message: `feat(reports): CERMONT PDF template with auto-generation on execution`
  - Files: (multiple)

- [ ] 3.5. Offline Sync Status UI (P1-I)

  **What to do**:
  - Create `SyncStatusBanner` component in `frontend/src/core/ui/SyncStatusBanner.tsx`
  - Integrate with Serwist/service worker state
  - States: Synced (green), Syncing (blue), Pending (yellow), Error (red)
  - Show on execution-related pages:
    - /execution/{id}
    - /evidences
    - /field-execution pages
  - Create hook `useSyncStatus()` that reads from offline queue store
  - Use existing `frontend/src/lib/pwa/offline-queue.ts` patterns

  **Must NOT do**:
  - Do not modify service worker logic
  - Do not add to non-field pages (dashboard, admin)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - **Parallelization**: YES, with other Phase 3 tasks
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/store/` — Zustand stores for offline queue
  - `frontend/src/lib/pwa/offline-queue.ts` — Offline queue patterns
  - `frontend/src/app/~offline/page.tsx` — Existing offline page
  - `frontend/src/modules/core/ui/layout/` — Layout components for placement pattern

  **Acceptance Criteria**:
  - [ ] SyncStatusBanner component created
  - [ ] Shows correct status (synced/pending/error)
  - [ ] Visible on execution pages
  - [ ] `npm run verify` passes

  **QA Scenarios**:
  ```txt
  Scenario: Verify sync banner on execution page
    Tool: Playwright
    Steps:
      1. Navigate to /execution/{id}
      2. Assert SyncStatusBanner visible
      3. Assert status reflects current queue state
    Expected Result: Banner shows sync status
    Evidence: .sisyphus/evidence/task-3.5-sync-banner.txt
  ```

  **Commit**: YES
  - Message: `feat(offline): add SyncStatusBanner to execution pages`
  - Files: `frontend/src/core/ui/SyncStatusBanner.tsx`, execution page layouts

- [ ] 3.6. Fleet UI checkout/checkin completo (P1-J)

  **What to do**:
  - Audit current fleet frontend: `frontend/src/modules/fleet/`
  - Audit backend fleet endpoints: Check `backend/src/modules/fleet/` routes (confirmed complete)
  - Implement missing checkout/checkin UI flow:
    - Vehicle assignment via `VehicleAssignmentPanel.tsx`
    - Checkout form (driver, destination, date, notes)
    - Checkin form (return condition, mileage, notes)
    - Fleet usage history
  - Verify `FleetPhotoGallery.tsx` and `FleetReadinessBadge.tsx` are integrated

  **Must NOT do**:
  - Do not modify backend (confirmed complete)
  - Do not create duplicate components

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Parallelization**: YES, with other Phase 3 tasks
  - **Blocks**: None
  - **Blocked By**: Phase 1

  **References**:
  - `frontend/src/modules/fleet/` — Fleet frontend module
  - `frontend/src/modules/fleet/api/fleet-api.ts` — API client
  - `frontend/src/modules/fleet/ui/VehicleAssignmentPanel.tsx` — Assignment panel
  - `frontend/src/app/(dashboard)/fleet/` — Fleet pages

  **Acceptance Criteria**:
  - [ ] Checkout form functional (select driver, enter destination, submit)
  - [ ] Checkin form functional (return condition, mileage)
  - [ ] Full flow: checkout → usage → checkin works from UI
  - [ ] `npm run verify` passes

  **QA Scenarios**:
  ```txt
  Scenario: Complete fleet checkout/checkin flow
    Tool: Playwright
    Preconditions: Vehicle available for assignment
    Steps:
      1. Navigate to /fleet/{id}
      2. Click "Asignar" — checkout form opens
      3. Fill driver, destination, expected return date
      4. Submit — verify vehicle status changes to "Asignado"
      5. Click "Devolver" — checkin form opens
      6. Fill return condition and mileage
      7. Submit — verify vehicle status changes to "Disponible"
    Expected Result: Complete checkout/checkin flow functional
    Evidence: .sisyphus/evidence/task-3.6-fleet-flow.txt
  ```

  **Commit**: YES
  - Message: `feat(fleet): complete checkout/checkin UI flow`
  - Files: `frontend/src/modules/fleet/*`

- [ ] 3.7. Portal Cliente — verificar todas las rutas (P1-K)

  **What to do**:
  - Test each portal route for real data:
    - /portal — Dashboard overview
    - /portal/orders — Orders list
    - /portal/orders/{id} — Order detail
    - /portal/invoices — Invoices list
    - /portal/proposals — Proposals list
    - /portal/service-cases — Service cases
    - /portal/service-cases/{id} — Service case detail
    - /portal/signatures — Signature requests
    - /portal/signatures/{id} — Signature detail
  - Verify each page uses `portal-api.ts` (not mock data)
  - If any page uses hardcoded/mock data, replace with real API calls
  - Add loading/error/empty states where missing
  - Verify RBAC: client role can only access portal routes

  **Must NOT do**:
  - Do not change backend portal endpoints — verify they work
  - Do not break RBAC isolation

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Parallelization**: YES, with other Phase 3 tasks
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/app/(portal)/` — Portal routes
  - `frontend/src/modules/portal/api/portal-api.ts` — Portal API client
  - `backend/src/modules/portal/portal.routes.ts` — Backend portal endpoints
  - `frontend/proxy.ts` — RBAC routing for client role

  **Acceptance Criteria**:
  - [ ] All 9 portal routes load real data
  - [ ] No mocked data in portal pages
  - [ ] Loading/Error/Empty states on all pages
  - [ ] Client role cannot access non-portal routes
  - [ ] `npm run verify` passes

  **QA Scenarios**:
  ```txt
  Scenario: Verify portal routes load real data
    Tool: Playwright
    Preconditions: User logged in with cliente role
    Steps:
      1. Navigate to /portal — assert dashboard loads with real counts
      2. Navigate to /portal/orders — assert orders list from backend
      3. Navigate to /portal/invoices — assert invoices list
      4. Navigate to /portal/proposals — assert proposals list
      5. Navigate to /portal/service-cases — assert service cases
    Expected Result: All portal routes display real data
    Evidence: .sisyphus/evidence/task-3.7-portal-verified.txt
  ```

  **Commit**: YES
  - Message: `fix(portal): replace mock data with real API calls across all portal routes`
  - Files: (portal pages that needed fixes)

- [ ] 3.8. Planning Wizard cronograma visual (P2-H)

  **What to do**:
  - Identify the ScheduleStep component (`frontend/src/modules/planning/ui/steps/ScheduleStep.tsx`)
  - Implement missing UI fields from "Formato Planeación de Obra":
    - Start date / End date range
    - Crew selection/assignment
    - Tool/Equipment allocation per day
    - Location details with map preview (simple)
    - Work type classification
  - Verify the ScheduleStep connects to `planning-packet.schema.ts` in shared-types
  - Ensure all 6/10 "missing" fields documented in audit are implemented

  **Must NOT do**:
  - Do not add fields that don't exist in the shared-types schema
  - Do not implement complex Gantt chart — use simpler date range UI

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - **Parallelization**: YES, with other Phase 3 tasks
  - **Blocks**: None
  - **Blocked By**: Phase 1 consolidation (TASK-1.2)

  **References**:
  - `frontend/src/modules/planning/ui/steps/ScheduleStep.tsx` — Target component
  - `packages/shared-types/src/schemas/planning-packet.schema.ts` — Planning packet schema
  - `frontend/src/modules/planning/ui/PlanningWizard.tsx` — Parent wizard

  **Acceptance Criteria**:
  - [ ] ScheduleStep includes all required fields from Formato Planeación
  - [ ] Data connects to planning-packet schema
  - [ ] Calendar/date picker functional
  - [ ] `npm run verify` passes

  **QA Scenarios**:
  ```txt
  Scenario: Verify cronograma step completeness
    Tool: Playwright
    Preconditions: Order exists for planning
    Steps:
      1. Navigate to Planning Wizard Step 1 (Cronograma)
      2. Verify place, date range, business unit, responsible, scope fields present
      3. Fill all fields with valid data
      4. Navigate to step 2
      5. Go back — verify data preserved
    Expected Result: Cronograma step complete with all required fields
    Evidence: .sisyphus/evidence/task-3.8-cronograma-complete.txt
  ```

  **Commit**: YES
  - Message: `feat(planning): complete cronograma step with all Formato Planeación fields`
  - Files: `frontend/src/modules/planning/ui/steps/ScheduleStep.tsx`

---

## FASE 4 — E2E Tests críticos (Sprint 3, ~5 días)

- [ ] 4.1. E2E: Flujo offline execution → evidence → sync (C1)

  **What to do**:
  - Create test file: `frontend/tests/e2e/offline-execution-flow.spec.ts`
  - Implement the following test:

  ```typescript
  // Pseudocode for offline-execution-flow.spec.ts
  import { test, expect } from '@playwright/test';
  import { seedTestData } from '../fixtures/seed';

  test.describe('Offline Execution Flow', () => {
    test.beforeAll(async () => {
      // Seed: order in PLANNING_APPROVED state with planning packet
      await seedTestData('offline-execution-seed');
    });

    test('offline evidence → sync flow', async ({ page }) => {
      // Step 1: Login as field_technician
      await page.goto('/login');
      await page.fill('[name="email"]', 'tecnico@cermont.com');
      await page.fill('[name="password"]', 'test123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Step 2: Navigate to execution
      await page.goto(`/execution/${ORDER_ID}`);
      await page.waitForLoadState('networkidle');

      // Step 3: Simulate offline
      await page.context().setOffline(true);

      // Step 4: Fill execution form
      await page.fill('textarea[name="notes"]', 'Trabajo realizado en campo');
      // Upload evidence photo
      await page.setInputFiles('input[type="file"]', 'tests/fixtures/evidence-photo.jpg');
      await page.waitForTimeout(500);

      // Step 5: Submit form offline
      await page.click('button:has-text("Guardar")');

      // Step 6: Verify queued in IndexedDB
      const offlineData = await page.evaluate(() => {
        return new Promise((resolve) => {
          const request = indexedDB.open('cermont-offline');
          request.onsuccess = () => {
            const tx = request.result.transaction('offline-queue', 'readonly');
            const store = tx.objectStore('offline-queue');
            const all = store.getAll();
            all.onsuccess = () => resolve(all.result);
          };
        });
      });
      expect(offlineData).toHaveLength(1);
      expect(offlineData[0].status).toBe('pending');

      // Step 7: Restore connection
      await page.context().setOffline(false);

      // Step 8: Wait for auto-sync
      await page.waitForTimeout(3000); // Allow sync trigger

      // Step 9: Verify SyncStatusBanner shows "Synced"
      await expect(page.locator('[data-testid="sync-status"]')).toContainText('Sincronizado');

      // Step 10: Verify evidence appears in backend
      const response = await page.request.get(`/api/evidences?relatedTo=${ORDER_ID}`);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].metadata).toBeDefined();
    });
  });
  ```

  **Acceptance Criteria**:
  - [ ] Test passes with `--project=chromium`
  - [ ] Test passes with `--project=mobile` (viewport 375px)
  - [ ] Sync completes in < 10s after connection restored
  - [ ] Evidence metadata populated (geo, hash, timestamp)

  **QA Scenarios**:
  ```txt
  Scenario: Run E2E offline execution test
    Tool: Bash
    Preconditions: Test seed data loaded, backend running
    Steps:
      1. npx playwright test frontend/tests/e2e/offline-execution-flow.spec.ts --project=chromium
    Expected Result: Test passes (exit code 0)
    Evidence: .sisyphus/evidence/task-4.1-e2e-offline-results.txt
  ```

  **Commit**: YES
  - Message: `test(e2e): add offline execution flow E2E test`
  - Files: `frontend/tests/e2e/offline-execution-flow.spec.ts`, test fixtures

- [ ] 4.2. E2E: Flujo de 14 pasos completo (C2)

  **What to do**:
  - Create test file: `frontend/tests/e2e/full-14-step-flow.spec.ts`
  - Implement the complete 14-step workflow:

  ```typescript
  // Pseudocode for full-14-step-flow.spec.ts
  import { test, expect } from '@playwright/test';
  import { seedTestData } from '../fixtures/seed';

  test.describe('Full 14-Step Workflow', () => {
    test.beforeAll(async () => {
      // Seeds: customer, resources, personnel, kit templates
      // Users: admin, supervisor, field_technician, billing_officer
      await seedTestData('full-workflow-seed');
    });

    test('complete 14-step workflow end-to-end', async ({ browser }) => {
      // We use separate browser contexts for different roles
      const adminCtx = await browser.newContext({ storageState: 'fixtures/auth/admin.json' });
      const supervisorCtx = await browser.newContext({ storageState: 'fixtures/auth/supervisor.json' });
      const techCtx = await browser.newContext({ storageState: 'fixtures/auth/tecnico.json' });
      const billingCtx = await browser.newContext({ storageState: 'fixtures/auth/billing.json' });

      // PASO 1: Admin creates work request
      const adminPage = await adminCtx.newPage();
      await adminPage.goto('/work-requests/new');
      await adminPage.fill('input[name="clientName"]', 'Cliente Test');
      await adminPage.fill('textarea[name="description"]', 'Mantenimiento preventivo CCTV');
      await adminPage.click('button:has-text("Crear Solicitud")');
      await adminPage.waitForURL(/\/work-requests\//);
      const requestId = adminPage.url().split('/').pop();
      const requestStatus = await adminPage.textContent('[data-testid="request-status"]');
      expect(requestStatus).toContain('Pendiente');

      // PASO 2: Supervisor approves and creates site visit
      const supervisorPage = await supervisorCtx.newPage();
      await supervisorPage.goto(`/work-requests/${requestId}`);
      await supervisorPage.click('button:has-text("Aprobar")');
      await supervisorPage.waitForSelector('text=Visita Creada');
      // ... continue for all 14 steps

      // Each step verifies document state changes in backend
      // PASO 14: Admin closes order
      const closeResponse = await adminPage.request.post(`/api/orders/${orderId}/close`);
      expect(closeResponse.ok()).toBe(true);

      // Final verification: report PDF generated
      const pdfResponse = await adminPage.request.get(`/api/reports/${orderId}/pdf`);
      expect(pdfResponse.headers()['content-type']).toBe('application/pdf');
    });
  });
  ```

  **Detailed 14-step flow to implement**:

  | Step | Actor | Action | Verification |
  |------|-------|--------|-------------|
  | 1 | admin | Create work request | Status: "Pendiente" |
  | 2 | supervisor | Approve + create site visit | Status: "Visita Programada" |
  | 3 | supervisor | Generate technical proposal | Proposal created with items |
  | 4 | admin | Approve proposal → create work order | Order status: "Creada" |
  | 5 | supervisor | Create planning packet with kit | Planning packet created |
  | 6 | supervisor | Assign resources + cronograma | Resources assigned |
  | 7 | supervisor | Approve AST + PTW | Safety docs approved |
  | 8 | field_technician | Execute work (online) | Session in progress |
  | 9 | field_technician | Upload evidence with metadata | Evidence with geo+hash |
  | 10 | supervisor | Complete execution → generate SES | SES created |
  | 11 | supervisor | Approve SES → trigger invoice | SES approved |
  | 12 | billing_officer | Emit invoice to client | Invoice emitted |
  | 13 | admin | Register payment received | Payment registered |
  | 14 | admin | Close order → generate PDF report | PDF generated |

  **Acceptance Criteria**:
  - [ ] Test completes all 14 steps without errors
  - [ ] Each step verifies document state changed in backend
  - [ ] Test runs in < 3 minutes
  - [ ] Accessibility assertions on critical steps (modal, form)

  **QA Scenarios**:
  ```txt
  Scenario: Run full 14-step E2E test
    Tool: Bash
    Preconditions: All seeds loaded, backend running
    Steps:
      1. npx playwright test frontend/tests/e2e/full-14-step-flow.spec.ts --project=chromium
    Expected Result: Test passes (exit code 0), all 14 steps verified
    Evidence: .sisyphus/evidence/task-4.2-e2e-14step-results.txt
  ```

  **Commit**: YES
  - Message: `test(e2e): add full 14-step workflow E2E test`
  - Files: `frontend/tests/e2e/full-14-step-flow.spec.ts`, test fixtures/seeds

---

## FASE 5 — Mejoras de arquitectura y deuda técnica (Sprint 4, ~5 días)

- [ ] 5.1. Migrar 10 DTOs críticos de locales a @cermont/shared-types (P2-F)

  **What to do**:
  - Current baseline: 45 local DTOs (`local-api-dto`)
  - Prioritize modules: planning, execution, costs, billing
  - Identify 10 most critical DTOs used across backend AND frontend
  - For each DTO:
    1. Create/move Zod schema to `packages/shared-types/src/schemas/`
    2. Export from `packages/shared-types/src/index.ts`
    3. Update backend imports to use `@cermont/shared-types`
    4. Update frontend imports to use `@cermont/shared-types`
    5. Delete the local DTO file
  - Update baseline.json: reduce `local-api-dto` from 45 to 35

  **Must NOT do**:
  - Do not migrate DTOs used by only one side (backend-only or frontend-only)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  - **Parallelization**: YES, with Phase 2
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `packages/shared-types/src/schemas/` — Target directory
  - `packages/shared-types/src/index.ts` — Barrel exports
  - `tooling/quality/baseline.json` — Baseline to reduce
  - `tooling/quality/check-local-api-dto.ts` (or similar) — Validation script

  **Acceptance Criteria**:
  - [ ] 10 DTOs migrated to shared-types
  - [ ] Both backend and frontend import from `@cermont/shared-types`
  - [ ] Local DTO files deleted
  - [ ] `npm run verify` passes
  - [ ] `local-api-dto` baseline reduced from 45 to <= 35

  **QA Scenarios**:
  ```txt
  Scenario: Verify DTO migration caught by quality check
    Tool: Bash
    Steps:
      1. npm run quality:strict (or equivalent that checks local-api-dto)
      2. Assert local-api-dto count <= 35
    Expected Result: Baseline reduced
    Evidence: .sisyphus/evidence/task-5.1-dto-migration.txt
  ```

  **Commit**: YES (or multiple per DTO)
  - Message: `refactor(shared-types): migrate {N} DTOs from local to @cermont/shared-types`
  - Files: (shared-types schemas + updated imports)

- [ ] 5.2. Migrar símbolos internos en español a inglés (P2-G)

  **What to do**:
  - Current baseline: 2850 Spanish tokens in internal symbols
  - Focus on the 5 modules with highest concentration:
    1. planning (likely highest — variable names in Spanish)
    2. costs
    3. dashboard
    4. reports
    5. execution
  - Rename internal symbols (variables, functions, types) only — NOT user-facing strings
  - Examples: `getDatos` → `getData`, `crearOrden` → `createOrder`
  - Do NOT translate: UI text strings, error messages shown to users
  - Update baseline.json: reduce `spanish-source-token` from 2850 to < 2000

  **Must NOT do**:
  - Do not translate user-facing strings (UI labels, error messages, toast text)
  - Do not translate backend route paths (they're part of the API contract)
  - Do not rename Mongoose model names or database collection names

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Parallelization**: YES, with Phase 2
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `tooling/quality/baseline.json` — `spanish-source-token: 2850`
  - `tooling/quality/check-spanish-tokens.ts` (or similar) — Validation script

  **Acceptance Criteria**:
  - [ ] Internal symbols renamed in top-5 modules
  - [ ] No user-facing strings changed
  - [ ] `npm run verify` passes
  - [ ] `spanish-source-token` baseline reduced from 2850 to < 2000

  **QA Scenarios**:
  ```txt
  Scenario: Verify Spanish token reduction
    Tool: Bash
    Steps:
      1. Run quality check for Spanish tokens
      2. Assert count < 2000
    Expected Result: Spanish token count reduced
    Evidence: .sisyphus/evidence/task-5.2-spanish-tokens.txt
  ```

  **Commit**: YES (one per module for traceability)
  - Message: `refactor({module}): migrate internal symbols from Spanish to English`
  - Files: (renamed symbols in module files)

- [ ] 5.3. Evidence gallery con metadatos profesionales (P2-I)

  **What to do**:
  - Audit current evidence gallery: `frontend/src/modules/evidences/ui/`
  - Add metadata display to each evidence item:
    - **Geo**: Show latitude/longitude from evidence metadata
    - **Hash**: Show SHA-256 hash of the evidence file
    - **Timestamp**: Show precise upload timestamp with timezone
    - **Device info**: Device used to capture (if available)
  - Create metadata tooltip/popover component
  - Update evidence schema if needed in shared-types

  **Must NOT do**:
  - Do not change evidence upload flow
  - Do not add fields that don't exist in the data model

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - **Parallelization**: YES, with other Phase 5 tasks
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/evidences/ui/` — Evidence gallery UI
  - `packages/shared-types/src/schemas/evidence.schema.ts` — Evidence schema
  - `frontend/src/modules/service-cases/components/EvidenceGallerySection.tsx` — Gallery section

  **Acceptance Criteria**:
  - [ ] Evidence items show geo, hash, timestamp metadata
  - [ ] Metadata displayed in tooltip/info panel
  - [ ] `npm run verify` passes

  **QA Scenarios**:
  ```txt
  Scenario: Verify evidence metadata display
    Tool: Playwright
    Preconditions: Evidence with complete metadata exists
    Steps:
      1. Navigate to /evidences (or order evidence tab)
      2. Click on an evidence item to see details
      3. Assert geo coordinates displayed
      4. Assert SHA-256 hash displayed
      5. Assert timestamp with timezone displayed
    Expected Result: Evidence metadata visible
    Evidence: .sisyphus/evidence/task-5.3-evidence-metadata.txt
  ```

  **Commit**: YES
  - Message: `feat(evidences): add professional metadata display to evidence gallery`
  - Files: `frontend/src/modules/evidences/*`

- [ ] 5.4. Actualizar baselines de calidad (posterior a limpieza)

  **What to do**:
  - After all Phase 1, 2, 5 tasks complete, re-run quality checks
  - Update `tooling/quality/baseline.json` with new reduced values
  - Expected reductions:
    - `spanish-source-token`: 2850 → < 2000
    - `local-api-dto`: 45 → < 35
    - `weak-token-u`: 639 → < 500
    - `weak-token-a`: 85 → < 70
  - Run `npm run verify` to confirm all baselines pass

  **Must NOT do**:
  - Do not modify baseline.json without actually reducing the counts
  - Do not baseline out existing violations without fixing

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Parallelization**: NO (depends on all cleanup tasks)
  - **Blocks**: None
  - **Blocked By**: TASK-5.1, TASK-5.2

  **References**:
  - `tooling/quality/baseline.json` — Current baselines
  - `tooling/quality/` — Quality check scripts

  **Acceptance Criteria**:
  - [ ] Baseline.json updated with reduced counts
  - [ ] `npm run verify` passes
  - [ ] All quality checks pass with new baselines

  **QA Scenarios**:
  ```txt
  Scenario: Verify updated baselines pass
    Tool: Bash
    Steps:
      1. npm run quality:strict (or quality check command)
      2. Assert exit code 0
    Expected Result: All quality checks pass
    Evidence: .sisyphus/evidence/task-5.4-baselines-updated.txt
  ```

  **Commit**: YES
  - Message: `chore(quality): update baselines after Phase 1, 2, 5 cleanup`
  - Files: `tooling/quality/baseline.json`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run verify` + `npx react-doctor@latest --verbose --diff > .sisyphus/evidence/react-doctor-final.txt`. Review all changed files for AI slop, anti-patterns.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | React Doctor [score] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Execute EVERY QA scenario from EVERY task. Test cross-task integration. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

| Task | Type | Message |
|------|------|---------|
| 1.1 | cleanup | `cleanup(frontend): remove dead KpiCard.tsx from components/common` |
| 1.2 | cleanup | `cleanup(planning): consolidate planning-packet/new/ with modules/planning/` |
| 1.3 | perf | `perf(planning): move stepHeaders to module scope in PlanningWizard` |
| 1.4 | cleanup | `cleanup(constants): remove unused exports from flow-categories.ts` |
| 1.5 | cleanup | `cleanup(planning): audit planning/ui/steps/shared-types.ts` |
| 1.6 | feat | `feat(admin): add placeholder page for /admin/erp-connectors/new` |
| 2.1 | refactor | `refactor(planning): migrate PlanningWizard 15 useState to useReducer` |
| 2.2 | refactor | `refactor(planning): split ResourcesStep into 5 sub-components` |
| 2.3 | a11y | `a11y(planning): add aria-labels to numeric inputs in ResourcesStep` |
| 2.4 | a11y | `a11y(ui): fix KPICard semantics for WCAG 2.1 compliance` |
| 3.1 | feat | `feat(dashboard): connect KPIs to backend endpoints` |
| 3.2 | feat | `feat(costs): implement planned vs actual cost comparison dashboard` |
| 3.3 | feat | `feat(billing): add SES→Invoice→Payment timeline component` |
| 3.4 | feat | `feat(reports): CERMONT PDF template with auto-generation on closure` |
| 3.5 | feat | `feat(offline): add SyncStatusBanner to execution pages` |
| 3.6 | feat | `feat(fleet): complete checkout/checkin UI flow` |
| 3.7 | fix | `fix(portal): replace mock data with real API calls across portal routes` |
| 3.8 | feat | `feat(planning): complete cronograma step with all Formato Planeación fields` |
| 4.1 | test | `test(e2e): add offline execution flow E2E test` |
| 4.2 | test | `test(e2e): add full 14-step workflow E2E test` |
| 5.1 | refactor | `refactor(shared-types): migrate 10 DTOs from local to @cermont/shared-types` |
| 5.2 | refactor | `refactor({module}): migrate internal symbols from Spanish to English` |
| 5.3 | feat | `feat(evidences): add professional metadata display to evidence gallery` |
| 5.4 | chore | `chore(quality): update baselines after Phase 1, 2, 5 cleanup` |

---

## Success Criteria

### Verification Commands
```bash
# Per-phase verification
npm run verify                                                        # Must pass every commit
npx react-doctor@latest --verbose --diff > doctor-report.txt          # Phase 2 completion
npx playwright test --project=chromium tests/e2e/offline-execution-flow.spec.ts  # Phase 4
npx playwright test --project=chromium tests/e2e/full-14-step-flow.spec.ts       # Phase 4
npx playwright test --project=mobile tests/e2e/offline-execution-flow.spec.ts    # Mobile variant

# Quality
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:ci
```

### Final Checklist
- [ ] All "Must Have" items implemented
- [ ] All "Must NOT Have" items absent (grep for any/unknown/null/undefined, console.log, @ts-ignore)
- [ ] `npm run verify` passes
- [ ] `npx react-doctor@latest` score >= 95/100
- [ ] 2 E2E tests pass on chromium + mobile
- [ ] Quality baselines reduced
- [ ] Deploy verdict: ✅ GO
