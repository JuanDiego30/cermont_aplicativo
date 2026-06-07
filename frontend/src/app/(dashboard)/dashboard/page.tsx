"use client";

import type { DashboardCharts } from "@cermont/shared-types";
import { useGSAP } from "@gsap/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import gsap from "gsap";
import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	ChevronRight,
	ClipboardList,
	DollarSign,
	type LucideIcon,
	Package2,
	Wrench,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useSyncExternalStore } from "react";
import { BackendUnavailableState } from "@/components/common/PageStates";
import { Skeleton } from "@/core/ui/Skeleton";
import { isOfflineLikeError } from "@/lib/http/api-client";
import { LazyMonthlyTrendChart } from "@/lib/utils/lazy-monthly-trend-chart";
import { LazyOrdersByStatusChart } from "@/lib/utils/lazy-orders-by-status-chart";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useDashboardSummary } from "@/modules/dashboard/hooks/useDashboardSummary";
import { ChartCard } from "@/modules/dashboard/ui/ChartCard";
import { DashboardFilters } from "@/modules/dashboard/ui/DashboardFilters";
import { KPICard } from "@/modules/dashboard/ui/KPICard";
import { RecentOrdersTable } from "@/modules/dashboard/ui/RecentOrdersTable";
import { ServiceCaseDashboardPanel } from "@/modules/dashboard/ui/ServiceCaseDashboardPanel";
import { StepTimeline } from "@/modules/dashboard/ui/StepTimeline";
import { UpcomingMaintenanceList } from "@/modules/dashboard/ui/UpcomingMaintenanceList";
import { useMaintenanceKits } from "@/modules/maintenance/hooks/useMaintenanceKits";
import { useOrders } from "@/modules/orders/queries";
import { useServiceCaseSummary } from "@/modules/service-cases";

gsap.registerPlugin(useGSAP);

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
	financial: {
		total_budget_approved: number;
	};
}

interface DashboardOrderSnapshot {
	_id: string;
	code: string;
	assetName?: string;
	status: string;
	createdAt?: string;
}

interface StatusSummaryItem {
	label: string;
	value: number;
	icon: LucideIcon;
	color: string;
	bg: string;
}

type DashboardSummarySnapshot = ReturnType<typeof useDashboardSummary>["data"];
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

function buildMonthlyTrendData(
	charts: DashboardCharts | null | undefined,
	orders: DashboardOrderSnapshot[],
) {
	if (charts?.ordersByMonth.length) {
		return charts.ordersByMonth.map(({ month, created, completed }) => ({
			month,
			creadas: created,
			completadas: completed,
		}));
	}

	const chartData = orders.reduce<
		Record<string, { month: string; creadas: number; completadas: number }>
	>((acc, order) => {
		const key = order.createdAt
			? new Date(order.createdAt).toLocaleDateString("es-CO", { month: "short" })
			: "Sin fecha";
		if (!acc[key]) {
			acc[key] = { month: key, creadas: 0, completadas: 0 };
		}
		acc[key].creadas += 1;
		if (order.status === "completed" || order.status === "closed") {
			acc[key].completadas += 1;
		}
		return acc;
	}, {});

	return Object.values(chartData).slice(-6);
}

function buildStatusSummaryItems(
	kpis: DashboardKpiSnapshot,
	activeKitCount: number,
): StatusSummaryItem[] {
	return [
		{
			label: "Órdenes abiertas",
			value: kpis?.overview.active_orders ?? 0,
			icon: ClipboardList,
			color: "text-[var(--color-brand-blue)]",
			bg: "bg-[var(--color-info-bg)]",
		},
		{
			label: "Completadas",
			value: kpis?.overview.closed_orders ?? 0,
			icon: CheckCircle,
			color: "text-[var(--color-success)]",
			bg: "bg-[var(--color-success-bg)]",
		},
		{
			label: "Con alerta",
			value: kpis?.overview.overdue_orders ?? 0,
			icon: AlertTriangle,
			color: "text-[var(--color-danger)]",
			bg: "bg-[var(--color-danger-bg)]",
		},
		{
			label: "Kits activos",
			value: activeKitCount,
			icon: Package2,
			color: "text-[var(--color-info)]",
			bg: "bg-[var(--color-info-bg)]",
		},
	];
}

function emptyDashboardKpis(): DashboardKpiSnapshot {
	return {
		overview: {
			total_orders: 0,
			active_orders: 0,
			closed_orders: 0,
			overdue_orders: 0,
			maintenance_open_count: 0,
			resource_in_use_count: 0,
			completed_month_count: 0,
		},
		financial: {
			total_budget_approved: 0,
		},
	};
}

