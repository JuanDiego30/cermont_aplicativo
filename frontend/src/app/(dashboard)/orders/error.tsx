"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { createLogger } from "@/lib/monitoring/logger";

const logger = createLogger("orders:error-boundary");

export default function OrdersError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		logger.error("Orders Error", error);
	}, [error]);

	return (
		<section
			className="flex h-[50vh] flex-col items-center justify-center gap-y-4 rounded-xl border border-red-100 bg-danger-bg p-6 text-center"
			role="alert"
			aria-live="assertive"
			aria-labelledby="orders-error-title"
		>
			<AlertCircle className="size-10 text-brand-error" aria-hidden="true" />
			<div>
				<h2 id="orders-error-title" className="text-lg font-semibold text-brand-error">
					Error al cargar las órdenes
				</h2>
				<p className="mt-1 text-sm text-brand-error">
					Ocurrió un problema al obtener los datos. Por favor, intenta de nuevo.
				</p>
				{error.digest ? (
					<p className="mt-2 text-xs text-brand-error">Código: {error.digest}</p>
				) : null}
			</div>
			<button
				type="button"
				onClick={() => reset()}
				className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
			>
				Reintentar
			</button>
		</section>
	);
}
