import type { DashboardFieldReadiness, DashboardServiceDemand } from "@cermont/shared-types";
import type { LucideIcon } from "lucide-react";
import {
	AlertTriangle,
	BadgeCheck,
	Cable,
	Camera,
	CheckCircle,
	ClipboardList,
	Package2,
} from "lucide-react";
import type { DashboardSummaryData } from "@/modules/dashboard/hooks/useDashboardSummary";
import type { useServiceCaseSummary } from "@/modules/service-cases";

type ServiceCaseSummaryData = ReturnType<typeof useServiceCaseSummary>["data"];

interface DashboardKpiSource {
	pipeline?: DashboardSummaryData["pipeline"];
	financialAging?: DashboardSummaryData["financialAging"];
	blockers?: DashboardSummaryData["blockers"];
	assetMaintenance?: DashboardSummaryData["assetMaintenance"];
	costVariance?: DashboardSummaryData["costVariance"];
}

/**
 * MetricState — Explicit semantic state for dashboard KPIs.
 *
 * - success:  data loaded, value is meaningful and positive
 * - neutral:  data loaded, value is zero or no-action-needed
 * - empty:    no records exist for this metric
 * - na:       metric is not applicable (e.g. SLA with 0 evaluable cases)
 * - error:    failed to compute
 */
export type MetricState = "success" | "neutral" | "empty" | "na" | "error";

export interface MetricValue {
	value: number;
	state: MetricState;
}

export interface DashboardKpiSnapshot {
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

export interface DashboardOrderSnapshot {
	_id: string;
	code: string;
	assetName?: string;
	status: string;
	createdAt?: string;
}

export interface StatusSummaryItem {
	label: string;
	value: number;
	icon: LucideIcon;
}

export interface CermontKpi {
	id: "lifeline-demand" | "cctv-demand" | "certification-renewal";
	label: string;
	value: number;
	unit: string;
	icon: LucideIcon;
	domainCategory: "lifeline" | "cctv" | "certification";
	emptyStateMessage: string;
}

const DOMAIN_SERVICE_TERMS = {
	lifeline: ["linea de vida", "lineas de vida", "lifeline"],
	cctv: ["cctv", "videovigilancia", "video vigilancia", "camara de seguridad"],
} as const;

function normalizeServiceType(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
}

function countDomainDemand(demand: DashboardServiceDemand, terms: readonly string[]): number {
	return demand.items.reduce((total, item) => {
		const normalized = normalizeServiceType(item.serviceType);
		return terms.some((term) => normalized.includes(term)) ? total + item.requests : total;
	}, 0);
}

export function buildContextualKpis(
	demand: DashboardServiceDemand,
	readiness: DashboardFieldReadiness,
): CermontKpi[] {
	return [
		{
			id: "lifeline-demand",
			label: "Líneas de vida solicitadas",
			value: countDomainDemand(demand, DOMAIN_SERVICE_TERMS.lifeline),
			unit: "solicitudes",
			icon: Cable,
			domainCategory: "lifeline",
			emptyStateMessage: "Sin solicitudes de líneas de vida en el período",
		},
		{
			id: "cctv-demand",
			label: "Proyectos CCTV solicitados",
			value: countDomainDemand(demand, DOMAIN_SERVICE_TERMS.cctv),
			unit: "solicitudes",
			icon: Camera,
			domainCategory: "cctv",
			emptyStateMessage: "Sin solicitudes CCTV en el período",
		},
		{
			id: "certification-renewal",
			label: "Certificaciones HSE por renovar",
			value: readiness.toolCertificationsExpiring + readiness.toolCertificationsExpired,
			unit: "certificaciones",
			icon: BadgeCheck,
			domainCategory: "certification",
			emptyStateMessage: "Sin certificaciones HSE próximas a vencer",
		},
	];
}

export function isDashboardSnapshotStale(generatedAt: string, now = Date.now()): boolean {
	const generatedTime = new Date(generatedAt).getTime();
	return Number.isNaN(generatedTime) || now - generatedTime > 15 * 60_000;
}

export function buildOrdersByStatus(charts: DashboardSummaryData["charts"] | undefined) {
	return (
		charts?.ordersByStatus.map(({ label, value }) => ({
			name: label,
			value,
		})) ?? []
	);
}

export function buildRecentOrders(orders: DashboardOrderSnapshot[]) {
	return orders.slice(0, 10).map((order) => ({
		_id: order._id,
		code: order.code,
		assetName: order.assetName ?? "",
		status: order.status,
		createdAt: order.createdAt ?? "",
	}));
}

export function buildMonthlyTrendData(
	charts: DashboardSummaryData["charts"] | undefined,
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

export function emptyDashboardKpis(): DashboardKpiSnapshot {
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

export function buildDashboardKpiSnapshot(
	dashboardSummary: DashboardKpiSource | undefined,
	serviceCaseSummary: ServiceCaseSummaryData,
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
				dashboardSummary.financialAging?.totalOverdueAmount ??
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

export function buildStatusSummaryItems(
	kpis: DashboardKpiSnapshot,
	activeKitCount: number,
): StatusSummaryItem[] {
	return [
		{
			label: "Órdenes abiertas",
			value: kpis?.overview.active_orders ?? 0,
			icon: ClipboardList,
		},
		{
			label: "Completadas",
			value: kpis?.overview.closed_orders ?? 0,
			icon: CheckCircle,
		},
		{
			label: "Con alerta",
			value: kpis?.overview.overdue_orders ?? 0,
			icon: AlertTriangle,
		},
		{
			label: "Kits activos",
			value: activeKitCount,
			icon: Package2,
		},
	];
}
