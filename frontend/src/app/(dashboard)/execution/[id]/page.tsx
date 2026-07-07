"use client";

import type { ExecutionSession, ExecutionSessionStatus } from "@cermont/shared-types";
import { isPresent, type StatusObject } from "@cermont/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangle,
	ArrowLeft,
	CheckCircle2,
	Clock3,
	FileText,
	Loader2,
	PauseCircle,
	PlayCircle,
	Save,
	Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, use, useState } from "react";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";
import {
	EXECUTION_KEYS,
	useAddExecutionIncident,
	useAddExecutionLabor,
	useAddExecutionMaterial,
	useCompleteExecutionSession,
	useExecutionSession,
	usePauseExecutionSession,
	useResumeExecutionSession,
	useStartExecutionSession,
	useSubmitExecutionDynamicForm,
} from "@/modules/execution/queries";
import { submitPreflight } from "@/modules/field-execution/api/field-execution.api";
import { ExecutionStatusBadge } from "@/modules/field-execution/ui/ExecutionStatusBadge";
import { ExecutionTimer } from "@/modules/field-execution/ui/ExecutionTimer";
import { FieldNoveltyButton } from "@/modules/field-execution/ui/evidence/FieldNoveltyButton";
import { StructuredEvidenceCapture } from "@/modules/field-execution/ui/evidence/StructuredEvidenceCapture";
import { PreflightGatesForm } from "@/modules/field-execution/ui/PreflightGatesForm";
import { useAuthStore } from "@/store/auth.store";

type ExecutionDetailPageProps = {
	params: Promise<{ id: string }>;
};

const DEFAULT_EXECUTION_TARGET_MINUTES = 8 * 60;

const PREFLIGHT_GATES = [
	{ id: "eppComplete", label: "EPP completo", isBlocking: true },
	{ id: "astSigned", label: "AST firmado y socializado", isBlocking: true },
	{ id: "ptwObtained", label: "Permiso de trabajo (PTW) obtenido", isBlocking: true },
	{ id: "toolsValidated", label: "Herramientas y equipos validados", isBlocking: true },
	{ id: "vehicleDocumentsOk", label: "Documentos del vehículo vigentes", isBlocking: true },
	{ id: "certificationsCurrent", label: "Certificaciones del personal vigentes", isBlocking: true },
] as const;

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "America/Bogota",
});

function makeUuid(): string {
	return crypto.randomUUID();
}

function formatDate(value?: string): string {
	return value ? DATE_FORMATTER.format(new Date(value)) : "Sin registro";
}

function getErrorMessage(error: Error | null): string {
	return error?.message ?? "";
}

type AuthUser = {
	id: string;
	email: string;
	name: string;
	role: string;
};

export default function ExecutionDetailPage({ params }: ExecutionDetailPageProps) {
	const { id } = use(params);
	const { push } = useRouter();
	const userStatus: StatusObject<AuthUser> = useAuthStore((state) => state.user);
	const { data: session, isLoading, isError, isPaused, refetch } = useExecutionSession(id);

	if (isPaused) {
		return (
			<EmptyState
				icon={AlertTriangle}
				title="Sin conexion"
				description="No se puede cargar esta ejecucion. Los comandos offline se sincronizan al recuperar conexion."
				action={{ label: "Reintentar", onClick: () => refetch() }}
			/>
		);
	}

	if (isLoading) {
		return (
			<output className="flex items-center justify-center py-24" aria-live="polite">
				<Loader2 className="size-8 animate-spin text-brand" aria-hidden="true" />
				<span className="sr-only">Cargando ejecución</span>
			</output>
		);
	}

	if (isError || !session) {
		return (
			<EmptyState
				icon={AlertTriangle}
				title="No se pudo cargar la ejecucion"
				description="La sesion no existe o el usuario no tiene permisos."
				action={{ label: "Volver", onClick: () => push("/execution") }}
			/>
		);
	}

	const user = isPresent(userStatus) ? userStatus.value : null;
	return <ExecutionDetailWorkspace id={id} session={session} user={user} />;
}

