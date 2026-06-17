"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Activity, ChevronLeft, ChevronRight, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MOTION } from "@/components/motion/motion-classes";
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
		image: "/images/optimized/login/chatgpt-image-25-may-2026-23-14-18-1-1280.webp",
	},
	{
		id: 2,
		title: "Seguimiento en Tiempo Real",
		description: "Monitoree el estado de cada orden y recurso con trazabilidad absoluta en campo.",
		icon: ShieldCheck,
		image: "/images/optimized/login/chatgpt-image-25-may-2026-23-14-18-2-1280.webp",
	},
	{
		id: 3,
		title: "Documentación Centralizada",
		description: "Evidencias fotográficas, firmas digitales y reportes técnicos en un solo lugar.",
		icon: Zap,
		image: "/images/optimized/login/chatgpt-image-25-may-2026-23-14-19-3-1280.webp",
	},
];

const COPYRIGHT_YEAR = 2026;

export function LoginCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const isPaused = useRef(false);
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
			if (!isPaused.current && !prefersReducedMotion()) {
				setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
			}
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
			className="relative flex h-full min-h-[480px] flex-col justify-between overflow-hidden bg-[var(--surface-sidebar)] px-10 py-16 lg:px-16 lg:py-20"
			aria-label="Carrusel informativo corporativo"
			onMouseEnter={() => (isPaused.current = true)}
			onMouseLeave={() => (isPaused.current = false)}
			onFocus={() => (isPaused.current = true)}
			onBlur={() => (isPaused.current = false)}
		>
			{CAROUSEL_SLIDES.map((slide, index) => (
				<Image
					key={slide.id}
					src={slide.image}
					alt=""
					fill
					loading="lazy"
					sizes="(max-width: 768px) 100vw, 50vw"
					className={`object-cover transition-[opacity,transform] duration-[var(--duration-slow)] ease-[var(--ease-standard)] ${
						index === currentSlide ? "opacity-55" : "opacity-0"
					}`}
				/>
			))}
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,43,0.88),rgba(7,20,43,0.55))]" />

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
							className={`absolute inset-0 transition-[transform,opacity] duration-[var(--duration-slow)] ease-[var(--ease-standard)] ${
								index === currentSlide
									? "translate-x-0 opacity-100 visible"
									: "translate-x-8 opacity-0 invisible"
							}`}
						>
							<div className="flex flex-col gap-4">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-canvas/10 text-[var(--color-cermont-green-light)] shadow-inner ring-1 ring-white/20">
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
								className={`h-1.5 rounded-full transition-[width,background-color,opacity] duration-[var(--duration-slow)] ease-[var(--ease-standard)] ${
									index === currentSlide
										? "w-10 bg-[var(--color-cermont-green-light)]"
										: "w-3 bg-canvas/20 hover:bg-canvas/40"
								}`}
								aria-label={`Ir a slide ${index + 1}`}
							/>
						))}
					</div>

					<div className="flex gap-4">
						<button
							type="button"
							onClick={goToPrev}
							className={`${MOTION.button} flex size-12 items-center justify-center rounded-full border border-white/10 bg-canvas/5 text-white hover:bg-canvas/15 active:scale-95`}
							aria-label="Slide anterior"
						>
							<ChevronLeft className="size-5" />
						</button>
						<button
							type="button"
							onClick={goToNext}
							className={`${MOTION.button} flex size-12 items-center justify-center rounded-full border border-white/10 bg-canvas/5 text-white hover:bg-canvas/15 active:scale-95`}
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
