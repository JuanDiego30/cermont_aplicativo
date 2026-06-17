"use client";

import { DollarSign } from "lucide-react";
import { Skeleton } from "@/core/ui/Skeleton";
import { usePortalInvoices } from "@/modules/portal/api/portal-api";

export default function PortalInvoicesPage() {
	const { data: invoices, isLoading, error } = usePortalInvoices();

	if (isLoading) {
		return (
			<div className="space-y-3">
				<Skeleton variant="text" className="h-8 w-48" />
				<Skeleton variant="chart" height={240} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm text-[var(--color-danger)]">
				Error: {(error as Error).message}
			</div>
		);
	}

	if (!invoices?.length) {
		return (
			<div className="space-y-6">
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Mis Facturas</h1>
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-subtle)] p-16 text-center">
					<DollarSign
						className="mx-auto mb-3 size-10 text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
					<p className="text-[var(--text-secondary)]">No tienes facturas registradas.</p>
				</div>
			</div>
		);
	}

	const totalPending = invoices
		.filter((i) => ["issued", "sent", "submitted", "approved"].includes(i.status))
		.reduce((s, i) => s + i.totalAmount, 0);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Mis Facturas</h1>
				<div className="text-right">
					<p className="text-sm text-[var(--text-secondary)]">Pendiente por pagar</p>
					<p className="text-xl font-semibold text-[var(--color-brand-blue)]">
						${totalPending.toLocaleString("es-CO")}
					</p>
				</div>
			</div>
			<div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
							<th className="px-4 py-3 font-medium">Código</th>
							<th className="px-4 py-3 font-medium">Estado</th>
							<th className="hidden px-4 py-3 font-medium md:table-cell">Emisión</th>
							<th className="hidden px-4 py-3 font-medium lg:table-cell">Vencimiento</th>
							<th className="px-4 py-3 text-right font-medium">Valor</th>
						</tr>
					</thead>
					<tbody>
						{invoices.map((inv) => (
							<tr
								key={inv._id}
								className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-secondary)]/50"
							>
								<td className="px-4 py-3 font-medium text-[var(--color-brand-blue)]">{inv.code}</td>
								<td className="px-4 py-3">
									<span
										className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${inv.status === "paid" ? "bg-success-bg text-brand-annotate" : inv.status === "cancelled" ? "bg-danger-bg text-brand-error" : "bg-yellow-100 text-brand-warn"}`}
									>
										{inv.status.replace(/_/g, " ")}
									</span>
								</td>
								<td className="hidden px-4 py-3 text-[var(--text-tertiary)] md:table-cell">
									{inv.issueDate?.slice(0, 10) ?? "—"}
								</td>
								<td className="hidden px-4 py-3 text-[var(--text-tertiary)] lg:table-cell">
									{inv.dueDate?.slice(0, 10) ?? "—"}
								</td>
								<td className="px-4 py-3 text-right font-medium">
									${inv.totalAmount.toLocaleString("es-CO")}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
