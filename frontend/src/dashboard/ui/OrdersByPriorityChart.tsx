"use client";

import { DEFAULT_CHART_COLOR, PRIORITY_COLORS } from "@cermont/shared-types";
import { memo } from "react";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// ── Types ──
interface OrdersByPriorityChartProps {
	data: { name: string; value: number }[];
}

// ── Constants ──
const PRIORITY_LABELS: Record<string, string> = {
	low: "Baja",
	medium: "Media",
	high: "Alta",
	critical: "Crítica",
};

// ── Component ──
export const OrdersByPriorityChart = memo(function OrdersByPriorityChart({
	data,
}: OrdersByPriorityChartProps) {
	const chartData = data
		.filter((d) => d.value > 0)
		.map((d) => ({ ...d, label: PRIORITY_LABELS[d.name] ?? d.name }));

	if (chartData.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-sm text-slate-400">
				Sin datos disponibles
			</div>
		);
	}

	return (
		<div role="img" aria-label="Distribución de órdenes por prioridad">
			<ResponsiveContainer width="100%" height={280}>
				<BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
					<XAxis
						dataKey="label"
						tick={{ fontSize: 12, fill: DEFAULT_CHART_COLOR }}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						allowDecimals={false}
						tick={{ fontSize: 12, fill: DEFAULT_CHART_COLOR }}
						axisLine={false}
						tickLine={false}
					/>
					<Tooltip formatter={(value) => [value ?? 0, "Órdenes"]} cursor={{ fill: "#f9fafb" }} />
					<Bar dataKey="value" radius={[4, 4, 0, 0]}>
						{chartData.map((entry) => (
							<Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? DEFAULT_CHART_COLOR} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
});
