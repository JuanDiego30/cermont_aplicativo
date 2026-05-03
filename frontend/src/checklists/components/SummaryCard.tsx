import { cn } from "@/_shared/lib/utils";

export function SummaryCard({
	label,
	value,
	tone = "default",
}: {
	label: string;
	value: string;
	tone?: "default" | "warning" | "success";
}) {
	const toneClasses = {
		default:
			"border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white",
		warning:
			"border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-200",
		success:
			"border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-200",
	} as const;

	return (
		<div className={cn("rounded-2xl border px-4 py-3", toneClasses[tone])}>
			<dt className="text-xs font-medium uppercase tracking-[0.16em] opacity-70">{label}</dt>
			<dd className="mt-1 text-2xl font-black tracking-tight">{value}</dd>
		</div>
	);
}
