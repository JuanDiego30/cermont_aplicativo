"use client";

import { CATEGORY_COLORS, DEFAULT_CHART_COLOR } from "@cermont/shared-types";
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
interface RevenueChartProps {
	data: { category: string; value: number }[];
}

// ── Constants ──
const CATEGORY_LABELS: Record<string, string> = {
	draft: "Borrador",
	sent: "Enviada",
	approved: "Aprobada",
	rejected: "Rechazada",
	expired: "Expirada",
};

// ── Helpers ──
function formatCOP(value: number) {
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		maximumFractionDigits: 0,
	}).format(value);
}

// ── Component ──
export const RevenueChart = memo(function RevenueChart({ data }: RevenueChartProps) {
	const chartData = data
		.filter((d) => d.value > 0)
		.map((d) => ({ ...d, label: CATEGORY_LABELS[d.category] ?? d.category }));

	if (chartData.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-sm text-slate-400">
				Sin datos disponibles
			</div>
		);
	}

	return (
		<div role="img" aria-label="Ingresos estimados por categoría de propuesta">
			<ResponsiveContainer width="100%" height={280}>
				<BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
					<XAxis
						dataKey="label"
						tick={{ fontSize: 12, fill: DEFAULT_CHART_COLOR }}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						tickFormatter={(v) =>
							new Intl.NumberFormat("es-CO", {
								notation: "compact",
								maximumFractionDigits: 1,
							}).format(v)
						}
						tick={{ fontSize: 11, fill: DEFAULT_CHART_COLOR }}
						axisLine={false}
						tickLine={false}
					/>
					<Tooltip
						formatter={(value) => [formatCOP(Number(value ?? 0)), "Valor"]}
						cursor={{ fill: "#f9fafb" }}
					/>
					<Bar dataKey="value" radius={[4, 4, 0, 0]}>
						{chartData.map((entry) => (
							<Cell
								key={entry.category}
								fill={CATEGORY_COLORS[entry.category] ?? DEFAULT_CHART_COLOR}
							/>
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
});
