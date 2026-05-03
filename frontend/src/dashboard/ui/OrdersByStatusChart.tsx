"use client";

import { STATUS_LABELS_ES } from "@cermont/shared-types";
import { memo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "./ChartCard";

// ── Types ──
interface OrdersByStatusChartProps {
	data: { name: string; value: number }[];
	selectedStatus?: string;
	onStatusSelect?: (status: string) => void;
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
	selectedStatus,
	onStatusSelect,
}: OrdersByStatusChartProps) {
	const chartData = data
		.filter((d) => d.value > 0)
		.map((d) => ({
			...d,
			label: STATUS_LABELS_ES[d.name as keyof typeof STATUS_LABELS_ES] ?? d.name,
		}));
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
			<div role="img" aria-label="Distribución de órdenes por estado">
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
								<Cell
									key={entry.name}
									fill={STATUS_COLORS[entry.name] ?? DEFAULT_COLOR}
									opacity={selectedStatus && selectedStatus !== entry.name ? 0.45 : 1}
								/>
							))}
						</Pie>
						<Tooltip
							formatter={(value, _name, props) => [
								Number(value ?? 0),
								props.payload?.label ?? _name,
							]}
							contentStyle={{
								borderRadius: 12,
								border: "1px solid var(--border-default)",
								boxShadow: "var(--shadow-2)",
								background: "var(--surface-primary)",
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
				<div className="mt-4 text-center text-sm text-[var(--text-secondary)]">
					Total: <span className="font-semibold text-[var(--text-primary)]">{total}</span>
				</div>
				{onStatusSelect ? (
					<fieldset className="mt-4 flex flex-wrap justify-center gap-2">
						<legend className="sr-only">Filtrar por estado</legend>
						{chartData.map((item) => {
							const isActive = selectedStatus === item.name;
							return (
								<button
									key={item.name}
									type="button"
									onClick={() => onStatusSelect(isActive ? "" : item.name)}
									className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
										isActive
											? "border-[var(--color-brand-blue)] bg-[var(--color-info-bg)] text-[var(--color-brand-blue)]"
											: "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
									}`}
								>
									{item.label}
								</button>
							);
						})}
					</fieldset>
				) : null}
			</div>
		</ChartCard>
	);
});
