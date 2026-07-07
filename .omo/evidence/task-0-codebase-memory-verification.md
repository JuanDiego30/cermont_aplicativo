# Phase 0 — codebase-memory verification

- `codebase-memory-mcp`: not found on PATH.
- Project `.mcp.json`: no codebase-memory server entry.
- Project dependency tree: no codebase-memory package.
- Existing `.codebase-memory/graph.db.zst`: not found.
- Installer/binary executed: no.
- Decision: `BLOCKED_WITH_EVIDENCE`; use read-only `rg`/filesystem fallback and do not claim graph indexing.

Detailed security/setup decision: `specs/007-codebase-memory-innovation-cermont/codebase-memory-setup.md`.
