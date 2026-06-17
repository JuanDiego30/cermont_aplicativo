/**
 * ERP Connector — TanStack Query hooks
 */

import type { IErpConnectorConfig } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

const erpConnectorKeys = {
	all: ["erp-connectors"] as const,
	list: () => [...erpConnectorKeys.all, "list"] as const,
	detail: (id: string) => [...erpConnectorKeys.all, "detail", id] as const,
};

export function useErpConnectors() {
	return useQuery({
		queryKey: erpConnectorKeys.list(),
		queryFn: async () => {
			const res = await apiClient.get<{ success: boolean; data: IErpConnectorConfig[] }>(
				"/erp-connectors",
			);
			return res.data;
		},
	});
}

export function useSyncErpConnector() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (provider: string) => apiClient.post(`/erp-connectors/${provider}/sync`, {}),
		onSuccess: () => qc.invalidateQueries({ queryKey: erpConnectorKeys.all }),
	});
}
