# Slice 06 — Evidence FSM + FileAsset

**Estado:** FileAsset/evidencia presentes; FSM objetivo parcialmente verificada.

## Objetivo

Formalizar captura, carga, revisión, verificación, rechazo, reemplazo, bloqueo y archivo de evidencias sin perder historia.

## Invariantes

- FileAsset es SSOT binario.
- Evidence referencia owner/caso/sesión/fase y metadatos válidos.
- Rechazo exige razón.
- Reemplazo conserva vínculo al original.
- Evidencia usada en informe aprobado no se elimina ni altera.
- Descarga/preview aplica ownership y RBAC.

## Brechas

Los nombres exactos `replacement_requested`, `replacementOf`, `lockedByReport`, `usedInReport`, `gpsMetadata` y `qualityScore` no están todos confirmados. Deben reconciliarse con contratos existentes antes de expansión.

## Tests

FSM válida/inválida, motivo requerido, reemplazo, lock de reporte, owner inexistente/ajeno, archivo malicioso/tamaño, upload offline y auditoría.

