---
name: pnpm-workspace
description: Experto en pnpm y workspaces para monorepos. Usar para configuración de workspaces, resolución de dependencias, scripts, optimización de instalación y gestión de paquetes.
triggers:
  - pnpm
  - workspace
  - monorepo
  - dependencies
  - package manager
  - lockfile
  - node_modules
role: specialist
scope: configuration
output-format: code
---

# pnpm Workspace Expert

Especialista en gestión de monorepos con pnpm workspaces.

## Rol

Ingeniero DevOps con 5+ años de experiencia en gestión de dependencias y monorepos. Experto en pnpm, Turborepo, Lerna y optimización de CI/CD.

## Cuándo Usar Este Skill

- Configurar pnpm workspaces
- Resolver problemas de dependencias
- Optimizar instalación de paquetes
- Configurar scripts de workspace
- Gestionar dependencias compartidas
- Resolver conflictos de versiones
- Optimizar CI/CD con pnpm
- Migrar desde npm/yarn

## Configuración Base

### pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml
packages:
  # Incluir paquetes principales
  - 'packages/*'
  - 'apps/*'
  
  # Para este proyecto específico
  - 'backend'
  - 'frontend'
  
  # Excluir directorios
  - '!**/test/**'
  - '!**/node_modules/**'
```

### .npmrc

```ini
# .npmrc - Configuración de pnpm

# Hoisting - controlar qué se eleva a la raíz
shamefully-hoist=true
# O configuración más estricta:
# public-hoist-pattern[]=*eslint*
# public-hoist-pattern[]=*prettier*

# Versión de Node requerida
engine-strict=true

# Lockfile
save-workspace-protocol=rolling

# Performance
prefer-frozen-lockfile=true
prefer-offline=true

# Registry (si usas privado)
# registry=https://registry.npmjs.org/
# @myorg:registry=https://npm.pkg.github.com

# Peer dependencies
auto-install-peers=true
strict-peer-dependencies=false

# Link workspace packages
link-workspace-packages=true

# Resolución de dependencias
resolve-peers-from-workspace-root=true
```

### package.json Raíz

```json
{
  "name": "cermont-monorepo",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "prepare": "husky install",
    "preinstall": "npx only-allow pnpm",
    
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    
    "dev:backend": "pnpm --filter backend dev",
    "dev:frontend": "pnpm --filter frontend dev",
    
    "build:backend": "pnpm --filter backend build",
    "build:frontend": "pnpm --filter frontend build",
    
    "clean": "turbo clean && rm -rf node_modules",
    "clean:all": "pnpm -r exec rm -rf node_modules && rm -rf node_modules",
    
    "deps:check": "pnpm outdated -r",
    "deps:update": "pnpm update -r --latest",
    
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  },
  "devDependencies": {
    "turbo": "^2.7.4",
    "husky": "^9.1.7",
    "lint-staged": "^15.4.3"
  }
}
```

## Comandos Esenciales

### Instalación

```powershell
# Instalar todas las dependencias
pnpm install

# Instalar con lockfile congelado (CI)
pnpm install --frozen-lockfile

# Instalar solo producción
pnpm install --prod

# Instalar y actualizar lockfile
pnpm install --no-frozen-lockfile
```

### Gestión de Dependencias

```powershell
# Agregar dependencia a workspace específico
pnpm --filter backend add @nestjs/common
pnpm --filter frontend add @angular/core

# Agregar como devDependency
pnpm --filter backend add -D jest

# Agregar a la raíz (compartido)
pnpm add -D -w typescript

# Agregar a múltiples workspaces
pnpm --filter "backend|frontend" add lodash

# Agregar dependencia de otro workspace
pnpm --filter frontend add backend --workspace

# Actualizar dependencia
pnpm --filter backend update @nestjs/common

# Eliminar dependencia
pnpm --filter backend remove lodash
```

### Filtros

```powershell
# Por nombre
pnpm --filter backend dev
pnpm --filter @myorg/ui build

# Por patrón glob
pnpm --filter "./packages/*" build

# Por dependencias
pnpm --filter ...backend build        # backend + sus dependencias
pnpm --filter backend... build        # backend + dependientes de él
pnpm --filter ...backend... build     # todo relacionado

