import { ArrowRight, ShieldCheck } from "lucide-react";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";
import { Logo } from "@/core/ui/Logo";
import { CORPORATE_LOCATION } from "../landing-constants";
import { LANDING_METRICS, LANDING_SERVICES } from "../landing-data";
import { MetricCard } from "./cards/MetricCard";
import { LandingHeroCarousel } from "./LandingHeroCarousel";

export function HeroSection() {
	return (
		<section className="relative overflow-hidden bg-canvas pt-12 pb-20 lg:pt-20 lg:pb-32">
			{/* Atmospheric Background Gradients — neutral/green tones, no blue-tinted blobs */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div
					data-hero-blob="one"
					className="absolute -left-20 top-0 size-[500px] rounded-full bg-brand-green/5 blur-[100px]"
				/>
				<div
					data-hero-blob="two"
					className="absolute -right-20 top-20 size-[600px] rounded-full bg-brand-annotate/10 blur-[120px]"
				/>
				<div
					data-hero-blob="three"
					className="absolute bottom-0 left-1/4 size-[400px] rounded-full bg-white/5 blur-[80px]"
				/>
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

					<h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
						Ingeniería, construcción y
						<span className="text-brand-annotate"> mantenimiento</span> con trazabilidad total.
					</h1>

					<p className="mt-8 max-w-2xl text-lg leading-relaxed text-charcoal sm:text-xl">
						CERMONT S.A.S. ejecuta servicios eléctricos, civiles, refrigeración y telecomunicaciones
						en Arauca y Bogotá. Planeamos, documentamos y cerramos cada orden con disciplina operativa.
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

				<aside data-hero-panel className="relative lg:block">
					<div className="relative overflow-hidden rounded-[2.5rem] border border-hairline bg-canvas p-6 shadow-2xl shadow-black/[0.05] dark:shadow-black/20">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-brand-green)/8,transparent_50%),radial-gradient(circle_at_bottom_left,var(--color-brand-annotate)/8,transparent_40%)] opacity-30 dark:opacity-10" />

						{/* Mock Browser Header */}
						<div className="relative z-10 rounded-2xl border border-hairline bg-canvas/80 backdrop-blur-md px-4 py-2.5 shadow-sm">
							<div className="flex items-center gap-3">
								<div className="flex gap-1.5" aria-hidden="true">
									<div className="size-2.5 rounded-full bg-brand-error/80" />
									<div className="size-2.5 rounded-full bg-brand-warn/80" />
									<div className="size-2.5 rounded-full bg-brand-annotate/80" />
								</div>
								<div className="flex-1 rounded-full bg-surface border border-hairline px-4 py-1 text-center text-[10px] font-mono tracking-wider text-slate">
									portal.cermont.co
								</div>
							</div>
						</div>

						<div className="relative z-10 mt-6">
							<LandingHeroCarousel />
						</div>

						<div className="relative z-10 mt-6 flex items-start justify-between gap-4">
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate">
									Sede Central
								</p>
								<p className="mt-2 text-xl font-semibold text-ink">{CORPORATE_LOCATION}</p>
							</div>
							<BadgePill
								className="bg-brand-annotate/15 text-brand-annotate px-4 py-2 text-xs font-semibold"
								dotClassName="bg-brand-annotate animate-pulse"
								leadingIcon={<ShieldCheck className="size-4" />}
								ariaLabel="Operación activa"
							>
								Activo
							</BadgePill>
						</div>

						<div className="relative z-10 mt-6 grid gap-4 sm:grid-cols-3">
							{LANDING_METRICS.map((metric) => (
								<MetricCard key={metric.label} {...metric} />
							))}
						</div>

						<div className="relative z-10 mt-6 rounded-[1.75rem] border border-hairline bg-surface/50 p-6">
							<div className="flex items-center gap-4">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-canvas shadow-sm ring-1 ring-hairline">
									<Logo showText={false} size="sm" />
								</div>
								<div>
									<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate">
										Panel de Control
									</p>
									<p className="mt-1 text-base font-semibold text-ink">
										Gestión Operativa Inteligente
									</p>
								</div>
							</div>

							<div className="mt-6 grid gap-4 sm:grid-cols-2">
								{[
									{ city: "Arauca", addr: "Calle 21 No. 25-43", tel: "(7) 885 11 86" },
									{ city: "Bogota", addr: "Calle 70A No. 17-16", tel: "(1) 542 45 78" },
								].map((site) => (
									<div
										key={site.city}
										className="rounded-2xl border border-hairline bg-canvas p-4 shadow-sm"
									>
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate">
											Sede {site.city}
										</p>
										<p className="mt-1.5 text-xs leading-relaxed text-charcoal">
											{site.addr} — Tel. {site.tel}
										</p>
									</div>
								))}
							</div>

							<div className="mt-6 grid gap-4 sm:grid-cols-3">
								{LANDING_SERVICES.slice(0, 3).map((service) => (
									<div
										key={service.title}
										className="rounded-xl border border-hairline bg-canvas/80 p-3.5 shadow-sm transition-transform hover:scale-[1.02]"
									>
										<div className="flex flex-col gap-2.5">
											<div className="flex size-8 items-center justify-center rounded-lg bg-surface text-charcoal">
												<service.icon className="size-4.5" aria-hidden="true" />
											</div>
											<p className="text-[10px] font-bold uppercase tracking-wider text-ink">
												{service.title}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</aside>
			</div>
		</section>
	);
}
