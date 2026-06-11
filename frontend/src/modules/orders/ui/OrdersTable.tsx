"use client";

import type { Order, OrderType } from "@cermont/shared-types";
import { Clock, Eye, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PriorityBadge } from "@/core/ui/PriorityBadge";
import { StatusBadge } from "@/core/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { formatOrderDate, getOrderInitials } from "./order-helpers";

interface OrdersTableProps {
	orders: Order[];
	isLoading?: boolean;
	selectedOrderIds?: string[];
	onToggleOrderSelection?: (orderId: string) => void;
	onToggleSelectAll?: () => void;
}

const TYPE_LABELS: Record<OrderType, string> = {
	maintenance: "Mantenimiento",
	inspection: "Inspección",
	installation: "Instalación",
	repair: "Reparación",
	decommission: "Descomisionamiento",
	other: "Otro",
};

export function OrdersTable({
	orders,
	isLoading,
	selectedOrderIds,
	onToggleOrderSelection,
	onToggleSelectAll,
}: OrdersTableProps) {
	const { push } = useRouter();
	const selectedIds = new Set(selectedOrderIds ?? []);
	const selectionEnabled = Boolean(onToggleOrderSelection);
	const allSelected = selectionEnabled && orders.length > 0 && selectedIds.size === orders.length;

	if (isLoading) {
		return <OrdersTableSkeleton rows={5} />;
	}

	if (!orders || orders.length === 0) {
		return <EmptyOrdersState onNewOrder={() => push("/orders/new")} />;
	}

	return (
		<div className="bg-[var(--surface-primary)]">
			{/* Desktop Table */}
			<div className="hidden overflow-x-auto lg:block">
				<table className="w-full text-left text-sm border-collapse">
					<thead className="sticky top-0 z-10 bg-[var(--surface-primary)]">
						<tr className="bg-[var(--surface-secondary)]/70 border-b border-[var(--border-subtle)]">
							{selectionEnabled ? (
								<th scope="col" className="w-14 px-6 py-4">
									<input
										type="checkbox"
										checked={allSelected}
										onChange={() => onToggleSelectAll?.()}
										aria-label="Seleccionar todas las órdenes"
										className="size-4.5 rounded border border-border text-brand focus:ring-brand/20"
									/>
								</th>
							) : null}
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-(--text-tertiary) font-mono"
							>
								N° OT
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono"
							>
								Activo / Equipo
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono"
							>
								Tipo de Servicio
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono"
							>
								Estado
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono"
							>
								Prioridad
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono text-right"
							>
								Acciones
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border-subtle)]">
						{orders.map((order) => (
							<tr
								key={order._id}
								className={cn(
									"group transition-all hover:bg-[var(--color-brand-blue-bg)]/20",
									selectedIds.has(order._id) && "bg-[var(--color-brand-blue-bg)]/40",
								)}
							>
								{selectionEnabled ? (
									<td className="px-6 py-5">
										<input
											type="checkbox"
											checked={selectedIds.has(order._id)}
											onChange={() => onToggleOrderSelection?.(order._id)}
											aria-label={`Seleccionar orden ${order.code}`}
											className="size-4.5 rounded border-[var(--border-medium)] text-[var(--color-brand)] focus:ring-[color:var(--color-brand)]/20"
										/>
									</td>
								) : null}
								<td className="px-6 py-5">
									<span className="font-mono text-sm font-bold text-[var(--color-brand)]">
										{order.code}
									</span>
								</td>
								<td className="px-6 py-5">
									<div className="flex items-center gap-3">
										<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-cermont-blue-bg)] text-xs font-bold text-[var(--color-brand)] shadow-sm ring-1 ring-[var(--color-brand)]/10">
											{getOrderInitials(order.assetName)}
										</div>
										<div className="min-w-0 flex flex-col">
											<span className="font-bold text-[var(--text-primary)] truncate">
												{order.assetName}
											</span>
											<span className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
												<MapPin className="size-3" />
												{order.location}
											</span>
										</div>
									</div>
								</td>
								<td className="px-6 py-5">
									<span className="inline-flex items-center rounded-lg bg-[var(--surface-secondary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
										{TYPE_LABELS[order.type] ?? order.type}
									</span>
								</td>
								<td className="px-6 py-5">
									<StatusBadge status={order.status} />
								</td>
								<td className="px-6 py-5">
									<PriorityBadge priority={order.priority} />
								</td>
								<td className="px-6 py-5 text-right">
									<button
										type="button"
										onClick={() => push(`/orders/${String(order._id)}`)}
										className="inline-flex size-9 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--text-tertiary)] transition-all group-hover:bg-[var(--color-brand)] group-hover:text-white group-hover:shadow-lg"
										aria-label={`Ver detalles de OT ${order.code}`}
									>
										<Eye className="size-4.5" aria-hidden="true" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Mobile / Tablet List */}
			<div className="grid grid-cols-1 gap-4 p-4 lg:hidden">
				{orders.map((order) => (
					<article
						key={order._id}
						className={cn(
							"rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm transition-all hover:shadow-md",
							selectedIds.has(order._id) && "ring-2 ring-[var(--color-brand)]/50",
						)}
					>
						<div className="flex items-start justify-between gap-4">
							<div className="flex items-center gap-3 min-w-0">
								{selectionEnabled && (
									<input
										type="checkbox"
										checked={selectedIds.has(order._id)}
										onChange={() => onToggleOrderSelection?.(order._id)}
										aria-label={`Seleccionar orden ${order.code}`}
										className="size-5 rounded border-[var(--border-medium)] text-[var(--color-brand)]"
									/>
								)}
								<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-cermont-blue-bg)] text-xs font-bold text-[var(--color-brand)]">
									{getOrderInitials(order.assetName)}
								</div>
								<div className="min-w-0">
									<p className="font-mono text-xs font-bold text-[var(--color-brand)] uppercase">
										{order.code}
									</p>
									<h4 className="mt-0.5 truncate font-semibold text-[var(--text-primary)]">
										{order.assetName}
									</h4>
								</div>
							</div>
							<PriorityBadge priority={order.priority} />
						</div>

						<div className="mt-4 flex flex-wrap gap-2">
							<StatusBadge status={order.status} />
							<span className="inline-flex items-center rounded-lg bg-[var(--surface-secondary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
								{TYPE_LABELS[order.type] ?? order.type}
							</span>
						</div>

						<div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
							<div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
								<Clock className="size-3.5" />
								{formatOrderDate(order.createdAt)}
							</div>
							<Link
								href={`/orders/${String(order._id)}`}
								className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand)] hover:underline"
							>
								Detalles →
							</Link>
						</div>
					</article>
				))}
			</div>
		</div>
	);
}

