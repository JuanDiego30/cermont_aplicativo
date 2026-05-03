"use client";

import { AlertCircle, CheckSquare, ClipboardList, ShieldCheck } from "lucide-react";
import { useOrder } from "@/orders/queries";

interface OrderInspectionsTabProps {
	orderId: string;
}

const INSPECTION_CHECKPOINTS = [
	{ key: "pre_work", label: "Inspección pre-trabajo" },
	{ key: "safety", label: "Checklist de seguridad" },
	{ key: "quality", label: "Registro de calidad" },
	{ key: "post_work", label: "Inspección post-trabajo" },
] as const;

const INSPECTION_TYPE_LABELS: Record<string, string> = {
	maintenance: "Mantenimiento",
	inspection: "Inspección HES",
	installation: "Instalación",
	repair: "Reparación",
	decommission: "Descomisionamiento",
};

export function OrderInspectionsTab({ orderId }: OrderInspectionsTabProps) {
	const { data: order, isLoading, error } = useOrder(orderId);

	if (isLoading) {
		return <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />;
	}

	if (error) {
		return (
			<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-900/10">
				<AlertCircle
					className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-medium text-red-900 dark:text-red-300">
						Error al cargar las inspecciones.
					</p>
					<p className="mt-1 text-xs text-red-700 dark:text-red-400">{error.message}</p>
				</div>
			</div>
		);
	}

	if (!order) {
		return <p className="text-sm text-slate-400">Sin inspecciones registradas.</p>;
	}

	const isInspectionOrder = order.type === "inspection";

	return (
		<section
			aria-label="Inspecciones"
			className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-950"
		>
			{/* Order type context */}
			<div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
				<ShieldCheck
					className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-medium text-slate-900 dark:text-white">
						Tipo de orden: {INSPECTION_TYPE_LABELS[order.type] ?? order.type}
					</p>
					<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
						{isInspectionOrder
							? "Esta orden es una inspeccion de seguridad (HES). Los checklists operativos se gestionan en la pestaña de ejecucion."
							: "Las inspecciones de seguridad pueden asociarse a esta orden desde el módulo de inspecciones."}
					</p>
				</div>
			</div>

			{/* Inspection checkpoints */}
			<div>
				<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
					<ClipboardList className="h-4 w-4" aria-hidden="true" />
					Checkpoints de inspección
				</h3>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{INSPECTION_CHECKPOINTS.map((checkpoint) => (
						<CheckpointCard key={checkpoint.key} label={checkpoint.label} status="pending" />
					))}
				</div>
			</div>

			<div className="text-center text-sm text-slate-500 dark:text-slate-400">
				<p className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 dark:border-slate-800">
					<CheckSquare className="h-4 w-4" aria-hidden="true" />
					Las inspecciones se administran desde el flujo de la orden.
				</p>
			</div>
		</section>
	);
}

function CheckpointCard({
	label,
	status,
}: {
	label: string;
	status: "pending" | "passed" | "failed";
}) {
	const statusStyles = {
		pending: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900",
		passed: "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10",
		failed: "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10",
	};

	const statusLabels = {
		pending: "Pendiente",
		passed: "Aprobado",
		failed: "Rechazado",
	};

	const dotColors = {
		pending: "bg-slate-300 dark:bg-slate-600",
		passed: "bg-green-500 dark:bg-green-400",
		failed: "bg-red-500 dark:bg-red-400",
	};

	return (
		<div
			className={`flex items-center justify-between rounded-lg border px-4 py-3 ${statusStyles[status]}`}
		>
			<span className="text-sm font-medium text-slate-900 dark:text-white">{label}</span>
			<span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
				<span className={`h-2 w-2 rounded-full ${dotColors[status]}`} aria-hidden="true" />
				{statusLabels[status]}
			</span>
		</div>
	);
}
