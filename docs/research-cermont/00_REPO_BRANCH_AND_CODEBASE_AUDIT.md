# 00 — Repo Branch and Codebase Audit

## Executive Summary

**Repository:** `cermont_aplicativo` (GitHub: `JuanDiego30/cermont_aplicativo`)
**Current Branch:** `rescue/restore-missing-project-files` (commit `1d7890d`, 27-May-2026)
**Production Reference:** `deploy/vps-clean` (commit `90ad367`, remote HEAD)
**Fallback Reference:** `main` (commit `fff300e`)
**Total Commits on rescue:** 4
**Total Branches:** 20 local + 7 remote-tracking

The repository is a monorepo managed by **npm workspaces + Turborepo**. The active branch (`rescue/restore-missing-project-files`) rescued the monorepo structure after a `.gitignore` incident. There is a **structural divide** between production (`deploy/vps-clean`, using `apps/` layout) and the rescue branch (using flat `backend/` `frontend/` layout). The `.gitignore` `*.json` root cause has been fixed. Garbage scripts remain on `main` but are largely absent from the rescue branch. Packages exist with real source code. 46 backend route files exist, organized under `modules/` rather than `routes/`.

---

## Branch Inventory

| # | Branch | SHA | Type | Status | Workspace Layout |
|---|--------|-----|------|--------|-----------------|
| 1 | `rescue/restore-missing-project-files` | 1d7890d | **Active work** | HEAD, ahead of origin by 2 commits | `backend/`, `frontend/` |
| 2 | `deploy/vps-clean` | 90ad367 | **Production** | Remote HEAD (origin/HEAD), deploy snapshot | `apps/backend`, `apps/frontend` |
| 3 | `main` | fff300e | Legacy/Sync | Ancestor of most branches | `apps/backend`, `apps/frontend` |
| 4 | `audit/uiux-cermont-sequence-fix-v2` | ca892b3 | Audit | Local + remote, common ancestor with `deploy/vps-clean` | `apps/` layout |
| 5 | `audit/uiux-cermont-sequence-fix` | d791211 | Audit | Local + remote, ancestor of v2 | `apps/` layout |
| 6 | `audit/plan-maestro-cermont-local` | b19514f | Audit | Local + remote, has PR | `apps/` layout |
| 7 | `feat/screaming-architecture` | 52f2e57 | Feature | Stashed experiment, workspace relocation | Mixed |
| 8 | `feature/document-driven-platform` | fff300e | Feature | Synchronized with `main` | `apps/` layout |
| 9 | `fix/end-to-end-flow-work-request-ses` | fff300e | Fix | Synchronized with `main` | `apps/` layout |
| 10 | `fix/qa-sidebar-debug-remediation` | fff300e | Fix | Synchronized with `main` | `apps/` layout |
| 11 | `codex/fix-login-pwa-seed` | fff300e | Fix | Synchronized with `main` | `apps/` layout |
| 12 | `codex/qa-remediation-roadmap` | fff300e | Fix | Synchronized with `main` | `apps/` layout |
| 13 | `backup/runtime-estable-antes-ui-restore` | fff300e | Backup | Pre-UI restore snapshot | `apps/` layout |
| 14 | `backup/pre-remediation-20260514-1154` | fff300e | Backup | Pre-remediation snapshot | `apps/` layout |
| 15 | `backup/arbol-contaminado` | fff300e | Backup | Contaminated tree backup | `apps/` layout |
| 16 | `fir-trawler` | 9c832b5 | Feature | P0 test suite + backend refactor | `backend/`, `frontend/` |
| 17 | `puddle-freighter` | fff300e | Feature | Synchronized with `main` | `apps/` layout |
| 18 | `cascade/act-a-como-principal-software-architect-8fbc77` | 1e7c647 | AI Snapshot | Cascade agent dump | Unknown |
| 19 | `cascade/act-a-como-principal-software-architect-d362f8` | a5e5534 | AI Snapshot | Cascade agent dump | Unknown |

### Remote Branches
```
origin/HEAD -> origin/deploy/vps-clean
origin/audit/plan-maestro-cermont-local
origin/audit/uiux-cermont-sequence-fix
origin/audit/uiux-cermont-sequence-fix-v2
origin/deploy/vps-clean
origin/rescue/restore-missing-project-files
```

