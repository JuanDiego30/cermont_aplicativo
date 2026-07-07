# API ENDPOINT MATRIX — Cermont S.A.S.

**Date:** 2026-05-13  
**Version:** 1.0 — Canonical  
**Status:** CURRENT_SOURCE_OF_TRUTH  
**Replaces:** DOC-10 (Contratos de API REST)

---

## Convention

**Base URL:** `http://127.0.0.1:4000/api`  
**Frontend proxy:** `/api/*` → `http://127.0.0.1:4000/api/*` via Next.js rewrites  
**Frontend calls:** All go through `/api/*` (the proxy), never call backend directly  
**Response envelope:** `{ success: boolean, data?: T, error?: { code: string, message: string }, pagination?: {...} }`

---

## Status Legend

| Status | Meaning |
|--------|---------|
| **IMPLEMENTED** | Endpoint exists and is functional |
| **REQUIRED_NOT_IMPLEMENTED** | Must exist for business flow; not yet built |
| **OPTIONAL** | Nice to have |
| **DEPRECATED** | Exists but planned for removal |

---

## Auth

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| POST | `/api/auth/login` | User login | `{ email, password }` | `{ accessToken, user }` | Public | Yes | /login | IMPLEMENTED |
| POST | `/api/auth/register` | User registration | `{ name, email, password, role }` | `{ user }` | Public | Yes | /register | IMPLEMENTED |
| POST | `/api/auth/refresh` | Rotate refresh session and issue a new token pair | Cookie: refreshToken | `{ accessToken }` + rotated HttpOnly cookie | Public with valid refresh cookie, 30/min | Yes on reuse | api-client interceptor | IMPLEMENTED |
| POST | `/api/auth/logout` | Logout, clear refresh cookie | None | `{ message }` | Authenticated | Yes | Header logout button | IMPLEMENTED |
| GET | `/api/auth/me` | Get current user | None | `{ user }` | Authenticated | No | AuthInitializer | IMPLEMENTED |
| POST | `/api/auth/forgot-password` | Request password reset | `{ email }` | `{ message }` | Public | Yes | /forgot-password | OPTIONAL |
| POST | `/api/auth/reset-password` | Reset password with token | `{ token, newPassword }` | `{ message }` | Public | Yes | /reset-password | OPTIONAL |
| POST | `/api/auth/passkeys/authentication/options` | Create a discoverable WebAuthn assertion challenge | None | `{ challengeId, options }` | Public, rate limited | No | /login | IMPLEMENTED |
| POST | `/api/auth/passkeys/authentication/verify` | Verify passkey assertion and issue the normal JWT session | `WebAuthnAuthenticationVerificationSchema` | `{ accessToken, user }` + HttpOnly refresh cookie | Public, rate limited | Yes | /login | IMPLEMENTED |
| POST | `/api/auth/passkeys/registration/options` | Create a user-bound passkey registration challenge | `{ deviceName }` | `{ challengeId, options }` | Authenticated | No | /profile | IMPLEMENTED |
| POST | `/api/auth/passkeys/registration/verify` | Verify and persist a public-key credential | `WebAuthnRegistrationVerificationSchema` | `{ credential }` | Authenticated | Yes | /profile | IMPLEMENTED |
| GET | `/api/auth/passkeys/credentials` | List the user's passkeys without public-key material | None | `{ credentials[] }` | Authenticated | No | /profile | IMPLEMENTED |
| DELETE | `/api/auth/passkeys/credentials/:credentialId` | Revoke a passkey | Params: `{ credentialId }` | 204 | Authenticated | Yes | /profile | IMPLEMENTED |

---

