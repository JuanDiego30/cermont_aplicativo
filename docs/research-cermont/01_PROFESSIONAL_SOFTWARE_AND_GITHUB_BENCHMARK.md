# Phase 01 — Professional FSM/CMMS Software & GitHub Benchmark

## Executive Summary

This document benchmarks **18 professional software references** and **7 GitHub repositories** relevant to CERMONT's 14-step multi-service contractor workflow. The research covers full-suite commercial FSM/CMMS platforms (SAP, Dynamics 365, ServiceNow), mid-market tools (MaintainX, UpKeep, Fiix, Fracttal, Jobber, ServiceM8), open-source ERPs with field service modules (Odoo FSM, Odoo Maintenance, OCA Field Service, ERPNext Maintenance, openMAINT), and technical libraries for forms, offline, and persistence (ODK Collect, Form.io, JSON Forms, TanStack Query Persist, Workbox Background Sync).

**Key finding:** No single platform maps perfectly to CERMONT's 14-step flow. The winning approach is a composite architecture: ERPNext-style document state machine for the workflow backbone, OCA Field Service modular patterns for step-by-step extensions, Form.io/JSON Forms for dynamic forms, TanStack Query Persist + Workbox for offline, and openMAINT for asset registry patterns.

---

## 1. Commercial FSM/CMMS Platforms

### 1.1 SAP Field Service Management (SAP FSM)

| Attribute | Detail |
|---|---|
| **Type** | Commercial enterprise FSM (SaaS) |
| **Provider** | SAP SE |
| **Main modules** | AI-powered dispatching & scheduling, mobile app (iOS/Android/Windows), smart forms, time & material tracking, long-term planning, crowd service (external resources), analytics dashboard, integration with SAP S/4HANA |
| **Orders** | Service order creation from CRM or directly; structured order lifecycle with status tracking |
| **Planning** | AI-based resource scheduling with skills matching, travel time optimization, territory management |
| **Execution** | Mobile app with step-by-step guidance, checklists, smart forms for data capture |
| **Evidence** | Photo capture, signature capture, time logs, material logs — all attached to the service order |
| **Documents** | Smart forms (dynamic, configurable), attachment of manuals/schematics, PDF report generation |
| **Forms** | Smart Forms engine — drag-and-drop form builder for inspection checklists, customizable per order type |
| **Offline** | Full offline capability — all job info, forms, and feedback available without internet; sync when connected |
| **Approvals** | Approval workflows for schedules, overtime, expenses (via SAP workflow engine) |
| **Invoicing** | Integrated with SAP S/4HANA billing — time & materials automatically flow to invoice |
| **Cost handling** | Real-time tracking of labor hours, parts, travel costs per service order |
| **Adaptable pattern** | Smart forms engine for dynamic inspection templates; offline-first mobile architecture; AI scheduling optimization |
| **What NOT to copy** | High complexity, heavy on-premise dependency, expensive licensing, steep learning curve |
| **Link** | https://www.sap.com/products/field-service-management.html |
| **Priority** | Medium (patterns for forms & offline, not the platform) |

### 1.2 Microsoft Dynamics 365 Field Service

| Attribute | Detail |
|---|---|
| **Type** | Commercial enterprise FSM (SaaS) |
| **Provider** | Microsoft |
| **Main modules** | Work order management, scheduling (Universal Resource Scheduling), asset management, inventory, connected field service (IoT), Copilot AI assistant, mobile app, customer portal |
| **Orders** | Work orders with service tasks, customer info, assets, service history linked; multi-status workflow |
| **Planning** | Resource Scheduling Optimization (RSO) — AI-driven scheduling with travel time, skills, availability |
| **Execution** | Mobile app (Field Service Mobile) with step-by-step task execution, time capture, barcode scanning |
| **Evidence** | Photo capture, customer signature, IoT telemetry data, service notes — all recorded per work order |
| **Documents** | Attachments from SharePoint/OneDrive, customer equipment history, PDF service reports |
| **Forms** | Customizable forms via Power Apps — drag-and-drop form builder integrated with Dynamics; inspection forms |
| **Offline** | Mobile app has full offline sync — data cached locally, syncs when connected (uses mobile offline profiles) |
| **Approvals** | Power Automate workflows for approvals — booking changes, overtime, expenses |
| **Invoicing** | Integration with Dynamics 365 Finance & Operations for billing; time/material flows automatically |
| **Cost handling** | Cost tracking per work order — labor, parts, travel, expenses; budget vs actual reporting |
| **Adaptable pattern** | Power Apps approach for dynamic form creation by non-devs; offline sync profiles; IoT-connected field service triggers |
| **What NOT to copy** | Azure-heavy dependency, complex licensing, overkill for small-medium operations |
| **Link** | https://dynamics.microsoft.com/en-us/field-service/ |
| **Priority** | Medium (Power Apps form patterns, IoT triggers) |

### 1.3 ServiceNow Field Service Management

