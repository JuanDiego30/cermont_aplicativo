import Link from "next/link";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";
import { Logo } from "@/core/ui/Logo";
import { ThemeToggle } from "@/core/ui/ThemeToggle";
import { APP_ROUTES } from "@/lib/routes";
import { CORPORATE_LOCATION, NAV_ITEMS } from "../landing-constants";
import { LandingMobileNav } from "./LandingMobileNav";

export function LandingHeader() {
	return (
		<header className="sticky top-0 z-40 border-b border-hairline bg-canvas/80 backdrop-blur-xl transition-all duration-200">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-12 items-center justify-between gap-4">
					<div className="flex items-center justify-between gap-4">
						<Logo href="/" className="gap-3" size="md" hideWordmarkOnMobile={false} wordmarkClassName="text-ink" />
						<LandingMobileNav />
					</div>

					<nav
						aria-label="Navegación principal"
						className="hidden items-center gap-1 lg:flex"
					>
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
						<div className="scale-90"><ThemeToggle /></div>
						<Button asChild size="sm" className="px-5 bg-green-600 hover:bg-green-700 text-white">
							<Link href={APP_ROUTES.login} data-analytics="cta-private-access" data-analytics-label="header-login">Acceso privado</Link>
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
