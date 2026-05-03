import type { Order } from "@cermont/shared-types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import { StatusBadge } from "@/core/ui/StatusBadge";
import { formatOrderDate } from "@/orders/ui/order-helpers";

interface RecentOrdersTableProps {
	orders: Order[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
	const headingId = useId();

	if (!orders || orders.length === 0) {
		return (
			<p className="flex h-32 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
				No hay órdenes recientes
			</p>
		);
	}

	return (
		<section
			aria-labelledby={headingId}
			className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-5 pb-5 pt-6 shadow-[var(--shadow-1)] transition-all hover:shadow-[var(--shadow-2)] sm:px-6 xl:pb-1"
		>
			<h3 id={headingId} className="mb-6 text-xl font-bold text-[var(--text-primary)]">
				Órdenes Recientes
			</h3>

			<div className="overflow-x-auto">
				<table className="w-full min-w-[640px] text-sm">
					<caption className="sr-only">
						Listado de órdenes recientes con acceso rápido al detalle.
					</caption>
					<thead>
						<tr className="rounded-2xl bg-[var(--surface-secondary)] text-left">
							<th
								scope="col"
								className="p-2.5 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] xl:p-5"
							>
								N° OT
							</th>
							<th
								scope="col"
								className="p-2.5 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] xl:p-5"
							>
								Activo
							</th>
							<th
								scope="col"
								className="p-2.5 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] xl:p-5"
							>
								Estado
							</th>
							<th
								scope="col"
								className="p-2.5 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] xl:p-5"
							>
								Fecha
							</th>
							<th
								scope="col"
								className="p-2.5 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] xl:p-5"
							>
								Acción
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border-default)]">
						{orders.map((order, key) => {
							const orderNumber = order.code || "-";
							const createdAt = order.createdAt;
							const assetName = order.assetName || "-";
							const status = order.status || "open";

							return (
								<tr
									className={`transition-colors hover:bg-[var(--surface-secondary)] ${
										key === orders.length - 1 ? "" : "border-b border-[var(--border-default)]"
									}`}
									key={order._id}
								>
									<th scope="row" className="p-2.5 text-left xl:p-5">
										<span className="font-mono text-[13px] font-semibold text-[var(--color-brand-blue)]">
											{orderNumber}
										</span>
									</th>

									<td className="p-2.5 xl:p-5">
										<p className="max-w-[180px] truncate text-sm text-[var(--text-secondary)]">
											{assetName}
										</p>
									</td>

									<td className="p-2.5 xl:p-5">
										<StatusBadge status={status} />
									</td>

									<td className="p-2.5 xl:p-5">
										<p className="text-sm text-[var(--text-tertiary)]">
											{createdAt ? formatOrderDate(createdAt) : "-"}
										</p>
									</td>

									<td className="p-2.5 xl:p-5">
										<Link
											href={`/orders/${order._id}`}
											className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--color-brand-blue)] transition-all hover:bg-[var(--color-info-bg)] hover:text-[var(--color-brand-blue-hover)]"
											aria-label={`Ver orden ${orderNumber}`}
										>
											<ChevronRight aria-hidden="true" className="h-4 w-4" />
										</Link>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</section>
	);
}
