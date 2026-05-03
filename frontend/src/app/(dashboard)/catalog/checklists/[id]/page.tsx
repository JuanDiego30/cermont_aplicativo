"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChecklistTemplateForm } from "@/checklists/components/ChecklistTemplateForm";
import { useChecklistTemplate } from "@/checklists/queries";

export default function EditChecklistTemplatePage() {
	const { id } = useParams<{ id: string }>();
	const { data: template, isLoading, error } = useChecklistTemplate(id);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-slate-400" />
			</div>
		);
	}

	if (error || !template) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
				No se pudo cargar la plantilla.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<header className="space-y-4">
				<Link
					href="/catalog/checklists"
					className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
				>
					<ChevronLeft className="h-4 w-4" />
					Volver al catálogo
				</Link>
				<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
					Editar Plantilla: {template.name}
				</h1>
			</header>

			<ChecklistTemplateForm initialData={template} templateId={id} />
		</div>
	);
}