## Users

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/users` | List users | Query: `{ page, limit, role? }` | `{ users[], pagination }` | gerente, residente | No | /users | IMPLEMENTED |
| GET | `/api/users/:id` | Get user detail | Params: `{ id }` | `{ user }` | gerente, residente | No | /users/[id] | IMPLEMENTED |
| POST | `/api/users` | Create user | `{ name, email, password, role }` | `{ user }` | gerente, residente | Yes | /users/new | IMPLEMENTED |
| PUT | `/api/users/:id` | Update user | `{ name?, email?, role?, active? }` | `{ user }` | gerente, residente | Yes | /users/[id] | IMPLEMENTED |
| DELETE | `/api/users/:id` | Deactivate user (soft) | Params: `{ id }` | `{ message }` | gerente | Yes | /users | IMPLEMENTED |

---

## Work Requests (Step 1)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/work-requests` | List work requests | Query: `{ page, limit, status? }` | `{ workRequests[], pagination }` | All auth | No | /work-requests | REQUIRED |
| GET | `/api/work-requests/:id` | Get WR detail | Params: `{ id }` | `{ workRequest }` | All auth | No | /work-requests/[id] | REQUIRED |
| POST | `/api/work-requests` | Create WR | `{ clientId, description, serviceType, location, priority }` | `{ workRequest }` | gerente, residente, HES, cliente | Yes | /work-requests/new | REQUIRED |
| PUT | `/api/work-requests/:id` | Update WR | `{ description?, serviceType?, priority? }` | `{ workRequest }` | gerente, residente, HES | Yes | /work-requests/[id] | REQUIRED |
| POST | `/api/work-requests/:id/visits` | Create site visit | `{ scheduledDate, assignedTo, notes }` | `{ siteVisit }` | gerente, residente, HES, supervisor | Yes | /work-requests/[id] | REQUIRED |
| GET | `/api/work-requests/:id/visits` | List visits for WR | Params: `{ id }` | `{ siteVisits[] }` | All auth | No | /work-requests/[id] | REQUIRED |

---

## Proposals (Steps 2-3)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/proposals` | List proposals | Query: `{ page, limit, status? }` | `{ proposals[], pagination }` | All auth | No | /proposals | IMPLEMENTED |
| GET | `/api/proposals/:id` | Get proposal | Params: `{ id }` | `{ proposal }` | All auth | No | /proposals/[id] | IMPLEMENTED |
| POST | `/api/proposals` | Create proposal | `{ workRequestId, description, items[], totalEstimate, terms }` | `{ proposal }` | gerente, residente, HES | Yes | /proposals/new | IMPLEMENTED |
| PUT | `/api/proposals/:id` | Update proposal | `{ description?, items[]?, terms? }` | `{ proposal }` | gerente, residente, HES | Yes | /proposals/[id] | IMPLEMENTED |
| POST | `/api/proposals/:id/send` | Send proposal to client | None | `{ proposal }` | gerente, residente, HES | Yes | /proposals/[id] | IMPLEMENTED |
| POST | `/api/proposals/:id/approve` | Client approves proposal | `{ signature? }` | `{ proposal }` | cliente | Yes | /proposals/[id] | IMPLEMENTED |
| POST | `/api/proposals/:id/reject` | Client rejects proposal | `{ reason }` | `{ proposal }` | cliente | Yes | /proposals/[id] | IMPLEMENTED |

---

## Purchase Orders (Step 4)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| POST | `/api/proposals/:id/po` | Attach PO to proposal | `{ poNumber, poFile?, value, issuedDate }` | `{ purchaseOrder }` | gerente, residente, HES | Yes | /proposals/[id] | IMPLEMENTED |
| GET | `/api/proposals/:id/po` | Get PO for proposal | Params: `{ id }` | `{ purchaseOrder }` | All auth | No | /proposals/[id] | IMPLEMENTED |

---

## Work Orders (Steps 4-5)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/orders` | List work orders | Query: `{ page, limit, status?, assignedTo? }` | `{ orders[], pagination }` | All auth | No | /orders | IMPLEMENTED |
| GET | `/api/orders/:id` | Get order detail | Params: `{ id }` | `{ order }` | All auth | No | /orders/[id] | IMPLEMENTED |
| POST | `/api/orders` | Create work order | `{ proposalId, description, location, priority, assignedTo? }` | `{ order }` | gerente, residente, HES | Yes | /orders/new | IMPLEMENTED |
| PUT | `/api/orders/:id` | Update order | `{ status?, description?, assignedTo?, priority? }` | `{ order }` | gerente, residente, HES, supervisor | Yes | /orders/[id] | IMPLEMENTED |
| POST | `/api/orders/:id/advance-step` | Advance linked service case operational step | Params: `{ id }` | `{ serviceCase }` | gerente, residente, supervisor | Yes | /service-cases/[id] | IMPLEMENTED |
| POST | `/api/orders/:id/assign` | Assign personnel | `{ userIds[] }` | `{ order }` | gerente, residente, HES | Yes | /orders/[id] | REQUIRED |

