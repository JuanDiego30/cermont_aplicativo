import type { ReactNode } from "react";
import { ThemeToggle } from "@/core/ui/ThemeToggle";

interface AuthPageShellProps {
	children: ReactNode;
}

export function AuthPageShell({ children }: AuthPageShellProps) {
	return (
		<main className="relative flex min-h-dvh items-center justify-center overflow-x-hidden bg-[var(--surface-page)] px-6 py-10 font-outfit selection:bg-[var(--color-brand)]/20">
			<div className="absolute right-6 top-6 z-50">
				<ThemeToggle />
			</div>
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -left-40 -top-40 size-80 rounded-full bg-[var(--color-cermont-blue-light)]/10 blur-3xl" />
				<div className="absolute -bottom-40 -right-40 size-80 rounded-full bg-[var(--color-cermont-green-light)]/10 blur-3xl" />
			</div>
			<div className="relative z-10 w-full max-w-md">{children}</div>
		</main>
	);
}
