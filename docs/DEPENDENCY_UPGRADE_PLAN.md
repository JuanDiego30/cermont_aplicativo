# Dependency Upgrade Plan (Manual)

> Plan manual para actualizaciones de dependencias con control de riesgo.

## Checklist

1. Revisar estado actual:
   - `pnpm outdated`
   - `pnpm audit`
2. Definir alcance de actualización (patch/minor/major).
3. Actualizar de forma incremental y documentar cambios.
4. Validar:
   - `pnpm -r lint`
   - `pnpm -r test`
   - `pnpm -r build`
5. Commit de lockfile y resumen de cambios.

## Notas

- No ejecutar `pnpm update` sin aprobación.
- Evitar upgrades masivos sin pruebas.
