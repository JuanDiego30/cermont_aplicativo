# Slice 04 — PlanningPacket Readiness

**Estado:** base presente; autoridad única pendiente de demostrar.

## Objetivo

Bloquear ejecución cuando falten recursos, acreditaciones, documentos, calibración, EPP, AST, permisos o checklist crítico.

## Evidencia

`planning-packet` backend/model/schema, `planning.rules.ts`, fleet/tool/kit/checklist y páginas de planeación existen.

## Riesgo principal

Readiness de vehículo/herramienta puede calcularse por caminos distintos en UI y backend. La decisión debe centralizarse en regla de dominio compartida aplicada por el servicio.

## Aceptación

`GET readiness` devuelve estado y razones estructuradas; aprobar planeación usa exactamente la misma regla. “No aplica” se distingue de “faltante”. Las expiraciones consideran fecha/zona horaria explícitas.

## Tests

Certificado expirado, vehículo sin documento, herramienta sin calibración, EPP incompleto, checklist HES fallido, kit completo y concurrencia de aprobación.

