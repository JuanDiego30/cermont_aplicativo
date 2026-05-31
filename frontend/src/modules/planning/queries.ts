"use client";

import type {
	ApiEnvelope,
	ApprovePlanningPacketInput,
	PlanningPacket,
	PlanningPacketListQuerySchema,
} from "@cermont/shared-types";
import type { QueryClient } from "@tanstack/react-query";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

type PlanningPacketListQuery = z.infer<typeof PlanningPacketListQuerySchema>;

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

export function usePlanningList(filters?: Partial<PlanningPacketListQuery>) {
	const params = new URLSearchParams();
	if (filters?.workOrderId) {
		params.set("workOrderId", filters.workOrderId);
	}
	if (filters?.status) {
		params.set("status", filters.status);
	}
	if (filters?.limit) {
		params.set("limit", String(filters.limit));
	}

	return useQuery({
		queryKey: PLANNING_KEYS.list(),
		queryFn: async () =>
			unwrapList<PlanningPacket>(
				await apiClient.get<ListEnvelope<PlanningPacket>>(`/planning-packets?${params.toString()}`),
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

export function useCreatePlanningPacket() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: PlanningPacket) =>
			apiClient.post<ApiEnvelope<PlanningPacket>>("/planning-packets", data),
		onSuccess: () => invalidateAll(qc),
	});
}

export function useUpdatePlanningPacket(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: PlanningPacket) =>
			apiClient.put<ApiEnvelope<PlanningPacket>>(`/planning-packets/${id}`, data),
		onSuccess: () => invalidateDetail(qc, id),
	});
}

export function useApprovePlanning(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: ApprovePlanningPacketInput) =>
			apiClient.post<ApiEnvelope<PlanningPacket>>(`/planning-packets/${id}/approve`, data),
		onSuccess: () => invalidateDetail(qc, id),
	});
}

export function useReopenPlanning(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (reason?: string) =>
			apiClient.post<ApiEnvelope<PlanningPacket>>(`/planning-packets/${id}/reopen`, { reason }),
		onSuccess: () => invalidateDetail(qc, id),
	});
}
