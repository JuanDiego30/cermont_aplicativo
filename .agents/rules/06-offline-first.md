# 06 — Offline-First Rules

> Canonical source for PWA architecture, IndexedDB, sync queue, conflict handling, and field execution context.

---

## Why Offline-First

Cermont field technicians operate in Arauca (Campo Caño Limón) with unreliable mobile connectivity.  
The system must be fully functional offline and sync automatically when connectivity is restored.

---

## Architecture Overview

```
Connectivity layer:
  Service Worker (Serwist)
    → Cache-first for static assets
    → Network-only for /api/* (passthrough; queue offline mutations)

Offline queue:
  offline-queue.ts (IndexedDB via idb)
    → Enqueues failed mutations with clientMutationId
    → Retries on reconnect (exponential backoff)
    → Surfaces queue state via queueStore.ts (Zustand)

Sync coordination:
  AuthInitializer
    → On login/reconnect: drains the offline queue
    → Reports sync status to UI
```

---

## Service Worker — Serwist

Location: `frontend/public/service-worker.js`  
Registration: `frontend/src/lib/pwa/` (production only — not in development)

Caching strategy:
- **Static assets** (JS, CSS, images): cache-first.
- **API requests** (`/api/*`): network-only. If the network fails, the mutation is enqueued.

```typescript
// ✅ Correct — network-only for API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkOnly(),
);
```

---

## IndexedDB — Offline Queue

Location: `frontend/src/lib/pwa/offline-queue.ts`

Each queued operation stores:
```typescript
interface OfflineOperation {
  clientMutationId: string;   // UUID generated client-side
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body: unknown;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}
```

### clientMutationId Rule
Every mutation sent while offline must include a `clientMutationId`.  
The backend uses this to deduplicate re-sent operations and prevent double-processing.

```typescript
const clientMutationId = crypto.randomUUID();
await offlineQueue.enqueue({ clientMutationId, endpoint: '/orders', method: 'POST', body });
```

---

## Queue State — Zustand

`frontend/src/modules/auth/stores/queueStore.ts` exposes:

```typescript
interface QueueState {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAt: number | null;
  failedCount: number;
}
```

The UI must show a sync status indicator when `pendingCount > 0`.

---

## Sync Flow

1. Network connectivity restored (detected via `navigator.onLine` + `online` event).
2. `AuthInitializer` calls `drainOfflineQueue()`.
3. Queue processes operations in order (FIFO).
4. Each operation is retried with exponential backoff (max 3 retries).
5. On success: remove from queue; invalidate relevant TanStack Query cache.
6. On permanent failure: mark as `'failed'`; surface to user.

---

## Conflict Handling

If the same record is modified both offline (local) and online (server), conflict resolution rules:

- **Last-write-wins** for non-critical fields (notes, descriptions).
- **Server-wins** for FSM state transitions (prevents invalid state rewind).
- Conflicts surface a UI warning; never silently discard local changes.

---

## YAGNI for Offline Scope

Sync only the data the logged-in technician needs:
- Work orders **assigned to the current user**.
- Evidence photos associated with those orders.
- Reference data (catalogs, work types) as static cache.

Do not sync the entire database to the client. This is a security and performance constraint.

---

## Graceful Degradation

When offline:
- Show a persistent offline banner.
- Disable actions that cannot be queued (e.g., read-only reports that require live aggregation).
- Enable all field data entry (orders, evidence, costs) — queue for sync.
- Show stale data with a "last updated" timestamp.

---

## PWA Requirements

- App must be installable (valid `manifest.json` with icons, `start_url`, `display: 'standalone'`).
- Service Worker registered only in production.
- Lighthouse PWA score target: ≥ 90.
- Offline indicator must be visible across all dashboard routes.
