# Professionalization Refactor — CERMONT S.A.S.

## TL;DR

> **Quick Summary**: Transform CERMONT from an academic-grade graduate project into a commercial-grade Field Service Management (FSM) / CMMS platform. Enhance 4 key modules (vehicles, evidence/camera, notifications, checklists), build a 14-step workflow cockpit, standardize the design system, and establish comprehensive E2E testing.

> **Deliverables**:
> - Phase 1: Verification audit + baseline pass
> - Phase 2: Design system tokens + 6 standardized UI components
> - Phase 3: Fleet/vehicle enhancement (photos, documents, readiness gates)
> - Phase 4: Evidence camera capture component + offline sync + validation flow
> - Phase 5: Real notification system (backend + bell UI + page + event generators)
> - Phase 6: Professional checklist system (templates + execution + blocking logic)
> - Phase 7: Workflow cockpit (14-step visual panel + gates + timeline)
> - Phase 8: Comprehensive E2E test suite (Playwright)
> - Phase 9: Updated documentation + changelog

> **Estimated Effort**: XL (9 phases, ~60+ tasks)
> **Parallel Execution**: YES — 7 parallel waves
> **Critical Path**: Phase 1 → Phase 3 part → Phase 4 part → Phase 6 part → Phase 7 → Phase 8 → Phase 9

---

## Context

### Original Request
User provided a master prompt for professionalizing the CERMONT web application. The system is a document-driven operational platform for Cermont S.A.S., a multi-service contractor company. The project already completed academic objectives but needs to reach professional quality across: testing, vehicles module, evidence camera capture, notification system, checklists, design system, workflow gates, offline-first, audit trail, RBAC security, and code quality.

### Current State (verified 2026-06-19)
- **Monorepo**: npm workspaces with backend/, frontend/, packages/shared-types, packages/domain, packages/config
- **Backend**: 53 feature modules (Express 5.2.1 + Mongoose 9.x)
- **Frontend**: 40 feature modules (Next.js 16 + React 19 + Tailwind 4)
- **Verification**: All gates pass — typecheck, lint, build, test (991 passing), quality gates, react-doctor 100/100
- **Key existing modules**: fleet (backend only, no photos), evidence (backend + frontend), checklist (backend + frontend), notifications (backend + frontend)
- **Design system**: EXISTS in DESIGN.md + CERMONT_UIUX_GUIDE.md — needs standardization
- **Deployment**: VPS with PM2, production at 13.140.161.225

### Key Decisions
- **NO stack changes**: Stack stays as-is (Next.js 16, Express 5, Mongoose, MongoDB, Tailwind 4, TanStack Query, Zustand)
- **Enhance, don't replace**: All existing modules are enhanced, not rewritten from scratch
- **Contract-first**: All new schemas in `packages/shared-types/src/schemas/`
- **Feature-sliced**: New frontend code in `frontend/src/modules/`, backend in `backend/src/modules/`
- **Zero tolerance**: No `any`, `unknown`, `null`, `undefined`, `console.log`, fetch directo, roles hardcodeados

---

## Work Objectives

### Core Objective
Professionalize the CERMONT web application across 9 phases — from code quality, design system, module depth, testing, and documentation — to match commercial FSM/CMMS platform standards.

### Concrete Deliverables
- Phase 1: Verified baseline (all gates green)
- Phase 2: DESIGN.md updated + 6 standardized UI components + token system
- Phase 3: Fleet module with vehicle photos, document tracking, readiness gates
- Phase 4: EvidenceCameraCapture component + offline evidence flow + approval/rejection
- Phase 5: Notification backend + bell UI + /notifications page + event generators
- Phase 6: Checklist templates + execution engine + mobile UI + blocking logic
- Phase 7: Workflow cockpit (14-step panel) with gates and timeline
- Phase 8: 15+ Playwright E2E scenarios covering full 14-step flow
- Phase 9: Updated README, docs/audits, changelog

### Must Have
- All existing functionality preserved and verified
- Zero new `any`, `unknown`, `null`, `undefined` types
- All verification gates pass after each phase
- Design tokens consistent across all new/enhanced components
- Mobile-first responsive design for all new UI

### Must NOT Have (Guardrails)
- NO replacing existing working modules entirely — enhance incrementally
- NO stack changes — keep Express 5, Mongoose, Next.js 16, etc.
- NO middleware.ts — proxy.ts is the security perimeter
- NO NestJS, Prisma, PostgreSQL, Auth.js, pnpm/yarn
- NO console.log in production code
- NO duplicate schemas, enums, roles, routes, query keys
- NO business logic in UI components
- NO hardcoded roles — use @cermont/domain
- NO breaking API contract changes
- NO breaking RBAC or auth changes

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES — Vitest (frontend + backend), Playwright (E2E), Supertest (backend integration)
- **Automated tests**: TDD for new module logic, tests-after for UI components
- **Framework**: Vitest 4.x + Playwright 1.58.x + Supertest
- **Existing**: 991 tests passing, react-doctor 100/100

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}`.

- **Frontend/UI**: Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Bash (curl) — Send requests, assert status + response fields
- **Library/Schema**: Bash (bun REPL) — Import, parse, compare output
- **Unit tests**: npm run test — Run Vitest with specific test file

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — audit + foundation):
├── Task 1: Run complete verification pipeline [audit]
├── Task 2: Audit current DESIGN.md vs actual implementation [audit]
├── Task 3: Audit current fleet module [audit]
├── Task 4: Audit current evidence module [audit]
├── Task 5: Audit current checklist module [audit]
├── Task 6: Audit current notifications module [audit]
└── Task 7: Audit current E2E coverage [audit]

Wave 2 (After Wave 1 — design system + schemas, MAX PARALLEL):
├── Task 8: Update DESIGN.md with full token system [design]
├── Task 9: Standardize Button component [design]
├── Task 10: Standardize Card component [design]
├── Task 11: Standardize Badge component [design]
├── Task 12: Standardize FormField component [design]
├── Task 13: Standardize Table responsive component [design]
├── Task 14: Standardize Dialog component [design]
├── Task 15: Vehicle schemas in shared-types [contract]
├── Task 16: Evidence camera schemas in shared-types [contract]
├── Task 17: Notification schemas in shared-types [contract]
├── Task 18: Checklist schemas in shared-types [contract]
└── Task 19: Workflow cockpit schemas in shared-types [contract]

Wave 3 (After Wave 2 — backend modules, MAX PARALLEL):
├── Task 20: Fleet backend — photos + documents + readiness [backend]
├── Task 21: Evidence backend — camera upload + validation [backend]
├── Task 22: Notification backend — endpoints + central service [backend]
├── Task 23: Checklist backend — templates + execution engine [backend]
└── Task 24: Workflow cockpit backend — gates + timeline [backend]

Wave 4 (After Wave 3 — frontend modules, MAX PARALLEL):
├── Task 25: Fleet frontend — photos UI + document tracking [frontend]
├── Task 26: EvidenceCameraCapture component [frontend]
├── Task 27: Evidence gallery + validation UI [frontend]
├── Task 28: Notification bell UI + dropdown [frontend]
├── Task 29: /notifications page [frontend]
├── Task 30: Checklist execution mobile UI [frontend]
├── Task 31: Checklist template manager [frontend]
└── Task 32: Workflow cockpit UI (14-step panel) [frontend]

Wave 5 (After Wave 4 — integration + offline, PARALLEL):
├── Task 33: Evidence offline sync queue integration [offline]
├── Task 34: Checklist offline auto-save [offline]
├── Task 35: Fleet readiness gates integration [integration]
├── Task 36: Evidence → Checklist → Workflow gate wiring [integration]
└── Task 37: Notification event generators wiring [integration]

Wave 6 (After Wave 5 — testing):
├── Task 38: Unit tests — fleet module [test]
├── Task 39: Unit tests — evidence module [test]
├── Task 40: Unit tests — notifications module [test]
├── Task 41: Unit tests — checklist module [test]
├── Task 42: Unit tests — workflow cockpit [test]
├── Task 43: Integration tests — backend API [test]
├── Task 44: Playwright E2E — core flow scenarios [test]
└── Task 45: Accessibility audit [test]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user approval):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality + gates verification
├── Task F3: Full E2E smoke test execution
├── Task F4: Scope fidelity check
└── → Present results → Get explicit user approval
```

