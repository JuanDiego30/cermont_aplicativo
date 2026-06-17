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
			className="bg-canvas py-20 sm:py-24 lg:py-32 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
					<article className="rounded-[2.5rem] border border-hairline bg-canvas p-8 lg:p-10 shadow-card">
						<SectionHeading
							eyebrow="Confianza"
							title="Principios que guían nuestra operación."
							description="Nuestro código de ética se fundamenta en el respeto, la lealtad, la responsabilidad y la transparencia en cada intervención."
						/>

						<div className="mt-10 grid gap-5 sm:grid-cols-3">
							{LANDING_TRUST_POINTS.map((point) => (
								<PrincipleCard key={point.title} {...point} />
							))}
						</div>
					</article>

					<article className="rounded-[2.5rem] border border-hairline bg-canvas p-8 lg:p-10 shadow-card flex flex-col">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate">
									Cobertura operativa
								</p>
								<p className="mt-2 text-xl font-semibold text-ink">
									Cinco líneas de servicio, una sola disciplina.
								</p>
							</div>
							<BadgePill
								className="bg-surface px-4 py-2 font-mono"
								dotClassName="bg-brand-annotate"
								ariaLabel="Rotación continua"
							>
								Rotación continua
							</BadgePill>
						</div>

						<div className="mt-8 flex-1">
							<TrustMarquee shouldReduceMotion={shouldReduceMotion} />
						</div>

						<div className="mt-8 grid gap-4 sm:grid-cols-3">
							{LANDING_METRICS.map((metric) => (
								<article
									key={metric.label}
									className="rounded-2xl border border-hairline bg-surface p-5 transition-all hover:bg-canvas hover:shadow-sm"
								>
									<p className="text-[10px] font-bold uppercase tracking-wider text-slate">
										{metric.label}
									</p>
									<p className="mt-4 text-3xl font-semibold text-ink tracking-tight">
										{metric.value}
									</p>
									<p className="mt-2 text-[11px] leading-relaxed text-charcoal">{metric.detail}</p>
								</article>
							))}
						</div>
					</article>
				</div>
			</div>
		</section>
	);
}
