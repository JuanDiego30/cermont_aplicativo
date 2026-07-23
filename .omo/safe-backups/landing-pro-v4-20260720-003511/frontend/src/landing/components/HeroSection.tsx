import { ArrowRight, FileText } from "lucide-react";
import Image from "next/image";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";
import { LANDING_VISUAL_ASSETS } from "../landing-data";

export function HeroSection() {
	const heroVisual = LANDING_VISUAL_ASSETS[0];
	return (
		<section
			id="inicio"
			className="relative scroll-mt-28 overflow-hidden bg-canvas pt-12 pb-20 lg:pt-20 lg:pb-32"
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -left-20 top-0 size-[500px] rounded-full bg-brand-green/5 blur-[100px]" />
				<div className="absolute -right-20 top-20 size-[600px] rounded-full bg-brand-annotate/10 blur-[120px]" />
				<div className="absolute bottom-0 left-1/4 size-[400px] rounded-full bg-white/5 blur-[80px]" />
				<div className="absolute inset-0 bg-[linear-gradient(var(--color-hairline)_1px,transparent_1px),linear-gradient(90deg,var(--color-hairline)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-20" />
			</div>

			<div className="relative mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
				<div data-hero-copy className="max-w-3xl">
					<BadgePill
						className="px-3.5 py-1.5 font-mono text-[11px]"
						dotClassName="bg-brand-annotate"
						ariaLabel="SERVICIOS TÉCNICOS E INDUSTRIALES"
					>
						Servicios técnicos e industriales
					</BadgePill>

					<h1 className="mt-8 text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl xl:text-7xl">
						Ingeniería que documenta
						<span className="text-brand-annotate"> cada paso del servicio.</span>
					</h1>

					<p className="mt-8 max-w-2xl text-lg leading-relaxed text-charcoal sm:text-xl">
						Cermont S.A.S. integra la ejecución técnica con la trazabilidad documental:
						planeación, registro, informe y cierre en una misma línea de servicio.
					</p>

					<div className="mt-10 flex flex-wrap items-center gap-4">
						<Button asChild size="lg" variant="primary" className="px-8 py-6 text-base">
							<a href="#contacto">
								Solicitar información
								<ArrowRight className="size-5 ml-1" aria-hidden="true" />
							</a>
						</Button>
						<Button asChild size="lg" variant="secondary" className="px-8 py-6 text-base">
							<a href="#servicios">Ver servicios</a>
						</Button>
					</div>
				</div>

				<aside className="relative lg:block">
					<figure className="overflow-hidden rounded-[2.5rem] border border-hairline bg-canvas p-4 shadow-2xl shadow-black/[0.05] dark:shadow-black/20 sm:p-6">
						<div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-surface">
							<Image
								src={heroVisual.src}
								alt={heroVisual.alt}
								fill
								priority
								sizes="(max-width: 1023px) 100vw, 42vw"
								className="object-cover transition-transform duration-700 motion-safe:hover:scale-[1.03] motion-reduce:transition-none"
							/>
							<div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-black/55 p-4 text-white backdrop-blur-sm">
								<div className="flex items-start gap-3">
									<FileText
										className="mt-0.5 size-5 shrink-0 text-brand-annotate"
										aria-hidden="true"
									/>
									<div>
										<p className="text-sm font-semibold">Del alcance al cierre</p>
										<p className="mt-1 text-xs leading-5 text-white/80">
											Información clara para acompañar el trabajo técnico.
										</p>
									</div>
								</div>
							</div>
						</div>
						<figcaption className="px-2 pt-4 text-sm text-charcoal">
							<p className="font-semibold text-ink">{heroVisual.caption}</p>
							<p className="mt-1 text-xs leading-5">{heroVisual.disclosure}</p>
						</figcaption>
					</figure>
				</aside>
			</div>
		</section>
	);
}
