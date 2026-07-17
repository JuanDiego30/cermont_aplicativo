"use client";

import type {
	ApiEnvelope,
	ApprovePlanningPacketInput,
	CreatePlanningPacketInput,
	PlanningPacket,
	ReopenPlanningPacketInput,
	UpdatePlanningPacketInput,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

export const PLANNING_KEYS = {
	all: ["planning-packets"] as const,
	detail: (id: string) => [...PLANNING_KEYS.all, "detail", id] as const,
	byWorkOrder: (workOrderId: string) => [...PLANNING_KEYS.all, "by-work-order", workOrderId] as const,
};

export function usePlanningByWorkOrder(workOrderId: string) {
	return useQuery({
		queryKey: PLANNING_KEYS.byWorkOrder(workOrderId),
		queryFn: async () => {
			const res = await apiClient.get<ApiEnvelope<PlanningPacket>>(
				`/orders/${workOrderId}/planning-packet`,
			);
			return res?.data ?? null;
		},
		enabled: !!workOrderId,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useCreatePlanningPacket() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreatePlanningPacketInput) =>
			apiClient.post<ApiEnvelope<PlanningPacket>>("/planning-packets", data),
		onSuccess: (res) => {
			const packet = res?.data;
			if (packet) {
				void qc.invalidateQueries({ queryKey: PLANNING_KEYS.detail(packet._id) });
				void qc.invalidateQueries({ queryKey: PLANNING_KEYS.byWorkOrder(packet.workOrderId) });
			}
			void qc.invalidateQueries({ queryKey: PLANNING_KEYS.all });
		},
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
		mutationFn: (data: ApprovePlanningPacketInput) =>
			apiClient.post<ApiEnvelope<PlanningPacket>>(`/planning-packets/${id}/approve`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: PLANNING_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: PLANNING_KEYS.all });
		},
	});
}

export function useApplyKitToPlanning(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: { kitTemplateId: string }) =>
			apiClient.post<ApiEnvelope<PlanningPacket>>(`/planning-packets/${id}/apply-kit`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: PLANNING_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: PLANNING_KEYS.all });
		},
	});
}

export function useUpdatePlanningPacket(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdatePlanningPacketInput) =>
			apiClient.patch<ApiEnvelope<PlanningPacket>>(`/planning-packets/${id}`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: PLANNING_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: PLANNING_KEYS.all });
		},
	});
}

export function useReopenPlanning(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: ReopenPlanningPacketInput) =>
			apiClient.post<ApiEnvelope<PlanningPacket>>(`/planning-packets/${id}/reopen`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: PLANNING_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: PLANNING_KEYS.all });
		},
	});
}

export function useValidatePlanningReadiness(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () =>
			apiClient.post<ApiEnvelope<PlanningPacket>>(`/planning-packets/${id}/validate-readiness`),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: PLANNING_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: PLANNING_KEYS.all });
		},
	});
}
