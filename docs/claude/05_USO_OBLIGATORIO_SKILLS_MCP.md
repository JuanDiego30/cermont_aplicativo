# 05 — Uso obligatorio de skills, MCP y herramientas

## Regla

El agente no debe desarrollar a ciegas. Debe usar herramientas verificables para leer, auditar, diseñar, ejecutar y probar.

## Herramientas mínimas por actividad

| Actividad | Herramienta obligatoria |
|---|---|
| Auditar código | `rg`, `grep`, lectura de archivos, `git diff` |
| Ver errores | `npm run typecheck`, `lint`, `test`, `build`, `verify` |
| Validar API | `curl`, Supertest o Vitest |
| Validar UI | Playwright + screenshots |
| Validar diseño | Figma MCP si existe URL Figma |
| Validar stack | documentación oficial |
| Validar repo/PR | GitHub MCP si está disponible |
| Validar deploy/logs | Vercel MCP si está disponible |

## Skills sugeridos

- `zod` para contratos.
- `typescript-advanced-types` para evitar `any`.
- `nodejs-backend-patterns` para servicios Express/Mongoose.
- `nodejs-express-server` para rutas/controladores.
- `next-best-practices` para Next.js.
- `vercel-react-best-practices` para React.
- `playwright-best-practices` para QA visual.
- `tailwind-css-patterns` para UI.
- `frontend-design` si toca rediseñar componentes.

## Uso por slice

### Formularios abiertos

- Revisar Zod schemas.
- Revisar componentes de form renderer.
- Probar con Playwright que aparece “Otro”.
- Probar con API que customValue persiste.

### Biblioteca documental

- Revisar rutas backend.
- Revisar modelo DocumentSourceFile.
- Revisar asociaciones.
- Probar upload con curl.
- Probar selección existente con Playwright.

### Cierre administrativo

- Revisar workflow gate service.
- Probar secuencia SES → factura → pago con curl.
- Probar UI timeline 10–14.

### Costos

- Revisar cost service.
- Crear seed con propuesta, materiales, horas, factura y pago.
- Probar cálculo con Vitest.
- Probar UI con Playwright.

## Rechazo automático

La entrega se rechaza si:

- no muestra logs de herramientas;
- no hay evidencia Playwright/curl/Vitest;
- no cita archivos modificados;
- no explica contratos usados;
- crea duplicados;
- usa `any`;
- actualiza snapshots sin justificar cambio de contrato;
- entrega solo texto o análisis sin refactor real.
