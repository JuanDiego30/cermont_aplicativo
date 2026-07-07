# PLAN: Spec 007 — Roadmap de Implementación Priorizado

## TL;DR

> **Quick Summary**: Basado en auditoría exhaustiva del repositorio CERMONT (1091 tests, 83 rutas, 55 módulos backend), el plan 003 está solo 27.5% completo. Este roadmap prioriza P0/P1/P2/P3 para cerrar las brechas identificadas: frontend faltante, tests, legal/privacy, navegación y calidad.
>
> **Deliverables**:
> - 6 tareas P0 (bloqueantes) — Semana 1-2
> - 7 tareas P1 (core incompleto) — Semana 3-4
> - 6 tareas P2 (profesionalización) — Semana 5-6
> - Tareas P3 (comercialización futura)
>
> **Estimated Effort**: XL (30+ tareas restantes del plan 003 + nuevas)
> **Parallel Execution**: YES — 5 waves
> **Critical Path**: P0 tasks → P1 core modules → P2 tests → P3 polish

---

## Context

### Hallazgos de la Auditoría

| Dimensión | Estado |
|-----------|--------|
| **typecheck** | ✅ PASS |
| **lint** | ✅ PASS |
| **tests** | ✅ 1091 pasando |
| **build** | ✅ 83 rutas |
| **contracts:check** | ✅ Snapshot 064 |
| **quality:strict** | ❌ **FAIL** (29 violaciones) |
| **Plan 003 tasks** | ⚠️ **11/40 (27.5%)** |
| **Wave 3 Frontend** | ❌ **0/12 tasks** |
| **Wave 4 Tests** | ❌ **0/7 tasks** |

### Lo que YA está implementado
- ✅ Backend sólido: 55 módulos, 65+ mounts de API
- ✅ Fleet photo endpoints (POST/GET /api/fleet/:id/photos)
- ✅ Evidence form + PDF backend endpoints
- ✅ Cost breakdown endpoints (GET /api/costs/order/:orderId/summary)
- ✅ ERP connector CRUD + health
- ✅ WebAuthn backend completo (services, models, routes)
- ✅ ConsentRecord model + privacy module backend
- ✅ Legal pages (privacy-policy, privacy-notice, terms)
- ✅ About page con metadata centralizada
- ✅ CameraCapture component reusable
- ✅ FileAsset system con AttachmentGallery, AttachmentList

### Lo que NO está implementado (brechas P0/P1)
- ❌ Frontend evidence form + PDF download
- ❌ Fleet photo gallery + camera integración
- ❌ Asset/tool photo/document endpoints
- ❌ Consent gate en layout
- ❌ Privacy requests frontend
- ❌ WebAuthn login/profile UI
- ❌ Cost panel + execution form en order detail
- ❌ Maintenance schedule CRUD + frontend
- ❌ Notifications eventos reales
- ❌ Dashboard KPIs accionables
- ❌ ERP connector admin UI
- ❌ SLA indicator component
- ❌ Tests para los 5 vertical slices
- ❌ quality:strict violations (29)

---

## Work Objectives

### Core Objective
Cerrar las brechas de implementación identificadas en la auditoría Spec 007, priorizando P0 bloqueantes → P1 core → P2 profesionalización → P3 futuro.

### Concrete Deliverables
1. quality:strict baseline restaurado (29 violaciones corregidas)
2. Evidence form + PDF frontend funcional
3. Fleet photo gallery + camera integración
4. Asset/tool photo/document sistema completo
5. Consent gate + privacy requests frontend
6. WebAuthn UI (login + profile)
7. Maintenance module: schedule CRUD + frontend
8. Dashboard KPIs accionables con alertas
9. Tests E2E + integración para módulos core

### Must Have
- Corregir quality:strict antes de cualquier merge
- Completar frontend de evidence form y fleet photos (P0)
- Consent gate en layout (P0 legal)
- WebAuthn login funcional (P1)
- Tests que validen cambios

### Must NOT Have
- No introducir `any`/`unknown`/`null`/`undefined`
- No romper RBAC ni API envelope
- No eliminar funcionalidad existente
- No mock data en producción
- No implementar sin tests

---

## Execution Strategy

