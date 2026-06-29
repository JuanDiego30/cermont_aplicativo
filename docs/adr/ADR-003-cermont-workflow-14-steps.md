# ADR-003: Workflow Cermont de 14 pasos

Estado: Aceptado
Fecha: 2026-06-06

## Contexto

Cermont no es un dashboard genérico. Su valor es controlar documentos y bloqueos desde solicitud hasta pago.

## Decisión

El flujo oficial tiene 14 pasos y `ServiceCase` actúa como agregado de seguimiento. Cada documento conserva entidad, estado, auditoría y RBAC. Las transiciones viven en dominio/backend.

## Alternativas consideradas

- Un único estado en Order: descartado por pérdida de trazabilidad.
- Formularios sin workflow: descartado por no resolver bloqueos.
- Permitir saltos desde UI: descartado por inconsistencia.

## Consecuencias

Las operaciones se procesan en orden, los gates son explícitos y los reportes pueden mostrar bloqueos. Añadir un paso exige actualización de contratos, dominio, API, UI, pruebas y docs.

## Validación

Pruebas del flujo de 14 pasos y casos negativos: ejecución sin planeación, factura sin SES, cierre sin pago y acta sin ejecución.
