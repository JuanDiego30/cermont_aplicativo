"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Activity, ChevronLeft, ChevronRight, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/core/ui/Logo";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";

gsap.registerPlugin(useGSAP);

const CAROUSEL_SLIDES = [
	{
		id: 1,
		title: "Gestión Operativa Integral",
		description:
			"Digitalice el ciclo completo: desde la solicitud inicial hasta la facturación final.",
		icon: Activity,
	},
	{
		id: 2,
		title: "Seguimiento en Tiempo Real",
		description: "Monitoree el estado de cada orden y recurso con trazabilidad absoluta en campo.",
		icon: ShieldCheck,
	},
	{
		id: 3,
		title: "Documentación Centralizada",
		description: "Evidencias fotográficas, firmas digitales y reportes técnicos en un solo lugar.",
		icon: Zap,
	},
];

const COPYRIGHT_YEAR = 2026;

export function LoginCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const panelRef = useRef<HTMLDivElement>(null);

	// GSAP sequential reveal of brand elements
	useGSAP(
		() => {
			if (prefersReducedMotion()) {
				return;
			}

			const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
			tl.from("[data-login-logo]", { opacity: 0, scale: 0.9, y: -20, duration: 0.8 })
				.from("[data-login-headline]", { opacity: 0, y: 30, duration: 0.7 }, "-=0.4")
				.from("[data-login-desc]", { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
				.from("[data-login-slide]", { opacity: 0, x: 20, duration: 0.5 }, "-=0.2")
				.from("[data-login-footer]", { opacity: 0, duration: 0.4 }, "-=0.1");
		},
		{ scope: panelRef, dependencies: [] },
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
		}, 6000);
		return () => clearInterval(interval);
	}, []);

	const goToSlide = (index: number) => setCurrentSlide(index);
	const goToPrev = () =>
		setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
	const goToNext = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);

	return (
		<section
			ref={panelRef}
			className="relative flex h-full flex-col justify-between overflow-hidden bg-[var(--color-cermont-blue-deep)] px-10 py-16 lg:px-16 lg:py-20"
			aria-label="Carrusel informativo corporativo"
		>
			{/* Atmospheric Background Gradients */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -right-20 -top-20 size-[500px] rounded-full bg-[var(--color-cermont-blue-light)]/20 blur-[100px]" />
				<div className="absolute -left-20 bottom-0 size-[400px] rounded-full bg-[var(--color-cermont-green-deep)]/20 blur-[80px]" />
				<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
			</div>

			{/* Logo */}
			<div className="relative z-10" data-login-logo>
				<Logo
					size="lg"
					wordmarkClassName="text-white"
					logoClassName="text-[var(--color-cermont-green-light)]"
				/>
			</div>

			{/* Main Content */}
			<div className="relative z-10 flex flex-col gap-10">
				<div className="space-y-6">
					<h2
						data-login-headline
						className="text-4xl font-semibold leading-tight text-white lg:text-5xl xl:text-6xl tracking-tight"
					>
						Operación <br />
						<span className="text-[var(--color-cermont-green-light)]">Digitalizada.</span>
					</h2>
					<p data-login-desc className="max-w-md text-lg text-white/70 leading-relaxed">
						Impulsamos la excelencia técnica mediante trazabilidad absoluta y disciplina operativa
						en cada proyecto.
					</p>
				</div>

				{/* Slide content area */}
				<div className="relative min-h-[160px]" data-login-slide>
					{CAROUSEL_SLIDES.map((slide, index) => (
						<div
							key={slide.id}
							className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
								index === currentSlide
									? "translate-x-0 opacity-100 visible"
									: "translate-x-8 opacity-0 invisible"
							}`}
						>
							<div className="flex flex-col gap-4">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[var(--color-cermont-green-light)] shadow-inner ring-1 ring-white/20">
									<slide.icon className="size-6" />
								</div>
								<div className="space-y-2">
									<h3 className="text-xl font-semibold text-white">{slide.title}</h3>
									<p className="max-w-xs text-sm text-white/60 leading-relaxed">
										{slide.description}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Controls & Footer */}
			<div className="relative z-10 space-y-12">
				<div className="flex items-center justify-between">
					<div className="flex gap-3">
						{CAROUSEL_SLIDES.map((slide, index) => (
							<button
								key={slide.id}
								type="button"
								onClick={() => goToSlide(index)}
								className={`h-1.5 rounded-full transition-all duration-500 ${
									index === currentSlide
										? "w-10 bg-[var(--color-cermont-green-light)]"
										: "w-3 bg-white/20 hover:bg-white/40"
								}`}
								aria-label={`Ir a slide ${index + 1}`}
							/>
						))}
					</div>

					<div className="flex gap-4">
						<button
							type="button"
							onClick={goToPrev}
							className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/15 active:scale-95"
							aria-label="Slide anterior"
						>
							<ChevronLeft className="size-5" />
						</button>
						<button
							type="button"
							onClick={goToNext}
							className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/15 active:scale-95"
							aria-label="Siguiente slide"
						>
							<ChevronRight className="size-5" />
						</button>
					</div>
				</div>

				<div
					data-login-footer
					className="flex items-center justify-between border-t border-white/5 pt-8"
				>
					<p className="text-xs font-medium text-white/30 tracking-wider font-mono">
						© {COPYRIGHT_YEAR} CERMONT S.A.S.
					</p>
					<p className="text-xs font-medium text-white/30 tracking-wider font-mono uppercase">
						Arauca · Colombia
					</p>
				</div>
			</div>
		</section>
	);
}
