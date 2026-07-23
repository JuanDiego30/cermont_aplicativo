# Module: Service Entry Sheets (SES)

## Business Problem
Entrada de Servicio (SES, Service Entry Sheet) — documento formal que certifica servicio ejecutado para facturación. El SES vincula el acta de entrega firmada con la orden de trabajo, la cuenta de facturación y la referencia Ariba. Sin SES aprobado no se puede crear factura.

## Roles
Per `BILLING_ACCESS_ROLES` (`gerente`, `residente`, `hes`, `coord_administrativo`, `auxiliar_contable`, `administrativo`, `cliente`).

| Action | gerente | residente | coord_admin | admin |
|--------|:-------:|:---------:|:-----------:|:-----:|
| Create | ✓ | ✓ | ✓ | ✓ |
| Submit | ✓ | ✓ | ✓ | ✓ |
| Approve | ✓ | ✓ | | |
| Reject | ✓ | ✓ | | |
| View | ✓ | ✓ | ✓ | ✓ |

## Use Cases
- UC-SES-01: Crear SES desde acta de entrega firmada
- UC-SES-02: Registrar líneas de servicio, cuenta de facturación y referencia Ariba
- UC-SES-03: Someter SES para aprobación
- UC-SES-04: Aprobar/rechazar SES con retroalimentación
- UC-SES-05: Ver SES asociado a una orden
- UC-SES-06: Generar factura desde SES aprobado

## Entities
- `ServiceEntrySheet` (workOrderId, deliveryRecordId, billingAccount, aribaReference, amount, serviceLines[], status)

## States
```
draft → submitted → approved → rejected
                    ↑             |
                    |_____________|
```

| State | Meaning |
|-------|---------|
| draft | Creado desde acta, pendiente de completar datos |
| submitted | Enviado para aprobación |
| approved | Aprobado — listo para generar factura |
| rejected | Rechazado con motivo |

## Transitions
| From | To | Trigger | Guard |
|------|----|---------|-------|
| draft | submitted | Submit for approval | deliveryRecord signed, amount > 0, serviceLines non-empty |
| submitted | approved | Approve | approve role (gerente/residente) |
| submitted | rejected | Reject | rejectionReason min 10 chars |
| rejected | draft | Return to draft | reason required |

## Preconditions
1. **Delivery must be signed before SES can be created**
2. Work order must exist and be active
3. Amount must be positive
4. At least one service line required for submission

## Blockers
| Code | Condition | Message |
|------|-----------|---------|
| DELIVERY_NOT_SIGNED | Delivery not signed | "No se puede crear SES sin acta de entrega firmada" |
| SES_ALREADY_EXISTS | SES exists for this work order | "Ya existe un SES para esta orden" |
| INVALID_AMOUNT | Amount ≤ 0 | "El monto debe ser positivo" |
| NO_SERVICE_LINES | No lines defined | "Debe incluir al menos una línea de servicio" |

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/service-entry-sheets` | List (filtered by status, workOrderId) |
| POST | `/api/service-entry-sheets` | Create (requires deliveryRecordId) |
| GET | `/api/service-entry-sheets/:id` | Get detail |
| PATCH | `/api/service-entry-sheets/:id` | Update (draft only) |
| POST | `/api/service-entry-sheets/:id/submit` | Submit for approval |
| POST | `/api/service-entry-sheets/:id/approve` | Approve |
| POST | `/api/service-entry-sheets/:id/reject` | Reject with reason |

## Screens
| Route | Component | Description |
|-------|-----------|-------------|
| `/billing/ses` | SESList | Table with status filter |
| `/billing/ses/[id]` | SESDetail | Lines, billing account, Ariba ref, actions |
| `/billing/ses/new` | SESCreate | Select delivery record → auto-fill |

## UI States
| State | Visual |
|-------|--------|
| Loading | Skeleton table |
| Empty | "No hay actas de recibo" |
| Draft | Gray badge |
| submitted | Blue badge "Pendiente de aprobación" |
| approved | Green badge "Aprobado — Listo para facturar" |
| rejected | Red badge + reason |

## Audit Events
- `ses:created` — SES creado desde delivery record
- `ses:submitted` — Enviado para aprobación
- `ses:approved` / `ses:rejected` — Decisión de aprobación
- `ses:returned` — Retornado a draft

## Negative Cases
| Scenario | Expected Behavior |
|----------|------------------|
| Create SES without signed delivery | 409 `DELIVERY_NOT_SIGNED` |
| Submit with empty serviceLines | 422 — "At least one service line required" |
| Approve as administrativo | 403 Forbidden |
| Approve already approved SES | 409 — "SES already approved" |
| Reject without reason | 422 — "Rejection reason min 10 chars" |

## E2E Tests
- TC-SES-001: Create from signed delivery → draft
- TC-SES-002: Submit → approve → status approved
- TC-SES-003: Submit → reject → return to draft → re-submit → approve
- TC-SES-004: Create without signed delivery → 409
- TC-SES-005: Submit without service lines → 422
