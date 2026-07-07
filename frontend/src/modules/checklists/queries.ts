import type {
	ApiEnvelope,
	Checklist,
	CompleteChecklistInput,
	CreateChecklistInput,
	UpdateChecklistItemInput,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";
import { OFFLINE_MUTATION_KEYS } from "@/lib/offline/mutation-defaults";

export interface ChecklistListContract {
	success?: boolean;
	data?: Checklist[];
	error?: string;
	message?: string;
}

export interface UpdateChecklistItemVariables extends UpdateChecklistItemInput {
	checklistId: string;
	orderId: string;
	itemId: string;
}

export interface CompleteChecklistVariables extends CompleteChecklistInput {
	checklistId: string;
	orderId: string;
}

const CHECKLIST_KEYS = {
	all: ["checklists"] as const,
	order: (orderId: string) => [...CHECKLIST_KEYS.all, "order", orderId] as const,
} as const;

export function useChecklist(orderId: string) {
	return useQuery({
		queryKey: CHECKLIST_KEYS.order(orderId),
		queryFn: async (): Promise<Checklist | null> => {
			const body = await apiClient.get<ChecklistListContract>(
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
		mutationKey: OFFLINE_MUTATION_KEYS.checklistCreate,
		mutationFn: async (data: CreateChecklistInput) => {
			const body = await apiClient.post<ApiEnvelope<Checklist>>("/checklists", data);

			if (!body?.success) {
				throw new Error("Failed to create checklist");
			}

			return body.data;
		},
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.order(variables.orderId) });
			queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.all });
		},
	});
}

export function useUpdateChecklistItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.checklistUpdateItem,
		mutationFn: async ({
			checklistId,
			itemId,
			result,
			observation,
		}: UpdateChecklistItemVariables) => {
			const body = await apiClient.patch<ApiEnvelope<Checklist>>(
				`/checklists/${checklistId}/items/${itemId}`,
				{
					result,
					observation,
				},
			);

			if (!body?.success) {
				throw new Error("Failed to update checklist item");
			}

			return body.data;
		},
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.order(variables.orderId) });
			queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.all });
		},
	});
}

export function useCompleteChecklist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.checklistComplete,
		mutationFn: async ({ checklistId, signature, observations }: CompleteChecklistVariables) => {
			const body = await apiClient.post<ApiEnvelope<Checklist>>(
				`/checklists/${checklistId}/validate`,
				{
					signature,
					observations,
				},
			);

			if (!body?.success) {
				throw new Error("Failed to complete checklist");
			}

			return body.data;
		},
		networkMode: "offlineFirst",
		retry: 0,
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.order(variables.orderId) });
			queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.all });
		},
	});
}
