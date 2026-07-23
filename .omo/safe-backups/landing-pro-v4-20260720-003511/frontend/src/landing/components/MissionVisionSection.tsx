import { CheckCircle2, ShieldCheck } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export function MissionVisionSection() {
	return (
		<section
			id="mision-vision"
			data-landing-section
			aria-labelledby="mission-heading"
			className="bg-surface py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					id="mission-heading"
					eyebrow="Misión y visión"
					title="Una dirección institucional clara."
					description="El trabajo técnico se orienta por calidad, responsabilidad, respeto y comunicación directa."
					align="center"
				/>

				<div className="mt-10 grid gap-6 lg:grid-cols-2">
					<article className="rounded-[2.25rem] border border-hairline bg-canvas p-8 shadow-2">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal">
							Misión
						</p>
						<h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
							Acompañar cada servicio con orden y responsabilidad.
						</h3>
						<p className="mt-4 text-sm leading-7 text-charcoal">
							Acompañar requerimientos técnicos con planeación, comunicación y documentación de las
							actividades acordadas, cuidando a las personas y las condiciones del frente de
							trabajo.
						</p>
						<ul className="mt-6 grid gap-3 sm:grid-cols-2">
							{[
								"Alcance acordado",
								"Planeación previa",
								"Registro de actividades",
								"Respeto por las personas y la comunidad",
							].map((item) => (
								<li key={item} className="flex items-center gap-2 text-sm text-charcoal">
									<CheckCircle2 className="size-4 text-brand-annotate" aria-hidden="true" />
									{item}
								</li>
							))}
						</ul>
					</article>

					<article className="rounded-[2.25rem] border border-hairline bg-canvas p-8 shadow-2">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal">
							Visión
						</p>
						<h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
							Consolidar una operación técnica confiable y sostenible.
						</h3>
						<p className="mt-4 text-sm leading-7 text-charcoal">
							Cermont se proyecta como una organización que fortalece sus capacidades, aprende de
							cada servicio y mantiene una relación responsable con clientes, equipo y comunidad.
						</p>
						<div className="mt-8 rounded-3xl border border-hairline bg-surface p-5">
							<div className="flex items-center gap-3">
								<ShieldCheck className="size-5 text-brand-annotate" aria-hidden="true" />
								<p className="text-sm font-semibold uppercase tracking-[0.18em] text-charcoal">
									Compromiso operativo
								</p>
							</div>
							<p className="mt-4 text-sm leading-7 text-charcoal">
								Planeación, seguridad, evidencia y mejora continua en el trabajo diario.
							</p>
						</div>
					</article>
				</div>
			</div>
		</section>
	);
}