| Attribute | Detail |
|---|---|
| **Type** | Commercial enterprise FSM (SaaS) |
| **Provider** | ServiceNow |
| **Main modules** | Schedule optimization, dispatcher workspace, mobile agent app, territory management, appointment booking, SLA management, analytics dashboard |
| **Orders** | Work orders from incidents/requests — SLA-driven prioritization, escalation management |
| **Planning** | Schedule optimization with multi-objective algorithms (maximize SLA compliance, minimize penalties), agent relocation between territories, territory capacity analytics |
| **Execution** | Now Mobile Agent App — task execution, sales opportunity creation during service visits, real-time status updates |
| **Evidence** | Photo capture, notes, time logs — attached to work order; customer signature on mobile |
| **Documents** | Knowledge base articles attached to work orders, document templates, attachment management |
| **Forms** | ServiceNow Service Catalog + Custom UI Builder for dynamic forms; configurable field templates |
| **Offline** | Mobile app supports offline mode — data syncs when connectivity restored; limited compared to SAP/Dynamics |
| **Approvals** | Approval engine with configurable workflows — scheduled flows, condition-based routing |
| **Invoicing** | Integration with Finance/ERP modules via integration hub; not native invoicing |
| **Cost handling** | Labor cost, expense tracking per work order; utilization analytics |
| **Adaptable pattern** | SLA-driven work order prioritization; multi-objective scheduling optimization; territory capacity planning |
| **What NOT to copy** | Over-engineered for small operations, expensive, complex administration |
| **Link** | https://www.servicenow.com/products/field-service-management.html |
| **Priority** | Low (SLA patterns interesting but over-engineered for CERMONT scale) |

---

## 2. Mid-Market FSM/CMMS Tools

### 2.1 MaintainX

| Attribute | Detail |
|---|---|
| **Type** | Commercial CMMS/EAM (SaaS) |
| **Provider** | MaintainX Inc. |
| **Main modules** | Work order management, preventive maintenance, asset management, procedure & checklist management, team communication, reporting |
| **Orders** | Digital work order creation, submission, prioritization (color-coded), categorization; auto-recurring PM work orders |
| **Planning** | Calendar-based scheduling, PM scheduling triggered by time/usage/condition, drag-and-drop assignment |
| **Execution** | Mobile app — view work orders, update status, record notes, photos; procedure checklists guide step-by-step |
| **Evidence** | Photo capture, notes, status logs, digital forms — all recorded per work order |
| **Documents** | Attachment of manuals, schematics, scanned docs to work orders and assets; PDF export |
| **Forms** | Customizable work order templates with checklists and forms; procedure builder |
| **Offline** | Mobile app works offline — data syncs when connection restored (core CMMS functions available) |
| **Approvals** | Basic approval workflows for work order completion; limited compared to enterprise FSM |
| **Invoicing** | No native invoicing — integrates with QuickBooks, Xero for accounting |
| **Cost handling** | Track labor hours, parts costs per work order; limited cost analytics |
| **Adaptable pattern** | Simple work order lifecycle with state transitions; procedure checklist pattern for execution standardization |
| **What NOT to copy** | No native invoicing, limited offline capabilities, no dynamic forms engine |
| **Link** | https://www.getmaintainx.com/ |
| **Priority** | Medium (procedure checklists, work order lifecycle) |

### 2.2 UpKeep

| Attribute | Detail |
|---|---|
| **Type** | Commercial CMMS (SaaS) |
| **Provider** | UpKeep Inc. |
| **Main modules** | Work order management, preventive maintenance, asset management, inventory management, reporting, mobile app |
| **Orders** | Create, assign, complete work orders from mobile; push notifications on updates; color-coded priority |
| **Planning** | PM scheduling triggers (time/meter/IoT-based), drag-and-drop calendar, route optimization |
| **Execution** | Mobile-first — create WO on-the-go, update status, log time, add notes/photos; barcode scanning |
| **Evidence** | Photos, notes, attachments per WO; time logs; meter readings recorded |
| **Documents** | PDF reports, attachment storage, asset documentation linked to WO |
| **Forms** | Basic custom fields on work orders; no dynamic form builder |
| **Offline** | Mobile app has offline capability — create/update WOs offline, sync automatically |
| **Approvals** | Basic approval for PM requests and WO completion; limited workflow engine |
| **Invoicing** | No native invoicing — QuickBooks integration for billing |
| **Cost handling** | Labor cost tracking, parts cost per WO; basic reporting |
| **Adaptable pattern** | Mobile-first approach where field workers create WO from device; offline-first sync |
| **What NOT to copy** | No native invoicing, no dynamic form builder, limited offline depth |
| **Link** | https://www.upkeep.com/ |
| **Priority** | Medium (mobile-first approach, offline pattern) |

### 2.3 Fiix CMMS

| Attribute | Detail |
|---|---|
| **Type** | Commercial CMMS (SaaS) |
| **Provider** | Rockwell Automation (acquired Fiix) |
| **Main modules** | Work order management, preventive maintenance, asset management, inventory, purchasing, reporting, maintenance analytics |
| **Orders** | Work order creation with priority, category, asset, location; multi-step approval routing |
| **Planning** | Calendar scheduling, preventive maintenance triggers (calendar/meter/event), Gantt chart view |
| **Execution** | Mobile app — WO view, status updates, time logging, parts consumption; barcode scan |
| **Evidence** | Photo capture, notes, completion reports, meter readings per WO |
| **Documents** | Document management per asset — manuals, drawings, SOPs attached; PDF generation |
| **Forms** | Built-in form templates for inspections; limited custom form builder |
| **Offline** | Mobile app offline mode — limited to viewing and basic WO updates; sync on reconnect |
| **Approvals** | Multi-level approval workflows for WO, PO, purchasing requests |
| **Invoicing** | Purchase order integration; no native invoicing (syncs with ERP) |
| **Cost handling** | Parts, labor, and services costs per WO; budget tracking; cost analytics |
| **Adaptable pattern** | WO approval routing with multi-level workflow; asset cost tracking |
| **What NOT to copy** | No native invoicing, limited offline, form builder is basic |
| **Link** | https://www.fiixsoftware.com/ |
| **Priority** | Low (approval patterns redundant with ERPNext) |

