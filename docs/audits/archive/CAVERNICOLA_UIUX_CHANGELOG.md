# CAVERNICOLA UI/UX CHANGELOG — Cermont S.A.S.

## 1. Visual Base Components Redesign

### [NEW] NetworkStatusChip (`frontend/src/components/sync/NetworkStatusChip.tsx`)
- **Visual Design**: Fully calibrated, tactile pill-shaped badge mounted in the header controls area (`Header.tsx`) next to the theme toggle. Responds to `hover` and `active` states with spring animations and clean borders (5% opacity canvas accents matching "The Digital Architect" guidelines).
- **Core Connectivity Integrations**:
  - Automatically queries `useConnectivity` to toggle online/offline state.
  - Queries `useSyncManager` to display a spinning Loader, failed dead letters, or pending changes.
- **Outbox Manager Popover**: Clicking the chip shows a detailed summary: status of sync queue, outbox count, and warning alerts. Includes a "Sincronizar ahora" manual sweep trigger.
- **OfflineQueueDrawer Dialog**: Modal accessible via the popover displaying exact pending database actions (`POST`, `PATCH`, `DELETE`) with endpoints, timestamps, and descriptive error messages for dead letters. Users can selectively purge entries to resolve operational conflicts.

### [DEPRECATED] SyncStatusBar (`frontend/src/components/sync/SyncStatusBar.tsx`)
- Removed the intrusive fixed banner layout from the global viewport (`layout.tsx`) in favor of the discrete `NetworkStatusChip` in the header.

---

## 2. Dashboard Operational Tracking Redesign

### [NEW] StepTimeline (`frontend/src/modules/dashboard/ui/StepTimeline.tsx`)
- **Conceptual Grid**: Rich operational FSM timeline detailing the exact **14-step business process** (Solicitud, Visita, Propuesta, Aprobación PO, Planeación, Ejecución, Informe Técnico, Acta, Acta Firmada, SES Ariba, SES Aprobada, Facturación, Aprobación Factura, Pago y Cierre).
- **Visual & Interaction Polish**:
  - Dynamic categorization tabs (Comercial, Operativo, Cierre, Financiero) with harmonious color-coded accents.
  - Hover translate-up cards, monospace step indices (`font-mono`), active item counters linked directly to system states, and micro-motion transitions.
  - Collapse support for responsive layout boundaries.

---

## 3. Verification Details
- **TypeScript Compiler Check**: `tsc --noEmit` resolved with 100% clean output.
- **Biome Linter Check**: Completed with `0 warnings / 0 errors`.
- **Vitest Unit & Integration Suites**: All 31 test files and 174 test cases passed successfully.