---

## TODOs

### Phase 1 — Audit & Quality Gates (Baseline)

- [ ] 1. **Run Complete Verification Pipeline**

  **What to do**:
  - Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run verify` sequentially
  - Document all errors/warnings in each category
  - If any gate fails, fix without changing functional scope
  - Create audit document at `docs/audits/POST_GRADUATION_PROFESSIONALIZATION_AUDIT.md` with current state

  **Must NOT do**:
  - No functional changes during this phase
  - No schema changes
  - No dependency additions

  **Recommended Agent Profile**:
  - **Category**: `quick` — systematic verification execution
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**: N/A — pure verification task

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential pipeline)
  - **Parallel Group**: Wave 1
  - **Blocks**: All Phase 2+ tasks
  - **Blocked By**: None

  **References**:
  - `package.json:scripts` — All verification command definitions
  - `docs/REGLAS_DESARROLLO_CERMONT.md` — Development rules
  - `README.md:Scripts del Monorepo` — Script reference

  **Acceptance Criteria**:
  - [ ] npm run typecheck → exit 0
  - [ ] npm run lint → exit 0
  - [ ] npm run test → all tests pass
  - [ ] npm run build → all packages build
  - [ ] npm run verify → all gates green
  - [ ] Audit document created

  **QA Scenarios**:
  ```
  Scenario: Full verification pipeline passes
    Tool: Bash
    Preconditions: Clean working tree, all deps installed
    Steps:
      1. Run: npm run typecheck
      2. Run: npm run lint
      3. Run: npm run test
      4. Run: npm run build
      5. Run: npm run verify
    Expected Result: All commands exit with code 0
    Evidence: .sisyphus/evidence/task-01-verification-pipeline.log

  Scenario: Audit document created
    Tool: Bash
    Preconditions: Verification complete
    Steps:
      1. Check: Test-Path "docs/audits/POST_GRADUATION_PROFESSIONALIZATION_AUDIT.md"
    Expected Result: File exists and is non-empty
    Evidence: .sisyphus/evidence/task-01-audit-exists.log
  ```

  **Evidence to Capture**:
  - [ ] Full verification output log

  **Commit**: YES (groups with Phase 1)
  - Message: `audit(verification): baseline audit and initial gate fixes`
  - Files: docs/audits/POST_GRADUATION_PROFESSIONALIZATION_AUDIT.md

- [ ] 2. **Audit Current DESIGN.md vs Actual Implementation**

  **What to do**:
  - Read DESIGN.md (root) and docs/design/CERMONT_UIUX_GUIDE.md
  - Audit actual components: Button, Card, Badge, Table, Dialog, FormField
  - Identify gaps between design tokens and implementation
  - Document findings in audit document

  **Must NOT do**:
  - No component changes yet (Phase 2)
  - No token changes

  **Recommended Agent Profile**:
  - **Category**: `writing` — documentation/audit focused
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 3-7)
  - **Blocks**: Task 8 (Design System update)
  - **Blocked By**: None

  **References**:
  - `DESIGN.md` (root) — Current design tokens
  - `docs/design/CERMONT_UIUX_GUIDE.md` — UI/UX guide
  - `frontend/src/components/` — Existing component implementations

  **Acceptance Criteria**:
  - [ ] Design audit section added to POST_GRADUATION_PROFESSIONALIZATION_AUDIT.md

  **QA Scenarios**:
  ```
  Scenario: Design audit completed
    Tool: Bash
    Preconditions: Audit doc exists from Task 1
    Steps:
      1. grep "Design System" docs/audits/POST_GRADUATION_PROFESSIONALIZATION_AUDIT.md
    Expected Result: Design system audit section exists
    Evidence: .sisyphus/evidence/task-02-design-audit.log
  ```

- [ ] 3. **Audit Current Fleet Module**

  **What to do**:
  - Read backend/src/modules/fleet/*.ts
  - Read frontend/src/modules/fleet/*.ts
  - Read packages/shared-types/src/schemas/ for any vehicle schemas
  - Document: existing features, missing features (photos, documents, readiness), code quality
  - Add findings to audit document

  **Must NOT do**:
  - No changes to fleet module yet (Phase 3)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 4-7)
  - **Blocks**: Tasks 15, 20, 25 (Phase 3)
  - **Blocked By**: None

  **References**:
  - `backend/src/modules/fleet/` — Current fleet backend
  - `frontend/src/modules/fleet/` — Current fleet frontend
  - `packages/shared-types/src/schemas/` — Any existing vehicle schemas

  **Acceptance Criteria**:
  - [ ] Fleet audit section added to POST_GRADUATION_PROFESSIONALIZATION_AUDIT.md

- [ ] 4. **Audit Current Evidence Module**

  **What to do**:
  - Read backend/src/modules/evidence/*.ts
  - Read frontend/src/modules/evidences/*.ts, *.tsx
  - Check for camera capture, offline sync, validation flow
  - Document gaps
  - Add findings to audit document

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 16, 21, 26-27 (Phase 4)
  - **Blocked By**: None

  **References**:
  - `backend/src/modules/evidence/` — Evidence backend
  - `frontend/src/modules/evidences/` — Evidence frontend

- [ ] 5. **Audit Current Checklist Module**

  **What to do**:
  - Read backend/src/modules/checklist/*.ts
  - Read frontend/src/modules/checklists/*.ts, *.tsx
  - Check for templates, execution engine, blocking logic
  - Document gaps
  - Add findings to audit document

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 18, 23, 30-31 (Phase 6)
  - **Blocked By**: None

  **References**:
  - `backend/src/modules/checklist/` — Checklist backend
  - `frontend/src/modules/checklists/` — Checklist frontend

- [ ] 6. **Audit Current Notifications Module**

  **What to do**:
  - Read backend/src/modules/notifications/*.ts
  - Read frontend/src/modules/ for any notification UI
  - Check for bell UI, notification page, event generators
  - Document gaps
  - Add findings to audit document

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 17, 22, 28-29 (Phase 5)
  - **Blocked By**: None

  **References**:
  - `backend/src/modules/notifications/` — Notifications backend
  - `frontend/src/modules/` — Search for notification UI components

- [ ] 7. **Audit Current E2E Coverage**

  **What to do**:
  - Run existing E2E tests: `npm run test:e2e -w frontend`
  - Read Playwright config and existing spec files
  - Document: number of scenarios, coverage of 14-step flow, gaps
  - Add findings to audit document

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 44 (Phase 8 E2E expansion)
  - **Blocked By**: None

  **References**:
  - `frontend/playwright*.config.ts` — Playwright configuration
  - `frontend/tests/e2e/` — Existing E2E specs
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — 14-step flow reference



### Phase 2 — Design System Standardization + Shared Schemas

- [ ] 8. **Update DESIGN.md with Full Token System**

  **What to do**:
  - Read current DESIGN.md and docs/design/CERMONT_UIUX_GUIDE.md
  - Standardize all CSS tokens: colors (blue/green/amber/red/gray palette), typography (Inter/Geist Mono), spacing, border-radius, shadows
  - Update token mappings in Tailwind config (check frontend/tailwind.config.ts or CSS files)
  - Ensure semantic naming (--cermont-blue, --cermont-green, --cermont-warn, --cermont-error, --canvas, --surface, --ink, --charcoal, --slate, --muted, --hairline)
  - Document icon system: sizes (20px/24px/28px), circular containers (44px/48px), semantic colors per module type
  - Document button system: primary/secondary/danger/success/ghost, touch targets (44px min)
  - Document card standard: white bg, 1px hairline border, 16px radius, 20-24px padding
  - Document responsive breakpoints and mobile-first rules
  - Update docs/design/CERMONT_UIUX_GUIDE.md to reflect standardization

  **Must NOT do**:
  - No component implementation changes (done in Tasks 9-14)
  - No breaking existing token names without migration

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — design system work
  - **Skills**: [`tailwind-css-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 9-19)
  - **Blocks**: Task 9-14 (if tokens change)
  - **Blocked By**: Task 2 (Design audit)

  **References**:
  - `DESIGN.md` (root) — Current design tokens
  - `docs/design/CERMONT_UIUX_GUIDE.md` — UI/UX guide
  - `frontend/src/app/globals.css` — CSS variables
  - `frontend/tailwind.config.ts` — Tailwind configuration

  **Acceptance Criteria**:
  - [ ] DESIGN.md updated with complete token system
  - [ ] CERMONT_UIUX_GUIDE.md updated to match
  - [ ] CSS variables in globals.css match DESIGN.md tokens
  - [ ] npm run typecheck passes
  - [ ] npm run build passes

  **QA Scenarios**:
  ```
  Scenario: Design tokens are defined
    Tool: Bash
    Preconditions: DESIGN.md updated
    Steps:
      1. grep "cermont-blue" DESIGN.md
      2. grep "cermont-green" DESIGN.md
      3. grep "cermont-warn" DESIGN.md
      4. grep "cermont-error" DESIGN.md
    Expected Result: All 4 color tokens exist with hex values
    Evidence: .sisyphus/evidence/task-08-design-tokens.log

  Scenario: CSS variables match design tokens
    Tool: Bash
    Preconditions: DESIGN.md updated
    Steps:
      1. grep "cermont-blue" frontend/src/app/globals.css
    Expected Result: CSS variables defined in globals.css
    Evidence: .sisyphus/evidence/task-08-css-vars.log
  ```

  **Evidence to Capture**:
  - [ ] Design token completeness verification

  **Commit**: YES (groups with Phase 2)
  - Message: `design(system): standardize design tokens and UI components`

