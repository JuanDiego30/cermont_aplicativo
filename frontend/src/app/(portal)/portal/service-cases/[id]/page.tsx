"use client";

import { Loader2 } from "lucide-react";
import { use } from "react";
import { usePortalServiceCaseDetail } from "@/modules/portal/hooks/usePortalServiceCases";
import { PortalServiceCaseDetail } from "@/modules/portal/ui/PortalServiceCaseDetail";

interface Props {
	params: Promise<{ id: string }>;
}

export default function PortalServiceCaseDetailPage({ params }: Props) {
	const { id } = use(params);
	const { data: order, isLoading, isError, refetch } = usePortalServiceCaseDetail(id);

	return (
		<div className="p-4 md:p-6">
			<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Detalle de la orden</h1>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">
				Código: {order?.code ?? `SC-${id.slice(-8)}`}
			</p>

			<div className="mt-6">
				{isLoading ? (
					<output className="flex items-center justify-center py-16" aria-live="polite">
						<Loader2
							className="size-8 animate-spin text-[var(--color-brand-blue)]"
							aria-hidden="true"
						/>
						<span className="sr-only">Cargando orden</span>
					</output>
				) : isError || !order ? (
					<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 text-center">
						<p className="text-sm text-[var(--color-danger)]">
							No se pudo cargar el detalle de la orden.
						</p>
						<button
							type="button"
							onClick={() => refetch()}
							className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
						>
							Reintentar
						</button>
					</div>
				) : (
					<PortalServiceCaseDetail
						code={order.code}
						status={order.status}
						description={order.description}
						documents={order.technicalReports.map((report) => ({
							name: `Informe técnico ${report.code}`,
							url: `/portal/orders/${order._id}`,
						}))}
					/>
				)}
			</div>
		</div>
	);
}
