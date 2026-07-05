# Slice 05 — Evidence FSM Specification

## 1. Objective
Establish an evidence validation workflow, allowing supervisors and residents to verify or reject field photos (with replacement requests).

## 2. Technical Scope
- **Evidence FSM states**: Implement state transitions: `captured` -> `uploaded` -> `verified` / `rejected`.
- **Rejection details**: If rejected, record `rejectionReason` and require replacement uploads.
- **Workflow hook-up**: Group evidence requests by phase (before, during, after execution) and link them to checklist tasks.

## 3. Impacted Files
- [MODIFY] `backend/src/models/Evidence.ts`
- [MODIFY] `backend/src/modules/evidence/evidence.service.ts`
- [NEW] `frontend/src/modules/evidences/ui/EvidenceReviewList.tsx`

## 4. Verification Scenario
Write integration tests ensuring that transition from `rejected` requires a new `FileAsset` upload to transition back to `uploaded`.
