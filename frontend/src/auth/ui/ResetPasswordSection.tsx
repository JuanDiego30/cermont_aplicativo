"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthBrandHeader } from "@/auth/ui/AuthBrandHeader";
import { ResetPasswordContent } from "@/auth/ui/ResetPasswordContent";

function ResetPasswordFallback() {
	return (
		<div className="flex min-h-75 flex-col items-center justify-center gap-4" role="status">
			<Loader2 className="h-8 w-8 animate-spin text-blue-400" aria-hidden="true" />
			<span className="sr-only">Cargando restablecimiento de contraseña...</span>
			<p className="font-medium text-slate-400">Cargando...</p>
		</div>
	);
}

function ResetPasswordInner() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token") ?? undefined;

	return (
		<section className="relative z-10 w-full max-w-sm" aria-label="Restablecer contraseña">
			<AuthBrandHeader screenReaderTitle="Restablecer contraseña" />
			<ResetPasswordContent token={token} />
		</section>
	);
}

export function ResetPasswordSection() {
	return (
		<Suspense fallback={<ResetPasswordFallback />}>
			<ResetPasswordInner />
		</Suspense>
	);
}
