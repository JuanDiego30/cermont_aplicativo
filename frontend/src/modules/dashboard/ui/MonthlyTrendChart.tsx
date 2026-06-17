"use client";

import dynamic from "next/dynamic";
import { memo } from "react";
import { ChartCard } from "./ChartCard";

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), {
	ssr: false,
});
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
	ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });

// ── Types ──
interface MonthlyTrendChartProps {
	data: { month: string; creadas: number; completadas: number }[];
	loading?: boolean;
}

// ── Component ──
export const MonthlyTrendChart = memo(function MonthlyTrendChart({
	data,
	loading,
}: MonthlyTrendChartProps) {
	if (data.length === 0) {
		return (
			<ChartCard
				title="Tendencia mensual"
				subtitle="Órdenes creadas vs completadas"
				loading={loading}
			>
				<div className="flex h-64 items-center justify-center text-sm text-[var(--text-tertiary)]">
					Sin datos disponibles
				</div>
			</ChartCard>
		);
	}

	return (
		<ChartCard
			title="Tendencia mensual"
			subtitle="Órdenes creadas vs completadas"
			legend={[
				{ color: "var(--color-brand)", label: "Generadas" },
				{ color: "var(--color-cermont-green)", label: "Completadas" },
			]}
		>
			<figure role="img" aria-label="Tendencia mensual de órdenes creadas y completadas">
				<ResponsiveContainer width="100%" height={280}>
					<BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={4}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-border)" />
						<XAxis
							dataKey="month"
							tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
							axisLine={false}
							tickLine={false}
						/>
						<YAxis
							allowDecimals={false}
							tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
							axisLine={false}
							tickLine={false}
						/>
						<Tooltip
							cursor={{ fill: "transparent" }}
							contentStyle={{
								borderRadius: 12,
								border: "1px solid var(--border-subtle)",
								boxShadow: "var(--shadow-2)",
								background: "var(--surface-primary)",
							}}
						/>
						<Legend
							verticalAlign="top"
							align="right"
							iconType="circle"
							wrapperStyle={{ paddingBottom: 16 }}
							formatter={(value) => (
								<span className="text-xs font-medium text-[var(--text-secondary)] capitalize">
									{value}
								</span>
							)}
						/>
						<Bar
							dataKey="creadas"
							name="Generadas"
							fill="var(--color-brand-blue)"
							radius={[4, 4, 0, 0]}
							maxBarSize={40}
						/>
						<Bar
							dataKey="completadas"
							name="Completadas"
							fill="var(--color-success)"
							radius={[4, 4, 0, 0]}
							maxBarSize={40}
						/>
					</BarChart>
				</ResponsiveContainer>
			</figure>
		</ChartCard>
	);
});
