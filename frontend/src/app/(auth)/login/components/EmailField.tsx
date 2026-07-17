"use client";

import { Mail } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FormField, TextField } from "@/core/ui/FormField";
import { LOGIN_COPY } from "../lib/i18n";

interface EmailFieldProps {
	register: UseFormRegisterReturn;
	error?: string;
	disabled?: boolean;
}

export function EmailField({ register, error, disabled }: EmailFieldProps) {
	return (
		<FormField label={LOGIN_COPY.emailLabel} htmlFor="email" error={error} required>
			<TextField
				id="email"
				type="email"
				autoComplete="email"
				placeholder={LOGIN_COPY.emailPlaceholder}
				leftIcon={<Mail className="size-4" />}
				error={!!error}
				disabled={disabled}
				aria-describedby={error ? "email-error" : undefined}
				{...register}
			/>
		</FormField>
	);
}
