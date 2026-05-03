import type {
	ApiBody,
	Checklist,
	ChecklistStatus,
	ChecklistTemplate,
	CompleteChecklistInput,
	CreateChecklistInput,
	CreateChecklistTemplateInput,
	UpdateChecklistItemInput,
	UpdateChecklistTemplateInput,
} from "@cermont/shared-types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";

export interface ChecklistListFilters {
	orderId?: string;
	status?: ChecklistStatus | string;
}

export interface ChecklistListResponse {
	success?: boolean;
	data?: Checklist[];
	error?: string;
	message?: string;
}

export interface UpdateChecklistItemVariables extends UpdateChecklistItemInput {
	checklistId: string;
	orderId: string;
	itemId: string;
	value?: unknown;
}

export interface CompleteChecklistVariables extends CompleteChecklistInput {
	checklistId: string;
	orderId: string;
}

export const CHECKLIST_KEYS = {
	all: ["checklists"] as const,
	list: (filters?: ChecklistListFilters) => [...CHECKLIST_KEYS.all, "list", filters] as const,
	order: (orderId: string) => [...CHECKLIST_KEYS.all, "order", orderId] as const,
	detail: (id: string) => [...CHECKLIST_KEYS.all, "detail", id] as const,
	templates: ["checklists", "templates"] as const,
} as const;

function buildChecklistQueryString(filters?: ChecklistListFilters): string {
	const queryParams = new URLSearchParams();

	if (filters?.orderId?.trim()) {
		queryParams.set("orderId", filters.orderId.trim());
	}

	if (filters?.status) {
		queryParams.set("status", String(filters.status).trim());
	}

	return queryParams.toString();
}

export function useChecklists(filters?: ChecklistListFilters) {
	const normalizedFilters = {
		orderId: filters?.orderId?.trim() || undefined,
		status: filters?.status ? String(filters.status).trim() : undefined,
	} satisfies ChecklistListFilters;

	return useQuery({
		queryKey: CHECKLIST_KEYS.list(normalizedFilters),
		queryFn: async (): Promise<Checklist[]> => {
			const queryString = buildChecklistQueryString(normalizedFilters);
			const url = queryString ? `/checklists?${queryString}` : "/checklists";
			const body = await apiClient.get<ChecklistListResponse>(url);

			if (!body?.success) {
				throw new Error(body?.message || body?.error || "No se pudieron cargar los checklists");
			}

			return body.data ?? [];
		},
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
	});
}

export function useChecklist(orderId: string) {
	return useQuery({
		queryKey: CHECKLIST_KEYS.order(orderId),
		queryFn: async (): Promise<Checklist | null> => {
			const body = await apiClient.get<ChecklistListResponse>(
				`/checklists/${encodeURIComponent(orderId)}`,
			);

			if (!body?.success) {
				throw new Error(body?.message || body?.error || "No se pudo cargar el checklist");
			}

			return body.data?.[0] ?? null;
		},
		enabled: !!orderId,
		staleTime: STALE_TIMES.REALTIME,
	});
}

export function useCreateChecklist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateChecklistInput) => {
			const body = await apiClient.post<ApiBody<Checklist>>("/checklists", data);

			if (!body?.success) {
				throw new Error("Failed to create checklist");
			}

			return body.data;
		},
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.order(variables.orderId) });
			void queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.all });
		},
	});
}

export function useUpdateChecklistItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			checklistId,
			itemId,
			completed,
			value,
			observation,
		}: UpdateChecklistItemVariables) => {
			const body = await apiClient.patch<ApiBody<Checklist>>(
				`/checklists/${checklistId}/items/${itemId}`,
				{
					completed,
					value,
					observation,
				},
			);

			if (!body?.success) {
				throw new Error("Failed to update checklist item");
			}

			return body.data;
		},
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.order(variables.orderId) });
			void queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.all });
		},
	});
}

export function useCompleteChecklist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ checklistId, signature, observations }: CompleteChecklistVariables) => {
			const body = await apiClient.post<ApiBody<Checklist>>(`/checklists/${checklistId}/validate`, {
				signature,
				observations,
			});

			if (!body?.success) {
				throw new Error("Failed to complete checklist");
			}

			return body.data;
		},
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.order(variables.orderId) });
			void queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.all });
		},
	});
}

// ── Checklist Templates ─────────────────────────────────────

export function useChecklistTemplates() {
	return useQuery({
		queryKey: CHECKLIST_KEYS.templates,
		queryFn: async (): Promise<ChecklistTemplate[]> => {
			const body = await apiClient.get<ApiBody<ChecklistTemplate[]>>("/checklists/templates");
			if (!body?.success) {
				throw new Error(body?.message || "Error al cargar plantillas de checklist");
			}
			return body.data;
		},
		staleTime: STALE_TIMES.REALTIME,
	});
}

export function useChecklistTemplate(id: string) {
	return useQuery({
		queryKey: ["checklists", "templates", id],
		queryFn: async (): Promise<ChecklistTemplate> => {
			const body = await apiClient.get<ApiBody<ChecklistTemplate>>(`/checklists/templates/${id}`);
			if (!body?.success) {
				throw new Error(body?.message || "Error al cargar plantilla");
			}
			return body.data;
		},
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useCreateChecklistTemplate() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateChecklistTemplateInput) =>
			apiClient.post<ChecklistTemplate>("/checklists/templates", data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.templates });
		},
	});
}

export function useUpdateChecklistTemplate(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateChecklistTemplateInput) =>
			apiClient.patch<ChecklistTemplate>(`/checklists/templates/${id}`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: CHECKLIST_KEYS.templates });
			void qc.invalidateQueries({ queryKey: ["checklists", "templates", id] });
		},
	});
}