### 2.4 Fracttal One

| Attribute | Detail |
|---|---|
| **Type** | Commercial CMMS (SaaS) |
| **Provider** | Fracttal |
| **Main modules** | Asset management, preventive & corrective maintenance, inventory, work orders, reporting, mobile app, IoT integration |
| **Orders** | WO creation from incident logging, assignment, priority-based routing, status tracking |
| **Planning** | Time/usage-based PM scheduling, calendar view, technician assignment with skills |
| **Execution** | Mobile app — WO execution with checklists, time tracking, parts consumption recording |
| **Evidence** | Photo capture, signatures, notes, completion confirmation per WO |
| **Documents** | Asset documentation, WO reports PDF, document repository per asset |
| **Forms** | Configurable checklists for maintenance procedures; no advanced dynamic form builder |
| **Offline** | Mobile app with offline sync — WO creation and completion offline |
| **Approvals** | Basic WO approval flows; limited workflow automation |
| **Invoicing** | Not native — QuickBooks, SAP integration for billing |
| **Cost handling** | Cost per WO (labor + parts), asset lifecycle cost analysis, budget vs actual |
| **Adaptable pattern** | IoT-triggered maintenance; asset hierarchical organization and lifecycle management |
| **What NOT to copy** | No native invoicing, limited offline, form capabilities basic |
| **Link** | https://www.fracttal.com/ |
| **Priority** | Low (IoT pattern not relevant for CERMONT immediately) |

### 2.5 Jobber

| Attribute | Detail |
|---|---|
| **Type** | Commercial FSM (SaaS) for home services |
| **Provider** | Jobber Technologies |
| **Main modules** | CRM, scheduling & dispatch, quoting & estimates, invoicing & payments, client management, reporting, mobile app |
| **Orders** | Job creation from request/quote converts to work order; status tracking (requested scheduled completed invoiced) |
| **Planning** | Drag-and-drop calendar scheduling, route optimization, automated reminders to clients |
| **Execution** | Mobile app — job details, time tracking, photo capture, status updates, client communication |
| **Evidence** | Photos, notes, time logs, client signatures — all per job |
| **Documents** | Quote/estimate PDFs, invoice PDFs, client communication history |
| **Forms** | Basic custom fields on jobs; no dynamic form builder |
| **Offline** | Mobile app with offline support — view jobs, capture data; syncs when connected |
| **Approvals** | Quote approval from client (via online portal); manager approval for discounts |
| **Invoicing** | Native invoicing with online payment (credit card, ACH); recurring invoices; QuickBooks/Xero sync |
| **Cost handling** | Job costing — track labor, materials, expenses per job; margin reporting |
| **Adaptable pattern** | Quote-Job-Invoice pipeline; client portal for approval; recurring billing |
| **What NOT to copy** | Home-services focused (not industrial); no asset management; limited offline depth |
| **Link** | https://getjobber.com/ |
| **Priority** | Medium (quote-to-invoice pipeline pattern, client approval portal) |

### 2.6 ServiceM8

| Attribute | Detail |
|---|---|
| **Type** | Commercial FSM (SaaS) for trade contractors |
| **Provider** | Eroldawn Pty Ltd |
| **Main modules** | Job management, scheduling, quoting, invoicing, client communication, asset management, forms, online booking |
| **Orders** | Job card creation from quote/request digital job card with tasks, staff, parts; status workflow |
| **Planning** | Calendar scheduling with drag-and-drop, staff location tracking, automated assignment |
| **Execution** | Mobile app — digital job cards with tasks, timers, parts log, notes, photos |
| **Evidence** | Photo capture per job, client signature capture, completion notes, time logs |
| **Documents** | Digital job cards (paperless), quote PDFs, invoice PDFs, form templates |
| **Forms** | Pre-built and custom form templates (digital forms for checklists, inspections) |
| **Offline** | Full offline capability — create jobs, log time, capture signatures offline; sync automatically |
| **Approvals** | Quote approval via client email link; basic internal approval; limited workflow |
| **Invoicing** | Native invoicing with payment processing (credit card, bank); QuickBooks/Xero/MYOB sync |
| **Cost handling** | Job costing per job (time + parts + expenses); basic cost tracking |
| **Adaptable pattern** | Digital job card as central document; offline-first approach; form templates for inspections |
| **What NOT to copy** | Small-team focus (max 20 staff); limited reporting; no asset lifecycle management |
| **Link** | https://www.servicem8.com/ |
| **Priority** | High (digital job card pattern, offline-first for field workers, form templates) |

---

## 3. Open-Source ERPs with FSM/Maintenance Modules

### 3.1 Odoo Field Service Management (Odoo FSM)

| Attribute | Detail |
|---|---|
| **Type** | Open-source / Commercial (Odoo Enterprise) |
| **Provider** | Odoo S.A. / Odoo Community |
| **Main modules** | Field Service orders, project management, planning/scheduling, timesheets, inventory, invoicing, vehicle management, mobile app |
| **Orders** | Field Service orders created from projects or directly; stages configurable per service type; orders link to products (parts, time, fixed fee) |
| **Planning** | Odoo Planning integration — drag-and-drop scheduling, Gantt chart, resource allocation, shift planning |
| **Execution** | Mobile app (Odoo Field Service) — view orders, log time, record materials, capture signatures, update stage |
| **Evidence** | Photo capture, customer signature, time logs, material consumption — all recorded on the order |
| **Documents** | Reports (PDF), worksheet templates, attachments per order (manuals, schematics) |
| **Forms** | Worksheet templates (customizable per project type), quality check forms; no dedicated dynamic form builder |
| **Offline** | Mobile app requires internet — no true offline mode in community edition; Enterprise has limited offline |
| **Approvals** | Odoo Approvals module — configurable approval workflows for purchase orders, expenses, timesheets |
| **Invoicing** | Native invoicing — time and materials from FS order flow to customer invoice automatically; integrated |
| **Cost handling** | Timesheets (labor cost), material costs (from inventory moves), expense tracking per order |
| **Adaptable pattern** | Stage-based order lifecycle (configurable pipeline); product-linked service templates; integrated inventory-invoicing flow |
| **What NOT to copy** | No community offline mode; worksheet templates are too rigid; mobile app limited |
| **Link** | https://www.odoo.com/app/field-service |
| **Priority** | Medium (stage pipeline pattern, product-service linking) |

