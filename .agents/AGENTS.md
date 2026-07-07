# AGENTS.md — Cermont S.A.S.

> **Entry point for all AI agents.** This file is an index. Read the linked files for full rules.  
> Do not modify code before reading the applicable rules below.

---

## Project Identity

**Cermont S.A.S.** — Field Service Management system for a petroleum contractor in Arauca, Colombia.  
Digitizes the full work-order lifecycle: planning → field execution → administrative close.  
Architecture: Offline-first PWA, monorepo npm workspaces + Turborepo.

---

## Read Before Editing — Required Order

```
1. .agents/rules/01-stack.md          ← verify you're using the right tools
2. .agents/rules/02-architecture.md   ← understand module boundaries
3. Rule file for the workspace you're touching:
   - .agents/rules/03-frontend.md     ← Next.js / React work
   - .agents/rules/04-backend.md      ← Express / Mongoose work
   - .agents/rules/05-security.md     ← auth, RBAC, cookies
   - .agents/rules/06-offline-first.md ← PWA / IndexedDB work
4. .agents/rules/09-prohibitions.md   ← what never to do
5. Relevant checklist in .agents/checklists/
```

For domain knowledge (schemas, endpoints, RBAC roles) read the canonical DOC files:
- `docs/Intrucciones_para_crear_app_web/DOC-09` — Zod schemas + Mongoose models
- `docs/Intrucciones_para_crear_app_web/DOC-10` — REST API contracts
- `docs/Intrucciones_para_crear_app_web/DOC-04` — Security & RBAC

---

## Repository Map

```
backend/          Express 5 + Mongoose API
frontend/         Next.js 16 App Router + React 19
packages/
  shared-types/   Zod 4 schemas — single source of truth for contracts
tooling/          Quality scripts (check-weak-tokens, check-language, …)
docs/
  Intrucciones_para_crear_app_web/  DOC-01 to DOC-22 (canonical docs)
  adr/            Architecture Decision Records
  audits/         Quality audit reports
.agents/
  rules/          Thematic rule files (canonical)
  workflows/      Step-by-step processes
  checklists/     Pre-commit / PR / security checklists
```

---

## Stack at a Glance

| Layer | Technology | Version |
|-------|-----------|---------|
| Package manager | npm | 10.9.4 |
| Node.js | Node.js | ≥ 22.20.0 |
| Backend | Express | 5.2.1 |
| ORM | Mongoose | 9.5.0 |
| Database | MongoDB | 7.0 |
| Validation | Zod | 4.3.6 |
| Frontend | Next.js | 16.2.4 |
| UI | React | 19.2.5 |
| Server state | TanStack Query | v5 |
| Client state | Zustand | 5.0.12 |
| Styling | Tailwind CSS | 4.2.4 |
| PWA | Serwist | 9.5.7 |
| Lint + Format | Biome | 2.4.12 |
| Testing unit | Vitest | 4.1.5 |
| Testing E2E | Playwright | 1.59.1 |

→ Full version table with prohibitions: [`.agents/rules/01-stack.md`](.agents/rules/01-stack.md)

---

## Quality Gates — Run Before Every Commit

```bash
npm run typecheck          # 0 TypeScript errors
npm run lint               # 0 Biome errors
npm run test               # all Vitest tests pass
npm run quality:strict     # weak tokens + language + semantics checks
npm run verify             # all of the above + build
```

Individual workspace:
```bash
npm run typecheck -w backend
npm run typecheck -w frontend
npm run lint -w backend
npm run lint -w frontend
npm run test -w backend
npm run test -w frontend
```

---

## Critical Prohibitions (Inline — No Exceptions)

