# Module: Costs

## Business Problem
Comparar costos estimados vs reales vs facturados por orden de trabajo con capacidad de drill-down por categoría. Permite alertas de presupuesto, cálculo de margen y trazabilidad financiera completa. Sin este módulo no hay visibilidad de rentabilidad por proyecto.

## Roles
| Role | Record | View | Export | Manage Catalog |
|------|:------:|:----:|:------:|:--------------:|
| gerente | ✓ | ✓ | ✓ | ✓ |
| coord_administrativo | ✓ | ✓ | ✓ | ✓ |
| auxiliar_contable | ✓ | ✓ | ✓ | |
| administrativo | ✓ | ✓ | ✓ | |
| Others (view limited) | | ✓ (read) | | |

Finance roles: `gerente`, `coord_administrativo`, `auxiliar_contable`.

## Use Cases
- UC-CST-01: Registrar costo por categoría con soporte
- UC-CST-02: Ver comparativa estimado vs real vs facturado vs pagado
- UC-CST-03: Ver dashboard de costos agregado por orden
- UC-CST-04: Gestionar catálogo de ítems con precios unitarios
- UC-CST-05: Alertas de presupuesto (threshold 80%)
- UC-CST-06: Calcular margen bruto por orden
- UC-CST-07: Exportar datos de costos a CSV/Excel
- UC-CST-08: Drill-down por categoría (labor, materials, tools, equipment, transport, subcontracts, taxes)

## Entities
- `Cost` — registro individual de costo (orderId, category, estimatedAmount, actualAmount, description, supportEvidenceId)
- `CostBaseline` — línea base de presupuesto aprobado por orden/categoría
- `CostControl` — configuración de alertas y thresholds por orden
- `CostCatalogItem` — ítem del catálogo con nombre, categoría, precio unitario

## Types (Categories)
`labor | materials | tools | equipment | transport | subcontracts | taxes | overhead | other`

## Data State Progression
```
NO_DATA → ESTIMATED_ONLY → ESTIMATED_AND_ACTUAL → INVOICED → PAID
                          → ACTUAL_ONLY
```

## Budget Risk States
```
within_budget (< 80%) → threshold_reached (80-100%) → over_budget (> 100%)
```

## Preconditions
1. Work order must exist
2. Category must be valid enum value
3. Amount must be non-negative (null for absent data, never $0 false value)
4. Actual cost > 0 requires support evidence

## Blockers
| Code | Condition | Message |
|------|-----------|---------|
| CATEGORY_INVALID | Invalid category | "Categoría de costo no válida" |
| AMOUNT_NEGATIVE | Negative amount | "El monto no puede ser negativo" |
| MISSING_SUPPORT | Actual cost without evidence | "Costo real debe tener soporte" |
| CATALOG_ITEM_INACTIVE | Item deactivated | "El ítem está inactivo" |

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/costs` | List costs (filtered by orderId, category) |
| POST | `/api/costs` | Record cost entry |
| GET | `/api/costs/order/:orderId/summary` | Summary with margin |
| GET | `/api/costs/order/:orderId/comparison` | Estimated vs actual vs invoiced vs paid |
| GET | `/api/costs/catalog` | List catalog items |
| POST | `/api/costs/catalog` | Create catalog item |
| PUT | `/api/costs/catalog/:id` | Update catalog item |
| GET | `/api/costs/dashboard` | Aggregated dashboard |
| GET | `/api/costs/budget-alert/:orderId` | Budget risk assessment |
| GET | `/api/costs/export` | Export CSV/Excel |

## Screens
| Route | Component | Description |
|-------|-----------|-------------|
| `/costs/list` | CostList | Orders with cost summary cards |
| `/costs/[orderId]` | CostDetail | Per-order breakdown by category |
| `/costs/catalog` | CostCatalog | Catalog CRUD table |
| `/orders/[id]/costs` | CostPanel | Embedded cost tab in order |

## Audit Events
- `cost:recorded` / `cost:updated` / `cost:voided`
- `catalog:created` / `catalog:updated` / `catalog:deactivated`
- `budget:threshold_reached` / `budget:over_budget`

## Negative Cases
| Scenario | Expected Behavior |
|----------|------------------|
| Record cost with negative amount | Zod validation error |
| Actual cost without support evidence | 422 `MISSING_SUPPORT` |
| Use deactivated catalog item | 422 `CATALOG_ITEM_INACTIVE` |
| View order without cost data | Shows "no data" (never $0 baseline) |
| Access as HES/operator | 403 Forbidden |

## E2E Tests
- TC-CST-001: Record cost → verify summary reflects it
- TC-CST-002: Record estimated + actual → verify margin calculation
- TC-CST-003: Budget threshold 80% → alert triggers
- TC-CST-004: Catalog CRUD (create, update, deactivate)
- TC-CST-005: Export costs → CSV with correct headers
- TC-CST-006: Drill-down by category shows correct aggregation
