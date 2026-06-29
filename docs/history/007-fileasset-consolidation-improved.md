# Plan Mejorado: FileAsset Consolidation — MediaAsset Retirement

> **Versión mejorada de**: `PLAN_IMPLEMENTACION_CONTINUACION_SPEC_007_FILEASSET.md`
> **Decisión**: Retirar `MediaAsset` por duplicación arquitectónica con `FileAsset` SSOT. Migrar funcionalidad útil. No cerrar hasta que todos los gates pasen.
> **TL;DR**: 5 archivos MediaAsset a eliminar → migrar 8 campos útiles a FileAsset → desregistrar `/api/media` → arreglar 6 gates secuenciales → actualizar snapshot contractual solo después de verificar que no queda arquitectura duplicada.

---

## 1. Context — Estado Real del Código (Verificado)

### FileAsset — SSOT Actual
- **Schema**: `packages/shared-types/src/schemas/file-asset.schema.ts`
- **Model**: `backend/src/models/FileAsset.ts`
- **Backend module**: `backend/src/modules/files/` (service, controller, routes)
- **Frontend module**: `frontend/src/modules/files/` (api, hooks, ui)
- **Sub-schema**: `backend/src/models/sub-schemas/FileAssetRefSchema.ts`
- **Tests**: `packages/shared-types/tests/schemas/file-asset.schema.test.ts`, `frontend/tests/files/*`, `backend/tests/files/*`
- **Consumers**: 49 archivos referencian `FileAsset`, incluyendo todos los modelos de dominio (Vehicle, Tool, Evidence, Resource, TechnicalReport, DeliveryRecord)
- **Backend registration**: `{ prefix: "/api/files", router: filesRoutes }` en `backend/src/index.ts`

### MediaAsset — Módulo a Retirar
- **Schema**: `packages/shared-types/src/schemas/media-asset.schema.ts` — Extiende `FileAssetRefSchema`
- **Model**: `backend/src/modules/media/models/MediaAsset.ts`
- **Service**: `backend/src/modules/media/media.service.ts`
- **Controller**: `backend/src/modules/media/media.controller.ts`
- **Routes**: `backend/src/modules/media/media.routes.ts` — registra `/api/media/*`
- **Consumers**: 5 archivos (todos del propio módulo). No hay código frontend, hooks, tests, ni UI que consuma MediaAsset.
- **Backend registration**: `{ prefix: "/api/media", router: mediaRoutes }` en línea 233 de `backend/src/index.ts`

### Schema Comparison — ¿Qué migrar?

| Feature | FileAsset (actual) | MediaAsset (adicional) | ¿Migrar? |
|---------|--------------------|------------------------|----------|
| entityType/entityId | ✅ `FileAssetEntityType` + `string` | ✅ `ownerType/ownerId` (polimórfico más amplio) | ✅ Agregar ownerType/ownerId opcional |
| classification/category | ✅ `FileAssetCategory` (18 valores) | ✅ `MediaClassification` (9 fases) | ✅ Agregar classification opcional |
| lifecycleStatus | ❌ No existe | ✅ `active/deleted/archived/pending_sync/sync_failed` | ✅ Agregar a FileAsset |
| lifecycleStatus default | ❌ No existe | ✅ default: "active" | ✅ Agregar default |
| audit downloads | ❌ No existe | ✅ `downloadedBy[]` con userId + timestamp + IP | ✅ Agregar opcional |
| audit consents | ❌ No existe | ✅ `consentTimestamps[]` con userId + purpose | ✅ Agregar opcional |
| GPS location | ❌ No existe | ✅ `lat/lng/accuracy/capturedAt` | ✅ Agregar opcional |
| variants (thumbnails) | ✅ `thumbnailUrl` (simple) | ✅ `variants[]` con original/web/thumbnail | ✅ Agregar variante |
| deviceId / idempotencyKey | ❌ No existe | ✅ Para offline sync | ✅ Agregar opcional |
| serviceCaseId/workOrderId | ❌ No existe | ✅ Redundante con ownerType/ownerId | ❌ NO migrar (redundante) |
| executionSessionId | ❌ No existe | ✅ Redundante con ownerType/ownerId | ❌ NO migrar (redundante) |

### Estado de Gates (Línea Base)
```bash
npm run typecheck   # ? — se espera error por MediaAsset
npm run lint        # ? — se espera error
npm run test        # ? — puede fallar
npm run build       # ? — puede fallar
npm run contracts:check  # ? — snapshot puede incluir MediaAsset
npm run quality:strict   # ? — baseline puede tener MediaAsset
npm run verify      # ? — falla si alguno anterior falla
```

---

## 2. Work Objectives

### Core Objective
Eliminar la duplicación arquitectónica `MediaAsset`→`FileAsset`, migrando la funcionalidad útil al SSOT `FileAsset`, sin romper gates ni funcionalidad existente.

### Concrete Deliverables
1. **Diagnóstico completo**: inventario de cada archivo, import, ruta y test de `MediaAsset`
2. **FileAsset schema mejorado**: con `ownerType`, `ownerId`, `classification`, `lifecycleStatus`, `gpsLocation`, `audit`, `deviceId`, `idempotencyKey` (todos opcionales)
3. **FileAsset model Mongoose actualizado**: con nuevos campos e índices
4. **Módulo media/ eliminado**: 5 archivos borrados, `/api/media` desregistrado
5. **Gates reparados**: typecheck, lint, test, build, contracts:check, quality:strict, verify — todos PASS
6. **Snapshot contractual actualizado**: solo después de verificar que no queda arquitectura duplicada
7. **Evidencia de QA**: en `.sisyphus/evidence/`

