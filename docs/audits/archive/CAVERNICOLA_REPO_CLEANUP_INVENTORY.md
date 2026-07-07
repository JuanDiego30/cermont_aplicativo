# CAVERNICOLA Repository Cleanup Inventory

**Date:** 2026-06-03
**Branch:** rescue/restore-missing-project-files
**Status:** IN PROGRESS

## 1. Repository Overview

| Metric | Value |
|--------|-------|
| Total Files | 261,799 |
| Git Tracked Files | ~1,200 |
| Untracked Files | ~260,599 |
| Modified Files | 43 |
| Deleted Files | 12 |

## 2. Generated Folders Inventory

### 2.1 Node Modules & Dependencies
| Path | Status | Size | Notes |
|------|--------|------|-------|
| `node_modules/` | UNTRACKED | ROOT LOCKER | Should NOT be committed |
| `backend/node_modules/` | UNTRACKED | - | Should NOT be committed |
| `frontend/node_modules/` | UNTRACKED | - | Should NOT be committed |
| `packages/*/node_modules/` | UNTRACKED | - | Should NOT be committed |

### 2.2 Build Outputs
| Path | Status | Size | Notes |
|------|--------|------|-------|
| `frontend/.next/` | UNTRACKED | - | Next.js build folder |
| `frontend/out/` | UNTRACKED | - | Static export folder |
| `backend/dist/` | UNTRACKED | - | TypeScript compiled output |
| `backend/build/` | UNTRACKED | - | Possible build artifacts |
| `packages/*/dist/` | UNTRACKED | - | Package build outputs |

### 2.3 Caches & Reports
| Path | Status | Size | Notes |
|------|--------|------|-------|
| `.turbo/` | UNTRACKED | - | Turborepo cache |
| `.cache/` | UNTRACKED | - | Build cache |
| `coverage/` | UNTRACKED | - | Test coverage reports |
| `playwright-report/` | UNTRACKED | - | E2E test reports |
| `test-results/` | UNTRACKED | - | Test outputs |
| `.eslintcache` | UNTRACKED | - | ESLint cache |
| `*.tsbuildinfo` | UNTRACKED | - | TypeScript build info |

## 3. Driver/Drive Folders

| Path | Status | Contents | Action |
|------|--------|----------|--------|
| `.adal/` | UNTRACKED | Unknown | INVESTIGATE |
| `.bob/` | UNTRACKED | Unknown | INVESTIGATE |
| `.claude/` | UNTRACKED | Claude skills | KEEP (IDE) |
| `.cortex/` | UNTRACKED | Unknown | INVESTIGATE |
| `.crush/` | UNTRACKED | Unknown | INVESTIGATE |
| `.factory/` | UNTRACKED | Unknown | INVESTIGATE |
| `.goose/` | UNTRACKED | Unknown | INVESTIGATE |
| `.iflow/` | UNTRACKED | Unknown | INVESTIGATE |
| `.junie/` | UNTRACKED | Unknown | INVESTIGATE |
| `.kiro/` | UNTRACKED | Unknown | INVESTIGATE |
| `.kode/` | UNTRACKED | Unknown | INVESTIGATE |
| `.mcpjam/` | UNTRACKED | Unknown | INVESTIGATE |
| `.mux/` | UNTRACKED | Unknown | INVESTIGATE |
| `.neovate/` | UNTRACKED | Unknown | INVESTIGATE |
| `.openhands/` | UNTRACKED | Unknown | INVESTIGATE |
| `.pi/` | UNTRACKED | Unknown | INVESTIGATE |
| `.pochi/` | UNTRACKED | Unknown | INVESTIGATE |
| `.qoder/` | UNTRACKED | Unknown | INVESTIGATE |
| `.qwen/` | UNTRACKED | Unknown | INVESTIGATE |
| `.roo/` | UNTRACKED | Unknown | INVESTIGATE |
| `.trae/` | UNTRACKED | Unknown | INVESTIGATE |
| `.vibe/` | UNTRACKED | Unknown | INVESTIGATE |
| `.windsurf/` | UNTRACKED | Unknown | INVESTIGATE |
| `.zencoder/` | UNTRACKED | Unknown | INVESTIGATE |
| `skills/` | UNTRACKED | Skills folder | KEEP (project) |

**No official `driver` or `drive` folders found.**

## 4. Old Project Copies

| Path | Status | Notes |
|------|--------|-------|
| `apps/` | NOT FOUND | Old structure (should not exist per canonical) |
| `apps/backend/` | NOT FOUND | Old structure |
| `apps/frontend/` | NOT FOUND | Old structure |

## 5. Audit Reports Classification

