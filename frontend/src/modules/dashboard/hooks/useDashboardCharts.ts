import { useQuery } from "@tanstack/react-query";
import { dashboardApi, type CostComparisonItem } from "../api/dashboard.service";
import { dashboardKeys } from "../query-keys/dashboard.keys";

export function useCostComparison() {
	return useQuery<CostComparisonItem[]>({
		queryKey: dashboardKeys.charts.costComparison,
		queryFn: async () => {
			const res = await dashboardApi.getCostComparison();
			if (!res?.success || !res?.data) {
				throw new Error(
					res?.data ? "No data" : "Error al cargar comparación de costos",
				);
			}
			return res.data;
		},
		staleTime: 30_000,
	});
}
