"use client";

import type { ReportTechnicianRanking } from "@cermont/shared-types";
import { memo, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/dashboard/ui/ChartCard";

interface TechnicianRankingChartProps {
	data: ReportTechnicianRanking[];
	loading?: boolean;
}

type RankingMetric = "reportsApproved" | "avgClosureDays";

const METRIC_OPTIONS: Array<{ label: string; value: RankingMetric }> = [
	{ label: "Aprobadas", value: "reportsApproved" },
	{ label: "Cierre", value: "avgClosureDays" },
];

export const TechnicianRankingChart = memo(function TechnicianRankingChart({
	data,
	loading,
}: TechnicianRankingChartProps) {
	const [metric, setMetric] = useState<RankingMetric>("reportsApproved");
	const chartData = useMemo(
		() =>
			[...data]
				.sort((left, right) => {
					if (metric === "reportsApproved") {
						return right.reportsApproved - left.reportsApproved;
					}

					return (left.avgClosureDays ?? 999) - (right.avgClosureDays ?? 999);
				})
				.map((item) => ({
					name: item.technicianName,
					reportsApproved: item.reportsApproved,
					avgClosureDays: item.avgClosureDays ?? 0,
				})),
		[data, metric],
	);

	if (chartData.length === 0) {
		return (
			<ChartCard title="Ranking de técnicos" subtitle="Velocidad de aprobación" loading={loading}>
				<div className="flex h-72 items-center justify-center text-sm text-[var(--text-tertiary)]">
					Sin reportes aprobados en el periodo
				</div>
			</ChartCard>
		);
	}

	return (
		<ChartCard
			title="Ranking de técnicos"
			subtitle="Aprobaciones y cierre administrativo promedio"
			legend={[
				{ color: "var(--color-brand-blue)", label: "Aprobadas" },
				{ color: "var(--color-warning)", label: "Días prom." },
			]}
		>
			<div className="mb-3 ml-5 flex gap-1">
				{METRIC_OPTIONS.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => setMetric(option.value)}
						aria-pressed={metric === option.value}
						className={`rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold transition-colors ${
							metric === option.value
								? "bg-[var(--color-info-bg)] text-[var(--color-brand-blue)]"
								: "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
						}`}
					>
						{option.label}
					</button>
				))}
			</div>
			<div role="img" aria-label="Ranking de técnicos por aprobación de reportes">
				<ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 42)}>
					<BarChart
						layout="vertical"
						data={chartData}
						margin={{ top: 8, right: 18, left: 72, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							horizontal={false}
							stroke="var(--border-default)"
						/>
						<XAxis
							type="number"
							tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
							axisLine={false}
							tickLine={false}
						/>
						<YAxis
							type="category"
							dataKey="name"
							width={130}
							tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
							axisLine={false}
							tickLine={false}
						/>
						<Tooltip
							contentStyle={{
								borderRadius: 12,
								border: "1px solid var(--border-default)",
								boxShadow: "var(--shadow-2)",
								background: "var(--surface-primary)",
							}}
						/>
						<Bar
							dataKey="reportsApproved"
							name="Aprobadas"
							fill="var(--color-brand-blue)"
							radius={[0, 4, 4, 0]}
						/>
						<Bar
							dataKey="avgClosureDays"
							name="Días prom."
							fill="var(--color-warning)"
							radius={[0, 4, 4, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</ChartCard>
	);
});
