import type {
	AnalyticsPeriod,
	ApiBody,
	DashboardTechnicianWorkloadRow,
	DashboardTimeSeriesPoint,
	DashboardTopAsset,
	ExtendedKpis,
	ReportBillingVsCost,
	ReportCycleTimeBucket,
	ReportTechnicianRanking,
} from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/_shared/lib/http/api-client";

interface DashboardKpis {
	overview: {
		total_orders: number;
		active_orders: number;
		closed_orders: number;
		overdue_orders: number;
		maintenance_open_count?: number;
		resource_in_use_count?: number;
		completed_month_count?: number;
	};
	by_stage: Record<string, number>;
	by_priority: Record<string, number>;
	checklists: {
		completion_rate_pct: number;
	};
	financial: {
		total_actual: number;
	};
	lead_time: {
		avg_lead_time_days: number;
	};
}

type DashboardKpisResponse = ApiBody<DashboardKpis>;
type ExtendedKpisResponse = ApiBody<ExtendedKpis>;
type TimeSeriesResponse = ApiBody<DashboardTimeSeriesPoint[]>;
type TopAssetsResponse = ApiBody<DashboardTopAsset[]>;
type TechnicianWorkloadResponse = ApiBody<DashboardTechnicianWorkloadRow[]>;
type ReportCycleTimeResponse = ApiBody<ReportCycleTimeBucket[]>;
type ReportTechnicianRankingResponse = ApiBody<ReportTechnicianRanking[]>;
type BillingVsCostResponse = ApiBody<ReportBillingVsCost[]>;

export const DASHBOARD_KEYS = {
	all: ["dashboard"] as const,
	kpis: (filters?: { startDate?: string; endDate?: string; client?: string }) =>
		["dashboard", "kpis", filters] as const,
	extendedKpis: (period: AnalyticsPeriod) => ["dashboard", "kpis", "extended", period] as const,
	timeSeries: (range: AnalyticsPeriod, client?: string) =>
		["dashboard", "time-series", range, client] as const,
	topAssets: (limit: number) => ["dashboard", "top-assets", limit] as const,
	technicianWorkload: (days: number) => ["dashboard", "technician-workload", days] as const,
	reportCycleTime: (period: AnalyticsPeriod) => ["dashboard", "report-cycle-time", period] as const,
	reportTechnicianRanking: (period: AnalyticsPeriod) =>
		["dashboard", "report-technician-ranking", period] as const,
	billingVsCost: (period: AnalyticsPeriod) => ["dashboard", "billing-vs-cost", period] as const,
} as const;

export function useDashboardKpis(filters?: {
	startDate?: string;
	endDate?: string;
	client?: string;
}) {
	const normalizedFilters = {
		startDate: filters?.startDate || undefined,
		endDate: filters?.endDate || undefined,
		client: filters?.client?.trim() || undefined,
	};

	return useQuery({
		queryKey: DASHBOARD_KEYS.kpis(normalizedFilters),
		queryFn: async () => {
			const queryParams = new URLSearchParams();
			if (normalizedFilters.startDate) {
				queryParams.set("startDate", normalizedFilters.startDate);
			}
			if (normalizedFilters.endDate) {
				queryParams.set("endDate", normalizedFilters.endDate);
			}
			if (normalizedFilters.client) {
				queryParams.set("client", normalizedFilters.client);
			}

			const url = queryParams.toString()
				? `/analytics/kpis?${queryParams.toString()}`
				: "/analytics/kpis";
			const body = await apiClient.get<DashboardKpisResponse>(url);
			if (!body?.success) {
				throw new Error(body?.message || body?.error || "Error al cargar KPIs");
			}
			return body.data;
		},
		staleTime: 30_000,
	});
}

export function useDashboardExtendedKpis(period: AnalyticsPeriod = "30d") {
	return useQuery({
		queryKey: DASHBOARD_KEYS.extendedKpis(period),
		queryFn: async () => {
			const body = await apiClient.get<ExtendedKpisResponse>(
				`/analytics/kpis/extended?period=${period}`,
			);
			if (!body.success) {
				throw new Error(body.message || body.error || "Error al cargar KPIs extendidos");
			}
			return body.data;
		},
		staleTime: 30_000,
	});
}

export function useDashboardFsmMetrics(period: AnalyticsPeriod = "30d") {
	return useDashboardExtendedKpis(period);
}

export function useDashboardTimeSeries(range: AnalyticsPeriod = "30d", client?: string) {
	const normalizedClient = client?.trim() || "";
	return useQuery({
		queryKey: DASHBOARD_KEYS.timeSeries(range, normalizedClient),
		queryFn: async () => {
			const queryParams = new URLSearchParams({ range });
			if (normalizedClient) {
				queryParams.set("client", normalizedClient);
			}

			const body = await apiClient.get<TimeSeriesResponse>(
				`/analytics/time-series?${queryParams.toString()}`,
			);
			if (!body.success) {
				throw new Error(body.message || body.error || "Error al cargar evolución temporal");
			}
			return body.data;
		},
		staleTime: 30_000,
	});
}

export function useDashboardTopAssets(limit = 10) {
	return useQuery({
		queryKey: DASHBOARD_KEYS.topAssets(limit),
		queryFn: async () => {
			const body = await apiClient.get<TopAssetsResponse>(`/analytics/top-assets?limit=${limit}`);
			if (!body.success) {
				throw new Error(body.message || body.error || "Error al cargar activos intervenidos");
			}
			return body.data;
		},
		staleTime: 30_000,
	});
}

export function useDashboardTechnicianWorkload(days = 14) {
	return useQuery({
		queryKey: DASHBOARD_KEYS.technicianWorkload(days),
		queryFn: async () => {
			const body = await apiClient.get<TechnicianWorkloadResponse>(
				`/analytics/technician-workload?days=${days}`,
			);
			if (!body.success) {
				throw new Error(body.message || body.error || "Error al cargar carga por técnico");
			}
			return body.data;
		},
		staleTime: 30_000,
	});
}

export function useReportCycleTimeDistribution(period: AnalyticsPeriod = "30d") {
	return useQuery({
		queryKey: DASHBOARD_KEYS.reportCycleTime(period),
		queryFn: async () => {
			const body = await apiClient.get<ReportCycleTimeResponse>(
				`/analytics/report-cycle-time?period=${period}`,
			);
			if (!body.success) {
				throw new Error(body.message || body.error || "Error al cargar ciclo de reportes");
			}
			return body.data;
		},
		staleTime: 30_000,
	});
}

export function useReportTechnicianRanking(period: AnalyticsPeriod = "30d") {
	return useQuery({
		queryKey: DASHBOARD_KEYS.reportTechnicianRanking(period),
		queryFn: async () => {
			const body = await apiClient.get<ReportTechnicianRankingResponse>(
				`/analytics/report-technician-ranking?period=${period}`,
			);
			if (!body.success) {
				throw new Error(body.message || body.error || "Error al cargar ranking de técnicos");
			}
			return body.data;
		},
		staleTime: 30_000,
	});
}

export function useBillingVsCost(period: AnalyticsPeriod = "30d") {
	return useQuery({
		queryKey: DASHBOARD_KEYS.billingVsCost(period),
		queryFn: async () => {
			const body = await apiClient.get<BillingVsCostResponse>(
				`/analytics/billing-vs-cost?period=${period}`,
			);
			if (!body.success) {
				throw new Error(body.message || body.error || "Error al cargar facturación vs costo");
			}
			return body.data;
		},
		staleTime: 30_000,
	});
}
