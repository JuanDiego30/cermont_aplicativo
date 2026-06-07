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
	DashboardFinancialAging,
	DashboardNextAction,
	DashboardOfflineSync,
	DashboardPipelineSummary,
	DashboardRecentActivity,
	DashboardSummary,
	DashboardSystemHealth,
} from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

interface DashboardSummaryContract {
	success?: boolean;
	data?: DashboardSummary;
}

const DASHBOARD_KEYS = {
	all: ["dashboard"] as const,
	summary: ["dashboard", "summary"] as const,
} as const;

function mapDashboardSummary(data: DashboardSummary) {
	return {
		pipeline: data.operationalPipeline ?? null,
		blockers: data.blockers ?? null,
		nextActions: data.nextActions ?? [],
		administrativeClosure: data.administrativeClosure ?? null,
		financialAging: data.financialAging ?? null,
		costVariance: data.costVariance ?? null,
		documentWorkload: data.documentWorkload ?? null,
		assetMaintenance: data.assetMaintenance ?? null,
		offlineSync: data.offlineSync ?? null,
		recentActivity: data.recentActivity ?? null,
		charts: data.charts ?? null,
		systemHealth: data.systemHealth ?? null,
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
		costVariance: DashboardCostVariance | null;
		documentWorkload: DashboardDocumentWorkload | null;
		assetMaintenance: DashboardAssetMaintenance | null;
		offlineSync: DashboardOfflineSync | null;
		recentActivity: DashboardRecentActivity | null;
		charts: DashboardCharts | null;
		systemHealth: DashboardSystemHealth | null;
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
