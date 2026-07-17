"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/core/ui/Button";
import { Logo } from "@/core/ui/Logo";
import { EmailField } from "./components/EmailField";
import { FormErrorBanner } from "./components/FormErrorBanner";
import { LoginSubmitButton } from "./components/LoginSubmitButton";
import { PasswordField } from "./components/PasswordField";
import { useLoginForm } from "./hooks/useLoginForm";
import { LOGIN_COPY } from "./lib/i18n";

const formVariants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" as const, staggerChildren: 0.08 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 12 },
	visible: { opacity: 1, y: 0 },
};

export function LoginForm() {
	const {
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
	} = useLoginForm();

	const emailRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (emailRef.current && isHydrated) {
			emailRef.current.focus();
		}
	}, [isHydrated]);

	const isDisabled = !isHydrated || isSubmitting || hasErrors;

	return (
		<motion.div
			className="flex flex-col gap-10"
			data-login-form
			variants={formVariants}
			initial="hidden"
			animate="visible"
		>
			<motion.header variants={itemVariants}>
				<Logo size="md" className="mb-10" />
				<h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
					{LOGIN_COPY.title}
				</h1>
				<p className="mt-2 text-base text-[var(--text-tertiary)]">
					{LOGIN_COPY.subtitle}
				</p>
			</motion.header>

			<AnimatePresence mode="wait">
				{submitError && (
					<motion.div
						key={submitError}
						variants={itemVariants}
						initial="hidden"
						animate="visible"
						exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
					>
						<FormErrorBanner message={submitError} />
					</motion.div>
				)}
			</AnimatePresence>

			<motion.form
				variants={itemVariants}
				method="post"
				onSubmit={submitHandler}
				noValidate
				onChange={clearSubmitError}
				className="flex flex-col gap-6"
				data-hydrated={isHydrated}
			>
				<EmailField
					register={register("email")}
					error={errors.email?.message}
					disabled={isDisabled}
				/>

				<PasswordField
					register={register("password")}
					error={errors.password?.message}
					disabled={isDisabled}
					showPassword={showPassword}
					onTogglePassword={() => setShowPassword(!showPassword)}
				/>

				<LoginSubmitButton disabled={isDisabled} isSubmitting={isSubmitting} />
			</motion.form>

			<motion.div variants={itemVariants}>
				<Button
					asChild
					variant="secondary"
					size="lg"
					className="w-full py-6 border-[var(--border-medium)]"
				>
					<Link href="/register">{LOGIN_COPY.registerLink}</Link>
				</Button>
			</motion.div>

			<motion.p variants={itemVariants} className="text-center text-xs text-[var(--text-tertiary)]">
				{LOGIN_COPY.supportText}{" "}
				<Link
					href="/#contacto"
					className="font-semibold text-[var(--color-brand)] hover:underline"
				>
					{LOGIN_COPY.supportLink}
				</Link>
			</motion.p>
		</motion.div>
	);
}
