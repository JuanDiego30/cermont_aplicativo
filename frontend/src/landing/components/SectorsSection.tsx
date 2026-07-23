import { LANDING_SECTORS } from "../landing-data";
import { SectionHeading } from "./SectionHeading";

export function SectorsSection() {
	return (
		<section id="sectores" data-landing-section aria-labelledby="sectors-heading"
			className="bg-surface py-16 sm:py-20 lg:py-24 scroll-mt-28">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading id="sectors-heading" eyebrow="Sectores"
					title="Industrias que confían en nuestra operación."
					description="Acompañamos requerimientos técnicos en múltiples sectores."
					align="center" />
				<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{LANDING_SECTORS.map((sector) => {
						const Icon = sector.icon;
						return (
							<article key={sector.title}
								className="rounded-2xl border border-hairline bg-canvas p-6 shadow-1 transition-shadow hover:shadow-2">
								<div className="flex size-12 items-center justify-center rounded-xl bg-brand-green/10">
									<Icon className="size-6 text-brand-green" aria-hidden="true" />
								</div>
								<h3 className="mt-4 text-lg font-semibold text-ink">{sector.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-charcoal">{sector.description}</p>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
