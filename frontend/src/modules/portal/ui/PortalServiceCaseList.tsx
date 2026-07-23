"use client";

import Link from "next/link";
import { formatLocaleDate } from "@/lib/utils/format-date";

interface OrderSummary {
	id: string;
	code: string;
	status: string;
	date: string;
}

interface Props {
	orders: OrderSummary[];
}

const STATUS_COLORS: Record<string, string> = {
	"En ejecución": "bg-blue-100 text-blue-700",
	"Pendiente de pago": "bg-amber-100 text-amber-700",
	Completado: "bg-green-100 text-green-700",
};

export function PortalServiceCaseList({ orders }: Props) {
	return (
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
								<span
									className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}
								>
									{order.status}
								</span>
							</td>
							<td className="px-5 py-4 text-[var(--text-secondary)]">
								{formatLocaleDate(order.date, { dateStyle: "medium" })}
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
	);
}