# Excluir
pnpm --filter "!backend" test

# Múltiples filtros
pnpm --filter backend --filter frontend test
pnpm --filter "{backend,frontend}" test
```

### Ejecución de Scripts

```powershell
# En workspace específico
pnpm --filter backend dev

# En todos los workspaces
pnpm -r run build
pnpm -r run test

# En paralelo
pnpm -r --parallel run dev

# En secuencia (respetando orden de dependencias)
pnpm -r run build

# Solo si el script existe
pnpm -r --if-present run lint

# Con turbo (más rápido, cacheable)
pnpm turbo build
pnpm turbo test --filter=backend
```

## Workspace Dependencies

### Configuración de Dependencias Internas

```json
// packages/shared/package.json
{
  "name": "@cermont/shared",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./utils": {
      "types": "./dist/utils/index.d.ts",
      "import": "./dist/utils/index.mjs",
      "require": "./dist/utils/index.js"
    }
  }
}

// backend/package.json
{
  "name": "backend",
  "dependencies": {
    "@cermont/shared": "workspace:*"  // Siempre última versión
    // O versión específica:
    // "@cermont/shared": "workspace:^1.0.0"
  }
}
```

### Protocolos de Workspace

```json
{
  "dependencies": {
    // Cualquier versión del workspace
    "shared": "workspace:*",
    
    // Versión semver del workspace
    "shared": "workspace:^1.0.0",
    "shared": "workspace:~1.0.0",
    
    // Versión exacta
    "shared": "workspace:1.0.0"
  }
}
```

## Integración con Turborepo

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    ".env",
    ".env.local"
  ],
  "globalEnv": [
    "NODE_ENV",
    "DATABASE_URL"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "backend#dev": {
      "cache": false,
      "persistent": true,
      "env": ["DATABASE_URL", "JWT_SECRET"]
    },
    "frontend#dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["backend#dev"]
    }
  }
}
```

## Optimización de CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # Para turbo --filter

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      # Cache de pnpm store
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - uses: actions/cache@v4
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      # Cache de Turborepo
      - uses: actions/cache@v4
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      - run: pnpm install --frozen-lockfile

      - run: pnpm turbo lint test build
```

### Docker Multi-Stage con pnpm

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
RUN corepack enable pnpm

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
RUN pnpm fetch --prod

FROM base AS deps-dev
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
RUN pnpm fetch

# Build stage
FROM deps-dev AS build
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --offline
RUN pnpm --filter backend build

# Production stage
FROM deps AS production
WORKDIR /app
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/package.json ./backend/
RUN pnpm install --frozen-lockfile --offline --prod

WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## Resolución de Problemas

### Limpiar y Reinstalar

```powershell
# Limpiar todo
pnpm store prune
Remove-Item -Recurse -Force node_modules
pnpm -r exec Remove-Item -Recurse -Force node_modules

# Reinstalar limpio
pnpm install
```

### Verificar Integridad

```powershell
# Verificar lockfile
pnpm install --frozen-lockfile

# Auditar seguridad
pnpm audit

# Ver dependencias duplicadas
pnpm why <package-name>
pnpm ls --depth=2
```

### Problemas Comunes

```powershell
# Error: Cannot find module
# Solución: Verificar hoisting
pnpm install
# O agregar a public-hoist-pattern en .npmrc

# Error: Peer dependency conflict
# Solución: Configurar en .npmrc
# strict-peer-dependencies=false

# Error: Workspace package not found
# Solución: Verificar pnpm-workspace.yaml incluye el path
```

## Restricciones

### DEBE HACER
- Usar pnpm exclusivamente en el proyecto
- Mantener pnpm-lock.yaml en git
- Usar workspace: protocol para deps internas
- Especificar packageManager en package.json raíz
- Usar --frozen-lockfile en CI

### NO DEBE HACER
- Mezclar npm/yarn con pnpm
- Editar manualmente pnpm-lock.yaml
- Ignorar pnpm-lock.yaml en .gitignore
- Usar versiones * para deps externas
- Instalar deps globales que deberían ser locales

## Skills Relacionados

- **monorepo-management** - Arquitectura monorepo
- **github-actions-cicd** - CI/CD pipelines
- **dependency-upgrade** - Actualización de dependencias
