"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useRef } from "react";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";
import { Logo } from "@/core/ui/Logo";
import { ThemeToggle } from "@/core/ui/ThemeToggle";
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
			className="sticky top-0 z-40 border-b border-hairline bg-canvas/80 backdrop-blur-xl transition-all duration-200"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-4 py-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-center justify-between gap-4">
						<Logo href="/" className="gap-3" size="md" wordmarkClassName="text-ink" />
						<div className="flex items-center gap-2 lg:hidden">
							<ThemeToggle />
							<Button asChild size="sm" variant="outline">
								<Link href="/login">Acceso privado</Link>
							</Button>
						</div>
					</div>

					<nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-1.5">
						{NAV_ITEMS.map(({ label, href }) => (
							<a
								key={href}
								href={href}
								className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-charcoal transition-all hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40"
							>
								{label}
							</a>
						))}
					</nav>

					<div className="hidden items-center gap-3 lg:flex">
						<BadgePill
							className="px-3 py-1.5 font-mono"
							dotClassName="bg-brand-annotate"
							ariaLabel={CORPORATE_LOCATION}
						>
							{CORPORATE_LOCATION}
						</BadgePill>
						<ThemeToggle />
						<Button asChild size="sm" variant="primary" className="px-5">
							<Link href="/login">Acceso privado</Link>
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
