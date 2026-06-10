"use client";

import { ArrowLeft, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/lib/routes";

interface ServiceCaseSummary {
	_id: string;
	clientName: string;
	code: string;
	currentStage: string;
}

interface SiteVisitCaseSelectorProps {
	cases: ServiceCaseSummary[] | undefined;
	isLoading: boolean;
	onSelect: (caseId: string) => void;
}

export function SiteVisitCaseSelector({ cases, isLoading, onSelect }: SiteVisitCaseSelectorProps) {
	return (
		<section className="space-y-6" aria-labelledby="site-visit-select-title">
			<header className="space-y-4">
				<Link
					href={APP_ROUTES.siteVisits}
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver a visitas
				</Link>
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 2 / Visita técnica</p>
					<h1
						id="site-visit-select-title"
						className="mt-2 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Seleccionar caso de servicio
					</h1>
					<p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
						Seleccione la solicitud o caso de servicio al que desea asociar la visita técnica. Los
						datos del cliente y ubicación se heredarán automáticamente.
					</p>
				</div>
			</header>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
				</div>
			) : (
				<div className="grid gap-3">
					{!cases || cases.length === 0 ? (
						<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-8 text-center">
							<Search className="mx-auto size-8 text-[var(--text-muted)]" />
							<p className="mt-3 text-sm text-[var(--text-secondary)]">
								No hay casos de servicio disponibles. Cree primero una solicitud.
							</p>
							<Link
								href={`${APP_ROUTES.workRequests}/new`}
								className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white"
							>
								Crear solicitud
								<ExternalLink className="size-4" />
							</Link>
						</div>
					) : (
						cases.slice(0, 20).map((caseItem) => (
							<button
								key={caseItem._id}
								type="button"
								onClick={() => onSelect(caseItem._id)}
								className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 text-left transition-all hover:border-[var(--color-brand)] hover:shadow-sm"
							>
								<div>
									<p className="font-semibold text-[var(--text-primary)]">{caseItem.clientName}</p>
									<p className="mt-1 text-sm text-[var(--text-muted)]">
										{caseItem.code} · {caseItem.currentStage}
									</p>
								</div>
								<span className="text-sm font-medium text-[var(--color-brand)]">Seleccionar →</span>
							</button>
						))
					)}
				</div>
			)}
		</section>
	);
}
