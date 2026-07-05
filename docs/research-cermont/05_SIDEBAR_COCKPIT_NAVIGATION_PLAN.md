# 05 — Sidebar, Cockpit, & Navigation Plan (Information Architecture)

## Executive Summary

A major issue in complex FSM and CMMS platforms is navigation fatigue: users get lost when forced to jump between unconnected database lists. To establish a premium, frictionless UX/UI for CERMONT S.A.S., we have redesigned the application's information architecture.

This plan centers the application around a **Service Case Cockpit (`/service-cases/[id]`)** which aggregates all step information (1 to 14) for a single case. The sidebar is structured around **7 key architectural pillars** representing operational sequence, commercial close, dynamic data, and resource administration. We outline pages that must be merged, pages to keep separate, pages to convert into tabs, orphan pages to delete, RBAC navigation security, and mobile layout transformations.

---

## Sources & References

- **Canonical Repository Files**:
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` — Route mappings and layouts.
  - `frontend/src/components/layout/Sidebar.tsx` — Current sidebar code.
  - `frontend/src/app/(dashboard)/layout.tsx` — Master dashboard layout wrapper.
- **FSM Navigation Benchmarks**:
  - **Odoo Field Service**: Sequential workflow accordion navigation.
  - **ServiceNow FSM**: Case cockpit routing and contextual tab views.

---

## Proposed Sidebar Architecture (7 Core Pillars)

The target sidebar layout groups pages into logical accordions, enforcing sequence, separation of concerns (engineering vs billing), and role security.

```
CERMONT SYSTEM
├── 🏠 Inicio / Dashboard              ← Executive KPIs & alerts
├── 📋 Casos de Servicio               ← The active Cockpit entry point
│
├── ── 1. FLUJO OPERATIVO ──
├── 📥 Solicitudes                     ← Step 1: WorkRequest
├── 🔍 Visitas Técnicas                ← Step 2: SiteVisit
├── 💰 Propuestas                      ← Step 3: Proposal
├── ✅ PO / Aprobaciones               ← Step 4: PurchaseOrder
├── 📅 Planeación                      ← Step 5: PlanningPacket
├── ⚙️  Ejecución                      ← Step 6: ExecutionSession
├── 📷 Evidencias                      ← Step 7: Evidence
├── 📄 Informes Técnicos               ← Step 8: TechnicalReport
├── 📋 Actas de Entrega                ← Steps 9-10: DeliveryRecord & Signature
│
├── ── 2. CIERRE ADMINISTRATIVO ──
├── 🔖 SES / Ariba                     ← Step 11: ServiceEntrySheet
├── 🧾 Facturas                        ← Steps 12-13: Invoice & Approval
├── 💳 Pagos                           ← Step 14: Payment & Case Close
├── 📊 Costos                          ← Transversal: CostVarianceTable
│
├── ── 3. GESTIÓN DOCUMENTAL ──
├── 🗂️  Biblioteca                     ← Centralized Document Library
├── 📝 Plantillas                      ← Form templates
├── 🧩 Formularios                     ← Dynamic checklists builder
│
├── ── 4. RECURSOS Y LOGÍSTICA ──
├── 🧰 Kits de Herramientas            ← Kit packets builder
├── 🏗️  Activos y Equipos              ← Heavy equipment and assets
├── 🏅 Certificaciones                 ← HSE Technician Heights Certifications
│
└── ── 5. ADMINISTRACIÓN (ADMIN ONLY) ──
    ├── 👥 Usuarios y Cuentas
    ├── 🔑 Roles y Permisos (RBAC)
    ├── 📜 Auditoría de Actividad (AuditLog)
    └── ⚙️  Configuración del Sistema
