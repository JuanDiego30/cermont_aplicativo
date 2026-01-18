# Prisma — Generación de Client

## Objetivo

Garantizar que el Prisma Client esté generado antes de `build` y `test` en el backend.

## Comando estándar (workspace backend)

```bash
pnpm --filter @cermont/backend exec prisma generate
```

## Nota sobre DATABASE_URL

Si el entorno no tiene `DATABASE_URL`, puedes ejecutar:

```bash
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cermont"; pnpm --filter @cermont/backend exec prisma generate; Remove-Item Env:DATABASE_URL
```
