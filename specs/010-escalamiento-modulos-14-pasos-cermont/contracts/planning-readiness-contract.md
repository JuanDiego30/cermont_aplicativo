# Contract note — Planning Readiness

## SSOT actual

`planning-packet.schema.ts`, `packages/domain/src/planning.rules.ts`, reglas fleet/kit/checklist y servicios de planeación.

## Resultado requerido

Status `ready`/`blocked`, lista de razones codificadas y evaluación de propuesta/PO, técnicos, vehículos, herramientas, EPP, permisos, AST, kits y checklists.

## Invariantes

- El backend ejecuta la regla compartida al consultar y aprobar.
- “No requerido” no se modela como ausencia ambigua.
- Un recurso crítico inválido bloquea ejecución.
- La fecha de evaluación se incluye o deriva de reloj controlable en tests.

## Expansión

Los nombres guía del prompt son candidatos; primero deben reconciliarse con campos y blockers existentes.

