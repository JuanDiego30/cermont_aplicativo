# Slice 08 — Cost ERP Intelligence Specification

## 1. Objective
Establish financial traceability by creating a standardized cost catalog and estimated vs. actual cost comparisons.

## 2. Technical Scope
- **Cost Catalog**: Implement a catalog of operational unit costs (materials, technician hourly rates, vehicle rentals, tools lease).
- **Deviation Analysis**: Compare proposal estimates against actual reported costs entered during execution.
- **Alert Trigger**: Flag orders where actual costs exceed 80% of the approved proposal budget.

## 3. Impacted Files
- [NEW] `backend/src/models/CostCatalogItem.ts`
- [MODIFY] `backend/src/modules/costs/costs.service.ts`
- [NEW] `frontend/src/modules/costs/ui/CostComparisonChart.tsx`

## 4. Verification Scenario
Run tests asserting that when an order's execution costs exceed 80% of its proposal value, a warning event is dispatched to notifications.