### Wave 1 — P0 Bloqueantes (Semana 1)
```
├── T1: Corregir 29 quality:strict violations
├── T2: Evidence form frontend + PDF download
├── T3: Fleet photo gallery + camera integration
├── T4: Asset/tool photo/document endpoints + frontend
└── T5: Consent gate en layout
```

### Wave 2 — P1 Core (Semana 2-3)
```
├── T6: Privacy requests frontend
├── T7: WebAuthn UI (login + profile)
├── T8: Cost panel + execution form
├── T9: Maintenance schedule CRUD + frontend
└── T10: Dashboard KPIs accionables
```

### Wave 3 — P1 Core cont. (Semana 3-4)
```
├── T11: Notifications eventos reales + unread count
├── T12: Checklist blocking items + required photo
├── T13: ERP connector admin UI
├── T14: SLA indicator component
└── T15: Integration tests for P0/P1 modules
```

### Wave 4 — P2 Profesionalización (Semana 5-6)
```
├── T16: E2E tests (fleet, evidences, costs, maintenance)
├── T17: Readiness alerts UI
├── T18: Offline evidence queue
├── T19: Cost ERP-style charts
├── T20: Notifications push
└── T21: Full verify + quality:strict baseline update
```

### Wave FINAL
```
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review
├── F3: Real manual QA
└── F4: Scope fidelity check
```

---

## TODOs — P0 (6 tasks, Semana 1)

- [ ] 1. **Corregir 29 violaciones quality:strict**

  **What to do**:
  - Por cada violación en `quality:strict`:
    - `ai.routes.ts:16` → Agregar `authorize`
    - `analytics.routes.ts:38,53` → Agregar `validateBody`
    - `auth.routes.ts:46,51` → Agregar `validateBody` (login/register ya son públicos, necesitan validación)
    - `auth.routes.ts:57-103` → Agregar `authorize` donde corresponda
    - `document-import.routes.ts:13,23` → Agregar `validateBody`
    - `document-template.routes.ts:13` → Agregar `validateBody`
    - `erp-connector.routes.ts:67` → Agregar `validateBody`
    - `form-submission.routes.ts:13,46` → Agregar `validateBody`
    - `maintenance.routes.ts:79` → Agregar `validateBody`
    - `notifications.routes.ts:38` → Agregar `validateBody`
    - `resource.routes.ts:109,111` → Agregar `validateBody` + `authorize`
    - `template-response.routes.ts:19` → Agregar `validateBody`
    - `work-requests.routes.ts:60,73` → Agregar `authorize`
  - Actualizar baseline después de correcciones: `npm run quality:strict`
  - Archivos: Múltiples archivos .routes.ts en backend/src/modules/

  **Acceptance Criteria**:
  - [ ] `npm run quality:strict` → PASS
  - [ ] `npm run typecheck` → PASS
  - [ ] `npm run test` → PASS

  **Commit**: YES — `fix(quality): add missing validation and authorization to 13 route files`

- [ ] 2. **Evidence form frontend + PDF download**

  **What to do**:
  - Crear `EvidenceForm` component en `frontend/src/modules/evidences/ui/`
  - Campos: title (required), description, category, photos (CameraCapture), GPS
  - On submit: llama `POST /api/evidences/form`
  - Añadir "Generar PDF" button en evidence detail
  - On click: llama `POST /api/evidences/:id/pdf`
  - Show download link after generation
  - Loading/error/empty states

  **Archivos**:
  - `frontend/src/modules/evidences/ui/EvidenceForm.tsx`
  - `frontend/src/app/(dashboard)/evidences/[id]/page.tsx` (update)
  - `frontend/src/modules/evidences/hooks/` (add/update)

  **Acceptance Criteria**:
  - [ ] Form renders, validates, submits
  - [ ] PDF generates and downloads
  - [ ] Loading/error states work

  **Commit**: YES (with T3)

- [ ] 3. **Fleet photo gallery + camera integration**

  **What to do**:
  - Crear `FleetPhotoGallery` component
  - Usar `CameraCapture` (ya existe en files module)
  - Category filter tabs (Frontal, Trasera, Lateral, etc.)
  - Upload progresivo con `POST /api/fleet/:id/photos`
  - Refrescar galería después de upload
  - Fallback a file upload si cámara no disponible

  **Archivos**:
  - `frontend/src/modules/fleet/ui/FleetPhotoGallery.tsx`
  - `frontend/src/app/(dashboard)/fleet/[id]/page.tsx` (update)

  **Acceptance Criteria**:
  - [ ] Gallery renders with category filters
  - [ ] Camera capture + upload works
  - [ ] Empty state "No hay fotos"

  **Commit**: YES (with T2)

