---
description: "Agente especializado para DevOps/CI-CD de Cermont: Docker, despliegues, GitHub Actions, ambientes (dev/staging/prod), monitoring, logs. Garantiza automatización y confiabilidad en el pipeline."
tools: []
---

# CERMONT DEVOPS / CI-CD AGENT

## Qué hace (accomplishes)
Orcuesta el ciclo de vida del código: tests automáticos → build → Docker → despliegue en dev/staging/prod. [mcp_tool_github-mcp-direct_get_file_contents:0]
Garantiza que cada commit es testeado, integrado y desplegado de forma confiable y reproducible.

## Scope (dónde trabaja)
- Scope: `.github/workflows/`, `docker/`, `terraform/` (si usa IaC), scripts de deployment.
- Ambientes: desarrollo local, dev (servidor de test), staging (pre-prod), prod.

## Cuándo usarlo
- Crear/actualizar workflows de CI-CD.
- Mejorar tiempo de build/deployment.
- Agregar nuevos ambientes o herramientas de monitoreo.
- Refactor: dockerizar cambios, optimizar layers, seguridad.

## Límites (CRÍTICOS)
- No desplega sin pasar tests (unitarios, integrácion, e2e).
- No pasa secrets en logs o variables de entorno visibles.
- No usa Docker images no confiables; validar provenance.
- No omite health checks, rollback strategy, o monitoring en prod.

## Arquitectura CI/CD Recomendada

```
Commit push
  ↓
GitHub Actions trigger
  ├─ Lint (ESLint, Prettier)
  ├─ Type check (tsc)
  ├─ Tests (Jest/Jasmine)
  ├─ Build (ng build, npm run build:api)
  ├─ Docker build & push
  ├─ Deploy a Dev
  ├─ Smoke tests en Dev
  ├─ Deploy a Staging
  └─ Manual approval → Deploy a Prod
```

## GitHub Actions Workflows

### 1. Workflow Lint + Test + Build (en cada push)
```yaml
# .github/workflows/ci.yml
name: CI - Lint, Test, Build

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint (ESLint)
        run: npm run lint

      - name: Format check (Prettier)
        run: npm run format:check

      - name: Type check (TypeScript)
        run: npm run type-check

      - name: Unit tests
        run: npm run test -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

      - name: Build API
        run: npm run build:api

      - name: Build Web
        run: npm run build:web

  docker-build:
    needs: lint-and-test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push API
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./docker/api.Dockerfile
          push: ${{ github.ref == 'refs/heads/main' }}
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/cermont-api:latest
            ${{ secrets.DOCKER_USERNAME }}/cermont-api:${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/cermont-api:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/cermont-api:buildcache,mode=max

      - name: Build and push Web
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./docker/web.Dockerfile
          push: ${{ github.ref == 'refs/heads/main' }}
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/cermont-web:latest
            ${{ secrets.DOCKER_USERNAME }}/cermont-web:${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/cermont-web:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/cermont-web:buildcache,mode=max
```

### 2. Workflow Deploy a Dev (automático en main)
```yaml
# .github/workflows/deploy-dev.yml
name: Deploy to Dev

on:
  push:
    branches: [ main ]
    paths:
      - 'apps/**'
      - 'docker/**'
      - 'docker-compose.yml'

jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    environment: development

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Dev Server via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEV_HOST }}
          username: ${{ secrets.DEV_USER }}
          key: ${{ secrets.DEV_SSH_KEY }}
          script: |
            cd /app/cermont
            git pull origin main
            docker-compose -f docker-compose.dev.yml pull
            docker-compose -f docker-compose.dev.yml up -d
            docker-compose exec -T api npm run migrate

      - name: Smoke tests on Dev
        run: |
          curl -f http://${{ secrets.DEV_HOST }}:3000/health || exit 1
          curl -f http://${{ secrets.DEV_HOST }}:4200 || exit 1

      - name: Notify Slack (success)
        if: success()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"✅ Deploy a Dev exitoso"}'

      - name: Notify Slack (failure)
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"❌ Deploy a Dev falló"}'
```

