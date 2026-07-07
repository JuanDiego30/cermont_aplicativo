# 04 — Instrucción obligatoria de uso de skills, MCP y herramientas

## Problema observado

Los agentes anteriores construyen “a lo loco”: leen poco, no usan herramientas especializadas, no inspeccionan la UI real, no comparan contra Figma, no usan MCP cuando existe, y terminan generando documentación o cambios superficiales.

## Regla de oro

El agente debe seleccionar la herramienta según el tipo de tarea.

## Matriz de herramienta obligatoria

| Tipo de tarea | Herramienta obligatoria | Evidencia esperada |
|---|---|---|
| Revisar código | lectura de archivos + rg/grep + git diff | archivo:línea + diff |
| Revisar rutas API | curl/Supertest/Vitest | status code + response shape |
| Revisar UI | Playwright/browser | screenshot + DOM assertion |
| Revisar diseño | Figma MCP si hay enlace | screenshot/design context |
| Revisar docs/libro | lectura completa + matriz de claims | claim vs código real |
| Revisar contratos | Zod + typecheck + tests contract | schema + snapshot/migration |
| Revisar GitHub/PR | GitHub MCP si está disponible | archivos cambiados + comentarios |
| Revisar deployment | Vercel MCP si está disponible | build logs/deployment logs |

## Preguntas que el agente debe responder antes de editar

1. ¿Qué herramienta usé para verificar el estado real?
2. ¿Qué archivo y línea prueban el problema?
3. ¿Qué contrato gobierna esta funcionalidad?
4. ¿Qué endpoint la expone?
5. ¿Qué componente la consume?
6. ¿Qué test/QA valida el comportamiento?
7. ¿Qué evidencia quedó guardada?

## Rechazo automático

Rechazar entrega si:

- No hay evidencia de herramientas.
- No hay archivo:línea.
- No hay screenshot para cambios UI.
- No hay curl/test para cambios API.
- No hay diff revisado.
- No hay matriz plan → implementación.
- No hay verificación contra libro/docs.

## Instrucción para pegar al agente

```text
Antes de modificar cualquier archivo, enumera qué tools/MCP/skills vas a usar y por qué. Si una tarea es UI, usa Playwright. Si hay diseño Figma, usa Figma MCP. Si una tarea es API, usa curl o test de integración. Si una tarea toca contratos, usa Zod/typecheck/contract tests. No aceptes una conclusión basada solo en lectura superficial o intuición.
```
