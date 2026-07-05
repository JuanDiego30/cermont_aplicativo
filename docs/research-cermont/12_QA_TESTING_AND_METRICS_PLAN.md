# 12 — QA, Testing & Metrics Plan

## Executive Summary

This document defines the comprehensive Quality Assurance strategy for CERMONT S.A.S., covering unit testing, integration testing, E2E testing, offline testing, security testing, and quality gates. It is derived from the audit findings in Fases 06-11 and aligned with the 53 requirements in the Final Implementation Matrix (Fase 13).

The current codebase has **70 existing test files** distributed across backend and frontend, with Vitest configured in both workspaces and Playwright configured for E2E coverage. However, significant gaps exist in offline testing, security testing, RBAC testing, and end-to-end coverage of the 14-step business flow.

---

## Sources & References

- **Canonical Repository Files**:
  - `backend/vitest.config.ts` — Vitest config: node env, `tests/**/*.test.ts`, coverage thresholds 70/70/60 (lines/functions/branches)
  - `frontend/vitest.config.ts` — Vitest config: jsdom env, `tests/**/*.test.{ts,tsx}` + `lib/**/*.test.{ts,tsx}`, coverage thresholds 40/30/35/40
  - `frontend/playwright.config.ts` — Playwright config: 2 workers, 90s timeout, chromium + mobile projects
  - `backend/tests/setup.ts` — Backend test setup
  - `frontend/vitest.setup.ts` — Frontend test setup
  - `package.json` root scripts: `test`, `test:ci`, `test:e2e`, `verify` (typecheck + build)
- **Audit References**:
  - `06_CERMONT_FAILURES_REAL_SOLUTION_AUDIT.md` — 5 failures: Planning, Execution/Evidences, Reports/Delivery, Administrative Closure, Costs
  - `09_SECURITY_AND_OWASP_HARDENING_PLAN.md` — P0-P2 vulnerabilities: IDOR, MIME spoofing, rate limiting, JWT, CORS
  - `13_FINAL_IMPLEMENTATION_MATRIX.md` — 53 requirements with verification tests
- **Testing Frameworks**: Vitest 4.x, Playwright 1.58.x, Supertest, @testing-library/react

---

## Part 1: Current Test Infrastructure Assessment

### Backend Test Config (`backend/vitest.config.ts`)
| Property | Value |
|----------|-------|
| Environment | `node` |
| Test files | `tests/**/*.test.ts` |
| Globals | `true` |
| Setup | `./tests/setup.ts` |
| Coverage provider | `v8` |
| Coverage thresholds | Lines 70%, Functions 70%, Branches 60% |
| Path alias | `@` → `./src` |

### Frontend Test Config (`frontend/vitest.config.ts`)
| Property | Value |
|----------|-------|
| Environment | `jsdom` |
| Test files | `tests/**/*.test.{ts,tsx}`, `lib/**/*.test.{ts,tsx}` |
| Globals | `true` |
| Setup | `./vitest.setup.ts` |
| Coverage provider | `v8` |
| Coverage thresholds | Lines 40%, Branches 30%, Functions 35%, Statements 40% |
| Inline deps | `@testing-library/react`, `@tanstack/react-query` |

### Playwright E2E Config (`frontend/playwright.config.ts`)
| Property | Value |
|----------|-------|
| Test directory | `tests/e2e/` |
| Workers | 2 |
| Timeout | 90s |
| Retries | 1 (CI only) |
| Projects | `chromium` (all), `mobile` (smoke only: iPhone 13) |
| Global setup | `tests/e2e/global-setup.ts` |
| Global teardown | `tests/e2e/global-teardown.ts` |
| Web server | Auto-starts full dev stack on port 3000 |

### Existing Test Coverage
- **70 test files** found across backend (`tests/`) and frontend (`tests/`, `lib/`)
- Coverage thresholds are **low** (frontend: 40% lines, 30% branches) — significant gaps
- No dedicated test categories found for: offline, security (IDOR/RBAC/upload), cost state machine, or 14-step flow

