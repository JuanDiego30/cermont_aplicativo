# Frontend Checklist

> Run after any change in the `frontend/` workspace.

---

## Data Fetching

- [ ] No `useEffect` used for data fetching — using `useQuery` or `useMutation`.
- [ ] No raw `fetch()` in components — using `apiRequest()` from `@/lib/http/api-client`.
- [ ] Query keys are stable and serializable (arrays, not objects).
- [ ] Query keys defined in `queries.ts`, not inline in components.
- [ ] Mutations call `queryClient.invalidateQueries` after success.

## Forms

- [ ] Forms use `react-hook-form` + `zodResolver`.
- [ ] `defaultValues` defined to prevent uncontrolled → controlled warnings.
- [ ] Schema imported from `@cermont/shared-types` — not redefined locally.
- [ ] No `useState` per field.

## State Management

- [ ] Global state uses Zustand — not Context API.
- [ ] Server data lives in TanStack Query — not Zustand.
- [ ] `auth.store.ts` used for auth state — not a custom context.

## UI States

- [ ] Loading state handled (spinner, skeleton, or disabled state).
- [ ] Error state handled (error message visible to user).
- [ ] Empty state handled (meaningful empty message).
- [ ] Offline state visible when applicable (offline banner).

## Security (Frontend Perimeter)

- [ ] `proxy.ts` updated if a new protected route was added.
- [ ] `middleware.ts` was NOT created or modified.
- [ ] No token stored in `localStorage` or `sessionStorage`.
- [ ] No role string hardcoded — using constants from `@cermont/domain`.

## Accessibility

- [ ] One `<h1>` per page.
- [ ] All `<input>` have a `<label htmlFor="id">`.
- [ ] All interactive elements are `<button>` or `<a>` — no `<div onClick>`.
- [ ] Icon-only buttons have `aria-label`.
- [ ] No div soup — semantic HTML used.
- [ ] Color contrast meets WCAG AA (4.5:1 for body text).

## Mobile First

- [ ] Base styles work at 320px.
- [ ] Breakpoints added as `md:` and `lg:` upgrades, not overrides.
- [ ] Touch targets are ≥ 44×44px.

## Components

- [ ] No component exceeds 200 lines.
- [ ] Components use composition — no class inheritance.
- [ ] Interactive primitives (Modal, Select, Dropdown) use Radix UI.

## Notifications

- [ ] Mutations show `toast.success()` on success.
- [ ] Mutations show `toast.error()` on failure.
- [ ] No `alert()` or `window.alert()` used.

## Quality

- [ ] `npm run typecheck -w frontend` — 0 errors
- [ ] `npm run lint -w frontend` — 0 errors
- [ ] `npm run test -w frontend` — all pass
- [ ] `"use client"` directive added only where truly needed.
