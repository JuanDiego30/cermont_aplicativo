"use client";

import type { DomainBlocker } from "@cermont/shared-types";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { ApiError } from "@/lib/http/api-client";
import { ServiceCaseWorkflowCockpit } from "@/modules/service-cases/components/ServiceCaseWorkflowCockpit";
import { useAdvanceServiceCaseStep, useServiceCase } from "@/modules/service-cases/queries";

export default function ServiceCaseDetailPage() {
	return (
		<Suspense fallback={<DetailSkeleton />}>
			<ServiceCaseDetailInner />
		</Suspense>
	);
}

function DetailSkeleton() {
	return (
		<section className="space-y-6" aria-label="Cargando caso">
			<div className="h-8 w-48 animate-pulse rounded-[var(--radius-md)] bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-zinc-100" />
		</section>
	);
}

function ServiceCaseDetailInner() {
	const params = useParams();
	const id = (params.id as string) ?? "";
	const { data: envelope, isLoading, isError, refetch } = useServiceCase(id);
	const sc = envelope?.data;
	const advance = useAdvanceServiceCaseStep(id);

	const apiError = advance.error instanceof ApiError ? advance.error : false;
	const isBlockedTransition = apiError !== false && apiError.code === "STEP_TRANSITION_BLOCKED";

	return (
		<section className="space-y-6" aria-labelledby="sc-detail-title">
			<Link
				href="/dashboard"
				className="inline-flex items-center gap-2 text-sm font-medium text-brand"
			>
				<ArrowLeft className="size-4" aria-hidden="true" /> Volver al Dashboard
			</Link>
			{isLoading && (
				<output className="flex items-center justify-center py-16" aria-live="polite">
					<Loader2 className="size-7 animate-spin text-brand" aria-hidden="true" />
					<span className="sr-only">Cargando caso</span>
				</output>
			)}
			{isError && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">
						No se pudo cargar el caso
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Ocurrió un error al obtener los datos.
					</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
					>
						Reintentar
					</button>
				</div>
			)}
			{!isLoading && !isError && !sc && (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] p-6">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">Caso no encontrado</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						El identificador no corresponde a ningún caso registrado.
					</p>
				</div>
			)}

			{/* Transition Error Alert */}
			{advance.isError && apiError && (
				<div
					className="relative rounded-[var(--radius-lg)] border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/40 dark:bg-rose-900/10"
					role="alert"
				>
					<button
						type="button"
						onClick={() => advance.reset()}
						className="absolute top-4 right-4 text-xs font-semibold text-rose-700 hover:text-rose-900 dark:text-rose-300 dark:hover:text-rose-100 hover:underline"
					>
						Cerrar aviso
					</button>
					<div className="flex items-start gap-3">
						<AlertCircle
							className="size-5 shrink-0 mt-0.5 text-rose-700 dark:text-rose-300"
							aria-hidden="true"
						/>
						<div className="space-y-1">
							<h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
								{isBlockedTransition ? "Avance de paso bloqueado" : "Error al avanzar paso"}
							</h3>
							<p className="text-xs text-rose-800 dark:text-rose-300 opacity-90">
								{isBlockedTransition
									? "El sistema no permite realizar esta transición porque existen bloqueadores críticos en el paso actual:"
									: apiError.message || "Ocurrió un error inesperado al intentar avanzar."}
							</p>

							{isBlockedTransition &&
								Array.isArray(apiError.details) &&
								apiError.details.length > 0 && (
									<ul className="mt-3.5 space-y-2">
										{(apiError.details as unknown as DomainBlocker[]).map((blocker, idx) => (
											<li
												key={`${blocker.code}-${blocker.field || blocker.artifactType || idx}`}
												className="rounded-[var(--radius-md)] border border-rose-200 bg-white/90 p-3 shadow-sm text-xs dark:border-rose-900/40 dark:bg-zinc-950/80"
											>
												<div className="flex items-start gap-2">
													<span className="shrink-0 rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[9px] font-bold uppercase dark:bg-rose-900/40 dark:text-rose-200">
														{blocker.code || "B-XXX"}
													</span>
													<div className="space-y-1">
														<p className="font-semibold text-rose-950 dark:text-rose-100">
															{blocker.message}
														</p>
														<p className="text-[10px] text-zinc-500 dark:text-zinc-400">
															Responsable:{" "}
															<span className="font-semibold">{blocker.ownerRole || "N/A"}</span>
														</p>
														{blocker.recommendedAction && (
															<p className="mt-0.5 text-[10px] font-bold text-[var(--color-brand)] dark:text-blue-400">
																Acción sugerida: {blocker.recommendedAction}
															</p>
														)}
													</div>
												</div>
											</li>
										))}
									</ul>
								)}
						</div>
					</div>
				</div>
			)}

			{sc ? (
				<ServiceCaseWorkflowCockpit
					serviceCase={sc}
					onAdvance={() => advance.mutate()}
					isAdvancing={advance.isPending}
				/>
			) : null}
		</section>
	);
}