---

## Service Cases / Cockpit

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/service-cases/:id/cockpit` | Read-model for 14-step cockpit, blockers, documents, evidences, costs, and closure | Params: `{ id }` | `{ serviceCaseWorkflowView }` | gerente, residente, HES, supervisor, administrativo, tecnico, operador | No | /service-cases/[id] | IMPLEMENTED |
| GET | `/api/service-cases/:id/workflow` | Canonical workflow view for cockpit | Params: `{ id }` | `{ serviceCaseWorkflowView }` | gerente, residente, HES, supervisor, administrativo, tecnico, operador | No | /service-cases/[id] | IMPLEMENTED |
| POST | `/api/service-cases/:id/step/advance` | Advance active operational step when blockers are resolved; terminal cases are immutable | Params: `{ id }` | `{ serviceCase }` | gerente, residente, supervisor | Yes | /service-cases/[id] | IMPLEMENTED |

---

## Planning (Step 5)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/orders/:id/planning` | Get planning packet | Params: `{ id }` | `{ planningPacket }` | All auth | No | /orders/[id]/planning | IMPLEMENTED |
| POST | `/api/orders/:id/planning` | Create planning | `{ activities[], materials[], tools[], equipment[], personnel[], safetyElements[], schedule }` | `{ planningPacket }` | gerente, residente, HES | Yes | /orders/[id]/planning | IMPLEMENTED |
| PUT | `/api/orders/:id/planning` | Update planning | `{ activities[]?, materials[]?, ... }` | `{ planningPacket }` | gerente, residente, HES | Yes | /orders/[id]/planning | IMPLEMENTED |
| POST | `/api/orders/:id/planning/approve` | Approve planning | `{ signature }` | `{ planningPacket }` | gerente, residente | Yes | /orders/[id]/planning | REQUIRED |

---

## Execution (Steps 6-7)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/execution` | List execution sessions | Query: `{ page, limit, status?, orderId? }` | `{ sessions[], pagination }` | All auth | No | /execution | REQUIRED |
| POST | `/api/execution` | Start execution session | `{ orderId, startDate, location, notes }` | `{ session }` | supervisor, operador, tecnico | Yes | /execution | REQUIRED |
| PUT | `/api/execution/:id` | Update session | `{ status?, progress?, notes? }` | `{ session }` | supervisor, operador, tecnico | Yes | /execution | REQUIRED |
| POST | `/api/execution/:id/pause` | Pause session | `{ reason? }` | `{ session }` | supervisor | Yes | /execution | REQUIRED |
| POST | `/api/execution/:id/complete` | Complete session | `{ summary, checklistResults }` | `{ session }` | supervisor | Yes | /execution | REQUIRED |

---

## Evidence (Step 7)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/evidences` | List evidence visible through owned/assigned/supervised orders | Query: `{ orderId?, status?, page, limit }` | `{ evidences[], pagination }` | Internal roles + order scope | No | /evidences | IMPLEMENTED |
| GET | `/api/evidences/:id` | Get evidence detail after work-order authorization | Params: `{ id }` | `{ evidence }` | Internal roles + order scope | No | /evidences/[id] | IMPLEMENTED |
| POST | `/api/evidences` | Upload verified image evidence; contextual order/session references must belong to the service case | Multipart: `{ orderId, file, type, description, gps? }` or contextual V2 payload | `{ evidence }` | operador, tecnico, supervisor + order scope; 10/min | Yes | /evidences/upload | IMPLEMENTED |
| DELETE | `/api/evidences/:id` | Soft delete evidence after work-order authorization | Params: `{ id }` | `{ evidence }` | gerente, residente, supervisor + order scope | Yes | /evidences | IMPLEMENTED |
| POST | `/api/evidences/:id/verify` | Verify evidence after work-order authorization | None | `{ evidence }` | gerente, residente, supervisor + order scope | Yes | /evidences | IMPLEMENTED |

---

