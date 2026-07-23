"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { LANDING_FEATURES, type LandingTone } from "../landing-data";

gsap.registerPlugin(ScrollTrigger);

const TONE_CLASSES: Record<LandingTone, string> = {
	brand: "bg-surface text-ink",
	info: "bg-surface text-charcoal",
	success: "bg-surface text-charcoal",
	warning: "bg-surface text-charcoal",
	purple: "bg-surface text-charcoal",
	neutral: "bg-surface text-charcoal",
	danger: "bg-surface text-charcoal",
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
				<h2 id="features-title" className="text-3xl font-semibold tracking-tight text-ink">
					Lo que nos define como empresa
				</h2>
				<p className="mt-4 text-lg text-charcoal">
					Una plataforma integral disenada para el mantenimiento industrial, seguridad y control
				</p>
			</div>

			<ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{LANDING_FEATURES.map((feature) => {
					const Icon = feature.icon;
					return (
						<li key={feature.title} data-feature-card>
							<article className="flex flex-col rounded-2xl border border-hairline bg-canvas p-6 shadow-1 transition-shadow hover:shadow-2">
								<div
									className={`flex size-12 items-center justify-center rounded-xl ${TONE_CLASSES[feature.tone]}`}
								>
									<Icon className="size-6" aria-hidden="true" />
								</div>
								<h3 className="mt-4 text-lg font-semibold text-ink">{feature.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-charcoal">{feature.description}</p>
							</article>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
