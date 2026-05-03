"use client";

import type { ReportCycleTimeBucket } from "@cermont/shared-types";
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
import { ChartCard } from "@/dashboard/ui/ChartCard";

interface ReportCycleTimeChartProps {
	data: ReportCycleTimeBucket[];
	loading?: boolean;
}

function getBucketColor(bucket: string): string {
	if (bucket === "<1d" || bucket === "1-3d") {
		return "var(--color-success)";
	}

	if (bucket === "3-5d") {
		return "var(--color-warning)";
	}

	return "var(--color-danger)";
}

export const ReportCycleTimeChart = memo(function ReportCycleTimeChart({
	data,
	loading,
}: ReportCycleTimeChartProps) {
	if (data.length === 0) {
		return (
			<ChartCard title="Ciclo de aprobación" subtitle="Completion → approval" loading={loading}>
				<div className="flex h-72 items-center justify-center text-sm text-[var(--text-tertiary)]">
					Sin reportes aprobados en el periodo
				</div>
			</ChartCard>
		);
	}

	const chartData = data.map((item) => ({
		...item,
		fill: getBucketColor(item.bucket),
	}));

	return (
		<ChartCard
			title="Ciclo de aprobación"
			subtitle="Distribución de días entre cierre técnico y aprobación"
		>
			<div role="img" aria-label="Histograma de tiempo de aprobación de reportes">
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={chartData} margin={{ top: 8, right: 18, left: -18, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
						<XAxis
							dataKey="bucket"
							tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
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
							formatter={(value) => [Number(value), "Reportes"]}
							contentStyle={{
								borderRadius: 12,
								border: "1px solid var(--border-default)",
								boxShadow: "var(--shadow-2)",
								background: "var(--surface-primary)",
							}}
						/>
						<Bar dataKey="count" name="Reportes" radius={[4, 4, 0, 0]}>
							{chartData.map((entry) => (
								<Cell key={entry.bucket} fill={entry.fill} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</ChartCard>
	);
});