## Files / File Assets

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/files` | List files by owning entity | Query: `{ entityType, entityId, category?, includeDeleted? }` | `{ fileAssets[] }` | Internal roles | No | resources, evidences, documents | IMPLEMENTED |
| GET | `/api/files/:id` | Get file metadata | Params: `{ id }` | `{ fileAsset }` | Internal roles | No | resources, evidences, documents | IMPLEMENTED |
| GET | `/api/files/:id/content` | Serve stored binary through authenticated API | Params: `{ id }` | Binary file stream | Internal roles | Yes (`FILE_ASSET_DOWNLOADED`) | file previews/downloads | IMPLEMENTED |
| POST | `/api/files/upload` | Upload file with UUID name, MIME/extension/magic-byte/malware checks, max 20 MB | Multipart: `{ file, category, entityType, entityId, description?, tags?, offlineLocalId?, kind?, source?, isPrimary?, metadata? }` | `{ fileAssetRef }` | Internal roles; 10/min | Yes | resource/document/file forms | IMPLEMENTED |
| POST | `/api/files/offline-upload` | Idempotent secure offline file upload, max 20 MB | Multipart: `{ file, category, entityType, entityId, offlineLocalId }` | `{ fileAssetRef }` | Internal roles; 10/min | Yes | offline sync manager | IMPLEMENTED |
| DELETE | `/api/files/:id` | Soft delete file asset and unlink parent ref | Params: `{ id }` | No content | Internal roles | Yes | resource/document/file forms | IMPLEMENTED |

---

## Reports (Step 8)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/reports` | List reports | Query: `{ orderId?, page, limit }` | `{ reports[], pagination }` | All auth | No | /reports | IMPLEMENTED |
| GET | `/api/reports/:id` | Get report + PDF | Params: `{ id }` | `{ report, pdfUrl? }` | All auth | No | /reports/[id] | IMPLEMENTED |
| POST | `/api/reports` | Generate report | `{ orderId, templateId?, notes }` | `{ report }` | gerente, residente, HES, supervisor, tecnico | Yes | /reports/generate | IMPLEMENTED |
| PUT | `/api/reports/:id` | Update report | `{ content?, notes? }` | `{ report }` | gerente, residente, HES, supervisor | Yes | /reports/[id] | IMPLEMENTED |
| POST | `/api/reports/:id/submit` | Submit for approval | None | `{ report }` | gerente, residente, HES, supervisor, tecnico | Yes | /reports/[id] | REQUIRED |
| POST | `/api/reports/:id/approve` | Approve report | `{ signature }` | `{ report }` | gerente, residente, HES | Yes | /reports/[id] | REQUIRED |

---

## Delivery Records (Steps 9-10)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/delivery-records` | List delivery records | Query: `{ orderId?, page, limit }` | `{ records[], pagination }` | All auth | No | /delivery-records | REQUIRED |
| GET | `/api/delivery-records/:id` | Get DR detail | Params: `{ id }` | `{ record }` | All auth | No | /delivery-records/[id] | REQUIRED |
| POST | `/api/delivery-records` | Create delivery record | `{ orderId, reportId, items[] }` | `{ record }` | gerente, residente, HES, supervisor | Yes | /delivery-records/new | REQUIRED |
| POST | `/api/delivery-records/:id/sign` | Client signature | `{ signature, name }` | `{ record }` | cliente | Yes | /delivery-records/[id] | REQUIRED |

---

## Service Entry Sheets (Step 11)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/ses` | List SES | Query: `{ orderId?, status?, page, limit }` | `{ sesList[], pagination }` | All auth | No | /billing/ses | REQUIRED |
| GET | `/api/ses/:id` | Get SES detail | Params: `{ id }` | `{ ses }` | All auth | No | /billing/ses/[id] | REQUIRED |
| POST | `/api/ses` | Create SES | `{ orderId, deliveryRecordId, aribaRef? }` | `{ ses }` | gerente, residente, HES, administrativo | Yes | /billing/ses/new | REQUIRED |
| POST | `/api/ses/:id/submit` | Submit to Ariba | `{ aribaRef }` | `{ ses }` | gerente, residente, HES, administrativo | Yes | /billing/ses/[id] | REQUIRED |
| POST | `/api/ses/:id/approve` | SES approved by client | None | `{ ses }` | cliente | Yes | /billing/ses/[id] | REQUIRED |

---

