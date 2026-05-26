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
			<section className="flex max-w-lg flex-col items-center gap-4 text-center">
				<header className="space-y-2">
					<h1 className="text-xl font-semibold text-red-700 dark:text-red-400">Algo salió mal</h1>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Ocurrió un error inesperado. Intenta nuevamente o contacta soporte si el problema
						persiste.
					</p>
				</header>
				{error.digest && (
					<p aria-hidden="true" className="text-xs text-zinc-500 dark:text-zinc-400">
						Código: {error.digest}
					</p>
				)}
				<footer className="flex flex-wrap justify-center gap-3">
					<button
						onClick={() => reset()}
						className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
						type="button"
					>
						Reintentar
					</button>
					<Link
						href="/"
						className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-offset-zinc-950"
					>
						Ir al inicio
					</Link>
				</footer>
			</section>
		</main>
	);
}
