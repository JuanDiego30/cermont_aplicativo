# PROMPT MAESTRO — SPEC-024: Revisión GitHub, consolidación multiagente y continuación real CERMONT

## Identidad del agente

Actúa como **Tech Lead implementador + Release Manager + Arquitecto de Software + Revisor de PR + Full Stack Senior** del monorepo CERMONT.

Tu objetivo NO es volver a escribir otro plan maestro gigante. Tu objetivo es:

1. **consolidar lo que ya hizo SPEC-022**;
2. **asegurarte de que esté subido a GitHub**;
3. **evitar que otro agente borre o pise trabajo**;
4. **reparar cualquier gate roto real**;
5. **continuar desarrollando funcionalidades profesionales**, especialmente las que vuelven CERMONT menos básico y más parecido a un software FSM/GMAO/ERP comercial.

Repositorio:

```txt
https://github.com/JuanDiego30/cermont_aplicativo.git
```

Rama base real del repositorio:

```txt
deploy/vps-clean
```

Rama esperada de trabajo SPEC-022:

```txt
implement/spec-022-multiagent-continuation
```

Rama nueva para esta continuación:

```txt
implement/spec-024-post-spec022-continuation
```

---

# 0. Contexto obligatorio

El informe de SPEC-022 dice que se hicieron estos commits locales:

```txt
d29cc27 — Cockpit 14 pasos con datos reales
6ef2de4 — Evidence FSM + ReplacementDialog
3b8ec4f — EvidenceStatusBadge + galería
3586fce — Dashboard OS endpoints dedicados
b332b6d — Planning Readiness + Automation MVP
```

Pero antes de continuar debes validar si esos commits existen en GitHub. Si no existen, el trabajo está en riesgo porque otros agentes no lo pueden revisar ni tomar como base.

El problema actual del equipo multiagente es:

```txt
varios agentes trabajan en ramas/carpetas distintas;
algunos borran archivos que otros restauran;
algunos no empujan sus commits;
algunos crean planes pero no implementan;
algunos verifican demasiado y no codean;
los cambios se pierden porque no hay handoff real.
```

Tu misión es corregir eso.

---

# 1. Reglas de coordinación multiagente

## 1.1 Prohibiciones absolutas

Está prohibido:

```bash
git reset --hard
git clean -fd
git clean -fdx
rm -rf
Remove-Item -Recurse -Force
```

sin autorización explícita del usuario y sin crear antes un patch de respaldo.

También está prohibido:

- borrar archivos restaurados por otro agente;
- tocar archivos fuera de tu lock;
- reescribir historia pública con force push;
- cambiar rama base sin avisar;
- mezclar 5 features en un solo commit;
- declarar que algo está terminado si no está subido o respaldado;
- cerrar sprint solo con diagnóstico.

## 1.2 Worktree obligatorio para agentes paralelos

Si otro agente ya está trabajando en la carpeta principal, NO trabajes allí.

Crear worktree:

```bash
cd C:\Users\camil\Downloads\cermont_aplicativo
mkdir worktrees 2>$null
cd cermont_aplicativo
git fetch origin --all --prune
git worktree add ..\worktrees\cermont-spec-024 origin/deploy/vps-clean
cd ..\worktrees\cermont-spec-024
git checkout -b implement/spec-024-post-spec022-continuation
```

Si ya existe la rama local:

```bash
git checkout implement/spec-024-post-spec022-continuation
```

## 1.3 Locks obligatorios

Crear:

```txt
.sisyphus/locks/spec-024.lock.md
docs/coordination/WORK_REGISTRY.md
docs/coordination/AGENT_HANDOFF.md
docs/coordination/FILE_OWNERSHIP.md
docs/coordination/CONFLICTS.md
docs/coordination/DELETION_LOG.md
docs/coordination/CURRENT_SOURCE_OF_TRUTH.md
```

El lock debe decir:

```txt
Agent:
Model:
Branch:
Worktree path:
Sprint:
Files owned:
Files forbidden:
Started at:
Expected end:
```

Antes de tocar un archivo, registrarlo en `FILE_OWNERSHIP.md`.

---

# 2. Reglas técnicas CERMONT no negociables

1. No eliminar funcionalidad sin reemplazarla, mejorarla o escalarla.
2. Contract-First:
   ```txt
   Zod → tipo → Mongoose → service → controller → route → frontend api → query key → hook → UI → tests → docs
   ```
