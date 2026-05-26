"use client";

import type { ApiEnvelope, SiteVisitRecord } from "@cermont/shared-types";
import type { QueryClient } from "@tanstack/react-query";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

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
};

const SITE_VISIT_KEYS = {
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
	};
}

function invalidateAll(qc: QueryClient) {
	qc.invalidateQueries({ queryKey: SITE_VISIT_KEYS.all });
}

function invalidateDetail(qc: QueryClient, id: string) {
	qc.invalidateQueries({ queryKey: SITE_VISIT_KEYS.detail(id) });
	invalidateAll(qc);
}

// ─── List query ────────────────────────────────────────────────────────────

export function useSiteVisitsList() {
	return useQuery({
		queryKey: SITE_VISIT_KEYS.list(),
		queryFn: async () =>
			unwrapList<SiteVisitRecord>(
				await apiClient.get<ListEnvelope<SiteVisitRecord>>("/site-visits?limit=50"),
			),
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
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
		mutationFn: (data: Record<string, unknown>) =>
			apiClient.post<ApiEnvelope<SiteVisitRecord>>("/site-visits", data),
		onSuccess: () => invalidateAll(qc),
	});
}

export function useStartSiteVisit(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.post<ApiEnvelope<SiteVisitRecord>>(`/site-visits/${id}/start`),
		onSuccess: () => invalidateDetail(qc, id),
	});
}

export function useCompleteSiteVisit(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: Record<string, unknown>) =>
			apiClient.post<ApiEnvelope<SiteVisitRecord>>(`/site-visits/${id}/complete`, data),
		onSuccess: () => invalidateDetail(qc, id),
	});
}

export function useCancelSiteVisit(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: { reason: string }) =>
			apiClient.post<ApiEnvelope<SiteVisitRecord>>(`/site-visits/${id}/cancel`, data),
		onSuccess: () => invalidateDetail(qc, id),
	});
}
