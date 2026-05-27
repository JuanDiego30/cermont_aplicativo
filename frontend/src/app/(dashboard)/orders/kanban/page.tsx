"use client";

import type { Order } from "@cermont/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { DndProvider, type DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PriorityBadge } from "@/core/ui/PriorityBadge";
import { apiClient } from "@/lib/http/api-client";
import { createLogger } from "@/lib/monitoring/logger";
import { cn } from "@/lib/utils";
import { ORDERS_KEYS, useOrders } from "@/modules/orders/queries";
import {
	COLUMN_COLORS,
	COLUMN_LABELS,
	KANBAN_ORDER_QUERY_LIMIT,
	type KanbanData,
	type KanbanOrder,
	VISIBLE_COLUMNS,
} from "./kanban-constants";

const logger = createLogger("orders:kanban");
const ITEM_TYPE = "ORDER_CARD";
const VISIBLE_COLUMN_SET = new Set(VISIBLE_COLUMNS);

function toKanbanOrder(order: Order): KanbanOrder {
	return {
		id: order._id,
		code: order.code,
		description: order.description,
		status: order.status,
		priority: order.priority,
		assignedToName: order.assignedToName ?? null,
		startedAt: order.startedAt ?? null,
		completedAt: order.completedAt ?? null,
	};
}

function groupOrdersByStatus(orders: Order[]): KanbanData {
	const grouped = VISIBLE_COLUMNS.reduce((acc, status) => {
		acc[status] = [];
		return acc;
	}, {} as KanbanData);

	for (const order of orders) {
		if (!VISIBLE_COLUMN_SET.has(order.status)) {
			continue;
		}

		grouped[order.status].push(toKanbanOrder(order));
	}

	return grouped;
}

