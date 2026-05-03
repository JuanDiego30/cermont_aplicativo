"use client";

import type { CostByCategory } from "@cermont/shared-types";
import {
	AlertCircle,
	ArrowDownRight,
	ArrowUpRight,
	BarChart3,
	CircleDollarSign,
	Download,
	History,
	Loader2,
	Scale,
	TrendingUp,
} from "lucide-react";
import { Button } from "@/core/ui/Button";
import { useCostDashboard } from "@/costs/queries";
import { formatCurrency } from "@/costs/utils";

export default function CostsDashboardPage() {
	const { data, isLoading, isError, error, refetch } = useCostDashboard();
	const totalEstimated = data?.totalEstimated ?? 0;
	const totalActual = data?.totalActual ?? 0;
	const totalTax = data?.totalTax ?? 0;
	const variance = data?.variance ?? 0;
	const variancePercent = data?.variancePercent ?? null;
	const byCategory = data?.byCategory ?? [];

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary-500" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
				<AlertCircle className="h-12 w-12 text-red-500" />
				<h2 className="text-xl font-bold">Error al cargar el dashboard de costos</h2>
				<p className="text-slate-400">{(error as Error).message}</p>
				<Button onClick={() => refetch()}>Reintentar</Button>
			</div>
		);
	}

	const isVariancePositive = variance > 0;

	return (
		<main className="flex h-full flex-col p-6 lg:p-8">
			<header className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-white">Análisis de Costos</h1>
					<p className="mt-1 text-sm text-slate-400">
						Comparativa de presupuestos vs. ejecución real en todas las operaciones
					</p>
				</div>
				<Button variant="outline" size="sm">
					<Download className="mr-2 h-4 w-4" />
					Exportar Reporte
				</Button>
			</header>

			{/* Summary Metrics */}
			<section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<SummaryCard
					label="Total Estimado"
					value={formatCurrency(totalEstimated)}
					icon={<History className="h-5 w-5 text-blue-400" />}
					description="Presupuesto base inicial"
				/>
				<SummaryCard
					label="Total Real"
					value={formatCurrency(totalActual)}
					icon={<CircleDollarSign className="h-5 w-5 text-green-400" />}
					description="Gasto total ejecutado"
					tone="green"
				/>
				<SummaryCard
					label="Varianza Total"
					value={formatCurrency(Math.abs(variance))}
					icon={
						isVariancePositive ? (
							<ArrowUpRight className="h-5 w-5 text-red-400" />
						) : (
							<ArrowDownRight className="h-5 w-5 text-green-400" />
						)
					}
					description={`${isVariancePositive ? "Exceso" : "Ahorro"} sobre lo estimado`}
					trend={variancePercent !== null ? `${(variancePercent * 100).toFixed(1)}%` : undefined}
					tone={isVariancePositive ? "red" : "green"}
				/>
				<SummaryCard
					label="Impuestos (IVA)"
					value={formatCurrency(totalTax)}
					icon={<Scale className="h-5 w-5 text-slate-400" />}
					description="Total carga tributaria"
				/>
			</section>

			{/* Breakdown by Category */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<section className="lg:col-span-2 space-y-6">
					<div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-lg font-semibold text-white flex items-center gap-2">
								<BarChart3 className="h-5 w-5 text-primary-400" />
								Distribución por Categoría
							</h2>
						</div>

						<div className="space-y-4">
							{byCategory.length === 0 ? (
								<p className="text-center py-8 text-slate-500 italic">
									No hay datos suficientes para mostrar el desglose.
								</p>
							) : (
								byCategory.map((category) => (
									<CategoryRow key={category.category} {...category} total={totalActual} />
								))
							)}
						</div>
					</div>
				</section>

				<aside className="space-y-6">
					<div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
						<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-amber-400" />
							Insights
						</h2>
						<ul className="space-y-4 text-sm text-slate-400">
							<li className="flex gap-3">
								<div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
								<p>
									La categoría de <span className="text-white font-medium">Materiales</span>{" "}
									representa el 45% del gasto total histórico.
								</p>
							</li>
							<li className="flex gap-3">
								<div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
								<p>
									Se observa una varianza promedio del{" "}
									<span className="text-white font-medium">12.4%</span> en órdenes de emergencia.
								</p>
							</li>
							<li className="flex gap-3">
								<div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
								<p>
									La optimización de rutas ha reducido los gastos de{" "}
									<span className="text-white font-medium">Transporte</span> en un 8% este mes.
								</p>
							</li>
						</ul>
					</div>
				</aside>
			</div>
		</main>
	);
}

function SummaryCard({
	label,
	value,
	icon,
	description,
	trend,
	tone = "blue",
}: {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	description: string;
	trend?: string;
	tone?: "blue" | "green" | "amber" | "red";
}) {
	const toneClass = {
		blue: "border-blue-500/20 bg-blue-500/5",
		green: "border-green-500/20 bg-green-500/5",
		amber: "border-amber-500/20 bg-amber-500/5",
		red: "border-red-500/20 bg-red-500/5",
	}[tone];

	return (
		<article className={`rounded-xl border p-4 transition-all hover:scale-[1.02] ${toneClass}`}>
			<div className="flex items-center justify-between mb-2">
				<div className="rounded-lg bg-slate-800 p-2">{icon}</div>
				{trend && (
					<span
						className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
							tone === "red" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
						}`}
					>
						{trend}
					</span>
				)}
			</div>
			<div className="text-2xl font-bold text-white">{value}</div>
			<div className="text-xs font-semibold text-slate-300 mt-1">{label}</div>
			<div className="text-[10px] text-slate-500 mt-1">{description}</div>
		</article>
	);
}

function CategoryRow({
	category,
	estimated,
	actual,
	variance,
	total,
}: CostByCategory & { total: number }) {
	const percentOfTotal = total > 0 ? (actual / total) * 100 : 0;
	const isOver = variance > 0;

	const labels: Record<string, string> = {
		labor: "Mano de Obra",
		materials: "Materiales",
		equipment: "Equipos",
		overhead: "Gastos Generales",
		tax: "Impuestos",
		other: "Otros",
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between text-sm">
				<span className="font-medium text-slate-200">{labels[category] || category}</span>
				<span className="text-slate-400">
					{formatCurrency(actual)}{" "}
					<span className="text-[10px] opacity-50">({percentOfTotal.toFixed(0)}%)</span>
				</span>
			</div>
			<div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
				<div
					className={`absolute left-0 top-0 h-full transition-all ${isOver ? "bg-red-500/60" : "bg-primary-500/60"}`}
					style={{ width: `${Math.min(percentOfTotal, 100)}%` }}
				/>
			</div>
			<div className="flex justify-between text-[10px] text-slate-500">
				<span>Est: {formatCurrency(estimated)}</span>
				<span className={isOver ? "text-red-400" : "text-green-400"}>
					Var: {isOver ? "+" : ""}
					{formatCurrency(variance)}
				</span>
			</div>
		</div>
	);
}
