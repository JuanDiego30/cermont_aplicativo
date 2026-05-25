import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";
import { Logo } from "@/core/ui/Logo";
import { CORPORATE_LOCATION } from "../landing-constants";
import { LANDING_METRICS, LANDING_SERVICES, LANDING_TRUST_POINTS } from "../landing-data";
import { MetricCard } from "./cards/MetricCard";

export function HeroSection() {
	return (
		<section className="relative overflow-hidden bg-[var(--surface-page)] pt-12 pb-20 lg:pt-20 lg:pb-32">
			{/* Atmospheric Background Gradients */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div
					data-hero-blob="one"
					className="absolute -left-20 top-0 size-[500px] rounded-full bg-[var(--color-cermont-blue-light)]/10 blur-[100px]"
				/>
				<div
					data-hero-blob="two"
					className="absolute -right-20 top-20 size-[600px] rounded-full bg-[var(--color-cermont-green-light)]/15 blur-[120px]"
				/>
				<div
					data-hero-blob="three"
					className="absolute bottom-0 left-1/4 size-[400px] rounded-full bg-[var(--color-cermont-blue-bg)]/30 blur-[80px]"
				/>
				<div className="absolute inset-0 bg-[linear-gradient(var(--border-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--border-subtle)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-20" />
			</div>

			<div className="relative mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
				<div data-hero-copy className="max-w-3xl">
					<BadgePill
						className="px-3.5 py-1.5 font-mono text-[11px]"
						dotClassName="bg-[var(--color-cermont-green)]"
						ariaLabel="SERVICIOS TÉCNICOS E INDUSTRIALES"
					>
						Servicios técnicos e industriales
					</BadgePill>

					<h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
						Excelencia industrial con
						<span className="text-[var(--color-cermont-green)]"> seguridad</span> y disciplina
						operativa.
					</h1>

					<p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
						CERMONT S.A.S es su aliado estratégico en Arauca, brindando soluciones integrales en
						construcción, electricidad y mantenimiento con los más altos estándares de calidad.
					</p>

					<ul className="mt-10 grid gap-4 sm:grid-cols-3">
						{LANDING_TRUST_POINTS.map((point) => (
							<li
								key={point.title}
								className="flex items-center gap-2.5 text-sm font-medium text-[var(--text-secondary)]"
							>
								<div className="flex size-5 items-center justify-center rounded-full bg-[var(--color-cermont-green-bg)] text-[var(--color-cermont-green)]">
									<CheckCircle2 className="size-3.5" aria-hidden="true" />
								</div>
								<span>{point.title}</span>
							</li>
						))}
					</ul>

					<div className="mt-12 flex flex-wrap items-center gap-4">
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

					<div className="mt-12 flex flex-wrap gap-2.5">
						{["Seguridad", "Trazabilidad", "Continuidad"].map((item) => (
							<BadgePill
								key={item}
								className="px-3 py-1.5 font-mono bg-[var(--surface-card)] shadow-sm"
								dotClassName="bg-[var(--color-cermont-blue-light)]"
								ariaLabel={item}
							>
								{item}
							</BadgePill>
						))}
					</div>
				</div>

				<aside data-hero-panel className="relative lg:block">
					<div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-6 shadow-2xl shadow-black/[0.05] dark:shadow-black/20">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-cermont-blue-bg),transparent_50%),radial-gradient(circle_at_bottom_left,var(--color-cermont-green-bg),transparent_40%)] opacity-30 dark:opacity-10" />

						{/* Mock Browser Header */}
						<div className="relative z-10 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)]/80 backdrop-blur-md px-4 py-2.5 shadow-sm">
							<div className="flex items-center gap-3">
								<div className="flex gap-1.5" aria-hidden="true">
									<div className="size-2.5 rounded-full bg-[var(--color-danger)]/80" />
									<div className="size-2.5 rounded-full bg-[var(--color-warning)]/80" />
									<div className="size-2.5 rounded-full bg-[var(--color-success)]/80" />
								</div>
								<div className="flex-1 rounded-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] px-4 py-1 text-center text-[10px] font-mono tracking-wider text-[var(--text-tertiary)]">
									portal.cermont.co
								</div>
							</div>
						</div>

						<div className="relative z-10 mt-6 flex items-start justify-between gap-4">
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
									Sede Central
								</p>
								<p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
									{CORPORATE_LOCATION}
								</p>
							</div>
							<BadgePill
								className="bg-[var(--color-cermont-green-bg)] text-[var(--color-cermont-green-deep)] px-4 py-2 text-xs font-semibold dark:bg-[var(--color-cermont-green-bg)]/20 dark:text-[var(--color-cermont-green-light)]"
								dotClassName="bg-[var(--color-cermont-green)] animate-pulse"
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

						<div className="relative z-10 mt-6 rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 p-6">
							<div className="flex items-center gap-4">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--surface-card)] shadow-sm ring-1 ring-[var(--border-subtle)]">
									<Logo showText={false} size="sm" />
								</div>
								<div>
									<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
										Panel de Control
									</p>
									<p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
										Gestión Operativa Inteligente
									</p>
								</div>
							</div>

							<div className="mt-6 grid gap-4 sm:grid-cols-2">
								{LANDING_TRUST_POINTS.slice(0, 2).map((point) => (
									<div
										key={point.title}
										className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm"
									>
										<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
											{point.title}
										</p>
										<p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
											{point.description}
										</p>
									</div>
								))}
							</div>

							<div className="mt-6 grid gap-4 sm:grid-cols-3">
								{LANDING_SERVICES.slice(0, 3).map((service) => (
									<div
										key={service.title}
										className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/80 p-3.5 shadow-sm transition-transform hover:scale-[1.02]"
									>
										<div className="flex flex-col gap-2.5">
											<div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-cermont-blue-bg)] text-[var(--color-cermont-blue)]">
												<service.icon className="size-4.5" aria-hidden="true" />
											</div>
											<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)]">
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
