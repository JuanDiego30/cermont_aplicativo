# Slice 09 — Fleet + Tools + Assets GMAO

**Estado:** módulos avanzados presentes; coherencia de dominio pendiente.

## Objetivo

Gestionar fotos, documentos, certificación/calibración, disponibilidad, checkout, mantenimiento y readiness de vehículos, herramientas y activos.

## Riesgos

- Coexisten `Tool` y `Resource(type=tool)`.
- Readiness puede diferir entre frontend y backend.
- Owner adapters de FileAsset no están certificados para todos los tipos anunciados.

## Aceptación

Una autoridad de readiness; estados de ausencia explícitos; mantenimiento/vencimiento bloquea asignación cuando corresponde; historial de checkout; fotos/manuales/certificados mediante FileAsset.

## Tests

Documento expirado, calibración no aplicable/expirada, mantenimiento vencido, asignación concurrente, checkout ajeno, owner de archivo y desbloqueo tras corrección.