## Invoices (Steps 12-13)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/invoices` | List invoices | Query: `{ workOrderId?, clientId?, status?, page, limit }` | `{ invoices[], pagination }` | Internal roles | No | /billing/invoices | IMPLEMENTED |
| GET | `/api/invoices/:id` | Get invoice | Params: `{ id }` | `{ invoice }` | Internal roles | No | /billing/invoices/[id] | IMPLEMENTED |
| POST | `/api/invoices/from-service-entry-sheet/:id` | Create invoice from an approved SES using server-owned financial values | Params: `{ id }` + `CreateOrderInvoiceSchema` | `{ invoice }` | gerente, residente, administrativo | Yes | /billing/invoices/new | IMPLEMENTED |
| POST | `/api/invoices/:id/submit` | Submit invoice after revalidating references, currency, totals, and lines against SES | None | `{ invoice }` | gerente, residente, administrativo | Yes | /billing/invoices/[id] | IMPLEMENTED |
| POST | `/api/invoices/:id/approve` | Approve invoice after SES integrity revalidation | None | `{ invoice }` | gerente, residente | Yes | /billing/invoices/[id] | IMPLEMENTED |
| POST | `/api/invoices/:id/reject` | Reject invoice | `{ reason }` | `{ invoice }` | gerente, residente | Yes | /billing/invoices/[id] | IMPLEMENTED |

---

## Payments (Step 14)

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/payments` | List payments | Query: `{ invoiceId?, status?, page, limit }` | `{ payments[], pagination }` | All auth | No | /payments | REQUIRED |
| GET | `/api/payments/:id` | Get payment | Params: `{ id }` | `{ payment }` | All auth | No | /payments/[id] | REQUIRED |
| POST | `/api/payments` | Register payment | `{ invoiceId, amount, date, reference, method }` | `{ payment }` | gerente, residente, HES, administrativo | Yes | /payments/new | REQUIRED |
| PUT | `/api/payments/:id` | Update payment | `{ status?, reference? }` | `{ payment }` | gerente, residente, HES | Yes | /payments/[id] | REQUIRED |

---

## Documents & Templates

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/documents` | List active documents | Query: `{ orderId?, purpose?, serviceCaseId?, stepCode?, includeArchived? }` | `{ documents[] }` | gerente, residente, administrativo, supervisor | No | /documents | IMPLEMENTED |
| POST | `/api/documents` | Upload document with UUID name and verified binary signature, max 20 MB | Multipart contextual document input | `{ document }` | gerente, residente, administrativo, supervisor; 10/min | Yes | /documents | IMPLEMENTED |
| DELETE | `/api/documents/:id` | Soft-delete ordinary documents; archive critical closing evidence under retention policy | Params: `{ id }`, body `{ reason? }` | `{ status, documentId, retentionUntil? }` | Management roles | Yes | /documents | IMPLEMENTED |
| PATCH | `/api/documents/:id/archive` | Explicitly archive a document with five-year retention metadata | Params: `{ id }`, body `{ reason? }` | `{ document }` | Management roles | Yes | /documents | IMPLEMENTED |
| POST | `/api/documents/import` | Import document | Multipart: `{ file, type, orderId? }` | `{ import }` | All auth | Yes | /documents/imports | REQUIRED |
| GET | `/api/documents/import` | List imports | Query: `{ status?, page, limit }` | `{ imports[], pagination }` | All auth | No | /documents/imports | REQUIRED |
| GET | `/api/documents/import/:id` | Get import status | Params: `{ id }` | `{ import }` | All auth | No | /documents/imports/[id] | REQUIRED |
| GET | `/api/documents/templates` | List templates | Query: `{ type?, status?, page, limit }` | `{ templates[], pagination }` | All auth | No | /documents/templates | REQUIRED |
| GET | `/api/documents/templates/:id` | Get template | Params: `{ id }` | `{ template }` | All auth | No | /documents/templates/[id] | REQUIRED |
| POST | `/api/documents/templates` | Create template | `{ name, importId, fields[], sections[], version }` | `{ template }` | gerente, residente, HES | Yes | /documents/templates/builder | REQUIRED |
| PUT | `/api/documents/templates/:id` | Update template | `{ name?, fields[]?, sections[]?, status? }` | `{ template }` | gerente, residente, HES | Yes | /documents/templates/[id] | REQUIRED |
| GET | `/api/documents/templates/:id/schema` | Get template schema for builder | Params: `{ id }` | `{ schema }` | All auth | No | /documents/templates/[id]/builder | REQUIRED |
| POST | `/api/documents/responses` | Submit template response | `{ templateId, orderId, fields{} }` | `{ response }` | All auth | Yes | /documents/responses | REQUIRED |
| GET | `/api/documents/responses/:id` | Get response | Params: `{ id }` | `{ response }` | All auth | No | /documents/responses/[id] | REQUIRED |
| POST | `/api/documents/responses/:id/generate` | Generate PDF from response | `{ format }` | `{ generatedDocument }` | All auth | Yes | /documents/responses/[id] | REQUIRED |

