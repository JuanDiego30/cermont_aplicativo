"use client";

import { CHART_COLORS, DEFAULT_CHART_COLOR } from "@cermont/shared-types";
import { memo } from "react";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// ── Types ──
interface WorkerPerformanceChartProps {
	data: { name: string; orders: number }[];
}

// ── Component ──
export const WorkerPerformanceChart = memo(function WorkerPerformanceChart({
	data,
}: WorkerPerformanceChartProps) {
	const chartData = data.filter((d) => d.orders > 0);

	if (chartData.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-sm text-slate-400">
				Sin datos disponibles
			</div>
		);
	}

	return (
		<div role="img" aria-label="Rendimiento de trabajadores por órdenes completadas">
			<h3 className="mb-4 text-sm font-semibold text-slate-700">
				Top Trabajadores por Órdenes Completadas
			</h3>
			<ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 36)}>
				<BarChart
					layout="vertical"
					data={chartData}
					margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
					<XAxis
						type="number"
						allowDecimals={false}
						tick={{ fontSize: 12, fill: CHART_COLORS.slate }}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						type="category"
						dataKey="name"
						width={120}
						tick={{ fontSize: 12, fill: CHART_COLORS.gray }}
						axisLine={false}
						tickLine={false}
					/>
					<Tooltip
						formatter={(value) => [Number(value ?? 0), "Órdenes completadas"]}
						cursor={{ fill: "#f9fafb" }}
					/>
					<Bar
						dataKey="orders"
						fill={CHART_COLORS.indigo}
						radius={[0, 4, 4, 0]}
						label={{ position: "right", fontSize: 12, fill: DEFAULT_CHART_COLOR }}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
});
