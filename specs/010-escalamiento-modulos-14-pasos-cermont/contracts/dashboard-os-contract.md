# Contract note — Dashboard OS

## SSOT actual

`dashboard-summary.schema.ts`, backend dashboard y frontend dashboard.

## Contenido

Pipeline, readiness de campo, cierre documental, cartera/aging, costos en riesgo, activos bloqueados, demanda por tipo de servicio y actividad reciente.

## Invariantes

- Cada métrica tiene definición, unidad y periodo.
- Conteos y montos no se intercambian.
- El backend agrega; la UI presenta.
- El payload respeta permisos y no filtra datos sensibles.
- Cero, no disponible y sin permiso son estados distintos.
- Cualquier materialización se justifica con medición.

