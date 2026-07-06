# External Research Benchmark — CERMONT S.A.S.

**Fecha:** 2026-07-05
**Spec:** 017 — Auditoría Integral, Investigación y Plan de Innovación
**Propósito:** Benchmark de plataformas FSM/CMMS, repositorios GitHub de referencia técnica, y tendencias de innovación 2026.

---

## 1. Plataformas FSM/CMMS Comerciales

### 1.1 UpKeep

| Atributo | Detalle |
|----------|---------|
| **Sitio** | https://upkeep.com |
| **Fortaleza clave** | Mobile-first CMMS con Nova AI (asistente IA), offline mode nativo, work orders con checklists, fotos, firmas |
| **Modelo precio** | Desde $24/usuario/mes |
| **Usuarios** | 4,000+ empresas |
| **Patrones aplicables** | Work order mobile-first, AI work order generation, offline sync, QR code scanning |
| **Módulo CERMONT beneficiado** | execution, evidence, planning-packet |
| **Esfuerzo estimado** | 4-6 meses para feature parity parcial |

### 1.2 Fiix (Rockwell Automation)

| Atributo | Detalle |
|----------|---------|
| **Sitio** | https://fiixsoftware.com |
| **Fortaleza clave** | CMMS cloud con nested PM scheduling, QR scanning, API flexible, interfaz limpia y fácil onboarding |
| **Modelo precio** | Desde $40/usuario/mes (no público) |
| **Patrones aplicables** | Nested PM schedules, QR asset tags, work order templates |
| **Módulo CERMONT beneficiado** | maintenance, checklists, resources/kit |
| **Esfuerzo estimado** | 3-5 meses |

### 1.3 eMaint

| Atributo | Detalle |
|----------|---------|
| **Sitio** | https://emaint.com |
| **Fortaleza clave** | Customización profunda, compliance tools (FDA, OSHA), predictive maintenance con sensores, planos interactivos |
| **Modelo precio** | Desde $69/usuario/mes |
| **Patrones aplicables** | Compliance hub, predictive maintenance triggers, reusable work order templates, interactive floor plans |
| **Módulo CERMONT beneficiado** | maintenance, safety, asset |
| **Esfuerzo estimado** | 5-8 meses |

### 1.4 Maintenance Connection (Accruent)

| Atributo | Detalle |
|----------|---------|
| **Sitio** | https://www.accruent.com/cmms/maintenance-connection |
| **Fortaleza clave** | Multi-site facilities management, deep customization, asset auto-classification en PM schedules |
| **Modelo precio** | Desde $110/usuario/mes |
| **Patrones aplicables** | Auto-classification de assets, work order builder con task headers, cost estimates integrados |
| **Módulo CERMONT beneficiado** | orders, costs, fleet |
| **Esfuerzo estimado** | 4-6 meses |

### 1.5 ServiceTitan

| Atributo | Detalle |
|----------|---------|
| **Sitio** | https://servicetitan.com |
| **Fortaleza clave** | FSM enterprise para HVAC/plumbing/electrical: dispatch board con routing optimization, skills matching, capacity planning, pricebook integrado, BI reporting, marketing attribution |
| **Modelo precio** | ~$200-400/usuario/mes |
| **Patrones aplicables** | Dispatch optimization, skills-based assignment, pricebook (flat-rate), KPI dashboards por técnico |
| **Módulo CERMONT beneficiado** | order/dispatch, costs/proposals, reports |
| **Esfuerzo estimado** | 8-12 meses (enterprise-grade) |

### 1.6 Jobber

| Atributo | Detalle |
|----------|---------|
| **Sitio** | https://getjobber.com |
| **Fortaleza clave** | FSM para pequeñas empresas: scheduling, quoting, invoicing, client hub, QuickBooks sync, mobile app |
| **Modelo precio** | Desde $29/mes (individual) |
| **Patrones aplicables** | Client hub (portal cliente), quoting-to-invoice pipeline, mobile forms offline, QuickBooks integration |
| **Módulo CERMONT beneficiado** | proposals, invoices, portal-cliente |
| **Esfuerzo estimado** | 2-4 meses |

