# Frontend Next.js - Multi-stage build para monorepo con npm run start
# Ref: https://nextjs.org/docs/deployment/docker

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
COPY frontend/package.json frontend/

# Instalar todas las dependencias (incluye dev para build)
RUN npm ci --include-workspace-root --workspaces

# ============================================================================
# Stage 2: Builder (compilación Next.js)
# ============================================================================
FROM dependencies AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost/api
ARG NEXT_PUBLIC_APP_URL=http://localhost
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# Copiar código fuente de packages
COPY packages/config ./packages/config
COPY packages/domain ./packages/domain
COPY packages/shared-types ./packages/shared-types

# Copiar código fuente del frontend
COPY frontend ./frontend

# Build packages si es necesario
RUN npm run build -w @cermont/config --if-present
RUN npm run build -w @cermont/shared-types --if-present
RUN npm run build -w @cermont/domain --if-present

# Build frontend con Next.js (genera .next/)
RUN npm run build -w frontend

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
    adduser -S nextjs -u 1001

# Copiar node_modules solo de producción
COPY --from=prune --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copiar archivos raíz
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json ./package-lock.json

# Copiar .next build output (compilado)
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next ./frontend/.next

# Copiar archivos estáticos
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

# Copiar package.json del frontend para referencia
COPY --from=builder --chown=nextjs:nodejs /app/frontend/package.json ./frontend/package.json

# Configuración de entorno para producción
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME="0.0.0.0" \
    NODE_OPTIONS="--max-old-space-size=256"

EXPOSE 3000

USER nextjs

WORKDIR /app

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Ejecutar npm run start:frontend (que ejecuta: next start)
CMD ["npm", "run", "start:frontend"]
