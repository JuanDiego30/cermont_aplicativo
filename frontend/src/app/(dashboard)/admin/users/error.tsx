"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { createLogger } from "@/_shared/lib/monitoring/logger";

interface UsersErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

const logger = createLogger("admin-users:error-boundary");

export default function UsersError({ error, reset }: UsersErrorProps) {
	useEffect(() => {
		logger.error("Users Error", error);
	}, [error]);

	return (
		<section
			className="flex h-[50vh] flex-col items-center justify-center space-y-4 rounded-xl border border-red-100 bg-red-50 p-6 text-center"
			role="alert"
			aria-live="assertive"
			aria-labelledby="users-error-title"
		>
			<span aria-hidden="true" className="m-0">
				<AlertCircle className="h-10 w-10 text-red-500" aria-hidden="true" />
			</span>

			<header>
				<h2 id="users-error-title" className="text-lg font-bold text-red-800">
					Error al cargar los usuarios
				</h2>
				<p className="mt-1 text-sm text-red-600">
					Ocurrió un problema al obtener los datos. Por favor, intenta de nuevo.
				</p>
			</header>

			<footer>
				<button
					type="button"
					onClick={reset}
					className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
				>
					Reintentar
				</button>
			</footer>
		</section>
	);
}
