# Build stage
FROM node:18-alpine AS builder

WORKDIR /build

COPY package*.json ./
COPY angular.json tsconfig*.json ./
COPY src ./src

RUN npm ci
RUN npm run build -- --configuration production

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g @angular/cli

ENV NODE_ENV=production

# Copy angular app
COPY --from=builder /build/dist/apps/web ./dist

# Simple HTTP server
RUN npm install -g http-server

EXPOSE 4200

CMD ["http-server", "dist", "-p", "4200", "-c-1"]
