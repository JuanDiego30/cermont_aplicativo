import React from "react";
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
			className="relative overflow-hidden bg-canvas-dark py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -left-24 top-10 size-72 rounded-full bg-white/5 blur-3xl" />
				<div className="absolute right-0 bottom-0 size-80 rounded-full bg-brand-annotate/10 blur-3xl" />
			</div>

			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					eyebrow="Recursos"
					title="Canales de servicio y certificaciones."
					description="Acceda a nuestro portal de seguimiento, solicite una cotizacion o conozca nuestras certificaciones en seguridad y calidad."
					inverse
				/>

				<div className="mt-10 grid gap-6 lg:grid-cols-2">
					{LANDING_RESOURCES.map((resource) => (
						<React.Fragment key={resource.title}>
							<ResourceCard {...resource} />
						</React.Fragment>
					))}
				</div>

				<div className="mt-10 grid gap-4 sm:grid-cols-3">
					{LANDING_CERTIFICATIONS.map((certification) => (
						<React.Fragment key={certification.title}>
							<CertificationCard {...certification} />
						</React.Fragment>
					))}
				</div>
			</div>
		</section>
	);
}
