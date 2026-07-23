import { LANDING_FEATURES, type LandingTone } from "../landing-data";

const TONE_CLASSES: Record<LandingTone, string> = {
	brand: "bg-brand-green/10 text-brand-green",
	info: "bg-info-bg text-info",
	success: "bg-success-bg text-success",
	warning: "bg-warning-bg text-warning",
	purple: "bg-info-bg text-info",
	neutral: "bg-surface text-ink",
	danger: "bg-danger-bg text-danger",
};

export function FeaturesSection() {
	return (
		<section
			data-landing-section
			aria-labelledby="features-title"
			className="mx-auto max-w-7xl px-6 py-20 lg:px-8"
		>
			<div className="mx-auto max-w-2xl text-center">
				<h2 id="features-title" className="text-3xl font-semibold tracking-tight text-ink">
					Lo que nos define como empresa
				</h2>
				<p className="mt-4 text-lg text-charcoal">
					Principios y herramientas que conectan el trabajo en campo con la información de cierre.
				</p>
			</div>

			<ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{LANDING_FEATURES.map((feature) => {
					const Icon = feature.icon;
					return (
						<li
							key={feature.title}
							className="motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
						>
							<article className="flex h-full flex-col rounded-2xl border border-hairline bg-canvas p-6 shadow-1 transition-shadow hover:shadow-2 motion-reduce:transition-none">
								<div
									className={`flex size-12 items-center justify-center rounded-xl ${TONE_CLASSES[feature.tone]}`}
								>
									<Icon className="size-6" aria-hidden="true" />
								</div>
								<h3 className="mt-4 text-lg font-semibold text-ink">{feature.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-charcoal">{feature.description}</p>
							</article>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
