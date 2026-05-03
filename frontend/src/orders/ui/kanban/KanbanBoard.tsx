"use client";

import type { Order, OrderStatus } from "@cermont/shared-types";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { groupByPriority } from "./group-by-priority";
import { groupByStatus } from "./group-by-status";
import { groupByTechnician } from "./group-by-technician";
import { KanbanColumn } from "./KanbanColumn";
import type { GroupByStrategy } from "./types";

interface KanbanBoardProps {
	orders: Order[];
	groupBy: "status" | "priority" | "technician" | "client";
	onStatusChange: (orderId: string, status: OrderStatus) => void;
}

function resolveStrategy(groupBy: KanbanBoardProps["groupBy"]): GroupByStrategy {
	if (groupBy === "priority") {
		return groupByPriority;
	}
	if (groupBy === "technician" || groupBy === "client") {
		return groupByTechnician;
	}
	return groupByStatus;
}

export function KanbanBoard({ orders, groupBy, onStatusChange }: KanbanBoardProps) {
	const strategy = resolveStrategy(groupBy);
	const groups = strategy.groups(orders);
	const columnOrder = strategy.columnOrder.length > 0 ? strategy.columnOrder : [...groups.keys()];

	const handleDragEnd = (event: DragEndEvent) => {
		const overId = event.over?.id;
		if (!strategy.allowDragDrop || typeof overId !== "string") {
			return;
		}
		if (window.confirm("¿Mover esta orden a la nueva columna?")) {
			onStatusChange(String(event.active.id), overId as OrderStatus);
		}
	};

	return (
		<DndContext onDragEnd={handleDragEnd}>
			<div className="flex gap-4 overflow-x-auto pb-4">
				{columnOrder.map((column) => (
					<KanbanColumn
						key={column}
						id={String(column)}
						label={strategy.groupLabel(String(column))}
						orders={groups.get(String(column)) ?? []}
						dragEnabled={strategy.allowDragDrop}
					/>
				))}
			</div>
		</DndContext>
	);
}
