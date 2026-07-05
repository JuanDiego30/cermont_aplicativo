# Slice 13 — Notifications + Automation Rules

**Estado:** base/modelos/servicio/UI presentes; robustez integral pendiente.

## Objetivo

Ejecutar reglas SI-ENTONCES ante eventos de evidencia, documentos, costos, checklists, SES y facturas.

## Invariantes

- Evento con ID/caso/tipo/tiempo/payload validado.
- Regla versionada, habilitada y limitada por alcance.
- Ejecución idempotente con estado/auditoría.
- Acción bloqueante devuelve razón explícita.
- Fallo de notificación no se convierte en éxito silencioso.
- Límites de recursión/loop y retry controlado.

## Tests

Evento duplicado, regla deshabilitada, condición falsa, acción bloqueante, fallo de canal, retry, loop, permiso CRUD y auditoría.

## Rollback

Deshabilitar regla/flag sin borrar ejecuciones ni eventos históricos.

