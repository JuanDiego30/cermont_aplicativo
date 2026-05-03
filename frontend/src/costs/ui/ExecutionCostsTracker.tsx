"use client";

import { useMemo, useState } from "react";
import { useCostSummary } from "@/costs/queries";
import { CostForm } from "@/costs/ui/CostForm";

interface ExecutionCostsTrackerProps {
	orderId: string;
}

const CATEGORY_LABELS: Record<string, string> = {
	materials: "Materiales",
	labor: "Mano de obra",
	equipment: "Equipos",
	transport: "Transporte",
	subcontract: "Subcontratos",
	overhead: "Gastos generales",
	other: "Otros",
};

const CATEGORY_ORDER = [
	"materials",
	"labor",
	"equipment",
	"transport",
	"subcontract",
	"overhead",
	"other",
] as const;

function formatCOP(value: number): string {
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

export function ExecutionCostsTracker({ orderId }: ExecutionCostsTrackerProps) {
	const [formOpen, setFormOpen] = useState(false);
	const { data, isLoading, error, refetch } = useCostSummary(orderId);

	const grouped = useMemo(() => {
		const map = new Map<string, number>();
		let total = 0;

		for (const item of data ?? []) {
			const cat = item.type ?? "other";
			const amt = item.amount ?? 0;
			map.set(cat, (map.get(cat) ?? 0) + amt);
			total += amt;
		}

		return {
			categories: CATEGORY_ORDER.map((cat) => ({
				key: cat,
				label: CATEGORY_LABELS[cat] ?? cat,
				amount: map.get(cat) ?? 0,
			})),
			total,
		};
	}, [data]);

	if (isLoading) {
		return (
			<section
				aria-label="Costos de ejecución"
				className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-6"
			>
				<div className="flex items-center justify-center py-8">
					<p className="text-sm text-slate-500">Cargando costos...</p>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section
				aria-label="Costos de ejecución"
				className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20 sm:p-6"
			>
				<p className="text-sm text-red-700 dark:text-red-400">
					Error al cargar los costos: {error.message}
				</p>
				<button
					type="button"
					onClick={() => void refetch()}
					className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-900/30"
				>
					Reintentar
				</button>
			</section>
		);
	}

	return (
		<section
			aria-label="Costos de ejecución"
			className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-6"
		>
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
					Costos de ejecución
				</h2>
				<button
					type="button"
					onClick={() => setFormOpen((prev) => !prev)}
					className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
				>
					{formOpen ? "Cerrar" : "+ Agregar costo"}
				</button>
			</div>

			{formOpen && (
				<div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
					<CostForm
						orderId={orderId}
						onSuccess={() => {
							setFormOpen(false);
							void refetch();
						}}
					/>
				</div>
			)}

			{grouped.categories.every((c) => c.amount === 0) ? (
				<p className="py-6 text-center text-sm text-slate-500">
					No hay costos registrados para esta orden.
				</p>
			) : (
				<dl className="divide-y divide-slate-200 dark:divide-slate-700">
					{grouped.categories.map(({ key, label, amount }) => (
						<div key={key} className="flex items-center justify-between py-2">
							<dt className="text-sm text-slate-600 dark:text-slate-400">{label}</dt>
							<dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
								{formatCOP(amount)}
							</dd>
						</div>
					))}
					<div className="flex items-center justify-between pt-3">
						<dt className="text-base font-semibold text-slate-900 dark:text-slate-100">Total</dt>
						<dd className="text-base font-bold text-slate-900 dark:text-slate-100">
							{formatCOP(grouped.total)}
						</dd>
					</div>
				</dl>
			)}
		</section>
	);
}
