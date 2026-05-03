import type {
	ApiBody,
	ConvertProposalToOrderInput,
	CreateProposalInput,
	ListProposalsQuery,
	Order,
	Proposal,
	UpdateProposalStatusInput,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";

export type ProposalListFilters = Partial<Pick<ListProposalsQuery, "limit" | "offset" | "page">> & {
	status?: string;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
};

function buildProposalListQueryString(filters?: ProposalListFilters): string {
	const queryParams = new URLSearchParams();

	if (filters?.limit !== undefined) {
		queryParams.set("limit", String(filters.limit));
	}

	if (filters?.offset !== undefined) {
		queryParams.set("offset", String(filters.offset));
	}

	if (filters?.page !== undefined) {
		queryParams.set("page", String(filters.page));
	}

	if (filters?.status) {
		queryParams.set("status", filters.status);
	}

	if (filters?.search) {
		queryParams.set("search", filters.search);
	}

	if (filters?.dateFrom) {
		queryParams.set("dateFrom", filters.dateFrom);
	}

	if (filters?.dateTo) {
		queryParams.set("dateTo", filters.dateTo);
	}

	return queryParams.toString();
}

interface ProposalListResponse extends ApiBody<Proposal[]> {
	pagination?: {
		total?: number;
		page?: number;
		totalPages?: number;
		limit?: number;
	};
}

interface ProposalDetailResponse extends ApiBody<Proposal> {}

interface ConvertProposalResponse {
	order: Order;
	proposal: Proposal;
}

// ── Query Keys ────────────────────────────────────────────────
export const PROPOSALS_KEYS = {
	all: ["proposals"] as const,
	list: (filters?: ProposalListFilters) =>
		[...PROPOSALS_KEYS.all, "list", buildProposalListQueryString(filters)] as const,
	detail: (id: string) => [...PROPOSALS_KEYS.all, "detail", id] as const,
} as const;

// ── Queries ───────────────────────────────────────────────────
export function useProposals(filters?: ProposalListFilters) {
	const queryString = buildProposalListQueryString(filters);

	return useQuery({
		queryKey: PROPOSALS_KEYS.list(filters),
		queryFn: async () => {
			const url = queryString ? `/proposals?${queryString}` : "/proposals";
			const body = await apiClient.get<ProposalListResponse>(url);
			return {
				items: body?.data ?? [],
				total: body?.pagination?.total ?? body?.data?.length ?? 0,
			};
		},
		staleTime: 30_000,
	});
}

export function useProposal(id: string) {
	return useQuery({
		queryKey: PROPOSALS_KEYS.detail(id),
		queryFn: async () => {
			const body = await apiClient.get<ProposalDetailResponse>(`/proposals/${id}`);
			if (!body?.success || !body.data) {
				throw new Error("Proposal could not be loaded");
			}
			return body.data;
		},
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

// ── Mutations ─────────────────────────────────────────────────
export function useCreateProposal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateProposalInput) => {
			const body = await apiClient.post<ApiBody<Proposal>>("/proposals", data);
			if (!body?.success || !body.data) {
				throw new Error("Proposal could not be created");
			}
			return body.data;
		},
		onSuccess: () => void qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all }),
	});
}

export function useUpdateProposal(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: UpdateProposalStatusInput) => {
			const body = await apiClient.patch<ApiBody<Proposal>>(`/proposals/${id}/status`, data);
			if (!body?.success || !body.data) {
				throw new Error("Proposal could not be updated");
			}
			return body.data;
		},
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
		},
	});
}

export function useDeleteProposal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiClient.delete(`/proposals/${id}`),
		onSuccess: () => void qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all }),
	});
}

export function useApproveProposal(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data?: { poNumber?: string }) => {
			const body = await apiClient.patch<ApiBody<Proposal>>(`/proposals/${id}/approve`, data ?? {});
			if (!body?.success || !body.data) {
				throw new Error("Proposal could not be approved");
			}
			return body.data;
		},
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
		},
	});
}

export function useRejectProposal(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const body = await apiClient.patch<ApiBody<Proposal>>(`/proposals/${id}/reject`);
			if (!body?.success || !body.data) {
				throw new Error("Proposal could not be rejected");
			}
			return body.data;
		},
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
		},
	});
}

export function useConvertProposal(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: ConvertProposalToOrderInput) => {
			const body = await apiClient.post<ApiBody<ConvertProposalResponse>>(
				`/proposals/${id}/convert`,
				data,
			);
			if (!body?.success || !body.data) {
				throw new Error(body?.message || "Proposal could not be converted to an order");
			}
			return body.data;
		},
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.detail(id) });
			void qc.invalidateQueries({ queryKey: PROPOSALS_KEYS.all });
			// Invalidate orders list too as a new one is created
			void qc.invalidateQueries({ queryKey: ["orders"] });
		},
	});
}
