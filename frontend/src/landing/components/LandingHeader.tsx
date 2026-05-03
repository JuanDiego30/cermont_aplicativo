"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useRef } from "react";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";
import { Logo } from "@/core/ui/Logo";
import { CORPORATE_LOCATION, NAV_ITEMS } from "../landing-constants";

export function LandingHeader() {
	const headerRef = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			if (!headerRef.current) {
				return;
			}
			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				gsap.from(headerRef.current, {
					opacity: 0,
					y: -10,
					duration: 0.4,
					ease: "power2.out",
				});
			});
		},
		{ scope: headerRef },
	);

	return (
		<header
			ref={headerRef}
			data-landing-section
			className="sticky top-0 z-40 border-b border-white/10 bg-cermont-navy/95 backdrop-blur-xl transition-colors duration-200 dark:border-[var(--border-default)] dark:bg-[var(--surface-primary)]/95"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-center justify-between gap-4">
						<Logo href="/" className="gap-3" size="md" wordmarkClassName="text-white" />
						<Button
							asChild
							size="sm"
							variant="outline"
							className="rounded-full border-white/15 bg-white/5 px-4 text-white hover:bg-white/10 lg:hidden"
						>
							<Link href="/login">Acceso privado</Link>
						</Button>
					</div>

					<nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-2">
						{NAV_ITEMS.map(({ label, href }) => (
							<a
								key={href}
								href={href}
								className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
							>
								{label}
							</a>
						))}
					</nav>

					<div className="hidden items-center gap-3 lg:flex">
						<BadgePill
							className="border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200"
							dotClassName="bg-(--color-success)"
							ariaLabel={CORPORATE_LOCATION}
						>
							{CORPORATE_LOCATION}
						</BadgePill>
						<Button asChild size="sm" className="rounded-full px-4">
							<Link href="/login">Acceso privado</Link>
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
