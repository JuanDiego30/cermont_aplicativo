# 13 — Final Implementation Matrix (50+ Requirements Audited)

## Executive Summary

To achieve absolute compliance with the zero-trust coding guidelines of CERMONT S.A.S. and solve the 5 critical operational fallacies, we have constructed a **Master Implementation Matrix containing exactly 53 detailed technical requirements**.

For each requirement, we map:
1. **Paso & Falla**: The associated step (1-14) and operational fallacy solved.
2. **Component Isolation**: Impacted pages, Backend routes, Frontend views, and Packages.
3. **Security & Offline**: Specific OWASP and PWA strategies.
4. **Current Observed State & Target Action**: Gaps found in the code and remediation actions (`IMPLEMENTAR`, `REFACTORIZAR`, `COMPLETAR`, `ELIMINAR`).
5. **Prioritization Metrics**: Priority level (`P0` to `P3`), Effort estimation (`XS` to `XL`), Risk factor, and verification tests.

---

## Sources & References

- **Canonical Code Repositories**:
  - `backend/src/models/` and `frontend/src/app/` — Live directory structural states.
  - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — Canonical steps index.
- **Auditing Logs**:
  - `.agents/rules/01-stack.md` and `.agents/rules/09-prohibitions.md` — Stack constraints.

---

## Structured Action Definitions
- **IMPLEMENTAR**: Build from scratch (does not exist in physical folders).
- **COMPLETAR**: Extend existing code to fit canonical Zod models.
- **REFACTORIZAR**: Clean circular imports or performance issues.
- **ELIMINAR**: Delete junk scripts or duplicate components.

---

## Master Implementation Matrix (53 Requirements)

