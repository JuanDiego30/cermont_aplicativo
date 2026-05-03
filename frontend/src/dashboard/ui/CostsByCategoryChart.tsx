"use client";

import type { CostByCategory } from "@cermont/shared-types";
import { memo } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatCurrency } from "@/_shared/lib/utils/format-currency";
import { ChartCard } from "./ChartCard";

interface CostsByCategoryChartProps {
	data: CostByCategory[];
	budgetTarget?: number;
	loading?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
	labor: "Mano de obra",
	materials: "Materiales",
	equipment: "Equipos",
	transport: "Viáticos",
	subcontract: "Subcontratación",
	overhead: "Indirectos",
	other: "Otros",
};

export const CostsByCategoryChart = memo(function CostsByCategoryChart({
	data,
	budgetTarget,
	loading,
}: CostsByCategoryChartProps) {
	const chartData = data.map((item) => ({
		category: CATEGORY_LABELS[item.category] ?? item.category,
		actual: item.actual,
		estimated: item.estimated,
	}));

	if (chartData.length === 0) {
		return (
			<ChartCard
				title="Costos por categoría"
				subtitle="Actual vs presupuesto estimado"
				loading={loading}
			>
				<div className="flex h-72 items-center justify-center text-sm text-[var(--text-tertiary)]">
					Sin costos registrados
				</div>
			</ChartCard>
		);
	}

	return (
		<ChartCard
			title="Costos por categoría"
			subtitle="Lectura gerencial de gasto operativo"
			legend={[
				{ color: "var(--color-brand-blue)", label: "Actual" },
				{ color: "var(--color-warning)", label: "Estimado" },
			]}
		>
			<div role="img" aria-label="Costos por categoría">
				<ResponsiveContainer width="100%" height={320}>
					<BarChart
						data={chartData}
						layout="vertical"
						margin={{ top: 8, right: 18, left: 52, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							horizontal={false}
							stroke="var(--border-default)"
						/>
						<XAxis
							type="number"
							tickFormatter={(value) => `${Number(value) / 1_000_000}M`}
							tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
							axisLine={false}
							tickLine={false}
						/>
						<YAxis
							type="category"
							dataKey="category"
							width={116}
							tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
							axisLine={false}
							tickLine={false}
						/>
						<Tooltip
							formatter={(value) => formatCurrency(Number(value))}
							contentStyle={{
								borderRadius: 12,
								border: "1px solid var(--border-default)",
								boxShadow: "var(--shadow-2)",
								background: "var(--surface-primary)",
							}}
						/>
						{typeof budgetTarget === "number" && budgetTarget > 0 ? (
							<ReferenceLine x={budgetTarget} stroke="var(--color-danger)" strokeDasharray="4 4" />
						) : null}
						<Bar
							dataKey="actual"
							name="Actual"
							fill="var(--color-brand-blue)"
							radius={[0, 4, 4, 0]}
						/>
						<Bar
							dataKey="estimated"
							name="Estimado"
							fill="var(--color-warning)"
							radius={[0, 4, 4, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</ChartCard>
	);
});
