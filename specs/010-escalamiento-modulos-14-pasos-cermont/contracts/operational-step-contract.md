# Contract note — Operational Step

## SSOT actual

`cermont-operational-step.schema.ts`, `operational-step-requirement.schema.ts`, `service-case-step-context.schema.ts` y `packages/domain/src/operational-steps.ts`/workflow.

## Semántica

Cada paso tiene código/posición, estado, requisitos, responsables permitidos, timestamps, acciones disponibles y bloqueadores. Las transiciones solo avanzan si pasos previos y requisitos obligatorios están satisfechos.

## Reglas

- No saltos implícitos.
- Excepción explícita, justificada y auditada.
- Misma transición validada en dominio y servicio backend.
- UI representa razones; no decide la regla.
- Cambios de secuencia requieren migración y pruebas históricas.

