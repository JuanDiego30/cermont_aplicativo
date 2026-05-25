"use client";

import { AlertCircle, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format-date";
import { ChecklistPanel } from "@/modules/checklists";
import { STATUS_LABELS_ES } from "@/modules/core/lib/work-order-fsm";
import { useOrder } from "@/modules/orders/queries";

interface OrderExecutionTabProps {
	orderId: string;
}

export function OrderExecutionTab({ orderId }: OrderExecutionTabProps) {
	const { data: order, isLoading, error } = useOrder(orderId);

	if (isLoading) {
		return <div className="h-40 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />;
	}

	if (error) {
		return <ExecutionError error={error} />;
	}

	if (!order) {
		return <p className="text-sm text-zinc-400">Sin datos de ejecución.</p>;
	}

	const isExecuting = order.status === "in_progress" || order.status === "completed";

	return (
		<section
			aria-label="Estado de ejecución"
			className="space-y-6 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
		>
			{isExecuting ? (
				<ExecutionStatusSection order={order} />
			) : (
				<ExecutionNotStarted order={order} />
			)}

			<ChecklistPanel
				orderId={orderId}
				readOnly={order.status === "closed" || order.status === "cancelled"}
			/>
		</section>
	);
}

function ExecutionError({ error }: { error: Error }) {
	return (
		<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-900/10">
			<AlertCircle
				className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400"
				aria-hidden="true"
			/>
			<div>
				<p className="text-sm font-medium text-red-900 dark:text-red-300">
					Error al cargar la ejecución.
				</p>
				<p className="mt-1 text-xs text-red-700 dark:text-red-400">{error.message}</p>
			</div>
		</div>
	);
}

function ExecutionNotStarted({ order }: { order: { status: string } }) {
	return (
		<div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-900/10">
			<AlertCircle
				className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
				aria-hidden="true"
			/>
			<div>
				<p className="text-sm font-medium text-amber-900 dark:text-amber-300">
					La ejecución aún no ha comenzado.
				</p>
				<p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
					Estado actual:{" "}
					{STATUS_LABELS_ES[order.status as keyof typeof STATUS_LABELS_ES] ?? order.status}
				</p>
			</div>
		</div>
	);
}

function ExecutionStatusSection({
	order,
}: {
	order: { status: string; startedAt?: string; completedAt?: string; observations?: string };
}) {
	const actualHours =
		order.startedAt && order.completedAt
			? (
					(new Date(order.completedAt).getTime() - new Date(order.startedAt).getTime()) /
					(1000 * 60 * 60)
				).toFixed(1)
			: null;

	const isInProgress = order.status === "in_progress";

	return (
		<>
			<div
				className={cn(
					"flex items-center gap-3 rounded-lg px-4 py-3",
					isInProgress
						? "border border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10"
						: "border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10",
				)}
			>
				{isInProgress ? (
					<PlayCircle
						className="size-5 shrink-0 text-blue-600 dark:text-blue-400"
						aria-hidden="true"
					/>
				) : (
					<CheckCircle2
						className="size-5 shrink-0 text-green-600 dark:text-green-400"
						aria-hidden="true"
					/>
				)}
				<p
					className={cn(
						"text-sm font-medium",
						isInProgress
							? "text-blue-900 dark:text-blue-300"
							: "text-green-900 dark:text-green-300",
					)}
				>
					{isInProgress ? "En ejecución" : "Ejecución completada"}
				</p>
			</div>

			<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<InfoBlock
					label="Iniciada el"
					value={order.startedAt ? formatDate(order.startedAt) : ","}
				/>
				<InfoBlock
					label="Completada el"
					value={order.completedAt ? formatDate(order.completedAt) : "En curso"}
				/>
				<InfoBlock label="Horas efectivas" value={actualHours ? `${actualHours} h` : ","} />
				<InfoBlock
					label="Estado"
					value={STATUS_LABELS_ES[order.status as keyof typeof STATUS_LABELS_ES] ?? order.status}
				/>
			</dl>

			{order.observations && (
				<div>
					<h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
						<Clock className="size-4" aria-hidden="true" />
						Observaciones
					</h3>
					<p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
						{order.observations}
					</p>
				</div>
			)}
		</>
	);
}

function InfoBlock({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
			<dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
			<dd className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">{value}</dd>
		</div>
	);
}
