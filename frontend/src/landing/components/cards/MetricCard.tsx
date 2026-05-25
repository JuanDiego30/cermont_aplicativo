import type { LandingMetric } from "../../landing-data";

export function MetricCard({ label, value, detail }: LandingMetric) {
	return (
		<article className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 text-left shadow-[var(--shadow-1)]">
			<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
				{label}
			</p>
			<p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
			<p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{detail}</p>
		</article>
	);
}