### 3.2 Odoo Maintenance Module

| Attribute | Detail |
|---|---|
| **Type** | Open-source / Commercial (Odoo Enterprise) |
| **Provider** | Odoo S.A. |
| **Main modules** | Equipment management, preventive maintenance, corrective maintenance, maintenance requests, maintenance KPIs, maintenance reporting |
| **Orders** | Maintenance requests (from equipment dashboard or manual), work orders with priority, equipment linked, team assignment |
| **Planning** | Preventive maintenance schedules (time/usage-based), calendar view, KPIs dashboard for overdue tasks |
| **Execution** | Kanban board for maintenance stages, time tracking on tasks, material consumption from inventory |
| **Evidence** | Photos, notes on maintenance tasks, equipment history log, meter readings |
| **Documents** | Equipment documentation, maintenance procedures attached to equipment, PDF reporting |
| **Forms** | Basic custom fields on equipment and tasks; no dynamic form builder |
| **Offline** | No offline mode — requires internet for all operations |
| **Approvals** | Odoo Approvals — maintenance request approval, PO approval for parts |
| **Invoicing** | Maintenance costs flow to invoicing if billed to customer; internal maintenance is cost-center |
| **Cost handling** | Equipment cost history (all WO costs aggregated), maintenance budget, cost analytics |
| **Adaptable pattern** | Equipment-Requests-Orders-History lifecycle; preventive schedule triggers |
| **What NOT to copy** | No offline, no dynamic forms, no field-worker mobile focus |
| **Link** | https://www.odoo.com/app/maintenance |
| **Priority** | Low (basic equipment lifecycle pattern) |

### 3.3 OCA Field Service (Odoo Community Association)

| Attribute | Detail |
|---|---|
| **Type** | Open-source (AGPL-3.0) |
| **Provider** | OCA Community |
| **Stars** | 179 |
| **Main modules** | 20+ modules: fieldservice (core), fieldservice_account, fieldservice_activity, fieldservice_agreement, fieldservice_calendar, fieldservice_crm, fieldservice_distribution, fieldservice_equipment_stock, fieldservice_portal, fieldservice_project, fieldservice_recurring, fieldservice_sale, fieldservice_skill, fieldservice_stock, fieldservice_timesheet, fieldservice_vehicle, base_territory |
| **Orders** | FSM orders with locations, workers, stages; territory-based routing; agreements/contracts linked |
| **Planning** | Calendar integration, availability management (blackout days, stress days), skill-based assignment, route/distribution optimization |
| **Execution** | Timesheet tracking on orders, stock moves for materials, vehicle assignment |
| **Evidence** | Timesheets, stock consumption, notes per order; basic photo support |
| **Documents** | Sales orders and invoices linked (via fieldservice_account/fieldservice_sale), portal access |
| **Forms** | Basic data model per module; relies on Odoo views — no dynamic form builder |
| **Offline** | No offline (inherits Odoo web limitation) |
| **Approvals** | Agreement/contract approval, sale order approval; Odoo approval workflows |
| **Invoicing** | fieldservice_account tracks invoices, fieldservice_sale integrates sales orders invoicing flow |
| **Cost handling** | Timesheet-based labor cost, stock-based material cost, vehicle cost tracking |
| **Adaptable pattern** | Modular extension architecture (one module per feature); territory-agreement-order-invoice pipeline; skill matrix |
| **What NOT to copy** | No offline; heavy Odoo dependency; no dynamic forms; community support varies |
| **Link** | https://github.com/OCA/field-service |
| **Priority** | High (modular architecture, territory management, agreement-invoice pipeline) |

### 3.4 ERPNext Maintenance (Frappe/ERPNext)

| Attribute | Detail |
|---|---|
| **Type** | Open-source (GPL-3.0) |
| **Provider** | Frappe Technologies |
| **Stars** | 22,000+ (ERPNext) |
| **Main modules** | Assets, maintenance schedules, work orders, quality inspection, project management, purchase management, stock management, HR (for technicians) |
| **Orders** | Work order creation from maintenance schedule or manually; linked to asset; has status (draft pending in-progress completed cancelled) |
| **Planning** | Preventive maintenance schedule (time/usage-based), project task planning, Gantt chart view |
| **Execution** | Work order with assigned team, time logging, stock consumption, quality inspection checklist |
| **Evidence** | Quality inspection results, photos in notes/comments, work order completion data, asset history |
| **Documents** | Document management via Frappe File manager; PDF generation for work orders, invoices; attached manuals |
| **Forms** | Dynamic form builder via Frappes DocType system (form definition = data model); custom fields on any DocType; web forms for external submission |
| **Offline** | Frappe framework has no native offline mode; custom PWA implementation needed |
| **Approvals** | Frappe workflow engine — multi-step approval for work orders, purchase orders, expense claims; configurable state machines |
| **Invoicing** | Native Sales Invoice with time/material billing; integrated with project costing |
| **Cost handling** | Project-based costing — labor, materials, expenses per work order; budget vs. actual reporting |
| **Adaptable pattern** | DocType-as-form-definition (dynamic form = data model); workflow engine for state machines; project-WO-invoice pipeline; print formats for PDF generation |
| **What NOT to copy** | No offline mode; Python server stack different from CERMONT; monolithic framework |
| **Link** | https://erpnext.com/ | https://github.com/frappe/erpnext |
| **Priority** | High (DocType dynamic forms pattern, workflow engine state machine, project costing) |

