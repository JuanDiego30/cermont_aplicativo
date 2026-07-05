# React Doctor remediation — Spec 009

Fecha: 2026-06-29

## Resultado

React Doctor v0.5.8 mejoró de **77/100** (1 error, 19 warnings) a **97/100** (0 errores, 1 warning).

## Correcciones aplicadas

- `NewVehicleDrawer` usa primitivas Radix Dialog y elimina el temporizador manual de foco.
- Las alertas de flota consumen `daysUntilExpiry` calculado en backend; no calculan tiempo durante render.
- Las páginas legales exportan metadata estática.
- `ConsentGate` usa un `aside` para el aviso no modal.
- `OrderTimeline` expone progreso con `<progress>` nativo.
- `DocumentGallery` conserva el `Dialog.Title` generado por Radix y deja de sobrescribir sus identificadores accesibles.
- Se retiraron módulos frontend sin consumidores: media y privacy requests.

## Warning restante

`MaintenanceSchedulesPage` conserva cinco estados locales relacionados. Es una advertencia de rendimiento de baja severidad; el flujo está cubierto por typecheck y tests y no bloquea el umbral P0 de 87.

