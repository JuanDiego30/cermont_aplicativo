# Codebase Memory Setup — Spec 007

**Audited:** 2026-06-29  
**Decision:** blocked for this running Codex session; native read-only mapping is the approved fallback.

## Verification

| Check | Result | Risk | Decision |
|---|---|---|---|
| `Get-Command codebase-memory-mcp` | Not found | The repository cannot be indexed through the requested MCP in this session | Do not claim MCP indexing |
| `codebase-memory-mcp --version` | Command not recognized | Same | Record blocker and use `rg`/filesystem inspection |
| Root `package.json` | No `codebase-memory-mcp` dependency | Installing it would modify dependencies/lockfile | Do not install without separate dependency approval |
| Project `.mcp.json` | Only `next-devtools` and the local Express MCP are configured | Editing MCP configuration affects agent startup and requires a restart | Do not mutate agent configuration during this run |
| Existing graph artifact | No `.codebase-memory/graph.db.zst` found | No reusable index exists | Map from source and mark provenance |

## Security review of the proposed tool

The upstream project states that it:

- reads the repository to build a local structural graph;
- stores its database under the user's cache and can optionally write `.codebase-memory/graph.db.zst` in the repository;
- can modify MCP configuration, instruction files, skills, and hooks when its installer runs without `--skip-config`;
- runs indexing and semantic search locally without an API key;
- requires the coding agent to restart before newly configured MCP tools become available.

Because the binary and installer are absent, no external script or unsigned binary was executed. Installation is deliberately separated from Spec 007 implementation so that its checksum, installer diff, target directories, configuration changes, and rollback can be reviewed first.

## Fallback used for T2–T13

The maps are produced and verified using:

1. `rg --files` for the physical inventory;
2. `rg` symbol and route searches for mounts, consumers, schemas, roles, and query keys;
3. direct reads of the canonical docs and implementation files;
4. targeted tests and route/contract comparisons;
5. explicit provenance in every generated map.

This fallback does **not** provide a persistent call graph. Statements about callers, consumers, or dead code therefore require a file-and-line receipt and must not be presented as graph-derived facts.

## Installation follow-up (separate approval)

If Cermont later approves installation:

1. download the Windows archive and `checksums.txt` from a pinned release;
2. verify SHA-256 before extraction;
3. inspect `install.ps1` and run binary-only installation with configuration disabled;
4. add a reviewed project MCP entry manually;
5. restart Codex;
6. run `index_repository` from the repository root;
7. compare graph route counts and dependency edges with the committed maps before trusting the index.

## Phase 0 verdict

`codebase-memory-mcp`: **BLOCKED_WITH_EVIDENCE**  
Repository mapping: **FALLBACK_ACTIVE**  
Safe to continue with design/documentation: **YES**  
Safe to claim codebase-memory indexing: **NO**
