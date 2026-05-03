"use client";

import type { Order } from "@cermont/shared-types";
import { useRouter } from "next/navigation";
import { OrderMobileCard } from "./OrderMobileCard";
import { OrdersTableEmpty } from "./OrdersTableEmpty";
import { OrdersTableSkeleton } from "./OrdersTableSkeleton";
import { OrderTableRow } from "./OrderTableRow";

interface OrdersTableProps {
	orders: Order[];
	isLoading?: boolean;
	selectedOrderIds?: string[];
	onToggleOrderSelection?: (orderId: string) => void;
	onToggleSelectAll?: () => void;
}

export function OrdersTable({
	orders,
	isLoading,
	selectedOrderIds,
	onToggleOrderSelection,
	onToggleSelectAll,
}: OrdersTableProps) {
	const router = useRouter();
	const selectedIds = new Set(selectedOrderIds ?? []);
	const selectionEnabled = Boolean(onToggleOrderSelection);
	const allSelected = selectionEnabled && orders.length > 0 && selectedIds.size === orders.length;

	const handleViewOrder = (orderId: string) => {
		router.push(`/orders/${orderId}`);
	};

	if (isLoading) {
		return <OrdersTableSkeleton />;
	}

	if (!orders || orders.length === 0) {
		return <OrdersTableEmpty />;
	}

	return (
		<section aria-label="Work order list">
			{/* Desktop Table View */}
			<div className="hidden overflow-x-auto sm:block">
				<table className="w-full text-left text-sm">
					<thead className="bg-[var(--surface-secondary)]">
						<tr className="bg-[var(--surface-secondary)]">
							{selectionEnabled ? (
								<th
									scope="col"
									className="w-12 px-5 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]"
								>
									<span className="sr-only">Seleccionar</span>
									<input
										id="orders-select-all"
										name="selectedOrderIds"
										type="checkbox"
										value="all"
										checked={allSelected}
										onChange={() => onToggleSelectAll?.()}
										aria-label={
											allSelected
												? "Deseleccionar todas las órdenes"
												: "Seleccionar todas las órdenes"
										}
										className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--color-brand-blue)] focus:ring-[color:var(--color-brand-blue)]/20"
									/>
								</th>
							) : null}
							<th
								scope="col"
								className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]"
							>
								Código
							</th>
							<th
								scope="col"
								className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]"
							>
								Tipo
							</th>
							<th
								scope="col"
								className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]"
							>
								Activo
							</th>
							<th
								scope="col"
								className="hidden px-5 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] lg:table-cell"
							>
								Ubicación
							</th>
							<th
								scope="col"
								className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]"
							>
								Estado
							</th>
							<th
								scope="col"
								className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]"
							>
								Prioridad
							</th>
							<th
								scope="col"
								className="hidden px-5 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] md:table-cell"
							>
								Fecha
							</th>
							<th
								scope="col"
								className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]"
							>
								<span className="sr-only">Acciones</span>
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border-default)] bg-[var(--surface-primary)]">
						{orders.map((order) => (
							<OrderTableRow
								key={order._id}
								order={order}
								isSelected={selectedIds.has(order._id)}
								selectionEnabled={selectionEnabled}
								onSelect={() => onToggleOrderSelection?.(order._id)}
								onView={handleViewOrder}
							/>
						))}
					</tbody>
				</table>
			</div>

			{/* Mobile Card View */}
			<div className="space-y-3 sm:hidden">
				{orders.map((order) => (
					<OrderMobileCard
						key={order._id}
						order={order}
						isSelected={selectedIds.has(order._id)}
						selectionEnabled={selectionEnabled}
						onSelect={() => onToggleOrderSelection?.(order._id)}
						onView={handleViewOrder}
					/>
				))}
			</div>
		</section>
	);
}
