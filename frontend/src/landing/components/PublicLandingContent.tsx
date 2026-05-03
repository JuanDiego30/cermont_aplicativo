"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { AboutSection } from "./AboutSection";
import { ContactSection } from "./ContactSection";
import { CtaSection } from "./CtaSection";
import { FeaturesSection } from "./FeaturesSection";
import { HeroSection } from "./HeroSection";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { MethodSection } from "./MethodSection";
import { MissionVisionSection } from "./MissionVisionSection";
import { ResourcesSection } from "./ResourcesSection";
import { ServicesSection } from "./ServicesSection";
import { TrustSection } from "./TrustSection";

const BLOB_CONFIG = [
	{ attr: "one", x: 54, y: 36, scale: 1.08, duration: 24 },
	{ attr: "two", x: -36, y: 54, scale: 1.05, duration: 30 },
	{ attr: "three", x: 76, y: -28, scale: 1.07, duration: 20 },
] as const;

gsap.registerPlugin(ScrollTrigger);

export function PublicLandingContent() {
	const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const sectionsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		setShouldReduceMotion(mediaQuery.matches);
		const handleChange = (event: MediaQueryListEvent) => setShouldReduceMotion(event.matches);
		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	useGSAP(
		() => {
			if (shouldReduceMotion || !containerRef.current) {
				return;
			}

			const blobs = containerRef.current.querySelectorAll("[data-hero-blob]");
			for (const blob of blobs) {
				const config = BLOB_CONFIG.find((c) => c.attr === blob.getAttribute("data-hero-blob"));
				if (!config) {
					continue;
				}
				gsap.to(blob, {
					keyframes: [
						{ x: 0, y: 0, scale: 1 },
						{ x: config.x, y: config.y, scale: config.scale },
						{ x: 0, y: 0, scale: 1 },
					],
					duration: config.duration,
					repeat: -1,
					yoyo: true,
					ease: "none",
				});
			}
		},
		{ scope: containerRef, dependencies: [shouldReduceMotion] },
	);

	useGSAP(
		() => {
			if (shouldReduceMotion || !containerRef.current) {
				return;
			}
			const container = containerRef.current;
			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				const sections = Array.from(container.querySelectorAll("[data-landing-section]"));
				if (!sections.length) {
					return;
				}
				ScrollTrigger.batch(sections, {
					interval: 0.12,
					batchMax: 3,
					onEnter: (batch) => {
						gsap.fromTo(
							batch,
							{ opacity: 0, y: 30 },
							{
								opacity: 1,
								y: 0,
								duration: 0.55,
								ease: "power2.out",
								stagger: 0.08,
								overwrite: true,
							},
						);
					},
					start: "top 85%",
					once: true,
				});
			});
		},
		{ scope: containerRef, dependencies: [shouldReduceMotion] },
	);

	return (
		<div
			ref={containerRef}
			className="relative isolate w-full max-w-full overflow-x-hidden bg-surface-page text-foreground"
		>
			<LandingHeader />

			<main id="main-content">
				<HeroSection />

				{!shouldReduceMotion && (
					<>
						<div
							data-hero-blob="one"
							className="pointer-events-none absolute inset-0"
							aria-hidden="true"
						/>
						<div
							data-hero-blob="two"
							className="pointer-events-none absolute inset-0"
							aria-hidden="true"
						/>
						<div
							data-hero-blob="three"
							className="pointer-events-none absolute inset-0"
							aria-hidden="true"
						/>
					</>
				)}

				<div ref={sectionsRef}>
					<TrustSection shouldReduceMotion={shouldReduceMotion} />
					<AboutSection />
					<ServicesSection />
					<FeaturesSection shouldReduceMotion={shouldReduceMotion} />
					<CtaSection />
					<ResourcesSection />
					<MethodSection />
					<MissionVisionSection />
					<ContactSection />
				</div>
			</main>

			<LandingFooter />
		</div>
	);
}
