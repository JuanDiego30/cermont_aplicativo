# Dependency Security Audit

Este documento resume el flujo mínimo de seguridad para dependencias (pnpm + turbo) sin aplicar cambios automáticos.

## Checklist

- `pnpm audit`
- `pnpm -r lint`
- `pnpm -r test`

## SBOM (opcional)

- Generar SBOM en formato CycloneDX:
  - `npx @cyclonedx/cyclonedx-npm --output-file sbom.json`

## Notas

- No ejecutar `pnpm audit fix --force` sin aprobación explícita.
- Mantener el lockfile actualizado tras cambios en dependencias.
