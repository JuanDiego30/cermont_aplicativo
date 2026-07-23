import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyKpiStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	actionLabel?: string;
	actionHref?: string;
}

export function EmptyKpiState({
	icon: Icon,
	title,
	description,
	actionLabel,
	actionHref,
}: EmptyKpiStateProps) {
	return (
		<aside className="flex flex-col gap-4 rounded-2xl border border-dashed border-[var(--color-brand-blue)]/30 bg-[var(--color-brand-blue)]/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)]">
					<Icon className="size-5" aria-hidden="true" />
				</div>
				<div>
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
					<p className="mt-1 max-w-xl text-sm text-[var(--text-secondary)]">{description}</p>
				</div>
			</div>
			{actionLabel && actionHref ? (
				<Link
					href={actionHref}
					className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)] px-4 py-2 text-sm font-semibold text-on-dark transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)] focus-visible:ring-offset-2"
				>
					{actionLabel}
				</Link>
			) : null}
		</aside>
	);
}

