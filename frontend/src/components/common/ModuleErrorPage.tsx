/**
 * ModuleErrorPage — Shared error boundary for Next.js App Router error.tsx files
 *
 * Replaces 70+ duplicated error.tsx files across the dashboard routes.
 * Usage: export default function ModuleError(props) { return <ModuleErrorPage {...props} moduleName="Orders" />; }
 */
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createLogger } from "@/lib/monitoring/logger";

export interface ModuleErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
	moduleName: string;
	/** Enlace opcional "Ir al inicio" (p. ej. /dashboard) */
	homeHref?: string;
}

const ExclamationIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className="size-7 text-red-500"
		aria-hidden="true"
	>
		<path
			fillRule="evenodd"
			d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
			clipRule="evenodd"
		/>
	</svg>
);

export function ModuleErrorPage({ error, reset, moduleName, homeHref }: ModuleErrorPageProps) {
	const logger = createLogger(`${moduleName.toLowerCase()}:error-boundary`);

	useEffect(() => {
		logger.error(`${moduleName} Error`, error);
	}, [error, logger, moduleName]);

	return (
		<section
			className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center"
			role="alert"
			aria-live="assertive"
			aria-labelledby={`${moduleName.toLowerCase()}-error-title`}
		>
			<header className="flex flex-col items-center gap-2">
				<span className="flex size-14 items-center justify-center rounded-full bg-red-50">
					<ExclamationIcon />
				</span>
				<h2
					id={`${moduleName.toLowerCase()}-error-title`}
					className="text-lg font-semibold text-zinc-900"
				>
					Error en {moduleName}
				</h2>
				<p className="max-w-sm text-sm text-zinc-600">
					Ocurrió un error al cargar el módulo de {moduleName.toLowerCase()}.
				</p>
				{error.digest && <p className="text-xs text-zinc-400">Código: {error.digest}</p>}
			</header>
			<footer className="flex gap-3">
				<button
					type="button"
					onClick={reset}
					className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
				>
					Reintentar
				</button>
				{homeHref && (
					<Link
						href={homeHref}
						className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
					>
						Ir al inicio
					</Link>
				)}
			</footer>
		</section>
	);
}
