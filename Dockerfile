# Stage 1: Build shared packages
FROM node:22-alpine AS builder-shared
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/ ./packages/
RUN npm ci --ignore-scripts && npm run build -w @cermont/shared-types && npm run build -w @cermont/domain && npm run build -w @cermont/config

# Stage 2: Build backend
FROM node:22-alpine AS builder-backend
WORKDIR /app
COPY --from=builder-shared /app ./
COPY backend/ ./backend/
RUN npm ci --ignore-scripts -w backend && npm run build -w backend

# Stage 3: Build frontend
FROM node:22-alpine AS builder-frontend
WORKDIR /app
COPY --from=builder-shared /app ./
COPY --from=builder-backend /app/backend/dist ./backend/dist
COPY frontend/ ./frontend/
RUN npm ci --ignore-scripts -w frontend && npm run build -w frontend

# Stage 4: Production
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder-shared /app/packages ./packages
COPY --from=builder-backend /app/backend/dist ./backend/dist
COPY --from=builder-backend /app/backend/package.json ./backend/
COPY --from=builder-frontend /app/frontend/.next ./frontend/.next
COPY --from=builder-frontend /app/frontend/public ./frontend/public
COPY --from=builder-frontend /app/frontend/package.json ./frontend/
COPY --from=builder-frontend /app/frontend/next.config.ts ./frontend/
COPY package.json package-lock.json ./

RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

USER appuser
EXPOSE 4000 3000
CMD ["node", "backend/dist/server.js"]