### Definition of Done
- [ ] No existe `MediaAsset` en schemas, modelos, servicios, controllers ni routes
- [ ] No existe `/api/media` registrado en `backend/src/index.ts`
- [ ] `FileAssetRefSchema` incluye: `ownerType`, `ownerId`, `classification`, `lifecycleStatus`, `gpsLocation`, `audit`, `deviceId`, `idempotencyKey`
- [ ] `npm run typecheck` → exit 0
- [ ] `npm run lint` → exit 0 (sin nuevos issues)
- [ ] `npm run test` → exit 0 (sin tests rotos)
- [ ] `npm run build` → exit 0
- [ ] `npm run contracts:check` → PASS (snapshot actualizado solo después de verificación)
- [ ] `npm run quality:strict` → PASS (o delta documentado)
- [ ] `npm run verify` → exit 0
- [ ] 0 `any` introducidos
- [ ] No se eliminó funcionalidad útil sin migrar a FileAsset

### Must Have
- Inventario completo de MediaAsset antes de eliminar
- Cada campo migrado documentado con su propósito
- Gates ejecutados en orden estricto
- Snapshot actualizado solo como último paso

### Must NOT Have (Guardrails)
- NO eliminar archivos sin inventario previo
- NO migrar campos redundantes (serviceCaseId, workOrderId, executionSessionId)
- NO introducir `any`, `@ts-ignore`, `@ts-expect-error`
- NO romper contratos existentes de FileAsset
- NO actualizar snapshots antes de confirmar que no queda arquitectura duplicada
- NO hacer deploy
- NO modificar `package.json` sin aprobación
- NO tocar frontend `modules/media/` (no existe)

---

## 3. Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (vitest, 1091+ tests)
- **Automated tests**: YES (tests-after — migración, no TDD)
- **Framework**: vitest (backend + frontend)
- **Pre-commit gates**: `npm run typecheck && npm run lint && npm run test`

### Gate Execution Order (NON-NEGOTIABLE)
```text
1. npm run typecheck  → detectar errores por MediaAsset
2. npm run lint       → detectar lint errors
3. npm run test       → verificar tests pasan
4. npm run build      → verificar build completo
5. npm run contracts:check  → verificar snapshot (fallará si MediaAsset está en contrato)
6. npm run quality:strict   → verificar baseline
7. npm run verify     → verificar todo junto (typecheck + build)
```

### Snapshot Update Rule
```text
⚠️ NO actualizar snapshot de contracts:check hasta que:
  1. MediaAsset schema eliminado de shared-types
  2. /api/media desregistrado de index.ts
  3. typecheck + build PASS
  4. Confirmación MANUAL de que el contrato final NO conserva arquitectura duplicada
  → Solo entonces: npm run contracts:check -- --update-snapshot
```

### QA Policy
Cada TODO incluye 2+ escenarios de verificación ejecutables por agente con evidencia en `.sisyphus/evidence/task-N-scenario.txt`.

---

## 4. Execution Strategy

### Parallel Execution Waves

```
Wave 0 — Diagnosis + Inventory (1 task, fundacional):
├── T1: Inventario completo de MediaAsset + dependency map

Wave 1 — Schema Migration + Removal (3 tasks paralelos DESPUÉS de Wave 0):
├── T2: Migrar campos útiles a FileAssetRefSchema (shared-types)
├── T3: Actualizar FileAsset Mongoose model + FileAssetRef sub-schema
├── T4: Eliminar módulo media/ completo + desregistrar /api/media

Wave 2 — Gate Repair (5 tasks SECUENCIALES, orden estricto):
├── T5: typecheck — corregir errores
├── T6: lint — corregir errores
├── T7: test — corregir tests rotos
├── T8: build — corregir build
├── T9: contracts:check — actualizar snapshot (solo si T2-T4 completos + verificado)

Wave 3 — Gate Final + Quality (2 tasks):
├── T10: quality:strict + verify
└── T11: Reporte final + consolidación evidencia

Wave FINAL — Verificación:
├── F1-F4: 4 auditores paralelos (Compliance + Quality + QA + Scope)
```

### Dependency Matrix
- **T1**: blocks ALL others
- **T2, T3, T4**: dependen de T1, pueden correr en paralelo entre sí
- **T5**: depende de T2, T3, T4 (tener código corregido antes de typecheck)
- **T6**: depende de T5 (typecheck debe pasar primero)
- **T7**: depende de T5, T6
- **T8**: depende de T5, T6, T7
- **T9**: depende de T2, T3, T4, T5, T8 (verificación manual antes de snapshot)
- **T10**: depende de T9
- **T11**: depende de T10

### Agent Dispatch Summary
- **Wave 0**: 1× explore (diagnóstico)
- **Wave 1**: 2× quick (schema/model), 1× deep (eliminación módulo)
- **Wave 2**: 5× unspecified-high (gates secuenciales)
- **Wave 3**: 2× unspecified-high (quality + report)
- **Final**: 4× paralelos

---

## TODOs

### Wave 0 — Diagnosis + Inventory (Fundacional — 1 tarea)

