# RESCUE_RECONCILIATION_INVENTORY.md

## Base references

| Ref | SHA |
|-----|-----|
| `origin/deploy/vps-clean` | `15419061b87ab45c3824ec21eeef8017f4aba5bd` |
| `origin/rescue/local-snapshot-20260723` | `497ab94a43493104d5e8d8f3db05d60d9ddfcacc` |
| Merge-base | `a758fc0bc3396f0fc9133503795b49e216950d88` |
| Divergence | 1 ahead / 93 behind (rescue vs deploy) |

### Commit absent from rescue

The merge commit `1541906` (Merge PR #2 - spec-009 execution scale) is present on `deploy/vps-clean` but not in the rescue snapshot.

## Change classification summary

Total: 3104 files changed, 1844050 insertions(+), 20186 deletions(-)

### 1. Governance (import approved)

| Path | Status |
|------|--------|
| `AGENTS.md` | M |
| `docs/GIT_WORKFLOW.md` | A (untracked) |
| `docs/CURRENT_IMPLEMENTATION_STATUS.md` | A |
| `docs/KNOWN_DEFECTS.md` | A |
| `docs/domain/SERVICE_CASE_WORKFLOW.md` | A |
| `docs/security/RBAC_MATRIX.md` | A |
| `docs/design/DESIGN.md` | A |
| `docs/design/CERMONT_UIUX_GUIDE.md` | A |
| `packages/domain/AGENTS.md` | A |
| `backend/AGENTS.md` | A |
| `frontend/AGENTS.md` | A |
| `packages/AGENTS.md` | A |

### 2. Product documentation (import approved selectively)

- `docs/domain/` — business flow maps, forms, org chart
- `docs/design/` — UI/UX guide, DESIGN.md
- `docs/modules/` — SPEC per module (auth, workflow, service-cases, etc.)
- `docs/product/` — product blueprint, innovation roadmap, maturity matrix
- `docs/security/` — RBAC_MATRIX.md
- `docs/runbooks/` — AUTH_INCIDENT, BACKUP_RESTORE, DEPLOY_VPS, EMAIL_DELIVERY, OFFLINE_SYNC_RECOVERY, PRODUCTION_SMOKE_TEST
- `docs/traceability/` — CURRENT_TRACEABILITY_MATRIX.md
- `docs/plans/` — masterplans, architectural plan
- `docs/legal/` — legal drafts (privacy, copyright, data treatment)
- `docs/requirements/` — thesis canonical, requirements, traceability
- `docs/coordination/` — handoff docs, conflict logs, work registry
- `docs/execution/` — ACTIVE_SLICE, REMEDIATION_BACKLOG, VERIFIED_CHANGES
- `docs/observability/` — OBSERVABILITY_PLAN.md

### 3. Module specs (import excluded — reference only)

- `specs/007-codebase-memory-innovation-cermont/`
- `specs/008-auditoria-investigacion-mejora-continua-cermont/`
- `specs/009-ejecucion-escalamiento-cermont/`
- `specs/010-escalamiento-modulos-14-pasos-cermont/`
- `specs/011-implementacion-profesional-controlada-cermont/`
- `specs/013-cierre-brechas-criticas/`
- `specs/014-frontend-profesionalizacion/`
- `specs/017-auditoria-integral-innovacion/`
- `specs/018-cierre-flujo-documental/`
- `specs/024-post-spec022-continuation/`

### 4. Source code (import excluded — business logic)

- `frontend/src/` — all application pages, components, hooks, modules, lib
- `backend/` — API routes, services, controllers, middleware, models
- `packages/shared-types/src/` — Zod schemas, i18n
- `packages/domain/src/` — business rules, state machines
- `packages/config/src/` — environment config

### 5. Tests (import excluded — will run from worktree)

- `frontend/tests/` — unit, integration, E2E tests
- `packages/domain/src/__tests__/`
- `packages/shared-types/tests/`
- `backend/tests/`
- `e2e/tests/`

### 6. Configuration (import excluded — use worktree defaults)

- `package.json` (M) — dependency updates
- `package-lock.json` (M) — lockfile
- `frontend/package.json` (M)
- `frontend/.env.example` (M)
- `frontend/.env.local.example` (M)
- `frontend/.env.test` (M)
- `frontend/tsconfig.json` (M)
- `frontend/next.config.ts` (M)
- `frontend/doctor.config.json` (A)
- `tooling/git/pre-commit.mjs` (M)
- `tooling/quality/baseline.json` (M)

### 7. Agent vendor content (excluded — not project-specific)

- `skills/` — full external skill library (brandkit, impeccable, ponytail, etc.)
- `skills-lock.json`

### 8. Duplicated content (excluded)

Identical or near-identical copies found at multiple locations:
- `skills/impeccable/` ↔ vendor source (no project-specific changes)
- `frontend/.agents/skills/react-doctor/SKILL.md` ↔ `frontend/.claude/skills/react-doctor/SKILL.md` (same content)
- Generic skill libraries at both `.agents/skills/` and `.claude/skills/`

### 9. Generated content (excluded)

- `frontend/next-env.d.ts`
- `scripts/audit/output/` — HTML/JSON reports
- Screenshots (`.png` files): register, login, payments, evidences, proposals, po, work-request
- Snapshot markdown files

### 10. Scripts and tooling (excluded — not production)

- `scripts/` — test/debug/audit scripts
- `tooling/` — quality checkers, biome setup
- `ecosystem.config.js`

### 11. Research and internal docs (excluded from import)

- `docs/research-cermont/` — 15 research documents
- `docs/research/` — KITS_MODULE_FSM_CMMS_REFERENCES
- `docs/prueba/`
- `docs/pdf/` — PDF and markdown documents
- `docs/internal/`

### 12. Deleted files (not applicable)

No files deleted between these refs.

## Import decision matrix

| Category | Import? | Reason |
|----------|---------|--------|
| Governance (AGENTS.md, Git rules) | Yes | Required for agent behavior |
| Status docs (CURRENT_IMPLEMENTATION_STATUS, KNOWN_DEFECTS) | Yes | Required for accurate project tracking |
| Domain docs (SERVICE_CASE_WORKFLOW, RBAC_MATRIX, DESIGN) | Yes | Required reading per AGENTS.md |
| Runbooks | Yes | Operational procedures |
| Module specs (auth, workflow) | Yes | Required for module development |
| Traceability | Yes | Required for testing |
| Execution artifacts | Yes | Phase 00.6 creates these |
| Source code (frontend, backend, packages) | No | Business logic — will be built on integration branch |
| Tests | No | Will be written/verified per module |
| Specs/ (all) | No | Historical reference only |
| Skills/ | No | External vendor content |
| Scripts/ | No | Debug/audit utilities |
| Screenshots | No | Generated artifacts |
| PDF documents | No | Not code |
| Legal drafts | No | Not code |
| Research docs | No | Historical |
| Coordination docs | No | Agent handoff logs |
