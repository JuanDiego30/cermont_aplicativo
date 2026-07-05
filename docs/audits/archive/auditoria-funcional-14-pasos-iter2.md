# Auditoría funcional — iteración 2 (lógica de negocio primero)

Fecha: 2026-05-20

## Resumen ejecutivo

La primera iteración dejó contratos de 14 pasos, workflow gate, ingestión documental y UI base. Esta iteración **completa brechas funcionales** sin tocar snapshots ni relajar gates.

## Auditoría funcional previa

### Packages

- [x] Contrato de 14 pasos existe y se exporta (`CERMONT_OPERATIONAL_STEPS`).
- [x] Contrato de blockers existe (`domain-blocker.schema.ts`).
- [x] Roles en español en pasos operativos.
- [x] Helpers nuevos: `evaluateClosureReadiness`, `resolveDocumentIngestPurpose`.
- [x] `ClosureReport` incluye `canCloseAdministratively` y `missingClosureKinds`.

### Backend

- [x] Ingestión distingue biblioteca / plantilla / evidencia de cierre vía `mode` + `purpose`.
- [x] `convert_to_template` crea `TemplateDraft` persistido (no `draftId` sintético).
- [x] Cierre administrativo enruta evidencias 8–14 (`closing-evidence-routing.service.ts`).
- [x] Workflow gate bloquea por documentos, evidencias, firmas, SES, factura y pago.
- [x] Reporte de cierre calcula si puede cerrarse definitivamente.

### Frontend

- [x] Caso de servicio muestra 14 pasos y requisitos.
- [x] Panel de requisitos lista **bloqueadores activos** (corregido).
- [x] DocumentUploader: modos biblioteca / formulario / cierre + arrastrar y soltar.
- [x] TemplateDraftReviewer: selector de paso operativo CERMONT.
- [x] Enlace directo a subida de documentos desde el caso.

### Tests funcionales (nuevos)

- [x] `closure-readiness.test.ts`
- [x] `document-ingestion-mode.test.ts`
- [x] `closing-evidence-routing.test.ts`
- [x] `cermont-operational-step.schema.test.ts` (existente)

### Contracts snapshot

- [x] Actualizado con migración `009-closure-readiness-administrative-block` (non-breaking).

## Cambios implementados en iteración 2

| Área | Cambio |
|------|--------|
| shared-types/workflow | Fuente única para readiness de cierre e ingestión |
| order-closure | Expone bloqueo de cierre administrativo |
| document-ingestion | `mode` tiene prioridad sobre `purpose` |
| StepRequirementPanel | Lista blockers; distingue requisito bloqueante |
| OperationalStepProgress | Tooltip con mensajes de bloqueo |
| TemplateDraftReviewer | Asociación editable a paso CERMONT |

## Gates (validación final — 2026-05-20)

| Gate | Resultado |
|------|-----------|
| typecheck | PASS |
| build | PASS (frontend: limpiar `.next` si ENOENT intermitente) |
| test | PASS (~338 tests monorepo) |
| lint | PASS (exit 0; **~80 warnings** `noExplicitAny` en deuda previa: `Resource`, `Kit`, `Tool`, etc.) |
| verify | PASS (`typecheck && lint && build`) |
| react-doctor (frontend) | **90/100** — 43 observaciones estilo/arquitectura (`failOn: none` en config) |

## Pendientes reales (no ocultos)

1. Pruebas de integración E2E del workflow gate con MongoDB (resolvers por artefacto real).
2. Fase 5 del plan: alineación documentación `docs/00–22` y libro (no cubierta en este slice).
3. Deuda lint `noExplicitAny` en modelos legacy (`Resource`, `Kit`, `Tool`, `resource.controller.ts`) — parcialmente reducida en `EvidenceCollection` / `evidence-collection.service`.
4. react-doctor 90→100: mayoría observaciones globales (componentes grandes, hidratación, diseño), no bloqueantes de negocio.
