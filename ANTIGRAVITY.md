# 🪐 ANTIGRAVITY MANIFESTO (v2.1)

## 🎯 Core Philosophy
**"Stability is the only metric that matters."**
In the Cermont Monorepo, we prioritize correct, stable architecture over rapid feature churning. We resist the "gravity" of technical debt by applying strict force (governance) in the opposite direction.

## 🛠️ The Workflow: Research → Plan → Implement
To ensure quality, every task of significant complexity (>1 file edit) MUST follow this cycle:

### 1. 🔍 RESEARCH (Phase A)
*Before writing a single line of code:*
- **Audit**: Read existing code (`view_file`, `grep_search`). Don't guess.
- **Context**: Understand the *why*. Check `SCOPE.md`.
- **Output**: A mental or written summary of *what* exists and *why* it needs changing.

### 2. 📐 PLAN (Phase B)
*The Blueprint:*
- **Create/Update**: `implementation_plan.md`.
- **Define**:
    - **Affected Files**: precise paths.
    - **Changes**: exact function names/classes.
    - **Risks**: what could break?
    - **Verification**: How will we prove it works?
- **Gate**: **USER APPROVAL REQUIRED** before moving to Phase C.

### 3. 🔨 IMPLEMENT (Phase C)
*The Execution:*
- **Atomic**: One conceptual change per step.
- **Linting**: Run `lint:fix` frequently.
- **Standards**: Follow the **41 Rules** (see below).

### 4. ✅ VERIFY (Phase D)
*The Proof:*
- **Automated**: `pnpm run check` (MUST PASS).
- **Manual**: Verify the specific acceptance criteria.
- **Artifact**: Update `walkthrough.md` with proof.

---

## 🔴 THE 41 RULES (Condensed)
*See `CORE_RULES.md` for full text.*

1.  **No Duplication**: <3% threshold (use `shared/`).
2.  **Base Classes**: Extend `BaseService`, `BaseRepository`.
3.  **Value Objects**: No primitives for domain data.
4.  **Mappers**: `DTO` ↔ `Entity` ↔ `Persistence` strictly.
5.  **Try-Catch**: Mandatory in Async methods.
6.  **No Console.log**: Use `Logger`.
7.  **Naming**: Descriptive, English/Spanish consistent.
8.  **Small Functions**: <30 lines preferred.
9.  **DI Only**: No `new Class()`.
10. **No N+1**: Use `.findMany({ include: ... })`.
...
41. **MCP Auto-Approve**: Read-only operations are auto-approved.

## 📁 Directory Structure
- `.antigravity/`: Workflow templates and agent memory.
- `apps/api/src/shared/`: Shared Value Objects/Utils.
- `packages/`: Shared libs between web/api.

---
*Created by Antigravity Agent*