function ExecutionDetailWorkspace({
	id,
	session,
	user,
}: {
	id: string;
	session: ExecutionSession;
	user: { id: string; role: string } | null;
}) {
	const { push } = useRouter();
	const commandState = useExecutionDetailCommands(id, user);
	const {
		addIncident,
		addLaborEntry,
		addMaterialUsage,
		canUseUserCommands,
		completeExecution,
		completeMutation,
		currentError,
		dynamicFormMutation,
		dynamicValue,
		incidentDescription,
		incidentMutation,
		isBusy,
		laborMutation,
		materialMutation,
		materialName,
		materialQuantity,
		pauseExecution,
		pauseMutation,
		resumeExecution,
		resumeMutation,
		setDynamicValue,
		setIncidentDescription,
		setMaterialName,
		setMaterialQuantity,
		startExecution,
		startMutation,
		submitDynamicForm,
	} = commandState;

	const canSubmitPreflight = session.status === "draft" || session.status === "ready";

	return (
		<section className="space-y-6" aria-labelledby="execution-detail-title">
			<Link
				href="/execution"
				className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Volver a ejecuciones
			</Link>

			<header className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)]">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="font-mono text-sm text-[var(--text-tertiary)]">{session.code}</p>
						<h1
							id="execution-detail-title"
							className="mt-2 text-2xl font-semibold text-[var(--text-primary)]"
						>
							Ejecucion de orden {session.workOrderId}
						</h1>
						<p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
							<ExecutionStatusBadge status={session.status} />
							<span>Inicio: {formatDate(session.startedAt)}</span>
						</p>
					</div>
					<ExecutionStatusActions
						status={session.status}
						onStart={startExecution}
						onPause={pauseExecution}
						onResume={resumeExecution}
						onComplete={completeExecution}
						startLoading={startMutation.isPending}
						pauseLoading={pauseMutation.isPending}
						resumeLoading={resumeMutation.isPending}
						completeLoading={completeMutation.isPending}
					/>
				</div>
				{session.startedAt ? (
					<div className="mt-4 max-w-md">
						<ExecutionTimer
							startedAt={session.startedAt}
							targetMinutes={DEFAULT_EXECUTION_TARGET_MINUTES}
							end={
								session.completedAt
									? { status: "stopped", at: session.completedAt }
									: { status: "running" }
							}
						/>
					</div>
				) : null}
			</header>

			{currentError ? (
				<div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4 text-sm text-[var(--color-danger)]">
					{currentError}
				</div>
			) : null}

			<div className="grid gap-3 md:grid-cols-4">
				<Metric label="Evidencias" value={session.evidenceIds.length + session.evidences.length} />
				<Metric label="Materiales" value={session.materialsUsed.length} />
				<Metric label="Mano de obra" value={session.laborEntries.length} />
				<Metric label="Incidentes" value={session.incidents.length} />
			</div>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.75fr)]">
				<div className="space-y-4">
					{canSubmitPreflight ? <PreflightPanel sessionId={id} /> : null}

					<Panel title="Evidencias estructuradas">
						<StructuredEvidenceCapture
							slots={(["before", "during", "after"] as const).map((phase) => ({
								id: `slot-${phase}`,
								phase,
								label:
									phase === "before"
										? "Foto antes del trabajo"
										: phase === "during"
											? "Foto durante el trabajo"
											: "Foto después del trabajo",
								isRequired: true,
								isBlocking: phase !== "during",
								status: session.evidences.some((evidence) => evidence.phase === phase)
									? "uploaded"
									: "empty",
								onCapture: () => push("/evidences"),
							}))}
						/>
					</Panel>

					<Panel title="Acciones de campo">
						<div className="grid gap-3 sm:grid-cols-2">
							<Button
								type="button"
								variant="secondary"
								onClick={addLaborEntry}
								disabled={!canUseUserCommands || isBusy}
								loading={laborMutation.isPending}
							>
								<Clock3 aria-hidden="true" />
								Registrar 1h
							</Button>
							<Button asChild variant="secondary">
								<Link href="/evidences">
									<Upload aria-hidden="true" />
									Subir evidencia
								</Link>
							</Button>
						</div>
						<div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_auto]">
							<input
								value={materialName}
								onChange={(event) => setMaterialName(event.target.value)}
								className="h-10 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
								aria-label="Material usado"
							/>
							<input
								value={materialQuantity}
								onChange={(event) => setMaterialQuantity(event.target.value)}
								className="h-10 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
								aria-label="Cantidad usada"
								inputMode="decimal"
							/>
							<Button
								type="button"
								onClick={addMaterialUsage}
								disabled={!canUseUserCommands || isBusy}
								loading={materialMutation.isPending}
							>
								<Save aria-hidden="true" />
								Guardar
							</Button>
						</div>
					</Panel>

					{/* CERMONT technical form templates */}
					<Panel title="Formularios técnicos CERMONT">
						<p className="mb-3 text-xs text-[var(--text-secondary)]">
							Registra los formularios operativos: planeación de obra, mantenimiento CCTV,
							inspección de líneas de vida.
						</p>
						<div className="grid gap-2 sm:grid-cols-2">
							{[
								{ id: "cermont_cctv_v1", label: "Mant. CCTV" },
								{ id: "cermont_lineas_vida_v1", label: "Líneas de vida" },
								{ id: "cermont_planeacion_obra_v1", label: "Planeación de obra" },
							].map((tpl) => {
								const qs = new URLSearchParams();
								qs.set("executionSessionId", id);
								if (session.serviceCaseId) {
									qs.set("serviceCaseId", session.serviceCaseId);
								}
								return (
									<Link
										key={tpl.id}
										href={`/forms/${tpl.id}?${qs.toString()}`}
										className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
									>
										<FileText className="size-3.5 shrink-0" aria-hidden="true" />
										{tpl.label}
									</Link>
								);
							})}
						</div>
					</Panel>

					<Panel title="Formulario dinamico">
						<textarea
							aria-label="Contenido del formulario dinamico"
							value={dynamicValue}
							onChange={(event) => setDynamicValue(event.target.value)}
							rows={4}
							className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
							placeholder="Campo detectado desde PDF, Excel, Word o foto revisada"
						/>
						<div className="mt-3 flex flex-wrap gap-2">
							<Button
								type="button"
								onClick={submitDynamicForm}
								disabled={!canUseUserCommands || isBusy || !dynamicValue.trim()}
								loading={dynamicFormMutation.isPending}
							>
								<FileText aria-hidden="true" />
								Guardar respuesta
							</Button>
							<ContextualDocumentUploadModal
								defaultOrderId={session.workOrderId}
								defaultPurpose="support_document"
								defaultStepCode="step_06_execution"
								title="Adjuntar soporte de ejecución"
								description="Sube PDF, Word, Excel o imágenes vinculándolos a esta sesión para actualizar formularios y bloqueos del paso 6."
							>
								<Button type="button" variant="secondary">
									Subir documento
								</Button>
							</ContextualDocumentUploadModal>
						</div>
					</Panel>

					<Panel title="Incidente operativo">
						<textarea
							aria-label="Descripcion del incidente operativo"
							value={incidentDescription}
							onChange={(event) => setIncidentDescription(event.target.value)}
							rows={3}
							className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
							placeholder="Describe el incidente o desviacion"
						/>
						<Button
							type="button"
							variant="secondary"
							className="mt-3"
							onClick={addIncident}
							disabled={!canUseUserCommands || isBusy || incidentDescription.trim().length < 5}
							loading={incidentMutation.isPending}
						>
							<AlertTriangle aria-hidden="true" />
							Registrar incidente
						</Button>
					</Panel>
				</div>

				<aside className="space-y-4">
					<Panel title="Siguientes acciones">
						<List items={session.nextActions.map((item) => item.label)} empty="Sin acciones" />
					</Panel>
					<Panel title="Bloqueos">
						<List items={session.blockers.map((item) => item.message)} empty="Sin bloqueos" />
					</Panel>
				</aside>
			</div>

			{canUseUserCommands ? <FieldNoveltyButton onReport={commandState.reportNovelty} /> : null}
		</section>
	);
}

