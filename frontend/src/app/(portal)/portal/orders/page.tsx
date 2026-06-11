"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/core/ui/Skeleton";
import { usePortalOrders } from "@/modules/portal/api/portal-api";

export default function PortalOrdersPage() {
	const { data: orders, isLoading, error } = usePortalOrders();

	if (isLoading) {
		return (
			<div className="space-y-3">
				<Skeleton variant="text" className="h-8 w-48" />
				<Skeleton variant="chart" height={320} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm text-[var(--color-danger)]">
				Error al cargar órdenes: {(error as Error).message}
			</div>
		);
	}

	if (!orders?.length) {
		return (
			<div className="space-y-6">
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Mis Órdenes</h1>
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-16 text-center">
					<ClipboardList
						className="mx-auto mb-3 size-10 text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
					<p className="text-[var(--text-secondary)]">No tienes órdenes de servicio registradas.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Mis Órdenes</h1>
			<div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
							<th className="px-4 py-3 font-medium">Código</th>
							<th className="px-4 py-3 font-medium">Estado</th>
							<th className="hidden px-4 py-3 font-medium md:table-cell">Servicio</th>
							<th className="hidden px-4 py-3 font-medium lg:table-cell">Creada</th>
							<th className="px-4 py-3 font-medium">Acción</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<tr
								key={order._id}
								className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--surface-secondary)]/50"
							>
								<td className="px-4 py-3 font-medium text-[var(--color-brand-blue)]">
									{order.code}
								</td>
								<td className="px-4 py-3">
									<span
										className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
											order.status === "completed" || order.status === "closed"
												? "bg-green-100 text-green-800"
												: order.status === "in_progress" || order.status === "assigned"
													? "bg-blue-100 text-blue-800"
													: "bg-gray-100 text-gray-600"
										}`}
									>
										{order.status.replace(/_/g, " ")}
									</span>
								</td>
								<td className="hidden px-4 py-3 capitalize text-[var(--text-secondary)] md:table-cell">
									{order.serviceType}
								</td>
								<td className="hidden px-4 py-3 text-[var(--text-tertiary)] lg:table-cell">
									{order.createdAt.slice(0, 10)}
								</td>
								<td className="px-4 py-3">
									<Link
										href={`/portal/orders/${order._id}`}
										className="text-xs font-medium text-[var(--color-brand-blue)] hover:underline"
									>
										Ver detalle
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
