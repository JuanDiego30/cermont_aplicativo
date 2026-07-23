# Rescue Reconciliation Inventory

> Generated: 2026-07-23
> Source: origin/rescue/local-snapshot-20260723
> Base: origin/deploy/vps-clean (1541906)

## Summary

| Category | Count | Action |
|----------|-------|--------|
| Governance | 1 file | Import: AGENTS.md |
| Documentation (docs/) | 274 files | Import selectively |
| Agent vendor content (.agents/ .claude/) | 922 entries | **Exclude** — duplicate, generic skills |
| Source code | 676 files | **Exclude** — belongs in feature branches |
| Tests | 135 files | **Exclude** — belongs with feature code |
| Deleted files | 0 | N/A |

## Files to Import from Rescue

### Governance (approved)
- AGENTS.md — root agent rules
- REGLAS_DESARROLLO_CERMONT.md — development rules (corrected)

### Documentation (selective)
- docs/CURRENT_IMPLEMENTATION_STATUS.md
- docs/KNOWN_DEFECTS.md
- docs/domain/SERVICE_CASE_WORKFLOW.md
- docs/security/RBAC_MATRIX.md
- docs/design/DESIGN.md
- docs/design/CERMONT_UIUX_GUIDE.md
- docs/runbooks/
- docs/modules/auth/SPEC.md
- docs/modules/workflow/SPEC.md
- docs/traceability/

### Excluded (documented for cleanup)
- .agents/skills/ — vendor skills, duplicate
- .claude/skills/ — vendor skills, duplicate
- .omo/ — previous session artifacts
- backend/src/ — feature code (separate branch)
- frontend/src/ — feature code (separate branch)
- packages/ — feature code (separate branch)
- .agents/skills/react-best-practices/ — duplicate of .claude/skills/react-best-practices

## Agent Instruction Inventory

See: docs/execution/AGENT_INSTRUCTION_INVENTORY.md
