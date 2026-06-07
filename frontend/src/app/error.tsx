"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function AppErrorBoundary({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error("App route error:", error);
	}, [error]);

	return (
		<main className="flex min-h-[60vh] items-center justify-center px-4 py-10">
			<p role="alert" className="sr-only">
				Algo salió mal. {error.digest ? `Código: ${error.digest}.` : ""}
			</p>
			<section className="motion-panel flex max-w-lg flex-col items-center gap-4 text-center">
				<header className="space-y-2">
					<h1 className="text-xl font-semibold text-[var(--color-danger)]">Algo salió mal</h1>
					<p className="text-sm text-[var(--text-secondary)]">
						Ocurrió un error inesperado. Intenta nuevamente o contacta soporte si el problema
						persiste.
					</p>
				</header>
				{error.digest && (
					<p aria-hidden="true" className="text-xs text-[var(--text-muted)]">
						Código: {error.digest}
					</p>
				)}
				<footer className="flex flex-wrap justify-center gap-3">
					<button
						onClick={() => reset()}
						className="motion-button rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-blue-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2"
						type="button"
					>
						Reintentar
					</button>
					<Link
						href="/"
						className="motion-button rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2"
					>
						Ir al inicio
					</Link>
				</footer>
			</section>
		</main>
	);
}
