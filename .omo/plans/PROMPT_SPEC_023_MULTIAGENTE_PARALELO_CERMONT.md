# PROMPT MAESTRO — SPEC-023: Ejecución Paralela Multiagente sin Conflictos para CERMONT

## Identidad del agente paralelo

Actúa como **Parallel Implementation Agent B** del monorepo CERMONT S.A.S.

Tu misión no es volver a auditar todo el proyecto ni crear otro plan maestro. Tu misión es **trabajar en paralelo sin pisar al agente principal**, corregir el gate que está fallando, implementar cambios reales y luego avanzar en un slice funcional o de innovación profesional.

Repositorio:

```txt
https://github.com/JuanDiego30/cermont_aplicativo.git
```

Contexto actual reportado por el usuario:

```txt
npm run verify falla únicamente en quality:strict → quality:weak-tokens.
Typecheck PASS.
Lint PASS.
Backend tests PASS: 102 suites, 681 tests.
Frontend tests PASS: 64 suites, 260 tests.
Build PASS: 95 rutas, 242 precache entries.
Contracts PASS.
quality:hardcoded-roles PASS.
React Doctor local fue corregido previamente.
```

Error actual:

```txt
Weak token quality check: 3084 findings
- weak-token-a: 73/72 above baseline
- weak-token-n: 1519/1510 above baseline
- weak-token-u: 711/714 within baseline
- weak-token-ud: 781/781 within baseline

quality:strict FAIL porque hay nuevos hallazgos por encima del baseline.
```

Archivos reportados por el error:

```txt
backend/src/common/docs/api-docs.ts
backend/src/common/fsm/fsm-engine.ts
backend/src/common/security/mongo-rate-limit.store.ts
backend/src/config/env.ts
backend/src/config/kit-templates.ts
backend/src/index.ts
backend/src/middlewares/audit-log.middleware.ts
backend/src/middlewares/idempotency.middleware.ts
backend/src/middlewares/rate-limiter.ts
backend/src/middlewares/sanitize.middleware.ts
backend/src/middlewares/uploadMiddleware.ts
backend/src/middlewares/validate.ts
backend/src/models/Document.ts
backend/src/models/EvidenceCollection.ts
backend/src/models/FileAsset.ts
backend/src/models/FormSubmission.ts
backend/src/models/Inspection.ts
backend/src/models/Kit.ts
```

---

# 0. Problema que debes resolver

El proyecto está siendo trabajado por varios agentes y modelos: Claude, OpenCode, Go, ChatGPT y otros. El problema es que entre agentes:

1. se borran archivos;
2. se pisan cambios;
3. se repiten auditorías;
4. se dejan planes sin implementar;
5. se actualizan snapshots o baselines sin resolver causa raíz;
6. se generan ramas incompatibles;
7. se pierde trabajo ya hecho.

Tu trabajo debe resolver esto con una política clara:

```txt
un agente = una rama/worktree = un lock = un scope = un patch/commit pequeño
```

---

# 1. Regla principal

**No hagas otra auditoría completa. No hagas un plan maestro nuevo. Ejecuta.**

Primero debes arreglar el gate roto `quality:strict` sin pisar el trabajo del agente principal. Luego debes implementar un slice funcional acotado que no toque los archivos del otro agente.

---

# 2. Coordinación multiagente obligatoria

## 2.1 No trabajar en la misma carpeta si otro agente está activo

Si otro agente está usando:

```txt
C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo
```

NO trabajes sobre esa misma carpeta.

