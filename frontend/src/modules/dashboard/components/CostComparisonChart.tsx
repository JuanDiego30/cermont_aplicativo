"use client";

import { useId } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { ChartCard } from "../ui/ChartCard";
import { localeNumber } from "@/lib/utils/format-date";

interface CostComparisonItem {
	label: string;
	proposed: number;
	actual: number;
}

interface CostComparisonChartProps {
	data: CostComparisonItem[];
	loading?: boolean;
}

const CHART_COLORS = {
	proposed: "var(--color-brand-green, #2154a6)",
	actual: "var(--color-success, #4caf50)",
};

function formatCOP(value: number) {
	if (value >= 1_000_000) {
		return `$${(value / 1_000_000).toFixed(1)}M`;
	}
	if (value >= 1_000) {
		return `$${(value / 1_000).toFixed(0)}K`;
	}
	return `$${value}`;
}

/**
 * CostComparisonChart — Recharts BarChart comparing proposed vs actual costs
 *
 * Shows budget variance per service category using two grouped bars.
 * Wrapped in ChartCard with legend for "Presupuestado" and "Real".
 * Uses dynamic imports internally for SSR compatibility.
 */
export function CostComparisonChart({
	data,
	loading,
}: CostComparisonChartProps) {
	const chartId = useId();

	if (loading) {
		return (
			<ChartCard title="Comparación de costos" subtitle="Presupuestado vs Real" loading>
				<div className="flex h-64 items-center justify-center text-sm text-slate">
					Cargando...
				</div>
			</ChartCard>
		);
	}

	if (!data || data.length === 0) {
		return (
			<ChartCard
				title="Comparación de costos"
				subtitle="Presupuestado vs Real"
			>
				<div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-slate">
					<p className="font-medium">Sin datos disponibles</p>
					<p className="text-xs">
						No hay datos de costos registrados en el período actual.
					</p>
				</div>
			</ChartCard>
		);
	}

	return (
		<ChartCard
			title="Comparación de costos"
			subtitle="Presupuestado vs Real"
			legend={[
				{ color: CHART_COLORS.proposed, label: "Presupuestado" },
				{ color: CHART_COLORS.actual, label: "Real" },
			]}
		>
			<ResponsiveContainer width="100%" height={280}>
				<BarChart
					id={chartId}
					data={data}
					margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
					barCategoryGap="20%"
				>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="var(--color-hairline, #e2e8f0)"
						vertical={false}
					/>
					<XAxis
						dataKey="label"
						tick={{ fontSize: 12, fill: "var(--color-slate, #555)" }}
						tickLine={false}
						axisLine={false}
					/>
					<YAxis
						tickFormatter={formatCOP}
						tick={{ fontSize: 11, fill: "var(--color-steel, #808080)" }}
						tickLine={false}
						axisLine={false}
					/>
					<Tooltip
						formatter={(value) => [
							`$${localeNumber(Number(value))}`,
						]}
						contentStyle={{
							background: "var(--color-canvas, #fff)",
							border: "1px solid var(--color-hairline, #e2e8f0)",
							borderRadius: "8px",
							fontSize: "13px",
						}}
					/>
					<Legend
						iconType="circle"
						iconSize={8}
						wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
					/>
					<Bar
						dataKey="proposed"
						name="Presupuestado"
						fill={CHART_COLORS.proposed}
						radius={[4, 4, 0, 0]}
						maxBarSize={48}
					/>
					<Bar
						dataKey="actual"
						name="Real"
						fill={CHART_COLORS.actual}
						radius={[4, 4, 0, 0]}
						maxBarSize={48}
					/>
				</BarChart>
			</ResponsiveContainer>
		</ChartCard>
	);
}
