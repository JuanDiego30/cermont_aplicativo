# Contract note — Execution Session

## SSOT actual

`execution-session.schema.ts`, schemas `execution-*`, `packages/domain/src/execution.ts` y módulo `execution-session`.

## Ciclo

Programada/no iniciada → activa → pausada/reanudada → completada/cancelada según FSM vigente.

## Invariantes

- Planeación/readiness válida antes de iniciar.
- Timestamps monotónicos y actor auditado.
- Mutaciones de campo idempotentes.
- Checklists/evidencias/novedades pertenecen al caso/sesión.
- Completar exige requisitos de cierre de campo.
- Estado de sync es read model del cliente, no fuente de verdad de la sesión.

