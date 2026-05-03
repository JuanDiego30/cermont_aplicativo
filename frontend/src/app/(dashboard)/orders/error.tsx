"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { createLogger } from "@/_shared/lib/monitoring/logger";

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
			className="flex h-[50vh] flex-col items-center justify-center space-y-4 rounded-xl border border-red-100 bg-red-50 p-6 text-center"
			role="alert"
			aria-live="assertive"
			aria-labelledby="orders-error-title"
		>
			<AlertCircle className="h-10 w-10 text-red-500" aria-hidden="true" />
			<div>
				<h2 id="orders-error-title" className="text-lg font-bold text-red-800">
					Error al cargar las órdenes
				</h2>
				<p className="mt-1 text-sm text-red-600">
					Ocurrió un problema al obtener los datos. Por favor, intenta de nuevo.
				</p>
				{error.digest ? <p className="mt-2 text-xs text-red-500">Código: {error.digest}</p> : null}
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
