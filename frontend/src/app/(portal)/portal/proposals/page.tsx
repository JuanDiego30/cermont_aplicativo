"use client";

import { FileText } from "lucide-react";
import { Skeleton } from "@/core/ui/Skeleton";
import { usePortalProposals } from "@/modules/portal/api/portal-api";

export default function PortalProposalsPage() {
	const { data: proposals, isLoading, error } = usePortalProposals();

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

	if (!proposals?.length) {
		return (
			<div className="space-y-6">
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Mis Propuestas</h1>
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-16 text-center">
					<FileText
						className="mx-auto mb-3 size-10 text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
					<p className="text-[var(--text-secondary)]">No tienes propuestas registradas.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Mis Propuestas</h1>
			<div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
							<th className="px-4 py-3 font-medium">Código</th>
							<th className="px-4 py-3 font-medium">Estado</th>
							<th className="hidden px-4 py-3 font-medium md:table-cell">Fecha</th>
							<th className="px-4 py-3 text-right font-medium">Valor</th>
						</tr>
					</thead>
					<tbody>
						{proposals.map((p) => (
							<tr
								key={p._id}
								className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--surface-secondary)]/50"
							>
								<td className="px-4 py-3 font-medium text-[var(--color-brand-blue)]">
									{p.code ?? "—"}
								</td>
								<td className="px-4 py-3">
									<span
										className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
											p.status === "approved"
												? "bg-green-100 text-green-800"
												: p.status === "rejected"
													? "bg-red-100 text-red-800"
													: p.status === "draft"
														? "bg-gray-100 text-gray-600"
														: "bg-blue-100 text-blue-800"
										}`}
									>
										{p.status}
									</span>
								</td>
								<td className="hidden px-4 py-3 text-[var(--text-tertiary)] md:table-cell">
									{p.createdAt.slice(0, 10)}
								</td>
								<td className="px-4 py-3 text-right font-medium">
									${p.total.toLocaleString("es-CO")}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
