import type { ApiBody, DashboardAlert } from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/_shared/lib/http/api-client";

type DashboardAlertsResponse = ApiBody<DashboardAlert[]>;

export function useDashboardAlerts() {
	return useQuery({
		queryKey: ["dashboard", "alerts"],
		queryFn: async () => {
			const body = await apiClient.get<DashboardAlertsResponse>("/alerts");
			if (!body.success) {
				throw new Error(body.message || body.error || "No se pudieron cargar las alertas");
			}

			return body.data;
		},
		staleTime: 5 * 60 * 1000,
	});
}
