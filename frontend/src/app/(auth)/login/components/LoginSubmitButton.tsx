"use client";

import { Button } from "@/core/ui/Button";
import { LOGIN_COPY } from "../lib/i18n";

interface LoginSubmitButtonProps {
	disabled?: boolean;
	isSubmitting: boolean;
}

export function LoginSubmitButton({ disabled, isSubmitting }: LoginSubmitButtonProps) {
	return (
		<Button
			type="submit"
			disabled={disabled}
			loading={isSubmitting}
			size="lg"
			className="mt-2 w-full py-6 text-base shadow-lg bg-green-600 hover:bg-green-700 active:bg-green-800 text-white disabled:opacity-50"
		>
			{LOGIN_COPY.submit}
		</Button>
	);
}
