"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/core/ui/Button";

export default function BusinessDocumentsError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<section aria-labelledby="error-title" className="flex flex-col items-center gap-4 py-16">
			<AlertCircle className="size-8 text-brand-error" />
			<h2 id="error-title" className="text-lg font-semibold">
				Something went wrong
			</h2>
			<p className="text-sm text-secondary">{error.message}</p>
			<Button onClick={reset}>Try again</Button>
		</section>
	);
}