3. `FileAsset` es SSOT para archivos, fotos, evidencias, documentos y adjuntos.
4. No crear `MediaAsset`.
5. No introducir `any`.
6. No introducir `unknown`, `null`, `undefined` explícitos si violan `quality:strict`.
7. No hardcodear roles.
8. RBAC debe venir de `@cermont/domain`.
9. No fetch directo en componentes.
10. No lógica de negocio compleja en UI.
11. No mocks productivos.
12. No modificar `package.json` sin justificación y sin verificar impacto.
13. No reemplazar VPS por Vercel.
14. Toda página crítica debe tener loading/error/empty/offline/forbidden.
15. Toda acción crítica debe tener auditoría.
16. Mutaciones críticas deben ser idempotentes.
17. Cada sprint debe producir código real.
18. Cada sprint debe dejar commit o patch.

---

# 3. Fase A — Verificación GitHub de SPEC-022

## Objetivo

Confirmar si los commits de SPEC-022 están realmente en GitHub.

## Comandos

```bash
git fetch origin --all --prune
git branch -a | grep spec-022 || true
git log --oneline --all --decorate --grep="SPEC-022" -n 20
git log --oneline --all --decorate | grep -E "b332b6d|3586fce|3b8ec4f|6ef2de4|d29cc27|4651e4b" || true
```

## Decisión

### Caso 1 — Los commits NO están en GitHub

Detener cualquier nueva feature y hacer esto:

```bash
git checkout implement/spec-022-multiagent-continuation
git status --short
git log --oneline -n 10
npm run verify
```

Si `verify` pasa:

```bash
git push -u origin implement/spec-022-multiagent-continuation
```

Si `verify` NO pasa:

```bash
git diff > .sisyphus/patches/spec-022-unverified-current.patch
git format-patch origin/deploy/vps-clean..HEAD -o .sisyphus/patches/spec-022-format-patches
```

Crear:

```txt
docs/coordination/SPEC_022_PUSH_STATUS.md
```

con:

```txt
Branch:
Last commit:
Verify result:
Pushed: yes/no
Patch backup path:
Blocking errors:
Next action:
```

### Caso 2 — Los commits SÍ están en GitHub

Crear PR draft:

```txt
Base: deploy/vps-clean
Head: implement/spec-022-multiagent-continuation
Title: feat(spec-022): cockpit, evidence fsm, dashboard os, planning readiness and automation mvp
```

No hacer merge todavía. Primero revisar.

---

# 4. Fase B — Revisión técnica de SPEC-022 antes de continuar

## Objetivo

Verificar que SPEC-022 no solo compiló, sino que realmente implementó funcionalidad útil sin romper arquitectura.

## Archivos a revisar

```txt
frontend/src/modules/cockpit/model/cockpit.types.ts
frontend/src/modules/cockpit/api/cockpit.api.ts
frontend/src/modules/cockpit/utils/cockpitTransformer.ts
frontend/src/app/(dashboard)/service-cases/[id]/cockpit/page.tsx
frontend/src/modules/evidences/ui/EvidenceReplacementDialog.tsx
frontend/src/modules/evidences/ui/EvidenceStatusBadge.tsx
frontend/src/modules/evidences/ui/EvidenceGallery.tsx
backend/src/modules/dashboard/dashboard.controller.ts
backend/src/modules/dashboard/dashboard.routes.ts
frontend/src/modules/planning/ui/ReadinessGate.tsx
backend/src/modules/automation/automation.controller.ts
backend/src/modules/automation/automation.service.ts
backend/src/modules/automation/automation.routes.ts
frontend/src/modules/automation/ui/RulesEngineConfig.tsx
```

## Validar

1. ¿Los endpoints del Dashboard OS existen y están montados?
2. ¿El Cockpit consume datos reales o solo transforma vacío?
3. ¿Evidence FSM usa FileAsset y no MediaAsset?
4. ¿ReplacementDialog llama endpoint real?
5. ¿Planning Readiness representa reglas reales del backend?
6. ¿Automation MVP tiene contrato, service, controller, route, frontend hook y UI?
7. ¿Los 7 archivos restaurados tienen uso real o quedaron huérfanos?
8. ¿Hay tests nuevos o solo pasó el baseline?
9. ¿Se ejecutó `quality:strict` y `verify`, no solo typecheck/lint/test/build?

Crear:

```txt
specs/024-post-spec022-continuation/spec-022-review.md
```

Tabla:

| Módulo | Cambio SPEC-022 | Confirmado en código | Tests | Riesgo | Acción |
|---|---|---|---|---|---|

---

# 5. Fase C — Reparar gates reales antes de nuevas features

## Contexto

Si `npm run verify` falla por `quality:weak-tokens`, NO avances a nuevas funcionalidades.

