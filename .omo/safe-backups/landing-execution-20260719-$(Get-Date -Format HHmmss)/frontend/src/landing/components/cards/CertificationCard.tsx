import { BadgePill } from "@/core/ui/BadgePill";
import type { LandingCertification } from "../../landing-data";

export function CertificationCard({ title, description, badge }: LandingCertification) {
	return (
		<article className="rounded-2xl border border-hairline bg-canvas p-5 shadow-1">
			<BadgePill
				className="border-hairline bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal"
				dotClassName="bg-brand-annotate"
				ariaLabel={badge}
			>
				{badge}
			</BadgePill>
			<h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
			<p className="mt-2 text-sm leading-6 text-charcoal">{description}</p>
		</article>
	);
}