### 3.5 openMAINT / CMDBuild

| Attribute | Detail |
|---|---|
| **Type** | Open-source CMMS (AGPL-3.0 / LGPL) |
| **Provider** | Tecnoteca Srl |
| **Main modules** | Real estate registry, movable assets, plant/equipment management, scheduled maintenance, corrective maintenance, inventory/logistics, GIS integration, BIM integration, contract management |
| **Orders** | Maintenance intervention orders from request planning execution closure; SLA-based priority |
| **Planning** | Preventive maintenance calendar, resource scheduling, budget planning |
| **Execution** | Web-based execution tracking; mobile app for field data collection (basic) |
| **Evidence** | Intervention reports, photo attachments, meter readings, notes per intervention |
| **Documents** | Document management integrated with CMDBuild (DMS); attachments to any record; PDF reports generation |
| **Forms** | CMDBuild class model defines forms dynamically (each class = data model = form); custom attributes per class; card-based UI |
| **Offline** | Mobile app (separate) has offline collection capability; web app requires internet |
| **Approvals** | Workflow engine (CMDBuild) — approval processes for interventions, purchases; configurable flows |
| **Invoicing** | Not native billing/invoicing — integration with external accounting software |
| **Cost handling** | Cost per intervention (labor + parts + services), asset cost history, budget management |
| **Adaptable pattern** | Class model = dynamic form definition; GIS+BIM integration for asset location; document management integrated per entity |
| **What NOT to copy** | Java-based stack; web UI is dated; no native invoicing; complex configuration |
| **Link** | https://www.openmaint.org/en |
| **Priority** | Medium (class-model-as-form pattern, asset hierarchy with GIS) |

---

## 4. Forms & Data Collection Libraries

### 4.1 ODK Collect (Open Data Kit)

| Attribute | Detail |
|---|---|
| **Type** | Open-source mobile data collection (Apache-2.0) |
| **Provider** | ODK Community |
| **Main modules** | ODK Collect (Android app), ODK Central (server), ODK Build/XLSForm (form designer) |
| **Orders** | Not a work order system — focused on survey/data collection |
| **Planning** | Pre-configured form assignments to field agents |
| **Execution** | Android app — fill forms with text, numeric, date, GPS, images, audio, barcode |
| **Evidence** | Photo, audio, video, GPS coordinates, signature capture — all embedded in submission |
| **Documents** | Form submissions stored on ODK Central; XML/CSV export; attachment storage |
| **Forms** | XLSForm — define forms in Excel XML for mobile; supports skip logic, validation, repeats, multimedia, calculations |
| **Offline** | Excellent offline — full offline form filling; queue submissions; auto-sync when connected; encrypted storage |
| **Approvals** | Not native — review workflow on ODK Central for submission approval |
| **Invoicing** | No invoicing — data collection only |
| **Cost handling** | No cost handling |
| **Adaptable pattern** | XLSForm-to-mobile pipeline; offline-first with encrypted pending queue; GPS/photo/signature capture pattern |
| **What NOT to copy** | Android-only; not a full workflow system; no work order lifecycle; no invoicing |
| **Link** | https://getodk.org/ |
| **Priority** | High (offline form pattern, XLSForm dynamic forms, GPS + photo + signature capture) |

### 4.2 Form.io

| Attribute | Detail |
|---|---|
| **Type** | Open-source / Commercial form server (MIT) |
| **Provider** | Form.io LLC |
| **Main modules** | Form builder (drag-and-drop), form renderer (JS SDK), submission API, role-based access, PDF generation, workflow engine |
| **Orders** | Not a work order system — form submissions driven |
| **Planning** | Not applicable |
| **Execution** | Form renderer embedded in any web app (React/Angular/Vue); renders JSON form definitions |
| **Evidence** | File uploads within forms (photos, documents); signature component; GPS location fields |
| **Documents** | PDF submission generation; file attachment storage per submission |
| **Forms** | Drag-and-drop form builder with 25+ field types (text, number, date, file, signature, GPS, HTML); JSON schema; conditional logic; validation; calculated values; custom components |
| **Offline** | Form.io JS SDK can cache form definitions; submissions queue when offline; limited compared to ODK |
| **Approvals** | Form.io workflow engine — multi-step approval flows on submissions; role-based action routing |
| **Invoicing** | Not native — can build invoice forms but no payment processing |
| **Cost handling** | Not native |
| **Adaptable pattern** | JSON-defined forms rendered via JS SDK in any web app; drag-and-drop form builder for non-devs; submission API with attachments |
| **What NOT to copy** | Backend dependency; no native offline-first; cost to scale (SaaS); no work order lifecycle |
| **Link** | https://www.form.io/ |
| **Priority** | High (JSON form definition, form builder UI, submission API with attachments) |

### 4.3 JSON Forms