---

## Part 2: Required Test Categories

### 2.1 Unit Tests (Vitest)

| Module | Scope | Priority | Existing Tests |
|--------|-------|----------|----------------|
| Backend services | Business logic, domain rules, state transitions | P0 | Partial |
| Frontend hooks | TanStack Query hooks, mutation callbacks | P0 | Partial |
| Utilities | Pure helpers, formatters, validators | P1 | Partial |
| Domain helpers | `@cermont/domain` RBAC, state machines, cost rules | P0 | Minimal |
| Zod schemas | Validation contracts in `@cermont/shared-types` | P0 | Minimal |

**Required backend unit tests by service:**
- `orders.service.test.ts` — CRUD, state transitions (open → assigned → in_progress → completed → closed)
- `planning.service.test.ts` — Readiness gate validation, kit completeness, crew certification check
- `cost.service.test.ts` — State machine: NO_DATA → ESTIMATED_ONLY → ACTUAL_ONLY → ESTIMATED_AND_ACTUAL → INVOICED → PAID, never $0
- `service-entry-sheet.service.test.ts` — Gate: only with signed delivery record
- `invoice.service.test.ts` — Gate: only with approved SES
- `payment.service.test.ts` — Gate: only with approved invoice
- `auth.service.test.ts` — JWT issuance, refresh, expiry, role extraction

**Required frontend unit tests by module:**
- `useOfflineEvidence.test.ts` — Queue management, sync status, retry
- `query-keys.test.ts` — Stable key generation per filter combination
- `auth-store.test.ts` — Zustand auth store, token management, role persistence

### 2.2 Integration Tests (Supertest)

| Endpoint Category | Scope | Priority |
|-------------------|-------|----------|
| Auth routes | Login, register, refresh, logout, password reset | P0 |
| Order routes | CRUD with RBAC enforcement per role | P0 |
| Evidence routes | Upload with MIME validation, size limits, IDOR prevention | P0 |
| Cost routes | State transitions, variance calculation, $0 prohibition | P0 |
| Planning routes | Readiness gate, kit assignment, crew validation | P0 |
| SES/Invoice/Payment | Gate enforcement, sequential approval chain | P0 |

Each integration test must verify:
1. Happy path: 200/201 with correct response envelope
2. Auth failure: 401 without valid token
3. RBAC failure: 403 with insufficient role
4. Validation failure: 400 with malformed body
5. Not found: 404 with non-existent resource
6. IDOR prevention: User A cannot access User B's resources

### 2.3 Contract Tests (Zod Schema Validation)

| Schema | Scope | Priority |
|--------|-------|----------|
| `createWorkRequestSchema` | Required fields, enum values, length limits | P0 |
| `updateOrderSchema` | Partial updates, state transition validation | P0 |
| `costSchema` | State machine, amount validation, $0 rejection | P0 |
| `evidenceUploadSchema` | MIME types, file size, required metadata | P0 |
| `userCreateSchema` | Role validation, email format, password strength | P0 |

Test pattern: For each Zod schema, test `safeParse` with:
- Valid minimal input → `success: true`
- Valid maximal input → `success: true`
- Invalid field type → `success: false` with specific error message
- Missing required field → `success: false`
- Invalid enum value → `success: false`
- Boundary values (min/max length, min/max number)

### 2.4 Frontend Component Tests (Vitest + Testing Library)

| Component | Scope | Priority |
|-----------|-------|----------|
| Button | Variants, disabled state, click handler, aria attributes | P1 |
| Card | Render children, status badge, action buttons | P1 |
| FormField | Label rendering, error display, hint text | P1 |
| Dialog | Open/close, focus trap, Escape key, aria-modal | P1 |
| Table | Render rows, empty state, sort indicators | P1 |
| Badge | Color variants by status, accessibility label | P1 |
| ServiceCaseCockpit | Stepper rendering, current step highlight, blocker display | P0 |
| EvidenceGallery | Grid layout, preview modal, metadata display, rename | P0 |

