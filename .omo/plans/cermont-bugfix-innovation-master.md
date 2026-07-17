# Plan Maestro — Bug Fixes + Innovación + Madurez — CERMONT S.A.S.

## TL;DR

> **Resumen**: Corregir 7 bugs críticos/medios/bajos encontrados en auditoría manual + Playwright, desbloquear flujo 14 pasos, implementar Portal Cliente para cerrar el ciclo comercial, agregar innovaciones (KPIs financieros, SLA automático, firma digital, DIAN, notificaciones email, IA informes, geolocalización).

> **Entregables**: 7 bugs → 0 bugs | Portal Cliente funcional | Flujo 14 pasos completable E2E | 8 innovaciones implementadas | 3000+ líneas de especificación.

> **Esfuerzo**: XL — 6 waves, ~32 tareas | **Ejecución**: Paralela (max 8 tareas por wave) | **Ruta crítica**: B1 → Portal Cliente → Flujo 14 pasos completo

---

## ⚠️ PROTOCOLO ANTI-ALUCINACIÓN — LECTURA OBLIGATORIA

### El Problema
Modelos ejecutores previos marcaron tareas como "already implemented" basándose en typecheck/lint/build, sin escribir código nuevo. Esto NO es implementación.

### Reglas de Hierro

**REGLA 1: PROHIBIDO decir "already implemented".**
- Cada archivo listado en "Files to modify" DEBE ser creado o modificado.
- Si el archivo existe pero su contenido no coincide con la especificación, DEBE reemplazarse.
- Violación = tarea FALLIDA, debe rehacerse.

**REGLA 2: Verificación de contenido, no de comandos.**
- No basta que `npm run typecheck` pase.
- Hay que grep-el contenido del archivo para verificar que el cambio ESPECÍFICO existe.
- Cada tarea tiene un "Grep verification" con el patrón exacto a buscar.
- Si grep no encuentra el patrón, la tarea NO se hizo.

**REGLA 3: Cada tarea produce código + commit.**
- `git add <archivos>` + `git commit -m "tipo(alcance): desc"`
- Si el commit está vacío, la tarea NO se hizo.

**REGLA 4: Cada tarea produce evidencia.**
- `git diff --stat` mostrando archivos modificados
- `grep -F "patrón" archivo.modificado` confirmando el cambio
- Si no hay evidencia, la tarea NO se hizo.

### Consecuencias
- 1ª infracción: tarea revertida y rehecha
- 2ª infracción: wave completa reiniciada
- 3ª infracción: plan abortado

---

## Contexto del Sistema

### Stack Tecnológico Real (descubierto en código)
- **Frontend**: Next.js 16.2.1 App Router + React 19.2.4 + TypeScript strict + Tailwind CSS 4.2.2 + TanStack Query 5.95.2 + Zustand 5.0.12 + react-hook-form 7.72.0 + Radix UI + Lucide React
- **Backend**: Express 5.2.1 (NO NestJS) + Mongoose 9.x + MongoDB 7.0 + Zod 4.3.6
- **Auth**: JWT + RBAC con helpers from `@cermont/domain`
- **Roles**: gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente
- **Monorepo**: npm workspaces (backend/ + frontend/ + packages/)
- **Host**: localhost:3000 (frontend) + localhost:4000 (backend API)

### Mapeo de Bugs a Archivos Reales (descubierto con grep + read)

```
BUG-001 [CRÍTICO] RBAC gerente no puede aprobar propuestas
  Archivo frontend: frontend/src/modules/proposals/ui/ProposalActions.tsx:96, 112
    → canPerformAction("approve_proposal") controla visibilidad botón
  Archivo backend: backend/src/modules/proposal/proposal.routes.ts:96-102
    → authorize(CERMONT_ROLES.CLIENTE, CERMONT_ROLES.GERENTE) YA está correcto
  Archivo permisos: packages/domain/src/permissions.ts o similar
    → Verificar si "approve_proposal" incluye "gerente"
  Causa raíz PROBABLE: permission config en @cermont/domain NO incluye gerente para approve_proposal

BUG-002 [MEDIA] Blocker action link redirige a /proposals/new en vez de proposal existente
  Archivo: frontend/src/modules/service-cases/components/WorkflowBlockerList.tsx:24-28
  Código: BLOCKER_ACTION_ROUTES = { Proposal: (scId) => `/proposals/new?serviceCaseId=${scId}` }
  Fix: Verificar si existe proposal con serviceCaseId → si existe, link a /proposals/[id]

BUG-003 [MEDIA] Mapa Dispatch centrado en Bogotá
  Archivo: frontend/src/app/(dashboard)/dispatch/page.tsx o componente mapa
  Coordenadas Arauca: lat 7.0867, lng -70.7592

BUG-004 [BAJA] ERP Connectors en inglés
  Archivo: frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx
  Textos: "No ERP Connectors", "Add Connector"

BUG-005 [MEDIA] SLA contadores inconsistentes
  Archivo backend: backend/src/modules/sla/sla.service.ts
  Método: getStats() — enRiesgo no es subconjunto de activos

BUG-006 [ALTA] Fleet vehículos sin documentos
  Archivo backend: backend/src/modules/fleet/fleet.service.ts
    → validarDocumentosVehiculo() YA existe (line 523)
    → hasExpiredDocuments() YA existe (line 76)
    → assignVehicle() YA rechaza si documentos vencidos (line 347)
  Problema REAL: Frontend muestra status "Activo" aunque documentos falten
  Fix: Agregar cálculo automático de status basado en documentos

BUG-007 [MEDIA] Múltiples propuestas mismo caso
  Archivo backend: backend/src/modules/proposal/proposal.service.ts
    → existePropuestaActiva() YA existe (line 103)
    → createProposal() YA valida unicidad (line 126-135)
  Problema REAL: La validación existe pero el frontend no muestra warning antes de crear
  Fix: Frontend debe consultar si existe propuesta activa antes de mostrar form
```

### Estado Actual del Sistema (julio 2026, verificado con Playwright)
- Clientes: 4 (Cenit, Chevron, Ecopetrol, TecniPetrol)
- Casos activos: 3 todos en Paso 3 (propuesta)
- Propuestas: 8 total | 4 enviadas | 0 aprobadas
- Órdenes: 1 (cancelada)
- Vehículos: 2 (ambos con documentos sin registrar)
- Personal: 6+
- Inventario: 1 item (Multímetro Fluke 87V)

---

## Work Objectives

### Core Objective
Corregir 7 bugs confirmados, implementar Portal Cliente para desbloquear flujo 14/14, agregar 8 innovaciones para madurar la plataforma.

### Must Have (con verificación grep forzada)
| ID | Descripción | Archivo grep | Patrón |
|----|------------|--------------|--------|
| B1 | RBAC approve gerente funcional | permissions.ts + ProposalActions.tsx | `gerente.*approve_proposal` |
| B2 | Blocker link dinámico | WorkflowBlockerList.tsx | `existingProposalId` |
| B3 | Mapa centrado Arauca | dispatch/page.tsx | `7.0867` |
| B4 | ERP español | erp-connectors/page.tsx | `Sin conectores` |
| B5 | SLA consistente | sla.service.ts | `enRiesgo <= activos` |
| B6 | Fleet status automático | fleet.service.ts | `calcularStatusPorDocumentos` |
| B7 | Propuesta única por caso | proposal.service.ts | `existePropuestaActiva` |
| Portal | Portal Cliente funcional | portal/layout.tsx | `export function PortalLayout` |
| Email | Notificaciones email | email.service.ts | `enviarEmailPropuesta` |
| KPIs | KPIs financieros | dashboard.service.ts | `conversionRate` |
| Firma | Firma digital | SignaturePad.tsx | `export function SignaturePad` |
| DIAN | Facturación electrónica | dian.service.ts | `export function emitirFacturaElectronica` |

### Must NOT Have
- NO cambiar stack (Express 5, Next.js 16, MongoDB, Zod)
- NO eliminar funcionalidad existente
- NO introducir `any` / `null` / `undefined`
- NO modificar package.json sin aprobación
- NO decir "already implemented"

---

## Execution Strategy

### Parallel Waves

```
Wave 1 — Bug Fixes BACKEND (5 tareas paralelas):
├── T1: B1 - RBAC: Fix permissions @cermont/domain + ProposalActions frontend
├── T2: B7 - Proposal uniqueness: Frontend warning antes de crear duplicado
├── T3: B6 - Fleet: Auto-cálculo status por documentos
├── T4: B5 - SLA: Consistencia contadores (enRiesgo <= activos)
├── T5: B2 - Blocker: WorkflowBlockerList URL dinámica

Wave 2 — Bug Fixes FRONTEND (3 tareas paralelas):
├── T6: B3 - Map center Arauca
├── T7: B4 - ERP Connectors español
├── T8: Playwright tests para bugs B1-B7

Wave 3 — Portal Cliente (5 tareas):
├── T9: Portal auth + layout scaffolding
├── T10: Portal proposals view + approve action
├── T11: Portal service cases + documents
├── T12: Portal delivery records + signature
├── T13: Portal invoices view + approve

Wave 4 — Innovation BACKEND (6 tareas paralelas):
├── T14: Email notifications service (nodemailer + templates)
├── T15: SLA engine + cron rules
├── T16: DIAN electronic invoicing integration
├── T17: IA report generator (template-based)
├── T18: Dashboard financial KPIs (aggregation queries)
├── T19: Dispatch geolocation + route optimization

Wave 5 — Innovation FRONTEND (7 tareas paralelas):
├── T20: Email notification triggers (proposal sent, invoice issued)
├── T21: SLA rules config UI + alerts dashboard
├── T22: DIAN invoice emit button + status display
├── T23: IA report draft preview modal
├── T24: Financial KPIs cards + charts on dashboard
├── T25: SignaturePad component + delivery record integration
├── T26: Dispatch map pins for active orders + route optimizer

Wave 6 — Final Verification (4 tareas):
├── F1: Compliance audit (grep all must-haves)
├── F2: Quality gates (typecheck + lint + build)
├── F3: Playwright full regression
├── F4: Scope fidelity check
```

