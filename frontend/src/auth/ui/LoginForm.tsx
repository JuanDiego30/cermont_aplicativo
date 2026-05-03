"use client";

import { type LoginInput, LoginSchema } from "@cermont/shared-types";
import { useGSAP } from "@gsap/react";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { Eye, EyeOff, Fingerprint } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/_shared/store/auth.store";
import { toUser, useAuthActions } from "@/auth/hooks/useAuth";
import { hasPlatformAuthenticator, loginWithPasskey, supportsWebAuthn } from "@/auth/passkeys";
import { Button } from "@/core/ui/Button";

gsap.registerPlugin(useGSAP);

export function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [loginError, setLoginError] = useState<string | null>(null);
	const [passkeySupported, setPasskeySupported] = useState(false);
	const [passkeyLoading, setPasskeyLoading] = useState(false);
	const { login } = useAuthActions();
	const setAuth = useAuthStore((state) => state.setAuth);
	const router = useRouter();
	const formRef = useRef<HTMLDivElement>(null);

	// GSAP entrance animation (slide up + fade in)
	useGSAP(
		() => {
			gsap.from("[data-login-form]", {
				opacity: 0,
				y: 18,
				duration: 0.7,
				delay: 0.15,
				ease: "power2.out",
				clearProps: "all",
			});
		},
		{ scope: formRef, dependencies: [] },
	);

	useEffect(() => {
		let mounted = true;
		if (!supportsWebAuthn()) {
			setPasskeySupported(false);
			return;
		}
		void hasPlatformAuthenticator().then((available) => {
			if (mounted) {
				setPasskeySupported(available);
			}
		});
		return () => {
			mounted = false;
		};
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginInput>({
		resolver: zodResolver(LoginSchema),
		defaultValues: { email: "", password: "" },
	});

	async function onSubmit(data: LoginInput) {
		setLoginError(null);
		try {
			await login(data.email, data.password);
			router.push("/dashboard");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Error de autenticación";
			setLoginError(message);
		}
	}

	async function onPasskeyLogin() {
		setLoginError(null);
		setPasskeyLoading(true);
		try {
			const result = await loginWithPasskey();
			setAuth(toUser(result.user), result.accessToken);
			router.push("/dashboard");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "No se pudo ingresar con huella o passkey";
			setLoginError(message);
		} finally {
			setPasskeyLoading(false);
		}
	}

	return (
		<div ref={formRef} className="flex flex-col gap-6">
			<div data-login-form>
				<header>
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-200">
						Portal de clientes
					</p>
					<h1 className="mt-2 text-2xl font-semibold text-white">Iniciar sesión</h1>
					<p className="mt-2 text-sm text-slate-300">
						Ingresa tus credenciales para acceder al sistema
					</p>
				</header>

				{loginError && (
					<p
						role="alert"
						className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100"
					>
						{loginError}
					</p>
				)}

				<form
					method="POST"
					onSubmit={handleSubmit(onSubmit)}
					noValidate
					onChange={() => {
						if (loginError) {
							setLoginError(null);
						}
					}}
					className="mt-6 flex flex-col gap-4"
				>
					<div className="flex flex-col gap-2">
						<label htmlFor="email" className="text-sm font-semibold text-slate-300">
							Correo electrónico
						</label>
						<input
							id="email"
							type="email"
							autoComplete="username webauthn"
							placeholder="correo@empresa.com"
							aria-invalid={!!errors.email}
							className={`rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-[background-color,border-color,box-shadow,color] focus:bg-white/10 focus-visible:ring-4 focus-visible:ring-primary-500/20 ${
								errors.email
									? "border-red-500/50 focus:border-red-400"
									: "border-white/10 focus:border-primary-400"
							}`}
							{...register("email")}
						/>
						{errors.email && (
							<p className="text-xs text-red-400" role="alert">
								{errors.email.message}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<label htmlFor="password" className="text-sm font-semibold text-slate-300">
								Contraseña
							</label>
							<Link
								href="/forgot-password"
								className="text-xs font-medium text-primary-400 transition hover:text-primary-300"
							>
								¿Olvidaste tu contraseña?
							</Link>
						</div>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								autoComplete="current-password"
								placeholder="••••••••"
								aria-invalid={!!errors.password}
								className={`w-full rounded-xl border bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-[background-color,border-color,box-shadow,color] focus:bg-white/10 focus-visible:ring-4 focus-visible:ring-primary-500/20 ${
									errors.password
										? "border-red-500/50 focus:border-red-400"
										: "border-white/10 focus:border-primary-400"
								}`}
								{...register("password")}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-300"
								aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
							>
								{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
							</button>
						</div>
						{errors.password && (
							<p className="text-xs text-red-400" role="alert">
								{errors.password.message}
							</p>
						)}
					</div>

					<Button type="submit" loading={isSubmitting} className="w-full mt-2">
						Iniciar sesión
					</Button>
				</form>

				<div className="relative mt-6">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-white/10" />
					</div>
					<div className="relative flex justify-center text-xs">
						<span className="bg-[var(--surface-sidebar)] px-4 text-slate-500">o</span>
					</div>
				</div>

				<Button
					type="button"
					variant="outline"
					loading={passkeyLoading}
					disabled={!passkeySupported}
					onClick={onPasskeyLogin}
					className="mt-6 w-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed"
				>
					<Fingerprint className="h-4 w-4" aria-hidden="true" />
					{passkeySupported ? "Ingresar con huella o passkey" : "Huella no disponible"}
				</Button>

				<Button
					asChild
					variant="outline"
					className="w-full mt-3 border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
				>
					<Link href="/register">Solicitar acceso como cliente</Link>
				</Button>

				<Link
					href="/"
					className="mt-3 text-center text-sm text-slate-500 transition hover:text-slate-300"
				>
					Volver al inicio
				</Link>
			</div>
		</div>
	);
}
