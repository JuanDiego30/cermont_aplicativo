# Cermont App - AI Coding Instructions

## Architecture Overview
Monorepo with NestJS backend (apps/api) and Next.js frontend (apps/web). Uses DDD architecture in backend modules with domain/application/infrastructure layers. Prisma ORM with PostgreSQL. JWT auth with refresh tokens in HttpOnly cookies. Offline sync via IndexedDB and service workers.

## Critical Setup Requirements
- **Environment Variables**: Must validate all env vars at startup (see `apps/api/src/config/env.validation.ts`). No fallbacks for `JWT_SECRET` - server fails without it.
- **Dependencies**: Use `pnpm` (not npm). Run `pnpm run dev` from root for parallel dev servers.
- **Database**: PostgreSQL required. Run `pnpm prisma:migrate` after schema changes.
- **CORS**: Configured with `credentials: true` for auth cookies. Set `FRONTEND_URL` correctly.

## Development Workflows
- **Start Dev**: `pnpm run dev` (cleans and starts both apps)
- **Build**: `turbo run build` (builds all workspaces)
- **Database**: `pnpm prisma:studio` to explore DB, `pnpm prisma:migrate dev` for migrations
- **Scripts**: Use PowerShell scripts in `scripts/` for setup (`setup.ps1`), build (`build-all.ps1`), deploy (`deploy.sh`)

## Backend Patterns (NestJS + DDD)
- **Modules**: Follow DDD structure (domain/entities, application/use-cases, infrastructure/controllers). Example: `apps/api/src/modules/ordenes/`
- **Validation**: Use Zod schemas in DTOs, not just class-validator. Example: `apps/api/src/modules/ordenes/application/dto/`
- **Auth**: JWT guards with `@UseGuards(JwtAuthGuard)`. Refresh tokens handled via cookies.
- **Errors**: Use HTTP exceptions, not generic errors. Global filters in `apps/api/src/common/filters/`
- **FSM**: Order states managed with finite state machine. Transitions in `orden-estado.vo.ts`

## Frontend Patterns (Next.js)
- **State**: Zustand stores in `apps/web/src/stores/`. No Redux.
- **API Client**: Unified client in `apps/web/src/lib/api-client.ts` with auth headers.
- **Offline**: IndexedDB sync in `apps/web/src/lib/offline-sync.ts`. Queue operations when offline.
- **Components**: Feature-based organization in `apps/web/src/features/`

## Key Files to Reference
- `README.md`: Setup and overview
- `docs/ANALISIS-CRITICO-PROYECTO.md`: Current refactoring status (critical issues being fixed)
- `apps/api/src/main.ts`: Server bootstrap with security middleware
- `apps/api/prisma/schema.prisma`: Database schema
- `docker-compose.yml`: Local development environment

## Current Project State
Undergoing critical refactoring (see `docs/REFACTORIZACION-PARTE-1-BLOQUEANTES.md`). Many core files incomplete. Always check `docs/` for latest fixes before implementing new features.