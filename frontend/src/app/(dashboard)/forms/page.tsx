"use client";

import { ClipboardCheck, ClipboardList, Shield } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ALL_TEMPLATES } from "@/modules/forms/templates/cermont-form-templates";

function stepLabel(stepCode: string): string {
	const map: Record<string, string> = {
		step_05_planning: "Paso 5 — Planeación",
		step_06_execution: "Paso 6 — Ejecución",
		step_07_technical_report: "Paso 7 — Informe técnico",
	};
	return map[stepCode] ?? stepCode;
}

function TemplateCard({
	template,
	serviceCaseId,
	executionSessionId,
}: {
	template: (typeof ALL_TEMPLATES)[0];
	serviceCaseId: string;
	executionSessionId: string;
}) {
	const qs = new URLSearchParams();
	if (serviceCaseId) {
		qs.set("serviceCaseId", serviceCaseId);
	}
	if (executionSessionId) {
		qs.set("executionSessionId", executionSessionId);
	}
	const href = `/forms/${template.id}${qs.toString() ? `?${qs.toString()}` : ""}`;

	return (
		<Link
			href={href}
			className="group flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)] hover:shadow-[var(--shadow-2)]"
		>
			<div className="flex items-start justify-between gap-3">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-blue-bg)]">
					<ClipboardList className="size-5 text-[var(--color-brand)]" aria-hidden="true" />
				</span>
				<span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 py-1 text-[10px] font-bold uppercase text-[var(--text-muted)]">
					{stepLabel(template.stepCode)}
				</span>
			</div>

			<div>
				<p className="font-bold text-[var(--text-primary)] group-hover:text-[var(--color-brand)]">
					{template.name}
				</p>
				<p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
					{template.description}
				</p>
			</div>

			<div className="mt-auto flex flex-wrap gap-1.5">
				{template.workTypeHint.split(",").map((tag) => (
					<span
						key={tag}
						className="rounded-full border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--color-brand)]"
					>
						{tag.trim().replace(/_/g, " ")}
					</span>
				))}
			</div>

			<div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand)] opacity-0 group-hover:opacity-100 transition-opacity">
				<ClipboardCheck className="size-3.5" aria-hidden="true" />
				Abrir formulario
			</div>
		</Link>
	);
}

function FormsIndexContent() {
	const searchParams = useSearchParams();
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";
	const executionSessionId = searchParams.get("executionSessionId") ?? "";

	return (
		<section className="space-y-6" aria-labelledby="forms-index-title">
			<header className="space-y-2">
				<div className="flex items-start gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-blue-bg)]">
						<Shield className="size-5 text-[var(--color-brand)]" aria-hidden="true" />
					</span>
					<div>
						<h1 id="forms-index-title" className="text-2xl font-bold text-[var(--text-primary)]">
							Formularios técnicos CERMONT
						</h1>
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							Formatos operativos digitalizados para planeación, inspección y mantenimiento.
						</p>
					</div>
				</div>

				{(serviceCaseId || executionSessionId) && (
					<div className="flex flex-wrap gap-2 pt-1">
						{serviceCaseId && (
							<span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand)]/30 bg-[var(--color-brand-blue-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--color-brand)]">
								Vinculado al caso: {serviceCaseId.slice(-8)}
							</span>
						)}
						{executionSessionId && (
							<span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1 text-[11px] text-[var(--text-secondary)]">
								Sesión de ejecución: {executionSessionId.slice(-8)}
							</span>
						)}
					</div>
				)}
			</header>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{ALL_TEMPLATES.map((tpl) => (
					<TemplateCard
						key={tpl.id}
						template={tpl}
						serviceCaseId={serviceCaseId}
						executionSessionId={executionSessionId}
					/>
				))}
			</div>
		</section>
	);
}

export default function FormsIndexPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
				</div>
			}
		>
			<FormsIndexContent />
		</Suspense>
	);
}
