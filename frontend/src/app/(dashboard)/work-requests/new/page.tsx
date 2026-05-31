"use client";

import type {
	CreateWorkRequestInput,
	WorkRequestSourceChannel,
	WorkRequestUrgency,
} from "@cermont/shared-types";
import { ArrowLeft, FileText, Loader2, Save, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CustomizableSelect } from "@/_shared/ui/forms/CustomizableSelect";
import { Button } from "@/core/ui/Button";
import { ApiError } from "@/lib/http/api-client";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";
import { useCreateWorkRequest } from "@/modules/work-requests/queries";

const URGENCY_OPTIONS: Array<{ value: WorkRequestUrgency; label: string }> = [
	{ value: "low", label: "Baja" },
	{ value: "medium", label: "Media" },
	{ value: "high", label: "Alta" },
	{ value: "critical", label: "Critica" },
];

const CHANNEL_OPTIONS: Array<{ value: WorkRequestSourceChannel; label: string }> = [
	{ value: "portal_client", label: "Portal cliente" },
	{ value: "email", label: "Correo" },
	{ value: "phone", label: "Telefono" },
	{ value: "whatsapp", label: "WhatsApp" },
	{ value: "field_report", label: "Reporte de campo" },
	{ value: "internal", label: "Interno" },
	{ value: "scheduled_maintenance", label: "Mantenimiento programado" },
	{ value: "other", label: "Otro" },
];

const SERVICE_TYPE_OPTIONS = [
	{ value: "obra_civil", label: "Obra civil" },
	{ value: "electricidad", label: "Electricidad" },
	{ value: "refrigeracion", label: "Refrigeración" },
	{ value: "mantenimiento", label: "Mantenimiento" },
	{ value: "telecomunicaciones", label: "Telecomunicaciones" },
	{ value: "cctv", label: "CCTV" },
	{ value: "lineas_de_vida", label: "Líneas de vida" },
] as const;

type FormState = {
	requesterName: string;
	requesterEmail: string;
	requesterPhone: string;
	clientName: string;
	serviceSite: string;
	serviceType: string;
	shortDescription: string;
	description: string;
	urgency: WorkRequestUrgency;
	sourceChannel: WorkRequestSourceChannel;
	sourceChannelOther: string;
	requiresSiteVisit: boolean;
};

const INITIAL_FORM: FormState = {
	requesterName: "",
	requesterEmail: "",
	requesterPhone: "",
	clientName: "",
	serviceSite: "",
	serviceType: "",
	shortDescription: "",
	description: "",
	urgency: "medium",
	sourceChannel: "portal_client",
	sourceChannelOther: "",
	requiresSiteVisit: true,
};

function buildPayload(form: FormState): CreateWorkRequestInput {
	const sourceChannel = form.sourceChannel === "other" ? "other" : form.sourceChannel;
	const payload: CreateWorkRequestInput = {
		requesterName: form.requesterName.trim(),
		clientName: form.clientName.trim(),
		serviceSite: form.serviceSite.trim(),
		serviceType: form.serviceType.trim(),
		sourceChannel,
		shortDescription: form.shortDescription.trim(),
		description: form.description.trim(),
		requiresSiteVisit: form.requiresSiteVisit,
		urgency: form.urgency,
		tags: [],
		classifications: [],
		initialEvidences: [],
		customFields:
			form.sourceChannel === "other" ? { sourceChannelOther: form.sourceChannelOther.trim() } : {},
	};

	if (form.requesterEmail.trim()) {
		payload.requesterEmail = form.requesterEmail.trim();
	}
	if (form.requesterPhone.trim()) {
		payload.requesterPhone = form.requesterPhone.trim();
	}

	return payload;
}

function getFieldErrors(error: Error | null): Array<{ field: string; message: string }> {
	if (error instanceof ApiError) {
		return error.details ?? [];
	}
	return [];
}

function getFieldError(
	fieldErrors: Array<{ field: string; message: string }>,
	field: keyof FormState,
): string {
	return fieldErrors.find((entry) => entry.field === field)?.message ?? "";
}

