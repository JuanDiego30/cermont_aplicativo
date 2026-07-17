# PROMPT MAESTRO — SPEC-022: Coordinación multiagente, protección de trabajo y continuación real CERMONT

Actúa como **Integration Lead + Principal Software Architect + Staff Full Stack Engineer + Release Manager** del monorepo CERMONT.

Tu objetivo NO es volver a auditar indefinidamente. Tu objetivo es:

1. proteger el trabajo ya creado por agentes anteriores;
2. evitar que Claude, OpenCode, Go, ChatGPT u otros agentes se borren cambios entre sí;
3. consolidar el resultado de SPEC-021;
4. continuar la implementación real de las fases pendientes;
5. escalar el aplicativo CERMONT con funcionalidades profesionales sin romper arquitectura, RBAC, FileAsset, PWA/offline ni quality gates.

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
PROMPT_SPEC_021_MODO_EJECUCION_DIRECTA_CERMONT.md
```

---

# 0. Contexto real actual

SPEC-021 ya dejó estos resultados reportados:

- React Doctor local: 100/100.
- `typecheck`: PASS.
- `lint`: PASS.
- `test`: PASS, 1199 tests.
- `build`: PASS.
- `quality:hardcoded-roles`: 0 violations.
- `verify`: PASS.
- `CERMONT_ROLES` creado en `packages/domain`.
- 49 `authorize("string")` migrados a constantes de dominio.
- `check-hardcoded-roles.ts` creado.
- Pre-commit actualizado con `quality:routes` y `quality:hardcoded-roles`.

Pendiente real:

- Commit/PR de SPEC-021 si aún no está confirmado.
- Diferencia React Doctor local vs global latest.
- Sprint 4–6 no deben marcarse como terminados solo porque “ya existía infraestructura”. Deben verificarse contra criterios funcionales y completarse si falta funcionalidad.
- Field Execution + Evidence FSM necesita enriquecimiento real.
- Dashboard OS debe usar datos reales y no solo componentes preexistentes.
- ServiceCase Cockpit debe cumplir los 14 pasos como experiencia profesional.

---

# 1. Problema que debes resolver

El usuario trabaja con varios agentes/modelos. El problema es que los agentes:

- borran archivos entre sí;
- repiten planes;
- cambian trabajo creado por otro agente;
- no terminan la implementación;
- eliminan “dead files” sin entender si son parte de un slice futuro;
- hacen auditoría infinita en vez de desarrollar;
- dicen que algo existe, pero no lo integran en la experiencia real del usuario.

Por tanto, esta SPEC-022 introduce un **protocolo obligatorio multiagente**.

---

# 2. Reglas absolutas multiagente

## 2.1 Prohibido borrar sin protocolo

Queda prohibido ejecutar:

```bash
git reset --hard
git clean -fd
git clean -fdx
rm -rf <archivo-o-carpeta-de-codigo>
```

salvo autorización explícita del usuario y evidencia de que:

1. el archivo no tiene imports;
2. no es ruta App Router;
3. no está exportado por barrels;
4. no está referenciado por tests;
5. no pertenece a otro sprint/agente;
6. se registró en `docs/coordination/DELETION_LOG.md`.

## 2.2 Antes de tocar archivos, crear lock

Cada agente debe crear un archivo de lock:

```txt
.sisyphus/locks/<agent-name>-<slice-name>.lock.md
```

Contenido:

```txt
Agent:
Modelo/Herramienta:
Fecha:
Rama:
Sprint:
Objetivo:
Archivos que planea modificar:
Archivos que NO debe tocar:
Riesgo:
Rollback:
```

Si existe un lock activo sobre el mismo archivo, NO modificarlo. Crear nota en `docs/coordination/CONFLICTS.md`.

## 2.3 Registro obligatorio de cambios

Cada agente debe actualizar:

```txt
docs/coordination/WORK_REGISTRY.md
docs/coordination/AGENT_HANDOFF.md
docs/coordination/FILE_OWNERSHIP.md
docs/coordination/CONFLICTS.md
docs/coordination/DELETION_LOG.md
```

Si no existen, crearlos.

## 2.4 Scope estricto por sprint

Un sprint solo puede tocar archivos declarados en su `Impact Map`.

Si durante implementación aparece necesidad de tocar otro archivo:

1. registrar razón;
2. actualizar lock;
3. actualizar impact map;
4. continuar solo si no hay lock conflictivo.

## 2.5 Commit o patch obligatorio por sprint

Cada sprint debe terminar con una de estas dos salidas:

```bash
git diff > .sisyphus/patches/spec-022-sprint-X.patch
```

O commit:

```bash
git add -A
git commit -m "feat(spec-022): <descripcion-del-sprint>"
```

No dejar trabajo sin commit ni patch.

---

# 3. Rama y recuperación del trabajo existente

## 3.1 Ver estado

```bash
git status --short
git branch --show-current
git log --oneline -10
```

## 3.2 Si SPEC-021 no está commiteada

Primero protegerla:

```bash
mkdir -p .sisyphus/patches
git diff > .sisyphus/patches/spec-021-uncommitted-backup.patch
git add -A
git commit -m "feat(spec-021): direct execution hardening and RBAC SSOT"
```

Si hay archivos untracked relevantes, incluirlos. No descartarlos.

## 3.3 Crear rama SPEC-022

```bash
git checkout -b implement/spec-022-multiagent-continuation
```

Si ya existe:

```bash
git checkout implement/spec-022-multiagent-continuation
```

---

# 4. Crear estructura SPEC-022

Crear:

```txt
specs/022-multiagent-continuation-cermont/
  spec.md
  tasks.md
  implementation-log.md
  sprint-0-protection.md
  sprint-1-servicecase-cockpit.md
  sprint-2-field-execution-evidence-fsm.md
  sprint-3-dashboard-operating-system.md
  sprint-4-planning-readiness.md
  sprint-5-automation-rules-mvp.md
  final-report.md

