# 📁 api/Dockerfile

FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma

# Instalar dependencias
RUN npm ci

# Build
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init para manejo de signals
RUN apk add --no-cache dumb-init

# Copiar node_modules del builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Crear directorio de uploads
RUN mkdir -p /uploads

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Correr con dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