Ejemplo de falla observada:

```txt
weak-token-a: 73/72 above baseline
weak-token-n: 1519/1510 above baseline
weak-token-u: dentro o fuera según salida
weak-token-ud: dentro o fuera según salida
```

## Regla

No hacer baseline bump silencioso.

## Acciones

1. Ejecutar:

```bash
npm run quality:weak-tokens
```

2. Guardar salida:

```txt
.sisyphus/evidence/spec-024/quality-weak-tokens-before.txt
```

3. Separar tokens:

```txt
nuevos de SPEC-022
preexistentes
falsos positivos
necesarios por librería
```

4. Corregir primero tokens nuevos.

5. Solo si son deuda histórica ya aceptada, actualizar baseline con justificación en:

```txt
docs/TECHNICAL_DEBT.md
specs/024-post-spec022-continuation/weak-token-decision.md
```

## Objetivo mínimo

```bash
npm run quality:strict
npm run verify
```

ambos deben pasar antes de Sprint funcional.

---

# 6. Sprint 1 — Completar tests reales de SPEC-022

## Objetivo

No basta con que pasen los tests existentes. Hay que agregar tests para lo que SPEC-022 dice que implementó.

## Backend tests mínimos

### Dashboard OS

Crear o actualizar:

```txt
backend/src/modules/dashboard/dashboard.routes.test.ts
backend/src/modules/dashboard/dashboard.controller.test.ts
```

Validar:

```txt
GET /dashboard/next-actions
GET /dashboard/blockers
GET /dashboard/recent-activity
```

Casos:

- responde `{ success: true, data }`;
- requiere auth;
- respeta RBAC;
- no devuelve mocks fijos;
- maneja usuario sin datos.

### Automation MVP

Crear o actualizar:

```txt
backend/src/modules/automation/automation.routes.test.ts
backend/src/modules/automation/automation.service.test.ts
```

Casos:

- crear regla;
- listar reglas;
- activar/desactivar;
- ejecutar evento simulado;
- idempotencia;
- RBAC denied.

### Evidence FSM

Crear o actualizar:

```txt
backend/src/modules/evidence/evidence.fsm.test.ts
```

Casos:

- verify;
- review;
- reject con razón;
- replace;
- lock;
- no borrar locked;
- descarga auditada.

## Frontend tests mínimos

```txt
frontend/src/modules/evidences/ui/EvidenceReplacementDialog.test.tsx
frontend/src/modules/evidences/ui/EvidenceStatusBadge.test.tsx
frontend/src/modules/cockpit/utils/cockpitTransformer.test.ts
frontend/src/modules/planning/ui/ReadinessGate.test.tsx
```

---

# 7. Sprint 2 — Profesionalizar ServiceCase Cockpit 14 pasos

## Objetivo

Hacer que `/service-cases/[id]/cockpit` sea el centro operativo real de una orden.

## Debe mostrar

```txt
1. Header de orden
2. Barra de 14 pasos
3. Paso actual
4. Siguiente acción esperada
5. Bloqueos
6. Documentos requeridos
7. Evidencias requeridas
8. Checklists pendientes
9. Costos estimado vs real
10. Riesgo de margen
11. Estado administrativo
12. Timeline auditado
13. Acciones rápidas por rol
14. Estado offline/forbidden/error/empty
```

## Contract-First

Si falta contrato, crear o completar:

```txt
packages/shared-types/src/schemas/service-case-cockpit.schema.ts
```

Con:

```txt
ServiceCaseCockpitSchema
OperationalStepProgressSchema
NextExpectedActionSchema
ServiceCaseBlockerSchema
DocumentRequirementSchema
EvidenceRequirementSchema
ChecklistRequirementSchema
CockpitCostSummarySchema
AdministrativeClosureSummarySchema
CockpitTimelineEventSchema
```

## Backend

Endpoint:

```txt
GET /service-cases/:id/cockpit
```

No debe inventar datos. Debe agregar desde módulos reales:

```txt
service-cases
work-requests
site-visits
proposals
purchase-orders
planning-packet
execution-session
evidence
technical-report
delivery-record
service-entry-sheet
invoice
payment
cost
audit
```

## Frontend

Componentes:

```txt
ServiceCaseCockpitPage
FourteenStepProgress
CurrentStepCard
NextActionCard
BlockersPanel
DocumentRequirementsPanel
EvidenceRequirementsPanel
ChecklistRequirementsPanel
CockpitCostSummaryCard
AdministrativeClosurePanel
CockpitAuditTimeline
CockpitQuickActions
```

