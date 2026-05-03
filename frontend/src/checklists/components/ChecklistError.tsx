import { AlertCircle } from "lucide-react";

export function ChecklistError({ message }: { message: string }) {
	return (
		<section className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-200">
			<AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
			<div>
				<p className="text-sm font-medium">Error al cargar el checklist.</p>
				<p className="mt-1 text-xs opacity-75">{message}</p>
			</div>
		</section>
	);
}
