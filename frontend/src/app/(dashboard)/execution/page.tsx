"use client";

import type {
	CermontOperationalStepCode,
	DocumentPurpose,
	ExecutionSessionListItem,
	ExecutionSessionStatus,
} from "@cermont/shared-types";
import {
	AlertTriangle,
	ArrowRight,
	CheckCircle2,
	Clock3,
	FileSpreadsheet,
	FileText,
	ImagePlus,
	PlayCircle,
	RefreshCcw,
	Search,
	type Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";
import { useExecutionSessions } from "@/modules/execution/queries";

type StatusFilter = "all" | ExecutionSessionStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
	{ value: "all", label: "Todas" },
	{ value: "ready", label: "Listas" },
	{ value: "in_progress", label: "En campo" },
	{ value: "paused", label: "Pausadas" },
	{ value: "completed", label: "Completadas" },
	{ value: "sync_pending", label: "Offline" },
];

const STATUS_LABELS: Record<ExecutionSessionStatus, string> = {
	draft: "Borrador",
	ready: "Lista",
	in_progress: "En ejecucion",
	paused: "Pausada",
	completed: "Completada",
	cancelled: "Cancelada",
	sync_pending: "Sync pendiente",
	sync_failed: "Sync fallida",
};

const STATUS_STYLES: Record<ExecutionSessionStatus, string> = {
	draft: "bg-surface-secondary text-muted-foreground",
	ready: "bg-info-bg text-[var(--color-brand)]",
	in_progress: "bg-success-bg text-success",
	paused: "bg-warning-bg text-brand-warn",
	completed: "bg-emerald-50 text-brand-annotate",
	cancelled: "bg-danger-bg text-destructive",
	sync_pending: "bg-sky-50 text-brand-green",
	sync_failed: "bg-danger-bg text-destructive",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "America/Bogota",
});

function formatDate(value?: string): string {
	return value ? DATE_FORMATTER.format(new Date(value)) : "Sin registro";
}

function getSessionId(session: ExecutionSessionListItem): string {
	return session._id ?? session.id ?? "";
}

function buildFilters(status: StatusFilter) {
	return status === "all" ? { limit: 50 } : { status, limit: 50 };
}

function countActive(items: ExecutionSessionListItem[]): number {
	return items.filter((item) => item.status === "in_progress" || item.status === "paused").length;
}

