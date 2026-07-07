# CAVERNICOLA External References

**Generated:** 2026-06-03  
**Scope:** Conceptual review only. No code was copied into Cermont.  
**Purpose:** Capture external workflow, field-service, cost, document, and RBAC patterns that can inform Cermont's 14-step business flow.

---

## Sources Reviewed

| Source | URL | Pattern Reviewed | Cermont Use |
|---|---|---|---|
| OpenProject work packages | https://www.openproject.org/docs/user-guide/work-packages/ | Work items with type, ID, status, assignee, priority, dates, hierarchy, table/detail views | Treat ServiceCase artifacts as lifecycle work items with stable IDs and explicit status. |
| OpenProject progress tracking | https://www.openproject.org/docs/user-guide/time-and-costs/progress-tracking/ | Status-based progress, work/remaining work totals, hierarchy totals | Derive dashboard lifecycle progress from step status instead of fake KPIs. |
| OpenProject boards | https://www.openproject.org/docs/user-guide/agile-boards/ | Board columns/cards backed by the same work package data; moving cards can update status | Use operational boards only as views over ServiceCase status, not as a parallel workflow. |
| Redmine workflow setup | https://www.redmine.org/projects/redmine/wiki/redmineissuetrackingsetup | Role + tracker/status transition matrix | Backend should own allowed state transitions per role and module. |
| Redmine custom fields | https://www.redmine.org/projects/redmine/wiki/RedmineCustomFields | Custom fields for issues, projects, time entries, users, versions, activities | Dynamic forms should model reviewed document fields without hardcoding one-off forms. |
| Redmine REST API | https://www.redmine.org/projects/redmine/wiki/REST_Api | Custom fields in API payloads and update flows | Keep API payloads explicit and versioned; do not hide dynamic values in UI-only structures. |
| OCA Field Service | https://github.com/OCA/field-service | Modular field-service addons: locations, workers, orders, invoices, activities, stock, timesheets | Keep resources, execution, stock/logistics, billing, and timesheets as separable modules connected by IDs. |
| ERPNext | https://github.com/frappe/erpnext | Accounting, order management, projects, inventory, assets, manufacturing, self-hosting | Cermont can borrow modular boundaries, but must stay document-driven rather than becoming a full ERP. |
| metasfresh | https://github.com/metasfresh/metasfresh | 3-tier ERP architecture with REST API and React/Redux frontend | Confirms REST-backed business modules and self-hosted deployment are viable patterns. |

---

## Patterns Adopted Conceptually

1. **Single operational item with many views.** OpenProject boards and tables show the same work-package data. Cermont should use ServiceCase plus artifacts as the source of truth and avoid separate dashboard-only state.
2. **Role-owned transitions.** Redmine's workflow model validates status changes by role and item type. Cermont should enforce every step transition in backend services, with frontend only reflecting allowed actions.
3. **Dynamic fields are first-class contract data.** Redmine custom fields and Cermont's document-driven spec point to versioned field definitions, not ad hoc page-local DTOs.
4. **Field-service modules are composable.** OCA Field Service separates orders, workers, locations, activities, inventory/logistics, invoices, routes, and timesheets. Cermont should keep resources/kits, planning, execution, evidence, and billing as connected vertical slices.
5. **Cost and progress are derived.** OpenProject derives progress from status or work totals. Cermont dashboard metrics should be derived from backend summaries, not static UI cards.
6. **ERP boundaries are useful but not the product identity.** ERPNext/metasfresh show useful accounting/order/inventory module borders. Cermont should integrate SES, invoices, payments, costs, and documents without expanding into payroll, accounting ledger, or generic ERP scope.

---

## Non-Adoption Notes

- No external code was copied.
- No licenses were imported into the repository.
- No dependency was added.
- No external workflow replaces the canonical Cermont 14-step flow.
- No Figma/Stitch/visual source is treated as business logic.
