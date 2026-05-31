"use client";

import type {
	CermontOperationalStepCode,
	DocumentPurpose,
	PlanningPacket,
} from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import {
	CalendarClock,
	CheckCircle2,
	FileSpreadsheet,
	Loader2,
	PackageCheck,
	Upload,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { apiClient } from "@/lib/http/api-client";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";

type PlanningListResponse = {
	success: boolean;
	data: PlanningPacket[];
};

const STATUS_LABELS: Record<string, string> = {
	draft: "Borrador",
	incomplete: "Incompleta",
	ready: "Lista",
	blocked: "Bloqueada",
	approved: "Aprobada",
};

async function fetchPlanningPackets(): Promise<PlanningPacket[]> {
	const response = await apiClient.get<PlanningListResponse>("/planning-packets?limit=50");
	if (!response.success) {
		throw new Error("No se pudo cargar la planeacion");
	}
	return response.data;
}

export default function PlanningPage() {
	const { data, isLoading, isError, isPaused, refetch } = useQuery({
		queryKey: ["planning-packets", "list"],
		queryFn: fetchPlanningPackets,
	});
	const packets = data ?? [];
	const approved = packets.filter((packet) => packet.status === "approved").length;
	const ready = packets.filter((packet) => packet.status === "ready").length;
	const blocked = packets.filter((packet) => packet.status === "blocked").length;

	return (
		<section className="space-y-6" aria-labelledby="planning-title">
			<header className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)]">
				<p className="text-sm font-medium text-[var(--color-brand)]">Paso 5 / Planeacion</p>
				<h1 id="planning-title" className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
					Paquetes de planeacion
				</h1>
				<p className="mt-1 max-w-3xl text-sm text-[var(--text-secondary)]">
					Valida cuadrillas, recursos, documentos soporte, AST/PTW y readiness antes de iniciar
					ejecucion.
				</p>
			</header>

			<div className="grid gap-3 md:grid-cols-3">
				<Metric icon={CheckCircle2} label="Aprobadas" value={approved} />
				<Metric icon={PackageCheck} label="Listas" value={ready} />
				<Metric icon={CalendarClock} label="Bloqueadas" value={blocked} />
			</div>

			<div className="grid gap-3 lg:grid-cols-2">
				<DocumentLink
					icon={FileSpreadsheet}
					title="Subir Excel de recursos"
					description="Convierte listas de materiales, herramientas o certificaciones en datos revisables."
					defaultPurpose="template_source"
					defaultStepCode="step_05_planning"
				/>
				<DocumentLink
					icon={Upload}
					title="Adjuntar AST/PTW/soportes"
					description="Carga PDF, Word o fotos para completar requisitos de planeacion."
					defaultPurpose="support_document"
					defaultStepCode="step_05_planning"
				/>
			</div>

			<div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
				<div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">Planeacion activa</h2>
					<Button type="button" variant="ghost" size="sm" onClick={() => refetch()}>
						Actualizar
					</Button>
				</div>
				{isPaused ? (
					<div className="p-4">
						<EmptyState
							icon={CalendarClock}
							title="Sin conexion"
							description="No se puede sincronizar la planeacion en este momento."
						/>
					</div>
				) : null}
				{isLoading ? (
					<output className="flex items-center justify-center py-16" aria-live="polite">
						<Loader2 className="size-7 animate-spin text-brand" aria-hidden="true" />
						<span className="sr-only">Cargando planeación</span>
					</output>
				) : null}
				{isError ? (
					<div className="p-4">
						<EmptyState
							icon={CalendarClock}
							title="Error al cargar planeacion"
							description="El endpoint de paquetes de planeacion no respondio correctamente."
							action={{ label: "Reintentar", onClick: () => refetch() }}
						/>
					</div>
				) : null}
				{!isLoading && !isError && packets.length === 0 ? (
					<div className="p-4">
						<EmptyState
							icon={PackageCheck}
							title="Sin paquetes de planeacion"
							description="Crea la planeacion desde una orden aprobada para preparar la ejecucion."
						/>
					</div>
				) : null}
				{packets.length > 0 ? <PlanningTable packets={packets} /> : null}
			</div>
		</section>
	);
}

function Metric({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof CheckCircle2;
	label: string;
	value: number;
}) {
	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="text-sm text-[var(--text-secondary)]">{label}</p>
					<p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
				</div>
				<Icon className="size-6 text-[var(--color-brand)]" aria-hidden="true" />
			</div>
		</article>
	);
}

function DocumentLink({
	icon: Icon,
	title,
	description,
	defaultPurpose,
	defaultStepCode,
}: {
	icon: typeof Upload;
	title: string;
	description: string;
	defaultPurpose: DocumentPurpose;
	defaultStepCode: CermontOperationalStepCode;
}) {
	return (
		<ContextualDocumentUploadModal
			defaultPurpose={defaultPurpose}
			defaultStepCode={defaultStepCode}
			title={title}
			description={description}
		>
			<button
				type="button"
				className="w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 text-left shadow-card transition-colors hover:border-[var(--color-brand)]"
			>
				<div className="flex gap-3">
					<Icon className="mt-0.5 size-5 text-[var(--color-brand)]" aria-hidden="true" />
					<div>
						<h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
						<p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
					</div>
				</div>
			</button>
		</ContextualDocumentUploadModal>
	);
}

function PlanningTable({ packets }: { packets: PlanningPacket[] }) {
	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-[var(--border-subtle)]">
				<caption className="sr-only">Paquetes de planeacion por orden.</caption>
				<thead>
					<tr>
						<HeaderCell>Orden</HeaderCell>
						<HeaderCell>Estado</HeaderCell>
						<HeaderCell>Cuadrilla</HeaderCell>
						<HeaderCell>Recursos</HeaderCell>
						<HeaderCell>Accion</HeaderCell>
					</tr>
				</thead>
				<tbody className="divide-y divide-[var(--border-subtle)]">
					{packets.map((packet) => (
						<tr key={packet._id} className="hover:bg-[var(--surface-secondary)]/70">
							<td className="px-4 py-3 font-mono text-sm text-[var(--text-primary)]">
								{packet.workOrderId}
							</td>
							<td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
								{STATUS_LABELS[packet.status] ?? packet.status}
							</td>
							<td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
								{packet.crew.length}
							</td>
							<td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
								{packet.tools.length + packet.equipment.length}
							</td>
							<td className="px-4 py-3">
								<Button asChild variant="secondary" size="sm">
									<Link href={`/orders/${packet.workOrderId}/planning`}>Abrir</Link>
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function HeaderCell({ children }: { children: string }) {
	return (
		<th
			scope="col"
			className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]"
		>
			{children}
		</th>
	);
}
