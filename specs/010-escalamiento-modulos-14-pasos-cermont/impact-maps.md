# Spec 010 — Impact maps

## Plantilla obligatoria

```text
Slice:
Cambio:
Problema que resuelve:
Módulos afectados:
Packages afectados:
Backend afectado:
Frontend afectado:
Schemas afectados:
Rutas afectadas:
RBAC afectado:
PWA/offline afectado:
Auditoría afectada:
Tests requeridos:
Riesgo:
Rollback:
```

## Mapa macro

| Slice | Packages | Backend | Frontend | Riesgo principal | Rollback |
|---|---|---|---|---|---|
| 01 Foundation | contratos transversales | index, auth, files, observability | proxy, apiClient, PWA | romper perímetro o FileAsset | revertir cambio aislado; conservar datos |
| 02 Cockpit | workflow/service-case | service-cases + agregados | service-cases | N+1, permisos inconsistentes | volver al read model previo |
| 03 Pasos 1–4 | work request/site visit/proposal/PO | módulos homónimos | páginas homónimas | saltar precondiciones | feature flag/read-only |
| 04 Planning | planning, readiness, assets | planning-packet, fleet, tool, user | planning | doble autoridad de readiness | desactivar aprobación nueva |
| 05 Execution | execution/sync | execution-session, sync | execution/offline | duplicar mutaciones | idempotency key + replay seguro |
| 06 Evidence | evidence/file-asset | evidence, files | evidences/files | pérdida/huérfanos | migración reversible de metadatos |
| 07 Reports | report/delivery/signature | report, technical-report, delivery-record, client-signature | reports/delivery/signatures | invalidar documentos firmados | versiones inmutables |
| 08 Financial | SES/invoice/payment/closure | service-entry-sheet, invoice, payment, order | billing/payments/orders | cierre inconsistente | prohibir transición y revertir estado |
| 09 GMAO | vehicle/tool/asset | fleet, tool, resource, asset, maintenance | fleet/resources/assets | dualidad Tool/Resource | adaptadores, no migración destructiva |
| 10 Checklists | checklist/domain rules | checklist, order | checklists/orders | bloqueo falso/omiso | regla pura versionada |
| 11 Dashboard | dashboard summary | dashboard | dashboard | KPI genérico o consulta costosa | read model previo |
| 12 Costs | cost/domain rules | cost | costs | signo/margen incorrecto | desactivar alerta/export, conservar registros |
| 13 Automation | automation/notification | automation, notifications | automation/notifications | loop o duplicado | desactivar regla, idempotencia |
| 14 Portal/SaaS | ownership/tenant ADR | portal/auth/system-config | portal/settings | fuga cross-tenant | P3 sin activar; flags off |

## Reglas de impacto

- Si cambia un contrato compartido, actualizar consumidores y snapshot en el mismo slice.
- Si cambia un estado, actualizar FSM, backend, UI, auditoría, offline y tests de transición.
- Si cambia ownership de archivo, validar parent adapter y autorización antes de migrar datos.
- Si una regla puede bloquear operación, su decisión debe producir razones estructuradas y auditables.

