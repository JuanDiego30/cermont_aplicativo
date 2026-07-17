# Dashboard KPI Preparatory Audit — Block D

**Date:** 2026-07-08 21:27 COT

## Existing Dashboard Endpoints (Backend)

Based on codebase analysis:

| Endpoint | File | Status |
|----------|------|--------|
| `/api/dashboard/operational-kpis` | `dashboard-operational-kpi.service.ts` | ✅ Exists |
| `/api/dashboard/sla-risk` | `dashboard-sla.service.ts` | ✅ Exists |
| `/api/dashboard/financial` | `dashboard-financial.service.ts` | ✅ Exists |
| `/api/dashboard/efficiency` | `dashboard-efficiency.service.ts` | ✅ Exists |
| `/api/dashboard/readiness` | `dashboard-readiness.service.ts` | ✅ Exists |
| `/api/dashboard/demand` | `dashboard-demand.service.ts` | ✅ Exists |

## Existing Dashboard Hooks (Frontend)

| Hook | File | Status |
|------|------|--------|
| `useDashboardSummary` | `hooks/useDashboardSummary.ts` | ✅ Exists |

## Existing Dashboard UI Components

| Component | File | Status |
|-----------|------|--------|
| DashboardCommandCenter | `ui/DashboardCommandCenter.tsx` | ✅ Exists |
| DashboardKPIWidgets | `ui/DashboardKPIWidgets.tsx` | ✅ Exists |
| BottleneckDetectionPanel | `ui/BottleneckDetectionPanel.tsx` | ✅ Exists |
| CashFlowFunnel | `ui/CashFlowFunnel.tsx` | ✅ Exists |
| CostOverrunWidget | `ui/CostOverrunWidget.tsx` | ✅ Exists |
| FirstTimeFixRateGauge | `ui/FirstTimeFixRateGauge.tsx` | ✅ Exists |
| KPIStatCard | `ui/KPIStatCard.tsx` | ✅ Exists |
| MTTRMTBFCards | `ui/MTTRMTBFCards.tsx` | ✅ Exists |
| NextActionsByRolePanel | `ui/NextActionsByRolePanel.tsx` | ✅ Exists |
| OperationalKpiSection | `ui/OperationalKpiSection.tsx` | ✅ Exists |
| PendingInvoicesAlert | `ui/PendingInvoicesAlert.tsx` | ✅ Exists |
| PendingReportsAlert | `ui/PendingReportsAlert.tsx` | ✅ Exists |
| SlaRiskOrdersTable | `ui/SlaRiskOrdersTable.tsx` | ✅ Exists |
| StepTimeline | `ui/StepTimeline.tsx` | ✅ Exists |

## Existing Domain Rules

| Rule | File | Status |
|------|------|--------|
| SLA risk evaluation | `spec-015-rules.ts` | ✅ Exists |
| Cost risk evaluation | `spec-015-rules.ts` | ✅ Exists |
| First time fix rate | `spec-015-rules.ts` | ✅ Exists |
| MTBF / MTTR | `spec-015-rules.ts` | ✅ Exists |
| Technician utilization | `spec-015-rules.ts` | ✅ Exists |
| Planning blockers | `planning.rules.ts` | ✅ Exists |
| Execution blockers | `execution.ts` | ✅ Exists |
| Closure blockers | `closure.rules.ts` | ✅ Exists |

## Gaps Identified

| Gap | Impact | Priority |
|-----|--------|----------|
| Dashboard does NOT have a pure domain rule for `getDashboardKPIs` | Missing SSOT for KPI computation | 🟡 Medium |
| `useDashboardSummary` hook may not connect to all 6 backend endpoints | Partial data coverage | 🟡 Medium |
| Frontend components are untracked files (new) — not yet compiled | Frontend typecheck errors | 🔴 High |

## Data That Dashboard Must Read (NOT save)

- Service cases by status (from ServiceCase model)
- Planning readiness (from PlanningPacket model)
- Execution blockers (from PlanningReadiness + execution domain rules)
- SLA deadlines (from ServiceCase createdAt + SLA config)
- Cost variance (from Cost model)
- Pending invoices (from Invoice model)
- Pending SES (from ServiceEntrySheet model)

## Tickets for Sprint 4

| Ticket | Description | Effort |
|--------|-------------|--------|
| D1 | Create `dashboard.kpi.rules.ts` domain package with getDashboardKPIs() | M |
| D2 | Connect useDashboardSummary to all 6 backend endpoints | M |
| D3 | Fix frontend typecheck errors in dashboard components | L |
| D4 | Add loading/error/empty states to DashboardCommandCenter | S |
| D5 | Integrate SLA risk with planning blockers for unified view | M |
