"use client";

import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { useWorkRequests } from "@/modules/work-requests/queries";

function WorkRequestList() {
	const { data, isLoading, error, isPaused } = useWorkRequests();

	if (isPaused) {
		return (
			<EmptyState
				icon="documents"
				title="Sin conexión"
				description="No se pueden cargar las solicitudes. Verifica tu conexión a internet."
			/>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24" role="status">
				<Loader2
					className="size-8 animate-spin text-[var(--color-brand-blue)]"
					aria-hidden="true"
				/>
				<span className="sr-only">Cargando solicitudes…</span>
			</div>
		);
	}

	if (error || !data) {
		return (
			<EmptyState
				icon="documents"
				title="Error al cargar solicitudes"
				description="No se pudieron cargar las solicitudes de trabajo. Intenta de nuevo más tarde."
			/>
		);
	}

	if (data.length === 0) {
		return (
			<EmptyState
				icon="documents"
				title="No hay solicitudes"
				description="Aún no se han registrado solicitudes de trabajo."
			/>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{data.map((item) => (
				<Link
					key={item._id}
					href={`/work-requests/${item._id}`}
					className="group rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-2)]"
				>
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-blue)]">
							{item.code}
						</span>
						<span className="rounded-full bg-[var(--color-brand-blue-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-blue)]">
							{item.status}
						</span>
					</div>
					<p className="mt-3 text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-brand-blue)]">
						{item.shortDescription}
					</p>
					<p className="mt-1 text-xs text-[var(--text-tertiary)]">{item.clientName}</p>
				</Link>
			))}
		</div>
	);
}

export default function WorkRequestsPage() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-[var(--text-primary)]">
						Solicitudes de Trabajo
					</h1>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Gestiona las solicitudes de servicio de tus clientes.
					</p>
				</div>
				<Button asChild>
					<Link href="/work-requests/new">
						<Plus className="size-4" aria-hidden="true" />
						Nueva solicitud
					</Link>
				</Button>
			</div>
			<WorkRequestList />
		</div>
	);
}