| Prohibited | Use Instead |
|-----------|------------|
| `pnpm` / `yarn` | `npm` only |
| `Prisma` / `PostgreSQL` | Mongoose 9.x + MongoDB |
| `NestJS` | Express 5.2.1 |
| `NextAuth` / `Auth.js` | JWT direct + `auth.store.ts` (Zustand) |
| `try/catch` in controllers | Express 5 propagates async automatically |
| `useEffect` for data fetching | TanStack Query `useQuery` / `useMutation` |
| `Context API` for global state | Zustand |
| Raw `fetch` in components | `apiRequest()` from `@/lib/http/api-client` |
| `localStorage` for tokens | HttpOnly cookies only |
| `middleware.ts` in frontend | `proxy.ts` is the security perimeter |
| `any` / `unknown` types | Infer from Zod / Mongoose |
| Duplicating types | Import from `@cermont/shared-types` |
| `console.log` in production | Structured logger |
| Hardcoded roles / route strings | Constants from `@cermont/domain` |

Full prohibition list: [`.agents/rules/09-prohibitions.md`](.agents/rules/09-prohibitions.md)

---

## All Rule Files

| File | Topic |
|------|-------|
| [rules/00-core-rules.md](.agents/rules/00-core-rules.md) | SOLID, DRY, KISS, YAGNI, Clean Code |
| [rules/01-stack.md](.agents/rules/01-stack.md) | Exact versions, prohibitions, workspace commands |
| [rules/02-architecture.md](.agents/rules/02-architecture.md) | SSOT, Contract-First, FSD, API envelope |
| [rules/03-frontend.md](.agents/rules/03-frontend.md) | Next.js, React, TanStack Query, Zustand, proxy.ts |
| [rules/04-backend.md](.agents/rules/04-backend.md) | Express 5, Mongoose, service layer, AppError |
| [rules/05-security.md](.agents/rules/05-security.md) | RBAC, JWT, cookies, rate limit, CORS |
| [rules/06-offline-first.md](.agents/rules/06-offline-first.md) | PWA, IndexedDB, sync queue, conflict handling |
| [rules/07-testing.md](.agents/rules/07-testing.md) | Vitest, Playwright, coverage, conventions |
| [rules/08-devops-vps.md](.agents/rules/08-devops-vps.md) | Docker, GitHub Actions, VPS deployment |
| [rules/09-prohibitions.md](.agents/rules/09-prohibitions.md) | Complete prohibition list |

## All Workflows

| File | When to Use |
|------|------------|
| [workflows/audit-first.md](.agents/workflows/audit-first.md) | Before touching any code |
| [workflows/feature-development.md](.agents/workflows/feature-development.md) | Building a new feature |
| [workflows/refactor-safe.md](.agents/workflows/refactor-safe.md) | Refactoring existing code |
| [workflows/debug-local.md](.agents/workflows/debug-local.md) | Debugging a bug |
| [workflows/dependency-maintenance.md](.agents/workflows/dependency-maintenance.md) | Updating dependencies |
| [workflows/qa-remediation.md](.agents/workflows/qa-remediation.md) | Fixing QA / audit issues |

## All Checklists

| File | When to Use |
|------|------------|
| [checklists/pre-change-checklist.md](.agents/checklists/pre-change-checklist.md) | Before writing code |
| [checklists/pre-commit-checklist.md](.agents/checklists/pre-commit-checklist.md) | Before `git commit` |
| [checklists/pull-request-checklist.md](.agents/checklists/pull-request-checklist.md) | Before opening a PR |
| [checklists/backend-checklist.md](.agents/checklists/backend-checklist.md) | After backend changes |
| [checklists/frontend-checklist.md](.agents/checklists/frontend-checklist.md) | After frontend changes |
| [checklists/security-checklist.md](.agents/checklists/security-checklist.md) | Any auth / RBAC change |
| [checklists/testing-checklist.md](.agents/checklists/testing-checklist.md) | Adding or changing tests |

---

## Minimum Flow Before Modifying Code

1. Read `.agents/rules/01-stack.md` — confirm you are not introducing a forbidden dependency.
2. Read the rule file for the workspace being modified.
3. Run the pre-change checklist.
4. Make the smallest possible change.
5. Run `npm run typecheck -w <workspace>` and `npm run lint -w <workspace>`.
6. Run affected tests.
7. Run the pre-commit checklist.
