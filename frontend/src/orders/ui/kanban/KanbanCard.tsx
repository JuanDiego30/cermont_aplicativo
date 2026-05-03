"use client";

import type { Order } from "@cermont/shared-types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { PriorityBadge } from "@/core/ui/PriorityBadge";
import { StatusBadge } from "@/core/ui/StatusBadge";

interface KanbanCardProps {
	order: Order;
	dragEnabled: boolean;
}

export function KanbanCard({ order, dragEnabled }: KanbanCardProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: order._id,
		disabled: !dragEnabled,
		data: { status: order.status },
	});
	const style = { transform: CSS.Translate.toString(transform) };

	return (
		<article
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-3 shadow-[var(--shadow-1)] transition hover:shadow-[var(--shadow-2)] data-[dragging=true]:opacity-60"
			data-dragging={isDragging}
		>
			<Link
				href={`/orders/${order._id}`}
				className="font-mono text-xs font-bold text-[var(--color-brand-blue)] hover:underline"
			>
				{order.code}
			</Link>
			<h3 className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--text-primary)]">
				{order.assetName}
			</h3>
			<p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">{order.description}</p>
			<div className="mt-3 flex flex-wrap gap-2">
				<StatusBadge status={order.status} />
				<PriorityBadge priority={order.priority} />
			</div>
			<div className="mt-3 flex items-center justify-between gap-2 text-xs text-[var(--text-tertiary)]">
				<span className="truncate">{order.assignedToName ?? "Sin asignar"}</span>
				<span>
					{order.dueDate ? new Date(order.dueDate).toLocaleDateString("es-CO") : "Sin SLA"}
				</span>
			</div>
		</article>
	);
}
