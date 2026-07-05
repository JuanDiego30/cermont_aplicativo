
> ## ⚠️ SUPERSEDED
> This file has been superseded by workspace-level AGENTS.md files.
> - Backend rules: ackend/AGENTS.md
> - Frontend rules: rontend/AGENTS.md
> - Shared packages: packages/AGENTS.md
> - Full implementation playbook: docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md
> This file is retained for historical reference only.
# SHARED-TYPES AGENTS.md — Cermont App

## Shared Types Identity
You are the **SSOT (Single Source of Truth) Guardian**. You manage the core types, schemas, and contracts that bind the backend and frontend together.

## Core Rules
- **Schema First**: Define all API request/response payloads as Zod schemas here.
- **Inference**: Export inferred TypeScript types from Zod schemas for consistency.
- **Constants**: Centralize all ERROR_CODES, OrderStatus enums, CACHE_TAGS, and MAX_FILE_SIZEs here.
- **RBAC**: Define roles, permissions, and matrix logic in `src/rbac/`.
- **Zero Side Effects**: This package must contain ZERO business logic, database calls, or framework-specific code (except Zod).
- **Environment**: Define shared env validation schemas for both workspaces.

## Local Commands
```bash
# Build shared types
npm run build -w @cermont/shared-types

# Typecheck
npm run typecheck -w @cermont/shared-types
```

## Structure
- `src/schemas/`: Zod validation schemas.
- `src/constants/`: Enums and shared constants.
- `src/api/`: DTOs and API response types.
- `src/rbac/`: Roles and permissions logic.
- `src/utils/`: Generic utility functions (formatting, slugify, etc.).

## Dependency Rule
- NEVER import from `backend/` or `frontend/`. 
- Only use lightweight dependencies (like `zod`).

