"use client";

import { LoginSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import type { FieldErrors, Resolver, UseFormRegister } from "react-hook-form";
import type { z } from "zod";
import { useHydrated } from "@/core/hooks/useHydrated";
import { useAuthActions } from "@/modules/auth/hooks/useAuth";
import { resolveLoginError } from "../lib/errors";

type LoginFormValues = z.infer<typeof LoginSchema>;

export interface UseLoginFormReturn {
	register: UseFormRegister<LoginFormValues>;
	submitHandler: (e?: React.BaseSyntheticEvent) => Promise<void>;
	errors: FieldErrors<LoginFormValues>;
	isSubmitting: boolean;
	submitError: string | null;
	showPassword: boolean;
	isHydrated: boolean;
	hasErrors: boolean;
	setShowPassword: (show: boolean) => void;
	clearSubmitError: () => void;
}

export function useLoginForm(): UseLoginFormReturn {
	const isHydrated = useHydrated();
	const [showPassword, setShowPassword] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const { login } = useAuthActions();
	const { push } = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(LoginSchema) as unknown as Resolver<LoginFormValues>,
		defaultValues: { email: "", password: "" },
		mode: "onBlur",
		reValidateMode: "onChange",
	});

	const hasErrors = !isValid && Object.keys(errors).length > 0;

	const submitHandler = handleSubmit(
		useCallback(
			async (data: LoginFormValues) => {
				setSubmitError(null);
				if (typeof navigator !== "undefined" && !navigator.onLine) {
					setSubmitError("Sin conexión a internet. Conéctese a una red para iniciar sesión.");
					return;
				}
				try {
					await login(data.email, data.password);
					push("/dashboard");
				} catch (err) {
					setSubmitError(resolveLoginError(err));
				}
			},
			[login, push],
		),
	);

	const clearSubmitError = useCallback(() => setSubmitError(null), []);

	return {
		register,
		submitHandler,
		errors,
		isSubmitting,
		submitError,
		showPassword,
		isHydrated,
		hasErrors,
		setShowPassword,
		clearSubmitError,
	};
}
