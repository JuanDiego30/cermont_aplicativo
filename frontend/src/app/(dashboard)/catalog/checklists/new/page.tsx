"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ChecklistTemplateForm } from "@/checklists/components/ChecklistTemplateForm";

export default function NewChecklistTemplatePage() {
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
					Nueva Plantilla de Checklist
				</h1>
			</header>

			<ChecklistTemplateForm />
		</div>
	);
}
