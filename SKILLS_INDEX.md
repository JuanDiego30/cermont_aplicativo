# Skills Index - Cermont Aplicativo

Índice maestro de todos los skills disponibles para este proyecto.

## 📁 Estructura de Skills

```
cermont_aplicativo/
├── .vscode/
│   └── skills.json          # Config para VS Code/Copilot
├── .antigravity/
│   ├── config.yml           # Config para Antigravity AI
│   └── README.md
├── .opencode/
│   ├── config.json          # Config para OpenCode
│   └── README.md
├── skills/                   # Skills creados
│   ├── prisma-architect/
│   ├── jest-testing/
│   ├── github-actions-cicd/
│   ├── clean-architecture/
│   ├── security-hardening/
│   ├── jwt-auth-patterns/
│   ├── swagger-openapi/
│   ├── rxjs-patterns/
│   ├── tailwind-expert/
│   ├── pnpm-workspace/
│   ├── eslint-prettier/
│   ├── angular-testing/
│   └── nestjs-performance/
├── nestjs-expert/            # Skills legacy (migrados)
├── angular-architect/
├── monorepo-management/
├── dependency-upgrade/
└── frontend-ui-integration/
```

## 🔧 Skills por Categoría

### Backend (NestJS)

| Skill | Path | Triggers | Prioridad |
|-------|------|----------|-----------|
| **nestjs-expert** | `nestjs-expert/SKILL.md` | controller, service, module, guard | 🔴 Alta |
| **prisma-architect** | `skills/prisma-architect/SKILL.md` | schema, migration, database | 🔴 Alta |
| **security-hardening** | `skills/security-hardening/SKILL.md` | auth, security, owasp, xss | 🔴 Alta |
| **jwt-auth-patterns** | `skills/jwt-auth-patterns/SKILL.md` | jwt, login, passport, token | 🔴 Alta |
| **swagger-openapi** | `skills/swagger-openapi/SKILL.md` | swagger, openapi, api-docs | 🟡 Media |
| **nestjs-performance** | `skills/nestjs-performance/SKILL.md` | cache, redis, throttle, rate-limit | 🟡 Media |

### Frontend (Angular)

| Skill | Path | Triggers | Prioridad |
|-------|------|----------|-----------|
| **angular-architect** | `angular-architect/angular-architect/SKILL.md` | component, signal, standalone | 🔴 Alta |
| **rxjs-patterns** | `skills/rxjs-patterns/SKILL.md` | rxjs, observable, subject, pipe | 🔴 Alta |
| **tailwind-expert** | `skills/tailwind-expert/SKILL.md` | tailwind, dark-mode, responsive | 🔴 Alta |
| **angular-testing** | `skills/angular-testing/SKILL.md` | testbed, component-test, playwright | 🟡 Media |
| **frontend-ui-integration** | `frontend-ui-integration/SKILL.md` | css, styling, UI | 🟡 Media |

### DevOps & Infrastructure

| Skill | Path | Triggers | Prioridad |
|-------|------|----------|-----------|
| **monorepo-management** | `monorepo-management/SKILL.md` | turborepo, workspace, build | 🔴 Alta |
| **pnpm-workspace** | `skills/pnpm-workspace/SKILL.md` | pnpm, lockfile, dependencies | 🟡 Media |
| **github-actions-cicd** | `skills/github-actions-cicd/SKILL.md` | ci, cd, deploy, pipeline | 🟡 Media |
| **dependency-upgrade** | `dependency-upgrade/SKILL.md` | upgrade, vulnerability, audit | 🟡 Media |
| **eslint-prettier** | `skills/eslint-prettier/SKILL.md` | eslint, prettier, linting, husky | 🟡 Media |

### Quality & Architecture

| Skill | Path | Triggers | Prioridad |
|-------|------|----------|-----------|
| **jest-testing** | `skills/jest-testing/SKILL.md` | test, spec, coverage, mock | 🟡 Media |
| **clean-architecture** | `skills/clean-architecture/SKILL.md` | refactor, solid, hexagonal | 🟡 Media |

## 🚀 Uso Rápido

### En VS Code / GitHub Copilot

Los skills se cargan automáticamente según el archivo activo y keywords del prompt.

### En Antigravity AI

```bash
# El config.yml carga skills automáticamente
# Para forzar un skill:
@nestjs-expert ayúdame a crear un nuevo módulo
```

### En OpenCode

```bash
# Menciona el skill o usa keywords
# Ejemplo:
@prisma-architect optimiza esta query
```

## 📋 Comandos Comunes por Skill

### nestjs-expert
- "Crea un nuevo módulo CRUD para [entidad]"
- "Implementa middleware de logging"
- "Agrega validación al DTO"

### prisma-architect
- "Diseña el schema para [entidad]"
- "Crea una migración para [cambio]"
- "Optimiza esta query N+1"

### jwt-auth-patterns
- "Implementa autenticación JWT completa"
- "Agrega refresh token rotation"
- "Crea guards de autorización por roles"

### swagger-openapi
- "Documenta este endpoint con Swagger"
- "Agrega ejemplos a los DTOs"
- "Configura versionado de API"

### nestjs-performance
- "Implementa caching con Redis"
- "Configura rate limiting"
- "Optimiza queries para alta carga"

### angular-architect
- "Convierte a standalone component"
- "Implementa signals para el estado"
- "Crea un servicio con HttpClient"

### rxjs-patterns
- "Implementa búsqueda con debounce"
- "Combina múltiples observables"
- "Maneja errores en stream"

### tailwind-expert
- "Crea un componente card responsive"
- "Implementa dark mode toggle"
- "Estiliza formulario con validación"

### angular-testing
- "Escribe tests para este componente"
- "Crea mocks de servicios HTTP"
- "Configura E2E con Playwright"

### monorepo-management
- "Configura Turborepo para caching"
- "Agrega un nuevo package al workspace"
- "Optimiza los builds"

### pnpm-workspace
- "Agrega dependencia a workspace específico"
- "Resuelve problema de hoisting"
- "Configura filtros para scripts"

### eslint-prettier
- "Configura ESLint flat config"
- "Integra husky con lint-staged"
- "Crea regla personalizada"

### security-hardening
- "Implementa protección CSRF"
- "Audita este endpoint por vulnerabilidades"
- "Configura CORS correctamente"

### jest-testing
- "Escribe tests para este servicio"
- "Crea mocks de Prisma"
- "Configura coverage thresholds"

### dependency-upgrade
- "Analiza vulnerabilidades"
- "Planifica upgrade de Angular"
- "Resuelve conflictos de peer deps"

### github-actions-cicd
- "Crea workflow de CI/CD"
- "Implementa deploy con Docker"
- "Configura matrix de tests"

### clean-architecture
- "Refactoriza a hexagonal"
- "Implementa use cases"
- "Aplica principios SOLID"

### dependency-upgrade
- "Analiza vulnerabilidades"
- "Planifica upgrade de Angular"
- "Resuelve conflictos de peer deps"

## 🔄 Actualización de Skills

Para agregar un nuevo skill:

1. Crear carpeta en `skills/[nombre]/`
2. Crear `SKILL.md` con formato estándar
3. Agregar a `.vscode/skills.json`
4. Agregar a `.antigravity/config.yml`
5. Agregar a `.opencode/config.json`
6. Actualizar este índice

## 📚 Referencias

- [SKILL.md Format](https://docs.anthropic.com/claude/docs/skills)
- [SkillsMP Marketplace](https://skillsmp.com)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
