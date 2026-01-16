# Tailwind CSS v4 Migration Plan (Manual)

> Este plan es manual y no ejecuta cambios automáticamente.

## Pasos sugeridos

1. Revisar breaking changes de Tailwind v4.
2. Preparar rama dedicada para la migración.
3. Ejecutar un plan por etapas:
   - Actualizar dependencias de Tailwind y PostCSS.
   - Ajustar configuración en tailwind.config.
   - Revisar clases/semántica si hay cambios de compatibilidad.
4. Validar con build y revisión visual.

## Validación

- `pnpm --filter frontend lint`
- `pnpm --filter frontend build`
- Revisión visual de componentes críticos.

## Notas

- No ejecutar upgrades sin aprobación explícita.