| Attribute | Detail |
|---|---|
| **Type** | Open-source library (MIT) |
| **Provider** | Eclipse Foundation |
| **Main modules** | JSON Forms core, React/Angular/Vue renderers, material/vanilla ui packages |
| **Orders** | Not an order system — form rendering library |
| **Planning** | Not applicable |
| **Execution** | Renders forms from JSON Schema + UI Schema — forms embedded in React/Angular/Vue apps |
| **Evidence** | Custom renderers for photo/file upload (build as needed) |
| **Documents** | No native document handling — embedded in host app |
| **Forms** | JSON Schema + UI Schema — define data model (JSON Schema) and layout (UI Schema) separately; supports arrays, conditionals, validation, custom widgets, i18n |
| **Offline** | Library-level — host app handles offline persistence |
| **Approvals** | Not applicable |
| **Invoicing** | Not applicable |
| **Cost handling** | Not applicable |
| **Adaptable pattern** | JSON Schema as form contract render automatically; UI Schema for layout control; custom renderers for CERMONT-specific fields (signature, GPS, photo) |
| **What NOT to copy** | No server component; no submission management; no attachment storage; not a workflow system |
| **Link** | https://jsonforms.io/ |
| **Priority** | High (JSON Schema dynamic forms, UI Schema layout, customizable renderers) |

---

## 5. Offline & Persistence Libraries

### 5.1 TanStack Query Persist

| Attribute | Detail |
|---|---|
| **Type** | Open-source JavaScript library (MIT) |
| **Provider** | TanStack |
| **Main modules** | persistQueryClient, createSyncStoragePersister, createAsyncStoragePersister, PersistQueryClientProvider |
| **Orders** | Not applicable — cache persistence layer for TanStack Query |
| **Planning** | Not applicable |
| **Execution** | Not applicable |
| **Evidence** | Not applicable |
| **Documents** | Not applicable |
| **Forms** | Not applicable |
| **Offline** | Core offline enabler: persisted query cache to localStorage/IndexedDB/AsyncStorage; maxAge controls cache freshness; buster for cache invalidation; automatic hydration on app start |
| **Approvals** | Not applicable |
| **Invoicing** | Not applicable |
| **Cost handling** | Not applicable |
| **Adaptable pattern** | Persist query state app works offline with cached data; persist mutation queue pending writes sync on reconnect; staleTime + gcTime for cache control |
| **What NOT to copy** | Over-relying on stale cache without invalidation strategy; not a replacement for proper offline sync |
| **Link** | https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient |
| **Priority** | High (offline data persistence for the entire app) |

### 5.2 Workbox Background Sync

| Attribute | Detail |
|---|---|
| **Type** | Open-source JavaScript library (MIT) |
| **Provider** | Google Chrome Team |
| **Main modules** | backgroundSync plugin, BroadcastUpdate plugin, service worker routing, cache strategies |
| **Orders** | Not applicable — service worker background sync |
| **Planning** | Not applicable |
| **Execution** | Not applicable |
| **Evidence** | Not applicable |
| **Documents** | Not applicable |
| **Forms** | Not applicable |
| **Offline** | Offline mutation sync: queue failed POST/PUT/DELETE requests when offline; replay them in order when connectivity returns; periodic sync (periodic background sync API); IndexedDB-backed queue |
| **Approvals** | Not applicable |
| **Invoicing** | Not applicable |
| **Cost handling** | Not applicable |
| **Adaptable pattern** | Queue offline form submissions replay when online; background sync for evidence uploads; combined with TanStack Query Persist for full offline support |
| **What NOT to copy** | Browser-dependent (needs service worker); limited Safari/iOS support for periodic sync; not a replacement for proper optimistic updates |
| **Link** | https://developer.chrome.com/docs/workbox/modules/workbox-background-sync |
| **Priority** | High (offline mutation queue for forms, evidence uploads) |

---

## 6. GitHub Repository Investigation

### 6.1 OCA/field-service

| Attribute | Detail |
|---|---|
| **Stars** | 179 |
| **Language** | Python (Odoo modules) |
| **Link** | https://github.com/OCA/field-service |
| **Key features** | 20+ modular addons for FSM: territory management, skill-based assignment, agreements & contracts, recurring service, stock integration, timesheet tracking, vehicle management, calendar integration, CRM integration, sale-to-service pipeline, equipment warranty, portal access |
| **Relevance to CERMONT** | Very high — the modular addon architecture maps directly to CERMONT's 14-step flow. Patterns for: territory-agreement-sale-service-invoice pipeline; stage-based order lifecycle; skill matrix for technician assignment |
| **What to adapt** | Modular each-feature-is-a-module approach; agreement-invoice contract flow; territory hierarchy |
| **What to skip** | Odoo-specific ORM; Python stack; web client limitations |

### 6.2 Frappe/ERPNext

| Attribute | Detail |
|---|---|
| **Stars** | 22,000+ |
| **Language** | Python (Frappe Framework), JavaScript, Vue.js (Frappe UI) |
| **Link** | https://github.com/frappe/erpnext |
| **Key features** | Full ERP with maintenance, projects, HR, stock, accounting modules; Frappe DocType system (data-model-as-code); workflow engine (state machine with transitions, conditions, approvals); print formats (PDF generation); role-based permissions; REST API |
| **Relevance to CERMONT** | Very high — DocType system is a dynamic form pattern (define data model = form definition); workflow engine supports multi-step approval state machines matching CERMONT 14-step flow; print formats for document/report generation |
| **What to adapt** | DocType-as-dynamic-schema pattern; workflow engine state machine; print format templates |
| **What to skip** | Python server; Frappe full-stack framework; Vue.js frontend |

### 6.3 jingz/CMMS

