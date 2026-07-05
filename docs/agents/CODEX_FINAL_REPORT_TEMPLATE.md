# CODEX FINAL REPORT TEMPLATE

## Purpose

Every Codex task MUST end with this exact report format. No exceptions. This ensures every agent — and every human reviewer — can verify what was done, what passed, and what remains.

---

## Required Format

```
## Task Completed

[yes / no — if no, explain why]

## Files Modified

- path/to/file — [what changed and why]

## Files Created

- path/to/file — [what it is]

## Files Deleted

- path/to/file — [why it was removed]

## Tests Executed

- npm run test -w [workspace] -- [test file]
- Result: [pass / fail / N tests run]

## Gates Result

| Gate | Status |
|------|--------|
| typecheck | [✅ / ❌] |
| lint | [✅ / ❌] |
| test | [✅ / ❌] |
| build | [✅ / ❌] |
| verify | [✅ / ❌] |
| react-doctor | [score] |

## Known Pending Issues

- [issue] — [impact] — [planned resolution]

## Deploy Verdict

[ready / blocked / needs review]
```

---

## Example (Complete)

```
## Task Completed

yes

## Files Modified

- backend/src/services/order.service.ts — added transition validation for on_hold state
- frontend/src/modules/orders/ui/OrderDetail.tsx — added on_hold button with permission check

## Files Created

- None

## Files Deleted

- None

## Tests Executed

- npm run test -w backend -- order.service.test.ts
- Result: pass (12 tests run)
- npm run test -w frontend -- OrderDetail.test.tsx
- Result: pass (8 tests run)

## Gates Result

| Gate | Status |
|------|--------|
| typecheck | ✅ |
| lint | ✅ |
| test | ✅ |
| build | ✅ |
| verify | ✅ |
| react-doctor | 100/100 |

## Known Pending Issues

- None

## Deploy Verdict

ready
```

---

## Failure Example

```
## Task Completed

no — blocked by unsupported Mongoose 9.x aggregate pipeline syntax

## Files Modified

- backend/src/services/report.service.ts — attempted aggregation, rolled back

## Files Created

- None

## Files Deleted

- None

## Tests Executed

- npm run test -w backend -- report.service.test.ts
- Result: 8 pass, 2 fail (aggregation tests)

## Gates Result

| Gate | Status |
|------|--------|
| typecheck | ✅ |
| lint | ✅ |
| test | ❌ (2 failures) |
| build | ✅ |
| verify | ❌ |
| react-doctor | N/A |

## Known Pending Issues

- Mongoose 9.x aggregate `$lookup` with pipeline syntax differs from documented examples
- Needs investigation: check Mongoose 9.3 changelog for breaking changes

## Deploy Verdict

blocked — requires research on Mongoose 9.x aggregate API
```

---

## Enforcement

If a task ends without this report, the task is **incomplete**. The report must include real gate output — never fabricated. If a gate fails, report it honestly. Never claim "all green" when output shows failures.