### 2.5 Playwright E2E Tests

**Mandatory E2E Flow — 14 Steps:**
```
Login → Create Work Request → Record Site Visit → Generate Proposal →
Attach Purchase Order → Plan Work (Readiness Gate) → Execute Field Work →
Capture Evidences → Generate Technical Report → Create Delivery Record →
Obtain Client Signature → Register SES → Issue Invoice → Record Payment
→ View Cost Dashboard
```

**E2E Test Scenarios:**
| Scenario | Coverage | Priority |
|----------|----------|----------|
| Full 14-step happy path | Complete business flow with valid data | P0 |
| Rejection at each gate | Invalid state transitions blocked | P0 |
| Multi-role workflow | Request by cliente → approve by gerente → execute by operador | P0 |
| Evidence lifecycle | Upload → rename → categorize → preview → use in report | P0 |
| Document attachment | Upload → select from library → preview → archive | P0 |
| Cost accrual | Track estimate → actual → invoiced → paid with variance | P0 |

### 2.6 Offline Tests (Playwright)

| Scenario | Coverage | Priority |
|----------|----------|----------|
| Offline evidence capture | Go offline → take photo → save → go online → sync | P0 |
| Offline form fill | Go offline → fill dynamic form → save draft → sync | P0 |
| Offline signature | Go offline → capture signature → queue → sync | P0 |
| Sync status visibility | Banner shows pending/syncing/synced/failed | P0 |
| Conflict resolution | Same record edited offline by 2 users → LWW merge | P1 |
| Dead letter queue | Failed sync after N retries → DLQ → manual review | P1 |

Playwright offline setup:
```typescript
// Simulate offline before test
await page.context().setOffline(true);
// Perform actions
await page.goto('/execution/123');
await page.fill('[name="notes"]', 'Work done in offline mode');
await page.click('[data-testid="save-evidence"]');
// Verify queued
await expect(page.locator('[data-testid="sync-pending"]')).toBeVisible();
// Go back online
await page.context().setOffline(false);
// Wait for sync
await expect(page.locator('[data-testid="sync-status"]')).toHaveText('synced');
```

### 2.7 Security Tests (Playwright + Vitest)

| Category | Tests | Priority |
|----------|-------|----------|
| IDOR | User A accesses `/api/evidences/evidence-B-id` → 403 | P0 |
| RBAC | Each role hits each endpoint → verify 200/403 correctly | P0 |
| Upload MIME spoofing | Upload `.exe` renamed to `.jpg` → 400 | P0 |
| Upload magic bytes | File with wrong magic bytes → 400 | P0 |
| Upload size | File > 10MB → 400 | P0 |
| Path traversal | Filename `../../etc/passwd` → sanitized | P1 |
| Rate limiting | 30 requests in 1s → 429 on 21st request | P1 |
| XSS | Script injection in text fields → escaped in response | P1 |
| CSRF | POST without CSRF token → 403 (if CSRF protection exists) | P1 |
| JWT tampering | Modified JWT → 401 | P0 |
| JWT expiry | Expired JWT → 401 with specific error | P0 |

### 2.8 No-Loop Tests (Vitest)

Verify that TanStack Query hooks do not cause infinite refetch loops:
```typescript
import { renderHook } from '@testing-library/react';
import { useOrders } from '@/modules/orders/hooks/useOrders';

test('useOrders does not refetch on background refetch when data unchanged', async () => {
  const { result } = renderHook(() => useOrders());
  const initialFetchCount = result.current.fetchCount;
  await act(async () => { /* trigger background refetch */ });
  expect(result.current.fetchCount).toBe(initialFetchCount);
});
```

### 2.9 Cost State Machine Tests (Vitest)

