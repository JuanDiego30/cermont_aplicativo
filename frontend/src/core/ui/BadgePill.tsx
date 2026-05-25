import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgePillProps {
	children: ReactNode;
	className?: string;
	dotClassName?: string;
	leadingIcon?: ReactNode;
	testId?: string;
	ariaLabel?: string;
}

export function BadgePill({
	children,
	className,
	dotClassName,
	leadingIcon,
	testId,
	ariaLabel,
}: BadgePillProps) {
	return (
		<span
			data-testid={testId}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors duration-150",
				"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[var(--border-subtle)]",
				className,
			)}
		>
			{ariaLabel ? <span className="sr-only">{ariaLabel}</span> : null}

			{dotClassName ? (
				<span className={cn("size-1.5 rounded-full", dotClassName)} aria-hidden="true" />
			) : null}

			{leadingIcon ? (
				<span aria-hidden="true" className="shrink-0">
					{leadingIcon}
				</span>
			) : null}

			<span aria-hidden={Boolean(ariaLabel)}>{children}</span>
		</span>
	);
}
