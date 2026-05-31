import type { ApiEnvelope } from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/http/api-client";
import type { DocumentRecord } from "./document-lifecycle";

type DocumentDeleteOutcome =
	| {
			status: "archived";
			documentId: string;
			retentionUntil: string;
	  }
	| {
			status: "deleted";
			documentId: string;
	  };

const DOCUMENTS_KEYS = {
	all: ["documents"] as const,
	list: (filters?: Record<string, unknown>) => [...DOCUMENTS_KEYS.all, "list", filters] as const,
	detail: (id: string) => [...DOCUMENTS_KEYS.all, "detail", id] as const,
} as const;

function formatRetentionDate(value: string): string {
	try {
		return new Date(value).toLocaleDateString("es-CO", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	} catch {
		return value;
	}
}

function buildArchiveToastMessage(document: DocumentRecord): string {
	if (!document.retentionUntil) {
		return "Documento archivado correctamente";
	}

	return `Documento archivado con retencion hasta ${formatRetentionDate(document.retentionUntil)}`;
}

function buildDeleteToastMessage(result: DocumentDeleteOutcome): string {
	if (result.status === "deleted") {
		return "Documento eliminado correctamente";
	}

	return `Documento protegido archivado con retencion hasta ${formatRetentionDate(result.retentionUntil)}`;
}

export function useDocuments(filters?: Record<string, unknown>) {
	return useQuery({
		queryKey: DOCUMENTS_KEYS.list(filters),
		queryFn: async () => {
			const queryParams = new URLSearchParams();
			if (filters) {
				Object.entries(filters).forEach(([key, value]) => {
					if (value !== void 0) {
						queryParams.set(key, String(value));
					}
				});
			}
			const queryString = queryParams.toString();
			const url = queryString ? `/documents?${queryString}` : "/documents";
			const response = await apiClient.get<ApiEnvelope<DocumentRecord[]>>(url);
			return response.data ?? [];
		},
		staleTime: 30_000,
		placeholderData: keepPreviousData,
	});
}

export function useLibraryDocuments() {
	return useDocuments({ purpose: "library" });
}

export function useArchiveDocument() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
			const response = await apiClient.patch<ApiEnvelope<DocumentRecord>>(
				`/documents/${id}/archive`,
				reason ? { reason } : {},
			);
			return response.data;
		},
		onSuccess: (document) => {
			queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEYS.all });
			toast.success(buildArchiveToastMessage(document));
		},
		onError: (error: Error) => {
			toast.error(error.message ?? "Error al archivar el documento");
		},
	});
}

export function useDeleteDocument() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
			const response = await apiClient.delete<ApiEnvelope<DocumentDeleteOutcome>>(`/documents/${id}`, {
				body: reason ? JSON.stringify({ reason }) : void 0,
			});
			return response.data;
		},
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEYS.all });
			toast.success(buildDeleteToastMessage(result));
		},
		onError: (error: Error) => {
			toast.error(error.message ?? "Error al eliminar el documento");
		},
	});
}

export function useSignDocument() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id }: { id: string }) => {
			const response = await apiClient.patch<ApiEnvelope<DocumentRecord>>(`/documents/${id}/sign`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEYS.all });
			toast.success("Documento firmado correctamente");
		},
		onError: (error: Error) => {
			toast.error(error.message ?? "Error al firmar el documento");
		},
	});
}

export { DOCUMENTS_KEYS };
export type { DocumentDeleteOutcome, DocumentRecord };
