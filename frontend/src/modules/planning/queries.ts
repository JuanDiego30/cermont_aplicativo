"use client";

import type { ApiEnvelope, PlanningPacket } from "@cermont/shared-types";
import type { QueryClient } from "@tanstack/react-query";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

type ListEnvelope<T> = ApiEnvelope<T[]> & {
	meta?: { total?: number; page?: number; limit?: number; pages?: number };
};

export type WorkflowList<T> = {
	items: T[];
	total: number;
	page: number;
	limit: number;
	pages: number;
};

const PLANNING_KEYS = {
	all: ["planning-packets"] as const,
	list: () => [...PLANNING_KEYS.all, "list"] as const,
	detail: (id: string) => [...PLANNING_KEYS.all, "detail", id] as const,
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
	qc.invalidateQueries({ queryKey: PLANNING_KEYS.all });
}

function invalidateDetail(qc: QueryClient, id: string) {
	qc.invalidateQueries({ queryKey: PLANNING_KEYS.detail(id) });
	invalidateAll(qc);
}

export function usePlanningList() {
	return useQuery({
		queryKey: PLANNING_KEYS.list(),
		queryFn: async () =>
			unwrapList<PlanningPacket>(
				await apiClient.get<ListEnvelope<PlanningPacket>>("/planning-packets?limit=50"),
			),
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
	});
}

export function usePlanningDetail(id: string) {
	return useQuery({
		queryKey: PLANNING_KEYS.detail(id),
		queryFn: () => apiClient.get<ApiEnvelope<PlanningPacket>>(`/planning-packets/${id}`),
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useApprovePlanning(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () =>
			apiClient.post<ApiEnvelope<PlanningPacket>>(`/planning-packets/${id}/approve`),
		onSuccess: () => invalidateDetail(qc, id),
	});
}
