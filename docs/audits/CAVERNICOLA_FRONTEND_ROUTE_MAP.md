# CAVERNICOLA FRONTEND ROUTE MAP — Cermont S.A.S.

## 1. App Router Workspace Layout

All routes are defined under `frontend/src/app/` using Next.js 16 Route Groups:
*   `(auth)`: Landing, login, registration, password recovery.
*   `(dashboard)`: Operations center, billing, execution, resources.

```mermaid
flowchart TD
  subApp[frontend/src/app] --> RouteGroupAuth[(auth)]
  subApp --> RouteGroupDashboard[(dashboard)]
  
  RouteGroupAuth --> LoginRoute[/login]
  RouteGroupAuth --> ForgotPasswordRoute[/forgot-password]
  
  RouteGroupDashboard --> DashboardLayout[layout.tsx]
  DashboardLayout --> DashboardRoute[/dashboard]
  DashboardLayout --> DeliveryRecordsRoute[/delivery-records]
  DashboardLayout --> BillingRoute[/billing/*]
  DashboardLayout --> PaymentsRoute[/payments]
```

---

## 2. Dashboard Route Catalog

| Path | Page Component | Layout / Structure | Active Hook / Query | Search Params / Filters |
|------|----------------|--------------------|---------------------|--------------------------|
| `/` | `LandingPage` | Root public layout | None | None |
| `/login` | `LoginPage` | Standalone card layout | `useLogin` | None |
| `/dashboard` | `DashboardPage` | Sticky header + Left sidebar Drawer | `useDashboard` | None |
| `/delivery-records` | `DeliveryRecordsPageContent` | Header + Dynamic stats + `RecordsTable` | `useDeliveryRecordsList` | `workOrderId` (optional filter) |
| `/delivery-records/[id]` | `DeliveryRecordDetailPage` | Accordion, field cards, attachments | `useDeliveryRecord` | None (reads route parameter) |
| `/billing/ses` | `BillingSESPageContent` | Header + Dynamic stats + `RecordsTable` | `useServiceEntrySheetsList`| `workOrderId` (optional filter) |
| `/billing/invoices` | `BillingInvoicesPageContent`| Header + Dynamic stats + `RecordsTable` | `useInvoicesList` | `workOrderId` (optional filter) |
| `/payments` | `PaymentsPageContent` | Header + Dynamic stats + `RecordsTable` | `usePaymentsList` | `workOrderId` (optional filter) |
| `/reports` | `TechnicalReportsPage` | Table + PDF builder | `useReports` | None |
| `/site-visits` | `SiteVisitsPage` | Standalone technical visit overview | `useSiteVisitsList` | None |
| `/site-visits/new` | `NewSiteVisitPage` | Stacked label forms, photo attachments | `useCreateSiteVisit` | None |

---

## 3. Suspense & SearchParams Compliance

To comply with **Next.js 16.2.4 App Router** best practices, every page invoking `useSearchParams()` (including `/delivery-records`, `/billing/invoices`, `/billing/ses`, and `/payments`) **MUST** wrap its inner content in a `<Suspense>` boundary in the entrypoint component. This prevents server-side rendering bailout and client-side hydration mismatch.