---

## Costs

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/costs/dashboard` | Cost dashboard | Query: `{ period? }` | `{ generatedAt, totals, variance, byCategory[] }` | gerente, residente, HES, supervisor, tecnico | No | /costs | IMPLEMENTED |
| GET | `/api/costs/catalog` | Cost catalog | Query: `{ category?, page, limit }` | `{ items[], pagination }` | gerente, residente, HES, supervisor, tecnico | No | /costs/catalog | IMPLEMENTED |
| GET | `/api/proposals/:id/costs` | Proposal cost estimates | Params: `{ id }` | `{ costEstimate }` | All auth | No | /proposals/[id]/costs | REQUIRED |
| POST | `/api/proposals/:id/costs` | Set cost estimate | `{ items[], taxConfig }` | `{ costEstimate }` | gerente, residente, HES | Yes | /proposals/[id]/costs | REQUIRED |
| GET | `/api/orders/:id/costs` | Actual costs for order | Params: `{ id }` | `{ actualCosts[] }` | All auth | No | /orders/[id]/costs | REQUIRED |
| POST | `/api/orders/:id/costs` | Record actual cost | `{ category, description, amount, date, evidence? }` | `{ actualCost }` | gerente, residente, HES, supervisor | Yes | /orders/[id]/costs | REQUIRED |

---

## Assets

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/assets` | List assets with availability summary | Query: `{ type?, status?, search?, page, limit }` | `{ data[], meta }` | Internal roles | No | /assets | IMPLEMENTED |
| GET | `/api/assets/:id/profile` | Asset/tool professional profile with FileAsset requirements | Params: `{ id }` | `{ asset, photoRequirements[], documentRequirements[], missingRequiredPhotoCount, blockingDocumentCount }` | Internal roles | No | /assets/[id] | IMPLEMENTED |
| GET | `/api/assets/:id` | Get asset | Params: `{ id }` | `{ asset }` | Internal roles | No | legacy/detail calls | IMPLEMENTED |
| POST | `/api/assets` | Create asset | `{ code, name, type, status?, serialNumber?, specifications? }` | `{ asset }` | Asset management roles | No | /assets | IMPLEMENTED |
| PATCH | `/api/assets/:id` | Update asset | `{ name?, status?, type?, serialNumber?, specifications? }` | `{ asset }` | Asset management roles | No | /assets/[id] | IMPLEMENTED |
| PATCH | `/api/assets/:id/status` | Update asset status | `{ status }` | `{ asset }` | Asset management roles | No | /assets/[id] | IMPLEMENTED |
| DELETE | `/api/assets/:id` | Retire asset | Params: `{ id }` | `{ asset }` | Admin roles | No | admin flows | IMPLEMENTED |

---

