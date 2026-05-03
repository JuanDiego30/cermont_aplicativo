"use client";

import type { Order, OrderPriority, OrderStatus, OrderType } from "@cermont/shared-types";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/_shared/lib/utils";
import { PriorityBadge } from "@/core/ui/PriorityBadge";
import { StatusBadge } from "@/core/ui/StatusBadge";
import { useUpdateOrder, useUpdateOrderStatus } from "../queries";
import { OrderRowActions } from "./OrderRowActions";
import { formatOrderDate, getOrderAssigneeLabel, getOrderInitials } from "./order-helpers";

const TYPE_LABELS: Record<OrderType, string> = {
	maintenance: "Mantenimiento",
	inspection: "Inspección",
	installation: "Instalación",
	repair: "Reparación",
	decommission: "Descomisionamiento",
};

interface OrderTableRowProps {
	order: Order;
	isSelected?: boolean;
	selectionEnabled?: boolean;
	onSelect?: () => void;
	onView: (orderId: string) => void;
}

export function OrderTableRow({
	order,
	isSelected = false,
	selectionEnabled = false,
	onSelect,
	onView,
}: OrderTableRowProps) {
	const updateStatus = useUpdateOrderStatus(order._id);
	const updateOrder = useUpdateOrder(order._id);
	const dueDate = order.dueDate ?? order.slaDueDate;
	const isOverdue = dueDate ? new Date(dueDate).getTime() < Date.now() : false;

	return (
		<tr
			className={cn(
				"transition-colors hover:bg-[var(--surface-secondary)]",
				isSelected && "bg-[var(--color-info-bg)]/40",
			)}
		>
			{selectionEnabled ? (
				<td className="w-12 px-5 py-4 align-top">
					<input
						id={`order-select-${order._id}`}
						name="selectedOrderIds"
						type="checkbox"
						value={order._id}
						checked={isSelected}
						onChange={onSelect}
						aria-label={`Seleccionar orden ${order.code}`}
						className="mt-1 h-4 w-4 rounded border-[var(--border-default)] text-[var(--color-brand-blue)] focus:ring-[color:var(--color-brand-blue)]/20"
					/>
				</td>
			) : null}
			<td className="px-5 py-4">
				<span className="font-mono text-[13px] font-semibold text-[var(--color-brand-blue)]">
					{order.code}
				</span>
			</td>
			<td className="px-5 py-4 text-[var(--text-secondary)]">
				{TYPE_LABELS[order.type] ?? order.type}
			</td>
			<td className="px-5 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-info-bg)] text-xs font-bold text-[var(--color-brand-blue)]">
						{getOrderInitials(order.assignedToName ?? order.assetName)}
					</div>
					<div className="min-w-0 flex flex-col">
						<span className="font-medium text-[var(--text-primary)]">{order.assetName}</span>
						<span className="mt-0.5 text-xs text-[var(--text-tertiary)] lg:hidden">
							{getOrderAssigneeLabel(order.assignedToName, order.location)}
						</span>
					</div>
				</div>
			</td>
			<td className="hidden px-5 py-4 text-[var(--text-secondary)] lg:table-cell">
				<div className="flex items-center gap-1.5">
					<MapPin className="h-3.5 w-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
					<span className="truncate">{order.location}</span>
				</div>
			</td>
			<td className="px-5 py-4">
				<label className="sr-only" htmlFor={`status-${order._id}`}>
					Estado de {order.code}
				</label>
				<select
					id={`status-${order._id}`}
					name="status"
					value={order.status}
					onChange={(event) => updateStatus.mutate({ status: event.target.value as OrderStatus })}
					className="min-h-9 max-w-[140px] truncate rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-2 text-xs font-semibold"
				>
					<option value="open">Abierta</option>
					<option value="assigned">Asignada</option>
					<option value="in_progress">En curso</option>
					<option value="on_hold">En pausa</option>
					<option value="completed">Completada</option>
					<option value="ready_for_invoicing">Lista facturación</option>
					<option value="closed">Cerrada</option>
					<option value="cancelled">Cancelada</option>
				</select>
				<span className="sr-only">
					<StatusBadge status={order.status} />
				</span>
			</td>
			<td className="px-5 py-4">
				<label className="sr-only" htmlFor={`priority-${order._id}`}>
					Prioridad de {order.code}
				</label>
				<select
					id={`priority-${order._id}`}
					name="priority"
					value={order.priority}
					onChange={(event) =>
						updateOrder.mutate({ priority: event.target.value as OrderPriority })
					}
					className="min-h-9 max-w-[140px] truncate rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-2 text-xs font-semibold"
				>
					<option value="low">Baja</option>
					<option value="medium">Media</option>
					<option value="high">Alta</option>
					<option value="critical">Crítica</option>
				</select>
				<span className="sr-only">
					<PriorityBadge priority={order.priority} />
				</span>
			</td>
			<td className="hidden px-5 py-4 text-[var(--text-secondary)] md:table-cell">
				<div className={cn("flex items-center gap-1.5", isOverdue && "font-semibold text-red-600")}>
					<Clock className="h-3.5 w-3.5 text-current" aria-hidden="true" />
					{formatOrderDate(dueDate ?? order.createdAt)}
				</div>
			</td>
			<td className="px-5 py-4">
				<OrderRowActions order={order} onView={onView} />
			</td>
		</tr>
	);
}
