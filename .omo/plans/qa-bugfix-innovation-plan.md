# Plan de Corrección de Bugs + Innovación — CERMONT S.A.S.

## TL;DR

> **Resumen**: Corregir 12 bugs encontrados durante auditoría Playwright, desbloquear flujo 14 pasos mediante bypass gerente + portal cliente, e implementar innovaciones (KPIs financieros, notificaciones, facturación electrónica DIAN, firma digital, offline mejorado, IA generativa para informes).

> **Entregables**:
> - Fix a 12 bugs (4 🔴, 5 🟡, 3 🟢) con verificación grep de contenido
> - Portal Cliente con autenticación separada y aprobación de propuestas
> - Bypass gerente para aprobación de propuestas con soporte documentado
> - Dashboard con KPIs financieros en tiempo real
> - Notificaciones push al cliente vía email
> - SLA automatizado con alertas y escalamientos
> - Firma digital en actas de entrega
> - Módulo DIAN para facturación electrónica
> - Offline mejorado con colas persistentes
> - IA generativa para informes técnicos
> - Dispatch con geolocalización inteligente

> **Esfuerzo Estimado**: XL (6 waves, ~30 tareas)
> **Ejecución Paralela**: SI - máximo 8 tareas paralelas
> **Ruta Crítica**: B1 (RBAC) → Portal Cliente → Flujo 14 pasos completo

---

## ⚠️ ANTI-HALLUCINATION EXECUTION PROTOCOL (READ FIRST)

### El Problema
El modelo ejecutor previo marcó tareas como "already implemented" basándose en que typecheck/lint/build pasaban, sin escribir código nuevo. Esto NO es implementación.

### Reglas de Hierro

**REGLA 1: PROHIBIDO decir "already implemented" o "ya existe".**
- Cada archivo listado en "Files to modify" DEBE ser creado o modificado con `write()` o `edit()`.
- Si el archivo YA EXISTE pero su contenido no coincide con la especificación, DEBE ser reemplazado.
- La frase "already implemented" está TERMINANTEMENTE PROHIBIDA.
- Violación = tarea FALLIDA, debe rehacerse.

**REGLA 2: Verificación de contenido, no de comandos.**
- NO es suficiente que `npm run typecheck` pase.
- Hay que grep-el contenido del archivo para verificar que el cambio ESPECÍFICO existe.
- Cada tarea tiene un "Grep verification" con el patrón exacto a buscar.

**REGLA 3: Cada tarea DEBE terminar con commit atómico.**
- `git add <archivos específicos>` + `git commit -m "tipo(alcance): descripción"`
- Si el commit contiene archivos de otra tarea, hay CONTAMINACIÓN y se rechaza.
- Si el commit está vacío porque "no había nada que cambiar", se rechaza.

**REGLA 4: Evidencia de implementación obligatoria.**
- `git diff --stat` mostrando archivos modificados
- `grep -F "patrón exacto" archivo.modificado` confirmando el cambio
- Captura de pantalla o curl verificando comportamiento

### Consecuencias
- **1ª infracción**: Warning. Tarea revertida y rehecha.
- **2ª infracción**: Wave completa se reinicia.
- **3ª infracción**: Plan abortado.

---

## Context

### Hallazgos de Auditoría Playwright

**15 módulos funcionales testeados, 12 bugs encontrados:**

| Módulo | Estado |
|--------|--------|
| Login, Dashboard, WR, Proposals, SC List, SC Detail, Orders, Execution, Evidences, Fleet, SLA, Dispatch, ERP Connectors, Costos, Audit | ✅ OK |
| RBAC Propuestas (flujo bloqueado) | 🔴 B1 |
| Blocker action SC apunta a /proposals/new | 🟡 B2 |
| ERP Connectors en inglés | 🟢 B3 |
| Dispatch mapa centrado Bogotá no Arauca | 🟡 B4 |
| SLA contadores inconsistentes | 🟡 B5 |
| Fleet vehículos sin documentos | 🔴 B6 |
| Múltiples propuestas mismo caso | 🟡 B7 |
| Status mismatch documentos tab | 🟡 B8 |
| Dashboard KPI revenue "—" | 🟡 B9 |
| Blocker/Next actions URL mismatch | 🟡 B10 |
| Notificaciones badge stuck 10 | 🟢 B11 |
| PWA banner sin dismiss | 🟢 B12 |

### Arquitectura Actual
- Frontend: Next.js 16 App Router + React 19 + TanStack Query 5.x + Zustand 5.x + Tailwind CSS 4.x
- Backend: Express 5.2.1 + Mongoose 9.x + Zod 4.x
- Database: MongoDB 7.0
- Tests E2E: Playwright 1.58.x (46 spec files)
- Monorepo: npm workspaces (backend/ + frontend/ + packages/)

---

## Work Objectives

### Core Objective
Corregir 12 bugs, desbloquear flujo 14 pasos, implementar innovaciones que maduren la plataforma.

### Concrete Deliverables (con verificación de contenido)
| Deliverable | Archivo | Patrón grep | Acción |
|------------|---------|-------------|--------|
| B1 fix RBAC | proposal routes/controller | `gerente` en roles permitidos | MODIFICAR authorize middleware |
| B2 fix blocker URL | workflow-gate service | `proposal?.id` en action URL | MODIFICAR URL dinámica |
| B3 fix i18n ERP | erp-connectors page | `Conectores ERP` | MODIFICAR textos español |
| B4 fix map center | dispatch page/component | `6.25` lat Arauca | MODIFICAR coordenadas default |
| B5 fix SLA counts | sla service/page | `enRiesgo <= activos` | MODIFICAR lógica conteo |
| B6 fix fleet docs | fleet service/model | `validarDocumentos` | AGREGAR validación |
| B7 fix proposal unique | proposal service | `existePropuestaActiva` | AGREGAR validación unicidad |
| B8 fix status mismatch | sc documents tab | `proposal.status` | MODIFICAR refresh status |
| B9 fix KPI revenue | dashboard service | `calcularIngresosMes` | AGREGAR cálculo revenue |
| B10 fix URLs match | blocker component | `proposalId` en action | UNIFICAR URLs |
| B11 fix notifications | notification service | `marcarComoLeidas` | AGREGAR dismiss |
| B12 fix PWA banner | pwa component | `dismissPwaBanner` | AGREGAR localStorage |
| Portal Cliente | frontend portal/ | `export function PortalPage` | CREAR módulo completo |
| Bypass gerente | proposal service | `bypassGerente` | AGREGAR flujo alterno |
| Notificaciones email | notification service | `enviarEmailCliente` | AGREGAR email |
| KPIs financieros | dashboard service | `conversionRate` | AGREGAR KPIs |
| SLA automatizado | sla service | `checkSlaAlerts` | AGREGAR motor reglas |
| Firma digital | delivery-record page | `FirmaDigital` | AGREGAR componente |
| DIAN integration | invoice service | `emitirDian` | AGREGAR conector |
| IA informes | report service | `generarBorradorIA` | AGREGAR IA |
| Dispatch geo | dispatch page | `centrarEnArauca` | AGREGAR geolocalización |

### Must Have
- [ ] Bug B1: grep `gerente` en authorize middleware de propuestas
- [ ] Bug B2: grep `proposal?.id` en blocker action URL
- [ ] Bug B6: grep `validarDocumentos` en fleet service
- [ ] Portal Cliente: grep `PortalPage` en frontend
- [ ] Bypass gerente: grep `bypassGerente` en proposal service
- [ ] Notificaciones email: grep `enviarEmailCliente` en notification service
- [ ] KPIs financieros: grep `conversionRate` en dashboard service
- [ ] IA informes: grep `generarBorradorIA` en report service

### Must NOT Have
- NO cambiar stack (Express 5, Next.js 16, MongoDB, Zod 4.x)
- NO eliminar funcionalidad existente
- NO introducir any/unknown/null/undefined
- NO modificar package.json sin aprobación
- NO romper tests existentes
- NO decir "already implemented" como excusa

---

## Verification Strategy (reforzada)

### QA Policy
Cada tarea DEBE producir:
1. **Código**: `git diff --stat` mostrando archivos modificados
2. **Contenido**: `grep -F "patron" archivo.modificado` confirmando el cambio exacto
3. **Test**: Playwright o bash verificando comportamiento
4. **Commit**: `git commit` con mensaje semántico

Sin evidencia de código = tarea NO realizada = rechazar y rehacer.

---

## Execution Strategy

### Parallel Waves

