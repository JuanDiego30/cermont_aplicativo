"use client";

import type { Order, OrderType } from "@cermont/shared-types";
import { Eye, MapPin } from "lucide-react";
import { PriorityBadge } from "@/core/ui/PriorityBadge";
import { formatOrderDate, getOrderAssigneeLabel, getOrderInitials } from "./order-helpers";

const TYPE_LABELS: Record<OrderType, string> = {
	maintenance: "Mantenimiento",
	inspection: "Inspección",
	installation: "Instalación",
	repair: "Reparación",
	decommission: "Descomisionamiento",
};

interface OrderMobileCardProps {
	order: Order;
	isSelected?: boolean;
	selectionEnabled?: boolean;
	onSelect?: () => void;
	onView: (orderId: string) => void;
}

export function OrderMobileCard({
	order,
	isSelected = false,
	selectionEnabled = false,
	onSelect,
	onView,
}: OrderMobileCardProps) {
	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						{selectionEnabled ? (
							<input
								id={`order-select-mobile-${order._id}`}
								name="selectedOrderIds"
								type="checkbox"
								value={order._id}
								checked={isSelected}
								onChange={onSelect}
								aria-label={`Seleccionar orden ${order.code}`}
								className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--color-brand-blue)] focus:ring-[color:var(--color-brand-blue)]/20"
							/>
						) : null}
						<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-info-bg)] text-[10px] font-bold text-[var(--color-brand-blue)]">
							{getOrderInitials(order.assignedToName ?? order.assetName)}
						</span>
						<span className="font-mono text-xs font-semibold text-[var(--color-brand-blue)]">
							{order.code}
						</span>
					</div>
					<p className="mt-1 truncate font-medium text-[var(--text-primary)]">{order.assetName}</p>
					<div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
						<MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
						<span className="truncate">
							{getOrderAssigneeLabel(order.assignedToName, order.location)}
						</span>
					</div>
				</div>
				<PriorityBadge priority={order.priority} />
			</div>
			<div className="mt-3 flex items-center justify-between border-t border-[var(--border-default)] pt-3">
				<span className="text-xs text-[var(--text-secondary)]">
					{TYPE_LABELS[order.type] ?? order.type} • {formatOrderDate(order.createdAt)}
				</span>
				<button
					type="button"
					onClick={() => onView(order._id)}
					className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-brand-blue)] hover:bg-[var(--color-info-bg)]"
				>
					<Eye className="h-3.5 w-3.5" aria-hidden="true" />
					Ver detalles
				</button>
			</div>
		</article>
	);
}
