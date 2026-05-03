import { CheckCircle2, ShieldCheck } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export function MissionVisionSection() {
	return (
		<section
			id="mision-vision"
			data-landing-section
			aria-labelledby="mission-heading"
			className="bg-surface-secondary py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					eyebrow="Misión y visión"
					title="Mision y vision institucional."
					description="Nuestro compromiso con la calidad, la seguridad y el desarrollo sostenible en Colombia."
					align="center"
				/>

				<div className="mt-10 grid gap-6 lg:grid-cols-2">
					<article className="rounded-[2.25rem] border border-border-default bg-surface-primary p-8 shadow-2">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-cermont-blue">
							Misión
						</p>
						<h3 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
							Prestar un servicio eficiente en todo el territorio nacional.
						</h3>
						<p className="mt-4 text-sm leading-7 text-text-secondary">
							Prestar en todo el territorio nacional un servicio eficiente, contando con un recurso
							humano altamente calificado, tecnologia de ultima generacion y los mejores equipos
							disponibles en el mercado, bajo los mas estrictos estandares de calidad, manejo
							ambiental y sobre todo respeto por sus trabajadores y la comunidad.
						</p>
						<ul className="mt-6 grid gap-3 sm:grid-cols-2">
							{[
								"Recurso humano calificado",
								"Tecnologia de ultima generacion",
								"Estandares de calidad y manejo ambiental",
								"Respeto por trabajadores y comunidad",
							].map((item) => (
								<li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
									<CheckCircle2 className="h-4 w-4 text-cermont-green" aria-hidden="true" />
									{item}
								</li>
							))}
						</ul>
					</article>

					<article className="rounded-[2.25rem] border border-border-default bg-surface-primary p-8 shadow-2">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-blue)]">
							Visión
						</p>
						<h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
							Empresa rentable y solida en continuo crecimiento.
						</h3>
						<p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
							Para el ano 2019, CERMONT S.A.S. sera una empresa rentable y solida en continuo
							crecimiento, con la mayor participacion en el mercado departamental por la idoneidad
							de su personal, tecnologia de ultima generacion, responsabilidad social, alto
							desempeno y compromiso con el desarrollo sostenible en Colombia.
						</p>
						<div className="mt-8 rounded-3xl border border-[var(--border-default)] bg-[var(--surface-secondary)] p-5">
							<div className="flex items-center gap-3">
								<ShieldCheck className="h-5 w-5 text-[var(--color-success)]" aria-hidden="true" />
								<p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
									Compromiso operativo
								</p>
							</div>
							<p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
								Idoneidad del personal, tecnologia de ultima generacion y responsabilidad social.
							</p>
						</div>
					</article>
				</div>
			</div>
		</section>
	);
}
