import type {
	CreateProposalInput,
	Proposal,
	UpdateProposalStatusInput,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listQueryOptions } from "@/lib/constants/query-options";
import { apiClient } from "@/lib/http/api-client";

import { OFFLINE_MUTATION_KEYS } from "@/lib/offline/mutation-defaults";

// Re-export Proposal type for backward compatibility
export type { Proposal } from "@cermont/shared-types";

// ── Query Keys ────────────────────────────────────────────────
export const PROPOSALS_KEYS = {
	all: ["proposals"] as const,
	list: (status: string, limit: number, offset: number) =>
		[...PROPOSALS_KEYS.all, "list", status, limit, offset] as const,
	detail: (id: string) => [...PROPOSALS_KEYS.all, "detail", id] as const,
} as const;

function normalizeProposalFilters(filters?: Record<string, string | number>) {
	const status =
		typeof filters?.status === "string" && filters.status.length > 0 ? filters.status : "all";
	const limit = typeof filters?.limit === "number" ? filters.limit : 20;
	const offset = typeof filters?.offset === "number" ? filters.offset : 0;
	return { status, limit, offset };
}

// ── Queries ───────────────────────────────────────────────────
export function useProposals(filters?: Record<string, string | number>) {
	const normalizedFilters = normalizeProposalFilters(filters);
	return useQuery({
		queryKey: PROPOSALS_KEYS.list(
			normalizedFilters.status,
			normalizedFilters.limit,
			normalizedFilters.offset,
		),
		queryFn: async () => {
			const queryParams = new URLSearchParams();
			queryParams.set("limit", String(normalizedFilters.limit));
			queryParams.set("offset", String(normalizedFilters.offset));
			if (normalizedFilters.status !== "all") {
				queryParams.set("status", normalizedFilters.status);
			}
			const queryString = queryParams.toString();
			const url = queryString ? `/proposals?${queryString}` : "/proposals";
			const response = await apiClient.get<{ success: boolean; data: Proposal[] }>(url);
			return {
				items: response.data,
				total: response.data.length,
			};
		},
		...listQueryOptions,
	});
}

// ── Mutations ─────────────────────────────────────────────────
export function useCreateProposal() {
	const qc = useQueryClient();
	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.proposalCreate,
		mutationFn: (data: CreateProposalInput) => apiClient.post<Proposal>("/proposals", data),
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: () => qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all }),
	});
}

export function useUpdateProposal(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.proposalUpdate,
		mutationFn: (data: UpdateProposalStatusInput) =>
			apiClient.patch<Proposal>(`/proposals/${id}/status`, data),
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.detail(id) });
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
		},
	});
}

export function useApproveProposal(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.proposalApprove,
		mutationFn: () => apiClient.patch<Proposal>(`/proposals/${id}/approve`),
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.detail(id) });
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
			qc.invalidateQueries({ queryKey: ["service-cases"] });
		},
	});
}

export function useRejectProposal(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.proposalReject,
		mutationFn: () => apiClient.patch<Proposal>(`/proposals/${id}/reject`),
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.detail(id) });
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
		},
	});
}
