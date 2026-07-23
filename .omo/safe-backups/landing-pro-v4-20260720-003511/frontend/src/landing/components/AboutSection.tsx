import { Globe, HardHat } from "lucide-react";
import {
	CORPORATE_ADDRESS_ARAUCA,
	CORPORATE_ADDRESS_BOGOTA,
	CORPORATE_EMAIL,
} from "../landing-constants";
import { SectionHeading } from "./SectionHeading";

export function AboutSection() {
	return (
		<section
			id="nosotros"
			data-landing-section
			aria-labelledby="about-heading"
			className="bg-surface py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
					<article className="rounded-[2.25rem] border border-hairline bg-canvas p-8 lg:p-10 shadow-2">
						<SectionHeading
							id="about-heading"
							eyebrow="Quiénes somos"
							title="Servicios técnicos con origen en Arauca."
							description="Cermont S.A.S. desarrolla servicios de ingeniería eléctrica, mantenimiento, montajes, refrigeración, construcción civil, suministro eléctrico, alumbrado y telecomunicaciones."
						/>

						<div className="mt-8 space-y-6">
							<p className="text-base leading-7 text-charcoal">
								Cermont mantiene una sede en Arauca y una oficina en Bogotá. La conversación inicial
								permite precisar el alcance, las condiciones del frente y los entregables del
								servicio.
							</p>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="rounded-2xl border border-hairline bg-surface p-5">
									<div className="flex items-center gap-3">
										<Globe className="size-5 text-charcoal" aria-hidden="true" />
										<h3 className="text-sm font-semibold text-ink">Ubicación</h3>
									</div>
									<p className="mt-3 text-sm leading-6 text-charcoal">
										{CORPORATE_ADDRESS_ARAUCA}. También contamos con oficina en Bogotá.
									</p>
								</div>
								<div className="rounded-2xl border border-hairline bg-surface p-5">
									<div className="flex items-center gap-3">
										<HardHat className="size-5 text-charcoal" aria-hidden="true" />
										<h3 className="text-sm font-semibold text-ink">Forma de trabajo</h3>
									</div>
									<p className="mt-3 text-sm leading-6 text-charcoal">
										Planeación, comunicación directa y documentos de cierre según el alcance
										contratado.
									</p>
								</div>
							</div>
						</div>
					</article>

					<article className="rounded-[2.25rem] border border-hairline bg-canvas p-8 lg:p-10 shadow-2 flex flex-col justify-center">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal">
							Canales de referencia
						</p>
						<div className="mt-6 space-y-4">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate">Arauca</p>
								<p className="text-lg font-semibold text-ink">{CORPORATE_ADDRESS_ARAUCA}</p>
							</div>
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate">Bogotá</p>
								<p className="text-lg font-semibold text-ink">{CORPORATE_ADDRESS_BOGOTA}</p>
							</div>
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate">Correo</p>
								<a
									href={`mailto:${CORPORATE_EMAIL}`}
									className="text-lg font-semibold text-ink underline-offset-4 hover:underline"
								>
									{CORPORATE_EMAIL}
								</a>
							</div>
						</div>
					</article>
				</div>
			</div>
		</section>
	);
}
