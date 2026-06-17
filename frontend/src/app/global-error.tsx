"use client";

import Link from "next/link";
import { useEffect } from "react";

interface GlobalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		console.error("Global app error:", error);
	}, [error]);

	return (
		<html lang="es" suppressHydrationWarning style={{ colorScheme: "light dark" }}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Error crítico | Cermont</title>
			</head>
			<body className="min-h-screen bg-[var(--surface-page)] font-outfit text-[var(--foreground)] antialiased">
				<main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
					<div
						aria-hidden="true"
						className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.10),_transparent_35%)]"
					/>
					<p role="alert" className="sr-only">
						Ocurrió un error crítico en la aplicación.{" "}
						{error.digest ? `Código: ${error.digest}.` : ""}
					</p>
					<section className="relative z-10 flex w-full max-w-lg flex-col items-center gap-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-8 text-center shadow-[var(--shadow-3)]">
						<header className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-danger)]">
								Cermont
							</p>
							<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Error crítico</h1>
							<p className="text-sm text-[var(--text-secondary)]">
								Ocurrió un error inesperado en la aplicación. Intenta nuevamente.
							</p>
						</header>
						{error.digest && (
							<p
								aria-hidden="true"
								className="rounded-full bg-[var(--surface-secondary)] px-3 py-1 text-xs text-[var(--text-secondary)]"
							>
								Código: {error.digest}
							</p>
						)}
						<footer className="flex flex-wrap justify-center gap-3">
							<button
								onClick={() => reset()}
								className="rounded-lg bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-blue)]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-primary)]"
								type="button"
							>
								Reintentar
							</button>
							<Link
								href="/"
								className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-blue)]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-primary)]"
							>
								Ir al inicio
							</Link>
						</footer>
					</section>
				</main>
			</body>
		</html>
	);
}
