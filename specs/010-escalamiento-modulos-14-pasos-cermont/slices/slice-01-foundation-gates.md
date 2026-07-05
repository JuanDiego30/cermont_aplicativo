# Slice 01 — Foundation, gates y deuda crítica

**Estado:** requiere revalidación final.

## Objetivo

Establecer una línea base reproducible, preservar FileAsset SSOT y cerrar regresiones de seguridad/calidad antes de continuar P1.

## Evidencia actual

- Spec 009 documentó gates verdes y una mejora enfocada de React Doctor, pero sobre un delta anterior.
- `backend/src/modules/files` y `FileAsset.ts` existen.
- El worktree actual tiene cambios concurrentes; no puede reutilizarse el baseline anterior como certificación.

## Entregables

- Fuente LTG reconciliada y mapas actualizados.
- Cero APIs genéricas paralelas a `/api/files`.
- Parent adapters y ownership probados.
- Typecheck, lint, tests, build, contracts, quality, verify y React Doctor registrados.
- Seguridad API, backup/restore, smoke y rollback antes de deploy.

## Tests

Perfil/avatar grande, autorización de archivos, tipos/tamaños, parent inexistente, descarga ajena, offline idempotente, PWA assets y rutas protegidas.

## Criterio de salida

Todos los gates verdes sobre el mismo commit y sin hallazgos de seguridad altos/críticos abiertos.

