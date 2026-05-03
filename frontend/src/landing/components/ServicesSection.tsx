import { LANDING_SERVICES } from "../landing-data";
import { ServiceCard } from "./cards/ServiceCard";
import { SectionHeading } from "./SectionHeading";

export function ServicesSection() {
	return (
		<section
			id="servicios"
			data-landing-section
			aria-labelledby="services-heading"
			className="border-y border-border-default bg-surface-page py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					eyebrow="Servicios"
					title="Cinco lineas de servicio para acompanar la operacion de principio a fin."
					description="Construccion, electricidad, refrigeracion, telecomunicaciones y montajes con trazabilidad y seguridad industrial."
				/>

				<div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{LANDING_SERVICES.map((service) => (
						<ServiceCard key={service.title} {...service} />
					))}
				</div>
			</div>
		</section>
	);
}
