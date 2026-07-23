import type { ComponentType } from "react";

interface WorkflowCardProps {
	step: number;
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
}

export function WorkflowCard({ step, title, description, icon: Icon }: WorkflowCardProps) {
	return (
		<article className="rounded-[1.75rem] border border-hairline bg-canvas p-5 shadow-1">
			<div className="flex items-center justify-between gap-3">
				<span className="rounded-full border border-hairline bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-charcoal">
					Paso {step}
				</span>
				<Icon className="size-5 text-charcoal" aria-hidden="true" />
			</div>
			<h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
			<p className="mt-2 text-sm leading-6 text-charcoal">{description}</p>
		</article>
	);
}
