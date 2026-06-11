"use client";

import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePurchaseOrder } from "@/modules/purchase-orders/queries";

function statusBadge(status: string) {
	if (status === "approved") {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-success)]">
				<CheckCircle2 className="size-3.5" />
				Aprobada
			</span>
		);
	}
	if (status === "rejected") {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-danger)]">
				<XCircle className="size-3.5" />
				Rechazada
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
			<Clock className="size-3.5" />
			Pendiente
		</span>
	);
}

export default function PurchaseOrderDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { data, isLoading } = usePurchaseOrder(id);
	const po = data?.data;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="size-7 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
			</div>
		);
	}

	if (!po) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6">
				<h1 className="text-lg font-semibold text-[var(--text-primary)]">Orden no encontrada</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					La orden de compra no existe o fue eliminada.
				</p>
				<Link
					href="/purchase-orders"
					className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" />
					Volver a órdenes
				</Link>
			</div>
		);
	}

	return (
		<section className="space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-[var(--text-primary)]">PO {po.poNumber}</h1>
					<div className="mt-2">{statusBadge(po.status)}</div>
				</div>
				<Link
					href="/purchase-orders"
					className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
				>
					<ArrowLeft className="size-4" />
					Volver
				</Link>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
					<h2 className="text-sm font-semibold text-[var(--text-primary)]">Datos comerciales</h2>
					<dl className="mt-3 space-y-2 text-sm">
						<div className="flex justify-between">
							<dt className="text-[var(--text-muted)]">Cuenta servicio</dt>
							<dd className="font-medium text-[var(--text-primary)]">{po.serviceAccount}</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-[var(--text-muted)]">Cuenta facturación</dt>
							<dd className="font-medium text-[var(--text-primary)]">{po.billingAccount}</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-[var(--text-muted)]">Monto aprobado</dt>
							<dd className="font-medium text-[var(--text-primary)]">
								{typeof po.approvedAmount === "number"
									? po.approvedAmount.toLocaleString("es-CO")
									: "—"}{" "}
								{po.currency}
							</dd>
						</div>
						{po.contractReference ? (
							<div className="flex justify-between">
								<dt className="text-[var(--text-muted)]">Contrato</dt>
								<dd className="font-medium text-[var(--text-primary)]">{po.contractReference}</dd>
							</div>
						) : null}
					</dl>
				</div>
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
					<h2 className="text-sm font-semibold text-[var(--text-primary)]">Soportes</h2>
					{po.attachments.length === 0 ? (
						<p className="mt-3 text-sm text-[var(--text-secondary)]">Sin adjuntos</p>
					) : (
						<ul className="mt-3 space-y-2">
							{po.attachments.map((att) => (
								<li key={att.filename}>
									<a
										href={att.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-[var(--color-brand)] underline"
									>
										{att.filename}
									</a>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</section>
	);
}
