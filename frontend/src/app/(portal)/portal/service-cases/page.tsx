"use client";

import { Loader2 } from "lucide-react";
import { usePortalServiceCases } from "@/modules/portal/hooks/usePortalServiceCases";
import { PortalServiceCaseList } from "@/modules/portal/ui/PortalServiceCaseList";

export default function PortalServiceCaseListPage() {
	const { data: orders, isLoading, isError, refetch } = usePortalServiceCases();

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

			{isLoading ? (
				<output className="flex items-center justify-center py-16" aria-live="polite">
					<Loader2
						className="size-8 animate-spin text-[var(--color-brand-blue)]"
						aria-hidden="true"
					/>
					<span className="sr-only">Cargando órdenes</span>
				</output>
			) : isError ? (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 text-center">
					<p className="text-sm text-[var(--color-danger)]">
						No se pudieron cargar tus órdenes de servicio.
					</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
					>
						Reintentar
					</button>
				</div>
			) : !orders || orders.length === 0 ? (
				<p className="py-8 text-center text-sm text-[var(--text-secondary)]">
					No tienes órdenes de servicio activas
				</p>
			) : (
				<PortalServiceCaseList
					orders={orders.map((order) => ({
						id: order._id,
						code: order.code,
						status: order.status,
						date: order.createdAt,
					}))}
				/>
			)}
		</div>
	);
}
