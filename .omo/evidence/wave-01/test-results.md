# Wave 1 — Test Results

## Full verify run (2026-07-07 15:53-15:48 COT)

| Step | Result | Details |
|------|--------|---------|
| verify:shared-types | ✅ | 31 files, 181 tests, typecheck + lint + build |
| verify:domain | ✅ | typecheck + lint + build |
| verify:config | ✅ | typecheck + lint + build |
| verify:backend | ✅ | 102 files, 681 tests, typecheck + lint + build |
| verify:frontend | ✅ | 67 files, 289 tests, typecheck + lint + build (95 routes) |
| contracts:check | ✅ | Migration 071, snapshot match |
| quality:strict | ✅ | 10/10 gates within baseline |
| doctor:verbose | ✅ | 100/100 — No issues found! |

**Total tests:** 206 test files, 1151 tests, ALL PASSING
**React Doctor:** 100/100 (up from 67/100 in Wave 0)
**Build:** 95 frontend routes compiled via Turbopack
