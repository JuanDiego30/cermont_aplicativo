import { BadgePill } from "@/core/ui/BadgePill";
import { LANDING_WORKFLOW } from "../landing-data";
import { SectionHeading } from "./SectionHeading";

export function MethodSection() {
	return (
		<section
			id="metodo"
			data-landing-section
			aria-labelledby="method-heading"
			className="bg-canvas py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					id="method-heading"
					eyebrow="Método"
					title="Del requerimiento al cierre documentado."
					description="Cada servicio recorre una secuencia controlada: diagnóstico, planeación, ejecución y entrega formal de soportes."
				/>

				<div className="relative mt-10">
					<div className="grid gap-6 lg:grid-cols-5 lg:gap-4">
						{LANDING_WORKFLOW.map((s, i) => {
							const Icon = s.icon;
							return (
								<div key={s.step} className="relative flex flex-col items-center text-center">
									<div className="flex size-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
										<Icon className="size-6" aria-hidden="true" />
									</div>
									<BadgePill
										className="mt-3 bg-surface px-3 py-1 font-mono text-[11px]"
										dotClassName="bg-brand-annotate"
										ariaLabel={`Paso ${s.step}`}
									>
										Paso {s.step}
									</BadgePill>
									<h3 className="mt-3 text-sm font-semibold text-ink">{s.title}</h3>
									<p className="mt-2 text-xs leading-relaxed text-charcoal">{s.description}</p>
									{i < LANDING_WORKFLOW.length - 1 && (
										<>
											<div
												className="mt-4 h-6 w-0.5 bg-hairline lg:hidden"
												aria-hidden="true"
											/>
											<div
												className="mt-4 hidden h-0.5 w-8 bg-hairline lg:block"
												aria-hidden="true"
											/>
										</>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