- [ ] 1. **Inventario Completo de MediaAsset + Dependency Map**

  **What to do**:
  1. Buscar TODAS las ocurrencias de `MediaAsset` en el código:
     ```powershell
     Select-String -Path "packages/shared-types/src/schemas/media-asset.schema.ts" -Pattern "MediaAsset|MediaOwnerType|MediaClassification|MediaLifecycleStatus|MediaAssetRef|MediaVariant|MediaGpsLocation"
     Select-String -Path "backend/src/index.ts" -Pattern "mediaRoutes|/api/media"
     Get-ChildItem -Path "backend/src/modules/media" -Recurse
     ```
  2. Para cada archivo que referencia `MediaAsset`, documentar:
     - Ruta absoluta
     - Tipo (schema, model, service, controller, route, test, consumer)
     - Línea exacta del import/referencia
     - ¿Se elimina? ¿Se migra? ¿Se conserva?
  3. Crear archivo de inventario: `.sisyphus/evidence/task-1-mediaasset-inventory.md` con tabla:
     ```markdown
     | Archivo | Tipo | Import/Ref | Línea | Acción | Razón |
     |---------|------|------------|-------|--------|-------|
     | packages/shared-types/src/schemas/media-asset.schema.ts | Schema Zod | MediaAssetRefSchema | 1-200 | ELIMINAR | Duplicado de FileAssetRefSchema |
     | backend/src/index.ts | Backend | mediaRoutes | 53 | ELIMINAR import | Desregistrar /api/media |
     | backend/src/index.ts | Backend | /api/media | 233 | ELIMINAR mount | Desregistrar /api/media |
     ```
  4. Verificar que NO existe frontend `modules/media/`:
     ```powershell
     Test-Path "frontend/src/modules/media"
     ```
  5. Verificar que NO hay tests que referencien MediaAsset:
     ```powershell
     Select-String -Path "." -Pattern "MediaAsset|media-asset" -Include "*.test.ts","*.test.tsx","*.spec.ts","*.spec.tsx" -Recurse
     ```
  6. Identificar qué campos de MediaAsset NO existen en FileAsset (ver tabla en sección 1 de este plan)
  7. Guardar todo en `.sisyphus/evidence/task-1-mediaasset-inventory.md`

  **Must NOT do**:
  - No eliminar nada todavía. Solo inventariar.
  - No modificar ningún archivo.
  - No saltarse ningún archivo que referencia MediaAsset.

  **Recommended Agent Profile**:
  - **Category**: `explore`
    - Reason: Búsqueda exhaustiva + clasificación sistemática
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (fundacional — blocks all others)
  - **Parallel Group**: Wave 0
  - **Blocks**: T2, T3, T4, T5
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `.sisyphus/evidence/task-1-mediaasset-inventory.md` creado
  - [ ] 5+ archivos de MediaAsset listados con línea exacta
  - [ ] Referencia en `backend/src/index.ts` documentada (líneas 53 y 233)
  - [ ] No frontend media module confirmado
  - [ ] No tests de MediaAsset confirmado
  - [ ] Tabla de campos a migrar vs ignorar completada

  **QA Scenarios**:
  ```text
  Scenario: Inventory file exists with all MediaAsset files
    Tool: Bash (PowerShell)
    Steps:
      1. Test-Path ".sisyphus/evidence/task-1-mediaasset-inventory.md"
      2. Select-String -Path ".sisyphus/evidence/task-1-mediaasset-inventory.md" -Pattern "media-asset.schema.ts|media.routes.ts|media.service.ts|media.controller.ts|MediaAsset.ts"
    Expected Result: All 5 MediaAsset files documented in inventory
    Evidence: .sisyphus/evidence/task-1-inventory-verified.txt

  Scenario: No frontend media module exists
    Tool: Bash (PowerShell)
    Steps:
      1. Test-Path "frontend/src/modules/media"
    Expected Result: Path does not exist (no frontend module to clean up)
    Evidence: .sisyphus/evidence/task-1-no-frontend-media.txt

  Scenario: No tests reference MediaAsset
    Tool: Bash (PowerShell)
    Steps:
      1. Select-String -Path "." -Pattern "MediaAsset" -Include "*.test.ts","*.test.tsx","*.spec.ts" -Recurse
    Expected Result: No matches (or false positives only in inventory doc)
    Evidence: .sisyphus/evidence/task-1-no-media-tests.txt

  Scenario: Fields-to-migrate table complete
    Tool: Bash (PowerShell)
    Steps:
      1. Select-String -Path ".sisyphus/evidence/task-1-mediaasset-inventory.md" -Pattern "ownerType|classification|lifecycleStatus|gpsLocation|audit|deviceId|idempotencyKey"
    Expected Result: Each field to migrate is documented
    Evidence: .sisyphus/evidence/task-1-migrate-fields.txt
  ```

  **Commit**: NO (evidencia, no código)
  - Nota: Este es el único commit que crea evidencia en `.sisyphus/`. Opcional agrupar con T2.

### Wave 1 — Schema Migration + MediaAsset Removal (3 tasks paralelos DESPUÉS de T1)

