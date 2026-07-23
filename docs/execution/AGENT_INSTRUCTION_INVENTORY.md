# AGENT_INSTRUCTION_INVENTORY.md

## Purpose

Inventory of all agent instruction files found in the rescue snapshot `rescue/local-snapshot-20260723`. Documents origin, duplication, and integration decision for each tree.

## Files imported to baseline (from rescue)

| Path | Purpose | Origin | Scope | Decision |
|------|---------|--------|-------|----------|
| `AGENTS.md` | Root agent rules, invariants, stack, design tokens | CERMONT project | Global | ✅ Imported |
| `docs/GIT_WORKFLOW.md` | Git safety policy, branch strategy, worktree convention | CERMONT project | Global | ✅ Imported |
| `backend/AGENTS.md` | Backend-specific rules | CERMONT project | Backend | ✅ Imported |
| `frontend/AGENTS.md` | Frontend-specific rules | CERMONT project | Frontend | ✅ Imported |
| `packages/AGENTS.md` | Shared packages rules | CERMONT project | Packages | ✅ Imported |

## Files NOT imported (excluded from rescue)

### Skill libraries (3 complete copies)

| Tree | Files | Origin | Duplication |
|------|-------|--------|-------------|
| `skills/` | ~100 files (impeccable, ponytail, brandkit, gsap, etc.) | External vendor | Identical to `.agents/skills/` and `.claude/skills/` for many skills |
| `.agents/skills/` | ~400+ files across 25+ skills | External vendor | Duplicates `skills/` and `.claude/skills/` |
| `.claude/skills/` | ~500+ files across 30+ skills | External vendor | Largest set, includes scripts, agents, references |

**Key duplications detected:**

| Skill | skills/ | .agents/skills/ | .claude/skills/ | Same SHA? |
|-------|---------|-----------------|-----------------|-----------|
| impeccable | ✅ | ❌ | ✅ | Likely |
| react-doctor | ✅ | ✅ | ❌ | Partial |
| ponytail | ✅ | ❌ | ✅ | Likely |
| react-best-practices | ❌ | ✅ | ✅ | Likely |
| zod | ❌ | ✅ | ✅ | Likely |
| react-hook-form | ❌ | ✅ | ✅ | Likely |

### Duplicated within frontend/

| Path | Purpose | Decision |
|------|---------|----------|
| `frontend/.agents/skills/react-doctor/SKILL.md` | React Doctor skill | 🚫 Excluded |
| `frontend/.claude/skills/react-doctor/SKILL.md` | React Doctor skill (copy) | 🚫 Excluded |

### Per-module AGENTS.md

| Path | Included? | Reason |
|------|-----------|--------|
| `backend/AGENTS.md` | ✅ Imported | Project-specific backend rules |
| `frontend/AGENTS.md` | ✅ Imported | Project-specific frontend rules |
| `packages/AGENTS.md` | ✅ Imported | Project-specific packages rules |

### Other excluded trees

| Tree | Reason |
|------|--------|
| `.claude/settings.json` | Agent-specific configuration |
| `.claude/settings.local.json` | Agent-specific configuration |
| `.agents/workflows/` | External agent workflows |
| `.claude/worktrees/` | Agent cache (git worktrees) |

## Contradiction risks

1. **Generic skills compete with AGENTS.md rules**: External skill libraries may instruct the agent to use patterns that violate CERMONT invariants (e.g., `StatusObject` requirement, no `any`).
2. **No project context in external skills**: Skills like `impeccable` are designed for general UI critique; they don't know about CERMONT's 14-step workflow, RBAC matrix, or contract-first approach.
3. **Instruction overload**: Having 500+ skill files plus AGENTS.md may cause the agent to prioritize generic advice over project-specific rules.

## Priority order (as defined)

1. `AGENTS.md` (root) — must win all conflicts
2. CERMONT-specific rules (docs/security, docs/domain)
3. `AGENTS.md` of active module
4. External skills — only when they solve a concrete need

## Recommendation

- Keep root `AGENTS.md`, `backend/AGENTS.md`, `frontend/AGENTS.md`, `packages/AGENTS.md`
- Keep CERMONT-specific docs (runbooks, domain, security, design)
- Do NOT import `skills/`, `.agents/skills/`, `.claude/skills/`
- Import external skills individually when a specific need arises
