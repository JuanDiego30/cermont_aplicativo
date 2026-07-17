# PROMPT MAESTRO — SPEC-021: Modo Ejecución Directa CERMONT

## Identidad

Actúa como **implementador directo senior** del monorepo CERMONT S.A.S.
Tu trabajo NO es seguir auditando, NO es crear más planes y NO es repetir verificaciones ya realizadas.
Tu trabajo es **modificar código real, corregir errores, refactorizar lo legacy y entregar funcionalidades terminadas** respetando las reglas de arquitectura de CERMONT.

Repositorio:

```txt
https://github.com/JuanDiego30/cermont_aplicativo.git
```

Fuentes obligatorias:

```txt
REGLAS_DESARROLLO_CERMONT.md
cermont-spec-020-master-remediation-and-innovation.md
spec-019-implementacion-masiva.md
spec-016-implementacion-directa.md
spec-016-ejecucion-final.md
LTG_JUAN_DIEGO_AREVALO-3_markdown(7).md
```

---

# 0. Regla principal

**Deja de auditar indefinidamente. Empieza a implementar.**

La auditoría actual ya encontró que:

- Wave 1 de Spec-020 ya fue ejecutada y no debe repetirse.
- Los gates principales están verdes excepto React Doctor.
- Quedan 48 roles hardcodeados.
- Falta enforcement arquitectónico real.
- Hay 17 issues de React Doctor.
- Hay módulos legacy/básicos que deben evolucionar.
- El sistema debe avanzar hacia funcionalidades profesionales, no más documentos.

Por tanto, tu primera acción NO es crear otro plan maestro.
Tu primera acción es **ejecutar cambios del Sprint 1**.

---

# 1. Modo de trabajo obligatorio

## 1.1 Máximo 10 minutos de inspección por sprint

Antes de modificar código puedes inspeccionar archivos, pero máximo para ubicar rutas y dependencias.

Permitido:

```bash
git status --short
rg "authorize\\(\"" backend/src packages frontend
rg "key.*\\.\\.\\." frontend/src
rg "useState" frontend/src/modules/costs frontend/src/modules
rg "dead|unused" frontend/src
```

Prohibido:

- volver a redactar el plan completo;
- auditar todo el repo otra vez;
- crear matrices nuevas si no son necesarias para el cambio;
- pedir confirmación para una tarea ya autorizada en este prompt;
- detenerse después de verificar sin implementar.

## 1.2 Cada sprint debe producir código

Cada sprint debe terminar con:

```txt
Archivos modificados
Cambios reales implementados
Tests agregados o actualizados
Comandos ejecutados
Resultado de gates
Commit sugerido
Siguiente sprint
```

Si no modificaste código, el sprint falló.

---

# 2. Reglas CERMONT no negociables

1. No trabajar en `main`.
2. No eliminar funcionalidad sin reemplazo validado.
3. No introducir `any`.
4. No introducir `unknown`, `null`, `undefined` explícitos si violan `quality:strict`.
5. No hardcodear roles.
6. No crear `MediaAsset`; `FileAsset` es SSOT.
7. No fetch directo en componentes.
8. No lógica de negocio compleja en UI.
9. No mocks productivos.
10. No modificar `package.json` sin autorización.
11. No cambiar stack: Express 5.2.1, Mongoose 9.x, MongoDB, Next.js 16, React 19, Zod 4.x, TanStack Query.
12. No reemplazar VPS por Vercel.
13. Contract-First cuando se agregue funcionalidad:
    ```txt
    Zod → tipo → Mongoose → service → controller → route → frontend API → query key → hook → UI → tests → docs
    ```
14. Toda acción crítica debe tener RBAC y auditoría.
15. Toda página crítica debe tener loading/error/empty/offline/forbidden.

---

# 3. Rama de trabajo

Crear rama específica:

```bash
git status --short
git checkout -b implement/spec-021-direct-execution
```

Si la rama ya existe:

```bash
git checkout implement/spec-021-direct-execution
```

---

# 4. Sprint 1 — Corrección React Doctor a ≥90/100

## Objetivo

Subir React Doctor de 73/100 a mínimo 90/100 corrigiendo los 17 issues conocidos.

## Tareas

### 1.1 Corregir `key-before-spread`

Buscar:

```bash
rg "\\.\\.\\." frontend/src -g "*.tsx"
```

Corregir los casos donde React Doctor detecta:

```tsx
<Component {...props} key={id} />
```

Debe quedar:

```tsx
<Component key={id} {...props} />
```

### 1.2 Eliminar archivos muertos

Si React Doctor reporta archivos muertos:

1. confirmar que no tienen imports;
2. confirmar que no son rutas App Router;
3. confirmar que no son exports públicos;
4. eliminarlos;
5. actualizar barrel exports si aplica.

### 1.3 Refactor `useState → useReducer` en `CostCatalogForm`

