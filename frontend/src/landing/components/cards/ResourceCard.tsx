import { ArrowRight } from "lucide-react";
import type { LandingResource } from "../../landing-data";

export function ResourceCard({ title, description, href, meta }: LandingResource) {
	return (
		<article className="group rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)] transition-transform duration-200 hover:-translate-y-0.5">
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
						{meta}
					</p>
					<h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{title}</h3>
				</div>
				<span className="rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
					Descarga
				</span>
			</div>

			<p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>

			<div className="mt-5">
				<a
					href={href}
					className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-blue)] transition-colors group-hover:text-[var(--color-brand-blue-hover)]"
				>
					Abrir recurso
					<ArrowRight className="h-4 w-4" aria-hidden="true" />
				</a>
			</div>
		</article>
	);
}
