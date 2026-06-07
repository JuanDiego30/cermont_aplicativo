"use client";

import { Loader2 } from "lucide-react";

export function ChartLoadingFallback() {
	return (
		<div className="flex h-64 items-center justify-center">
			<Loader2 className="size-6 animate-spin text-zinc-400" />
		</div>
	);
}
