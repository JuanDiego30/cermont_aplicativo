# M0 · Verificación

## Comandos ejecutados

1. `pnpm run lint`
2. `pnpm run typecheck`
3. `pnpm run test`
4. `pnpm run build`
5. `pnpm dlx jscpd -c .jscpd.json`
6. `Get-ChildItem -File | Where-Object { $_.Extension -in '.sh', '.ps1', '.py', '.js' }`

## Resultado

- Lint: **falló** (missing `globals` en `backend/eslint.config.mjs`).
- Typecheck: **ok**.
- Tests: **fallaron** (ESM `import.meta` en Prisma Client + fallos de tests de auth + timeout email queue).
- Build: **falló** (ruta inválida a `tools/scripts/backend/prisma-generate.js`).
- Duplicidad: **sin reporte generado**; revisar configuración o salida.
- Scripts sueltos en root: **0**.
