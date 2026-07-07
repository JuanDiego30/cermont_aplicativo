# Contract note — ServiceCase Cockpit

## SSOT actual

`packages/shared-types/src/schemas/service-case-workflow.schema.ts` y reglas workflow en `packages/domain`.

## Payload mínimo

- identidad y estado del ServiceCase/orden;
- pasos operativos ordenados;
- acción siguiente autorizada;
- bloqueadores estructurados;
- documentos y evidencias vinculados;
- costos/margen/riesgo;
- cierre administrativo;
- timeline/auditoría.

## Invariantes

El cockpit es un read model; no persiste una segunda verdad. IDs y estados provienen de los módulos fuente. Datos no disponibles usan status objects. El endpoint requiere RBAC y no expone información financiera a roles sin permiso.

## Compatibilidad

Antes de introducir nombres del plan como `stepProgress` o `nextExpectedAction`, mapearlos contra las propiedades existentes. No crear un schema paralelo.

