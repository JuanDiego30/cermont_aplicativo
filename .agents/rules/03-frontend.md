# 03 — Frontend Rules

> Canonical source for Next.js 16, React 19, TanStack Query, Zustand, proxy.ts, mobile-first, and component patterns.

---

## App Router Conventions

- Default to **Server Components**. Add `"use client"` only when the component needs:
  - browser APIs (`window`, `navigator`, `localStorage`).
  - event handlers (`onClick`, `onChange`, etc.).
  - React hooks (`useState`, `useEffect`, `useQuery`, etc.).
- Keep `layout.tsx` and `page.tsx` lean; delegate rendering to client leaf components.
- Route groups: `(auth)/` for public auth pages; `(dashboard)/` for protected routes.

---

## Data Fetching — TanStack Query

**Never use `useEffect` to fetch data.** Use `useQuery` / `useMutation` from TanStack Query.

```typescript
// ✅ Correct
const { data: orders, isLoading, error } = useQuery({
  queryKey: ['orders', filters],
  queryFn: () => apiRequest<Order[]>('/orders', { params: filters }),
  staleTime: 30_000,
});

// ❌ Incorrect
const [orders, setOrders] = useState<Order[]>([]);
useEffect(() => {
  fetch('/api/orders').then(r => r.json()).then(setOrders);
}, []);
```

### Query Key Conventions
- Always use stable, serializable query keys: `['feature', id]` or `['feature', filters]`.
- Define keys in the module's `queries.ts` file — not inline in components.
- Invalidate after mutations: `queryClient.invalidateQueries({ queryKey: ['orders'] })`.

---

## State Management — Zustand

- Zustand manages **shared client UI state** only (not server data).
- `auth.store.ts`: stores `accessToken` (memory only — never persisted), user role, auth status.
- Feature slices: each module may have its own Zustand slice via `store.ts`.
- **Never use Context API for global state.**

```typescript
// ✅ Correct — Zustand
const { user, accessToken } = useAuthStore();

// ❌ Incorrect — Context API
const { user } = useContext(AuthContext);
```

---

## HTTP Client — apiRequest

All HTTP calls go through the `apiRequest()` wrapper in `@/lib/http/api-client.ts`.

```typescript
// ✅ Correct
import { apiRequest } from '@/lib/http/api-client';
const order = await apiRequest<Order>(`/orders/${id}`);

// ❌ Incorrect — raw fetch
const order = await fetch(`/api/backend/orders/${id}`).then(r => r.json());
```

In development, Next.js rewrites `/api/backend/*` → `http://127.0.0.1:4000/api/*` via `next.config.ts`.

---

## Security Perimeter — proxy.ts

`frontend/src/proxy.ts` (or `frontend/proxy.ts`) is the RBAC perimeter for navigation.

- **NEVER create or modify `middleware.ts`** — it is deprecated and forbidden in this project.
- `proxy.ts` checks session, validates role, and redirects unauthenticated / unauthorized users.
- Public paths (login, register, health) must be explicitly listed as exemptions in `proxy.ts`.

```typescript
// proxy.ts responsibilities:
// 1. Check session cookie / accessToken
// 2. Verify user role against required role for the route
// 3. Redirect to /login if unauthenticated
// 4. Redirect to /unauthorized if role is insufficient
```

---

## Forms — React Hook Form + Zod

```typescript
// ✅ Correct
const form = useForm<CreateOrderInput>({
  resolver: zodResolver(CreateOrderSchema),
  defaultValues: { status: 'open', priority: 'medium' },
});

// ❌ Incorrect — useState per field
const [title, setTitle] = useState('');
const [status, setStatus] = useState('');
```

- Always define stable `defaultValues` to prevent uncontrolled → controlled input warnings.
- Use schemas from `@cermont/shared-types` — the same schema used by the backend.

---

## Loading / Error / Empty / Offline States

Every data-dependent UI must handle all four states:

```tsx
function OrderList() {
  const { data, isLoading, isError, error } = useOrdersQuery();

  if (isLoading) return <LoadingSpinner aria-label="Loading orders" />;
  if (isError) return <ErrorMessage message={error.message} />;
  if (!data || data.length === 0) return <EmptyState message="No orders found" />;
  if (isOffline) return <OfflineBanner />;

  return <ul>{data.map(o => <OrderCard key={o._id} order={o} />)}</ul>;
}
```

---

## Mobile-First Responsive Design

Design for the smallest screen (320px) first, then scale up with breakpoints:

```css
/* Base: mobile (320px+) */
.container { flex-direction: column; width: 100%; }

/* Tablet */
@media (min-width: 768px) { .container { flex-direction: row; } }

/* Desktop */
@media (min-width: 1024px) { .container { max-width: 1280px; } }
```

With Tailwind: base class first, then `md:`, then `lg:`.

```tsx
<section className="flex flex-col gap-4 md:flex-row md:gap-8 lg:max-w-7xl">
```

**Touch targets:** minimum 44×44px — field technicians may wear gloves.

---

## Accessibility Rules

- One `<h1>` per page — heading hierarchy must be logical.
- All `<input>` elements must have `<label htmlFor="id">`.
- Buttons are always `<button type="button">` or `<button type="submit">` — never `<div onClick>`.
- Interactive components (Modal, Select, Dropdown) use **Radix UI** for built-in `aria-*` attributes.
- Color contrast: minimum WCAG AA (4.5:1 for body text).
- `aria-label` on icon-only buttons.

---

## Toast Notifications

Use `sonner` for all user feedback on mutations:

```typescript
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/orders', { method: 'POST', body: data }),
  onSuccess: () => toast.success('Order created'),
  onError: (e) => toast.error(e.message ?? 'Something went wrong'),
});
```

---

## Component Size Limits

- Component > 200 lines → split into sub-components.
- A single file should not hold more than one exported component unless they are tightly coupled (e.g., compound components).

---

## Import Aliases

Use `@/` aliases configured in `tsconfig.json`:

```typescript
import { apiRequest } from '@/lib/http/api-client';
import { useAuthStore } from '@/store/auth.store';
import { OrderCard } from '@/modules/orders/components/OrderCard';
```

Do not create new alias schemes. Use existing `@/` prefix only.
