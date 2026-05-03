"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn, useHasMounted } from "@/_shared/lib/utils";
import { useUIStore } from "@/_shared/store/ui.store";

const PUBLIC_ROUTE_PREFIXES = [
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
	"/offline",
	"/unauthorized",
];

function isPublicSurface(pathname: string | null): boolean {
	if (!pathname || pathname === "/") {
		return true;
	}

	return PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function ThemeToggle({ className }: { className?: string }) {
	return <ThemeToggleButton className={className} mode="floating-public" />;
}

export function HeaderThemeToggle({ className }: { className?: string }) {
	return <ThemeToggleButton className={className} mode="inline" />;
}

function ThemeToggleButton({
	className,
	mode,
}: {
	className?: string;
	mode: "floating-public" | "inline";
}) {
	const pathname = usePathname();
	const { theme, hydrateTheme, toggleTheme } = useUIStore();
	const mounted = useHasMounted();
	const isDarkTheme = theme === "dark";
	const isPublic = isPublicSurface(pathname);

	useEffect(() => {
		hydrateTheme();
	}, [hydrateTheme]);

	if (mode === "floating-public" && !isPublic) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label={
				mounted ? (isDarkTheme ? "Switch to light mode" : "Switch to dark mode") : "Change theme"
			}
			aria-pressed={mounted ? isDarkTheme : false}
			className={cn(
				"inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)] shadow-[var(--shadow-1)] transition-[background-color,color,box-shadow,transform] duration-150 hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-blue)]/20",
				mode === "floating-public" ? "fixed right-4 top-4 z-40 shadow-(--shadow-2)" : "shrink-0",
				className,
			)}
		>
			{mounted ? (
				isDarkTheme ? (
					<Sun className="h-4.5 w-4.5" aria-hidden="true" />
				) : (
					<Moon className="h-4.5 w-4.5" aria-hidden="true" />
				)
			) : (
				<SunMoon className="h-4.5 w-4.5" aria-hidden="true" />
			)}
		</button>
	);
}
