# Claude Instructions — Cermont (Antigravity)

Follow Antigravity gates and workflow.
Source of truth:
- ANTIGRAVITY.md
- .antigravity/workflow/Estructura.md

## Gates
- No repo sweep: never modify files outside declared scope.
- No risky deps: do not add dependencies without explicit user approval.
- Verification required: every change ends with Verify (commands + pasted outputs).
- Small PR: one goal per PR.

## Required workflow
1) Research: fill `.antigravity/workflow/01_RESEARCH.md` (read-only).
2) Plan: fill `.antigravity/workflow/02_PLAN.md` and request user approval.
3) Implement: minimal changes.
4) Verify: fill `.antigravity/workflow/03_VERIFY.md`.

## Default commands (repo root)
- pnpm install
- pnpm run lint
- pnpm run typecheck
- pnpm run test
- pnpm run build
