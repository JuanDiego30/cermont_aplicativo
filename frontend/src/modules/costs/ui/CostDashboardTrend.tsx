import type { CostDashboard } from "@cermont/shared-types";
import { BarChart3, PieChart } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COST_CATEGORY_LABELS, formatCurrency } from "../utils";

type CostDashboardTrendProps = {
	readonly dashboard: CostDashboard;
};

export function CostDashboardTrend({ dashboard }: CostDashboardTrendProps) {
	return (
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,1fr)]">
			<section className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)]">
				<div className="mb-4 flex items-center gap-2">
					<BarChart3 className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h2 className="text-sm font-semibold text-[var(--text-primary)]">Real vs estimado</h2>
				</div>
				<figure className="h-72">
					<figcaption className="sr-only">Tendencia mensual de costos reales y estimados</figcaption>
					<ResponsiveContainer
						width="100%"
						height="100%"
						minWidth={0}
						initialDimension={{ width: 0, height: 288 }}
					>
						<BarChart data={dashboard.monthlyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
							<XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={{ stroke: "var(--border-subtle)" }} />
							<YAxis
								tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
								axisLine={{ stroke: "var(--border-subtle)" }}
								tickFormatter={formatCompactAmount}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "var(--surface-primary)",
									border: "1px solid var(--border-subtle)",
									borderRadius: "var(--radius-md)",
									fontSize: "12px",
								}}
								formatter={(value) => formatCurrency(Number(value))}
							/>
							<Bar dataKey="estimated" fill="var(--color-brand-blue)" name="Estimado" radius={[4, 4, 0, 0]} maxBarSize={24} />
							<Bar dataKey="actual" fill="var(--color-cermont-green)" name="Real" radius={[4, 4, 0, 0]} maxBarSize={24} />
						</BarChart>
					</ResponsiveContainer>
				</figure>
			</section>

			<section className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)]">
				<div className="mb-4 flex items-center gap-2">
					<PieChart className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h2 className="text-sm font-semibold text-[var(--text-primary)]">Por categoría</h2>
				</div>
				<ul className="space-y-2">
					{dashboard.byCategory.map((category) => (
						<li key={category.category} className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3">
							<div className="flex items-center justify-between gap-3">
								<span className="text-sm font-medium text-[var(--text-primary)]">{COST_CATEGORY_LABELS[category.category]}</span>
								<span className={category.variance > 0 ? "text-[var(--status-danger)]" : "text-[var(--status-success)]"}>
									{formatCurrency(category.variance)}
								</span>
							</div>
							<p className="mt-1 text-xs text-[var(--text-muted)]">
								Estimado {formatCurrency(category.estimated)} · Real {formatCurrency(category.actual)}
							</p>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}

function formatCompactAmount(value: number): string {
	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(1)}M`;
	}
	if (value >= 1_000) {
		return `${(value / 1_000).toFixed(0)}K`;
	}
	return String(value);
}