| Attribute | Detail |
|---|---|
| **Stars** | 94 |
| **Language** | Ruby (Rails) |
| **Link** | https://github.com/jingz/CMMS |
| **Key features** | Equipment management (hierarchy, cost, CAD/schematics links), work orders (with cost tracking, priority), inventory, purchasing, preventive maintenance scheduling, labor management, meter reading triggers, safety procedures |
| **Relevance to CERMONT** | Low — classic CMMS with equipment focus, not field service workflow. However, its equipment-WO-cost model and procedure attachment pattern are useful for CERMONT's asset registry |
| **What to adapt** | Equipment cost aggregation from WOs; procedure/document linking per asset |
| **What to skip** | Ruby on Rails stack; equipment-heavy focus |

### 6.4 pourya-azad/Cmms

| Attribute | Detail |
|---|---|
| **Stars** | 0 |
| **Language** | C# (ASP.NET MVC) |
| **Link** | https://github.com/pourya-azad/Cmms |
| **Key features** | Work order management, asset management, manager dashboard (statistics), engineer panel (assigned tasks), checklists for repair steps, JWT authentication, role-based access (manager/engineer), work history |
| **Relevance to CERMONT** | Low — basic CMMS with manager/engineer roles. Role-based dashboard pattern is relevant for CERMONT's multi-role access |
| **What to adapt** | Role-based panel separation (manager vs. field worker); checklist templates for execution |
| **What to skip** | .NET Framework 4.8 stack; basic feature set |

### 6.5 marcburnie/CMMS

| Attribute | Detail |
|---|---|
| **Stars** | 42 |
| **Language** | JavaScript (Node.js, Express, MongoDB, EJS) |
| **Link** | https://github.com/marcburnie/CMMS |
| **Key features** | Asset management, work orders, preventive maintenance, MongoDB-based data storage, Express REST API, EJS templating |
| **Relevance to CERMONT** | Low — basic MEAN-stack CMMS. Stack relevance (Node.js + MongoDB) matches CERMONT's tech stack, making architectural patterns more transferable |
| **What to adapt** | Express + MongoDB data model patterns; REST API structure |
| **What to skip** | EJS templating (CERMONT uses React); basic feature set |

### 6.6 Odoo/odoo

| Attribute | Detail |
|---|---|
| **Stars** | 42,600+ |
| **Language** | Python, JavaScript |
| **Link** | https://github.com/odoo/odoo |
| **Key features** | Full ERP with 30+ main modules (CRM, sales, inventory, manufacturing, accounting, HR, project, field service, maintenance); modular architecture; REST API; web framework; ORM; workflow engine; report engine (QWeb) |
| **Relevance to CERMONT** | Medium — the massive scale is not directly transferable, but the modular design (each business function as independent module) and the stage-based pipeline patterns (opportunity-quotation-sale-invoice) inform CERMONT architecture |
| **What to adapt** | Stage-based pipeline pattern (draft-confirmed-done-cancelled); module separation boundaries |
| **What to skip** | Python + PostgreSQL stack; monolithic architecture; Odoo-specific ORM |

### 6.7 openMAINT / CMDBuild

| Attribute | Detail |
|---|---|
| **Stars** | ~200 (CMDBuild) |
| **Language** | Java (Spring, Ajax, SOA), PostgreSQL |
| **Link** | https://github.com/tecnoteca/CMDBuild |
| **Key features** | Asset/equipment registry with hierarchy, GIS/BIM integration, configurable class model (define data schema automatic CRUD forms), workflow engine, document management, permission system, reporting (JasperReports) |
| **Relevance to CERMONT** | Medium — class-model-as-dynamic-form pattern is powerful (create data model = get forms automatically). GIS/BIM integration is relevant for location-aware field service. Workflow engine for multi-step processes |
| **What to adapt** | Class-model-driven form generation; integrated GIS for asset location |
| **What to skip** | Java + Spring stack; JasperReports; SOAP legacy |

---

## 7. Comparative Analysis

### 7.1 Coverage of CERMONT 14-Step Flow

| Step | Best Pattern Reference | Adaptable From |
|---|---|---|
| 1. Work request | Service request WO conversion | Jobber, ServiceNow, ERPNext |
| 2. Site visit | Scheduling + dispatch + route optimization | SAP FSM, Dynamics 365 FSM |
| 3. Proposal | Quote/Estimate generation client approval | Jobber, ServiceM8, Odoo FSM |
| 4. PO approval | Multi-level approval workflow | ERPNext workflow engine, ServiceNow |
| 5. Planning | Resource scheduling, skill assignment, calendar | SAP FSM, OCA fieldservice_skill |
| 6. Execution | Digital job card, checklists, timer | ServiceM8, MaintainX procedures |
| 7. Evidence | Photo, signature, GPS, time logs | ODK Collect, ServiceM8 |
| 8. Technical report | PDF generation from form data | Form.io, ERPNext print formats |
| 9. Delivery record | Digital handover with signature | ServiceM8, ODK Collect |
| 10. Client signature | Signature capture on mobile | ODK Collect, Form.io signature |
| 11. SES / Ariba | External system integration | SAP integration patterns |
| 12. Invoice | Time + materials invoice | Odoo FSM, Jobber, ServiceM8 |
| 13. Invoice approval | Multi-step approval workflow | ERPNext workflow, ServiceNow |
| 14. Payment | Online payment + reconciliation | Jobber payments, ServiceM8 payments |

### 7.2 Technology Stack Compatibility

