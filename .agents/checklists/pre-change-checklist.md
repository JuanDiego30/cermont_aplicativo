# Pre-Change Checklist

> Run before writing a single line of code.

---

## Context

- [ ] I know exactly which workspace(s) this change touches: `backend` / `frontend` / `shared-types`.
- [ ] I have read the task description and understand the expected outcome.
- [ ] I have read `.agents/rules/01-stack.md` and confirmed no forbidden dependency is needed.
- [ ] I have read `.agents/rules/02-architecture.md` and understand the module boundaries.
- [ ] I have read the workspace-specific rule file (03-frontend / 04-backend / 05-security as applicable).
- [ ] I have read `.agents/rules/09-prohibitions.md`.

## Domain Knowledge

- [ ] I have read the relevant DOC file(s) for domain rules (DOC-09 for schemas, DOC-10 for API contracts).
- [ ] I know which RBAC roles are affected by this change.
- [ ] I understand the FSM state machine if this touches order status.

## Baseline

- [ ] I have run `npm run typecheck` and know the current TypeScript error count.
- [ ] I have run `npm run test` and know which tests currently pass.
- [ ] I have run `npm run quality:strict` and know the current quality issues.

## Scope

- [ ] I can list all files I will create or modify.
- [ ] I have identified which existing files I need to read before editing.
- [ ] The change is the smallest possible scope to achieve the goal.
- [ ] I will not introduce any new dependencies without confirming they are not forbidden.

## If the Change Is Broad (>3 files or cross-module)

- [ ] I have presented the plan and received confirmation before implementing.
