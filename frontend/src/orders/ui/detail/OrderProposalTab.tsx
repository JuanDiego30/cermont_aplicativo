"use client";

import { CheckCircle, Clock, Download, ExternalLink, FileText, Plus, XCircle } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/_shared/lib/utils/format-currency";
import { useOrder } from "@/orders/queries";
import { useProposal } from "@/proposals/queries";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";

interface OrderProposalTabProps {
	orderId: string;
}

export function OrderProposalTab({ orderId }: OrderProposalTabProps) {
	const { data: order } = useOrder(orderId);
	const proposalId = order?.proposalId ? String(order.proposalId) : "";
	const { data: proposal, isLoading } = useProposal(proposalId);

	if (isLoading) {
		return <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />;
	}

	return (
		<div className="space-y-6">
			{/* Section 1: Request data */}
			<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
				<h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
					Datos de la Solicitud
				</h3>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div className="space-y-1">
						<p className="text-xs text-slate-500">Cliente</p>
						<p className="font-medium">
							{proposal?.clientName || order?.commercial?.clientName || order?.assetName || "N/A"}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-xs text-slate-500">Ubicación</p>
						<p className="font-medium">{order?.location || "N/A"}</p>
					</div>
					<div className="md:col-span-2 space-y-1">
						<p className="text-xs text-slate-500">Descripción del Trabajo</p>
						<p className="text-sm">{proposal?.title || order?.description || "N/A"}</p>
					</div>
				</div>
			</section>

			{/* Section 2: Proposal details */}
			<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
				<header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
						Propuesta Económica
					</h3>
					{proposalId ? (
						<div className="flex flex-wrap gap-2">
							<Button variant="ghost" size="sm" asChild>
								<a href={`/api/backend/proposals/${proposalId}/pdf`} download={`proposal-${proposalId}.pdf`}>
									<Download className="h-4 w-4" />
									Descargar PDF
								</a>
							</Button>
							<Button variant="ghost" size="sm" asChild>
								<Link href={`/proposals/${proposalId}`}>
									<ExternalLink className="h-4 w-4" />
									Ver Detalle Completo
								</Link>
							</Button>
						</div>
					) : (
						<Button size="sm" asChild>
							<Link href={`/proposals/new?orderId=${orderId}`}>
								<Plus className="h-4 w-4" />
								Crear Propuesta
							</Link>
						</Button>
					)}
				</header>

				{proposal ? (
					<div className="space-y-6">
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
									<tr>
										<th className="px-4 py-3">Descripción</th>
										<th className="px-4 py-3 text-center">Cant.</th>
										<th className="px-4 py-3 text-right">Unitario</th>
										<th className="px-4 py-3 text-right">Subtotal</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-50 dark:divide-slate-800">
									{proposal.items.map((item) => (
										<tr key={item.description} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20">
											<td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.description}</td>
											<td className="px-4 py-3 text-center">
												{item.quantity} {item.unit}
											</td>
											<td className="px-4 py-3 text-right">{formatCurrency(item.unitCost)}</td>
											<td className="px-4 py-3 text-right font-medium">{formatCurrency(item.total)}</td>
										</tr>
									))}
								</tbody>
								<tfoot className="border-t-2 border-slate-100 bg-slate-50/30 font-semibold dark:border-slate-800 dark:bg-slate-900/20">
									<tr>
										<td colSpan={3} className="px-4 py-3 text-right">
											Subtotal
										</td>
										<td className="px-4 py-3 text-right">{formatCurrency(proposal.subtotal)}</td>
									</tr>
									<tr>
										<td colSpan={3} className="px-4 py-3 text-right">
											IVA (19%)
										</td>
										<td className="px-4 py-3 text-right">{formatCurrency(proposal.subtotal * 0.19)}</td>
									</tr>
									<tr className="text-blue-600 dark:text-blue-400">
										<td colSpan={3} className="px-4 py-3 text-right text-base">
											Total Propuesta
										</td>
										<td className="px-4 py-3 text-right text-base">{formatCurrency(proposal.total)}</td>
									</tr>
								</tfoot>
							</table>
						</div>

						{/* Section 3: Approval status */}
						<div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-3">
									{proposal.status === "approved" ? (
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
											<CheckCircle className="h-6 w-6" />
										</div>
									) : proposal.status === "rejected" ? (
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
											<XCircle className="h-6 w-6" />
										</div>
									) : (
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
											<Clock className="h-6 w-6" />
										</div>
									)}
									<div>
										<p className="font-semibold text-slate-900 dark:text-white">
											Estado: {getProposalStatusLabel(proposal.status)}
										</p>
										{proposal.poNumber ? (
											<p className="text-xs text-slate-500">PO Cliente: {proposal.poNumber}</p>
										) : null}
									</div>
								</div>

								<div className="flex gap-2">
									{proposal.status === "approved" ? (
										<BadgePill
											className="bg-green-100 text-green-700 ring-green-600/20"
											leadingIcon={<CheckCircle className="h-3 w-3" />}
										>
											Aprobada por cliente
										</BadgePill>
									) : null}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 text-center">
						<FileText className="mb-4 h-12 w-12 text-slate-300" />
						<p className="text-slate-500">No hay propuesta vinculada.</p>
						<p className="mt-1 text-xs text-slate-400">
							Las propuestas económicas se gestionan en el módulo comercial.
						</p>
					</div>
				)}
			</section>
		</div>
	);
}

function getProposalStatusLabel(status: string): string {
	const labels: Record<string, string> = {
		draft: "Borrador",
		sent: "Enviada",
		approved: "Aprobada",
		rejected: "Rechazada",
		expired: "Vencida",
	};

	return labels[status] ?? status;
}
