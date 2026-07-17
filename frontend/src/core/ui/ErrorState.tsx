"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ErrorStateProps {
	title?: string;
	message: string;
	onRetry?: () => void;
	retryLabel?: string;
	className?: string;
	"aria-label"?: string;
}

export function ErrorState({
	title = "Error al cargar datos",
	message,
	onRetry,
	retryLabel = "Reintentar",
	className,
	"aria-label": ariaLabel = "Error",
}: ErrorStateProps) {
	return (
		<section
			aria-label={ariaLabel}
			role="alert"
			data-testid="error-state"
			className={cn(
				"flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--status-danger-muted)] bg-[var(--surface-primary)] px-6 py-12 text-center shadow-card",
				className,
			)}
		>
			<div className="flex size-12 items-center justify-center rounded-full bg-[var(--status-danger-muted)]">
				<AlertCircle className="size-6 text-[var(--status-danger)]" aria-hidden="true" />
			</div>
			<h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
			<p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">{message}</p>
			{onRetry && (
				<div className="mt-6">
					<Button type="button" variant="secondary" onClick={onRetry} className="min-h-11">
						<RefreshCw className="size-4" aria-hidden="true" />
						{retryLabel}
					</Button>
				</div>
			)}
		</section>
	);
}
