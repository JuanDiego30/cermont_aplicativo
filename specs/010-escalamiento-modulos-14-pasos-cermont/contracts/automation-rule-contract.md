# Contract note — Automation Rule

## SSOT actual

`automation.schema.ts`, `notification.schema.ts`, modelos AutomationRule/Execution/OperationalAction y módulo automation.

## Estructura

Regla versionada con evento, condiciones, acciones, prioridad/riesgo, enabled y alcance. Ejecución registra clave idempotente, resultado, errores, acciones y auditoría.

## Invariantes

- Payload de evento validado.
- Misma regla/evento no ejecuta acción dos veces.
- Acciones críticas respetan RBAC/gates del servicio destino.
- `block_transition` devuelve razón explícita.
- Retries tienen límite/backoff y no generan loops.
- IA no aprueba ni ejecuta acciones críticas autónomas.
- Deshabilitar conserva historia.

