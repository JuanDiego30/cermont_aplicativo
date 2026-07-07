# 08 — DevOps & VPS Deployment Rules

> Canonical source for Docker, GitHub Actions CI/CD, VPS-only deployment, PM2, and health checks.

---

## Deployment Policy — VPS Only

**The application is deployed exclusively to the team's own VPS.**  
Vercel, Netlify, Railway, Render, Heroku, and any managed hosting are FORBIDDEN.

This is a hard architectural constraint driven by:
- Data residency requirements.
- Full control over the server environment.
- Cost predictability.

---

## PM2 — Process Manager

```bash
# Start production with PM2
pm2 start ecosystem.config.js --env production

# Status
pm2 status

# Save process list (survives reboots)
pm2 save

# Enable startup on reboot
pm2 startup

# Or use npm scripts
npm run deploy:pm2:start
npm run deploy:pm2:status
npm run deploy:pm2:save
npm run deploy:pm2:startup
```

`ecosystem.config.js` at the monorepo root defines both backend and frontend processes.

---

## Docker

### Multi-Stage Builds

All Docker images use multi-stage builds to minimize production image size:

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app
# Copy only production artifacts
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/package.json ./
RUN npm ci --omit=dev --frozen-lockfile
USER node   # Never run as root
HEALTHCHECK CMD curl -f http://localhost:4000/api/health || exit 1
```

### Images Requirements
- Base: `node:22-alpine` (minimal attack surface).
- Run as non-root user (`USER node`).
- Include `HEALTHCHECK` for all backend services.
- Use named volumes for MongoDB data persistence.
- Never store secrets in Docker images — use environment variables.

### Docker Compose

```bash
# Production
npm run docker:up     # docker compose up --build -d
npm run docker:down   # docker compose down
npm run docker:reset  # full reset with volume wipe
npm run docker:logs   # follow logs

# Development (MongoDB only)
npm run db:dev        # start local MongoDB
npm run db:dev:stop
npm run db:dev:down
```

---

## GitHub Actions CI/CD Pipeline

Pipeline gates (must all pass before merge):

```yaml
jobs:
  quality:
    steps:
      - npm ci --frozen-lockfile      # reproducible installs
      - npm run typecheck             # 0 TypeScript errors
      - npm run lint                  # 0 Biome errors
      - npm run test --coverage       # ≥80% backend, ≥40% frontend
      - npm audit --audit-level=high  # no high/critical CVEs
      - npm run build                 # production build succeeds
      - npm run quality:strict        # custom quality checks pass
```

No PR merges to `main` without a green CI pipeline.

---

## Health Checks

- **Backend:** `GET /api/health` → `{ status: 'ok', uptime: number, db: 'connected' | 'disconnected' }`
- **Frontend:** Next.js default health indicators.
- Docker `HEALTHCHECK` pings `/api/health`.
- PM2 `max_memory_restart` set to auto-restart if memory exceeds threshold.

---

## Environment Variables

```bash
# Required backend variables (see .env.example for full list)
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/cermont_prod
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<another-strong-secret>
ALLOWED_ORIGINS=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

Rules:
- Never commit `.env` files to git.
- Use `.env.example` to document required variables (no values).
- Validate all variables at startup with `validateEnv()`.
- Different `.env` files per environment: `.env.development`, `.env.production`.

---

## npm ci vs npm install

In CI and Docker builds, always use:
```bash
npm ci --frozen-lockfile   # reproducible, uses exact package-lock.json
```

Never use `npm install` in CI — it updates the lockfile and breaks reproducibility.

---

## Turborepo Caching

Turborepo caches build outputs locally and in CI:

```bash
# Cache hits speed up: typecheck, lint, build, test
turbo run build --cache-dir=.turbo
```

In GitHub Actions, cache the `.turbo` directory between runs using `actions/cache`.

---

## Rollback Plan

1. `git log --oneline -20` — identify the last stable commit.
2. `git revert <commit>` — create a revert commit (preferred over force-reset).
3. `npm run build` — verify build passes.
4. Redeploy via PM2: `pm2 restart all`.

Never `git reset --hard` on `main` without explicit team approval.
