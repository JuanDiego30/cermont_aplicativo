export const CHART_COLORS = {
	slate: "#6b7280",
	blue: "#3b82f6",
	green: "#22c55e",
	amber: "#eab308",
	red: "#ef4444",
	purple: "#8b5cf6",
	indigo: "#6366f1",
	sky: "#0ea5e9",
	gray: "#9ca3af",
} as const;

export const PRIORITY_COLORS: Record<string, string> = {
	low: CHART_COLORS.slate,
	medium: CHART_COLORS.amber,
	high: "#f97316",
	critical: "#dc2626",
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
	draft: CHART_COLORS.slate,
	sent: CHART_COLORS.blue,
	approved: CHART_COLORS.green,
	rejected: CHART_COLORS.red,
	expired: CHART_COLORS.amber,
} as const;

export const DEFAULT_CHART_COLOR = CHART_COLORS.slate;
