"use client";

import type { DashboardCharts } from "@cermont/shared-types";
import { Calendar } from "lucide-react";
import { useSyncExternalStore, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { isOfflineLikeError } from "@/lib/http/api-client";
import { BackendUnavailableState } from "@/components/common/PageStates";
import { EmptyKpiState } from "@/core/ui/EmptyKpiState";
import { Skeleton } from "@/core/ui/Skeleton";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useOrders } from "@/modules/orders/queries";
import { useMaintenanceKits } from "@/modules/maintenance/hooks/useMaintenanceKits";
import { useServiceCaseSummary } from "@/modules/service-cases";
import {
  useDashboardSummary,
  useDashboardOperationalKpis,
  useDashboardSlaRisk,
} from "@/modules/dashboard/hooks/useDashboardSummary";
import { useHealthScore } from "@/modules/dashboard/hooks/useHealthScore";
import { usePredictiveAlerts } from "@/modules/dashboard/hooks/usePredictiveAlerts";
import { DashboardHero } from "@/modules/dashboard/ui/DashboardHero";
import { StepTimeline } from "@/modules/dashboard/ui/StepTimeline";
import { ServiceCaseDashboardPanel } from "@/modules/dashboard/ui/ServiceCaseDashboardPanel";
import { NextActionsByRolePanel, type ActionItem } from "@/modules/dashboard/ui/NextActionsByRolePanel";
import { KPICard } from "@/modules/dashboard/ui/KPICard";
import { ChartCard } from "@/modules/dashboard/ui/ChartCard";
import { MonthlyBarChart } from "@/modules/dashboard/ui/MonthlyBarChart";
import { OrdersByStatusChart } from "@/modules/dashboard/ui/OrdersByStatusChart";
import { ActivityTimeline } from "@/modules/dashboard/ui/ActivityTimeline";
import { RecentOrdersTable } from "@/modules/dashboard/ui/RecentOrdersTable";
import { DashboardKPIWidgets } from "@/modules/dashboard/ui/DashboardKPIWidgets";
import { MTTRMTBFCards } from "@/modules/dashboard/ui/MTTRMTBFCards";
import { FirstTimeFixRateGauge } from "@/modules/dashboard/ui/FirstTimeFixRateGauge";
import { CashFlowFunnel } from "@/modules/dashboard/ui/CashFlowFunnel";
import { SlaRiskOrdersTable } from "@/modules/dashboard/ui/SlaRiskOrdersTable";
import { PendingInvoicesAlert } from "@/modules/dashboard/ui/PendingInvoicesAlert";
import { PendingReportsAlert } from "@/modules/dashboard/ui/PendingReportsAlert";
import { FleetAlertsBanner } from "@/modules/dashboard/ui/FleetAlertsBanner";
import { DashboardSlaWidget } from "@/modules/dashboard/ui/DashboardSlaWidget";
import { DashboardFilters } from "@/modules/dashboard/ui/DashboardFilters";
import { HealthScoreGauge } from "@/modules/dashboard/ui/HealthScoreGauge";
import { PredictiveAlerts } from "@/modules/dashboard/ui/PredictiveAlerts";
import { SlaGaugePanel } from "@/modules/dashboard/ui/SlaGaugePanel";
import { ActivityHeatmap } from "@/modules/dashboard/ui/ActivityHeatmap";
import { UpcomingMaintenanceList } from "@/modules/dashboard/ui/UpcomingMaintenanceList";
import {
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  Package2,
  Wrench,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LinkableVisual } from "@/modules/dashboard/ui/LinkableVisual";
import { DASHBOARD_VISUALS } from "@/modules/dashboard/model/dashboard-visuals";
import type { DashboardVisual } from "@/modules/dashboard/model/dashboard-visuals";

interface DashboardOrderSnapshot {
  _id: string;
  code: string;
  assetName?: string;
  status: string;
  createdAt?: string;
}

