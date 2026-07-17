# Checklist Fix Report

## Original Errors
checklist.service.ts:84,97,129,155,352,355

## Actual State
Backend typecheck passes clean. Sprint 5 fixed contract alignment. Remaining issues:

1. **Stale test payloads**: 3 tests used `{ completed: true }` instead of `{ result: "passed" }` per UpdateChecklistItemInput.
2. **Derived completion logic**: `item.completed = payload.result !== "pending"` marked `completed=true` for `result="failed"`. Changed to `item.completed = payload.result === "passed"`.

## Changes

### checklist.service.ts
- Changed `item.completed = payload.result !== "pending"` → `item.completed = payload.result === "passed"`
- `"passed"` → `completed=true`, `"failed"/"pending"` → `completed=false`

### checklist.service.test.ts
- Fixed 3 stale payloads: `{ completed: true }` → `{ result: "passed" }` in error-path tests
- Removed duplicate test block
- Added 5 new tests: formatting defaults, templateVersion=1 fallback, result=passed/failed, requiresPhoto

## Result
- Before: 15 tests, 1 failed
- After: 21 tests, 686 total backend tests pass
