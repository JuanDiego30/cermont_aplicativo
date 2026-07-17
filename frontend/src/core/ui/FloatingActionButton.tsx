"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
	href?: string;
	onClick?: () => void;
	label?: string;
	className?: string;
}

export function FloatingActionButton({
	href = APP_ROUTES.workRequestNew,
	onClick,
	label = "Nueva solicitud",
	className,
}: FloatingActionButtonProps) {
	const router = useRouter();

	const handleClick = () => {
		if (onClick) {
			onClick();
		} else {
			router.push(href);
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label={label}
			data-testid="fab"
			className={cn(
				"fixed bottom-16 left-1/2 z-50 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--color-brand)] text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 lg:hidden",
				className,
			)}
			style={{
				boxShadow: "0 4px 12px rgba(33, 84, 166, 0.25)",
				marginBottom: "env(safe-area-inset-bottom, 0px)",
			}}
		>
			<Plus className="size-6" aria-hidden="true" />
		</button>
	);
}
