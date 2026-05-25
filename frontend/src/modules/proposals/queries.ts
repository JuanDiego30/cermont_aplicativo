import type { CreateProposalInput, UpdateProposalStatusInput } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

// ── Query Keys ────────────────────────────────────────────────
const PROPOSALS_KEYS = {
	all: ["proposals"] as const,
	list: (filters?: Record<string, unknown>) => [...PROPOSALS_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...PROPOSALS_KEYS.all, "detail", id] as const,
} as const;

// ── Queries ───────────────────────────────────────────────────
export function useProposals(filters?: Record<string, unknown>) {
	return useQuery({
		queryKey: PROPOSALS_KEYS.list(filters),
		queryFn: async () => {
			const queryParams = new URLSearchParams();
			if (filters) {
				Object.entries(filters).forEach(([key, value]) => {
					if (value !== undefined && value !== null) {
						queryParams.set(key, String(value));
					}
				});
			}
			const queryString = queryParams.toString();
			const url = queryString ? `/proposals?${queryString}` : "/proposals";
			const body = await apiClient.get<ProposalList>(url);
			return {
				items: body?.data ?? [],
				total: body?.pagination?.total ?? body?.data?.length ?? 0,
			};
		},
		staleTime: 30_000,
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
