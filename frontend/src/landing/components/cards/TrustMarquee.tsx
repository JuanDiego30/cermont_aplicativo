import { BadgePill } from "@/core/ui/BadgePill";
import { LANDING_METRICS, LANDING_TRUST_POINTS } from "../../landing-data";

export function TrustMarquee({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
	const items = [
		...LANDING_TRUST_POINTS.map((point) => point.title),
		...LANDING_METRICS.map((metric) => `${metric.label}: ${metric.value}`),
	];

	return (
		<div className="overflow-hidden rounded-[1.75rem] border border-border-default bg-surface-secondary p-4">
			<div
				className={
					shouldReduceMotion ? "flex flex-wrap gap-2" : "flex flex-wrap items-center gap-2"
				}
			>
				{items.map((item) => (
					<BadgePill
						key={item}
						className="border-border-default bg-surface-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary"
						dotClassName="bg-cermont-green"
						ariaLabel={item}
					>
						{item}
					</BadgePill>
				))}
			</div>
		</div>
	);
}
