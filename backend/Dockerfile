# Backend Express.js - Multi-stage build para monorepo con npm run start
# Ref: https://docs.docker.com/build/building/multi-stage/

# ============================================================================
# Stage 1: Dependencias (base layer - reutilizable)
# ============================================================================
FROM node:22-alpine AS dependencies

WORKDIR /app

# Copiar solo manifests de workspace
COPY package.json package-lock.json ./
COPY packages/config/package.json packages/config/
COPY packages/domain/package.json packages/domain/
COPY packages/shared-types/package.json packages/shared-types/
COPY backend/package.json backend/

# Instalar todas las dependencias (incluye dev para build)
RUN npm ci --include-workspace-root --workspaces

# ============================================================================
# Stage 2: Builder (compilación TypeScript)
# ============================================================================
FROM dependencies AS builder

WORKDIR /app

# Copiar código fuente de packages
COPY packages/config ./packages/config
COPY packages/domain ./packages/domain
COPY packages/shared-types ./packages/shared-types

# Copiar código fuente del backend
COPY backend ./backend

# Build packages en orden de dependencias
RUN npm run build -w @cermont/config
RUN npm run build -w @cermont/shared-types
RUN npm run build -w @cermont/domain

# Build backend
RUN npm run build -w backend

# ============================================================================
# Stage 3: Prune (Eliminar dependencias dev)
# ============================================================================
FROM dependencies AS prune

WORKDIR /app

# Generar node_modules solo con dependencias de producción
RUN npm prune --omit=dev --workspaces

# ============================================================================
# Stage 4: Runtime (Producción optimizada)
# ============================================================================
FROM node:22-alpine AS runtime

WORKDIR /app

# Instalar solo herramientas necesarias
RUN apk add --no-cache dumb-init curl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S expressjs -u 1001

# Copiar node_modules solo de producción desde prune
COPY --from=prune --chown=expressjs:nodejs /app/node_modules ./node_modules

# Copiar archivos de configuración raíz
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=expressjs:nodejs /app/package-lock.json ./package-lock.json

# Copiar compilados de packages
COPY --from=builder --chown=expressjs:nodejs /app/packages ./packages

# Copiar compilado del backend (dist + package.json)
COPY --from=builder --chown=expressjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=expressjs:nodejs /app/backend/package.json ./backend/package.json

# Crear directorio de uploads con permisos
RUN mkdir -p /app/uploads && chown -R expressjs:nodejs /app/uploads && chmod 755 /app/uploads

# Configuración de entorno para producción
ENV NODE_ENV=production \
    PORT=4000 \
    NODE_OPTIONS="--max-old-space-size=512"

EXPOSE 4000

USER expressjs

WORKDIR /app

# Healthcheck basado en endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Ejecutar npm run start (que ejecuta: node backend/dist/server.js)
CMD ["npm", "run", "start:backend"]
