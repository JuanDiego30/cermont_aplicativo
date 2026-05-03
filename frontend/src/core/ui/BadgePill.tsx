import type { ReactNode } from "react";
import { cn } from "@/_shared/lib/utils";

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
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ring-inset",
				className,
			)}
		>
			{ariaLabel ? <span className="sr-only">{ariaLabel}</span> : null}
			{dotClassName ? (
				<span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} aria-hidden="true" />
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
