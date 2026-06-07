"use client";

import { ErrorFallback } from "@/components/common/ErrorFallback";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
	return <ErrorFallback error={error} resetErrorBoundary={reset} />;
}
