# Slice 03 — Fleet Professionalization Specification

## 1. Objective
Advance the fleet module to support operational requirements: tracking vehicle states, assignments, and safety check-ins/check-outs.

## 2. Technical Scope
- **Check-in/Check-out forms**: Capture driver, mileage, fuel level, and visual photos (front, rear, sides) before and after deployment.
- **SOAT and Tecnomecánica Alerts**: System triggers warning notifications when vehicle documentation/certificates are close to expiration.
- **Assignment History**: Log who drove which vehicle and during what interval.

## 3. Impacted Files
- [NEW] `backend/src/models/VehicleAssignment.ts`
- [MODIFY] `backend/src/modules/fleet/fleet.controller.ts`
- [MODIFY] `backend/src/modules/fleet/fleet.service.ts`
- [NEW] `frontend/src/modules/fleet/ui/CheckInOutModal.tsx`

## 4. Verification Scenario
Run unit tests for vehicle assignments, checking that SOAT warnings fire correctly for expired certificates.
