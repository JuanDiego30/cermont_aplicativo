# 15 — Master Implementation Codex Prompt

## Mission & Context

You are Codex, an elite coding agent assisting Google DeepMind and CERMONT S.A.S. developers in deploying the next-generation operational and commercial field-service contractor platform.

The CERMONT application organizes its business lifecycle around a **14-step sequential pipeline** (work request → site visit → proposal → PO approval → planning → execution → evidence → technical report → delivery record → customer signature → SES registration → invoicing → approval → payment).

Your task is to implement the missing modules, gates, PWA offline configurations, and security perimeters, executing tasks incrementally by following this **14-Wave Actionable Roadmap**.

---

## Strict Constraints & Guardrails (AGENTS.md Compliance)

To maintain a secure, standard workspace, you MUST obey these rules without exception:
- **NestJS is strictly FORBIDDEN**: The backend must run Express 5.2.1 and Mongoose 9.x exclusively.
- **Prisma or SQL is strictly FORBIDDEN**: Only MongoDB with Mongoose object modeling is permitted.
- **NextAuth or Auth.js is FORBIDDEN**: Authentication uses JWT direct tokens stored inside HttpOnly (Secure + SameSite=strict) cookies.
- **Package Manager**: Use `npm 10.9.4` only. **DO NOT use Yarn or PNPM.**
- **middleware.ts is FORBIDDEN**: Next.js App Router middleware is prohibited. The entire frontend security perimeter is governed by `frontend/proxy.ts`.
- **Zero-Tolerance Quality Gates**: Every wave is considered incomplete unless the following commands pass with zero errors:
  - `npm run typecheck` (0 TypeScript compilation errors).
  - `npm run lint` (0 Biome errors or critical warnings).
  - `npm run test` (All Vitest and Playwright suites pass).
  - `npm run build` (Successful Turborepo build compiles).
- **Security-First Coding**: Reject any upload implementation that lacks magic bytes validation, and reject any resource controller querying by ID without tenant validation (BOLA / IDOR isolation).
- **Spanglish Code Ban**: Write all code comments, variable names, database schema keys, and logs strictly in English.

---

## Wave-by-Wave Actionable Backlog

### Wave 0: Branch, Quality Gates, & Workspace Baseline
- **Task 0.1: Branch Isolation**:
  - Target Branch: `rescue/restore-missing-project-files`.
  - Action: Run `git fetch --all --prune` and verify that the monorepo workspaces boot cleanly.
- **Task 0.2: Trash Scripts Clean-Up**:
  - Action: Delete the following temporary root files: `fix.js`, `fix2.js`, `fix-rbac-roles.js`, `add-route.js`, `addwr.js`, `add_wr.js`, `frontend_fixes.mjs`, `test-endpoints.js`, and `test.js`.
- **Task 0.3: Gitignore Alignment**:
  - Action: Edit `.gitignore` and remove `*.json` from line 272 to ensure Turborepo and package configuration files are tracked.

---

### Wave 1: Contracts, Domain Schemas, & Shared Types Foundation
- **Task 1.1: Shared Types Audits**:
  - Action: Verify that all common interfaces and enums reside inside `packages/shared-types/src/`.
- **Task 1.2: Add Missing Schemes**:
  - Action: Implement Zod schema specifications inside `shared-types` for `FormFieldSchema` (discriminatedUnion supporting ODK types TEXT, NUMBER, SELECT, GPS, SIGNATURE, and REPEAT_GROUP), `CostLine`, `ReadinessCheck`, and `EvidenceCategory`.
- **Task 1.3: Update Contracts Snapshot**:
  - Action: Execute `npm run contractscheck`. If changes are found, run `npm run contracts:update`.

---

### Wave 2: Service Case Stepper, Cockpit, & Unified Sidebar
- **Task 2.1: Case Stepper Component**:
  - Action: Build `CaseStepper.tsx` inside `/service-cases/[id]`. Show a visual timeline of 14 steps. Map step styles dynamically: completed (green), active (animated pulsing blue), blocked (red lock).
- **Task 2.2: Cockpit Radix-UI Tabs**:
  - Action: Integrate tabs in the cockpit: Overview, Checklists, DocumentPicker, Media Gallery, and Cost Variance tables.
- **Task 2.3: Reorganize Sidebar**:
  - Action: Edit `frontend/src/components/layout/Sidebar.tsx` to follow the operational flow (Dashboard, Service Cases, steps 1-9 under Flujo Operativo, steps 10-14 under Cierre Administrativo, resources, and admin settings).

---

### Wave 3: Commercial Pipeline (Steps 1-4: Requests, Visits, Proposals, POs)
- **Task 3.1: Economic Proposal Builder**:
  - Action: Write `BudgetBuilder.tsx` in `/proposals/new`. Recalculate subtotals, VAT (tax), and total values reactively on the client.
- **Task 3.2: economic recalculation validation**:
  - Action: On the backend `Proposal` Mongoose model, write a pre-save hook that recalculates totals from lines, rejecting values that drift from client-submitted estimates to prevent price tampering.
- **Task 3.3: Purchase Order Workflow Gate**:
  - Action: In `workflow-gate.service.ts`, before planning can begin, query the case and verify a validated `PurchaseOrder` is registered, otherwise raise a blocker.

---