function buildDashboardKpiSnapshot(
	dashboardSummary: DashboardSummarySnapshot,
	serviceCaseSummary: ServiceCaseSummarySnapshot,
	activeKitCount: number,
): DashboardKpiSnapshot {
	if (!dashboardSummary) {
		return emptyDashboardKpis();
	}

	return {
		overview: {
			total_orders: serviceCaseSummary?.totalCases ?? dashboardSummary.pipeline?.totalActive ?? 0,
			active_orders: serviceCaseSummary?.activeCases ?? dashboardSummary.pipeline?.totalActive ?? 0,
			closed_orders: dashboardSummary.pipeline?.totalClosed ?? 0,
			overdue_orders:
				dashboardSummary.financialAging?.totalOverdue ??
				dashboardSummary.blockers?.criticalBlockers ??
				0,
			maintenance_open_count:
				dashboardSummary.assetMaintenance?.activeMaintenance ?? activeKitCount,
			resource_in_use_count: dashboardSummary.assetMaintenance?.totalAssets ?? 0,
			completed_month_count:
				serviceCaseSummary?.completedThisMonth ?? dashboardSummary.pipeline?.totalClosed ?? 0,
		},
		financial: {
			total_budget_approved:
				serviceCaseSummary?.revenue ?? dashboardSummary.costVariance?.estimatedCost ?? 0,
		},
	};
}

function subscribeToTodayLabel(onStoreChange: () => void): () => void {
	const intervalId = window.setInterval(onStoreChange, 60_000);

	return () => window.clearInterval(intervalId);
}

function getTodayLabelSnapshot(): string {
	return format(new Date(), "d 'de' MMMM, yyyy", { locale: es });
}

function getServerTodayLabelSnapshot(): string {
	return "—";
}

function useTodayLabel(): string {
	return useSyncExternalStore(
		subscribeToTodayLabel,
		getTodayLabelSnapshot,
		getServerTodayLabelSnapshot,
	);
}

function animateDashboard(scope: HTMLElement): void {
	const header = scope.querySelector("[data-dash='header']");
	const banner = scope.querySelector("[data-dash='banner']");
	const kpis = scope.querySelectorAll("[data-dash='kpis']");
	const charts = scope.querySelector("[data-dash='charts']");
	const panels = scope.querySelectorAll("[data-dash='panel']");

	if (!header && !banner && !kpis.length && !charts && !panels.length) {
		return;
	}

	const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

	if (header) {
		tl.from(header, { opacity: 0, y: -18, duration: 0.5 });
	}
	if (banner) {
		tl.from(banner, { opacity: 0, x: 30, duration: 0.5 }, "-=0.25");
	}
	if (kpis.length) {
		tl.from(kpis, { opacity: 0, y: 20, stagger: 0.07, duration: 0.45 }, "-=0.1");
	}
	if (charts) {
		tl.from(charts, { opacity: 0, y: 20, duration: 0.5 }, "-=0.1");
	}
	if (panels.length) {
		tl.from(panels, { opacity: 0, y: 20, stagger: 0.1, duration: 0.45 }, "-=0.1");
	}
}

