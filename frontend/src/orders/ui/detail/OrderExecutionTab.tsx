"use client";

import type { ExecutionPhase } from "@cermont/shared-types";
import { STATUS_LABELS_ES } from "@cermont/shared-types";

import { Loader2 } from "lucide-react";
import { cn } from "@/_shared/lib/utils";
import { formatDate } from "@/_shared/lib/utils/format-date";
import { ChecklistPanel } from "@/checklists";
import { useSyncConnectivity } from "@/offline-sync";
import { useOrder, useUpdatePreStartVerification } from "@/orders/queries";
import { ExecutionPhaseStepper } from "../execution/ExecutionPhaseStepper";

interface OrderExecutionTabProps {
	orderId: string;
}

type PreStartVerificationItem = ExecutionPhase["preStartVerification"][number];

export function OrderExecutionTab({ orderId }: OrderExecutionTabProps) {
	const { data: order, isLoading, error } = useOrder(orderId);
	const updateVerification = useUpdatePreStartVerification(orderId);
	const connectivity = useSyncConnectivity();

	const preStartVerification: PreStartVerificationItem[] =
		order?.executionPhase?.preStartVerification ?? [];
	const allComplete =
		preStartVerification.length > 0 && preStartVerification.every((item) => item.checked);

	const handleToggleItem = (itemId: string, checked: boolean) => {
		updateVerification.mutate({ items: [{ id: itemId, checked }] });
	};

	if (isLoading) {
		return <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />;
	}

	if (error || !order) {
		return (
			<section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
				Error al cargar la ejecución.
			</section>
		);
	}

	const isExecuting = ["in_progress", "completed", "closed"].includes(String(order.status));
	const planningReady = Boolean(order.planning.planningReadyAt);

	return (
		<section className="space-y-6">
			<ConnectivityBanner online={connectivity.isOnline} lastSyncAt={connectivity.lastSyncAt} />

			{(String(order.status) === "assigned" ||
				String(order.status) === "planning" ||
				isExecuting) && (
				<PreStartVerificationSection
					items={preStartVerification}
					onToggle={handleToggleItem}
					isUpdating={updateVerification.isPending}
				/>
			)}

			{!planningReady && !isExecuting && (
				<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
					<p className="font-semibold">La planeación todavía no está lista.</p>
					<p className="mt-1 opacity-80">
						Completa la planeación para habilitar la salida a campo.
					</p>
				</div>
			)}

			<div
				className={cn(
					"space-y-6 transition-opacity",
					!allComplete && !isExecuting ? "opacity-50 pointer-events-none" : "opacity-100",
				)}
			>
				{/* Phased Execution Stepper */}
				<ExecutionPhaseStepper orderId={orderId} />

				{/* Checklist Panel */}
				<ChecklistPanel
					orderId={orderId}
					readOnly={!allComplete || order.status === "closed" || order.status === "cancelled"}
				/>
			</div>

			{isExecuting && (
				<section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
					<h3 className="text-sm font-semibold">Detalles de Ejecución</h3>
					<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<InfoBlock
							label="Iniciada el"
							value={order.startedAt ? formatDate(order.startedAt) : "—"}
						/>
						<InfoBlock
							label="Completada el"
							value={order.completedAt ? formatDate(order.completedAt) : "En curso"}
						/>
						<InfoBlock
							label="Estado"
							value={
								STATUS_LABELS_ES[order.status as keyof typeof STATUS_LABELS_ES] ?? order.status
							}
						/>
					</dl>
				</section>
			)}
		</section>
	);
}

function ConnectivityBanner({ online, lastSyncAt }: { online: boolean; lastSyncAt: Date | null }) {
	return (
		<div
			className={cn(
				"rounded-lg border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider",
				online
					? "border-green-200 bg-green-50 text-green-700"
					: "border-red-200 bg-red-50 text-red-700",
			)}
		>
			{online ? (
				<span>
					🟢 Conectado — Última sincronización:{" "}
					{lastSyncAt ? formatDate(lastSyncAt.toISOString(), "HH:mm") : "pendiente"}
				</span>
			) : (
				<span>🔴 Sin conexión — Modo offline activo</span>
			)}
		</div>
	);
}

function PreStartVerificationSection({
	items,
	onToggle,
	isUpdating,
}: {
	items: PreStartVerificationItem[];
	onToggle: (itemId: string, checked: boolean) => Promise<void> | void;
	isUpdating: boolean;
}) {
	const completedCount = items.filter((item) => item.checked).length;
	const allComplete = items.length > 0 && completedCount === items.length;

	return (
		<section className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900/50">
			<header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="text-sm font-semibold">Verificación Pre-inicio</h3>
					<p className="mt-1 text-xs text-slate-500">
						Garantiza las condiciones de seguridad antes de iniciar la labor.
					</p>
				</div>
				<div className="flex items-center gap-3">
					{isUpdating && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
					<span
						className={cn(
							"rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
							allComplete ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
						)}
					>
						{completedCount}/{items.length || 0} Completado
					</span>
				</div>
			</header>

			{items.length > 0 ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{items.map((item) => (
						<label
							key={item.id}
							className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
						>
							<input
								type="checkbox"
								checked={item.checked}
								onChange={(e) => onToggle(item.id, e.target.checked)}
								className="h-4 w-4 rounded border-slate-300 text-blue-600"
							/>
							<span className={cn(item.checked ? "text-slate-900 font-medium" : "text-slate-500")}>
								{item.label}
							</span>
						</label>
					))}
				</div>
			) : (
				<p className="text-xs text-slate-500 italic">
					No se han definido requisitos de verificación en la planeación.
				</p>
			)}
		</section>
	);
}

function InfoBlock({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-900">
			<dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
			<dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</dd>
		</div>
	);
}
