"use client";

import { ClipboardList, Home, MoreHorizontal, Package, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileNavItems = [
	{ href: "/dashboard", label: "Home", icon: Home },
	{ href: "/orders", label: "Orders", icon: ClipboardList },
	{ href: "/maintenance", label: "Kits", icon: Wrench },
	{ href: "/resources", label: "Assets", icon: Package },
	{ href: "/profile", label: "More", icon: MoreHorizontal },
] as const;

export default function MobileBottomNav() {
	const pathname = usePathname();

	return (
		<nav
			aria-label="Mobile quick navigation"
			className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-default)] bg-[var(--surface-primary)]/95 backdrop-blur lg:hidden"
		>
			<ul className="grid grid-cols-5">
				{mobileNavItems.map(({ href, icon: Icon, label }) => {
					const isActive =
						pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

					return (
						<li key={href}>
							<Link
								href={href}
								aria-current={isActive ? "page" : undefined}
								className={`flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-all ${
									isActive ? "text-[var(--color-brand-blue)]" : "text-[var(--text-tertiary)]"
								}`}
							>
								<span
									className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors active:scale-[0.97] ${isActive ? "bg-[var(--color-info-bg)]" : "bg-transparent"}`}
								>
									<Icon
										className={`h-5 w-5 transition-transform duration-150 ${isActive ? "scale-110" : ""}`}
										strokeWidth={isActive ? 2.5 : 2}
										aria-hidden="true"
									/>
								</span>
								<span className="truncate">{label}</span>
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
