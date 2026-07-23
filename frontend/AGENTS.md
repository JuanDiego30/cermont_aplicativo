# frontend/AGENTS.md — Frontend Rules

## Scope

This workspace is the **Next.js 16 App Router UI** for Cermont S.A.S. It is NOT a Vite app, NOT a Create React App, NOT a vanilla React project.

**Stack:** Next.js 16.2.1 | React 19.2.4 | TypeScript 5.x (strict) | Tailwind CSS 4.2.2 | TanStack Query 5.95.2 | Zustand 5.0.12 | react-hook-form 7.72.0 | Radix UI

---

## Do Not Modify

```txt
backend/
packages/
package.json (root)
package-lock.json (root)
docker/
```

---

## Architecture Rules

### Component Hierarchy
```
app/                    → Next.js App Router pages (Server Components by default)
modules/{module}/       → Feature-Sliced Design
  api/                  → apiClient calls
  hooks/                → TanStack Query hooks
  ui/                   → React components
  model/                → Types, constants, query keys
  utils/                → Pure helpers
components/common/      → Shared UI: Button, Card, Dialog, FormField (Radix-based)
lib/http/               → api-client.ts (centralized HTTP client)
lib/pwa/                → offline-queue.ts, service-worker registration
store/                  → Zustand stores (auth, queue, UI)
```

### State Management
- **Server state:** TanStack Query — NEVER `useEffect` for data fetching
- **Client state:** Zustand — NEVER Context API for global state
- **Form state:** react-hook-form + zodResolver

### Data Flow
```
Component → TanStack Query hook → api-client.ts → /api/* (Next.js proxy) → Express backend
```
- ❌ No direct `fetch` in components
- ❌ No `useEffect` for data fetching
- ❌ No raw HTTP calls outside `lib/http/api-client.ts`

---

## No-Go Zones
- ❌ No business logic in UI components — use domain helpers
- ❌ No hardcoded permissions — use `@cermont/domain` (15 roles: gerente, residente, coord_administrativo, supervisor, hes, auxiliar_contable, supervisor_electricista, tecnico_electricista, operador, tecnico, auxiliar_hes, oficial_construccion, administrativo, pasante, cliente)
- ❌ No hardcoded routes — use centralized route/navigation config
- ❌ No duplicate components: check `components/common/` first
- ❌ No giant monolithic components — split by responsibility
- ❌ No `"use client"` unless interactivity requires it — default to Server Components
- ❌ No visual-only pages with no real state wiring
- ❌ No mock data in production code

---

## Required States per Page

Every page that loads data **must** handle all applicable states:
| State | Requirement |
|-------|-------------|
| **Loading** | Skeleton or spinner — never blank white page |
| **Error** | Error card with message + retry button |
| **Empty** | Illustration + description + action CTA |
| **Offline** | Persistent banner + queue status (field pages) |
| **Forbidden** | "No permission" card (RBAC-protected pages) |

Use `PageStates.tsx` from `components/common/` (e.g. `BackendUnavailableState`) for composite loading/error/empty/offline handling. For interactive components (forms, capture, mutation flows), apply a behavior state machine: `idle → loading → success | error`.

---

## Design System

Use the Cermont UI guide at `docs/design/CERMONT_UIUX_GUIDE.md`.

**Quick palette:**
```css
--color-cermont-blue:  #2154A6;  /* Primary CTA, active nav */
--color-cermont-green: #4CAF50;  /* Focus rings, success, positive ops */
--color-focus-ring:    #4CAF50;  /* All focus outlines */
```

- Primary buttons: full-pill (9999px radius), Cermont blue background
- Cards: white, 1px border at 5% opacity, 16px radius, 24px padding
- Do NOT create a second design system
- Do NOT hardcode colors — use CSS variables / Tailwind tokens
- Use **Radix UI** primitives for complex interactive components
- Use **lucide-react** for icons

---

## Accessibility (Non-Negotiable)
- Every input has a visible `<label>`
- Every button has text or `aria-label`
- Visible focus ring (Cermont green) on all interactive elements
- Keyboard navigation: Tab, Enter, Escape
- Modals: focus trap, Escape to close
- WCAG AA contrast minimum
- Never communicate state by color alone
- Respect `prefers-reduced-motion`

---

## Mobile-First
- Design for 375px width first
- Touch targets: minimum 44×44px
- Sidebar → drawer on mobile
- Tables → horizontal scroll or card view on mobile
- No horizontal overflow anywhere

---

## Required Validation

After frontend changes:
```bash
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npx react-doctor@latest
```

**React Doctor must stay clean.** If it reports issues, fix them before claiming completion.

---

## Route Map

All routes and their implementation status are documented in `docs/architecture/FRONTEND_ROUTE_MAP.md`. Every visible sidebar route must have a valid, working Next.js page. No 404s in navigation.
