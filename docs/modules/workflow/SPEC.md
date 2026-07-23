# SPEC: ServiceCase / WorkOrder Cockpit

**Estado:** `partial`  
**Prioridad:** P0 — Experiencia principal del producto

---

## Problema Empresarial

CERMONT opera como un conjunto de páginas aisladas (WorkRequests, SiteVisits, Proposals, Planning, Execution...), pero el usuario necesita una vista unificada donde cada caso u orden muestre: en qué paso está, qué falta, qué blockers existen, qué documentos están pendientes, quién es responsable y cuál es la siguiente acción.

## Resultado Esperado

Cada `ServiceCase` debe abrir una pantalla coherente que concentre:

- Identidad del servicio y cliente
- Progreso real de los 14 pasos (timeline visual)
- Paso actual con indicador de estado
- Próxima acción (botón o indicación clara)
- Bloqueadores (rojo si impiden avanzar)
- Responsable del paso actual
- Planeación y readiness (recursos, personal, EPP)
- Ejecución y evidencias
- Informe y acta
- SES, factura, pago y cierre
- Costos estimados vs reales
- Historial y auditoría

## Roles

| Rol | Acción |
|-----|--------|
| gerente | Ver todos los casos, intervenir cualquier paso |
| residente | Ver casos asignados, aprobar planeación |
| supervisor | Ver casos supervisados, gestionar ejecución |
| tecnico/operador | Ver casos asignados, ejecutar |
| administrativo | Ver casos, gestionar cierre administrativo |
| cliente | Ver casos propios (solo lectura) |

## Transiciones

Cada paso del flujo de 14 pasos debe validar:

| Condición | Descripción |
|-----------|-------------|
| Precondiciones | Todo lo requerido existe y está aprobado |
| Permisos | El usuario tiene rol para esta transición |
| Idempotencia | No avanzar dos veces el mismo paso |
| Auditoría | Registrar actor, timestamp, requestId |
| Blockers | Listar explícitamente qué impide avanzar |

## Estados UI del Cockpit

| Estado | Comportamiento |
|--------|---------------|
| Loading | Skeleton de timeline + cards |
| Error | Card con mensaje + retry |
| Empty | "No hay casos disponibles" + acción |
| Forbidden | "No tiene permiso para ver este caso" |
| Online/Offline | Indicador de estado de conexión |
| Con blockers | Timeline muestra paso en rojo con detalle |
| Todo listo | Timeline en verde, botón de siguiente acción |

## Pruebas E2E

- Navegar desde lista de casos a detalle de cockpit
- Ver timeline con todos los pasos
- Ver blockers cuando falta planeación
- Ver próxima acción habilitada/deshabilitada según rol
- Ejecutar transición desde el cockpit
- Verificar que la transición persiste al recargar

## Defectos Conocidos

1. Cockpit no muestra blockers calculados por backend
2. No hay indicación visual de readiness
3. La próxima acción no se muestra dinámicamente
4. Costos no integrados en la vista del caso
