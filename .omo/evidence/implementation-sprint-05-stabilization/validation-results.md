# Validation Results

## Core Gates
| Gate | Result |
|---|---|
| Backend typecheck | ✅ PASS |
| Backend lint | ✅ PASS (8 pre-existing `any` warnings) |
| Backend tests | ✅ PASS (686 tests, 102 files, 0 failures) |
| Backend build | ✅ PASS |
| Frontend typecheck | ✅ PASS |
| Frontend lint | ✅ PASS |
| Frontend tests | ✅ PASS (411 tests, 83 files) |
| Frontend build | ✅ PASS (Next.js 16 Turbopack) |
| Contracts check | ✅ PASS |
| Shared-types | ✅ PASS (181 tests) |
| Domain | ✅ PASS |
| Config | ✅ PASS |

## Quality Strict
| Sub-gate | Result |
|---|---|
| weak-tokens | ✅ 3041/3041 within baseline |
| language | ✅ 2819/2819 within baseline |
| semantics | ❌ 17 findings (baseline 9) — ALL frontend pages, outside scope |

## Original 7 Errors
All 7 resolved — typecheck passes.

## Verdict
Backend ✅, Frontend ✅, Contracts ✅. Only `quality:semantics` fails from pre-existing frontend pages (not in scope).
