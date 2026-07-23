import { Globe, HardHat } from "lucide-react";
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
							eyebrow="Quiénes somos"
							title="Una empresa joven con una meta clara."
							description="Cermont S.A.S es una empresa dedicada a electricidad, mantenimiento, refrigeracion, montajes, construccion y telecomunicaciones."
						/>

						<div className="mt-8 space-y-6">
							<p className="text-base leading-7 text-charcoal">
								CERMONT S.A.S esta ubicada en Arauca (Calle 21 No. 25-43), identificada con NIT
								900.223.449-5. Contamos con oficina en Bogota (Calle 70A No. 17-16) y atendemos
								proyectos a nivel nacional con personal calificado y altos estandares de calidad.
							</p>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="rounded-2xl border border-hairline bg-surface p-5">
									<div className="flex items-center gap-3">
										<Globe className="size-5 text-charcoal" aria-hidden="true" />
										<h3 className="text-sm font-semibold text-ink">Cobertura</h3>
									</div>
									<p className="mt-3 text-sm leading-6 text-charcoal">
										Sede Arauca y oficina Bogota. Ejecutamos servicios en todo el territorio nacional.
									</p>
								</div>
								<div className="rounded-2xl border border-hairline bg-surface p-5">
									<div className="flex items-center gap-3">
										<HardHat className="size-5 text-charcoal" aria-hidden="true" />
										<h3 className="text-sm font-semibold text-ink">SG-SSTA</h3>
									</div>
									<p className="mt-3 text-sm leading-6 text-charcoal">
										Sistema de gestion de seguridad, salud en el trabajo y ambiente integrado a
										nuestra operacion.
									</p>
								</div>
							</div>
						</div>
					</article>

					<article className="rounded-[2.25rem] border border-hairline bg-canvas p-8 lg:p-10 shadow-2 flex flex-col justify-center">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal">
							Datos corporativos
						</p>
						<div className="mt-6 space-y-4">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate">NIT</p>
								<p className="text-lg font-semibold text-ink">900.223.449-5</p>
							</div>
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate">
									Camara de comercio
								</p>
								<p className="text-lg font-semibold text-ink">Arauca</p>
							</div>
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate">
									Correo corporativo
								</p>
								<p className="text-lg font-semibold text-ink">Gerencia@cermont.co</p>
							</div>
						</div>
					</article>
				</div>
			</div>
		</section>
	);
}