- [ ] 9. **Standardize Button Component**

  **What to do**:
  - Read existing Button implementation in frontend/src/components/
  - Refactor to use standardized tokens: variants (primary/secondary/danger/success/ghost), sizes (sm/md/lg), disabled state, loading state, icon support
  - Ensure 44px minimum touch target
  - Use tailwind-merge + clsx for class composition
  - Ensure accessible: aria-label, focus-visible, keyboard navigation
  - Add documentation within component

  **Must NOT do**:
  - No duplicate Button components
  - No inline styles where tokens exist

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocked By**: Task 8 (design tokens reference)

  **References**:
  - `DESIGN.md` (updated) — Button specs
  - `frontend/src/components/ui/button.tsx` — Existing button
  - `tailwind.config.ts` — Token values

- [ ] 10. **Standardize Card Component**

  **What to do**:
  - Read existing Card implementation
  - Standardize: white bg, 1px hairline border, 16px radius, 20-24px padding, optional shadow
  - Variants: default, interactive (hover), dashboard (blue top border), SLA (green top border)
  - Header slot with circular icon container (44px), title (16-20px weight 600), secondary text in slate
  - Footer slot with action/status
  - Ensure responsive: full width on mobile

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2

- [ ] 11. **Standardize Badge Component**

  **What to do**:
  - Read existing Badge implementation
  - Standardize: variants (info/success/warning/error/neutral), sizes (sm/md), dot indicator option
  - Semantic colors per status type
  - Ensure accessible with text label (not color-only)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2

- [ ] 12. **Standardize FormField Component**

  **What to do**:
  - Read existing FormField implementations
  - Standardize: label, helper text, error message, required indicator, character count
  - Integrate with react-hook-form
  - Ensure accessible: label → input association, aria-describedby for errors, aria-required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2

- [ ] 13. **Standardize Table Responsive Component**

  **What to do**:
  - Read existing Table implementations
  - Create responsive table: horizontal scroll on mobile, card layout on small screens
  - Sortable headers, loading skeleton, empty state
  - Pagination controls
  - Ensure accessible: proper thead/tbody, scope attributes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2

- [ ] 14. **Standardize Dialog Component**

  **What to do**:
  - Read existing Dialog/Modal implementations (likely Radix UI)
  - Standardize: sizes (sm/md/lg/fullscreen), close button, backdrop, focus trap
  - Ensure accessible: aria-modal, aria-labelledby, aria-describedby, Escape key closes
  - Animation via Framer Motion

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2

- [ ] 15. **Vehicle Schemas in shared-types**

  **What to do**:
  - Read existing shared-types schemas structure
  - Create vehicle schemas in `packages/shared-types/src/schemas/vehicle.ts`:
    - VehicleSchema: code, plate, brand, model, line, year, type (enum), status (enum), currentMileage, baseLocation, responsible, observations
    - VehicleDocumentSchema: vehicleId, documentType (enum: SOAT, TECNOMECANICA, INSURANCE, PROPERTY_CARD, FIELD_PERMIT), documentNumber, issueDate, expirationDate, fileUrl, status
    - VehiclePhotoSchema: vehicleId, orderId (optional), photoType (enum: FRONT, BACK, LEFT_SIDE, RIGHT_SIDE, PLATE, ODOMETER, VIN, TIRES, ROAD_KIT, EXTINGUISHER, DAMAGE, OTHER), fileUrl, thumbnailUrl, capturedAt, capturedBy, gps (optional), validationStatus (enum: PENDING, APPROVED, REJECTED), rejectionReason
    - VehicleAssignmentSchema: vehicleId, serviceCaseId, startDate, endDate, status
    - VehicleReadinessSchema: vehicleId, overallStatus (enum: READY, INCOMPLETE, BLOCKED, NOT_EVALUATED), documentChecks, assignmentCheck, maintenanceCheck
  - Export all schemas from package entry point
  - Infer TypeScript types from Zod schemas
  - Write unit tests for schema validation

  **Must NOT do**:
  - No duplicate types in backend or frontend
  - No breaking existing contract structures

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 20 (backend fleet)
  - **Blocked By**: None

  **References**:
  - `packages/shared-types/src/schemas/` — Existing schema patterns
  - `packages/shared-types/src/index.ts` — Schema exports
  - `packages/shared-types/package.json` — Package config
  - `backend/src/modules/fleet/` — Existing fleet for field reference

  **Acceptance Criteria**:
  - [ ] VehicleSchema created and exported
  - [ ] VehicleDocumentSchema created and exported
  - [ ] VehiclePhotoSchema created and exported
  - [ ] VehicleAssignmentSchema created and exported
  - [ ] VehicleReadinessSchema created and exported
  - [ ] npm run typecheck -w @cermont/shared-types passes
  - [ ] npm run test -w @cermont/shared-types passes
  - [ ] npm run build -w @cermont/shared-types passes

  **QA Scenarios**:
  ```
  Scenario: Vehicle schema validates correct data
    Tool: Bash
    Preconditions: Package builds
    Steps:
      1. Run: npx tsx -e "import { VehicleSchema } from '@cermont/shared-types'; console.log(VehicleSchema.safeParse({ code: 'VH001', plate: 'ABC123', brand: 'Toyota', model: 'Hilux', line: '4x4', year: 2024, type: 'camioneta', status: 'disponible', currentMileage: 15000 }).success)"
    Expected Result: true
    Evidence: .sisyphus/evidence/task-15-vehicle-schema-valid.log

  Scenario: Vehicle schema rejects invalid status
    Tool: Bash
    Preconditions: Package builds
    Steps:
      1. Run: npx tsx -e "import { VehicleSchema } from '@cermont/shared-types'; console.log(VehicleSchema.safeParse({ code: 'VH001', plate: 'ABC123', status: 'invalid_status' }).success)"
    Expected Result: false
    Evidence: .sisyphus/evidence/task-15-vehicle-schema-invalid.log
  ```

  **Evidence to Capture**:
  - [ ] Schema unit test output
  - [ ] TypeScript compilation output

