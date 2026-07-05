# COST ENGINE SPECIFICATION

**Date:** 2026-05-13  
**Version:** 1.0 — Canonical  
**Status:** CURRENT_SOURCE_OF_TRUTH

---

## 1. Problem Statement

Cermont currently cannot answer: "What did this job actually cost vs. what we quoted?" The cost data is spread across Excel files, invoices, receipts, and memories. This spec defines a centralized cost engine that tracks every cost from proposal to payment.

---

## 2. Cost Flow

```
PROPOSAL COST ESTIMATE (baseline)
    ↓
PLANNING RESOURCE ALLOCATION
    ↓
EXECUTION ACTUAL COSTS (materials, labor, tools, equipment, transport, subcontractors)
    ↓
COST COMPARISON (real vs. proposal)
    ↓
ALERTS (deviation > threshold)
    ↓
ADMINISTRATIVE CLOSURE (SES → invoice → payment includes actual costs)
```

---

## 3. Entities

### 3.1 CostCatalogItem
Standard cost reference for materials, labor rates, tool rentals, equipment rates.

```
{
  id, category: material | labor | tool | equipment | transport | subcontract | admin,
  name, description, unit, defaultUnitPrice,
  taxable: boolean, taxCategory: string?,
  active: boolean
}
```

### 3.2 CostEstimate (Proposal)
Cost estimate created during proposal phase. Frozen as baseline when proposal is approved.

```
{
  id, proposalId, version,
  items: [{
    catalogItemId?, description, category, quantity, unitPrice, totalPrice,
    taxable, taxRate, taxAmount
  }],
  subtotal, taxTotal, total,
  taxConfig: { defaultTaxRate, categories: { category: taxRate } },
  status: draft | approved,
  frozenAt: timestamp?
}
```

### 3.3 ActualCost (Execution)
Costs recorded during execution. Each entry must have evidence/support.

```
{
  id, orderId, executionSessionId?,
  category, description, quantity, unitPrice, totalAmount,
  date, recordedBy, evidenceId?, notes,
  taxable, taxRate, taxAmount,
  status: pending | recorded | verified
}
```

### 3.4 CostCart
Working cost cart for field personnel. Supports offline capture.

```
{
  id, orderId, userId,
  items: [{
    catalogItemId?, description, category,
    quantity, unitPrice, totalPrice,
    evidence: photo?
  }],
  status: open | submitted
}
```

### 3.5 CostComparison
Generated comparison between estimate and actual.

```
{
  orderId,
  estimate: { total, items[], frozenAt },
  actual: { total, items[], lastUpdated },
  variance: { total, byCategory },
  alerts: [{ category, variance, threshold }]
}
```

---

## 4. Cost Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **material** | Materials consumed | Cable, connectors, bolts, paint |
| **labor** | Direct labor | Hours × hourly rate per role |
| **tool** | Tool usage/rental | Drills, welders, meters |
| **equipment** | Equipment usage/rental | Crane, generator, vehicle |
| **transport** | Transportation | Fuel, tolls, freight |
| **subcontract** | Subcontracted work | Specialist services |
| **admin** | Administrative overhead | Permits, fees, insurance |
| **tax** | Taxes (configurable) | IVA, withholdings, local taxes |
| **contingency** | Unforeseen costs | Emergency repairs, weather delays |

---

## 5. Tax Configuration Rules

- **NO hardcoded Colombian tax law.** Tax rates MUST be configurable.
- **NO hardcoded prices.** Prices come from catalog or manual entry.
- Configuration per tenant/client: default tax rate, exempt categories, withholding rates.
- Each cost item has its own `taxable` flag and `taxRate`.
- Tax calculations are transparent and auditable.
- Changes to tax config must not retroactively change historical cost calculations.

---

## 6. Comparison Logic

### Baseline Freeze
When a proposal is approved and a WorkOrder is created:
- CostEstimate is frozen (immutable)
- This becomes the baseline for all comparisons

### Real-Time Comparison
As ActualCost entries are recorded:
- Total actual vs. total estimate
- Per-category actual vs. per-category estimate
- Variance = actual - estimate
- Variance % = (actual - estimate) / estimate × 100

### Alerts
| Condition | Alert Level | Action |
|-----------|-------------|--------|
| Variance > 10% in any category | Warning | Dashboard notification |
| Variance > 20% in any category | Critical | Email to gerente/residente |
| Variance > 30% overall | Blocking | Order cannot close without review |
| Missing cost evidence | Warning | Reminder to upload support |

---

## 7. Integration Points

| Integration | Direction | Data |
|-------------|-----------|------|
| Proposal → CostEstimate | Out | Estimated items from proposal items |
| Planning → Resource allocation | In | Planned materials, tools, equipment |
| Execution → ActualCost | In | Actual materials used, hours worked |
| Evidence → ActualCost | Link | Photo of receipt, invoice, delivery note |
| SES/Invoice → ActualCost | In | Final costs for SES/invoice generation |
| Dashboard → CostComparison | Out | KPI cards, variance charts |

---

## 8. Pages

| Page | Purpose | Status |
|------|---------|--------|
| `/costs` | Cost dashboard: summary, comparison charts, alerts | REQUIRED_NOT_IMPLEMENTED |
| `/costs/catalog` | Cost catalog management (CRUD items) | REQUIRED_NOT_IMPLEMENTED |
| `/proposals/[id]/costs` | Cost estimate for proposal | REQUIRED_NOT_IMPLEMENTED |
| `/orders/[id]/costs` | Actual costs for order + comparison | REQUIRED_NOT_IMPLEMENTED |
| `/orders/[id]/costs/new` | Record new actual cost entry | REQUIRED_NOT_IMPLEMENTED |
| `/orders/[id]/costs/cart` | Field cost cart (offline-capable) | REQUIRED_NOT_IMPLEMENTED |

---

## 9. Endpoints

See `docs/architecture/API_ENDPOINT_MATRIX.md` → Costs section for full endpoint listing.

---

## 10. Business Rules

1. **Cost baseline is immutable after proposal approval.**
2. **Every actual cost entry must have evidence (photo, invoice, receipt).**
3. **No cost can be negative.**
4. **Cost cart works offline: stored in IndexedDB, synced on connectivity.**
5. **Cost comparison is calculated server-side and cached for dashboard.**
6. **Tax rates are configuration, not code.**
7. **Historical costs are never deleted — they are marked voided if incorrect.**
8. **Cost entries are audited: who recorded, when, what evidence.**
9. **Alert thresholds are configurable per company/settings.**
10. **Material costs must reference catalog items when available.**

---

## 11. Testing Requirements

- Unit tests: cost calculation logic, tax computation, variance math
- Integration tests: cost CRUD endpoints, baseline freeze, comparison generation
- E2E tests: full cost flow (estimate → actual → comparison → dashboard)
- Edge cases: zero costs, missing catalog items, tax exemption, multi-currency (future)
