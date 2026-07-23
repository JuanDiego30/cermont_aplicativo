import { LANDING_SERVICES } from "../landing-data";
import { ServiceCard } from "./cards/ServiceCard";
import { SectionHeading } from "./SectionHeading";

export function ServicesSection() {
	return (
		<section
			id="servicios"
			data-landing-section
			aria-labelledby="services-heading"
			className="border-y border-hairline bg-canvas py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					id="services-heading"
					eyebrow="Servicios"
					title="Ocho líneas de servicio para acompañar cada requerimiento."
					description="Electricidad, mantenimiento, montajes, refrigeración, construcción civil, suministro eléctrico, alumbrado y telecomunicaciones."
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
