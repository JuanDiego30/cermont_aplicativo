# GATE RESULTS — Phase 00.6

Executed: 2026-07-23 17:58-18:05
Cache: All bypassed via `--force`
Base branch: `origin/deploy/vps-clean` (SHA: 15419061b87ab45c3824ec21eeef8017f4aba5bd)

## typecheck

| Package | Result | Details |
|---------|--------|---------|
| @cermont/config | ✅ Pass |  |
| @cermont/domain | ✅ Pass |  |
| @cermont/shared-types | ✅ Pass |  |
| @cermont/backend | ❌ Fail | Missing `VehicleAssignment` model (spec-009 import missing from base) |
| @cermont/frontend | ✅ Pass |  |

**Root cause**: The merge commit `1541906` (PR #2, spec-009) updated `models/index.ts` and `fleet.service.ts` to reference `VehicleAssignment`, but the model file itself was never committed to `deploy/vps-clean`.

## lint

| Package | Result | Details |
|---------|--------|---------|
| @cermont/config | ✅ Pass |  |
| @cermont/domain | ✅ Pass |  |
| @cermont/shared-types | ✅ Pass |  |
| @cermont/backend | ✅ Pass |  |
| @cermont/frontend | ✅ Pass |  |

**All 5 packages**: No lint issues.

## test

| Package | Files | Passed | Failed | Tests Passed | Details |
|---------|-------|--------|--------|-------------|---------|
| @cermont/domain | 3 | 3 | 0 | 44 | ✅ |
| @cermont/shared-types | 26 | 26 | 0 | 159 | ✅ |
| @cermont/backend | 90 | 75 | 15 | 509 | ❌ 15 suites fail (VehicleAssignment missing) |
| @cermont/frontend | 54 | 54 | 0 | 231 | ✅ |

**Backend failures**: All caused by `Cannot find module './VehicleAssignment'` — same root cause as typecheck.

## build

| Package | Result | Details |
|---------|--------|---------|
| @cermont/config | ✅ Built |  |
| @cermont/domain | ✅ Built |  |
| @cermont/shared-types | ✅ Built |  |
| @cermont/frontend | ✅ Built | Next.js Turbopack — compiled successfully |
| @cermont/backend | ❌ Fail | Same VehicleAssignment issue |

## verify

Not fully executed because it depends on backend build passing. Individual verify steps were run.

## E2E discovery

```bash
npx playwright test --list
```
Not executed — requires backend running and test DB.

## Risk note

The `deploy/vps-clean` branch has a broken **backend** because the spec-009 merge was incomplete. This does not block the documentation baseline but must be resolved before any auth module development can be verified end-to-end.
