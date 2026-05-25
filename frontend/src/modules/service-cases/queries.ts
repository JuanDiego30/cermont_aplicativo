"use client";

import type { ApiEnvelope, ServiceCase, ServiceCaseWorkflowViewModel } from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

type ListEnvelope<T> = ApiEnvelope<T[]> & {
	pagination?: { total?: number; page?: number; limit?: number; totalPages?: number };
};

const SERVICE_CASE_KEYS = {
	all: ["service-cases"] as const,
	list: () => [...SERVICE_CASE_KEYS.all, "list"] as const,
	detail: (id: string) => [...SERVICE_CASE_KEYS.all, "detail", id] as const,
	summary: ["service-cases", "summary"] as const,
};

export function useServiceCaseList() {
	return useQuery({
		queryKey: SERVICE_CASE_KEYS.list(),
		queryFn: async () => {
			const response = await apiClient.get<ListEnvelope<ServiceCase>>("/service-cases?limit=50");
			return {
				items: response.data,
				total: response.pagination?.total ?? response.data.length,
				page: response.pagination?.page ?? 1,
				limit: response.pagination?.limit ?? 20,
				pages: response.pagination?.totalPages ?? 1,
			};
		},
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
	});
}

export function useServiceCase(id: string) {
	return useQuery({
		queryKey: SERVICE_CASE_KEYS.detail(id),
		queryFn: () =>
			apiClient.get<ApiEnvelope<ServiceCaseWorkflowViewModel>>(`/service-cases/${id}/workflow`),
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useAdvanceServiceCaseStep(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			return apiClient.post<ApiEnvelope<ServiceCase>>(`/service-cases/${id}/step/advance`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: SERVICE_CASE_KEYS.detail(id) });
			queryClient.invalidateQueries({ queryKey: SERVICE_CASE_KEYS.list() });
		},
	});
}
