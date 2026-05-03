import { BadgePill } from "@/core/ui/BadgePill";
import { LANDING_METRICS, LANDING_TRUST_POINTS } from "../landing-data";
import { PrincipleCard } from "./cards/PrincipleCard";
import { TrustMarquee } from "./cards/TrustMarquee";
import { SectionHeading } from "./SectionHeading";

export function TrustSection({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
	return (
		<section
			data-landing-section
			aria-labelledby="trust-heading"
			className="bg-surface-page py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
					<article className="rounded-[2.25rem] border border-border-default bg-surface-primary p-8 shadow-2">
						<SectionHeading
							eyebrow="Confianza"
							title="Principios que guian nuestra operacion."
							description="Nuestro codigo de etica se fundamenta en el respeto, la lealtad, la responsabilidad y la transparencia."
						/>

						<div className="mt-8 grid gap-4 sm:grid-cols-3">
							{LANDING_TRUST_POINTS.map((point) => (
								<PrincipleCard key={point.title} {...point} />
							))}
						</div>
					</article>

					<article className="rounded-[2.25rem] border border-border-default bg-surface-primary p-6 shadow-2">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-text-tertiary">
									Cobertura operativa
								</p>
								<p className="mt-2 text-lg font-semibold text-text-primary">
									Cinco lineas de servicio, misma disciplina de entrega.
								</p>
							</div>
							<BadgePill
								className="border-border-default bg-surface-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary"
								dotClassName="bg-cermont-green"
								ariaLabel="Rotación continua"
							>
								Rotación continua
							</BadgePill>
						</div>

						<div className="mt-5">
							<TrustMarquee shouldReduceMotion={shouldReduceMotion} />
						</div>

						<div className="mt-5 grid gap-3 sm:grid-cols-3">
							{LANDING_METRICS.map((metric) => (
								<article
									key={metric.label}
									className="rounded-2xl border border-border-default bg-surface-secondary p-4"
								>
									<p className="text-[10px] uppercase tracking-[0.24em] text-text-tertiary">
										{metric.label}
									</p>
									<p className="mt-3 text-3xl font-semibold text-text-primary">{metric.value}</p>
									<p className="mt-2 text-xs leading-5 text-text-secondary">{metric.detail}</p>
								</article>
							))}
						</div>
					</article>
				</div>
			</div>
		</section>
	);
}