### 1.7 Salesforce Field Service

| Atributo | Detalle |
|----------|---------|
| **Sitio** | https://www.salesforce.com/field-service/ |
| **Fortaleza clave** | CRM + FSM integrado: Einstein Routing (AI scheduling), dispatcher console, mobile offline, Asset 360, omnichannel |
| **Modelo precio** | Desde $200/usuario/mes + edición Service Cloud |
| **Patrones aplicables** | Einstein AI routing, dispatcher console, asset 360, Visual Remote Assistant, territory management |
| **Módulo CERMONT beneficiado** | order/dispatch, asset, portal-cliente |
| **Esfuerzo estimado** | 6-12 meses |

### 1.8 ServiceNow FSM

| Atributo | Detalle |
|----------|---------|
| **Sitio** | https://www.servicenow.com/products/field-service-management.html |
| **Fortaleza clave** | ITSM + FSM integrado: Workforce Optimization, reglas de scheduling, multi-lingual/multi-currency, compliance |
| **Modelo precio** | Quote-based (enterprise) |
| **Patrones aplicables** | Workforce optimization rules engine, unified platform approach, compliance tracking, AI Now Assist |
| **Módulo CERMONT beneficiado** | dispatch, reports, observability |
| **Esfuerzo estimado** | 8-12 meses |

### 1.9 IBM Maximo Application Suite

| Atributo | Detalle |
|----------|---------|
| **Sitio** | https://www.ibm.com/products/maximo |
| **Fortaleza clave** | EAM enterprise: asset lifecycle completo, work order management maduro, predictive maintenance (watsonx AI), IoT/Health, maximo mobile, barcode/RFID |
| **Modelo precio** | AppPoints licensing (enterprise, ~$80K+/año implementación) |
| **Patrones aplicables** | Asset lifecycle (procurement→decommission), AI anomaly detection, job plans con labor/material/tool, permit-to-work |
| **Módulo CERMONT beneficiado** | asset, maintenance, order, planning-packet |
| **Esfuerzo estimado** | 12-18 meses (enterprise, no aplica directo para CERMONT) |

### 1.10 ServiceMax (Industrial)

| Atributo | Detalle |
|----------|---------|
| **Sitio** | https://www.servicemax.com |
| **Fortaleza clave** | Asset-centric FSM para industrias: field service lifecycle, parts management, mobile-first, IoT integration |
| **Modelo precio** | Enterprise quote-based |
| **Patrones aplicables** | Asset-centric field service, parts/inventory integration, mobile workflows |
| **Módulo CERMONT beneficiado** | asset, inventory, execution |
| **Esfuerzo estimado** | 6-10 meses |

### 1.11 Quickbase + FastField

| Atributo | Detalle |
|----------|---------|
| **Sitio** | https://www.quickbase.com |
| **Fortaleza clave** | Low-code platform + field capture (FastField): construcción rápida de apps, custom workflows, integración ERP/CRM, compliance |
| **Modelo precio** | Enterprise quote-based |
| **Patrones aplicables** | Low-code custom app builder, field capture offline, compliance monitoring, real-time dashboards, Project Hub |
| **Módulo CERMONT beneficiado** | Todos (como plataforma subyacente) |
| **Esfuerzo estimado** | 2-4 meses (para features específicas) |

---

## 2. Repositorios GitHub de Referencia Técnica

### 2.1 CMMS / Maintenance Management