interface DashboardKpiSnapshot {
  overview: {
    total_orders: number;
    active_orders: number;
    closed_orders: number;
    overdue_orders: number;
    maintenance_open_count: number;
    resource_in_use_count: number;
    completed_month_count: number;
  };
  financial: { total_budget_approved: number };
}

interface StatusSummaryItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
}

type DashboardSummarySnapshot = ReturnType<typeof useDashboardSummary>["data"];
type OperationalKpiQuery = ReturnType<typeof useDashboardOperationalKpis>;
type SlaRiskQuery = ReturnType<typeof useDashboardSlaRisk>;
type ServiceCaseSummarySnapshot = ReturnType<typeof useServiceCaseSummary>["data"];

function buildOrdersByStatus(charts?: DashboardCharts | null) {
  return charts?.ordersByStatus.map(({ label, value }) => ({ name: label, value })) ?? [];
}

function buildRecentOrders(orders: DashboardOrderSnapshot[]) {
  return orders.slice(0, 10).map((order) => ({
    _id: order._id,
    code: order.code,
    assetName: order.assetName ?? "",
    status: order.status,
    createdAt: order.createdAt ?? "",
  }));
}

function buildMonthlyTrendData(charts: DashboardCharts | null | undefined, orders: DashboardOrderSnapshot[]) {
  if (charts?.ordersByMonth.length) {
    return charts.ordersByMonth.map(({ month, created, completed }) => ({
      month, creadas: created, completadas: completed,
    }));
  }
  const chartData = orders.reduce<Record<string, { month: string; creadas: number; completadas: number }>>((acc, order) => {
    const key = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("es-CO", { month: "short" })
      : "Sin fecha";
    if (!acc[key]) { acc[key] = { month: key, creadas: 0, completadas: 0 }; }
    acc[key].creadas += 1;
    if (order.status === "completed" || order.status === "closed") { acc[key].completadas += 1; }
    return acc;
  }, {});
  return Object.values(chartData).slice(-6);
}

function buildStatusSummaryItems(kpis: DashboardKpiSnapshot, activeKitCount: number): StatusSummaryItem[] {
  return [
    { label: "Órdenes abiertas", value: kpis?.overview.active_orders ?? 0, icon: ClipboardList, color: "text-[var(--icon-accent)]", bg: "bg-[var(--color-cermont-blue-bg)]" },
    { label: "Completadas", value: kpis?.overview.closed_orders ?? 0, icon: CheckCircle, color: "text-[var(--icon-success)]", bg: "bg-[var(--color-success-bg)]" },
    { label: "Con alerta", value: kpis?.overview.overdue_orders ?? 0, icon: AlertTriangle, color: "text-[var(--icon-warning)]", bg: "bg-[var(--color-warning-bg)]" },
    { label: "Kits activos", value: activeKitCount, icon: Package2, color: "text-[var(--icon-primary)]", bg: "bg-[var(--color-surface-soft)]" },
  ];
}

function emptyDashboardKpis(): DashboardKpiSnapshot {
  return {
    overview: { total_orders: 0, active_orders: 0, closed_orders: 0, overdue_orders: 0, maintenance_open_count: 0, resource_in_use_count: 0, completed_month_count: 0 },
    financial: { total_budget_approved: 0 },
  };
}

