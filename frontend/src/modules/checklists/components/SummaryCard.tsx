import { cn } from "@/lib/utils";

const toneClasses = {
	default:
		"border-hairline bg-surface text-ink dark:border-zinc-800 dark:bg-canvas dark:text-white",
	warning:
		"border-amber-200 bg-warning-bg text-brand-warn dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-brand-warn",
	success:
		"border-emerald-200 bg-emerald-50 text-brand-annotate dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-brand-annotate",
} as const;

export function SummaryCard({
	label,
	value,
	tone = "default",
}: {
	label: string;
	value: string;
	tone?: "default" | "warning" | "success";
}) {
	return (
		<div className={cn("rounded-2xl border px-4 py-3", toneClasses[tone])}>
			<dt className="text-xs font-medium uppercase tracking-[0.16em] opacity-70">{label}</dt>
			<dd className="mt-1 text-2xl font-black tracking-tight">{value}</dd>
		</div>
	);
}
