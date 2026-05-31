import type {
	CreateWorkRequestInput,
	WorkRequest,
	WorkRequestListResponse,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { detailQueryOptions, listQueryOptions } from "@/lib/constants/query-options";
import { apiClient } from "@/lib/http/api-client";

const workRequestsQueryKeys = {
	all: ["work-requests"] as const,
	list: () => [...workRequestsQueryKeys.all, "list"] as const,
	detail: (id: string) => [...workRequestsQueryKeys.all, "detail", id] as const,
	pendingCount: () => [...workRequestsQueryKeys.all, "pendingCount"] as const,
};

export function useWorkRequests() {
	return useQuery({
		queryKey: workRequestsQueryKeys.list(),
		queryFn: async () => {
			const response = await apiClient.get<WorkRequestListResponse>("/work-requests");
			return response.data;
		},
		...listQueryOptions,
	});
}

export function useCreateWorkRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateWorkRequestInput) => {
			const response = await apiClient.post<{
				success: boolean;
				data: { workRequest: WorkRequest; serviceCase: { _id: string; code: string } };
			}>("/work-requests", data);
			if (!response.success) {
				throw new Error("Error al crear la solicitud");
			}
			return response.data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: workRequestsQueryKeys.all }),
	});
}

export function useWorkRequest(id: string) {
	return useQuery({
		queryKey: workRequestsQueryKeys.detail(id),
		queryFn: async () => {
			const response = await apiClient.get<{ success: boolean; data: WorkRequest }>(
				`/work-requests/${id}`,
			);
			return response.data;
		},
		enabled: Boolean(id),
		...detailQueryOptions,
	});
}

export function usePendingWorkRequestCount(enabled: boolean) {
	return useQuery({
		queryKey: workRequestsQueryKeys.pendingCount(),
		queryFn: async () => {
			const response = await apiClient.get<WorkRequestListResponse>(
				"/work-requests?status=submitted&status=qualified&limit=1",
			);
			return response.pagination?.total ?? 0;
		},
		enabled,
		...listQueryOptions,
	});
}