Verify cost never shows $0 and follows state machine:
```typescript
describe('Cost State Machine', () => {
  test('starts as NO_DATA with no amount', () => {
    const cost = createCost({ status: 'NO_DATA' });
    expect(cost.estimatedAmount).toBeUndefined();
    expect(cost.actualAmount).toBeUndefined();
  });

  test('ESTIMATED_ONLY has estimated amount, no actual', () => {
    const cost = createCost({ status: 'ESTIMATED_ONLY', estimatedAmount: 500000 });
    expect(cost.estimatedAmount).toBe(500000);
    expect(cost.actualAmount).toBeUndefined();
  });

  test('transitions NO_DATA → ESTIMATED_ONLY when estimate added', () => {
    const result = transitionCost('NO_DATA', { type: 'SET_ESTIMATE', amount: 500000 });
    expect(result.status).toBe('ESTIMATED_ONLY');
  });

  test('never allows $0 as estimated amount', () => {
    expect(() => transitionCost('NO_DATA', { type: 'SET_ESTIMATE', amount: 0 }))
      .toThrow('Estimated amount cannot be $0');
  });

  test('INVOICED amount must match approved SES amount', () => {
    expect(() => transitionCost('ACTUAL_ONLY', { type: 'INVOICE', amount: 100000, sesAmount: 150000 }))
      .toThrow('Invoice amount must match SES approved amount');
  });
});
```

### 2.10 14-Step State Machine Tests (Vitest)

```typescript
describe('Service Case State Machine', () => {
  test('advances from WORK_REQUEST to SITE_VISIT when site visit scheduled', () => {
    const result = advanceStep('WORK_REQUEST', { type: 'SCHEDULE_VISIT', date: '2026-06-01' });
    expect(result.currentStep).toBe('SITE_VISIT');
  });

  test('blocks execution if planning incomplete (readiness gate)', () => {
    expect(() => advanceStep('PLANNING', { type: 'START_EXECUTION' }))
      .toThrow('Readiness gate not passed: crew certifications missing');
  });

  test('blocks SES creation without signed delivery record', () => {
    expect(() => advanceStep('DELIVERY_RECORD', { type: 'CREATE_SES' }))
      .toThrow('Delivery record must be signed before SES creation');
  });

  test('allows rollback from EXECUTION to PLANNING if supervisor rejects', () => {
    const result = rollbackStep('EXECUTION', { reason: 'Incomplete evidence', approvedBy: 'supervisor' });
    expect(result.currentStep).toBe('PLANNING');
  });
});
```

---

## Part 3: Quality Gates

### 3.1 Gate Command Chain

```bash
# Required before every commit and merge
npm run typecheck    # TypeScript strict — zero errors
npm run lint         # Biome — zero errors or warnings
npm run test         # Vitest — all tests pass, coverage thresholds met
npm run build        # Turborepo — all 3 workspaces build successfully
npx react-doctor@latest  # React diagnostics — zero issues
npm audit            # Zero critical/high vulnerabilities
```

### 3.2 `npm run verify` Enhancement

The current `verify` script runs `typecheck + build`. It should be enhanced to run:
```
typecheck → lint → build → test
```

Implementation in root `package.json`:
```json
{
  "scripts": {
    "verify": "npm run typecheck && npm run lint && npm run build && npm run test",
    "verify:ci": "npm run typecheck && npm run lint && npm run build && npm run test:ci"
  }
}
```

### 3.3 React Doctor Gate

Before every merge to main/rescue, run:
```bash
npx react-doctor@latest
```
React Doctor checks:
- Accessibility violations (missing labels, aria attributes, focus management)
- Bundle size anomalies (unexpected large imports)
- Architecture smell (client components importing server-only modules)
- Performance antipatterns (unnecessary re-renders, missing memo)

Zero issues required before merge approval.

### 3.4 Coverage Threshold Targets

