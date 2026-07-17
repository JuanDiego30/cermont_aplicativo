/**
 * Dashboard API Client Service
 *
 * Centralized API calls for the dashboard module.
 * All calls go through apiClient — no direct fetch.
 */

import { apiClient } from "@/lib/http/api-client";
import type { DashboardKPIResponse } from "@cermont/shared-types";

export interface ApiResponse<T> {
	success: boolean;
	data: T;
}

export interface CostComparisonItem {
	label: string;
	proposed: number;
	actual: number;
}

export const dashboardApi = {
	getKPIs: (role?: string) =>
		apiClient.get<ApiResponse<DashboardKPIResponse>>(
			`/dashboard/kpis${role ? `?role=${role}` : ""}`,
		),

	getCostComparison: () =>
		apiClient.get<ApiResponse<CostComparisonItem[]>>(
			"/dashboard/charts/cost-comparison",
		),

	getSummary: () => apiClient.get<ApiResponse<unknown>>("/dashboard/summary"),
};