- [ ] 16. **Evidence Camera Schemas in shared-types**

  **What to do**:
  - Create evidence camera schemas in `packages/shared-types/src/schemas/evidence.ts`:
    - EvidenceCaptureMetadataSchema: capturedAt, capturedBy, deviceInfo, userAgent, gpsAccuracy, serviceCaseId, orderId, step, phase, category (enum: BEFORE, DURING, AFTER, ISSUE, CORRECTION, HSE, VEHICLE, TOOL, EQUIPMENT, CHECKLIST, CLIENT_SIGNATURE, DOCUMENT_SUPPORT, OTHER), checklistItemId (optional)
    - EvidenceBlobSchema: clientMutationId, data (base64), mimeType, thumbnail (base64), metadata
    - EvidenceValidationSchema: evidenceId, validationStatus (PENDING, APPROVED, REJECTED), reviewedBy, reviewedAt, rejectionReason, comments
    - EvidenceSyncStatusSchema: evidenceId, syncStatus (PENDING, SYNCING, SYNCED, ERROR), errorMessage, retryCount

  **Must NOT do**:
  - No breaking existing evidence schemas
  - No storing raw blobs in shared-types (metadata only)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 21, 26-27 (Phase 4)

  **References**:
  - `packages/shared-types/src/schemas/` — Existing schema patterns
  - `backend/src/modules/evidence/` — Evidence backend for field reference

- [ ] 17. **Notification Schemas in shared-types**

  **What to do**:
  - Create notification schemas in `packages/shared-types/src/schemas/notification.ts`:
    - NotificationSchema: id, recipientUserId, actorUserId (optional), type (enum with all event types), title, message, severity (INFO, SUCCESS, WARNING, ERROR), status (UNREAD, READ, ARCHIVED), linkTo, entityType, entityId, createdAt, readAt, metadata, expiresAt (optional)
    - NotificationEventTypes enum: ORDER_ASSIGNED, PLANNING_PENDING, PLANNING_APPROVED, PLANNING_BLOCKED, CHECKLIST_INCOMPLETE, EVIDENCE_UPLOADED, EVIDENCE_APPROVED, EVIDENCE_REJECTED, DOCUMENT_EXPIRING, VEHICLE_DOCUMENT_EXPIRING, CERTIFICATION_EXPIRED, TOOL_UNAVAILABLE, SES_APPROVED, SES_REJECTED, INVOICE_APPROVED, PAYMENT_REGISTERED, OFFLINE_SYNC_FAILED, SYNC_COMPLETED
    - NotificationFilterSchema: status, type, fromDate, toDate, page, limit

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 22, 28-29 (Phase 5)

- [ ] 18. **Checklist Schemas in shared-types**

  **What to do**:
  - Create checklist schemas in `packages/shared-types/src/schemas/checklist.ts`:
    - ChecklistTemplateSchema: code, name, description, serviceType, version, status (DRAFT, ACTIVE, ARCHIVED), requiredRoles, effectiveFrom, createdBy, approvedBy
    - ChecklistSectionSchema: title, description, order, items[]
    - ChecklistItemSchema: code, label, helpText, type (BOOLEAN, TRI_STATE, NUMERIC, TEXT, PHOTO_REQUIRED, SELECT, MULTI_SELECT, SIGNATURE, MEASUREMENT), required, requiresPhoto, requiresCommentOnFail, acceptableRange, options, blockingIfFailed, linkedEvidenceIds, linkedAssetId, linkedVehicleId, linkedToolId
    - ChecklistExecutionSchema: serviceCaseId, workOrderId, executionSessionId, technicianId, templateId, startedAt, completedAt, syncStatus, status (NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED, APPROVED, REJECTED)
    - ChecklistItemResultSchema: itemId, status (PENDING, COMPLIANT, NON_COMPLIANT, NOT_APPLICABLE, NEEDS_CORRECTION), comment, photoEvidenceIds, numericValue (optional), selectedOptions (optional), completedAt

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 23, 30-31 (Phase 6)

- [ ] 19. **Workflow Cockpit Schemas in shared-types**

  **What to do**:
  - Create workflow schemas in `packages/shared-types/src/schemas/workflow.ts`:
    - WorkflowStepSchema: stepNumber (1-14), name, status (LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED, BLOCKED, REJECTED), assignedRole, completedAt, completedBy
    - WorkflowGatesSchema: serviceCaseId, prerequisites[], blockers[], overallStatus
    - WorkflowTimelineEventSchema: serviceCaseId, stepNumber, event, description, actorId, timestamp, metadata
    - WorkflowCockpitSchema: serviceCaseId, currentStep, steps[], blockers[], allowedActions[]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 24, 32 (Phase 7)



### Phase 3 — Backend: Fleet Enhancement

- [ ] 20. **Fleet Backend — Photos, Documents, Readiness Gates**

  **What to do**:
  - Enhance existing `backend/src/modules/fleet/` module:
    - Add vehicle document tracking: CRUD for documents (SOAT, technomechanics, insurance, etc.), expiration alerts
    - Add vehicle photo management: upload, serve, thumbnail generation via sharp, validation workflow
    - Add vehicle readiness evaluation: check documents (expired?), assignment conflicts (same date?), maintenance status, return GREEN/YELLOW/RED status
    - Add vehicle assignment integration with planning-packet module
    - Add readiness gate endpoint: GET /fleet/:id/readiness
    - Add document conflict detection: vehicle not available if assigned to another order same date, maintenance, expired documents, blocked
  - Use existing Multer + Sharp infrastructure for file handling
  - Use existing AppError hierarchy for errors
  - Add Zod validation on all new routes using shared schemas from Task 15

  **Must NOT do**:
  - No breaking existing fleet endpoints
  - No removing existing fleet functionality
  - No storing raw blobs in MongoDB (use filesystem uploads + references)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — backend module enhancement
  - **Skills**: [`nodejs-express-server`, `zod`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 21-24)
  - **Blocked By**: Task 15 (vehicle schemas), Task 3 (fleet audit)

  **References**:
  - `backend/src/modules/fleet/fleet.service.ts` — Existing fleet service
  - `backend/src/modules/fleet/fleet.controller.ts` — Existing fleet controller
  - `backend/src/modules/fleet/fleet.routes.ts` — Existing fleet routes
  - `packages/shared-types/src/schemas/vehicle.ts` — New schemas from Task 15
  - `backend/src/modules/evidence/evidence.service.ts` — File upload patterns
  - `backend/src/common/` — AppError, middlewares

  **Acceptance Criteria**:
  - [ ] Vehicle documents CRUD endpoints working
  - [ ] Vehicle photo upload + thumbnail generation working
  - [ ] Vehicle readiness endpoint returns green/yellow/red/gray
  - [ ] Vehicle conflict detection for assignments working
  - [ ] npm run typecheck -w backend passes
  - [ ] npm run test -w backend passes
  - [ ] npm run build -w backend passes

  **QA Scenarios**:
  ```
  Scenario: Vehicle readiness returns GREEN for fully compliant vehicle
    Tool: Bash (curl)
    Preconditions: Backend running, vehicle exists with all documents valid
    Steps:
      1. curl -s http://127.0.0.1:4000/api/fleet/VH001/readiness | grep "overallStatus"
    Expected Result: Returns GREEN or READY status
    Evidence: .sisyphus/evidence/task-20-readiness-green.log

  Scenario: Vehicle readiness returns RED for expired document
    Tool: Bash (curl)
    Preconditions: Vehicle exists with an expired document
    Steps:
      1. curl -s http://127.0.0.1:4000/api/fleet/VH002/readiness
    Expected Result: Returns RED or BLOCKED status with document detail
    Evidence: .sisyphus/evidence/task-20-readiness-red.log
  ```

  **Evidence to Capture**:
  - [ ] Readiness endpoint responses
  - [ ] Backend test output

  **Commit**: YES (groups with Phase 3)
  - Message: `feat(vehicles): enhance fleet module with photos, documents, readiness`

### Phase 4 — Backend: Evidence Camera & Validation

