# M0 · Baseline y evidencia

Fecha: 2026-01-15

## Alcance

- Estado actual de lint, typecheck, tests y build.
- Duplicidad (jscpd con .jscpd.json).
- Conteo de scripts sueltos en root.

## Resultados

### Lint

- Comando: `pnpm run lint`
- Resultado: **fallo**
- Error principal (backend): falta paquete `globals` importado en `backend/eslint.config.mjs`.

### Typecheck

- Comando: `pnpm run typecheck`
- Resultado: **ok**
- Nota: frontend reporta que el typecheck ocurre durante build.

### Tests

- Comando: `pnpm run test`
- Resultado: **fallo**
- Principales fallos detectados:
  - Jest + ESM: `SyntaxError: Cannot use 'import.meta' outside a module` al importar Prisma Client generado desde `backend/src/prisma/client.ts`.
  - Tests de `credentials.vo` fallan por `TypeError: Cannot redefine property` en `jest.spyOn(bcrypt, 'compare'|'hash')`.
  - Tests de `jwt-token.vo` fallan por incompatibilidad de tipos con `JwtSignerPort`.
  - Timeout en `email-queue.service.spec.ts` (30s).

### Build

- Comando: `pnpm run build`
- Resultado: **fallo**
- Error principal (backend): `MODULE_NOT_FOUND` en `node ../../tools/scripts/backend/prisma-generate.js` durante `prisma:generate`.

### Duplicidad

- Comando: `pnpm dlx jscpd -c .jscpd.json`
- Resultado: ejecución completada, **sin reporte generado** en `./report`.
- Observación: revisar configuración de salida o permisos; no se creó carpeta `report`.

### Scripts sueltos en root

- Comando: `Get-ChildItem -File | Where-Object { $_.Extension -in '.sh', '.ps1', '.py', '.js' }`
- Resultado: **0 scripts sueltos** en el root del repo.
