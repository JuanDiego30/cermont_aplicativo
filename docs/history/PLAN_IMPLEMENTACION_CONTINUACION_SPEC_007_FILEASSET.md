# PLAN DE IMPLEMENTACIÓN — Continuación Spec 007: Consolidación FileAsset

## Decisión técnica
Sí, se autoriza retirar o aislar el módulo concurrente `MediaAsset` porque contradice la fuente única de verdad actual basada en `FileAsset`, introduce errores de calidad y bloquea los gates. La continuación debe hacerse exclusivamente sobre `FileAsset` como SSOT para fotos, documentos, evidencias y adjuntos.

## Objetivo
Desbloquear el repositorio y continuar la implementación profesional de archivos, fotos, documentos, flota, herramientas y evidencias sin duplicar arquitectura.

Objetivos:
1. retirar o poner en cuarentena `/api/media` y el módulo `MediaAsset`;
2. consolidar `FileAsset` como motor único de archivos;
3. corregir typecheck, lint, contracts, tests, build, verify y quality strict;
4. actualizar snapshots contractuales solo después de eliminar la arquitectura conflictiva;
5. completar el slice de fotos vehiculares ya iniciado;
6. extender el patrón a herramientas, documentos y evidencias;
7. mantener documentación viva y trazabilidad.

## Reglas obligatorias
- No eliminar funcionalidad útil sin migrarla a `FileAsset`.
- No dejar rutas huérfanas.
- No dejar imports rotos.
- No introducir `any`.
- No crear otro módulo de archivos paralelo.
- No actualizar snapshots antes de resolver el conflicto.
- No cerrar la fase si `verify` no pasa.
- No hacer deploy hasta que todos los gates estén en verde.

## Fase A — Protección y diagnóstico
Ejecutar:

