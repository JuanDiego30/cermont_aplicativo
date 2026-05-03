"use client";

import type { AnalyticsPeriod, CostSummary, MaintenanceKit } from "@cermont/shared-types";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { AlertTriangle, ChevronRight, ClipboardList, Package2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
	LazyCostsByCategoryChart,
	LazyOrdersByStatusChart,
	LazyOrdersTimeSeriesChart,
	LazyTechnicianWorkloadHeatmap,
	LazyTopAssetsChart,
} from "@/_shared/lib/utils/lazy";
import { type AuthUser, useAuth } from "@/auth/hooks/useAuth";
import { Skeleton } from "@/core/ui/Skeleton";
import { useCostDashboard } from "@/costs/queries";
import {
	useDashboardFsmMetrics,
	useDashboardKpis,
	useDashboardTechnicianWorkload,
	useDashboardTimeSeries,
	useDashboardTopAssets,
} from "@/dashboard/hooks/useDashboardKpis";
import { AlertsPanel } from "@/dashboard/ui/AlertsPanel";
import { ChartCard } from "@/dashboard/ui/ChartCard";
import { DashboardFilters } from "@/dashboard/ui/DashboardFilters";
import { DashboardKpiGrid } from "@/dashboard/ui/DashboardKpiGrid";
import { RecentOrdersTable } from "@/dashboard/ui/RecentOrdersTable";
import { UpcomingMaintenanceList } from "@/dashboard/ui/UpcomingMaintenanceList";
import { useMaintenanceKits } from "@/maintenance/hooks/useMaintenanceKits";
import { useOrders } from "@/orders/hooks/useOrders";

gsap.registerPlugin(useGSAP);

const PERIOD_OPTIONS: Array<{ label: string; value: AnalyticsPeriod }> = [
	{ label: "7d", value: "7d" },
	{ label: "30d", value: "30d" },
	{ label: "90d", value: "90d" },
];

interface DashboardContentProps {
	kpis: ReturnType<typeof useDashboardKpis>["data"];
	extendedKpis: ReturnType<typeof useDashboardFsmMetrics>["data"];
	ordersPage: ReturnType<typeof useOrders>["data"];
	maintenanceKits: MaintenanceKit[];
	costSummary: CostSummary | undefined;
	timeSeries: ReturnType<typeof useDashboardTimeSeries>["data"];
	topAssets: ReturnType<typeof useDashboardTopAssets>["data"];
	technicianWorkload: ReturnType<typeof useDashboardTechnicianWorkload>["data"];
	user: AuthUser | null;
	period: AnalyticsPeriod;
	onPeriodChange: (period: AnalyticsPeriod) => void;
	isChartLoading: boolean;
}

function getErrorMessage(error: Error | null): string {
	return error?.message ?? "No se pudo cargar la información del dashboard.";
}

