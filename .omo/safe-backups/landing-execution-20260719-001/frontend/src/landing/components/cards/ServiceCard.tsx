import type { ComponentType } from "react";

interface ServiceCardProps {
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
}

export function ServiceCard({ title, description, icon: Icon }: ServiceCardProps) {
	return (
		<article className="rounded-2xl border border-hairline bg-canvas p-6 shadow-1 transition-shadow hover:shadow-2">
			<div className="flex size-12 items-center justify-center rounded-xl bg-surface text-charcoal">
				<Icon className="size-6" aria-hidden="true" />
			</div>
			<h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
			<p className="mt-2 text-sm leading-relaxed text-charcoal">{description}</p>
		</article>
	);
}
