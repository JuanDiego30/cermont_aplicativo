import { LANDING_FEATURES, LANDING_SERVICES, LANDING_TRUST_POINTS } from "../landing-data";
import type { LandingTone } from "../landing-data";
import { PrincipleCard } from "./cards/PrincipleCard";
import { SectionHeading } from "./SectionHeading";

const DIFF_TONE_CLASSES: Record<LandingTone, string> = {
	brand: "bg-brand-green/10 text-brand-green",
	info: "bg-brand-annotate/10 text-brand-annotate",
	success: "bg-success-bg text-success",
	warning: "bg-warning-bg text-warning",
	purple: "bg-info-bg text-info",
	neutral: "bg-surface text-charcoal",
	danger: "bg-danger-bg text-danger",
};

export function TrustSection() {
	return (
		<section
			data-landing-section
			aria-labelledby="trust-heading"
			className="bg-canvas py-20 sm:py-24 lg:py-32 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
					<article className="rounded-[2.5rem] border border-hairline bg-canvas p-8 lg:p-10 shadow-card">
						<SectionHeading
							id="trust-heading"
							eyebrow="Confianza"
							title="Principios que guían nuestra operación."
							description="Nuestro código de ética se fundamenta en el respeto, la lealtad, la responsabilidad y la transparencia en cada intervención."
						/>

						<div className="mt-10 grid gap-5 sm:grid-cols-2">
							{LANDING_TRUST_POINTS.map((point) => (
								<PrincipleCard key={point.title} {...point} />
							))}
						</div>
					</article>

					<article className="rounded-[2.5rem] border border-hairline bg-canvas p-8 shadow-card lg:p-10">
						<SectionHeading
							eyebrow="Capacidad publicada"
							title="Ocho líneas para resolver necesidades técnicas distintas."
							description="La oferta pública reúne servicios complementarios; el alcance final se define con cada requerimiento."
						/>
						<ul className="mt-8 grid gap-3 sm:grid-cols-2">
							{LANDING_SERVICES.map((service) => (
								<li
									key={service.title}
									className="flex items-start gap-3 rounded-2xl border border-hairline bg-surface p-4 text-sm font-semibold text-ink"
								>
									<span
										className="mt-1 size-2 shrink-0 rounded-full bg-brand-annotate"
										aria-hidden="true"
									/>
									{service.title}
								</li>
							))}
						</ul>
					</article>
				</div>

				<div className="mt-16">
					<SectionHeading
						eyebrow="Diferenciales operativos"
						title="Cómo conectamos el trabajo con la información de cierre."
						description="Cada servicio se apoya en herramientas que mantienen la trazabilidad desde el alcance hasta el documento final."
					/>
					<ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{LANDING_FEATURES.map((feature) => {
							const Icon = feature.icon;
							return (
								<li
									key={feature.title}
									className="motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
								>
									<article className="flex h-full flex-col rounded-2xl border border-hairline bg-canvas p-6 shadow-1 transition-shadow hover:shadow-2 motion-reduce:transition-none">
										<div
											className={`flex size-12 items-center justify-center rounded-xl ${DIFF_TONE_CLASSES[feature.tone]}`}
										>
											<Icon className="size-6" aria-hidden="true" />
										</div>
										<h3 className="mt-4 text-lg font-semibold text-ink">{feature.title}</h3>
										<p className="mt-2 text-sm leading-relaxed text-charcoal">
											{feature.description}
										</p>
									</article>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		</section>
	);
}
