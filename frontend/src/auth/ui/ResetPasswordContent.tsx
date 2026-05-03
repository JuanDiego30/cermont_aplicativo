"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { apiClient } from "@/_shared/lib/http/api-client";
import { Button } from "@/core/ui/Button";

interface ResetPasswordContentProps {
	token?: string;
}

const initialState = {
	success: false,
	error: null as string | null,
};

async function resetPasswordAction(_state: typeof initialState, formData: FormData) {
	const password = formData.get("password");
	const confirmPassword = formData.get("confirmPassword");

	if (!password || !confirmPassword) {
		return { ...initialState, error: "Todos los campos son requeridos" };
	}

	if (password !== confirmPassword) {
		return { ...initialState, error: "Las contrasenas no coinciden" };
	}

	if (typeof password !== "string" || password.length < 8) {
		return { ...initialState, error: "La contrasena debe tener al menos 8 caracteres" };
	}

	const token = tokenFromForm(formData);
	if (!token) {
		return { ...initialState, error: "El token de recuperacion es requerido" };
	}

	try {
		await apiClient.post("/auth/reset-password", {
			password,
			token,
		});

		return { ...initialState, success: true };
	} catch (error) {
		return {
			...initialState,
			error: error instanceof Error ? error.message : "Error al restablecer la contrasena",
		};
	}
}

function tokenFromForm(formData: FormData): string | null {
	const token = formData.get("token");
	return typeof token === "string" && token.length > 0 ? token : null;
}

export function ResetPasswordContent({ token }: ResetPasswordContentProps) {
	const [showPassword, setShowPassword] = useState(false);
	const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

	if (state.success) {
		return (
			<div className="mt-6 text-center">
				<div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-6 text-emerald-100">
					<p className="text-lg font-semibold">Contrasena restablecida</p>
					<p className="mt-2 text-sm text-emerald-100/80">
						Ya puedes iniciar sesion con tu nueva contrasena.
					</p>
				</div>
				<a
					href="/login"
					className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
				>
					Ir al inicio de sesion
				</a>
			</div>
		);
	}

	return (
		<form action={formAction} className="mt-6 flex w-full flex-col gap-4">
			{token ? <input type="hidden" name="token" value={token} /> : null}
			{state.error && (
				<p
					role="alert"
					className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100"
				>
					{state.error}
				</p>
			)}

			{!token && (
				<p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
					El enlace de recuperacion ha expirado o es invalido.
				</p>
			)}

			<div className="flex flex-col gap-2">
				<label htmlFor="password" className="text-sm font-semibold text-slate-300">
					Nueva contrasena
				</label>
				<div className="relative">
					<input
						id="password"
						name="password"
						type={showPassword ? "text" : "password"}
						minLength={8}
						required
						disabled={!token}
						placeholder="••••••••"
						className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-[background-color,border-color,box-shadow,color] focus:border-primary-400 focus:bg-white/10 focus-visible:ring-4 focus-visible:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50"
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-300"
						aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
					>
						{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-300">
					Confirmar contrasena
				</label>
				<input
					id="confirmPassword"
					name="confirmPassword"
					type={showPassword ? "text" : "password"}
					minLength={8}
					required
					disabled={!token}
					placeholder="••••••••"
					className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-[background-color,border-color,box-shadow,color] focus:border-primary-400 focus:bg-white/10 focus-visible:ring-4 focus-visible:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50"
				/>
			</div>

			<Button
				type="submit"
				disabled={!token || isPending}
				className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
				Restablecer contrasena
			</Button>
		</form>
	);
}
