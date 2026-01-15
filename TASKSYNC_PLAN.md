# Plan TaskSync

He generado un plan completo y estructurado que usa los 32 skills en orden de criticidad, desde las bases hasta lo opcional.

## Estructura del Plan (20 tasks + 1 referencia)

**Bloques en orden de ejecución:**

| Bloque | Tasks | Criticidad | Duración |
|--------|-------|-----------|----------|
| 🔴 **BASELINE** | 00 | CRÍTICA | 30 min |
| 🔴 **SECURITY** | 01–02 | CRÍTICA | 45 min |
| 🔴 **MONOREPO & CI/CD** | 03–04 | CRÍTICA | 1.5 h |
| 🟠 **BACKEND CORE** | 05–09 | ALTA | 4 h |
| 🟠 **FRONTEND CORE** | 10–12 | ALTA | 3 h |
| 🟡 **POLISH & DOCS** | 13–15 | MEDIA | 1.5 h |
| 🟢 **OPTIONAL & MANUAL** | 16–20 | BAJA | Variable |

## Skills aplicados por task

**TASK 00**: `typescript-conventions`, `code-review`

**TASK 01**: `dependency-security`, `backend-development`, `code-review`

**TASK 02**: `dependency-security`, `dependency-upgrade`, `code-review`

**TASK 03**: `monorepo-management`, `turborepo`, `turbo-monorepo-expert`, `building-cicd-pipelines`

**TASK 04**: `building-cicd-pipelines`, `code-review`

**TASK 05**: `nestjs-expert`, `architecture-patterns`, `backend-development`, `code-refactoring`, `typescript-conventions`

**TASK 06**: `auth-implementation-patterns`, `nestjs-expert`, `backend-development`, `dependency-security`

**TASK 07**: `prisma-v7`, `backend-development`, `code-refactoring`

**TASK 08**: `nestjs-testing`, `nestjs-expert`, `backend-development`, `code-review`

**TASK 09**: `api-documentation-generator`, `nestjs-expert`, `code-review`

**TASK 10**: `angular-architect`, `angular-best-practices`, `frontend-routing`, `typescript-conventions`, `code-refactoring`

**TASK 11**: `angular-best-practices`, `frontend-component-patterns`, `frontend-ui-integration`, `typescript-conventions`

**TASK 12**: `angular-best-practices`, `frontend-component-patterns`, `typescript-conventions`

**TASK 13**: `ui-style-guide`, `tailwind-ui`, `frontend-ui-integration`

**TASK 14**: `code-review`, `typescript-conventions`, `code-refactoring`

**TASK 15**: `code-review`, `api-documentation-generator`

**TASK 16**: `angular-best-practices`, `angular`, `frontend-component-patterns` (Manual)

**TASK 17**: `tailwind-css-v4-mastery` (Manual)

**TASK 18**: `dependency-upgrade`, `dependency-security`, `code-review` (Manual)

**TASK 19**: `vps-checkup`, `building-cicd-pipelines` (Manual)

**TASK 20**: Referencia de skills manual-only.

## Flujo workflow (por task)

1. **Research**: Auditoría → `.antigravity/workflow/01_RESEARCH.md`
2. **Plan**: Propuesta → `.antigravity/workflow/02_PLAN.md` (pedir aprobación)
3. **Implement**: Cambios mínimos
4. **Verify**: Comandos + outputs → `.antigravity/workflow/03_VERIFY.md`

## Para usar en TaskSync

Pega el contenido de `TASKSYNC_PLAN.md` en tu herramienta TaskSync, y selecciona:

```
TASKSYNC: FULL_REFACTOR_PLAN
MODEL: codex-5.2
SKILLS: [todos los listados en cada task]
SCOPE: [paths específicos por task]
GATES:
  - No repo sweep
  - No new deps sin aprobación
  - One goal per PR
  - Workflow: Research → Plan → Implement → Verify
```
