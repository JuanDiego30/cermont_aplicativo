"use client";

import type { DashboardTimeSeriesPoint } from "@cermont/shared-types";
import { memo } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";

interface OrdersTimeSeriesChartProps {
	data: DashboardTimeSeriesPoint[];
	loading?: boolean;
}

export const OrdersTimeSeriesChart = memo(function OrdersTimeSeriesChart({
	data,
	loading,
}: OrdersTimeSeriesChartProps) {
	if (data.length === 0) {
		return (
			<ChartCard title="Evolución temporal" subtitle="OTs creadas vs completadas" loading={loading}>
				<div className="flex h-72 items-center justify-center text-sm text-[var(--text-tertiary)]">
					Sin datos disponibles
				</div>
			</ChartCard>
		);
	}

	return (
		<ChartCard
			title="Evolución temporal"
			subtitle="Brecha entre creación y cierre de OTs"
			legend={[
				{ color: "var(--color-brand-blue)", label: "Creadas" },
				{ color: "var(--color-success)", label: "Completadas" },
			]}
		>
			<div role="img" aria-label="Evolución temporal de órdenes creadas y completadas">
				<ResponsiveContainer width="100%" height={320}>
					<AreaChart data={data} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
						<XAxis
							dataKey="date"
							tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
							axisLine={false}
							tickLine={false}
							minTickGap={18}
						/>
						<YAxis
							allowDecimals={false}
							tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
							axisLine={false}
							tickLine={false}
						/>
						<Tooltip
							cursor={{ stroke: "var(--border-default)" }}
							contentStyle={{
								borderRadius: 12,
								border: "1px solid var(--border-default)",
								boxShadow: "var(--shadow-2)",
								background: "var(--surface-primary)",
							}}
						/>
						<Legend
							verticalAlign="top"
							align="right"
							iconType="circle"
							wrapperStyle={{ paddingBottom: 16 }}
						/>
						<Area
							type="monotone"
							dataKey="created"
							name="Creadas"
							stroke="var(--color-brand-blue)"
							fill="var(--color-info-bg)"
							strokeWidth={2}
						/>
						<Area
							type="monotone"
							dataKey="completed"
							name="Completadas"
							stroke="var(--color-success)"
							fill="var(--color-success-bg)"
							strokeWidth={2}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</ChartCard>
	);
});
