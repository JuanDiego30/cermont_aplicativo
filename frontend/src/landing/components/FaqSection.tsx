"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";
import { LANDING_FAQ } from "../data/faq-data";
import { SectionHeading } from "./SectionHeading";

export function FaqSection() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggleFaq = useCallback((question: string) => {
		const idx = LANDING_FAQ.findIndex((f) => f.question === question);
		setOpenIndex((prev) => (prev === idx ? null : idx));
	}, []);

	return (
		<section
			id="preguntas"
			data-landing-section
			aria-labelledby="faq-heading"
			className="bg-surface py-16 sm:py-20 lg:py-24 scroll-mt-28"
		>
			<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
				<SectionHeading
					id="faq-heading"
					eyebrow="Preguntas frecuentes"
					title="Resuelva sus dudas sobre nuestros servicios."
					description="Información basada en la oferta pública y la operación documentada de Cermont S.A.S."
					align="center"
				/>

				<dl className="mt-10 divide-y divide-hairline">
					{LANDING_FAQ.map((faq) => {
						const faqIndex = LANDING_FAQ.indexOf(faq);
						const questionKey = faq.question.slice(0, 20).replace(/\s+/g, "-");
						const isOpen = openIndex === faqIndex;
						const panelId = `faq-panel-${questionKey}`;
						const buttonId = `faq-button-${questionKey}`;

						return (
							<div key={faq.question} className="py-3">
								<dt>
									<button
										id={buttonId}
										type="button"
										aria-expanded={isOpen}
										aria-controls={panelId}
										onClick={() => toggleFaq(faq.question)}
										data-analytics="cta-faq-expand"
										data-analytics-label={`faq-${faqIndex}`}
										className="flex w-full min-h-11 items-center justify-between gap-4 rounded-xl px-4 py-3 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40 motion-reduce:transition-none"
									>
										<span>{faq.question}</span>
										<ChevronDown
											className={`size-4 shrink-0 text-steel transition-transform duration-200 motion-reduce:transition-none ${
												isOpen ? "rotate-180" : ""
											}`}
											aria-hidden="true"
										/>
									</button>
								</dt>
								<dd
									id={panelId}
									hidden={!isOpen}
									className="px-4 pb-3 pt-1"
								>
									<p className="text-sm leading-7 text-charcoal">{faq.answer}</p>
								</dd>
							</div>
						);
					})}
				</dl>
			</div>
		</section>
	);
}
