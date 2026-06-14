"use client";

import { ErrorFallback } from "@/components/common/ErrorFallback";

export default function OfflineSyncError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<ErrorFallback
			error={error}
			title="No se pudo abrir la recuperación offline"
			description="Los datos locales permanecen almacenados en este dispositivo."
			resetErrorBoundary={reset}
		/>
	);
}
