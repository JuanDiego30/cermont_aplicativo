"use client";

import Link from "next/link";
import { useState } from "react";

interface OrderSummary {
	id: string;
	code: string;
	status: string;
	date: string;
}

const MOCK_ORDERS: OrderSummary[] = [
	{ id: "1", code: "SC-2026-0001", status: "En ejecución", date: "2026-06-15" },
	{ id: "2", code: "SC-2026-0002", status: "Pendiente de pago", date: "2026-06-20" },
	{ id: "3", code: "SC-2026-0003", status: "Completado", date: "2026-05-10" },
];

export default function PortalServiceCaseListPage() {
	const [orders] = useState(MOCK_ORDERS);

	return (
		<div className="p-4 md:p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">
					Mis órdenes de servicio
				</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Consulta el estado de tus servicios contratados
				</p>
			</div>

			{orders.length === 0 ? (
				<p className="py-8 text-center text-sm text-[var(--text-secondary)]">
					No tienes órdenes de servicio activas
				</p>
			) : (
				<div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)]">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-[var(--border-subtle)]">
								<th className="px-5 py-3 font-medium text-[var(--text-secondary)]">Código</th>
								<th className="px-5 py-3 font-medium text-[var(--text-secondary)]">Estado</th>
								<th className="px-5 py-3 font-medium text-[var(--text-secondary)]">Fecha</th>
								<th className="px-5 py-3 font-medium text-[var(--text-secondary)]">Acción</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--border-subtle)]">
							{orders.map((order) => (
								<tr key={order.id}>
									<td className="px-5 py-4 font-mono text-[var(--text-primary)]">{order.code}</td>
									<td className="px-5 py-4">
										<span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
											{order.status}
										</span>
									</td>
									<td className="px-5 py-4 text-[var(--text-secondary)]">
										{new Date(order.date).toLocaleDateString("es-CO")}
									</td>
									<td className="px-5 py-4">
										<Link
											href={`/portal/service-cases/${order.id}`}
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
			)}
		</div>
	);
}
