"use client";

import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { Activity, ChevronLeft, ChevronRight, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/core/ui/Logo";
import { LOGIN_COPY } from "../lib/i18n";

gsap.registerPlugin(useGSAP);

interface CarouselSlide {
	id: number;
	title: string;
	description: string;
	icon: typeof Activity;
	image: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
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
		description:
			"Monitoree el estado de cada orden y recurso con trazabilidad absoluta en campo.",
		icon: ShieldCheck,
		image: "/images/optimized/login/chatgpt-image-25-may-2026-23-14-18-2-1280.webp",
	},
	{
		id: 3,
		title: "Documentación Centralizada",
		description:
			"Evidencias fotográficas, firmas digitales y reportes técnicos en un solo lugar.",
		icon: Zap,
		image: "/images/optimized/login/chatgpt-image-25-may-2026-23-14-19-3-1280.webp",
	},
];

const COPYRIGHT_YEAR = 2026;
const AUTOPLAY_INTERVAL = 6000;

const slideVariants = {
	enter: { opacity: 0, x: 40 },
	center: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -40 },
};

export function LoginCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [progress, setProgress] = useState(0);
	const isPaused = useRef(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const progressRef = useRef(0);
	const rafRef = useRef<number | null>(null);

	useGSAP(
		() => {
			if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { return; }
			const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
			tl.from("[data-login-logo]", { opacity: 0, scale: 0.9, y: -20, duration: 0.8 })
				.from("[data-login-headline]", { opacity: 0, y: 30, duration: 0.7 }, "-=0.4")
				.from("[data-login-desc]", { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
				.from("[data-login-slide]", { opacity: 0, x: 20, duration: 0.5 }, "-=0.2")
				.from("[data-login-footer]", { opacity: 0, duration: 0.4 }, "-=0.1");
		},
		{ scope: panelRef, dependencies: [] },
	);

	const tick = useCallback((timestamp: number) => {
		if (!progressRef.current) { progressRef.current = timestamp; }
		if (isPaused.current) {
			progressRef.current = timestamp;
			rafRef.current = requestAnimationFrame(tick);
			return;
		}
		const elapsed = timestamp - progressRef.current;
		const pct = Math.min(elapsed / AUTOPLAY_INTERVAL, 1);
		setProgress(pct);
		if (pct >= 1) {
			setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
			progressRef.current = timestamp;
			setProgress(0);
		}
		rafRef.current = requestAnimationFrame(tick);
	}, []);

	useEffect(() => {
		progressRef.current = 0;
		rafRef.current = requestAnimationFrame(tick);
		return () => {
			if (rafRef.current) { cancelAnimationFrame(rafRef.current); }
		};
	}, [tick]);

	const goToSlide = useCallback((index: number) => {
		setCurrentSlide(index);
		progressRef.current = 0;
		setProgress(0);
	}, []);

	const goToPrev = useCallback(() => {
		setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
		progressRef.current = 0;
		setProgress(0);
	}, []);

	const goToNext = useCallback(() => {
		setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
		progressRef.current = 0;
		setProgress(0);
	}, []);

	return (
		<section
			ref={panelRef}
			className="relative flex h-full min-h-[480px] flex-col justify-between overflow-hidden bg-[var(--surface-sidebar)] px-10 py-16 lg:px-16 lg:py-20"
			aria-label={LOGIN_COPY.carouselAria}
			onMouseEnter={() => { isPaused.current = true; }}
			onMouseLeave={() => { isPaused.current = false; }}
			onFocus={() => { isPaused.current = true; }}
			onBlur={() => { isPaused.current = false; }}
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

			<div className="relative z-10" data-login-logo>
				<Logo
					size="lg"
					wordmarkClassName="text-white"
					logoClassName="text-[var(--color-cermont-green-light)]"
				/>
			</div>

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

				<div className="relative min-h-[160px]" data-login-slide>
					<AnimatePresence mode="wait">
						{CAROUSEL_SLIDES.map((slide) =>
							slide.id === CAROUSEL_SLIDES[currentSlide].id ? (
								<motion.div
									key={slide.id}
									variants={slideVariants}
									initial="enter"
									animate="center"
									exit="exit"
									transition={{ duration: 0.4, ease: "easeInOut" }}
									className="absolute inset-0"
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
								</motion.div>
							) : null,
						)}
					</AnimatePresence>
				</div>
			</div>

			<div className="relative z-10 space-y-12">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{CAROUSEL_SLIDES.map((slide, index) => (
							<button
								key={slide.id}
								type="button"
								onClick={() => goToSlide(index)}
								className="relative h-1.5 rounded-full transition-[width,background-color,opacity] duration-[var(--duration-slow)] ease-[var(--ease-standard)]"
								style={{
									width: index === currentSlide ? 40 : 12,
									backgroundColor:
										index === currentSlide
											? "var(--color-cermont-green-light)"
											: "rgba(255,255,255,0.2)",
								}}
								aria-label={`Ir a slide ${index + 1}`}
								aria-current={index === currentSlide ? "true" : undefined}
							>
								{index === currentSlide && (
									<motion.span
										className="absolute inset-0 rounded-full bg-white"
										style={{ originX: 0 }}
										animate={{ scaleX: progress }}
										transition={{ duration: 0.1, ease: "linear" }}
									/>
								)}
							</button>
						))}
					</div>

					<div className="flex gap-4">
						<button
							type="button"
							onClick={goToPrev}
							className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-canvas/5 text-white hover:bg-canvas/15 active:scale-95 transition-all"
							aria-label={LOGIN_COPY.slidePrevAria}
						>
							<ChevronLeft className="size-5" />
						</button>
						<button
							type="button"
							onClick={goToNext}
							className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-canvas/5 text-white hover:bg-canvas/15 active:scale-95 transition-all"
							aria-label={LOGIN_COPY.slideNextAria}
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
