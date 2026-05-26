import type { CreateProposalInput, UpdateProposalStatusInput } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listQueryOptions } from "@/_shared/lib/query/query-options";
import { apiClient } from "@/lib/http/api-client";

// ── Types ──────────────────────────────────────────────────────
export interface Proposal {
	_id: string;
	proposalNumber?: string;
	clientName?: string;
	status?: string;
	estimatedValue?: number;
	sentDate?: string | null;
	approvalDate?: string | null;
	poNumber?: string | null;
	workOrderId?: string | null;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface ProposalList {
	success?: boolean;
	data?: Proposal[];
	pagination?: {
		total?: number;
		page?: number;
		totalPages?: number;
		limit?: number;
	};
}

interface ProposalListFilters {
	limit: number;
	offset: number;
	status: string;
}

// ── Query Keys ────────────────────────────────────────────────
const PROPOSALS_KEYS = {
	all: ["proposals"] as const,
	list: (filters: ProposalListFilters) =>
		[...PROPOSALS_KEYS.all, "list", filters.status, filters.limit, filters.offset] as const,
	detail: (id: string) => [...PROPOSALS_KEYS.all, "detail", id] as const,
} as const;

function normalizeProposalFilters(filters?: Record<string, string | number>): ProposalListFilters {
	return {
		limit: typeof filters?.limit === "number" ? filters.limit : 20,
		offset: typeof filters?.offset === "number" ? filters.offset : 0,
		status:
			typeof filters?.status === "string" && filters.status.length > 0 ? filters.status : "all",
	};
}

// ── Queries ───────────────────────────────────────────────────
export function useProposals(filters?: Record<string, string | number>) {
	const normalizedFilters = normalizeProposalFilters(filters);
	return useQuery({
		queryKey: PROPOSALS_KEYS.list(normalizedFilters),
		queryFn: async () => {
			const queryParams = new URLSearchParams();
			queryParams.set("limit", String(normalizedFilters.limit));
			queryParams.set("offset", String(normalizedFilters.offset));
			if (normalizedFilters.status !== "all") {
				queryParams.set("status", normalizedFilters.status);
			}
			const queryString = queryParams.toString();
			const url = queryString ? `/proposals?${queryString}` : "/proposals";
			const body = await apiClient.get<ProposalList>(url);
			return {
				items: body?.data ?? [],
				total: body?.pagination?.total ?? body?.data?.length ?? 0,
			};
		},
		...listQueryOptions,
	});
}

// ── Mutations ─────────────────────────────────────────────────
export function useCreateProposal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateProposalInput) => apiClient.post<Proposal>("/proposals", data),
		onSuccess: () => qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all }),
	});
}

export function useUpdateProposal(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateProposalStatusInput) =>
			apiClient.patch<Proposal>(`/proposals/${id}/status`, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.detail(id) });
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
		},
	});
}

export function useApproveProposal(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.patch<Proposal>(`/proposals/${id}/approve`),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.detail(id) });
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
		},
	});
}

export function useRejectProposal(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.patch<Proposal>(`/proposals/${id}/reject`),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.detail(id) });
			qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
		},
	});
}
