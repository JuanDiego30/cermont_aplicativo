# API Contracts Snapshot Guard

Este directorio define el baseline de contratos API (`Zod schemas` + `api/index.ts`) para detectar cambios breaking en Pull Requests.

## Flujo

1. Cambias schemas/contratos en `packages/shared-types/src`.
2. Actualizas snapshot: `npm run contracts:snapshot:update`.
3. Declaras migración en `contract-migrations.json` agregando una entrada en `migrations` (tipo `non-breaking` o `breaking`).
4. CI ejecuta `npm run contracts:check` y falla si:
   - El snapshot committed no coincide con el generado.
   - `currentSnapshotHash` no coincide con el hash real del snapshot.
   - La última migración no apunta al hash actual.

## Convención de migraciones

Cada entrada de `migrations` debe incluir:

- `id`: identificador incremental único.
- `date`: fecha ISO (`YYYY-MM-DD`).
- `type`: `baseline` | `non-breaking` | `breaking`.
- `description`: resumen del cambio de contrato.
- `toHash`: hash del snapshot resultante.
