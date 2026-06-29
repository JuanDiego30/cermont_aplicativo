# ADR-002: Offline-First Architecture with IndexedDB

**Status:** Accepted
**Date:** 2026-05-29
**Deciders:** Principal Software Architect, Frontend Engineer, Field Operations Lead

---

## Context

Cermont S.A.S. field technicians operate in environments with unreliable or intermittent internet connectivity — oil pipelines, construction sites, remote industrial facilities. The application must support:

- Field execution data entry without network access
- Evidence photo capture and storage offline
- Form responses saved locally and synced later
- Checklist completion in the field
- Labor hour and material usage tracking offline

Engineering teams evaluated multiple approaches for offline support.

## Decision

Implement **offline-first with IndexedDB** as the local persistence layer, complemented by a **sync queue** that retries mutations when connectivity resumes.

### Architecture

```
User Action → React Query (optimistic update)
               ↓
            IndexedDB (local store via idb/durable-objects lib)
               ↓
            Sync Queue (persisted mutation log)
               ↓
         [Connectivity?]
           /          \
       Online       Offline
         ↓            ↓
  API Call ← →   Queue holds mutation
         ↓            ↓
  Server ACK    Reconnect triggers
         ↓       queue replay
  Acknowledge
  & dequeue
```

### Key Decisions

1. **IndexedDB over localStorage**: IndexedDB supports structured data, indices, transactions, and larger storage quotas (50MB+ vs 5MB). Critical for storing evidence metadata, form responses, and sync queues.
2. **`idb` library wrapper**: Provides promise-based API over raw IndexedDB, avoiding callback hell.
3. **Sync queue at application level**: Not service worker level — gives the UI control over sync state display and conflict resolution.
4. **Optimistic updates via TanStack Query**: Mutations update the cache immediately, IndexedDB persists, API call happens in background.

## Consequences

### Positive

- **Works offline**: Field technicians can complete full execution flows without connectivity.
- **Confidence in data**: Sync queue prevents data loss from network interruptions.
- **Transparent to user**: `SyncBanner` component shows sync status; no manual "save offline" button needed.
- **Retry resilience**: Failed mutations retry automatically on reconnect.

### Negative

- **Storage limits**: IndexedDB has per-origin quotas (browser-dependent). Evidence photos may need compression.
- **Conflict resolution**: Last-write-wins is insufficient for concurrent offline edits. Future work may need CRDT or operational transforms.
- **Sync queue size**: Long offline periods accumulate large queues, increasing sync time on reconnect.

### Mitigations

- Evidence photos are compressed client-side before storage.
- `clientMutationId` on critical mutations prevents duplicate processing.
- Sync queue shows progress and allows manual retry for stuck mutations.

## Alternatives Considered

### A) Service Worker Cache
Rejected: Service workers are better for caching GET responses, not for mutating application state offline. The SW lifecycle (install/activate/fetch) adds complexity for write-heavy field operations.

### B) localStorage
Rejected: 5MB limit, synchronous API blocks main thread, only stores strings. Cannot store Blob data for evidence photos.

### C) PouchDB / CouchDB
Rejected: Adds 50KB+ to bundle size and requires a CouchDB sync endpoint. The existing IndexedDB + custom sync queue is simpler and sufficient.

### D) Firebase Firestore Offline
Rejected: Vendor lock-in. Requires Firebase SDK and backend integration. Cermont uses MongoDB — adding Firestore would split the data layer.

## Compliance

- SSOT: Sync queue is the single source of truth for pending mutations.
- KISS: Plain IndexedDB + application-level queue; no service worker shenanigans.
- Offline-First: All field operations designed for offline by default, not as an afterthought.
