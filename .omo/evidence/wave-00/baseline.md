# Baseline — Wave 0

## Repository State

| Field | Value |
|-------|-------|
| Branch | `implement/spec-024-post-spec022-continuation` |
| Latest Commit | `6a3465f` — docs(spec-024): sprint 7 - final report, handoff, and PR preparation |
| Working Directory | C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo |
| Package Manager | npm 10.9.4 |
| Node | >=22.20.0 |
| Monorepo | turbo 2.9.16, 5 workspaces |

### Modified Files (staged/unstaged)

**Modified (M):**
- .github/PULL_REQUEST_TEMPLATE.md
- .github/copilot-instructions.md
- backend/src/common/docs/api-docs.ts
- backend/src/config/env.ts
- backend/src/index.ts
- backend/src/middlewares/audit-log.middleware.ts
- backend/src/middlewares/idempotency.middleware.ts
- backend/src/modules/notifications/notification.controller.ts
- backend/src/modules/notifications/notification.service.ts
- backend/src/modules/notifications/notifications.routes.ts
- backend/src/modules/service-cases/service-case.service.ts
- frontend/src/app/(dashboard)/dashboard/page.tsx
- frontend/src/app/(dashboard)/service-cases/[id]/cockpit/page.tsx
- frontend/src/modules/cockpit/model/cockpit.types.ts
- frontend/src/modules/notifications/api/notification.api.ts
- frontend/src/modules/service-cases/hooks/useServiceCase.ts
- frontend/src/modules/service-cases/queries.ts
- frontend/tests/modules/core/header-notifications.test.tsx
- packages/shared-types/src/schemas/service-case.schema.ts
- tooling/quality/baseline.json

**Deleted (D):**
- frontend/src/modules/cockpit/ui/AuditTimeline.tsx
- frontend/src/modules/dashboard/hooks/useDashboardKpis.ts
- frontend/src/modules/dashboard/ui/KpiWidgetGrid.tsx
- frontend/src/modules/evidences/ui/EvidenceGallery.tsx
- frontend/src/modules/evidences/ui/EvidenceReplacementDialog.tsx
- frontend/src/modules/service-cases/ui/CockpitPanel.tsx
- frontend/src/modules/service-cases/ui/FourteenStepProgress.tsx
- frontend/src/modules/service-cases/ui/NextActionsPanel.tsx

**Untracked (??):** .omo/ evidence files, frontend/doctor.config.json, frontend/src/lib/utils/lazy-operational-kpi-section.tsx, frontend/src/modules/dashboard/ui/OperationalKpiSection.tsx, frontend/src/modules/service-cases/model/

## Quality Gates

### 1. typecheck ✅ — 7/7 tasks successful
- config: OK
- domain: OK
- shared-types: OK
- backend: OK (cache miss, executed)
- frontend: OK (cached)

### 2. lint ✅ — 7/7 tasks successful
- config: 4 files checked, 0 fixes
- domain: 28 files checked, 0 fixes
- shared-types: 174 files checked, 0 fixes
- backend: 479 files checked, 0 fixes
- frontend: 855 files checked, 0 fixes

### 3. test ✅ — 6/6 tasks successful

| Workspace | Test Files | Tests Passed |
|-----------|:----------:|:------------:|
| domain | 6 | 77 |
| shared-types | 31 | 181 |
| backend | 102 | 681 |
| frontend | 67 | 289 |
| **Total** | **206** | **1228** |

### 4. build ✅ — 5/5 tasks successful
- config: OK
- domain: OK
- shared-types: OK
- backend: OK
- frontend: OK (Next.js 16.2.9 Turbopack, 95 pages, 243 SW precache entries, 6648.51 KiB)

### 5. contracts:check ✅
- Snapshot hash: `sha256:cb5c2fdd5f1bcd27eb38bb8a7e031598ff874790a81b0e0b91829d1476bf26b5`
- Latest migration: `071-spec-020-wave-1-template-response-object-ids`

### 6. quality:strict ✅ — All 10 gates passing

| Gate | Findings | Status |
|------|:--------:|:------:|
| weak-tokens | 3086 total (73a/1526n/710u/777ud) — all within baseline | ✅ |
| language | 2753/2761 within baseline | ✅ |
| semantics | 17/17 within baseline | ✅ |
| routes | 0 findings | ✅ |
| dtos | 38/39 within baseline | ✅ |
| zero | 0 findings | ✅ |
| lint-residue | 0 findings | ✅ |
| service-size | 0 findings | ✅ |
| env | All checks passed | ✅ |
| hardcoded-roles | 0 violations | ✅ |

### 7. React Doctor

**Workspace react-doctor v0.5.1 (via verify):** 100/100 — No issues found ✅
**npx react-doctor@latest v0.7.1:** 67/100 — 9 issues found

The discrepancy is due to `doctor.config.json` having `"Performance": "off"` and v0.5.1 vs v0.7.1 differences.

### 8. verify ✅
All sub-steps passed:
- verify:shared-types ✅
- verify:domain ✅
- verify:config ✅
- verify:backend ✅
- verify:frontend ✅
- contracts:check ✅
- quality:strict ✅
- doctor:verbose (v0.5.1) ✅ 100/100

## Route Verification

### Portal routes — ✅ EXIST
| Route | Type |
|-------|:----:|
| /portal | Static (○) |
| /portal/invoices | Static (○) |
| /portal/orders | Static (○) |
| /portal/orders/[id] | Dynamic (ƒ) |
| /portal/proposals | Static (○) |
| /portal/service-cases | Static (○) |
| /portal/service-cases/[id] | Dynamic (ƒ) |
| /portal/signatures/[id] | Dynamic (ƒ) |

### Backup routes — ✅ EXIST
| Route | Type |
|-------|:----:|
| /admin/backups | Dynamic (ƒ) |

### Portal schemas — no dedicated portal schema file found
References to "portal" exist in: invoice-approval.schema.ts, work-request.schema.ts

## doctor.config.json
Location: frontend/doctor.config.json
Content: `{"$schema": "https://react.doctor/schema/config.json", "lint": true, "deadCode": true, "verbose": false, "blocking": "none", "categories": {"Performance": "off"}}`

## Risks
1. react-doctor version mismatch: workspace v0.5.1 (100/100) vs latest v0.7.1 (67/100)
2. doctor.config.json has Performance category disabled (sufficient for verify compliance)
3. 29 modified files pending commit (pre-existing work-in-progress)
4. 4 weak-tokens metrics below baseline (u: 710/714, ud: 777/781)

## P0 Tickets (Pre-Wave 0 Assessment)

### Vigentes (need Wave 1 confirmation)
- CERMONT-W01-T01: weak-token-ud persistence (u: 710/714, ud: 777/781 — below baseline by 4 each)
- CERMONT-W01-T02: React Doctor 67/100 (v0.7.1 — 9 Missing key issues)
- CERMONT-W01-T03: notifications response normalization
- CERMONT-W01-T04: 404 notifications/unread-count verification
- CERMONT-W01-T05: verify completion

### Superseded (already passing in baseline)
- None identified — all gates pass in workspace
