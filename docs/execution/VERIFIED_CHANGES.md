# VERIFIED_CHANGES.md

Changes applied during Phase 00.6 — Repository Integration Baseline.

## Imported files (from rescue/local-snapshot-20260723)

### Governance
- `AGENTS.md` — Root agent rules
- `docs/GIT_WORKFLOW.md` — Git safety policy
- `backend/AGENTS.md` — Backend agent rules
- `frontend/AGENTS.md` — Frontend agent rules
- `packages/AGENTS.md` — Packages agent rules

### Domain & Security
- `docs/domain/SERVICE_CASE_WORKFLOW.md` — 14-step state machine
- `docs/security/RBAC_MATRIX.md` — Role-based access matrix

### Design
- `docs/design/CERMONT_UIUX_GUIDE.md` — UI/UX guidelines

### Status
- `docs/CURRENT_IMPLEMENTATION_STATUS.md` — Implementation status, corrected
- `docs/KNOWN_DEFECTS.md` — Known defects, corrected

### Module specs
- `docs/modules/auth/SPEC.md`
- `docs/modules/workflow/SPEC.md`

### Runbooks
- `docs/runbooks/AUTH_INCIDENT.md`
- `docs/runbooks/BACKUP_RESTORE.md`
- `docs/runbooks/DEPLOY_VPS.md`
- `docs/runbooks/EMAIL_DELIVERY.md`
- `docs/runbooks/OFFLINE_SYNC_RECOVERY.md`
- `docs/runbooks/PRODUCTION_SMOKE_TEST.md`

### Traceability
- `docs/traceability/CURRENT_TRACEABILITY_MATRIX.md`

## Status corrections

| Item | Old Status | New Status | Reason |
|------|-----------|-----------|--------|
| DEF-001 (Password Recovery) | verified | partial | Gateway returns fake success; controller ignores result; no SMTP evidence |
| Auth (password recovery) Backend | ✅ | 🟡 | Same issues as DEF-001 |
| Auth (password recovery) Tests | ✅ | 🟡 | No E2E executed, 21 frontend tests failing |

## Documentation gaps corrected

| Gap | Resolution |
|-----|-----------|
| Missing module specs | Imported docs/modules/auth/ and docs/modules/workflow/ |
| Empty security docs | Imported docs/security/RBAC_MATRIX.md |
| Missing workflow doc | Imported docs/domain/SERVICE_CASE_WORKFLOW.md |
| Missing runbooks | Imported docs/runbooks/ (6 files) |
| Missing traceability | Imported docs/traceability/CURRENT_TRACEABILITY_MATRIX.md |

## Files excluded (intentionally)

- `skills/` — external vendor content
- `.agents/skills/` — duplicated skill libraries
- `.claude/skills/` — duplicated skill libraries, largest set
- `frontend/.agents/skills/react-doctor/` — duplicated
- `frontend/.claude/skills/react-doctor/` — duplicated
- All source code changes (frontend/, backend/, packages/ source files)
- All test files
- All config files
- All scripts
- All screenshots
- All spec/ directories
- All research/internal/legal/prueba/docs

## Gates (to be executed)

See execution evidence in `docs/execution/evidence/` after Phase 8 completes.