export default function ExecutionPage() {
	const [status, setStatus] = useState<StatusFilter>("all");
	const { push } = useRouter();
	const filters = useMemo(() => buildFilters(status), [status]);
	const { data, isLoading, isError, isPaused, refetch, fetchStatus } =
		useExecutionSessions(filters);
	const sessions = data?.items ?? [];
	const activeCount = countActive(sessions);
	const readyCount = sessions.filter((item) => item.status === "ready").length;
	const completedCount = sessions.filter((item) => item.status === "completed").length;
	const pendingSyncCount = sessions.filter(
		(item) => item.offlineSyncStatus === "pending" || item.status === "sync_pending",
	).length;

	return (
		<section className="space-y-6" aria-labelledby="execution-title">
			<header className="rounded-xl border border-border bg-card p-5 shadow-sm">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-sm font-medium text-[var(--color-brand)]">Paso 6 / Ejecucion</p>
						<h1 id="execution-title" className="mt-2 text-2xl font-semibold text-foreground">
							Sesiones de ejecucion
						</h1>
						<p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
							Controla inicio, avance en campo, evidencias, formularios dinamicos, incidentes y
							cierre tecnico desde sesiones conectadas a ordenes y planeacion.
						</p>
					</div>
					<Button asChild variant="secondary">
						<Link href="/orders">
							<PlayCircle aria-hidden="true" />
							Crear desde orden
						</Link>
					</Button>
				</div>
			</header>

			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<KpiCard icon={PlayCircle} label="Activas" value={activeCount} />
				<KpiCard icon={Clock3} label="Listas" value={readyCount} />
				<KpiCard icon={CheckCircle2} label="Completadas" value={completedCount} />
				<KpiCard icon={RefreshCcw} label="Sync pendiente" value={pendingSyncCount} />
			</div>

			<DocumentActions />

			<div className="rounded-xl border border-border bg-card shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4">
					<div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar ejecuciones">
						{STATUS_FILTERS.map((filter) => (
							<button
								key={filter.value}
								type="button"
								onClick={() => setStatus(filter.value)}
								className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
									status === filter.value
										? "border-[var(--color-brand)] bg-[var(--color-cermont-blue-bg)] text-[var(--color-brand)]"
										: "border-border text-muted-foreground hover:bg-surface-secondary"
								}`}
							>
								{filter.label}
							</button>
						))}
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => refetch()}
						loading={fetchStatus === "fetching"}
					>
						<RefreshCcw aria-hidden="true" />
						Actualizar
					</Button>
				</div>

				{isPaused ? (
					<EmptyState
						icon={AlertTriangle}
						title="Sin conexion"
						description="Se mostrara la informacion cacheada cuando exista. Las sesiones pendientes se sincronizan desde el endpoint offline."
						action={{ label: "Reintentar", onClick: () => refetch() }}
					/>
				) : null}

				{isLoading ? <LoadingRows /> : null}

				{isError && !isLoading ? (
					<div className="p-4">
						<EmptyState
							icon={AlertTriangle}
							title="No se pudieron cargar las ejecuciones"
							description="El backend rechazo la consulta o no esta disponible."
							action={{ label: "Reintentar", onClick: () => refetch() }}
						/>
					</div>
				) : null}

				{!isLoading && !isError && sessions.length === 0 ? (
					<div className="p-4">
						<EmptyState
							icon={Search}
							title="Sin sesiones de ejecucion"
							description="Cuando una orden aprobada tenga planeacion, crea la sesion de ejecucion desde la orden."
							action={{ label: "Ver ordenes", onClick: () => push("/orders") }}
						/>
					</div>
				) : null}

				{sessions.length > 0 ? <ExecutionTable sessions={sessions} /> : null}
			</div>
		</section>
	);
}

function KpiCard({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof PlayCircle;
	label: string;
	value: number;
}) {
	return (
		<article className="rounded-lg border border-border bg-card p-4 shadow-card">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="text-sm text-muted-foreground">{label}</p>
					<p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
				</div>
				<span className="flex size-10 items-center justify-center rounded-md bg-[var(--color-cermont-blue-bg)] text-[var(--color-brand)]">
					<Icon className="size-5" aria-hidden="true" />
				</span>
			</div>
		</article>
	);
}

function DocumentActions() {
	return (
		<div className="grid gap-3 lg:grid-cols-3">
			<ActionLink
				icon={FileText}
				title="Subir PDF / Word"
				description="Extrae campos revisables para formularios de cierre y soporte tecnico."
				defaultPurpose="support_document"
				defaultStepCode="step_06_execution"
			/>
			<ActionLink
				icon={FileSpreadsheet}
				title="Subir Excel"
				description="Convierte listas de materiales, tiempos o checklists en datos de ejecucion."
				defaultPurpose="template_source"
				defaultStepCode="step_06_execution"
			/>
			<ActionLink
				icon={ImagePlus}
				title="Subir fotos"
				description="Relaciona evidencia visual con orden, incidencia, checklist o formulario."
				defaultPurpose="closing_evidence"
				defaultStepCode="step_06_execution"
			/>
		</div>
	);
}

function ActionLink({
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
				className="group w-full rounded-lg border border-border bg-card p-4 text-left shadow-card transition-colors hover:border-[var(--color-brand)]"
			>
				<div className="flex items-start gap-3">
					<span className="flex size-10 items-center justify-center rounded-md bg-surface-secondary text-[var(--color-brand)]">
						<Icon className="size-5" aria-hidden="true" />
					</span>
					<div>
						<h2 className="text-sm font-semibold text-foreground">{title}</h2>
						<p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
					</div>
					<ArrowRight
						className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
						aria-hidden="true"
					/>
				</div>
			</button>
		</ContextualDocumentUploadModal>
	);
}

function LoadingRows() {
	return (
		<output className="space-y-3 p-4">
			{["row-1", "row-2", "row-3"].map((key) => (
				<div key={key} className="h-20 animate-pulse rounded-lg bg-surface-secondary" />
			))}
			<span className="sr-only">Cargando ejecuciones</span>
		</output>
	);
}

function ExecutionTable({ sessions }: { sessions: ExecutionSessionListItem[] }) {
	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-border-subtle">
				<caption className="sr-only">Sesiones de ejecucion por orden de trabajo.</caption>
				<thead>
					<tr>
						<HeaderCell>Sesion</HeaderCell>
						<HeaderCell>Estado</HeaderCell>
						<HeaderCell>Inicio</HeaderCell>
						<HeaderCell>Evidencias</HeaderCell>
						<HeaderCell>Bloqueos</HeaderCell>
						<HeaderCell>Accion</HeaderCell>
					</tr>
				</thead>
				<tbody className="divide-y divide-border-subtle">
					{sessions.map((session) => {
						const id = getSessionId(session);
						return (
							<tr key={id || session.code} className="hover:bg-surface-secondary/70">
								<td className="px-4 py-3">
									<div className="font-mono text-sm font-medium text-foreground">
										{session.code}
									</div>
									<div className="text-xs text-muted-foreground">OT {session.workOrderId}</div>
								</td>
								<td className="px-4 py-3">
									<span
										className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
											STATUS_STYLES[session.status]
										}`}
									>
										{STATUS_LABELS[session.status]}
									</span>
								</td>
								<td className="px-4 py-3 text-sm text-secondary">
									{formatDate(session.startedAt)}
								</td>
								<td className="px-4 py-3 text-sm text-secondary">{session.evidenceIds.length}</td>
								<td className="px-4 py-3 text-sm text-secondary">{session.blockers.length}</td>
								<td className="px-4 py-3">
									<Button asChild variant="secondary" size="sm">
										<Link href={id ? `/execution/${id}` : "/execution"}>
											Abrir
											<ArrowRight aria-hidden="true" />
										</Link>
									</Button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

function HeaderCell({ children }: { children: string }) {
	return (
		<th
			scope="col"
			className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
		>
			{children}
		</th>
	);
}
