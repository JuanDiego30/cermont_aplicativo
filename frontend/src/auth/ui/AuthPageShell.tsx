import type { ReactNode } from "react";

interface AuthPageShellProps {
	children: ReactNode;
}

export function AuthPageShell({ children }: AuthPageShellProps) {
	return (
		<main className="relative flex min-h-dvh items-center justify-center overflow-x-hidden bg-[var(--surface-page)] px-6 py-10 font-outfit selection:bg-[color:var(--color-brand-blue)]/20">
			<div role="presentation" aria-hidden="true" className="absolute inset-0 overflow-hidden">
				<div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[rgba(37,99,235,0.10)] blur-3xl" />
				<div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-[rgba(124,58,237,0.10)] blur-3xl" />
			</div>
			<div className="relative z-10 w-full max-w-md">{children}</div>
		</main>
	);
}