function buildDashboardKpiSnapshot(dashboardSummary: DashboardSummarySnapshot, serviceCaseSummary: ServiceCaseSummarySnapshot, activeKitCount: number): DashboardKpiSnapshot {
  if (!dashboardSummary) { return emptyDashboardKpis(); }
  return {
    overview: {
      total_orders: serviceCaseSummary?.totalCases ?? dashboardSummary.pipeline?.totalActive ?? 0,
      active_orders: serviceCaseSummary?.activeCases ?? dashboardSummary.pipeline?.totalActive ?? 0,
      closed_orders: dashboardSummary.pipeline?.totalClosed ?? 0,
      overdue_orders: dashboardSummary.financialAging?.overdueInvoiceCount ?? dashboardSummary.blockers?.criticalBlockers ?? 0,
      maintenance_open_count: dashboardSummary.assetMaintenance?.activeMaintenance ?? activeKitCount,
      resource_in_use_count: dashboardSummary.assetMaintenance?.totalAssets ?? 0,
      completed_month_count: serviceCaseSummary?.completedThisMonth ?? dashboardSummary.pipeline?.totalClosed ?? 0,
    },
    financial: { total_budget_approved: serviceCaseSummary?.revenue ?? dashboardSummary.costVariance?.estimatedCost ?? 0 },
  };
}

const NEXT_ACTION_ROUTES: Record<string, string> = {
  review_request: "/work-requests", create_proposal: "/proposals/new",
  start_execution: "/execution", approve_planning: "/planning",
};

function buildNextActionItems(nextActions: Array<{ command: string; label: string; requiredRole: string; count: number }>): ActionItem[] {
  return nextActions.filter((a) => a.count > 0).map((a) => ({
    id: a.command, description: a.label, orderCode: `${a.count} pendiente${a.count === 1 ? "" : "s"}`,
    deepLink: NEXT_ACTION_ROUTES[a.command] ?? "/service-cases", urgency: "normal" as const, requiredRole: a.requiredRole,
  }));
}

function subscribeToTodayLabel(onStoreChange: () => void): () => void {
  const intervalId = window.setInterval(onStoreChange, 60_000);
  return () => window.clearInterval(intervalId);
}

function getTodayLabelSnapshot(): string { return format(new Date(), "d 'de' MMMM, yyyy", { locale: es }); }
function getServerTodayLabelSnapshot(): string { return "—"; }
function useTodayLabel(): string { return useSyncExternalStore(subscribeToTodayLabel, getTodayLabelSnapshot, getServerTodayLabelSnapshot); }

