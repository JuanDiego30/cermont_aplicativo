"use client";

import type { DashboardSlaRiskOrder } from "@cermont/shared-types";
import { ArrowRight, TriangleAlert } from "lucide-react";
import Link from "next/link";

interface SlaRiskOrdersTableProps {
	orders: DashboardSlaRiskOrder[];
}

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
	dateStyle: "medium",
	timeStyle: "short",
});

const RISK_BADGE_CLASSES: Record<DashboardSlaRiskOrder["riskLevel"], string> = {
	critical:
		"border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
	warning: "border-brand-warn bg-warning-bg text-brand-warn",
};

const RISK_LABEL: Record<DashboardSlaRiskOrder["riskLevel"], string> = {
	critical: "Crítico",
	warning: "Alerta",
};

function formatRemaining(hoursRemaining: number): string {
	if (hoursRemaining < 0) {
		const overdue = Math.abs(hoursRemaining);
		return overdue >= 24
			? `Vencida hace ${Math.floor(overdue / 24)} d`
			: `Vencida hace ${Math.round(overdue)} h`;
	}
	return hoursRemaining >= 24
		? `${Math.floor(hoursRemaining / 24)} d restantes`
		: `${Math.round(hoursRemaining)} h restantes`;
}

export function SlaRiskOrdersTable({ orders }: SlaRiskOrdersTableProps) {
	return (
		<section
			aria-labelledby="sla-risk-title"
			className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 sm:p-6"
		>
			<div className="flex items-start gap-3">
				<TriangleAlert className="mt-0.5 size-5 text-[var(--color-danger)]" aria-hidden="true" />
				<div>
					<h2 id="sla-risk-title" className="text-lg font-semibold text-[var(--text-primary)]">
						Órdenes en riesgo de incumplir la fecha prometida
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Casos activos vencidos o con menos de 72 horas para su fecha objetivo.
					</p>
				</div>
			</div>

			{orders.length === 0 ? (
				<p className="mt-5 rounded-[var(--radius-md)] bg-[var(--surface-secondary)] p-4 text-sm text-[var(--text-secondary)]">
					Sin órdenes en riesgo de SLA en este momento.
				</p>
			) : (
				<div className="mt-5 overflow-x-auto">
					<table className="w-full min-w-[640px] text-left text-xs">
						<caption className="sr-only">Órdenes activas en riesgo de SLA</caption>
						<thead>
							<tr className="border-b border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
								<th scope="col" className="px-3 py-2">
									Caso
								</th>
								<th scope="col" className="px-3 py-2">
									Cliente
								</th>
								<th scope="col" className="px-3 py-2">
									Fecha objetivo
								</th>
								<th scope="col" className="px-3 py-2">
									Tiempo
								</th>
								<th scope="col" className="px-3 py-2">
									Paso
								</th>
								<th scope="col" className="px-3 py-2">
									Riesgo
								</th>
								<th scope="col" className="px-3 py-2">
									<span className="sr-only">Acciones</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((order) => (
								<tr
									key={order.serviceCaseId}
									className={`border-b border-[var(--border-subtle)] last:border-b-0 ${
										order.riskLevel === "critical" ? "bg-[var(--color-danger-bg)]/40" : ""
									}`}
								>
									<td className="px-3 py-2.5 font-mono font-semibold text-[var(--text-primary)]">
										{order.code}
									</td>
									<td className="px-3 py-2.5 text-[var(--text-secondary)]">
										{order.clientName ?? "Sin cliente"}
									</td>
									<td className="px-3 py-2.5 text-[var(--text-secondary)]">
										{DATE_FORMATTER.format(new Date(order.slaDeadline))}
									</td>
									<td className="px-3 py-2.5 font-semibold text-[var(--text-primary)]">
										{formatRemaining(order.hoursRemaining)}
									</td>
									<td className="px-3 py-2.5 text-[var(--text-secondary)]">
										{order.currentStep} / 14
									</td>
									<td className="px-3 py-2.5">
										<span
											className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${RISK_BADGE_CLASSES[order.riskLevel]}`}
										>
											{RISK_LABEL[order.riskLevel]}
										</span>
									</td>
									<td className="px-3 py-2.5 text-right">
										<Link
											href={`/service-cases/${order.serviceCaseId}`}
											className="inline-flex min-h-11 items-center gap-1 px-1 font-semibold text-[var(--color-brand)] hover:underline"
										>
											Ver caso
											<ArrowRight className="size-3" aria-hidden="true" />
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
