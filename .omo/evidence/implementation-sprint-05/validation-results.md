# Validation Results — Sprint 5

## Packages

### packages/domain
- ✅ `npm run typecheck -w packages/domain`: PASS
- ✅ `npm run build -w packages/domain`: PASS

### packages/shared-types
- ✅ `npm run typecheck -w packages/shared-types`: PASS
- ✅ `npm run build -w packages/shared-types`: PASS
- ✅ `npm run contracts:check`: PASS (hash: sha256:034404b9...)

### backend
- ❌ `npm run typecheck -w backend`: FAILS (pre-existing: checklist.service.ts, service-case.controller.ts)
- ✅ `npm run test -w backend`: PASS (102 files, 681 tests)
- ❌ `npm run build -w backend`: FAILS (pre-existing type errors)

### frontend
- ✅ `npm run typecheck -w frontend`: PASS
- ✅ `npm run test -w frontend`: PASS (83 files, 411 tests)
- ✅ `npm run build -w frontend`: PASS (compiled successfully)

## Global
- ✅ `npm run lint`: PASS (7/7 tasks)
- ❌ `npm run build`: FAILS (pre-existing backend build errors)

## Summary
| Gate | Result | Notes |
|------|--------|-------|
| domain typecheck | ✅ | |
| domain build | ✅ | |
| shared-types typecheck | ✅ | |
| shared-types build | ✅ | |
| backend typecheck | ❌ | Pre-existing (checklist + controller) |
| backend test | ✅ | 681 tests |
| backend build | ❌ | Pre-existing |
| frontend typecheck | ✅ | |
| frontend test | ✅ | 411 tests ↑36 |
| frontend build | ✅ | Compiled successfully |
| lint | ✅ | All 7 packages pass |
| contracts:check | ✅ | Snapshot updated |