function DashboardContent({
	kpis,
	extendedKpis,
	ordersPage,
	maintenanceKits,
	costSummary,
	timeSeries,
	topAssets,
	technicianWorkload,
	user,
	period,
	onPeriodChange,
	isChartLoading,
}: DashboardContentProps) {
	const pageRef = useRef<HTMLElement>(null);
	const [selectedStatus, setSelectedStatus] = useState("");

	useGSAP(
		() => {
			const pageElement = pageRef.current;
			if (!pageElement) {
				return;
			}

			const revealTargets = pageElement.querySelectorAll("[data-dash-reveal]");
			if (revealTargets.length === 0) {
				return;
			}

			gsap.from(revealTargets, {
				opacity: 0,
				y: 18,
				stagger: 0.07,
				duration: 0.45,
				ease: "power2.out",
				clearProps: "all",
			});
		},
		{ scope: pageRef, dependencies: [] },
	);

	const ordersByStatus = useMemo(
		() =>
			kpis?.by_stage ? Object.entries(kpis.by_stage).map(([name, value]) => ({ name, value })) : [],
		[kpis?.by_stage],
	);

	const recentOrders = useMemo(() => {
		const orders = ordersPage?.items ?? [];
		return orders
			.filter((order) => !selectedStatus || order.status === selectedStatus)
			.slice(0, 10);
	}, [ordersPage?.items, selectedStatus]);

	const activeKitCount = maintenanceKits.filter((kit) => kit.isActive).length;
	const kitPreview = maintenanceKits.slice(0, 5);
	const userName = user?.name?.split(" ").slice(0, 2).join(" ") || "equipo Cermont";
	const fallbackKpis = {
		activeOrders: kpis?.overview.active_orders ?? 0,
		completedOrders: kpis?.overview.completed_month_count ?? kpis?.overview.closed_orders ?? 0,
		overdueOrders: kpis?.overview.overdue_orders ?? 0,
		slaCompliancePct: kpis?.checklists.completion_rate_pct ?? 0,
		avgCycleTimeDays: kpis?.lead_time.avg_lead_time_days ?? 0,
		firstTimeFixRate: kpis?.checklists.completion_rate_pct ?? 0,
		activeTechnicians: kpis?.overview.resource_in_use_count ?? 0,
		unassignedOrders: Math.max(
			(kpis?.overview.total_orders ?? 0) -
				(kpis?.overview.active_orders ?? 0) -
				(kpis?.overview.closed_orders ?? 0),
			0,
		),
		fsmTasaCumplimiento: kpis?.checklists.completion_rate_pct ?? 0,
		fsmTiempoPromedioCiclo: kpis?.lead_time.avg_lead_time_days ?? 0,
		fsmFacturacionPendiente: 0,
		fsmOrdenesRetraso: kpis?.overview.overdue_orders ?? 0,
		fsmOrdenesActivas: kpis?.overview.active_orders ?? 0,
	};

	return (
		<div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px] p-4 md:p-6 lg:p-8">
			<main ref={pageRef} className="space-y-6 min-w-0">
				<header
					data-dash-reveal
					className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
				>
					<div>
						<p className="text-sm font-semibold text-(--text-secondary)">Bienvenido, {userName}</p>
						<h1 className="mt-1 text-2xl font-bold tracking-tight text-(--text-primary)">
							Panel de Control
						</h1>
						<p className="mt-1 max-w-3xl text-sm text-(--text-secondary)">
							Pulso operativo de órdenes, SLA, técnicos, costos y activos intervenidos.
						</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<fieldset className="inline-flex rounded-lg border border-(--border-default) bg-(--surface-primary) p-1">
							<legend className="sr-only">Rango de analítica</legend>
							{PERIOD_OPTIONS.map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => onPeriodChange(option.value)}
									className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
										period === option.value
											? "bg-(--color-info-bg) text-(--color-brand-blue)"
											: "text-(--text-secondary) hover:bg-(--surface-muted)"
									}`}
									aria-pressed={period === option.value}
								>
									{option.label}
								</button>
							))}
						</fieldset>
						<DashboardFilters />
					</div>
				</header>

				<div data-dash-reveal>
					<DashboardKpiGrid data={extendedKpis} fallback={fallbackKpis} />
				</div>

				<section
					data-dash-reveal
					aria-label="Gráficas analíticas"
					className="grid gap-4 xl:grid-cols-2"
				>
					<LazyOrdersByStatusChart
						data={ordersByStatus}
						selectedStatus={selectedStatus}
						onStatusSelect={setSelectedStatus}
					/>
					<LazyOrdersTimeSeriesChart data={timeSeries ?? []} loading={isChartLoading} />
					<LazyCostsByCategoryChart
						data={costSummary?.byCategory ?? []}
						budgetTarget={costSummary?.baselineApproved}
						loading={isChartLoading}
					/>
					<LazyTopAssetsChart data={topAssets ?? []} loading={isChartLoading} />
				</section>

				<section data-dash-reveal aria-label="Carga de trabajo por técnico">
					<LazyTechnicianWorkloadHeatmap data={technicianWorkload ?? []} loading={isChartLoading} />
				</section>

				<section
					data-dash-reveal
					aria-label="Estación operativa"
					className="grid gap-4 xl:grid-cols-2"
				>
					<article aria-labelledby="recent-orders-title">
						<div className="flex items-center justify-between px-2 py-4">
							<div>
								<h2 id="recent-orders-title" className="text-xl font-bold text-(--text-primary)">
									Órdenes recientes
								</h2>
								{selectedStatus ? (
									<p className="mt-1 text-xs text-(--text-secondary)">
										Filtradas por estado: {selectedStatus}
									</p>
								) : null}
							</div>
							<Link
								href="/orders"
								className="flex items-center gap-1 text-sm font-semibold text-(--color-brand-blue) hover:text-(--color-brand-blue-hover)"
							>
								Ver todas
								<ChevronRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</div>
						<div className="overflow-x-auto rounded-lg border border-(--border-default) bg-(--surface-primary) p-2 shadow-(--shadow-1)">
							<RecentOrdersTable orders={recentOrders} />
						</div>
					</article>

					<ChartCard title="Kits típicos recientes" subtitle={`${activeKitCount} kits activos`}>
						<UpcomingMaintenanceList kits={kitPreview} />
					</ChartCard>
				</section>

				<section
					data-dash-reveal
					aria-label="Resumen compacto"
					className="grid grid-cols-2 gap-4 sm:grid-cols-4"
				>
					{[
						{
							label: "Órdenes abiertas",
							value: kpis?.overview.active_orders ?? 0,
							icon: ClipboardList,
							color: "text-(--color-brand-blue)",
							bg: "bg-(--color-info-bg)",
						},
						{
							label: "Con alerta",
							value: kpis?.overview.overdue_orders ?? 0,
							icon: AlertTriangle,
							color: "text-(--color-danger)",
							bg: "bg-(--color-danger-bg)",
						},
						{
							label: "Kits activos",
							value: activeKitCount,
							icon: Package2,
							color: "text-(--color-info)",
							bg: "bg-(--color-info-bg)",
						},
						{
							label: "Costo real",
							value: `$${Math.round(costSummary?.totalActual ?? kpis?.financial.total_actual ?? 0).toLocaleString("es-CO")}`,
							icon: ClipboardList,
							color: "text-(--color-success)",
							bg: "bg-(--color-success-bg)",
						},
					].map(({ label, value, icon: Icon, color, bg }) => (
						<article
							key={label}
							className="flex items-center gap-3.5 rounded-lg border border-(--border-default) bg-(--surface-primary) p-4 shadow-(--shadow-1)"
						>
							<span
								className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}
							>
								<Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
							</span>
							<span>
								<span className="block text-xl font-bold text-(--text-primary)">{value}</span>
								<span className="block text-xs leading-tight text-(--text-secondary)">{label}</span>
							</span>
						</article>
					))}
				</section>
			</main>
			<aside className="hidden xl:block space-y-6" data-dash-reveal>
				<AlertsPanel />
			</aside>
		</div>
	);
}

export default function DashboardPage() {
	const searchParams = useSearchParams();
	const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
	const dashboardFilters = {
		startDate: searchParams.get("startDate") || "",
		endDate: searchParams.get("endDate") || "",
		client: searchParams.get("client") || "",
	};
	const normalizedFilters = {
		startDate: dashboardFilters.startDate || undefined,
		endDate: dashboardFilters.endDate || undefined,
		client: dashboardFilters.client || undefined,
	};
	const { user } = useAuth();
	const {
		data: kpis,
		isLoading: kpisLoading,
		error: kpisError,
	} = useDashboardKpis(normalizedFilters);
	const {
		data: extendedKpis,
		isLoading: extendedKpisLoading,
		error: extendedKpisError,
	} = useDashboardFsmMetrics(period);
	const {
		data: timeSeries,
		isLoading: timeSeriesLoading,
		error: timeSeriesError,
	} = useDashboardTimeSeries(period, normalizedFilters.client);
	const {
		data: topAssets,
		isLoading: topAssetsLoading,
		error: topAssetsError,
	} = useDashboardTopAssets(10);
	const {
		data: technicianWorkload,
		isLoading: workloadLoading,
		error: workloadError,
	} = useDashboardTechnicianWorkload(period === "90d" ? 21 : 14);
	const { data: costSummary, isLoading: costLoading, error: costError } = useCostDashboard();
	const { data: ordersPage, isLoading: ordersLoading } = useOrders({ limit: 20 });
	const {
		data: maintenanceKitPage,
		isLoading: maintenanceKitsLoading,
		error: maintenanceKitsError,
	} = useMaintenanceKits({ limit: 100 });
	const maintenanceKits = maintenanceKitPage?.items ?? [];

	const isLoading = kpisLoading || ordersLoading || maintenanceKitsLoading;
	const isChartLoading =
		extendedKpisLoading || timeSeriesLoading || topAssetsLoading || workloadLoading || costLoading;
	const blockingError = kpisError ?? maintenanceKitsError;
	const chartError =
		extendedKpisError ?? timeSeriesError ?? topAssetsError ?? workloadError ?? costError;

	if (isLoading) {
		return (
			<section className="space-y-4 p-6" aria-busy="true" aria-labelledby="dashboard-loading-title">
				<h2 id="dashboard-loading-title" className="sr-only">
					Cargando panel de control
				</h2>
				<Skeleton variant="text" className="h-18 w-full" />
				<Skeleton variant="kpi-card" />
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Skeleton variant="chart" height={240} />
					<Skeleton variant="chart" height={240} />
				</div>
			</section>
		);
	}

	if (blockingError) {
		return (
			<section className="space-y-6 p-6" aria-labelledby="dashboard-error-title">
				<h1 id="dashboard-error-title" className="text-3xl font-extrabold text-(--text-primary)">
					Error en el Panel
				</h1>
				<aside
					role="alert"
					className="rounded-lg border border-(--color-danger-bg) bg-(--color-danger-bg)/60 p-6 text-sm text-(--color-danger) shadow-(--shadow-1)"
				>
					{getErrorMessage(blockingError)}
				</aside>
			</section>
		);
	}

	return (
		<>
			{chartError ? (
				<aside
					role="status"
					className="mx-4 mt-4 rounded-lg border border-(--color-warning-bg) bg-(--color-warning-bg)/50 p-3 text-sm text-(--color-warning) md:mx-6 lg:mx-8"
				>
					Algunas analíticas avanzadas no están disponibles todavía. {getErrorMessage(chartError)}
				</aside>
			) : null}
			<DashboardContent
				kpis={kpis}
				extendedKpis={extendedKpis}
				ordersPage={ordersPage}
				maintenanceKits={maintenanceKits}
				costSummary={costSummary}
				timeSeries={timeSeries}
				topAssets={topAssets}
				technicianWorkload={technicianWorkload}
				user={user}
				period={period}
				onPeriodChange={setPeriod}
				isChartLoading={isChartLoading}
			/>
		</>
	);
}
