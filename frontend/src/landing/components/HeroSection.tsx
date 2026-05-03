import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";
import { Logo } from "@/core/ui/Logo";
import { CORPORATE_LOCATION } from "../landing-constants";
import { LANDING_METRICS, LANDING_SERVICES, LANDING_TRUST_POINTS } from "../landing-data";
import { MetricCard } from "./cards/MetricCard";

export function HeroSection() {
	return (
		<section className="relative overflow-hidden bg-cermont-navy">
			<div className="pointer-events-none absolute inset-0">
				<div
					data-hero-blob="one"
					className="absolute -left-28 top-12 h-80 w-80 rounded-full bg-cermont-blue-light/15 blur-3xl"
				/>
				<div
					data-hero-blob="two"
					className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cermont-green-light/10 blur-3xl"
				/>
				<div
					data-hero-blob="three"
					className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cermont-green/10 blur-3xl"
				/>
				<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[64px_64px] opacity-[0.12]" />
			</div>

			<div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
				<div data-hero-copy className="max-w-3xl">
					<BadgePill
						className="border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-200"
						dotClassName="bg-cermont-green"
						ariaLabel="CONSTRUCCION - ELECTRICIDAD - REFRIGERACION - MONTAJES"
					>
						Servicios técnicos e industriales
					</BadgePill>

					<h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl xl:text-6xl">
						Excelencia en servicios industriales con
						<span className="text-cermont-green-light"> seguridad</span>, calidad y disciplina
						operativa.
					</h1>

					<p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
						CERMONT S.A.S es una empresa joven, ubicada en el corazon de Arauca-Arauca, identificada
						con NIT 900.223.449-5 adscrita a la camara de comercio de la ciudad de Arauca y con una
						meta clara: la satisfaccion total de nuestros clientes.
					</p>

					<ul className="mt-6 grid gap-3 sm:grid-cols-3">
						{LANDING_TRUST_POINTS.map((point) => (
							<li key={point.title} className="flex items-start gap-3 text-sm text-slate-300">
								<CheckCircle2
									className="mt-0.5 h-4.5 w-4.5 shrink-0 text-cermont-green"
									aria-hidden="true"
								/>
								<span>{point.title}</span>
							</li>
						))}
					</ul>

					<div className="mt-10 flex flex-wrap items-center gap-3">
						<Button asChild size="lg" className="rounded-full px-6">
							<a href="#contacto">
								Solicitar información
								<ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
							</a>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10"
						>
							<a href="#servicios">Ver servicios</a>
						</Button>
					</div>

					<div className="mt-8 flex flex-wrap gap-2">
						{["Seguridad", "Trazabilidad", "Continuidad"].map((item) => (
							<BadgePill
								key={item}
								className="border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200"
								dotClassName="bg-cermont-blue-light"
								ariaLabel={item}
							>
								{item}
							</BadgePill>
						))}
					</div>
				</div>

				<aside data-hero-panel className="relative">
					<div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,31,53,0.94),rgba(2,6,23,0.98))] p-5 shadow-[0_24px_70px_rgba(2,6,23,0.38)]">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,155,230,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(61,158,66,0.16),transparent_28%)]" />

						<div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
							<div className="flex items-center gap-2">
								<div className="flex gap-1.5" aria-hidden="true">
									<div className="h-3 w-3 rounded-full bg-(--color-danger)" />
									<div className="h-3 w-3 rounded-full bg-(--color-warning)" />
									<div className="h-3 w-3 rounded-full bg-cermont-green" />
								</div>
								<div className="flex-1 rounded-md bg-cermont-bg-card px-3 py-1 text-center text-xs text-slate-400">
									cermont.co
								</div>
							</div>
						</div>

						<div className="relative z-10 mt-5 flex items-start justify-between gap-4">
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
									Perfil corporativo
								</p>
								<p className="mt-2 text-lg font-semibold text-white">{CORPORATE_LOCATION}</p>
							</div>
							<BadgePill
								className="border-cermont-green/20 bg-cermont-green/10 px-3 py-1.5 text-xs font-semibold text-cermont-green-light"
								dotClassName="bg-cermont-green-light"
								leadingIcon={<ShieldCheck className="h-3.5 w-3.5" />}
								ariaLabel="Operación activa"
							>
								Operativo
							</BadgePill>
						</div>

						<div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-3">
							{LANDING_METRICS.map((metric) => (
								<MetricCard key={metric.label} {...metric} />
							))}
						</div>

						<div className="relative z-10 mt-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
							<div className="flex items-center gap-4">
								<Logo showText={false} size="lg" className="shrink-0" />
								<div>
									<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
										Aliado técnico
									</p>
									<p className="mt-2 text-lg font-semibold text-white">
										Seguridad, trazabilidad y continuidad en campo.
									</p>
								</div>
							</div>

							<div className="mt-5 grid gap-3 sm:grid-cols-2">
								{LANDING_TRUST_POINTS.map((point) => (
									<div
										key={point.title}
										className="rounded-2xl border border-white/10 bg-white/5 p-4"
									>
										<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
											{point.title}
										</p>
										<p className="mt-2 text-sm leading-6 text-slate-200">{point.description}</p>
									</div>
								))}
							</div>

							<div className="mt-5 grid gap-3 sm:grid-cols-3">
								{LANDING_SERVICES.slice(0, 3).map((service) => (
									<div
										key={service.title}
										className="rounded-2xl border border-white/10 bg-white/5 p-4"
									>
										<div className="flex items-center gap-2">
											<service.icon
												className="h-4 w-4 text-cermont-blue-light"
												aria-hidden="true"
											/>
											<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
												{service.title}
											</p>
										</div>
										<p className="mt-2 text-xs leading-5 text-slate-400">{service.description}</p>
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
