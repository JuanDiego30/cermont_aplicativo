"use client";

import type { CreateSiteVisitRecordInput, InheritedField } from "@cermont/shared-types";
import { CreateSiteVisitRecordSchema } from "@cermont/shared-types";
import { AlertTriangle, ArrowLeft, CalendarClock, Save, WifiOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useMemo, useState } from "react";
import { ApiError } from "@/lib/http/api-client-constants";
import { interpretApiError } from "@/lib/http/http-error-reporter";
import { useConnectivity } from "@/lib/offline/connectivity";
import { APP_ROUTES } from "@/lib/routes";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";
import { useServiceCaseList } from "@/modules/service-cases/queries";
import { useCreateSiteVisit } from "@/modules/site-visits/queries";
import {
	getInheritedFieldSourceLabel,
	getSiteVisitDefaults,
} from "@/modules/workflow/step-default-values";
import { SiteVisitCaseSelector } from "./SiteVisitCaseSelector";
import { TextAreaField, TextField } from "./SiteVisitFormFields";

type SiteVisitFormState = {
	workRequestId: string;
	clientId: string;
	clientName: string;
	visitDate: string;
	location: string;
	responsibleUserId: string;
	responsibleName: string;
	requirements: string;
	observations: string;
};

function getDefaultVisitDate(): string {
	const date = new Date();
	date.setHours(date.getHours() + 1);
	const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
	return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function createInitialForm(): SiteVisitFormState {
	return {
		workRequestId: "",
		clientId: "",
		clientName: "",
		visitDate: getDefaultVisitDate(),
		location: "",
		responsibleUserId: "",
		responsibleName: "",
		requirements: "",
		observations: "",
	};
}

function toIsoDateTime(value: string): string {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function cleanText(value: string): string {
	return value.trim();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type SiteVisitFormBodyProps = {
	isOnline: boolean;
	selectedCaseId: string;
	form: SiteVisitFormState;
	formError: string;
	isError: boolean;
	isPending: boolean;
	mutationError: unknown;
	inheritedFields: InheritedField[];
	inheritedReady: boolean;
	fieldValue: (field: keyof SiteVisitFormState) => string;
	updateField: (field: keyof SiteVisitFormState, value: string) => void;
	onSubmit: (e: FormEvent<HTMLFormElement>) => void;
	onShowCaseSelector: () => void;
};

function SiteVisitFormBody({
	isOnline,
	selectedCaseId,
	form,
	formError,
	isError,
	isPending,
	mutationError,
	inheritedFields,
	inheritedReady,
	fieldValue,
	updateField,
	onSubmit,
	onShowCaseSelector,
}: SiteVisitFormBodyProps) {
	const apiError = mutationError instanceof ApiError ? mutationError : null;
	const errorMessage =
		formError ||
		(apiError
			? interpretApiError(apiError, "visita técnica").message
			: "No se pudo crear la visita técnica.");

	return (
		<>
			{!isOnline ? (
				<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-4 text-sm text-[var(--color-warning)]">
					<WifiOff className="mt-0.5 size-4" aria-hidden="true" />
					<p>Estás sin conexión. La creación requiere conexión para reservar consecutivo.</p>
				</div>
			) : null}

			{(formError || isError) && (
				<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4 text-sm text-[var(--color-danger)]">
					<AlertTriangle className="mt-0.5 size-4 flex-shrink-0" aria-hidden="true" />
					<div className="min-w-0">
						<p className="font-medium">{errorMessage}</p>
						{apiError?.details && apiError.details.length > 0 && (
							<ul className="mt-2 list-inside list-disc space-y-1 text-xs opacity-80">
								{apiError.details.map((detail) => (
									<li key={detail.field}>
										<span className="font-semibold">{detail.field}:</span> {detail.message}
									</li>
								))}
							</ul>
						)}
						{apiError?.code && !apiError.details && (
							<p className="mt-1 text-xs opacity-70">Código: {apiError.code}</p>
						)}
					</div>
				</div>
			)}

			{inheritedFields.length > 0 ? (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] p-4">
					<p className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand)]">
						Datos heredados de la solicitud
					</p>
					<div className="mt-3 grid gap-2 sm:grid-cols-2">
						{inheritedFields.map((field) => (
							<div
								key={field.key}
								className="flex items-center justify-between rounded-md bg-background/50 px-3 py-2"
							>
								<div>
									<p className="text-xs font-medium text-[var(--text-secondary)]">{field.label}</p>
									<p className="text-sm font-semibold text-[var(--text-primary)]">{field.value}</p>
								</div>
								<span className="text-[10px] font-medium text-[var(--color-brand)]">
									{getInheritedFieldSourceLabel(field)}
								</span>
							</div>
						))}
					</div>
				</div>
			) : null}

			<form
				onSubmit={onSubmit}
				className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card"
			>
				<div className="grid gap-4 md:grid-cols-2">
					<TextField
						id="serviceCaseId"
						label="Caso de servicio"
						value={selectedCaseId}
						onChange={() => {}}
						required
						readOnly
					/>
					<TextField
						id="clientName"
						label="Nombre del cliente"
						value={fieldValue("clientName")}
						onChange={(value) => updateField("clientName", value)}
						required
					/>
					<TextField
						id="location"
						label="Ubicación"
						value={fieldValue("location")}
						onChange={(value) => updateField("location", value)}
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
						id="responsibleUserId"
						label="ID del responsable técnico"
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
					label="Requerimientos técnicos"
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
					<button
						type="button"
						onClick={onShowCaseSelector}
						className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-primary)]"
					>
						Cambiar caso
					</button>
					<button
						type="submit"
						disabled={isPending || !isOnline || !inheritedReady}
						className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isPending ? (
							<CalendarClock className="size-4 animate-spin" aria-hidden="true" />
						) : (
							<Save className="size-4" aria-hidden="true" />
						)}
						Crear visita
					</button>
				</div>
			</form>
		</>
	);
}

