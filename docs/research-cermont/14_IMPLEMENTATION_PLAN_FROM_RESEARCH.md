# 14 — Master Implementation Plan (14 Waves Actionable Roadmap)

## Executive Summary

To successfully execute the technical and operational transformation of CERMONT S.A.S. without introducing regressions ("No Broken Windows" directive), we have structured a **14-wave sequential implementation roadmap**.

Each wave contains:
- **Core Objective & Dependencies**: Order of progression (dependencies mapped).
- **Impacted Files**: Target code locations in the monorepo workspace.
- **Backend & Frontend Specifications**: Specific route mappings and React components.
- **Risk Assessment & Rollback Strategy**: Concrete paths to restore stability if compilation fails.
- **Quantifiable Acceptance Criteria**: Measurable goals to verify completeness.

---

## Sources & References

- **Canonical Repository Files**:
  - `packages/shared-types/` & `packages/domain/` — Core business contracts.
  - `backend/src/models/` and `frontend/src/app/` — Physical codebase boundaries.
- **Auditing Logs**:
  - `.agents/rules/01-stack.md` — Non-negotiable version matrices.
  - `.agents/rules/09-prohibitions.md` — Strict constraints (NestJS, Prisma, Yarn bans).

---

## Master Implementation Roadmap (14 Waves)

### Wave 0: Branch, Quality Gates, & Workspace Baseline
- **Objective**: Establish the development baseline. Clean up obsolete root scripts and fix gitignore rules.
- **Dependencies**: None.
- **Impacted Files**: `.gitignore` (remove `*.json` from line 272), root files list (delete `fix.js`, `fix2.js`, etc.).
- **Risk & Rollback**: Low risk. Restore using `git checkout` if config files are altered.
- **Acceptance Criteria**: Running `git status` shows zero untracked `.js` trash files. Workspace boots cleanly with `npm run verify`.
- **Effort**: 2 Days.

---

### Wave 1: Contracts, Domain Schemas, & Shared Types Foundation
- **Objective**: Harden the single source of truth (SSOT). Define all Zod schemas, cost categories, and step enums inside `@cermont/shared-types`.
- **Dependencies**: Wave 0.
- **Impacted Files**: `packages/shared-types/src/schemas/`, `packages/domain/src/`.
- **Backend & Frontend**: Re-export all type declarations. Eliminate any duplicate interface declarations.
- **Risk & Rollback**: Medium risk. Type compilation breaks. Rollback to original git commits if shared typings fail validation.
- **Acceptance Criteria**: Running `npm run build -w shared-types` compiles with zero TypeScript errors.
- **Effort**: 5 Days.

---

### Wave 2: Service Case Stepper, Cockpit, & Unified Sidebar
- **Objective**: Build the visual cockpit page (`/service-cases/[id]`) and restructure the sidebar layout according to the 7 core pillars.
- **Dependencies**: Wave 1.
- **Impacted Files**: `frontend/src/app/(dashboard)/service-cases/[id]/page.tsx`, `frontend/src/components/layout/Sidebar.tsx`.
- **Backend & Frontend**: Create `CaseStepper.tsx` displaying the active 1-14 timeline, and load Radix-UI cockpit tabs.
- **Risk & Rollback**: High risk. Navigation breaks. Maintain a backup of the original `Sidebar.tsx` to restore if routing fails.
- **Acceptance Criteria**: Clicking step icons inside the cockpit updates step visual highlights reactively.
- **Effort**: 10 Days.

---

### Wave 3: Commercial Pipeline (Steps 1-4: Requests, Visits, Proposals, POs)
- **Objective**: Implement the pre-sale commercial flow. Connect WorkRequests, SiteVisits checklists, dynamic economic Proposals calculation, and Purchase Order file upload constraints.
- **Dependencies**: Wave 2.
- **Impacted Files**: `backend/src/models/Proposal.ts`, `frontend/src/app/(dashboard)/proposals/new/page.tsx`.
- **Backend & Frontend**: Enforce budget summation recalculations on the Mongoose pre-save hook.
- **Risk & Rollback**: High risk. Total budget sums manipulation. Revert to original database entries using staging backups if calculations drift.
- **Acceptance Criteria**: Planning (Step 5) is blocked if the corresponding Case has no verified `PurchaseOrder`.
- **Effort**: 12 Days.

---

