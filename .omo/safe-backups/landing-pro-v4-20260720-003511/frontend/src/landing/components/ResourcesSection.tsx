import { LANDING_COMMITMENTS, LANDING_RESOURCES } from "../landing-data";
import { CommitmentCard } from "./cards/CertificationCard";
import { ResourceCard } from "./cards/ResourceCard";
import { SectionHeading } from "./SectionHeading";

export function ResourcesSection() {
	return (
		<section
			id="recursos"
			data-landing-section
			aria-labelledby="resources-heading"
			className="relative overflow-hidden bg-canvas-dark py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -left-24 top-10 size-72 rounded-full bg-white/5 blur-3xl" />
				<div className="absolute right-0 bottom-0 size-80 rounded-full bg-brand-annotate/10 blur-3xl" />
			</div>

			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					id="resources-heading"
					eyebrow="Recursos"
					title="Canales públicos y compromisos de trabajo."
					description="Encuentre contacto directo, acceso privado, información legal y los principios que orientan la relación de servicio."
					inverse
				/>

				<div className="mt-10 grid gap-6 lg:grid-cols-2">
					{LANDING_RESOURCES.map((resource) => (
						<ResourceCard key={resource.title} {...resource} />
					))}
				</div>

				<div className="mt-10 grid gap-4 sm:grid-cols-3">
					{LANDING_COMMITMENTS.map((commitment) => (
						<CommitmentCard key={commitment.title} {...commitment} />
					))}
				</div>
			</div>
		</section>
	);
}
