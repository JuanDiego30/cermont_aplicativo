import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANDING_TESTIMONIALS } from "../landing-data";
import { SectionHeading } from "./SectionHeading";

function TestimonialCard({
	name,
	company,
	role,
	text,
	initials,
}: {
	name: string;
	company: string;
	role: string;
	text: string;
	initials: string;
}) {
	return (
		<article
			className={cn(
				"flex flex-col rounded-[2rem] border border-[var(--border-subtle)] p-6 sm:p-8",
				"bg-[var(--surface-primary)] shadow-card",
			)}
		>
			<Quote className="mb-4 size-6 text-[var(--color-brand)]/30" aria-hidden="true" />
			<blockquote className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
				&ldquo;{text}&rdquo;
			</blockquote>
			<div className="mt-6 flex items-center gap-3 border-t border-[var(--border-subtle)] pt-4">
				<div
					className={cn(
						"flex size-10 items-center justify-center rounded-full text-xs font-bold",
						"bg-[var(--color-brand)]/10 text-[var(--color-brand)]",
					)}
					aria-hidden="true"
				>
					{initials}
				</div>
				<div>
					<p className="text-sm font-semibold text-[var(--text-primary)]">{name}</p>
					<p className="text-xs text-[var(--text-muted)]">
						{role}, {company}
					</p>
				</div>
			</div>
		</article>
	);
}

export function TestimonialsSection() {
	if (LANDING_TESTIMONIALS.length === 0) {
		return null;
	}

	return (
		<section
			data-landing-section
			aria-labelledby="testimonials-heading"
			className={cn("bg-[var(--surface-secondary)] py-16 sm:py-20 lg:py-24")}
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<SectionHeading
							eyebrow="Compromisos documentados"
							title="La operación también se respalda con evidencia."
							description="Estos referentes internos muestran cómo Cermont convierte sus compromisos en prácticas operativas verificables."
					align="center"
				/>

				<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{LANDING_TESTIMONIALS.map((testimonial) => (
						<TestimonialCard key={testimonial.name} {...testimonial} />
					))}
				</div>
			</div>
		</section>
	);
}
