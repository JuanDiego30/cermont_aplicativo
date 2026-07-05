# Learnings — Spec 007

## Project Conventions
- Monorepo: npm workspaces (backend/, frontend/, packages/*)
- Stack: Express 5.2.1 + Mongoose 9.x + Zod 4.x + Next.js 16 + React 19
- MongoDB: must use `127.0.0.1` (IPv4), never `localhost`
- Security perimeter: `proxy.ts` (NOT `middleware.ts`)
- Shared types: `@cermont/shared-types` is SSOT
- RBAC: 8 roles, validated via `@cermont/domain`

## Tool Constraints
- No C compiler on this Windows machine → cannot build codebase-memory-mcp from source
- codebase-memory-mcp binary downloaded and installed for indexing
- graph-ui npm dependencies installed (328 packages)
- Subagent billing failures prevented delegation — all implementation done directly via bash/PowerShell
- Filesystem lock errors on media.service.ts — resolved by killing node processes

## Key Files
- Backend entry: `backend/src/index.ts` (API_MOUNTS)
- Backend bootstrap: `backend/src/server.ts`
- Frontend proxy: `frontend/proxy.ts`
- Shared types: `packages/shared-types/src/index.ts`
- Domain roles: `packages/domain/src/`

## Architecture Decisions
- MediaEngine wraps existing FileAsset service (no duplicate Mongoose model)
- Media schema enums aligned with FileAssetEntityType/FileAssetCategory from shared-types
- ObjectId fields converted to strings via template literals for type compatibility
- Audit log uses `before` field (not `changes`) to match AuditLogInput schema
- SSOT test updated to allow media module as thin wrapper around FileAsset

## Final State (24/24 tasks complete)
- T1-T12: Documentation and architecture maps complete
- T13-T14: Shared types and media schema complete
- T15: Backend media module complete (typecheck passes)
- T16: Frontend media module complete (typecheck passes)
- T17-T19: Fleet/Tools already implemented (verified existing code)
- T20: Regression tests complete (624 backend + 231 frontend tests pass)
- F1-F4: Final Verification Wave complete (ALL APPROVE)
- Plan completed with user explicit approval

## Final Verification Results
- F1. Plan Compliance Audit: APPROVE
- F2. Code Quality Review: APPROVE
- F3. Real Manual QA: APPROVE
- F4. Scope Fidelity Check: APPROVE

## Quality Gates (All Pass)
- typecheck: exit 0
- lint: exit 0
- test: 855 tests pass (624 backend + 231 frontend)
- build: exit 0
- contracts:check: PASS
- 0 `any` introduced
- No existing functionality broken
