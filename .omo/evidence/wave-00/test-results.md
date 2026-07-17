# Wave 0 — Test Results

## Summary

| Workspace | Test Files | Tests Passed | Duration |
|-----------|:----------:|:------------:|:--------:|
| @cermont/domain | 6 | 77 | 1.85s |
| @cermont/shared-types | 31 | 181 | 3.95s |
| @cermont/backend | 102 | 681 | 21.52s |
| @cermont/frontend | 67 | 289 | 49.49s |
| **Total** | **206** | **1228** | **—** |

## Notable Test Details

### Frontend Tests (289 passed)
- 67 test files, all passed
- Coverage includes: api-client, auth, billing, checklists, cockpit, connectivity, costs, dashboard, delivery-records, documents, evidences, fleet, forms, inventory, navigation, notifications, offline, orders, planning, proposals, pwa, rbac, reports, service-cases, site-visits, sync, templates, work-requests

### Backend Tests (681 passed)
- 102 test files, all passed
- Coverage includes: auth, automation, case-closure, checklists, costs, dian, dispatch, documents, evidences, fleet, invoices, kpi, maintenance, notifications, orders, payments, planning, proposals, reports, service-cases, sync, work-requests, security (idor, rate-limit, uploads, http-hardening), middleware, models

### Domain Tests (77 passed)
- 6 test files: operational-steps, checklist-rules, spec-015-rules, step-requirements, service-case-state-machine, cost-budget-rules

### Shared-types Tests (181 passed)
- 31 test files covering all schemas + contract snapshot test
- ✅ Contract snapshot matches committed artifact
