import type { ApiBody, Document, DocumentCategory, DocumentPhase } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";

export interface DocumentListFilters {
	orderId?: string;
	category?: DocumentCategory;
	phase?: DocumentPhase;
}

// ── Query Keys ────────────────────────────────────────────────
export const DOCUMENTS_KEYS = {
	all: ["documents"] as const,
	list: (filters?: DocumentListFilters) => [...DOCUMENTS_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...DOCUMENTS_KEYS.all, "detail", id] as const,
} as const;

// ── Queries ───────────────────────────────────────────────────
export function useDocuments(filters?: DocumentListFilters) {
	return useQuery({
		queryKey: DOCUMENTS_KEYS.list(filters),
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
			const url = queryString ? `/documents?${queryString}` : "/documents";
			const body = await apiClient.get<ApiBody<Document[]>>(url);
			return body?.data ?? [];
		},
		staleTime: 30_000,
	});
}

export function useDocument(id: string) {
	return useQuery({
		queryKey: DOCUMENTS_KEYS.detail(id),
		queryFn: async () => {
			const body = await apiClient.get<ApiBody<Document>>(`/documents/${id}`);
			if (!body?.success) {
				throw new Error(body?.message || body?.error || "Error al cargar documento");
			}
			return body.data;
		},
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

// ── Mutations ─────────────────────────────────────────────────
export function useUploadDocument() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (formData: FormData) => {
			return apiClient.post("/documents", formData);
		},
		onSuccess: () => void qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.all }),
	});
}

export function useDeleteDocument() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiClient.delete(`/documents/${id}`),
		onSuccess: () => void qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.all }),
	});
}
