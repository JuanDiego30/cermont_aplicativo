"use client";

import type { CostProposalInput, CostProposalResult } from "@cermont/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

export function useCostSuggestion() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CostProposalInput): Promise<CostProposalResult> => {
			const body = await apiClient.post<{ success: boolean; data?: CostProposalResult }>(
				"/costs/suggest",
				input,
			);
			if (!body?.data) {
				throw new Error("No se pudo generar la sugerencia de costos");
			}
			return body.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["costs"] });
		},
	});
}