Usa `git worktree`:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git worktree list
```

Crear worktree paralelo:

```bash
git worktree add ../cermont_spec_023_parallel -b implement/spec-023-parallel-quality-and-automation
cd ../cermont_spec_023_parallel
```

Si el worktree ya existe:

```bash
cd ../cermont_spec_023_parallel
git status --short
git branch --show-current
```

## 2.2 Prohibiciones absolutas en modo multiagente

Prohibido ejecutar:

```bash
git reset --hard
git clean -fd
git clean -fdx
rm -rf .
rm -rf frontend/src/modules
rm -rf backend/src/modules
rm -rf packages
```

Prohibido borrar archivos sin registrar:

```txt
ruta del archivo
quién lo creó
por qué se elimina
qué imports lo usan
qué test cubre la eliminación
qué reemplazo queda
```

## 2.3 Crear registro de coordinación

Crear o actualizar:

```txt
docs/coordination/WORK_REGISTRY.md
docs/coordination/AGENT_HANDOFF.md
docs/coordination/FILE_OWNERSHIP.md
docs/coordination/CONFLICTS.md
docs/coordination/DELETION_LOG.md
.sisyphus/locks/spec-023-parallel-agent-b.lock.md
```

Contenido mínimo del lock:

```md
# Lock — SPEC-023 Parallel Agent B

Agent: Parallel Implementation Agent B
Branch: implement/spec-023-parallel-quality-and-automation
Worktree: ../cermont_spec_023_parallel
Start commit: <git rev-parse HEAD>
Scope:
  - quality:strict weak-token remediation in selected backend core files
  - automation rules MVP only if Sprint 1 passes
