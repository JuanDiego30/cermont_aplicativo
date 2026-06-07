"use client";

import type { ApiEnvelope } from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient, isOfflineLikeError } from "@/lib/http/api-client";
import {
	type OfflineDocumentTemplateItem,
	readDocumentTemplateListSnapshot,
	saveDocumentTemplateListSnapshot,
} from "@/lib/offline/local-repositories";
import { useOfflineStore } from "@/store/offline.store";

export interface DocumentTemplateItem extends OfflineDocumentTemplateItem {}

export interface TemplateDraftFieldItem {
	fieldId: string;
	label: string;
	fieldKind: string;
	required?: boolean;
	order?: number;
	confidence?: number;
	options?: string[];
	allowOtherOption?: boolean;
	otherOptionLabel?: string;
	placeholder?: string;
	helpText?: string;
	sourceReference?: string;
}

export interface TemplateDraftTableItem {
	tableId: string;
	title: string;
	description?: string;
}

export interface TemplateDraftSectionItem {
	sectionId: string;
	title: string;
	description?: string;
	order: number;
	fields: TemplateDraftFieldItem[];
	tables: TemplateDraftTableItem[];
}

export interface TemplateDraftItem {
	_id: string;
	name: string;
	description?: string;
	status: "draft" | "review_required" | "approved" | "rejected" | "converted_to_template";
	confidence?: number;
	targetStepCode?: string;
	reviewerNotes?: string;
	sections: TemplateDraftSectionItem[];
	tables: TemplateDraftTableItem[];
	updatedAt?: string;
}

type PaginatedEnvelope<T> = ApiEnvelope<T[]> & {
	pagination?: { total?: number; page?: number; limit?: number; totalPages?: number };
};

export type TemplateListSource =
	| {
			status: "online";
			updatedAt: string;
	  }
	| {
			status: "offline_snapshot";
			updatedAt: string;
	  }
	| {
			status: "offline_empty";
			updatedAt: string;
	  };

export interface TemplateListResult {
	items: DocumentTemplateItem[];
	total: number;
	source: TemplateListSource;
}

export const TEMPLATE_KEYS = {
	all: ["document-templates"] as const,
	list: () => [...TEMPLATE_KEYS.all, "list"] as const,
	detail: (id: string) => [...TEMPLATE_KEYS.all, "detail", id] as const,
	drafts: () => [...TEMPLATE_KEYS.all, "drafts"] as const,
	draftDetail: (id: string) => [...TEMPLATE_KEYS.all, "draft-detail", id] as const,
};

function isNetworkFailure(error: Error): boolean {
	return !useOfflineStore.getState().isOnline || isOfflineLikeError(error);
}

export async function fetchTemplateList(): Promise<TemplateListResult> {
	try {
		const response = await apiClient.get<PaginatedEnvelope<DocumentTemplateItem>>(
			"/document-templates?limit=50",
		);
		const result: TemplateListResult = {
			items: response.data,
			total: response.pagination?.total ?? response.data.length,
			source: {
				status: "online",
				updatedAt: new Date().toISOString(),
			},
		};
		await saveDocumentTemplateListSnapshot(result);
		return result;
	} catch (error) {
		if (error instanceof Error && isNetworkFailure(error)) {
			const localSnapshot = await readDocumentTemplateListSnapshot();
			if (localSnapshot.status === "found") {
				return {
					items: localSnapshot.snapshot.items,
					total: localSnapshot.snapshot.total,
					source: {
						status: "offline_snapshot",
						updatedAt: localSnapshot.snapshot.updatedAt,
					},
				};
			}

			return {
				items: [],
				total: 0,
				source: {
					status: "offline_empty",
					updatedAt: new Date().toISOString(),
				},
			};
		}

		throw error;
	}
}

export function useTemplates() {
	return useQuery({
		queryKey: TEMPLATE_KEYS.list(),
		queryFn: fetchTemplateList,
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
	});
}

export function useTemplate(id: string) {
	return useQuery({
		queryKey: TEMPLATE_KEYS.detail(id),
		queryFn: () => apiClient.get<ApiEnvelope<DocumentTemplateItem>>(`/document-templates/${id}`),
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useTemplateDrafts() {
	return useQuery({
		queryKey: TEMPLATE_KEYS.drafts(),
		queryFn: async () => {
			const response =
				await apiClient.get<PaginatedEnvelope<TemplateDraftItem>>("/template-drafts");
			return {
				items: response.data,
				total: response.pagination?.total ?? response.data.length,
			};
		},
		staleTime: STALE_TIMES.REALTIME,
	});
}

export function useTemplateDraft(id: string) {
	return useQuery({
		queryKey: TEMPLATE_KEYS.draftDetail(id),
		queryFn: () => apiClient.get<ApiEnvelope<TemplateDraftItem>>(`/template-drafts/${id}`),
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useApproveDraft() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, reviewerNotes }: { id: string; reviewerNotes?: string }) =>
			apiClient.post(`/template-drafts/${id}/approve`, { reviewerNotes }),
		onSuccess: (_, variables) => {
			toast.success("Borrador aprobado correctamente");
			qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.draftDetail(variables.id) });
			qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.drafts() });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al aprobar borrador");
		},
	});
}

export function useUpdateDraft(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: Partial<TemplateDraftItem>) =>
			apiClient.patch(`/template-drafts/${id}`, payload),
		onSuccess: () => {
			toast.success("Borrador actualizado");
			qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.draftDetail(id) });
			qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.drafts() });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al actualizar borrador");
		},
	});
}

export function useSubmitDraftForReview(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.post(`/template-drafts/${id}/submit-for-review`, {}),
		onSuccess: () => {
			toast.success("Borrador enviado a revisión");
			qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.draftDetail(id) });
			qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.drafts() });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al enviar borrador a revisión");
		},
	});
}

export function useConvertToTemplate() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiClient.post(`/template-drafts/${id}/convert-to-template`, {}),
		onSuccess: () => {
			toast.success("Borrador convertido a plantilla publicada");
			qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.list() });
			qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.drafts() });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al convertir a plantilla");
		},
	});
}
