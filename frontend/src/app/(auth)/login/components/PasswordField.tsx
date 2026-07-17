"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FormField, TextField } from "@/core/ui/FormField";
import { LOGIN_COPY } from "../lib/i18n";

interface PasswordFieldProps {
	register: UseFormRegisterReturn;
	error?: string;
	disabled?: boolean;
	showPassword: boolean;
	onTogglePassword: () => void;
}

export function PasswordField({
	register,
	error,
	disabled,
	showPassword,
	onTogglePassword,
}: PasswordFieldProps) {
	return (
		<FormField label={LOGIN_COPY.passwordLabel} htmlFor="password" error={error} required>
			<div className="relative">
				<TextField
					id="password"
					type={showPassword ? "text" : "password"}
					autoComplete="current-password"
					placeholder={LOGIN_COPY.passwordPlaceholder}
					leftIcon={<Lock className="size-4" />}
					error={!!error}
					disabled={disabled}
					aria-describedby={error ? "password-error" : undefined}
					{...register}
				/>
				<button
					type="button"
					disabled={disabled}
					onClick={onTogglePassword}
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
					{LOGIN_COPY.forgotPassword}
				</Link>
			</div>
		</FormField>
	);
}
