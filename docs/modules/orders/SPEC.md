# Module: Work Orders

## Business Problem

Field work needs an executable unit that can be assigned to teams/users, tracked through operational phases, linked to planning packets, and tied to costs/invoicing. Without WorkOrders, work is untrackable at the per-assignment level — ServiceCase orchestrates the pipeline but WorkOrders carry the actual execution payload.

## Roles

| Role | Responsibility |
|------|----------------|
| Gerente | Order approval, cost oversight, closure |
| Residente | Daily order management, assignment, planning |
| HES | Safety document review per order |
| Supervisor | Field execution coordination, material verification |
| Operador | Execution crew assigned to order |
| Tecnico | Technical execution per order |
| Administrativo | Order closure, SES/invoice processing |
| Cliente | Portal view of own orders |

## Use Cases

1. **Order CRUD** — Create, read, update, list, delete work orders
2. **Status transitions** — Advance order through 18-status FSM
3. **Assignment** — Assign order to teams/users
4. **Planning link** — Link order to planning packet with kit snapshot
5. **Execution tracking** — Track execution phase (pre-start, in-execution, closure)
6. **Cost baseline** — Freeze proposal costs against order
7. **Invoice linkage** — Link order to invoice, track billing status
8. **Order closure** — Administrative closure workflow (acta → SES → invoice → payment)
9. **Kanban board** — Drag-and-drop order status management
10. **AST/ATS safety docs** — Link safety analyses to order

## Entities

| Entity | Schema | Description |
|--------|--------|-------------|
| Order | `order.schema.ts` | Core work order — type, status, priority, assignment, materials, execution, billing |
| CostBaseline | `order.schema.ts` | Frozen proposal costs per order |
| ExecutionPhase | `order.schema.ts` | Pre-start checklist, in-execution, closure tracking |
| PlanningKitSnapshot | `order.schema.ts` | Kit template snapshot applied to order |
| WorkOrderFSM | `work-order-fsm.ts` | Pipeline stage transitions, terminal/active/editable state groups |
| OrderPipelineStage | `work-order-fsm.ts` | 14-stage pipeline from request_received to paid |

## States

**18 status values** (`ORDER_STATUS_VALUES`):

```
open → proposal_sent → proposal_approved → planning → assigned → ready_for_execution → execution_in_progress → execution_completed → report_pending → completed → ready_for_invoicing → acta_signed → ses_sent → invoice_approved → paid → closed
```

Additional statuses: `in_progress`, `on_hold`, `cancelled`.

**State groups:**

| Group | States |
|-------|--------|
| Terminal | closed, cancelled |
| Active | in_progress, execution_in_progress, on_hold, planning, assigned, ready_for_execution |
| Editable | open, proposal_sent, proposal_approved, planning, assigned, ready_for_execution |

## Transitions

Defined in `work-order-fsm.ts`:

| From | To |
|------|----|
| open | proposal_sent, planning, assigned, cancelled |
| proposal_sent | proposal_approved, cancelled |
| proposal_approved | planning, assigned, cancelled |
| planning | assigned, ready_for_execution, cancelled |
| assigned | ready_for_execution, in_progress, on_hold, cancelled |
| ready_for_execution | execution_in_progress, in_progress, on_hold, cancelled |
| execution_in_progress | execution_completed, report_pending, on_hold, cancelled |
| execution_completed | report_pending, completed, cancelled |
| in_progress | report_pending, completed, on_hold, cancelled |
| report_pending | completed, cancelled |
| on_hold | in_progress, cancelled |
| completed | ready_for_invoicing, acta_signed, closed, cancelled |
| ready_for_invoicing | acta_signed, closed, cancelled |
| acta_signed | ses_sent, closed, cancelled |
| ses_sent | invoice_approved, closed, cancelled |
| invoice_approved | paid, closed, cancelled |
| paid | closed |
| closed | (none) |
| cancelled | (none) |

## Preconditions

- **open** → requires type, asset, location, description
- **planning** → requires proposal_approved or open with sufficient data
- **assigned** → requires assignedTo user ID
- **ready_for_execution** → requires planning packet with approved readiness
- **execution_in_progress** → requires pre-start verification completed
- **completed** → requires report_generated or evidence satisfaction
- **ready_for_invoicing** → requires completed execution, delivery record
- **closed** → requires paid status or administrative closure workflow complete

## Blockers

- Missing required fields (type, asset, location)
- Invalid status transition (not in TRANSITIONS map)
- Order in terminal state (closed/cancelled)
- Missing planning packet for execution
- Unresolved execution phase pre-start items
- Cost baseline not frozen

## Permissions

| Action | Required Role |
|--------|---------------|
| Create order | gerente, residente, HES |
| Edit order | gerente, residente, HES, supervisor |
| View order | All authenticated |
| Assign order | gerente, residente, supervisor |
| Approve planning | gerente, residente |
| Execute | supervisor, operador, tecnico |
| Close order | gerente, residente |
| Cancel order | gerente, residente |
| Manage invoice | gerente, residente, administrativo |

## Contracts (Zod schemas)

