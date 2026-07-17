# Quality Gates — Orchestration Post-Sprint 4

**Date:** 2026-07-08 23:31 COT
**Branch:** plan/contract-first-masterplan-v6
**Commit:** 244626c5f05fa353076254c968bfb1c3d6b42112

---

## Gates Results

| Gate | Result | Details |
|------|--------|---------|
| typecheck | ✅ PASS | 7/7 tasks successful |
| lint | ✅ PASS | 7/7 tasks successful. biome: backend 479 files, frontend 872 files |
| test | ⚠️ PARTIAL | 4/6 tasks successful. **2 pre-existing flaky tests timeout** |
| contracts:check | ✅ PASS | Snapshot: aaa904de... Migration: 072 |
| build | ✅ PASS | 5/5 FULL TURBO. 96 pages compiled |

## Additional Quality Scripts

| Script | Result | Details |
|--------|--------|---------|
| quality:zero | ✅ PASS | 0 findings |
| quality:routes | ✅ PASS | 0 findings |
| quality:weak-tokens | ❌ FAIL | 3086 findings — ALL above baseline |
| quality:language | ❌ FAIL | 2806 findings — Spanish tokens above baseline |
| doctor:verbose | ⚠️ **88/100** | 38 warnings: 2 bugs, 1 a11y, 35 maintainability |

## React Doctor (88/100)
- Bugs: Missing effect deps (NewVehicleDrawer), Many useState (planning-packet/new)
- A11y: Control missing label (PlanningPacketSignatures)
- Maintainability: 22 unused files (cockpit, dashboard), 5 unused exports, 2 large components

## Pre-existing Issues
- 2 backend tests timeout (5000ms) — flaky, pre-existing
- weak-tokens, language above baseline — pre-existing
- 22 unused files from new untracked modules
