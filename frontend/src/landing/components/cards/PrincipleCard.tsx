import type { ComponentType } from "react";

interface PrincipleCardProps {
	title: string;
	description: string;
	icon?: ComponentType<{ className?: string }>;
}

export function PrincipleCard({ title, description, icon: Icon }: PrincipleCardProps) {
	return (
		<article className="rounded-2xl border border-hairline bg-canvas p-5 shadow-1 transition-shadow hover:shadow-2">
			{Icon ? (
				<div className="flex size-11 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
					<Icon className="size-5" aria-hidden="true" />
				</div>
			) : null}
			<h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
			<p className="mt-2 text-sm leading-6 text-charcoal">{description}</p>
		</article>
	);
}
