# CAVERNICOLA FRONTEND EDIT PLAN — Cermont S.A.S.

## 1. Goal Description

This edit plan covers the concrete, production-grade refactoring of the CERMONT S.A.S. frontend (Next.js 16 + React 19) to transition from static auditing to active UI/UX improvements. We adhere strictly to the "modo cavernícola" (caveman mode) rules: no guessing, no placeholders, full zero-trust contract safety, and strict alignment with the `docs/design/CERMONT_UIUX_GUIDE.md` Mintlify-style rules.

---

## 2. Proposed Changes & Component Refactoring

We will perform edits in three sequential phases:

### Phase 1: Consolidate Common Base UI Componentry
- **Network Status & Sync Integration**:
  - Replace the global, persistent, and intrusive `SyncStatusBar` top banner with a highly polished, discrete UI.
  - **[NEW] NetworkStatusChip**: Mounts in the header (`Header.tsx`) or sidebar next to other header controls. Small, circular badge showing connectivity (e.g. green circle for "En línea", amber/orange for "Sin conexión", blue spinner for "Sincronizando").
  - **[NEW] SyncStatusPopover & OfflineQueueDrawer**: An interactive dropdown or sliding sidebar triggered when clicking the `NetworkStatusChip`. It displays a list of pending outbox mutations (with dates, actions, and errors) and allows triggering a manual "Sync now" or retrying failed ("dead letter") mutations.
  - Conect these controls to the real `useSyncManager()` and `CermontSyncQueueDB` database to reflect live IndexedDB/outbox status, and support keyboard accessibility.

### Phase 2: Redesign the Cockpit & Key Dashboards
- **Dashboard (`/dashboard`)**:
  - Implement a premium Bento grid visual layout using asymmetric grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
  - Upgrade standard cards to show real-time stats and metrics using monospace technical numbers (`font-mono`) for COP amounts and item counts.
  - Add a dedicated interactive **14-Step Operational Flow Timeline** directly in the dashboard, highlighting the current active status and allowing quick navigation to relevant modules (Site Visits, Work Orders, Planning, Evidence, Delivery Records, SES/Billing, Payments).
- **Work Orders & Planning (`/orders` & `/planning`)**:
  - Re-engineer forms to display structured kits (materials, tools, equipment, EPP, personal) using clean, responsive multi-column layouts.
  - Support high-quality image attachments using responsive containers.

### Phase 3: Deliverables, Evidence & Offline Capture
- **Evidences (`/evidences`)**:
  - Design a rich, responsive evidence media gallery.
  - Incorporate modern image upload states with loading pulses, skeleton preview frames, upload error recovery, and offline local queuing (outbox blobs).
- **Delivery Records (`/delivery-records`)**:
  - Redesign detail cards for signature capture and signed PDF receipt attachment uploads.

---

## 3. Verification Plan

### Automated Verification
- Run full typecheck and linting suite to ensure zero warnings/errors:
  ```bash
  npm run typecheck
  npm run lint
  ```
- Run unit and E2E tests:
  ```bash
  npm run test
  ```
- Check with `react-doctor` to confirm the quality score remains at `98/100` or higher.
- Validate everything using the unified pipeline gate:
  ```bash
  npm run verify
  ```

### Manual Verification
- Launch local development server (`npm run dev`) and test responsiveness.
- Toggle network simulation offline to confirm `NetworkStatusChip` switches to offline state, local sync queue displays pending records, and synchronization resumes gracefully upon reconnection.
