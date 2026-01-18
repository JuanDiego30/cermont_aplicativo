# Skills Manifest — Cermont Monorepo

> **Generated**: 2026-01-15  
> **Stack**: Angular + NestJS + Prisma + pnpm workspaces + Turborepo  
> **Agent Compatibility**: AntiGravity, VS Code Agents, Cursor, OpenCode, Visual Studio

---

## Skill Inventory

| Folder                         | Skill Name                   | Domain   | Compatibility     | Risk   | Status      | Notes                                  |
| ------------------------------ | ---------------------------- | -------- | ----------------- | ------ | ----------- | -------------------------------------- |
| `angular`                      | angular                      | frontend | ⚠️ Needs tweaks   | medium | secondary   | "casino-f" context, v17 reference      |
| `angular-architect`            | angular-architect            | frontend | ⚠️ Needs tweaks   | medium | secondary   | Nx commands, Cypress refs              |
| `angular-best-practices`       | angular-best-practices       | frontend | ✅ OK             | low    | **PRIMARY** | v21 focused, clean                     |
| `api-documentation-generator`  | api-documentation-generator  | backend  | ✅ OK             | low    | active      | Swagger/OpenAPI                        |
| `architecture-patterns`        | architecture-patterns        | general  | ✅ OK             | low    | active      | DDD, Clean Architecture                |
| `auth-implementation-patterns` | auth-implementation-patterns | backend  | ✅ OK             | low    | active      | JWT, RBAC patterns                     |
| `backend-development`          | backend-development          | backend  | ⚠️ Needs tweaks   | medium | secondary   | Multi-language refs (Go, Rust, Python) |
| `building-cicd-pipelines`      | building-cicd-pipelines      | monorepo | ✅ OK             | low    | active      | GitHub Actions                         |
| `code-refactoring`             | code-refactoring             | general  | ✅ OK             | low    | active      | Clean code patterns                    |
| `code-review`                  | code-review                  | general  | ✅ OK             | low    | active      | Review checklist                       |
| `dependency-security`          | dependency-security          | security | ✅ OK             | low    | **PRIMARY** | OWASP, SBOM                            |
| `dependency-upgrade`           | dependency-upgrade           | general  | ⚠️ Needs tweaks   | high   | manual-only | React examples, version pinning        |
| `frontend-component-patterns`  | frontend-component-patterns  | frontend | ⚠️ Needs tweaks   | medium | secondary   | Generic frontend                       |
| `frontend-routing`             | frontend-routing             | frontend | ⚠️ Needs tweaks   | low    | secondary   | Angular routing                        |
| `frontend-ui-integration`      | frontend-ui-integration      | frontend | ⚠️ Needs tweaks   | low    | secondary   | Generic UI                             |
| `llvm-security`                | llvm-security                | security | ❌ Not applicable | high   | archived    | C/C++ compiler, not TypeScript         |
| `monorepo-management`          | monorepo-management          | monorepo | ⚠️ Needs tweaks   | medium | secondary   | Nx + Turborepo mixed                   |
| `nestjs-expert`                | nestjs-expert                | backend  | ✅ OK             | low    | **PRIMARY** | NestJS specialist                      |
| `nestjs-testing`               | nestjs-testing               | backend  | ✅ OK             | low    | active      | Jest, supertest                        |
| `prisma-v7`                    | prisma-v7                    | backend  | ⚠️ Needs tweaks   | low    | active      | v7 focused, ESM requirement note       |
| `tailwind-css-v4-mastery`      | tailwind-css-v4-mastery      | frontend | ⚠️ Needs tweaks   | low    | **PRIMARY** | Vite/React examples need Angular swap  |
| `tailwind-ui`                  | tailwind-ui                  | frontend | ⚠️ Needs tweaks   | low    | secondary   | UI patterns                            |
| `turbo-monorepo-expert`        | Turbo Monorepo Expert        | monorepo | ⚠️ Needs tweaks   | medium | secondary   | Overlaps with turborepo skill          |
| `turborepo`                    | turborepo                    | monorepo | ⚠️ Needs tweaks   | medium | **PRIMARY** | `bun` commands, Next.js refs           |
| `typescript-conventions`       | typescript-conventions       | general  | ✅ OK             | low    | active      | TS best practices                      |
| `ui-style-guide`               | ui-style-guide               | frontend | ✅ OK             | low    | active      | Design tokens                          |
| `vps-checkup`                  | vps-checkup                  | devops   | ✅ OK             | low    | active      | Server monitoring                      |