- [ ] 2. **Migrar Campos Útiles a FileAssetRefSchema (shared-types)**

  **What to do**:
  1. Leer `packages/shared-types/src/schemas/file-asset.schema.ts`
  2. Agregar los siguientes campos a `FileAssetRefSchema` (TODOS optional para backward compatibility):
     ```typescript
     // Polymorphic ownership (extends entityType/entityId)
     ownerType: FileAssetEntityType.optional(),
     ownerId: z.string().min(1).optional(),

     // Classification — evidence phase / document type
     classification: z.string().optional(),  // "before", "during", "after", etc.

     // Lifecycle status — soft delete support
     lifecycleStatus: z.string().default("active"),

     // GPS location — for field evidence
     gpsLocation: z.object({
       lat: z.number().min(-90).max(90),
       lng: z.number().min(-180).max(180),
       accuracy: z.number().positive().optional(),
       capturedAt: z.string().datetime().optional(),
     }).optional(),

     // Audit trail — download tracking
     downloadedBy: z.array(z.object({
       userId: z.string().min(1),
       downloadedAt: z.string().datetime(),
       ipAddress: z.string().optional(),
     })).optional(),

     // Consent tracking
     consentTimestamps: z.array(z.object({
       userId: z.string().min(1),
       consentedAt: z.string().datetime(),
       purpose: z.string().min(1),
     })).optional(),

     // Offline sync support
     deviceId: z.string().min(1).optional(),
     idempotencyKey: z.string().min(1).optional(),
     ```
  3. Mantener `entityType`/`entityId` para backward compatibility
  4. Mantener `FileAssetCategory` como el enum SSOT de categorías
  5. NO agregar: `serviceCaseId`, `workOrderId`, `executionSessionId` (redundantes)
  6. NO agregar: `variants[]` (separar para future PR — `thumbnailUrl` ya cubre lo básico)
  7. NO agregar: `MediaOwnerType`, `MediaClassification`, `MediaLifecycleStatus` como enums separados (usar los existentes de FileAsset)
  8. Ejecutar: `npm run typecheck -w @cermont/shared-types`

  **Must NOT do**:
  - No eliminar campos existentes de FileAssetRefSchema (entityType, entityId, etc.)
  - No introducir `any`
  - No cambiar campos requeridos a opcionales
  - No crear enums duplicados (MediaOwnerType, MediaClassification)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`zod`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T3 — shared-types no depende de Mongoose)
  - **Parallel Group**: Wave 1A
  - **Blocks**: T5 (typecheck fixes)
  - **Blocked By**: T1

  **References**:
  - `packages/shared-types/src/schemas/file-asset.schema.ts` — Archivo a modificar
  - `packages/shared-types/src/schemas/media-asset.schema.ts` — Fuente de campos a migrar
  - `packages/shared-types/src/schemas/file-asset.schema.test.ts` — Tests existentes

  **Acceptance Criteria**:
  - [ ] `FileAssetRefSchema` actualizado con nuevos campos opcionales
  - [ ] Exportaciones actualizadas desde `packages/shared-types/src/index.ts` si es necesario
  - [ ] `npm run typecheck -w @cermont/shared-types` → PASS
  - [ ] `npm run test -w @cermont/shared-types` → PASS (tests de file-asset siguen pasando)

  **QA Scenarios**:
  ```text
  Scenario: Shared-types builds
    Tool: Bash
    Steps:
      1. npm run build -w @cermont/shared-types 2>&1
    Expected Result: Exit 0, build completes without errors
    Evidence: .sisyphus/evidence/task-2-shared-types-build.txt

  Scenario: FileAssetRefSchema has new fields
    Tool: Bash
    Steps:
      1. Select-String -Path "packages/shared-types/src/schemas/file-asset.schema.ts" -Pattern "ownerType|lifecycleStatus|gpsLocation|idempotencyKey"
    Expected Result: All 4 new field groups present in schema
    Evidence: .sisyphus/evidence/task-2-new-fields.txt

  Scenario: Old fields preserved
    Tool: Bash
    Steps:
      1. Select-String -Path "packages/shared-types/src/schemas/file-asset.schema.ts" -Pattern "entityType|entityId|category|uploadedBy|storedName|storageKey"
    Expected Result: All original fields present
    Evidence: .sisyphus/evidence/task-2-old-fields.txt
  ```

  **Commit**: YES (groups with T3, T4)
  - Message: `feat(file-asset): migrate ownerType, lifecycleStatus, gpsLocation, audit, deviceId, idempotencyKey from MediaAsset`
  - Files: `packages/shared-types/src/schemas/file-asset.schema.ts`
  - Pre-commit: `npm run typecheck -w @cermont/shared-types && npm run test -w @cermont/shared-types`

- [ ] 3. **Actualizar FileAsset Mongoose Model + FileAssetRef Sub-schema**

  **What to do**:
  1. Leer `backend/src/models/FileAsset.ts` y `backend/src/models/sub-schemas/FileAssetRefSchema.ts`
  2. Agregar los mismos campos de T2 al modelo Mongoose:
     - `ownerType: { type: String }` (optional)
     - `ownerId: { type: String }` (optional)
     - `classification: { type: String }` (optional)
     - `lifecycleStatus: { type: String, enum: ["active", "deleted", "archived", "pending_sync", "sync_failed"], default: "active" }`
     - `gpsLocation: { lat: Number, lng: Number, accuracy: Number, capturedAt: Date }` (optional)
     - `downloadedBy: [{ userId: String, downloadedAt: Date, ipAddress: String }]` (optional)
     - `consentTimestamps: [{ userId: String, consentedAt: Date, purpose: String }]` (optional)
     - `deviceId: { type: String }` (optional)
     - `idempotencyKey: { type: String }` (optional)
  3. Agregar índices en `FileAsset.ts`:
     - `{ ownerType: 1, ownerId: 1 }` (para consultas por owner)
     - `{ lifecycleStatus: 1 }` (para filtrar activos)
     - `{ idempotencyKey: 1 }` con sparse (para prevenir duplicados)
  4. Actualizar `backend/src/models/sub-schemas/FileAssetRefSchema.ts` si replica los campos
  5. Ejecutar: `npm run typecheck -w backend`

  **Must NOT do**:
  - No modificar índices existentes en FileAsset
  - No cambiar tipos de campos existentes
  - No introducir `any`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`zod`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2 — modelo independiente de schema)
  - **Parallel Group**: Wave 1A
  - **Blocks**: T5
  - **Blocked By**: T1

  **References**:
  - `backend/src/models/FileAsset.ts` — Modelo a modificar
  - `backend/src/models/sub-schemas/FileAssetRefSchema.ts` — Sub-schema
  - `backend/src/modules/media/models/MediaAsset.ts` — Modelo de origen (índices, métodos)

  **Acceptance Criteria**:
  - [ ] FileAsset model actualizado con nuevos campos
  - [ ] Índices agregados (ownerType+ownerId, lifecycleStatus, idempotencyKey)
  - [ ] FileAssetRefSchema actualizado si replica campos
  - [ ] `npm run typecheck -w backend` → PASS

  **QA Scenarios**:
  ```text
  Scenario: Backend typecheck passes
    Tool: Bash
    Steps:
      1. npm run typecheck -w backend
    Expected Result: Exit 0
    Evidence: .sisyphus/evidence/task-3-backend-typecheck.txt

  Scenario: FileAsset model has lifecycleStatus
    Tool: Bash
    Steps:
      1. Select-String -Path "backend/src/models/FileAsset.ts" -Pattern "lifecycleStatus"
    Expected Result: lifecycleStatus field present with enum values
    Evidence: .sisyphus/evidence/task-3-lifecycle-status.txt

  Scenario: New indexes exist
    Tool: Bash
    Steps:
      1. Select-String -Path "backend/src/models/FileAsset.ts" -Pattern "index\(" | Select-Object -Last 5
    Expected Result: ownerType+ownerId index present
    Evidence: .sisyphus/evidence/task-3-indexes.txt
  ```

  **Commit**: YES (groups with T2, T4)
  - Message: `feat(file-asset): update Mongoose model with lifecycle, GPS, audit, and offline fields`
  - Files: `backend/src/models/FileAsset.ts`, `backend/src/models/sub-schemas/FileAssetRefSchema.ts`
  - Pre-commit: `npm run typecheck -w backend`

