# Workflow: Refactor Safely

> Use when restructuring existing code without changing its external behavior.

---

## When to Use
- Moving code between files (SRP split).
- Renaming functions or types.
- Extracting a service from a controller.
- Eliminating duplication.
- Modernizing a pattern (e.g., replacing `useEffect` with `useQuery`).

---

## Non-Negotiable Rules for Refactors

1. **Never change behavior and structure at the same time.** One commit for refactor, separate commit for behavior change.
2. **Tests must pass before and after.** If they don't pass before, fix them first.
3. **Never delete code without verifying it's unreachable.** Use `npm run quality:strict` to detect unused exports.
4. **Keep the public API stable.** If a function signature changes, update all callers in the same commit.

---

## Steps

### 1. Confirm the Baseline
```bash
npm run test -w <workspace>     # all must pass before you start
npm run typecheck -w <workspace>
npm run lint -w <workspace>
```

Record: X tests passing, 0 TypeScript errors.

### 2. Identify the Scope
- What files will change?
- What is the public API surface (exported functions/types/components)?
- What imports will break and need updating?

### 3. Make One Small Change
- Move / rename / extract one unit at a time.
- After each step, verify:

```bash
npm run typecheck -w <workspace>
```

Do not batch large changes into one step.

### 4. Update All Consumers
If you renamed or moved an export:
- Search for all imports of the old name.
- Update them to the new location/name.

```bash
# Find all usages
grep -r "oldFunctionName" backend/src
grep -r "OldComponentName" frontend/src
```

### 5. Run Tests After Each Step
```bash
npm run test -w <workspace>
```

If a test fails, fix it before moving to the next step.

### 6. Verify Behavior Is Unchanged
For critical business logic:
- Run the relevant E2E test.
- Manually test the affected flow if no E2E exists.

### 7. Final Check
```bash
npm run verify
```

### 8. Commit Atomically
One commit per logical refactor step:
```
refactor(backend): extract order validation into OrderValidationService
refactor(frontend): replace useEffect fetch with useQuery in OrderList
```

---

## Common Pitfalls

| Pitfall | How to Avoid |
|---------|-------------|
| Circular imports after move | Use `npm run quality:strict` to detect |
| Forgot to update a consumer | `grep` for old name before committing |
| Behavior changed during refactor | Keep refactor and behavior fix in separate commits |
| Removed an export used by tests | Run tests immediately after each change |
| Types break after rename | TypeScript will catch this — run `typecheck` often |