---

## Skill Families

### Angular Family (frontend)

- **Primary**: `angular-best-practices` — v21 signals, standalone components
- **Secondary**: `angular`, `angular-architect`, `frontend-component-patterns`, `frontend-routing`, `frontend-ui-integration`

### NestJS Family (backend)

- **Primary**: `nestjs-expert` — Modules, DI, validation, Swagger
- **Secondary**: `backend-development`, `nestjs-testing`, `api-documentation-generator`, `auth-implementation-patterns`

### Monorepo Family

- **Primary**: `turborepo` — Build system, caching, task pipelines
- **Secondary**: `turbo-monorepo-expert`, `monorepo-management`, `building-cicd-pipelines`

### UI/Styling Family

- **Primary**: `tailwind-css-v4-mastery` — CSS-first configuration, v4 Oxide
- **Secondary**: `tailwind-ui`, `ui-style-guide`

### Security Family

- **Primary**: `dependency-security` — npm audit, SBOM, OWASP
- **Secondary**: None (llvm-security archived)

### General/Cross-cutting

- `code-refactoring`, `code-review`, `typescript-conventions`, `architecture-patterns`, `dependency-upgrade` (manual-only)

---

## Key Adjustments Required

### 1. Command Scoping (All Skills)

Replace generic commands with pnpm-scoped equivalents:

```diff
- npm install package
+ pnpm add package --filter @cermont/backend

- yarn add package
+ pnpm add package --filter @cermont/frontend

- bun install
+ pnpm install

- bunx turbo run build
+ pnpm turbo run build
```

### 2. Version Pinning Removal

Remove explicit versions from install commands:

```diff
- npm install react@18
+ # Install version compatible with repository

- pnpm add prisma@latest
+ # Use repository-managed version
```

### 3. Framework Replacement Text

| Original         | Replacement                     |
| ---------------- | ------------------------------- |
| Create React App | Angular CLI (`ng new`)          |
| Next.js          | Angular standalone app          |
| Vite (React)     | Angular CLI with custom webpack |
| Express.js       | NestJS                          |
| Nx commands      | Turborepo equivalents           |

---

## Guardrails (Added to All Skills)

```markdown
## Does NOT do

- Install dependencies without explicit user approval
- Modify pnpm-lock.yaml directly
- Run migrations automatically
- Change package.json versions

## Safety Checklist

Before completing any task:

- [ ] `pnpm -r lint`
- [ ] `pnpm -r test`
- [ ] `pnpm -r build`
- Rollback: `git restore -SW .`
```

---

## Agent Compatibility

All skills include metadata for cross-agent discovery:

| Agent          | Detection Method               | Config Location             |
| -------------- | ------------------------------ | --------------------------- |
| AntiGravity    | SKILL.md frontmatter           | `.agent/skills-config.json` |
| VS Code Agents | `description` field + triggers | Workspace settings          |
| Cursor         | SKILL.md in `/SKILLS`          | Auto-detected               |
| OpenCode       | `allowed-tools` frontmatter    | Profile config              |
| Visual Studio  | Extension prompts              | `.vs/agents.json`           |

---

## Archived Skills

| Folder          | Reason                                                      | Action                      |
| --------------- | ----------------------------------------------------------- | --------------------------- |
| `llvm-security` | C/C++ compiler security, not applicable to TypeScript stack | Move to `SKILLS/_archived/` |

---

## Verification Commands

```bash
# Lint all packages
pnpm -r lint

# Test all packages
pnpm -r test

# Build monorepo
pnpm -r build

# Typecheck
pnpm -r typecheck
```
