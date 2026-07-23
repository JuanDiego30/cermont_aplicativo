# Module: Proposals

## Business Problem
Propuesta técnica y económica con ítems, costos unitarios, subtotal e IVA. El cliente aprueba/rechaza; al aprobar se registra la orden de compra y se convierte en orden de trabajo. Paso 3 del flujo.

## Roles
| Role Group | Access |
|------------|--------|
| `FIELD_MANAGEMENT_ROLES` | gerente, residente, hes — CRUD + status changes |
| `ALL_AUTHENTICATED_ROLES` | All roles incl. cliente — list/detail read |
| `CERMONT_ROLES.CLIENTE` | Approve/reject own proposals |
| `CERMONT_ROLES.GERENTE` | Approve, approve-with-support (bypass), reject |

## Use Cases
1. Create proposal — items with description/unit/quantity/unitCost → backend recalculates totals
2. List proposals — paginated; client sees own proposals only (email match)
3. View proposal — full detail with cost breakdown
4. Update status — draft → sent / approved / rejected
5. Approve — sets approvedBy + approvedAt, freezes cost baseline
6. Approve with support — gerente bypass with verbal/email/document support type
7. Reject — convenience endpoint
8. Get cost breakdown — server-recalculated items + tax → ProposalCostBreakdown
9. Generate PDF — server-side cost breakdown PDF
10. Convert to order — approved proposal → work order via OrderService

## Entities
- **Proposal** — code `PROP-{year}-{sequence}`, title, clientName, clientEmail?, status, validUntil, items[], subtotal, taxRate, total, notes?, serviceCaseId?
- **ProposalItem** — description, unit, quantity, unitCost, total (server-computed)
- **ProposalCostBreakdown** — items, subtotal, taxRate, taxAmount, totalWithTax (read-only DTO)

## States
`draft` → `sent` → `approved` → `converted` | `rejected` | `expired`

## Transitions
| From | To | Action | Guard |
|------|----|--------|-------|
| draft | sent | updateStatus | FIELD_MANAGEMENT_ROLES |
| any | approved | approve | cliente (own) or gerente |
| any | rejected | reject | cliente (own) or gerente |
| approved | converted | convertToOrder | Requires approved PO via `assertProposalReadyForWorkOrder` |
| any | expired | (automatic via TTL) | validUntil passed |

## Preconditions
- No active draft/sent proposal exists for same serviceCaseId (409)
- Client email must match authenticated user for client role access
- Proposal + PO must be approved before convert-to-order

## Blockers
- 409 PROPOSAL_ALREADY_EXISTS — active proposal for same serviceCaseId
- Client can only view/approve/reject own proposals (email match)
- 422 PURCHASE_ORDER_NOT_APPROVED — cannot convert without approved PO
- Totals are server-calculated; client-submitted totals ignored

## Permissions
| Endpoint | Roles |
|----------|-------|
| POST / | FIELD_MANAGEMENT_ROLES |
| GET / | ALL_AUTHENTICATED_ROLES |
| PATCH /:id/status | FIELD_MANAGEMENT_ROLES |
| PATCH /:id/approve | CLIENTE or GERENTE |
| POST /:id/approve-with-support | GERENTE |
| PATCH /:id/reject | CLIENTE or GERENTE |
| GET /:id/costs | ALL_AUTHENTICATED_ROLES |
| GET /:id/pdf | ALL_AUTHENTICATED_ROLES |
| POST /:id/convert | FIELD_MANAGEMENT_ROLES |
| POST /:id/po | FIELD_MANAGEMENT_ROLES |

## Contracts
`packages/shared-types/src/schemas/proposal.schema.ts` — CreateProposalSchema, UpdateProposalStatusSchema, ApproveProposalSchema, ConvertProposalToOrderSchema, ListProposalsQuerySchema
`packages/shared-types/src/schemas/proposal-cost.schema.ts` — ProposalCostBreakdownSchema

## Endpoints
All at `/api/proposals` — create, list, getById, getByOrderId, status/approve/reject/convert, costs/pdf, po.

Backend: `backend/src/modules/proposal/proposal.{routes,controller,service}.ts`

## Screens
| Route | Page |
|-------|------|
| /proposals | List |
| /proposals/new | New proposal form |
| /proposals/[id] | Detail |
| /portal/proposals | Portal proposals (cliente) |

Frontend: `frontend/src/modules/proposals/` — queries.ts, proposal-status.ts, api/proposals.service.ts, hooks/useCreateProposal.ts, ui/

## UI States
- **Loading** — skeleton list/detail (loading.tsx)
- **Error** — error.tsx with retry
- **Empty** — "No hay propuestas" with create CTA
- **Offline** — mutations registered in OFFLINE_MUTATION_KEYS
- **Forbidden** — client sees own proposals only

## Audit Events
- `PROPOSAL_APPROVED` via `createAuditLog` — advances ServiceCase stage + freezes cost baseline
- Audit metadata: proposalId, proposalCode, previousStage, newStage

## Negative Cases
| Case | Code |
|------|------|
| Active proposal exists for serviceCaseId | 409 PROPOSAL_ALREADY_EXISTS |
| Proposal not found | 404 PROPOSAL_NOT_FOUND |
| Client accessing another's proposal | 403 ForbiddenError |
| Converting without approved PO | 422 PURCHASE_ORDER_NOT_APPROVED |

## E2E Tests
- `frontend/tests/e2e/pages/proposals-pages.spec.ts` — list, detail, navigation
- `frontend/tests/e2e/proposals.spec.ts` — full creation + approval flow
- `frontend/tests/modules/proposals/proposal-queries.test.tsx` — query hooks

## Acceptance Evidence
- Code auto-generated: `PROP-{year}-{sequence}` via Counter
- Totals server-calculated: `quantity * unitCost`, subtotal + tax
- Cost baseline frozen on approval (`freezeProposalBaseline`)
- ServiceCase stage auto-advances on approval
- PDF generation at `/proposals/:id/pdf`
