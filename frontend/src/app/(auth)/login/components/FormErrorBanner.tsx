"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface FormErrorBannerProps {
	message: string;
}

const shakeVariants = {
	initial: { x: 0 },
	shake: {
		x: [0, -8, 8, -6, 6, -3, 3, 0],
		transition: { duration: 0.4 },
	},
};

export function FormErrorBanner({ message }: FormErrorBannerProps) {
	return (
		<motion.div
			key={message}
			variants={shakeVariants}
			initial="initial"
			animate="shake"
			role="alert"
			aria-live="assertive"
			className="rounded-2xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] p-4 text-sm font-medium text-[var(--color-danger)] flex items-center gap-3"
		>
			<div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger)] text-white">
				<AlertTriangle className="size-3" />
			</div>
			{message}
		</motion.div>
	);
}