### 5.1 Active Maps (KEEP)
- `CAVERNICOLA_REPO_GRAPH.json`
- `CAVERNICOLA_REPO_GRAPH.md`
- `CAVERNICOLA_FRONTEND_ROUTE_MAP.md`
- `CAVERNICOLA_API_CONTRACT_MAP.md`
- `CAVERNICOLA_DB_MODEL_MAP.md`
- `CAVERNICOLA_OFFLINE_INDEXEDDB_MAP.md`
- `CAVERNICOLA_MODULE_IMPLEMENTATION_STATUS.md`
- `CAVERNICOLA_EXECUTION_PLAN.md`

### 5.2 Duplicate/Redundant Reports (ARCHIVE)
- `CAVERNICOLA_REAL_IMPLEMENTATION_SPRINT.md`
- `CAVERNICOLA_BUSINESS_LOGIC_FINAL_REPORT.md`
- `CAVERNICOLA_RUNTIME_ERRORS_REPORT.md`
- `CAVERNICOLA_PAGE_TO_BUSINESS_RULES_MATRIX.md`
- `CAVERNICOLA_MODULE_ACCEPTANCE_CRITERIA.md`
- `CAVERNICOLA_PAGE_REFACTOR_SEQUENCE.md`
- `CAVERNICOLA_BUSINESS_MODULE_BLUEPRINT.md`
- `CAVERNICOLA_PAGE_TO_CONTRACT_MATRIX.md`
- `CAVERNICOLA_PAGE_SPECIFICATIONS.md`
- `CAVERNICOLA_WORKSPACE_INTEGRATION_REPORT.md`
- `CAVERNICOLA_EXTERNAL_REFERENCES.md`
- `CAVERNICOLA_UIUX_COMPONENT_MAP.md`
- `CAVERNICOLA_UIUX_CHANGELOG.md`
- `CAVERNICOLA_FRONTEND_EDIT_PLAN.md`
- `CAVERNICOLA_REACT_DOCTOR_REPORT.md`
- `CAVERNICOLA_E2E_TRACEABILITY_MATRIX.md`
- `cermont-deep-audit-correction-map.md`
- `cermont-baseline-post-auditoria.md`
- `02-FUENTE-DE-VERDAD.md`
- `01-BASELINE-TECNICO.md`
- `MASTER_AUDIT_2026-05-23.md`
- `baseline-refactor-profesional-actualizado.md`
- `entrega-refactor-profesional.md`
- `deuda-tecnica-refactor-profesional.md`
- `legacy-audit-refactor-profesional.md`
- `baseline-refactor-profesional.md`
- `auditoria-funcional-14-pasos-iter2.md`
- `CODEX_DELIVERABLE_MATRICES_2026-05-19.md`
- `CODEX_BOOK_DIAGNOSTIC_2026-05-19.md`
- `deep-research-report (1).md`
- `deep-research-report (2).md`
- `Auditoría Académica — Trabajo de Grado CERMONT S.A.S..md`
- `Informe de Auditoría Académica — Trabajo de Grado CERMONT S.A.S..md`
- `Revisión y Corrección de Trabajo de Grado.md`

### 5.3 Historical/Academic (KEEP SEPARATELY)
- `docs/plans/plans1.md`
- `docs/pdf/"ATG JUAN DIEGO AREVALO-1".md`

## 6. Temporary Files

| Pattern | Count | Action |
|---------|-------|--------|
| `*.bak` | 0 | KEEP |
| `*.old` | 0 | KEEP |
| `*.tmp` | 0 | KEEP |
| `*copy*` | 0 | KEEP |
| `*backup*` | 0 | KEEP |
| `*copia*` | 0 | KEEP |
| `Thumbs.db` | 0 | IGNORE |
| `.DS_Store` | 0 | IGNORE |
| `*.log` | 0 | IGNORE |

## 7. Scripts & Tooling

### 7.1 Active Scripts
- `scripts/generate-logos.ts`
- `scripts/generate-png-icons.py`

### 7.2 Tooling (KEEP)
- `tooling/quality/baseline.json`

## 8. .gitignore Status

Current `.gitignore` entries:
- `dist/`
- `build/`
- `.next/`
- `coverage/`
- `.turbo/`
- `*.log`

## 9. Risk Assessment

### High Risk Items
- 260,599 untracked files (mostly IDE/editor directories)
- Modified files in `.agents/skills/impeccable/scripts/` - IDE configuration

### Safe to Remove
- `node_modules/` directories
- `.next/`, `dist/`, `build/` folders
- `coverage/`, `playwright-report/`, `test-results/`
- `.turbo/`, `.cache/` directories
- `.tsbuildinfo` files

### Do NOT Remove
- `src/` directories (functional code)
- `package.json` files
- `.env.example` files
- `docs/` canonical documentation
- `packages/shared-types/` contracts
- `packages/domain/` RBAC
- `packages/config/` configuration

## 10. Next Steps

1. Archive old audit reports
2. Clean generated folders
3. Clean IDE/editor directories
4. Update .gitignore
5. Run verification gates