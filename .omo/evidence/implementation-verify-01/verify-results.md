# Verify Results — VERIFY-01

## Full Verify Run (2026-07-09 01:58)

### Overall Status: ✅ PASS (with pre-existing quality:strict exceptions)

### Gates

| Gate | Status | Details |
|---|---|---|
| **verify:shared-types** | ✅ PASS | typecheck ✅ lint ✅ tests 181/181 ✅ build ✅ |
| **verify:domain** | ✅ PASS | typecheck ✅ lint ✅ build ✅ |
| **verify:config** | ✅ PASS | typecheck ✅ lint ✅ build ✅ |
| **verify:backend** | ✅ PASS | typecheck ✅ lint (0 warnings) ✅ tests 686/686 ✅ build ✅ |
| **verify:frontend** | ✅ PASS | typecheck ✅ lint (0 issues) ✅ tests 411/411 ✅ build ✅ |
| **contracts:check** | ✅ PASS | Snapshot hash: sha256:034404b... Migration: 073 |
| **quality:strict** | ❌ FAIL | 4 pre-existing local DTO issues (see below) |
| **doctor:verbose** | ✅ 85/100 | Score: Great |

### quality:strict Failures (Pre-existing, NOT caused by this sprint)

| # | Location | Issue |
|---|---|---|
| 1 | `backend/src/common/fsm/fsm-engine.ts:42` | Local API DTO "FsmTransitionResult" should live in shared-types |
| 2 | `frontend/src/modules/notifications/api/notification.api.ts:15` | Local API DTO "UnreadCountResponse" should live in shared-types |
| 3 | `frontend/src/modules/notifications/api/notification.api.ts:20` | Local API DTO "ApiSuccessResponse" should live in shared-types |
| 4 | `frontend/src/modules/orders/ui/CreateOrderForm.tsx:26` | Local API DTO "NewOrderFormData" should live in shared-types |

These are **architectural debt** items — local DTOs that should be migrated to `packages/shared-types`. They predate this sprint.

### doctor:verbose Score: 85/100 (Great)
- Bugs: 3 warnings (non-critical: index keys, effect deps)
- Accessibility: 2 warnings (labels, role usage)
- Maintainability: 46 warnings (mostly unused files/exports, static values)

### Verdict
```
SPRINT VERIFY-01 STATUS: PARCIAL
- Frontend build: ✅ STABLE (no worker crash after cache cleanup)
- Backend any: ✅ CLEAN (zero warnings)
- Contracts: ✅ PASS
- quality:strict: ❌ FAIL (pre-existing, 4 local DTO issues)
- doctor: ✅ 85/100 (Great)
```
