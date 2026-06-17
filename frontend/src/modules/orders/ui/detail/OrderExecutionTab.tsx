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
		return <div className="h-40 animate-pulse rounded-xl bg-[var(--surface-secondary)] bg-800" />;
	}

	if (error) {
		return <ExecutionError error={error} />;
	}

	if (!order) {
		return <p className="text-sm text-[var(--text-muted)]">Sin datos de ejecución.</p>;
	}

	const isExecuting = order.status === "in_progress" || order.status === "completed";

	return (
		<section
			aria-label="Estado de ejecución"
			className="space-y-6 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 sm:p-6 border-800 bg-950"
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
		<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-danger-bg px-4 py-3 dark:border-red-900/30 dark:bg-red-900/10">
			<AlertCircle
				className="mt-0.5 size-5 shrink-0 text-brand-error dark:text-brand-error"
				aria-hidden="true"
			/>
			<div>
				<p className="text-sm font-medium text-brand-error dark:text-brand-error">
					Error al cargar la ejecución.
				</p>
				<p className="mt-1 text-xs text-brand-error dark:text-brand-error">{error.message}</p>
			</div>
		</div>
	);
}

function ExecutionNotStarted({ order }: { order: { status: string } }) {
	return (
		<div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-warning-bg px-4 py-3 dark:border-amber-900/30 dark:bg-amber-900/10">
			<AlertCircle
				className="mt-0.5 size-5 shrink-0 text-brand-warn dark:text-brand-warn"
				aria-hidden="true"
			/>
			<div>
				<p className="text-sm font-medium text-brand-warn dark:text-brand-warn">
					La ejecución aún no ha comenzado.
				</p>
				<p className="mt-1 text-xs text-brand-warn dark:text-brand-warn">
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
						? "border border-[var(--color-cermont-blue-bg)] bg-[var(--color-cermont-blue-bg)]/50 dark:border-[var(--color-cermont-blue)]/30 dark:bg-[var(--color-cermont-blue)]/10"
						: "border border-green-200 bg-success-bg dark:border-green-900/30 dark:bg-green-900/10",
				)}
			>
				{isInProgress ? (
					<PlayCircle
						className="size-5 shrink-0 text-[var(--color-brand-blue-light)] dark:text-[var(--color-cermont-blue-light)]"
						aria-hidden="true"
					/>
				) : (
					<CheckCircle2
						className="size-5 shrink-0 text-brand-annotate dark:text-brand-annotate"
						aria-hidden="true"
					/>
				)}
				<p
					className={cn(
						"text-sm font-medium",
						isInProgress
							? "text-[var(--color-brand-blue-deep)] dark:text-[var(--color-cermont-blue-light)]"
							: "text-brand-annotate dark:text-brand-annotate",
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
					<h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-tertiary)] text-400">
						<Clock className="size-4" aria-hidden="true" />
						Observaciones
					</h3>
					<p className="text-sm leading-relaxed text-[var(--text-secondary)] text-300">
						{order.observations}
					</p>
				</div>
			)}
		</>
	);
}

function InfoBlock({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg bg-[var(--surface-card)] px-4 py-3 bg-900">
			<dt className="text-xs font-medium text-[var(--text-tertiary)] text-400">{label}</dt>
			<dd className="mt-0.5 text-sm font-medium text-[var(--text-primary)] dark:text-white">
				{value}
			</dd>
		</div>
	);
}
