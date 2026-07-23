"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/core/ui/Button";
import { ThemeToggle } from "@/core/ui/ThemeToggle";
import { APP_ROUTES } from "@/lib/routes";
import { NAV_ITEMS } from "../landing-constants";

const MOBILE_NAV_ID = "landing-mobile-nav";

export function LandingMobileNav() {
	const [isOpen, setIsOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const firstLinkRef = useRef<HTMLAnchorElement>(null);
	const hasOpenedRef = useRef(false);

	const closeMenu = useCallback(() => {
		setIsOpen(false);
	}, []);

	useEffect(() => {
		if (isOpen) {
			hasOpenedRef.current = true;
			firstLinkRef.current?.focus();
			return;
		}

		if (hasOpenedRef.current) {
			hasOpenedRef.current = false;
			triggerRef.current?.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeMenu();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [closeMenu, isOpen]);

	return (
		<div className="flex items-center gap-2 lg:hidden">
			<ThemeToggle />
			<button
				ref={triggerRef}
				type="button"
				aria-controls={MOBILE_NAV_ID}
				aria-expanded={isOpen}
				aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
				onClick={() => setIsOpen((open) => !open)}
				className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-hairline bg-canvas text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/50 motion-reduce:transition-none"
			>
				{isOpen ? (
					<X className="size-5" aria-hidden="true" />
				) : (
					<Menu className="size-5" aria-hidden="true" />
				)}
			</button>

			<div
				id={MOBILE_NAV_ID}
				hidden={!isOpen}
				className="absolute inset-x-4 top-[calc(100%+0.75rem)] rounded-3xl border border-hairline bg-canvas p-3 shadow-2xl shadow-black/10 dark:shadow-black/30 sm:inset-x-6"
			>
				<nav aria-label="Navegación móvil">
					<ul className="grid gap-1">
						{NAV_ITEMS.map(({ label, href }, index) => (
							<li key={href}>
								<a
									ref={index === 0 ? firstLinkRef : undefined}
									href={href}
									onClick={closeMenu}
									className="flex min-h-11 items-center rounded-2xl px-4 text-sm font-semibold text-charcoal transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/50 motion-reduce:transition-none"
								>
									{label}
								</a>
							</li>
						))}
					</ul>
				</nav>

				<div className="mt-3 flex items-center justify-between gap-3 border-t border-hairline px-2 pt-3">
					<span className="text-xs font-medium text-slate">Preferencias</span>
					<div className="flex items-center gap-2">
						<Button asChild size="sm" variant="primary">
							<Link href={APP_ROUTES.login} onClick={closeMenu}>
								Acceso privado
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
