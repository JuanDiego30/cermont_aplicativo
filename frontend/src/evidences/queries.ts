import type { ApiBody, Evidence } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE_CONFIG } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";

export const EVIDENCE_KEYS = {
	all: ["evidences"] as const,
	byOrder: (orderId: string, filters?: Record<string, unknown>) =>
		[...EVIDENCE_KEYS.all, "order", orderId, filters] as const,
};

// ── Pure Functions (Internal) ──────────────────────────────────

async function fetchEvidencesByOrder(
	orderId: string,
	filters?: Record<string, unknown>,
): Promise<Evidence[]> {
	const queryParams = new URLSearchParams();
	if (filters) {
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				queryParams.set(key, String(value));
			}
		});
	}

	const queryString = queryParams.toString();
	const url = queryString
		? `/evidences/order/${orderId}?${queryString}`
		: `/evidences/order/${orderId}`;

	const body = await apiClient.get<ApiBody<Evidence[]>>(url);
	if (!body?.success || !Array.isArray(body.data)) {
		return [];
	}
	return body.data;
}

// ── Hooks ──────────────────────────────────────────────────────

/**
 * Hook to fetch evidences for a specific work order
 */
export function useEvidences(orderId: string) {
	return useQuery({
		queryKey: EVIDENCE_KEYS.byOrder(orderId),
		queryFn: () => fetchEvidencesByOrder(orderId),
		enabled: Boolean(orderId),
		staleTime: CACHE_CONFIG.REALTIME,
	});
}

/**
 * Hook to fetch evidences with filters (pagination, etc.)
 */
export function useEvidencesByFilter(orderId: string, filters: Record<string, unknown> = {}) {
	return useQuery({
		queryKey: EVIDENCE_KEYS.byOrder(orderId, filters),
		queryFn: () => fetchEvidencesByOrder(orderId, filters),
		enabled: Boolean(orderId),
		staleTime: CACHE_CONFIG.REALTIME,
	});
}

/**
 * Hook to upload a new evidence
 */
export function useUploadEvidence() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (formData: FormData) => {
			const body = await apiClient.post<ApiBody<Evidence>>("/evidences", formData);
			if (!body?.success || !body.data) {
				throw new Error(body?.message || "Evidence could not be uploaded");
			}
			return body.data;
		},
		onSuccess: (_, variables) => {
			// Extract orderId from FormData if possible to invalidate specific order cache
			const orderId = variables.get("orderId") as string;
			if (orderId) {
				void qc.invalidateQueries({ queryKey: EVIDENCE_KEYS.byOrder(orderId) });
			} else {
				void qc.invalidateQueries({ queryKey: EVIDENCE_KEYS.all });
			}
		},
	});
}

/**
 * Hook to delete an evidence
 */
export function useDeleteEvidence() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const body = await apiClient.delete<ApiBody<Evidence>>(`/evidences/${id}`);
			if (!body?.success) {
				throw new Error(body?.message || "Evidence could not be deleted");
			}
			return body.data;
		},
		onSuccess: (data) => {
			if (data?.orderId) {
				void qc.invalidateQueries({ queryKey: EVIDENCE_KEYS.byOrder(String(data.orderId)) });
			} else {
				void qc.invalidateQueries({ queryKey: EVIDENCE_KEYS.all });
			}
		},
	});
}
