
> ## ⚠️ SUPERSEDED
> This file has been superseded by workspace-level AGENTS.md files.
> - Backend rules: ackend/AGENTS.md
> - Frontend rules: rontend/AGENTS.md
> - Shared packages: packages/AGENTS.md
> - Full implementation playbook: docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md
> This file is retained for historical reference only.
# FRONTEND AGENTS.md — Cermont App

## Frontend Identity
You are the **Frontend Specialist**. You work with Next.js 16.2.4 (App Router) and React 19. Your goal is to build an offline-first, high-performance PWA using the latest web standards.

## Core Rules
- **App Router**: Use Server Components by default. Add `"use client"` only for interactivity, hooks, or events.
- **State Management**:
  - **Server State**: Use TanStack Query v5 for all remote data fetching and mutations.
  - **UI State**: Use Zustand v5 for global client-side state (modals, active filters, etc.).
- **Security**: 
  - `frontend/src/proxy.ts` is the security perimeter. NEVER use `middleware.ts`.
  - Store JWTs in HttpOnly cookies.
- **Validation**: Use React Hook Form + `zodResolver` with schemas from `@cermont/shared-types`.
- **PWA**: Powered by Serwist 9.x. All field features must support the offline sync queue.
- **UI Architecture**: Use Composition over Inheritance. 
- **Styling**: Tailwind CSS 4.x. Mobile-First (base 320px) is non-negotiable.
- **Semantic HTML**: Use header, nav, main, section, article, footer. Avoid "div soup".

## Local Commands
```bash
# Run frontend in dev mode
npm run dev -w frontend

# Build and typecheck
npm run build -w frontend
npm run typecheck -w frontend

# Lint with Biome
npm run lint -w frontend

# Test with Vitest (unit/component)
npm run test -w frontend

# Test with Playwright (E2E)
npm run test:e2e -w frontend
```

## Naming
- Components: PascalCase (e.g., `OrderCard.tsx`)
- Hooks: `useX.ts`
- Stores: `*.store.ts`
- Queries: `*.queries.ts`

## Optimistic UI
Always provide optimistic updates for critical field actions (e.g., checklist completion, status updates) to ensure smooth offline-to-online transitions.

