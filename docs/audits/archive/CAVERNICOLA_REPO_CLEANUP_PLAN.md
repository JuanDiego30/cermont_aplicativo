# CAVERNICOLA Repository Cleanup Plan

**Date:** 2026-06-03
**Branch:** rescue/restore-missing-project-files
**Status:** PLANNED

## 1. Executive Summary

This plan outlines the systematic cleanup of the Cermont S.A.S. repository to improve navigability for future AI agents and development workflows. The repository contains 261,799 files with 260,599 being untracked (mostly IDE/editor directories).

## 2. Cleanup Phases

### Phase 1: Documentation & Risk Assessment ✓
- [x] Create CAVERNICOLA_REPO_CLEANUP_INVENTORY.md
- [x] Create CAVERNICOLA_REPO_CLEANUP_PLAN.md
- [x] Create CAVERNICOLA_REPO_CLEANUP_RISK_REGISTER.md
- [ ] Review existing .gitignore

### Phase 2: Generated Folders Cleanup
**Order of operations:**
1. `.turbo/` - Turborepo cache
2. `.cache/` - Build cache
3. `coverage/` - Test coverage
4. `playwright-report/` - E2E reports
5. `test-results/` - Test outputs
6. `frontend/.next/` - Next.js build
7. `frontend/out/` - Static export
8. `backend/dist/` - Backend build
9. `packages/*/dist/` - Package builds
10. `.eslintcache` - ESLint cache
11. `*.tsbuildinfo` - TypeScript build info

### Phase 3: IDE/Editor Directories Cleanup
**Safe to remove (not project files):**
- `.adal/`
- `.bob/`
- `.claude/`
- `.cortex/`
- `.crush/`
- `.factory/`
- `.goose/`
- `.iflow/`
- `.junie/`
- `.kiro/`
- `.kode/`
- `.mcpjam/`
- `.mux/`
- `.neovate/`
- `.openhands/`
- `.pi/`
- `.pochi/`
- `.qoder/`
- `.qwen/`
- `.roo/`
- `.trae/`
- `.vibe/`
- `.windsurf/`
- `.zencoder/`
- `.kilocode/` (keep - project)
- `.kiro/` (remove - IDE)

### Phase 4: Audit Reports Organization
**Archive to `docs/audits/archive/`:**
- All CAVERNICOLA_*.md files except canonical maps
- All numbered reports (01-24)
- Academic/thesis documents (move to archive)

**Keep Active:**
- CAVERNICOLA_REPO_GRAPH.json/md
- CAVERNICOLA_FRONTEND_ROUTE_MAP.md
- CAVERNICOLA_API_CONTRACT_MAP.md
- CAVERNICOLA_DB_MODEL_MAP.md
- CAVERNICOLA_OFFLINE_INDEXEDDB_MAP.md
- CAVERNICOLA_MODULE_IMPLEMENTATION_STATUS.md
- CAVERNICOLA_EXECUTION_PLAN.md

### Phase 5: Scripts & Assets
- Keep: `scripts/generate-logos.ts`, `scripts/generate-png-icons.py`
- Keep: `tooling/quality/baseline.json`
- Verify: No unused assets in `frontend/public/`

### Phase 6: Git Operations
- Remove generated folders from git tracking (if any)
- Update `.gitignore` with all patterns
- Commit cleanup changes

### Phase 7: Verification Gates
Execute in order:
1. `npm install` (verify dependencies work)
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test`
5. `npm run build`
6. `npm run verify`

## 3. Files to Preserve (DO NOT DELETE)

### Code
- `backend/src/` - All source code
- `frontend/src/` - All source code
- `packages/shared-types/` - Contracts
- `packages/domain/` - RBAC
- `packages/config/` - Configuration

### Configuration
- `package.json` (root and workspaces)
- `package-lock.json` (root)
- `turbo.json`
- `tsconfig.json` (root and workspaces)
- `.env.example` files

### Documentation
- `docs/README.md`
- `docs/REGLAS_DESARROLLO_CERMONT.md`
- `docs/product/`
- `docs/domain/`
- `docs/architecture/`
- `docs/design/`
- `docs/implementation/`
- `docs/adr/`

### Assets
- Official logos
- PWA icons
- Brand assets in `frontend/public/`

## 4. Rollback Plan

If verification gates fail:
1. `git checkout -- .` (revert all changes)
2. Document what caused the failure
3. Adjust cleanup approach
4. Retry with safer operations

## 5. Success Criteria

- [ ] Repository has < 5,000 files (from 261,799)
- [ ] All generated folders removed
- [ ] All IDE directories removed
- [ ] Audit reports organized
- [ ] `.gitignore` updated
- [ ] All gates pass (typecheck, lint, test, build, verify)
- [ ] No functional code broken
- [ ] Documentation intact