---

## TODOs

### Wave 1 — Bug Fixes BACKEND

- [ ] T1. Fix B1 — RBAC: Gerente puede aprobar propuestas (frontend + domain permissions)

  **What to do**:
  - **Causa raíz REAL**: `ProposalActions.tsx` línea 96 y 112 usa `canPerformAction("approve_proposal")` que depende de `usePermissions()` hook.
  - El backend en `proposal.routes.ts` línea 98 YA permite gerente: `authorize(CERMONT_ROLES.CLIENTE, CERMONT_ROLES.GERENTE)`
  - El problema está en el frontend o en la configuración de permisos en `@cermont/domain`
  - **Fix 1**: Buscar en `packages/domain/src/permissions.ts` o `permissions.config.ts` la definición de `approve_proposal` y asegurar que incluya `gerente`
  - **Fix 2**: En `ProposalActions.tsx`, verificar que `canPerformAction("approve_proposal")` retorne `true` para gerente
  - **Fix 3**: Si el hook `usePermissions` tiene lógica hardcodeada, modificarla

  **Files to search and modify**:
  - `packages/domain/src/permissions.ts` — Mapa de permisos (BUSCAR)
  - `packages/domain/src/index.ts` — Export permissions
  - `frontend/src/modules/core/hooks/usePermissions.ts` — Hook que expone canPerformAction
  - `frontend/src/modules/proposals/ui/ProposalActions.tsx:96,112` — Verificar botón approve visible

  **Grep verification**:
  ```
  grep -F "approve_proposal" packages/domain/src/permissions.ts  # Debe incluir gerente
  grep -F "gerente" packages/domain/src/permissions.ts            # Debe aparecer en approve
  ```

  **QA Scenarios**:
  ```
  Scenario 1: Gerente ve botón Aprobar en propuesta ENVIADA
    Tool: Playwright
    Preconditions: Login gerente. Propuesta en status "sent" existe.
    Steps:
      1. Navigate to /proposals/[SENT_ID]
      2. Assert button "Aprobar" visible
      3. Assert button "Aprobar" is NOT disabled
    Expected: Gerente puede ver y hacer clic en Aprobar
    Evidence: .sisyphus/evidence/T1-approve-visible.png

  Scenario 2: Gerente aprueba propuesta exitosamente
    Steps:
      1. Click "Aprobar"
      2. Assert toast "Propuesta aprobada correctamente"
      3. Assert status badge changes to "approved"
    Expected: Propuesta se aprueba, flujo puede continuar
    Evidence: .sisyphus/evidence/T1-approve-success.png
  ```

  **Commit**: YES
  - Message: `fix(rbac): add gerente to approve_proposal permission in domain config`
  - Files: permissions.ts, usePermissions.ts, ProposalActions.tsx

- [ ] T2. Fix B7 — Proposal uniqueness: Frontend warning antes de crear duplicado

  **What to do**:
  - **Causa raíz**: Backend YA valida unicidad en `proposal.service.ts` line 126-135 con `existePropuestaActiva()`, pero frontend permite navegar a `/proposals/new?serviceCaseId=...` sin verificar si ya existe propuesta activa.
  - **Fix 1**: En `frontend/src/app/(dashboard)/proposals/new/page.tsx`, al detectar `serviceCaseId` en query params, llamar endpoint `GET /api/proposals/check-active?serviceCaseId=X`
  - **Fix 2**: Si existe propuesta activa, mostrar alerta con link a propuesta existente y opción "forzar nueva" (supersede=true)
  - **Fix 3**: Backend endpoint `GET /api/proposals/check-active/:serviceCaseId` que retorna propuesta activa si existe

  **Files to modify**:
  - `backend/src/modules/proposal/proposal.routes.ts` — Ruta GET check-active
  - `backend/src/modules/proposal/proposal.controller.ts` — Controller check-active
  - `backend/src/modules/proposal/proposal.service.ts` — existePropuestaActiva() ya existe, usarla
  - `frontend/src/app/(dashboard)/proposals/new/page.tsx` — Verificar propuesta activa al cargar
  - `frontend/src/modules/proposals/ui/DuplicateProposalWarning.tsx` (CREATE) — Componente alerta

  **Grep verification**:
  ```
  grep -F "check-active" backend/src/modules/proposal/proposal.routes.ts
  grep -F "DuplicateProposalWarning" frontend/src/modules/proposals/ui/DuplicateProposalWarning.tsx
  ```

  **QA Scenarios**:
  ```
  Scenario: Warning shown when service case already has active proposal
    Tool: Playwright
    Preconditions: SC with existing DRAFT/SENT proposal exists.
    Steps:
      1. Navigate to /proposals/new?serviceCaseId=SC_WITH_PROPOSAL
      2. Assert warning "Ya existe una propuesta activa" visible
      3. Assert link to existing proposal visible
      4. Assert option "Crear de todas formas" visible
    Expected: User warned before creating duplicate
    Evidence: .sisyphus/evidence/T2-duplicate-warning.png
  ```

  **Commit**: YES
  - Message: `fix(proposals): add frontend duplicate proposal warning before form loads`
  - Files: backend routes + controller + frontend component

- [ ] T3. Fix B6 — Fleet: Auto-cálculo status vehículo por documentos

  **What to do**:
  - **Causa raíz**: Fleet service YA tiene `validarDocumentosVehiculo()` (line 523), `hasExpiredDocuments()` (line 76), y bloquea asignación si documentos vencidos (line 347). Pero el status del vehículo no se actualiza automáticamente basado en documentos.
  - **Fix 1**: Agregar método `calcularStatusPorDocumentos()` en fleet service que retorne "blocked" si documentos faltan/vencidos
  - **Fix 2**: Modificar `listVehicles()` para incluir status calculado en la respuesta
  - **Fix 3**: Frontend fleet list debe mostrar badge "Bloqueado" cuando documentos faltan
  - **Fix 4**: Agregar alerta visual "Documentos requeridos: SOAT, Tecnomecánica, Póliza" en tarjeta de vehículo

  **Files to modify**:
  - `backend/src/modules/fleet/fleet.service.ts` — Agregar calcularStatusPorDocumentos(), modificar listVehicles()
  - `backend/src/modules/fleet/fleet.controller.ts` — Incluir status calculado
  - `frontend/src/app/(dashboard)/fleet/page.tsx` — Badge "Bloqueado" y alerta documentos
  - `frontend/src/modules/fleet/ui/VehicleDocumentStatus.tsx` (CREATE) — Componente estado documentos

  **Grep verification**:
  ```
  grep -F "calcularStatusPorDocumentos" backend/src/modules/fleet/fleet.service.ts
  grep -F "VehicleDocumentStatus" frontend/src/modules/fleet/ui/VehicleDocumentStatus.tsx
  ```

  **QA Scenarios**:
  ```
  Scenario: Vehicle with missing documents shows "Bloqueado" status
    Tool: Playwright
    Preconditions: CAR-456 without SOAT/techno/insurance registered.
    Steps:
      1. Navigate to /fleet
      2. Locate CAR-456 card
      3. Assert badge "Bloqueado" visible (not "Activo")
      4. Assert "Documentos incompletos" alert visible
      5. Assert missing docs list: SOAT, Tecnomecánica, Póliza
    Expected: Vehicle shows blocked status due to missing docs
    Evidence: .sisyphus/evidence/T3-fleet-blocked.png
  ```

  **Commit**: YES
  - Message: `fix(fleet): auto-calculate vehicle status based on document registration`
  - Files: fleet service + controller + frontend components