```
Wave 1 — Critical Bugs (4 tareas paralelas):
├── T1: B1 - RBAC gerente puede aprobar propuestas
├── T2: B6 - Fleet validar documentos vehículos
├── T3: B1b - Bypass gerente con soporte documentado
├── T4: Create Playwright tests for critical flow verification

Wave 2 — Medium Bugs + Quality (6 tareas paralelas):
├── T5: B2 - Blocker action URL dinámica
├── T6: B4 - Mapa centrado Arauca
├── T7: B5 - SLA contadores consistentes
├── T8: B7 - Propuestas validación unicidad
├── T9: B8 - Status mismatch documentos tab
├── T10: B10 - Unificar blocker/next actions URLs

Wave 3 — Low Bugs + Foundation (6 tareas paralelas):
├── T11: B3 - ERP Connectors español
├── T12: B9 - Dashboard KPI revenue
├── T13: B11 - Notificaciones badge funcional
├── T14: B12 - PWA banner dismiss
├── T15: Dashboard KPIs financieros real-time
├── T16: Estructura portal cliente (scaffolding)

Wave 4 — Portal Cliente + Bypass (4 tareas):
├── T17: Portal Cliente - Auth + login page
├── T18: Portal Cliente - Proposals view + approve
├── T19: Portal Cliente - Service cases + documents
├── T20: Bypass gerente UI + endpoint

Wave 5 — Innovation (8 tareas paralelas):
├── T21: Notificaciones email al cliente
├── T22: SLA motor de reglas + alertas
├── T23: Firma digital actas entrega
├── T24: DIAN facturación electrónica
├── T25: IA generativa para informes técnicos
├── T26: Dispatch geolocalización inteligente
├── T27: Offline mejorado colas persistentes
├── T28: Versionamiento automático propuestas

Wave FINAL — Verification:
├── F1: Compliance audit (all must-haves)
├── F2: Quality gates (typecheck + lint + build)
├── F3: Playwright regression suite
├── F4: Scope fidelity check
```

---

## TODOs

### Wave 1 — Critical Bugs (HIGH priority)

- [ ] T1. Fix B1 - RBAC: Gerente puede aprobar propuestas

  **What to do**:
  - Root cause: `backend/src/common/middlewares/authorize.ts` o el controller de propuestas tiene `authorize('cliente')` sin incluir `gerente`
  - Fix: Agregar `gerente` a la lista de roles permitidos para aprobar propuestas
  - Buscar en `backend/src/modules/proposal/proposal.controller.ts` el método approveProposal y verificar roles
  - Buscar en `backend/src/modules/proposal/proposal.routes.ts` el endpoint PUT/PATCH /:id/approve
  - Buscar en `backend/src/common/middlewares/authorize.ts` la función authorize
  - Modificar para que `gerente` pueda aprobar propuestas

  **Files to modify**:
  - `backend/src/modules/proposal/proposal.routes.ts` - Ruta approve, agregar `gerente` a authorize()
  - `backend/src/modules/proposal/proposal.controller.ts` - Controller approveProposal
  - `backend/src/modules/proposal/proposal.service.ts` - Service approveProposal
  - `frontend/src/modules/proposals/ui/ProposalActions.tsx` - Verificar que botón "Aprobar" se muestra para gerente

  **Grep verification** (DEBE encontrarse después del fix):
  ```
  grep -F "gerente" backend/src/modules/proposal/proposal.routes.ts  # Debe mostrar ruta con authorize('gerente','cliente')
  grep -F "approve" backend/src/modules/proposal/proposal.service.ts  # Debe mostrar función approveProposal
  ```

  **QA Scenarios**:
  ```
  Scenario: Gerente aprueba propuesta exitosamente
    Tool: Playwright
    Preconditions: Login gerente. Propuesta ENVIADA existe.
    Steps:
      1. Navigate to proposal detail /proposals/[ENVIADA_ID]
      2. Assert button "Aprobar" visible
      3. Click "Aprobar"
      4. Assert toast "Propuesta aprobada" visible
      5. Assert status badge muestra "Aprobada"
    Expected Result: Gerente puede aprobar propuesta
    Evidence: .sisyphus/evidence/T1-gerente-approve.png

  Scenario: Cliente también puede aprobar (no regression)
    Tool: Playwright
    Preconditions: Login cliente. Propuesta ENVIADA existe.
    Steps:
      1. Navigate to proposal detail
      2. Assert "Aprobar" button visible
      3. Click, assert success
    Expected Result: Cliente mantiene permiso de aprobación
  ```

  **Commit**: YES
  - Message: `fix(rbac): add gerente role to proposal approval authorization`
  - Files: proposal routes, controller, service

- [ ] T2. Fix B6 - Fleet: Validar documentos vehículos antes de asignación

  **What to do**:
  - Root cause: Fleet permite asignar vehículos sin validar SOAT, Tecnomecánica, Póliza
  - Fix: Crear función `validarDocumentosVehiculo()` en `backend/src/modules/fleet/fleet.service.ts`
  - Agregar endpoint GET /fleet/:id/document-status que retorne estado de cada documento
  - Agregar validación en asignación: si documentos faltan, rechazar con error
  - Mostrar alertas visuales en frontend cuando documentos falten

  **Files to modify**:
  - `backend/src/modules/fleet/fleet.service.ts` - Agregar validarDocumentosVehiculo()
  - `backend/src/modules/fleet/fleet.routes.ts` - Agregar endpoint document-status
  - `backend/src/modules/fleet/fleet.controller.ts` - Controller
  - `frontend/src/app/(dashboard)/fleet/page.tsx` - Mostrar alertas
  - `frontend/src/modules/fleet/hooks/useFleetDocuments.ts` - Hook (CREATE)

  **Grep verification**:
  ```
  grep -F "validarDocumentosVehiculo" backend/src/modules/fleet/fleet.service.ts
  grep -F "document-status" backend/src/modules/fleet/fleet.routes.ts
  ```

  **QA Scenarios**:
  ```
  Scenario: Fleet muestra alerta de documentos faltantes
    Tool: Playwright
    Preconditions: Vehículo CAR-456 sin SOAT registrado.
    Steps:
      1. Navigate to /fleet
      2. Assert CAR-456 visible
      3. Assert alert badge "Documentos incompletos" visible
      4. Assert SOAT status "Sin registrar"
    Expected Result: Alertas visibles para documentos faltantes
    Evidence: .sisyphus/evidence/T2-fleet-alert.png
  ```

  **Commit**: YES
  - Message: `fix(fleet): add vehicle document validation before assignment`
  - Files: fleet service, routes, controller, frontend hooks

- [ ] T3. Fix B1b - Bypass gerente para aprobación con soporte documentado

  **What to do**:
  - Implementar bypass: gerente puede registrar "aprobación verbal/por email" adjuntando soporte
  - **Backend**: Nuevo endpoint `POST /api/proposals/:id/approve-with-support`
  - Body: `{ supportType: "verbal" | "email", supportDescription: string, supportFile?: file }`
  - El cambio de estado debe auditarse con metadata del bypass
  - **Frontend**: Botón "Aprobar con soporte" en ProposalActions que abre modal
  - Modal: selector tipo soporte + campo descripción + upload file opcional

  **Files to create/modify**:
  - `backend/src/modules/proposal/proposal.service.ts` - approveWithSupport()
  - `backend/src/modules/proposal/proposal.routes.ts` - Ruta POST approve-with-support
  - `backend/src/modules/proposal/proposal.controller.ts` - Controller
  - `frontend/src/modules/proposals/ui/ApproveWithSupportModal.tsx` (CREATE)
  - `frontend/src/modules/proposals/ui/ProposalActions.tsx` - Agregar botón y modal

  **Grep verification**:
  ```
  grep -F "approveWithSupport" backend/src/modules/proposal/proposal.service.ts
  grep -F "ApproveWithSupportModal" frontend/src/modules/proposals/ui/
  ```

  **QA Scenarios**:
  ```
  Scenario: Gerente aprueba propuesta con soporte verbal
    Tool: Playwright
    Preconditions: Login gerente. Propuesta ENVIADA.
    Steps:
      1. Navigate to /proposals/[id]
      2. Click "Aprobar con soporte"
      3. Select "Aprobación verbal"
      4. Fill "Cliente confirmó vía telefónica"
      5. Submit
      6. Assert toast "Propuesta aprobada con soporte"
      7. Assert status = "approved"
    Expected Result: Bypass funciona con auditoría
  ```

  **Commit**: YES
  - Message: `feat(proposals): add gerente approval bypass with support documentation`
  - Files: backend proposal module + frontend modal component

- [ ] T4. Create verification tests for critical flows

  **What to do**:
  - Crear tests Playwright que verifiquen los 3 critical fixes (T1, T2, T3)
  - `frontend/tests/e2e/qa-critical-bugs.spec.ts`
  - Test B1: Login gerente → approve proposal → verify status
  - Test B2: Navigate SC → verify blocker link → verify correct URL
  - Test B6: Navigate fleet → verify document alerts

  **Commit**: YES
  - Message: `test(qa): add Playwright tests for critical bug fixes`
  - Files: `frontend/tests/e2e/qa-critical-bugs.spec.ts` (MANDATORY)

### Wave 2 — Medium Bugs

