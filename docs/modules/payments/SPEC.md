# Module: Payments

## Business Problem
Registro de pagos con conciliación contra factura y cierre administrativo del ciclo financiero. El módulo garantiza que ningún pago exceda el saldo pendiente de la factura y previene pagos duplicados por referencia.

## Roles
Per `FINANCE_ACCESS_ROLES` (`gerente`, `coord_administrativo`, `auxiliar_contable`, `administrativo`). View extended to `BILLING_ACCESS_ROLES`.

| Action | gerente | coord_admin | aux_contable | admin |
|--------|:-------:|:-----------:|:------------:|:-----:|
| Record payment | ✓ | ✓ | ✓ | ✓ |
| Reconcile | ✓ | ✓ | ✓ | |
| Reject | ✓ | ✓ | ✓ | |
| View | ✓ | ✓ | ✓ | ✓ |

## Use Cases
- UC-PAY-01: Registrar pago contra factura aprobada
- UC-PAY-02: Reconciliar pago contra extracto bancario
- UC-PAY-03: Rechazar registro de pago con motivo
- UC-PAY-04: Ver detalle de pago con estado de conciliación
- UC-PAY-05: Dashboard de envejecimiento de cartera

## Entities
- `Payment` (invoiceId, amount, outstandingBefore, outstandingAfter, reference, date, method, status, reconciledAt)

## States
```
pending → completed → reconciled → rejected
```

| State | Meaning |
|-------|---------|
| pending | Pago registrado, pendiente de conciliar |
| completed | Pago aplicado a la factura |
| reconciled | Conciliado contra extracto bancario |
| rejected | Rechazado con motivo |

## Critical Business Rules
1. **Payment cannot exceed invoice outstanding amount** — validated before recording
2. **Duplicate payment prevention** — `paymentReference` must be unique per invoice
3. Outstanding balance = invoice total − sum(completed + reconciled payments)

## Transitions
| From | To | Trigger | Guard |
|------|----|---------|-------|
| pending | completed | POST payment | invoice approved, amount ≤ outstanding, reference unique |
| completed | reconciled | POST reconcile | reconciledBy role |
| completed | rejected | POST reject | rejectionReason min 10 chars |

## Preconditions
1. Invoice must be approved (validated by `canRegisterPayment`)
2. Payment reference must be unique per invoice
3. Amount must be positive and ≤ invoice outstanding balance
4. Payment method must be valid enum (bank_transfer, check, electronic, cash)

## Blockers
| Code | Condition | Message |
|------|-----------|---------|
| INVOICE_NOT_APPROVED | Invoice not approved | "No se puede registrar pago sin factura aprobada" |
| DUPLICATE_REFERENCE | paymentReference duplicate | "Ya existe un pago con esta referencia" |
| EXCEEDS_OUTSTANDING | Amount > outstanding | "El pago excede el saldo pendiente" |
| ALREADY_RECONCILED | Payment reconciled | "El pago ya está reconciliado" |

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/payments` | List (filtered by invoiceId, status) |
| POST | `/api/payments` | Register payment |
| GET | `/api/payments/:id` | Get detail |
| POST | `/api/payments/:id/reconcile` | Reconcile |
| POST | `/api/payments/:id/reject` | Reject |
| GET | `/api/payments/dashboard` | Aging dashboard |

## Screens
| Route | Component | Description |
|-------|-----------|-------------|
| `/payments/list` | PaymentList | Table with status, amount, reference |
| `/payments/[id]` | PaymentDetail | Info + reconciliation status |
| `/payments/new` | PaymentCreate | Form: invoice selector, amount, reference, method |

## Audit Events
- `payment:recorded` — Pago registrado (amount, reference)
- `payment:reconciled` — Conciliado contra banco
- `payment:rejected` — Rechazado con motivo

## Negative Cases
| Scenario | Expected Behavior |
|----------|------------------|
| Register payment without approved invoice | 409 `INVOICE_NOT_APPROVED` |
| Duplicate paymentReference | 409 `DUPLICATE_REFERENCE` |
| Amount exceeds outstanding | 422 `EXCEEDS_OUTSTANDING` |
| Reconcile already reconciled | 409 `ALREADY_RECONCILED` |
| Reject without reason | 422 — "Rejection reason required" |

## E2E Tests
- TC-PAY-001: Register payment against approved invoice → pending
- TC-PAY-002: Reconcile payment → reconciled
- TC-PAY-003: Duplicate reference blocked → 409
- TC-PAY-004: Amount over outstanding blocked → 422
- TC-PAY-005: Full chain: invoice → payment → reconcile → aging dashboard