export function DashboardClientShell() {
  const { user } = useAuth();
  const { data: dashboardSummary, isLoading: dsLoading, error: dsError, refetch: refetchDS } = useDashboardSummary();
  const operationalKpisQuery = useDashboardOperationalKpis();
  const slaRiskQuery = useDashboardSlaRisk();
  const { data: healthScore, isLoading: healthLoading } = useHealthScore();
  const { data: predictiveAlerts = [] } = usePredictiveAlerts();
  const { data: serviceCaseSummary, isLoading: scsLoading, error: scsError, refetch: refetchSCS } = useServiceCaseSummary();
  const { data: ordersPage, isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
  const { data: maintenanceKitPage, isLoading: mkLoading, error: mkError, refetch: refetchMK } = useMaintenanceKits({ limit: 100 });

  const orders = (ordersPage?.items ?? []) as DashboardOrderSnapshot[];
  const maintenanceKits = maintenanceKitPage?.items ?? [];
  const isLoading = dsLoading || scsLoading || ordersLoading || mkLoading || healthLoading;
  const error = dsError ?? scsError ?? mkError;

  const handleRetryAll = useCallback(() => {
    void refetchDS(); void refetchSCS(); void refetchOrders(); void refetchMK();
  }, [refetchDS, refetchSCS, refetchOrders, refetchMK]);

  const ordersByStatus = buildOrdersByStatus(dashboardSummary?.charts);
  const recentOrders = buildRecentOrders(orders);
  const monthlyTrendData = buildMonthlyTrendData(dashboardSummary?.charts, orders);
  const activeKitCount = maintenanceKits.filter((k) => k.isActive).length;
  const kitPreview = maintenanceKits.slice(0, 5);
  const today = useTodayLabel();
  const userName = user?.name?.split(" ").slice(0, 2).join(" ") || "Usuario";
  const resolvedKpis = buildDashboardKpiSnapshot(dashboardSummary, serviceCaseSummary, activeKitCount);
  const statusSummaryItems = buildStatusSummaryItems(resolvedKpis, activeKitCount);
  const activeOrders = resolvedKpis.overview.active_orders ?? 0;
  const closedOrders = resolvedKpis.overview.closed_orders ?? 0;
  const overdueOrders = resolvedKpis.overview.overdue_orders ?? 0;
  const maintenanceOpenCount = resolvedKpis.overview.maintenance_open_count ?? 0;
  const totalBudgetApproved = resolvedKpis.financial.total_budget_approved ?? 0;

  if (isLoading) { return <LoadingState />; }
  if (error) {
    if (isOfflineLikeError(error as Error)) { return <OfflineState onRetry={handleRetryAll} />; }
    return <ErrorState message={(error as Error).message} />;
  }
  if (resolvedKpis.overview.total_orders === 0 && resolvedKpis.overview.active_orders === 0) {
    return <EmptyState />;
  }

  const kpis = operationalKpisQuery.data;
  const hasOperationalData = kpis && (kpis.mttrMinutes > 0 || kpis.mtbfDays > 0 || kpis.firstTimeFixRate > 0 || (kpis.technicianUtilizationRate ?? 0) > 0);
  const closure = dashboardSummary?.administrativeClosure;
  const aging = dashboardSummary?.financialAging;
  const actualCost = dashboardSummary?.costVariance?.actualCost ?? 0;
  const funnelStages = closure
    ? [
        { label: "Ejecutado", count: dashboardSummary?.pipeline?.totalActive ?? 0, amount: actualCost },
        { label: "SES", count: closure.pendingSES, amount: actualCost },
        { label: "Factura", count: closure.pendingInvoices, amount: aging?.totalOutstandingAmount ?? 0 },
        { label: "Pago", count: closure.pendingPayments, amount: Math.max(0, (aging?.totalOutstandingAmount ?? 0) - (aging?.totalOverdueAmount ?? 0)) },
      ] : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Panel de Control</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal">
            <Calendar className="size-3.5" aria-hidden="true" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardFilters />
          <HealthScoreGauge score={healthScore ?? null} isLoading={healthLoading} />
          <button type="button" onClick={handleRetryAll}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)]"
            aria-label="Actualizar dashboard" title="Actualizar datos"
          >↻</button>
        </div>
      </div>

      <FleetAlertsBanner />
      <PredictiveAlerts alerts={predictiveAlerts} />
      <DashboardHero userName={userName} userRole={user?.role || "Gerente de Mantenimiento"}
        stats={null} isLoading={isLoading} />

      <StepTimeline stepDistribution={serviceCaseSummary?.stepDistribution ?? []} />
      <ServiceCaseDashboardPanel activeOrders={activeOrders} closedOrders={closedOrders} overdueOrders={overdueOrders}
        maintenanceOpenCount={maintenanceOpenCount} activeKitCount={activeKitCount} totalBudgetApproved={totalBudgetApproved}
        recentOrdersCount={recentOrders.length} blockedCases={serviceCaseSummary?.blockedCases ?? 0}
        readyToBill={serviceCaseSummary?.readyToBill ?? 0} readyToClose={serviceCaseSummary?.readyToClose ?? 0}
        inPlanning={serviceCaseSummary?.inPlanning ?? 0} />

      <NextActionsByRolePanel actions={buildNextActionItems(dashboardSummary?.nextActions ?? [])} />

      {/* KPI Grid with solid variant for first KPI */}
      <section aria-label="Indicadores clave">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard title="Órdenes Activas" value={resolvedKpis.overview.active_orders ?? 0} icon={ClipboardList}
            variant="solid" description={`${resolvedKpis.overview.total_orders ?? 0} órdenes en total`} />
          <KPICard title="Mantenimientos Abiertos" value={resolvedKpis.overview.maintenance_open_count ?? activeKitCount}
            icon={Wrench} color="amber"
            description={resolvedKpis.overview.maintenance_open_count > 0 ? "Mantenimientos preventivos/correctivos" : "Sin mantenimientos programados"} />
          <KPICard title="Recursos en Uso" value={resolvedKpis.overview.resource_in_use_count ?? 0} icon={Package2}
            description={resolvedKpis.overview.resource_in_use_count > 0 ? "Recursos asignados a órdenes" : "Sin recursos asignados"} />
          <KPICard title="Ingresos del Mes" value={resolvedKpis.financial.total_budget_approved ?? 0} format="currency" icon={DollarSign} color="green"
            description={resolvedKpis.financial.total_budget_approved > 0 ? "Presupuesto aprobado" : "Sin presupuesto aprobado"} />
        </div>
      </section>

      {/* Activity visuals gallery — real images linking to modules */}
      <section aria-label="Galería de módulos operativos">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {(Object.keys(DASHBOARD_VISUALS) as DashboardVisual[]).slice(0, 5).map((key) => (
            <LinkableVisual key={key} visual={key} size="sm" withCaption />
          ))}
        </div>
      </section>

      {/* Charts row: MonthlyBarChart + SLA gauge */}
      <section aria-label="Análisis visual" className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Tendencia Mensual" subtitle="Órdenes creadas vs completadas">
            <MonthlyBarChart data={monthlyTrendData} />
          </ChartCard>
        </div>
        <div className="space-y-4">
          <OrdersByStatusChart data={ordersByStatus} />
          <DashboardSlaWidget />
        </div>
      </section>

      {/* SLA Gauge + Activity heatmap */}
      <section className="grid gap-4 xl:grid-cols-3">
        <SlaGaugePanel slaValue={resolvedKpis.overview.total_orders > 0
          ? Math.round((resolvedKpis.overview.closed_orders / resolvedKpis.overview.total_orders) * 100) : 0}
          totalOrders={resolvedKpis.overview.total_orders} onTimeOrders={resolvedKpis.overview.closed_orders} />
        <div className="xl:col-span-2">
          <ActivityHeatmap events={(dashboardSummary?.recentActivity?.items ?? []).map((item) => ({ id: item.entityCode ?? item.event, timestamp: item.occurredAt }))} />
        </div>
      </section>

      {/* Operational KPI section */}
      <OperationalSection kpis={kpis} slaRiskQuery={slaRiskQuery} hasOperationalData={hasOperationalData ?? false} funnelStages={funnelStages} aging={aging} />

      {/* Bottom row */}
      <div className="grid gap-4 xl:grid-cols-3">
        <section aria-labelledby="recent-orders-title" className="xl:col-span-1">
          <div className="flex items-center justify-between px-2 py-4">
            <h3 id="recent-orders-title" className="text-xl font-semibold text-[var(--text-primary)]">Órdenes Recientes</h3>
            <Link href="/orders" className="flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-hover)]">
              Ver todas <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-2 shadow-[var(--shadow-1)]">
            <RecentOrdersTable orders={recentOrders.map((o) => ({ id: o._id, codigo: o.code, cliente: o.assetName || "", etapa: "", estado: "activa" as const, fecha: o.createdAt || "" }))} isLoading={ordersLoading} viewAllHref="/orders" />
          </div>
        </section>
        <ActivityTimeline items={dashboardSummary?.recentActivity?.items ?? []} />
        <section aria-labelledby="kits-title" className="xl:col-span-1">
          <ChartCard title="Kits Típicos Recientes">
            <UpcomingMaintenanceList kits={kitPreview} />
          </ChartCard>
        </section>
      </div>

      {/* Status summary */}
      <StatusSummary items={statusSummaryItems} />
    </div>
  );
}

