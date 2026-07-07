# CAVERNICOLA Repository Cleanup Risk Register

**Date:** 2026-06-03
**Branch:** rescue/restore-missing-project-files
**Status:** IN PROGRESS

## 1. Repository State

| Check | Status | Notes |
|-------|--------|-------|
| Git Clean | FAILED | 43 modified, 12 deleted files |
| Current Branch | rescue/restore-missing-project-files | Not main branch |
| Untracked Files | 260,599 | Mostly IDE directories |

## 2. Risk Assessment Matrix

| Risk ID | Risk | Likelihood | Impact | Mitigation | Status |
|---------|------|------------|--------|------------|--------|
| R01 | Deleting functional code by mistake | LOW | CRITICAL | Verify all src/ files before deletion | OPEN |
| R02 | Breaking build/test pipeline | MEDIUM | HIGH | Run gates after each phase | OPEN |
| R03 | Removing tracked generated files | MEDIUM | MEDIUM | Check git ls-files first | OPEN |
| R04 | Missing .env files | LOW | HIGH | Preserve .env.example | OPEN |
| R05 | Breaking contracts in shared-types | LOW | CRITICAL | Do not modify packages/shared-types | OPEN |
| R06 | Losing audit trail | MEDIUM | MEDIUM | Archive not delete reports | OPEN |
| R07 | IDE directories have useful tools | LOW | LOW | Backup before removal | OPEN |

## 3. Modified Files Analysis

### 3.1 Modified Files (43)
- `.agents/skills/impeccable/scripts/*` - IDE tool configuration
- `backend/src/*` - Backend source files
- `frontend/src/*` - Frontend source files
- `packages/shared-types/*` - Shared contracts

**Decision:** These are intentional changes, not accidental modifications.

### 3.2 Deleted Files (12)
- `backend/src/services/user.service.test.ts`
- `.agents/skills/impeccable/scripts/load-context.mjs`

**Decision:** Proceed with caution - verify these are not needed.

## 4. Cleanup Actions

### 4.1 SAFE TO PROCEED
| Action | Reason | Risk Level |
|--------|--------|------------|
| Remove node_modules | Always regenerable | NONE |
| Remove .next/ | Generated folder | NONE |
| Remove dist/ | Generated from src | NONE |
| Remove coverage/ | Generated from tests | NONE |
| Remove .turbo/ | Turborepo cache | NONE |
| Remove .cache/ | Build cache | NONE |
| Remove IDE directories | Not project files | NONE |

### 4.2 REQUIRES VERIFICATION
| Action | Reason | Risk Level |
|--------|--------|------------|
| Remove backend/dist/ | Check if package needs publishing | LOW |
| Remove playwright-report/ | Verify tests pass after | LOW |
| Remove test-results/ | Verify tests pass after | LOW |

### 4.3 DO NOT TOUCH
| Item | Reason |
|------|--------|
| backend/src/ | Functional code |
| frontend/src/ | Functional code |
| packages/shared-types/ | Shared contracts |
| docs/canonical/ | Source of truth |
| package.json files | Workspace config |
| .env.example | Environment template |

## 5. Pre-Cleanup Verification

Before proceeding with deletion:
1. [ ] Verify no dist/ is tracked in git
2. [ ] Verify .env.example exists
3. [ ] Verify package-lock.json is root
4. [ ] Create backup of critical configs

## 6. Post-Cleanup Verification

After cleanup:
1. [ ] Run `npm install`
2. [ ] Run `npm run typecheck`
3. [ ] Run `npm run lint`
4. [ ] Run `npm run test`
5. [ ] Run `npm run build`
6. [ ] Run `npm run verify`