- [ ] T4. Fix B5 — SLA: Consistencia de contadores

  **What to do**:
  - **Causa raíz**: SLA service `getStats()` retorna 3 "En Riesgo" pero 0 "Activos". Matemáticamente imposible: enRiesgo debe ser subconjunto de activos.
  - **Fix 1**: Encontrar método `getStats()` en `backend/src/modules/sla/sla.service.ts`
  - **Fix 2**: Asegurar lógica: `enRiesgo = casos activos con SLA próximo a vencer (dentro de X días)`
  - **Fix 3**: Si activos = 0, enRiesgo = 0 (nunca enRiesgo > activos)
  - **Fix 4**: Agregar validación: `enRiesgo <= activos` en respuesta

  **Files to modify**:
  - `backend/src/modules/sla/sla.service.ts` — getStats() lógica de conteo
  - `backend/src/modules/sla/sla.controller.ts` — Verificar consistencia
  - `frontend/src/app/(dashboard)/sla/page.tsx` — Mostrar KPIs con semáforo

  **Grep verification**:
  ```
  grep -F "enRiesgo" backend/src/modules/sla/sla.service.ts
  grep -F "activos" backend/src/modules/sla/sla.service.ts | head -5
  ```

  **QA Scenarios**:
  ```
  Scenario: SLA KPIs are logically consistent
    Tool: Playwright
    Preconditions: SLA data exists.
    Steps:
      1. Navigate to /sla
      2. Read "Activos" count
      3. Read "En Riesgo" count
      4. Assert enRiesgo <= activos (when activos > 0)
      5. Assert enRiesgo === 0 (when activos === 0)
    Expected: SLA counts are mathematically consistent
    Evidence: .sisyphus/evidence/T4-sla-consistent.png
  ```

  **Commit**: YES
  - Message: `fix(sla): ensure enRiesgo count is subset of activos count`
  - Files: sla service + controller + frontend page

- [ ] T5. Fix B2 — Blocker: WorkflowBlockerList URL dinámica

  **What to do**:
  - **Causa raíz**: `WorkflowBlockerList.tsx` línea 24-28 tiene `BLOCKER_ACTION_ROUTES` hardcodeado:
    ```typescript
    const BLOCKER_ACTION_ROUTES: Record<string, (scId: string) => string> = {
      Proposal: (scId) => `/proposals/new?serviceCaseId=${scId}`,
    };
    ```
  - **Fix**: Hacer URL dinámica basada en si existe propuesta vinculada al servicio:
    - Si `serviceCase.artifacts.proposal?.id` existe → `/proposals/[existingId]`
    - Si no existe → `/proposals/new?serviceCaseId=${scId}`
  - **Opción A (backend)**: Modificar `resolveProposalBlockers()` en workflow-gate.service.ts para incluir `actionUrl` en el blocker dinámico
  - **Opción B (frontend)**: Modificar `WorkflowBlockerList.tsx` para aceptar `existingProposalId` prop y generar URL dinámica

  **Files to modify**:
  - `backend/src/services/cermont-workflow-gate.service.ts:201-221` — resolveProposalBlockers() con actionUrl dinámica
  - `frontend/src/modules/service-cases/components/WorkflowBlockerList.tsx:24-28` — BLOCKER_ACTION_ROUTES con lógica dinámica
  - `frontend/src/modules/service-cases/components/WorkflowBlockerList.tsx` props — Agregar existingProposalId

  **Grep verification**:
  ```
  grep -F "existingProposalId" frontend/src/modules/service-cases/components/WorkflowBlockerList.tsx
  ```

  **QA Scenarios**:
  ```
  Scenario: Blocker link points to existing proposal
    Tool: Playwright
    Preconditions: SC-2026-0003 with PROP-2026-0008 (ENVIADA).
    Steps:
      1. Navigate to /service-cases/6a569bf4f4dd0e74b83d77e4
      2. Locate blocker "La propuesta existe pero aún no está aprobada"
      3. Find action link href
      4. Assert href contains /proposals/6a578ad538ab92ec6d84c15b (NOT /proposals/new)
    Expected: Blocker action navigates to existing proposal
    Evidence: .sisyphus/evidence/T5-blocker-url.txt
  ```

  **Commit**: YES
  - Message: `fix(workflow): make blocker action URL dynamic based on existing proposal`
  - Files: workflow-gate service + WorkflowBlockerList component

### Wave 2 — Bug Fixes FRONTEND

- [ ] T6. Fix B3 — Mapa Dispatch centrado en Arauca

  **What to do**:
  - **Causa raíz**: Componente mapa Leaflet en dispatch usa coordenadas default (Bogotá: lat 4.65, lng -74.05)
  - **Fix**: Cambiar centro default a Arauca (lat 7.0867, lng -70.7592)
  - Buscar en `frontend/src/app/(dashboard)/dispatch/page.tsx` o componente de mapa
  - Si usa Leaflet: cambiar `center={[4.65, -74.05]}` a `center={[7.0867, -70.7592]}`
  - Si usa `react-leaflet`: cambiar `position` del `MapContainer`

  **Files to modify**:
  - `frontend/src/app/(dashboard)/dispatch/page.tsx` — Coordenadas del mapa

  **Grep verification**:
  ```
  grep -F "7.0867" frontend/src/app/(dashboard)/dispatch/page.tsx
  ```

  **QA Scenarios**:
  ```
  Scenario: Dispatch map centered on Arauca
    Tool: Playwright + evaluate
    Preconditions: Login gerente.
    Steps:
      1. Navigate to /dispatch
      2. Evaluate map center via JS: document.querySelector('.leaflet-container')
      3. Assert map center lat ~7.0867 (Arauca)
      4. Assert map center lng ~-70.7592 (Arauca)
    Expected: Map centers on Arauca, Colombia
    Evidence: .sisyphus/evidence/T6-map-center.txt
  ```

  **Commit**: YES
  - Message: `fix(dispatch): center Leaflet map on Arauca (7.0867, -70.7592)`
  - Files: dispatch page

- [ ] T7. Fix B4 — ERP Connectors español

  **What to do**:
  - **Causa raíz**: Página ERP Connectors tiene textos hardcodeados en inglés
  - **Fix**: Reemplazar todos los textos en inglés por español
  - Reemplazos:
    - `heading: "No ERP Connectors"` → `"Sin conectores ERP"`
    - `paragraph: "Add an ERP connector..."` → `"Agregue un conector ERP..."` 
    - `button: "Add Connector"` → `"Agregar conector"`
    - Breadcrumb `"Erp Connectors"` → `"Conectores ERP"`

  **Files to modify**:
  - `frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx`

  **Grep verification**:
  ```
  grep -F "Sin conectores ERP" frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx
  grep -F "Agregar conector" frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx
  ```

  **QA Scenarios**:
  ```
  Scenario: ERP Connectors page in Spanish
    Tool: Playwright
    Preconditions: Login gerente.
    Steps:
      1. Navigate to /admin/erp-connectors
      2. Assert text "Conectores ERP" visible (heading)
      3. Assert text "Sin conectores ERP" visible (empty state)
      4. Assert button "Agregar conector" visible
    Expected: All text in Spanish
    Evidence: .sisyphus/evidence/T7-erp-spanish.png
  ```

  **Commit**: YES
  - Message: `fix(i18n): translate ERP Connectors page to Spanish`
  - Files: erp-connectors page

- [ ] T8. Playwright verification tests for all bugs B1-B7

  **What to do**:
  - Crear suite de tests Playwright que verifiquen cada bug fix
  - `frontend/tests/e2e/bugfix-regression.spec.ts`
  - Test B1: Login gerente → approve proposal → verify status change
  - Test B2: Navigate SC blocker → verify action link URL correcta
  - Test B3: Navigate dispatch → verify map center Arauca
  - Test B4: Navigate ERP → verify Spanish text
  - Test B5: Navigate SLA → verify consistent counts
  - Test B6: Navigate fleet → verify vehicle status block
  - Test B7: Navigate proposals/new with serviceCaseId → verify warning

  **Files to create**:
  - `frontend/tests/e2e/bugfix-regression.spec.ts` (CREATE)

  **Commit**: YES
  - Message: `test(qa): add Playwright regression tests for bugs B1-B7`
  - Files: bugfix-regression spec

### Wave 3 — Portal Cliente

- [ ] T9. Portal Cliente scaffolding + auth

  **What to do**:
  - Crear estructura base del Portal Cliente en `frontend/src/app/(portal)/`
  - Crear layout con header simplificado (solo logo + nombre cliente + logout)
  - Crear login page con formulario email/password que use endpoint dedicado
  - Backend: Endpoint `POST /api/auth/portal-login` que verifique rol cliente y devuelva token limitado
  - Frontend: Portal auth store (separada de gerente store) + middleware para proteger rutas
  - Configurar ruteo: `/portal/*` solo accesible para usuarios con rol `cliente`

  **Files to create**:
  - `frontend/src/app/(portal)/layout.tsx` (CREATE)
  - `frontend/src/app/(portal)/login/page.tsx` (CREATE)
  - `frontend/src/app/(portal)/page.tsx` (CREATE) — Dashboard cliente
  - `frontend/src/store/portal-auth-store.ts` (CREATE)
  - `frontend/src/app/(portal)/proposals/page.tsx` (CREATE)
  - `frontend/src/app/(portal)/service-cases/page.tsx` (CREATE)
  - `backend/src/modules/auth/auth.routes.ts` — Ruta POST portal-login
  - `backend/src/modules/auth/auth.controller.ts` — Controller
  - `backend/src/modules/auth/auth.service.ts` — Lógica login cliente

  **Grep verification**:
  ```
  grep -F "(portal)" frontend/src/app/\(portal\)/layout.tsx
  grep -F "portalLogin" backend/src/modules/auth/auth.service.ts
  ```

  **QA Scenarios**:
  ```
  Scenario: Cliente login via portal
    Tool: Playwright
    Preconditions: User with role "cliente" exists.
    Steps:
      1. Navigate to /portal/login
      2. Fill email + password for cliente role
      3. Click "Acceder como Cliente"
      4. Assert redirected to /portal/dashboard
      5. Assert header shows "Portal Cliente"
    Expected: Cliente can login to portal
    Evidence: .sisyphus/evidence/T9-portal-login.png

  Scenario: Gerente cannot access portal
    Steps:
      1. Login as gerente
      2. Navigate to /portal/dashboard
      3. Assert redirected to /portal/login
      4. Assert error "No tiene acceso al portal"
    Expected: Only cliente role can access portal
  ```

  **Commit**: YES
  - Message: `feat(portal): create client portal with auth scaffolding and role protection`
  - Files: portal layout + login + auth backend

