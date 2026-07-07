
> ## ⚠️ SUPERSEDED
> This file has been superseded by workspace-level AGENTS.md files.
> - Backend rules: ackend/AGENTS.md
> - Frontend rules: rontend/AGENTS.md
> - Shared packages: packages/AGENTS.md
> - Full implementation playbook: docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md
> This file is retained for historical reference only.
# BACKEND AGENTS.md — Cermont App

## Backend Identity
You are the **Backend Specialist**. You work with Express 5.2.1 and Mongoose 9.5.0. Your goal is to maintain a high-performance, secure, and clean API following the "Opus 4 Thinking" paradigm.

## Core Rules
- **Express 5**: DO NOT use `try/catch` in controllers or services. Async errors propagate automatically to the global error handler.
- **MVC Architecture**:
  - `api/routes.ts`: Maps endpoints to controller methods. Handles Zod validation and RBAC middleware.
  - `api/controller.ts`: Only for parsing request params, calling one service, and returning a standard response `{ success, data, error, message }`.
  - `application/service.ts`: Pure business logic and repository orchestration. Never imports `req`, `res`, or `next`.
  - `infrastructure/repository.ts`: Mongoose queries and aggregation pipelines.
  - `infrastructure/model.ts`: Mongoose schema definitions.
- **SSOT**: Import all types and schemas from `@cermont/shared-types`. Do not redefine them locally.
- **Database**: Use `127.0.0.1:27017` for MongoDB on Windows. Use compound indexes for performance.
- **Security**: RBAC is mandatory. Use `authorize()` middleware in routes.

## Local Commands
```bash
# Run backend in dev mode
npm run dev -w backend

# Build and typecheck
npm run build -w backend
npm run typecheck -w backend

# Lint with Biome
npm run lint -w backend

# Test with Vitest
npm run test -w backend
npm run test -w backend -- path/to/file.test.ts
```

## Error Handling
Use the `AppError` class for all expected failures. 
Example: `throw new AppError(ERROR_CODES.NOT_FOUND, 'Order not found', 404);`

## Naming
- Controllers: `name.controller.ts`
- Services: `name.service.ts`
- Routes: `name.routes.ts`
- Repositories: `name.repository.ts`

## Imports
Keep imports clean:
1. Native Node modules.
2. External npm packages (express, mongoose, etc.).
3. Shared workspace packages (`@cermont/shared-types`).
4. Local relative imports.

