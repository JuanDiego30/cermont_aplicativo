"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { apiClient } from "@/lib/http/api-client";

const initialState = {
	success: false,
	error: null as string | null,
};

async function forgotPasswordAction(_state: typeof initialState, formData: FormData) {
	const email = formData.get("email");

	if (!email || typeof email !== "string") {
		return { ...initialState, error: "El correo es requerido" };
	}

	if (!email.includes("@")) {
		return { ...initialState, error: "Ingresa un correo válido" };
	}

	try {
		await apiClient.post("/auth/forgot-password", { email });
		return { ...initialState, success: true };
	} catch (error) {
		return {
			...initialState,
			error: error instanceof Error ? error.message : "Error al enviar el correo",
		};
	}
}

export function ForgotPasswordContent() {
	const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

	if (state.success) {
		return (
			<div className="mt-2 text-center">
				<div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-6 text-brand-annotate">
					<p className="text-lg font-semibold">Correo enviado</p>
					<p className="mt-2 text-sm text-brand-annotate">
						Revisa tu bandeja de entrada para restablecer tu contraseña.
					</p>
				</div>
				<Link
					href="/login"
					className="mt-4 block rounded-xl border border-white/10 bg-canvas/5 px-4 py-3 text-sm font-medium text-stone transition hover:bg-canvas/10"
				>
					Volver al inicio de sesión
				</Link>
			</div>
		);
	}

	return (
		<form action={formAction} className="mt-6 flex w-full flex-col gap-4">
			<p className="text-sm text-muted-text">
				Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
			</p>

			{state.error && (
				<p
					role="alert"
					className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-brand-error"
				>
					{state.error}
				</p>
			)}

			<div className="flex flex-col gap-2">
				<label htmlFor="email" className="text-sm font-semibold text-muted-text">
					Correo electrónico
				</label>
				<input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					placeholder="correo@empresa.com"
					className="rounded-xl border border-white/10 bg-canvas/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-[background-color,border-color,box-shadow,color] focus:border-primary-400 focus:bg-canvas/10 focus-visible:ring-4 focus-visible:ring-primary-500/20"
				/>
			</div>

			<button
				type="submit"
				disabled={isPending}
				className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isPending ? <Loader2 className="size-4 animate-spin" /> : null}
				Enviar correo de recuperación
			</button>
		</form>
	);
}
