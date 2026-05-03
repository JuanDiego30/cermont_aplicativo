"use client";

import type { OrderPriority, OrderStatus } from "@cermont/shared-types";
import { Send, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	useBatchAssignOrders,
	useBatchUpdatePriority,
	useBatchUpdateStatus,
} from "@/orders/queries";
import { ORDER_PRIORITY_OPTIONS, ORDER_STATUS_OPTIONS } from "./toolbar-options";

interface OrderBulkActionsProps {
	selectedOrderIds: string[];
	onClear: () => void;
}

export function OrderBulkActions({ selectedOrderIds, onClear }: OrderBulkActionsProps) {
	const [status, setStatus] = useState<OrderStatus>("assigned");
	const [priority, setPriority] = useState<OrderPriority>("medium");
	const [technicianId, setTechnicianId] = useState("");
	const batchStatus = useBatchUpdateStatus();
	const batchPriority = useBatchUpdatePriority();
	const batchAssign = useBatchAssignOrders();
	const selectedCount = selectedOrderIds.length;

	if (selectedCount === 0) {
		return null;
	}

	return (
		<section
			aria-label="Acciones en lote"
			className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-3 shadow-[var(--shadow-1)]"
		>
			<p className="text-sm font-semibold text-[var(--text-primary)]">
				{selectedCount} seleccionada{selectedCount === 1 ? "" : "s"}
			</p>
			<div className="flex flex-wrap items-center gap-2">
				<select
					id="order-bulk-status"
					name="status"
					value={status}
					onChange={(event) => setStatus(event.target.value as OrderStatus)}
					className="min-h-11 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
				>
					{ORDER_STATUS_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<button
					type="button"
					onClick={async () => {
						await batchStatus.mutateAsync({ orderIds: selectedOrderIds, status });
						toast.success("Estado actualizado");
						onClear();
					}}
					className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--color-brand-blue)] px-3 text-sm font-semibold text-white"
				>
					<Send className="h-4 w-4" aria-hidden="true" />
					Estado
				</button>
				<select
					id="order-bulk-priority"
					name="priority"
					value={priority}
					onChange={(event) => setPriority(event.target.value as OrderPriority)}
					className="min-h-11 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
				>
					{ORDER_PRIORITY_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<button
					type="button"
					onClick={async () => {
						await batchPriority.mutateAsync({ orderIds: selectedOrderIds, priority });
						toast.success("Prioridad actualizada");
						onClear();
					}}
					className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border-default)] px-3 text-sm font-semibold text-[var(--text-secondary)]"
				>
					Prioridad
				</button>
				<input
					id="order-bulk-technicianId"
					name="technicianId"
					value={technicianId}
					onChange={(event) => setTechnicianId(event.target.value.trim())}
					placeholder="ID técnico"
					className="min-h-11 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
				/>
				<button
					type="button"
					disabled={!technicianId}
					onClick={async () => {
						await batchAssign.mutateAsync({ orderIds: selectedOrderIds, userId: technicianId });
						toast.success("Asignación actualizada");
						onClear();
					}}
					className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border-default)] px-3 text-sm font-semibold text-[var(--text-secondary)] disabled:opacity-50"
				>
					<UserRound className="h-4 w-4" aria-hidden="true" />
					Asignar
				</button>
				<button
					type="button"
					onClick={onClear}
					className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border-default)] px-3 text-sm font-semibold text-[var(--text-secondary)]"
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					Limpiar
				</button>
			</div>
		</section>
	);
}
