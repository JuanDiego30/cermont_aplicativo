import { LANDING_CERTIFICATIONS, LANDING_RESOURCES } from "../landing-data";
import { CertificationCard } from "./cards/CertificationCard";
import { ResourceCard } from "./cards/ResourceCard";
import { SectionHeading } from "./SectionHeading";

export function ResourcesSection() {
	return (
		<section
			id="recursos"
			data-landing-section
			aria-labelledby="resources-heading"
			className="relative overflow-hidden bg-cermont-navy py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cermont-blue-light/12 blur-3xl" />
				<div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cermont-green-light/10 blur-3xl" />
			</div>

			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					eyebrow="Documentos"
					title="Soportes y descargas listas para auditoría."
					description="Material de apoyo, formatos y controles que acompañan la coordinación operativa y el cierre documental de cada servicio."
					inverse
				/>

				<div className="mt-10 grid gap-6 lg:grid-cols-2">
					{LANDING_RESOURCES.map((resource) => (
						<ResourceCard key={resource.title} {...resource} />
					))}
				</div>

				<div className="mt-10 grid gap-4 sm:grid-cols-3">
					{LANDING_CERTIFICATIONS.map((certification) => (
						<CertificationCard key={certification.title} {...certification} />
					))}
				</div>
			</div>
		</section>
	);
}