- [ ] 21. **Evidence Backend — Camera Upload + Validation Flow**

  **What to do**:
  - Enhance existing `backend/src/modules/evidence/` module:
    - Add evidence upload endpoint with metadata (capturedAt, capturedBy, deviceInfo, GPS, category, phase, checklistItemId)
    - Add image compression pipeline using sharp (resize to 1920px max, JPEG quality 80%)
    - Add thumbnail generation (320px width, WebP)
    - Add evidence validation endpoints: PATCH /evidences/:id/approve, PATCH /evidences/:id/reject (requires rejectionReason)
    - Add evidence categorization by phase (site_visit, planning, execution, technical_report, delivery_record, SES, invoice, closure)
    - Add evidence lock: prevent deletion if used in report or delivery record
    - Add evidence-by-entity endpoint: GET /evidences?serviceCaseId=X&phase=Y
    - Use existing Multer + file upload infrastructure
    - Use sharp from existing dependency

  **Must NOT do**:
  - No breaking existing evidence endpoints
  - No removing existing evidence functionality
  - No duplicating existing routes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 20, 22-24)
  - **Blocked By**: Task 16 (evidence schemas), Task 4 (evidence audit)

  **References**:
  - `backend/src/modules/evidence/` — Existing evidence module
  - `packages/shared-types/src/schemas/evidence.ts` — New schemas from Task 16
  - `backend/src/modules/files/` — Existing file handling patterns

### Phase 5 — Backend: Notifications

- [ ] 22. **Notification Backend — Endpoints + Central Service**

  **What to do**:
  - Enhance existing `backend/src/modules/notifications/` module:
    - Ensure CRUD endpoints: GET /notifications (with filters + pagination), GET /notifications/unread-count, PATCH /notifications/:id/read, PATCH /notifications/read-all
    - Create centralized `NotificationService` with helper methods:
      - notifyEvidenceRejected(evidenceId, technicianId, reason)
      - notifyEvidenceApproved(evidenceId, technicianId)
      - notifyOrderAssigned(orderId, technicianId, assignedBy)
      - notifyVehicleDocumentExpiring(vehicleId, documentType, daysRemaining)
      - notifyChecklistBlocked(executionId, technicianId, blockedReason)
      - notifyOfflineSyncFailed(evidenceId, userId, errorMessage)
      - notifySESApproved(sesId, creatorId)
      - notifyPaymentRegistered(paymentId, userId)
    - Add seed/test endpoint: POST /notifications/test (admin/dev only)
    - Add Mongoose model for Notification with proper indexes (recipientUserId + status, createdAt)
    - Add TTL index for expiresAt
    - Wire notification creation into evidence approval/rejection flow
    - Wire notification creation into order assignment flow

  **Must NOT do**:
  - No breaking existing notification endpoints
  - No duplicate notification types

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocked By**: Task 17 (notification schemas), Task 6 (notifications audit)

  **References**:
  - `backend/src/modules/notifications/` — Existing notifications
  - `packages/shared-types/src/schemas/notification.ts` — New schemas from Task 17
  - `backend/src/modules/evidence/evidence.service.ts` — Integration point for evidence notifications

### Phase 6 — Backend: Checklists

- [ ] 23. **Checklist Backend — Templates + Execution Engine**

  **What to do**:
  - Enhance existing `backend/src/modules/checklist/` module:
    - Add ChecklistTemplate CRUD: create/activate/archive templates with sections and items
    - Add ChecklistExecution engine:
      - POST /checklists/executions — Start execution from template for a service case
      - PATCH /checklists/executions/:id/items/:itemId — Update item result (status, comment, photo evidence)
      - PATCH /checklists/executions/:id/complete — Finalize execution (validates all required items done, blocking items compliant)
      - GET /checklists/executions/:id — Get execution detail with all item results
    - Add blocking logic engine: if blockingIfFailed item is NON_COMPLIANT, execution status = BLOCKED, return list of blockers
    - Add override authorization: PATCH /checklists/executions/:id/override — Allows supervisor to override a block (audit logged)
    - Add progress calculation: GET /checklists/executions/:id/progress — returns % complete, required items count, completed count
    - Wire checklist blocking to workflow gates (Task 24 integration planning)

  **Must NOT do**:
  - No breaking existing checklist endpoints
  - No storing business logic in controllers

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocked By**: Task 18 (checklist schemas), Task 5 (checklist audit)

  **References**:
  - `backend/src/modules/checklist/` — Existing checklist module
  - `packages/shared-types/src/schemas/checklist.ts` — New schemas from Task 18

### Phase 7 — Backend: Workflow Cockpit

- [ ] 24. **Workflow Cockpit Backend — Gates + Timeline**

  **What to do**:
  - Create or enhance workflow service in `backend/src/modules/` (check if workflow module exists at `backend/src/modules/workflow/` or `backend/src/modules/service-cases/`):
    - Add workflow state machine for 14 steps: map current serviceCase status to 14-step progress
    - Add gate validation per step transition:
      - Planning → Execution: validate personnel assigned, tools, equipment, vehicle (if needed), vehicle available, vehicle documents valid, personnel certifications valid, AST/ATS loaded, permits loaded, kit ready, preoperational checklist defined
      - Complete Execution: validate checklist complete, minimum evidence uploaded, observations recorded, labor hours recorded (if applicable), materials used recorded (if applicable)
      - Generate Report: validate evidence approved, checklist approved/closed, no critical blockers
      - Close Administrative: validate delivery record, SES, invoice, payment, support documents
    - Add timeline events recording: each step transition creates a WorkflowTimelineEvent
    - Add cockpit endpoint: GET /workflow/cockpit/:serviceCaseId — returns current step, all 14 step statuses, blockers, allowed actions per role, timeline

  **Must NOT do**:
  - No modifying existing state machine in service-cases module without migration plan
  - No duplicate workflow logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocked By**: Task 19 (workflow schemas), Tasks 3-6 (module audits)

  **References**:
  - `backend/src/modules/service-cases/` — Current service case state management
  - `backend/src/modules/order/` — Current order workflow logic
  - `packages/shared-types/src/schemas/workflow.ts` — New schemas from Task 19
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — 14-step flow specification

  **Acceptance Criteria**:
  - [ ] Cockpit endpoint returns 14-step status per service case
  - [ ] Gate validation prevents illegal step transitions
  - [ ] Timeline events recorded for each transition
  - [ ] npm run typecheck -w backend passes
  - [ ] npm run test -w backend passes



### Phase 3 — Frontend: Fleet UI

- [ ] 25. **Fleet Frontend — Photos UI + Document Tracking**

  **What to do**:
  - Enhance existing `frontend/src/modules/fleet/`:
    - Create vehicle detail page with tabs: Info, Documents, Photos, Assignments, Readiness
    - Documents tab: list of documents with expiration dates, color-coded status (green = valid, yellow = expiring soon, red = expired), upload button, file preview
    - Photos tab: photo gallery by type, upload button (file picker), thumbnail grid view, capture status badge (pending/approved/rejected)
    - Readiness tab: color-coded readiness gate (GREEN/RED/YELLOW/GRAY), checklist of requirements (documents, assignment, maintenance), expandable details per check
    - Vehicle list page with readiness status indicator per vehicle, filterable by status
    - Add TanStack Query hooks (queries.ts) for all new fleet endpoints
    - Add API service methods (api/fleet-api.ts) for all new fleet endpoints
    - Use standardized components from Phase 2 (Card, Badge, Table, Button, FormField)
    - Ensure responsive: mobile card layout, tabs collapse to accordion on mobile

  **Must NOT do**:
  - No breaking existing fleet UI
  - No duplicating existing query keys

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — frontend UI with data
  - **Skills**: [`tailwind-css-patterns`, `typescript-advanced-types`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 26-32)
  - **Blocked By**: Task 20 (fleet backend), Task 15 (vehicle schemas), Tasks 9-14 (standardized components)

  **References**:
  - `frontend/src/modules/fleet/` — Existing fleet frontend
  - `frontend/src/modules/orders/` — Reference module pattern (hooks, api, UI)
  - `packages/shared-types/src/schemas/vehicle.ts` — Schemas from Task 15
  - `frontend/src/components/` — Standardized components from Tasks 9-14

  **Acceptance Criteria**:
  - [ ] Vehicle detail page with 5 tabs renders
  - [ ] Document tracking shows color-coded expiration status
  - [ ] Photo gallery shows thumbnails with validation badges
  - [ ] Readiness tab shows GREEN/YELLOW/RED/GRAY status
  - [ ] npm run typecheck -w frontend passes
  - [ ] npm run lint -w frontend passes
  - [ ] npm run test -w frontend passes

  **QA Scenarios**:
  ```
  Scenario: Fleet readiness shows visual status indicator
    Tool: Playwright
    Preconditions: Backend running, fleet data seeded
    Steps:
      1. Navigate to /fleet
      2. Look for readiness badge/indicator on vehicle list
    Expected Result: Readiness gate visible with color and label (Listo/Incompleto/Bloqueado/No evaluado)
    Evidence: .sisyphus/evidence/task-25-fleet-readiness.png
  ```

  **Evidence to Capture**:
  - [ ] Fleet pages screenshots
  - [ ] Frontend test output

  **Commit**: YES (groups with Phase 3)
  - Message: `feat(vehicles): enhance fleet module with photos and documents UI`

