/**
 * ErrorFallback — Error boundary fallback component
 *
 * Displays when an error boundary catches an error or when a page
 * encounters a fatal error. Includes retry functionality.
 *
 * @example
 * ```tsx
 * <ErrorFallback error={error} resetErrorBoundary={handleReset} />
 * ```
 */

"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { MOTION } from "@/components/motion/motion-classes";
import { cn } from "@/lib/utils";

export interface ErrorFallbackProps {
	/** Error object (optional, for detail display) */
	error?: Error | null;
	/** Reset function to retry */
	resetErrorBoundary?: () => void;
	/** Optional custom title */
	title?: string;
	/** Optional custom description */
	description?: string;
	/** Additional CSS classes */
	className?: string;
	homeHref?: string;
	homeLabel?: string;
}

function getErrorMessage(error: Error | null | undefined): string {
	if (!error) {
		return "";
	}
	return error.message || String(error);
}

export function ErrorFallback({
	error,
	resetErrorBoundary,
	title = "Algo salió mal",
	description = "Ocurrió un error inesperado. Intenta de nuevo o contacta al administrador.",
	className,
	homeHref = "/dashboard",
	homeLabel = "Volver al panel",
}: ErrorFallbackProps) {
	const errorMessage = getErrorMessage(error);

	return (
		<section
			role="alert"
			aria-live="assertive"
			aria-label="Error"
			className={cn(
				`${MOTION.revealUp} motion-panel flex flex-col items-center justify-center px-6 py-16 text-center`,
				className,
			)}
		>
			{/* Error icon */}
			<div className="motion-subtle mb-6 flex size-16 items-center justify-center rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
				<AlertCircle className="size-8" aria-hidden="true" />
			</div>

			{/* Title */}
			<h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)] [text-wrap:balance]">
				{title}
			</h2>

			{/* Description */}
			<p className="mb-6 max-w-sm text-sm text-[var(--text-secondary)]">{description}</p>

			{/* Error detail (dev only) */}
			{errorMessage && process.env.NODE_ENV === "development" && (
				<pre className="mb-6 max-w-md overflow-auto rounded-lg bg-[var(--surface-secondary)] p-4 text-left text-xs text-[var(--text-secondary)]">
					{errorMessage}
				</pre>
			)}

			{/* Retry button */}
			<div className="flex flex-wrap items-center justify-center gap-3">
				{resetErrorBoundary && (
					<button
						type="button"
						onClick={resetErrorBoundary}
						className={cn(
							`${MOTION.button} inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-green)] px-6 py-2.5 text-sm font-medium text-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)] focus-visible:ring-offset-2`,
							"hover:opacity-90",
						)}
					>
						<RefreshCw className="size-4" aria-hidden="true" />
						Intentar de nuevo
					</button>
				)}
				<Link
					href={homeHref}
					className="inline-flex items-center rounded-full border border-[var(--border-default)] px-6 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)] focus-visible:ring-offset-2"
				>
					{homeLabel}
				</Link>
			</div>
		</section>
	);
}