Forbidden paths:
  - frontend/src/modules/service-cases/** unless explicitly unlocked
  - frontend/src/modules/cockpit/** unless explicitly unlocked
  - frontend/src/modules/execution/** unless explicitly unlocked
  - frontend/src/modules/evidences/** unless explicitly unlocked
  - frontend/src/modules/dashboard/** unless explicitly unlocked
  - packages/shared-types/src/schemas/service-case-cockpit.schema.ts unless explicitly unlocked
  - backend/src/modules/service-cases/** unless explicitly unlocked
  - backend/src/modules/execution-session/** unless explicitly unlocked
  - backend/src/modules/evidence/** unless explicitly unlocked
Delete policy: no deletion without DELETION_LOG entry
Merge policy: patch/PR only after verify passes
```

---

# 3. Reglas CERMONT no negociables

Sigue `REGLAS_DESARROLLO_CERMONT.md`:

1. No eliminar funcionalidad sin reemplazarla, mejorarla o escalarla de forma verificada.
2. No duplicar schemas Zod.
3. No duplicar rutas.
4. No duplicar roles.
5. No crear módulos paralelos.
6. `FileAsset` es SSOT para archivos, evidencias, fotos y documentos.
7. No crear `MediaAsset`.
8. No introducir `any`.
9. No introducir `unknown`, `null`, `undefined` explícitos si violan `quality:strict`.
10. No hardcodear roles.
11. No fetch directo en componentes.
12. No lógica de negocio compleja en UI.
13. No mocks productivos.
14. No modificar `package.json` sin justificación y sin revisar scripts existentes.
15. No cambiar stack tecnológico.
16. No reemplazar VPS por Vercel.
17. Todo cambio crítico debe tener pruebas.
18. Toda acción crítica debe auditarse.
19. Mutaciones críticas deben ser idempotentes.
20. No cerrar sprint solo con diagnóstico.

---

# 4. División de trabajo con el agente principal

Asume que el agente principal puede estar trabajando en:

```txt
ServiceCase Cockpit
Field Execution
Evidence FSM
Dashboard OS
Planning Readiness
```

Por tanto, este agente paralelo NO debe tocar esos módulos durante Sprint 1–2, salvo autorización explícita.

Tu scope inicial es:

```txt
Sprint 0 — coordinación y worktree
Sprint 1 — reparar quality:strict weak-token sobre backend core
Sprint 2 — enforcement anti-regresión weak-token/hardcoded-roles si no existe
Sprint 3 — Automation Rules MVP o Planning Readiness solo si no hay conflicto
```

---

# 5. Sprint 0 — Preparación segura multiagente

## Objetivo

Crear un entorno de trabajo paralelo sin tocar el trabajo del otro agente.

## Comandos

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git worktree list
```

Si estás en la carpeta principal usada por otro agente:

```bash
git worktree add ../cermont_spec_023_parallel -b implement/spec-023-parallel-quality-and-automation
cd ../cermont_spec_023_parallel
```

Crear registros:

```bash
mkdir -p docs/coordination .sisyphus/locks .sisyphus/evidence/spec-023/sprint-0
```

Crear o actualizar los archivos de coordinación mencionados.

## Entregable Sprint 0

```txt
docs/coordination/WORK_REGISTRY.md
docs/coordination/AGENT_HANDOFF.md
docs/coordination/FILE_OWNERSHIP.md
docs/coordination/CONFLICTS.md
docs/coordination/DELETION_LOG.md
.sisyphus/locks/spec-023-parallel-agent-b.lock.md
```

## Prohibición

No cambies código productivo en Sprint 0.

---

# 6. Sprint 1 — Reparar quality:strict sin esconder deuda

## Objetivo

Hacer que `npm run quality:strict` y `npm run verify` vuelvan a pasar sin subir baseline silenciosamente.

## Regla clave

No actualices baseline como primera opción.

Primero corrige los tokens nuevos que exceden baseline:

```txt
weak-token-a: 73/72 → corregir mínimo 1 nuevo any
weak-token-n: 1519/1510 → corregir mínimo 9 nuevos null
```

Aunque el output liste `unknown` y `undefined`, esos están dentro del baseline reportado. No intentes refactorizar 3000 hallazgos históricos en un solo sprint.

## 6.1 Identificar delta real

Ejecutar:

```bash
npm run quality:weak-tokens
```

Buscar si existe salida JSON o herramienta con diff:

```bash
ls tooling/quality
cat tooling/quality/check-weak-tokens.ts
```

Si no hay diff automático, usar el output actual y priorizar los archivos listados.

## 6.2 Archivos permitidos en Sprint 1

Solo puedes tocar estos archivos, salvo justificación en `CONFLICTS.md`:

```txt
backend/src/common/docs/api-docs.ts
backend/src/common/fsm/fsm-engine.ts
backend/src/common/security/mongo-rate-limit.store.ts
backend/src/config/env.ts
backend/src/config/kit-templates.ts
backend/src/index.ts
backend/src/middlewares/audit-log.middleware.ts
backend/src/middlewares/idempotency.middleware.ts
backend/src/middlewares/rate-limiter.ts
backend/src/middlewares/sanitize.middleware.ts
backend/src/middlewares/uploadMiddleware.ts
backend/src/middlewares/validate.ts
backend/src/models/Document.ts
backend/src/models/EvidenceCollection.ts
backend/src/models/FileAsset.ts
backend/src/models/FormSubmission.ts
backend/src/models/Inspection.ts
backend/src/models/Kit.ts
```

No tocar frontend en Sprint 1.

## 6.3 Técnicas permitidas para eliminar weak tokens

### Reemplazar `any`

Incorrecto:

```ts
const payload: any = value;
```

Correcto según el caso:

```ts
type JsonPrimitive = string | number | boolean;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
const payload: JsonValue = value;
```

O usar tipos ya existentes del proyecto.

### Reemplazar `unknown`

No convertir `unknown` a `any`.

Usar:

```ts
type JsonRecord = Record<string, JsonValue>;
```

O usar `z.input<typeof Schema>` / `z.output<typeof Schema>` si el dato viene de Zod.

### Reemplazar `null`

No usar `null` como ausencia.

Usar objetos de estado:

```ts
const databaseConnection = {
  status: "not_configured" as const,
};
```

O usar campos opcionales omitiendo la propiedad, si el schema lo permite.

### Reemplazar `undefined`

No asignar `undefined` explícito.

Incorrecto:

```ts
value: undefined
```

Correcto:

```ts
const payload = condition ? { value } : {};
```

### Mongoose

Si un schema histórico usa `default: null`, no romper persistencia. Cambiar solo si:

1. tests pasan;
2. no rompe contrato;
3. no cambia datos existentes sin migración;
4. se documenta.

Si no es seguro, corregir otros hallazgos primero.

## 6.4 Orden recomendado

1. Buscar el único `any` nuevo.
2. Corregir `null` nuevos fáciles en backend/config/index/upload.
3. Evitar refactor masivo de modelos Mongoose si no es necesario.
4. Ejecutar `npm run quality:weak-tokens` después de cada grupo.
5. Cuando `quality:weak-tokens` pase, ejecutar `npm run quality:strict`.
6. Luego ejecutar `npm run verify`.

## 6.5 Comandos Sprint 1

```bash
npm run quality:weak-tokens
npm run quality:strict
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run verify
```

## 6.6 Evidencia

Guardar:

```txt
.sisyphus/evidence/spec-023/sprint-1-quality-before.txt
.sisyphus/evidence/spec-023/sprint-1-quality-after.txt
.sisyphus/evidence/spec-023/sprint-1-verify.txt
```

## Definition of Done Sprint 1

```txt
quality:weak-tokens PASS
quality:strict PASS
verify PASS
no baseline bump silencioso
no package.json innecesario
no cambios frontend
```

---

# 7. Sprint 2 — Blindaje para que no vuelva a fallar

## Objetivo

Asegurar que el trabajo de Sprint 1 no se pierda y que otros agentes no reintroduzcan tokens débiles, roles hardcodeados o borrados accidentales.

## 7.1 Revisar enforcement existente

```bash
cat package.json
ls tooling/quality
cat tooling/git/pre-commit.mjs
ls .husky
ls .github/workflows
```

## 7.2 Asegurar que existan checks

Validar o crear:

```txt
tooling/quality/check-hardcoded-roles.ts
quality:hardcoded-roles
quality:routes
quality:weak-tokens
quality:strict
```

## 7.3 Pre-commit

Actualizar `tooling/git/pre-commit.mjs` para ejecutar, si no existe:

```txt
quality:routes
quality:hardcoded-roles
quality:weak-tokens
```

No hacerlo lento si ya existe una versión staged. Si no existe staged mode, documentar el costo.

## 7.4 CI

Si existe `.github/workflows/ci.yml`, verificar que ejecute:

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

Si no existe, crear workflow simple.

## 7.5 No pisar otros agentes

Antes de cambiar CI/pre-commit, revisar `WORK_REGISTRY.md`. Si otro agente ya lo tiene lockeado, no tocarlo. Registrar conflicto.

## Gates Sprint 2

```bash
npm run quality:strict
npm run verify
```

---

# 8. Sprint 3 — Slice paralelo funcional: Automation Rules MVP

Solo iniciar Sprint 3 si:

```txt
Sprint 1 PASS
Sprint 2 PASS
No hay lock del agente principal sobre automation/notifications/system-config
```

## Objetivo

Implementar un primer MVP profesional de automatizaciones SI-ENTONCES sin tocar ServiceCase Cockpit, Evidence FSM ni Dashboard OS si están siendo trabajados por otro agente.

## Paths permitidos Sprint 3

```txt
packages/shared-types/src/schemas/automation-rule.schema.ts
packages/shared-types/src/schemas/index.ts
packages/domain/src/automation.rules.ts
packages/domain/src/index.ts
backend/src/modules/automation/**
backend/src/modules/notifications/**
frontend/src/modules/automation/**
frontend/src/app/(dashboard)/automation/**
frontend/src/modules/notifications/**
```

Si alguno no existe, crear respetando Feature-Sliced Design.

## Contract-First

### Schema mínimo

Crear o completar `AutomationRuleSchema` con:

```txt
id
name
description
isEnabled
trigger
conditions
actions
priority
scope
createdBy
createdAt
updatedAt
lastRun
runCount
failureCount
auditStatus
```

### Triggers iniciales

```txt
evidence_rejected
vehicle_document_expiring
tool_certificate_expiring
cost_threshold_exceeded
critical_checklist_failed
ses_approved
invoice_overdue
```

### Actions iniciales

```txt
notify
create_task
block_transition
return_to_execution
request_evidence
flag_risk
```

## Backend

Crear o completar:

```txt
GET /automation/rules
POST /automation/rules
GET /automation/rules/:id
PATCH /automation/rules/:id
POST /automation/rules/:id/enable
POST /automation/rules/:id/disable
POST /automation/rules/:id/test
GET /automation/runs
```

Reglas:

```txt
authenticate → authorize → validateParams/validateBody → controller → service
```

No roles hardcodeados. Usar `@cermont/domain`.

## Frontend

Crear:

```txt
frontend/src/modules/automation/api/automation-api.ts
frontend/src/modules/automation/hooks/queries.ts
frontend/src/modules/automation/model/automation.keys.ts
frontend/src/modules/automation/ui/AutomationRulesPage.tsx
frontend/src/modules/automation/ui/AutomationRuleForm.tsx
frontend/src/modules/automation/ui/AutomationRuleStatusBadge.tsx
frontend/src/modules/automation/ui/AutomationRunsTable.tsx
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

```txt
create automation rule
reject invalid trigger
enable/disable rule
RBAC denied
test rule emits dry-run result
```

Frontend:

```txt
renders empty state
renders rules list
submits valid rule
shows forbidden state
```

## Gates Sprint 3

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

---

# 9. Manejo de conflictos con otros agentes

Antes de editar cualquier archivo:

```bash
git status --short
```

Si el archivo ya fue modificado por otro agente:

1. no lo sobrescribas;
2. registra en `docs/coordination/CONFLICTS.md`;
3. crea un patch separado;
4. pide merge manual o cambia de scope.

Para revisar cambios propios:

```bash
git diff --stat
git diff --name-only
```

Nunca hacer `git checkout -- <archivo>` sobre archivos de otro agente.

---

# 10. Política de commits y patches

Después de cada sprint que pase gates:

```bash
git status --short
git add <archivos-del-sprint>
git commit -m "fix(quality): remediate weak tokens without baseline bump"
```

Para Sprint 3:

```bash
git commit -m "feat(automation): add rules MVP with RBAC and tests"
```

Si no puedes commitear porque otro agente maneja commits, crear patch:

```bash
git diff > .sisyphus/evidence/spec-023/spec-023-sprint-N.patch
```

---

# 11. Formato de respuesta obligatorio

Al terminar cada sprint responde así:

```txt
# SPEC-023 Sprint X — Resultado

## Worktree y rama
## Lock activo
## Archivos modificados
## Archivos creados
## Archivos eliminados
## Cambios implementados
## Tests agregados/modificados
## Comandos ejecutados
## Gates
## Conflictos detectados
## Evidencia guardada
## Commit o patch
## Siguiente paso
```

Si respondes solo con diagnóstico, fallaste el sprint.

---

# 12. Definition of Done global SPEC-023

SPEC-023 queda cerrada solo si:

1. se usó worktree o rama separada;
2. existen locks multiagente;
3. no se borraron archivos sin registro;
4. `quality:strict` pasa;
5. `verify` pasa;
6. no se subió baseline silenciosamente;
7. no hay roles hardcodeados nuevos;
8. no hay `MediaAsset` nuevo;
9. no se tocó el scope del agente principal;
10. se dejó patch o commit;
11. se implementó al menos un slice funcional adicional si los gates lo permitieron;
12. documentación de handoff actualizada.

Empieza por Sprint 0 y luego Sprint 1. No audites todo el repo. No hagas otro plan maestro. Implementa.
