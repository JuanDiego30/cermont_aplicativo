"use client";

import type { PlanningPacket } from "@cermont/shared-types";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { useApprovePlanning, usePlanningDetail } from "@/modules/planning/queries";

const DATE_FMT = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });
const fmtDate = (v?: string) => (v ? DATE_FMT.format(new Date(v)) : "Sin fecha");

export default function PlanningDetailPage() {
	return (
		<Suspense fallback={<DetailSkeleton />}>
			<PlanningDetailInner />
		</Suspense>
	);
}

function DetailSkeleton() {
	return (
		<section className="space-y-6" aria-label="Cargando planeación">
			<div className="h-8 w-48 animate-pulse rounded-[var(--radius-md)] bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-zinc-100" />
		</section>
	);
}

function PlanningDetailInner() {
	const params = useParams();
	const id = (params.id as string) ?? "";
	const { data: envelope, isLoading, isError, refetch } = usePlanningDetail(id);
	const packet = envelope?.data;

	return (
		<section className="space-y-6" aria-labelledby="planning-detail-title">
			<Link
				href="/planning"
				className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Volver a Planeación
			</Link>

			{isLoading && <DetailSkeleton />}

			{isError && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">
						No se pudo cargar la planeación
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

			{!isLoading && !isError && !packet && (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] p-6">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">
						Planeación no encontrada
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						El identificador no corresponde a ningún paquete de planeación.
					</p>
				</div>
			)}

			{packet && <PacketContent packet={packet} />}
		</section>
	);
}

function PacketContent({ packet }: { packet: PlanningPacket }) {
	const approveMutation = useApprovePlanning(packet._id);

	const canApprove = packet.status === "ready";

	const handleApprove = async () => {
		try {
			await approveMutation.mutateAsync({});
			toast.success("Planeación aprobada correctamente");
		} catch {
			toast.error("Error al aprobar la planeación");
		}
	};

	const statusTone =
		packet.status === "approved"
			? "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success)]"
			: packet.status === "blocked"
				? "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
				: packet.status === "ready"
					? "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
					: "border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]";

	return (
		<div className="space-y-4">
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-card">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2
							id="planning-detail-title"
							className="text-xl font-semibold text-[var(--text-primary)]"
						>
							Planeación {packet._id}
						</h2>
						<p className="text-sm text-[var(--text-secondary)]">Orden {packet.workOrderId}</p>
					</div>
					<span
						className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}
					>
						{packet.status}
					</span>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<FieldCard title="Cuadrilla" value={String(packet.crew?.length ?? 0)} />
				<FieldCard title="Herramientas" value={String(packet.tools?.length ?? 0)} />
				<FieldCard title="Equipos" value={String(packet.equipment?.length ?? 0)} />
			</div>

			{canApprove && (
				<div className="flex flex-wrap gap-3">
					<button
						type="button"
						onClick={handleApprove}
						disabled={approveMutation.isPending}
						className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
					>
						<CheckCircle2 className="size-4" />
						Aprobar planeación
					</button>
				</div>
			)}

			<div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
				<span>Creado: {fmtDate(packet.createdAt)}</span>
				<span>Actualizado: {fmtDate(packet.updatedAt)}</span>
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
