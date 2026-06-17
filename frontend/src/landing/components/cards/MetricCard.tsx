import type { LandingMetric } from "../../landing-data";

export function MetricCard({ label, value, detail }: LandingMetric) {
	return (
		<article className="rounded-xl border border-hairline bg-canvas p-4 text-left shadow-1">
			<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate">{label}</p>
			<p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
			<p className="mt-2 text-xs leading-5 text-charcoal">{detail}</p>
		</article>
	);
}
