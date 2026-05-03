import { Building2, Sparkles } from "lucide-react";
import { LANDING_TRUST_POINTS } from "../landing-data";
import { PrincipleCard } from "./cards/PrincipleCard";
import { SectionHeading } from "./SectionHeading";

export function AboutSection() {
	return (
		<section
			id="nosotros"
			data-landing-section
			aria-labelledby="about-heading"
			className="bg-surface-secondary py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
					<article className="rounded-[2.25rem] border border-border-default bg-surface-primary p-8 shadow-2">
						<SectionHeading
							eyebrow="Quiénes somos"
							title="Una empresa joven con una meta clara."
							description="Cermont S.A.S es una empresa dedicada a las areas de electricidad, mantenimiento, refrigeracion, montajes, construccion, suministro de materiales electricos, alumbrado comercial e industrial y telecomunicaciones."
						/>

						<div className="mt-8 space-y-6">
							<p className="text-base leading-7 text-text-secondary">
								CERMONT S.A.S es una empresa joven, ubicada en la calle 21 No. 25-43, en el corazon
								de Arauca-Arauca, identificada con NIT 900.223.449-5 adscrita a la camara de
								comercio de la ciudad de Arauca y con una meta clara: la satisfaccion total de
								nuestros etica. Para ello hemos implementado altos estandares de calidad que
								permiten procesos confiables, con alto nivel de compromiso por parte de cada uno de
								nuestros directivos y empleados.
							</p>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="rounded-2xl border border-border-default bg-surface-secondary p-5">
									<div className="flex items-center gap-3">
										<Building2 className="h-5 w-5 text-cermont-blue" aria-hidden="true" />
										<h3 className="text-sm font-semibold text-text-primary">Base operativa</h3>
									</div>
									<p className="mt-3 text-sm leading-6 text-text-secondary">
										Sede principal en Arauca (Calle 21 No. 25-43) y oficina en Bogota (Calle 70A No.
										17-16). Atencion nacional con personal calificado.
									</p>
								</div>
								<div className="rounded-2xl border border-border-default bg-surface-secondary p-5">
									<div className="flex items-center gap-3">
										<Sparkles className="h-5 w-5 text-cermont-green" aria-hidden="true" />
										<h3 className="text-sm font-semibold text-text-primary">Enfoque</h3>
									</div>
									<p className="mt-3 text-sm leading-6 text-text-secondary">
										Respeto, lealtad, responsabilidad y transparencia como principios de nuestro
										codigo de clientes.
									</p>
								</div>
							</div>
						</div>
					</article>

					<div className="grid gap-4">
						{LANDING_TRUST_POINTS.map((point) => (
							<PrincipleCard key={point.title} {...point} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
