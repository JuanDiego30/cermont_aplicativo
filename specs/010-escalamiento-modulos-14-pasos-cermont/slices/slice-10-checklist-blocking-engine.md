# Slice 10 — Checklist Blocking Engine

**Estado:** implementación física avanzada; aceptación E2E pendiente.

## Evidencia

Contrato, modelo, servicio, regla pura `checklist.rules.ts`, UI de controles y tests enfocados están presentes.

## Aceptación

- Plantilla y versión persistidas.
- Resultado cumple/no cumple/no aplica según contrato.
- Ítem crítico fallido bloquea transición/cierre.
- Foto, comentario o firma exigidos antes de aprobar cuando corresponda.
- Evidencia se asocia por FileAsset/metadata.
- Offline replay no duplica resultados.

## Tests

Versiones, ítem pendiente/crítico, foto/firma faltante, fallo con observación, cierre de orden, offline y permiso.

