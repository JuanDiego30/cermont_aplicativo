"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { apiClient } from "@/_shared/lib/http/api-client";
import { Button } from "@/core/ui/Button";

const initialState = {
	success: false,
	error: null as string | null,
	resetToken: null as string | null,
};

async function forgotPasswordAction(_state: typeof initialState, formData: FormData) {
	const email = formData.get("email");

	if (!email || typeof email !== "string") {
		return { ...initialState, error: "El correo es requerido" };
	}

	if (!email.includes("@")) {
		return { ...initialState, error: "Ingresa un correo valido" };
	}

	try {
		const response = await apiClient.post<{ resetToken: string }>("/auth/forgot-password", {
			email,
		});
		return { ...initialState, success: true, resetToken: response.resetToken };
	} catch (error) {
		return {
			...initialState,
			error: error instanceof Error ? error.message : "Error al enviar el correo",
		};
	}
}

export function ForgotPasswordContent() {
	const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

	if (state.success && state.resetToken) {
		window.location.href = `/reset-password?token=${state.resetToken}`;
		return (
			<div className="mt-6 flex flex-col items-center gap-3" role="status">
				<Loader2 className="h-6 w-6 animate-spin text-primary-400" aria-hidden="true" />
				<span className="sr-only">Redirigiendo al restablecimiento de contrasena...</span>
				<p className="text-sm text-slate-400">Redirigiendo...</p>
			</div>
		);
	}

	return (
		<form action={formAction} className="mt-6 flex w-full flex-col gap-4">
			<p className="text-sm text-slate-300">
				Ingresa tu correo electronico y te enviaremos un enlace para restablecer tu contrasena.
			</p>

			{state.error && (
				<p
					role="alert"
					className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100"
				>
					{state.error}
				</p>
			)}

			<div className="flex flex-col gap-2">
				<label htmlFor="email" className="text-sm font-semibold text-slate-300">
					Correo electronico
				</label>
				<input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					placeholder="correo@empresa.com"
					className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-[background-color,border-color,box-shadow,color] focus:border-primary-400 focus:bg-white/10 focus-visible:ring-4 focus-visible:ring-primary-500/20"
				/>
			</div>

			<Button type="submit" loading={isPending} disabled={isPending} className="mt-2 w-full">
				Enviar correo de recuperacion
			</Button>
		</form>
	);
}