export default function DashboardPage() {
	const { user } = useAuth();
	const {
		data: dashboardSummary,
		isLoading: dashboardSummaryLoading,
		error: dashboardSummaryError,
		refetch: refetchDashboardSummary,
	} = useDashboardSummary();
	const {
		data: serviceCaseSummary,
		isLoading: serviceCaseSummaryLoading,
		error: serviceCaseSummaryError,
		refetch: refetchServiceCaseSummary,
	} = useServiceCaseSummary();
	const { data: ordersPage, isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
	const {
		data: maintenanceKitPage,
		isLoading: maintenanceKitsLoading,
		error: maintenanceKitsError,
		refetch: refetchMaintenanceKits,
	} = useMaintenanceKits({ limit: 100 });
	const maintenanceKits = maintenanceKitPage?.items ?? [];

	const orders = (ordersPage?.items ?? []) as DashboardOrderSnapshot[];
	const isLoading =
		dashboardSummaryLoading || serviceCaseSummaryLoading || ordersLoading || maintenanceKitsLoading;
	const error = dashboardSummaryError ?? serviceCaseSummaryError ?? maintenanceKitsError;

	const handleRetryAll = useCallback(() => {
		void refetchDashboardSummary();
		void refetchServiceCaseSummary();
		void refetchOrders();
		void refetchMaintenanceKits();
	}, [refetchDashboardSummary, refetchServiceCaseSummary, refetchOrders, refetchMaintenanceKits]);

	const pageRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			if (prefersReducedMotion() || !pageRef.current) {
				return;
			}

			animateDashboard(pageRef.current);
		},
		{ scope: pageRef, dependencies: [] },
	);

	const ordersByStatus = buildOrdersByStatus(dashboardSummary?.charts);
	const recentOrders = buildRecentOrders(orders);
	const monthlyTrendData = buildMonthlyTrendData(dashboardSummary?.charts, orders);

	const activeKitCount = maintenanceKits.filter((kit) => kit.isActive).length;
	const kitPreview = maintenanceKits.slice(0, 5);

	const today = useTodayLabel();
	const userName = user?.name?.split(" ").slice(0, 2).join(" ") || "Usuario";
	const resolvedKpis = buildDashboardKpiSnapshot(
		dashboardSummary,
		serviceCaseSummary,
		activeKitCount,
	);
	const statusSummaryItems = buildStatusSummaryItems(resolvedKpis, activeKitCount);
	const activeOrders = resolvedKpis.overview.active_orders ?? 0;
	const closedOrders = resolvedKpis.overview.closed_orders ?? 0;
	const overdueOrders = resolvedKpis.overview.overdue_orders ?? 0;
	const maintenanceOpenCount = resolvedKpis.overview.maintenance_open_count ?? 0;
	const totalBudgetApproved = resolvedKpis.financial.total_budget_approved ?? 0;

	if (isLoading) {
		return <DashboardLoadingState />;
	}

	if (error) {
		// Backend / network outage gets its own, friendlier state.
		// We avoid dumping the technical message to the user; the
		// banner above already announces the situation.
		if (isOfflineLikeError(error as Error)) {
			return <DashboardOfflineState onRetry={handleRetryAll} />;
		}
		return <DashboardErrorState message={(error as Error).message} />;
	}

	return (
		<div ref={pageRef} className="space-y-6">
			{/* Page header */}
			<div
				data-dash="header"
				className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
			>
				<div>
					<h1 className="text-xl font-semibold text-[var(--text-primary)]">Panel de Control</h1>
					<p className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
						<Calendar className="size-3.5" aria-hidden="true" />
						{today}
					</p>
				</div>
				<DashboardFilters />
			</div>

			<DashboardWelcomeBanner
				activeKitCount={activeKitCount}
				kpis={resolvedKpis}
				role={user?.role || "Gerente de Mantenimiento"}
				userName={userName}
			/>

			<StepTimeline />

			<ServiceCaseDashboardPanel
				activeOrders={activeOrders}
				closedOrders={closedOrders}
				overdueOrders={overdueOrders}
				maintenanceOpenCount={maintenanceOpenCount}
				activeKitCount={activeKitCount}
				totalBudgetApproved={totalBudgetApproved}
				recentOrdersCount={recentOrders.length}
			/>

			{/* KPI cards , Figma style */}
			<section data-dash="kpis" aria-label="Indicadores clave de rendimiento">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<DashboardKpiGrid activeKitCount={activeKitCount} kpis={resolvedKpis} />
				</div>
			</section>

			{/* Charts row */}
			<section
				data-dash="charts"
				aria-label="Gráficas de tendencias"
				className="grid gap-4 xl:grid-cols-3"
			>
				<div className="xl:col-span-2">
					<ChartCard title="Tendencia Mensual" subtitle="Órdenes creadas vs completadas">
						<LazyMonthlyTrendChart data={monthlyTrendData} />
					</ChartCard>
				</div>
				<div>
					<ChartCard title="Órdenes por Estado" subtitle="Distribución actual">
						<LazyOrdersByStatusChart data={ordersByStatus} />
					</ChartCard>
				</div>
			</section>

			{/* Bottom row: Recent orders + Maintenance kits */}
			<div className="grid gap-4 xl:grid-cols-2">
				<section
					data-dash="panel"
					aria-labelledby="recent-orders-title"
					className="col-span-12 xl:col-span-1"
				>
					<div className="flex items-center justify-between px-2 py-4">
						<h3
							id="recent-orders-title"
							className="text-xl font-semibold text-[var(--text-primary)]"
						>
							Órdenes Recientes
						</h3>
						<Link
							href="/orders"
							className="flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-hover)]"
						>
							Ver todas
							<ChevronRight className="size-4" aria-hidden="true" />
						</Link>
					</div>
					<div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-2 shadow-[var(--shadow-1)]">
						<RecentOrdersTable orders={recentOrders} />
					</div>
				</section>

				<section
					data-dash="panel"
					aria-labelledby="kits-title"
					className="col-span-12 xl:col-span-1"
				>
					<ChartCard title="Kits Típicos Recientes">
						<UpcomingMaintenanceList kits={kitPreview} />
					</ChartCard>
				</section>
			</div>

			{/* Status summary row */}
			<DashboardStatusSummary items={statusSummaryItems} />
		</div>
	);
}

