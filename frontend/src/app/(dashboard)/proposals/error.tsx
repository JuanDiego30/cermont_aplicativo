"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createLogger } from "@/_shared/lib/monitoring/logger";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

const logger = createLogger("proposals:error-boundary");

export default function ProposalsError({ error, reset }: ErrorProps) {
	useEffect(() => {
		logger.error("Proposals Error", error);
	}, [error]);

	return (
		<section
			className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center"
			role="alert"
			aria-live="assertive"
			aria-labelledby="proposals-error-title"
		>
			<div className="flex flex-col items-center gap-2">
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className="h-7 w-7 text-red-500"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
							clipRule="evenodd"
						/>
					</svg>
				</div>
				<h2 id="proposals-error-title" className="text-lg font-semibold text-slate-900">
					Error en Propuestas
				</h2>
				<p className="max-w-sm text-sm text-slate-600">
					Ocurrió un error al cargar el módulo de propuestas comerciales.
				</p>
				{error.digest && <p className="text-xs text-slate-400">Código: {error.digest}</p>}
			</div>
			<div className="flex gap-3">
				<button
					type="button"
					onClick={() => reset()}
					className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
				>
					Reintentar
				</button>
				<Link
					href="/dashboard"
					className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
				>
					Ir al inicio
				</Link>
			</div>
		</section>
	);
}