- [ ] 4. **Eliminar Módulo media/ + Desregistrar /api/media**

  **What to do**:
  1. Verificar inventario de T1 (NO eliminar sin confirmar)
  2. Eliminar archivos del módulo media:
     ```powershell
     Remove-Item -Path "backend/src/modules/media/media.routes.ts" -Force
     Remove-Item -Path "backend/src/modules/media/media.controller.ts" -Force
     Remove-Item -Path "backend/src/modules/media/media.service.ts" -Force
     Remove-Item -Path "backend/src/modules/media/models/MediaAsset.ts" -Force
     Remove-Item -Path "backend/src/modules/media" -Force  # directorio vacío
     ```
  3. Eliminar schema de shared-types:
     ```powershell
     Remove-Item -Path "packages/shared-types/src/schemas/media-asset.schema.ts" -Force
     ```
  4. Desregistrar de `backend/src/index.ts`:
     - Eliminar línea: `import mediaRoutes from "./modules/media/media.routes";` (línea 53)
     - Eliminar línea: `{ prefix: "/api/media", router: mediaRoutes },` (línea 233)
  5. Verificar que no quedan imports rotos:
     ```powershell
     Select-String -Path "." -Pattern "from.*media" -Recurse -Include "*.ts","*.tsx" | Where-Object { $_ -notmatch "node_modules" }
     ```
  6. Verificar que shared-types no exporta media-asset:
     - Revisar `packages/shared-types/src/index.ts` — quitar export si existe
  7. Ejecutar: `npm run typecheck -w @cermont/shared-types && npm run typecheck -w backend`

  **Must NOT do**:
  - No eliminar sin haber verificado el inventario de T1
  - No dejar imports huérfanos
  - No eliminar archivos que otros módulos aún consumen

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Eliminación quirúrgica con verificación de dependencias
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2, T3 — independiente)
  - **Parallel Group**: Wave 1A
  - **Blocks**: T5
  - **Blocked By**: T1

  **References**:
  - `.sisyphus/evidence/task-1-mediaasset-inventory.md` — Inventario
  - `backend/src/index.ts` — Líneas 53 y 233

  **Acceptance Criteria**:
  - [ ] `backend/src/modules/media/` no existe
  - [ ] `packages/shared-types/src/schemas/media-asset.schema.ts` no existe
  - [ ] `backend/src/index.ts` no importa ni monta `/api/media`
  - [ ] Sin imports rotos a `media` en ningún archivo
  - [ ] `npm run typecheck -w @cermont/shared-types` → PASS
  - [ ] `npm run typecheck -w backend` → PASS

  **QA Scenarios**:
  ```text
  Scenario: MediaAsset files deleted
    Tool: Bash
    Steps:
      1. Test-Path "backend/src/modules/media/media.routes.ts"
      2. Test-Path "packages/shared-types/src/schemas/media-asset.schema.ts"
    Expected Result: Both paths do NOT exist
    Evidence: .sisyphus/evidence/task-4-files-deleted.txt

  Scenario: /api/media not registered
    Tool: Bash
    Steps:
      1. Select-String -Path "backend/src/index.ts" -Pattern "/api/media"
    Expected Result: No matches
    Evidence: .sisyphus/evidence/task-4-no-media-route.txt

  Scenario: No orphan imports
    Tool: Bash
    Steps:
      1. Select-String -Path "backend/src" -Pattern "from.*media" -Include "*.ts" -Recurse
    Expected Result: No matches (after media module removal)
    Evidence: .sisyphus/evidence/task-4-no-orphan-imports.txt

  Scenario: Typecheck passes after removal
    Tool: Bash
    Steps:
      1. npm run typecheck -w @cermont/shared-types
      2. npm run typecheck -w backend
    Expected Result: Both exit 0
    Evidence: .sisyphus/evidence/task-4-typecheck-after-removal.txt
  ```

  **Commit**: YES (groups with T2, T3)
  - Message: `refactor(file-asset): remove MediaAsset module, unregister /api/media, migrate to FileAsset SSOT`
  - Files: Deleted `backend/src/modules/media/*`, deleted `packages/shared-types/src/schemas/media-asset.schema.ts`, modified `backend/src/index.ts`
  - Pre-commit: `npm run typecheck`

### Wave 2 — Gate Repair (5 tareas SECUENCIALES, orden estricto)

