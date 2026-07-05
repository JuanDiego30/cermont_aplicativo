# Contract note — Evidence FSM

## SSOT actual

`evidence.schema.ts`, `file-asset.schema.ts`, modelos Evidence/FileAsset y módulos evidence/files.

## Estados objetivo

La nomenclatura exacta debe reconciliarse con el enum existente antes de migrar. Semánticamente se requieren captura, carga, revisión, verificación, rechazo, solicitud/reemplazo, bloqueo y archivo.

## Invariantes

- Binario en FileAsset; Evidence conserva semántica y relación.
- Rechazo exige motivo y revisor.
- Reemplazo no borra el original.
- Reporte aprobado bloquea mutación destructiva.
- Owner, fase, autor, timestamp y metadata se validan.
- GPS es opcional mediante status explícito; no se fabrica.

