# RBAC PERMISSION MAP — Cermont S.A.S.

> **Generated**: 2026-06-29  
> **Source**: packages/domain/src/, backend/src/middlewares/, backend/src/modules/*/routes.ts  
> **Roles**: 8 (gerente, residente, HES, supervisor, operador, tecnico, administrativo, cliente)

---

## Role Hierarchy

| Role | Level | Description |
|------|-------|-------------|
| gerente | 1 | Full access, highest privilege |
| residente | 2 | Project resident, near-full access |
| HES | 3 | HSE/Safety specialist |
| supervisor | 4 | Field supervisor |
| operador | 5 | Field operator |
| tecnico | 6 | Technical staff |
| administrativo | 7 | Administrative staff |
| cliente | 8 | Client (read-only on own data) |

---

## Permission Matrix by Module

### Auth

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/auth/login | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/auth/register | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/auth/refresh | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/auth/logout | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/auth/me | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/auth/change-password | PATCH | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/auth/forgot-password | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/auth/reset-password | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/auth/passkeys/* | * | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Users

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/users | GET | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/users/:id | GET | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/users | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/users/:id | PUT | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/users/:id | DELETE | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Work Requests

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/work-requests | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/work-requests/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/work-requests | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| /api/work-requests/:id | PUT | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/work-requests/:id/visits | POST | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/work-requests/:id/visits | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Proposals

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/proposals | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/proposals/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/proposals | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/proposals/:id | PUT | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/proposals/:id/send | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/proposals/:id/approve | POST | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| /api/proposals/:id/reject | POST | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| /api/proposals/:id/po | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Work Orders

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/orders | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/orders/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/orders | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/orders/:id | PUT | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/orders/:id/status | PATCH | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/orders/:id/assign | PATCH | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/orders/:id | DELETE | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/orders/:id/report | GET | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |

### Evidence

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/evidences | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| /api/evidences/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| /api/evidences | POST | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| /api/evidences/:id | DELETE | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/evidences/:id/verify | POST | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/evidences/:id/download | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| /api/evidences/:id/view | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### Planning

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/orders/:id/planning | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/orders/:id/planning | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/orders/:id/planning | PUT | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/orders/:id/planning/approve | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Execution

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/execution | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/execution | POST | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| /api/execution/:id | PUT | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| /api/execution/:id/pause | POST | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/execution/:id/complete | POST | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Reports

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/reports | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/reports/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/reports | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| /api/reports/:id | PUT | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/reports/:id/submit | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| /api/reports/:id/approve | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Delivery Records

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/delivery-records | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/delivery-records/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/delivery-records | POST | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/delivery-records/:id/sign | POST | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### Service Entry Sheets (SES)

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/ses | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/ses/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/ses | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| /api/ses/:id/submit | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| /api/ses/:id/approve | POST | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### Invoices

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/invoices | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/invoices/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/invoices/from-ses/:id | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| /api/invoices/:id/submit | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| /api/invoices/:id/approve | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/invoices/:id/reject | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Payments

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/payments | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/payments/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/payments | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| /api/payments/:id | PUT | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Documents

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/documents | GET | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| /api/documents | POST | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| /api/documents/:id | DELETE | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/documents/:id/archive | PATCH | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Costs

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/costs/dashboard | GET | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| /api/costs/catalog | GET | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/proposals/:id/costs | GET | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/proposals/:id/costs | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/orders/:id/costs | GET | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| /api/orders/:id/costs | POST | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Fleet

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/fleet | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| /api/fleet/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| /api/fleet | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/fleet/:id | PATCH | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/fleet/:id/photos | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| /api/fleet/:id/photos | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/fleet/:id/photos/:photoId/primary | PATCH | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/fleet/:id/photos/:photoId | DELETE | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Maintenance

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/maintenance | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/maintenance/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/maintenance | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /api/maintenance/:id | PUT | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Dashboard

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/dashboard | GET | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |

### Audit

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/audit | GET | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

### Admin

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/admin/backups | GET | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| /api/admin/custom-fields | GET | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

### Portal (Client)

| Endpoint | Method | gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente |
|----------|--------|---------|-----------|-----|------------|----------|---------|----------------|---------|
| /api/portal | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| /api/portal/invoices | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| /api/portal/orders | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| /api/portal/orders/:id | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| /api/portal/proposals | GET | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Summary

| Role | Total Endpoints | % of API |
|------|-----------------|----------|
| gerente | 100+ | ~100% |
| residente | 90+ | ~90% |
| HES | 60+ | ~60% |
| supervisor | 70+ | ~70% |
| operador | 40+ | ~40% |
| tecnico | 35+ | ~35% |
| administrativo | 50+ | ~50% |
| cliente | 20+ | ~20% |

**Key Patterns:**
- `gerente` + `residente`: Near-full access (management roles)
- `HES`: Safety-focused, limited to safety-related modules
- `supervisor`: Field operations (execution, evidence, planning)
- `operador` + `tecnico`: Field execution and evidence upload
- `administrativo`: Admin functions, invoices, audit
- `cliente`: Portal-only, read-only on own data
