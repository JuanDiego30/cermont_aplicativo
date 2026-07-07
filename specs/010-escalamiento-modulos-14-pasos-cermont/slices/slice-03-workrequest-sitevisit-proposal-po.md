# Slice 03 — WorkRequest → SiteVisit → Proposal → PO

**Estado:** verticales presentes; robustez integral pendiente.

## Objetivo

Hacer trazables los pasos 1–4 y evitar una orden autorizada sin entrada, visita/propuesta válida y PO aprobada.

## Evidencia

Módulos, modelos, schemas y páginas físicas existen para WorkRequest, SiteVisit, Proposal y PurchaseOrder.

## Brechas

- Offline/E2E de solicitud y visita.
- Adjuntos mediante FileAsset.
- Versionado de propuesta, impuestos y margen.
- Validación de PO contra propuesta y monto aprobado.
- Ownership del cliente y auditoría de aprobaciones.

## Aceptación

Cada handoff conserva IDs, estado, autor, timestamp y soportes. La propuesta directa sin visita debe ser una excepción explícita. No se crea WorkOrder ejecutable sin PO válida salvo regla interna documentada.

## Tests

Flujo con visita, flujo directo autorizado, propuesta rechazada, PO duplicada/monto discordante, acceso cliente ajeno y reconexión offline.

