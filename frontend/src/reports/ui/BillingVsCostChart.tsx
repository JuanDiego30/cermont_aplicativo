"use client";

import type { ReportBillingVsCost } from "@cermont/shared-types";
import { memo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/_shared/lib/utils/format-currency";
import { ChartCard } from "@/dashboard/ui/ChartCard";

interface BillingVsCostChartProps {
	data: ReportBillingVsCost[];
	loading?: boolean;
}

export const BillingVsCostChart = memo(function BillingVsCostChart({
	data,
	loading,
}: BillingVsCostChartProps) {
	if (data.length === 0) {
		return (
			<ChartCard title="Facturación vs costo" subtitle="Margen operativo" loading={loading}>
				<div className="flex h-72 items-center justify-center text-sm text-[var(--text-tertiary)]">
					Sin costos registrados en el periodo
				</div>
			</ChartCard>
		);
	}

	return (
		<ChartCard
			title="Facturación vs costo"
			subtitle="Estimado facturable frente a costo real registrado"
			legend={[
				{ color: "var(--color-brand-blue)", label: "Facturable" },
				{ color: "var(--color-danger)", label: "Costo" },
				{ color: "var(--color-success)", label: "Margen" },
			]}
		>
			<div role="img" aria-label="Facturación comparada con costo y margen">
				<ResponsiveContainer width="100%" height={320}>
					<BarChart data={data} margin={{ top: 8, right: 18, left: 8, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
						<XAxis
							dataKey="month"
							tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
							axisLine={false}
							tickLine={false}
						/>
						<YAxis
							tickFormatter={(value) => `${Number(value) / 1_000_000}M`}
							tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
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
						<Bar
							dataKey="billed"
							name="Facturable"
							fill="var(--color-brand-blue)"
							radius={[4, 4, 0, 0]}
						/>
						<Bar dataKey="cost" name="Costo" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
						<Bar dataKey="margin" name="Margen" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</ChartCard>
	);
});
