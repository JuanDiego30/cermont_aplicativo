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

export interface PredictiveAlert {
	id: string;
	type: "sla_breach_risk" | "resource_bottleneck" | "workload_spike" | "revenue_dip";
	severity: "low" | "medium" | "high" | "critical";
	title: string;
	description: string;
	probability: number;
	daysToImpact: number;
	affectedEntity?: string;
	suggestedAction?: string;
}

export interface HealthScoreBreakdown {
	label: string;
	score: number;
	maxScore: number;
	status: "good" | "fair" | "poor";
}

export interface HealthScore {
	overall: number;
	sla: number;
	efficiency: number;
	financial: number;
	workload: number;
	trend: "improving" | "stable" | "declining";
	breakdown: HealthScoreBreakdown[];
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

	getPredictiveAlerts: () =>
		apiClient.get<ApiResponse<PredictiveAlert[]>>(
			"/dashboard/predictive-alerts",
		),

	getHealthScore: () =>
		apiClient.get<ApiResponse<HealthScore>>(
			"/dashboard/health-score",
		),
};