- [ ] T10. Portal Cliente — Proposals view + approve

  **What to do**:
  - Página `/portal/proposals` que muestra propuestas del cliente logueado
  - Backend filtrar por `customerEmail` del token de portal
  - Card/cada propuesta: código, valor, estado, fecha
  - Botón "Aprobar" en propuestas ENVIADA → modal de confirmación
  - Al aprobar: toast + status change + refresh list
  - Backend endpoint `GET /api/portal/proposals` filtrado por cliente

  **Files to create/modify**:
  - `frontend/src/app/(portal)/proposals/page.tsx` — Lista propuestas
  - `frontend/src/app/(portal)/proposals/[id]/page.tsx` (CREATE) — Detalle
  - `backend/src/modules/portal/portal.service.ts` (CREATE) — getClientProposals()
  - `backend/src/modules/portal/portal.controller.ts` (CREATE)
  - `backend/src/modules/portal/portal.routes.ts` (CREATE)

  **Grep verification**:
  ```
  grep -F "getClientProposals" backend/src/modules/portal/portal.service.ts
  ```

  **Commit**: YES
  - Message: `feat(portal): add client proposals view with approve action`
  - Files: portal module + frontend pages

- [ ] T11. Portal Cliente — Service cases + documents

  **What to do**:
  - Página `/portal/service-cases` con vista simplificada del pipeline
  - Mostrar: paso actual, estado, próximas acciones
  - Timeline vertical simplificado (solo pasos relevantes para cliente)
  - Sección "Documentos" con links de descarga
  - Backend endpoint filtrado por cliente

  **Files to create**:
  - `frontend/src/app/(portal)/service-cases/page.tsx` (CREATE)
  - `frontend/src/app/(portal)/service-cases/[id]/page.tsx` (CREATE)
  - `backend/src/modules/portal/portal.service.ts` — getClientCases()

  **Commit**: YES
  - Message: `feat(portal): add client service cases view with simplified pipeline`
  - Files: portal pages + backend

- [ ] T12. Portal Cliente — Delivery records + signature

  **What to do**:
  - Página `/portal/delivery-records` con actas pendientes de firma
  - Botón "Firmar acta" → abre SignaturePad (componente a crear en T25)
  - Al firmar: guardar firma como imagen + timestamp + IP
  - Backend endpoint para guardar firma

  **Files to create**:
  - `frontend/src/app/(portal)/delivery-records/page.tsx` (CREATE)
  - `frontend/src/app/(portal)/delivery-records/[id]/sign/page.tsx` (CREATE)
  - `backend/src/modules/portal/portal.service.ts` — signDeliveryRecord()

  **Commit**: YES
  - Message: `feat(portal): add delivery record signing via client portal`
  - Files: portal pages + backend

- [ ] T13. Portal Cliente — Invoices view + approve

  **What to do**:
  - Página `/portal/invoices` con facturas del cliente
  - Mostrar: número, valor, fecha, estado, PDF link
  - Botón "Aprobar factura" → confirma aprobación
  - Backend endpoint GET /api/portal/invoices y POST approve

  **Files to create**:
  - `frontend/src/app/(portal)/invoices/page.tsx` (CREATE)
  - `backend/src/modules/portal/portal.service.ts` — getClientInvoices()

  **Commit**: YES
  - Message: `feat(portal): add client invoices view with approve action`
  - Files: portal pages + backend

### Wave 4 — Innovation BACKEND

- [ ] T14. Email notifications service

  **What to do**:
  - Crear servicio de email en `backend/src/services/email.service.ts`
  - Usar nodemailer con configuración SMTP desde .env
  - Templates HTML para:
    - Propuesta enviada: "Tiene una nueva propuesta de CERMONT"
    - Acta lista para firma: "Su acta de entrega está lista"
    - Factura emitida: "Nueva factura disponible"
    - Pago confirmado: "Pago recibido"
    - SLA en riesgo: "Su caso X está próximo a vencer"
  - Cola de envío (simple) con reintentos
  - Endpoint para test: `POST /api/email/test`

  **Files to create/modify**:
  - `backend/src/services/email.service.ts` (CREATE)
  - `backend/src/services/email-templates.ts` (CREATE)
  - `backend/.env` — Agregar SMTP config
  - `backend/src/modules/email/email.routes.ts` (CREATE)
  - `backend/src/modules/email/email.controller.ts` (CREATE)

  **Grep verification**:
  ```
  grep -F "enviarEmail" backend/src/services/email.service.ts
  grep -F "nodemailer" backend/src/services/email.service.ts
  ```

  **Commit**: YES
  - Message: `feat(notifications): create email notification service with HTML templates`
  - Files: email service + templates + routes

- [ ] T15. SLA rules engine + cron

  **What to do**:
  - Motor de reglas SLA configurable por cliente
  - Reglas: tiempo máximo por paso, tiempo máximo total, alertas
  - Cron job que ejecuta cada hora
  - Escalamiento automático: si SLA en riesgo > 70% → notificar supervisor
  - Si SLA incumplido → escalar a gerente
  - Notificaciones push/email configurable
  - Modelo SlaRule en MongoDB

  **Files to create/modify**:
  - `backend/src/modules/sla/sla-rules.service.ts` (CREATE)
  - `backend/src/modules/sla/sla-scheduler.ts` (CREATE)
  - `backend/src/models/SlaRule.ts` (CREATE)
  - `backend/src/modules/sla/sla.service.ts` — Integrar motor reglas

  **Grep verification**:
  ```
  grep -F "SlaRule" backend/src/models/SlaRule.ts
  grep -F "checkSlaCompliance" backend/src/modules/sla/sla-rules.service.ts
  ```

  **Commit**: YES
  - Message: `feat(sla): add configurable SLA rules engine with escalation and alerts`
  - Files: SLA module + model + scheduler

- [ ] T16. DIAN electronic invoicing

  **What to do**:
  - Servicio DIAN en `backend/src/services/dian.service.ts`
  - Generar XML factura electrónica según formato DIAN
  - Firmar digitalmente con certificado
  - Enviar a proveedor (Siigo/Alegra/Facturama configurable)
  - Recibir CUFE + actualizar invoice status
  - Manejar eventos: aceptada, rechazada, en proceso
  - Endpoint: `POST /api/invoices/:id/emitir-dian`

  **Files to create/modify**:
  - `backend/src/services/dian.service.ts` (CREATE)
  - `backend/src/services/dian-xml-generator.ts` (CREATE)
  - `backend/src/modules/invoice/invoice.service.ts` — Integrar DIAN
  - `backend/src/modules/invoice/invoice.routes.ts` — Ruta emitir-dian

  **Grep verification**:
  ```
  grep -F "emitirFacturaElectronica" backend/src/services/dian.service.ts
  grep -F "CUFE" backend/src/services/dian.service.ts
  ```

  **Commit**: YES
  - Message: `feat(invoices): add DIAN electronic invoicing with CUFE generation`
  - Files: DIAN service + invoice integration

- [ ] T17. IA report generator (template-based)

  **What to do**:
  - Servicio que genera borrador de informe técnico basado en datos reales
  - Input: execution session data, evidencias, recursos, notas
  - Output: borrador estructurado con:
    - Datos del caso (cliente, orden, fechas)
    - Resumen de trabajo realizado
    - Recursos utilizados (materiales, equipos)
    - Evidencias fotográficas
    - Observaciones y recomendaciones
  - Usar template engine (EJS o similar) para generar HTML
  - Endpoint: `POST /api/reports/:id/generate-draft`

  **Files to create/modify**:
  - `backend/src/services/report-generator.service.ts` (CREATE)
  - `backend/src/services/report-templates/default.ejs` (CREATE)
  - `backend/src/modules/report/report.service.ts` — generateDraft()
  - `backend/src/modules/report/report.routes.ts` — Ruta

  **Grep verification**:
  ```
  grep -F "generateDraft" backend/src/services/report-generator.service.ts
  ```

  **Commit**: YES
  - Message: `feat(reports): add AI-powered technical report draft generator`
  - Files: report generator + template + API

