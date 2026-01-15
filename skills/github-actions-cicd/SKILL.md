---
name: github-actions-cicd
description: Experto en GitHub Actions para CI/CD en monorepos con Turborepo. Usar para pipelines de build, test, lint, deploy y automatización.
triggers:
  - GitHub Actions
  - CI/CD
  - pipeline
  - workflow
  - deploy
  - automation
role: specialist
scope: devops
output-format: code
---

# GitHub Actions CI/CD Expert

Especialista en automatización CI/CD con GitHub Actions para monorepos modernos.

## Rol

Ingeniero DevOps con 6+ años de experiencia en GitHub Actions, pipelines de CI/CD, y automatización para monorepos con Turborepo y pnpm.

## Cuándo Usar Este Skill

- Configurar pipelines de CI/CD
- Automatizar builds y tests
- Implementar deploys automáticos
- Crear workflows de release
- Configurar caching para monorepos
- Implementar matrix builds
- Automatizar code quality checks
- Configurar environments y secrets

## Workflows Base

### CI Pipeline Completo (Monorepo)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check

  test:
    name: Test
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm --filter backend exec prisma generate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Run Migrations
        run: pnpm --filter backend exec prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Run Tests
        run: pnpm test:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          JWT_SECRET: test-secret

      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Turbo Cache
        uses: actions/cache@v4
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: postgresql://placeholder:placeholder@localhost:5432/placeholder

      - name: Upload Build Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            backend/dist
            frontend/dist
          retention-days: 7
```

### Deploy Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    name: Deploy to ${{ inputs.environment || 'staging' }}
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment || 'staging' }}
    
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NODE_ENV: production

      - name: Deploy Backend
        run: |
          # Deploy backend to your platform
          echo "Deploying backend..."
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}

      - name: Deploy Frontend
        run: |
          # Deploy frontend to your platform
          echo "Deploying frontend..."
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}

      - name: Run Migrations
        run: pnpm --filter backend exec prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Docker Build & Push

```yaml
# .github/workflows/docker.yml
name: Docker Build

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  BACKEND_IMAGE: ${{ github.repository }}/backend
  FRONTEND_IMAGE: ${{ github.repository }}/frontend

jobs:
  build-backend:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  build-frontend:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.FRONTEND_IMAGE }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### PR Checks

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  affected:
    name: Affected Packages
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.filter.outputs.backend }}
      frontend: ${{ steps.filter.outputs.frontend }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            backend:
              - 'backend/**'
              - 'pnpm-lock.yaml'
            frontend:
              - 'frontend/**'
              - 'pnpm-lock.yaml'

  backend-tests:
    needs: affected
    if: needs.affected.outputs.backend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter backend test:cov

  frontend-tests:
    needs: affected
    if: needs.affected.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter frontend test

  size-limit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Dependabot Config

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    groups:
      angular:
        patterns:
          - "@angular/*"
          - "zone.js"
      nestjs:
        patterns:
          - "@nestjs/*"
      prisma:
        patterns:
          - "prisma"
          - "@prisma/*"
      dev-dependencies:
        dependency-type: "development"
        patterns:
          - "*"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-patch"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

## Caching Strategies

```yaml
# Turbo Remote Cache (gratis con Vercel)
- name: Setup Turbo Cache
  uses: actions/cache@v4
  with:
    path: |
      .turbo
      node_modules/.cache/turbo
    key: turbo-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ github.sha }}
    restore-keys: |
      turbo-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-
      turbo-${{ runner.os }}-

# pnpm store cache
- name: Get pnpm store directory
  shell: bash
  run: |
    echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

- name: Setup pnpm cache
  uses: actions/cache@v4
  with:
    path: ${{ env.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-
```

## Secrets Recomendados

| Secret | Descripción |
|--------|-------------|
| `DATABASE_URL` | URL de PostgreSQL |
| `JWT_SECRET` | Secreto para tokens JWT |
| `TURBO_TOKEN` | Token para Turbo Remote Cache |
| `CODECOV_TOKEN` | Token para subir cobertura |
| `DEPLOY_TOKEN` | Token para deploys |
| `SLACK_WEBHOOK` | Webhook para notificaciones |

## Restricciones

### DEBE HACER
- Usar `--frozen-lockfile` siempre
- Implementar caching agresivo
- Cancelar workflows duplicados
- Usar matrix para múltiples versiones de Node
- Proteger branches con status checks
- Usar environments para staging/production

### NO DEBE HACER
- Hardcodear secrets en workflows
- Ejecutar en `runs-on: windows-latest` sin necesidad
- Olvidar cleanup de artifacts
- Ignorar fallos de tests

## Skills Relacionados

- **monorepo-management** - Configuración Turborepo
- **security-hardening** - Secrets y permisos
- **jest-testing** - Configuración de tests
