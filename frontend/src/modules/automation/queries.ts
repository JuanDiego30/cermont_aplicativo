import type {
	ApiEnvelope,
	AutomationOperationalAction,
	AutomationRule,
	CreateAutomationRuleInput,
	UpdateAutomationRuleInput,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE_CONFIG } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

type AutomationRulesEnvelope = ApiEnvelope<AutomationRule[]>;
type AutomationRuleEnvelope = ApiEnvelope<AutomationRule>;
type AutomationOperationalActionsEnvelope = ApiEnvelope<AutomationOperationalAction[]>;
type AutomationOperationalActionEnvelope = ApiEnvelope<AutomationOperationalAction>;

const AUTOMATION_KEYS = {
	all: ["automation-rules"] as const,
	list: () => [...AUTOMATION_KEYS.all, "list"] as const,
	actions: (status: "open" | "resolved") => [...AUTOMATION_KEYS.all, "actions", status] as const,
} as const;

export function useAutomationRules() {
	return useQuery({
		queryKey: AUTOMATION_KEYS.list(),
		queryFn: async (): Promise<AutomationRule[]> => {
			const response = await apiClient.get<AutomationRulesEnvelope>("/automation-rules");
			if (response?.success === false || !response?.data) {
				throw new Error("No se pudieron cargar las reglas de automatización");
			}
			return response.data;
		},
		staleTime: CACHE_CONFIG.REALTIME,
	});
}

export function useAutomationOperationalActions(status: "open" | "resolved" = "open") {
	return useQuery({
		queryKey: AUTOMATION_KEYS.actions(status),
		queryFn: async (): Promise<AutomationOperationalAction[]> => {
			const response = await apiClient.get<AutomationOperationalActionsEnvelope>(
				`/automation-rules/actions?status=${status}`,
			);
			if (response?.success === false || !response?.data) {
				throw new Error("No se pudieron cargar las acciones operativas");
			}
			return response.data;
		},
		staleTime: CACHE_CONFIG.REALTIME,
	});
}

export function useResolveAutomationOperationalAction() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (actionId: string): Promise<AutomationOperationalAction> => {
			const response = await apiClient.patch<AutomationOperationalActionEnvelope>(
				`/automation-rules/actions/${encodeURIComponent(actionId)}/resolve`,
				{},
			);
			if (response?.success === false || !response?.data) {
				throw new Error("No se pudo resolver la acción operativa");
			}
			return response.data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: AUTOMATION_KEYS.all }),
	});
}

export function useCreateAutomationRule() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: CreateAutomationRuleInput): Promise<AutomationRule> => {
			const response = await apiClient.post<AutomationRuleEnvelope>("/automation-rules", input);
			if (response?.success === false || !response?.data) {
				throw new Error("No se pudo crear la regla de automatización");
			}
			return response.data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: AUTOMATION_KEYS.all }),
	});
}

export function useUpdateAutomationRule(ruleId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: UpdateAutomationRuleInput): Promise<AutomationRule> => {
			const response = await apiClient.patch<AutomationRuleEnvelope>(
				`/automation-rules/${encodeURIComponent(ruleId)}`,
				input,
			);
			if (response?.success === false || !response?.data) {
				throw new Error("No se pudo actualizar la regla de automatización");
			}
			return response.data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: AUTOMATION_KEYS.all }),
	});
}
