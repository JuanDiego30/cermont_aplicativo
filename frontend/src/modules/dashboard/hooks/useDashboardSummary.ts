export interface DashboardSummaryData {
	pipeline?: DashboardPipelineSummary;
	financialAging?: DashboardFinancialAging;
	blockers?: DashboardBlockerSummary;
	assetMaintenance?: DashboardAssetMaintenance;
	costVariance?: DashboardCostVariance;
	charts?: DashboardCharts;
	documentWorkload?: DashboardDocumentWorkload;
	administrativeClosure?: DashboardAdministrativeClosure;
	fieldReadiness?: DashboardFieldReadiness;
	serviceDemand?: DashboardServiceDemand;
	generatedAt?: string;
}

/**
 * Dashboard hooks — TanStack Query for business KPIs
 *
 * PROMPT 01 — Dashboard / KPIs
 * Consumes GET /api/dashboard/summary (business metrics only, NO technical errors)
 */

import type {
	DashboardAdministrativeClosure,
	DashboardAssetMaintenance,
	DashboardBlockerSummary,
	DashboardCharts,
	DashboardCostVariance,
	DashboardDocumentWorkload,
	DashboardFieldReadiness,
	DashboardFinancialAging,
	DashboardNextAction,
	DashboardOfflineSync,
	DashboardOperationalKPI,
	DashboardPipelineSummary,
	DashboardRecentActivity,
	DashboardServiceDemand,
	DashboardSlaRiskOrder,
	DashboardSummary,
	DashboardSystemHealth,
} from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

interface DashboardSummaryContract {
	success?: boolean;
	data?: DashboardSummary;
}

interface DashboardOperationalKpiContract {
	success?: boolean;
	data?: DashboardOperationalKPI;
}

interface DashboardSlaRiskContract {
	success?: boolean;
	data?: DashboardSlaRiskOrder[];
}

const DASHBOARD_KEYS = {
	all: ["dashboard"] as const,
	summary: ["dashboard", "summary"] as const,
	operationalKpis: ["dashboard", "operational-kpis"] as const,
	slaRisk: ["dashboard", "sla-risk"] as const,
} as const;

function mapDashboardSummary(data: DashboardSummary) {
	return {
		pipeline: data.operationalPipeline ?? null,
		blockers: data.blockers ?? null,
		nextActions: data.nextActions ?? [],
		administrativeClosure: data.administrativeClosure ?? null,
		financialAging: data.financialAging ?? null,
		fieldReadiness: data.fieldReadiness,
		serviceDemand: data.serviceDemand,
		costVariance: data.costVariance ?? null,
		documentWorkload: data.documentWorkload ?? null,
		assetMaintenance: data.assetMaintenance ?? null,
		offlineSync: data.offlineSync ?? null,
		recentActivity: data.recentActivity ?? null,
		charts: data.charts ?? null,
		systemHealth: data.systemHealth ?? null,
		generatedAt: data.generatedAt,
		isLoading: false,
		isError: false,
		errorMessage: null,
	};
}

export function useDashboardSummary() {
	return useQuery<{
		pipeline: DashboardPipelineSummary | null;
		blockers: DashboardBlockerSummary | null;
		nextActions: DashboardNextAction[] | null;
		administrativeClosure: DashboardAdministrativeClosure | null;
		financialAging: DashboardFinancialAging | null;
		fieldReadiness: DashboardFieldReadiness;
		serviceDemand: DashboardServiceDemand;
		costVariance: DashboardCostVariance | null;
		documentWorkload: DashboardDocumentWorkload | null;
		assetMaintenance: DashboardAssetMaintenance | null;
		offlineSync: DashboardOfflineSync | null;
		recentActivity: DashboardRecentActivity | null;
		charts: DashboardCharts | null;
		systemHealth: DashboardSystemHealth | null;
		generatedAt: string;
		isLoading: boolean;
		isError: boolean;
		errorMessage: string | null;
	}>({
		queryKey: DASHBOARD_KEYS.summary,
		queryFn: async () => {
			const body = await apiClient.get<DashboardSummaryContract>("/dashboard/summary");
			if (!body?.success || !body?.data) {
				throw new Error(body?.data ? "No data" : "Error al cargar el dashboard");
			}
			return mapDashboardSummary(body.data);
		},
		staleTime: 15_000,
	});
}

export function useDashboardOperationalKpis() {
	return useQuery({
		queryKey: DASHBOARD_KEYS.operationalKpis,
		queryFn: async (): Promise<DashboardOperationalKPI> => {
			const body = await apiClient.get<DashboardOperationalKpiContract>(
				"/dashboard/operational-kpis",
			);
			if (!body?.success || !body.data) {
				throw new Error("Error al cargar los KPI operativos");
			}
			return body.data;
		},
		staleTime: 30_000,
	});
}

export function useDashboardSlaRisk() {
	return useQuery({
		queryKey: DASHBOARD_KEYS.slaRisk,
		queryFn: async (): Promise<DashboardSlaRiskOrder[]> => {
			const body = await apiClient.get<DashboardSlaRiskContract>("/dashboard/sla-risk");
			if (!body?.success || !body.data) {
				throw new Error("Error al cargar el riesgo SLA");
			}
			return body.data;
		},
		staleTime: 30_000,
	});
}