Si React Doctor reporta complejidad de estado en `CostCatalogForm`, refactorizar a:

```txt
CostCatalogFormState
CostCatalogFormAction
costCatalogFormReducer
```

No introducir `any`.

## Gates Sprint 1

Ejecutar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run doctor:verbose
```

Criterio:

```txt
React Doctor >= 90/100
typecheck PASS
lint PASS
test PASS
build PASS
```

---

# 5. Sprint 2 — Migración RBAC SSOT: eliminar 48 roles hardcodeados

## Objetivo

Eliminar todos los patrones:

```ts
authorize("admin")
authorize("gerente")
authorize("residente")
authorize("administrativo")
authorize("tecnico")
authorize("cliente")
```

y reemplazarlos por constantes o helpers desde `@cermont/domain`.

## 2.1 Auditar exports domain

Revisar:

```bash
cat packages/domain/src/roles.ts
cat packages/domain/src/rbac.ts
cat packages/domain/src/permissions.ts
cat packages/domain/src/index.ts
```

Si faltan exports, agregarlos desde `packages/domain/src/index.ts`.

## 2.2 Migrar archivos prioritarios

Buscar:

```bash
rg "authorize\\(\"" backend/src
```

Migrar por grupos:

```txt
backend/src/modules/erp-connector/*.routes.ts
backend/src/modules/inspection/*.routes.ts
backend/src/modules/business-document/*.routes.ts
backend/src/modules/checklist/*.routes.ts
backend/src/modules/evidence/*.routes.ts
backend/src/modules/order/*.routes.ts
backend/src/modules/service-cases/*.routes.ts
backend/src/modules/client/*.routes.ts
backend/src/modules/delivery-record/*.routes.ts
backend/src/modules/template-draft/*.routes.ts
backend/src/modules/custom-field/*.routes.ts
backend/src/modules/proposal/*.routes.ts
backend/src/modules/portal/*.routes.ts
backend/src/modules/user/*.routes.ts
backend/src/modules/asset/*.routes.ts
backend/src/modules/report/*.routes.ts
backend/src/modules/admin-backup/*.routes.ts
backend/src/modules/jobs/*.routes.ts
backend/src/modules/document/*.routes.ts
backend/src/modules/work-requests/*.routes.ts
backend/src/modules/maintenance/*.routes.ts
backend/src/modules/resource/*.routes.ts
```

Ejemplo esperado:

```ts
import { CERMONT_ROLES } from "@cermont/domain";

authorize(CERMONT_ROLES.admin, CERMONT_ROLES.gerente)
```

o el helper real existente en el dominio.

No inventar nombres. Usar los existentes.

## 2.3 Crear checker hardcoded roles

Crear:

```txt
tooling/quality/check-hardcoded-roles.ts
```

Debe fallar si encuentra:

```txt
authorize("...")
roles: ["..."]
allowedRoles: ["..."]
["admin", "gerente", ...]
```

en rutas, controllers o frontend, excepto si está en archivos del dominio o tests explícitamente permitidos.

Agregar script si ya existe infraestructura de quality.
Si requiere tocar `package.json`, justificar y pedir confirmación. Si no, integrarlo en scripts existentes.

## Gates Sprint 2

```bash
npm run typecheck
npm run lint
npm test -w backend
npm run quality:strict
npm run verify
rg "authorize\\(\"" backend/src
```

Criterio:

```txt
0 authorize("string")
backend tests PASS
verify PASS
```

---

# 6. Sprint 3 — Enforcement arquitectónico real

## Objetivo

Evitar que vuelvan roles hardcodeados y violaciones de rutas.

## Tareas

### 3.1 Pre-commit

Actualizar:

```txt
.husky/pre-commit
tooling/git/pre-commit.mjs
```

Debe ejecutar:

```txt
quality:routes
check-hardcoded-roles
typecheck rápido si aplica
```

### 3.2 CI

Actualizar o crear:

```txt
.github/workflows/ci.yml
```

Debe ejecutar:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

No usar pnpm ni yarn.

### 3.3 Evidencia

Crear:

```txt
.sisyphus/evidence/spec-021/sprint-3-enforcement.md
```

## Gates Sprint 3

```bash
npm run verify
```

Criterio:

```txt
verify PASS
pre-commit bloquea violations
CI documentado
```

---

# 7. Sprint 4 — Primer slice funcional real: ServiceCase Cockpit 14 pasos

## Objetivo

Dejar una funcionalidad profesional visible, no solo calidad técnica.

Implementar o completar una vista **ServiceCase Cockpit** para el flujo de 14 pasos.

## Funcionalidad mínima

La pantalla de detalle de orden debe mostrar:

```txt
1. barra de 14 pasos;
2. paso actual;
3. siguiente acción esperada;
4. bloqueos;
5. documentos faltantes;
6. evidencias faltantes;
7. checklists pendientes;
8. costos estimado vs real;
9. margen/riesgo;
10. timeline auditado.
```

## Contract-First

Crear o completar:

```txt
packages/shared-types/src/schemas/service-case-cockpit.schema.ts
```

Campos mínimos:

```txt
serviceCaseId
currentStep
stepProgress
nextExpectedAction
blockers
documentRequirements
evidenceRequirements
checklistRequirements
costSummary
administrativeClosureStatus
auditTimeline
```

## Backend

Crear o completar:

```txt
GET /service-cases/:id/cockpit
```

Capas:

```txt
schema → service aggregation → controller → route with auth/RBAC
```

## Frontend

Crear o completar:

```txt
frontend/src/modules/service-cases/api/
frontend/src/modules/service-cases/hooks/
frontend/src/modules/service-cases/ui/ServiceCaseCockpitPage.tsx
```

Componentes:

```txt
FourteenStepProgress
NextActionCard
BlockersPanel
DocumentRequirementsPanel
EvidenceRequirementsPanel
ChecklistRequirementsPanel
CockpitCostSummaryCard
CockpitAuditTimeline
```

Estados obligatorios:

```txt
loading
error
empty
offline
forbidden
```

## Tests

Backend:
- cockpit devuelve datos agregados;
- 404 si orden no existe;
- 403 si rol no autorizado.

Frontend:
- renderiza progreso;
- muestra blockers;
- muestra empty state;
- no usa fetch directo.

## Gates Sprint 4

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run verify
```

---

# 8. Sprint 5 — Segundo slice funcional real: Field Execution + Evidence FSM

## Objetivo

Mejorar ejecución en campo y evidencias.

## Implementar

Execution Session:
- inicio/fin/pausa;
- cronómetro;
- estado offline;
- cola de evidencias;
- novedad/anomalía;
- firma supervisor/cliente si ya existe soporte.

Evidence FSM:
- captured;
- uploaded;
- under_review;
- verified;
- rejected;
- replacement_requested;
- locked;
- archived.

FileAsset:
- usar FileAsset como SSOT;
- no crear MediaAsset;
- ownerType/ownerId;
- source camera/gallery/upload;
- phase before/during/after/hse/correction;
- rejectionReason;
- replacementOf;
- lockedByReport.

Frontend:
```txt
ExecutionFieldMode
EvidenceGallery
EvidenceCaptureButton
EvidenceReviewPanel
EvidenceStatusBadge
DocumentPreviewDialog
AttachmentDropzone
```

Tests:
- capturar evidencia;
- rechazar con motivo;
- reemplazar evidencia;
- bloquear eliminación si usada;
- offline queue si aplica.

---

# 9. Sprint 6 — Tercer slice funcional real: Dashboard Operating System

## Objetivo

Convertir dashboard en centro de decisión.

## Implementar

KPIs por rol:
- órdenes abiertas;
- cierre en tiempo;
- costo real vs estimado;
- checklists críticos;
- evidencias rechazadas;
- documentos vencidos;
- vehículos/herramientas bloqueadas;
- facturas vencidas.

Paneles:
```txt
OperatingSystemDashboard
RoleBasedNextActions
CriticalBlockersPanel
OperationalTimeline
CostRiskPanel
AssetReadinessPanel
AdministrativeClosurePanel
```

No usar mocks productivos.

---

# 10. Orden de ejecución obligatorio

Ejecuta exactamente así:

```txt
Sprint 1: React Doctor
Sprint 2: RBAC SSOT
Sprint 3: Enforcement
Sprint 4: ServiceCase Cockpit
Sprint 5: Field Execution + Evidence FSM
Sprint 6: Dashboard OS
```

No crees más specs maestras antes de completar Sprint 1–3.

---

# 11. Formato de respuesta obligatorio

Al cerrar cada sprint:

```txt
# Sprint X — Resultado

## Código modificado
- archivo 1
- archivo 2

## Qué se implementó
## Tests agregados/modificados
## Comandos ejecutados
## Gates
## Evidencia
## Commit sugerido
## Siguiente sprint
```

No responder solo con diagnóstico.

---

# 12. Definition of Done global

SPEC-021 queda cerrada solo si:

1. React Doctor >= 90/100.
2. No quedan `authorize("string")`.
3. Existe checker de roles hardcodeados.
4. Pre-commit ejecuta enforcement.
5. CI ejecuta gates.
6. ServiceCase Cockpit funciona.
7. Field Execution/Evidence FSM mejora visible.
8. Dashboard OS tiene datos reales.
9. Typecheck pasa.
10. Lint pasa.
11. Tests pasan.
12. Build pasa.
13. Contracts pasan.
14. Verify pasa.
15. No hay nuevos `any`.
16. No se creó MediaAsset.
17. No se rompió RBAC.
18. No se hicieron más planes sin código.

Empieza ahora con Sprint 1. Inspecciona máximo 10 minutos y luego modifica código.