```bash
git status --short
git diff --name-only
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

Crear o actualizar:

```txt
specs/007-codebase-memory-innovation-cermont/implementation-slices.md
specs/007-codebase-memory-innovation-cermont/final-report.md
docs/architecture/REFACTOR_RISK_REGISTER.md
docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
```

Registrar:

| Gate | Estado | Causa raíz | Acción |
|---|---|---|---|

## Fase B — Retirar o aislar MediaAsset

Buscar todo lo relacionado con `MediaAsset`:

```bash
rg "MediaAsset|mediaAsset|/api/media|modules/media|media\.route|media\.controller|media\.service" .
```

Clasificar:

| Archivo | Tipo | Se elimina | Se migra a FileAsset | Se conserva | Razón |
|---|---|---|---|---|---|

Acciones:
1. Desregistrar `/api/media` del backend.
2. Eliminar o aislar `backend/src/modules/media`.
3. Quitar imports de `MediaAsset`.
4. Migrar cualquier funcionalidad útil a `FileAsset`.
5. Confirmar que no quedan consumidores frontend de `/api/media`.
6. No actualizar snapshots todavía.

## Fase C — Consolidar FileAsset como SSOT

Confirmar o ajustar:

```txt
packages/shared-types/src/schemas/file-asset.schema.ts
backend/src/modules/file-assets/
backend/src/modules/files/
backend/src/modules/fleet/
frontend/src/modules/file-assets/
frontend/src/modules/fleet/
```

`FileAsset` debe soportar:

```txt
ownerType
ownerId
category
kind
mimeType
size
originalName
storageKey/storagePath
uploadedBy
uploadedAt
source
status
isPrimary
metadata
audit fields
```

Categorías mínimas:

```txt
vehicle_primary_photo
vehicle_front
vehicle_back
vehicle_left
vehicle_right
vehicle_plate
vehicle_odometer
vehicle_document
vehicle_soat
vehicle_technical_inspection
vehicle_insurance
tool_photo
tool_document
tool_manual
tool_certificate
tool_calibration
field_evidence
before_photo
during_photo
after_photo
hse_photo
checklist_photo
report_support
```

## Fase D — Reparar gates

Ejecutar en orden:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

Si falla `contracts:check` por snapshot:
1. revisar diff contractual;
2. confirmar que `/api/media` desapareció;
3. confirmar que `FileAsset` queda como contrato único;
4. actualizar snapshot solo si el contrato final es correcto;
5. repetir todos los gates.

## Fase E — Completar fotos vehiculares

Validar rutas reales o equivalentes:

```txt
POST /fleet/:vehicleId/photos
GET /fleet/:vehicleId/photos
PATCH /fleet/:vehicleId/photos/:fileAssetId/primary
DELETE /fleet/:vehicleId/photos/:fileAssetId
```

Criterios:
- foto primaria auditable;
- protección cross-vehicle;
- RBAC backend/frontend;
- estados loading/error/empty/forbidden;
- tests focalizados;
- sin `any`.

## Fase F — Extender patrón a herramientas

Implementar con `FileAsset`:

```txt
tool_photo
tool_document
tool_manual
tool_certificate
tool_calibration
```

UI mínima:

```txt
ToolPhotoGallery
ToolDocumentList
ToolChecklistPanel
ToolAssignmentHistory
CertificateExpiryAlert
```

Tests:
- subir foto herramienta;
- subir PDF herramienta;
- bloquear por certificado vencido;
- RBAC denied;
- protección cross-tool.

## Fase G — Extender patrón a evidencias/documentos

Implementar con `FileAsset`:

```txt
field_evidence
before_photo
during_photo
after_photo
issue_photo
correction_photo
hse_photo
checklist_photo
report_support
```

Reglas:
- ownerType/ownerId obligatorio;
- fuente camera/gallery/upload;
- aprobación/rechazo;
- motivo de rechazo;
- auditoría de descarga;
- no eliminar evidencia usada en informe/acta.

## Fase H — Dashboard y notificaciones

Agregar KPIs:
- vehículos sin foto principal;
- vehículos con documentos vencidos;
- herramientas con certificados vencidos;
- evidencias pendientes de revisión;
- documentos rechazados.

Agregar notificaciones:
- vehicle_document_expiring;
- tool_certificate_expiring;
- evidence_rejected;
- file_downloaded_sensitive.

## Fase I — Reporte final

Crear:

```txt
docs/product/FILEASSET_CONSOLIDATION_REPORT.md
specs/007-codebase-memory-innovation-cermont/final-report.md
```

Debe incluir:

| Tema | Resultado |
|---|---|
| MediaAsset retirado | Sí/No |
| FileAsset SSOT | Sí/No |
| Gates | Resultado |
| Tests nuevos | Lista |
| Rutas eliminadas | Lista |
| Rutas finales | Lista |
| Riesgos abiertos | Lista |
| Próximo slice | Recomendación |

## Definition of Done
La fase solo se cierra si:
1. `MediaAsset` ya no rompe gates.
2. No existe `/api/media` activo salvo alias documentado hacia `FileAsset`.
3. `FileAsset` es SSOT.
4. Typecheck pasa.
5. Lint pasa.
6. Tests pasan.
7. Build pasa.
8. Contracts guard pasa.
9. Quality strict no empeora.
10. Verify pasa.
11. Fotos vehiculares funcionan.
12. Tests de regresión existen.
13. Documentación viva actualizada.
14. No se introdujo `any`.
15. No se rompió RBAC.
16. No se hizo deploy.

## Mensaje de autorización para el agente

Sí, autorizo retirar o aislar el módulo concurrente `MediaAsset` porque contradice el SSOT `FileAsset` y bloquea los gates. Continúa exclusivamente sobre `FileAsset`. Antes de eliminar, lista todos los archivos, imports, rutas, consumidores y tests relacionados con `MediaAsset`; migra cualquier funcionalidad útil a `FileAsset`; elimina o desregistra `/api/media`; corrige typecheck, lint, tests, build, contracts, quality strict y verify; actualiza snapshots solo después de confirmar que el contrato final no conserva la arquitectura duplicada. No hagas deploy hasta que todos los gates pasen.