docs/coordination/
  WORK_REGISTRY.md
  AGENT_HANDOFF.md
  FILE_OWNERSHIP.md
  CONFLICTS.md
  DELETION_LOG.md
```

---

# 5. Sprint 0 — Protección multiagente y estabilización de handoff

## Objetivo

Evitar pérdida de trabajo antes de seguir desarrollando.

## Tareas

1. Crear locks, registros y handoff.
2. Registrar estado actual de SPEC-021.
3. Verificar que `CERMONT_ROLES`, `check-hardcoded-roles.ts` y pre-commit existen.
4. Guardar patch de seguridad.
5. Confirmar que no hay cambios sin registrar.

## Comandos

```bash
git status --short
git diff --name-only
npm run typecheck
npm run lint
npm test
npm run build
npm run verify
```

## Salida obligatoria

```txt
# Sprint 0 — Resultado
Archivos protegidos:
Locks creados:
Patch/commit:
Gates:
Riesgos:
Siguiente sprint:
```

---

# 6. Sprint 1 — Completar ServiceCase Cockpit 14 pasos

## Objetivo

No basta con que exista “infraestructura”. El cockpit debe ser una funcionalidad profesional usable.

Debe mostrar:

1. barra de 14 pasos;
2. estado actual;
3. siguiente acción;
4. bloqueos;
5. documentos faltantes;
6. evidencias faltantes;
7. checklists pendientes;
8. costos estimado vs real;
9. cierre administrativo;
10. timeline auditado;
11. botones RBAC según rol;
12. estados loading/error/empty/offline/forbidden.

## Impact Map obligatorio

Antes de modificar:

```txt
Sprint: 1 ServiceCase Cockpit
Packages:
Backend:
Frontend:
Routes:
Schemas:
RBAC:
Tests:
Docs:
Files locked:
Rollback:
```

## Archivos probables

Inspeccionar y modificar solo si aplica:

```txt
packages/shared-types/src/schemas/service-case-cockpit.schema.ts
packages/shared-types/src/schemas/index.ts
packages/domain/src/operational-steps.ts
packages/domain/src/workflow/
backend/src/modules/service-cases/
frontend/src/modules/cockpit/
frontend/src/modules/service-cases/
frontend/src/app/(dashboard)/service-cases/[id]/
```

## Implementación mínima

### Backend

Confirmar o completar:

```txt
GET /service-cases/:id/cockpit
```

Debe agregar datos reales de:

```txt
service case
work request
planning packet
execution session
evidences
file assets
documents
checklists
costs
SES
invoice
payment
audit logs
```

### Frontend

Crear o completar:

```txt
ServiceCaseCockpitPage
FourteenStepProgress
NextActionCard
BlockersPanel
DocumentRequirementsPanel
EvidenceRequirementsPanel
ChecklistRequirementsPanel
CockpitCostSummaryCard
AdministrativeClosureCard
CockpitAuditTimeline
```

No usar mocks productivos.

### Tests

- backend devuelve cockpit con datos agregados;
- 404 si no existe;
- 403 si rol no autorizado;
- frontend renderiza 14 pasos;
- muestra blockers;
- muestra empty/error/forbidden;
- no hay fetch directo.

## Gates

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run verify
```

---

# 7. Sprint 2 — Field Execution + Evidence FSM real

## Objetivo

Completar ejecución en campo y evidencias como flujo real, no solo componentes sueltos.

## Funcionalidad

Execution Session:

- iniciar;
- pausar;
- finalizar;
- cronómetro;
- offline state;
- sync queue visible;
- novedades/anomalías;
- checklists de campo;
- firma si el soporte existe.

Evidence FSM:

```txt
captured → uploaded → under_review → verified
                         ↘ rejected → replacement_requested → captured
locked → archived
```

Campos/relaciones:

```txt
ownerType
ownerId
phase
source
status
reviewStatus
rejectionReason
replacementOf
usedInReport
lockedByReport
gpsMetadata
qualityScore
```

