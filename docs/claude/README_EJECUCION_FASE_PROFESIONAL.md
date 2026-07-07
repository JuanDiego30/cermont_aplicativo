# README — Fase profesional de refactorización CERMONT

## Objetivo

Esta carpeta guía la siguiente fase del aplicativo CERMONT. No es una fase para “arreglar lint” ni para “crear pantallas bonitas”. Es una fase para convertir el sistema en una plataforma operativa robusta, configurable y defendible frente al libro, la documentación y las fallas reales de CERMONT.

## Diagnóstico base

Los dos agentes coinciden en un punto: existe bastante infraestructura, pero persisten fallas funcionales importantes:

- Hay formularios/selectores cerrados que obligan al usuario a escoger opciones predefinidas.
- Faltan opciones “Otro / Otra / Personalizado” con entrada libre y persistencia.
- La carga documental todavía no es suficientemente reutilizable ni contextual.
- Persisten rutas o botones que llevan a `/documents` sin contexto.
- Hay servicios con almacenamiento en memoria o lógica parcial.
- Hay tests/gates fallando por lint, snapshots y deuda técnica.
- La experiencia aún puede sentirse como módulos aislados y no como orquestador de 14 pasos.

## Regla de oro

Ninguna implementación se acepta si no responde esta pregunta:

> ¿Esta funcionalidad ayuda a que una OT/caso de servicio avance por los 14 pasos de CERMONT resolviendo planeación, ejecución, informes/actas, cierre administrativo y costos reales?

## Orden de ejecución

1. Congelar baseline técnico.
2. Auditar lo implementado contra los planes y el libro.
3. Corregir los gates mínimos sin ocultar deuda.
4. Refactorizar contratos compartidos.
5. Refactorizar backend de dominio.
6. Refactorizar frontend por vertical slices.
7. Verificar con Playwright, curl, Vitest y evidencia.
8. Entregar veredicto: APROBADO, PARCIAL o RECHAZADO.

## Archivos de esta carpeta

- `00_PLAN_SIGUIENTE_FASE_REFACTOR_PROFESIONAL.md`
- `01_PROMPT_AGENTE_REFACTOR_PROFESIONAL.md`
- `02_PLAN_FORMULARIOS_ABIERTOS_Y_SELECTORES_CUSTOM.md`
- `03_PLAN_DOCUMENT_LIBRARY_REUTILIZABLE.md`
- `04_PLAN_SLICES_4_FALLAS_CERMONT.md`
- `05_USO_OBLIGATORIO_SKILLS_MCP.md`
- `06_CHECKLIST_ACEPTACION_Y_RECHAZO.md`
- `07_PRUEBAS_FUNCIONALES_OBLIGATORIAS.md`
