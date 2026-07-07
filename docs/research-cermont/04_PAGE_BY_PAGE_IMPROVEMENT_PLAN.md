# 04 — Page-by-Page Improvement Plan (33 Routes Target Design)

## Executive Summary

To deliver a premium FSM/CMMS experience for CERMONT S.A.S., we have compiled a detailed, page-by-page target specification covering **33 distinct App Router frontend routes**. 

Every route analyzed contains:
- **Core Purpose & Associated Flow Step**: Operative business value and target fallacies solved.
- **Current observed codebase state**: Gaps found in the physical directories.
- **Actions, KPIs, and Filters**: Explicit user interaction points.
- **Required UI States**: Loading, Empty, Error, Offline, and Forbidden.
- **Cross-Cutting Guardrails**: Mobile-First Tailwind rules, WCAG accessibility, and security guidelines.

---

## Sources & References

- **Canonical Repository Files**:
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` — Route registry.
  - `frontend/src/app/` — Live directory structure.
- **UIUX Guideline**:
  - `docs/design/CERMONT_UIUX_GUIDE.md` — Mintlify-style color palette (`#2154A6` blue, `#4CAF50` green) and typography.

---

## Comprehensive Page-by-Page Plan (33 Routes)

### 1. `/dashboard`
- **Purpose**: Executive control center showing active operations, safety indicators, and invoice progress. Solves Falla 5 (Cost $0 confusion) by presenting direct variance widgets.
- **Observed State**: `frontend/src/app/(dashboard)/page.tsx` exists. Uses generic cards without cost variance analysis or real-time workflow bottleneck alerts.
- **Actions & KPIs**: 
  - *KPIs*: Active cases, Blocked steps count, Outbound revenue (COP), Total budget variance %.
  - *Actions*: Refresh queries, Navigate to cockpit.
  - *Filters*: Date range, Client tenant.