| Schema | File |
|--------|------|
| OrderSchema | `order.schema.ts` |
| CreateOrderSchema | `order.schema.ts` |
| UpdateOrderSchema | `order.schema.ts` |
| UpdateOrderStatusSchema | `order.schema.ts` |
| TransitionOrderStatusSchema | `order.schema.ts` |
| AssignOrderSchema | `order.schema.ts` |
| OrderListQuerySchema | `order.schema.ts` |
| OrderIdParamsSchema | `order.schema.ts` |
| CostBaselineSchema | `order.schema.ts` |
| ExecutionPhaseSchema | `order.schema.ts` |
| PlanningKitSnapshotSchema | `order.schema.ts` |
| UpdateOrderBillingSchema | `order.schema.ts` |
| UpdateOrderPlanningSchema | `order.schema.ts` |
| OrderPipelineStageSchema | `work-order-fsm.ts` |
| OrderStatusSchema | `order.schema.ts` |

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/orders` | List orders (filtered, paginated) |
| GET | `/api/orders/:id` | Order detail |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id` | Update order |
| PATCH | `/api/orders/:id/status` | Update order status |
| PATCH | `/api/orders/:id/transition` | Transition order status (preferred) |
| PATCH | `/api/orders/:id/assign` | Assign order to user |
| GET | `/api/orders/:id/planning` | Planning packet for order |
| GET | `/api/orders/:id/execution` | Execution session for order |
| GET | `/api/orders/:id/evidences` | Evidence gallery for order |
| GET | `/api/orders/:id/costs` | Actual costs for order |
| GET | `/api/orders/:id/invoice` | Invoice linked to order |
| GET | `/api/orders/:id/asts` | Safety analyses linked to order |
| POST | `/api/orders/:id/closure` | Administrative closure |

## Screens

| Route | Component | Description |
|-------|-----------|-------------|
| `/orders/list` | OrdersTable | Filterable, paginated table with status badges |
| `/orders/[id]` | OrderDetail | Tabbed detail: info, planning, execution, evidences, costs, documents, closure |
| `/orders/new` | CreateOrderForm | Wizard with type, asset, description, assignment |
| `/orders/[id]/edit` | EditOrderForm | Edit order fields |
| `/orders/kanban` | KanbanBoard | Drag-and-drop status management |
| `/orders/[id]/planning` | OrderPlanningTab | Planning packet detail for this order |
| `/orders/[id]/execution` | OrderExecutionTab | Execution session with checklists |
| `/orders/[id]/costs` | OrderCostsTab | Actual cost entries |
| `/orders/[id]/invoice` | InvoicePageClient | Invoice detail linked to order |
| `/orders/[id]/asts` | OrderInspectionsTab | AST/ATS safety analyses |
| `/orders/[id]/edit` | EditOrderForm | Order modification |

## UI States

- **Loading** — Table skeleton, detail skeleton with tab placeholders
- **Empty** — No orders found (list), no data per tab (detail)
- **Error** — Error banner with retry action
- **Offline** — Cached order list with stale indicator
- **Status badge** — Color-coded per status group (active=blue, completed=green, cancelled=red, on_hold=yellow)
- **Transition dialog** — Confirm action with observation field
- **Kanban** — Drag overlay with drop zone highlighting

## Audit Events

| Event | Trigger |
|-------|---------|
| `order.created` | Order creation |
| `order.updated` | Order field update |
| `order.status_changed` | Status transition (from → to) |
| `order.assigned` | Assignment to user |
| `order.cost_baseline_frozen` | Cost baseline snapshot |
| `order.kit_applied` | Kit template applied to planning |
| `order.execution_started` | Execution phase entered |
| `order.execution_completed` | Execution completed |
| `order.invoice_linked` | Invoice linked |
| `order.closed` | Final closure |

## Negative Cases

| Scenario | Handling |
|----------|----------|
| Invalid status transition | 400 with allowed transitions list |
| Missing required fields on create | Zod validation errors |
| Assign to non-existent user | 404 with descriptive message |
| Edit order in terminal state | 400 — "Order is closed/cancelled" |
| Delete order with planning data | Archive only, never physical delete |
| Concurrent status update | Last-write-wins (Phase 1) |
| Legacy status value | Normalized via `normalizeOrderStatus()` |
| Missing cost baseline | Displayed as "not available" in financial summary |

## E2E Tests

- **OT-01**: Full order lifecycle — create → assign → execute → close, verify each transition
- **OT-02**: Invalid transition — attempt to close without completion, verify blocker
- **OT-03**: Kanban drag-and-drop — move order between status lanes, verify API call
- **OT-04**: Planning linkage — create order, link kit, verify planning snapshot
- **OT-05**: Role gating — attempt status transition as unauthorized role, verify 403
- **OT-06**: Order list filtering — filter by status, priority, assignee, verify results
- **OT-07**: Order closure workflow — complete execution → acta → SES → invoice → payment → closed

## Acceptance Evidence

- All 18 statuses defined in `order.schema.ts` with legacy alias normalization
- FSM transitions map with 17 from-states in `work-order-fsm.ts`
- Terminal, active, and editable state groups defined
- Backend: 5 controllers (order, order-state, order-crud, order-closure, administrative-workflow) + 5 services
- Frontend: 2 query files, model helpers, 18+ UI components (table, detail tabs, forms, kanban)
- Pages at all 10+ routes render correctly
- CostBaseline, ExecutionPhase, PlanningKitSnapshot sub-entities functional
