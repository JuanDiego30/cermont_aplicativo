# Module: Delivery Records

## Business Problem
Acta de entrega que formaliza la recepción del servicio por parte del cliente. Es el documento legal que certifica que el cliente recibió el trabajo ejecutado y lo acepta (o rechaza). Sin este módulo no hay soporte contractual para crear la SES ni facturar.

## Roles
| Role | Create | Send | Sign | Reject |
|------|--------|------|------|--------|
| gerente | ✓ | ✓ | ✓ | ✓ |
| residente | ✓ | ✓ | ✓ | ✓ |
| administrativo | ✓ | ✓ | ✓ | |
| cliente | | | ✓ | ✓ |

## Use Cases
- UC-DEL-01: Crear acta desde informe técnico aprobado
- UC-DEL-02: Enviar acta al cliente para firma
- UC-DEL-03: Firmar acta mediante SignaturePad (captura de firma digital)
- UC-DEL-04: Rechazar acta con motivo
- UC-DEL-05: Descargar PDF del acta firmada
- UC-DEL-06: Ver historial de firmas y estados

## Entities
- `DeliveryRecord` (technicalReportId, clientSignature, signedAt, rejectedReason, status, pdfUrl)

## States
```
pending_signature → signed → rejected
       ↓
  cancelled
```

| State | Meaning |
|-------|---------|
| pending_signature | Creada y enviada, esperando firma del cliente |
| signed | Cliente firmó — aceptación formal |
| rejected | Cliente rechazó con motivo |
| cancelled | Anulada por administración antes de firmar |

## Transitions
| From | To | Trigger | Guard |
|------|----|---------|-------|
| pending_signature | signed | Client signs via SignaturePad | Client identity verified, signature PNG valid |
| pending_signature | rejected | Client rejects | rejectionReason min 10 chars |
| pending_signature | cancelled | Admin cancels | Management role only |

## Preconditions
1. Technical report must be approved
2. Client must be resolvable from the associated work order
3. Signature PNG must pass magic bytes validation and be ≤ 2 MB

## Blockers
- BLOCKER-DEL-001: Technical report not approved → cannot create delivery record
- BLOCKER-DEL-002: Client not linked to work order → cannot resolve signatory
- BLOCKER-DEL-003: Record already signed → duplicate sign rejected
- BLOCKER-DEL-004: Signature exceeds 2 MB or invalid format → rejected

## Permissions
| Action | gerente | residente | administrativo | cliente |
|--------|:-------:|:---------:|:--------------:|:-------:|
| Create delivery record | ✓ | ✓ | ✓ | |
| Send to client | ✓ | ✓ | ✓ | |
| Sign (accept) | ✓ | ✓ | ✓ | ✓ |
| Reject | ✓ | ✓ | | ✓ |
| Cancel | ✓ | ✓ | | |
| View detail | ✓ | ✓ | ✓ | ✓ |
| Download PDF | ✓ | ✓ | ✓ | ✓ |

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/delivery-records` | List with filters (status, date) |
| POST | `/api/delivery-records` | Create from technical report |
| GET | `/api/delivery-records/:id` | Get detail |
| POST | `/api/delivery-records/:id/send` | Send to client |
| POST | `/api/delivery-records/:id/sign` | Client signs |
| POST | `/api/delivery-records/:id/reject` | Reject with reason |
| POST | `/api/delivery-records/:id/cancel` | Cancel |

## Screens
| Route | Component | Description |
|-------|-----------|-------------|
| `/delivery-records/list` | DeliveryRecordList | Table with status badges |
| `/delivery-records/[id]` | DeliveryRecordDetail | Full detail + signature status |
| `/delivery-records/[id]/sign` | DeliverySignature | SignaturePad canvas for client |

## UI States
| State | Visual | Behavior |
|-------|--------|----------|
| Loading | Skeleton | Placeholder rows |
| Empty | Illustration | "No hay actas de entrega" |
| pending_signature | Orange badge | "Pendiente de firma del cliente" |
| signed | Green badge | "Firmado por el cliente el [fecha]" |
| rejected | Red badge + reason | "Rechazado: [motivo]" |
| cancelled | Gray badge | "Anulado" |
| Signature capture | Canvas | "Firme aquí" placeholder |
| Error | Banner + retry | "Error al procesar acta" |

## Audit Events
- `delivery.created` — Acta creada desde informe técnico
- `delivery.sent` — Enviada al cliente
- `delivery.signed` — Cliente firmó (captura signatureId)
- `delivery.rejected` — Cliente rechazó con motivo
- `delivery.cancelled` — Anulada por administración

## Negative Cases
| Scenario | Expected Behavior |
|----------|------------------|
| Create without approved technical report | 422 — "Technical report must be approved" |
| Sign already-signed record | 409 — "Delivery record already signed" |
| Reject without reason | 422 — "Rejection reason required (min 10 chars)" |
| Invalid signature image (not PNG) | 400 — "Signature must be a valid PNG" |
| Client without work order access | 403 — "Client not associated" |
| Cancel signed record | 422 — "Cannot cancel a signed delivery record" |

## E2E Tests
- TC-DEL-001: Create from approved report → status pending_signature
- TC-DEL-002: Send → client signs via SignaturePad → status signed
- TC-DEL-003: Send → client rejects → status rejected with reason
- TC-DEL-004: Admin cancels pending record → cancelled
- TC-DEL-005: Invalid signature image → 400 rejected
