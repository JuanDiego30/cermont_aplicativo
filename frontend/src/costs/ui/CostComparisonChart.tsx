"use client";

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

interface CostSummaryItem {
	type?: string;
	estimated?: number;
	actual?: number;
	amount?: number;
}

interface CostComparisonChartProps {
	/** Pre-fetched data array. If omitted with orderId, shows empty state. */
	data?: CostSummaryItem[];
	/** Order ID — used by parent pages that fetch data separately. */
	orderId?: string;
	isLoading?: boolean;
}

const formatCOP = (value: number) =>
	new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		maximumFractionDigits: 0,
	}).format(value);

export function CostComparisonChart({ data, isLoading }: CostComparisonChartProps) {
	if (isLoading) {
		return <div className="h-64 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />;
	}

	if (!data?.length) {
		return (
			<div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
				<p className="text-sm text-slate-400">Sin datos de costos para mostrar</p>
			</div>
		);
	}

	const chartData = data.map((item) => ({
		category: item.type ?? "Sin categoría",
		estimated: item.estimated ?? 0,
		actual: item.actual ?? item.amount ?? 0,
	}));

	return (
		<ResponsiveContainer width="100%" height={256}>
			<BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
				<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
				<XAxis dataKey="category" tick={{ fontSize: 12 }} />
				<YAxis
					tickFormatter={(v: number) =>
						new Intl.NumberFormat("es-CO", {
							notation: "compact",
							maximumFractionDigits: 1,
						}).format(v)
					}
					tick={{ fontSize: 12 }}
				/>
				<Tooltip
					formatter={(value: unknown) =>
						typeof value === "number" ? formatCOP(value) : String(value ?? "")
					}
				/>
				<Legend />
				<Bar dataKey="estimated" name="Estimado" fill="#93C5FD" radius={[4, 4, 0, 0]} />
				<Bar dataKey="actual" name="Real" fill="#3A78D8" radius={[4, 4, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	);
}
