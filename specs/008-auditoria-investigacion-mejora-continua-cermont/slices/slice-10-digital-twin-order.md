# Slice 10 — Order Digital Twin Specification

## 1. Objective
Design and implement the "Order Digital Twin", providing historical traceability of all operations, decisions, and uploads for every single order.

## 2. Technical Scope
- **Event Timeline Schema**: A schema logging event types: `created`, `planned`, `checklist_submitted`, `evidence_verified`, `proposal_approved`, `invoice_paid`.
- **Relationship Map**: Visual links connecting the order to FileAssets (photos), signatures, and team members.
- **Traceability Ledger**: Ensure records are read-only and indexed for audits.

## 3. Impacted Files
- [NEW] `backend/src/models/OrderDigitalTwin.ts`
- [MODIFY] `backend/src/modules/order/order.controller.ts`
- [NEW] `frontend/src/modules/orders/ui/DigitalTwinTimeline.tsx`

## 4. Verification Scenario
Modify an order status and check that the digital twin timeline automatically appends the corresponding state update event.
