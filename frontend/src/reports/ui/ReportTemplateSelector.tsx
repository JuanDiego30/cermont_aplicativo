"use client";

import { LayoutTemplate } from "lucide-react";
import type { ReportTemplate } from "@/reports/config/report-templates";
import { REPORT_TEMPLATES } from "@/reports/config/report-templates";

interface ReportTemplateSelectorProps {
	selectedTemplateId: string;
	onTemplateSelect: (template: ReportTemplate) => void;
}

export function ReportTemplateSelector({
	selectedTemplateId,
	onTemplateSelect,
}: ReportTemplateSelectorProps) {
	return (
		<section
			aria-labelledby="report-template-selector-title"
			className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
		>
			<div className="mb-3 flex items-center gap-2">
				<LayoutTemplate className="h-4 w-4 text-[var(--color-brand-blue)]" aria-hidden="true" />
				<h2
					id="report-template-selector-title"
					className="text-sm font-bold text-[var(--text-primary)]"
				>
					Plantillas de análisis
				</h2>
			</div>
			<div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
				{REPORT_TEMPLATES.map((template) => (
					<button
						key={template.id}
						type="button"
						onClick={() => onTemplateSelect(template)}
						aria-pressed={selectedTemplateId === template.id}
						className={`rounded-[var(--radius-md)] border p-3 text-left transition-colors ${
							selectedTemplateId === template.id
								? "border-[color:var(--color-brand-blue)]/45 bg-[var(--color-info-bg)]"
								: "border-[var(--border-default)] hover:bg-[var(--surface-secondary)]"
						}`}
					>
						<span className="block text-sm font-bold text-[var(--text-primary)]">
							{template.name}
						</span>
						<span className="mt-1 block text-xs text-[var(--text-secondary)]">
							{template.description}
						</span>
					</button>
				))}
			</div>
		</section>
	);
}
