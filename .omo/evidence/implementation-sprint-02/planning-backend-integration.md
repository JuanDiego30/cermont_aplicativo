# Planning Backend Integration — Block A

**Date:** 2026-07-08

## What Was Done

Integrated `canApprovePlanning()` from `@cermont/domain` into the existing backend `approvePlanningPacket` service.

## Changes

### 1. Import domain gate
Added import of `canApprovePlanning` and `PlanningReadiness` type from `@cermont/domain`.

### 2. Added `buildPlanningReadiness()` helper
Converts a Mongoose planning packet document to the domain's `PlanningReadiness` interface by evaluating:
- `hasSchedule` — from packet.schedule
- `hasLaborAssignment` — from packet.crew.length
- `hasToolsAssignment` — from packet.tools.length
- `hasEquipmentAssignment` — from packet.equipment.length
- `hasMaterialsList` — from packet.materials.length
- `hasSafetyElements` — from packet.safetyElements.length
- `hasCertifications` — from packet.requiredCertifications verification status
- `hasReferenceDocuments` / `missingRequiredDocuments` — from AST/PTW requirements
- `hasChecklists` — from packet.readinessChecklist.length

### 3. Integrated domain gate in `approvePlanningPacket()`
The domain gate is called as the FIRST validation check, before the existing RBAC and status checks (defense in depth):
```typescript
const readiness = buildPlanningReadiness(planningPacket);
const decision = canApprovePlanning(readiness, planningPacket.status, userRole);
if (!decision.allowed) {
    const reasons = decision.blockers.map((b) => `${b.code}: ${b.message}`);
    throw new AppError("CANNOT_APPROVE_PLANNING", 400, reasons.join(" | "));
}
```

## Files Affected
- `backend/src/modules/planning-packet/planning-packet.service.ts`

## Tests
Existing domain tests cover `canApprovePlanning` (12 test cases). Backend approval endpoint is validated by domain gate + existing backend guards.