- **UI States**: Spinner loader; empty state with a "No active cases" illustration; offline indicator banner.
- **Guardrails**: Mobile-first grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`), focus ring for keyboard navigation, tenant validation.
- **Acceptance Criteria**: Dashboard renders real-time counts from `/api/v1/dashboard/kpis` with zero hardcoded values.
- **Priority**: P0

### 2. `/service-cases`
- **Purpose**: Master listing of active contractor service cases.
- **Observed State**: Page exists. Simple table listing with plain columns.
- **Actions & KPIs**:
  - *Actions*: Create Case, Search Case by ID.
  - *Filters*: Current step (1-14), Assigned Engineer, Priority.
- **UI States**: Shimmer table loader; "No active cases matching filters" illustration.
- **Guardrails**: Flex layout wraps on mobile, strict column aria-labels, JWT cookie protection.
- **Acceptance Criteria**: Table paginates at 25 items using TanStack Query.
- **Priority**: P1

### 3. `/service-cases/[id]` (Cockpit) ⭐ CRITICAL
- **Purpose**: The absolute nerve center of the application. Displays the Case Cockpit with a visual 14-step stepper, a dynamic activity timeline, and contextual resource widgets.
- **Observed State**: Code uses a basic dashboard layout. Stepper is static and activity logging is absent.
- **Actions & KPIs**:
  - *Actions*: "Avanzar Paso" (triggers step transition, disabled with a tooltip explaining blockers if `canAdvance` is false).
  - *Widgets*: DocumentPicker, EvidenceGallery.
- **UI States**: Circular page skeleton; "Workflow Blocked" alert panel; offline fallback to IndexedDB cache.
- **Guardrails**: Stepper turns into a scrollable horizontal bar on mobile. Accessible tabs (`radix-ui` tabs) for details vs files.
- **Acceptance Criteria**: Advancing steps calls `PATCH /api/v1/service-cases/:id/advance` and dynamically updates the visual stepper without page reload.
- **Priority**: P0

### 4. `/work-requests`
- **Purpose**: List customer requests (Step 1).
- **Observed State**: Exists in App Router. Lacks structured status badges.
- **Actions**: Create new request, export to Excel.
- **UI States**: Shimmer card group; empty filter layout.
- **Guardrails**: Stacked layout on mobile. High-contrast colors for priority badges.
- **Acceptance Criteria**: Requests map to Step 1 backend state.
- **Priority**: P1

### 5. `/work-requests/new`
- **Purpose**: Creation form for Step 1.
- **Observed State**: Exists. Form fields are plain text inputs.
- **Actions**: Save as Draft, Submit formally.
- **UI States**: Form submitting spinner; error boundary on invalid field validation.
- **Guardrails**: Single-column vertical flow on mobile. Focus styles on inputs. Zod schema validation.
- **Acceptance Criteria**: Pressing "Submit" validates all required client fields and sends metadata to backend.
- **Priority**: P0

### 6. `/work-requests/[id]`
- **Purpose**: Detail view for Step 1 requests.
- **Observed State**: Standard detail page.
- **Actions**: Approve request, schedule site visit (Step 2).
- **UI States**: Loading skeleton; forbidden tenant error.
- **Guardrails**: Accessible PDF preview component if attachment exists.
- **Acceptance Criteria**: Restricts access if customer ID does not match current session ID (IDOR prevention).
- **Priority**: P0

### 7. `/site-visits`
- **Purpose**: List site visits (Step 2).
- **Observed State**: Exists, simple listing table.
- **Actions**: Schedule visit, assign technician.
- **UI States**: Calendar skeleton; zero visits alert.
- **Guardrails**: Screen-reader accessible dates.
- **Acceptance Criteria**: Syncs with technician availability query.
- **Priority**: P1

### 8. `/site-visits/new`
- **Purpose**: Form to schedule visits.
- **Observed State**: Exists, raw date pickers.
- **Actions**: Assign site, select date, choose technician.
- **UI States**: Validation errors; spinner.
- **Guardrails**: Native mobile date picker bindings.
- **Acceptance Criteria**: Restricts technician assignment if there is a scheduling conflict.
- **Priority**: P1

### 9. `/site-visits/[id]`
- **Purpose**: Detail and checklist submission.
- **Observed State**: Detail page.
- **Actions**: Start visit execution, view checklist.
- **UI States**: Detailed data skeleton; offline notification banner.
- **Guardrails**: Contrast ratios compliant with WCAG AA.
- **Acceptance Criteria**: Loads checklist structures from templates repository.
- **Priority**: P1

### 10. `/site-visits/[id]/checklist` ⭐ CRITICAL
- **Purpose**: Interactive mobile-friendly field checklist for Step 2.
- **Observed State**: Exists as a hardcoded static checklist component.
- **Actions**: Fill form inputs, capture and upload photos.
- **UI States**: Dynamic spinner; progress bar; local draft autosaved message.
- **Guardrails**: Large touch targets (min 44x44px). Offline-first persistence via IndexedDB outbox.
- **Acceptance Criteria**: Saves all draft selections locally if disconnected, syncing immediately on network recovery.
- **Priority**: P0

### 11. `/proposals`
- **Purpose**: Commercial Proposals summary (Step 3).
- **Observed State**: Exists, lists proposal items.
- **Actions**: Send to client, view revisions.
- **UI States**: Loading list skeleton.
- **Guardrails**: Mobile horizontal swipe cards for proposals list.
- **Acceptance Criteria**: Calls PDF rendering service.
- **Priority**: P1

### 12. `/proposals/new`
- **Purpose**: Interactive budget proposal builder (Step 3).
- **Observed State**: Page exists but lacks programmatic item builder (items must be typed manually without catalog auto-completion).
- **Actions**: Add line items, import site visit checklist elements, auto-calculate subtotal/tax/totals.
- **UI States**: Item calculations spinner.
- **Guardrails**: Client-side total calculations validate against Zod backend models.
- **Acceptance Criteria**: Budget forms recalculate math reactively when price is modified.
- **Priority**: P1

### 13. `/proposals/[id]`
- **Purpose**: Economic Proposal detail.
- **Observed State**: Detailed view.
- **Actions**: Accept economic terms, reject, upload PO.
- **UI States**: PDF render loader.
- **Guardrails**: High-contrast interactive buttons.
- **Acceptance Criteria**: Renders clean embedded PDF viewer.
- **Priority**: P1

### 14. `/purchase-orders`
- **Purpose**: Track uploaded PO documents (Step 4).
- **Observed State**: Simple page.
- **Actions**: Upload PO, match with proposal.
- **UI States**: Upload queue status indicators.
- **Guardrails**: Only authenticated billing roles can view details.
- **Acceptance Criteria**: PO state maps directly into Step 4 gates.
- **Priority**: P0

### 15. `/purchase-orders/upload`
- **Purpose**: File upload for purchase orders.
- **Observed State**: File input with no drag-and-drop support.
- **Actions**: Drag-and-drop PDF, type PO amount.
- **UI States**: Progress bar.
- **Guardrails**: Re-validates magic bytes on client side before sending file chunking.
- **Acceptance Criteria**: Blocks file upload if extension is `.png` but magic bytes represent `text/html`.
- **Priority**: P0

### 16. `/planning`
- **Purpose**: Operation planner panel (Step 5). Solves Falla 1 (Planning incomplete).
- **Observed State**: Exists, but lacks safety permit tracking, resource checkmarks, and EPP records.
- **Actions**: Assign tool kits, tool packets, safety equipment, review technician height certifications.
- **UI States**: Scheduling timeline loader.
- **Guardrails**: Full keyboard accessibility on scheduling calendar grid.
- **Acceptance Criteria**: Integrates a "Planning Packet Readiness Gate" checklist before authorization.
- **Priority**: P1

### 17. `/planning/[id]/readiness-gate` ⭐ CRITICAL
- **Purpose**: The readiness gate audit panel. Blocks the transition to Step 6 (Execution) unless all planning checklists are green.
- **Observed State**: Page does not exist. No readiness gate panel is available.
- **Actions**: Approve planning packet, log safety approvals, override blocker.
- **UI States**: "Blocked - certified EPP missing" alert banner.
- **Guardrails**: Readable color alerts (green for passed, red for blocked).
- **Acceptance Criteria**: Renders active indicators for Tool availability, Safety Permits, and Technician Certifications.
- **Priority**: P0

### 18. `/execution`
- **Purpose**: Active field service check-in (Step 6).
- **Observed State**: List of execution items.
- **Actions**: Active timer view, start check-in.
- **UI States**: Map loading.
- **Guardrails**: Highly touchable buttons (technician works with protective gloves).
- **Acceptance Criteria**: Pulls location details.
- **Priority**: P1

### 19. `/execution/session` ⭐ CRITICAL
- **Purpose**: Active execution session cockpit for onsite technicians.
- **Observed State**: Does not exist in the codebase.
- **Actions**: Check-out work, Pause session, log hourly progress, file incident report.
- **UI States**: Running timer (local state), offline synchronization banners.
- **Guardrails**: Massive touch-targets, dark-mode styling by default (reduces battery drain).
- **Acceptance Criteria**: Saves check-in GPS, active timer state, and checklist results strictly to local IndexedDB.
- **Priority**: P0

### 20. `/evidences`
- **Purpose**: Media repository (Step 7).
- **Observed State**: Simple photo listing.
- **Actions**: Delete photo (soft-delete), rename photo caption.
- **UI States**: Shimmer photo cells.
- **Guardrails**: Image grid wrapping for mobile screens.
- **Acceptance Criteria**: Media cards hide deletion options if photo is tagged as `usedInReport`.
- **Priority**: P1

### 21. `/evidences/gallery`
- **Purpose**: Structured evidence upload panel (Step 7). Solves Falla 2 (Evidencias desordenadas).
- **Observed State**: Exists, but has no before/during/after grouping or auto-rename structure.
- **Actions**: Upload multiple files, group by Category (Before/During/After), auto-generate filename.
- **UI States**: Upload progress overlay, drag-and-drop zone.
- **Guardrails**: Blocks upload if file lacks valid magic bytes.
- **Acceptance Criteria**: Renames photos to `serviceCaseId_category_timestamp.png`.
- **Priority**: P0

### 22. `/technical-reports`
- **Purpose**: View generated engineering reports (Step 8).
- **Observed State**: Standard document list.
- **Actions**: Generate report PDF, edit draft.
- **UI States**: PDF generation screen loader.
- **Guardrails**: Strictly restricted to engineering roles.
- **Acceptance Criteria**: Blocks editing if report is `APPROVED`.
- **Priority**: P1

### 23. `/technical-reports/[id]/edit` ⭐ CRITICAL
- **Purpose**: Interactive technical report builder (Step 8). Solves Falla 3 (Informes tardíos).
- **Observed State**: A simple form with a text area. Cannot dynamically import site checklists.
- **Actions**: Import check-in checklists, embed photos by ticking evidence checkmarks.
- **UI States**: Dynamic preview.
- **Guardrails**: Focus styles on text fields.
- **Acceptance Criteria**: Restricts uploader from deleting photos that are checked for inclusion in this report.
- **Priority**: P0

### 24. `/delivery-records`
- **Purpose**: Master registry of actas de entrega (Step 9).
- **Observed State**: Standard invoice-like listing.
- **Actions**: Detail view, print.
- **UI States**: Document loading.
- **Guardrails**: Clear labels.
- **Acceptance Criteria**: Requires technical report to be approved.
- **Priority**: P1

### 25. `/delivery-records/[id]/sign` ⭐ CRITICAL
- **Purpose**: Customer signature pad panel (Step 10). Solves Falla 3 (Actas tardías).
- **Observed State**: Simple page without canvas capture or legal validation.
- **Actions**: Draw signature on canvas, type signature metadata (Name, ID, Job Title), clear canvas.
- **UI States**: Capturing canvas loader, offline signature buffered warning.
- **Guardrails**: Blocks submission if canvas is empty. Restricts orientation to landscape if mobile screen.
- **Acceptance Criteria**: Saves canvas strokes as a Base64 string locally and attaches GPS metadata.
- **Priority**: P0

### 26. `/billing/ses`
- **Purpose**: SAP Ariba SES Number entry interface (Step 11).
- **Observed State**: Page exists. Simple text inputs.
- **Actions**: Log SES number, upload screenshot.
- **UI States**: Billing updates spinner.
- **Guardrails**: Standard table layout on desktop, list layout on mobile.
- **Acceptance Criteria**: Enforces verified DeliveryRecord signature before enabling SES submit.
- **Priority**: P1

### 27. `/billing/invoices`
- **Purpose**: Invoicing control panel (Step 12). Solves Falla 4 (Facturación tardía).
- **Observed State**: Exists. Simple table.
- **Actions**: Generate invoice document, check due date alerts.
- **UI States**: Overdue visual indicators.
- **Guardrails**: Restricts document visibility to administrative billing roles.
- **Acceptance Criteria**: Cross-checks total invoicing calculations with approved SES.
- **Priority**: P1

### 28. `/billing/invoices/[id]/approve`
- **Purpose**: Commercial invoice approval registry (Step 13).
- **Observed State**: Missing.
- **Actions**: Log approval date, input payment due dates.
- **UI States**: Spinner.
- **Guardrails**: Strict role check: Gerente (`GER`) or Administrativo (`ADM`).
- **Acceptance Criteria**: Status change updates payment schedule metrics.
- **Priority**: P1

### 29. `/payments`
- **Purpose**: Financial cash flows and case closing panel (Step 14).
- **Observed State**: Simple page.
- **Actions**: Log transaction, close case.
- **UI States**: Financial metrics skeleton.
- **Guardrails**: Strict administrative role enforcement.
- **Acceptance Criteria**: Advancing to `CLOSED` locks the service case.
- **Priority**: P1

### 30. `/costs` ⭐ CRITICAL
- **Purpose**: Budget variance analysis dashboard (Step 14 / Transversal). Solves Falla 5 (Costos con $0).
- **Observed State**: Missing. Does not exist in the codebase.
- **Actions**: Compare estimated costs vs real costs, review margin indicators.
- **UI States**: Cost variance chart (using `recharts`), colored indicators (green for positive margin, red for cost overrun).
- **Guardrails**: Only viewable by Gerente (`GER`) and Administrativo (`ADM`).
- **Acceptance Criteria**: Renders real-time variance table calculated from cost schema (without $0 placeholders).
- **Priority**: P0

### 31. `/templates`
- **Purpose**: Dynamic form builder template manager.
- **Observed State**: Simple page listing templates.
- **Actions**: Create new template, preview form.
- **UI States**: Dynamic preview loading.
- **Guardrails**: Standard grid layouts.
- **Acceptance Criteria**: Serves checklists for visits and executions.
- **Priority**: P1

### 32. `/assets`
- **Purpose**: Log company equipment, tool kits, and active certifications.
- **Observed State**: Raw table of assets.
- **Actions**: Register EPP, tool, or active certificate.
- **UI States**: Detail cards.
- **Guardrails**: Mobile-friendly search.
- **Acceptance Criteria**: Feeds data into planning kit selectors.
- **Priority**: P2

### 33. `/users`
- **Purpose**: User administration, roles assignments, and audit logs.
- **Observed State**: Generic profile settings.
- **Actions**: Modify role, view user audit logs.
- **UI States**: User profiles cards.
- **Guardrails**: Only accessible by Gerente (`GER`).
- **Acceptance Criteria**: Re-validates target session token permissions.
- **Priority**: P1

---

## Technical Gap Analysis & Recommendations

| Route | Primary Issue | Remediation | Impact |
|-------|---------------|-------------|--------|
| `/service-cases/[id]` | Hardcoded step transitions | Bind step stepper to backend workflow state. | Eliminates state mismatches |
| `/planning/[id]/readiness-gate` | Missing visual planning gate | Build a dedicated checklist component. | Prevents safety compliance bypass |
| `/execution/session` | Page missing | Implement fully mobile-first checklist capture. | Activates real fieldwork tracking |
| `/evidences/gallery` | File uploading has no type checks | Force MIME and magic bytes validation. | Closes file uploader vulnerability |
| `/delivery-records/[id]/sign` | No canvas signature pad | Integrate signature pad canvas element. | Enables digital customer sign-offs |
| `/costs` | Cost dashboard missing | Create CostVarianceTable visual widget. | Solves $0 cost confusion |

---

## Verification & Testing Plan

### Automated Tests
- **Frontend Page Renders (Vitest)**:
  - Run component testing to verify route layouts.
  ```bash
  npm run test -w frontend -- --grep "Renders Page"
  ```
- **Zod Resolvers (Vitest)**:
  - Verify validation behaviors in client forms.
  ```bash
  npm run test -w frontend -- --grep "Form Validation"
  ```

### Manual Verification
- Emulate the application inside Google Chrome DevTools:
  - Check that all input fields display clear focus rings when navigating via `Tab` key.
  - Verify that the layout shifts correctly into single-column lists on a simulated iPhone SE screen (320px).
  - Simulate network loss in DevTools and confirm that a persistent warning appears when editing a checklist draft.
