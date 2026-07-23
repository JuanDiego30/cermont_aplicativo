import type { DashboardKpiWidget } from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

export const dashboardKpiKeys = {
	all: ["dashboard", "kpis"] as const,
	list: (period: string) => ["dashboard", "kpis", period] as const,
};

export function useDashboardKpis(period: string = "30d") {
	return useQuery<DashboardKpiWidget>({
		queryKey: dashboardKpiKeys.list(period),
		queryFn: () => apiClient.get(`/dashboard/kpis?period=${period}`),
		refetchInterval: 300_000,
	});
}
