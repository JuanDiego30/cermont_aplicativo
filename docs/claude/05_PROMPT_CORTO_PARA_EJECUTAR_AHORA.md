# 05 — Prompt corto para ejecutar ahora

Lee estos archivos completos:

- `libro-proyecto-refactorizacion.md`
- `refactor-funcional-cermont.md`
- `refactor-cermont-14-pasos-v2.md`
- `cermont-dynamic-platform.md`
- Libro/PDF principal
- Docs canónicos
- Código real frontend/backend/packages
- Log actual de `npm run verify`

No modifiques código todavía.

Primero entrega:

1. Baseline técnico de gates.
2. Matriz de planes implementados vs código real.
3. Auditoría de deuda legacy restante.
4. Lista exacta de errores actuales con archivo:línea.
5. Plan de corrección por slices funcionales.
6. Herramientas/MCP/skills que usarás para cada slice.

Después de aprobado el diagnóstico, refactoriza siguiendo este orden:

1. Corregir gates triviales sin ocultar deuda.
2. Corregir contratos compartidos.
3. Corregir backend de dominio.
4. Corregir endpoints.
5. Corregir hooks TanStack.
6. Corregir páginas y botones contextuales.
7. Ejecutar QA funcional con Playwright/curl.
8. Ejecutar gates completos.

No aceptes como solución:

- Botones que redirigen a `/documents` sin contexto.
- Subida de archivos sin análisis o asociación.
- Formularios dinámicos hardcodeados.
- Costos en `$0`.
- Bloqueadores en cero.
- Cierre administrativo como simple conteo.
- Snapshots actualizados sin justificación.
- Tests eliminados o relajados.

Entrega final con veredicto:

```text
APROBADO / PARCIAL / RECHAZADO
```
