import { ArrowRight } from "lucide-react";
import type { LandingResource } from "../../landing-data";

export function ResourceCard({ title, description, href, meta }: LandingResource) {
	return (
		<article className="group rounded-xl border border-hairline bg-canvas p-6 shadow-2 transition-transform duration-200 hover:-translate-y-0.5">
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate">{meta}</p>
					<h3 className="mt-2 text-xl font-semibold text-ink">{title}</h3>
				</div>
				<span className="rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-charcoal">
					Acceso
				</span>
			</div>

			<p className="mt-4 text-sm leading-6 text-charcoal">{description}</p>

			<div className="mt-5">
				<a
					href={href}
					className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-charcoal transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/50 motion-reduce:transition-none"
				>
					Abrir recurso
					<ArrowRight className="size-4 text-charcoal" aria-hidden="true" />
				</a>
			</div>
		</article>
	);
}
