"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import { usePurchaseOrdersList } from "@/modules/purchase-orders/queries";

function statusTone(status: string): string {
	if (status === "approved") {
		return "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success)]";
	}
	if (status === "rejected") {
		return "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]";
	}
	return "border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]";
}

function statusIcon(status: string) {
	if (status === "approved") {
		return <CheckCircle2 className="size-4" />;
	}
	if (status === "rejected") {
		return <XCircle className="size-4" />;
	}
	return <Clock className="size-4" />;
}

export default function PurchaseOrdersPage() {
	const { data, isLoading, isError, refetch } = usePurchaseOrdersList();
	const items = data?.items ?? [];

	return (
		<section className="space-y-6" aria-labelledby="purchase-orders-title">
			<header className="space-y-4">
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 4 / Operación</p>
					<h1
						id="purchase-orders-title"
						className="mt-2 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Órdenes de compra
					</h1>
					<p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
						Gestión de POs recibidas del cliente, validación de montos, cuentas de servicio y
						facturación.
					</p>
				</div>
				<nav className="flex flex-wrap gap-2" aria-label="Acciones de PO">
					<Link
						href="/purchase-orders/new"
						className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] shadow-card transition-colors hover:bg-[var(--surface-secondary)]"
					>
						Nueva PO
						<ArrowRight className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
					</Link>
				</nav>
			</header>

			{isLoading ? (
				<output
					className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
					aria-live="polite"
				>
					<span className="sr-only">Cargando órdenes de compra</span>
					<Skeleton variant="table-row" rows={4} />
				</output>
			) : null}

			{isError ? (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
					<div className="flex items-start gap-3">
						<AlertTriangle
							className="mt-0.5 size-5 text-[var(--color-danger)]"
							aria-hidden="true"
						/>
						<div>
							<h2 className="text-base font-semibold text-[var(--text-primary)]">
								No se pudo cargar el módulo
							</h2>
							<p className="mt-1 text-sm text-[var(--text-secondary)]">
								El endpoint respondió con error o la sesión expiró.
							</p>
							<button
								type="button"
								onClick={() => refetch()}
								className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
							>
								<RefreshCw className="size-4" aria-hidden="true" />
								Reintentar
							</button>
						</div>
					</div>
				</div>
			) : null}

			{!isLoading && !isError && items.length === 0 ? (
				<EmptyState
					icon="purchase-orders"
					title="Sin órdenes de compra"
					description="Registra la PO aprobada por el cliente para habilitar planeación y ejecución."
					action={{ label: "Crear PO", href: "/purchase-orders/new" }}
				/>
			) : null}

			{items.length > 0 ? (
				<div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-card">
					<table className="min-w-full divide-y divide-[var(--border-subtle)] text-sm">
						<thead className="bg-[var(--surface-secondary)] text-left text-xs uppercase text-[var(--text-muted)]">
							<tr>
								<th className="px-4 py-3 font-semibold">Número PO</th>
								<th className="px-4 py-3 font-semibold">Cuenta servicio</th>
								<th className="px-4 py-3 font-semibold">Monto aprobado</th>
								<th className="px-4 py-3 font-semibold">Estado</th>
								<th className="px-4 py-3 font-semibold">Moneda</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--border-subtle)]">
							{items.map((po) => (
								<tr key={po._id}>
									<td className="px-4 py-3 font-medium text-[var(--text-primary)]">
										<Link href={`/purchase-orders/${po._id}`}>{po.poNumber}</Link>
									</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">{po.serviceAccount}</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">
										{typeof po.approvedAmount === "number"
											? po.approvedAmount.toLocaleString("es-CO")
											: "—"}
									</td>
									<td className="px-4 py-3">
										<span
											className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(po.status)}`}
										>
											{statusIcon(po.status)}
											{po.status}
										</span>
									</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">{po.currency}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : null}
		</section>
	);
}
