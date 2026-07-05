# Slice 05 — ExecutionSession Field Mode

**Estado:** base presente; E2E offline completo pendiente.

## Objetivo

Permitir inicio, pausa, reanudación, finalización, checklists, novedades, evidencia y firma con conectividad intermitente sin duplicar mutaciones.

## Evidencia

Módulo/modelo/schema de ejecución, páginas, Service Worker, IndexedDB y módulo sync existen.

## Aceptación

- Solo inicia con planeación aprobada/readiness vigente.
- Cada mutación tiene `clientMutationId`/clave idempotente.
- La cola muestra pending/failed/synced y permite retry seguro.
- La UI conserva datos tras recarga/offline.
- Finalizar valida checklist, evidencia y firma requeridos.

## Tests

Doble click/replay, pausa offline, orden de eventos fuera de secuencia, conflicto servidor, carga binaria diferida, sesión de usuario distinta y cierre con pendientes.

