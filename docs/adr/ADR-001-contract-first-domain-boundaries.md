# ADR-001: Contract-first y límites de dominio

Estado: Aceptado
Fecha: 2026-06-06

## Contexto

El flujo de 14 pasos cruza frontend, backend, MongoDB, offline y documentos. DTOs y enums duplicados provocan divergencias.

## Decisión

Zod en `@cermont/shared-types` es la fuente de verdad de datos. `@cermont/domain` contiene roles, permisos, estados y transiciones. UI, servicios y modelos consumen esas fuentes.

## Alternativas consideradas

- DTOs locales por módulo: descartado por duplicación.
- Schemas definidos desde Mongoose: descartado porque acopla clientes al backend.
- Generación automática total: pospuesta; no reemplaza reglas de dominio.

## Consecuencias

Cada vertical slice inicia en contrato y dominio. Cambios incompatibles requieren versionado/migración. Se reduce la libertad de atajos locales.

## Validación

`contracts:check`, typecheck de workspaces, matriz API/route y pruebas de schemas.