| Workspace | Metric | Current Target | Phase 1 Target | Phase 2 Target |
|-----------|--------|---------------|----------------|----------------|
| Backend | Lines | 70% | 75% | 80% |
| Backend | Functions | 70% | 75% | 80% |
| Backend | Branches | 60% | 65% | 70% |
| Frontend | Lines | 40% | 50% | 60% |
| Frontend | Functions | 35% | 45% | 55% |
| Frontend | Branches | 30% | 40% | 50% |
| Frontend | Statements | 40% | 50% | 60% |

### 3.5 CI Pipeline Gates

```
Commit → Install → Typecheck → Lint → Build → Unit Tests → Integration Tests → 
E2E Tests → Coverage Check → React Doctor → npm audit → Security Scans → Merge Gate
```

Each gate must pass before the next executes. Failed gates produce:
- Unit/Integration test failure → PR blocked, author notified with stack trace
- Coverage below threshold → Warning (block if below Phase 1 minimum)
- E2E failure → PR blocked, video artifact attached
- Security vulnerability → P0: PR blocked immediately; P1: warning
- React Doctor issue → PR blocked with specific component/file path

---

## Part 4: Failure Verification Tests

Each CERMONT operational failure must have a dedicated verification test:

### Falla 1 — Planning Incomplete
```typescript
test('readiness gate blocks execution when kit incomplete', async () => {
  const order = await createTestOrder();
  await assignKit(order._id, { incomplete: true });
  const response = await request.post(`/api/orders/${order._id}/start-execution`);
  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('READINESS_GATE_FAILED');
});
```

### Falla 2 — Execution & Evidences Disorganized
```typescript
test('evidence has required metadata: gps, category, timestamp', async () => {
  const evidence = await createTestEvidence({ skipMetadata: true });
  const validation = await validateEvidence(evidence._id);
  expect(validation.missingFields).toContain('gpsCoordinates');
  expect(validation.missingFields).toContain('category');
});
```

### Falla 3 — Reports & Delivery Records Late
```typescript
test('delivery record must reference evidence from execution', async () => {
  const report = await createTechnicalReport({ emptyEvidences: true });
  const response = await request.post(`/api/reports/${report._id}/submit`);
  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('EVIDENCE_REQUIRED');
});
```

### Falla 4 — Administrative Closure Late
```typescript
test('ses creation blocked without signed delivery record', async () => {
  const order = await createTestOrder({ deliveryRecordStatus: 'DRAFT' });
  const response = await request.post(`/api/orders/${order._id}/create-ses`);
  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('DELIVERY_RECORD_NOT_SIGNED');
});
```

### Falla 5 — Cost Real Transversal
```typescript
test('cost never displays $0 — shows NO_DATA when no estimate', async () => {
  const cost = await createCost({ estimatedAmount: 0, actualAmount: 0 });
  expect(cost.status).not.toBe('ESTIMATED_ONLY');
  expect(cost.displayAmount).toBeUndefined();
});

test('cost variance calculation matches budget vs actual', async () => {
  const cost = await createCost({ estimatedAmount: 1000000, actualAmount: 850000 });
  expect(cost.variance).toBe(150000);
  expect(cost.variancePercent).toBe(15);
});
```

---

## Part 5: Implementation Plan

### Wave 1 — Test Infrastructure (Days 1-2)
- Add `supertest` to backend devDependencies if missing
- Add MongoDB memory server (`mongodb-memory-server`) for integration tests
- Create shared test utilities: `test-db.ts`, `test-factory.ts`, `auth-helper.ts`
- Set up Vitest workspace config for parallel test execution
- Add coverage thresholds enforcement (`--coverage.thresholds`)

### Wave 2 — Contract & Unit Tests (Days 3-5)
- Implement Zod schema validation tests for all shared schemas
- Implement backend service unit tests (orders, planning, cost, SES, invoice, payment)
- Implement frontend hook unit tests (useOfflineEvidence, query keys)
- Implement domain helper tests (RBAC, state machines, cost rules)
- Target: 100+ unit tests across all modules

