import type { HistoryOrderRow, HistoryOrdersQuery, HistoryStats } from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/_shared/lib/http/api-client";

export const historyKeys = {
	all: ["history"] as const,
	orders: (filters: Partial<HistoryOrdersQuery>) =>
		[...historyKeys.all, "orders", filters] as const,
	stats: () => [...historyKeys.all, "stats"] as const,
};

export function useHistoryOrders(filters: Partial<HistoryOrdersQuery>) {
	return useQuery({
		queryKey: historyKeys.orders(filters),
		queryFn: async () => {
			const searchParams = new URLSearchParams();
			if (filters.page) {
				searchParams.set("page", String(filters.page));
			}
			if (filters.limit) {
				searchParams.set("limit", String(filters.limit));
			}
			if (filters.dateFrom) {
				searchParams.set("dateFrom", filters.dateFrom);
			}
			if (filters.dateTo) {
				searchParams.set("dateTo", filters.dateTo);
			}
			if (filters.client) {
				searchParams.set("client", filters.client);
			}
			if (filters.type) {
				searchParams.set("type", filters.type);
			}
			if (filters.technician) {
				searchParams.set("technician", filters.technician);
			}

			const query = searchParams.toString();
			const url = query ? `/api/history?${query}` : "/api/history";

			const response = await apiClient.get<{
				data: HistoryOrderRow[];
				pagination: { total: number; page: number; limit: number; pages: number };
			}>(url);

			return response;
		},
	});
}

export function useHistoryStats() {
	return useQuery({
		queryKey: historyKeys.stats(),
		queryFn: async () => {
			const stats = await apiClient.get<HistoryStats>("/api/history/stats");
			return stats;
		},
	});
}
