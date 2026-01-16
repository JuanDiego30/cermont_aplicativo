# Backend API Dockerfile - Multi-stage build
# Refactored for pnpm and production pruning
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 1: Install dependencies (including dev)
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
# Note: copying pnpm-lock.yaml* allows it to be optional if not passed in context, 
# but recommended to run build from root or copy lockfile.
RUN pnpm install --no-frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run prisma:generate
RUN pnpm run build

# Stage 3: Install ONLY production dependencies
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --no-frozen-lockfile

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app
NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy built artifacts and prod dependencies
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
# Copy prisma generated client if needed (usually in node_modules, but if custom location...)
# In standard setup, it's in node_modules/.prisma

USER nestjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "dist/main.js"]