function OperationalSection({ kpis, slaRiskQuery, hasOperationalData, funnelStages, aging }: {
  kpis: OperationalKpiQuery["data"];
  slaRiskQuery: SlaRiskQuery; hasOperationalData: boolean; funnelStages: Array<{ label: string; count: number; amount: number }>; aging: { totalOverdueAmount?: number; totalOutstandingAmount?: number } | null | undefined;
}) {
  if (!kpis || !hasOperationalData) {
    return <section aria-label="Indicadores operativos"><Skeleton variant="kpi-card" /></section>;
  }
  return (
    <section className="space-y-5" aria-labelledby="op-title">
      <div>
        <h2 id="op-title" className="text-xl font-semibold text-ink">Inteligencia operativa</h2>
        <p className="mt-1 text-sm text-charcoal">MTTR, MTBF, resolución inicial, utilización y riesgos financieros.</p>
      </div>
      {hasOperationalData && (
        <>
          <DashboardKPIWidgets mttr={kpis.mttrMinutes} mtbf={kpis.mtbfDays} ftr={kpis.firstTimeFixRate} utilization={kpis.technicianUtilizationRate ?? 0} />
          <div className="grid gap-4 xl:grid-cols-2">
            <MTTRMTBFCards mttr={kpis.mttrMinutes} mtbf={kpis.mtbfDays} />
            <FirstTimeFixRateGauge percentage={kpis.firstTimeFixRate} />
          </div>
        </>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <PendingInvoicesAlert count={kpis.overdueInvoicesCount} totalAmount={aging?.totalOverdueAmount ?? 0} />
        <PendingReportsAlert count={kpis.pendingReportsCount} />
      </div>
      <CashFlowFunnel stages={funnelStages} />
      {slaRiskQuery.isError ? (
        <p role="alert" className="text-sm text-brand-error">No se pudieron cargar las órdenes en riesgo SLA.</p>
      ) : slaRiskQuery.isLoading ? <Skeleton variant="table-row" rows={3} /> : <SlaRiskOrdersTable orders={slaRiskQuery.data ?? []} />}
    </section>
  );
}

function LoadingState() {
  return (
    <section className="space-y-6" aria-label="Cargando panel de control">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><Skeleton className="mb-2 h-8 w-48 rounded-md" /><Skeleton className="h-4 w-36 rounded-md" /></div>
        <Skeleton className="h-12 w-72 rounded-lg" />
      </div>
      <Skeleton variant="kpi-card" /><Skeleton variant="card" /><Skeleton variant="chart" height={200} />
      <div className="grid gap-4 xl:grid-cols-3"><Skeleton variant="card" /><Skeleton variant="card" /><Skeleton variant="card" /></div>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="space-y-6" aria-labelledby="dash-title">
      <h1 id="dash-title" className="text-3xl font-semibold text-[var(--text-primary)]">Panel de Control Operativo</h1>
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm text-[var(--color-danger)] shadow-[var(--shadow-1)]">
        No se pudo cargar la información del dashboard. {message}
      </div>
    </section>
  );
}

function OfflineState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="space-y-6" aria-labelledby="dash-title">
      <h1 id="dash-title" className="text-3xl font-semibold text-[var(--text-primary)]">Panel de Control Operativo</h1>
      <BackendUnavailableState onRetry={onRetry} />
    </section>
  );
}

function EmptyState() {
  return (
    <section className="space-y-6" aria-labelledby="dash-title">
      <h1 id="dash-title" className="text-3xl font-semibold text-[var(--text-primary)]">Panel de Control Operativo</h1>
      <EmptyKpiState icon={ClipboardList} title="Aún no tienes servicios activos"
        description="Crea tu primera solicitud de trabajo para comenzar el flujo operativo del dashboard."
        actionLabel="Nueva solicitud" actionHref="/work-requests" />
    </section>
  );
}

function StatusSummary({ items }: { items: StatusSummaryItem[] }) {
  return (
    <section aria-label="Resumen de estados" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${bg}`}>
            <Icon className={`size-5 ${color}`} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xl font-semibold text-[var(--text-primary)]">{value}</p>
            <p className="text-xs leading-tight text-[var(--text-secondary)]">{label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
