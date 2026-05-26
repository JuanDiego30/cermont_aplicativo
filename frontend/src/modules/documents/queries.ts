import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

// ── Types ──────────────────────────────────────────────────────
interface DocumentRecord {
	_id: string;
	title: string;
	file_url: string;
	file_size?: number;
	mime_type?: string;
	order_id?: string;
	signed?: boolean;
	signedBy?: string;
	signedAt?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface DocumentList {
	success?: boolean;
	data?: DocumentRecord[];
}

// ── Query Keys ────────────────────────────────────────────────
const DOCUMENTS_KEYS = {
	all: ["documents"] as const,
	list: (filters?: Record<string, unknown>) => [...DOCUMENTS_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...DOCUMENTS_KEYS.all, "detail", id] as const,
} as const;

// ── Queries ───────────────────────────────────────────────────
export function useDocuments(filters?: Record<string, unknown>) {
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
			const body = await apiClient.get<DocumentList>(url);
			return body?.data ?? [];
		},
		staleTime: 30_000,
		placeholderData: keepPreviousData,
	});
}

export function useLibraryDocuments() {
	return useDocuments({ purpose: "library" });
}
