"use client";

import type { ApiEnvelope, SiteVisitRecord } from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { ApiError, apiClient, isOfflineLikeError } from "@/lib/http/api-client";
import {
	readSiteVisitListSnapshot,
	saveSiteVisitListSnapshot,
} from "@/lib/offline/local-repositories";
import { OFFLINE_MUTATION_KEYS } from "@/lib/offline/mutation-defaults";
import { useOfflineStore } from "@/store/offline.store";

type ListEnvelope<T> = ApiEnvelope<T[]> & {
	meta?: {
		total?: number;
		page?: number;
		limit?: number;
		pages?: number;
	};
};

export type WorkflowList<T> = {
	items: T[];
	total: number;
	page: number;
	limit: number;
	pages: number;
	source: WorkflowListSource;
};

export type WorkflowListSource =
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

export const SITE_VISIT_KEYS = {
	all: ["site-visits"] as const,
	list: () => [...SITE_VISIT_KEYS.all, "list"] as const,
	detail: (id: string) => [...SITE_VISIT_KEYS.all, "detail", id] as const,
};

function unwrapList<T>(response: ListEnvelope<T>): WorkflowList<T> {
	return {
		items: response.data,
		total: response.meta?.total ?? response.data.length,
		page: response.meta?.page ?? 1,
		limit: response.meta?.limit ?? response.data.length,
		pages: response.meta?.pages ?? 1,
		source: {
			status: "online",
			updatedAt: new Date().toISOString(),
		},
	};
}

function isNetworkFailure(error: Error): boolean {
	return !useOfflineStore.getState().isOnline || isOfflineLikeError(error);
}

// ─── List query ────────────────────────────────────────────────────────────

export async function fetchSiteVisitList(): Promise<WorkflowList<SiteVisitRecord>> {
	try {
		const result = unwrapList<SiteVisitRecord>(
			await apiClient.get<ListEnvelope<SiteVisitRecord>>("/site-visits?limit=50"),
		);
		await saveSiteVisitListSnapshot(result);
		return result;
	} catch (error) {
		if (error instanceof Error && isNetworkFailure(error)) {
			const localSnapshot = await readSiteVisitListSnapshot();
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

export function useSiteVisitsList() {
	return useQuery({
		queryKey: SITE_VISIT_KEYS.list(),
		queryFn: fetchSiteVisitList,
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
		// api-client already retries internally — avoid TanStack Query
		// stacking retries on top and creating a request storm.
		retry: 0,
		refetchOnWindowFocus: false,
	});
}

// ─── Detail query ──────────────────────────────────────────────────────────

export function useSiteVisit(id: string) {
	return useQuery({
		queryKey: SITE_VISIT_KEYS.detail(id),
		queryFn: () => apiClient.get<ApiEnvelope<SiteVisitRecord>>(`/site-visits/${id}`),
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

// ─── Mutations ─────────────────────────────────────────────────────────────

export function useCreateSiteVisit() {
	const qc = useQueryClient();
	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.siteVisitCreate,
		mutationFn: (data: Record<string, unknown>) =>
			apiClient.post<ApiEnvelope<SiteVisitRecord>>("/site-visits", data),
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: SITE_VISIT_KEYS.all });
		},
		onError: (error) => {
			if (error instanceof ApiError) {
				console.warn(`[site-visits:create:error] status=${error.status} code=${error.code}`, {
					details: error.details,
					message: error.message,
				});
			}
		},
	});
}

export function useStartSiteVisit(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.siteVisitStart,
		mutationFn: () => apiClient.post<ApiEnvelope<SiteVisitRecord>>(`/site-visits/${id}/start`),
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: SITE_VISIT_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: SITE_VISIT_KEYS.all });
		},
	});
}

export function useCompleteSiteVisit(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.siteVisitComplete,
		mutationFn: (data: Record<string, unknown>) =>
			apiClient.post<ApiEnvelope<SiteVisitRecord>>(`/site-visits/${id}/complete`, data),
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: SITE_VISIT_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: SITE_VISIT_KEYS.all });
		},
	});
}

export function useCancelSiteVisit(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.siteVisitCancel,
		mutationFn: (data: { reason: string }) =>
			apiClient.post<ApiEnvelope<SiteVisitRecord>>(`/site-visits/${id}/cancel`, data),
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: SITE_VISIT_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: SITE_VISIT_KEYS.all });
		},
	});
}