- [ ] T18. Dashboard financial KPIs

  **What to do**:
  - Backend endpoint `GET /api/dashboard/financial-kpis`
  - KPIs a calcular con agregaciones MongoDB:
    - `conversionRate`: (propuestas aprobadas / total propuestas) * 100
    - `pipelineValue`: suma total de propuestas en estado sent/approved
    - `avgDaysPerStep`: días promedio que toma cada paso del flujo
    - `operatingMargin`: (ingresos - costos) / ingresos * 100
    - `monthlyRevenue`: suma de propuestas aprobadas este mes
    - `topBlockers`: blockers más frecuentes agregados
  - Cache de 5 min para reducir carga

  **Files to create/modify**:
  - `backend/src/modules/dashboard/dashboard.service.ts` — financialKPIs()
  - `backend/src/modules/dashboard/dashboard.controller.ts` — Controller
  - `backend/src/modules/dashboard/dashboard.routes.ts` — Ruta

  **Grep verification**:
  ```
  grep -F "financialKPIs" backend/src/modules/dashboard/dashboard.service.ts
  grep -F "conversionRate" backend/src/modules/dashboard/dashboard.service.ts
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add financial KPIs with MongoDB aggregations`
  - Files: dashboard module

- [ ] T19. Dispatch geolocation + route optimization

  **What to do**:
  - Endpoint `GET /api/dispatch/active-orders` que retorna órdenes activas con coordenadas
  - Las órdenes deben tener coordenadas (lat/lng) almacenadas
  - Si no hay coordenadas, geocodificar dirección con servicio (Nominatim/Google)
  - Algoritmo de optimización de rutas (nearest-neighbor TSP)
  - Endpoint `POST /api/dispatch/optimize-route` que recibe paradas y retorna orden optimizado

  **Files to create/modify**:
  - `backend/src/modules/dispatch/dispatch.service.ts` (CREATE) — activeOrders, optimizeRoute
  - `backend/src/modules/dispatch/dispatch.controller.ts` (CREATE)
  - `backend/src/modules/dispatch/dispatch.routes.ts` (CREATE)
  - `backend/src/services/geocoding.service.ts` (CREATE) — Geocodificar direcciones

  **Grep verification**:
  ```
  grep -F "activeOrders" backend/src/modules/dispatch/dispatch.service.ts
  grep -F "optimizeRoute" backend/src/modules/dispatch/dispatch.service.ts
  ```

  **Commit**: YES
  - Message: `feat(dispatch): add active orders geolocation and route optimization`
  - Files: dispatch module + geocoding service

### Wave 5 — Innovation FRONTEND

- [ ] T20. Email notification triggers (proposal sent, invoice issued)

  **What to do**:
  - Integrar en backend los disparadores de email:
    - En `proposal.service.ts` updateProposalStatus → cuando status cambia a "sent", llamar `emailService.enviarEmailPropuesta()`
    - En `invoice.service.ts` → cuando invoice se crea/emite, llamar `emailService.enviarEmailFactura()`
    - En `delivery-record.service.ts` → cuando DR está listo para firma, llamar `emailService.enviarEmailActa()`
  - Frontend: Configuración de email en admin settings

  **Files to modify**:
  - `backend/src/modules/proposal/proposal.service.ts:284` — Enviar email al enviar propuesta
  - `backend/src/modules/invoice/invoice.service.ts` — Enviar email al emitir factura
  - `backend/src/modules/delivery-record/delivery-record.service.ts` — Enviar email acta lista

  **Grep verification**:
  ```
  grep -F "enviarEmailPropuesta" backend/src/modules/proposal/proposal.service.ts
  grep -F "enviarEmailFactura" backend/src/modules/invoice/invoice.service.ts
  ```

  **Commit**: YES
  - Message: `feat(notifications): trigger email notifications on proposal send, invoice issue, DR ready`
  - Files: proposal + invoice + delivery-record services

- [ ] T21. SLA rules config UI + alerts dashboard

  **What to do**:
  - Frontend: Página `frontend/src/app/(dashboard)/admin/sla-rules/page.tsx`
  - Tabla de reglas SLA: cliente, paso, días máximos, días advertencia, acción
  - CRUD de reglas (crear, editar, eliminar)
  - Dashboard de alertas SLA en `/sla` con semáforo
  - Modal para configurar notificación: email/push/ambos

  **Files to create/modify**:
  - `frontend/src/app/(dashboard)/admin/sla-rules/page.tsx` (CREATE)
  - `frontend/src/app/(dashboard)/sla/page.tsx` — Agregar sección alertas
  - `frontend/src/modules/sla/ui/SlaRuleForm.tsx` (CREATE)
  - `frontend/src/modules/sla/ui/SlaAlertCard.tsx` (CREATE)
  - `frontend/src/modules/sla/api/sla-api.ts` (CREATE)

  **Commit**: YES
  - Message: `feat(sla): add SLA rules configuration UI and alerts dashboard`
  - Files: SLA frontend module + admin page

- [ ] T22. DIAN invoice emit button + status display

  **What to do**:
  - Frontend: Botón "Emitir factura electrónica DIAN" en invoice detail
  - Modal de confirmación: "¿Está seguro de emitir esta factura a DIAN?"
  - Mostrar CUFE después de emisión exitosa
  - Badge de estado: "Pendiente DIAN", "Aceptada DIAN", "Rechazada DIAN"
  - Link de descarga XML factura electrónica

  **Files to create/modify**:
  - `frontend/src/modules/invoices/ui/InvoiceDianButton.tsx` (CREATE)
  - `frontend/src/app/(dashboard)/billing/invoices/[id]/page.tsx` — Botón DIAN
  - `frontend/src/modules/invoices/ui/InvoiceStatusBadge.tsx` — Badge DIAN

  **Commit**: YES
  - Message: `feat(invoices): add DIAN emission button with CUFE display and status badge`
  - Files: invoice frontend module

- [ ] T23. IA report draft preview modal

  **What to do**:
  - Frontend: Botón "Generar borrador automático" en report detail
  - Modal de previsualización: muestra borrador generado con opciones:
    - "Aceptar borrador" → guarda como draft del reporte
    - "Regenerar" → llama endpoint otra vez
    - "Editar manualmente" → redirect a editor
  - Backend integration: llamar POST /api/reports/:id/generate-draft

  **Files to create/modify**:
  - `frontend/src/modules/reports/ui/DraftPreviewModal.tsx` (CREATE)
  - `frontend/src/app/(dashboard)/reports/[id]/page.tsx` — Botón generar

  **Commit**: YES
  - Message: `feat(reports): add AI draft generation button and preview modal`
  - Files: report frontend

- [ ] T24. Financial KPIs cards + charts on dashboard

  **What to do**:
  - Frontend: Agregar sección "KPIs Financieros" en `/dashboard`
  - Cards usando componente KpiCard reusable:
    - Tasa conversión: "45%" con delta vs mes anterior
    - Pipeline value: "$XX,XXX,XXX" con subtotal
    - Días promedio por paso: "12 días"
    - Margen operativo: "23%" con color semáforo
  - Gráficos Recharts: tendencia mensual, pipeline por etapa
  - Backend integration: GET /api/dashboard/financial-kpis

  **Files to modify**:
  - `frontend/src/app/(dashboard)/dashboard/page.tsx` — Sección KPIs financieros
  - `frontend/src/modules/dashboard/hooks/useFinancialKPIs.ts` (CREATE)

  **Commit**: YES
  - Message: `feat(dashboard): add financial KPIs section with cards and charts`
  - Files: dashboard page + hooks

- [ ] T25. SignaturePad component + delivery record integration

  **What to do**:
  - Componente `SignaturePad.tsx` en `frontend/src/core/ui/SignaturePad.tsx`
  - Canvas HTML5 para captura de firma (mouse + touch)
  - Funcionalidad:
    - Dibujar firma con mouse/dedo
    - Botón "Limpiar" para reiniciar
    - Botón "Confirmar firma" → guarda como base64 PNG
    - Timestamp + IP del firmante
    - Responsive: 375px+ con touch targets 44px
  - Integrar en delivery record detail: botón "Firmar acta"
  - Backend: endpoint POST /api/delivery-records/:id/sign

  **Files to create/modify**:
  - `frontend/src/core/ui/SignaturePad.tsx` (CREATE)
  - `frontend/src/app/(dashboard)/delivery-records/[id]/page.tsx` — Botón firmar
  - `backend/src/modules/delivery-record/delivery-record.service.ts` — sign()

  **Grep verification**:
  ```
  grep -F "SignaturePad" frontend/src/core/ui/SignaturePad.tsx
  ```

  **Commit**: YES
  - Message: `feat(delivery): add digital signature pad component for delivery records`
  - Files: SignaturePad + delivery record integration

- [ ] T26. Dispatch map pins for active orders + route optimizer

  **What to do**:
  - Frontend dispatch map: agregar pins de órdenes activas
  - Cada pin: tooltip con información de la orden (código, cliente, dirección)
  - Botón "Optimizar ruta" → llama endpoint POST /api/dispatch/optimize-route
  - Ruta optimizada: polyline en el mapa mostrando orden de paradas
  - Lista de técnicos con asignación a paradas
  - Responsive: mapa ocupar ancho completo en mobile

  **Files to create/modify**:
  - `frontend/src/app/(dashboard)/dispatch/page.tsx` — Pins + ruta optimizada
  - `frontend/src/modules/dispatch/ui/DispatchMap.tsx` (CREATE) — Mapa con Leaflet
  - `frontend/src/modules/dispatch/ui/OrderPin.tsx` (CREATE) — Pin marker
  - `frontend/src/modules/dispatch/ui/RoutePolyline.tsx` (CREATE) — Ruta optimizada
  - `frontend/src/modules/dispatch/hooks/useActiveOrders.ts` (CREATE)

  **Commit**: YES
  - Message: `feat(dispatch): add active order pins and route optimization to dispatch map`
  - Files: dispatch frontend module