## Fleet

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/fleet` | List vehicles with readiness summary | Query: `{ status?, type?, page, limit }` | `{ data[], meta }` | Internal roles | No | /fleet | IMPLEMENTED |
| GET | `/api/fleet/:id/profile` | Vehicle professional profile with FileAsset requirements | Params: `{ id }` | `{ vehicle, photoRequirements[], documentRequirements[], missingRequiredPhotoCount, blockingDocumentCount }` | Internal roles | No | /fleet/[id] | IMPLEMENTED |
| GET | `/api/fleet/:id` | Get vehicle | Params: `{ id }` | `{ vehicle }` | Internal roles | No | legacy/detail calls | IMPLEMENTED |
| POST | `/api/fleet` | Create vehicle | `CreateVehicleSchema` | `{ vehicle }` | Management roles | No | /fleet | IMPLEMENTED |
| PATCH | `/api/fleet/:id` | Update vehicle | `UpdateVehicleSchema` | `{ vehicle }` | Management roles | No | /fleet | IMPLEMENTED |
| GET | `/api/fleet/expiring-documents` | Expiring SOAT/tecnomecanica/policy alerts | Query: `{ days? }` | `{ alerts[] }` | Internal roles | No | /fleet | IMPLEMENTED |
| GET | `/api/fleet/:id/photos` | List vehicle photos backed by FileAsset | Params: `VehicleIdParamsSchema` | `{ data: VehiclePhoto[] }` | Internal roles | No | /fleet/[id] | IMPLEMENTED |
| POST | `/api/fleet/:id/photos` | Upload validated vehicle photo through canonical FileAsset pipeline | Params: `VehicleIdParamsSchema`; multipart `{ file, title? }` | `{ data: VehiclePhoto }` | gerente, residente; 10/min | Yes | /fleet/[id] | IMPLEMENTED |
| PATCH | `/api/fleet/:id/photos/:photoId/primary` | Set primary photo after ownership verification | `VehiclePhotoParamsSchema` | `{ data: VehiclePhoto }` | gerente, residente | Yes | /fleet/[id] | IMPLEMENTED |
| DELETE | `/api/fleet/:id/photos/:photoId` | Soft-delete owned photo and select next primary | `VehiclePhotoParamsSchema` | No content | gerente, residente | Yes | /fleet/[id] | IMPLEMENTED |

---

## Maintenance

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/maintenance` | List maintenance plans | Query: `{ assetId?, status?, page, limit }` | `{ plans[], pagination }` | All auth | No | /maintenance | IMPLEMENTED |
| GET | `/api/maintenance/:id` | Get plan detail | Params: `{ id }` | `{ plan }` | All auth | No | /maintenance/[id] | IMPLEMENTED |
| POST | `/api/maintenance` | Create plan | `{ assetId, type, frequency, nextDate, tasks[] }` | `{ plan }` | gerente, residente, HES | Yes | /maintenance/new | IMPLEMENTED |
| PUT | `/api/maintenance/:id` | Update plan | `{ status?, tasks[]?, nextDate? }` | `{ plan }` | gerente, residente, HES | Yes | /maintenance/[id] | IMPLEMENTED |

---

## Dashboard & Analytics

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/dashboard` | Dashboard summary | None | `{ kpis, activeOrders, costs, alerts }` | gerente, residente, HES, supervisor, administrativo | No | /dashboard | IMPLEMENTED |
| GET | `/api/notifications` | User notifications | Query: `{ page?, limit?, read? }` | `{ notifications[] }` | Internal roles | No | /notifications + Header bell | IMPLEMENTED |

---

## Audit

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/audit` | Query immutable audit log | Query: `{ entity?, entityId?, userId?, action?, requestId?, from?, to?, page, limit }` | `{ logs[], total, page, limit }` | gerente, administrativo, coord_administrativo | No | `/admin/audit` | IMPLEMENTED |

---

## Summary

| Category | Implemented | Required | Optional | Total |
|----------|------------|----------|----------|-------|
| Auth | 5 | 0 | 2 | 7 |
| Users | 5 | 0 | 0 | 5 |
| Work Requests | 0 | 6 | 0 | 6 |
| Proposals | 7 | 0 | 0 | 7 |
| Purchase Orders | 2 | 0 | 0 | 2 |
| Work Orders | 4 | 1 | 0 | 5 |
| Planning | 3 | 1 | 0 | 4 |
| Execution | 0 | 5 | 0 | 5 |
| Evidence | 4 | 1 | 0 | 5 |
| Reports | 4 | 2 | 0 | 6 |
| Delivery Records | 0 | 4 | 0 | 4 |
| SES | 0 | 5 | 0 | 5 |
| Invoices | 0 | 6 | 0 | 6 |
| Payments | 0 | 4 | 0 | 4 |
| Documents/Templates | 1 | 11 | 0 | 12 |
| Costs | 0 | 6 | 0 | 6 |
| Assets | 0 | 4 | 0 | 4 |
| Maintenance | 4 | 0 | 0 | 4 |
| Dashboard | 1 | 1 | 0 | 2 |
| Audit | 0 | 1 | 0 | 1 |
| **TOTAL (DOCUMENTED)** | **40** | **58** | **2** | **100** |

---

## Spec-014/016 Additions (Verified 2026-07-05)

Endpoints agregados por Spec-014/015/016 y verificados contra los archivos `*.routes.ts` del backend. `GET /api/service-cases/:id/cockpit` ya estaba documentado en la sección Service Cases / Cockpit; `GET /api/costs/catalog` y `GET /api/notifications` se actualizaron a IMPLEMENTED en sus secciones originales.