### Phase 4 — Frontend: Evidence Camera & Gallery

- [ ] 26. **EvidenceCameraCapture Component**

  **What to do**:
  - Create reusable `EvidenceCameraCapture` component in `frontend/src/modules/evidences/components/`:
    - "Take Photo" button → opens camera interface using `<input type="file" accept="image/*" capture="environment">`
    - "Upload from Gallery" button → standard file picker without capture attribute
    - Preview before save: show captured image, allow retake
    - Image compression client-side using Canvas API (resize to 1920px max, JPEG quality 0.8)
    - Thumbnail generation (320px width)
    - GPS capture: attempt navigator.geolocation.getCurrentPosition, handle permission denial gracefully
    - Metadata collection: capturedAt, capturedBy (from auth store), deviceInfo, userAgent, serviceCaseId, orderId, step, phase, category, checklistItemId
    - Category selector: dropdown with evidence categories (before/during/after/issue/correction/hse/vehicle/tool/equipment/checklist/client_signature/document_support/other)
    - Phase selector: dropdown with workflow phases (site_visit/planning/execution/technical_report/delivery_record/SES/invoice/closure)
    - Save flow:
      1. Show saving indicator
      2. If online → POST to /api/evidences with FormData
      3. If offline → store to IndexedDB (existing offline-queue.ts)
      4. Generate clientMutationId to prevent duplicates
      5. Show sync status badge (pending/syncing/synced/error)
    - Emit onSave event with result data
    - Fallback: if camera not available, show only gallery/upload option
    - Responsive: full-width on mobile, centered modal on desktop

  **Must NOT do**:
  - No direct fetch calls — use apiClient
  - No storing large blobs in component state unnecessarily
  - No using navigator.mediaDevices.getUserMedia unless simple capture doesn't suffice

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — interactive component
  - **Skills**: [`tailwind-css-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocked By**: Task 21 (evidence backend), Task 16 (evidence schemas), Tasks 9-14 (standardized components)

  **References**:
  - `frontend/src/modules/evidences/` — Existing evidence module
  - `frontend/src/lib/pwa/offline-queue.ts` — Offline queue for IndexedDB storage
  - `frontend/src/store/auth.store.ts` — For capturedBy user info
  - `frontend/src/lib/http/api-client.ts` — API client wrapper
  - `packages/shared-types/src/schemas/evidence.ts` — Schemas from Task 16

  **Acceptance Criteria**:
  - [ ] Component renders with "Take Photo" and "Upload from Gallery" buttons
  - [ ] Image preview shown before save
  - [ ] Category and phase selectors present
  - [ ] Offline saves to IndexedDB, online POSTs to API
  - [ ] Sync status badge visible after save
  - [ ] npm run typecheck passes
  - [ ] npm run lint passes

  **QA Scenarios**:
  ```
  Scenario: Evidence capture saves image with metadata
    Tool: Playwright
    Preconditions: User logged in, on an evidence-capture page
    Steps:
      1. Click "Upload from Gallery" button
      2. Select test image file
      3. Fill category dropdown: "ejecucion"
      4. Fill phase dropdown: "site_visit"
      5. Click "Guardar" button
    Expected Result: Evidence saved, sync status badge shows "Sincronizada"
    Evidence: .sisyphus/evidence/task-26-evidence-capture.png
  ```

  **Evidence to Capture**:
  - [ ] Component screenshots (before/after capture)

- [ ] 27. **Evidence Gallery + Validation UI**

  **What to do**:
  - Enhance existing evidence gallery in `frontend/src/modules/evidences/`:
    - Gallery grid view with thumbnails, categorized by phase/category
    - Image lightbox/large preview on click
    - Evidence validation controls:
      - For supervisors/residentes: Approve/Reject buttons on each evidence
      - Reject requires reason text input
      - Status badge: PENDING (yellow), APPROVED (green), REJECTED (red) with reason tooltip
    - Filter by: status (all/pending/approved/rejected), category, phase, date range
    - Evidence detail view: full metadata (capturedAt, capturedBy, GPS, device, category, phase)
    - Evidence lock indicator: if locked (used in report), show lock icon + tooltip
    - Evidence deletion: only if NOT locked (used in report/acta)
    - Loading skeleton, empty state when no evidence, error state

  **Must NOT do**:
  - No duplicate gallery components
  - No modifying evidence that's locked

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **Blocked By**: Task 21 (evidence backend), Task 16 (evidence schemas)

### Phase 5 — Frontend: Notifications UI

- [ ] 28. **Notification Bell UI + Dropdown**

  **What to do**:
  - Create notification bell component in `frontend/src/modules/`:
    - Bell icon (lucide-react Bell) with unread count badge (red circle with number)
    - Dropdown panel: last 5 notifications with:
      - Severity indicator (icon + color: info=blue, success=green, warning=amber, error=red)
      - Title + message (truncated)
      - Relative time (date-fns formatDistanceToNow)
      - "Mark as read" button per notification
      - "Mark all as read" link
      - "View all →" link to /notifications page
    - Auto-update: poll unread count every 30s OR use mutation-based invalidation
    - Click on notification → navigate to linkTo URL
    - Count stored in Zustand store for immediate access
    - Responsive: dropdown full-width on mobile

  **Must NOT do**:
  - No polling that causes excessive API calls
  - No decorative bell that doesn't work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **Blocked By**: Task 22 (notification backend), Task 17 (notification schemas), Tasks 9-14 (standardized components)

- [ ] 29. **/notifications Page**

  **What to do**:
  - Create `/notifications` page:
    - Full notification list with pagination
    - Filters: status (unread/read/archived), type, date range
    - Group by date (Today, Yesterday, This Week, Older)
    - Bulk actions: Mark selected as read, Mark all as read, Archive
    - Each row: icon by severity, title, message, relative time, status badge
    - Click → mark as read + navigate to linkTo
    - Loading skeleton, empty state ("No notifications"), error state
    - Add RBAC: all authenticated users can view their own notifications

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **Blocked By**: Task 22 (notification backend), Task 28 (bell component reference)

### Phase 6 — Frontend: Checklists UI

- [ ] 30. **Checklist Execution Mobile UI**

  **What to do**:
  - Create mobile-first checklist execution view in `frontend/src/modules/checklists/`:
    - Progress bar: X of Y items complete, color changes (red <50%, yellow <80%, green >=80%)
    - Required items counter: "N required items remaining"
    - Sections collapsible: each section expandable with title + item count
    - Per-item UI based on type:
      - BOOLEAN: toggle switch (compliant/non-compliant)
      - TRI_STATE: 3 buttons (compliant/non-compliant/not-applicable)
      - NUMERIC: number input with acceptable range feedback
      - TEXT: text area
      - PHOTO_REQUIRED: camera button + thumbnail preview
      - SELECT: dropdown
      - MULTI_SELECT: checkbox group
      - SIGNATURE: signature pad area
      - MEASUREMENT: number input + unit select
    - Per-item camera button: opens EvidenceCameraCapture with checklistItemId pre-set, category=checklist
    - Required indicator: red asterisk
    - Failure comment: if requiresCommentOnFail + non_compliant → show text field
    - Blocking item indicator: warning icon + "Blocks completion"
    - Auto-save: save item result to IndexedDB on change (debounced)
    - Offline indicator: shows when working offline
    - "Finalizar" button: disabled if required items pending or blocking items non-compliant
    - Summary screen before final submit: show all items, highlight issues, confirm Submit
    - Error state: show specific error message if submission fails

  **Must NOT do**:
  - No business logic in UI — use service/domain helpers
  - No infinite loading states

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **Blocked By**: Task 23 (checklist backend), Task 18 (checklist schemas), Tasks 9-14 (standardized components)

  **References**:
  - `frontend/src/modules/checklists/` — Existing checklists frontend
  - `packages/shared-types/src/schemas/checklist.ts` — Schemas from Task 18
  - EvidenceCameraCapture from Task 26 — Integrate for photo-per-item

- [ ] 31. **Checklist Template Manager**

  **What to do**:
  - Create checklist template management UI:
    - Template list: name, service type, version, status (draft/active/archived), actions
    - Template editor: add/remove/reorder sections and items
    - Per-item configuration: type, required, blockingIfFailed, requiresPhoto, requiresCommentOnFail, options (for select types), acceptableRange (for numeric)
    - Template versioning: create new version from existing, activate/archive
    - Template preview: show rendered template as it would appear during execution
    - Role assignment: which roles can use this template
    - Loading, empty, error states

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **Blocked By**: Task 23 (checklist backend), Task 18 (checklist schemas)

### Phase 7 — Frontend: Workflow Cockpit

- [ ] 32. **Workflow Cockpit UI (14-Step Panel)**

  **What to do**:
  - Create workflow cockpit view:
    - 14-step timeline/progress panel showing all steps from "Solicitud" to "Pago"
    - Per-step status: LOCKED (gray), AVAILABLE (blue outline), IN_PROGRESS (blue fill), COMPLETED (green check), BLOCKED (red with warning icon), REJECTED (red X)
    - Click step → expand details: what's required, current blockers, assigned role, completion date
    - Blockers panel: if current step has blockers, show red list with descriptions
    - Allowed actions per step based on role (from RBAC):
      - gerente/residente/supervisor can override blockers
      - operador/tecnico can complete execution steps
      - administrativo can close financial steps
    - Timeline: chronological event log showing step transitions with actor, timestamp, description
    - Responsive: vertical timeline on mobile, horizontal on desktop
    - Loading skeleton, error state when service case not found
    - Add RBAC checks: only authorized roles can see/execute actions

  **Must NOT do**:
  - No duplicating existing workflow displays
  - No hardcoded roles

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **Blocked By**: Task 24 (workflow backend), Task 19 (workflow schemas), Tasks 9-14 (standardized components)

  **References**:
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — 14-step flow
  - `@cermont/domain` — Role definitions
  - `packages/shared-types/src/schemas/workflow.ts` — Schemas from Task 19

### Phase 5 — Integration: Offline & Event Wiring

- [ ] 33. **Evidence Offline Sync Queue Integration**

  **What to do**:
  - Integrate EvidenceCameraCapture with existing offline queue (`offline-queue.ts`):
    - When offline: store evidence blob + metadata to IndexedDB
    - Generate clientMutationId for deduplication
    - Enqueue sync operation: { type: 'evidence_upload', payload, clientMutationId }
    - Show sync status on evidence: pending-sync (clock icon), syncing (spinner), synced (check), error (warning)
    - On reconnection: outbox processor picks up queue, uploads via API
    - On upload success: mark as synced, update evidence UI
    - On upload failure: retry with exponential backoff, show error state after max retries
    - On duplicate detection (matching clientMutationId on server): skip, mark synced
    - Conflict handling: server response indicates duplicate, update local ID

  **Must NOT do**:
  - No losing evidence blobs on sync failure
  - No silent overwrites on conflicts

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (integration)

  **Blocked By**: Task 26 (EvidenceCameraCapture), existing offline-queue.ts

  **References**:
  - `frontend/src/lib/pwa/offline-queue.ts` — Existing offline queue
  - `frontend/src/store/queueStore.ts` — Queue state store

- [ ] 34. **Checklist Offline Auto-Save**

  **What to do**:
  - Add offline auto-save for checklist execution:
    - On item change: save partial result to IndexedDB (checklistId, itemId, status, comment, photoIds)
    - Debounce writes (1s after last change)
    - On reconnect: sync completed checklist, upload pending photos
    - On page reload: restore partial execution state from IndexedDB
    - Show "Auto-guardado" indicator with timestamp
    - Handle conflict: if checklist already submitted, warn user

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5

  **Blocked By**: Task 30 (checklist execution UI)

- [ ] 35. **Fleet Readiness Gates Integration**

  **What to do**:
  - Integrate fleet readiness into planning-packet module:
    - When creating/editing planning, show vehicle selector filtered by readiness
    - Grey out unavailable vehicles with reason tooltip (expired docs, maintenance, assigned elsewhere)
    - Add vehicle readiness badge to planning view
    - Check readiness before allowing transition to execution
    - If vehicle not ready, prevent execution start with clear error message listing blockers

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5

  **Blocked By**: Task 25 (fleet UI), Task 20 (fleet backend), Task 30-31 (planning-packet module dependency)

- [ ] 36. **Evidence → Checklist → Workflow Gate Wiring**

  **What to do**:
  - Wire together the phase transitions:
    - Evidence approval event → if all required evidence for phase approved, update workflow gate
    - Checklist completion event → if checklist approved, update workflow gate
    - Workflow cockpit reads gate statuses from evidence + checklist + fleet + planning modules
    - Gate validation endpoint: `GET /workflow/gates/:serviceCaseId` — returns all passage requirements with pass/fail per check
    - Wire notification: when workflow step transitions (e.g., planning → execution ready), notify assigned users

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5

  **Blocked By**: Tasks 32 (workflow cockpit), 24 (workflow backend), 27 (evidence validation), 30 (checklist execution)

- [ ] 37. **Notification Event Generators Wiring**

  **What to do**:
  - Wire NotificationService into event-producing modules:
    - Evidence service: on upload → notify supervisors; on approve/reject → notify technician
    - Order service: on assign → notify technician
    - Fleet service: on document expiring → notify fleet manager
    - Checklist service: on block → notify technician + supervisor
    - SES service: on approve/reject → notify creator
    - Invoice/payment service: on approve/pay → notify requester
    - Online/offline: on sync failure → notify user
  - Each call to NotificationService should be in the service layer, not controllers

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5

  **Blocked By**: Task 22 (notification backend), Tasks 20-24 (all backend modules)



### Phase 8 — Testing

- [ ] 38. **Unit Tests — Fleet Module**

  **What to do**:
  - Write unit tests for fleet module:
    - Vehicle document validation (expired/near expiry/valid detection)
    - Vehicle readiness calculation (green/yellow/red/gray logic)
    - Vehicle assignment conflict detection (same vehicle, same date, different order)
    - Vehicle photo type enum validation
    - Readiness gate conditions (documents + assignment + maintenance)
  - Use existing Vitest configuration in backend
  - Follow existing test patterns in `backend/src/tests/`

  **Must NOT do**:
  - No testing through HTTP — unit test service layer only
  - No database dependency in unit tests (mock Mongoose)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 39-45)
  - **Blocked By**: Task 20 (fleet backend)

  **References**:
  - `backend/src/tests/` — Existing test patterns
  - `backend/vitest.config.ts` — Vitest configuration
  - `backend/src/modules/fleet/` — Fleet service to test

- [ ] 39. **Unit Tests — Evidence Module**

  **What to do**:
  - Write unit tests:
    - Evidence metadata validation (required fields, GPS format, category enum)
    - Evidence approval flow (pending → approved/rejected, rejectionReason required)
    - Evidence lock check (used in report prohibits deletion)
    - Image compression configuration (sharp params)
    - clientMutationId deduplication

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6
  - **Blocked By**: Task 21 (evidence backend)

- [ ] 40. **Unit Tests — Notifications Module**

  **What to do**:
  - Write unit tests:
    - Notification CRUD (create, read, mark read, mark all read)
    - Unread count calculation
    - Event type enum validation
    - Notification creation from each event generator helper
    - TTL expiration logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6
  - **Blocked By**: Task 22 (notification backend)

- [ ] 41. **Unit Tests — Checklist Module**

  **What to do**:
  - Write unit tests:
    - Item status validation (pending/compliant/non-compliant/not-applicable/needs-correction)
    - Required items completion gate
    - BlockingIfFailed detection (non-compliant blocking item → BLOCKED status)
    - Requirement logic: photo_required needs evidence, requiresCommentOnFail needs comment
    - Progress calculation formula
    - Override authorization (supervisor override, audit presence)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6
  - **Blocked By**: Task 23 (checklist backend)

- [ ] 42. **Unit Tests — Workflow Cockpit**

  **What to do**:
  - Write unit tests:
    - 14-step state machine transitions (legal/illegal transitions)
    - Gate validation for each step boundary (planning→execution, execution→report, closure)
    - Allowed actions per role per step
    - Timeline event recording

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6
  - **Blocked By**: Task 24 (workflow backend)

- [ ] 43. **Integration Tests — Backend API**

  **What to do**:
  - Write integration tests using Supertest (existing pattern):
    - Fleet: document CRUD, photo upload, readiness endpoint
    - Evidence: upload with metadata, approve/reject, lock check
    - Notifications: list, filter, unread count, mark read
    - Checklists: create template, start execution, complete items, finalize
    - Workflow: cockpit data, gate validation
  - Use existing test setup in `backend/src/tests/`
  - Mock MongoDB with mongodb-memory-server if used in existing tests

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6

  **Blocked By**: Tasks 38-42 (unit tests), Tasks 20-24 (backends)

- [ ] 44. **Playwright E2E — Core Flow Scenarios**

  **What to do**:
  - Create Playwright E2E test specs covering the full 14-step professional flow:
    - `fleet-vehicle-lifecycle.spec.ts`: Create vehicle → add documents → upload photos → check readiness → assign to order
    - `evidence-camera.spec.ts`: Open evidence capture → take/upload photo → add metadata → save → verify gallery
    - `evidence-validation.spec.ts`: Technician uploads → supervisor rejects → technician views rejection reason → supervisor approves
    - `notification-bell.spec.ts`: Trigger notification → bell shows count → dropdown shows notification → mark as read → count decreases
    - `checklist-execution.spec.ts`: Open checklist → complete items → take required photos → verify blocking logic → finalize
    - `workflow-cockpit.spec.ts`: View 14-step panel → see current step status → see blockers → complete step → verify transition
    - `responsive-mobile.spec.ts`: Resize to mobile → verify sidebar drawer, card layout, form usability
    - `offline-evidence.spec.ts`: Go offline → capture evidence → verify stored offline → reconnect → verify synced
  - Use existing Playwright configuration
  - Follow existing test patterns in `frontend/tests/e2e/`
  - Each spec should be independent (no shared state)
  - Use test tags: @smoke for critical path, @slow for long-running

  **Must NOT do**:
  - No flaky selectors — use data-testid attributes or stable text selectors
  - No shared test state between specs

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — E2E test creation
  - **Skills**: [`playwright-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on all modules)
  - **Parallel Group**: Wave 6 (sequential within)
  - **Blocked By**: Tasks 25-32 (all frontend UIs), Tasks 33-37 (all integrations)

  **References**:
  - `frontend/tests/e2e/` — Existing E2E specs
  - `frontend/playwright.config.ts` — Playwright configuration
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — 14-step flow for scenario design

  **Acceptance Criteria**:
  - [ ] fleet-vehicle-lifecycle.spec.ts passes
  - [ ] evidence-camera.spec.ts passes
  - [ ] evidence-validation.spec.ts passes
  - [ ] notification-bell.spec.ts passes
  - [ ] checklist-execution.spec.ts passes
  - [ ] workflow-cockpit.spec.ts passes
  - [ ] responsive-mobile.spec.ts passes
  - [ ] offline-evidence.spec.ts passes
  - [ ] npm run test:e2e -w frontend passes

  **QA Scenarios**:
  ```
  Scenario: All E2E specs pass
    Tool: Bash
    Preconditions: Frontend + backend running, test data seeded
    Steps:
      1. Run: npm run test:e2e -w frontend
    Expected Result: All specs pass with 0 failures
    Evidence: .sisyphus/evidence/task-44-e2e-results.log
  ```

  **Evidence to Capture**:
  - [ ] E2E test results summary (pass/fail count per spec)
  - [ ] Playwright trace files for debugging