function PreflightPanel({ sessionId }: { sessionId: string }) {
	const queryClient = useQueryClient();
	const preflightMutation = useMutation({
		mutationFn: (passedItems: string[]) => {
			const passed = new Set(passedItems);
			return submitPreflight(sessionId, {
				items: PREFLIGHT_GATES.map((gate) => ({
					id: gate.id,
					label: gate.label,
					isBlocking: gate.isBlocking,
					checked: passed.has(gate.id),
				})),
				eppComplete: passed.has("eppComplete"),
				astSigned: passed.has("astSigned"),
				ptwObtained: passed.has("ptwObtained"),
				toolsValidated: passed.has("toolsValidated"),
				vehicleDocumentsOk: passed.has("vehicleDocumentsOk"),
				certificationsCurrent: passed.has("certificationsCurrent"),
			});
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.detail(sessionId) });
		},
	});

	return (
		<Panel title="Preflight de seguridad">
			<p className="mb-3 text-xs text-[var(--text-secondary)]">
				Verifica los requisitos de seguridad antes de iniciar la ejecución en campo.
			</p>
			{preflightMutation.isError ? (
				<p role="alert" className="mb-3 text-xs text-[var(--color-danger)]">
					{preflightMutation.error instanceof Error
						? preflightMutation.error.message
						: "No se pudo registrar el preflight"}
				</p>
			) : null}
			{preflightMutation.isSuccess ? (
				<p className="mb-3 text-xs font-semibold text-[var(--color-success)]">
					Preflight registrado. La sesión queda lista para iniciar.
				</p>
			) : (
				<PreflightGatesForm
					gates={PREFLIGHT_GATES.map((gate) => ({ ...gate }))}
					onComplete={(passedItems) => preflightMutation.mutate(passedItems)}
					submitLabel="Registrar preflight"
				/>
			)}
		</Panel>
	);
}

