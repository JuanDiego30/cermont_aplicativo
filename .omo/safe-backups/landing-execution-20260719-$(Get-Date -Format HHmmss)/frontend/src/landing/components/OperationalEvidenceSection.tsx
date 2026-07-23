import Image from "next/image";
import { SectionHeading } from "./SectionHeading";

const EVIDENCE_ITEMS = [
	{
		id: "field",
		src: "/images/optimized/landing/chatgpt-image-25-may-2026-22-58-49-1-1280.webp",
		alt: "Tecnicos de Cermont documentando ejecucion en campo con herramientas y equipos de seguridad",
		caption: "Ejecucion documentada en campo con checklist y registro fotografico",
	},
	{
		id: "planning",
		src: "/images/optimized/landing/chatgpt-image-25-may-2026-22-58-50-2-1280.webp",
		alt: "Planeacion operativa de Cermont con herramientas, equipos y elementos de seguridad",
		caption: "Planeacion de recursos, herramientas y elementos de proteccion",
	},
	{
		id: "evidence",
		src: "/images/optimized/landing/chatgpt-image-25-may-2026-22-58-50-3-1280.webp",
		alt: "Evidencias tecnicas y documentos de Cermont organizados por orden de trabajo",
		caption: "Evidencias y soportes tecnicos asociados a cada orden",
	},
] as const;

export function OperationalEvidenceSection() {
	return (
		<section
			data-landing-section
			aria-labelledby="evidence-heading"
			className="bg-[var(--surface-secondary)] py-16 sm:py-20 lg:py-24"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					eyebrow="Evidencia operativa"
					title="Asi ejecutamos y documentamos cada servicio."
					description="Planeacion, ejecucion y registro fotografico de cada actividad, vinculados a la orden de trabajo correspondiente."
					align="center"
				/>

				<div className="mt-10 grid gap-6 sm:grid-cols-3">
					{EVIDENCE_ITEMS.map((item) => (
						<figure
							key={item.id}
							className="overflow-hidden rounded-2xl border border-hairline bg-canvas"
						>
							<div className="relative aspect-[4/3]">
								<Image
									src={item.src}
									alt={item.alt}
									fill
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									className="object-cover"
								/>
							</div>
							<figcaption className="px-4 py-3">
								<p className="text-sm font-medium text-ink">{item.caption}</p>
							</figcaption>
						</figure>
					))}
				</div>
			</div>
		</section>
	);
}
