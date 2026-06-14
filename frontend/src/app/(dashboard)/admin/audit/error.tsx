"use client";

import { ErrorFallback } from "@/components/common/ErrorFallback";

export default function AdminAuditError({ error, reset }: { error: Error; reset: () => void }) {
	return (
		<ErrorFallback
			error={error}
			title="No fue posible abrir la auditoría"
			description="La vista administrativa no pudo cargarse."
			resetErrorBoundary={reset}
		/>
	);
}
