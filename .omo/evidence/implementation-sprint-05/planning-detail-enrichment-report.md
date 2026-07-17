# Planning Detail Enrichment — Implementation Report

## Estado
✅ COMPLETADO — La página de detalle de planeación fue enriquecida con secciones adicionales.

## Ruta
- `frontend/src/app/(dashboard)/planning/[id]/page.tsx`

## Secciones agregadas

### 1. AST/PTW Section (NUEVO)
- Componente: `frontend/src/modules/planning/ui/PlanningAstPtwSection.tsx`
- Muestra requisitos de AST (Análisis Seguro de Trabajo) y PTW (Permiso de Trabajo)
- Lista documentos de soporte adjuntos

### 2. Cost Baseline Section (NUEVO)
- Componente: `frontend/src/modules/planning/ui/PlanningCostBaselineSection.tsx`
- Muestra desglose de costos: mano de obra, materiales, equipos, contingencia, total
- Formato moneda COP
- Muestra fecha de congelamiento y responsable

### 3. Resources Summary (NUEVO)
- Componente: `frontend/src/modules/planning/ui/PlanningResourcesSummary.tsx`
- Muestra: materiales, herramientas, equipos, EPP/seguridad
- Contadores de trabajadores por rol

### 4. Signatures Section (NUEVO)
- Componente: `frontend/src/modules/planning/ui/PlanningSignaturesSection.tsx`
- Muestra responsables asignados con estado (firmado/asignado/pendiente)
- Roles: ingeniero_residente, tecnico_electricista, hes

### 5. Links a forms y ejecución
- Link a formularios asociados (`/forms?planningId=`)
- Link a inicio de ejecución cuando aprobado (`/execution/new?planningId=`)
- Estado deshabilitado si no aprobado

### 6. Edit mode control
- Botón "Editar/Ver resumen" cuando la planeación no está aprobada

## Tests agregados
- `frontend/tests/modules/planning/planning-detail-enrichment.test.tsx` — 14 tests:
  - AST/PTW: sin permisos, AST required, PTW required, documentos, ambos
  - Cost Baseline: empty state, desglose completo
  - Resources: empty, materials, worker count
  - Signatures: empty, responsibles, signed status
