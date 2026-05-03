"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Activity, ChevronLeft, ChevronRight, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/core/ui/Logo";

gsap.registerPlugin(useGSAP);

const CAROUSEL_SLIDES = [
	{
		id: 1,
		title: "Gestión integral",
		description: "Administra tus proyectos, órdenes de trabajo y clientes en un solo lugar.",
		icon: Activity,
	},
	{
		id: 2,
		title: "Seguimiento en tiempo real",
		description: "Monitorea el estado de cada proceso con dashboards actualizados.",
		icon: ShieldCheck,
	},
	{
		id: 3,
		title: "Documentación centralizada",
		description: "Almacena y organiza evidencia, documentos y archivos de forma segura.",
		icon: Zap,
	},
];

const FEATURES = [
	{ icon: Activity, label: "Órdenes de trabajo en tiempo real" },
	{ icon: ShieldCheck, label: "Gestión de mantenimiento preventivo" },
	{ icon: Zap, label: "Control de recursos e inventario" },
];

export function LoginCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const panelRef = useRef<HTMLDivElement>(null);

	// GSAP sequential reveal of brand elements
	useGSAP(
		() => {
			const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
			tl.from("[data-login-logo]", { opacity: 0, scale: 0.95, duration: 0.6 })
				.from("[data-login-headline]", { opacity: 0, y: 18, duration: 0.65 }, "-=0.25")
				.from("[data-login-desc]", { opacity: 0, y: 18, duration: 0.5 }, "-=0.3")
				.from(
					"[data-login-feature]",
					{ opacity: 0, x: -25, stagger: 0.12, duration: 0.45 },
					"-=0.2",
				)
				.from("[data-login-footer]", { opacity: 0, duration: 0.4 }, "-=0.1");
		},
		{ scope: panelRef, dependencies: [] },
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
		}, 5000);
		return () => clearInterval(interval);
	}, []);

	const goToSlide = (index: number) => setCurrentSlide(index);
	const goToPrev = () =>
		setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
	const goToNext = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);

	return (
		<section
			ref={panelRef}
			className="relative flex flex-col justify-between overflow-hidden bg-[var(--surface-sidebar)] px-8 py-12 md:w-1/2 lg:w-[55%]"
			aria-label="Carrusel informativo"
		>
			{/* Background gradients */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/30 via-[var(--surface-sidebar)] to-[var(--surface-sidebar)]" />
			<div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-sidebar)]/95 via-[var(--color-brand-blue)]/20 to-[var(--surface-sidebar)]/80" />
			<div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[var(--surface-sidebar)] to-transparent" />

			{/* Logo */}
			<div className="relative z-10">
				<div data-login-logo className="flex items-center gap-3">
					<Logo showText={false} size="md" />
					<div>
						<span className="text-xl font-bold tracking-wider text-white">CERMONT</span>
						<p className="text-[10px] font-medium uppercase tracking-widest text-blue-300">
							S.A.S. · Gestión de Activos
						</p>
					</div>
				</div>
			</div>

			{/* Headline + features */}
			<div className="relative z-10 mt-16">
				<h2 data-login-headline className="text-4xl font-bold leading-tight text-white">
					Operaciones
					<br />
					<span className="text-blue-400">bajo control.</span>
				</h2>
				<p data-login-desc className="mt-4 max-w-sm text-base text-slate-300 leading-relaxed">
					Plataforma de gestión de mantenimiento industrial para supervisar activos, órdenes de
					trabajo y recursos en tiempo real.
				</p>

				<ul className="mt-8 space-y-3.5">
					{FEATURES.map(({ icon: Icon, label }) => (
						<li key={label} data-login-feature className="flex items-center gap-3">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-blue)]/20 text-[var(--color-brand-blue-light)]">
								<Icon className="h-4 w-4" aria-hidden="true" />
							</div>
							<span className="text-sm text-slate-300">{label}</span>
						</li>
					))}
				</ul>
			</div>

			{/* Slide content area */}
			<ul aria-label="Information slides" className="relative z-10 mt-12 min-h-[100px]">
				{CAROUSEL_SLIDES.map((slide, index) => (
					<li
						key={slide.id}
						aria-hidden={index !== currentSlide}
						className={`absolute inset-0 transition-all duration-700 ease-in-out ${
							index === currentSlide
								? "translate-x-0 opacity-100"
								: index < currentSlide
									? "-translate-x-full opacity-0"
									: "translate-x-full opacity-0"
						}`}
					>
						<div className="flex items-center gap-3">
							<slide.icon className="h-5 w-5 text-blue-400" />
							<h3 className="text-lg font-semibold text-white">{slide.title}</h3>
						</div>
						<p className="mt-2 text-sm text-slate-400">{slide.description}</p>
					</li>
				))}
			</ul>

			{/* Controls */}
			<div className="relative z-10 mt-auto flex items-center justify-between">
				<div className="flex gap-2">
					{CAROUSEL_SLIDES.map((slide, index) => (
						<button
							key={slide.id}
							type="button"
							onClick={() => goToSlide(index)}
							className={`h-1.5 rounded-full transition-all ${
								index === currentSlide
									? "w-8 bg-[var(--color-brand-blue)]"
									: "w-2 bg-white/20 hover:bg-white/40"
							}`}
							aria-label={`Ir a slide ${index + 1}`}
						/>
					))}
				</div>

				<div className="flex gap-2">
					<button
						type="button"
						onClick={goToPrev}
						className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition hover:bg-white/10"
						aria-label="Slide anterior"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						onClick={goToNext}
						className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition hover:bg-white/10"
						aria-label="Siguiente slide"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				</div>
			</div>

			{/* Footer */}
			<p data-login-footer className="relative z-10 mt-6 text-xs text-slate-500">
				© {new Date().getFullYear()} Cermont S.A.S. · Todos los derechos reservados
			</p>
		</section>
	);
}
