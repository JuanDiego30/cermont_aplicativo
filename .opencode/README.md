# OpenCode Skills Configuration

Este directorio contiene la configuración de skills para OpenCode.

## Estructura

```
.opencode/
├── config.json      # Configuración principal
├── README.md        # Este archivo
└── prompts/         # Prompts personalizados (opcional)
```

## Skills Disponibles

### Backend
- **nestjs-expert** - Arquitectura NestJS, DI, módulos, guards
- **prisma-architect** - Schema, migraciones, queries optimizadas
- **security-hardening** - OWASP, JWT, autenticación

### Frontend
- **angular-architect** - Angular 20, signals, standalone
- **frontend-ui-integration** - Tailwind CSS, estilos

### DevOps
- **monorepo-management** - Turborepo, pnpm workspaces
- **github-actions-cicd** - CI/CD, pipelines, deploys
- **dependency-upgrade** - Upgrades seguros, vulnerabilidades

### Quality
- **jest-testing** - Tests unitarios, E2E, mocking
- **clean-architecture** - SOLID, hexagonal, DDD

## Uso

OpenCode carga automáticamente los skills según:

1. **Archivo activo**: `.controller.ts` → nestjs-expert
2. **Keywords en prompt**: "prisma schema" → prisma-architect
3. **Referencia explícita**: `@nestjs-expert ayúdame con...`

## Configuración

Edita `config.json` para:

- Habilitar/deshabilitar skills
- Cambiar prioridades
- Ajustar triggers
- Modificar preferencias de código

## Integración con Proyecto

El config.json referencia los skills en:
- `../skills/` - Skills nuevos
- `../nestjs-expert/`, etc. - Skills legacy