### Wave 3 — Integration & Component Tests (Days 6-8)
- Implement Supertest integration tests for all critical endpoints
- Implement React component tests for shared UI library (Button, Card, Dialog, Table, FormField)
- Implement cockpit and stepper component tests
- Implement evidence gallery component tests
- Target: 50+ integration tests, 30+ component tests

### Wave 4 — Security Tests (Days 9-10)
- Implement IDOR test suite (all endpoints with cross-user access)
- Implement RBAC test matrix (8 roles × 30+ endpoints)
- Implement upload security tests (MIME, magic bytes, size, path traversal)
- Implement rate limiting tests
- Implement JWT tampering and expiry tests
- Target: 100+ security test scenarios

### Wave 5 — Offline Tests (Days 11-12)
- Implement Playwright offline test helpers
- Implement evidence capture offline test
- Implement form draft offline test
- Implement signature capture offline test
- Implement sync status visibility test
- Implement dead letter queue test
- Target: 15+ Playwright offline scenarios

### Wave 6 — E2E Tests (Days 13-16)
- Implement full 14-step happy path E2E test
- Implement rejection gate E2E tests (each gate)
- Implement multi-role workflow E2E test
- Implement cost accrual E2E test
- Implement document lifecycle E2E test
- Implement concurrent user E2E test
- Target: 20+ Playwright E2E scenarios

### Wave 7 — CI/CD & Gates (Day 17)
- Update `npm run verify` to run full test suite
- Configure coverage threshold enforcement in CI
- Add React Doctor gate to CI pipeline
- Add `npm audit` gate to CI pipeline
- Configure Playwright report upload (HTML, video, trace)
- Set up test failure notifications

---

## Part 6: Test Metrics & KPIs

| Metric | Current | Phase 1 Target | Phase 2 Target |
|--------|---------|----------------|----------------|
| Total test count | 70 | 250 | 500+ |
| Backend coverage (lines) | ~70% (threshold) | 75% | 80% |
| Frontend coverage (lines) | ~40% (threshold) | 50% | 60% |
| E2E scenarios | Minimal | 20 | 50 |
| Security test scenarios | 0 | 100 | 200+ |
| Offline test scenarios | 0 | 15 | 30 |
| CI pipeline gates | typecheck+build | 7 gates | 10 gates |
| React Doctor issues | Unknown | 0 | 0 |
| npm audit critical/high | Unknown | 0 | 0 |
| Test execution time | Unknown | <5min | <3min |

---

## Appendices

### Appendix A: Test File Naming Convention
- Unit tests: `*.test.ts` (backend), `*.test.tsx` (frontend)
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.spec.ts` (in `tests/e2e/`)
- Test factories: `*.factory.ts`
- Test utilities: `test-*.ts`

### Appendix B: Required Test Commands
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:ci -w backend   # Backend coverage
npm run test:ci -w frontend  # Frontend coverage

# Run E2E tests
npm run test:e2e -w frontend

# Run single test file
npm run test -w backend -- tests/services/order.service.test.ts

# Run test by name pattern
npm run test -w frontend -- -t "handles offline evidence"

# Run Playwright by tag
npm run test:e2e -w frontend -- --grep "@p0"

# Quality gate command
npm run verify
npm run verify:ci
```

### Appendix C: Test Data Strategy
- **Factories**: Use `@cermont/shared-types` Zod schemas to generate valid test data
- **Fixtures**: Pre-seeded test database with 3 complete service cases in various states
- **Auth tokens**: Pre-generated JWT tokens for each of the 8 roles
- **Uploads**: Test directory with sample files (valid JPEG, valid PNG, renamed .exe, oversized file)
- **MongoDB**: `mongodb-memory-server` for integration tests; shared state reset between test files