---

# 8. Sprint 3 — Evidence FSM + FileAsset profesional

## Objetivo

Pasar de galería básica a motor profesional de evidencia.

## Estados permitidos

```txt
captured
uploaded
pending_review
under_review
approved
rejected
replacement_requested
locked
archived
```

## Funcionalidad

- evidencia por fase: before/during/after/hse/correction/finding;
- ownerType/ownerId obligatorio;
- FileAsset SSOT;
- reemplazo controlado;
- rechazo con motivo;
- bloqueo si está usada en informe o acta;
- auditoría de visualización/descarga;
- badge visual;
- filtros por orden, fase, estado, usuario;
- mobile-first.

---

# 9. Sprint 4 — Planning Readiness completo

## Objetivo

Planeación profesional antes de ejecución.

## Reglas mínimas

```txt
propuesta aprobada
PO asociada si aplica
técnicos asignados
certificaciones vigentes
vehículo con documentos vigentes
herramientas calibradas
EPP completo
AST/PTW requerido
kit típico completo
evidencias pre-ejecución requeridas
```

## Endpoint

```txt
GET /planning-packets/:id/readiness
POST /planning-packets/:id/approve
```

El botón de aprobar planeación debe quedar bloqueado si fallan reglas críticas.

---

# 10. Sprint 5 — Automation Rules MVP real

## Objetivo

Hacer que automatizaciones sirvan para operación real.

## Eventos iniciales

```txt
evidence_rejected
vehicle_document_expiring
tool_certificate_expiring
cost_threshold_exceeded
critical_checklist_failed
ses_approved
invoice_overdue
planning_ready
execution_completed
```

## Acciones iniciales

```txt
notify
create_task
block_transition
return_to_execution
request_evidence
flag_risk
create_invoice_task
```

## Regla

No basta con CRUD. Debe existir ejecución real de reglas ante al menos 3 eventos.

---

# 11. Sprint 6 — Dashboard OS real

## Objetivo

El dashboard debe responder: **qué está pasando, qué está bloqueado y qué debo hacer ahora**.

## KPIs

```txt
órdenes abiertas
órdenes bloqueadas
cierre a tiempo
costos en riesgo
evidencias rechazadas
documentos vencidos
herramientas/vehículos bloqueados
facturas vencidas
pagos pendientes
SLA en riesgo
```

## Paneles

```txt
RoleBasedNextActions
CriticalBlockersPanel
OperationalTimeline
CostRiskPanel
AssetReadinessPanel
AdministrativeClosurePanel
```

No usar mocks.

---

# 12. Sprint 7 — Preparar PR y handoff para siguiente agente

Crear:

```txt
docs/coordination/SPEC_024_HANDOFF.md
specs/024-post-spec022-continuation/final-report.md
```

Debe incluir:

```txt
Branch:
Base:
Commits:
Files modified:
Tests added:
Gates:
Known risks:
Files locked:
Files free for next agent:
Next recommended sprint:
```

Abrir PR draft si es posible.

---

# 13. Gates obligatorios por sprint

Al final de cada sprint:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

Si falta tiempo, mínimo para cambios de backend:

```bash
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run quality:strict
```

Para cambios frontend:

```bash
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
```

Pero antes de cerrar PR siempre ejecutar `npm run verify` completo.

---

# 14. Formato de salida obligatorio

Nunca respondas solo con diagnóstico. Cada sprint debe reportar:

```txt
# Sprint N — Resultado

## Código modificado
## Tests creados/modificados
## Funcionalidad implementada
## Gates ejecutados
## Errores pendientes
## Commit realizado o patch creado
## PR/handoff
## Siguiente paso exacto
```

---

# 15. Primeras instrucciones exactas para empezar ahora

Ejecuta en orden:

```bash
git fetch origin --all --prune
git branch -a | grep spec-022 || true
git log --oneline --all --decorate | grep -E "b332b6d|3586fce|3b8ec4f|6ef2de4|d29cc27|4651e4b" || true
```

Si no aparecen, ve a la carpeta local donde el agente terminó SPEC-022 y ejecuta:

```bash
git status --short
git log --oneline -n 10
npm run verify
```

Si pasa:

```bash
git push -u origin implement/spec-022-multiagent-continuation
```

Si falla:

```bash
git diff > .sisyphus/patches/spec-022-current-failing.patch
git format-patch origin/deploy/vps-clean..HEAD -o .sisyphus/patches/spec-022-format-patches
```

Después crea `SPEC_022_PUSH_STATUS.md` y continúa con Fase B.

