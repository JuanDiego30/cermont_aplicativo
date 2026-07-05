# 05 — Sidebar, Navigation and Cockpit Analysis

## Executive Summary

This document analyzes CERMONT's current sidebar and navigation implementation, assesses information architecture (IA) quality, and proposes a professional-grade navigation structure based on benchmark references.

**Current state**: Sidebar implemented with GSAP animations, RBAC-based navigation groups, and collapsible mode. Navigation groups sourced from `getVisibleNavigationGroups()` in `modules/core/navigation/`.

**Key finding**: Current sidebar implementation is functional and well-structured for an MVP. However, the IA needs improvement to match professionals (Odoo FSM, Fracttal) — particularly in:
- Group hierarchy (too flat, no nesting)
- Missing modules (6 critical paths not accessible)
- No search/command palette
- No recent/relevant items
- No user feedback for pending actions

---

## Current Sidebar Implementation

**File**: `frontend/src/modules/core/ui/layout/Sidebar.tsx` (263 lines)

**Features**:
- ✅ RBAC-filtered navigation groups via `getVisibleNavigationGroups(userRole)`
- ✅ Collapsible mode (icon-only sidebar)
- ✅ GSAP entrance animations with `prefersReducedMotion` respect
- ✅ Mobile responsive (drawer overlay pattern)
- ✅ Badge support (work request pending count)
- ✅ AI Assistant button
- ✅ Lucide icons
- ✅ Active state indication
- ✅ Close on outside click (mobile)

**Navigation source**: `modules/core/navigation/` — centralized route definitions

---

## Current Navigation Groups

The sidebar groups (from `getVisibleNavigationGroups()`):

| Group | Items | Notes |
|-------|-------|-------|
| **Operaciones** | Dashboard, Órdenes de Trabajo, Ejecución, Evidencias, Planificación, Informes | Core operational flow |
| **Comercial** | Solicitudes, Visitas, Propuestas, Órdenes de Compra | Pre-sales flow |
| **Facturación** | SES, Facturas, Pagos, Costos | Billing & financial |
| **Administración** | Usuarios, Recursos, Mantenimiento, Activos | Admin & support |
| **Documentos** | Documentos | Document platform |

---

## IA Critique

### Strengths
- Groups follow business domains (Operaciones, Comercial, Facturación, Admin, Documentos)
- RBAC-filtered navigation prevents unauthorized access
- Badge for pending work requests

### Weaknesses

| Issue | Severity | Description |
|-------|----------|-------------|
| No search / Command palette | HIGH | Users must navigate manually through groups. Professional apps have Cmd+K / Ctrl+K search |
| No recent items | MEDIUM | No quick access to recently viewed orders, proposals, etc. |
| No favorite/bookmark | LOW | No personalization |
| Flat structure | MEDIUM | Groups cannot be expanded/collapsed independently |
| Missing critical routes | **HIGH** | `/work-requests`, `/delivery-records`, `/execution`, `/costs`, `/assets` not in sidebar |
| No progress indicators | MEDIUM | No visual cue for execution progress per order |
| No user status | LOW | No user role display, no notification bell |
| No keyboard navigation | MEDIUM | No keyboard shortcuts for navigation |
| No secondary navigation | LOW | No sub-navigation for complex pages |

---

## Professional Navigation Benchmark

### Odoo FSM Navigation
- **App Switcher**: Grid of apps (Sales, Field Service, Inventory, Accounting)
- **Left sidebar**: Context-specific (Work Orders, Planning, Reporting, Configuration)
- **Search**: Global search bar (Cmd+K) across all entities
- **Favorites**: Pin frequently used items
- **Recent**: Recently viewed records

### Fracttal One Navigation
- **Left sidebar**: Fixed items (Dashboard, Work Orders, Assets, Preventive, Reports, Configuration)
- **Search**: Global search across entities
- **Notifications**: Bell icon with badge count
- **User menu**: Profile, settings, logout

### MaintainX Navigation
- **Bottom nav (mobile)**: Home, Work Orders, Parts, Messages, Profile
- **Left sidebar (desktop)**: Full navigation
- **Search**: Command palette
- **Notifications**: Badge on bell icon

---

## Proposed Navigation Architecture

### Structure

