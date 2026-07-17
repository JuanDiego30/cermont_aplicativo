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
			variant="primary"
			size="lg"
			className="mt-2 w-full py-6 text-base shadow-lg"
		>
			{LOGIN_COPY.submit}
		</Button>
	);
}