- [ ] 5. **typecheck — Corregir errores de TypeScript**

  **What to do**:
  1. Ejecutar: `npm run typecheck`
  2. Si falla, leer cada error y corregir:
     - Errores por imports a `media-asset` → eliminar o redirigir a `file-asset`
     - Errores por `MediaAssetRef` → reemplazar con `FileAssetRef`
     - Errores por campos que ahora son opcionales vs antes requeridos → ajustar tipos
     - Errores por `MediaOwnerType`, `MediaClassification` → usar `FileAssetEntityType` o `string`
  3. Iterar hasta que `npm run typecheck` → exit 0
  4. Capturar salida completa en evidencia

  **Must NOT do**:
  - No usar `any`, `@ts-ignore`, `@ts-expect-error`
  - No cambiar lógica de negocio para que el typecheck pase
  - No modificar tipos existentes de FileAsset (solo los nuevos campos)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`typescript-advanced-types`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (SECUENCIAL — primer gate)
  - **Parallel Group**: Wave 2A
  - **Blocks**: T6
  - **Blocked By**: T2, T3, T4 (necesita schemas migrados + módulo eliminado)

  **References**:
  - T2 — Schema compartido actualizado
  - T3 — Modelos actualizados
  - T4 — Módulo eliminado

  **Acceptance Criteria**:
  - [ ] `npm run typecheck` → exit 0
  - [ ] Sin errores en shared-types, backend, ni frontend
  - [ ] Sin uso de `any` para parchar errores

  **QA Scenarios**:
  ```text
  Scenario: Typecheck passes
    Tool: Bash
    Steps:
      1. npm run typecheck > .sisyphus/evidence/task-5-typecheck-output.txt 2>&1
      2. $LASTEXITCODE
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-5-typecheck-output.txt
  ```
  **Commit**: YES (groups errors fixes - may be 0 files if no fixes needed)
  - Message: `fix(typecheck): resolve MediaAsset→FileAsset type errors`
  - Pre-commit: `npm run typecheck`

- [ ] 6. **lint — Corregir errores de Biome/Linter**

  **What to do**:
  1. Ejecutar: `npm run lint`
  2. Si falla, leer cada error y corregir:
     - Imports no usados (de MediaAsset eliminado)
     - Variables no usadas
     - Otros lint errors introducidos por cambios en T2-T5
  3. Usar Biome auto-fix donde sea seguro: `npx biome check --write`
  4. Iterar hasta que `npm run lint` → exit 0
  5. Capturar salida en evidencia

  **Must NOT do**:
  - No deshabilitar reglas de lint
  - No introducir `any` para silenciar lint

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (SECUENCIAL — después de typecheck)
  - **Parallel Group**: Wave 2B
  - **Blocks**: T7
  - **Blocked By**: T5

  **Acceptance Criteria**:
  - [ ] `npm run lint` → exit 0
  - [ ] Sin nuevos warnings comparado con baseline

  **QA Scenarios**:
  ```text
  Scenario: Lint passes
    Tool: Bash
    Steps:
      1. npm run lint > .sisyphus/evidence/task-6-lint-output.txt 2>&1
      2. $LASTEXITCODE
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-6-lint-output.txt
  ```
  **Commit**: YES (may group with T5)
  - Message: `fix(lint): resolve post-MediaAsset-removal lint errors`
  - Pre-commit: `npm run lint`

- [ ] 7. **test — Corregir tests rotos**

  **What to do**:
  1. Ejecutar: `npm run test`
  2. Si falla, identificar tests rotos:
     - Tests de `media-asset.schema.test.ts` (si existe) → eliminar o migrar a file-asset
     - Tests que importan `MediaAssetRef` → actualizar a `FileAssetRef`
     - Tests de integración que usan `/api/media` → actualizar a `/api/files`
  3. NO TOCAR tests no relacionados
  4. Corregir tests rotos, NO eliminar cobertura
  5. Iterar hasta que `npm run test` → exit 0
  6. Capturar resultado en evidencia

  **Must NOT do**:
  - No eliminar tests sin reemplazo
  - No reducir cobertura existente
  - No modificar tests no relacionados

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (SECUENCIAL — después de typecheck + lint)
  - **Parallel Group**: Wave 2C
  - **Blocks**: T8
  - **Blocked By**: T5, T6

  **References**:
  - `packages/shared-types/tests/schemas/file-asset.schema.test.ts` — Tests existentes de FileAsset
  - `backend/tests/files/` — Tests de file upload
  - `frontend/tests/files/` — Tests frontend de files

  **Acceptance Criteria**:
  - [ ] `npm run test` → exit 0
  - [ ] Todos los tests existentes (1091+) siguen pasando
  - [ ] Tests nuevos si se agregó funcionalidad

  **QA Scenarios**:
  ```text
  Scenario: All tests pass
    Tool: Bash
    Steps:
      1. npm run test > .sisyphus/evidence/task-7-test-output.txt 2>&1
      2. Select-String -Path ".sisyphus/evidence/task-7-test-output.txt" -Pattern "Tests:.*passed"
    Expected Result: "Tests: N passed" with 0 failures
    Evidence: .sisyphus/evidence/task-7-test-output.txt
  ```
  **Commit**: YES
  - Message: `fix(tests): update broken tests after MediaAsset→FileAsset migration`
  - Pre-commit: `npm run test`

- [ ] 8. **build — Corregir errores de build**

  **What to do**:
  1. Ejecutar: `npm run build`
  2. Si falla, leer cada error:
     - shared-types build errors → corregir exports
     - backend build errors → corregir imports
     - frontend build errors → verificar que no hay referencias a MediaAsset
  3. Build en orden: shared-types → backend → frontend
  4. Capturar resultado en evidencia

  **Must NOT do**:
  - No deshabilitar pasos del build
  - No introducir workarounds que evadan errores reales

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (SECUENCIAL — después de tests)
  - **Parallel Group**: Wave 2D
  - **Blocks**: T9
  - **Blocked By**: T5, T6, T7

  **Acceptance Criteria**:
  - [ ] `npm run build` → exit 0
  - [ ] shared-types, backend, frontend builds pass

  **QA Scenarios**:
  ```text
  Scenario: Build passes
    Tool: Bash
    Steps:
      1. npm run build > .sisyphus/evidence/task-8-build-output.txt 2>&1
      2. $LASTEXITCODE
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-8-build-output.txt
  ```
  **Commit**: YES (may group with T5-T7)
  - Message: `fix(build): resolve build errors after MediaAsset removal`
  - Pre-commit: `npm run build`

