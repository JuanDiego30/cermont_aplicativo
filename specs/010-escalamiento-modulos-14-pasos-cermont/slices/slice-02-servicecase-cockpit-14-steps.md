# Slice 02 — ServiceCase Cockpit 14 pasos

**Estado:** base física implementada; aceptación E2E pendiente.

## Evidencia

- `GET /api/service-cases/:id/cockpit` y alias workflow registrados.
- `service-case-workflow.schema.ts`, `service-case.service.ts` y `ServiceCaseWorkflowCockpit.tsx` existen.
- Páginas list/detail de ServiceCase existen.

## Brecha

Probar que el read model refleja fuentes reales, no oculta errores, respeta permisos y evita consultas N+1. Reconciliar nombres candidatos (`stepProgress`, `nextExpectedAction`) con el contrato existente antes de agregar campos.

## Aceptación

- 14 pasos en orden, estado y responsable.
- Próxima acción basada en datos/permisos.
- Bloqueos con códigos y origen.
- Requisitos de documentos/evidencia/checklists.
- Costos y cierre administrativo consistentes.
- Timeline auditado.
- Loading/error/empty/offline/forbidden.

## Tests

Caso completo, evidencia faltante, permiso denegado, agregado vacío, datos parciales históricos y presupuesto en riesgo.

