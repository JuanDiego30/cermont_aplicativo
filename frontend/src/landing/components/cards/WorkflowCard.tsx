import type { ComponentType } from "react";

interface WorkflowCardProps {
	step: number;
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
}

export function WorkflowCard({ step, title, description, icon: Icon }: WorkflowCardProps) {
	return (
		<article className="rounded-[1.75rem] border border-border-default bg-surface-primary p-5 shadow-1">
			<div className="flex items-center justify-between gap-3">
				<span className="rounded-full border border-border-default bg-surface-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
					Paso {step}
				</span>
				<Icon className="h-5 w-5 text-cermont-blue" aria-hidden="true" />
			</div>
			<h3 className="mt-4 text-base font-semibold text-text-primary">{title}</h3>
			<p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
		</article>
	);
}
