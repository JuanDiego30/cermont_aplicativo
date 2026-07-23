# Module: Purchase Orders

## Business Problem
El cliente emite una orden de compra (PO) autorizando el trabajo después de aprobar la propuesta. Cermont registra la PO, la valida y luego crea la orden de trabajo. Puente entre aprobación comercial y ejecución operacional. Paso 4 del flujo.

## Roles
| Role Group | Roles |
|------------|-------|
| `INTERNAL_ROLES` | All non-cliente — list/detail read |
| `ADMIN_PLUS_RESIDENTE` | gerente, residente, administrativo — register PO |
| `MANAGEMENT_ROLES` | gerente, residente — validate/reject PO |

## Use Cases
1. List purchase orders — paginated, filterable by proposalId, status
2. View purchase order — detail by ID (standalone or via `/proposals/:id/po`)
3. Register PO — link to approved proposal with poNumber, amounts, accounts, attachments
4. Validate PO — approve pending PO (pending → approved)
5. Reject PO — reject with reason (pending → rejected)

## Entities
- **PurchaseOrderAuthorization** — proposalId, poNumber (client-provided), contractReference?, serviceAccount, billingAccount, approvedAmount, currency (COP/USD/EUR), receivedAt, attachments[], validatedBy?, status, rejectionReason?
- **PurchaseOrderAttachment** — { url, filename, uploadedAt }

## States
`pending` → `approved` | `rejected`

Legacy aliases: `received` → pending, `validated` → approved (normalized via `normalizePurchaseOrderStatus()`)

## Transitions
| From | To | Action | Guard |
|------|----|--------|-------|
| pending | approved | validate | MANAGEMENT_ROLES; status !== "rejected" |
| pending | rejected | reject | MANAGEMENT_ROLES; status !== "approved" |

## Preconditions
- Proposal must exist and be in "approved" status (`assertProposalApproved`)
- No non-rejected PO may exist for the same proposal (409 conflict)
- PO must be approved before work order creation (`assertProposalReadyForWorkOrder`)

## Blockers
| Case | Code |
|------|------|
| Register PO for unapproved proposal | 422 PROPOSAL_NOT_APPROVED |
| Duplicate PO for same proposal | 409 ConflictError |
| Validate already-rejected PO | 409 ConflictError |
| Reject already-approved PO | 409 ConflictError |
| Create work order without approved PO | 422 PURCHASE_ORDER_NOT_APPROVED |

## Permissions
| Endpoint | Roles |
|----------|-------|
| GET / | INTERNAL_ROLES |
| GET /:id | INTERNAL_ROLES |
| POST / | ADMIN_PLUS_RESIDENTE |
| POST /:id/validate | MANAGEMENT_ROLES |
| POST /:id/reject | MANAGEMENT_ROLES |

## Contracts
`packages/shared-types/src/schemas/purchase-order-authorization.schema.ts` — RegisterPurchaseOrderSchema, ValidatePurchaseOrderSchema, RejectPurchaseOrderSchema, ListPurchaseOrdersQuerySchema

## Endpoints
| Method | Path |
|--------|------|
| GET | /api/purchase-orders |
| GET | /api/purchase-orders/:id |
| POST | /api/purchase-orders |
| POST | /api/purchase-orders/:id/validate |
| POST | /api/purchase-orders/:id/reject |
| GET | /api/proposals/:id/po |
| POST | /api/proposals/:id/po |

Backend: `backend/src/modules/purchase-order/purchase-order.{routes,controller,service}.ts`

## Screens
| Route | Page |
|-------|------|
| /purchase-orders | List |
| /purchase-orders/new | New PO form |
| /purchase-orders/[id] | Detail |

Frontend: `frontend/src/modules/purchase-orders/queries.ts`

## UI States
- **Loading** — skeleton
- **Error** — error card with retry
- **Empty** — "No hay órdenes de compra" with register CTA
- **Offline** — no offline snapshot fallback (plain TanStack Query)

## Audit Events
No explicit audit logging. Status tracked via Mongoose timestamps (createdAt, updatedAt).

## Negative Cases
| Case | Code |
|------|------|
| PO not found | 404 PO_NOT_FOUND |
| Proposal not found | 404 PROPOSAL_NOT_FOUND |
| Proposal not approved | 422 PROPOSAL_NOT_APPROVED |
| Duplicate PO | 409 ConflictError |
| Validate rejected PO | 409 ConflictError |
| Reject approved PO | 409 ConflictError |

## E2E Tests
- `frontend/tests/e2e/pages/purchase-orders-pages.spec.ts` — list, register, detail flow
- `backend/tests/services/purchase-order.service.test.ts` — service unit tests

## Acceptance Evidence
- PO number is client-provided (no auto-generated code)
- Status normalization handles legacy `received`/`validated` values
- `assertProposalReadyForWorkOrder` enforces proposal + PO approval gate
- Currency restricted to COP, USD, EUR
