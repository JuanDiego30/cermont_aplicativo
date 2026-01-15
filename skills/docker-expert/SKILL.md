---
name: docker-expert
description: Experto en Docker y contenedorización para proyectos Node.js. Usar para Dockerfiles, multi-stage builds, docker-compose, optimización de imágenes y despliegues.
triggers:
  - Docker
  - Dockerfile
  - container
  - docker-compose
  - image
  - multi-stage
  - deployment
role: specialist
scope: infrastructure
output-format: code
---

# Docker Expert

Especialista en contenedorización con Docker para aplicaciones Node.js/TypeScript.

## Rol

DevOps engineer con 7+ años de experiencia en containerización. Experto en Docker, Kubernetes, optimización de imágenes y CI/CD con contenedores.

## Cuándo Usar Este Skill

- Crear Dockerfiles optimizados
- Configurar docker-compose
- Optimizar tamaño de imágenes
- Multi-stage builds
- Configurar entornos dev/prod
- Health checks y restart policies
- Networking entre contenedores
- Volúmenes y persistencia

## Dockerfile para NestJS (Optimizado)

```dockerfile
# Dockerfile - Backend NestJS
# Multi-stage build optimizado para producción

# ============================================
# Stage 1: Base con dependencias
# ============================================
FROM node:20-alpine AS base

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# ============================================
# Stage 2: Dependencias
# ============================================
FROM base AS deps

# Copiar archivos de dependencias
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/

# Instalar dependencias
RUN pnpm fetch --prod
RUN pnpm install --frozen-lockfile --prod

# ============================================
# Stage 3: Build
# ============================================
FROM base AS build

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/

# Instalar todas las dependencias (dev + prod)
RUN pnpm fetch
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY backend/ ./backend/

# Generar Prisma Client
RUN cd backend && pnpm prisma generate

# Compilar TypeScript
RUN cd backend && pnpm build

# ============================================
# Stage 4: Production
# ============================================
FROM base AS production

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copiar dependencias de producción
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copiar build
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/package.json ./backend/

# Copiar Prisma schema y client
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/node_modules/.prisma ./backend/node_modules/.prisma

# Cambiar a usuario no-root
USER nestjs

WORKDIR /app/backend

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "dist/main.js"]
```

## Dockerfile para Angular (Optimizado)

```dockerfile
# Dockerfile - Frontend Angular
# Multi-stage build con Nginx

# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar archivos de dependencias
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/

# Instalar dependencias
RUN pnpm fetch
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY frontend/ ./frontend/

# Variables de entorno para build
ARG API_URL=http://localhost:3000/api
ENV API_URL=$API_URL

# Build de producción
WORKDIR /app/frontend
RUN pnpm build --configuration=production

# ============================================
# Stage 2: Nginx
# ============================================
FROM nginx:alpine AS production

# Copiar configuración de nginx
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Copiar build de Angular
COPY --from=build /app/frontend/dist/frontend/browser /usr/share/nginx/html

# Copiar script de entrypoint para variables de entorno
COPY frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

## Docker Compose (Desarrollo)

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ============================================
  # Base de Datos PostgreSQL
  # ============================================
  postgres:
    image: postgres:16-alpine
    container_name: cermont-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-cermont}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-cermont123}
      POSTGRES_DB: ${DB_NAME:-cermont_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-cermont} -d ${DB_NAME:-cermont_db}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - cermont-network

  # ============================================
  # Redis para Cache
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: cermont-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-redis123}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--pass", "${REDIS_PASSWORD:-redis123}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - cermont-network

  # ============================================
  # Backend NestJS
  # ============================================
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
      target: production
    container_name: cermont-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://${DB_USER:-cermont}:${DB_PASSWORD:-cermont123}@postgres:5432/${DB_NAME:-cermont_db}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:-redis123}
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key}
      JWT_EXPIRATION: 15m
      REFRESH_TOKEN_EXPIRATION: 7d
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - cermont-network
    volumes:
      - ./backend/uploads:/app/backend/uploads
      - ./backend/logs:/app/backend/logs

  # ============================================
  # Frontend Angular
  # ============================================
  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
      target: production
      args:
        API_URL: http://localhost:3000/api
    container_name: cermont-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - cermont-network

# ============================================
# Volúmenes persistentes
# ============================================
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

# ============================================
# Red
# ============================================
networks:
  cermont-network:
    driver: bridge
```

## Docker Compose (Producción)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--pass", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

  backend:
    image: ghcr.io/${GITHUB_REPOSITORY}/backend:${VERSION:-latest}
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - internal
      - web
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G
      update_config:
        parallelism: 1
        delay: 10s
      rollback_config:
        parallelism: 1
        delay: 10s

  frontend:
    image: ghcr.io/${GITHUB_REPOSITORY}/frontend:${VERSION:-latest}
    restart: always
    depends_on:
      - backend
    networks:
      - web
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.frontend.tls=true"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
    deploy:
      replicas: 2

volumes:
  postgres_data:
  redis_data:

networks:
  internal:
  web:
    external: true
```

## Optimización de Imágenes

### .dockerignore

```dockerignore
# Dependencias
node_modules
**/node_modules

# Build outputs
dist
**/dist
.angular
**/.angular

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo

# Testing
coverage
**/coverage
*.spec.ts
*.test.ts
jest.config.*
vitest.config.*

# Docs
*.md
!README.md
docs/
Libro/

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# Env files (usar secrets en producción)
.env
.env.*
!.env.example

# Docker
docker-compose*.yml
Dockerfile*
.docker/

# CI/CD
.github/
.gitlab-ci.yml

# Misc
*.tgz
*.tar.gz
```

### Verificar tamaño de imagen

```bash
# Ver tamaño de imágenes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Analizar capas
docker history <image-name>

# Usar dive para análisis detallado
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive:latest <image-name>
```

## Comandos Útiles

```bash
# Build con cache
docker-compose build --parallel

# Build sin cache
docker-compose build --no-cache

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Ejecutar comando en contenedor
docker-compose exec backend pnpm prisma migrate deploy

# Limpiar recursos no usados
docker system prune -af

# Backup de volumen
docker run --rm -v cermont_postgres_data:/data -v $(pwd):/backup alpine \
  tar cvf /backup/postgres_backup.tar /data
```

## Restricciones

### DEBE HACER
- Usar multi-stage builds
- Agregar .dockerignore
- Configurar health checks
- Usar usuario no-root
- Definir límites de recursos

### NO DEBE HACER
- Ejecutar como root
- Copiar node_modules del host
- Hardcodear secrets en Dockerfile
- Ignorar layer caching
- Usar latest tag en producción

## Skills Relacionados

- **github-actions-cicd** - Build y push de imágenes
- **nestjs-performance** - Optimización de contenedores
- **security-hardening** - Seguridad de contenedores
