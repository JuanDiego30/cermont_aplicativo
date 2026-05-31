import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { AuthBrandHeader } from "@/modules/auth/ui/AuthBrandHeader";
import { AuthPageShell } from "@/modules/auth/ui/AuthPageShell";
import { ResetPasswordContent } from "@/modules/auth/ui/ResetPasswordContent";

function ResetPasswordFallback() {
	return (
		<div className="flex min-h-75 flex-col items-center justify-center gap-4" aria-live="polite">
			<Loader2 className="size-8 animate-spin text-blue-400" aria-hidden="true" />
			<span className="sr-only">Cargando restablecimiento de contraseña…</span>
			<p className="font-medium text-zinc-400">Cargando…</p>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<AuthPageShell>
			<section className="relative z-10 w-full max-w-sm" aria-label="Restablecer contraseña">
				<AuthBrandHeader screenReaderTitle="Restablecer contraseña" />

				<Suspense fallback={<ResetPasswordFallback />}>
					<ResetPasswordContent />
				</Suspense>
			</section>
		</AuthPageShell>
	);
}
