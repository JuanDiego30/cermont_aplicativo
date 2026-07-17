"use client";

import type { ReactNode } from "react";
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

interface VarianceDatum {
	category: string;
	estimated: number;
	actual: number;
}

interface VarianceChartProps {
	data: VarianceDatum[];
	height?: number;
	className?: string;
}

interface TooltipEntry {
	dataKey: string;
	value: number;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: TooltipEntry[];
	label?: string;
}

function VarianceTooltip({ active, payload, label }: CustomTooltipProps): ReactNode {
	if (!active || !payload || payload.length === 0) {
		return null;
	}

	const estimated = payload.find((p) => p.dataKey === "estimated")?.value ?? 0;
	const actual = payload.find((p) => p.dataKey === "actual")?.value ?? 0;
	const variance = actual - estimated;
	const variancePercent = estimated > 0 ? Math.round((variance / estimated) * 100) : 0;

	return (
		<div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 shadow-card">
			<p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
			<p className="text-xs text-[var(--text-secondary)]">
				Estimado: <span className="font-mono font-medium">${estimated.toLocaleString()}</span>
			</p>
			<p className="text-xs text-[var(--text-secondary)]">
				Real: <span className="font-mono font-medium">${actual.toLocaleString()}</span>
			</p>
			<p
				className={`text-xs font-medium ${variance > 0 ? "text-[var(--status-danger)]" : "text-[var(--status-success)]"}`}
			>
				Varianza: {variance > 0 ? "+" : ""}${variance.toLocaleString()} (
				{variancePercent > 0 ? "+" : ""}
				{variancePercent}%)
			</p>
		</div>
	);
}

export function VarianceChart({ data, height = 300, className }: VarianceChartProps) {
	return (
		<div className={className} data-testid="variance-chart" style={{ width: "100%", height }}>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} barGap={4}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
					<XAxis
						dataKey="category"
						tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
						axisLine={{ stroke: "var(--border-default)" }}
						tickLine={false}
					/>
					<YAxis
						tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
						axisLine={{ stroke: "var(--border-default)" }}
						tickLine={false}
						tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
					/>
					<Tooltip content={<VarianceTooltip />} cursor={{ fill: "var(--surface-secondary)" }} />
					<Legend
						wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }}
						formatter={(value: string) => (value === "estimated" ? "Estimado" : "Real")}
					/>
					<Bar
						dataKey="estimated"
						fill="var(--color-brand)"
						radius={[4, 4, 0, 0]}
						maxBarSize={40}
					/>
					<Bar
						dataKey="actual"
						fill="var(--status-success)"
						radius={[4, 4, 0, 0]}
						maxBarSize={40}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export type { VarianceDatum };
