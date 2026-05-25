import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import { StatusBadge } from "@/core/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { formatOrderDate } from "@/modules/orders/ui/order-helpers";

// ── Types (aligned with @cermont/shared-types Order) ──
type RecentOrder = {
	_id: string;
	code: string;
	assetName: string;
	status: string;
	createdAt: string;
};

interface RecentOrdersTableProps {
	orders: RecentOrder[];
	className?: string;
}

export function RecentOrdersTable({ orders, className }: RecentOrdersTableProps) {
	const headingId = useId();

	if (!orders || orders.length === 0) {
		return (
			<div
				className={cn(
					"flex h-64 flex-col items-center justify-center rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-center p-8",
					className,
				)}
			>
				<p className="text-sm font-medium text-[var(--text-tertiary)]">
					No hay órdenes recientes registradas
				</p>
			</div>
		);
	}

	return (
		<section
			aria-labelledby={headingId}
			className={cn(
				"overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-card transition-all hover:shadow-md",
				className,
			)}
		>
			<div className="flex items-center justify-between px-8 pt-8 pb-4">
				<h3
					id={headingId}
					className="text-lg font-semibold tracking-tight text-[var(--text-primary)]"
				>
					Órdenes Recientes
				</h3>
				<Link
					href="/orders"
					className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand)] hover:underline underline-offset-4 font-mono"
				>
					Ver todas
				</Link>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<caption className="sr-only">
						Listado de órdenes recientes con acceso rápido al detalle.
					</caption>
					<thead>
						<tr className="bg-[var(--surface-secondary)]/50 text-left border-y border-[var(--border-subtle)]">
							<th
								scope="col"
								className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono"
							>
								N° OT
							</th>
							<th
								scope="col"
								className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-mono"
							>
								Activo
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
								Fecha
							</th>
							<th scope="col" className="px-8 py-4 text-right" aria-label="Acciones" />
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border-subtle)]">
						{orders.map((order) => {
							const orderNumber = order.code || "-";
							const createdAt = order.createdAt;
							const assetName = order.assetName || "-";
							const status = order.status || "open";

							return (
								<tr
									key={order._id}
									className="group transition-colors hover:bg-[var(--color-brand-blue-bg)]/20"
								>
									<td className="px-8 py-5">
										<span className="font-mono text-sm font-bold text-[var(--color-brand)]">
											{orderNumber}
										</span>
									</td>

									<td className="px-6 py-5">
										<p className="max-w-[240px] truncate font-medium text-[var(--text-primary)]">
											{assetName}
										</p>
									</td>

									<td className="px-6 py-5">
										<StatusBadge status={status} />
									</td>

									<td className="px-6 py-5">
										<p className="text-sm text-[var(--text-secondary)]">
											{createdAt ? formatOrderDate(createdAt) : "-"}
										</p>
									</td>

									<td className="px-8 py-5 text-right">
										<Link
											href={`/orders/${order._id}`}
											className="inline-flex size-9 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--text-tertiary)] transition-all group-hover:bg-[var(--color-brand)] group-hover:text-white group-hover:shadow-lg"
											aria-label={`Ver orden ${orderNumber}`}
										>
											<ChevronRight className="size-4.5" />
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
