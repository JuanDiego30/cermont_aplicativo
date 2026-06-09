"use client";

import type { CermontOperationalStepCode, ServiceCaseStepContext } from "@cermont/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import { SERVICE_CASE_KEYS } from "@/modules/service-cases/queries";
import { STEP_CONTEXT_KEYS } from "./step-context-queries";

interface SubmitStepPayloadInput {
	serviceCaseId: string;
	stepCode: CermontOperationalStepCode;
	payload: Record<string, unknown>;
}

interface SubmitStepPayloadOutcome {
	success: boolean;
	context?: ServiceCaseStepContext;
	error?: string;
}

/**
 * Hook that submits a step payload with merge control.
 * - Sends only step-specific fields + overrides
 * - Invalidates workflow context, service case, and step context
 * - Returns errors clearly
 */
export function useSubmitStepPayload() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: SubmitStepPayloadInput): Promise<SubmitStepPayloadOutcome> => {
			if (!input.serviceCaseId) {
				return { success: false, error: "serviceCaseId es requerido" };
			}

			try {
				const response = await apiClient.post<{ success: boolean; data: SubmitStepPayloadOutcome }>(
					`/service-cases/${input.serviceCaseId}/step/${input.stepCode}/submit`,
					{
						payload: input.payload,
						stepCode: input.stepCode,
					},
				);
				return response.data;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Error al enviar el paso";
				return { success: false, error: message };
			}
		},
		onSuccess: (_data, variables) => {
			// Invalidate all related caches
			queryClient.invalidateQueries({
				queryKey: SERVICE_CASE_KEYS.detail(variables.serviceCaseId),
			});
			queryClient.invalidateQueries({
				queryKey: STEP_CONTEXT_KEYS.detail(variables.serviceCaseId, variables.stepCode),
			});
			queryClient.invalidateQueries({
				queryKey: SERVICE_CASE_KEYS.list(),
			});
			queryClient.invalidateQueries({
				queryKey: [...STEP_CONTEXT_KEYS.all, variables.serviceCaseId],
			});
		},
	});
}
