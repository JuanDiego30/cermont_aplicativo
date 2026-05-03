import type { ComponentType } from "react";

interface PrincipleCardProps {
	title: string;
	description: string;
	icon?: ComponentType<{ className?: string }>;
}

export function PrincipleCard({ title, description, icon: Icon }: PrincipleCardProps) {
	return (
		<article className="rounded-2xl border border-border-default bg-surface-primary p-5 shadow-1 transition-shadow hover:shadow-2">
			{Icon ? (
				<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-secondary text-cermont-blue">
					<Icon className="h-5 w-5" aria-hidden="true" />
				</div>
			) : null}
			<h3 className="mt-4 text-sm font-semibold text-text-primary">{title}</h3>
			<p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
		</article>
	);
}
