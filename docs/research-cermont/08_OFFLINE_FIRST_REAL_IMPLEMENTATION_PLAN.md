# 08 — Offline-First Real Implementation Plan

## Executive Summary

To enable flawless fieldwork execution in the remote petroleum fields of Arauca, Colombia (where cellular network signal is highly unstable or non-existent), the CERMONT application must implement an **Offline-First Architectural Engine**. 

Rather than relying on basic browser page caching (which fails if the application is refreshed), we establish a robust **data synchronization perimeter** using:
1. **Persistent Local Caching** (`PersistQueryClientProvider` utilizing a customized IndexedDB adapter).
2. **Transactional Outbox Queue** (storing offline mutations with unique transaction client UUIDs to prevent duplicates).
3. **Muted Backoff & Dead Letter Queue (DLQ)** (handling network failures gracefully without losing field checklist data).
4. **Collision and Sync Conflict Management** (enforcing explicit resolution rules).
5. **E2E Playwright Offline Test Suite** (guaranteeing code reliability).

This plan details the technical setup, IndexedDB stores, mutation payloads, sync flows, and UI design patterns to achieve full offline reliability.

---

## Sources & References

- **Canonical Repository Files**:
  - `frontend/public/service-worker.js` — Current Service Worker registration.
  - `frontend/src/lib/offline/sync-manager.ts` — Existing sync manager drafts.
  - `frontend/src/lib/pwa/offline-queue.ts` — Existing offline queue.
- **PWA & Sync Benchmarks**:
  - **Workbox Background Sync**: Declarative background retry triggers.
  - **TanStack Query Persister**: Local caching adapters (`createAsyncPersister`, IndexedDB).
  - **Open Data Kit (ODK)**: Client-side local data storage and idempotency pattern.

---

## What is Cached Offline (Cache Strategies)

We partition the local client data into structured stores with specific Time-to-Live (TTL) policies inside IndexedDB.

| Data Domain | Strategy | IndexedDB Store ID | TTL (Expiration) |
|-------------|----------|--------------------|------------------|
| Assigned Service Cases | Cache + Stale-While-Revalidate | `cases-cache` | 1 Hour |
| Dynamic Checklists | Stale-While-Revalidate | `checklists-cache` | 24 Hours |
| Client Registries | Cache Only | `clients-cache` | 7 Days |
| Pending Photos (Evidences)| Outbox Queue | `evidences-outbox` | Persistent until Sync |
| Form Checklists Data | Outbox Queue | `mutations-outbox` | Persistent until Sync |

---

## Offline Technical Capabilities Matrix

Technicians work under a constrained set of allowed offline capabilities to prevent database conflicts.

### Allowed Offline Actions (Local Persistence)
- **Step 1**: Log a new `WorkRequest` draft.
- **Step 2**: Fill and save a `SiteVisit` technical checklist.
- **Step 6**: Check-in, check-out, record time, and fill the dynamic `ExecutionSession` checklist.
- **Step 7**: Capture photo evidence, tag categorizations, and add photo captions.
- **Step 10**: Draw and sign the canvas signature block on a `DeliveryRecord`.
- **Transversal**: Open and review downloaded case attachments and reports.

### Blocked Offline Actions (Require Real-time Backend Access)
- **Step 3 & 4**: Approve proposals and verify purchase orders (requires financial audits).
- **Step 5**: Schedule planners and tools (requires live warehouse catalog locks).
- **Step 11 & 12**: Generate invoices, log SAP Ariba SES codes.
- **Step 14**: Process payments and close case files.

---

## Outbox Queue Architecture (IndexedDB Schema)

To guarantee transaction reliability, the application uses a structured IndexedDB database: `cermont-offline-db` (v1).

```typescript
// frontend/src/lib/offline/idb-stores.ts
export interface OutboxMutation<TPayload = unknown> {
  clientMutationId: string;       // Unique UUID v4 generated on the client to ensure idempotency.
  type: 'EVIDENCE_UPLOAD' | 'CHECKLIST_SUBMIT' | 'EXECUTION_SESSION' | 'SIGNATURE_SUBMIT';
  serviceCaseId: string;
  payload: TPayload;
  createdAt: number;              // Timestamp (epoch ms)
  retryCount: number;             // Increments on sync failures. Max 3.
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  errorMessage?: string;
}
```

### Database Stores Setup
- `mutations-outbox`: Main outbox store using `clientMutationId` as the primary key.
- `evidences-outbox`: Dedicated binary storage for heavy file uploads (Blobs/Base64 strings).
- `dead-letter-queue`: Repository for mutations that failed consistently after 3 attempts, preventing blocking of subsequent outbox entries.

