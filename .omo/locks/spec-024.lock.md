# Lock: SPEC-024 — Revisión GitHub + Continuación CERMONT

| Field | Value |
|-------|-------|
| Agent | Sisyphus (deepseek-v4-flash) |
| Branch | `implement/spec-024-post-spec022-continuation` |
| Base | `implement/spec-022-multiagent-continuation` |
| Sprint | 0-7 (Fase A-B-C + Sprints 1-7) |
| Started at | 2026-07-06 16:33 COT |
| Expected end | 2026-07-06 18:00 COT |

## Files owned
- `docs/coordination/*.md`
- `.sisyphus/locks/spec-024.lock.md`
- `.sisyphus/patches/*.patch`
- `.sisyphus/evidence/spec-024/*.txt`
- `specs/024-post-spec022-continuation/*.md`

## Files forbidden
- `backend/src/models/` (read-only)
- `packages/shared-types/src/schemas/` (read-only unless contract change)
- `packages/domain/` (read-only)
- `package.json`, `package-lock.json`

## Rules
- No `git reset --hard`, `git clean`, `rm -rf`
- No borrar archivos sin DELETION_LOG
- No modificar archivos fuera del lock
- No mezclar múltiples features en un commit
- Cada sprint produce código real + tests + gates + commit
