# PLAN DE REFACTORIZACIÓN Y CONTROL DE AVANCE - PROGRESO

## Objetivo
Refactorizar la app web sin eliminar funcionalidad, mejorando calidad, mantenibilidad, seguridad, cohesión, mobile-first y SSOT.

## Reglas
- No borrar lo ya implementado.
- Mejorar antes que reinventar.
- SOLID, DRY, KISS, YAGNI.
- Composición > herencia.
- Código en inglés.
- Seguridad por diseño.
- VPS/Docker/CI sin romper.

## Referencias base
- `docs/PLAN-REMEDIACION-AUDITORIA-2026-04-13.md`
- `docs/PLAN-REMEDIACION-2026-04-05.md`
- `docs/AUDIT-07-Plan-Remediacion.md`
- `docs/EXECUTION-MAP-CERMONT.md`
- `docs/Intrucciones_para_crear_app_web/DOC-11 — Plan de Ejecución y Reglas del Agente Programador.md`
- `docs/Intrucciones_para_crear_app_web/DOC-21 — Guía de Buenas Prácticas Aplicadas y Madurez Documental.md`

## Estado de avance

### Fase 1 — Primitivas compartidas y SSOT frontend
- [x] `BadgePill` compartido
- [x] `StatusBadge` refactorizado a primitive común
- [x] `PriorityBadge` refactorizado a primitive común
- [x] wrappers legacy de badges conservados

### Fase 2 — Formularios de usuarios
- [x] `UserForm` unificado para creación/edición
- [x] `UserFormFields` refactorizado con `FormField`, `TextField`, `Select`, `Checkbox`
- [x] páginas de alta/edición simplificadas

### Fase 3 — Formularios de órdenes y costos
- [x] `FormField` mejorado para labels/accessibility
- [x] `CreateOrderForm` refactorizado a primitives compartidas
- [x] `EditOrderForm` refactorizado a primitives compartidas
- [x] `CostForm` refactorizado a primitives compartidas
- [x] reducción de estilos duplicados por campo

### Fase 4 — Tablas y listados
- [x] `order-helpers.ts` creado para fechas/iniciales/labels
- [x] `OrdersTable` refactorizado para usar helpers compartidos
- [x] `RecentOrdersTable` refactorizado para usar helpers compartidos

### Fase 5 — Verificación
- [x] `npm run lint -w frontend` sobre slices tocados
- [x] `npm run typecheck -w frontend`

## Pendiente
- [ ] Auditoría final de frontend para encontrar últimos duplicados
- [ ] Refactor backend por slices seguros
- [ ] Revisión de seguridad/RBAC/uploads
- [ ] Revisión final CI/CD y Docker

## Notas
- No se modificó la funcionalidad visible.
- Se priorizaron cambios de bajo riesgo y alto impacto.
- Los helpers y primitives quedaron listos para reutilización futura.