function useExecutionDetailCommands(id: string, user: { id: string; role: string } | null) {
	const startMutation = useStartExecutionSession(id);
	const pauseMutation = usePauseExecutionSession(id);
	const resumeMutation = useResumeExecutionSession(id);
	const completeMutation = useCompleteExecutionSession(id);
	const laborMutation = useAddExecutionLabor(id);
	const materialMutation = useAddExecutionMaterial(id);
	const incidentMutation = useAddExecutionIncident(id);
	const dynamicFormMutation = useSubmitExecutionDynamicForm(id);
	const [dynamicValue, setDynamicValue] = useState("");
	const [materialName, setMaterialName] = useState("Material usado en campo");
	const [materialQuantity, setMaterialQuantity] = useState("1");
	const [incidentDescription, setIncidentDescription] = useState("");

	const currentError =
		getErrorMessage(startMutation.error) ||
		getErrorMessage(pauseMutation.error) ||
		getErrorMessage(resumeMutation.error) ||
		getErrorMessage(completeMutation.error) ||
		getErrorMessage(laborMutation.error) ||
		getErrorMessage(materialMutation.error) ||
		getErrorMessage(incidentMutation.error) ||
		getErrorMessage(dynamicFormMutation.error);

	const canUseUserCommands = Boolean(user?.id);
	const isBusy =
		startMutation.isPending ||
		pauseMutation.isPending ||
		resumeMutation.isPending ||
		completeMutation.isPending ||
		laborMutation.isPending ||
		materialMutation.isPending ||
		incidentMutation.isPending ||
		dynamicFormMutation.isPending;

	function startExecution() {
		startMutation.mutate({
			clientMutationId: makeUuid(),
			commandType: "start_execution",
			startedAt: new Date().toISOString(),
		});
	}

	function pauseExecution() {
		pauseMutation.mutate({
			clientMutationId: makeUuid(),
			commandType: "pause_execution",
			reason: "Pausa registrada desde consola de ejecucion",
		});
	}

	function resumeExecution() {
		resumeMutation.mutate({
			clientMutationId: makeUuid(),
			commandType: "resume_execution",
			resumedAt: new Date().toISOString(),
		});
	}

	function completeExecution() {
		completeMutation.mutate({
			clientMutationId: makeUuid(),
			commandType: "complete_execution",
			completedAt: new Date().toISOString(),
		});
	}

	function addLaborEntry() {
		if (!user?.id) {
			return;
		}
		const endedAt = new Date();
		const startedAt = new Date(endedAt.getTime() - 60 * 60 * 1000);
		laborMutation.mutate({
			clientMutationId: makeUuid(),
			commandType: "add_labor_entry",
			labor: {
				laborEntryId: makeUuid(),
				userId: user.id,
				role: user.role,
				startedAt: startedAt.toISOString(),
				endedAt: endedAt.toISOString(),
				durationMinutes: 60,
				description: "Avance operativo registrado desde sesion de ejecucion",
			},
		});
	}

	function addMaterialUsage() {
		if (!user?.id) {
			return;
		}
		const quantity = Number(materialQuantity);
		if (!materialName.trim() || !Number.isFinite(quantity) || quantity <= 0) {
			return;
		}
		materialMutation.mutate({
			clientMutationId: makeUuid(),
			commandType: "add_material_usage",
			material: {
				usageId: makeUuid(),
				name: materialName.trim(),
				quantityPlanned: 0,
				quantityUsed: quantity,
				unit: "und",
				recordedAt: new Date().toISOString(),
				recordedBy: user.id,
			},
		});
	}

	function addIncident() {
		if (!user?.id || incidentDescription.trim().length < 5) {
			return;
		}
		incidentMutation.mutate({
			clientMutationId: makeUuid(),
			commandType: "add_incident",
			incident: {
				incidentId: makeUuid(),
				type: "technical",
				severity: "medium",
				description: incidentDescription.trim(),
				occurredAt: new Date().toISOString(),
				reportedBy: user.id,
				evidenceIds: [],
			},
		});
		setIncidentDescription("");
	}

	function reportNovelty(data: {
		description: string;
		severity: string;
		generatesWorkRequest: boolean;
	}) {
		if (!user?.id) {
			return;
		}
		const severity = ["low", "medium", "high", "critical"].includes(data.severity)
			? (data.severity as "low" | "medium" | "high" | "critical")
			: "medium";
		incidentMutation.mutate({
			clientMutationId: makeUuid(),
			commandType: "add_incident",
			incident: {
				incidentId: makeUuid(),
				type: "technical",
				severity,
				description: data.generatesWorkRequest
					? `${data.description} [Novedad de campo — requiere solicitud de trabajo]`
					: `${data.description} [Novedad de campo]`,
				occurredAt: new Date().toISOString(),
				reportedBy: user.id,
				evidenceIds: [],
			},
		});
	}

	function submitDynamicForm() {
		if (!user?.id || !dynamicValue.trim()) {
			return;
		}
		dynamicFormMutation.mutate({
			clientMutationId: makeUuid(),
			commandType: "submit_dynamic_form",
			response: {
				responseId: makeUuid(),
				fieldKey: "field_observation",
				label: "Observacion de campo",
				value: dynamicValue.trim(),
				required: false,
				evidenceIds: [],
				answeredAt: new Date().toISOString(),
				answeredBy: user.id,
			},
		});
		setDynamicValue("");
	}

	return {
		addIncident,
		addLaborEntry,
		addMaterialUsage,
		canUseUserCommands,
		completeExecution,
		completeMutation,
		currentError,
		dynamicFormMutation,
		dynamicValue,
		incidentDescription,
		incidentMutation,
		isBusy,
		laborMutation,
		materialMutation,
		materialName,
		materialQuantity,
		pauseExecution,
		pauseMutation,
		reportNovelty,
		resumeExecution,
		resumeMutation,
		setDynamicValue,
		setIncidentDescription,
		setMaterialName,
		setMaterialQuantity,
		startExecution,
		startMutation,
		submitDynamicForm,
	};
}