// ─── Page entry ───────────────────────────────────────────────────────────────

export default function SiteVisitNewPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-12">
					<div className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
				</div>
			}
		>
			<SiteVisitNewPageContent />
		</Suspense>
	);
}

// ─── Main content ─────────────────────────────────────────────────────────────

function SiteVisitNewPageContent() {
	const { push } = useRouter();
	const searchParams = useSearchParams();
	const { isOnline } = useConnectivity();
	const [selectedCaseId, setSelectedCaseId] = useState(searchParams.get("serviceCaseId") ?? "");
	const createSiteVisit = useCreateSiteVisit();
	const [form, setForm] = useState<SiteVisitFormState>(createInitialForm);
	const [formError, setFormError] = useState("");
	const [showCaseSelector, setShowCaseSelector] = useState(!selectedCaseId);

	const {
		stepContext,
		inheritedFields,
		isLoading: isContextLoading,
	} = useServiceCaseContext("step_02_site_visit", selectedCaseId);

	const { data: casesData, isLoading: isCasesLoading } = useServiceCaseList();

	const inheritedDefaults = useMemo(() => {
		if (!stepContext || !selectedCaseId) {
			return { workRequestId: "", clientId: "", clientName: "", location: "" };
		}
		const defaults = getSiteVisitDefaults(stepContext);
		return {
			workRequestId: (defaults.workRequestId as string) ?? "",
			clientId: (defaults.clientId as string) ?? "",
			clientName: (defaults.clientName as string) ?? "",
			location: (defaults.location as string) ?? "",
		};
	}, [stepContext, selectedCaseId]);

	const inheritedReady =
		selectedCaseId === "" ||
		(selectedCaseId !== "" &&
			!isContextLoading &&
			Boolean(inheritedDefaults.workRequestId) &&
			Boolean(inheritedDefaults.clientId));

	function fieldValue(field: keyof SiteVisitFormState): string {
		return form[field] || (inheritedDefaults as Record<string, string>)[field] || "";
	}

	const selectCase = (caseId: string) => {
		setSelectedCaseId(caseId);
		setShowCaseSelector(false);
		setForm(createInitialForm());
	};

	const updateField = (field: keyof SiteVisitFormState, value: string) => {
		setForm((current) => ({ ...current, [field]: value }));
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFormError("");

		if (!selectedCaseId) {
			setFormError("Debe seleccionar un caso de servicio.");
			return;
		}

		const visitDate = toIsoDateTime(form.visitDate);
		if (!visitDate) {
			setFormError("La fecha de visita no es válida.");
			return;
		}

		const requirements = cleanText(form.requirements);
		const observations = cleanText(form.observations);

		const preValidation = CreateSiteVisitRecordSchema.safeParse({
			workRequestId: cleanText(fieldValue("workRequestId")),
			serviceCaseId: selectedCaseId,
			clientId: cleanText(fieldValue("clientId")),
			clientName: cleanText(fieldValue("clientName")),
			visitDate,
			location: cleanText(fieldValue("location")),
			responsibleUserId: cleanText(form.responsibleUserId),
			responsibleName: cleanText(form.responsibleName),
			...(requirements ? { requirements } : {}),
			...(observations ? { observations } : {}),
		});
		if (!preValidation.success) {
			const firstIssue = preValidation.error.issues[0];
			const fieldLabel =
				{
					workRequestId: "ID de solicitud",
					serviceCaseId: "Caso de servicio",
					clientId: "ID del cliente",
					clientName: "Nombre del cliente",
					visitDate: "Fecha de visita",
					location: "Ubicación",
					responsibleUserId: "ID del responsable técnico",
					responsibleName: "Nombre del responsable",
					requirements: "Requerimientos",
					observations: "Observaciones",
				}[firstIssue.path[0] as string] ?? String(firstIssue.path[0]);
			setFormError(
				`${fieldLabel}: ${firstIssue.message}${firstIssue.path[0] === "responsibleUserId" ? ". El ID debe ser un ObjectId de 24 caracteres hexadecimales." : ""}`,
			);
			return;
		}

		const payload: CreateSiteVisitRecordInput = preValidation.data;

		createSiteVisit.mutate(payload, {
			onSuccess: (response) => {
				const id = response.data?._id;
				push(id ? `${APP_ROUTES.siteVisits}/${id}` : APP_ROUTES.siteVisits);
			},
		});
	};

	if (showCaseSelector) {
		return (
			<SiteVisitCaseSelector
				cases={casesData?.items}
				isLoading={isCasesLoading}
				onSelect={selectCase}
			/>
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="site-visit-new-title">
			<header className="space-y-4">
				<div className="flex items-center justify-between">
					<Link
						href={APP_ROUTES.siteVisits}
						className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
					>
						<ArrowLeft className="size-4" aria-hidden="true" />
						Volver a visitas
					</Link>
					<button
						type="button"
						onClick={() => setShowCaseSelector(true)}
						className="text-sm font-medium text-[var(--color-brand)] underline"
					>
						Cambiar caso
					</button>
				</div>
				<div>
					<p className="text-sm font-medium text-slate">Paso 2 / Visita técnica</p>
					<h1
						id="site-visit-new-title"
						className="mt-2 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Nueva visita técnica
					</h1>
					<p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
						Complete los campos específicos de la visita. Los datos del caso se heredan de la
						solicitud.
					</p>
				</div>
			</header>

			{isContextLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
				</div>
			) : (
				<SiteVisitFormBody
					isOnline={isOnline}
					selectedCaseId={selectedCaseId}
					form={form}
					formError={formError}
					isError={createSiteVisit.isError}
					isPending={createSiteVisit.isPending}
					mutationError={createSiteVisit.error}
					inheritedFields={inheritedFields}
					inheritedReady={inheritedReady}
					fieldValue={fieldValue}
					updateField={updateField}
					onSubmit={handleSubmit}
					onShowCaseSelector={() => setShowCaseSelector(true)}
				/>
			)}
		</section>
	);
}
