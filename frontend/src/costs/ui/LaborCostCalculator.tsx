"use client";

import type { Order, Tariff } from "@cermont/shared-types";
import { Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCalculateLaborCost, useTariffs } from "../queries";

interface LaborCostCalculatorProps {
	order: Order;
}

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function getWorkedHours(order: Order): number | null {
	if (!order.startedAt || !order.completedAt) {
		return null;
	}
	const start = new Date(order.startedAt).getTime();
	const end = new Date(order.completedAt).getTime();
	if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
		return null;
	}
	return Math.round(((end - start) / 3_600_000) * 10) / 10;
}

function findTariff(tariffs: Tariff[] | undefined, role?: string): Tariff | undefined {
	if (!role) {
		return undefined;
	}
	return tariffs?.find((tariff) => tariff.role === role);
}

export function LaborCostCalculator({ order }: LaborCostCalculatorProps) {
	const tariffsQuery = useTariffs();
	const calculateLabor = useCalculateLaborCost(order._id);
	const role = order.resourceAssignment?.employeeType ?? "tecnico";
	const tariff = findTariff(tariffsQuery.data, role);
	const hours = getWorkedHours(order);
	const estimated = tariff && hours ? hours * tariff.hourlyRateCOP : null;

	const handleCalculate = async () => {
		try {
			await calculateLabor.mutateAsync();
			toast.success("Costo de mano de obra registrado");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo calcular la mano de obra");
		}
	};

	return (
		<section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
						Mano de obra
					</p>
					<h2 className="text-lg font-semibold text-slate-950 dark:text-white">
						Cálculo automático
					</h2>
				</div>
				<Calculator className="h-5 w-5 text-slate-400" aria-hidden="true" />
			</header>

			<dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<Metric label="Rol" value={role} />
				<Metric label="Horas reales" value={hours === null ? "Pendiente" : `${hours} h`} />
				<Metric
					label="Tarifa vigente"
					value={tariff ? COP_FORMATTER.format(tariff.hourlyRateCOP) : "Sin tarifa"}
				/>
				<Metric
					label="Costo estimado"
					value={estimated ? COP_FORMATTER.format(estimated) : "N/A"}
				/>
			</dl>

			<button
				type="button"
				onClick={handleCalculate}
				disabled={!tariff || hours === null || calculateLabor.isPending}
				className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
			>
				{calculateLabor.isPending ? (
					<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
				) : (
					<Calculator className="h-4 w-4" aria-hidden="true" />
				)}
				Calcular y registrar
			</button>
		</section>
	);
}

function Metric({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
			<dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
			<dd className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{value}</dd>
		</div>
	);
}
