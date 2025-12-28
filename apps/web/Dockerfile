# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /build

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY angular.json tsconfig*.json ./
COPY src ./src

# Build for production
RUN pnpm run build --configuration production

# Production stage - use nginx for serving static files
FROM nginx:alpine

# Copy built Angular app
COPY --from=builder /build/dist/apps/web/browser /usr/share/nginx/html

# Custom nginx config for Angular SPA routing
RUN echo 'server { \
    listen 4200; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    location /api { \
    proxy_pass http://api:3000; \
    proxy_http_version 1.1; \
    proxy_set_header Upgrade $http_upgrade; \
    proxy_set_header Connection "upgrade"; \
    proxy_set_header Host $host; \
    proxy_set_header X-Real-IP $remote_addr; \
    } \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml; \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4200 || exit 1

CMD ["nginx", "-g", "daemon off;"]
