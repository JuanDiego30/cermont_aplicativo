"use client";

import { ChevronsRight } from "lucide-react";
import Image from "next/image";
import { use } from "react";
import { useCockpit } from "@/modules/cockpit/hooks/useCockpit";
import { useCockpitMutations } from "@/modules/cockpit/hooks/useCockpitMutations";
import { BlockersPanelCollapsible } from "@/modules/cockpit/ui/BlockersPanelCollapsible";
import { CockpitHeaderCard } from "@/modules/cockpit/ui/CockpitHeaderCard";
import { CockpitTabs } from "@/modules/cockpit/ui/CockpitTabs";
import { DocumentRequirementsTable } from "@/modules/cockpit/ui/DocumentRequirementsTable";
import { FourteenStepProgressBar } from "@/modules/cockpit/ui/FourteenStepProgressBar";
import { NextActionCard } from "@/modules/cockpit/ui/NextActionCard";

interface Props {
	params: Promise<{ id: string }>;
}

function formatCurrency(value: number): string {
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		maximumFractionDigits: 0,
	}).format(value);
}

export default function CockpitPage({ params }: Props) {
	const { id } = use(params);
	const { data, isLoading, isError, error } = useCockpit(id);
	const { advanceMutation } = useCockpitMutations(id);

	if (isLoading) {
		return (
			<div className="space-y-6 p-6">
				<div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-secondary)]" />
				<div className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-secondary)]" />
				<div className="h-16 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-secondary)]" />
				<div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-secondary)]" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center p-6">
				<div className="max-w-md text-center">
					<p className="text-lg font-semibold text-[var(--text-primary)]">
						Error al cargar el cockpit
					</p>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">
						{error instanceof Error ? error.message : "Error desconocido"}
					</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="mt-4 rounded-full bg-[var(--color-brand-blue)] px-6 py-2.5 text-sm font-semibold text-white"
					>
						Reintentar
					</button>
				</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center p-6">
				<p className="text-sm text-[var(--text-secondary)]">No se encontró la orden de servicio</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-4 md:p-6">
			<CockpitHeaderCard cockpit={data} />

			<section aria-label="Barra de progreso">
				<FourteenStepProgressBar steps={data.steps} currentStep={data.currentStep} />
			</section>

			{data.nextAction && (
				<section aria-label="Próxima acción" className="space-y-3">
					<NextActionCard action={data.nextAction} />
					{data.blockers.every((blocker) => blocker.severity !== "error") && (
						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={() => advanceMutation.mutate("advance_step")}
								disabled={advanceMutation.isPending}
								className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
							>
								<ChevronsRight className="size-4" aria-hidden="true" />
								{advanceMutation.isPending ? "Avanzando…" : "Avanzar paso"}
							</button>
							{advanceMutation.isError ? (
								<p role="alert" className="text-xs text-[var(--color-danger)]">
									{advanceMutation.error instanceof Error
										? advanceMutation.error.message
										: "No se pudo avanzar el paso"}
								</p>
							) : null}
						</div>
					)}
				</section>
			)}

			<section aria-label="Bloqueos">
				<BlockersPanelCollapsible blockers={data.blockers} />
			</section>

			<section aria-label="Secciones del cockpit">
				<CockpitTabs
					tabs={[
						{
							id: "documents",
							label: `Documentos${data.documents.length > 0 ? ` (${data.documents.length})` : ""}`,
							content:
								data.documents.length > 0 ? (
									<DocumentRequirementsTable
										documents={data.documents.map((d) => ({
											name: d.name,
											step: d.step,
											status: d.status,
											fileUrl: d.fileUrl,
										}))}
									/>
								) : (
									<div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] p-5 text-center text-sm text-[var(--text-secondary)]">
										Sin documentos registrados para este caso.
									</div>
								),
						},
						{
							id: "evidence",
							label: `Evidencias${data.evidences.length > 0 ? ` (${data.evidences.length})` : ""}`,
							content:
								data.evidences.length > 0 ? (
									<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
										{data.evidences.map((ev) => (
											<div
												key={ev.id}
												className="group relative aspect-video overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]"
											>
												{ev.url ? (
													<Image
														src={ev.url}
														alt={ev.caption ?? "Evidencia"}
														fill
														className="object-cover transition group-hover:scale-105"
													/>
												) : (
													<div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">
														{ev.caption ?? "Sin vista previa"}
													</div>
												)}
												<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
													<p className="text-[10px] font-medium text-white">{ev.caption}</p>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] p-5 text-center text-sm text-[var(--text-secondary)]">
										No hay evidencias registradas para este caso.
									</div>
								),
						},
						{
							id: "costs",
							label: "Costos",
							content: data.costSummary ? (
								<div className="space-y-4">
									<div className="grid gap-4 sm:grid-cols-3">
										<CostCard
											label="Estimado"
											value={formatCurrency(data.costSummary.estimatedTotal)}
											color="text-[var(--color-brand)]"
										/>
										<CostCard
											label="Real"
											value={formatCurrency(data.costSummary.actualTotal)}
											color="text-[var(--text-primary)]"
										/>
										<CostCard
											label="Variación"
											value={`${data.costSummary.variance > 0 ? "+" : ""}${formatCurrency(data.costSummary.variance)}`}
											color={
												data.costSummary.riskLevel === "high"
													? "text-[var(--color-danger)]"
													: data.costSummary.riskLevel === "medium"
														? "text-[var(--color-warning)]"
														: "text-[var(--color-success)]"
											}
										/>
									</div>
									<div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
										<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
											Margen
										</p>
										<p
											className={`mt-1 text-lg font-bold ${
												data.costSummary.marginPercent >= 0
													? "text-[var(--color-success)]"
													: "text-[var(--color-danger)]"
											}`}
										>
											{data.costSummary.marginPercent >= 0 ? "+" : ""}
											{data.costSummary.marginPercent.toFixed(1)}%
										</p>
									</div>
								</div>
							) : (
								<div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] p-5 text-center text-sm text-[var(--text-secondary)]">
									Sin datos de costos registrados para este caso.
								</div>
							),
						},
						{
							id: "timeline",
							label: `Timeline (${data.steps.filter((s) => s.status === "completed").length}/14)`,
							content: (
								<div className="space-y-3">
									{data.steps
										.filter((s) => s.status !== "pending")
										.reverse()
										.map((s) => (
											<div
												key={s.step}
												className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3"
											>
												<div
													className={`size-2 shrink-0 rounded-full ${
														s.status === "completed"
															? "bg-[var(--color-success)]"
															: s.status === "blocked"
																? "bg-[var(--color-danger)]"
																: "bg-[var(--color-warning)]"
													}`}
												/>
												<div>
													<p className="text-xs font-semibold text-[var(--text-primary)]">
														Paso {s.step}: {s.label}
													</p>
													<p className="text-[10px] text-[var(--text-muted)]">{s.status}</p>
												</div>
											</div>
										))}
								</div>
							),
						},
						{
							id: "admin",
							label: "Admin",
							content: data.closureStatus ? (
								<div className="space-y-3">
									<StatusRow label="SES / Ariba" status={data.closureStatus.sesStatus} />
									<StatusRow label="Factura" status={data.closureStatus.invoiceStatus} />
									<StatusRow label="Pago" status={data.closureStatus.paymentStatus} />
								</div>
							) : (
								<div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] p-5 text-center text-sm text-[var(--text-secondary)]">
									Sin información de cierre administrativo.
								</div>
							),
						},
					]}
				/>
			</section>
		</div>
	);
}

function CostCard({ label, value, color }: { label: string; value: string; color: string }) {
	return (
		<div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
			<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
				{label}
			</p>
			<p className={`mt-2 text-sm font-bold ${color}`}>{value}</p>
		</div>
	);
}

function StatusRow({ label, status }: { label: string; status: string }) {
	const colorMap: Record<string, string> = {
		pending: "text-[var(--color-warning)]",
		approved: "text-[var(--color-success)]",
		rejected: "text-[var(--color-danger)]",
		issued: "text-[var(--color-brand)]",
		paid: "text-[var(--color-success)]",
		registered: "text-[var(--color-brand)]",
		confirmed: "text-[var(--color-success)]",
	};
	return (
		<div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
			<p className="text-xs font-semibold text-[var(--text-primary)]">{label}</p>
			<span
				className={`rounded-full border border-current px-2 py-0.5 text-[9px] font-bold uppercase ${colorMap[status] ?? "text-[var(--text-muted)]"}`}
			>
				{status}
			</span>
		</div>
	);
}