function OrderCard({
	order,
	onMove,
}: {
	order: KanbanOrder;
	onMove: (orderId: string, newStatus: string) => void;
}) {
	const [, drag] = useDrag<{ orderId: string; fromStatus: string }>(() => ({
		type: ITEM_TYPE,
		item: { orderId: order.id, fromStatus: order.status },
	}));
	const setDragRef = useCallback(
		(node: HTMLDivElement | null) => {
			drag(node);
		},
		[drag],
	);

	return (
		<div
			ref={setDragRef}
			className={cn(
				"cursor-grab rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)] transition-all",
				"active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)]",
			)}
		>
			<Link
				href={`/orders/${order.id}`}
				className="block font-mono text-xs font-semibold text-[var(--color-brand-blue)] hover:underline"
				onClick={(e) => e.stopPropagation()}
			>
				{order.code}
			</Link>
			<p className="mt-1.5 truncate text-sm font-medium text-[var(--text-primary)]">
				{order.description}
			</p>
			<div className="mt-3 flex flex-wrap gap-2">
				<PriorityBadge priority={order.priority} />
			</div>
			<div className="mt-3">
				<label htmlFor={`kanban-order-status-${order.id}`} className="sr-only">
					Mover la orden {order.code} a otra columna
				</label>
				<select
					id={`kanban-order-status-${order.id}`}
					value={order.status}
					onChange={(event) => onMove(order.id, event.target.value)}
					className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-xs text-[var(--text-primary)] shadow-sm outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20"
				>
					{VISIBLE_COLUMNS.map((status) => (
						<option key={status} value={status}>
							{COLUMN_LABELS[status] ?? status}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

function KanbanColumn({
	status,
	orders,
	onDrop,
}: {
	status: string;
	orders: KanbanOrder[];
	onDrop: (orderId: string, newStatus: string) => void;
}) {
	const [{ isOver }, drop] = useDrop<
		{ orderId: string; fromStatus: string },
		void,
		{ isOver: boolean }
	>({
		accept: ITEM_TYPE,
		drop: (item: { orderId: string; fromStatus: string }) => {
			if (item.fromStatus !== status) {
				onDrop(item.orderId, status);
			}
		},
		collect: (monitor: DropTargetMonitor<{ orderId: string; fromStatus: string }, void>) => ({
			isOver: monitor.isOver(),
		}),
	});
	const setDropRef = useCallback(
		(node: HTMLDivElement | null) => {
			drop(node);
		},
		[drop],
	);
	const label = COLUMN_LABELS[status] ?? status;
	const colors =
		COLUMN_COLORS[status] ?? "bg-[var(--surface-secondary)] border-[var(--border-default)]";

	return (
		<div
			ref={setDropRef}
			className={cn(
				"flex w-80 flex-shrink-0 flex-col rounded-[var(--radius-xl)] border transition-all",
				colors,
				isOver &&
					"ring-2 ring-[color:var(--color-brand-blue)] ring-offset-2 ring-offset-[var(--surface-page)]",
			)}
		>
			<div className="flex items-center justify-between px-5 py-4">
				<h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
					{label}
				</h3>
				<span className="rounded-full bg-[var(--surface-secondary)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
					{orders.length}
				</span>
			</div>
			<div className="max-h-[calc(100vh-240px)] flex h-full flex-col gap-3 overflow-y-auto px-4 pb-4 pt-0">
				{orders.map((order) => (
					<OrderCard key={order.id} order={order} onMove={onDrop} />
				))}
				{orders.length === 0 && (
					<div className="flex h-24 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)]/80">
						<p className="text-xs font-medium text-[var(--text-tertiary)]">Sin órdenes</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default function OrdersKanbanPage() {
	const queryClient = useQueryClient();
	const [error, setError] = useState<string | null>(null);
	const kanbanFilters = useMemo(() => ({ limit: KANBAN_ORDER_QUERY_LIMIT }), []);
	const { data: orderPage, isLoading, error: loadError } = useOrders(kanbanFilters);

	const data = useMemo(() => groupOrdersByStatus(orderPage?.items ?? []), [orderPage?.items]);

	const updateStatusMutation = useMutation({
		mutationFn: async ({
			orderId,
			newStatus,
		}: {
			orderId: string;
			newStatus: KanbanOrder["status"];
		}) => {
			await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
		},
		onSuccess: async () => {
			setError(null);
			await queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.all });
		},
		onError: (mutationError) => {
			logger.error("Error updating order status", mutationError);
			setError(
				mutationError instanceof Error ? mutationError.message : "No se pudo mover la orden.",
			);
		},
	});

	const handleDrop = useCallback(
		(orderId: string, newStatus: string) => {
			updateStatusMutation.mutate({ orderId, newStatus: newStatus as KanbanOrder["status"] });
		},
		[updateStatusMutation],
	);

	return (
		<section className="flex h-full flex-col gap-y-4" aria-labelledby="orders-kanban-title">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Link
						href="/orders"
						className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Lista
					</Link>
					<h1
						id="orders-kanban-title"
						className="text-2xl font-semibold text-[var(--text-primary)]"
					>
						Kanban de Órdenes
					</h1>
				</div>
				<Link
					href="/orders/new"
					className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)]"
				>
					<Plus aria-hidden="true" className="size-4" />
					Nueva orden
				</Link>
			</div>

			{(error || loadError) && (
				<div
					role="alert"
					className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
				>
					{error || "No se pudo cargar el tablero kanban."}
				</div>
			)}

			{isLoading ? (
				<div
					role="status"
					aria-live="polite"
					className="flex h-64 items-center justify-center text-sm text-[var(--text-tertiary)]"
				>
					Cargando tablero kanban…
				</div>
			) : (
				<DndProvider backend={HTML5Backend}>
					<div className="flex gap-4 overflow-x-auto pb-4">
						{VISIBLE_COLUMNS.map((status) => (
							<KanbanColumn
								key={status}
								status={status}
								orders={data[status] ?? []}
								onDrop={handleDrop}
							/>
						))}
					</div>
				</DndProvider>
			)}
		</section>
	);
}
