import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPIGridProps {
	children: ReactNode;
	className?: string;
}

/**
 * KPIGrid — Responsive grid for KPI cards
 *
 * 1 column on mobile, 2 on tablet (sm:), 4 on desktop (xl:).
 * Wraps children in a CSS grid for consistent spacing.
 */
export function KPIGrid({ children, className }: KPIGridProps) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
				className,
			)}
		>
			{children}
		</div>
	);
}
