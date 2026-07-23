import Link from "next/link";
import { Button } from "@/core/ui/Button";

export function CtaSection() {
	return (
		<section
			data-landing-section
			aria-labelledby="cta-title"
			className="relative overflow-hidden bg-canvas py-20 lg:py-32"
		>
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in srgb,var(--color-brand-green)_6%,transparent),transparent_70%)] opacity-40" />

			<div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center lg:px-8">
				<h2
					id="cta-title"
					className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl leading-tight"
				>
					¿Listo para documentar su próximo servicio?
				</h2>
				<p className="max-w-2xl text-lg text-charcoal leading-relaxed">
					Reciba una propuesta con planeación, ejecución y soportes documentales incluidos.
					Sin compromiso.
				</p>
				<div className="mt-4 flex flex-wrap items-center justify-center gap-5">
					<Button
						asChild
						size="lg"
						variant="primary"
						className="px-10 py-7 text-base rounded-full shadow-lg"
					>
						<Link href="#contacto">Solicitar información</Link>
					</Button>
					<Button
						asChild
						size="lg"
						variant="secondary"
						className="px-10 py-7 text-base rounded-full"
					>
						<Link href="#servicios">Ver servicios</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
