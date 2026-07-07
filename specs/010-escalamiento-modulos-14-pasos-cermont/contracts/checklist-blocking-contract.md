# Contract note — Checklist Blocking

## SSOT actual

`checklist.schema.ts`, `packages/domain/src/checklist.rules.ts`, modelo/servicio checklist.

## Invariantes

- Instancia conserva `templateVersion`.
- Cada ítem declara obligatoriedad/bloqueo y requisitos de foto/firma.
- Resultado fallido requiere observación según contrato.
- Evidencias son FileAsset refs con owner/metadata válidos.
- Readiness es `ready` o `blocked` con razones estructuradas.
- Cierre/avance llama la misma regla.
- Offline replay es idempotente.