### Wave 6 — Final Verification

- [ ] F1. Plan Compliance Audit

  **Task**: Verificar CADA Must Have con grep en archivos modificados.
  Ejecutar:
  ```
  grep -F "gerente" packages/domain/src/permissions.ts  # B1
  grep -F "existingProposalId" frontend/src/modules/service-cases/components/WorkflowBlockerList.tsx  # B2
  grep -F "7.0867" frontend/src/app/(dashboard)/dispatch/page.tsx  # B3
  grep -F "Sin conectores" frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx  # B4
  grep -F "enRiesgo" backend/src/modules/sla/sla.service.ts  # B5
  grep -F "calcularStatusPorDocumentos" backend/src/modules/fleet/fleet.service.ts  # B6
  grep -F "existePropuestaActiva" backend/src/modules/proposal/proposal.service.ts  # B7
  grep -F "(portal)" frontend/src/app/\(portal\)/layout.tsx  # Portal
  grep -F "enviarEmail" backend/src/services/email.service.ts  # Email
  grep -F "financialKPIs" backend/src/modules/dashboard/dashboard.service.ts  # KPIs
  grep -F "SignaturePad" frontend/src/core/ui/SignaturePad.tsx  # Firma
  grep -F "emitirFacturaElectronica" backend/src/services/dian.service.ts  # DIAN
  ```
  Output: `Must Have [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. Quality Gates
  ```
  cd frontend && npm run typecheck && npm run lint && npm run build
  cd ../backend && npm run typecheck && npm run lint && npm run build
  npx react-doctor@latest
  ```
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | React Doctor [PASS/FAIL] | VERDICT`

- [ ] F3. Playwright Full Regression
  ```
  cd frontend && npx playwright test --reporter=html
  ```
  Output: `Tests [N/N pass] | 0 failures | VERDICT`

- [ ] F4. Scope Fidelity Check
  Verificar que cada tarea produjo commits con SOLO los archivos especificados.
  Sin contaminación entre tareas.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN] | VERDICT`

---

## Commit Strategy

| Tasks | Prefix | Scope | Example |
|-------|--------|-------|---------|
| T1 | fix | rbac | `fix(rbac): add gerente to approve_proposal permission` |
| T2 | fix | proposals | `fix(proposals): add duplicate proposal frontend warning` |
| T3 | fix | fleet | `fix(fleet): auto-calculate status by documents` |
| T4 | fix | sla | `fix(sla): ensure enRiesgo <= activos count` |
| T5 | fix | workflow | `fix(workflow): dynamic blocker action URL` |
| T6 | fix | dispatch | `fix(dispatch): center map on Arauca` |
| T7 | fix | i18n | `fix(i18n): translate ERP Connectors to Spanish` |
| T8 | test | qa | `test(qa): add regression tests for B1-B7` |
| T9-T13 | feat | portal | `feat(portal): implement client portal module` |
| T14-T19 | feat | innovation | `feat(innovation): create backend services` |
| T20-T26 | feat | innovation | `feat(innovation): create frontend components` |
| F1-F4 | chore | verification | `chore(verification): final quality gates` |

---

## Success Criteria

### Verification Commands
```bash
cd frontend && npm run typecheck && npm run lint && npm run build
cd ../backend && npm run typecheck && npm run lint && npm run build
npx playwright test --reporter=html
npx react-doctor@latest
```

## Appendix A: Detailed Implementation Code for Bug Fixes

### A.1 Código para B1 — RBAC Permissions Fix

**Archivo**: `packages/domain/src/permissions.ts` (o archivo similar)
**Problema**: El mapa de permisos no incluye `gerente` para `approve_proposal`.

```typescript
// packages/domain/src/permissions.ts
// BUSCAR este archivo y verificar que exista:

export const PERMISSIONS = {
  // ... otros permisos ...
  
  approve_proposal: {
    label: "Aprobar propuesta",
    roles: ["cliente", "gerente"],  // <<-- DEBE incluir "gerente"
    description: "Permite aprobar una propuesta económica",
  },
  
  reject_proposal: {
    label: "Rechazar propuesta",
    roles: ["cliente", "gerente"],  // <<-- DEBE incluir "gerente"
    description: "Permite rechazar una propuesta económica",
  },
  
  approve_with_support: {
    label: "Aprobar con soporte",
    roles: ["gerente"],  // Solo gerente puede usar bypass
    description: "Aprobar propuesta adjuntando soporte de aprobación verbal/email",
  },
};

// Función helper:
export function canUserPerformAction(role: string, action: string): boolean {
  const permission = PERMISSIONS[action];
  if (!permission) return false;
  return permission.roles.includes(role);
}
```

**Archivo**: `frontend/src/modules/core/hooks/usePermissions.ts`
**Problema**: Si el hook no usa el mapa centralizado, puede tener lógica hardcodeada.

```typescript
// usePermissions.ts - Verificar que use el mapa de @cermont/domain
import { canUserPerformAction } from "@cermont/domain";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "";
  
  return {
    canPerformAction: (action: string) => canUserPerformAction(role, action),
    isReadOnly: role === "pasante" || role === "cliente",
    userRole: role,
  };
}
```

### A.2 Código para B2 — Blocker Action URL Dinámica

**Archivo**: `frontend/src/modules/service-cases/components/WorkflowBlockerList.tsx`

```typescript
// CAMBIAR de:
const BLOCKER_ACTION_ROUTES: Record<string, (scId: string) => string> = {
  Proposal: (scId) => `/proposals/new?serviceCaseId=${scId}`,
  PurchaseOrderAuthorization: (scId) => `/purchase-orders/new?serviceCaseId=${scId}`,
  SiteVisit: (scId) => `/site-visits/new?serviceCaseId=${scId}`,
};

// A:
interface BlockerActionConfig {
  hasExistingItem: boolean;
  existingItemId?: string;
  createRoute: (scId: string) => string;
  viewRoute: (itemId: string) => string;
}

function getBlockerActionRoute(
  artifactType: string,
  serviceCaseId: string,
  existingItemId?: string,
): string {
  const configs: Record<string, BlockerActionConfig> = {
    Proposal: {
      hasExistingItem: !!existingItemId,
      existingItemId,
      createRoute: (scId) => `/proposals/new?serviceCaseId=${scId}`,
      viewRoute: (itemId) => `/proposals/${itemId}`,
    },
    PurchaseOrderAuthorization: {
      hasExistingItem: !!existingItemId,
      existingItemId,
      createRoute: (scId) => `/purchase-orders/new?serviceCaseId=${scId}`,
      viewRoute: (itemId) => `/purchase-orders/${itemId}`,
    },
    SiteVisit: {
      hasExistingItem: !!existingItemId,
      existingItemId,
      createRoute: (scId) => `/site-visits/new?serviceCaseId=${scId}`,
      viewRoute: (itemId) => `/site-visits/${itemId}`,
    },
  };

  const config = configs[artifactType];
  if (!config) return "";
  
  if (config.hasExistingItem && config.existingItemId) {
    return config.viewRoute(config.existingItemId);
  }
  return config.createRoute(serviceCaseId);
}
```

### A.3 Código para B3 — Mapa Centrado Arauca

**Archivo**: `frontend/src/app/(dashboard)/dispatch/page.tsx`

```typescript
// BUSCAR y CAMBIAR el MapContainer center:
// ANTES (probablemente):
<MapContainer center={[4.65, -74.05]} zoom={6}>
// DESPUÉS:
<MapContainer center={[7.0867, -70.7592]} zoom={8}>

// Si usa react-leaflet:
<MapContainer 
  center={[7.0867, -70.7592]} 
  zoom={8} 
  className="h-full w-full rounded-lg"
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
</MapContainer>
```

### A.4 Código para B4 — ERP Connectors Español

**Archivo**: `frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx`

```typescript
// Reemplazar textos en inglés:
// ANTES:
<h3>No ERP Connectors</h3>
<p>Add an ERP connector to integrate with external systems like FSSM, GMAO/CSM, SAP, or DIAN.</p>
<button>Add Connector</button>

// DESPUÉS:
<h3>Sin conectores ERP</h3>
<p>Agregue un conector ERP para integrar con sistemas externos como FSSM, GMAO/CSM, SAP o DIAN.</p>
<button>Agregar conector</button>

