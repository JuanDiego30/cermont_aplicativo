# M0 · Plan de ejecución

## Objetivo

Registrar el estado base (lint, typecheck, tests, build, duplicidad y scripts sueltos) como evidencia previa a los cambios.

## Pasos

1. Ejecutar `pnpm run lint` y capturar errores.
2. Ejecutar `pnpm run typecheck` y capturar estado.
3. Ejecutar `pnpm run test` y capturar fallos.
4. Ejecutar `pnpm run build` y capturar fallos.
5. Ejecutar `pnpm dlx jscpd -c .jscpd.json` para duplicidad.
6. Contar scripts sueltos en root con PowerShell.
7. Documentar resultados en `01_RESEARCH.md` y verificar en `03_VERIFY.md`.
