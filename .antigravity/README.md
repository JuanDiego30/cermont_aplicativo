# Antigravity Skills Index

Este directorio contiene la configuración de skills para Antigravity AI.

## Skills Disponibles

| Skill | Categoría | Descripción |
|-------|-----------|-------------|
| [nestjs-expert](../nestjs-expert/SKILL.md) | Backend | Arquitectura NestJS, DI, controllers, services |
| [angular-architect](../angular-architect/angular-architect/SKILL.md) | Frontend | Angular 20, signals, standalone components |
| [prisma-architect](../skills/prisma-architect/SKILL.md) | Database | Schema design, migrations, queries |
| [monorepo-management](../monorepo-management/SKILL.md) | DevOps | Turborepo, pnpm workspaces |
| [dependency-upgrade](../dependency-upgrade/SKILL.md) | DevOps | Upgrades seguros, vulnerabilidades |
| [jest-testing](../skills/jest-testing/SKILL.md) | Testing | Unit tests, E2E, mocking |
| [github-actions-cicd](../skills/github-actions-cicd/SKILL.md) | CI/CD | Pipelines, deploys, automation |
| [clean-architecture](../skills/clean-architecture/SKILL.md) | Architecture | SOLID, hexagonal, DDD |
| [security-hardening](../skills/security-hardening/SKILL.md) | Security | OWASP, JWT, auth, hardening |
| [frontend-ui-integration](../frontend-ui-integration/SKILL.md) | UI | Tailwind, styling, responsive |

## Uso

Los skills se cargan automáticamente según el contexto:

1. **Por archivo**: Al editar `*.controller.ts` → carga `nestjs-expert`
2. **Por keyword**: Al mencionar "prisma" → carga `prisma-architect`
3. **Manual**: Menciona el skill por nombre para cargarlo

## Configuración

Ver `config.yml` para ajustar:
- Prioridades de skills
- Patrones de auto-carga
- Contexto inyectado
- Memoria y persistencia