### Wave 4: Planning Packet, HSE Safety Permits, & Resource Catalogs (Step 5)
- **Objective**: Implement the planning and readiness gate (Falla 1 solved).
- **Dependencies**: Wave 3.
- **Impacted Files**: `backend/src/models/PlanningPacket.ts`, `frontend/src/app/(dashboard)/planning/[id]/readiness-gate/page.tsx`.
- **Backend & Frontend**: Renders the `ReadinessGate` semaphore checking EPP, crew height certificates, and safety ASTs.
- **Risk & Rollback**: Medium risk. Blockers lock technicians out. Deploy a bypass option limited to role `GER` to override gate lock if needed.
- **Acceptance Criteria**: Running `POST /api/v1/executions/check-in` returns `409 Conflict` if the Planning readiness is `BLOCKED`.
- **Effort**: 7 Days.

---

### Wave 5: Execution Session Cockpit & Mobile Hourly Logging (Step 6)
- **Objective**: Implement active field execution logging (Falla 2 part 1 solved).
- **Dependencies**: Wave 4.
- **Impacted Files**: `backend/src/models/ExecutionSession.ts`, `frontend/src/app/(dashboard)/execution/session/page.tsx`.
- **Backend & Frontend**: Build the dark-mode active execution page showing a timer, a pause button, and dynamic inputs.
- **Risk & Rollback**: High risk. Session timer local state loss on reload. Save state persistently inside IndexedDB.
- **Acceptance Criteria**: Technicians check-in and check-out successfully, saving execution times and checklists.
- **Effort**: 10 Days.

---

### Wave 6: Structured Evidence Vault & Automated Renaming (Step 7)
- **Objective**: Implement structured media categorizations (Falla 2 part 2 solved).
- **Dependencies**: Wave 5.
- **Impacted Files**: `backend/src/models/Evidence.ts`, `frontend/src/app/(dashboard)/evidences/page.tsx`.
- **Backend & Frontend**: Create uploader drag-zones for BEFORE / DURING / AFTER categories, renaming files dynamically.
- **Risk & Rollback**: Medium risk. Upload timeout on big files. Revert to standard simple uploads if image chunking fails.
- **Acceptance Criteria**: Uploaded photos are renamed to `CASECODE_STEP_CATEGORY_TIMESTAMP.png` automatically by backend.
- **Effort**: 8 Days.

---

### Wave 7: Technical Report Compiler & Evidence Protection (Step 8)
- **Objective**: Build the report auto-generator (Falla 3 part 1 solved).
- **Dependencies**: Wave 6.
- **Impacted Files**: `backend/src/models/TechnicalReport.ts`, `frontend/src/app/(dashboard)/technical-reports/[id]/edit/page.tsx`.
- **Backend & Frontend**: Parse `ExecutionSession` checklist and automatically draft the `TechnicalReport` layout.
- **Risk & Rollback**: Medium risk. PDF generation layouts break on large tables. Revert to simple text layouts if dynamic assembly crashes.
- **Acceptance Criteria**: Images tagged as `usedInReport: true` cannot be deleted from the database.
- **Effort**: 10 Days.

---

### Wave 8: Delivery Record Actas, Canvas Signature, & GPS Telemetry (Steps 9 & 10)
- **Objective**: Capture digital hand-drawn signatures with non-repudiation tags (Falla 3 part 2 solved).
- **Dependencies**: Wave 7.
- **Impacted Files**: `backend/src/models/DeliveryRecord.ts`, `frontend/src/app/(dashboard)/delivery-records/[id]/sign/page.tsx`.
- **Backend & Frontend**: Embed canvas element capturing client stroke paths, attaching GPS and UTC timestamps.
- **Risk & Rollback**: High risk. Canvas drawing lag on mobile browsers. Disable smoothing overlays if lag exceeds 50ms.
- **Acceptance Criteria**: Delivery record transitions to `'SIGNED'` when signature payload is submitted successfully.
- **Effort**: 8 Days.

---

### Wave 9: Billing Pipeline (Steps 11-13: SES SAP Ariba, Invoices & Approvals)
- **Objective**: Implement sequential billing workflow gates (Falla 4 solved).
- **Dependencies**: Wave 8.
- **Impacted Files**: `backend/src/models/ServiceEntrySheet.ts`, `backend/src/models/Invoice.ts`, `frontend/src/app/(dashboard)/billing/page.tsx`.
- **Backend & Frontend**: Enforce sequential blocks: no Invoice without approved SES; no SES without signed Acta.
- **Risk & Rollback**: Medium risk. Billing locks out coordinators. Implement warning status state overrides for supervisors.
- **Acceptance Criteria**: Creating an invoice checks that the corresponding SES number exists and matches totals.
- **Effort**: 10 Days.

