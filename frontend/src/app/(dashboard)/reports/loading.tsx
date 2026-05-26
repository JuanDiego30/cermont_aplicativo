import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<section
			className="flex h-64 items-center justify-center gap-3"
			role="status"
			aria-live="polite"
			aria-label="Cargando reportes"
		>
			<Loader2 className="size-8 motion-safe:animate-spin text-blue-600" aria-hidden="true" />
			<span className="text-sm text-zinc-500">Cargando reportes…</span>
		</section>
	);
}
