# Spec 010 — Escalamiento profesional de módulos CERMONT 14 pasos

**Estado:** en ejecución; no cerrada  
**Rama verificada:** `implement/spec-010-modulos-14-pasos`  
**Fecha de corte:** 2026-06-30

## Objetivo

Madurar CERMONT como plataforma documental para contratistas multiservicio, articulando el flujo de 14 pasos con capacidades FSM, GMAO/CMMS, control financiero, operación PWA/offline y automatización auditable, sin crear rutas, contratos o módulos paralelos.

## Alcance funcional

1. Solicitud de trabajo.
2. Visita técnica.
3. Propuesta.
4. Orden de compra.
5. Planeación.
6. Ejecución.
7. Evidencia.
8. Informe técnico.
9. Acta de entrega.
10. Firma del cliente.
11. SES/Ariba.
12. Factura.
13. Aprobación de factura.
14. Pago y cierre administrativo.

Capacidades transversales: `FileAsset` como SSOT, ServiceCase Cockpit, RBAC, auditoría, idempotencia, offline/sync, flota, herramientas/activos, checklists bloqueantes, costos, dashboard, notificaciones, reglas de automatización, privacidad y portal.

## Fuentes y confiabilidad

| Fuente | Estado | Uso en esta spec |
|---|---|---|
| `LTG_JUAN_DIEGO_AREVALO-3_markdown(4).md` | Nombre solicitado no encontrado; fuente equivalente verificada como `C:\Users\camil\Downloads\LTG_JUAN_DIEGO_AREVALO-3_markdown.md` | Fuente académica utilizada; discrepancia de nombre registrada. |
| `REGLAS_DESARROLLO_CERMONT.md` | MISSING en raíz | Se usa la alternativa verificada `docs/REGLAS_DESARROLLO_CERMONT.md`. |
| `.specify/memory/constitution.md` | MISSING | Se aplican `AGENTS.md` y documentos canónicos; no se inventa constitución. |
| `docs/architecture/API_ROUTE_MAP.md` | MISSING | Se usa el canónico `docs/architecture/API_ENDPOINT_MATRIX.md`. |
| Documentación canónica de producto, dominio y arquitectura | VERIFIED | Fuente de verdad para alcance, estados y rutas. |
| `docs/architecture/CODEBASE_MAP.md` + inventario real 2026-06-30 | VERIFIED | Evidencia de presencia física; no prueba comportamiento runtime. |
| Specs 008 y 009 | VERIFIED | Baseline y deuda precedente. |
| Plan Maestro 2026 y Prompt Spec 010 | VERIFIED fuera del repo | Insumo de producto; cualquier afirmación se reconcilia con código y docs canónicos. |

## Requisitos funcionales

- **RF-01:** presentar un cockpit por ServiceCase con avance, próxima acción, bloqueos, requisitos documentales/evidencia, costos y cierre.
- **RF-02:** impedir transiciones cuando fallen prerrequisitos contractuales de pasos anteriores.
- **RF-03:** preservar `FileAsset` como única fuente genérica de archivos y asociar cada activo a propietario y propósito válidos.
- **RF-04:** ofrecer estados loading, error, empty, offline y forbidden en páginas críticas.
- **RF-05:** soportar operación offline en solicitud, visita, planeación, ejecución, evidencia y checklists, con mutaciones idempotentes.
- **RF-06:** mostrar readiness server-authoritative para planeación, personal, vehículos, herramientas, EPP y checklists.
- **RF-07:** controlar evidencia mediante FSM, revisión, rechazo motivado, reemplazo y bloqueo documental.
- **RF-08:** mantener trazabilidad entre informe, acta, firma, SES, factura, aprobación, pago y cierre.
- **RF-09:** comparar costos estimados y reales, margen y riesgo presupuestal sin cálculos contradictorios entre backend y UI.
- **RF-10:** publicar eventos auditables y ejecutar reglas SI-ENTONCES idempotentes, con acciones bloqueantes explícitas.
- **RF-11:** limitar IA a borradores/recomendaciones revisables; nunca ejecutar transiciones críticas de forma autónoma.
- **RF-12:** tratar multitenancy como diseño P3 hasta contar con aislamiento, migración y pruebas de autorización.

## Requisitos no funcionales

- Express 5.2.1, MongoDB/Mongoose, Next.js 16, React 19, Zod 4.x, TanStack Query, JWT y Zustand.
- TypeScript estricto; no introducir `any`, escapes con `unknown`, `@ts-ignore` ni valores de ausencia contrarios a `quality:strict`.
- Contrato primero: Zod → tipo → modelo → servicio → controlador → ruta → API frontend → query/hook → UI → tests → docs.
- RBAC desde `@cermont/domain`; backend y frontend deben aplicar la misma intención de acceso.
- Toda mutación crítica auditable e idempotente.
- Ningún deploy sin gates completos, backup, smoke tests, rollback y autorización.

## Fuera de alcance inmediato

- Reemplazar MongoDB, Express, JWT o el sistema de diseño.
- Crear `apps/`, duplicar módulos o restaurar APIs legacy de archivos.
- Activar multitenancy o IA autónoma antes de estabilizar P0/P1.
- Desplegar desde esta spec sin una autorización separada.

## Criterios de aceptación

1. La suite documental requerida existe y distingue hechos verificados, propuestas y bloqueos.
2. Cada slice implementado tiene contrato, backend, frontend, estados UI, RBAC, auditoría, tests y evidencia.
3. Los 14 pasos se pueden recorrer sin saltos no autorizados y el cierre valida requisitos pendientes.
4. `FileAsset` continúa como SSOT.
5. Todos los gates requeridos pasan sobre el delta final.
6. Los riesgos abiertos y el rollback quedan documentados.
7. La extracción del LTG permanece trazable por sección y cualquier diferencia con el código o la documentación canónica queda explícita.