- [ ] T5. Fix B2 - SC Blocker action URL dinámica

  **What to do**:
  - Root cause: `backend/src/services/cermont-workflow-gate.service.ts:201-221` en resolveProposalBlockers() genera acción sugerida con link fijo a `/proposals/new?serviceCaseId=...`
  - Fix: Modificar resolveProposalBlockers() para que verifique si ya existe proposal vinculada a ese serviceCaseId
  - Si `serviceCase.artifacts.proposal?.id` existe → link a `/proposals/[existingId]`
  - Si no existe → link a `/proposals/new?serviceCaseId=...`
  - También actualizar frontend `CockpitBlockers.tsx` para renderizar link dinámico

  **Files to modify**:
  - `backend/src/services/cermont-workflow-gate.service.ts:201-221` - resolveProposalBlockers()
  - `frontend/src/core/ui/CockpitBlockers.tsx` - Componente que renderiza blocker action link

  **Grep verification** (DEBE encontrarse después del fix):
  ```
  grep -F "artifacts.proposal?.id" backend/src/services/cermont-workflow-gate.service.ts
  ```

  **QA Scenarios**:
  ```
  Scenario: Blocker link apunta a proposal existente
    Tool: Playwright
    Preconditions: SC con propuesta existente enviada (PROP-2026-0008).
    Steps:
      1. Navigate to /service-cases/[SC_ID]
      2. Locate blocker "La propuesta existe pero aún no está aprobada"
      3. Find action link URL by inspecting href attribute
      4. Assert URL contains /proposals/6a578ad5 (existing proposal ID)
      5. Assert URL does NOT contain /proposals/new
    Expected Result: Blocker action links to existing proposal
    Evidence: .sisyphus/evidence/T5-blocker-url.txt
  ```

  **Commit**: YES
  - Message: `fix(workflow): make blocker action link dynamic based on existing proposal`
  - Files: `backend/src/services/cermont-workflow-gate.service.ts`, `frontend/src/core/ui/CockpitBlockers.tsx`

- [ ] T6. Fix B4 - Dispatch mapa centrado en Arauca

  **What to do**:
  - Root cause: Componente mapa Leaflet en dispatch usa coordenadas default (Bogotá: 4.7110, -74.0721)
  - La empresa opera desde Arauca: 7.0845, -70.7592
  - Fix: Cambiar centro default del mapa a coordenadas de Arauca
  - Buscar en `frontend/src/app/(dashboard)/dispatch/page.tsx` o en componente de mapa separado
  - Si usa Leaflet directamente: cambiar `center={[4.7110, -74.0721]}` a `center={[7.0845, -70.7592]}`
  - Si usa un hook: modificar defaultCenter

  **Files to modify**:
  - `frontend/src/app/(dashboard)/dispatch/page.tsx` - Coordenadas del mapa Leaflet

  **Grep verification**:
  ```
  grep -F "7.0845" frontend/src/app/(dashboard)/dispatch/page.tsx
  ```

  **QA Scenarios**:
  ```
  Scenario: Dispatch map centered on Arauca
    Tool: Playwright + browser evaluate
    Preconditions: Login as gerente.
    Steps:
      1. Navigate to /dispatch
      2. Run in browser: document.querySelector('.leaflet-container')?.__leaflet_id
      3. Evaluate map center lat/lng
      4. Assert lat is approximately 7.0845 (Arauca)
      5. Assert lng is approximately -70.7592 (Arauca)
    Expected Result: Map centers on Arauca, Colombia
    Evidence: .sisyphus/evidence/T6-map-aruca.txt
  ```

  **Commit**: YES
  - Message: `fix(dispatch): center Leaflet map on Arauca coordinates (7.0845, -70.7592)`
  - Files: dispatch page

- [ ] T7. Fix B5 - SLA contadores consistentes

  **What to do**:
  - Root cause: SLA service en backend cuenta casos "En Riesgo" sin verificar consistencia con "Activos"
  - "En Riesgo" debe ser siempre subconjunto de "Activos"
  - Fix: En `backend/src/modules/sla/sla.service.ts`, modificar lógica de conteo
  - Si activos = 0, enRiesgo debe ser 0
  - enRiesgo nunca debe exceder activos
  - Agregar validación: casos en riesgo = casos activos con SLA próximo a vencer

  **Files to modify**:
  - `backend/src/modules/sla/sla.service.ts` - Lógica de conteo de KPIs SLA
  - `frontend/src/app/(dashboard)/sla/page.tsx` - Frontend SLA dashboard

  **Grep verification**:
  ```
  grep -F "enRiesgo" backend/src/modules/sla/sla.service.ts
  grep -F "activos" backend/src/modules/sla/sla.service.ts
  ```

  **QA Scenarios**:
  ```
  Scenario: SLA shows consistent counts
    Tool: Playwright
    Preconditions: SLA data exists with some at-risk cases.
    Steps:
      1. Navigate to /sla
      2. Read "Activos" count value
      3. Read "En Riesgo" count value
      4. Assert enRiesgo <= activos (logical consistency)
      5. If activos = 0, assert enRiesgo = 0
    Expected Result: SLA KPIs are logically consistent
    Evidence: .sisyphus/evidence/T7-sla-consistency.png
  ```

  **Commit**: YES
  - Message: `fix(sla): ensure enRiesgo count is subset of activos count`
  - Files: sla service

- [ ] T8. Fix B7 - Propuestas validación de unicidad por caso activo

  **What to do**:
  - Root cause: No hay validación en backend que impida crear múltiples propuestas para el mismo serviceCaseId activo
  - Fix: En `backend/src/modules/proposal/proposal.service.ts` createProposal():
    1. Antes de crear, verificar si existe propuesta con status != "rejected" para ese serviceCaseId
    2. Si existe, retornar error: "Ya existe una propuesta activa para este caso"
    3. Agregar opción `supersede=true` para forzar creación y marcar anterior como "superseded"
  - Agregar campo `supersededBy` en Proposal model
  - Frontend: mostrar alerta con link a propuesta existente

  **Files to modify**:
  - `backend/src/modules/proposal/proposal.service.ts` - Validación en createProposal()
  - `backend/src/models/Proposal.ts` - Agregar campo supersededBy
  - `frontend/src/app/(dashboard)/proposals/new/page.tsx` - Alerta de propuesta existente

  **Grep verification**:
  ```
  grep -F "existePropuestaActiva" backend/src/modules/proposal/proposal.service.ts
  grep -F "supersededBy" backend/src/models/Proposal.ts
  ```

  **Commit**: YES
  - Message: `fix(proposals): add uniqueness validation per active service case`
  - Files: proposal service, Proposal model, frontend new page

- [ ] T9. Fix B8 - SC Documentos tab proposal status mismatch

  **What to do**:
  - Root cause: Documentos tab en SC detail page muestra status de propuesta desde snapshot vinculado, no desde el documento actual
  - Fix: El query del tab Documentos debe usar queryKey de proposal detail para forzar refetch
  - Si el documento vinculado es "Proposal", hacer query a `/api/proposals/[proposalId]` para obtener status fresco

  **Files to modify**:
  - `frontend/src/app/(dashboard)/service-cases/[id]/page.tsx` - Documentos tab component

  **Grep verification**:
  ```
  grep -F "PROPOSALS_KEYS.detail" frontend/src/app/(dashboard)/service-cases/\[id\]/page.tsx
  ```

  **Commit**: YES
  - Message: `fix(service-cases): refresh proposal status in documents tab from API`
  - Files: service case detail page

- [ ] T10. Fix B10 - Unificar Blocker y Next Actions URLs

  **What to do**:
  - Root cause: Sección Bloqueadores tiene URL fija `/proposals/new` mientras sección Próximas Acciones tiene URL correcta `/proposals/[existingId]`
  - Fix: Crear helper compartido `getProposalActionUrl()` que use misma lógica en ambos componentes
  - Ubicación: `frontend/src/modules/service-cases/helpers/proposal-url.ts` (CREATE)
  - Refactorizar CockpitBlockers.tsx y CockpitNextAction.tsx para usar el helper

  **Files to create/modify**:
  - `frontend/src/modules/service-cases/helpers/proposal-url.ts` (CREATE)
  - `frontend/src/core/ui/CockpitBlockers.tsx` - Usar helper
  - `frontend/src/core/ui/CockpitNextAction.tsx` - Usar helper

  **Grep verification**:
  ```
  grep -F "getProposalActionUrl" frontend/src/modules/service-cases/helpers/proposal-url.ts
  ```

  **Commit**: YES
  - Message: `fix(service-cases): unify proposal URLs across blocker and next actions components`
  - Files: helper module, CockpitBlockers, CockpitNextAction

### Wave 3 — Low Bugs + Foundation

- [ ] T11. Fix B3 - ERP Connectors en español

  **What to do**:
  - Root cause: `frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx` tiene textos hardcodeados en inglés
  - Fix: Reemplazar textos:
    - "No ERP Connectors" → "Sin conectores ERP"
    - "Add an ERP connector to integrate..." → "Agregue un conector ERP para integrar..."
    - "Add Connector" → "Agregar conector"
    - Breadcrumb "Erp Connectors" → "Conectores ERP"
    - Título de página si está en inglés

  **Files to modify**:
  - `frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx`

  **Grep verification**:
  ```
  grep -F "Sin conectores ERP" frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx
  grep -F "Agregar conector" frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx
  ```

  **Commit**: YES
  - Message: `fix(i18n): translate ERP Connectors page to Spanish`
  - Files: erp-connectors page