function Metric({ label, value }: { label: string; value: number }) {
	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
			<p className="text-sm text-[var(--text-secondary)]">{label}</p>
			<p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
		</article>
	);
}

function ExecutionStatusActions({
	status,
	onStart,
	onPause,
	onResume,
	onComplete,
	startLoading,
	pauseLoading,
	resumeLoading,
	completeLoading,
}: {
	status: ExecutionSessionStatus;
	onStart: () => void;
	onPause: () => void;
	onResume: () => void;
	onComplete: () => void;
	startLoading: boolean;
	pauseLoading: boolean;
	resumeLoading: boolean;
	completeLoading: boolean;
}) {
	const canStart = status === "ready" || status === "draft";
	const canPause = status === "in_progress";
	const canResume = status === "paused";
	const canComplete = status === "in_progress" || status === "paused";

	return (
		<div className="flex flex-wrap gap-2">
			{canStart ? (
				<Button type="button" onClick={onStart} loading={startLoading}>
					<PlayCircle aria-hidden="true" />
					Iniciar
				</Button>
			) : null}
			{canPause ? (
				<Button type="button" variant="secondary" onClick={onPause} loading={pauseLoading}>
					<PauseCircle aria-hidden="true" />
					Pausar
				</Button>
			) : null}
			{canResume ? (
				<Button type="button" onClick={onResume} loading={resumeLoading}>
					<PlayCircle aria-hidden="true" />
					Reanudar
				</Button>
			) : null}
			{canComplete ? (
				<Button type="button" variant="accent" onClick={onComplete} loading={completeLoading}>
					<CheckCircle2 aria-hidden="true" />
					Finalizar
				</Button>
			) : null}
		</div>
	);
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
			<h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
				{title}
			</h2>
			<div className="mt-4">{children}</div>
		</section>
	);
}

function List({ items, empty }: { items: string[]; empty: string }) {
	if (items.length === 0) {
		return <p className="text-sm text-[var(--text-secondary)]">{empty}</p>;
	}

	return (
		<ul className="space-y-2">
			{items.map((item) => (
				<li
					key={item}
					className="rounded-[var(--radius-md)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-secondary)]"
				>
					{item}
				</li>
			))}
		</ul>
	);
}