/* ── Skeleton Component ── */
function OrdersTableSkeleton({ rows = 5 }: { rows?: number }) {
	const skeletonIds = Array.from({ length: rows }, (_, i) => `sk-${i}`);

	return (
		<div
			className="w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-sm animate-fade-in"
			aria-busy="true"
		>
			<span className="sr-only">Tabla en carga</span>
			<div className="overflow-x-auto" aria-hidden="true">
				<table className="w-full border-collapse text-left text-sm">
					<thead>
						<tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)]/70">
							<th scope="col" className="w-14 px-6 py-4">
								<SkeletonBlock className="h-4.5 w-4.5 animate-pulse rounded" />
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono"
							>
								N° OT
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono"
							>
								Activo / Equipo
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono"
							>
								Tipo de Servicio
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono"
							>
								Estado
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono"
							>
								Prioridad
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono text-right"
							>
								Acciones
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border-subtle)]">
						{skeletonIds.map((id) => (
							<tr key={id} className="animate-pulse">
								<td className="px-6 py-5">
									<SkeletonBlock className="h-4.5 w-4.5 rounded" />
								</td>
								<td className="px-6 py-5">
									<SkeletonBlock className="h-4 w-12 rounded" />
								</td>
								<td className="px-6 py-5">
									<div className="flex items-center gap-3">
										<SkeletonBlock className="h-10 w-10 rounded-xl" />
										<div className="space-y-2">
											<SkeletonBlock className="h-4 w-28 rounded" />
											<SkeletonBlock className="h-3 w-16 rounded" />
										</div>
									</div>
								</td>
								<td className="px-6 py-5">
									<SkeletonBlock className="h-5 w-20 rounded-lg" />
								</td>
								<td className="px-6 py-5">
									<SkeletonBlock className="h-5.5 w-16 rounded-full" />
								</td>
								<td className="px-6 py-5">
									<SkeletonBlock className="h-5.5 w-16 rounded-full" />
								</td>
								<td className="px-6 py-5 text-right">
									<SkeletonBlock className="ml-auto h-9 w-9 rounded-full" />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function SkeletonBlock({ className }: { className: string }) {
	return <span className={cn("block bg-[var(--border-subtle)]", className)} aria-hidden="true" />;
}

/* ── Empty State Component ── */
function EmptyOrdersState({ onNewOrder }: { onNewOrder: () => void }) {
	return (
		<div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[var(--border-medium)] bg-[var(--surface-primary)] p-8 text-center animate-scale-in">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--surface-secondary)] text-[var(--text-tertiary)] mb-4">
				<Clock className="size-8" />
			</div>
			<p className="text-base font-semibold text-[var(--text-primary)]">
				No hay órdenes registradas
			</p>
			<p className="mt-1 text-sm text-[var(--text-tertiary)] max-w-xs">
				Aún no se han creado órdenes de trabajo con los criterios de búsqueda actuales.
			</p>
			<button
				type="button"
				onClick={onNewOrder}
				className="motion-button mt-6 rounded-full bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
			>
				Crear Nueva Orden
			</button>
		</div>
	);
}
