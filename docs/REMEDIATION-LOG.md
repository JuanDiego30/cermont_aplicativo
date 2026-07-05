# Remediation Log — Cermont Post-Audit Fixes

**Plan Version:** 1.0 · **Started:** 2026-04-14 · **Status:** IN_PROGRESS

## Validation Summary

**Evidence Validation Results:**

| Phase | Finding | Status | Notes |
|-------|---------|--------|-------|
| Phase 1 | IDOR in `GET /orders/:id` | ✅ CONFIRMED | Controller calls `getOrderById()` without auth; `getOrderByIdWithAuth()` method exists |
| Phase 2 | IDOR in `GET /evidences/order/:orderId` | ✅ CONFIRMED | Service validates order exists but NOT ownership; no auth check on endpoint |
| Phase 3 | Hardcoded credentials | ✅ CONFIRMED | docker-compose has `admin:admin`; seed.ts has fallback `Cermont2026!` |
| Phase 4 | Kit form drift | ⚠️ PARTIAL | Form already uses `activityType` correctly in `normalizePayload`; verify backend validation |
| Phase 5 | Pagination no limit | ⚠️ NEEDS_CHECK | Query params validated but need to verify cap enforcement |

---

## Phase 1 — CRITICAL: IDOR in GET /orders/:id

**Status:** ✅ COMPLETED · **Completed:** 2026-04-14 · **SHA:** f83bea6

### Tasks

- [x] 1.1 — Update order-crud.controller.ts to use `getOrderByIdWithAuth`
- [x] 1.2 — Verify route has `authenticate` middleware (already confirmed ✅)
- [x] 1.3 — Add test for ownership check (5 new regression tests added)
- [x] 1.4 — Run verification commands (27 tests passed ✅, zero vulnerable calls ✅)
- [x] 1.5 — Commit and close phase (SHA: f83bea6 ✅)

### Execution Log

```
[2026-04-14 START] Reading evidence locations and validating...
[2026-04-14 CONFIRMED] Route middleware: ✅ authenticate present
[2026-04-14 CONFIRMED] Service method: ✅ getOrderByIdWithAuth exists
[2026-04-14 STEP 1.1] Updated order-crud.controller.ts getOrder function
[2026-04-14 STEP 1.3] Added 5 regression tests for getOrderByIdWithAuth
[2026-04-14 STEP 1.4] Verification Results:
  - Order service tests: 27 PASSED ✅
  - Vulnerable calls check: ZERO FOUND ✅
  - Route middleware check: CONFIRMED ✅
[2026-04-14 COMPLETED] Commit SHA: f83bea6
```

---

## Phase 2 — CRITICAL: IDOR in GET /evidences/order/:orderId

**Status:** ✅ COMPLETED · **Completed:** 2026-04-14 · **SHA:** 5aa80f9

### Tasks

- [x] 2.1 — Add `actor` parameter to `getEvidencesByOrderId` service
- [x] 2.2 — Call `getOrderByIdWithAuth` to verify ownership
- [x] 2.3 — Update evidence controller to pass `req.user`
- [x] 2.4 — Verify dependency injection (OrderCrudService imported ✅)
- [x] 2.5 — Add test for ownership check (3 comprehensive tests added)

### Execution Log

```
[2026-04-14 STEP 2.1] Added actor param to service with auth check
[2026-04-14 STEP 2.2] Service now calls getOrderByIdWithAuth to verify ownership
[2026-04-14 STEP 2.3] Controller passes req.user as actor ✅
[2026-04-14 STEP 2.4] OrderCrudService imported ✅
[2026-04-14 STEP 2.5] Added 3 regression tests (success, forbidden, not_found)
[2026-04-14 VERIFICATION] All 12 evidence tests passed ✅
[2026-04-14 COMPLETED] Commit SHA: 5aa80f9
```

---

## Phase 3 — HIGH: Hardcoded Credentials

**Status:** ✅ COMPLETED · **Completed:** 2026-04-14 · **SHA:** e49a2de

### Tasks

- [x] 3.1 — Replace docker-compose credentials with env vars
- [x] 3.2 — Update .env.example with placeholders
- [x] 3.3 — Remove hardcoded seed password, use env var
- [x] 3.4 — Restrict MongoDB port to loopback in dev compose

### Execution Log

```
[2026-04-14 STEP 3.1] Updated docker-compose.yml with ${MONGO_ROOT_USER} and ${MONGO_ROOT_PASSWORD}
[2026-04-14 STEP 3.2] Added MONGO_ROOT_USER, MONGO_ROOT_PASSWORD, SEED_DEFAULT_PASSWORD to .env.example
[2026-04-14 STEP 3.3] Made SEED_DEFAULT_PASSWORD required in seed.ts (throws error if missing)
[2026-04-14 STEP 3.4] Restricted MongoDB port to 127.0.0.1 in dev compose ✅
[2026-04-14 VERIFICATION] 0 hardcoded credentials found ✅
[2026-04-14 COMPLETED] Commit SHA: e49a2de
```

---

## Phase 4 — MEDIUM: Kit Form Drift

**Status:** ✅ ALREADY_FIXED · **Verified:** 2026-04-14

### Findings

- Form correctly uses `activityType` (camelCase) in normalizePayload ✅
- Backend route has `validate(CreateMaintenanceKitSchema)` middleware ✅  
- Schema field names match form payload names ✅
- No description field needed — schema doesn't define it ✅
- Full alignment: form → shared schema → backend validation

---

## Phase 5 — MEDIUM: Pagination Without Limit
- **Completed:** 3 (Phases 1-3) ✅
- **In Progress:** 0
- **Pending:** 5 (Phases 4-8)

**Progress:** 37.5% → [CONTINUING]

---

## Next: Phases 4-8 (MEDIUM/LOW/INFO Priority)

