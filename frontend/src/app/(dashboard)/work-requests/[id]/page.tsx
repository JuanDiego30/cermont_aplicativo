"use client";

import {
	Calendar,
	ChevronLeft,
	ClipboardCheck,
	Clock,
	FileText,
	Loader2,
	MapPin,
	Phone,
	Route,
	Tag,
	User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";
import { useWorkRequest } from "@/modules/work-requests/queries";

type WorkRequestDetailPageProps = {
	params: Promise<{ id: string }>;
};

const STATUS_LABELS: Record<string, string> = {
	draft: "Borrador",
	submitted: "Radicada",
	qualified: "Calificada",
	visit_required: "Requiere visita",
	proposal_pending: "Pendiente propuesta",
	cancelled: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
	draft: "bg-gray-100 text-gray-700",
	submitted: "bg-blue-50 text-brand",
	qualified: "bg-success/10 text-success",
	visit_required: "bg-amber-50 text-amber-700",
	proposal_pending: "bg-purple-50 text-purple-700",
	cancelled: "bg-destructive/10 text-destructive",
};

const URGENCY_LABELS: Record<string, string> = {
	low: "Baja",
	medium: "Media",
	high: "Alta",
	critical: "Crítica",
};

const CHANNEL_LABELS: Record<string, string> = {
	email: "Correo",
	phone: "Teléfono",
	whatsapp: "WhatsApp",
	portal_client: "Portal cliente",
	field_report: "Reporte de campo",
	internal: "Interno",
	scheduled_maintenance: "Mantenimiento programado",
	other: "Otro",
};

const WORK_REQUEST_DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
	day: "2-digit",
	month: "2-digit",
	timeZone: "America/Bogota",
	year: "numeric",
});

function formatWorkRequestDate(value: string) {
	return WORK_REQUEST_DATE_FORMATTER.format(new Date(value));
}

