"use client";

import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/core/ui/EmptyState";
import { useServiceCaseList } from "@/modules/service-cases/queries";

function ServiceCasesList() {
	const { data, isLoading, error } = useServiceCaseList();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24" role="status">
				<Loader2
					className="size-8 animate-spin text-[var(--color-brand-blue)]"
					aria-hidden="true"
				/>
				<span className="sr-only">Cargando casos…</span>
			</div>
		);
	}

	if (error) {
		return (
			<EmptyState
				icon="documents"
				title="Error al cargar casos"
				description="No se pudo construir el cockpit de casos de servicio."
			/>
		);
	}

	if (!data || data.items.length === 0) {
		return (
			<EmptyState
				icon="documents"
				title="Sin casos de servicio"
				description="Aún no hay casos proyectados en el cockpit. Revise la conversión desde solicitudes, propuestas y órdenes."
			/>
		);
	}

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			{data.items.map((serviceCase) => (
				<Link
					key={serviceCase._id}
					href={`/service-cases/${serviceCase._id}`}
					className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--color-brand)] hover:shadow-[var(--shadow-2)]"
				>
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-blue)]">
								{serviceCase.code}
							</p>
							<h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
								{serviceCase.clientName}
							</h2>
							<p className="mt-1 text-sm text-[var(--text-secondary)]">
								Estado actual: {serviceCase.currentStage}
							</p>
						</div>
						<div className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
							{serviceCase.blockers.length > 0 ? (
								<>
									<AlertTriangle className="size-3.5 text-[var(--color-warning)]" />
									{serviceCase.blockers.length} bloqueadores
								</>
							) : (
								<>Sin bloqueadores</>
							)}
						</div>
					</div>

					<div className="mt-4 flex items-center justify-between text-sm">
						<span className="text-[var(--text-secondary)]">
							Paso actual: {serviceCase.currentStepCode ?? "pendiente de proyección"}
						</span>
						<span className="inline-flex items-center gap-1 font-medium text-[var(--color-brand)]">
							Abrir cockpit
							<ArrowRight className="size-4" />
						</span>
					</div>
				</Link>
			))}
		</div>
	);
}

export default function ServiceCasesPage() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Casos de Servicio</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Entrada principal al cockpit operacional de 14 pasos.
				</p>
			</div>
			<ServiceCasesList />
		</div>
	);
}
