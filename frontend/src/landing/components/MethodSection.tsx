import { LANDING_WORKFLOW } from "../landing-data";
import { WorkflowCard } from "./cards/WorkflowCard";
import { SectionHeading } from "./SectionHeading";

export function MethodSection() {
	return (
		<section
			id="metodo"
			data-landing-section
			aria-labelledby="method-heading"
			className="bg-surface-page py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					eyebrow="Método"
					title="Un proceso sencillo, claro y documentado."
					description="La compañía trabaja con una secuencia que evita sorpresas: primero se valida el frente, luego se planifica, después se ejecuta y finalmente se entrega el cierre documentado."
				/>

				<div className="relative mt-10">
					<div
						className="absolute top-14 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] hidden h-0.5 lg:block"
						aria-hidden="true"
					>
						<div className="h-full w-full border-t-2 border-dashed border-border-strong" />
					</div>

					<div className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
						{LANDING_WORKFLOW.map((step) => (
							<WorkflowCard key={step.step} {...step} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
