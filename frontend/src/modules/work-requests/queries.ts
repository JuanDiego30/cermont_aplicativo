import type {
	CreateWorkRequestInput,
	WorkRequest,
	WorkRequestListResponse,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { detailQueryOptions, listQueryOptions } from "@/_shared/lib/query/query-options";
import { apiClient } from "@/lib/http/api-client";

const workRequestsQueryKeys = {
	all: ["work-requests"] as const,
	list: () => [...workRequestsQueryKeys.all, "list"] as const,
	detail: (id: string) => [...workRequestsQueryKeys.all, "detail", id] as const,
	pendingCount: () => [...workRequestsQueryKeys.all, "pendingCount"] as const,
};

async function listWorkRequests(): Promise<WorkRequest[]> {
	const response = await apiClient.get<WorkRequestListResponse>("/work-requests");
	if (!response.success) {
		throw new Error("Error al cargar solicitudes de trabajo");
	}
	return response.data;
}

async function getWorkRequest(id: string): Promise<WorkRequest> {
	const response = await apiClient.get<{ success: boolean; data: WorkRequest }>(
		`/work-requests/${id}`,
	);
	if (!response.success) {
		throw new Error("Error al cargar la solicitud");
	}
	return response.data;
}

export function useWorkRequests() {
	return useQuery({
		queryKey: workRequestsQueryKeys.list(),
		queryFn: listWorkRequests,
		...listQueryOptions,
	});
}

export function useCreateWorkRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateWorkRequestInput) => {
			const response = await apiClient.post<{ success: boolean; data: WorkRequest }>(
				"/work-requests",
				data,
			);
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
		queryFn: () => getWorkRequest(id),
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
			if (response.success && response.pagination) {
				return response.pagination.total;
			}
			return 0;
		},
		enabled,
		...listQueryOptions,
	});
}
