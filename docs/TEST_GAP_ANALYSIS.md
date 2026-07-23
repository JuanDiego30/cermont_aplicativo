# Test Gap Analysis — Cermont S.A.S.

**Generated:** 2026-07-23  
**Data Source:** `npm run test` (turborepo pipeline, all workspaces)

---

## Current State

| Workspace | Test Files | Pass | Fail | Skip | Notes |
|-----------|-----------|------|------|------|-------|
| Backend   | 108       | 778  | 9    | 5    | Timeout-flaky tests inflate failure count |
| Frontend  | 109       | 531  | 21   | 0    | 9 files contain all 21 failures |
| Domain    | 7         | 93   | 0    | 0    | Clean |
| Shared-types | 33    | 183  | 1    | 0    | Snapshot drift (contract change) |
| E2E       | 4 specs   | 0    | 0    | 4    | Not executed in pipeline |

**Total:** 1,585 tests across 257 files. **31 failures** (9 backend + 21 frontend + 1 shared-types).

---

## Backend Failing Tests

Root cause pattern: **flaky timeouts** (5000ms default threshold). All 4 "failing" test files pass when run in isolation.

### File: `tests/controllers/proposals.controller.test.ts` — 2 failures

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| `getAllProposals > should return paginated proposals` | Timeout (~3500ms) | Mongoose mock setup slow under full-suite load |
| `createProposal > should create a proposal successfully` | Timeout | Same — service mock chain causes delay |

### File: `tests/controllers/spec-008-endpoints.test.ts` — 2 failures

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| `Evidence — download & view > downloadEvidence` | Timeout (~4200ms) | File stream mock + audit mock chain is slow |
| `ERP — validate-mapping & test-sync > validateMapping` | Timeout (~2500ms) | ERP connector mock response delay |

### File: `tests/services/invoice.service.test.ts` — 2 failures

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| `Invoice Service > should create invoice from SES` | Timeout (~2500ms) | Mongoose model mock chain; passes in isolation |
| `Invoice Service > should calculate aging` | Timeout | Same mock setup overhead |

### File: `tests/services/payment.service.test.ts` — 2 failures

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| `Payment Service > should register payment for invoice` | Timeout (~2400ms) | Invoice + Payment mock chain overhead |
| `Payment Service > should reconcile payment` | Timeout | Same |

### File: `tests/services/auth-email.service.test.ts` — 1 failure

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| `auth-email service > sends reset email` | Mock/response drift | Latest refactor changed email template signature; test mocks not updated |

---

## Frontend Failing Tests

Root cause pattern: **mock contract drift** (components refactored but tests not updated), **import resolution failures**, and **missing providers**.

### File: `tests/modules/work-requests/new-work-request-page.test.tsx` — 2 failures

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| Groups form + blocks invalid payload | Response drift | Form validation schema updated; test expects old error shape |
| Shows other-channel issue + routes | Router mock | `useRouter` mock not returning `push` correctly |

### File: `tests/modules/work-requests/work-request-new-page.test.tsx` — 6 failures

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| Valida con contrato antes de mutar | Response drift | Contract validation messages changed |
| Impide enviar sin sitio de servicio | Logic change | Component behavior refactored |
| Descarta sitio manual al seleccionar cliente | Logic change | Component behavior refactored |
| Limpia cliente + sitio dependiente | Logic change | Component behavior refactored |
| Muestra todos los problemas multi-issue | Response drift | Error aggregation format changed |
| Redirige a solicitud creada | Router mock | `useRouter.push` not wired |

### File: `tests/modules/costs/CostDashboardPage.test.tsx` — 2 failures

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| Offers explicit retry action on failure | Mock drift | Query hook API changed (TanStack Query v5 envelope) |
| Labels cached dashboard data offline | Mock drift | Offline detector mock interface changed |

### File: `tests/modules/fleet/NewVehicleDrawer.test.tsx` — 3 failures

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| Renderiza secciones profesionales | Import failure | Shared contract import path changed |
| Envía payload que satisface contrato | Response drift | Contract validation schema updated |
| Renderiza botón para agregar fotos | Mock drift | File upload hook changed |

### File: `tests/modules/proposals/proposal-queries.test.tsx` — 2 failures

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| Create unwraps API envelope | Response drift | `apiClient` response envelope changed |
| Update/approve/reject unwrap envelopes | Response drift | Same |

### File: `tests/modules/kits/kit-form.test.tsx` — 1 failure

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| Submits shared-contract payload without missing optional values | Response drift | Zod schema for kit payload changed |

### File: `tests/modules/kits/kit-wizard-form.test.tsx` — 1 failure

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| Same as kit-form | Response drift | Same root cause |

### File: `tests/modules/forms/cermont-form-templates.test.ts` — 2 failures

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| CCTV Template uses conformity type | Logic change | Template schema refactored |
| CCTV Template has hallazgo fields | Logic change | Template field structure changed |

