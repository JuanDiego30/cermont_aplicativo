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
}

function getErrorMessage(error: Error | null | undefined): string {
	if (!error) { return ""; }
	return error.message || String(error);
}

export function ErrorFallback({
	error,
	resetErrorBoundary,
	title = "Algo salió mal",
	description = "Ocurrió un error inesperado. Intenta de nuevo o contacta al administrador.",
	className,
}: ErrorFallbackProps) {
	const errorMessage = getErrorMessage(error);

	return (
		<section
			role="alert"
			aria-live="assertive"
			aria-label="Error"
			className={cn(
				"flex flex-col items-center justify-center px-6 py-16 text-center",
				className,
			)}
		>
			{/* Error icon */}
			<div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
				<AlertCircle className="size-8 text-red-500" aria-hidden="true" />
			</div>

			{/* Title */}
			<h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
				{title}
			</h2>

			{/* Description */}
			<p className="mb-6 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
				{description}
			</p>

			{/* Error detail (dev only) */}
			{errorMessage && process.env.NODE_ENV === "development" && (
				<pre className="mb-6 max-w-md overflow-auto rounded-lg bg-neutral-100 p-4 text-left text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
					{errorMessage}
				</pre>
			)}

			{/* Retry button */}
			{resetErrorBoundary && (
				<button
					type="button"
					onClick={resetErrorBoundary}
					className={cn(
						"inline-flex items-center gap-2 rounded-full bg-[#2154A6] px-6 py-2.5 text-sm font-medium text-white transition-colors",
						"hover:bg-[#1a4390] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50] focus-visible:ring-offset-2",
					)}
				>
					<RefreshCw className="size-4" aria-hidden="true" />
					Intentar de nuevo
				</button>
			)}
		</section>
	);
}
