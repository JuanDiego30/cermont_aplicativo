"use client";

import { ArrowLeft, Loader2, Mail } from "lucide-react";
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
			<div className="mt-2 flex flex-col items-center text-center">
				<div className="mb-6 flex size-16 items-center justify-center rounded-full bg-green-500/10 ring-4 ring-green-500/20">
					<Mail className="size-8 text-green-500" />
				</div>
				<h2 className="text-xl font-semibold text-white">Correo enviado</h2>
				<p className="mt-2 max-w-xs text-sm text-muted-text">
					Revisa la bandeja de entrada de tu correo electrónico para restablecer tu contraseña.
				</p>
				<p className="mt-1 text-xs text-stone">
					Si no lo encuentras, revisa la carpeta de spam o correo no deseado.
				</p>
				<Link
					href="/login"
					className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-canvas/5 px-6 py-3 text-sm font-medium text-stone transition hover:bg-canvas/10"
				>
					<ArrowLeft className="size-4" />
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
				className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30 disabled:cursor-not-allowed disabled:opacity-50"
				aria-busy={isPending}
			>
				{isPending ? <Loader2 className="size-4 animate-spin" /> : null}
				Enviar correo de recuperación
			</button>
		</form>
	);
}