### Risk Assessment

| Risk | Severity | Detail |
|------|----------|--------|
| `deploy/vps-clean` uses `apps/` layout, rescue uses `backend/` | **P0** | Cannot merge rescue → deploy without structural reconciliation |
| `proxy.ts` deleted in working tree | **P1** | Security perimeter file removed from `frontend/` |
| Garbage scripts in root on `main` | **P1** | 10+ `.js`/`.mjs` files: `add_wr.js`, `add-route.js`, `fix.js`, etc. |
| Production missing `packages/domain` and `packages/config` | **P1** | `deploy/vps-clean` workspaces only include 3 of 5 packages |
| `.sisyphus/` audit file claims NestJS (stale) | **P2** | Could mislead agents |
| AI snapshot branches (`cascade/*`) polluting branch list | **P2** | Dead branches, no value |
| Empty `routes/` directory despite docs claiming it | **P2** | Routes actually live in `modules/` |

---

## Workspaces Configuration (Monorepo State)

### Current Branch (`rescue/restore-missing-project-files`)
```json
["backend", "frontend", "packages/shared-types", "packages/domain", "packages/config"]
```

### Production (`deploy/vps-clean`)
```json
["backend", "frontend", "packages/shared-types"]
```
**Missing:** `packages/domain`, `packages/config` — these packages do not exist on the production branch.

### Legacy (`main`)
Uses `apps/` layout: `["apps/backend", "apps/frontend", "packages/shared-types"]`

### Documentation Claim (CERMONT_ARCHITECTURE_BLUEPRINT.md:59)
```json
["backend", "frontend", "packages/*"]
```
**Error:** Uses wildcard `packages/*` instead of explicit listing.

### Package Verification

| Package | npm Name | Exists | Has Dist | Has Source |
|---------|----------|--------|----------|------------|
| `packages/shared-types` | `@cermont/shared-types` | Yes | Yes | Yes (src/, tests/) |
| `packages/domain` | `@cermont/domain` | Yes | Yes | Yes (src/) |
| `packages/config` | `@cermont/config` | Yes | Yes | Yes (src/) |

All three packages are built, have compiled output in `dist/`, and have TypeScript source.

---

## Documentation vs Code Contradictions

### Contradiction 1: Workspace Specification

**Documentation:** `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md:59` states:
```json
"workspaces": ["backend", "frontend", "packages/*"]
```

**Code:** Root `package.json:7-13` uses explicit listing:
```json
"workspaces": ["backend", "frontend", "packages/shared-types", "packages/domain", "packages/config"]
```

**Impact:** Using `packages/*` wildcard would auto-include any future or accidental directories under `packages/`. The explicit listing is intentional for control, but the documentation hasn't been updated.

---

### Contradiction 2: Route File Organization

**Documentation:** `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` shows:
```
backend/src/routes/ ← *.routes.ts — endpoint wiring only
```
And the layer order mandates `routes/` as the first layer.

**Code:** The `backend/src/routes/` directory **exists but is empty**. All 46 route files are instead located in `backend/src/modules/*/*.routes.ts`:
```
backend/src/modules/order/order.routes.ts
backend/src/modules/auth/auth.routes.ts
backend/src/modules/evidence/evidence.routes.ts
... (46 total)
```

**Impact:** The documentation's architecture blueprint is incorrect about the file layout. The actual architecture uses a module-based route organization, not a flat routes directory.

---

### Contradiction 3: Backend Stack Claim in `.sisyphus/` Audit

**Documentation:** `.sisyphus/plans/00_REPO_BRANCH_AUDIT.md:17` states:
> `backend/` — NestJS v11, 35 módulos

**Code:** `backend/package.json:30` shows:
```json
"express": "5.2.1"
```
No NestJS dependency exists anywhere in `backend/package.json` dependencies.

**Impact:** This stale audit file could mislead AI agents into thinking the backend uses NestJS, wasting time on framework investigation.

---

### Contradiction 4: README Root vs Actual Structure

**Documentation:** Root `README.md` says:
> Arquitectura monorepo npm workspaces: `apps/backend` (Express) + `apps/frontend` (Next.js) + `packages/shared-types`.

**Code:** The rescue branch uses `backend/` and `frontend/` (no `apps/` prefix). This README includes a warning that it is "parcialmente obsoleto" and directs to `docs/README.md`.