```

---

## Page Consolidation Strategy

To minimize routing overhead, multiple loose pages are merged or integrated as contextual tabs in the Cockpit.

### 1. Pages to Merge (De-duplicate)
- **Problem**: Separating SES, invoices, and payments forces administrators to search for the same case ID across three distinct routes.
- **Merge Target `/billing`**:
  - Fusion `/billing/ses` + `/billing/invoices` + `/payments` into `/billing`.
  - Layout: Radix-UI tabs:
    - Tab 1: `Service Entry Sheets`
    - Tab 2: `Invoices`
    - Tab 3: `Reconciliation & Payments`
- **Merge Target `/resources`**:
  - Fusion `/assets` + `/resources` + `/kits` into `/resources`.
  - Layout: Radix-UI tabs:
    - Tab 1: `EPP & Tools`
    - Tab 2: `Heavy Assets`
    - Tab 3: `Pre-configured Kits`

### 2. Pages to Keep Separate
- `/service-cases` — Necessary as the grid filter overview for all active contracts.
- `/costs` — A high-level variance dashboard aggregating overall financial trends.
- `/documents` — The master corporate library displaying files across all cases.
- `/settings` & `/audit` — System admin modules.

### 3. Pages to Convert into Cockpit Tabs
Instead of loading distinct routes, when a user views `/service-cases/[id]`, they remain inside the Case Cockpit. Sub-modules render under Radix-UI layout tabs:
- **Tab 1: `Resumen` (Overview)**: General metadata, customer data, map location.
- **Tab 2: `Flujo` (Stepper)**: The active 1-14 interactive stepper.
- **Tab 3: `Documentos`**: Contextual document picker list.
- **Tab 4: `Evidencias`**: Contextual image gallery (Before/During/After).
- **Tab 5: `Costos`**: Budget vs Real itemized table.
- **Tab 6: `Auditoría`**: Activity audit logs limited to this case.

---

## Orphan Routes & Dead Pages Mitigation

An audit of the frontend directories identified legacy pages that confuse user navigation.

- **`/maintenance`**:
  - *Current State*: Empty placeholder route.
  - *Action*: **DELETE**. All preventive maintenance planning resides inside `/planning` and `/execution`.
- **`/inspection`**:
  - *Current State*: Duplicate form layouts.
  - *Action*: **DELETE**. Inspections are represented as a dynamic type attribute under `WorkRequest` and `SiteVisit` schemas, utilizing dynamic checklist forms.
- **`/orders`**:
  - *Current State*: A legacy Kanban routing page.
  - *Action*: **REFACTOR**. Rename and point directly to `/service-cases` grid, transforming it into a selectable toggle view (Table View vs Kanban View).

---

## RBAC Navigation Security Matrix

The sidebar dynamically filters links based on user session roles parsed from JWT cookies.

| Sidebar Section | Gerente (`GER`) | Residente (`RES`) | Supervisor (`SUP`) | Técnico (`TEC`) | Cliente (`CLI`) |
|-----------------|-----------------|-------------------|--------------------|-----------------|-----------------|
| Dashboard | ✅ Full | ✅ Area Only | ✅ Team Only | ❌ Hidden | ❌ Hidden |
| Flujo Operativo | ✅ Full | ✅ Full | ✅ Full | ✅ Execution Only | ❌ Hidden |
| Cierre Admin | ✅ Full | ❌ Hidden | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| Gestión Doc. | ✅ Full | ✅ Read/Write | ✅ Read/Write | ✅ Read Only | ✅ Read Own |
| Recursos | ✅ Full | ✅ Full | ✅ Full | ✅ Read Only | ❌ Hidden |
| Admin | ✅ Full | ❌ Hidden | ❌ Hidden | ❌ Hidden | ❌ Hidden |

---

## Mobile Navigation Transformation

For field technicians (`TEC`, `RES`) accessing the platform on mobile devices in low-connectivity areas (e.g., Arauca oil fields):

1. **Collapsible Sidebar**: The sidebar collapses automatically on screen sizes `< 768px`. It shifts to a sliding drawer triggered by a persistent hamburger button.
2. **Bottom Navigation Bar**: A fixed bottom utility navigation bar is rendered for mobile viewports, containing:
   - **🏠 Home** (Dashboard)
   - **📋 Mis Casos** (Technician assigned cases list)
   - **⚙️ Ejecución** (Direct deep link to active check-in session)
   - **🗂️ Docs** (Offline cached dynamic forms)
3. **Accordion Groups**: All operational steps are nested under a single accordion to maximize vertical space.

---

## Verification & Testing Plan

### Automated Route Tests (Vitest + React Testing Library)
- Verify that administrative links (e.g., `/costs`, `/users`) do not render in the sidebar DOM when the auth store has role `TEC`.
```bash
npm run test -w frontend -- --grep "Sidebar RBAC filtering"
```

### Manual Verification
- Simulate a mobile device (width: 375px) in Chrome DevTools:
  - Verify that the sidebar is hidden and replaced by the Bottom Navigation Bar.
  - Test the hamburger drawer animation, ensuring it behaves smoothly at 60 FPS without layout shifts.
  - Confirm that clicking on a blocked step in the Cockpit Stepper does not trigger layout resets.
