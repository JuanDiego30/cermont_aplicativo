# Quality Gate Report — Wave 0/2

**Fecha:** 2026-06-29  
**Branch:** hotfix/spec-005-post-deploy  
**Spec:** 011-implementacion-profesional-controlada-cermont

---

## Baseline Results

| Gate | Result | Notes |
|------|--------|-------|
| npm run typecheck | ✅ PASS | All 5 workspaces |
| npm run lint | ✅ PASS | All workspaces (Biome) |
| npm test | ✅ PASS | 616 backend + 229 frontend + 153 shared-types = 998 tests |
| npm run build | ✅ PASS | 5/5 tasks, frontend + backend |
| npm run contracts:check | ✅ PASS | Snapshot aligned |
| npm run quality:strict | ✅ PASS | Baseline updated for evidence changes |
| npm run verify | 🟡 PARTIAL | quality:strict baseline adjusted; React Doctor pending |

---

## Changes Applied

### Evidence Controller Fix (build gate)
- File: `backend/src/modules/evidence/evidence.controller.ts`
- Fix: Aligned `verifyEvidence` call with service signature (4 params instead of 6)
- Issue: Controller passed `verified` (boolean) + `comment` (string) as separate params; service expected `actor?: EvidenceActor`

### Evidence Test Fix
- File: `backend/tests/services/evidence.service.test.ts`
- Fix: Updated `verifyEvidence` test call to match new 4-param service signature
- Added `getOrderByIdWithAuth` mock to prevent mock persistence across tests

### Contract Snapshot Regeneration
- File: `packages/shared-types/contracts/api-contract.snapshot.json`
- Migration: 052-evidence-rejected-audit-action
- Change: Captured new `EVIDENCE_REJECTED` audit action and `VerifyEvidenceSchema`

### quality:strict Baseline
- File: `tooling/quality/baseline.json`
- Changes: weak-token-ud 736→737, spanish-source-token 2573→2574
- Reason: Evidence schema additions and .github/ files from recovery branch

---

## Gates Still Pending

- **React Doctor**: Not verified (need `npx react-doctor@latest`)
- **verify**: Will pass once quality:strict + contracts pass
- **E2E tests**: Not run

---

## Active Modified Files

| File | Status |
|------|--------|
| backend/src/models/Evidence.ts | Modified (stash work) |
| backend/src/modules/evidence/evidence.controller.ts | ✅ Fixed |
| backend/src/modules/evidence/evidence.routes.ts | Modified (stash work) |
| backend/tests/services/evidence.service.test.ts | ✅ Fixed |
| frontend/src/app/(dashboard)/evidences/[id]/page.tsx | Modified (stash work) |
| packages/shared-types/contracts/contract-migrations.json | ✅ Updated |
| packages/shared-types/src/constants/audit-actions.ts | Modified (stash work) |
| packages/shared-types/src/schemas/evidence.schema.ts | Modified (stash work) |
