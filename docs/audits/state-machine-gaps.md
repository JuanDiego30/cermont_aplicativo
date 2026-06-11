# Auditoria de maquina de estados y flujo de 14 pasos

Fecha de revision: 2026-06-03.

Archivos revisados:

- `packages/domain/src/operational-steps.ts`
- `packages/domain/src/workflow/service-case-state-machine.ts`
- `packages/domain/src/workflow/step-requirements.ts`
- `backend/src/services/cermont-workflow-gate.service.ts` (referenciado por rutas de avance)
- `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`

## Mapeo encontrado

| Paso | Flujo CERMONT | Key actual | Entidad actual | Estado |
| --- | --- | --- | --- | --- |
| 1 | Solicitud formal | `work_request` | `WorkRequest` | Implementado en dominio |
| 2 | Visita tecnica | `site_visit` | `SiteVisit` | Implementado en dominio |
| 3 | Propuesta economica | `proposal` | `Proposal` | Implementado en dominio |
| 4 | Aprobacion con PO | `purchase_order` | `PurchaseOrder` | Implementado en dominio |
| 5 | Planeacion | `planning` | `PlanningPacket` | Parcial por campos/requisitos |
| 6 | Ejecucion | `execution` | `ExecutionSession` | Parcial por validaciones/forms |
| 7 | Evidencias | `evidences` | `Evidence` | Parcial por paso obligatorio |
| 8 | Informe tecnico | `technical_report` | `TechnicalReport` | Parcial por modulo acoplado |
| 9 | Acta de entrega | `delivery_record` | `DeliveryRecord` | Parcial por modulo acoplado |
| 10 | Firma cliente | `client_signature` | `ClientSignature` | Parcial; no se encontro modelo separado con ese nombre |
| 11 | SES / Ariba | `ses` | `ServiceEntrySheet` | Parcial; seguimiento, no automatizacion Ariba |
| 12 | Factura | `invoice` | `Invoice` | Parcial por modulo acoplado |
| 13 | Aprobacion factura | `invoice_approval` | `InvoiceApproval` | Parcial; no se encontro modelo separado con ese nombre |
| 14 | Pago y cierre | `payment` | `Payment` | Parcial por modulo acoplado |

## Brechas principales

| Codigo | Brecha | Evidencia | Riesgo | Accion |
| --- | --- | --- | --- | --- |
| SM-01 | Roles actuales son 8, pero la documentacion empresarial requiere 10 roles base. | `packages/domain/src/roles.ts`; `docs/pdf/Jerarquia de controles_Cermont.md`. | RBAC no representa la jerarquia real de CERMONT. | Expandir roles o crear mapeo formal antes de permisos nuevos. |
| SM-02 | El paso `proposal` tiene precondiciones `site_visit` y `work_request`, aunque el flujo permite propuesta directa cuando la visita no aplica. | `packages/domain/src/operational-steps.ts`. | Puede bloquear propuestas directas validas. | Modelar visita como condicional o permitir ruta directa documentada. |
| SM-03 | Los requisitos de planeacion son documentales (`ats`, `ptw`, `checklist`, `kit`, `cost_baseline`), pero no validan materiales, herramientas, equipos, EPP, trabajadores y firmas del formato real. | `step-requirements.ts` y PDF de planeacion. | Planeacion incompleta podria avanzar. | Agregar readiness real desde `PlanningPacket`. |
| SM-04 | `ClientSignature` e `InvoiceApproval` aparecen como entidades del flujo, pero no se encontraron modelos separados. | Inventario `backend/src/models`. | Se puede afirmar entidad inexistente si no se aclara que vive dentro de `DeliveryRecord`/`Invoice`. | Documentar como estado/subdocumento o crear modelos. |
| SM-05 | Cierre administrativo se implementa centralizado en `order/administrative-workflow.*`, no en services propios por modulo. | Rutas de `technical-report`, `delivery-record`, `service-entry-sheet`, `invoice`, `payment`. | Acoplamiento alto y pruebas por modulo menos claras. | Extraer servicios o aumentar pruebas de workflow. |
| SM-06 | Requisitos de costos se reducen a `hasCostBaseline` y `hasActualCosts`. | `WorkflowContext` en `step-requirements.ts`. | No valida desviaciones, evidencia de costos ni aprobacion administrativa. | Integrar `CostEstimate`, `ActualCost`, `CostDeviation`. |
| SM-07 | No se verifico auditoria completa en cada transicion. | Auditoria de archivos; pendiente de trazabilidad por evento. | Mutaciones criticas sin audit log defendible. | Pruebas obligatorias de `AuditLog` por transicion. |
| SM-08 | Offline aparece como arquitectura y sync, pero la maquina de estados no explicita estados de sincronizacion por paso. | `sync` existe, pero `ServiceCaseStateMachine` no modela sync. | Confundir offline parcial con flujo offline completo. | Mantener offline como capacidad por modulo y probar E2E. |

## Recomendacion de estados canonicos

Mantener el flujo de 14 pasos, pero separar:

- Estado operativo de la orden.
- Estado documental de cada artefacto.
- Estado financiero/administrativo.
- Estado de sincronizacion offline.

La maquina debe bloquear transiciones por requisitos de negocio, no solo por tokens de contexto. Ejemplo de bloqueo obligatorio para `planning -> execution`:

- Materiales definidos.
- Herramientas definidas.
- Equipos definidos.
- Elementos de seguridad definidos.
- Mano de obra definida.
- Certificaciones/documentos requeridos verificados.
- Firmas/responsables registrados.

## Resultado

La maquina de estados esta implementada como base del flujo de 14 pasos, pero queda clasificada como **parcial** frente al objetivo final. No debe declararse como flujo completamente validado hasta cubrir las brechas anteriores con pruebas.
