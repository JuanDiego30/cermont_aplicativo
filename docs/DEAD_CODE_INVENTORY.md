# Dead Code Inventory — Cermont S.A.S.

**Generated:** 2026-07-23  
**Scope:** Full monorepo (backend, frontend, packages, e2e)  
**Methodology:** File-level duplicate detection, grep cross-reference, import tracing, route registration audit

---

## Summary

| Severity | Count |
|----------|-------|
| HIGH     | 5     |
| MEDIUM   | 10    |
| LOW      | 8     |
| **Total**| **23**|

---

## HIGH

| ID | Location | Type | Consumers | Description | Remediation |
|----|----------|------|-----------|-------------|-------------|
| DC-001 | `core/ui/OfflineBanner.tsx` + `components/offline/OfflineBanner.tsx` + `components/common/OfflineBanner.tsx` | DUPLICATE | 3 scattered import sites | 3 different OfflineBanner implementations. `core/ui` is the canonical one used by the layout shell; the other two are dead-code branches from partial refactors. | Delete `components/offline/` and `components/common/` copies, rewire any remaining consumers to `core/ui/OfflineBanner`. |
| DC-002 | `core/ui/AppIcon.tsx` + `components/ui/AppIcon.tsx` | DUPLICATE | Multiple icon lookup sites | Both export an `<AppIcon>` component with near-identical props. `components/ui` version is used by sidebar; `core/ui` is used by cockpit. | Consolidate to `core/ui/AppIcon`, update all imports, delete `components/ui/AppIcon.tsx`. |
| DC-003 | `core/ui/KPICard.tsx` + `components/ui/KPICard.tsx` + `modules/dashboard/ui/KPICard.tsx` | DUPLICATE | Dashboard, cockpit, reports | 3 different KPICard implementations with different prop APIs. `modules/dashboard/ui` is the most recently updated. | Audit consumers, pick canonical (propose `modules/dashboard/ui/`), delete other two, update imports. |
| DC-007 | `frontend/tests/modules/work-requests/` — 2 test files testing overlapping logic | STALE_TEST | CI pipeline (adds 6+ min) | `new-work-request-page.test.tsx` and `work-request-new-page.test.tsx` both test work-request form submission with different mock setups. 5 of 9 frontend failures originate here. | Merge into one file with unified mocks; delete the other. |
| DC-008 | `packages/shared-types/src/config/env.ts` | DUPLICATE_SOT | 3 direct imports across monorepo | Duplicates `@cermont/config` env validation schema with overlapping but incomplete fields. The shared-types version declares `MONGODB_URI` and `BACKEND_URL` as optional; the config package has a different set of required fields. | Delete `shared-types/src/config/env.ts`, rewire consumers to `@cermont/config`, or merge into single canonical schema. |

---

## MEDIUM

| ID | Location | Type | Description | Remediation |
|----|----------|------|-------------|-------------|
| DC-009 | `backend/src/modules/kit/kit.service.ts` — unused `helmet` mapping | DEAD_CODE | Line 754 maps `"helmet" → "Casco de Seguridad"` as a local variable that is never referenced by any export or template | Delete the dead mapping. |
| DC-010 | `docs/architecture/API_ENDPOINT_MATRIX.md` | STALE_DOC | Documents ~100 endpoints; actual codebase has 71 route files with estimated 389+ unique paths. Matrix last updated 2026-05-13. | Regenerate from route files, or archive and replace with auto-generated OpenAPI spec. |
| DC-011 | `backend/src/modules/analytics-report/` — entire module | POSSIBLE_ORPHAN | Route registered in `index.ts` but no controller tests, no E2E coverage, no known consumer in frontend | Verify with product; delete if unused. |
| DC-012 | `backend/src/modules/dispatch/` — entire module | POSSIBLE_ORPHAN | Route registered, no controller tests, no frontend implementation detected | Verify with product; delete if unused. |
| DC-013 | `backend/src/modules/portal/` — entire module | POSSIBLE_ORPHAN | Route registered, no controller tests, no frontend implementation detected | Verify with product; delete if unused. |
| DC-014 | `backend/src/modules/privacy-requests/` — entire module | POSSIBLE_ORPHAN | Route registered, no controller tests. Legal docs exist but no frontend integration. | Verify with product; keep if compliance roadmap active. |
| DC-015 | `docs/audits/archive/` — 20+ stale audit reports | STALE_DOC | Archive directory of auditor deliverables from 2026-05. Contents reference old code structure, old module names. | Archive to git LFS or delete; keep only latest `audits/README.md`. |
| DC-016 | `docs/plans/archive/` — 6 masterplan versions | STALE_DOC | Versions v3 through v6.1 of the masterplan, all superseded by `docs/plans/CERMONT_MASTERPLAN.md`. | Delete archive; keep single source of truth. |
| DC-017 | `frontend/tests/lib/http/api-client-url.test.ts` | STALE_TEST | Tests URL construction for a past bug (double `/api/backend` prefix). API client has since been refactored; the test mocks no longer match current behavior. | Update test to match current `apiClient` contract, or delete. |
| DC-018 | `backend/src/modules/execution-session/execution-technical-report.routes.ts` | BOUNDARY_BLUR | Technical-report logic living inside `execution-session` module instead of `technical-report` module. | Move routes to `technical-report/` or alias; keep single ownership. |

---

## LOW

| ID | Location | Type | Description |
|----|----------|------|-------------|
| DC-019 | `backend/src/modules/automation/` | UNUSED | Routes registered, services exist, but no frontend or E2E coverage |
| DC-020 | `backend/src/modules/custom-fields/` | UNUSED | Routes registered, no frontend integration |
| DC-021 | `backend/src/modules/inventory/` | UNUSED | Routes registered, no frontend integration |
| DC-022 | `backend/src/modules/maintenance/` | UNUSED | Routes registered, no frontend integration |
| DC-023 | `backend/src/modules/resource/` | UNUSED | Routes registered, no frontend integration |
| DC-024 | `backend/src/modules/jobs/` | UNUSED | Route registered, no frontend integration |
| DC-025 | `backend/src/modules/qr/` | UNUSED | Route registered, no frontend integration |
| DC-026 | `backend/src/modules/checklist/` | UNUSED | Route registered, no frontend integration |

Note: LOW items may be part of phase-2 roadmap. Verify before deleting.

---

## Route Registration Audit

All 71 route files are registered in `backend/src/index.ts`. No orphan routes were found — every module in `backend/src/modules/` has a corresponding import and `app.use()` call in `index.ts`. However, modules listed in DC-011 through DC-014 and DC-019 through DC-026 have no test coverage and no confirmed frontend consumers.