| Repo | Stars | Stack | Patrón Aplicable |
|------|-------|-------|------------------|
| [Grashjs/cmms](https://github.com/Grashjs/cmms) | — | Self-hosted CMMS | Arquitectura self-hosted, Docker |
| [syeedalireza/cmms](https://github.com/syeedalireza/cmms) | 0 | Symfony 7 + React 18 + PostgreSQL | DDD, CQRS, clean architecture (no aplica stack CERMONT pero patrón reusable) |
| [Subhamsojitra/GearGuard](https://github.com/Subhamsojitra/GearGuard-Smart-Maintenance-System) | 1 | React + TypeScript + Supabase | Kanban, calendar PM, equipment management |
| [Yug6584/Maintenix](https://github.com/Yug6584/Maintenix) | 1 | MERN (MongoDB, Express, React, Node) | Stack similar a CERMONT, AI-powered maintenance, RBAC |
| [ZeroZenx/COSTAATT-Advanced-CMMS](https://github.com/ZeroZenx/COSTAATT-Advanced-CMMS) | 1 | React + TypeScript + Prisma + MySQL | PWA, QR scanning, GPS, Recharts, React Query, AI predictive |

### 2.2 Field Service / Dispatch

| Repo | Stars | Stack | Patrón Aplicable |
|------|-------|-------|------------------|
| [sys-ae/fieldopt](https://github.com/sys-ae/fieldopt) | 3 | React + FastAPI + PostgreSQL | **Dispatch console enterprise**: AG Grid drag-drop, map, timeline, skills matching, routing optimization, WebSocket, mobile responsive |
| [Nevad54/app2-field-service-suite](https://github.com/Nevad54/app2-field-service-suite) | — | React 18 + Node.js + Supabase | Full FSM: dispatch, maintenance, quotes, invoices, inventory, RBAC, customer portal |
| [clawnify/open-fieldservice](https://github.com/clawnify/open-fieldservice) | — | Preact + Hono + SQLite | Open-source ServiceTitan alternative: job scheduling, dispatch, invoices, zero cloud deps |
| [solvice/scheduler-plugin](https://github.com/solvice/scheduler-plugin) | — | React/Next.js + MapLibre GL | Scheduler frontend views: Gantt timeline, drag-drop dispatch, constraint visualization, KPI dashboard |

### 2.3 Calendar / Scheduling

| Repo | Stars | Stack | Patrón Aplicable |
|------|-------|-------|------------------|
| [WorksCalendar/CalendarThatWorks](https://github.com/WorksCalendar/CalendarThatWorks) | — | React | Embebed scheduling engine: conflict engine, approval workflow DSL, resource pools, dispatch readiness board, agenda/schedule/timeline views |

### 2.4 Signature Capture

| Repo | Stars | Stack | Patrón Aplicable |
|------|-------|-------|------------------|
| [tim-rayner/react-esign](https://github.com/tim-rayner/react-esign) | 5 | React (zero-dependency) | Componente de firma digital: canvas-based, touch/mouse, clear/download, TypeScript |
| [melihbirim/signature-pad](https://github.com/melihbirim/signature-pad) | 1 | React 18+ (TypeScript) | Draw + type modes, watermark, headless mode, upload lifecycle hooks |
| [jamesmckeon/react-simple-signature](https://github.com/jamesmckeon/react-simple-signature) | 1 | React 19 + TypeScript | SimpleSignature: touch/mouse/stylus, high-DPI, ref API, blob output |

### 2.5 PWA / Offline / QR

| Repo | Stars | Stack | Patrón Aplicable |
|------|-------|-------|------------------|
| [serwist/serwist](https://github.com/serwist/serwist) | — | JS libraries | Fork de Workbox, Serwist es el sistema de SW usado por CERMONT |
| [5ks55/my-qrs-pwa](https://github.com/5ks55/my-qrs-pwa) | — | React 19 + Vite + IndexedDB | PWA offline-first, QR scanning (zxing), QR generation, drag-drop categorías |
| [smarts-uz/js-next-pwa-serwist](https://github.com/smarts-uz/js-next-pwa-serwist) | 9 | Next.js + Serwist | Producción PWA: file handling, geolocation, offline, shadcn/ui, navigation preload |

### 2.6 Dashboards / Data Visualization

| Repo | Stars | Stack | Patrón Aplicable |
|------|-------|-------|------------------|
| [marleyDip/NextJS-Admin-Dashboard](https://github.com/marleyDip/NextJS-Admin-Dashboard-ShadCN-Tailwind-CSS) | 1 | Next.js + ShadCN + Recharts + TanStack Table | **Stack idéntico a CERMONT**: sidebar, TanStack Table (sort/pagination/filter), Recharts (area/pie/line/bar), themes |
| [dianprata/tanstack-shadcn-dashboard](https://github.com/dianprata/tanstack-shadcn-dashboard) | 2 | React + Vite + ShadCN + TanStack Router | Dashboard SPA: sidebar, dark mode, nested menus, Recharts |
| [KaranChandekar/data-viz-dashboard](https://github.com/KaranChandekar/data-viz-dashboard) | 0 | Next.js 16 + React 19 + Recharts + Zustand | **Stack CERMONT exacto**: Next.js 16, React 19, Recharts, Zustand, Framer Motion, Tailwind v4, drag-to-reorder widgets |
| [Tremor](https://tremor.so) | — | React + Recharts + Radix UI | Copy-paste componentes dashboard: date picker, range slider, charts |

### 2.7 Rule Engines

| Proyecto | Stack | Patrón Aplicable |
|----------|-------|------------------|
| [json-rules-engine](https://github.com/CacheControl/json-rules-engine) (npm) | TypeScript | Rule engine: IF-THEN-ELSE para workflow automation, SLA management, validación condicional |
| [nools](https://github.com/noolsjs/nools) | JavaScript | Rete-based rule engine para TypeScript |

---

## 3. Tendencias de Innovación FSM/GMAO 2026

### 3.1 IA Agentic para Work Orders

| Tendencia | Descripción | Aplicación CERMONT |
|-----------|-------------|-------------------|
| **Agentes generativos de WO** | Agentes IA que convierten lenguaje natural (voz/texto/foto) en work orders estructurados | Crear work orders por foto o voz en campo |
| **Asistentes de voz hands-free** | Técnicos crean/actualizan WO por voz sin usar pantalla (OxMaint, Salesforce Agentforce) | Ideal para técnicos en espacios confinados |
| **Diagnóstico multimodal** | Agentes analizan simultáneamente imagen + sonido + historial para diagnosticar equipos | Diagnóstico predictivo de fallas |
| **Auto-dispatch agentic** | IA asigna técnicos basado en skills, ubicación, carga de trabajo y urgencia en tiempo real | Optimización de despacho |

**Fuentes:**
- TSIA: "The State of Field Services 2026: How AI Restores Humanity"
- Fexa: "The State of AI in Facilities Management: Trends for 2026"
- Salesforce: "The Deskless Revolution: One Year of Agentic Field Service"
- FieldProxy: "The Future of AI Agents in Field Service: Trends 2026-2030"
- OxMaint: "AI Voice Work Orders for Facility Technicians"

### 3.2 Motores de Reglas SI-ENTONCES

| Tendencia | Descripción | Aplicación CERMONT |
|-----------|-------------|-------------------|
| **json-rules-engine** | Motor de reglas declarativo en TypeScript: `{ conditions: { all: [...] }, event: { type: "..." } }` | Workflow de 14 pasos, SLA management, validación condicional de planificación |
| **Reglas de negocio externalizadas** | Separar lógica condicional del código core usando rule engines | Reemplazar lógica hardcodeada de transición de estados |
| **Workflow DSL** | Lenguajes específicos para definir flujos de aprobación multi-nivel | Aprobaciones de SES/invoice con escalamiento |

### 3.3 Gemelo Digital Operativo

| Tendencia | Descripción | Aplicación CERMONT |
|-----------|-------------|-------------------|
| **Digital Twin de assets** | Réplica digital de equipos con datos en tiempo real de sensores IoT | Monitoreo de equipos críticos |
| **Modelo BIM/3D** | Integración de planos interactivos con estado de activos (eMaint, Maximo) | Visualización de ubicación de equipos |

### 3.4 Optimización de Rutas/Scheduling

| Tendencia | Descripción | Aplicación CERMONT |
|-----------|-------------|-------------------|
| **VRP (Vehicle Routing Problem)** | Algoritmos de optimización de rutas considerando tráfico, ventanas de tiempo, skills | Despacho inteligente de técnicos |
| **Capacitive scheduling** | Asignación considerando capacidad real de técnicos y herramientas | Planning de obra con recursos finitos |
| **FullCalendar/react-dnd** | Ya usado por CERMONT: calendario + drag-drop para scheduling | Ya implementado |

### 3.5 Multi-tenancy SaaS

| Tendencia | Descripción | Aplicación CERMONT |
|-----------|-------------|-------------------|
| **Multi-tenancy nativo** | Separación estricta de datos por cliente/organización | CERMONT actual es single-tenant; requerido para SaaS multi-cliente |
| **Row-level security** | PostgreSQL RLS o equivalente MongoDB | Protección datos entre clientes |

---

## 4. Matriz de Referencia Cruzada: Plataforma → Módulo CERMONT

| Plataforma/Repo | Módulo CERMONT | Patrón Clave | Prioridad |
|-----------------|----------------|--------------|-----------|
| UpKeep | execution, evidence | Mobile-first WO, offline sync | P0 |
| Fiix | maintenance | QR scanning, nested PM | P1 |
| ServiceTitan | order/dispatch | Dispatch optimization | P2 |
| Jobber | proposals, invoices | Client hub, QuickBooks sync | P1 |
| Salesforce FSL | dispatch, portal | Einstein AI routing | P2 |
| sys-ae/fieldopt | dispatch | AG Grid drag-drop dispatch | P1 |
| solvice/scheduler-plugin | dispatch | Gantt timeline, constraint viz | P2 |
| react-esign | delivery-record | Signature capture | P0 |
| Serwist | PWA/offline | Service worker | Ya en uso |
| json-rules-engine | workflow | Rule engine | P1 |
| COSTAATT-CMMS | evidence, execution | QR scanning + GPS + PWA | P1 |
| Tremor/Recharts | dashboard | Charts, dashboards | Ya en uso |
| KaranChandekar-dashboard | dashboard | Drag-to-reorder widgets | P2 |

---

## 5. Stack Tecnológico Recomendado (No Cambiar)

Basado en el benchmark, el stack actual de CERMONT está alineado con las mejores prácticas del mercado:

| Componente | CERMONT | Benchmark | Veredicto |
|-----------|---------|-----------|-----------|
| Backend framework | Express 5 | Múltiples (Express, FastAPI, Symfony) | ✅ Adecuado |
| Base de datos | MongoDB + Mongoose | MongoDB, PostgreSQL | ✅ Adecuado |
| Frontend | Next.js 16 + React 19 | React 18/19, Next.js | ✅ Al día |
| Estado servidor | TanStack Query 5 | React Query | ✅ Al día |
| Estado cliente | Zustand 5 | Zustand, Context | ✅ Al día |
| UI Components | Radix UI + Tailwind 4 | ShadCN, Radix | ✅ Al día |
| Charts | Recharts 3 | Recharts, Chart.js | ✅ Al día |
| Calendar | FullCalendar 6 | FullCalendar, custom | ✅ Al día |
| Drag-drop | react-dnd 16 | dnd-kit, react-dnd | ✅ Al día |
| PWA/Offline | Serwist + IndexedDB | Serwist, Workbox | ✅ Al día |
| Forms | react-hook-form + Zod 4 | react-hook-form + Zod | ✅ Al día |
| Testing | Vitest + Playwright | Vitest, Playwright | ✅ Al día |
| QR | zxing | zxing | Pendiente instalar |
| Firma digital | No implementado | react-esign | ❌ Brecha |
| Rule engine | No implementado | json-rules-engine | ❌ Brecha |
| AI/ML | No implementado | OpenAI API, watsonx | ❌ Brecha |