---

### Wave 10: Financial Reconciliation, Cost Variance Semaphores, & Case Close Locks (Step 14)
- **Objective**: Implement cost control variance dashboard and final database lockouts (Falla 5 solved).
- **Dependencies**: Wave 9.
- **Impacted Files**: `backend/src/models/Cost.ts`, `frontend/src/app/(dashboard)/costs/page.tsx`.
- **Backend & Frontend**: Renders comparative budget vs real costs. Transitioning to `'CLOSED'` locks all sub-documents.
- **Risk & Rollback**: High risk. Accidental locked cases. Provide a 'Reopen' action limited strictly to role `GER`.
- **Acceptance Criteria**: Variance semaphores pulse in red if real operational costs exceed estimates by >10%.
- **Effort**: 7 Days.

---

### Wave 11: PWA Offline-First Core: TanStack Cache Persister & Outbox Mutations Queue
- **Objective**: Configure persistent queries caching and offline outbox pipelines.
- **Dependencies**: Wave 10.
- **Impacted Files**: `frontend/src/providers/react-query.tsx`, `frontend/src/lib/offline/outbox-manager.ts`.
- **Backend & Frontend**: Integrate `PersistQueryClientProvider` and queue mutations inside IndexedDB FIFO stores.
- **Risk & Rollback**: Critical risk. Outbox queue loops freeze UI. Implement an emergency queue purge action.
- **Acceptance Criteria**: Submitting a checklist offline buffers the JSON locally, syncing automatically when network returns.
- **Effort**: 14 Days.

---

### Wave 12: Fullstack OWASP Hardening: Upload Magic Bytes & API Rate Limiters
- **Objective**: Hardening the API perimeter. Protect against shell uploads and brute force attacks.
- **Dependencies**: Wave 11.
- **Impacted Files**: `backend/src/middleware/file-validator.ts`, `backend/src/index.ts`.
- **Backend & Frontend**: Verify magic bytes signature buffers, sanitizes filenames, and configure rate limiters.
- **Risk & Rollback**: Medium risk. Rate limits block legitimate API traffic. Tune limits based on telemetry.
- **Acceptance Criteria**: Uploading a `.php` file renamed to `.png` returns `415 Unsupported Media Type`.
- **Effort**: 5 Days.

---

### Wave 13: QA Automation: Testcontainers MongoDB Integration & Playwright E2E Master Suite
- **Objective**: Establish regression guards. Integrate testcontainers for real MongoDB verification and E2E automation.
- **Dependencies**: Wave 1-12.
- **Impacted Files**: `frontend/tests/e2e/`, `backend/tests/integration/`.
- **Backend & Frontend**: Automate the full 14-step workflow in browser testing.
- **Risk & Rollback**: Low risk. Flaky tests. Set custom timeouts (30000ms) for high-latency visual renders.
- **Acceptance Criteria**: Running `npm run test` executes all integration and E2E suites successfully.
- **Effort**: 12 Days.

---

## Parallel Execution Paths

To optimize implementation times, developers can parallelize several waves once core database boundaries are stable.

```
Wave 0: Baseline ──► Wave 1: Shared Typings
                              │
                              ▼
                       Wave 2: Cockpit
                              │
                              ▼
                       Wave 3: Presale
                              │
       ┌──────────────────────┴──────────────────────┐
       ▼                                             ▼
Wave 4: Planning                              Wave 9: Billing
       │                                             │
       ▼                                             ▼
Wave 5: Execution                             Wave 10: Costs & Locks
       │                                             │
       ▼                                             │
Wave 6: Evidences                                    │
       │                                             │
       ▼                                             │
Wave 7: Reports                                      │
       │                                             │
       ▼                                             │
Wave 8: Actas & Signatures                           │
       │                                             │
       └──────────────────────┬──────────────────────┘
                              │
                              ▼
                       Wave 11: PWA Offline
                              │
                              ▼
                       Wave 12: Security Hardening
                              │
                              ▼
                       Wave 13: E2E QA Suites
```
