import { BadgePill } from "@/core/ui/BadgePill";
import type { LandingCertification } from "../../landing-data";

export function CertificationCard({ title, description, badge }: LandingCertification) {
	return (
		<article className="rounded-2xl border border-border-default bg-surface-primary p-5 shadow-1">
			<BadgePill
				className="border-border-default bg-surface-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary"
				dotClassName="bg-cermont-green"
				ariaLabel={badge}
			>
				{badge}
			</BadgePill>
			<h3 className="mt-4 text-base font-semibold text-text-primary">{title}</h3>
			<p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
		</article>
	);
}
