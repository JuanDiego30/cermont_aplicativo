"use client";

import type { SiteVisitRecord } from "@cermont/shared-types";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  useCancelSiteVisit,
  useCompleteSiteVisit,
  useSiteVisit,
  useStartSiteVisit,
} from "@/modules/site-visits/queries";

const DATE_FMT = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
const fmtDate = (v?: string) => (v ? DATE_FMT.format(new Date(v)) : "Sin fecha");

export default function SiteVisitDetailPage() {
	return (
		<Suspense fallback={<DetailSkeleton />}>
			<SiteVisitDetailInner />
		</Suspense>
	);
}

function DetailSkeleton() {
	return (
		<section className="space-y-6" aria-label="Cargando visita">
			<div className="h-8 w-48 animate-pulse rounded-[var(--radius-md)] bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-zinc-100" />
		</section>
	);
}

function SiteVisitDetailInner() {
	const params = useParams();
	const id = (params.id as string) ?? "";
	const { data: envelope, isLoading, isError, refetch } = useSiteVisit(id);
	const visit = envelope?.data;

	return (
		<section className="space-y-6" aria-labelledby="sv-detail-title">
			<Link
				href="/site-visits"
				className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Volver a Visitas técnicas
			</Link>

			{isLoading && <DetailSkeleton />}

			{isError && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">
						No se pudo cargar la visita
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

			{!isLoading && !isError && !visit && (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] p-6">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">
						Visita no encontrada
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						El identificador no corresponde a ninguna visita registrada.
					</p>
				</div>
			)}

			{visit && <VisitContent visit={visit} />}
		</section>
	);
}

function VisitContent({ visit }: { visit: SiteVisitRecord }) {
	const [showComplete, setShowComplete] = useState(false);

	const startMutation = useStartSiteVisit(visit._id);
	const completeMutation = useCompleteSiteVisit(visit._id);
	const cancelMutation = useCancelSiteVisit(visit._id);

	const canStart = visit.status === "scheduled";
	const canComplete = visit.status === "in_progress";
	const canCancel = visit.status === "scheduled" || visit.status === "in_progress";

	const handleStart = async () => {
		try {
			await startMutation.mutateAsync();
			toast.success("Visita iniciada correctamente");
		} catch {
			toast.error("Error al iniciar la visita");
		}
	};

	const handleComplete = async (data: Record<string, unknown>) => {
		try {
			await completeMutation.mutateAsync(data);
			toast.success("Visita completada correctamente");
			setShowComplete(false);
		} catch {
			toast.error("Error al completar la visita");
		}
	};

	const handleCancel = async () => {
		try {
			await cancelMutation.mutateAsync({
				reason: "Cancelado por usuario",
				clientMutationId: uuidv4(),
			} as { reason: string });
			toast.success("Visita cancelada");
		} catch {
			toast.error("Error al cancelar la visita");
		}
	};

	return (
		<>
			<VisitInfo visit={visit} />

			<div className="flex flex-wrap gap-3">
				{canStart && (
					<button
						type="button"
						onClick={handleStart}
						disabled={startMutation.isPending}
						className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
					>
						<CheckCircle2 className="size-4" />
						Iniciar visita
					</button>
				)}
				{canComplete && !showComplete && (
					<button
						type="button"
						onClick={() => setShowComplete(true)}
						className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white"
					>
						<CheckCircle2 className="size-4" />
						Completar visita
					</button>
				)}
				{canCancel && (
					<button
						type="button"
						onClick={handleCancel}
						disabled={cancelMutation.isPending}
						className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-bg)] px-4 py-2 text-sm font-medium text-[var(--color-danger)] disabled:opacity-50"
					>
						<XCircle className="size-4" />
						Cancelar
					</button>
				)}
			</div>

			{showComplete && (
				<CompleteForm onSubmit={handleComplete} pending={completeMutation.isPending} />
			)}
		</>
	);
}