// También breadcrumb si existe:
// <li>Erp Connectors</li> → <li>Conectores ERP</li>
```

### A.5 Código para B5 — SLA Contadores Consistentes

**Archivo**: `backend/src/modules/sla/sla.service.ts`

```typescript
// Método getStats() - asegurar lógica correcta:
export async function getStats(): Promise<SlaStats> {
  const now = new Date();
  
  // Contar casos activos (cualquier caso no cerrado)
  const activos = await ServiceCase.countDocuments({
    status: { $nin: ["closed", "cancelled", "archived"] },
  });
  
  // Casos en riesgo = activos con SLA próximo a vencer (>70% del tiempo usado)
  const enRiesgo = await ServiceCase.countDocuments({
    status: { $nin: ["closed", "cancelled", "archived"] },
    $expr: {
      $and: [
        { $ne: ["$slaMaxDays", null] },
        {
          $gte: [
            { $divide: [
              { $subtract: [now, "$stepStartedAt"] },
              { $multiply: ["$slaMaxDays", 24, 60, 60, 1000] }
            ]},
            0.7
          ]
        }
      ]
    }
  });
  
  // VALIDACIÓN: enRiesgo NUNCA puede ser mayor que activos
  const validatedEnRiesgo = Math.min(enRiesgo, activos);
  
  // Casos incumplidos = activos que excedieron el SLA
  const incumplidos = await ServiceCase.countDocuments({
    status: { $nin: ["closed", "cancelled", "archived"] },
    slaExceeded: true,
  });
  
  return {
    activos,
    enRiesgo: validatedEnRiesgo,
    incumplidos,
    resueltos: await ServiceCase.countDocuments({ status: "closed" }),
    cumplimiento: activos > 0 
      ? Math.round(((activos - validatedEnRiesgo) / activos) * 100) 
      : 100,
  };
}
```

### A.6 Código para B6 — Fleet Status Automático

**Archivo**: `backend/src/modules/fleet/fleet.service.ts`

```typescript
// Nuevo método para calcular status basado en documentos:
export type VehicleDocumentStatus = "valid" | "expired" | "not_registered";
export type VehicleComputedStatus = "active" | "blocked" | "maintenance";

export function calcularStatusPorDocumentos(
  vehicle: Pick<VehicleRecord, "soatExpiry" | "technoMechanicalExpiry" | "insuranceExpiry" | "status">
): VehicleComputedStatus {
  const now = new Date();
  
  const soatValid = vehicle.soatExpiry && vehicle.soatExpiry > now;
  const technoValid = vehicle.technoMechanicalExpiry && vehicle.technoMechanicalExpiry > now;
  const insuranceValid = vehicle.insuranceExpiry && vehicle.insuranceExpiry > now;
  
  // Si algún documento obligatorio falta o está vencido → blocked
  if (!soatValid || !technoValid || !insuranceValid) {
    return "blocked";
  }
  
  return vehicle.status === "maintenance" ? "maintenance" : "active";
}

// Modificar listVehicles para incluir status calculado:
export async function listVehicles(query: ListVehiclesQuery) {
  const result = await listVehiclesInternal(query); // Lógica existente
  
  const data = result.data.map((vehicle) => {
    const computedStatus = calcularStatusPorDocumentos(vehicle);
    const documentStatus = {
      soat: vehicle.soatExpiry ? "registered" : "not_registered",
      tecnomecanica: vehicle.technoMechanicalExpiry ? "registered" : "not_registered",
      poliza: vehicle.insuranceExpiry ? "registered" : "not_registered",
    };
    
    return {
      ...vehicle.toObject(),
      computedStatus,
      documentStatus,
      hasDocumentAlerts: computedStatus === "blocked",
      missingDocuments: getMissingDocuments(vehicle),
    };
  });
  
  return { data, pagination: result.pagination };
}

function getMissingDocuments(vehicle: Pick<VehicleRecord, "soatExpiry" | "technoMechanicalExpiry" | "insuranceExpiry">): string[] {
  const missing: string[] = [];
  if (!vehicle.soatExpiry) missing.push("SOAT");
  if (!vehicle.technoMechanicalExpiry) missing.push("Tecnomecánica");
  if (!vehicle.insuranceExpiry) missing.push("Póliza");
  return missing;
}
```

### A.7 Código para B7 — Frontend Duplicate Proposal Warning

**Archivo**: `frontend/src/app/(dashboard)/proposals/new/page.tsx`

```typescript
// En la página, al detectar serviceCaseId en query params:
"use client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function NewProposalPage() {
  const searchParams = useSearchParams();
  const serviceCaseId = searchParams.get("serviceCaseId");
  
  // Verificar si existe propuesta activa
  const { data: activeProposal, isLoading } = useQuery({
    queryKey: ["proposals", "check-active", serviceCaseId],
    queryFn: () => 
      apiClient.get(`/api/proposals/check-active/${serviceCaseId}`),
    enabled: !!serviceCaseId,
  });
  
  if (isLoading) return <Skeleton variant="form" />;
  
  if (activeProposal?.exists) {
    return (
      <DuplicateProposalWarning
        existingCode={activeProposal.code}
        existingId={activeProposal._id}
        serviceCaseId={serviceCaseId!}
      />
    );
  }
  
  return <ProposalForm serviceCaseId={serviceCaseId} />;
}
```

**Archivo nuevo**: `frontend/src/modules/proposals/ui/DuplicateProposalWarning.tsx`

```typescript
interface DuplicateProposalWarningProps {
  existingCode: string;
  existingId: string;
  serviceCaseId: string;
}