**Impact:** Root README will mislead anyone cloning the rescue branch who doesn't read the warning.

---

### Contradiction 5: `proxy.ts` Status

**Documentation:** `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md:40` states:
> `frontend/proxy.ts` ← Security perimeter (NO middleware.ts)

**Code:** `git status --short` shows `frontend/proxy.ts` as deleted (`D frontend/proxy.ts`) in the working tree.

**Impact:** The security perimeter file has been removed from the working tree. If committed, the security boundary documented as mandatory would be gone.

---

## Root Cause of Original Repository Damage

The `.sisyphus/` audit identified that a `*.json` entry existed at `.gitignore` line 272, causing all `package.json`, `tsconfig.json`, and `turbo.json` files to be ignored. On the current rescue branch:
- `.gitignore` has 285 lines
- No catch-all `*.json` pattern exists
- The `main` branch's `.gitignore` also lacks a `*.json` catch-all

This root cause has been **fixed** on both the rescue and main branches.

---

## Working Tree Changes (Unstaged)

From `git status --short` and `git diff --name-only HEAD`:

| Change | File |
|--------|------|
| Modified | `.gitignore` |
| Modified | `backend/scripts/seed-p0-cases.ts` |
| Deleted | `docs/plans/corrections/diagrams/F-02-FSM.mmd` |
| Deleted | `docs/plans/corrections/diagrams/F-08-OFFLINE-SYNC.mmd` |
| Deleted | `docs/plans/corrections/diagrams/F-12-TEST-PYRAMID.mmd` |
| Deleted | `frontend/proxy.ts` |
| Modified | `frontend/src/app/(dashboard)/documents/page.tsx` |
| Modified | `frontend/src/app/(dashboard)/evidences/EvidenceCard.tsx` |
| Modified | `frontend/src/app/(dashboard)/evidences/evidence-helpers.ts` |
| Modified | `frontend/src/app/(dashboard)/evidences/page.tsx` |
| Untracked | Multiple AI config directories (`.claude/`, `.cursor/`, `.vscode/`, `.copilot/`, `.zed/`, `.mcp.json`, `opencode.json`, etc.) |

---

## Commit History (rescue vs deploy)

```
rescue/restore-missing-project-files is ahead of deploy/vps-clean by 4 commits:
  1d7890d fix: continue cermont post findings refactor
  bf2cdb6 rescue: restore missing monorepo package, workspace, and tsconfig files
  d791211 audit: sync CERMONT UIUX sequence and workflow refactor state
  7a70ecc audit: sync local CERMONT plan maestro implementation
```

`deploy/vps-clean` is the remote HEAD. The rescue branch has never been merged to production.

---

## Backend Route Inventory (46 files)

Routes are organized by domain module under `backend/src/modules/`:

| Module | Route Files | Count |
|--------|-------------|-------|
| order | `order.routes.ts`, `order-administrative-workflow.routes.ts`, `order-closure.routes.ts`, `order-execution-session.routes.ts` | 4 |
| documents | `document.routes.ts`, `document-import.routes.ts`, `document-ingestion.routes.ts`, `document-template.routes.ts` | 4 |
| auth | `auth.routes.ts` | 1 |
| evidence | `evidence.routes.ts`, `evidence-collection.routes.ts` | 2 |
| service-cases | `service-case.routes.ts` | 1 |
| invoice | `invoice.routes.ts`, `invoice-payment.routes.ts` | 2 |
| service-entry-sheet | `service-entry-sheet.routes.ts`, `service-entry-sheet-invoice.routes.ts` | 2 |
| delivery-record | `delivery-record.routes.ts`, `delivery-record-service-entry-sheet.routes.ts` | 2 |
| proposal | `proposal.routes.ts` | 1 |
| purchase-order | `purchase-order.routes.ts` | 1 |
| planning-packet | `planning-packet.routes.ts` | 1 |
| execution-session | `execution-session.routes.ts`, `execution-technical-report.routes.ts` | 2 |
| technical-report | `technical-report.routes.ts` | 1 |
| checklist | `checklist.routes.ts` | 1 |
| kit | `kit.routes.ts` | 1 |
| resource | `resource.routes.ts` | 1 |
| tool | `tool.routes.ts` | 1 |
| asset | `asset.routes.ts` | 1 |
| maintenance | `maintenance.routes.ts` | 1 |
| work-requests | `work-requests.routes.ts` | 1 |
| site-visit | `site-visit.routes.ts` | 1 |
| inspection | `inspection.routes.ts` | 1 |
| user | `user.routes.ts` | 1 |
| ai | `ai.routes.ts` | 1 |
| cost | `cost.routes.ts` | 1 |
| analytics | `analytics.routes.ts` | 1 |
| dashboard | `dashboard.routes.ts` | 1 |
| notifications | `notifications.routes.ts` | 1 |
| audit | `audit.routes.ts` | 1 |
| sync | `sync.routes.ts` | 1 |
| report | `report.routes.ts` | 1 |
| observability | `observability.routes.ts` | 1 |
| template-draft | `template-draft.routes.ts` | 1 |
| template-response | `template-response.routes.ts` | 1 |
| payment | `payment.routes.ts` | 1 |
| **Total** | | **46** |

