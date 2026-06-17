"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	Gauge,
	Loader2,
	ShieldAlert,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { ErrorFallback } from "@/components/common/ErrorFallback";
import { EmptyState } from "@/core/ui/EmptyState";
import { buildServiceCaseRoute } from "@/lib/routes";
import { getSlaDashboard } from "@/modules/sla/api";

export default function SLAPage() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["sla-dashboard"],
		queryFn: getSlaDashboard,
		refetchInterval: 60_000,
	});

	if (isLoading) {
		return (
			<div className="flex justify-center py-24" aria-live="polite">
				<Loader2 className="size-8 animate-spin text-steel" aria-hidden="true" />
				<span className="sr-only">Cargando dashboard SLA...</span>
			</div>
		);
	}

	if (error) {
		return (
			<ErrorFallback
				title="Error al cargar SLA"
				description="No se pudo cargar el dashboard de SLA."
			/>
		);
	}

	if (!data) {
		return (
			<EmptyState
				icon="search"
				title="Sin datos SLA"
				description="No hay información de SLA disponible."
			/>
		);
	}

	const { summary, breaching } = data;

	return (
		<section className="mx-auto max-w-6xl space-y-6 px-4 py-8" aria-labelledby="sla-title">
			<header>
				<div className="flex items-center gap-3">
					<div className="flex size-11 items-center justify-center rounded-xl bg-success-bg text-brand-annotate">
						<Gauge className="size-5" aria-hidden="true" />
					</div>
					<div>
						<h1 id="sla-title" className="text-xl font-semibold text-ink">
							SLA — Niveles de Servicio
						</h1>
						<p className="mt-0.5 text-sm text-steel">
							Monitoreo de cumplimiento de acuerdos de nivel de servicio
						</p>
					</div>
				</div>
			</header>

			{/* KPI cards — using card-sla patterns (2px green border, neutral bg) per DESIGN.md */}
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
				<div className="card-sla">
					<div className="flex items-center gap-2 text-steel">
						<TrendingUp className="size-4" />
						<span className="text-xs font-medium uppercase tracking-wide">Cumplimiento</span>
					</div>
					<p className="mt-2 card-sla-value">{summary.complianceRate}%</p>
				</div>
				<div className="card-sla">
					<div className="flex items-center gap-2 text-steel">
						<CheckCircle2 className="size-4 text-brand-annotate" />
						<span className="text-xs font-medium uppercase tracking-wide">Resueltos</span>
					</div>
					<p className="mt-2 card-sla-value">{summary.resolved}</p>
				</div>
				<div className="card-sla">
					<div className="flex items-center gap-2 text-steel">
						<Clock className="size-4 text-brand-annotate" />
						<span className="text-xs font-medium uppercase tracking-wide">Activos</span>
					</div>
					<p className="mt-2 card-sla-value">{summary.active}</p>
				</div>
				<div className="card-sla-warning">
					<div className="flex items-center gap-2 text-brand-warn">
						<AlertTriangle className="size-4" />
						<span className="text-xs font-medium uppercase tracking-wide">En Riesgo</span>
					</div>
					<p className="mt-2 text-2xl font-bold text-brand-warn">{summary.atRisk}</p>
				</div>
				<div className="card-sla-critical">
					<div className="flex items-center gap-2 text-brand-error">
						<AlertTriangle className="size-4" />
						<span className="text-xs font-medium uppercase tracking-wide">Incumplidos</span>
					</div>
					<p className="mt-2 text-2xl font-bold text-brand-error">{summary.breached}</p>
				</div>
				<div className="card-dashboard">
					<div className="flex items-center gap-2 text-steel">
						<ShieldAlert className="size-4" />
						<span className="text-xs font-medium uppercase tracking-wide">Escalados</span>
					</div>
					<p className="mt-2 card-dashboard-value">{summary.escalated}</p>
				</div>
			</div>

			{/* Breached items */}
			<section aria-labelledby="breaches-title">
				<h2 id="breaches-title" className="mb-3 text-sm font-semibold text-ink">
					Incumplimientos Recientes
				</h2>
				{breaching.length === 0 ? (
					<p className="py-8 text-center text-sm text-stone">
						No hay incumplimientos de SLA registrados.
					</p>
				) : (
					<div className="space-y-2">
						{breaching.map((item) => (
							<div
								key={item._id}
								className="flex items-center justify-between rounded-xl border border-hairline bg-canvas px-4 py-3"
							>
								<div className="min-w-0 flex-1">
									{typeof item.serviceCaseId === "string" ? (
										<span className="text-sm font-medium text-ink">Caso no disponible</span>
									) : (
										<Link
											href={buildServiceCaseRoute(item.serviceCaseId._id)}
											className="text-sm font-medium text-ink hover:text-brand-green"
										>
											{item.serviceCaseId.code}
										</Link>
									)}
									<p className="text-xs text-steel">
										{item.serviceType} · {item.priority} · Paso: {item.currentStep}
									</p>
									{item.breachReason && (
										<p className="mt-0.5 text-xs text-brand-error">{item.breachReason}</p>
									)}
								</div>
								<span className="shrink-0 rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-medium text-brand-error">
									SLA incumplido
								</span>
							</div>
						))}
					</div>
				)}
			</section>
		</section>
	);
}
