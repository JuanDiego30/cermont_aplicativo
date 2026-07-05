# Backend–frontend–packages impact map

| Dominio | Contrato / dominio | Backend autoritativo | Consumidor frontend | Verificación mínima |
|---|---|---|---|---|
| ServiceCase Cockpit | `service-case-workflow.schema.ts`, workflow domain | `modules/service-cases` | `modules/service-cases`, `/service-cases/[id]` | contrato + agregación + permiso + empty |
| Work request | `work-request.schema.ts` | `modules/work-requests` | `modules/work-requests` | create/list/detail/offline |
| Site visit | `site-visit.schema.ts` | `modules/site-visit` | `modules/site-visits` | schedule/complete/evidence |
| Proposal | `proposal.schema.ts`, cost rules | `modules/proposal` | `modules/proposals` | version/approval/margin |
| PO | `purchase-order-authorization.schema.ts` | `modules/purchase-order` | `modules/purchase-orders` | amount/file/approval |
| Planning | `planning-packet.schema.ts`, `planning.rules.ts` | `modules/planning-packet` | `modules/planning` | readiness + blocking reasons |
| Execution | `execution-session.schema.ts`, `execution.ts` | `modules/execution-session`, `sync` | `modules/execution`, `offline` | idempotent lifecycle |
| Evidence/files | `evidence.schema.ts`, `file-asset.schema.ts` | `modules/evidence`, `files` | `evidences`, `files`, `documents` | owner auth + FSM + upload |
| Reports/actas | report/delivery/signature schemas | report/technical-report/delivery-record/client-signature | reports/signatures + pages | valid inputs + immutable versions |
| Financial closure | SES/invoice/payment/closure schemas/rules | service-entry-sheet/invoice/payment/order | billing/payments/orders | sequential gate + aging |
| Fleet/assets | vehicle/tool/asset/resource schemas + readiness rules | fleet/tool/asset/resource/maintenance | fleet/resources/assets | authoritative readiness |
| Checklists | checklist schema + domain rule | checklist/order | checklists/orders | version/block/photo/signature |
| Costs | cost schema + domain rules | cost | costs | variance sign + threshold + export |
| Dashboard | dashboard summary schema | dashboard | dashboard | decision-oriented payload |
| Automation | automation + notification schemas | automation/notifications | automation/notifications | event, rule, action, idempotency |
| Privacy/portal | auth/ownership contracts | privacy-requests/portal/auth | consent/privacy/portal | negative ownership tests |

## Regla de actualización

Un cambio no está completo si alguna columna queda sin implementación o sin test. Los mapas de rutas son evidencia secundaria: la autoridad final es contrato + ruta registrada + consumidor + prueba.

## Inconsistencias conocidas

- Mapas históricos pluralizan carpetas (`orders`, `site-visits`, `costs`) mientras el backend real usa varias carpetas singulares.
- `/tools` aparece en documentación, pero el inventario frontend actual materializa herramientas principalmente bajo `/resources`; no crear una página duplicada sin decisión de producto.
- `Tool` y `Resource(type=tool)` coexisten; resolver ownership antes de expandir archivos o readiness.
- `API_ROUTE_MAP.md` no existe; `API_ENDPOINT_MATRIX.md` es la fuente canónica disponible.

