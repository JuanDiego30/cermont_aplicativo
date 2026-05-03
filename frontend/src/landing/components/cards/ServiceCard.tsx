import type { ComponentType } from "react";

interface ServiceCardProps {
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
}

export function ServiceCard({ title, description, icon: Icon }: ServiceCardProps) {
	return (
		<article className="rounded-2xl border border-border-default bg-surface-primary p-6 shadow-1 transition-shadow hover:shadow-2">
			<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary text-cermont-blue">
				<Icon className="h-6 w-6" aria-hidden="true" />
			</div>
			<h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3>
			<p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
		</article>
	);
}
