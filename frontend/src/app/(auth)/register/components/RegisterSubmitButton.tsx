"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function RegisterSubmitButton() {
	const { pending } = useFormStatus();
	return (
		<button type="submit" disabled={pending} aria-busy={pending}
			className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30 disabled:cursor-not-allowed disabled:opacity-50">
			{pending ? <Loader2 className="size-4 animate-spin" /> : null}
			{pending ? "Enviando..." : "Enviar solicitud"}
		</button>
	);
}