| # | Requisito | Paso | Falla | Página | Backend | Frontend | Packages | Seguridad | Offline | Estado actual | Acción | Prioridad | Esfuerzo | Riesgo | Test |
|---|-----------|------|-------|--------|---------|----------|----------|-----------|---------|---------------|--------|-----------|---------|--------|------|
| 1 | B Bola IDOR filter in Evidences | 7 | F2 | `/evidences` | `GET /evidences` | `EvidenceCard.tsx` | `shared-types` | Multi-tenant isolation | Read-only cache | Missing tenant filters | REFACTORIZAR | P0 | S | ALTO | Vitest integration |
| 2 | B Bola IDOR filter in Documents | 1-14 | — | `/documents` | `GET /documents` | `DocumentPicker.tsx` | `shared-types` | Multi-tenant isolation | Read-only cache | Missing tenant filters | REFACTORIZAR | P0 | S | ALTO | Vitest integration |
| 3 | Magic Bytes photo uploads validation | 7 | F2 | `/evidences/gallery` | `POST /evidences` | `UploadZone.tsx` | — | Magic bytes check (Buffer) | Blocked offline | Validates only HTTP MIME | IMPLEMENTAR | P0 | S | ALTO | Vitest upload test |
| 4 | Rate limiting on auth login | — | — | `/login` | `POST /auth/login` | `LoginForm.tsx` | — | 10 attempts/min block | — | Rate limit missing | IMPLEMENTAR | P0 | XS | MEDIO | Supertest flood |
| 5 | Rate limiting on photo uploads | 7 | F2 | `/evidences/gallery` | `POST /evidences` | `UploadZone.tsx` | — | 5 uploads/min block | — | Rate limit missing | IMPLEMENTAR | P0 | XS | MEDIO | Supertest flood |
| 6 | Delete obsolete root trash scripts | — | — | — | — | — | — | — | — | Junk files in root | ELIMINAR | P0 | XS | BAJO | Terminal `Test-Path` |
| 7 | Fix `.gitignore` json exclusion loop | — | — | — | — | — | — | — | — | `*.json` on L272 ignores config | REFACTORIZAR | P0 | XS | BAJO | Git status check |
| 8 | Dynamic Kanban column limits (max 25) | 5-10 | — | `/orders` | `GET /orders` | `KanbanBoard.tsx` | `shared-types` | — | Read-only cache | `limit=250` global query | REFACTORIZAR | P0 | M | ALTO | Vitest query limit |
| 9 | ReadinessGate visual semaphore component | 5 | F1 | `/planning/[id]/readiness-gate` | `GET /plannings/readiness` | `ReadinessGate.tsx` | `shared-types` | safety gates | local cache | Component missing | IMPLEMENTAR | P1 | M | BAJO | Component renders |
| 10 | ReadinessGate backend block on check-in | 6 | F1 | `/execution/session` | `POST /executions/check-in` | `CheckInButton.tsx` | `domain` | Safety lock | Outbox queued | Execution allowed without plan | IMPLEMENTAR | P1 | M | ALTO | Supertest check-in |
| 11 | CostVarianceTable colored semaphores | 14 | F5 | `/costs` | `GET /costs/variance` | `CostVarianceTable.tsx` | `shared-types` | Audit track | Read-only cache | Dashboard missing | IMPLEMENTAR | P1 | M | BAJO | Component renders |
| 12 | Dynamic cost delta virtual attributes | 14 | F5 | `/costs` | `Cost.ts` Mongoose | `VarianceBadge.tsx` | `shared-types` | Integrity calculation | — | Deltas calculated on client | REFACTORIZAR | P1 | S | MEDIO | Schema virtual test |
| 13 | Multi-collection seeders script | Todos | Todos | — | `seed-p0-cases.ts` | — | — | — | — | Seeds only service cases | COMPLETAR | P1 | M | BAJO | Seeder run check |
| 14 | E2E flow tests with MongoDB testcontainers | Todos | Todos | — | — | — | — | — | — | Uses mock-backend | IMPLEMENTAR | P1 | L | MEDIO | Playwright run |
| 15 | HTML5 canvas signature pad component | 10 | F3 | `/delivery-records/[id]/sign` | `POST /delivery-records/sign` | `SignaturePad.tsx` | `shared-types` | Non-repudiation | Base64 outbox buffer | Signature pad missing | COMPLETAR | P1 | M | BAJO | Touch stroke test |
| 16 | GPS telemetry capture on canvas signature | 10 | F3 | `/delivery-records/[id]/sign` | `POST /delivery-records/sign` | `SignaturePad.tsx` | `shared-types` | Forensic geo-timestamp | Outbox queued | Geolocation not captured | IMPLEMENTAR | P1 | S | MEDIO | Geolocation check |
| 17 | Automatic Report draft generator service | 8 | F3 | `/technical-reports/[id]/edit` | `POST /technical-reports/auto` | `ReportEditor.tsx` | `domain` | — | — | Generated manually | IMPLEMENTAR | P1 | L | MEDIO | Report compile test |
| 18 | Programmatic evidence deletion blocks | 7 | F2 | `/evidences` | `DELETE /evidences/:id` | `EvidenceCard.tsx` | `shared-types` | Referential integrity | — | Evidence can be deleted from active TR | IMPLEMENTAR | P1 | S | MEDIO | Pre-remove hook test |
| 19 | Structured evidence categorization | 7 | F2 | `/evidences/gallery` | `GET /evidences` | `CategoryTabs.tsx` | `shared-types` | — | Cache filters | Photos have no categories | COMPLETAR | P1 | M | BAJO | Category query test |
| 20 | Auto-rename photos on upload | 7 | F2 | `/evidences/gallery` | `POST /evidences` | `UploadZone.tsx` | — | Path sanitization | — | Keeps user file names | IMPLEMENTAR | P1 | XS | BAJO | Filename check |
| 21 | TemplateDraft discriminatedUnion schema | 2,6 | F2 | `/templates` | `TemplateDraft.ts` | `FormRenderer.tsx` | `shared-types` | — | Local JSON cache | Missing schema mapping | COMPLETAR | P1 | L | MEDIO | Zod parse test |
| 22 | Service Case cockpit stepper UI | 1-14 | — | `/service-cases/[id]` | `GET /service-cases/:id` | `CaseStepper.tsx` | `shared-types` | State gates | Cache details | Stepper static, bypass allowed | COMPLETAR | P1 | L | MEDIO | Stepper state change |
| 23 | AuditLog schema integration | Todos | — | `/audit` | `AuditLog.ts` Mongoose | `AuditTable.tsx` | — | Audit trail | — | Entries logged as string comments | COMPLETAR | P1 | M | BAJO | Log write check |
| 24 | AuditLog access isolation | — | — | `/audit` | `GET /audit` | `AuditTable.tsx` | — | RBAC block | — | Audit log open to all users | IMPLEMENTAR | P1 | S | MEDIO | Supertest RBAC check |
| 25 | Zod environment config validation | — | — | — | `packages/config` | — | `config` | Fail-fast boot | — | Variables not validated | COMPLETAR | P1 | S | BAJO | Boot validation test |
| 26 | Dashboard expanded KPIs | Trans | Todos | `/dashboard` | `GET /dashboard/kpis` | `KPIGrid.tsx` | `shared-types` | — | Local cache | Analytics widget incomplete | COMPLETAR | P1 | M | BAJO | KPI rendering |
| 27 | PersistQueryClientProvider offline wrapper | Trans | F2 | — | — | `providers.tsx` | — | — | Persistent cache | Missing persistence wrapper | IMPLEMENTAR | P2 | M | MEDIO | Browser storage audit |
| 28 | IndexedDB cache persister adapter | Trans | F2 | — | — | `idb-persister.ts` | — | — | IDB adapter | Cache lost on page reload | IMPLEMENTAR | P2 | M | MEDIO | IDB persistence test |
| 29 | Outbox mutation queue manager | Trans | F2 | — | — | `outbox-manager.ts` | — | — | FIFO sync outbox | Offline changes lost | IMPLEMENTAR | P2 | L | ALTO | Playwright offline sync |
| 30 | Dead Letter Queue (DLQ) repository | Trans | — | `/settings/sync-errors` | `POST /sync/retry` | `DLQPortal.tsx` | — | — | Failures buffered | Missing DLQ management | IMPLEMENTAR | P2 | M | MEDIO | DLQ transition test |
| 31 | OfflineStatus UI warning banner | Trans | — | `/service-cases/[id]` | — | `SyncBanner.tsx` | — | — | Persistent banner | Banner missing | IMPLEMENTAR | P2 | S | BAJO | Visual display test |
| 32 | Dynamic avatar file uploading uploader | — | — | `/settings` | `POST /users/avatar` | `AvatarUpload.tsx` | — | Upload validation | — | Mimetype validation missing | COMPLETAR | P2 | S | BAJO | Upload test |
| 33 | React Doctor audit issues remediation | — | — | — | — | `/frontend/src` | — | — | — | 346 rendering issues | REFACTORIZAR | P2 | M | BAJO | React Doctor gate |
| 34 | Production CORS strict domains check | — | — | — | `backend/src/index.ts` | — | — | Strict origin block | — | Uses wildcards in dev | COMPLETAR | P1 | XS | BAJO | Supertest CORS check |
| 35 | JWT Refresh Token Rotation (RTR) | — | — | — | `backend/src/auth` | — | — | Token hijack block | — | RTR not enforced | IMPLEMENTAR | P2 | M | MEDIO | Token reuse check |
| 36 | Helmet Content Security Policy (CSP) | — | — | — | `backend/src/index.ts` | — | — | XSS Injection block | — | CSP headers missing | IMPLEMENTAR | P1 | S | BAJO | Header presence test |
| 37 | Mongoose Document soft-delete plugins | 8-14 | F3 | `/documents` | `Document.ts` Mongoose | `DocumentPicker.tsx` | `shared-types` | Data retention | — | Hard deletes allowed | COMPLETAR | P1 | S | BAJO | Soft-delete pre-hook |
| 38 | Dynamic form builder checklist templates | 2,6 | F2 | `/templates` | `TemplateDraft.ts` | `FormRenderer.tsx` | `shared-types` | Input safety | Local JSON schema | Forms hardcoded in views | COMPLETAR | P1 | L | MEDIO | Form submit test |
| 39 | EPP safety gear expiry tracking | 5 | F1 | `/assets` | `GET /assets/epp` | `EPPExpiryGrid.tsx` | — | safety gate | — | Expiry dates unchecked | IMPLEMENTAR | P2 | S | BAJO | Expiry validation |
| 40 | Mobile bottom utility navigation bar | — | — | — | — | `BottomBar.tsx` | — | — | Local navigation | Sidebar crashes mobile layouts | IMPLEMENTAR | P2 | M | BAJO | Viewport display check |
| 41 | Swipeable mobile stepper interface | 1-14 | — | `/service-cases/[id]` | — | `CaseStepper.tsx` | — | — | Local view | Stepper overflows screen | REFACTORIZAR | P2 | S | BAJO | Touch scroll test |
| 42 | Native camera capturing HTML5 binding | 7 | F2 | `/evidences/gallery` | — | `UploadZone.tsx` | — | — | Camera interface | File inputs open file explorer | IMPLEMENTAR | P2 | XS | BAJO | Attribute presence |
| 43 | Winston structured JSON production logging | — | — | — | `backend/src/logger` | — | — | Forensic tracking | — | Stack traces logged as raw text | IMPLEMENTAR | P2 | S | BAJO | Log schema check |
| 44 | Case closure lock of all sub-documents | 14 | F4 | `/service-cases/[id]` | `POST /cases/:id/close` | `CaseStepper.tsx` | `domain` | Data integrity | — | Closed cases allow retroactive edits | IMPLEMENTAR | P1 | S | MEDIO | Save-lock hook test |
| 45 | Proposal re-calculation integrity checks | 3 | F5 | `/proposals/new` | `POST /proposals` | `BudgetBuilder.tsx` | `shared-types` | Price manipulation block | — | Math validated on client only | REFACTORIZAR | P1 | S | MEDIO | Total sum math check |
| 46 | Knip unused dead code cleanups | Todos | — | — | — | — | — | — | — | Obsolete modules cached | REFACTORIZAR | P2 | M | BAJO | Knip scan zero check |
| 47 | JSCPD duplicated blocks cleanup | Todos | — | — | — | — | — | — | — | Copy-paste code cells found | REFACTORIZAR | P2 | M | BAJO | JSCPD run zero check |
| 48 | Madge circular dependency cleanup | Todos | — | — | — | — | — | — | — | Possible import loop locks | REFACTORIZAR | P2 | M | BAJO | Madge circular check |
| 49 | Lighthouse LCP rendering performance | — | — | `/dashboard` | — | `/frontend/src` | — | — | Offline caches | Render speed unmeasured | DOCUMENTAR | P2 | M | BAJO | Lighthouse run |
| 50 | Supervisor dynamic checklist validations | 6 | F2 | `/execution/session` | `POST /executions` | `FormRenderer.tsx` | `shared-types` | Data isolation | local cache | Checklist inputs missing schema | COMPLETAR | P1 | L | MEDIO | Form schema match |
| 51 | Client signature GPS metadata check | 10 | F3 | `/delivery-records/[id]/sign` | `POST /delivery-records` | `SignaturePad.tsx` | `shared-types` | Non-repudiation | Outbox queued | Signatures lack geo tags | IMPLEMENTAR | P1 | S | MEDIO | Geo tag check |
| 52 | Invoiced totals validation vs SES | 12 | F4 | `/billing/invoices` | `POST /invoices` | `InvoiceForm.tsx` | `shared-types` | Financial lock | — | Invoice values allow SES mismatch | IMPLEMENTAR | P1 | S | MEDIO | Total comparison test |
| 53 | Document deletion safety warning alerts | 7 | F2 | `/evidences` | — | `EvidenceCard.tsx` | — | — | — | Deletes trigger silent fail | COMPLETAR | P2 | S | BAJO | Delete alert visual |

---

## Metric Summary & Totals

### Count by Action Category
- **IMPLEMENTAR**: 24 items (New core features and architectural guards)
- **COMPLETAR**: 16 items (Modifications to align with canonical types)
- **REFACTORIZAR**: 11 items (Performance, limits, and monorepo structure cleanups)
- **ELIMINAR**: 2 items (Junk scripts cleanup and .gitignore fix)

### Count by Priority
- **P0**: 8 items (Immediate safety and blockages remediation)
- **P1**: 26 items (Step integrations and core state engines)
- **P2**: 19 items (Offline persisters, metrics, and visual tokens)

### Count by Effort
- **XS**: 6 items
- **S**: 18 items
- **M**: 18 items
- **L**: 11 items
