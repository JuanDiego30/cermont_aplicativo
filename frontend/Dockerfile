# Frontend Next.js - Multi-stage build optimizado para monorepo
# Estructura: deps → builder → runtime
# Estrategia: Output standalone para reducir tamaño final
# Ref: https://nextjs.org/docs/app/api-reference/config/next-config-js/output

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

# Instalar dependencias con workspaces
RUN npm ci --include-workspace-root --workspaces

# ============================================================================
# Stage 2: Builder (compilación)
# ============================================================================
FROM dependencies AS builder

WORKDIR /app

# Copiar código fuente de packages
COPY packages/config ./packages/config
COPY packages/domain ./packages/domain
COPY packages/shared-types ./packages/shared-types

# Copiar código fuente del frontend
COPY frontend ./frontend

# Compilar packages (si necesario)
RUN npm run build -w @cermont/config --if-present
RUN npm run build -w @cermont/shared-types --if-present
RUN npm run build -w @cermont/domain --if-present

# Compilar frontend con Next.js
# Output standalone: reduce tamaño final, mejor para producción
RUN npm run build -w frontend

# ============================================================================
# Stage 3: Runtime (Producción optimizada)
# ============================================================================
FROM node:22-alpine AS runtime

WORKDIR /app

# Instalar solo herramientas necesarias
RUN apk add --no-cache dumb-init curl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copiar output standalone de Next.js
# next/standalone contiene toda la aplicación optimizada
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./

# Copiar archivos estáticos
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

# Copiar package.json para referencia
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Configuración de entorno
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME="0.0.0.0" \
    NODE_OPTIONS="--max-old-space-size=256"

EXPOSE 3000

USER nextjs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Ejecutar servidor Next.js
CMD ["node", "frontend/server.js"]
