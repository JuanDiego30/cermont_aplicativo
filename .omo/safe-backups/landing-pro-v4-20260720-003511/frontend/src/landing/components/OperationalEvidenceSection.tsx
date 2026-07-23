import Image from "next/image";
import { LANDING_VISUAL_ASSETS } from "../landing-data";
import { SectionHeading } from "./SectionHeading";

export function OperationalEvidenceSection() {
	return (
		<section
			data-landing-section
			aria-labelledby="evidence-heading"
			className="bg-surface-secondary py-16 sm:py-20 lg:py-24"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					id="evidence-heading"
					eyebrow="Contexto visual"
					title="El trabajo técnico ocurre en el campo."
					description="Estas imágenes ayudan a contextualizar la oferta pública. No son evidencia de servicios, clientes o resultados específicos de Cermont."
					align="center"
				/>

				<div className="mt-10 grid gap-6 sm:grid-cols-2">
					{LANDING_VISUAL_ASSETS.slice(1).map((item) => (
						<figure
							key={item.id}
							className="overflow-hidden rounded-2xl border border-hairline bg-canvas"
						>
							<div className="relative aspect-[4/3]">
								<Image
									src={item.src}
									alt={item.alt}
									fill
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
									className="object-cover"
								/>
							</div>
							<figcaption className="px-4 py-3">
								<p className="text-sm font-medium text-ink">{item.caption}</p>
								<p className="mt-1 text-xs leading-5 text-charcoal">{item.disclosure}</p>
							</figcaption>
						</figure>
					))}
				</div>
			</div>
		</section>
	);
}
