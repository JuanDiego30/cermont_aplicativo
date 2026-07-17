"use client";

import type { ReactNode } from "react";
import { EmptyState } from "@/core/ui/EmptyState";
import { ErrorState } from "@/core/ui/ErrorState";

export interface AsyncStateBoundaryProps {
	isLoading: boolean;
	isError: boolean;
	error?: Error | null;
	/** If true and not loading/error, checks isEmpty */
	isEmpty: boolean;
	emptyMessage?: string;
	emptyTitle?: string;
	emptyAction?: { label: string; onClick: () => void } | { label: string; href: string };
	onRetry?: () => void;
	/** Optional loading fallback — defaults to generic skeleton */
	loadingFallback?: ReactNode;
	children: ReactNode;
}

export function AsyncStateBoundary({
	isLoading,
	isError,
	error,
	isEmpty,
	emptyMessage,
	emptyTitle,
	emptyAction,
	onRetry,
	loadingFallback,
	children,
}: AsyncStateBoundaryProps) {
	if (isLoading) {
		return (
			loadingFallback ?? (
				<section aria-label="Cargando" className="flex h-48 items-center justify-center">
					<div className="w-full max-w-md space-y-3">
						<div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)]" />
						<div className="h-4 w-1/2 animate-pulse rounded bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)]" />
						<div className="h-4 w-5/6 animate-pulse rounded bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)]" />
					</div>
				</section>
			)
		);
	}

	if (isError) {
		return (
			<ErrorState
				title="Error al cargar datos"
				message={error?.message ?? "Ocurrió un error inesperado. Intenta de nuevo."}
				onRetry={onRetry}
			/>
		);
	}

	if (isEmpty) {
		return (
			<EmptyState
				title={emptyTitle ?? "Sin resultados"}
				description={emptyMessage}
				action={
					emptyAction
						? "href" in emptyAction
							? { label: emptyAction.label, href: emptyAction.href }
							: { label: emptyAction.label, onClick: emptyAction.onClick }
						: undefined
				}
			/>
		);
	}

	return <>{children}</>;
}
