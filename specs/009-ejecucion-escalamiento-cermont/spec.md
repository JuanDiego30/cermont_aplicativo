# Spec 009 — Ejecución y escalamiento Cermont

## Objetivo

Ejecutar con código real los slices priorizados por la Spec 008. P0 debe quedar estable antes de iniciar P1, y la entrega requiere al menos dos slices P1 verticales completos.

## Reglas de aceptación

- `FileAsset` permanece como SSOT de archivos; no se crea `MediaAsset` ni `/api/media`.
- Cada cambio funcional sigue contrato Zod → backend → frontend → RBAC → UI → tests → documentación.
- No se amplía el baseline de calidad para ocultar deuda.
- No se introducen `any`, `unknown`, `null` o `undefined` como escape de tipos.
- No se despliega sin autorización explícita.

## Fuente ejecutable

El orden, alcance y Definition of Done provienen de `PROMPT_SPEC_009_EJECUCION_ESCALAMIENTO_CERMONT.md` y de los slices existentes en `specs/008-auditoria-investigacion-mejora-continua-cermont/`.

