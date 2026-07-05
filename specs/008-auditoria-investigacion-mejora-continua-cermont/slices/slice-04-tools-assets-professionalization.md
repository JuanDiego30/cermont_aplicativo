# Slice 04 — Tools Professionalization Specification

## 1. Objective
Enable precise tracking of high-value tools, safety elements, and calibrations required for field operations.

## 2. Technical Scope
- **Calibration Flow**: Tools requiring periodic calibration (e.g. gas detectors, torque wrenches) must trigger calibration alerts and store validation certificates as FileAssets.
- **Availability Matrix**: Render active dashboard summaries indicating which tools are currently checked out, available, or under maintenance.
- **Checkout History**: Record assignment logs mapping tools to operators, orders, and checklists.

## 3. Impacted Files
- [NEW] `backend/src/models/ToolCalibration.ts`
- [MODIFY] `backend/src/modules/tool/tool.controller.ts`
- [MODIFY] `backend/src/modules/tool/tool.service.ts`
- [MODIFY] `frontend/src/modules/tools/ui/ToolDetailCard.tsx`

## 4. Verification Scenario
Add tool checkouts and verify that tools flagged "in_use" or "calibrating" cannot be selected for new planning packets.
