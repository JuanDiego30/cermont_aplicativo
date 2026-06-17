"use client";

import dynamic from "next/dynamic";
import { memo } from "react";
import { STATUS_LABELS_ES } from "@/modules/core/lib/work-order-fsm";
import { ChartCard } from "./ChartCard";

const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
	ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });

// ── Types ──
interface OrdersByStatusChartProps {
	data: { name: string; value: number }[];
}

// ── Constants ──
const STATUS_COLORS: Record<string, string> = {
	open: "var(--text-tertiary)",
	assigned: "var(--color-brand-blue)",
	in_progress: "var(--color-info)",
	on_hold: "var(--color-warning)",
	completed: "var(--color-success)",
	closed: "var(--color-purple)",
	cancelled: "var(--color-danger)",
};

const DEFAULT_COLOR = "var(--text-tertiary)";

// ── Component ──
export const OrdersByStatusChart = memo(function OrdersByStatusChart({
	data,
}: OrdersByStatusChartProps) {
	const chartData = data.reduce<Array<{ name: string; value: number; label: string }>>((acc, d) => {
		if (d.value > 0) {
			acc.push({
				...d,
				label: STATUS_LABELS_ES[d.name as keyof typeof STATUS_LABELS_ES] ?? d.name,
			});
		}
		return acc;
	}, []);
	const total = chartData.reduce((sum, item) => sum + item.value, 0);

	if (chartData.length === 0) {
		return (
			<ChartCard title="Órdenes por estado" subtitle="Distribución actual">
				<div className="flex h-64 items-center justify-center text-sm text-[var(--text-tertiary)]">
					Sin datos disponibles
				</div>
			</ChartCard>
		);
	}

	return (
		<ChartCard
			title="Órdenes por estado"
			subtitle="Distribución actual"
			legend={chartData.map((item) => ({
				color: STATUS_COLORS[item.name] ?? DEFAULT_COLOR,
				label: item.label,
			}))}
		>
			<figure role="img" aria-label="Distribución de órdenes por estado">
				<ResponsiveContainer width="100%" height={280}>
					<PieChart>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={100}
							paddingAngle={2}
							dataKey="value"
							nameKey="label"
						>
							{chartData.map((entry) => (
								<Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? DEFAULT_COLOR} />
							))}
						</Pie>
						<Tooltip
							formatter={(value, _name, props) => [
								Number(value ?? 0),
								props.payload?.label ?? _name,
							]}
							contentStyle={{
								borderRadius: 12,
								border: "1px solid var(--border-subtle)",
								boxShadow: "var(--shadow-2)",
								background: "var(--surface-primary)",
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
				<div className="mt-4 text-center text-sm text-[var(--text-secondary)]">
					Total: <span className="font-semibold text-[var(--text-primary)]">{total}</span>
				</div>
			</figure>
		</ChartCard>
	);
});
