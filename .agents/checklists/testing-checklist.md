# Testing Checklist

> Run whenever adding, modifying, or reviewing tests.

---

## General

- [ ] Tests pass before making any changes (baseline established).
- [ ] No test was deleted to make CI green.
- [ ] No test was weakened (assertions removed) to avoid failures.
- [ ] Tests document behavior, not implementation details.

## Unit Tests (Vitest)

- [ ] New service functions have at least one unit test.
- [ ] Happy path tested.
- [ ] Error paths tested (what happens when input is invalid / resource not found).
- [ ] Test file is co-located with source or in the `tests/` directory (matching project pattern).
- [ ] Test file naming: `foo.service.test.ts`, `foo.component.test.tsx`.
- [ ] Tests use `describe` / `it` structure (not flat `test` calls).
- [ ] Mocks are reset in `beforeEach` / `afterEach`.

## Integration Tests (Supertest — Backend)

- [ ] Critical API endpoints have integration tests (at minimum: 200 OK + 401 + 403).
- [ ] Tests run against `mongodb-memory-server` — not the production/dev database.
- [ ] Test database is cleaned between test runs.

## E2E Tests (Playwright — Frontend)

- [ ] Critical user journeys have E2E coverage (see `.agents/rules/07-testing.md`).
- [ ] Selectors use `data-testid` — not CSS classes or display text.
- [ ] Tests are independent: no shared state between tests.
- [ ] `afterEach` / `afterAll` cleanup removes test data.
- [ ] Authenticated tests use `storageState` — not repeated login steps.

## Coverage

- [ ] `npm run test:ci -w frontend` — coverage ≥ 40% (rising to 80%).
- [ ] `npm run test -w backend` — coverage ≥ 80%.
- [ ] New code is covered (not excluded from coverage without justification).

## Bug Fix Tests (TDD)

- [ ] A failing test was written BEFORE the fix was applied.
- [ ] The failing test now passes after the fix.
- [ ] The test is specific enough to prevent regression of this exact bug.

## Quality

- [ ] `npm run typecheck -w <workspace>` — 0 errors
- [ ] `npm run lint -w <workspace>` — 0 errors
- [ ] No `any` in test files.
- [ ] No `console.log` left in test files.
