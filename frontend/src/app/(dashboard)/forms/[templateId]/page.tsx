"use client";

import type { FormSubmissionValue } from "@cermont/shared-types";
import { ArrowLeft, CheckCircle2, ClipboardList, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { useCreateFormSubmission } from "@/modules/forms/queries/form-submissions";
import { CERMONT_FORM_TEMPLATES } from "@/modules/forms/templates/cermont-form-templates";
import { type FormValues, SectionedFormRenderer } from "@/modules/forms/ui/SectionedFormRenderer";

export default function FormTemplatePage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-brand" />
				</div>
			}
		>
			<FormTemplateContent />
		</Suspense>
	);
}

function FormTemplateContent() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();

	const templateId = params.templateId as string;
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";
	const executionSessionId = searchParams.get("executionSessionId") ?? "";

	const template = CERMONT_FORM_TEMPLATES[templateId];
	const createMutation = useCreateFormSubmission();
	const [submitted, setSubmitted] = useState(false);

	if (!template) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-12 text-center">
				<h1 className="text-xl font-semibold text-[var(--color-danger)]">
					Formulario no encontrado
				</h1>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">
					El ID de plantilla <code className="font-mono">{templateId}</code> no existe.
				</p>
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/execution"}
					className="mt-4 inline-block text-sm font-medium text-[var(--color-brand)] hover:underline"
				>
					Volver
				</Link>
			</div>
		);
	}

	const backHref = executionSessionId
		? `/execution/${executionSessionId}`
		: serviceCaseId
			? `/service-cases/${serviceCaseId}`
			: "/execution";

	async function handleSubmit(values: FormValues) {
		// Separate photo File objects from serialisable values
		const jsonValues: Record<string, FormSubmissionValue> = {};
		for (const [key, val] of Object.entries(values)) {
			if (typeof val === "string" || typeof val === "boolean") {
				jsonValues[key] = val;
			}
		}

		// Note: photo uploads require a separate /api/files round-trip.
		// For now we strip them from the payload; they can be attached later via
		// the photo attachment flow once file-upload integration is wired up.

		createMutation.mutate(
			{
				templateId,
				stepCode: template.stepCode,
				serviceCaseId: serviceCaseId || undefined,
				executionSessionId: executionSessionId || undefined,
				values: jsonValues,
			},
			{
				onSuccess: () => {
					setSubmitted(true);
					toast.success("Formulario guardado correctamente");
					setTimeout(() => {
						router.push(backHref);
					}, 1800);
				},
				onError: (err) => {
					toast.error("Error al guardar el formulario", { description: err.message });
				},
			},
		);
	}

	if (submitted) {
		return (
			<div className="mx-auto max-w-xl px-4 py-16 text-center">
				<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-50">
					<CheckCircle2 className="size-8 text-brand-annotate" />
				</div>
				<h1 className="text-xl font-semibold text-[var(--text-primary)]">Formulario guardado</h1>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">Redirigiendo…</p>
			</div>
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="form-template-title">
			{/* Header */}
			<header className="space-y-3">
				<Link
					href={backHref}
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver
				</Link>
				<div className="flex items-start gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-blue-bg)]">
						<ClipboardList className="size-5 text-[var(--color-brand)]" aria-hidden="true" />
					</span>
					<div>
						<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
							{template.stepCode.replace("step_0", "Paso ").replace("_", " — ").replace(/_/g, " ")}
						</p>
						<h1
							id="form-template-title"
							className="mt-1 text-2xl font-bold text-[var(--text-primary)]"
						>
							{template.name}
						</h1>
						<p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
							{template.description}
						</p>
					</div>
				</div>

				{/* Context badge */}
				{(serviceCaseId || executionSessionId) && (
					<div className="flex flex-wrap gap-2">
						{serviceCaseId && (
							<span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand)]/30 bg-[var(--color-brand-blue-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--color-brand)]">
								Caso: {serviceCaseId.slice(-8)}
							</span>
						)}
						{executionSessionId && (
							<span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
								Sesión: {executionSessionId.slice(-8)}
							</span>
						)}
					</div>
				)}
			</header>

			{/* Form */}
			<SectionedFormRenderer
				sections={template.sections}
				onSubmit={handleSubmit}
				isSubmitting={createMutation.isPending}
				submitLabel={`Guardar ${template.name}`}
			/>
		</section>
	);
}
