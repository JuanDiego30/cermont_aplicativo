"use client";

import type { CreateSiteVisitRecordInput } from "@cermont/shared-types";
import { AlertTriangle, ArrowLeft, CalendarClock, Save, WifiOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useMemo, useState } from "react";
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

const initialForm: SiteVisitFormState = {
	workRequestId: "",
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

function SiteVisitNewPageContent() {
	const { push } = useRouter();
	const searchParams = useSearchParams();
	const { isOnline } = useConnectivity();
	const [selectedCaseId, setSelectedCaseId] = useState(searchParams.get("serviceCaseId") ?? "");
	const createSiteVisit = useCreateSiteVisit();
	const [form, setForm] = useState<SiteVisitFormState>(initialForm);
	const [formError, setFormError] = useState("");
	const [showCaseSelector, setShowCaseSelector] = useState(!selectedCaseId);

	// Load step context when a service case is selected
	const {
		stepContext,
		inheritedFields,
		isLoading: isContextLoading,
	} = useServiceCaseContext("step_02_site_visit", selectedCaseId);

	// Load available cases for selection
	const { data: casesData, isLoading: isCasesLoading } = useServiceCaseList();

	// Compute inherited fields from stepContext during render
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

	// Merge form state with inherited defaults: user edits take precedence
	function fieldValue(field: keyof SiteVisitFormState): string {
		return form[field] || (inheritedDefaults as Record<string, string>)[field] || "";
	}

	const selectCase = (caseId: string) => {
		setSelectedCaseId(caseId);
		setShowCaseSelector(false);
		setForm(initialForm);
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
		const payload: CreateSiteVisitRecordInput = {
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
		};

		createSiteVisit.mutate(payload, {
			onSuccess: (response) => {
				const id = response.data?._id;
				push(id ? `${APP_ROUTES.siteVisits}/${id}` : APP_ROUTES.siteVisits);
			},
		});
	};

	// ─── Case Selector (Step 1) ─────────────────────────────────────────
	if (showCaseSelector) {
		return (
			<SiteVisitCaseSelector
				cases={casesData?.items}
				isLoading={isCasesLoading}
				onSelect={selectCase}
			/>
		);
	}

	// ─── Form (Step 2) ──────────────────────────────────────────────────
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
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 2 / Visita técnica</p>
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
				<>
					{!isOnline ? (
						<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-4 text-sm text-[var(--color-warning)]">
							<WifiOff className="mt-0.5 size-4" aria-hidden="true" />
							<p>Estás sin conexión. La creación requiere conexión para reservar consecutivo.</p>
						</div>
					) : null}

					{(formError || createSiteVisit.isError) && (
						<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4 text-sm text-[var(--color-danger)]">
							<AlertTriangle className="mt-0.5 size-4" aria-hidden="true" />
							<p>{formError || "No se pudo crear la visita técnica."}</p>
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
											<p className="text-xs font-medium text-[var(--text-secondary)]">
												{field.label}
											</p>
											<p className="text-sm font-semibold text-[var(--text-primary)]">
												{field.value}
											</p>
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
						onSubmit={handleSubmit}
						className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-card"
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
								onClick={() => setShowCaseSelector(true)}
								className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 text-sm font-medium text-[var(--text-primary)]"
							>
								Cambiar caso
							</button>
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
				</>
			)}
		</section>
	);
}
