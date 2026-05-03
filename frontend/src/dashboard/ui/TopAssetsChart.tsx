"use client";

import type { DashboardTopAsset } from "@cermont/shared-types";
import { memo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";

interface TopAssetsChartProps {
	data: DashboardTopAsset[];
	loading?: boolean;
}

export const TopAssetsChart = memo(function TopAssetsChart({ data, loading }: TopAssetsChartProps) {
	const chartData = data.map((asset, index) => ({
		name: asset.assetName || asset.assetId || `Activo ${index + 1}`,
		orderCount: asset.orderCount,
	}));

	if (chartData.length === 0) {
		return (
			<ChartCard
				title="Top activos intervenidos"
				subtitle="Ranking por generación de OTs"
				loading={loading}
			>
				<div className="flex h-72 items-center justify-center text-sm text-[var(--text-tertiary)]">
					Sin activos para mostrar
				</div>
			</ChartCard>
		);
	}

	return (
		<ChartCard title="Top activos intervenidos" subtitle="Activos con mayor carga correctiva">
			<div role="img" aria-label="Top activos intervenidos">
				<ResponsiveContainer width="100%" height={320}>
					<BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 42 }}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
						<XAxis
							dataKey="name"
							angle={-24}
							textAnchor="end"
							height={64}
							interval={0}
							tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
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
							contentStyle={{
								borderRadius: 12,
								border: "1px solid var(--border-default)",
								boxShadow: "var(--shadow-2)",
								background: "var(--surface-primary)",
							}}
						/>
						<Bar
							dataKey="orderCount"
							name="Órdenes"
							fill="var(--color-purple)"
							radius={[4, 4, 0, 0]}
							maxBarSize={42}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</ChartCard>
	);
});
