/**
 * Business Documents — TanStack Query hooks
 */

import type { IBusinessDocument } from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

const businessDocumentKeys = {
	all: ["business-documents"] as const,
	list: (type?: string) => [...businessDocumentKeys.all, "list", type] as const,
	detail: (id: string) => [...businessDocumentKeys.all, "detail", id] as const,
};

export function useBusinessDocuments(documentType?: string) {
	return useQuery({
		queryKey: businessDocumentKeys.list(documentType),
		queryFn: async () => {
			const params = documentType ? `?documentType=${documentType}` : "";
			const res = await apiClient.get<{ success: boolean; data: IBusinessDocument[] }>(
				`/business-documents${params}`,
			);
			return res.data;
		},
	});
}

export function useBusinessDocument(id: string) {
	return useQuery({
		queryKey: businessDocumentKeys.detail(id),
		queryFn: async () => {
			const res = await apiClient.get<{ success: boolean; data: IBusinessDocument }>(
				`/business-documents/${id}`,
			);
			return res.data;
		},
		enabled: !!id,
	});
}
