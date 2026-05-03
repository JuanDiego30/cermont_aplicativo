"use client";

import { CalendarCheck, FileText, ImageIcon, PenLine } from "lucide-react";
import type { ReactNode } from "react";
import { formatCurrency } from "@/_shared/lib/utils/format-currency";
import { formatDate } from "@/_shared/lib/utils/format-date";
import { useOrder } from "@/orders/queries";
import { ReportPanel } from "@/reports";
import { OrderDeliveryRecord } from "./OrderDeliveryRecord";
import { OrderDocumentsTab } from "./OrderDocumentsTab";
import { OrderEvidencesTab } from "./OrderEvidencesTab";

interface OrderReportTabProps {
	orderId: string;
}

export function OrderReportTab({ orderId }: OrderReportTabProps) {
	const { data: order, isLoading, error } = useOrder(orderId);

	if (isLoading) {
		return <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />;
	}

	if (error || !order) {
		return (
			<section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
				No se pudo cargar la información del informe.
			</section>
		);
	}

	const executedValue = order.commercial?.nteAmount ?? order.costBaseline?.total ?? 0;
	const canManageDeliveryRecord = ["completed", "ready_for_invoicing", "closed"].includes(
		order.status,
	);

	return (
		<section aria-label="Informe y acta" className="space-y-6">
			<section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
						<CalendarCheck className="h-5 w-5" aria-hidden="true" />
					</div>
					<div>
						<h2 className="text-lg font-semibold text-slate-950 dark:text-white">
							Resumen ejecutivo
						</h2>
						<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
							Base del informe técnico y el acta de entrega, prellenada desde la OT.
						</p>
					</div>
				</div>

				<dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<InfoCard label="Cliente" value={order.commercial?.clientName ?? "Sin cliente"} />
					<InfoCard label="Orden" value={order.code} />
					<InfoCard
						label="Fecha ejecución"
						value={order.completedAt ? formatDate(order.completedAt) : "Pendiente"}
					/>
					<InfoCard label="Valor ejecutado" value={formatCurrency(executedValue)} />
					<div className="sm:col-span-2 lg:col-span-4">
						<InfoCard label="Actividad ejecutada" value={order.description} />
					</div>
				</dl>
			</section>

			<ReportPanel orderId={orderId} readOnly={order.status === "closed"} />

			<section className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-3">
					<SectionHeading
						icon={<ImageIcon className="h-4 w-4" aria-hidden="true" />}
						title="Registro fotográfico"
						description="Evidencias categorizadas para seleccionar en informe y anexos."
					/>
					<OrderEvidencesTab orderId={orderId} />
				</div>
				<div className="space-y-3">
					<SectionHeading
						icon={<FileText className="h-4 w-4" aria-hidden="true" />}
						title="Documentos de soporte"
						description="Actas, formatos, AST y soportes del cierre operativo."
					/>
					<OrderDocumentsTab orderId={orderId} />
				</div>
			</section>

			<div className="space-y-3">
				<SectionHeading
					icon={<PenLine className="h-4 w-4" aria-hidden="true" />}
					title="Acta de entrega"
					description="Registro formal de entrega y firma antes del paso a facturación."
				/>
				<OrderDeliveryRecord orderId={orderId} disabled={!canManageDeliveryRecord} />
			</div>
		</section>
	);
}

function InfoCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
			<dt className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
				{label}
			</dt>
			<dd className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{value}</dd>
		</div>
	);
}

function SectionHeading({
	icon,
	title,
	description,
}: {
	icon: ReactNode;
	title: string;
	description: string;
}) {
	return (
		<header className="flex items-start gap-3">
			<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
				{icon}
			</div>
			<div>
				<h3 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
				<p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{description}</p>
			</div>
		</header>
	);
}
