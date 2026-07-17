# Test Results — Plan v2 Audit

## Frontend (Vitest)
- Test files: 93 passed
- Tests: 487 passed
- Duration: 44.09s
- Environment: jsdom (setup 44.48s, environment 414.15s)

### Test categories (frontend)
- Core (navigation, breadcrumbs, KPIs): ~30 tests
- Auth (api-client 401 refresh, auth store): ~10 tests
- Checklists (useOfflineChecklist, file upload, item control): ~15 tests
- Cockpit (14-step transformer): ~9 tests
- Costs (comparison, queries, export): ~10 tests
- Dashboard (visuals, hooks, KPIs, command center): ~20 tests
- Documents (gallery, page): ~20 tests
- Evidences (category, report): ~11 tests
- Fleet (MaintenanceTab, NewVehicleDrawer, VehicleAssignmentPanel, panels): ~25 tests
- Forms (templates, sectioned renderer): ~10 tests
- Kits (form, templates, wizard): ~10 tests
- Orders (closure tab, kanban): ~7 tests
- Planning (wizard, steps, reducer, readiness gate, signatures, e2e flow): ~30 tests
- Service-cases (page, cockpit enrichment): ~10 tests
- PWA/public (assets, service-worker, serwist): ~20 tests
- HTTP/lib (api-client, pagination, retry, logger): ~15 tests
- Automation (rules engine): ~5 tests
- P0 (react-doctor remediation): ~5 tests

## Backend (Vitest)
- Test files: 102 passed
- Tests: 688 passed
- Duration: 18.86s
- Environment: node

### Test categories (backend)
- Auth middleware: ~10 tests
- Controller tests: ~20 tests
- Service tests (cost, sla, checklist, planning, evidence, payment, invoice, etc.): ~150 tests
- Route tests: ~20 tests
- Model tests: ~30 tests
- Integration tests: ~20 tests
- Common/FSM tests: ~15 tests

## Shared-types (Vitest)
- Test files: 32 passed
- Tests: 183 passed
- Duration: 3.56s

### Test categories (shared-types)
- Schema validation tests: ~100 tests
- Snapshot tests: ~30 tests
- Domain pipeline tests: ~20 tests
- Specific schema tests (evidence, checklist, cost, automation, etc.): ~33 tests

## Domain
- Tests exist but not separately counted (included in build verification)
- Package builds successfully

## E2E (Playwright)
- NOT EXECUTABLE
- Playwright browsers not installed
- 10 spec files exist at frontend/tests/e2e/spec-014/
- Specs cover: cockpit 14-step, dashboard KPIs, cost intelligence, field execution, report auto-draft, invoice pipeline, notifications, client portal, RBAC roles, full 14-step flow

## Summary
| Workspace | Files | Tests | Passing | Failed | Skipped |
|-----------|-------|-------|---------|--------|---------|
| Frontend | 93 | 487 | 487 | 0 | 0 |
| Backend | 102 | 688 | 688 | 0 | 0 |
| Shared-types | 32 | 183 | 183 | 0 | 0 |
| **Total** | **227** | **1358** | **1358** | **0** | **0** |
