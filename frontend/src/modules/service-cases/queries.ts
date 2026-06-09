"use client";

import type {
	ApiEnvelope,
	OfflineJsonObject,
	ServiceCase,
	ServiceCaseWorkflowViewModel,
} from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient, isOfflineLikeError } from "@/lib/http/api-client";
import {
	readServiceCaseDetailSnapshot,
	readServiceCaseListSnapshot,
	saveServiceCaseDetailSnapshot,
	saveServiceCaseListSnapshot,
} from "@/lib/offline/local-repositories";
import { OFFLINE_MUTATION_KEYS } from "@/lib/offline/mutation-defaults";
import { enqueue, type SyncQueueEntry } from "@/lib/offline/sync-queue";
import { useOfflineStore } from "@/store/offline.store";

type ListEnvelope<T> = ApiEnvelope<T[]> & {
	pagination?: { total?: number; page?: number; limit?: number; totalPages?: number };
};

export type ServiceCaseListSource =
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

export interface ServiceCaseListResult {
	items: ServiceCase[];
	total: number;
	page: number;
	limit: number;
	pages: number;
	source: ServiceCaseListSource;
}

export const SERVICE_CASE_KEYS = {
	all: ["service-cases"] as const,
	list: () => [...SERVICE_CASE_KEYS.all, "list"] as const,
	detail: (id: string) => [...SERVICE_CASE_KEYS.all, "detail", id] as const,
	summary: ["service-cases", "summary"] as const,
};

function createUuid(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isNetworkFailure(error: Error): boolean {
	return !useOfflineStore.getState().isOnline || isOfflineLikeError(error);
}

async function queueServiceCaseAdvance(id: string): Promise<void> {
	const idempotencyKey = createUuid();
	const payload: OfflineJsonObject = {
		serviceCaseId: id,
		idempotencyKey,
	};
	const entry: SyncQueueEntry = {
		id: createUuid(),
		endpoint: `/service-cases/${id}/step/advance`,
		method: "POST",
		payload,
		createdAt: Date.now(),
		retryCount: 0,
		idempotencyKey,
		dedupeKey: `service-cases:advance:${id}:${idempotencyKey}`,
	};

	await enqueue(entry);
}

export async function fetchServiceCaseList(): Promise<ServiceCaseListResult> {
	try {
		const response = await apiClient.get<ListEnvelope<ServiceCase>>("/service-cases?limit=50");
		const result: ServiceCaseListResult = {
			items: response.data,
			total: response.pagination?.total ?? response.data.length,
			page: response.pagination?.page ?? 1,
			limit: response.pagination?.limit ?? 50,
			pages: response.pagination?.totalPages ?? 1,
			source: {
				status: "online",
				updatedAt: new Date().toISOString(),
			},
		};

		await saveServiceCaseListSnapshot(result);
		return result;
	} catch (error) {
		if (error instanceof Error && isNetworkFailure(error)) {
			const localSnapshot = await readServiceCaseListSnapshot();
			if (localSnapshot.status === "found") {
				return {
					items: localSnapshot.snapshot.items,
					total: localSnapshot.snapshot.total,
					page: localSnapshot.snapshot.page,
					limit: localSnapshot.snapshot.limit,
					pages: localSnapshot.snapshot.pages,
					source: {
						status: "offline_snapshot",
						updatedAt: localSnapshot.snapshot.updatedAt,
					},
				};
			}

			return {
				items: [],
				total: 0,
				page: 1,
				limit: 50,
				pages: 0,
				source: {
					status: "offline_empty",
					updatedAt: new Date().toISOString(),
				},
			};
		}

		throw error;
	}
}

export function useServiceCaseList() {
	return useQuery({
		queryKey: SERVICE_CASE_KEYS.list(),
		queryFn: fetchServiceCaseList,
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
	});
}

export function useServiceCase(id: string) {
	return useQuery({
		queryKey: SERVICE_CASE_KEYS.detail(id),
		queryFn: async () => {
			try {
				const response = await apiClient.get<ApiEnvelope<ServiceCaseWorkflowViewModel>>(
					`/service-cases/${id}/workflow`,
				);
				await saveServiceCaseDetailSnapshot(id, response);
				return response;
			} catch (error) {
				if (error instanceof Error && isNetworkFailure(error)) {
					const localSnapshot = await readServiceCaseDetailSnapshot(id);
					if (localSnapshot.status === "found") {
						return localSnapshot.snapshot.envelope;
					}
				}

				throw error;
			}
		},
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

/**
 * Archive a closed service case (gerente only).
 * Soft-archive keeps history but removes from active lists.
 */
export function useArchiveServiceCase(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			return apiClient.post<ApiEnvelope<ServiceCase>>(`/service-cases/${id}/archive`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: SERVICE_CASE_KEYS.detail(id) });
			queryClient.invalidateQueries({ queryKey: SERVICE_CASE_KEYS.list() });
		},
	});
}

export function useAdvanceServiceCaseStep(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: [...OFFLINE_MUTATION_KEYS.serviceCaseAdvanceStep, id],
		networkMode: "offlineFirst",
		mutationFn: async () => {
			try {
				return await apiClient.post<ApiEnvelope<ServiceCase>>(`/service-cases/${id}/step/advance`);
			} catch (error) {
				if (error instanceof Error && isNetworkFailure(error)) {
					await queueServiceCaseAdvance(id);
				}

				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: SERVICE_CASE_KEYS.detail(id) });
			queryClient.invalidateQueries({ queryKey: SERVICE_CASE_KEYS.list() });
		},
	});
}