- [ ] T12. Fix B9 - Dashboard KPI Ingresos del Mes

  **What to do**:
  - Root cause: Dashboard muestra "—" para "Ingresos del Mes" aunque hay órdenes activas con propuestas enviadas
  - Fix: En backend `getServiceCaseSummary()` o endpoint dashboard KPIs, calcular ingresos del mes basado en:
    - Propuestas ENVIADAS y APROBADAS del mes actual
    - Órdenes activas con valor asociado
  - Si no hay datos, mostrar "$0" en vez de "—"

  **Files to modify**:
  - `backend/src/modules/service-cases/service-case.service.ts` - Calcular ingresos del mes
  - `frontend/src/app/(dashboard)/dashboard/page.tsx` - Mostrar valor calculado

  **Grep verification**:
  ```
  grep -F "ingresosDelMes" backend/src/modules/service-cases/service-case.service.ts
  ```

  **Commit**: YES
  - Message: `fix(dashboard): calculate monthly revenue from approved proposals and active orders`
  - Files: service case service, dashboard page

- [ ] T13. Fix B11 - Notificaciones badge funcional

  **What to do**:
  - Root cause: Badge de notificaciones muestra "10" sin leer pero no hay dropdown/panel para verlas
  - Fix: Hacer clic en badge abra panel lateral (drawer) con lista de notificaciones
  - Backend: Endpoint `GET /api/notifications` y `POST /api/notifications/:id/read`
  - Frontend: Componente NotificationDrawer con lista, marcar como leídas

  **Files to modify**:
  - `backend/src/modules/notifications/notification.routes.ts` - Endpoints
  - `backend/src/modules/notifications/notification.controller.ts` - Controller
  - `backend/src/modules/notifications/notification.service.ts` - Service
  - `frontend/src/core/ui/NotificationDrawer.tsx` (CREATE)
  - `frontend/src/components/layout/Header.tsx` - Integrar drawer

  **Grep verification**:
  ```
  grep -F "NotificationDrawer" frontend/src/core/ui/NotificationDrawer.tsx
  grep -F "marcarComoLeida" backend/src/modules/notifications/notification.service.ts
  ```

  **Commit**: YES
  - Message: `fix(notifications): implement notification drawer with read/unread functionality`
  - Files: notification module + frontend drawer component

- [ ] T14. Fix B12 - PWA banner dismiss

  **What to do**:
  - Root cause: Banner "Instalar Cermont Campo" persistente en todas las páginas sin opción "No mostrar más"
  - Fix: Agregar localStorage flag al hacer clic en "Cerrar" o "Más tarde"
  - Si `localStorage.getItem('pwa-banner-dismissed') === 'true'`, no mostrar banner
  - Agregar opción "No mostrar más" en el banner

  **Files to modify**:
  - `frontend/src/components/layout/PwaInstallBanner.tsx` o componente similar

  **Grep verification**:
  ```
  grep -F "pwa-banner-dismissed" frontend/src/components/layout/PwaInstallBanner.tsx
  ```

  **Commit**: YES
  - Message: `fix(pwa): add dismiss with localStorage persistence to install banner`
  - Files: PwaInstallBanner component

- [ ] T15. Dashboard KPIs financieros en tiempo real

  **What to do**:
  - **Innovación**: Agregar KPIs financieros al dashboard
  - Backend: endpoint `GET /api/dashboard/financial-kpis`
  - KPIs a calcular:
    - Tasa conversión propuesta → orden (propuestas aprobadas / total propuestas * 100)
    - Días promedio por paso (timeline analysis)
    - Pipeline value (valor total de propuestas en curso)
    - Margen operativo (ingresos - costos) / ingresos * 100
    - Valor facturado del mes
  - Frontend: Agregar sección "KPIs Financieros" en dashboard con KpiCards

  **Files to modify**:
  - `backend/src/modules/dashboard/dashboard.service.ts` - Lógica KPIs financieros
  - `backend/src/modules/dashboard/dashboard.controller.ts` - Controller
  - `backend/src/modules/dashboard/dashboard.routes.ts` - Ruta
  - `frontend/src/app/(dashboard)/dashboard/page.tsx` - Sección KPIs financieros
  - `frontend/src/modules/dashboard/hooks/useFinancialKPIs.ts` (CREATE)

  **Grep verification**:
  ```
  grep -F "conversionRate" backend/src/modules/dashboard/dashboard.service.ts
  grep -F "pipelineValue" backend/src/modules/dashboard/dashboard.service.ts
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add real-time financial KPIs (conversion rate, pipeline, margin)`
  - Files: dashboard module backend + frontend

- [ ] T16. Portal Cliente scaffolding

  **What to do**:
  - Crear estructura base del Portal Cliente
  - Carpeta: `frontend/src/app/(portal)/`
  - Archivos base:
    - `frontend/src/app/(portal)/layout.tsx` - Layout con header simplificado
    - `frontend/src/app/(portal)/login/page.tsx` - Login específico para cliente (rol cliente)
    - `frontend/src/app/(portal)/page.tsx` - Dashboard cliente
    - `frontend/src/app/(portal)/proposals/page.tsx` - Propuestas del cliente
    - `frontend/src/app/(portal)/service-cases/page.tsx` - Casos del cliente
  - Backend: Endpoints para datos cliente-specific (filtrados por customerId)
  - Auth: Verificar rol `cliente` en login portal

  **Files to create**:
  - `frontend/src/app/(portal)/layout.tsx` (CREATE)
  - `frontend/src/app/(portal)/login/page.tsx` (CREATE)
  - `frontend/src/app/(portal)/page.tsx` (CREATE)
  - `frontend/src/app/(portal)/proposals/page.tsx` (CREATE)
  - `frontend/src/app/(portal)/service-cases/page.tsx` (CREATE)
  - `frontend/src/app/(portal)/layout.tsx` (CREATE)
  - `backend/src/modules/portal/portal.routes.ts` (CREATE)
  - `backend/src/modules/portal/portal.controller.ts` (CREATE)
  - `backend/src/modules/portal/portal.service.ts` (CREATE)

  **Grep verification**:
  ```
  grep -F "(portal)" frontend/src/app/\(portal\)/layout.tsx
  ```

  **Commit**: YES
  - Message: `feat(portal): create client portal scaffolding with auth and basic pages`
  - Files: frontend portal routes + backend portal module

### Wave 4 — Portal Cliente Completado

