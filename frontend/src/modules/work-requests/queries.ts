import type {
	CreateWorkRequestInput,
	WorkRequest,
	WorkRequestListResponse,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { detailQueryOptions, listQueryOptions } from "@/lib/constants/query-options";
import { apiClient, isOfflineLikeError } from "@/lib/http/api-client";
import {
	readWorkRequestListSnapshot,
	saveWorkRequestListSnapshot,
} from "@/lib/offline/local-repositories";
import { OFFLINE_MUTATION_KEYS } from "@/lib/offline/mutation-defaults";
import { SERVICE_CASE_KEYS } from "@/modules/service-cases/queries";
import { useOfflineStore } from "@/store/offline.store";

export type WorkRequestListSource =
	| {
			status: "online";
			updatedAt: string;
	  }
	| {
			status: "offline_snapshot";
			updatedAt: string;
	  }
	| {
			status: "offline_empty";
			updatedAt: string;
	  };

export interface WorkRequestListResult {
	items: WorkRequest[];
	source: WorkRequestListSource;
}

export const WORK_REQUEST_KEYS = {
	all: ["work-requests"] as const,
	list: () => [...WORK_REQUEST_KEYS.all, "list"] as const,
	detail: (id: string) => [...WORK_REQUEST_KEYS.all, "detail", id] as const,
	pendingCount: () => [...WORK_REQUEST_KEYS.all, "pendingCount"] as const,
};

function isNetworkFailure(error: Error): boolean {
	return !useOfflineStore.getState().isOnline || isOfflineLikeError(error);
}

export async function fetchWorkRequestList(): Promise<WorkRequestListResult> {
	try {
		const response = await apiClient.get<WorkRequestListResponse>("/work-requests");
		await saveWorkRequestListSnapshot(response.data);
		return {
			items: response.data,
			source: {
				status: "online",
				updatedAt: new Date().toISOString(),
			},
		};
	} catch (error) {
		if (error instanceof Error && isNetworkFailure(error)) {
			const localSnapshot = await readWorkRequestListSnapshot();
			if (localSnapshot.status === "found") {
				return {
					items: localSnapshot.snapshot.items,
					source: {
						status: "offline_snapshot",
						updatedAt: localSnapshot.snapshot.updatedAt,
					},
				};
			}

			return {
				items: [],
				source: {
					status: "offline_empty",
					updatedAt: new Date().toISOString(),
				},
			};
		}

		throw error;
	}
}

export function useWorkRequests() {
	return useQuery({
		queryKey: WORK_REQUEST_KEYS.list(),
		queryFn: fetchWorkRequestList,
		...listQueryOptions,
	});
}

export function useCreateWorkRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.workRequestCreate,
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
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: WORK_REQUEST_KEYS.all }),
	});
}

export function useWorkRequest(id: string) {
	return useQuery({
		queryKey: WORK_REQUEST_KEYS.detail(id),
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

export function useQualifyWorkRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: [...WORK_REQUEST_KEYS.all, "qualify"],
		mutationFn: async (id: string) => {
			const response = await apiClient.post<{
				success: boolean;
				data: { workRequest: WorkRequest; serviceCase: { _id: string; code: string } };
			}>(`/work-requests/${id}/qualify`);
			if (!response.success) {
				throw new Error("Error al calificar la solicitud");
			}
			return response.data;
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: WORK_REQUEST_KEYS.detail(variables) });
			queryClient.invalidateQueries({ queryKey: WORK_REQUEST_KEYS.list() });
			queryClient.invalidateQueries({ queryKey: WORK_REQUEST_KEYS.pendingCount() });
			queryClient.invalidateQueries({ queryKey: SERVICE_CASE_KEYS.all });
		},
	});
}

export function useUpdateWorkRequestStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, status }: { id: string; status: string }) => {
			const response = await apiClient.patch<{ success: boolean; data: WorkRequest }>(
				`/work-requests/${id}/status`,
				{ status },
			);
			if (!response.success) {
				throw new Error("Error al actualizar estado");
			}
			return response.data;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: WORK_REQUEST_KEYS.all });
			void queryClient.invalidateQueries({ queryKey: WORK_REQUEST_KEYS.pendingCount() });
			void queryClient.invalidateQueries({ queryKey: SERVICE_CASE_KEYS.all });
		},
	});
}

export function usePendingWorkRequestCount(enabled: boolean) {
	return useQuery({
		queryKey: WORK_REQUEST_KEYS.pendingCount(),
		queryFn: async () => {
			const response = await apiClient.get<WorkRequestListResponse>(
				"/work-requests?status=submitted&status=qualified&limit=1",
			);
			return response.pagination?.total ?? 0;
		},
		enabled,
		...listQueryOptions,
		refetchInterval: 60_000,
	});
}
