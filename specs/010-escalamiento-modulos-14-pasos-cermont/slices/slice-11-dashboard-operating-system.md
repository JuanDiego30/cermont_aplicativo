# Slice 11 — Dashboard Operating System

**Estado:** dashboard operacional presente; validación por rol/rendimiento pendiente.

## Objetivo

Responder qué requiere acción: controles críticos, evidencias, expedientes, cartera, readiness y demanda real por servicio.

## Guardrails UX

- No mosaico genérico de KPIs ni espaciado repetitivo sin jerarquía.
- Métricas específicas, fuente/periodo explícitos y enlace a la acción.
- Empty state distingue cero real de falta de datos/permisos.
- Aggregates MongoDB medidos; no materializar prematuramente.

## Tests

Contrato, agregados financieros, permisos, empty/error/offline, links de acción, periodos y carga con volumen representativo.

## Aceptación

Un usuario autorizado identifica el principal bloqueo y navega al registro resoluble sin interpretar métricas ambiguas.

