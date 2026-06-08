"use client";

import { type LoginInput, LoginSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/core/ui/Button";
import { FormField, TextField } from "@/core/ui/FormField";
import { Logo } from "@/core/ui/Logo";
import { useAuthActions } from "@/modules/auth/hooks/useAuth";

type LoginFormInput = z.input<typeof LoginSchema>;

export function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [loginError, setLoginError] = useState<string | null>(null);
	const { login } = useAuthActions();
	const { push } = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormInput, Record<string, never>, LoginInput>({
		resolver: zodResolver(LoginSchema),
		defaultValues: { email: "", password: "" },
	});

	async function onSubmit(data: LoginInput) {
		setLoginError(null);
		if (typeof navigator !== "undefined" && !navigator.onLine) {
			setLoginError("Sin conexión a internet. Conéctese a una red para iniciar sesión.");
			return;
		}
		try {
			await login(data.email, data.password);
			push("/dashboard");
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: "Error de autenticación. Verifique su conexión e intente de nuevo.";
			setLoginError(message);
		}
	}

	return (
		<div className="flex flex-col gap-10" data-login-form>
			<header>
				<Logo size="md" className="mb-10" />
				<h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
					Bienvenido de nuevo
				</h1>
				<p className="mt-2 text-base text-[var(--text-tertiary)]">
					Ingrese sus credenciales para acceder a la plataforma corporativa.
				</p>
			</header>

			{loginError && (
				<div
					role="alert"
					className="rounded-2xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] p-4 text-sm font-medium text-[var(--color-danger)] flex items-center gap-3 animate-scale-in"
				>
					<div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger)] text-white">
						<span className="text-[10px] font-bold">!</span>
					</div>
					{loginError}
				</div>
			)}

			<form
				onSubmit={handleSubmit(onSubmit)}
				noValidate
				onChange={() => loginError && setLoginError(null)}
				className="flex flex-col gap-6"
			>
				<FormField
					label="Correo electrónico"
					htmlFor="email"
					error={errors.email?.message}
					required
				>
					<TextField
						id="email"
						type="email"
						autoComplete="email"
						placeholder="correo@empresa.com"
						leftIcon={<Mail className="size-4" />}
						error={!!errors.email}
						disabled={isSubmitting}
						{...register("email")}
					/>
				</FormField>

				<FormField label="Contraseña" htmlFor="password" error={errors.password?.message} required>
					<div className="relative">
						<TextField
							id="password"
							type={showPassword ? "text" : "password"}
							autoComplete="current-password"
							placeholder="••••••••"
							leftIcon={<Lock className="size-4" />}
							error={!!errors.password}
							disabled={isSubmitting}
							{...register("password")}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
							aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
						>
							{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
						</button>
					</div>
					<div className="mt-2 text-right">
						<Link
							href="/forgot-password"
							className="text-xs font-semibold text-[var(--color-brand)] hover:underline underline-offset-4"
						>
							¿Olvidó su contraseña?
						</Link>
					</div>
				</FormField>

				<Button
					type="submit"
					disabled={isSubmitting}
					loading={isSubmitting}
					variant="primary"
					size="lg"
					className="mt-2 w-full py-6 text-base shadow-lg"
				>
					Iniciar Sesión
				</Button>
			</form>

			<div className="relative py-2">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-[var(--border-subtle)]" />
				</div>
				<div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
					<span className="bg-[var(--surface-page)] px-4">O continúe con</span>
				</div>
			</div>

			<Button
				asChild
				variant="secondary"
				size="lg"
				className="w-full py-6 border-[var(--border-medium)]"
			>
				<Link href="/register">Solicitar acceso como cliente</Link>
			</Button>

			<p className="text-center text-xs text-[var(--text-tertiary)]">
				¿Problemas para acceder?{" "}
				<Link href="/#contacto" className="font-semibold text-[var(--color-brand)] hover:underline">
					Contacte a soporte
				</Link>
			</p>
		</div>
	);
}