function VisitInfo({ visit }: { visit: SiteVisitRecord }) {
  const statusTone =
		visit.status === "completed"
			? "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success)]"
			: visit.status === "cancelled"
				? "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
				: visit.status === "in_progress"
					? "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
					: "border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]";

	return (
		<div className="space-y-4">
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-card">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 id="sv-detail-title" className="text-xl font-semibold text-[var(--text-primary)]">
							{visit.code}
						</h2>
						<p className="text-sm text-[var(--text-secondary)]">
							{visit.clientName} &middot; Solicitud {visit.workRequestId}
						</p>
					</div>
					<span
						className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}
					>
						{visit.status}
					</span>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<FieldCard title="Ubicación" value={visit.location} />
				<FieldCard title="Fecha de visita" value={fmtDate(visit.visitDate)} />
				<FieldCard title="Responsable" value={visit.responsibleName} />
				<FieldCard title="Inicio" value={fmtDate(visit.startedAt)} />
				<FieldCard title="Finalización" value={fmtDate(visit.completedAt)} />
			</div>

			{visit.requirements && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">Requerimientos</h3>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">{visit.requirements}</p>
				</div>
			)}

			{visit.recommendations && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">Recomendaciones</h3>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">{visit.recommendations}</p>
				</div>
			)}

			{visit.observations && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">Observaciones</h3>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">{visit.observations}</p>
				</div>
			)}

			{visit.measurements && visit.measurements.length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">Mediciones</h3>
					<table className="mt-3 w-full text-sm">
						<thead>
							<tr className="border-b border-[var(--border-subtle)]">
								<th className="py-2 text-left text-xs font-medium text-[var(--text-muted)]">
									Etiqueta
								</th>
								<th className="py-2 text-right text-xs font-medium text-[var(--text-muted)]">
									Valor
								</th>
							</tr>
						</thead>
						<tbody>
							{visit.measurements.map((m) => (
								<tr key={m.label} className="border-b border-[var(--border-subtle)]">
									<td className="py-2">{m.label}</td>
									<td className="py-2 text-right">
										{m.value} {m.unit ?? ""}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{visit.findings && visit.findings.length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">Hallazgos</h3>
					<div className="mt-3 space-y-2">
						{visit.findings.map((f) => (
							<div
								key={f.description}
								className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3"
							>
								<p className="text-sm text-[var(--text-primary)]">{f.description}</p>
								<div className="mt-1 flex gap-2">
									<span className="rounded-full border border-[var(--border-default)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
										{f.severity}
									</span>
									<span className="rounded-full border border-[var(--border-default)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
										{f.category}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
				<span>Creado: {fmtDate(visit.createdAt)}</span>
				<span>Actualizado: {fmtDate(visit.updatedAt)}</span>
			</div>
		</div>
	);
}

function FieldCard({ title, value }: { title: string; value: string }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
			<p className="text-xs font-medium uppercase text-[var(--text-muted)]">{title}</p>
			<p className="mt-1 text-sm text-[var(--text-primary)]">{value}</p>
		</div>
	);
}

function CompleteForm({
	onSubmit,
	pending,
}: {
	onSubmit: (data: Record<string, unknown>) => void;
	pending: boolean;
}) {
	const [observations, setObservations] = useState("");
	const [recommendations, setRecommendations] = useState("");

	const handleSubmit = async () => {
		await onSubmit({
			observations: observations.trim() || undefined,
			recommendations: recommendations.trim() || undefined,
			measurements: [],
			findings: [],
			photos: [],
		});
	};

	return (
		<form
			className="space-y-3 rounded-lg border border-(--color-success-border) bg-(--color-success-bg) p-4"
			action={handleSubmit}
		>
			<h3 className="text-sm font-semibold text-(--color-success)">Completar visita</h3>

			<label className="block text-sm">
				<span className="text-(--text-secondary)">Observaciones</span>
				<textarea
					value={observations}
					onChange={(e) => setObservations(e.target.value)}
					rows={3}
					className="mt-1 w-full rounded-md border border-(--border-default) bg-surface-secondary px-3 py-2 text-sm"
				/>
			</label>

			<label className="block text-sm">
				<span className="text-(--text-secondary)">Recomendaciones para propuesta</span>
				<textarea
					value={recommendations}
					onChange={(e) => setRecommendations(e.target.value)}
					rows={3}
					className="mt-1 w-full rounded-md border border-(--border-default) bg-surface-secondary px-3 py-2 text-sm"
				/>
			</label>

			<button
				type="submit"
				disabled={pending}
				className="rounded-md bg-(--color-success) px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
			>
				{pending ? "Completando..." : "Confirmar finalización"}
			</button>
		</form>
	);
}