### Wave 4: Planning Packet, HSE Safety Permits, & Resource Catalogs (Step 5)
- **Task 4.1: Planning Readiness Gate**:
  - Action: Implement `ReadinessGate.tsx` inside `/planning/[id]/readiness-gate`. Render checklists checking EPP availability, technician heights certifications, and AST uploads.
- **Task 4.2: Programmatic Execution Blocker**:
  - Action: On `POST /api/v1/executions/check-in`, query the corresponding `PlanningPacket`. If `status !== 'approved'` or `astRequired === true && astUploaded === false`, return `409 Conflict`.

---

### Wave 5: Execution Session Cockpit & Mobile Hourly Logging (Step 6)
- **Task 5.1: Active Execution Timer View**:
  - Action: Build `/execution/session` rendering a large check-out button, running session timers, and dynamic checklist questionnaires.
- **Task 5.2: Hour and Incident logger**:
  - Action: In `ExecutionSession.ts`, log checking timestamps, incident summaries, and validate hours.

---

### Wave 6: Structured Evidence Vault & Automated Renaming (Step 7)
- **Task 6.1: Categorized Gallery Drop-zones**:
  - Action: Edit `/evidences` gallery. Group drops by BEFORE / DURING / AFTER categories.
- **Task 6.2: Auto-Rename Upload Service**:
  - Action: In the upload service, rename uploaded media using the pattern: `CASECODE_STEP_CATEGORY_TIMESTAMP_UUID.png`.

---

### Wave 7: Technical Report Compiler & Evidence Protection (Step 8)
- **Task 7.1: Technical Report Auto-assembly**:
  - Action: Write a backend service parsing completed `ExecutionSession` forms and auto-populating `TechnicalReport` draft layout.
- **Task 7.2: Evidence deletion blocker**:
  - Action: On `DELETE /api/v1/evidences/:id`, query if the photo is tagged inside any report's `evidencesUsed` array. If true, block deletion and raise a database validation error.

---

### Wave 8: Delivery Record Actas, Canvas Signature, & GPS Telemetry (Steps 9 & 10)
- **Task 8.1: Client Signature Pad**:
  - Action: Create a landscape canvas block in `/delivery-records/[id]/sign`. Enable client drawing, serializing inputs to Base64 PNG.
- **Task 8.2: GPS and timestamp capturing**:
  - Action: Capture device coordinates on mobile signature submit events and inject them into signature metadata.

---

### Wave 9: Billing Pipeline (Steps 11-13: SES SAP Ariba, Invoices & Approvals)
- **Task 9.1: Sequential Billing Gates**:
  - Action: Enforce workflow boundaries. Block SES creation if DeliveryRecord is unsigned. Block Invoice creation if SES is unapproved.
- **Task 9.2: Total verification vs SES**:
  - Action: Verify that the Invoice amount matches the approved SES value, raising a validation error on mismatch.

---

### Wave 10: Financial Reconciliation, Cost Variance Semaphores, & Case Close Locks (Step 14)
- **Task 10.1: Cost Variance Semaphore Widget**:
  - Action: Build `CostVarianceTable.tsx` comparing budget items against real costs, pulsing status rings in red if variance >10%.
- **Task 10.2: Final Case Closure lock**:
  - Action: On `/service-cases/[id]` close event, write a pre-save hook locking all related documents from future modifications.

---

### Wave 11: PWA Offline-First Core: TanStack Cache Persister & Outbox Mutations Queue
- **Task 11.1: TanStack Query Local Cache Persistence**:
  - Action: Integrate `PersistQueryClientProvider` and `createAsyncPersister` to cache all query states inside IndexedDB stores.
- **Task 11.2: Transactional outbox pattern mutation queue**:
  - Action: Build a client outbox processor. If offline, write payloads to `mutations-outbox` using a unique `clientMutationId`, auto-syncing in FIFO order when network is restored.

---

### Wave 12: Fullstack OWASP Hardening: Upload Magic Bytes & API Rate Limiters
- **Task 12.1: Magic Bytes buffer validation**:
  - Action: Edit uploader endpoint. Inspect the first 4100 bytes of the file stream to verify actual headers, rejecting uploads on MIME spoofing.
- **Task 12.2: API Rate limiters**:
  - Action: Configure rate limiters on `/api/v1/auth/login` (max 10/min) and `/api/v1/evidences` upload routes (max 5/min).

---

### Wave 13: QA Automation: Testcontainers MongoDB Integration & Playwright E2E Master Suite
- **Task 13.1: Staging MongoDB Integration tests**:
  - Action: Configure Testcontainers to spawn clean MongoDB databases in Vitest integration tests.
- **Task 13.2: Sequential E2E Playwright Master Suite**:
  - Action: Write a comprehensive Playwright script testing the full 14 steps under role transitions.

---

## Criterio de Completitud (Definition of Done)

Before wrapping up the implementation, you must confirm:
1. Every gate passes: `npm run typecheck && npm run lint && npm run test && npm run build`.
2. `npx react-doctor@latest` passes with zero critical rendering issues.
3. Every single uploader route checks magic bytes.
4. No IDOR checks are bypassed on any controller.
5. All 5 operational fallacies are covered by automated tests.
6. The active case cockpit stepper successfully blocks progress if blockers are unresolved.
7. Veredicto: **APROBADO**.
