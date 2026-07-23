/**
 * Dashboard Query Keys — Stable TanStack Query keys
 *
 * SSOT for all dashboard-related query key definitions.
 * Keys are readonly tuples to ensure immutability.
 */

const BASE = ["dashboard"] as const;

export const dashboardKeys = {
	all: BASE,
	kpis: (role?: string) => [...BASE, "kpis", role] as const,
	charts: {
		all: [...BASE, "charts"] as const,
		orderStatus: [...BASE, "charts", "order-status"] as const,
		monthlyTrend: (months?: number) =>
			[...BASE, "charts", "monthly-trend", months] as const,
		costComparison: [...BASE, "charts", "cost-comparison"] as const,
	},
	sla: [...BASE, "sla"] as const,
	summary: () => [...BASE, "summary"] as const,
	activity: (limit?: number) => [...BASE, "activity", limit] as const,
	recentOrders: (limit?: number) => [...BASE, "recent-orders", limit] as const,
	operationalKpis: (periodFrom?: string, periodTo?: string) =>
		[...BASE, "operational-kpis", periodFrom, periodTo] as const,
	predictiveAlerts: () => [...BASE, "predictive"] as const,
	healthScore: () => [...BASE, "health-score"] as const,
} as const;
