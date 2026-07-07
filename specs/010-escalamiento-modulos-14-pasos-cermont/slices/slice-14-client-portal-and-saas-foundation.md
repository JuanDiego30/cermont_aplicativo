# Slice 14 — Client Portal + SaaS Foundation

**Estado:** portal base y feature flags globales presentes; SaaS tenancy no implementada.

## Portal

El cliente debe ver exclusivamente sus órdenes, propuestas, informes, actas y facturas; aprobar/rechazar o firmar solo cuando el flujo y permiso lo habilitan.

## SaaS

No existe `tenantId` verificado. Antes de código se requiere ADR con estrategia de aislamiento, migración, índices, auth, jobs, archivos, auditoría, backups y pruebas cross-tenant. Feature flags globales no sustituyen flags por tenant.

## Tests

Ownership positivo/negativo, enumeración de IDs, descarga ajena, caché, búsqueda, aprobación/firma; luego aislamiento cross-tenant en cada capa.

## Condición de entrada

P0/P1 estables, portal ownership probado y ADR aprobado. No activar multitenancy mediante adición mecánica de un campo.

