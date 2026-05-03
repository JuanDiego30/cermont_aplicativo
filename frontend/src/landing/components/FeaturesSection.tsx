"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { LANDING_FEATURES, type LandingTone } from "../landing-data";

gsap.registerPlugin(ScrollTrigger);

const TONE_CLASSES: Record<LandingTone, string> = {
	brand: "bg-(--color-brand-blue-bg) text-(--color-brand-blue)",
	info: "bg-(--color-info-bg) text-(--color-info)",
	success: "bg-(--color-success-bg) text-(--color-success)",
	warning: "bg-(--color-warning-bg) text-(--color-warning)",
	purple: "bg-purple-100 text-purple-600",
	neutral: "bg-surface-secondary text-text-secondary",
	danger: "bg-(--color-danger-bg) text-(--color-danger)",
};

export function FeaturesSection({ shouldReduceMotion = false }: { shouldReduceMotion?: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			if (shouldReduceMotion || !sectionRef.current) {
				return;
			}

			const cards = Array.from(sectionRef.current.querySelectorAll("[data-feature-card]"));
			if (!cards.length) {
				return;
			}

			ScrollTrigger.batch(cards, {
				interval: 0.12,
				batchMax: 3,
				onEnter: (batch) => {
					gsap.fromTo(
						batch,
						{ opacity: 0, y: 32, scale: 0.98 },
						{
							opacity: 1,
							y: 0,
							scale: 1,
							duration: 0.65,
							ease: "power2.out",
							stagger: 0.08,
							overwrite: true,
						},
					);
				},
				onLeaveBack: (batch) => {
					gsap.set(batch, { opacity: 0, y: 32, scale: 0.98, overwrite: true });
				},
				start: "top 85%",
				once: false,
			});
		},
		{ scope: sectionRef, dependencies: [shouldReduceMotion] },
	);

	return (
		<section
			ref={sectionRef}
			data-landing-section
			aria-labelledby="features-title"
			className="mx-auto max-w-7xl px-6 py-20 lg:px-8"
		>
			<div className="mx-auto max-w-2xl text-center">
				<h2 id="features-title" className="text-3xl font-bold tracking-tight text-text-primary">
					Lo que nos define como empresa
				</h2>
				<p className="mt-4 text-lg text-text-secondary">
					Una plataforma integral disenada para el mantenimiento industrial, seguridad y control
				</p>
			</div>

			<ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{LANDING_FEATURES.map((feature) => {
					const Icon = feature.icon;
					return (
						<li key={feature.title} data-feature-card>
							<article className="flex flex-col rounded-2xl border border-border-default bg-surface-primary p-6 shadow-1 transition-shadow hover:shadow-2">
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-xl ${TONE_CLASSES[feature.tone]}`}
								>
									<Icon className="h-6 w-6" aria-hidden="true" />
								</div>
								<h3 className="mt-4 text-lg font-semibold text-text-primary">{feature.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-text-secondary">
									{feature.description}
								</p>
							</article>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
