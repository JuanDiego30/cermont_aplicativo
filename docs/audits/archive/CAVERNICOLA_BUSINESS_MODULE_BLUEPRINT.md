# CAVERNICOLA Business Module Blueprint

**Generated:** 2026-06-03  
**Rule:** Every module is a vertical slice: shared contract -> domain constants/RBAC -> backend model/service/controller/route -> frontend API/hook/page -> offline if applicable -> tests -> gates.

| # | Module | 14-step coverage | Backend module(s) | Frontend route(s) | Offline posture | Current status |
|---:|---|---|---|---|---|---|
| 1 | Auth and RBAC | Cross-cutting | `auth`, `user` | `/login`, `/register`, `/admin/users` | First login online only | Implemented, audit periodically |
| 2 | Work Requests | 1 | `work-requests` | `/work-requests`, `/work-requests/new`, `/work-requests/[id]` | Field-readable, controlled queue for intake | Implemented, audit pending |
| 3 | Site Visits | 2 | `site-visit`, `inspection` | `/site-visits`, `/site-visits/new`, `/site-visits/[id]` | Field-readable/capture-oriented | Implemented, audit pending |
| 4 | Proposals | 3 | `proposal` | `/proposals`, `/proposals/new`, `/proposals/[id]` | Draft offline future | Implemented, schema alignment review pending |
| 5 | Purchase Orders | 4 | `purchase-order` | `/purchase-orders`, `/purchase-orders/new`, `/purchase-orders/[id]` | Online only | Implemented; typed 503 added for list |
| 6 | Service Cases / Orders | 4-14 orchestrator | `service-cases`, `order` | `/service-cases`, `/orders` | Read cache for assigned work | Implemented, audit pending |
| 7 | Resources and Kits | Supports 5-6 | `resource`, `kit`, `tool`, `maintenance` | `/resources`, `/resources/kits`, `/maintenance` | Read cache expected | Implemented; resources typed 503 |
| 8 | Planning Packets | 5 | `planning-packet` | `/planning`, `/planning/[id]`, `/orders/[id]/planning` | Required for field | Implemented, audit pending |
| 9 | Field Execution | 6 | `execution-session`, `checklist`, `sync` | `/execution`, `/execution/[id]`, `/orders/[id]/execution` | Required | Implemented, offline audit pending |
| 10 | Evidence Management | 7 | `evidence`, `files`, `sync` | `/evidences`, order evidence tabs | Required with blob outbox | Implemented, audit pending |
| 11 | Technical Reports | 8 | `report`, `technical-report` | `/reports`, `/reports/[id]` | Server generation only | Implemented, audit pending |
| 12 | Delivery Records | 9 | `delivery-record` | `/delivery-records`, `/delivery-records/[id]` | Online only | Implemented, graph node exists |
| 13 | Service Entry Sheets | 10-11 | `service-entry-sheet` | `/billing/ses`, `/billing/ses/[id]` | Online only | Implemented, audit pending |
| 14 | Invoices | 12-13 | `invoice` | `/billing/invoices`, `/billing/invoices/[id]` | Online only | Implemented, audit pending |
| 15 | Payments | 14 | `payment` | `/payments`, `/payments/[id]` | Online only | Implemented, audit pending |
| 16 | Costs | Cross-cutting | `cost` | `/costs`, `/costs/[orderId]` | Cost cart future/offline | Implemented/partial, audit pending |
| 17 | Documents and Dynamic Forms | Cross-cutting | `documents`, `template-draft`, `template-response`, `files` | `/documents`, `/documents/templates` | Capture offline for templates future | Implemented/partial, audit pending |
| 18 | Dashboard | Cross-cutting | `dashboard`, `analytics`, `notifications` | `/dashboard` | Offline summary degrade | Implemented, real-data audit pending |
| 19 | Audit Trail | Cross-cutting | `audit`, `observability` | Admin/detail panels | Online | Backend implemented, UI coverage pending |

---

## Module Implementation Contract

Each module must include:

1. Shared Zod schema in `packages/shared-types/src/schemas`.
2. Domain permissions and route access in `packages/domain`.
3. Mongoose model if persistent.
4. Backend service with business rules and typed errors.
5. Controller/route with validation and RBAC.
6. Frontend API wrapper or query file using `apiClient`.
7. TanStack Query hooks.
8. Page/component states: loading, error, empty, offline, success.
9. Unit/integration/E2E tests appropriate to risk.
10. Graph and audit documentation update.