| Platform | Backend | Frontend | Database | Mobile | License |
|---|---|---|---|---|---|
| SAP FSM | Cloud | Web + Native | SAP HANA | iOS/Android/Windows | Commercial |
| Dynamics 365 FSM | Azure/.NET | Web | Azure SQL | iOS/Android | Commercial |
| ServiceNow | Cloud (Java) | Web | MySQL | iOS/Android | Commercial |
| MaintainX | Cloud | Web | Cloud | iOS/Android | Commercial |
| Odoo FSM | Python | JS (OWL) | PostgreSQL | iOS/Android | LGPL/Commercial |
| ERPNext | Python (Frappe) | Vue.js (Frappe UI) | MariaDB | iOS/Android | GPL-3.0 |
| openMAINT | Java (Spring) | JS + Ajax | PostgreSQL | Android | AGPL-3.0 |
| CERMONT (target) | Node.js (Express) | React/Next.js | MongoDB | PWA (Web) | |

### 7.3 Key Architectural Recommendations for CERMONT

1. **Dynamic Forms**: Use JSON Forms (JSON Schema + UI Schema) for form definition, stored in MongoDB, rendered by React. This matches the Frappe DocType pattern without the Python stack.

2. **Offline-First**: Combine TanStack Query Persist (data cache persistence) + Workbox Background Sync (mutation queue) for full offline support. Model after ODK Collect's offline submission queue.

3. **Workflow State Machine**: Use a state machine pattern (XState or custom) for the 14-step flow, inspired by ERPNext's workflow engine. Each step is a state with allowed transitions, conditions, and role-based actions.

4. **Modular Architecture**: Each of the 14 steps as an independent module, modeled after OCA field-service addons. Step 1 (request) doesn't depend on step 14 (payment), but they connect through a shared order document.

5. **Document-Centric Design**: The work order / service order is the central document that accumulates data as it flows through steps. Modeled after ServiceM8's digital job card.

6. **Evidence Collection Bundle**: Photo + GPS + signature + timestamp bundled per step, modeled after ODK Collect's submission format.

7. **Separate Form Definition from Form Data**: JSON Schema defines the form (stored in a Forms collection), actual responses in the Order document. This allows dynamic form changes without data migration.

---

## 8. Summary Matrix

| # | Software | Type | Offline | Forms | Evidence | Approvals | Invoicing | Cost | Priority |
|---|---|---|---|---|---|---|---|---|---|
| 1 | SAP FSM | Commercial Enterprise | Full | Smart Forms | Full | Full | Native | Full | Medium |
| 2 | Dynamics 365 FSM | Commercial Enterprise | Full | Power Apps | Full | Power Automate | Native | Full | Medium |
| 3 | ServiceNow FSM | Commercial Enterprise | Limited | UI Builder | Full | Full | External | Full | Low |
| 4 | MaintainX | Commercial SMB | Yes | Basic | Photos | Basic | External | Basic | Medium |
| 5 | UpKeep | Commercial SMB | Yes | Custom fields | Photos | Basic | External | Basic | Medium |
| 6 | Fiix CMMS | Commercial SMB | Limited | Templates | Photos | Multi-level | External | Good | Low |
| 7 | Fracttal One | Commercial SMB | Yes | Checklists | Photos | Basic | External | Good | Low |
| 8 | Jobber | Commercial FSM | Yes | Custom fields | Photos | Quote approval | Native | Job costing | Medium |
| 9 | ServiceM8 | Commercial FSM | Full | Templates | Full | Basic | Native | Basic | High |
| 10 | Odoo FSM | Open Source | No | Worksheets | Basic | Approvals | Native | Good | Medium |
| 11 | Odoo Maintenance | Open Source | No | Basic | Basic | Approvals | Internal | Good | Low |
| 12 | OCA Field Service | Open Source | No | Odoo views | Basic | Workflows | Linked | Good | High |
| 13 | ERPNext Maintenance | Open Source | No | DocType | Basic | Workflow engine | Native | Full | High |
| 14 | openMAINT | Open Source | Limited | Class model | Basic | Workflow | External | Good | Medium |
| 15 | ODK Collect | Open Source Library | Excellent | XLSForm | Full | Review | N/A | N/A | High |
| 16 | Form.io | Open Source Library | Limited | Excellent | Uploads | Workflow | N/A | N/A | High |
| 17 | JSON Forms | Open Source Library | Library | Excellent | Custom | N/A | N/A | N/A | High |
| 18 | TanStack Query Persist | Open Source Library | Excellent | N/A | N/A | N/A | N/A | N/A | High |
| 19 | Workbox Background Sync | Open Source Library | Excellent | N/A | N/A | N/A | N/A | N/A | High |

---

## 9. GitHub Repos Summary

| Repo | Stars | Language | Key Pattern for CERMONT | Relevance |
|---|---|---|---|---|
| OCA/field-service | 179 | Python | Modular FSM addon architecture; territory-agreement-invoice pipeline | Very High |
| frappe/erpnext | 22,000+ | Python/Vue | DocType dynamic form; workflow engine state machine; print format PDF | Very High |
| odoo/odoo | 42,600+ | Python/JS | Stage-based pipeline; module boundaries | Medium |
| tecnoteca/CMDBuild | ~200 | Java | Class-model dynamic forms; GIS integration; document management | Medium |
| jingz/CMMS | 94 | Ruby/Rails | Equipment-WO-Cost lifecycle; procedure attachment per asset | Low |
| pourya-azad/Cmms | 0 | C#/.NET | Role-based panel separation (manager vs worker) | Low |
| marcburnie/CMMS | 42 | Node.js/Express/MongoDB | Express + MongoDB data model (matches CERMONT stack) | Low |
