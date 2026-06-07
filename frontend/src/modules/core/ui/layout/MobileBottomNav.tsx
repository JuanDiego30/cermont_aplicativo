"use client";

import { ClipboardList, Home, MoreHorizontal, Package, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOTION } from "@/components/motion/motion-classes";

const mobileNavItems = [
	{ href: "/dashboard", label: "Inicio", icon: Home },
	{ href: "/orders", label: "Órdenes", icon: ClipboardList },
	{ href: "/maintenance", label: "Mant.", icon: Wrench },
	{ href: "/resources", label: "Recursos", icon: Package },
	{ href: "/profile", label: "Más", icon: MoreHorizontal },
] as const;

export default function MobileBottomNav() {
	const pathname = usePathname();

	return (
		<nav
			aria-label="Navegación rápida móvil"
			className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-default)] bg-[var(--surface-primary)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
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
								className={`${MOTION.button} flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-[transform,color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] ${
									isActive ? "text-[var(--color-brand-blue)]" : "text-[var(--text-tertiary)]"
								}`}
							>
								<span
									className={`flex size-9 items-center justify-center rounded-full transition-[transform,background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] ${isActive ? "bg-[var(--color-info-bg)]" : "bg-transparent"}`}
								>
									<Icon
										className={`size-5 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] ${isActive ? "scale-110" : ""}`}
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