| Method | Endpoint | Purpose | Request Schema | Response Schema | RBAC | Audit | Used By | Status |
|--------|----------|---------|----------------|-----------------|------|-------|---------|--------|
| GET | `/api/service-cases/:id/invoice-pipeline` | SES→Invoice→Payment tracking pipeline | Params: `{ id }` | `{ pipeline }` | Internal roles | No | /invoices/[id]/pipeline | IMPLEMENTED |
| POST | `/api/planning-packets/:id/validate-readiness` | Validate planning packet readiness checks | Params: `{ id }` | `{ readinessResult }` | gerente, residente, supervisor, HES | No | /planning/[id] | IMPLEMENTED |
| POST | `/api/planning-packets/:id/approve` | Approve planning packet with readiness check + kit reminder notification | Params: `{ id }` + `ApprovePlanningPacketSchema` | `{ planningPacket }` | gerente, residente | Yes | /planning/[id] | IMPLEMENTED |
| POST | `/api/execution-sessions/:id/preflight` | Submit preflight checklist for execution session | Params: `{ id }` | `{ preflightResult }` | supervisor, operador, tecnico | Yes | /execution-sessions/[id] | IMPLEMENTED |
| GET | `/api/costs/:orderId/intelligence` | Cost intelligence (baseline vs actual, KPI metrics) | Params: `{ orderId }` | `{ costIntelligence }` | gerente, residente, HES, supervisor, tecnico | No | /costs/[orderId] | IMPLEMENTED |
| POST | `/api/costs/catalog` | Create cost catalog item | Body: `CreateCostCatalogItemSchema` | `{ item }` | gerente, residente | Yes | /costs/catalog | IMPLEMENTED |
| GET | `/api/dashboard/operational-kpis` | Operational KPIs (MTTR / MTBF / FTFR) | Query: `{ dateFrom?, dateTo? }` | `{ kpis }` | All auth | No | /dashboard | IMPLEMENTED |
| GET | `/api/dashboard/sla-risk` | SLA risk analysis for current orders | None | `{ slaRiskAnalysis }` | All auth | No | /dashboard | IMPLEMENTED |
| GET | `/api/reports/auto-draft/:serviceCaseId` | Auto-generated technical report draft | Params: `{ serviceCaseId }` | `{ reportDraft }` | supervisor, tecnico, operador | No | /reports/[id]/draft | IMPLEMENTED |
| POST | `/api/evidences/:id/review` | Review and approve/reject evidence | Params: `{ id }` + `ReviewEvidenceSchema` | `{ evidence }` | gerente, residente, supervisor | Yes | /evidences/[id] | IMPLEMENTED |

---

## Actual Route Count (Audited 2026-06-14)

El backend contiene **389 route definitions** distribuidas en **40+ módulos** (52 mounts en API_MOUNTS). 
La gran mayoría están **IMPLEMENTED**. Solo los endpoints marcados como REQUIRED_NOT_IMPLEMENTED en las
secciones anteriores están pendientes de verificación detallada.

### Módulos con +15 endpoints cada uno:
| Módulo | Endpoints Aprox. | Status |
|--------|------------------|--------|
| `order/*` | ~25 | IMPLEMENTED ✅ |
| `user/*` | ~15 | IMPLEMENTED ✅ |
| `evidence/*` | ~15 | IMPLEMENTED ✅ |
| `work-requests/*` | ~12 | IMPLEMENTED ✅ |
| `planning-packet/*` | ~15 | IMPLEMENTED ✅ |
| `client/*` | ~10 | IMPLEMENTED ✅ |
| `fleet/*` | ~10 | IMPLEMENTED ✅ |
| `service-entry-sheet/*` | ~12 | IMPLEMENTED ✅ |
| `delivery-record/*` | ~12 | IMPLEMENTED ✅ |
| `payment/*` | ~8 | IMPLEMENTED ✅ |
| `cost/*` | ~10 | IMPLEMENTED ✅ |
| Resto de módulos | ~250+ | IMPLEMENTED ✅ |

**Nota:** Esta matriz requiere una rewrite completa para reflejar los 389 endpoints reales con
sus Zod schemas, RBAC y estados. La actualización detallada queda como tarea pendiente (F1.1).
Para la arquitectura de módulos, ver `docs/architecture/MODULE_ARCHITECTURE.md`.
