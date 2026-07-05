# Slice 09 — Automation Rules Engine Specification

## 1. Objective
Build an automation rules engine that executes configured IF-THEN triggers on business events to streamline coordination.

## 2. Technical Scope
- **Triggers**: Define standard events: `evidence_rejected`, `document_expiring` (SOAT/calibration), `cost_exceeds_threshold`, `checklist_critical_failed`, `ses_approved`.
- **Actions**: Trigger actions: `send_notification`, `block_transition`, `create_task`, `request_replacement`.
- **Rules Config UI**: Admin view allowing gerentes to configure rules.

## 3. Impacted Files
- [NEW] `backend/src/models/AutomationRule.ts`
- [NEW] `backend/src/modules/automation/automation.service.ts`
- [NEW] `frontend/src/modules/admin/ui/RulesEngineConfig.tsx`

## 4. Verification Scenario
Trigger a mock safety checklist failure and assert that the rules engine successfully creates and dispatches a high-priority alert to the HES role.
