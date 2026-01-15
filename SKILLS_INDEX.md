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
├── skills/                   # Skills nuevos
│   ├── prisma-architect/
│   ├── jest-testing/
│   ├── github-actions-cicd/
│   ├── clean-architecture/
│   └── security-hardening/
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
| **security-hardening** | `skills/security-hardening/SKILL.md` | auth, jwt, security, owasp | 🔴 Alta |

### Frontend (Angular)

| Skill | Path | Triggers | Prioridad |
|-------|------|----------|-----------|
| **angular-architect** | `angular-architect/angular-architect/SKILL.md` | component, signal, standalone | 🔴 Alta |
| **frontend-ui-integration** | `frontend-ui-integration/SKILL.md` | tailwind, css, styling | 🟡 Media |

### DevOps & Infrastructure

| Skill | Path | Triggers | Prioridad |
|-------|------|----------|-----------|
| **monorepo-management** | `monorepo-management/SKILL.md` | turborepo, pnpm, workspace | 🔴 Alta |
| **github-actions-cicd** | `skills/github-actions-cicd/SKILL.md` | ci, cd, deploy, pipeline | 🟡 Media |
| **dependency-upgrade** | `dependency-upgrade/SKILL.md` | upgrade, vulnerability, audit | 🟡 Media |

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
- "Implementa autenticación JWT"
- "Agrega validación al DTO"

### prisma-architect
- "Diseña el schema para [entidad]"
- "Crea una migración para [cambio]"
- "Optimiza esta query N+1"

### angular-architect
- "Convierte a standalone component"
- "Implementa signals para el estado"
- "Crea un servicio con HttpClient"

### monorepo-management
- "Configura Turborepo para caching"
- "Agrega un nuevo package al workspace"
- "Optimiza los builds"

### security-hardening
- "Implementa rate limiting"
- "Audita este endpoint por vulnerabilidades"
- "Configura CORS correctamente"

### jest-testing
- "Escribe tests para este servicio"
- "Crea mocks de Prisma"
- "Configura E2E testing"

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