export default function NewWorkRequestPage() {
	const { push } = useRouter();
	const createMutation = useCreateWorkRequest();
	const [form, setForm] = useState<FormState>(INITIAL_FORM);
	const fieldErrors = getFieldErrors(createMutation.error);

	function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
		setForm((current) => ({ ...current, [key]: value }));
	}

	function submitForm(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		createMutation.mutate(buildPayload(form), {
			onSuccess: (created) => {
				toast.success(`Solicitud creada. Caso de servicio: ${created.serviceCase.code}`, {
					description: "Redirigiendo al cockpit del caso...",
					duration: 5000,
				});
				push(`/service-cases/${created.serviceCase._id}`);
			},
		});
	}

	return (
		<section className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
			<Link
				href="/work-requests"
				className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Volver a solicitudes
			</Link>

			<header className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)]">
				<p className="text-sm font-medium text-[var(--color-brand)]">Paso 1 / Solicitud</p>
				<h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
					Nueva solicitud de trabajo
				</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Registra la solicitud inicial y deja preparada la visita tecnica, propuesta y orden.
				</p>
			</header>

			<form
				onSubmit={submitForm}
				className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)]"
			>
				<div className="grid gap-4 md:grid-cols-2">
					<TextInput
						id="requesterName"
						label="Solicitante"
						value={form.requesterName}
						onChange={(value) => updateField("requesterName", value)}
						required
					/>
					<TextInput
						id="clientName"
						label="Cliente"
						value={form.clientName}
						onChange={(value) => updateField("clientName", value)}
						required
					/>
					<TextInput
						id="requesterEmail"
						label="Correo"
						type="email"
						value={form.requesterEmail}
						onChange={(value) => updateField("requesterEmail", value)}
					/>
					<TextInput
						id="requesterPhone"
						label="Telefono"
						value={form.requesterPhone}
						onChange={(value) => updateField("requesterPhone", value)}
					/>
					<TextInput
						id="serviceSite"
						label="Sitio de servicio"
						value={form.serviceSite}
						onChange={(value) => updateField("serviceSite", value)}
						error={getFieldError(fieldErrors, "serviceSite")}
						required
					/>
					<CustomizableSelect
						name="serviceType"
						label="Tipo de servicio"
						options={[...SERVICE_TYPE_OPTIONS]}
						value={form.serviceType}
						onChange={(value) => updateField("serviceType", value)}
						customOptionLabel="Otro / Personalizado"
						error={Boolean(getFieldError(fieldErrors, "serviceType"))}
						errorMessage={getFieldError(fieldErrors, "serviceType")}
						placeholder="Seleccione o escriba un servicio"
						required
					/>
					<label className="space-y-1.5">
						<span className="text-sm font-medium text-[var(--text-primary)]">Urgencia</span>
						<select
							value={form.urgency}
							onChange={(event) => updateField("urgency", event.target.value as WorkRequestUrgency)}
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
						>
							{URGENCY_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					<label className="space-y-1.5">
						<span className="text-sm font-medium text-[var(--text-primary)]">Canal</span>
						<select
							value={form.sourceChannel}
							onChange={(event) =>
								updateField("sourceChannel", event.target.value as WorkRequestSourceChannel)
							}
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
						>
							{CHANNEL_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					{form.sourceChannel === "other" ? (
						<TextInput
							id="sourceChannelOther"
							label="Especificar canal"
							value={form.sourceChannelOther}
							onChange={(value) => updateField("sourceChannelOther", value)}
							required
						/>
					) : null}
				</div>

				<div className="mt-4 space-y-4">
					<TextInput
						id="shortDescription"
						label="Resumen"
						value={form.shortDescription}
						onChange={(value) => updateField("shortDescription", value)}
						error={getFieldError(fieldErrors, "shortDescription")}
						required
					/>
					<label htmlFor="description" className="block space-y-1.5">
						<span className="text-sm font-medium text-[var(--text-primary)]">Descripcion</span>
						<textarea
							id="description"
							value={form.description}
							onChange={(event) => updateField("description", event.target.value)}
							required
							rows={5}
							className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
							aria-invalid={Boolean(getFieldError(fieldErrors, "description"))}
							{...(getFieldError(fieldErrors, "description")
								? { "aria-describedby": "description-error" }
								: {})}
						/>
						{getFieldError(fieldErrors, "description") ? (
							<span id="description-error" className="text-xs text-[var(--color-danger)]">
								{getFieldError(fieldErrors, "description")}
							</span>
						) : null}
					</label>
					<label
						htmlFor="requiresSiteVisit"
						className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]"
					>
						<input
							id="requiresSiteVisit"
							type="checkbox"
							checked={form.requiresSiteVisit}
							onChange={(event) => updateField("requiresSiteVisit", event.target.checked)}
							className="size-4 rounded border-[var(--border-default)]"
						/>
						Requiere visita tecnica
					</label>
				</div>

				<div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
					<div className="flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
						<ContextualDocumentUploadModal
							defaultPurpose="support_document"
							defaultStepCode="step_01_work_request"
							title="Adjuntar soporte inicial"
							description="Sube documentos y soportes visuales relacionados con la solicitud antes de crear visita o propuesta."
						>
							<button
								type="button"
								className="inline-flex items-center gap-2 hover:text-[var(--color-brand)]"
							>
								<FileText className="size-4" aria-hidden="true" />
								Subir PDF/Word/Excel
							</button>
						</ContextualDocumentUploadModal>
						<ContextualDocumentUploadModal
							defaultPurpose="closing_evidence"
							defaultStepCode="step_01_work_request"
							title="Adjuntar fotos iniciales"
							description="Carga imágenes o soportes del cliente y asócialos a la solicitud desde el primer paso."
						>
							<button
								type="button"
								className="inline-flex items-center gap-2 hover:text-[var(--color-brand)]"
							>
								<Upload className="size-4" aria-hidden="true" />
								Subir fotos
							</button>
						</ContextualDocumentUploadModal>
					</div>
					<Button type="submit" loading={createMutation.isPending}>
						{createMutation.isPending ? (
							<Loader2 aria-hidden="true" />
						) : (
							<Save aria-hidden="true" />
						)}
						Crear solicitud
					</Button>
				</div>
				{fieldErrors.length > 0 ? (
					<ul className="mt-3 space-y-1 text-sm text-[var(--color-danger)]">
						{fieldErrors.map((fieldError) => (
							<li key={`${fieldError.field}-${fieldError.message}`}>
								{fieldError.field}: {fieldError.message}
							</li>
						))}
					</ul>
				) : createMutation.error ? (
					<p className="mt-3 text-sm text-[var(--color-danger)]">{createMutation.error.message}</p>
				) : null}
			</form>
		</section>
	);
}

function TextInput({
	id,
	label,
	value,
	onChange,
	type = "text",
	required = false,
	error = "",
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: string;
	required?: boolean;
	error?: string;
}) {
	return (
		<label htmlFor={id} className="space-y-1.5">
			<span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				required={required}
				className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
				aria-invalid={Boolean(error)}
				{...(error ? { "aria-describedby": `${id}-error` } : {})}
			/>
			{error ? (
				<span id={`${id}-error`} className="text-xs text-[var(--color-danger)]">
					{error}
				</span>
			) : null}
		</label>
	);
}
