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
					<h1 className="text-xl font-bold text-red-700 dark:text-red-400">Algo salió mal</h1>
					<p className="text-sm text-slate-600 dark:text-slate-400">
						Ocurrió un error inesperado. Intenta nuevamente o contacta soporte si el problema
						persiste.
					</p>
				</header>
				{error.digest && (
					<p aria-hidden="true" className="text-xs text-slate-500 dark:text-slate-400">
						Código: {error.digest}
					</p>
				)}
				<footer className="flex flex-wrap justify-center gap-3">
					<button
						onClick={() => reset()}
						className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
						type="button"
					>
						Reintentar
					</button>
					<Link
						href="/"
						className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
					>
						Ir al inicio
					</Link>
				</footer>
			</section>
		</main>
	);
}