### File: `tests/modules/cockpit/cockpit-fourteen-steps.test.tsx` — 1 failure

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| Renders all 14 steps without error | Import failure | Step icon component path changed |

### File: `packages/shared-types/tests/contracts/api-contracts.snapshot.test.ts` — 1 failure

| Test | Failure Type | Root Cause |
|------|-------------|------------|
| API contract snapshot matches | Snapshot drift | Audit action enum grew (PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED, USER_DEACTIVATED, USER_ROLE_CHANGED, USER_CERTIFICATION_ADDED). Snapshot not updated. |

---

## Coverage Gaps by Module

### Auth
- **Unit tests:** Partial (auth-email has test, auth controller has test)
- **Integration:** No
- **Route tests:** No
- **E2E:** `e2e/tests/auth.spec.ts` exists, never executed
- **Known gaps:** Auth controller has no integration test; password reset flow untested
- **Priority:** P0

### Work Requests
- **Unit tests:** 2 files, 8 tests (6 failing)
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** All form submission tests failing; no happy-path integration test
- **Priority:** P1

### Proposals
- **Unit tests:** Controller tests exist, 2 flaky
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** Service layer untested; conversion to order untested
- **Priority:** P1

### Orders / Purchase Orders
- **Unit tests:** Controller tests pass
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** Service layer untested; approval workflow untested
- **Priority:** P1

### Planning
- **Unit tests:** Partial (readiness gate tested)
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** Full planning service untested; packet generation untested
- **Priority:** P2

### Execution
- **Unit tests:** Session routes exist, no tests
- **Integration:** No
- **Route tests:** No
- **E2E:** `service-case-flow.spec.ts` exists, never executed
- **Known gaps:** Execution session service untested; evidence association untested
- **Priority:** P2

### Evidence
- **Unit tests:** Controller test exists (flaky timeout)
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** Upload pipeline, blob storage, outbox — all untested
- **Priority:** P1

### SES (Service Entry Sheet)
- **Unit tests:** No
- **Integration:** No
- **Route tests:** No
- **E2E:** `workflow-transitions.spec.ts` exists, never executed
- **Known gaps:** Entire SES module untested
- **Priority:** P1

### Invoice
- **Unit tests:** Service tests exist, 2 flaky timeouts
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** Invoice approval flow untested; DIAN integration untested
- **Priority:** P0

### Payment
- **Unit tests:** Service tests exist, 2 flaky timeouts
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** Payment reconciliation untested; invoice-payment link untested
- **Priority:** P0

### Fleet
- **Unit tests:** NewVehicleDrawer tests, 3 failing
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** Vehicle CRUD untested at service layer
- **Priority:** P2

### Costs
- **Unit tests:** Dashboard page tests, 2 failing
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** Cost calculation engine untested
- **Priority:** P2

### Delivery Records / Client Signature
- **Unit tests:** No
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** Entire module untested
- **Priority:** P2

### Technical Report
- **Unit tests:** No
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** Entire module untested
- **Priority:** P2

### Admin / Backup
- **Unit tests:** No
- **Integration:** No
- **Route tests:** No
- **E2E:** No
- **Known gaps:** Entire admin module untested; verify service untested
- **Priority:** P2

---

## Priority Order for Test Remediation

1. **Auth controller + service tests** (P0 — auth is critical path; password reset tests failing)
2. **Invoice + Payment service tests** (P0 — 4 flaky timeouts; financial accuracy)
3. **Work request page tests** (P1 — 8 tests failing across 2 files; core business flow)
4. **Proposals controller tests** (P1 — 2 flaky; conversion flow)
5. **Evidence controller tests** (P1 — flaky timeout; upload path)
6. **Fleet drawer tests** (P1 — 3 failures; vehicle registration)
7. **Proposal queries tests** (P1 — 2 failures; envelope contract drift)
8. **Kit form tests** (P1 — 2 failures across 2 files; schema drift)
9. **Cockpit step tests** (P1 — import resolution)
10. **Cost dashboard tests** (P2 — 2 failures; offline/cache)
11. **Form templates tests** (P2 — 2 failures; CCTV template schema)
12. **Shared-types contract snapshot** (P1 — 1 failure; update snapshot)
13. **All E2E specs** (P1 — 4 specs, 0 verified; automate in pipeline)

---

## Remediation Effort Estimate

| Priority | Tests | Estimated Effort | Risk if Deferred |
|----------|-------|-----------------|------------------|
| P0 | 5 backend tests | 2-3 hours | Auth/login breaks silently; invoice math errors |
| P1 | 18 frontend + 4 backend + 1 shared + 4 E2E | 2-3 days | Core workflows (work-request → proposal → order) break |
| P2 | 4 frontend tests + coverage gaps | 1-2 weeks | Non-critical modules degrade; confidence low |
