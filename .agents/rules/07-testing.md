# 07 — Testing Rules

> Canonical source for Vitest, Playwright, coverage targets, test-before-change discipline, and conventions.

---

## Philosophy

- **Test before refactor.** Run the existing test suite before changing any code.
- **Write a failing test first for bug fixes (TDD).** The test must reproduce the bug before the fix is applied.
- Tests are documentation. A well-written test describes behavior, not implementation.
- Never write "fake" tests that always pass without asserting real behavior.

---

## Tools

| Tool | Purpose | Workspace |
|------|---------|----------|
| Vitest 4.x | Unit + integration tests | backend, frontend |
| Playwright 1.59.x | E2E tests | frontend |
| `@testing-library/react` | React component testing | frontend |
| `supertest` | HTTP integration tests | backend |
| `mongodb-memory-server` | In-memory MongoDB for tests | backend |

---

## Coverage Targets

| Workspace | Target |
|-----------|--------|
| backend | ≥ 80% |
| frontend | ≥ 40% (rising to 80% incrementally) |

```bash
npm run test:coverage          # root
npm run test:ci -w frontend    # frontend coverage report
```

Coverage gate blocks the build if below threshold.

---

## Vitest — Unit Tests

### File Location
```
backend/tests/
  services/       ← unit tests for service functions
  controllers/    ← integration tests with supertest
  models/         ← schema validation tests
frontend/tests/
  lib/            ← utility and lib function tests
  modules/        ← component and hook tests
  components/     ← shared component tests
```

### File Naming
- `foo.service.test.ts`
- `foo.component.test.tsx`
- `foo.hook.test.ts`

### Test Structure
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('OrderService.getById', () => {
  beforeEach(() => {
    // reset mocks
  });

  it('returns the order when found', async () => {
    // arrange
    // act
    // assert
  });

  it('throws ORDER_NOT_FOUND when not found', async () => {
    await expect(orderService.getById('nonexistent-id'))
      .rejects.toMatchObject({ code: 'ORDER_NOT_FOUND' });
  });
});
```

### Running Single Tests
```bash
# One file
npm run test -w backend -- tests/services/order.service.test.ts

# By test name
npm run test -w frontend -- -t "deduplicates entries in volatile fallback storage"
```

---

## Playwright — E2E Tests

### File Location
```
frontend/tests/e2e/
  login.spec.ts
  orders.spec.ts
  dashboard.spec.ts
```

### Critical Flows (Must Have E2E Coverage)
- [ ] Login (valid credentials → dashboard redirect)
- [ ] Login failure (invalid credentials → error message)
- [ ] Logout
- [ ] Create work order
- [ ] Update work order status (FSM transition)
- [ ] Upload evidence photo
- [ ] RBAC: non-authorized user cannot access protected route

### Playwright Conventions
- Use Page Object Model for reusable page interactions.
- Prefer `data-testid` attributes for selectors — not CSS classes or text.
- Always clean up test data after each test (`afterEach` / `afterAll`).
- Use `test.use({ storageState })` for authenticated sessions.

```typescript
// ✅ Correct — stable selector
page.locator('[data-testid="order-submit-btn"]')

// ❌ Fragile selector
page.locator('.btn-primary')
page.getByText('Guardar')   // text changes break the test
```

### Running E2E
```bash
npm run test:e2e -w frontend
npm run test:e2e -w frontend -- --grep "login"
npm run test:e2e -w frontend -- tests/e2e/orders.spec.ts
```

---

## Backend Integration Tests

Use `supertest` + `mongodb-memory-server` for HTTP-level integration tests:

```typescript
import request from 'supertest';
import { app } from '../../src/app';

describe('POST /api/orders', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/orders').send({ title: 'Test' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
```

---

## What Not to Test

- Implementation details (private functions, internal state).
- Third-party library behavior (Mongoose internals, Next.js router).
- Trivial getters / setters with no logic.

---

## Mock Strategy

- **Services:** mock at the repository level, not the database level.
- **HTTP calls in frontend:** use `msw` (Mock Service Worker) or TanStack Query's `queryClient.setQueryData` for unit tests.
- **Never mock in production code** — isolate mock logic strictly to test files.

---

## Quality Gate

```bash
npm run verify   # includes typecheck + lint + test + build + quality:strict
```

The CI pipeline blocks merge if:
- Any Vitest test fails.
- Any Playwright E2E test fails.
- Coverage is below threshold.
- TypeScript errors exist.
- Biome lint errors exist.
