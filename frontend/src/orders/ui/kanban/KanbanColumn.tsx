"use client";

import type { Order } from "@cermont/shared-types";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/_shared/lib/utils";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
	id: string;
	label: string;
	orders: Order[];
	dragEnabled: boolean;
}

export function KanbanColumn({ id, label, orders, dragEnabled }: KanbanColumnProps) {
	const { isOver, setNodeRef } = useDroppable({ id, disabled: !dragEnabled });

	return (
		<section
			ref={setNodeRef}
			aria-labelledby={`kanban-column-${id}`}
			className={cn(
				"flex w-80 shrink-0 flex-col rounded-lg border border-[var(--border-default)] bg-[var(--surface-secondary)]",
				isOver && "ring-2 ring-[color:var(--color-brand-blue)] ring-offset-2",
			)}
		>
			<header className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3">
				<h2
					id={`kanban-column-${id}`}
					className="text-sm font-bold uppercase tracking-wide text-[var(--text-secondary)]"
				>
					{label}
				</h2>
				<span className="rounded-full bg-[var(--surface-primary)] px-2 py-0.5 text-xs font-bold text-[var(--text-secondary)]">
					{orders.length}
				</span>
			</header>
			<div className="flex max-h-[calc(100vh-260px)] flex-1 flex-col gap-3 overflow-y-auto p-3">
				{orders.map((order) => (
					<KanbanCard key={order._id} order={order} dragEnabled={dragEnabled} />
				))}
				{orders.length === 0 ? (
					<div className="grid min-h-24 place-items-center rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] text-xs font-semibold text-[var(--text-tertiary)]">
						Sin órdenes
					</div>
				) : null}
			</div>
		</section>
	);
}