FileAsset sigue siendo SSOT. No crear MediaAsset.

## Componentes

```txt
ExecutionFieldMode
ExecutionTimer
OfflineSyncStatus
FieldNoveltyForm
EvidenceGallery
EvidenceCaptureButton
EvidenceReviewPanel
EvidenceStatusBadge
EvidenceReplacementDialog
AttachmentDropzone
```

## Tests

- iniciar sesión;
- pausar/finalizar;
- capturar evidencia;
- rechazar con motivo;
- solicitar reemplazo;
- bloquear eliminación si usada en informe;
- RBAC denied;
- offline queue si aplica.

---

# 8. Sprint 3 — Dashboard Operating System con datos reales

## Objetivo

Convertir el dashboard en centro de decisión.

## Debe mostrar

- órdenes abiertas;
- SLA en riesgo;
- evidencias rechazadas;
- documentos faltantes;
- checklists críticos;
- vehículos bloqueados;
- herramientas con certificación vencida;
- costos en riesgo;
- facturas vencidas;
- acciones por rol.

## Backend

Crear o completar endpoints:

```txt
GET /dashboard/operational-kpis
GET /dashboard/next-actions
GET /dashboard/blockers
GET /dashboard/recent-activity
```

Si ya existen, enriquecerlos con datos reales.

## Frontend

```txt
OperatingSystemDashboard
RoleBasedNextActions
CriticalBlockersPanel
OperationalTimeline
CostRiskPanel
AssetReadinessPanel
AdministrativeClosurePanel
```

## Tests

- dashboard no usa mocks;
- muestra estados por rol;
- empty state;
- error state;
- forbidden state;
- KPIs con datos reales.

---

# 9. Sprint 4 — Planning Readiness profesional

## Objetivo

Antes de ejecutar, el sistema debe validar:

- propuesta aprobada;
- técnico asignado;
- certificaciones vigentes;
- vehículo disponible y documentos vigentes;
- herramientas disponibles y calibradas;
- EPP;
- AST;
- permisos;
- kit típico;
- documentos de apoyo.

Usar como referencia el formato de planeación de obra de CERMONT.

## Backend

```txt
GET /planning-packets/:id/readiness
POST /planning-packets/:id/approve
```

Debe devolver:

```txt
canExecute
blockingReasons
warnings
resourceReadiness
vehicleReadiness
toolReadiness
safetyReadiness
documentReadiness
```

## Frontend

```txt
PlanningReadinessPanel
ResourceReadinessChecklist
VehicleReadinessChecklist
ToolReadinessChecklist
SafetyReadinessChecklist
PlanningApprovalActions
```

---

# 10. Sprint 5 — Automation Rules MVP

## Objetivo

Crear primera versión de motor SI-ENTONCES.

Eventos:

```txt
evidence_rejected
vehicle_document_expiring
tool_certificate_expiring
cost_threshold_exceeded
critical_checklist_failed
ses_approved
invoice_overdue
```

Acciones:

```txt
notify
create_task
block_transition
return_to_execution
request_evidence
flag_risk
```

Debe tener:

- modelo/contrato;
- service evaluator;
- endpoint CRUD;
- audit log;
- UI básica para listar/activar/desactivar reglas;
- tests.

No implementar IA todavía.

---

# 11. Orden obligatorio

Ejecutar exactamente:

```txt
Sprint 0: Protección multiagente
Sprint 1: ServiceCase Cockpit 14 pasos
Sprint 2: Field Execution + Evidence FSM
Sprint 3: Dashboard OS
Sprint 4: Planning Readiness
Sprint 5: Automation Rules MVP
```

No crear otro plan maestro antes de terminar Sprint 0 y Sprint 1.

---

# 12. Formato obligatorio de respuesta

Al terminar cada sprint:

```txt
# Sprint X — Resultado

## Código modificado
## Código creado
## Código eliminado
## Funcionalidad implementada
## Tests agregados/modificados
## Comandos ejecutados
## Gates
## Evidencia/patch/commit
## Riesgos abiertos
## Siguiente sprint
```

Si no hay código modificado, el sprint está incompleto.

---

# 13. Definition of Done SPEC-022

SPEC-022 solo se cierra si:

1. Se creó protocolo multiagente.
2. SPEC-021 quedó protegida con commit o patch.
3. No hay trabajo sin registrar.
4. ServiceCase Cockpit 14 pasos funciona como página profesional.
5. Field Execution + Evidence FSM está integrado.
6. Dashboard OS usa datos reales.
7. Planning Readiness valida recursos reales.
8. Automation Rules MVP existe.
9. Typecheck pasa.
10. Lint pasa.
11. Tests pasan.
12. Build pasa.
13. Contracts pasan.
14. Verify pasa.
15. No hay nuevos `any`.
16. No se creó MediaAsset.
17. No se borraron archivos sin protocolo.
18. Cada sprint dejó patch o commit.

Empieza por Sprint 0. Después pasa inmediatamente a Sprint 1 y modifica código real.