export function DuplicateProposalWarning({ 
  existingCode, existingId, serviceCaseId 
}: DuplicateProposalWarningProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-4">
        <AlertTriangle className="mt-1 size-6 text-amber-600" />
        <div>
          <h3 className="text-lg font-semibold text-amber-900">
            Ya existe una propuesta activa
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            El caso de servicio ya tiene la propuesta {existingCode} en estado activo.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href={`/proposals/${existingId}`}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white"
            >
              Ver propuesta existente
            </Link>
            <Link
              href={`/proposals/new?serviceCaseId=${serviceCaseId}&supersede=true`}
              className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-800"
            >
              Crear nueva (reemplazar)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Appendix B: Edge Cases and Error Handling Matrix

| Feature | Edge Case | Expected Behavior | HTTP Code | Error Code |
|---------|-----------|------------------|-----------|------------|
| B1 RBAC | Gerente sin permisos en domain config | Botón deshabilitado + tooltip | 403 | FORBIDDEN |
| B2 Blocker | SC sin serviceCaseId en proposal | Link a /proposals/new | - | - |
| B2 Blocker | Proposal existe pero está RECHAZADA | Link a /proposals/[id] con advertencia | - | - |
| B3 Map | API de geolocalización falla | Fallback a centro Arauca | - | GEO_FAILED |
| B4 i18n | Texto faltante en traducción | Mostrar key name en inglés | - | MISSING_KEY |
| B5 SLA | No hay casos en sistema | Activos=0, EnRiesgo=0, Cumplimiento=100% | 200 | - |
| B5 SLA | SLA maxDays no configurado para cliente | Skip SLA check para ese caso | - | - |
| B6 Fleet | Vehículo sin ninguna fecha de documento | Status = "blocked", missing=[SOAT,Tecno,Poliza] | 200 | - |
| B6 Fleet | Vehículo con todos documentos válidos | Status = "active" con badge verde | 200 | - |
| B7 Duplicate | serviceCaseId no existe | Error 404 "Caso no encontrado" | 404 | CASE_NOT_FOUND |
| B7 Duplicate | supersede=true sin propuesta previa | Crear normalmente | 201 | - |
| Portal | Token expirado | Redirect a /portal/login + toast | 401 | TOKEN_EXPIRED |
| Portal | Cliente sin propuestas asignadas | Empty state "No tiene propuestas" | 200 | - |
| Email | SMTP no configurado | Log + queue email para reintento | 202 | SMTP_NOT_CONFIGURED |
| Email | Email del cliente inválido | Log + continuar sin enviar | 200 | INVALID_EMAIL |
| SLA Cron | Base de datos no disponible | Skip ciclo + log + reintentar próxima hora | - | DB_UNAVAILABLE |
| DIAN | Certificado digital vencido | Error + notificar admin | 400 | CERT_EXPIRED |
| DIAN | DIAN rechaza XML | Almacenar respuesta + mostrar error en UI | 422 | DIAN_REJECTED |
| DIAN | Timeout en comunicación DIAN | Reintentar 3 veces con backoff 5s | 504 | DIAN_TIMEOUT |
| IA Report | Orden sin evidencias | Generar borrador con secciones vacías | 200 | - |
| IA Report | Orden no encontrada | Error 404 | 404 | ORDER_NOT_FOUND |
| Signature | Canvas no soportado en browser | Fallback a textarea para descripción | - | CANVAS_NOT_SUPPORTED |
| Signature | Firma vacía al confirmar | Error "Debe dibujar una firma" | 400 | EMPTY_SIGNATURE |
| Dispatch | Orden sin coordenadas | Geocodificar dirección automáticamente | 200 | - |
| Dispatch | Solo 1 parada | No optimizar ruta (no hay rutas con 1 punto) | 200 | - |
| KPIs | Sin datos financieros | Todos los KPIs en 0 o "—" | 200 | - |
| KPIs | División por cero en margen | Retornar 0% cuando ingresos=0 | 200 | DIV_ZERO |

## Appendix C: API Response Formats for New Endpoints

### POST /api/auth/portal-login
```json
// Request
{ "email": "cliente@cermont.com", "password": "****" }

// Success 200
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "60d5f484f1a2c8b1f8e4e1a1",
      "name": "Cliente Ejemplo",
      "email": "cliente@cermont.com",
      "role": "cliente",
      "customerId": "60d5f484f1a2c8b1f8e4e1b2"
    },
    "expiresIn": "30d"
  }
}

// Error 401
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Credenciales inválidas o no tiene acceso al portal"
  }
}
```

### GET /api/proposals/check-active/:serviceCaseId
```json
// Success 200 - active proposal exists
{
  "success": true,
  "data": {
    "exists": true,
    "_id": "60d5f484f1a2c8b1f8e4e1a1",
    "code": "PROP-2026-0008",
    "status": "sent",
    "total": 7561974
  }
}

// Success 200 - no active proposal
{
  "success": true,
  "data": { "exists": false }
}
```

### GET /api/dashboard/financial-kpis
```json
{
  "success": true,
  "data": {
    "conversionRate": 35.5,
    "pipelineValue": 28500000,
    "avgDaysPerStep": 12.3,
    "operatingMargin": 23.1,
    "monthlyRevenue": 12500000,
    "topBlockers": [
      { "code": "PROPOSAL_NOT_APPROVED", "count": 3 },
      { "code": "MISSING_EVIDENCE", "count": 1 }
    ],
    "byClient": [
      { "client": "Ecopetrol", "pipelineValue": 16065000, "conversionRate": 25 },
      { "client": "TecniPetrol", "pipelineValue": 7561974, "conversionRate": 0 }
    ]
  }
}
```

### POST /api/invoices/:id/emitir-dian
```json
// Request
{ "provider": "siigo" }

// Success 200
{
  "success": true,
  "data": {
    "invoiceId": "60d5f484f1a2c8b1f8e4e1a1",
    "cufe": "f1a2c8b1f8e4e1a160d5f484...",
    "qrCode": "https://cufe.dian.gov.co/validate?cufe=...",
    "xmlUrl": "/api/invoices/60d5f.../xml",
    "status": "electronic_sent",
    "dianResponse": { "status": "accepted", "receivedAt": "2026-07-15T14:00:00Z" }
  }
}

// Error 422
{
  "success": false,
  "error": {
    "code": "DIAN_REJECTED",
    "message": "La factura fue rechazada por DIAN: Error en formato XML",
    "details": { "dianErrorCode": "XML_001", "dianErrorMessage": "Falta campo CUFE" }
  }
}
```

## Appendix D: Dependencies to Install

Based on codebase analysis (checking package.json before installing):

| Feature | Package | Version | Bundle Impact |
|---------|---------|---------|---------------|
| T14 Email | nodemailer | ^6.9.0 | Server-only, 0 bundle |
| T14 Email Templates | ejs | ^3.1.0 | Server-only, 0 bundle |
| T17 IA Reports | ejs | ^3.1.0 | Server-only, 0 bundle |
| T25 Signature | react-signature-canvas | ^1.0.0 | +15KB gzip |
| T26 Map | leaflet + react-leaflet | ^1.9 / ^4.2 | Already installed |
| T26 Geocoding | No library needed (fetch Nominatim API) | - | 0 bundle |
| T24 Charts | recharts | ^2.12 | Already installed |
| T16 DIAN | No extra library needed (axios/XML built-in) | - | 0 bundle |
| T9 Portal | No extra library needed | - | 0 bundle |
| T21 SLA Cron | node-cron | ^3.0 | Server-only, 0 bundle |

**IMPORTANT**: No instalar nada sin verificar primero si ya existe en package.json.
Ejecutar antes: `grep -F "nodemailer" backend/package.json`

## Appendix E: Service Worker Enhancements (Offline)

Para soporte offline mejorado (relacionado con T27 del plan anterior):

```typescript
// frontend/src/lib/pwa/offline-queue.ts
// Backoff exponencial para reintentos de sync offline

const BACKOFF_DELAYS = [30_000, 60_000, 120_000, 300_000]; // 30s, 1min, 2min, 5min

interface QueuedMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body: unknown;
  createdAt: number;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
}

export class OfflineQueue {
  private db: IDBDatabase | null = null;
  
  async init() {
    this.db = await openDB('cermont-offline', 1, {
      upgrade(db) {
        db.createObjectStore('mutations', { keyPath: 'id' });
        db.createObjectStore('dlq', { keyPath: 'id' });
      },
    });
  }
  
  async enqueue(mutation: Omit<QueuedMutation, 'id' | 'createdAt' | 'retryCount'>) {
    await this.db!.put('mutations', {
      ...mutation,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      retryCount: 0,
    });
  }
  
  async process() {
    const mutations = await this.db!.getAll('mutations');
    
    for (const mutation of mutations) {
      try {
        await apiClient.request(mutation.endpoint, {
          method: mutation.method,
          body: mutation.body,
        });
        await this.db!.delete('mutations', mutation.id);
      } catch (error) {
        mutation.retryCount++;
        
        if (mutation.retryCount >= mutation.maxRetries) {
          // Mover a DLQ
          await this.db!.put('dlq', { ...mutation, lastError: (error as Error).message });
          await this.db!.delete('mutations', mutation.id);
        } else {
          const delay = BACKOFF_DELAYS[Math.min(
            mutation.retryCount - 1, 
            BACKOFF_DELAYS.length - 1
          )];
          setTimeout(() => this.process(), delay);
        }
      }
    }
  }
}
```

## Appendix F: Test Plan — All Playwright Specs

| Spec File | Area | Tests | Est. Lines |
|-----------|------|-------|------------|
| `bugfix-regression.spec.ts` | Bugs B1-B7 | 8 | 250 |
| `portal-flow.spec.ts` | Portal login + proposals + SC + delivery + invoices | 10 | 350 |
| `financial-kpis.spec.ts` | Dashboard KPIs financieros | 4 | 120 |
| `sla-rules.spec.ts` | SLA config + alerts engine | 5 | 180 |
| `dian-invoice.spec.ts` | DIAN emission + CUFE + error handling | 4 | 150 |
| `ia-reports.spec.ts` | IA report generation + preview modal | 3 | 100 |
| `dispatch-map.spec.ts` | Map pins + route optimization | 3 | 120 |
| `signature-pad.spec.ts` | Signature capture + save + validation | 3 | 100 |
| **TOTAL** | | **40 tests** | **~1,370 lines** |

## Appendix G: Implementation Timeline

| Week | Focus | Tasks | Dependencies |
|------|-------|-------|-------------|
| Week 1 | Bug Fixes | T1-T8 | None |
| Week 2 | Portal Cliente | T9-T13 | T1 (RBAC fixed) |
| Week 3 | Backend Innovation | T14-T19 | T9-T13 (Portal API patterns) |
| Week 4 | Frontend Innovation | T20-T26 | T14-T19 (Backend APIs ready) |
| Week 5 | Testing + Verification | F1-F4 | All T tasks |

**Total estimated**: 5 weeks (paralelizando dentro de cada wave)

## Appendix H: Key Metrics Post-Fix

| Metric | Before (jul 2026) | Target After Plan | Measurement |
|---------|-------------------|-------------------|-------------|
| Propuestas aprobadas | 0% (0/8) | ≥50% | Dashboard KPI |
| Casos bloqueados en Paso 3 | 3/3 (100%) | ≤1/3 (33%) | SC cockpit |
| Vehículos sin documentos | 2/2 (100%) | 0/2 (0%) | Fleet status |
| SLA contadores consistentes | NO (3 riesgo, 0 activos) | SI | SLA page |
| Portal Cliente funcional | NO EXISTE | SI | /portal/* routes |
| Notificaciones email | NO EXISTE | SI | Log + UI |
| DIAN integración | NO EXISTE | SI | Invoice page |
| IA informes | NO EXISTE | SI | Report page |
| Firma digital | NO EXISTE | SI | Delivery record |
| Dispatch con geo | SÓLO MAPA | MAPA + PINS | Dispatch page |

### Final Checklist
- [ ] B1: Gerente puede aprobar propuestas (verificado con Playwright)
- [ ] B2: Blocker link apunta a propuesta existente (verificado con grep)
- [ ] B3: Mapa centrado en Arauca (verificado con evaluate)
- [ ] B4: ERP Connectors en español (verificado con grep)
- [ ] B5: SLA contadores consistentes (enRiesgo <= activos)
- [ ] B6: Fleet muestra "Bloqueado" cuando documentos faltan
- [ ] B7: Warning visible al crear propuesta duplicada
- [ ] Portal Cliente funcional: login + proposals + SC + delivery + invoices
- [ ] Email notifications enviando: proposal sent + invoice issued
- [ ] SLA rules engine con alertas automáticas
- [ ] DIAN: emisión factura electrónica con CUFE
- [ ] IA report generator: borrador automático funcional
- [ ] Financial KPIs: conversión, pipeline, margen en dashboard
- [ ] SignaturePad: firma digital funcional en delivery records
- [ ] Dispatch: mapa con pins de órdenes activas + ruta optimizada
- [ ] typecheck + lint + build exitosos frontend y backend
- [ ] Playwright regression 0 fallos
- [ ] react-doctor 0 issues