function DashboardLoadingState() {
	return (
		<div className="space-y-4 p-6">
			<Skeleton variant="text" className="h-[72px] w-full" />
			<Skeleton variant="kpi-card" />
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Skeleton variant="chart" height={240} />
				<Skeleton variant="chart" height={240} />
			</div>
		</div>
	);
}

function DashboardErrorState({ message }: { message: string }) {
	return (
		<section className="space-y-6" aria-labelledby="dashboard-page-title">
			<h1 id="dashboard-page-title" className="text-3xl font-semibold text-[var(--text-primary)]">
				Panel de Control Operativo
			</h1>
			<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm text-[var(--color-danger)] shadow-[var(--shadow-1)]">
				No se pudo cargar la información del dashboard. {message}
			</div>
		</section>
	);
}

function DashboardOfflineState({ onRetry }: { onRetry: () => void }) {
	return (
		<section className="space-y-6" aria-labelledby="dashboard-page-title">
			<h1 id="dashboard-page-title" className="text-3xl font-semibold text-[var(--text-primary)]">
				Panel de Control Operativo
			</h1>
			<BackendUnavailableState onRetry={onRetry} />
		</section>
	);
}

function DashboardWelcomeBanner({
	activeKitCount,
	kpis,
	role,
	userName,
}: {
	activeKitCount: number;
	kpis: DashboardKpiSnapshot;
	role: string;
	userName: string;
}) {
	return (
		<div
			data-dash="banner"
			className="rounded-[1.5rem] border border-[var(--border-default)] bg-[linear-gradient(135deg,rgba(24,226,153,0.16),rgba(43,92,168,0.08))] px-5 py-4 text-[var(--text-primary)] shadow-[var(--shadow-1)]"
		>
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="text-sm font-medium text-[var(--text-secondary)]">Bienvenido de vuelta,</p>
					<h2 className="text-lg font-semibold text-[var(--text-primary)]">{userName}</h2>
					<p className="mt-1 text-sm text-[var(--text-tertiary)] capitalize">{role}</p>
				</div>
				<div className="hidden items-center gap-4 sm:flex">
					<DashboardWelcomeMetric
						label="Órdenes activas"
						value={kpis.overview.active_orders ?? 0}
					/>
					<div className="h-10 w-px bg-[var(--border-default)]" />
					<DashboardWelcomeMetric
						label="Mant. abiertos"
						value={kpis.overview.maintenance_open_count ?? activeKitCount}
					/>
					<div className="h-10 w-px bg-[var(--border-default)]" />
					<DashboardWelcomeMetric
						label="Completados (mes)"
						value={kpis.overview.completed_month_count ?? 0}
					/>
				</div>
			</div>
		</div>
	);
}

function DashboardWelcomeMetric({ label, value }: { label: string; value: number }) {
	return (
		<div className="text-right">
			<p className="text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
			<p className="text-xs text-[var(--text-tertiary)]">{label}</p>
		</div>
	);
}

function DashboardKpiGrid({
	activeKitCount,
	kpis,
}: {
	activeKitCount: number;
	kpis: DashboardKpiSnapshot;
}) {
	return (
		<>
			<KPICard
				title="Órdenes Activas"
				value={kpis.overview.active_orders ?? 0}
				icon={ClipboardList}
				trend={{ value: 12, isPositive: true }}
				description={`${kpis.overview.total_orders ?? 0} órdenes en total`}
				color="blue"
			/>
			<KPICard
				title="Mantenimientos Abiertos"
				value={kpis.overview.maintenance_open_count ?? activeKitCount}
				icon={Wrench}
				trend={{ value: 4, isPositive: false }}
				description="Mantenimientos preventivos/correctivos"
				color="amber"
			/>
			<KPICard
				title="Recursos en Uso"
				value={kpis.overview.resource_in_use_count ?? 0}
				icon={Package2}
				trend={{ value: 8, isPositive: true }}
				description="Recursos asignados a órdenes"
				color="indigo"
			/>
			<KPICard
				title="Ingresos del Mes"
				value={kpis.financial.total_budget_approved ?? 0}
				format="currency"
				icon={DollarSign}
				trend={{ value: 5, isPositive: true }}
				description="Presupuesto aprobado"
				color="green"
			/>
		</>
	);
}

function DashboardStatusSummary({ items }: { items: StatusSummaryItem[] }) {
	return (
		<section aria-label="Resumen de estados" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
			{items.map(({ label, value, icon: Icon, color, bg }) => (
				<div
					key={label}
					data-dash="panel"
					className="flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
				>
					<div
						className={`flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] ${bg}`}
					>
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
