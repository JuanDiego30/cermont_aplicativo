# Decisions — Spec 007

## D001: Fallback Strategy for codebase-memory-mcp
- **Decision**: Use native tools (glob, grep, codebase_search, explore agents) instead of codebase-memory-mcp for codebase mapping
- **Rationale**: No C compiler available on Windows; binary downloaded but CLI indexing already completed on the cloned repo
- **Date**: 2026-06-29

## D002: Wave Execution Order
- **Decision**: Execute Wave 1 tasks in parallel where possible, starting with T1 (branch + secrets) as foundation
- **Rationale**: T1 blocks all other tasks; T2-T8 can run in parallel after T1
- **Date**: 2026-06-29

## D003: Map Creation Strategy
- **Decision**: Create maps based on REAL codebase exploration, not speculation
- **Rationale**: Plan explicitly forbids hallucinated content; must use actual file system inspection
- **Date**: 2026-06-29