---

## Dynamic Sincronization Flow

```
   [ Technician Offline Action ]
                 │
                 ▼
     Is Network Available?
        ├─── YES ───► POST Directly to Backend
        │
        └─── NO ────► 1. Auto-generate clientMutationId (UUID)
                      2. Convert files to binary Blobs
                      3. Write payload into IndexedDB outbox
                      4. Queue transaction in OutboxMutation store
                      5. Display visual: "3 pending actions"
                             │
                             ▼
                    [ Network Restored ]
                             │
                             ▼
         Trigger: Service Worker hears 'online' event
                             │
                             ▼
          TanStack Query client.resumePausedMutations()
                             │
                             ▼
               Flush mutations-outbox in FIFO order
                 ├── Success ──► Remove from IDB, pop Success Toast
                 │
                 └── Failure (3 Retries) ──► Move to Dead Letter Queue (DLQ)
                                             & Alert Supervisor
```

---

## Conflict Resolution Policies

When offline data is flushed, it can collide with changes uploaded by other team members.

1. **Checklist Double-Saves (Split Divergence)**:
   - *Conflict*: Technician A updates a checklist offline. Technician B updates the same checklist online.
   - *Resolution*: **Last-Write-Wins (LWW) with Diff-Merge**. The backend compares modified fields by timestamps. The technician whose write was overwritten receives a local sync warning notification.
2. **Idempotent Media Uploads**:
   - *Conflict*: The network reconnects, drops, and reconnects, causing the uploader to trigger the same photo payload twice.
   - *Resolution*: The backend indexes entries by `clientMutationId`. If a document with that ID exists, the upload is skipped and the cached URL is returned.
3. **Outdated State Machine Transitions**:
   - *Conflict*: A technician submits a checklist offline for a case that a supervisor closed in the office.
   - *Resolution*: The backend rejects the sync request, pushing the mutation to the DLQ, and displays an alert: *"This case has been closed. Please contact your coordinator."*

---

## UI/UX Design System for Sync Status

Visual cues prevent field engineers from closing or refreshing the browser while sync is active.

- **Offline Banner**: Renders at the top of `/service-cases/[id]`:
  - *Design*: Slim banner, warning yellow background (`bg-amber-500` clear text). Displays: *"Trabajando sin conexión — 4 cambios guardados en el dispositivo."*
- **Sync Badge**: Renders in the header bar:
  - *Pending*: Yellow badge showing the number of queued items.
  - *Active Sync*: Rotating lucide icon showing: *"Sincronizando..."*
  - *Completed*: Brief green check badge: *"Datos actualizados."*
- **DLQ Portal**: An administrative modal under `/settings/sync-errors` listing items that failed. Technicians can review raw JSON, correct errors (e.g., retyping a text field), and trigger a manual retry.

---

## E2E Offline Playwright Test Suite

We verify the sync pipeline by programmatically simulating network cuts inside our automated E2E tests.

```typescript
// frontend/tests/e2e/offline-sync.spec.ts
import { test, expect } from '@playwright/test';

test('Should buffer checklist offline and sync successfully when back online', async ({ page, context }) => {
  await page.goto('/service-cases/SC-2026-0042/cockpit');

  // 1. Simulate field offline cut
  await context.setOffline(true);

  // 2. Technician performs execution checklist responses
  await page.click('button[data-testid="start-execution"]');
  await page.fill('input[name="pressure-reading"]', '125');
  await page.click('button[data-testid="submit-checklist"]');

  // 3. Confirm sync badge reflects pending mutation locally
  const syncBanner = page.locator('span[data-testid="sync-pending-badge"]');
  await expect(syncBanner).toBeVisible();
  await expect(syncBanner).toContainText('1');

  // 4. Simulate network recovery
  await context.setOffline(false);

  // 5. Verify that outbox flushes and toast pops green
  const successToast = page.locator('div[data-testid="sync-success-toast"]');
  await expect(successToast).toBeVisible();
  await expect(syncBanner).not.toBeVisible();
});
```

---

## Technical Gap Analysis & Recommendations

- **Audit Finding**: Currently, `frontend/public/service-worker.js` acts only as a route asset cacher. There is **no persistent caching provider** (`PersistQueryClientProvider`) configured inside the Next.js providers file, and outbox queues do not exist.
- **Remediation**:
  - Integrate `PersistQueryClientProvider` with a custom IndexedDB adapter as part of Wave 9 of the master plan.
  - Establish `clientMutationId` fields on Zod contracts inside `@cermont/shared-types`.