- [ ] 9. **contracts:check — Verificar y actualizar snapshot**

  **⚠️ IMPORTANTE**: Esta tarea TIENE una verificación MANUAL antes de actualizar el snapshot.

  **What to do**:
  1. Ejecutar: `npm run contracts:check`
  2. Si falla (por snapshot desactualizado), ANALIZAR el diff:
     ```bash
     cd packages/shared-types
     cat contracts/contract-migrations.json  # Ver migraciones
     ```
  3. **VERIFICAR MANUALMENTE** que el contrato final NO conserva arquitectura duplicada:
     - Confirmar que `MediaAsset` NO aparece en el snapshot
     - Confirmar que `FileAssetRefSchema` tiene los nuevos campos
     - Confirmar que no hay `/api/media` en la snapshot de rutas
  4. **SOLO SI** el contrato final es correcto y sin duplicación:
     ```bash
     npm run contracts:check -- --update-snapshot
     ```
  5. Si el contrato aún tiene duplicación → VOLVER a T2-T4
  6. Capturar diff del snapshot en evidencia

  **Must NOT do**:
  - NO actualizar snapshot sin verificar manualmente el contrato final
  - NO actualizar snapshot si aún existe `/api/media`
  - NO actualizar snapshot si `MediaAsset` sigue en el schema

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (SECUENCIAL — último gate antes de quality)
  - **Parallel Group**: Wave 2E
  - **Blocks**: T10
  - **Blocked By**: T2, T3, T4, T5, T8

  **References**:
  - `packages/shared-types/contracts/api-contract.snapshot.json` — Snapshot a actualizar
  - `packages/shared-types/contracts/contract-migrations.json` — Migraciones

  **Acceptance Criteria**:
  - [ ] `npm run contracts:check` → PASS (después de actualizar snapshot)
  - [ ] Snapshot actualizado refleja FileAsset como SSOT
  - [ ] Sin MediaAsset en el contrato final
  - [ ] Sin `/api/media` en el snapshot

  **QA Scenarios**:
  ```text
  Scenario: Contracts check passes
    Tool: Bash
    Steps:
      1. cd packages/shared-types
      2. npm run contracts:check 2>&1
    Expected Result: Contracts check PASS
    Evidence: .sisyphus/evidence/task-9-contracts-check.txt

  Scenario: No MediaAsset in snapshot
    Tool: Bash
    Steps:
      1. Select-String -Path "packages/shared-types/contracts/api-contract.snapshot.json" -Pattern "MediaAsset|media-asset|/api/media"
    Expected Result: No matches found
    Evidence: .sisyphus/evidence/task-9-no-media-in-snapshot.txt
  ```
  **Commit**: YES
  - Message: `chore(contracts): update snapshot after MediaAsset→FileAsset migration`
  - Files: `packages/shared-types/contracts/api-contract.snapshot.json`, `packages/shared-types/contracts/contract-migrations.json`
  - Pre-commit: `npm run contracts:check`

### Wave 3 — Gate Final + Quality (2 tareas secuenciales)

- [ ] 10. **quality:strict + verify — Gates finales**

  **What to do**:
  1. Ejecutar: `npm run quality:strict`
  2. Si falla:
     - Comparar baseline contra resultado actual
     - Documentar cualquier delta en `.sisyphus/evidence/task-10-quality-delta.md`
     - Si el delta es esperado (eliminación de MediaAsset redujo baseline), actualizar baseline
     - Si el delta es inesperado, diagnosticar y corregir
  3. Ejecutar: `npm run verify` (typecheck + build)
  4. Capturar ambos resultados en evidencia
  5. Ejecutar `npm run contracts:check` de nuevo para confirmar que el snapshot no se corrompió

  **Must NOT do**:
  - No deshabilitar quality:strict
  - No saltarse verify

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (SECUENCIAL — después de contracts)
  - **Parallel Group**: Wave 3
  - **Blocks**: T11
  - **Blocked By**: T9

  **Acceptance Criteria**:
  - [ ] `npm run quality:strict` → exit 0
  - [ ] `npm run verify` → exit 0
  - [ ] `npm run contracts:check` → PASS

  **QA Scenarios**:
  ```text
  Scenario: All quality gates pass
    Tool: Bash
    Steps:
      1. npm run quality:strict > .sisyphus/evidence/task-10-quality-output.txt 2>&1
      2. npm run verify > .sisyphus/evidence/task-10-verify-output.txt 2>&1
      3. $LASTEXITCODE
    Expected Result: Exit code 0 for both
    Evidence: .sisyphus/evidence/task-10-quality-output.txt
  ```
  **Commit**: YES (only if quality baseline updated)
  - Message: `chore(quality): update baseline after MediaAsset removal`
  - Pre-commit: `npm run quality:strict && npm run verify`

