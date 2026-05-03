# Backend Express.js - Multi-stage build optimizado para monorepo
# Estructura: deps → builder → runtime
# Ref: https://docs.docker.com/build/building/multi-stage/

# ============================================================================
# Stage 1: Dependencias (base layer - reutilizable)
# ============================================================================
FROM node:22-alpine AS dependencies

WORKDIR /app

# Copiar solo manifests de workspace (minimiza invalidación de caché)
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY backend/package.json backend/

# Instalar dependencias de producción + dev
RUN npm ci --include-workspace-root --workspaces

# ============================================================================
# Stage 2: Builder (compilación)
# ============================================================================
FROM dependencies AS builder

WORKDIR /app

# Copiar código fuente de packages
COPY packages/shared-types ./packages/shared-types

# Copiar código fuente del backend
COPY backend ./backend

# Compilar shared-types
RUN npm run build -w @cermont/shared-types

# Compilar backend
RUN npm run build -w @cermont/backend

# ============================================================================
# Stage 3: Runtime (Producción optimizada)
# ============================================================================
FROM node:22-alpine AS runtime

WORKDIR /app

# Instalar solo herramientas necesarias
RUN apk add --no-cache dumb-init curl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S expressjs -u 1001

# Copiar node_modules de builder
COPY --from=dependencies --chown=expressjs:nodejs /app/node_modules ./node_modules

# Copiar archivos de configuración
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=expressjs:nodejs /app/package-lock.json ./package-lock.json

# Copiar compilados de packages
COPY --from=builder --chown=expressjs:nodejs /app/packages ./packages

# Copiar compilado del backend
COPY --from=builder --chown=expressjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=expressjs:nodejs /app/backend/package.json ./backend/

# Crear directorio de uploads con permisos
RUN mkdir -p /app/uploads && chown -R expressjs:nodejs /app/uploads

# Configuración de entorno
ENV NODE_ENV=production \
    PORT=4000 \
    NODE_OPTIONS="--max-old-space-size=320"

EXPOSE 4000

USER expressjs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "backend/dist/server.js"]