- [ ] T17. Portal Cliente - Auth + Login

  **What to do**:
  - Implementar login portal específico para rol cliente
  - Ruta: `frontend/src/app/(portal)/login/page.tsx`
  - Formulario login: email + contraseña + botón "Acceder como Cliente"
  - Backend: Verificar que el usuario tenga rol `cliente` o rechazar acceso
  - Middleware: `authenticate` + `authorize('cliente')`
  - Redirect después de login: `/portal/dashboard`
  - Logout: redirect a `/portal/login`
  - Proteger rutas /portal/* con middleware que verifique rol cliente

  **Files to modify**:
  - `frontend/src/app/(portal)/login/page.tsx` - Login form completo
  - `frontend/src/middleware.ts` - Portal route protection
  - `backend/src/modules/auth/auth.service.ts` - Verificar rol cliente en login
  - `frontend/src/modules/auth/stores/auth-store.ts` - Portal auth state

  **Grep verification**:
  ```
  grep -F "portalLogin" backend/src/modules/auth/auth.service.ts
  ```

  **Commit**: YES
  - Message: `feat(portal): implement client login with role verification and route protection`
  - Files: portal login + auth service + middleware

- [ ] T18. Portal Cliente - Proposals view + approve

  **What to do**:
  - Página `/portal/proposals` que muestra SOLO propuestas del cliente logueado
  - Backend: Filtrar por `customerEmail` del usuario cliente
  - Cada propuesta: card con número, valor, estado, fecha
  - Botón "Aprobar" en propuestas ENVIADA → modal de confirmación
  - Al aprobar: toast + status change

  **Files to create/modify**:
  - `frontend/src/app/(portal)/proposals/page.tsx` - Lista propuestas cliente
  - `frontend/src/app/(portal)/proposals/[id]/page.tsx` - Detalle propuesta (CREATE)
  - `backend/src/modules/portal/portal.service.ts` - getClientProposals()
  - `backend/src/modules/portal/portal.controller.ts` - Controller
  - `backend/src/modules/portal/portal.routes.ts` - Rutas

  **Grep verification**:
  ```
  grep -F "getClientProposals" backend/src/modules/portal/portal.service.ts
  ```

  **Commit**: YES
  - Message: `feat(portal): add client proposals view with approve action`
  - Files: portal module + frontend pages

- [ ] T19. Portal Cliente - Service cases + documents

  **What to do**:
  - Página `/portal/service-cases` con pipeline simplificado del caso
  - Mostrar: paso actual, estado, próximas acciones
  - Botón "Ver documentos" para descargar documentos del caso
  - Timeline vertical simplificado

  **Files to create**:
  - `frontend/src/app/(portal)/service-cases/page.tsx` (CREATE)
  - `frontend/src/app/(portal)/service-cases/[id]/page.tsx` (CREATE)
  - `backend/src/modules/portal/portal.service.ts` - getClientCases()

  **Commit**: YES
  - Message: `feat(portal): add client service cases view with simplified pipeline`
  - Files: portal service cases pages + backend

- [ ] T20. Bypass gerente UI completa

  **What to do**:
  - Completar UI del bypass gerente en frontend
  - Modal `ApproveWithSupportModal.tsx` con:
    - Selector tipo de soporte: "Aprobación verbal", "Confirmación por email", "Documento escrito"
    - Campo de descripción (textarea)
    - Upload de archivo (soporte PDF/imagen)
    - Botón "Confirmar aprobación con soporte"
  - Backend: Endpoint completo con auditoría
  - Métrica: cuántos bypass se usan (reporting)

  **Files to modify**:
  - `frontend/src/modules/proposals/ui/ApproveWithSupportModal.tsx` - UI completa
  - `frontend/src/modules/proposals/ui/ProposalActions.tsx` - Integrar modal
  - `backend/src/modules/proposal/proposal.service.ts` - approveWithSupport completo
  - `backend/src/modules/proposal/proposal.routes.ts` - Ruta con upload file

  **Commit**: YES
  - Message: `feat(proposals): complete gerente bypass UI with support document upload`
  - Files: frontend modal + backend endpoint

### Wave 5 — Innovation Features

- [ ] T21. Notificaciones email al cliente

  **What to do**:
  - Cuando una propuesta cambia a ENVIADA, enviar email automático al cliente
  - Email: "Tiene una nueva propuesta de CERMONT S.A.S. - [propuestaCode]"
  - Incluir link tokenizado de aprobación: `/portal/proposals/[id]?token=[jwt]`
  - Integrar nodemailer o servicio email (configurable)
  - Config:
    - SMTP settings in `backend/.env`: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    - `EMAIL_FROM: notificaciones@cermont.com`

  **Files to create/modify**:
  - `backend/src/services/email.service.ts` (CREATE)
  - `backend/src/modules/proposal/proposal.service.ts` - Enviar email tras enviar
  - `backend/src/modules/notifications/notification.service.ts` - Integrar email
  - `backend/.env` - Agregar config SMTP

  **Grep verification**:
  ```
  grep -F "enviarEmailPropuesta" backend/src/services/email.service.ts
  ```

  **Commit**: YES
  - Message: `feat(notifications): send automatic email to client when proposal is sent`
  - Files: email service + proposal service integration

- [ ] T22. SLA motor de reglas + alertas

  **What to do**:
  - Motor de reglas SLA configurable por cliente
  - Reglas: tiempo máximo por paso, tiempo máximo total, alertas por vencer
  - Backend: Servicio que corre check cada hora (cron job)
  - Alertas: si caso excede tiempo en paso, generar notificación y marcar "En Riesgo"
  - Frontend: Panel de configuración SLA en admin

  **Files to create/modify**:
  - `backend/src/modules/sla/sla-rules.service.ts` (CREATE) - Motor reglas
  - `backend/src/modules/sla/sla-check.cron.ts` (CREATE) - Cron job
  - `backend/src/models/SlaRule.ts` - Modelo reglas (CREATE)
  - `frontend/src/app/(dashboard)/admin/sla-rules/page.tsx` - Config (CREATE)
  - `frontend/src/app/(dashboard)/sla/page.tsx` - Mostrar alertas

  **Grep verification**:
  ```
  grep -F "SlaRule" backend/src/models/SlaRule.ts
  grep -F "checkSlaCompliance" backend/src/modules/sla/sla-rules.service.ts
  ```

  **Commit**: YES
  - Message: `feat(sla): add configurable SLA rules engine with automatic alerts`
  - Files: SLA module + cron + model + admin UI

- [ ] T23. Firma digital en Acta de Entrega

  **What to do**:
  - Integrar firma electrónica en actas de entrega (Paso 9-10)
  - **Frontend**: Componente `SignaturePad.tsx` para captura de firma táctil/mouse
  - **Backend**: Almacenar firma como imagen PNG en firma del delivery record
  - Verificación: hash de integridad de la firma
  - Compatible con Certicámara API si está disponible
  - UI: Al llegar a Paso 10, mostrar bloque de firma

  **Files to create/modify**:
  - `frontend/src/core/ui/SignaturePad.tsx` (CREATE) - Componente firma
  - `frontend/src/app/(dashboard)/delivery-records/[id]/signature/page.tsx` - Página firma
  - `backend/src/modules/delivery-record/delivery-record.service.ts` - Guardar firma
  - `backend/src/models/DeliveryRecord.ts` - Campo signature

  **Grep verification**:
  ```
  grep -F "SignaturePad" frontend/src/core/ui/SignaturePad.tsx
  grep -F "signature" backend/src/models/DeliveryRecord.ts
  ```

  **Commit**: YES
  - Message: `feat(delivery): add digital signature pad for delivery records`
  - Files: SignaturePad component + delivery record service

- [ ] T24. DIAN facturación electrónica

  **What to do**:
  - Integración con proveedores DIAN (Siigo, Alegra, Facturama)
  - Backend: Servicio que genera XML de factura electrónica según formato DIAN
  - Endpoint: `POST /api/invoices/:id/emitir-dian`
  - Enviar a proveedor configurado
  - Recibir CUFE (Código Único de Facturación Electrónica)
  - Actualizar status de invoice a "electronic_sent"
  - Frontend: Botón "Emitir factura electrónica DIAN" en invoice detail

  **Files to create/modify**:
  - `backend/src/services/dian.service.ts` (CREATE) - DIAN integration
  - `backend/src/services/dian-xml-generator.ts` (CREATE) - XML generator
  - `backend/src/modules/invoice/invoice.service.ts` - Emitir DIAN
  - `backend/src/modules/invoice/invoice.routes.ts` - Ruta emitir-dian
  - `frontend/src/modules/invoices/ui/InvoiceActions.tsx` - Botón DIAN

  **Grep verification**:
  ```
  grep -F "emitirDian" backend/src/services/dian.service.ts
  grep -F "CUFE" backend/src/services/dian.service.ts
  ```

  **Commit**: YES
  - Message: `feat(invoices): add DIAN electronic invoicing integration`
  - Files: DIAN service + invoice module

- [ ] T25. IA generativa para informes técnicos

  **What to do**:
  - **Cermont AI**: Auto-generar borradores de informe técnico (Paso 8)
  - Backend: Endpoint `POST /api/reports/:id/generate-draft`
  - Input: evidencias fotográficas, recursos usados, notas del técnico, execution session data
  - Output: Borrador de informe estructurado
  - Usar plantilla basada en datos reales (no requiere LLM externo - usar template engine)
  - Frontend: Botón "Generar borrador automático" en report page
  - Modal de previsualización antes de guardar

  **Files to create/modify**:
  - `backend/src/services/report-generator.service.ts` (CREATE)
  - `backend/src/modules/report/report.service.ts` - generateDraft()
  - `backend/src/modules/report/report.routes.ts` - Ruta
  - `frontend/src/app/(dashboard)/reports/[id]/page.tsx` - Botón generar
  - `frontend/src/modules/reports/ui/DraftPreviewModal.tsx` (CREATE)

  **Grep verification**:
  ```
  grep -F "generateDraft" backend/src/services/report-generator.service.ts
  ```

  **Commit**: YES
  - Message: `feat(reports): add AI-generated technical report drafts from execution data`
  - Files: report generator service + frontend

- [ ] T26. Dispatch geolocalización inteligente

  **What to do**:
  - Mejorar dispatch con geolocalización:
    1. Centrar mapa en Arauca automáticamente (Bug B4 fix ya cubre esto)
    2. Mostrar órdenes activas como pins en el mapa
    3. Algoritmo de optimización de rutas (TSP nearest-neighbor)
    4. Integración con Google Maps Routes API o Leaflet Routing Machine
    5. Geolocalizar técnicos en campo (si comparten ubicación)
  - Data: uso de coordenadas de órdenes activas, sedes clientes

  **Files to modify**:
  - `frontend/src/app/(dashboard)/dispatch/page.tsx` - Mapa con pins
  - `frontend/src/modules/dispatch/hooks/useDispatchMap.ts` (CREATE) - Lógica mapa
  - `frontend/src/modules/dispatch/ui/OrderPin.tsx` (CREATE) - Marcador orden
  - `frontend/src/modules/dispatch/ui/RouteOptimizer.tsx` (CREATE) - Optimizador
  - `backend/src/modules/dispatch/dispatch.service.ts` - Endpoint órdenes activas con coordenadas
  - `backend/src/modules/dispatch/dispatch.routes.ts` - Ruta

  **Grep verification**:
  ```
  grep -F "getActiveOrdersWithCoords" backend/src/modules/dispatch/dispatch.service.ts
  ```

  **Commit**: YES
  - Message: `feat(dispatch): add geolocation pins for active orders and route optimization`
  - Files: dispatch module backend + frontend map components

- [ ] T27. Offline mejorado colas persistentes

  **What to do**:
  - Mejorar soporte offline según configuration existente (toggle "Sincronización offline" activado)
  - Implementar:
    1. Cola de reintentos con backoff exponencial (30s, 1min, 2min, 5min)
    2. DLQ (dead letter queue) con UI para revisar fallos
    3. Badge "Sync pendiente" en evidencias no subidas
    4. Service worker más robusto con caché de assets críticos
  - Endpoint backend: `POST /api/sync/offline` para recibir mutations offline

  **Files to modify**:
  - `frontend/src/lib/pwa/offline-queue.ts` - Backoff exponencial + DLQ
  - `frontend/src/app/~offline/page.tsx` - Mejorar fallback
  - `backend/src/modules/sync/sync.service.ts` - Batch sync endpoint
  - `backend/src/modules/sync/sync.routes.ts` - Nueva ruta

  **Grep verification**:
  ```
  grep -F "backoffExponencial" frontend/src/lib/pwa/offline-queue.ts
  grep -F "DLQ" frontend/src/lib/pwa/offline-queue.ts
  ```

  **Commit**: YES
  - Message: `feat(offline): add exponential backoff, DLQ, and sync status badges`
  - Files: offline queue + sync backend

- [ ] T28. Versionamiento automático propuestas

  **What to do**:
  - Cuando se crea nueva propuesta para mismo caso (con supersede=true), marcar anterior como "superseded"
  - Guardar referencia `supersededBy` a la nueva propuesta
  - En vista de propuesta, mostrar historial de versiones
  - Frontend: Sección "Historial de versiones" en proposal detail

  **Files to modify**:
  - `backend/src/modules/proposal/proposal.service.ts` - Lógica supersede
  - `backend/src/models/Proposal.ts` - Campo versionHistory
  - `frontend/src/app/(dashboard)/proposals/[id]/page.tsx` - Sección versiones
  - `frontend/src/modules/proposals/ui/VersionHistory.tsx` (CREATE)

  **Grep verification**:
  ```
  grep -F "supersede" backend/src/modules/proposal/proposal.service.ts
  grep -F "VersionHistory" frontend/src/modules/proposals/ui/VersionHistory.tsx
  ```

  **Commit**: YES
  - Message: `feat(proposals): add version history with supersede mechanism for duplicate proposals`
  - Files: proposal service + model + frontend version component

---

## Final Verification Wave (MANDATORY)

> 4 reviews ejecutan PARALLEL. TODOS deben APPROVE.
> NO auto-proceder. Esperar "okay" explícito.
> Rechazo → fix → re-run → presentar → esperar okay.

- [ ] F1. **Plan Compliance Audit** — oracle

  **Tarea**: Verificar CADA Must Have con grep en archivos modificados.
  
  **Must Have Checklist**:
  - [ ] B1: `grep -F "gerente" backend/src/modules/proposal/proposal.routes.ts` → debe mostrar ruta approve
  - [ ] B2: `grep -F "artifacts.proposal?.id" backend/src/services/cermont-workflow-gate.service.ts` → URL dinámica
  - [ ] B3: `grep -F "Sin conectores ERP" frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx`
  - [ ] B4: `grep -F "7.0845" frontend/src/app/(dashboard)/dispatch/page.tsx`
  - [ ] B5: SLA contadores consistentes entre enRiesgo y activos
  - [ ] B6: `grep -F "validarDocumentosVehiculo" backend/src/modules/fleet/fleet.service.ts`
  - [ ] B7: `grep -F "existePropuestaActiva" backend/src/modules/proposal/proposal.service.ts`
  - [ ] B8: `grep -F "PROPOSALS_KEYS.detail" frontend/src/app/(dashboard)/service-cases/\[id\]/page.tsx`
  - [ ] B9: `grep -F "ingresosDelMes" backend/src/modules/service-cases/service-case.service.ts`
  - [ ] B10: `grep -F "getProposalActionUrl" frontend/src/modules/service-cases/helpers/proposal-url.ts`
  - [ ] B11: `grep -F "NotificationDrawer" frontend/src/core/ui/NotificationDrawer.tsx`
  - [ ] B12: `grep -F "pwa-banner-dismissed"` en pwa banner component
  - [ ] Portal: `grep -F "(portal)" frontend/src/app/\(portal\)/layout.tsx`
  - [ ] Bypass: `grep -F "approveWithSupport" backend/src/modules/proposal/proposal.service.ts`
  - [ ] Email: `grep -F "enviarEmailPropuesta" backend/src/services/email.service.ts`
  - [ ] KPIs: `grep -F "conversionRate" backend/src/modules/dashboard/dashboard.service.ts`
  - [ ] SLA: `grep -F "SlaRule" backend/src/models/SlaRule.ts`
  - [ ] Firma: `grep -F "SignaturePad" frontend/src/core/ui/SignaturePad.tsx`
  - [ ] DIAN: `grep -F "emitirDian" backend/src/services/dian.service.ts`
  - [ ] IA: `grep -F "generateDraft" backend/src/services/report-generator.service.ts`
  - [ ] Dispatch: `grep -F "getActiveOrdersWithCoords" backend/src/modules/dispatch/dispatch.service.ts`
  - [ ] Offline: `grep -F "backoffExponencial" frontend/src/lib/pwa/offline-queue.ts`

  Output: `Must Have [N/N] | Must NOT Have [0 issues] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — unspecified-high
  `tsc --noEmit` + `npm run lint` + `npm run build` frontend y backend.
  Check forbidden patterns: `any`, `@ts-ignore`, `null`, empty catches, console.log
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | VERDICT`

- [ ] F3. **Full Playwright Regression** — unspecified-high + playwright
  Ejecutar suite completa de tests desde estado limpio. 0 fallos.
  Output: `Tests [N/N pass] | VERDICT`

- [ ] F4. **Scope Fidelity** — deep
  Cada tarea entregó exactamente lo prometido. Sin contaminación cruzada.
  Verificar que T1 no modificó archivos de T2, etc.
  Output: `Tasks [N/N compliant] | VERDICT`

## Appendix A: Implementation Patterns

### Pattern 1 - RBAC extendido para Gerente (T1)

**Problema**: `authorize('cliente')` bloquea a gerente.

**Solución**: Modificar middleware a `authorize('cliente', 'gerente')`.

```typescript
// ANTES (proposal.routes.ts):
router.patch('/:id/approve', authenticate, authorize('cliente'), proposalController.approveProposal);

// DESPUÉS:
router.patch('/:id/approve', authenticate, authorize('cliente', 'gerente'), proposalController.approveProposal);
```

**Validación**: Si gerente aprueba, auditar con metadata `{ approvedByRole: 'gerente', approvalMethod: 'direct' }`.

### Pattern 2 - Blocker Action URL Dinámica (T5)

**Problema**: Código actual genera link fijo.

```typescript
// ANTES (workflow-gate.service.ts):
return createDocumentBlocker({
  message: "La propuesta existe pero aún no está aprobada.",
  recommendedAction: "Obtener aprobación del cliente para la propuesta.",
  // No hay link a propuesta existente
});

// DESPUÉS:
const proposalId = serviceCase.artifacts.proposal?.id;
return createDocumentBlocker({
  message: proposalId 
    ? "La propuesta existe pero aún no está aprobada."
    : "Falta la propuesta económica elaborada y guardada.",
  recommendedAction: proposalId
    ? `/proposals/${proposalId}`  // Link a propuesta existente
    : `/proposals/new?serviceCaseId=${serviceCase._id}`,  // Crear nueva
  actionUrl: proposalId 
    ? `/proposals/${proposalId}` 
    : `/proposals/new?serviceCaseId=${serviceCase._id}`,
});
```

### Pattern 3 - Bypass Gerente con Soporte (T3)

**Estructura del endpoint**:
```
POST /api/proposals/:id/approve-with-support
Body: {
  supportType: "verbal" | "email" | "document",
  supportDescription: string (min 10 chars, required),
  supportEvidenceFile?: File (PDF/image, max 5MB)
}
Response: {
  success: true,
  data: {
    proposal: { id, status: "approved", approvedBy: "gerente", approvalMethod: "bypass_with_support" },
    audit: { action: "PROPOSAL_APPROVED_WITH_SUPPORT", metadata: { supportType, supportDescription } }
  }
}
```

### Pattern 4 - Portal Cliente Auth Flow (T17)

```
Request: POST /api/auth/portal-login
Body: { email: string, password: string }
Backend:
  1. Verify user exists
  2. Verify user.role === 'cliente' (reject if not)
  3. Generate JWT with role='cliente' scope limited
  4. Return { token, user: { name, email, customerId } }

Frontend:
  /portal/login → form email+password → POST /api/auth/portal-login
  On success → store token in portal-auth-store (separate from gerente store)
  On fail → show error "Credenciales inválidas o no tiene acceso al portal"
  
  /portal/* routes → middleware checks portal-auth-store token
  If no token → redirect to /portal/login
```

### Pattern 5 - Validación Unicidad Propuestas (T8)

```typescript
// En proposal.service.ts, createProposal:
async function createProposal(data: CreateProposalDto, userId: string) {
  // Verificar unicidad si tiene serviceCaseId
  if (data.serviceCaseId) {
    const existingActiveProposal = await Proposal.findOne({
      serviceCaseId: data.serviceCaseId,
      status: { $in: ['draft', 'sent', 'pending_approval'] },
      supersededBy: { $exists: false },
    });
    
    if (existingActiveProposal && !data.supersede) {
      throw new BadRequestError(
        'PROPOSAL_ALREADY_EXISTS',
        `Ya existe una propuesta activa (${existingActiveProposal.code}) para este caso. Use supersede=true para reemplazarla.`,
        { existingProposalId: existingActiveProposal._id, existingProposalCode: existingActiveProposal.code }
      );
    }
    
    // Si supersede=true, marcar anterior como superseded
    if (existingActiveProposal && data.supersede) {
      existingActiveProposal.supersededBy = newProposalId;
      existingActiveProposal.supersededAt = new Date();
      await existingActiveProposal.save();
    }
  }
  
  // ... crear propuesta normalmente
}
```

### Pattern 6 - Notificaciones Email (T21)

```typescript
// email.service.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function enviarEmailPropuesta(proposal: Proposal, clientEmail: string) {
  const approvalToken = jwt.sign(
    { proposalId: proposal._id, action: 'approve_proposal', role: 'cliente' },
    process.env.PORTAL_JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  const portalUrl = `${process.env.FRONTEND_URL}/portal/proposals/${proposal._id}?token=${approvalToken}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: clientEmail,
    subject: `Nueva propuesta CERMONT: ${proposal.code}`,
    html: `
      <h2>Propuesta ${proposal.code}</h2>
      <p>Estimado cliente,</p>
      <p>Se ha generado una nueva propuesta por valor de <strong>$${proposal.total.toLocaleString()}</strong>.</p>
      <p>Para revisar y aprobar, haga clic en: <a href="${portalUrl}">${portalUrl}</a></p>
      <p>Atentamente,<br/>CERMONT S.A.S.</p>
    `,
  });
}
```

### Pattern 7 - DIAN Facturación Electrónica (T24)

```typescript
// dian.service.ts
interface DianInvoiceResult {
  success: boolean;
  cufe?: string;      // Código Único de Facturación Electrónica
  qrCode?: string;    // Código QR
  error?: string;
  dianResponse: unknown;
}

export async function emitirFacturaElectronica(invoice: Invoice): Promise<DianInvoiceResult> {
  // 1. Generar XML según formato DIAN
  const xml = generarXmlFactura(invoice);
  
  // 2. Firmar digitalmente
  const signedXml = firmarXml(xml, process.env.DIAN_CERTIFICATE_PATH);
  
  // 3. Enviar a proveedor tecnológico (Siigo/Alegra/Facturama)
  const provider = process.env.DIAN_PROVIDER; // 'siigo' | 'alegra' | 'facturama'
  const response = await enviarAProveedor(provider, signedXml);
  
  // 4. Procesar respuesta
  if (response.status === 'accepted') {
    return {
      success: true,
      cufe: response.cufe,
      qrCode: response.qrCode,
      dianResponse: response,
    };
  }
  
  // 5. Reintentar si es necesario
  if (response.status === 'pending') {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5s
    return emitirFacturaElectronica(invoice); // Reintentar
  }
  
  return { success: false, error: response.error, dianResponse: response };
}
```

---

## Appendix B: Detailed QA Scenarios - Edge Cases

### Auth & RBAC Edge Cases
| Scenario | Tarea | Precondition | Expected |
|----------|-------|-------------|----------|
| Gerente sin propuestas asignadas | T1 | Login gerente, lista propuestas vacía | Empty state "No hay propuestas" |
| Cliente intenta crear propuesta | T1 | Login cliente, POST /proposals | 403 Forbidden |
| Token expirado en portal | T17 | Token portal expirado | Redirect a /portal/login |
| Bypass sin descripción | T3 | Aprobar con soporte, descripción vacía | Error "Descripción requerida" |

### Proposal Edge Cases
| Scenario | Tarea | Precondition | Expected |
|----------|-------|-------------|----------|
| Supersede propuesta inexistente | T8 | supersede=true sin propuesta previa | Crear normalmente |
| Blocker con proposal rechazada | T5 | Proposal status = rejected | Blocker "Crear nueva propuesta" |
| Propuesta con items 0 | T7 | Cantidad 0 en item | Error validación Zod |

### SLA Edge Cases
| Scenario | Tarea | Precondition | Expected |
|----------|-------|-------------|----------|
| SLA sin ningún caso | T7 | 0 casos en sistema | Activos=0, EnRiesgo=0 |
| Caso en riesgo resuelto | T22 | SLA alerta activa, caso se cierra | Alerta desaparece |

### Portal Edge Cases
| Scenario | Tarea | Precondition | Expected |
|----------|-------|-------------|----------|
| Cliente sin propuestas | T18 | Cliente sin propuestas asignadas | Empty state "No tiene propuestas" |
| Cliente sin casos de servicio | T19 | Cliente sin casos | Empty state |
| Portal en mobile | T17 | Viewport 375px | Layout responsive, touch targets 44px |

### DIAN Edge Cases
| Scenario | Tarea | Precondition | Expected |
|----------|-------|-------------|----------|
| DIAN rechaza factura | T24 | XML inválido | Error "Factura rechazada por DIAN" + detalles |
| DIAN timeout | T24 | Sin respuesta en 30s | Reintento automático |
| CUFE duplicado | T24 | Factura ya emitida | Error "Factura ya fue emitida" |

---

## Commit Strategy

- **T1-T4**: `fix(critical): desc` - Critical bug fixes
- **T5-T10**: `fix(medium): desc` - Medium bug fixes
- **T11-T16**: `fix(low)+feat(foundation): desc` - Low bugs + foundation
- **T17-T20**: `feat(portal): desc` - Portal Cliente
- **T21-T28**: `feat(innovation): desc` - Innovation features
- **F1-F4**: `chore(verification): desc` - Final verification

---

## Appendix C: Test Plan - Playwright Specs to Create

| Spec File | Tasks Covered | Test Cases |
|-----------|---------------|------------|
| `frontend/tests/e2e/qa-critical-bugs.spec.ts` | T1, T2, T3, T4 | 1. Gerente approve proposal. 2. Blocker action link. 3. Fleet document alert |
| `frontend/tests/e2e/qa-medium-bugs.spec.ts` | T5-T10 | 1. Blocker URL dynamic. 2. Map centered Arauca. 3. SLA consistency. 4. Proposal uniqueness |
| `frontend/tests/e2e/qa-low-bugs.spec.ts` | T11-T14 | 1. ERP español. 2. KPI revenue. 3. Notifications drawer. 4. PWA dismiss |
| `frontend/tests/e2e/portal-flow.spec.ts` | T17-T19 | 1. Portal login. 2. Proposals approve. 3. SC view |
| `frontend/tests/e2e/qa-financial-kpis.spec.ts` | T15 | 1. KPI conversion rate. 2. Pipeline value |
| `frontend/tests/e2e/qa-offline-sync.spec.ts` | T27 | 1. Offline queue. 2. Backoff retry. 3. DLQ |
| `frontend/tests/e2e/qa-sla-rules.spec.ts` | T22 | 1. SLA rule config. 2. Alert generation |
| `frontend/tests/e2e/qa-dian.spec.ts` | T24 | 1. DIAN emission. 2. CUFE validation |
| `frontend/tests/e2e/qa-signature.spec.ts` | T23 | 1. Signature pad. 2. Signature save |
| `frontend/tests/e2e/qa-email-notification.spec.ts` | T21 | 1. Email sent on proposal send |

## Appendix D: File Change Manifest

| Task | Files Created | Files Modified | Total | Est. Lines |
|------|--------------|----------------|-------|------------|
| T1 B1 RBAC | 0 | 3 | 3 | 30 |
| T2 B6 Fleet | 1 | 4 | 5 | 120 |
| T3 Bypass | 1 | 3 | 4 | 150 |
| T4 Tests | 1 | 0 | 1 | 80 |
| T5 B2 Block | 0 | 2 | 2 | 40 |
| T6 B4 Map | 0 | 1 | 1 | 10 |
| T7 B5 SLA | 0 | 2 | 2 | 50 |
| T8 B7 Unique | 0 | 3 | 3 | 80 |
| T9 B8 Status | 0 | 1 | 1 | 25 |
| T10 B10 URLs | 1 | 2 | 3 | 60 |
| T11 B3 i18n | 0 | 1 | 1 | 20 |
| T12 B9 KPI | 0 | 2 | 2 | 60 |
| T13 B11 Notif | 1 | 2 | 3 | 150 |
| T14 B12 PWA | 0 | 1 | 1 | 20 |
| T15 Fin KPI | 1 | 3 | 4 | 120 |
| T16 Scaffold | 5 | 3 | 8 | 200 |
| T17 Portal Auth | 0 | 4 | 4 | 100 |
| T18 Portal Prop | 1 | 3 | 4 | 120 |
| T19 Portal SC | 1 | 1 | 2 | 80 |
| T20 Bypass UI | 1 | 2 | 3 | 100 |
| T21 Email | 1 | 1 | 2 | 80 |
| T22 SLA Rules | 3 | 2 | 5 | 200 |
| T23 Firma | 2 | 2 | 4 | 120 |
| T24 DIAN | 2 | 1 | 3 | 180 |
| T25 IA Report | 2 | 2 | 4 | 150 |
| T26 Dispatch | 3 | 2 | 5 | 160 |
| T27 Offline | 0 | 3 | 3 | 100 |
| T28 Versions | 1 | 2 | 3 | 80 |
| **TOTAL** | **28** | **57** | **85** | **~2,385** |

## Appendix E: Performance Budget for New Features

| Feature | Max Latency | Max Bundle Impact | Notes |
|---------|-------------|-------------------|-------|
| Portal login | < 2s | +50KB | Lazy load portal chunk |
| Portal proposals | < 2s | +30KB | Separate from admin bundle |
| SLA rules engine | < 200ms API | 0 bundle | Backend only |
| DIAN integration | < 5s API | 0 bundle | Async, no bundle impact |
| Signature pad | < 500ms | +15KB | Lazy loaded component |
| IA report generator | < 3s API | +20KB | Server-side generation |
| Dispatch map pins | < 1s | +100KB Leaflet | Already loaded |
| Offline queue | 0 (client) | +10KB | Critical path, eager load |
| Email notifications | < 2s API | 0 bundle | Backend only |
| Financial KPIs | < 1s API | +10KB | Reuse existing chart components |

## Appendix F: Environment Variables to Add

```
# Email (T21)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notificaciones@cermont.com
SMTP_PASS=
EMAIL_FROM=notificaciones@cermont.com

# Portal (T17)
PORTAL_JWT_SECRET=
PORTAL_JWT_EXPIRES_IN=30d

# DIAN (T24)
DIAN_PROVIDER=siigo  # siigo | alegra | facturama
DIAN_API_KEY=
DIAN_CERTIFICATE_PATH=./certs/dian.p12
DIAN_CERTIFICATE_PASSWORD=
DIAN_TEST_MODE=true  # true para pruebas, false para producción

# SLA (T22)
SLA_CHECK_INTERVAL=3600000  # 1 hora en ms
SLA_DEFAULT_MAX_DAYS_PER_STEP=30
SLA_DEFAULT_WARNING_DAYS=7

# IA Reports (T25)
IA_REPORT_ENABLED=true
IA_REPORT_TEMPLATE=default
```

## Appendix G: Code Quality Rules for Innovation Features

### Every new feature must include:
1. **Loading state** - Skeleton while data loads
2. **Error state** - Card with error message + retry button
3. **Empty state** - Icon + title + description + CTA
4. **Offline detection** - Banner if no connection
5. **RBAC** - Proper authorize middleware
6. **Audit** - Audit log for state changes
7. **Validation** - Zod schemas for all inputs
8. **TypeScript strict** - No `any`, no `null`, no `undefined`
9. **Responsive** - Mobile-first, 375px min
10. **Accessibility** - aria-labels, keyboard nav, focus visible

### Example: New component template
```tsx
// Template for innovation components
'use client';

import { Skeleton } from '@/core/ui/Skeleton';
import { ErrorState } from '@/core/ui/ErrorState';
import { EmptyState } from '@/core/ui/EmptyState';

interface InnovationFeatureProps {
  // Props here
}

export function InnovationFeature({ }: InnovationFeatureProps) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['innovation-feature'],
    queryFn: () => apiClient.get('/api/innovation-feature'),
  });

  if (isLoading) return <Skeleton variant="card" count={3} />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
  if (!data || data.length === 0) return <EmptyState />;

  return <div>{/* Feature UI */}</div>;
}
```

---

## Appendix H: Complete Route Test Matrix

| Route | Type | Tarea | Playwright Test | Expected Status Code |
|-------|------|-------|-----------------|---------------------|
| GET /login | Public | - | auth-pages.spec.ts | 200 |
| POST /api/auth/login | API | - | auth.spec.ts | 200/401 |
| GET /dashboard | Protected | T15 | dashboard-page.spec.ts | 200 |
| GET /work-requests | Protected | - | work-requests-pages.spec.ts | 200 |
| POST /api/proposals/:id/approve | API | T1 | qa-critical-bugs.spec.ts | 200/403 |
| POST /api/proposals/:id/approve-with-support | API | T3 | qa-critical-bugs.spec.ts | 200 |
| GET /service-cases/:id | Protected | T5 | service-cases-pages.spec.ts | 200 |
| GET /fleet/:id/document-status | API | T2 | qa-critical-bugs.spec.ts | 200 |
| GET /api/dashboard/financial-kpis | API | T15 | qa-financial-kpis.spec.ts | 200 |
| GET /sla | Protected | T7/T22 | qa-sla-rules.spec.ts | 200 |
| GET /dispatch | Protected | T6/T26 | qa-medium-bugs.spec.ts | 200 |
| GET /admin/erp-connectors | Protected | T11 | qa-low-bugs.spec.ts | 200 |
| POST /api/auth/portal-login | API | T17 | portal-flow.spec.ts | 200/401 |
| GET /portal/proposals | Protected | T18 | portal-flow.spec.ts | 200 |
| GET /portal/service-cases | Protected | T19 | portal-flow.spec.ts | 200 |
| POST /api/reports/:id/generate-draft | API | T25 | qa-medium-bugs.spec.ts | 200 |
| POST /api/invoices/:id/emitir-dian | API | T24 | qa-dian.spec.ts | 200/400 |
| POST /api/sync/offline | API | T27 | qa-offline-sync.spec.ts | 200 |
| GET /api/notifications | API | T13 | qa-low-bugs.spec.ts | 200 |
| POST /api/notifications/:id/read | API | T13 | qa-low-bugs.spec.ts | 200 |

## Appendix I: Risk Register

| Risk | Probability | Impact | Mitigation | Contingency |
|------|-------------|--------|------------|-------------|
| T1 RBAC change breaks client approval | Low | High | Test with both gerente and cliente roles | Rollback to original authorize middleware |
| T21 Email not sending in production | Medium | Medium | Log email contents, test with SMTP mock | Manual email copy to client |
| T24 DIAN integration fails | Medium | High | Test mode enabled first, mock DIAN API | Manual invoice emission |
| T22 SLA cron overloads DB | Low | Medium | Rate limit checks to 1/hour | Disable SLA cron, manual check |
| T25 IA report generates incorrect data | Medium | Low | Human review before finalizing | Manual report generation |
| T17 Portal auth security flaw | Low | Critical | Separate JWT secret for portal, strict role check | Immediate JWT revocation |
| T27 Offline queue data loss | Low | Medium | Persist to IndexedDB with redundancy | DLQ review before data loss |
| Scope creep (adding features beyond plan) | High | Medium | Strict "Must NOT Have" enforcement | Defer to next iteration |

---

## Success Criteria

### Verification Commands
```bash
cd frontend && npm run typecheck && npm run lint && npm run build
cd ../backend && npm run typecheck && npm run lint && npm run build
npx playwright test --reporter=html
npx react-doctor@latest
```

### Final Checklist
- [ ] B1: Gerente puede aprobar propuestas (comportamiento verificado)
- [ ] B2: Blocker link apunta a propuesta existente
- [ ] B3: ERP Connectors en español
- [ ] B4: Mapa centrado en Arauca
- [ ] B5: SLA contadores consistentes
- [ ] B6: Fleet documentos validados
- [ ] B7: Propuestas sin duplicados por caso
- [ ] B8: Status consistente documentos tab
- [ ] B9: KPI revenue calculado
- [ ] B10: Blocker/Next URLs consistentes
- [ ] B11: Notificaciones funcionales
- [ ] B12: PWA banner dismissible
- [ ] Portal Cliente funcional con auth
- [ ] Bypass gerente operativo
- [ ] Notificaciones email enviando
- [ ] KPIs financieros en dashboard
- [ ] SLA alertas activas
- [ ] Firma digital funcional
- [ ] DIAN conectada
- [ ] IA informes generando
- [ ] Dispatch geolocalizado
- [ ] typecheck + lint + build exitosos
- [ ] react-doctor 0 issues