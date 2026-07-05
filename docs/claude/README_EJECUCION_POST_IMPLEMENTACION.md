# README — Ejecución post-implementación CERMONT

## Objetivo

Este paquete debe usarse cuando el agente ya ejecutó varios planes de refactorización, pero el software todavía presenta errores en `verify`, `lint`, `test`, `build` o comportamiento funcional incompleto.

El objetivo NO es hacer que los comandos pasen “como sea”. El objetivo es verificar si los planes implementados realmente transformaron el aplicativo CERMONT en un orquestador operativo de 14 pasos con documentos contextuales, formularios dinámicos, evidencias, bloqueadores, cierre administrativo y costos reales.

## Orden obligatorio de lectura

1. `libro-proyecto-refactorizacion.md`
2. `refactor-funcional-cermont.md`
3. `refactor-cermont-14-pasos-v2.md`
4. `cermont-dynamic-platform.md`
5. Libro o PDF principal del proyecto
6. Docs canónicos del repositorio
7. Código real del monorepo
8. Logs actuales de `verify`, `lint`, `test`, `build`

## Regla central

Antes de editar código, el agente debe responder:

```text
¿Qué parte del flujo CERMONT está rota o incompleta?
¿Qué archivo lo implementa?
Qué evidencia demuestra que está roto?
Qué contrato/shared-type debe gobernar esa lógica?
Qué endpoint debe exponer el backend?
Qué pantalla debe consumirlo?
Qué prueba de negocio valida que ya quedó corregido?
```

## Qué NO se acepta

- No aceptar “plan completado” solo porque el agente escribió documentación.
- No aceptar “refactor completado” si los botones siguen redirigiendo a `/documents` sin contexto.
- No aceptar “formularios dinámicos” si solo hay subida de archivos.
- No aceptar “sistema inteligente” si no existen bloqueadores, clasificación, sugerencias, costos y nextActions.
- No aceptar “tests pasan” si se actualizaron snapshots sin explicar el cambio de contrato.
- No aceptar cambios masivos sin evidencia de QA funcional.

## Resultado esperado

El agente debe entregar:

1. Auditoría de cumplimiento de planes.
2. Matriz de deuda legacy restante.
3. Plan de corrección por vertical slices.
4. Corrección de errores técnicos actuales.
5. Pruebas de negocio.
6. Evidencia reproducible.
7. Veredicto honesto: aprobado, parcial o rechazado.
