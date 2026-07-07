# Workflow: QA Remediation

> Use when addressing issues from quality audits, Qodana reports, or CI gate failures.

---

## When to Use
- CI pipeline fails.
- `npm run quality:strict` reports issues.
- Qodana introduces new warnings.
- A code review identifies violations.
- An audit report (docs/audits/) lists issues to fix.

---

## Steps

### 1. Read the Full Issue List
Before fixing anything:
- Read the complete report (audit file, CI log, Qodana output).
- Categorize issues by severity: critical → high → medium → low.
- Identify dependencies between issues (some fixes unblock others).

### 2. Reproduce Each Issue Locally
```bash
npm run quality:strict    # reproduce all custom quality checks
npm run typecheck         # reproduce TypeScript errors
npm run lint              # reproduce Biome errors
npm run test              # reproduce test failures
```

If an issue cannot be reproduced locally, investigate the CI environment.

### 3. Prioritize

| Priority | Issue Type |
|----------|-----------|
| 1 (Fix Now) | Security vulnerabilities, broken builds, failing tests |
| 2 (Fix Next) | TypeScript errors, Biome errors, quality:strict failures |
| 3 (Fix Soon) | Coverage below threshold, Qodana warnings |
| 4 (Track) | Code style, naming inconsistencies |

### 4. Fix One Category at a Time

**TypeScript errors:**
```bash
npm run typecheck -w backend    # fix backend errors first
npm run typecheck -w frontend   # then frontend
```

**Biome lint errors:**
```bash
biome check --write .    # auto-fix where possible
# Review remaining issues manually
```

**Quality strict failures (weak tokens, language, semantics):**
```bash
npm run quality:weak-tokens
npm run quality:language
npm run quality:semantics
# Fix reported files one at a time
```

**Test failures:**
- Write a reproducing test first if the bug has no test.
- Fix the root cause — never delete a failing test.

### 5. Verify After Each Fix
```bash
npm run typecheck -w <workspace>    # after TypeScript fix
npm run lint -w <workspace>         # after Biome fix
npm run test -w <workspace>         # after logic fix
npm run quality:strict              # after quality fix
```

### 6. Final Gate
```bash
npm run verify    # full pipeline simulation
```

### 7. Document Fixed Issues
Update the audit report:
```markdown
## Fixed in PR #XX — 2026-05-03
- [ ✅ ] Removed `any` types in order.service.ts
- [ ✅ ] Replaced `useEffect` with `useQuery` in OrderList
- [ ✅ ] Added missing `authorize()` middleware to /api/costs
```

### 8. Zero New Issues Rule
A remediation PR must:
- Fix all issues in scope.
- Introduce ZERO new Qodana issues.
- Not degrade coverage below threshold.

---

## Common Remediations

| Issue | Fix |
|-------|-----|
| `any` type | Infer from Zod schema or Mongoose model |
| Missing `authorize()` | Add `authorize('role')` to the route |
| `useEffect` for fetch | Replace with `useQuery` |
| Spanglish identifier | Rename to English |
| Div soup | Replace with semantic HTML |
| Duplicated DTO | Delete local; import from `@cermont/shared-types` |
| `try/catch` in controller | Remove entirely; Express 5 propagates |
| `console.log` | Replace with structured logger or delete |
| `localhost` MongoDB | Replace with `127.0.0.1` |
