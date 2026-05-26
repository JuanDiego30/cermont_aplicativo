"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";

const SLIDES = [
	{
		id: "field-execution",
		title: "Ejecución documentada",
		alt: "Técnicos Cermont documentando una ejecución en campo",
		src: "/images/optimized/landing/chatgpt-image-25-may-2026-22-58-49-1-1280.webp",
	},
	{
		id: "planning",
		title: "Planeación y seguridad",
		alt: "Planeación operativa con seguridad industrial Cermont",
		src: "/images/optimized/landing/chatgpt-image-25-may-2026-22-58-50-2-1280.webp",
	},
	{
		id: "evidence",
		title: "Evidencias trazables",
		alt: "Registro de evidencias y documentos técnicos Cermont",
		src: "/images/optimized/landing/chatgpt-image-25-may-2026-22-58-50-3-1280.webp",
	},
] as const;

export function LandingHeroCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const isPausedRef = useRef(false);

	useEffect(() => {
		if (prefersReducedMotion()) {
			return;
		}
		const interval = setInterval(() => {
			if (isPausedRef.current) {
				return;
			}
			setCurrentSlide((current) => (current + 1) % SLIDES.length);
		}, 7000);
		return () => clearInterval(interval);
	}, []);

	function setPaused(isPaused: boolean) {
		isPausedRef.current = isPaused;
	}

	function goToSlide(index: number) {
		setCurrentSlide(index);
	}

	function goToPrevious() {
		setCurrentSlide((current) => (current - 1 + SLIDES.length) % SLIDES.length);
	}

	function goToNext() {
		setCurrentSlide((current) => (current + 1) % SLIDES.length);
	}

	return (
		<section
			aria-label="Carrusel visual de servicios Cermont"
			className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
		>
			{SLIDES.map((slide, index) => (
				<Image
					key={slide.id}
					src={slide.src}
					alt={slide.alt}
					fill
					priority={index === 0}
					sizes="(max-width: 1024px) 100vw, 42vw"
					className={`object-cover transition-opacity duration-700 ${
						index === currentSlide ? "opacity-100" : "opacity-0"
					}`}
				/>
			))}
			<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
				<p className="text-sm font-semibold text-white">{SLIDES[currentSlide].title}</p>
				<div className="mt-3 flex items-center justify-between gap-3">
					<div className="flex gap-2">
						{SLIDES.map((slide, index) => (
							<button
								key={slide.id}
								type="button"
								aria-label={`Mostrar imagen ${index + 1}`}
								onClick={() => goToSlide(index)}
								className={`h-1.5 rounded-full transition-all ${
									index === currentSlide ? "w-8 bg-white" : "w-3 bg-white/45"
								}`}
							/>
						))}
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							aria-label="Imagen anterior"
							onClick={goToPrevious}
							className="flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white"
						>
							<ChevronLeft className="size-4" aria-hidden="true" />
						</button>
						<button
							type="button"
							aria-label="Imagen siguiente"
							onClick={goToNext}
							className="flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white"
						>
							<ChevronRight className="size-4" aria-hidden="true" />
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