- [ ] 4. **Asset/tool photo/document endpoints + frontend**

  **What to do**:
  - Agregar a `backend/src/modules/asset/asset.routes.ts`:
    - `POST /api/assets/:id/photos`
    - `POST /api/assets/:id/documents`
    - `GET /api/assets/:id/attachments`
  - Replicar VehiclePhotoUploadSchema pattern para assets
  - Crear `AssetPhotoSection` y `AssetDocumentSection` frontend
  - Integrar en `/assets/[id]/page.tsx`

  **Acceptance Criteria**:
  - [ ] Asset photo upload returns 201
  - [ ] Asset document upload returns 201
  - [ ] Frontend gallery renders
  - [ ] Tests pass

  **Commit**: YES — `feat(assets): add photo and document upload endpoints + UI`

- [ ] 5. **Consent gate en layout**

  **What to do**:
  - En `frontend/src/app/(dashboard)/layout.tsx`:
    - Verificar si usuario tiene consentimiento vigente
    - Si no: mostrar modal/gate de consentimiento
    - No bloquear logout ni rutas públicas
    - Registrar aceptación vía `POST /api/privacy/consents`
    - Mostrar enlaces a política
  - No marcar como aceptado automáticamente

  **Acceptance Criteria**:
  - [ ] Gate se muestra si no hay consentimiento
  - [ ] Aceptación queda registrada
  - [ ] Logout no bloqueado
  - [ ] Rechazo no bloquea pero limita acciones

  **Commit**: YES — `feat(privacy): add consent gate in dashboard layout`

## TODOs — P1 (7 tasks, Semana 2-3)

- [ ] 6. Privacy requests frontend
- [ ] 7. WebAuthn UI (login + profile)
- [ ] 8. Cost panel + execution form in order detail
- [ ] 9. Maintenance schedule CRUD + frontend
- [ ] 10. Dashboard KPIs accionables with alerts
- [ ] 11. Notifications real events + unread count
- [ ] 12. Checklist blocking items + required photo

## TODOs — P2 (6 tasks, Semana 4-5)

- [ ] 13. ERP connector admin UI
- [ ] 14. SLA indicator component
- [ ] 15. Integration + E2E tests for P0/P1 modules
- [ ] 16. Readiness alerts UI
- [ ] 17. Offline evidence queue improvements
- [ ] 18. Full verify + quality:strict baseline update

---

## Verification Strategy

### Gates obligatorios después de cada wave
```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run contracts:check
npm run quality:strict
```

### QA Policy
- Frontend/UI: Playwright para navegación e interacción
- API/Backend: curl para endpoints
- Cada tarea debe tener evidencia en `.sisyphus/evidence/`

---

## Commit Strategy

- **Wave 1**: Commit por módulo (5 commits)
- **Wave 2**: Commit por módulo (5 commits)
- **Wave 3**: Commit por módulo (4 commits)
- **Wave 4**: `test: add E2E + integration tests`
- **Wave FINAL**: `docs: update implementation status`

Pre-commit por grupo:
```bash
npm run typecheck && npm run lint && npm run test && npm run build && npm run contracts:check
```

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck        # → PASS
npm run lint             # → PASS
npm run test             # → PASS (1091+ tests)
npm run build            # → PASS
npm run contracts:check  # → PASS
npm run quality:strict   # → PASS
```

### Final Checklist
- [ ] quality:strict baseline restaurado
- [ ] Evidence form + PDF funcional
- [ ] Fleet photos + gallery funcional
- [ ] Asset/tool photos funcional
- [ ] Consent gate activo
- [ ] WebAuthn login funcional
- [ ] Cost panel en order detail
- [ ] Maintenance schedule funcional
- [ ] Privacy requests funcional
- [ ] Dashboard KPIs accionables
- [ ] Notificaciones con eventos reales
- [ ] Tests para módulos core
- [ ] All Must Have present
- [ ] All Must NOT Have absent
