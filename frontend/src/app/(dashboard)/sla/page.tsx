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
				<Loader2 className="size-8 animate-spin text-zinc-400" aria-hidden="true" />
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
					<div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
						<Gauge className="size-5" aria-hidden="true" />
					</div>
					<div>
						<h1 id="sla-title" className="text-xl font-semibold text-zinc-900 dark:text-white">
							SLA — Niveles de Servicio
						</h1>
						<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
							Monitoreo de cumplimiento de acuerdos de nivel de servicio
						</p>
					</div>
				</div>
			</header>

			{/* KPI cards */}
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
				<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
					<div className="flex items-center gap-2 text-zinc-500">
						<TrendingUp className="size-4" />
						<span className="text-xs font-medium uppercase tracking-wide">Cumplimiento</span>
					</div>
					<p className="mt-2 text-2xl font-bold text-[#2154A6]">{summary.complianceRate}%</p>
				</div>
				<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
					<div className="flex items-center gap-2 text-zinc-500">
						<CheckCircle2 className="size-4 text-green-500" />
						<span className="text-xs font-medium uppercase tracking-wide">Resueltos</span>
					</div>
					<p className="mt-2 text-2xl font-bold text-green-600">{summary.resolved}</p>
				</div>
				<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
					<div className="flex items-center gap-2 text-zinc-500">
						<Clock className="size-4 text-[var(--color-brand)]" />
						<span className="text-xs font-medium uppercase tracking-wide">Activos</span>
					</div>
					<p className="mt-2 text-2xl font-bold text-[var(--color-brand-blue-light)]">
						{summary.active}
					</p>
				</div>
				<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
					<div className="flex items-center gap-2 text-amber-600">
						<AlertTriangle className="size-4" />
						<span className="text-xs font-medium uppercase tracking-wide">En Riesgo</span>
					</div>
					<p className="mt-2 text-2xl font-bold text-amber-600">{summary.atRisk}</p>
				</div>
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
					<div className="flex items-center gap-2 text-red-500">
						<AlertTriangle className="size-4" />
						<span className="text-xs font-medium uppercase tracking-wide">Incumplidos</span>
					</div>
					<p className="mt-2 text-2xl font-bold text-red-600">{summary.breached}</p>
				</div>
				<div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-900/10">
					<div className="flex items-center gap-2 text-violet-600">
						<ShieldAlert className="size-4" />
						<span className="text-xs font-medium uppercase tracking-wide">Escalados</span>
					</div>
					<p className="mt-2 text-2xl font-bold text-violet-600">{summary.escalated}</p>
				</div>
			</div>

			{/* Breached items */}
			<section aria-labelledby="breaches-title">
				<h2
					id="breaches-title"
					className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white"
				>
					Incumplimientos Recientes
				</h2>
				{breaching.length === 0 ? (
					<p className="py-8 text-center text-sm text-zinc-400">
						No hay incumplimientos de SLA registrados.
					</p>
				) : (
					<div className="space-y-2">
						{breaching.map((item) => (
							<div
								key={item._id}
								className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 dark:border-red-900/20 dark:bg-red-900/5"
							>
								<div className="min-w-0 flex-1">
									{typeof item.serviceCaseId === "string" ? (
										<span className="text-sm font-medium text-zinc-900 dark:text-white">
											Caso no disponible
										</span>
									) : (
										<Link
											href={buildServiceCaseRoute(item.serviceCaseId._id)}
											className="text-sm font-medium text-zinc-900 hover:text-[#2154A6] dark:text-white"
										>
											{item.serviceCaseId.code}
										</Link>
									)}
									<p className="text-xs text-zinc-500 dark:text-zinc-400">
										{item.serviceType} · {item.priority} · Paso: {item.currentStep}
									</p>
									{item.breachReason && (
										<p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
											{item.breachReason}
										</p>
									)}
								</div>
								<span className="shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
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
