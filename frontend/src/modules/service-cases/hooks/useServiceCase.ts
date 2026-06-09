/**
 * ServiceCase hooks — TanStack Query hooks for the pipeline orchestrator
 *
 * Consumes GET /api/service-cases and GET /api/service-cases/summary
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

interface ServiceCaseSummary {
	totalCases: number;
	activeCases: number;
	pendingApproval: number;
	inProgress: number;
	completedThisMonth: number;
	revenue: number;
	// Enhanced operational KPIs
	blockedCases?: number;
	readyToBill?: number;
	readyToClose?: number;
	inExecution?: number;
	inPlanning?: number;
	stepDistribution?: Array<{ stepCode: string; count: number }>;
}

interface SummaryContract {
	success?: boolean;
	data?: ServiceCaseSummary;
}

const SERVICE_CASE_KEYS = {
	all: ["service-cases"] as const,
	summary: ["service-cases", "summary"] as const,
} as const;

export function useServiceCaseSummary() {
	return useQuery({
		queryKey: SERVICE_CASE_KEYS.summary,
		queryFn: async () => {
			const body = await apiClient.get<SummaryContract>("/service-cases/summary");
			return body?.data ?? null;
		},
		staleTime: 30_000,
	});
}