---

## Recommendation

### Investigate On
**`rescue/restore-missing-project-files`** — This is the most complete, actively maintained branch with the correct `backend/` `frontend/` monorepo layout, all 5 workspaces properly configured, and all 46 backend routes living in the module-based structure. It represents the intended final architecture.

### Implement On
**`rescue/restore-missing-project-files`** — All new work should be on this branch. The branch has structural alignment with the canonical docs (Express 5, Mongoose, Next.js 16, React 19, Zod 4) and has the complete package ecosystem.

### Merge Target
**`deploy/vps-clean`** — But **only after** structural reconciliation. The production branch uses `apps/` layout instead of `backend/` `frontend/`. A merge strategy must be defined:
- Option A: Rebase `deploy/vps-clean` to match the new layout (risky for production)
- Option B: Create a new `deploy/vps-clean-v2` branch with the rescue layout
- Option C: Manual migration of production configuration to match rescue

### Critical Pre-requisites Before Implementation
1. Recover or restore `frontend/proxy.ts` (security perimeter is deleted)
2. Address the 10+ untracked AI config directories and `.json` files in root
3. Clear the empty `backend/src/routes/` directory or update documentation
4. Delete the stale `.sisyphus/` audit files that claim NestJS
5. Update workspace documentation in `CERMONT_ARCHITECTURE_BLUEPRINT.md` to match actual `package.json`

---

## Real Monorepo State Assessment

| Dimension | Status | Details |
|-----------|--------|---------|
| **Workspace Configuration** | ✅ Correct | 5 workspaces properly defined in root `package.json` |
| **Package Manager** | ✅ Correct | npm 10.9.4 with workspaces (not pnpm/yarn) |
| **Build System** | ✅ Correct | Turborepo v2 (evidenced by `turbo-run` scripts, `.turbo/` dirs) |
| **Backend Stack** | ✅ Correct | Express 5.2.1 (not NestJS, not Prisma) |
| **Frontend Stack** | ✅ Correct | Next.js 16 + React 19 (not Vite/CRA) |
| **Schema Validation** | ✅ Correct | Zod 4.4.3 (not Joi) |
| **Database** | ✅ Correct | Mongoose 9.6.2 + MongoDB (not PostgreSQL) |
| **Auth** | ✅ Correct | JWT + Zustand auth store (not Auth.js) |
| **Domain Package** | ✅ Correct | `@cermont/domain` with RBAC |
| **Shared Types Package** | ✅ Correct | `@cermont/shared-types` with Zod schemas |
| **Config Package** | ✅ Correct | `@cermont/config` with env validation |
| **API Client** | ✅ Correct | Centralized (not Axios, not raw fetch) |
| **State Management** | ✅ Correct | Zustand + TanStack Query |
| **Documentation Accuracy** | ❌ Partially stale | Architecture blueprint has route layout and workspace errors |
| **Production Alignment** | ❌ Divergent | `deploy/vps-clean` uses different workspace layout |
| **Working Tree** | ⚠️ Dirty | Modified files, deleted proxy.ts, untracked AI configs |

**Verdict:** The rescue branch is architecturally sound and ready for implementation work once the critical pre-requisites (proxy.ts restoration, doc updates, cleanup) are addressed. The primary risk is the structural divergence from the production branch, which must be resolved before any deployment.
