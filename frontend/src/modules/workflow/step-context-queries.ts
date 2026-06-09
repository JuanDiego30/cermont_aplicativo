"use client";

import type {
	ApiEnvelope,
	CermontOperationalStepCode,
	ServiceCaseStepContext,
} from "@cermont/shared-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

// ──────────────────────────────────────────────────────────────────────────────
// Query keys — Centralized SSOT for step context queries
// ──────────────────────────────────────────────────────────────────────────────

export const STEP_CONTEXT_KEYS = {
	all: ["step-context"] as const,
	detail: (serviceCaseId: string, stepCode: CermontOperationalStepCode) =>
		[...STEP_CONTEXT_KEYS.all, serviceCaseId, stepCode] as const,
};

// ──────────────────────────────────────────────────────────────────────────────
// API fetch function
// ──────────────────────────────────────────────────────────────────────────────

async function fetchStepContext(
	serviceCaseId: string,
	stepCode: CermontOperationalStepCode,
): Promise<ServiceCaseStepContext> {
	const response = await apiClient.get<ApiEnvelope<ServiceCaseStepContext>>(
		`/service-cases/${serviceCaseId}/step-context?stepCode=${stepCode}`,
	);
	return response.data;
}

// ──────────────────────────────────────────────────────────────────────────────
// Hook: useStepContext
// Returns the full accumulated context for a given step in a service case.
// Enabled only when both serviceCaseId and stepCode are valid.
// ──────────────────────────────────────────────────────────────────────────────

export function useStepContext(
	serviceCaseId: string,
	stepCode: CermontOperationalStepCode | undefined,
) {
	return useQuery({
		queryKey: STEP_CONTEXT_KEYS.detail(serviceCaseId, stepCode ?? "step_01_work_request"),
		queryFn: () => fetchStepContext(serviceCaseId, stepCode ?? "step_01_work_request"),
		enabled: !!serviceCaseId && !!stepCode,
		staleTime: STALE_TIMES.DETAIL,
	});
}

// ──────────────────────────────────────────────────────────────────────────────
// Hook: useInvalidateStepContext
// Returns a function to invalidate step context caches (useful after mutations).
// ──────────────────────────────────────────────────────────────────────────────

export function useInvalidateStepContext() {
	const queryClient = useQueryClient();

	return {
		invalidateStepContext: (serviceCaseId: string, stepCode: CermontOperationalStepCode) => {
			queryClient.invalidateQueries({
				queryKey: STEP_CONTEXT_KEYS.detail(serviceCaseId, stepCode),
			});
		},
		invalidateAllStepContexts: (serviceCaseId: string) => {
			queryClient.invalidateQueries({
				queryKey: [...STEP_CONTEXT_KEYS.all, serviceCaseId],
			});
		},
	};
}