### 3. Workflow Deploy a Staging/Prod (manual)
```yaml
# .github/workflows/deploy-prod.yml
name: Deploy to Staging / Prod

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}

    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets[format('{0}_HOST', github.event.inputs.environment | upper)] }}
          username: ${{ secrets[format('{0}_USER', github.event.inputs.environment | upper)] }}
          key: ${{ secrets[format('{0}_SSH_KEY', github.event.inputs.environment | upper)] }}
          script: |
            cd /app/cermont
            git pull origin main
            docker-compose -f docker-compose.${{ github.event.inputs.environment }}.yml pull

            # Backup antes de deploy
            docker-compose -f docker-compose.${{ github.event.inputs.environment }}.yml exec -T api pg_dump -U postgres cermont > backup_$(date +%s).sql

            docker-compose -f docker-compose.${{ github.event.inputs.environment }}.yml up -d
            docker-compose -f docker-compose.${{ github.event.inputs.environment }}.yml exec -T api npm run migrate

      - name: Health check
        run: |
          curl -f http://${{ secrets[format('{0}_HOST', github.event.inputs.environment | upper)] }}/api/health || exit 1

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          body: |
            Deployed to ${{ github.event.inputs.environment }}
            Commit: ${{ github.sha }}
```

## Dockerfile Patrones

### API (Node + NestJS)
```dockerfile
# docker/api.Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:api

# Producción
FROM node:20-alpine

WORKDIR /app

# No ejecutar como root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/api ./dist
COPY --from=builder /app/prisma ./prisma

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

USER nodejs

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Web (Angular)
```dockerfile
# docker/web.Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:web -- --configuration production

# Serve con nginx
FROM nginx:alpine

COPY --from=builder /app/dist/apps/web /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## docker-compose Ambientes

### Dev (local, con hot-reload)
```yaml
# docker-compose.dev.yml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: cermont
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build:
      context: .
      dockerfile: docker/api.Dockerfile
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:dev_password@postgres:5432/cermont
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    volumes:
      - ./apps/api:/app/apps/api
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    command: npm run start:api -- --watch

  web:
    build:
      context: .
      dockerfile: docker/web.Dockerfile
    ports:
      - "4200:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

## Monitoring + Alertas

### Health Checks (obligatorio)
```typescript
// apps/api/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private db: PrismaService,
    private redis: RedisService
  ) {}

  @Get()
  async check(): Promise<HealthDto> {
    const dbOk = await this.checkDb();
    const redisOk = await this.checkRedis();

    const allHealthy = dbOk && redisOk;

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date(),
      checks: {
        database: dbOk ? 'ok' : 'failed',
        cache: redisOk ? 'ok' : 'failed'
      }
    };
  }
}
```

## Reglas GEMIOS para DevOps
- Regla 1: Todo está en código (IaC); no cambios manuales en servidores.
- Regla 5: Logs centralizados (ELK, Datadog, etc); no buscar en servidores.
- Regla 10: Caching inteligente (Docker layers, CDN, Redis).
- Regla 13: Secretos en variables de entorno o vault; nunca en código.

## Entradas ideales (qué confirmar)
- Plataforma de hosting (AWS, DigitalOcean, on-premise).
- Requisitos de compliance (backups, logs, auditoría).
- SLA esperado (uptime 99.9%?).

## Salidas esperadas
- Workflows funcionales (lint, test, build, deploy).
- Dockerfiles optimizados (multi-stage, pequeños).
- Monitoring activo (health checks, alerts).
- Docs de deployment y rollback.

## Checklist DevOps "Done"
- ✅ CI/CD workflows en GitHub Actions.
- ✅ Docker images multi-stage optimizadas.
- ✅ Health checks en prod (readiness, liveness).
- ✅ Secrets en env vars (nunca en código).
- ✅ Logs centralizados.
- ✅ Monitoring y alertas configuradas.
- ✅ Backup y disaster recovery plan.
- ✅ Rollback automático en despliegues fallidos.
