import { type ReactNode, useId } from "react";
import { cn } from "@/lib/utils";

// ── Types ──
interface ChartCardProps {
	title: string;
	subtitle?: string;
	children: ReactNode;
	legend?: { color: string; label: string }[];
	loading?: boolean;
	className?: string;
}

// ── Component ──
export function ChartCard({
	title,
	subtitle,
	children,
	legend,
	loading,
	className,
}: ChartCardProps) {
	const headingId = useId();

	return (
		<section
			aria-labelledby={headingId}
			className={cn(
				"col-span-12 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-5 pb-5 pt-6 shadow-[var(--shadow-1)] transition-all hover:shadow-[var(--shadow-2)] sm:px-6",
				className,
			)}
		>
			<div className="mb-3 flex flex-wrap items-start justify-between gap-3">
				<div>
					<h3 id={headingId} className="text-lg font-semibold text-[var(--text-primary)]">
						{title}
					</h3>
					{subtitle ? (
						<p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
					) : null}
				</div>
				{legend?.length ? (
					<div className="flex flex-wrap items-center gap-3">
						{legend.map((item) => (
							<span
								key={item.label}
								className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]"
							>
								<span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
								{item.label}
							</span>
						))}
					</div>
				) : null}
			</div>
			<div className="-ml-5">
				{loading ? (
					<div className="flex h-64 items-center justify-center text-sm text-[var(--text-tertiary)]">
						Cargando…
					</div>
				) : (
					children
				)}
			</div>
		</section>
	);
}
