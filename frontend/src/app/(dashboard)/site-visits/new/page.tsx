"use client";

import type { CreateSiteVisitRecordInput } from "@cermont/shared-types";
import { AlertTriangle, ArrowLeft, CalendarClock, Save, WifiOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useConnectivity } from "@/lib/offline/connectivity";
import { APP_ROUTES } from "@/lib/routes";
import { useCreateSiteVisit } from "@/modules/site-visits/queries";

type SiteVisitFormState = {
	workRequestId: string;
	serviceCaseId: string;
	clientId: string;
	clientName: string;
	visitDate: string;
	location: string;
	responsibleUserId: string;
	responsibleName: string;
	requirements: string;
	observations: string;
};

const initialForm: SiteVisitFormState = {
	workRequestId: "",
	serviceCaseId: "",
	clientId: "",
	clientName: "",
	visitDate: "",
	location: "",
	responsibleUserId: "",
	responsibleName: "",
	requirements: "",
	observations: "",
};

function toIsoDateTime(value: string): string {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function cleanText(value: string): string {
	return value.trim();
}

export default function SiteVisitNewPage() {
	const { push } = useRouter();
	const { isOnline } = useConnectivity();
	const createSiteVisit = useCreateSiteVisit();
	const [form, setForm] = useState<SiteVisitFormState>(initialForm);
	const [formError, setFormError] = useState("");

	const updateField = (field: keyof SiteVisitFormState, value: string) => {
		setForm((current) => ({ ...current, [field]: value }));
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFormError("");

		const visitDate = toIsoDateTime(form.visitDate);
		if (!visitDate) {
			setFormError("La fecha de visita no es válida.");
			return;
		}

		const requirements = cleanText(form.requirements);
		const observations = cleanText(form.observations);
		const payload: CreateSiteVisitRecordInput = {
			workRequestId: cleanText(form.workRequestId),
			serviceCaseId: cleanText(form.serviceCaseId),
			clientId: cleanText(form.clientId),
			clientName: cleanText(form.clientName),
			visitDate,
			location: cleanText(form.location),
			responsibleUserId: cleanText(form.responsibleUserId),
			responsibleName: cleanText(form.responsibleName),
			...(requirements ? { requirements } : {}),
			...(observations ? { observations } : {}),
		};

		createSiteVisit.mutate(payload, {
			onSuccess: (response) => {
				const id = response.data?._id;
				push(id ? `${APP_ROUTES.siteVisits}/${id}` : APP_ROUTES.siteVisits);
			},
		});
	};

	return (
		<section className="space-y-6" aria-labelledby="site-visit-new-title">
			<header className="space-y-4">
				<Link
					href={APP_ROUTES.siteVisits}
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver a visitas
				</Link>
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 2 / Visita técnica</p>
					<h1
						id="site-visit-new-title"
						className="mt-2 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Nueva visita técnica
					</h1>
					<p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
						Programa una visita asociada a la solicitud y al caso de servicio para capturar
						mediciones, hallazgos y requisitos de propuesta.
					</p>
				</div>
			</header>

			{!isOnline ? (
				<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-4 text-sm text-[var(--color-warning)]">
					<WifiOff className="mt-0.5 size-4" aria-hidden="true" />
					<p>Estás sin conexión. La creación requiere conexión para reservar consecutivo.</p>
				</div>
			) : null}

			{formError || createSiteVisit.isError ? (
				<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4 text-sm text-[var(--color-danger)]">
					<AlertTriangle className="mt-0.5 size-4" aria-hidden="true" />
					<p>{formError || "No se pudo crear la visita técnica."}</p>
				</div>
			) : null}

			<form
				onSubmit={handleSubmit}
				className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-card"
			>
				<div className="grid gap-4 md:grid-cols-2">
					<TextField
						id="workRequestId"
						label="Solicitud de trabajo"
						value={form.workRequestId}
						onChange={(value) => updateField("workRequestId", value)}
						required
					/>
					<TextField
						id="serviceCaseId"
						label="Caso de servicio"
						value={form.serviceCaseId}
						onChange={(value) => updateField("serviceCaseId", value)}
						required
					/>
					<TextField
						id="clientId"
						label="Cliente"
						value={form.clientId}
						onChange={(value) => updateField("clientId", value)}
						required
					/>
					<TextField
						id="clientName"
						label="Nombre del cliente"
						value={form.clientName}
						onChange={(value) => updateField("clientName", value)}
						required
					/>
					<TextField
						id="visitDate"
						label="Fecha de visita"
						type="datetime-local"
						value={form.visitDate}
						onChange={(value) => updateField("visitDate", value)}
						required
					/>
					<TextField
						id="location"
						label="Ubicación"
						value={form.location}
						onChange={(value) => updateField("location", value)}
						required
					/>
					<TextField
						id="responsibleUserId"
						label="Responsable"
						value={form.responsibleUserId}
						onChange={(value) => updateField("responsibleUserId", value)}
						required
					/>
					<TextField
						id="responsibleName"
						label="Nombre del responsable"
						value={form.responsibleName}
						onChange={(value) => updateField("responsibleName", value)}
						required
					/>
				</div>

				<TextAreaField
					id="requirements"
					label="Requerimientos"
					value={form.requirements}
					onChange={(value) => updateField("requirements", value)}
				/>
				<TextAreaField
					id="observations"
					label="Observaciones"
					value={form.observations}
					onChange={(value) => updateField("observations", value)}
				/>

				<div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
					<Link
						href={APP_ROUTES.siteVisits}
						className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 text-sm font-medium text-[var(--text-primary)]"
					>
						Cancelar
					</Link>
					<button
						type="submit"
						disabled={createSiteVisit.isPending || !isOnline}
						className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
					>
						{createSiteVisit.isPending ? (
							<CalendarClock className="size-4 animate-spin" aria-hidden="true" />
						) : (
							<Save className="size-4" aria-hidden="true" />
						)}
						Crear visita
					</button>
				</div>
			</form>
		</section>
	);
}

function TextField({
	id,
	label,
	value,
	onChange,
	type = "text",
	required = false,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: "text" | "datetime-local";
	required?: boolean;
}) {
	return (
		<div className="grid gap-2">
			<label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)]">
				{label}
			</label>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				required={required}
				className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-focus-ring)]"
			/>
		</div>
	);
}

function TextAreaField({
	id,
	label,
	value,
	onChange,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="grid gap-2">
			<label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)]">
				{label}
			</label>
			<textarea
				id={id}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				rows={4}
				className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-focus-ring)]"
			/>
		</div>
	);
}