- [ ] 45. **Accessibility Audit**

  **What to do**:
  - Run axe-core on all new/enhanced pages using Playwright
  - Check: color contrast (WCAG AA), aria labels, keyboard navigation, focus visible, heading hierarchy
  - Verify form labels associated with inputs
  - Verify modal focus traps
  - Verify touch target sizes (minimum 44x44px)
  - Document findings and fix any violations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6

  **Blocked By**: Tasks 25-32 (all frontend UIs)

  **References**:
  - `docs/REGLAS_DESARROLLO_CERMONT.md` — Accessibility rules
  - `frontend/tests/accessibility/` — Any existing a11y tests

### Phase 9 — Documentation

- [ ] 46. **Update README and Documentation**

  **What to do**:
  - Update root README.md with new module documentation
  - Update docs/architecture/API_ENDPOINT_MATRIX.md with new endpoints
  - Update docs/architecture/FRONTEND_ROUTE_MAP.md with new routes
  - Update docs/audits/POST_GRADUATION_PROFESSIONALIZATION_AUDIT.md with final state
  - Create `docs/audits/PROFESSIONAL_FSM_CMMS_BENCHMARK.md` with FSM/CMMS benchmark findings
  - Create `docs/audits/TESTING_STRATEGY_PROFESSIONAL.md` with comprehensive testing strategy
  - Create `CHANGELOG.md` with all changes per phase

  **Must NOT do**:
  - No creating documentation for files that don't exist
  - No fictional documentation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave FINAL (before verification)
  - **Blocked By**: All previous phases

  **References**:
  - All existing docs/ directory structure
  - README.md (root) — Current README

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run the full verification pipeline: `npm run typecheck && npm run lint && npm run test && npm run build && npm run verify`. Review changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Quality Gates [PASS/FAIL] | VERDICT`

- [ ] F3. **Full E2E Smoke Test** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: empty state, invalid input, offline recovery. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec built (no missing), nothing beyond spec built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Phase 1**: `audit(verification): baseline audit and initial gate fixes`
- **Phase 2**: `design(system): standardize design tokens and UI components`
- **Phase 3**: `feat(vehicles): enhance fleet module with photos, documents, readiness`
- **Phase 4**: `feat(evidences): add camera capture, offline sync, validation flow`
- **Phase 5**: `feat(notifications): real notification system with bell UI and events`
- **Phase 6**: `feat(checklists): professional checklist templates and execution engine`
- **Phase 7**: `feat(workflow): 14-step workflow cockpit with gates and timeline`
- **Phase 8**: `test(e2e): comprehensive Playwright E2E scenarios`
- **Phase 9**: `docs: update documentation and changelog`

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck   # Expected: exit 0, no errors
npm run lint        # Expected: exit 0, no errors
npm run test        # Expected: all tests pass
npm run build       # Expected: all packages build
npm run verify      # Expected: all gates green
npm run test:e2e    # Expected: all E2E scenarios pass
npx react-doctor@latest --verbose  # Expected: score 100/100
```

### Final Checklist
- [ ] All 9 phases completed with verification passing
- [ ] All "Must Have" present and verified
- [ ] All "Must NOT Have" absent (verified by search)
- [ ] Zero new `any`/`unknown`/`null`/`undefined`
- [ ] All verification gates green
- [ ] react-doctor score 100/100
- [ ] E2E scenarios all passing
- [ ] Documentation updated
- [ ] Changelog created
