import { BadgePill } from "@/core/ui/BadgePill";
import { LANDING_METRICS, LANDING_TRUST_POINTS } from "../../landing-data";

export function TrustMarquee({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
	const items = [
		...LANDING_TRUST_POINTS.map((point) => point.title),
		...LANDING_METRICS.map((metric) => `${metric.label}: ${metric.value}`),
	];

	return (
		<div className="overflow-hidden rounded-[1.75rem] border border-hairline bg-surface p-4">
			<div
				className={
					shouldReduceMotion ? "flex flex-wrap gap-2" : "flex flex-wrap items-center gap-2"
				}
			>
				{items.map((item) => (
					<BadgePill
						key={item}
						className="border-hairline bg-canvas px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal"
						dotClassName="bg-brand-annotate"
						ariaLabel={item}
					>
						{item}
					</BadgePill>
				))}
			</div>
		</div>
	);
}