- [ ] 11. **Reporte Final + Consolidación de Evidencia**

  **What to do**:
  1. Crear `docs/product/FILEASSET_CONSOLIDATION_REPORT.md` con:
     ```markdown
     # FileAsset Consolidation Report — Spec 007

     ## Resumen
     | Tema | Resultado |
     |------|-----------|
     | MediaAsset retirado | Sí |
     | Archivos eliminados | 5 (schema, model, service, controller, routes) |
     | /api/media desregistrado | Sí |
     | Campos migrados a FileAsset | ownerType, ownerId, classification, lifecycleStatus, gpsLocation, audit (downloadedBy, consentTimestamps), deviceId, idempotencyKey |
     | Campos NO migrados | serviceCaseId, workOrderId, executionSessionId, variants (redundantes o futuros) |
     | Gates | typecheck ✅ lint ✅ test ✅ build ✅ contracts ✅ quality ✅ verify ✅ |
     | Riesgos abiertos | Lista |
     ```
  2. Consolidar toda evidencia en `.sisyphus/evidence/`
  3. Verificar que todos los escenarios QA están cubiertos
  4. Actualizar `docs/KNOWN_ISSUES.md` si aplica
  5. Actualizar `docs/architecture/REFACTOR_RISK_REGISTER.md` si aplica

  **Must NOT do**:
  - No afirmar éxito si algún gate falla
  - No inventar riesgos

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`writing`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (última tarea)
  - **Parallel Group**: Wave 3
  - **Blocks**: F1-F4
  - **Blocked By**: T10

  **Acceptance Criteria**:
  - [ ] `docs/product/FILEASSET_CONSOLIDATION_REPORT.md` creado
  - [ ] Todos los `.sisyphus/evidence/task-*` archivos existen
  - [ ] Reporte firmado con resultado de cada gate

  **QA Scenarios**:
  ```text
  Scenario: Report exists with gates status
    Tool: Bash
    Steps:
      1. Test-Path "docs/product/FILEASSET_CONSOLIDATION_REPORT.md"
      2. Select-String -Path "docs/product/FILEASSET_CONSOLIDATION_REPORT.md" -Pattern "typecheck.*✅"
    Expected Result: Report exists with passing gates
    Evidence: .sisyphus/evidence/task-11-report.txt

  Scenario: All evidence files exist
    Tool: Bash
    Steps:
      1. Get-ChildItem -Path ".sisyphus/evidence" -Filter "task-*" | Measure-Object
    Expected Result: At least 10 evidence files
    Evidence: .sisyphus/evidence/task-11-evidence-count.txt
  ```
  **Commit**: YES
  - Message: `docs(spec-007): add FileAsset consolidation report and QA evidence`
  - Files: `docs/product/FILEASSET_CONSOLIDATION_REPORT.md`, `.sisyphus/evidence/*`

---

## Final Verification Wave (MANDATORY — after ALL tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  - For each "Must Have": verify implementation exists
  - For each "Must NOT Have": search for forbidden patterns
  - Check evidence files in `.sisyphus/evidence/`
  - Verify: no MediaAsset, no /api/media, FileAsset has new fields, gates pass
  - Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  - `npm run typecheck` + `npm run lint` + `npm run test` + `npm run build`
  - Check for: `any`, `@ts-ignore`, empty catches, `console.log`, unused imports
  - Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N/N] | VERDICT`

- [ ] F3. **Real QA — Full Gate Suite** — `unspecified-high`
  - Execute ALL gates in order: typecheck → lint → test → build → contracts:check → quality:strict → verify
  - Save to `.sisyphus/evidence/final-qa/`
  - Output: `Gates [7/7 pass] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  - For each task: read "What to do" vs actual diff
  - Verify: MediaAsset removed, FileAsset extended, no scope creep
  - Check "Must NOT do" compliance
  - Output: `Tasks [11/11 compliant] | VERDICT`

---

## Commit Strategy

| Task(s) | Type | Message | Pre-commit Gate |
|---------|------|---------|-----------------|
| T1 | (evidence) | No commit — evidence only | — |
| T2, T3, T4 | feat/refactor | `feat(file-asset): migrate fields from MediaAsset, remove module, unregister /api/media` | `npm run typecheck` |
| T5 | fix | `fix(typecheck): resolve MediaAsset→FileAsset type errors` | `npm run typecheck` |
| T6 | fix | `fix(lint): resolve post-MediaAsset lint errors` | `npm run lint` |
| T7 | fix | `fix(tests): update broken tests after migration` | `npm run test` |
| T8 | fix | `fix(build): resolve build errors after removal` | `npm run build` |
| T9 | chore | `chore(contracts): update snapshot after MediaAsset→FileAsset migration` | `npm run contracts:check` |
| T10 | chore | `chore(quality): update baseline after MediaAsset removal` | `npm run quality:strict && npm run verify` |
| T11 | docs | `docs(spec-007): add FileAsset consolidation report` | — |
| F1-F4 | chore | `chore(spec-007): final verification — ALL GATES PASS` | `npm run verify` |

**Regla de squash**: Si T5-T8 requieren 0 cambios (no hay errores porque no hay dependencias rotas), squashear en un solo commit de verificación con message `chore(spec-007): verify no regressions after MediaAsset removal`.

---

## Success Criteria

### Verification Commands (en orden)
```bash
npm run typecheck           # Exit 0
npm run lint                # Exit 0
npm run test                # Exit 0
npm run build               # Exit 0
npm run contracts:check     # PASS
npm run quality:strict      # Exit 0 (baseline not worse)
npm run verify              # Exit 0
```

### Final Checklist
- [ ] No existe `MediaAsset` en schemas, modelos, servicios, controllers, routes
- [ ] No existe `/api/media` registrado en `backend/src/index.ts`
- [ ] `FileAssetRefSchema` incluye todos los campos migrados (ownerType, lifecycleStatus, gpsLocation, audit, deviceId, idempotencyKey)
- [ ] FileAsset Mongoose model actualizado con índices
- [ ] 5 archivos de MediaAsset eliminados
- [ ] typecheck ✅ lint ✅ test ✅ build ✅ contracts ✅ quality ✅ verify ✅
- [ ] Snapshot contractual actualizado (sin MediaAsset)
- [ ] Baseline de quality:strict no empeorado
- [ ] 0 `any` introducidos
- [ ] Toda evidencia capturada en `.sisyphus/evidence/`
- [ ] Reporte de consolidación creado en `docs/product/`
- [ ] Funcionalidad útil migrada (no eliminada)
- [ ] No se eliminaron tests existentes
- [ ] No se rompió RBAC
- [ ] No se hizo deploy