```
Cockpit (Dashboard)
├── Widget: Active orders / Pending evidence / Overdue tasks
├── Widget: Cost comparison (proposal vs actual)
├── Widget: Recent activity feed
└── Quick actions (New Work Request, New Order, Upload Evidence)

Operaciones
├── Órdenes de Trabajo
│   ├── Listado (/orders)
│   ├── Kanban (/orders/kanban)
│   ├── Planeación (/planning)
│   └── Ejecución (/execution)
├── Evidencias (/evidences)
├── Informes Técnicos (/reports)
└── Actas de Entrega (/delivery-records)  [NEW]

Comercial
├── Solicitudes (/work-requests)  [NEW]
│   └── Visitas Técnicas (/site-visits)
├── Propuestas (/proposals)
├── Órdenes de Compra (/purchase-orders)
└── Activos (/assets)  [NEW]

Facturación y Costos
├── SES (/billing/ses)  [NEW]
├── Facturas (/billing/invoices)  [NEW]
├── Pagos (/payments)  [NEW]
└── Costos (/costs)  [NEW]

Documentos
├── Centro de Documentos (/documents)
├── Importaciones (/documents/imports)  [NEW]
├── Plantillas (/documents/templates)  [NEW]
└── Formularios Dinámicos (/forms)  [NEW]

Administración
├── Usuarios (/users)
├── Recursos (/resources)
├── Mantenimiento (/maintenance)
└── Configuración (/settings)  [OPTIONAL]
```

### New Routes to Add to Sidebar

| Route | Group | Why Missing Now |
|-------|-------|-----------------|
| `/work-requests` | Comercial | Pages exist but may be empty |
| `/delivery-records` | Operaciones | Not yet implemented |
| `/billing/ses` | Facturación | Not yet implemented |
| `/billing/invoices` | Facturación | Not yet implemented |
| `/payments` | Facturación | Not yet implemented |
| `/costs` | Facturación | Not yet implemented |
| `/assets` | Comercial | Not yet implemented |
| `/planning` | Operaciones | May exist but not in nav |

---

## Command Palette (Cmd+K) Specification

**Priority**: HIGH — essential for professional UX

**Features**:
- Global search across all entities: orders, proposals, work requests, clients, evidences
- Keyboard shortcut: `Cmd+K` (Mac), `Ctrl+K` (Windows/Linux)
- Fuzzy search on entity name, number, client name
- Recent items section
- Action shortcuts: "New Order", "Upload Evidence", "Create Proposal"
- Role-filtered: users only see entities they can access

**Tech stack**: Use `cmdk` (Command Kit by Paco Coursey) or `kbar` library

**Implementation**: Add `<CommandPalette />` component at app root, triggered by keyboard shortcut

---

## Cockpit / Dashboard Enhancement

**Current**: Basic dashboard at `/dashboard` with some KPIs

**Proposed Cockpit**:
```
+----------------------------------------------------------+
|  CERMONT Cockpit                    [Cmd+K] [🔔] [👤]    |
+----------------------------------------------------------+
| Active Orders: 12   Pending Evidences: 8   Overdue: 3    |
| Budget Status: ▲ $245K   Actual: ▼ $212K   Margin: 13%  |
+----------------------------------------------------------+
|  Recent Activity                    Quick Actions         |
|  ┌────────────────────┐          ┌──────────────────┐   |
|  │ WO #123 completed  │          │  New Order       │   |
|  │ Evidence uploaded  │          │  Upload Evidence │   |
|  │ SES #45 approved   │          │  Create Proposal │   |
|  └────────────────────┘          └──────────────────┘   |
+----------------------------------------------------------+
|  Orders by Status              |  Pending Approvals      |
|  ┌─────┬─────┬─────┬─────┐    |  ┌──────────────────┐   |
|  │Open │Exec │Done │Paid │    |  │ PO #987 pending  │   |
|  │  5  │  7  │  8  │  4  │    |  │ SES #23 pending  │   |
|  └─────┴─────┴─────┴─────┘    |  └──────────────────┘   |
+----------------------------------------------------------+
```

---

## Responsive Navigation Strategy

| Device | Sidebar | Navigation |
|--------|---------|------------|
| Mobile (<768px) | Drawer overlay (current ✅) | Bottom nav bar (proposed) |
| Tablet (768-1024px) | Collapsible sidebar (current ✅) | Standard nav |
| Desktop (>1024px) | Full sidebar (current ✅) | Command palette |

**Missing**: Bottom navigation bar for mobile — critical for field technicians using phones.

---

## Implementation Priority

| Feature | Priority | Effort | Dependencies |
|---------|----------|--------|--------------|
| Add missing routes to nav config | **P0** | Small | Route implementation |
| Cmd+K command palette | **P1** | Medium | cmdk/kbar library |
| Bottom nav bar for mobile | **P1** | Medium | Layout refactor |
| Recent items in nav | **P2** | Small | Zustand store |
| Progress indicators in nav | **P2** | Medium | Query hooks |
| User notifications bell | **P2** | Medium | Notification system |
| Favorites/bookmarks | **P3** | Small | Persistent storage |
| Collapsible nav groups | **P3** | Medium | Accordion UI |

---

## Navigation Config File

The navigation source is at `modules/core/navigation/`. Current config should be extended to include all 46 routes with:
- Route path
- Label (Spanish for UI)
- Icon (lucide-react)
- Required role(s)
- Badge callback (for pending counts)
- Group assignment
- Implementation status (for dev reference)
