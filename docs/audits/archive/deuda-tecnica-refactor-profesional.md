# Deuda Técnica — Refactor Profesional CERMONT

**Fecha**: 2026-05-22
**Relacionado con**: docs/audits/legacy-audit-refactor-profesional.md

## Deuda P1: any[] en Kit/Tool/Resource

**Estado**: DOCUMENTADO - NO CORREGIDO

**Problema**: Los modelos Mongoose usan `Record<string, unknown>[]` (equivalente a `any[]`) para arrays de objetos complejos (items, documents, forms, evidenceRequirements, rules, certifications).

**Causa raíz**: Incompatibilidad de tipos entre Zod (string datetime) y Mongoose (Date). Los schemas Zod definen `uploadedAt: z.string().datetime()` pero Mongoose espera `Date`.

**Archivos afectados**:
- `backend/src/models/Kit.ts` - líneas 111-115
- `backend/src/models/Tool.ts` - líneas 44-46
- `backend/src/models/Resource.ts` - líneas 44-46
- `backend/src/services/kit.service.ts` - líneas 18-22, 30-34
- `backend/src/services/tool.service.ts` - líneas 21-23, 35-37
- `backend/src/controllers/resource.controller.ts` - líneas 38-40

**Solución requerida**:
1. Crear transformadores de tipos entre Zod y Mongoose (string datetime ↔ Date)
2. Usar tipos Zod inferidos en interfaces DTO
3. Aplicar transformadores en servicios antes de guardar en Mongoose
4. Aplicar transformadores inversos al leer de Mongoose

**Prioridad**: P1 - Alta (bloquea eliminación de `any`)

**Estimación**: 4-6 horas de desarrollo

## Deuda P1: new Map en 4 controllers

**Estado**: DOCUMENTADO - NO CORREGIDO

**Problema**: 4 controllers usan `new Map` para almacenamiento en memoria en lugar de MongoDB.

**Archivos afectados**:
- `backend/src/controllers/document-import.controller.ts` - línea 18
- `backend/src/controllers/document-template.controller.ts` - línea 16
- `backend/src/controllers/kit-document.controller.ts` - línea 15
- `backend/src/controllers/resource-document.controller.ts` - línea 14

**Solución requerida**:
1. Migrar lógica de Map a MongoDB (modelos ya existen: DocumentImportJob, DocumentTemplate, KitDocument, ToolDocument)
2. Reemplazar operaciones Map.get/set/has con operaciones Mongoose find/create/update
3. Eliminar dependencia de almacenamiento en memoria

**Prioridad**: P1 - Alta (bloquea arquitectura persistente)

**Estimación**: 6-8 horas de desarrollo

## Deuda P2: window.location en frontend

**Estado**: PENDIENTE

**Archivos afectados**:
- `frontend/src/app/(dashboard)/work-requests/[id]/page.tsx` - línea 86
- `frontend/src/app/(dashboard)/execution/page.tsx` - línea 190
- `frontend/src/app/(dashboard)/execution/[id]/page.tsx` - línea 98

**Solución**: Reemplazar `window.location.reload()` con `router.refresh()` y `window.location.assign()` con `router.push()`

**Prioridad**: P2 - Media (mejora UX, no bloquea funcionalidad)

**Estimación**: 30 minutos

## Deuda P2: fetch en reports/queries.ts

**Estado**: DOCUMENTADO - EXCEPCIÓN JUSTIFICADA

**Archivo afectado**:
- `frontend/src/modules/reports/queries.ts` - línea 281

**Contexto**: El fetch se usa para descargar un PDF (blob), no JSON. apiClient está diseñado para JSON responses.

**Solución**: EXCEPCIÓN JUSTIFICADA - fetch es necesario para descargar blobs. apiClient no tiene soporte blob.

**Prioridad**: P2 - Baja (excepción justificada)

**Estimación**: N/A (no requiere acción)