export default function WorkRequestDetailPage({ params }: WorkRequestDetailPageProps) {
	const { id } = use(params);
	const { push, refresh } = useRouter();
	const { data: workRequest, isLoading, isError, isPaused } = useWorkRequest(id);

	if (isPaused) {
		return (
			<EmptyState
				icon="documents"
				title="Sin conexión"
				description="No se puede cargar la solicitud. Verifica tu conexión a internet."
				action={{ label: "Reintentar", onClick: () => refresh() }}
			/>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24" aria-live="polite">
				<Loader2 className="size-8 animate-spin text-brand" aria-hidden="true" />
				<span className="sr-only">Cargando solicitud…</span>
			</div>
		);
	}

	if (isError || !workRequest) {
		return (
			<EmptyState
				icon="documents"
				title="Error al cargar"
				description="No se pudo cargar la solicitud. Puede que no exista o que no tengas permiso."
				action={{ label: "Volver a solicitudes", onClick: () => push("/work-requests") }}
			/>
		);
	}

	const statusLabel = STATUS_LABELS[workRequest.status] ?? workRequest.status;
	const statusColor = STATUS_COLORS[workRequest.status] ?? "bg-gray-100 text-gray-700";
	const requestedDateLabel = workRequest.requestedDate
		? formatWorkRequestDate(workRequest.requestedDate)
		: "";

	return (
		<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
			{/* Back navigation */}
			<Link
				href="/work-requests"
				className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
			>
				<ChevronLeft className="size-4" aria-hidden="true" />
				Volver a solicitudes
			</Link>

			{/* Header */}
			<div className="mb-8 flex flex-wrap items-start justify-between gap-4">
				<div>
					<div className="flex items-center gap-3">
						<span className="font-mono text-sm text-muted-foreground">{workRequest.code}</span>
						<span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
							{statusLabel}
						</span>
					</div>
					<h1 className="mt-2 text-2xl font-semibold text-foreground">
						{workRequest.shortDescription}
					</h1>
				</div>
				<div className="flex gap-2">
					{workRequest.status === "submitted" && (
						<Button size="sm" className="bg-success text-white hover:bg-success/90">
							Calificar solicitud
						</Button>
					)}
				</div>
			</div>

			{/* Info grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Left column */}
				<div className="space-y-6">
					<section
						aria-labelledby="client-info"
						className="rounded-lg border border-border bg-card p-6 shadow-card"
					>
						<h2
							id="client-info"
							className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
						>
							Cliente y contacto
						</h2>
						<dl className="space-y-3 text-sm">
							<div className="flex items-center gap-2">
								<User className="size-4 text-muted-foreground" aria-hidden="true" />
								<dt className="sr-only">Cliente</dt>
								<dd className="font-medium text-foreground">{workRequest.clientName}</dd>
							</div>
							{workRequest.requesterName && (
								<div className="flex items-center gap-2">
									<dt className="text-muted-foreground">Solicitante:</dt>
									<dd className="text-muted-foreground">{workRequest.requesterName}</dd>
								</div>
							)}
							{workRequest.requesterEmail && (
								<div className="flex items-center gap-2">
									<dt className="text-muted-foreground">Email:</dt>
									<dd className="text-muted-foreground">{workRequest.requesterEmail}</dd>
								</div>
							)}
							{workRequest.requesterPhone && (
								<div className="flex items-center gap-2">
									<Phone className="size-4 text-muted-foreground" aria-hidden="true" />
									<dd className="text-muted-foreground">{workRequest.requesterPhone}</dd>
								</div>
							)}
						</dl>
					</section>

					<section
						aria-labelledby="service-details"
						className="rounded-lg border border-border bg-card p-6 shadow-card"
					>
						<h2
							id="service-details"
							className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
						>
							Detalles del servicio
						</h2>
						<dl className="space-y-3 text-sm">
							<div className="flex items-center gap-2">
								<MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
								<dd className="text-foreground">{workRequest.serviceSite}</dd>
							</div>
							<div className="flex items-center gap-2">
								<Tag className="size-4 text-muted-foreground" aria-hidden="true" />
								<dt className="sr-only">Tipo de servicio</dt>
								<dd className="font-medium text-foreground">{workRequest.serviceType}</dd>
							</div>
							<div className="flex items-center gap-2">
								<Route className="size-4 text-muted-foreground" aria-hidden="true" />
								<dt className="text-muted-foreground">Canal:</dt>
								<dd className="text-muted-foreground">
									{CHANNEL_LABELS[workRequest.sourceChannel] ?? workRequest.sourceChannel}
								</dd>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="size-4 text-muted-foreground" aria-hidden="true" />
								<dt className="text-muted-foreground">Urgencia:</dt>
								<dd className="text-muted-foreground">
									{URGENCY_LABELS[workRequest.urgency] ?? workRequest.urgency}
								</dd>
							</div>
							{workRequest.requestedDate && (
								<div className="flex items-center gap-2">
									<Calendar className="size-4 text-muted-foreground" aria-hidden="true" />
									<dd className="text-muted-foreground">Solicitado: {requestedDateLabel}</dd>
								</div>
							)}
						</dl>
					</section>
				</div>

				{/* Right column */}
				<div className="space-y-6">
					<section
						aria-labelledby="description-info"
						className="rounded-lg border border-border bg-card p-6 shadow-card"
					>
						<h2
							id="description-info"
							className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
						>
							Descripción
						</h2>
						<p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
							{workRequest.description}
						</p>
					</section>

					{workRequest.requiresSiteVisit && (
						<section
							aria-labelledby="visit-info"
							className="rounded-lg border border-border bg-card p-6 shadow-card"
						>
							<h2
								id="visit-info"
								className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
							>
								Visita técnica requerida
							</h2>
							<div className="flex items-center gap-2 text-sm text-amber-700">
								<ClipboardCheck className="size-4" aria-hidden="true" />
								Programar visita para evaluar en sitio
							</div>
						</section>
					)}

					{/* Document upload CTA */}
					<section
						aria-labelledby="documents-section"
						className="rounded-lg border border-dashed border-border bg-surface-secondary p-6"
					>
						<h2
							id="documents-section"
							className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
						>
							Documentos
						</h2>
						<p className="text-sm text-muted-foreground">
							Adjunta documentos iniciales: PDF, Excel, Word, fotos o soportes del cliente.
						</p>
						<div className="mt-4">
							<ContextualDocumentUploadModal
								defaultPurpose="support_document"
								defaultStepCode="step_01_work_request"
								title="Adjuntar soporte inicial"
								description="Sube soportes del cliente y relaciónalos con la solicitud antes de pasar a visita o propuesta."
							>
								<Button type="button" variant="outline" size="sm">
									<FileText className="size-4" aria-hidden="true" />
									Subir documento
								</Button>
							</ContextualDocumentUploadModal>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
