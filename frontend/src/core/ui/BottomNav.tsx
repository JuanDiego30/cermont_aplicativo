"use client";

import { Camera, FolderKanban, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type NavItemKey = "dashboard" | "serviceCases" | "evidences" | "profile";

const NAV_ITEMS: Array<{
	key: NavItemKey;
	href: string;
	label: string;
	icon: typeof LayoutDashboard;
}> = [
	{ key: "dashboard", href: APP_ROUTES.dashboard, label: "Inicio", icon: LayoutDashboard },
	{ key: "serviceCases", href: APP_ROUTES.serviceCases, label: "Casos", icon: FolderKanban },
	{ key: "evidences", href: APP_ROUTES.evidences, label: "Evidencias", icon: Camera },
	{ key: "profile", href: APP_ROUTES.profile, label: "Perfil", icon: User },
];

interface BottomNavProps {
	className?: string;
}

function isActive(pathname: string, href: string): boolean {
	if (href === "/dashboard") {
		return pathname === "/dashboard" || pathname === "/";
	}
	return pathname.startsWith(href);
}

export function BottomNav({ className }: BottomNavProps) {
	const pathname = usePathname();

	return (
		<nav
			aria-label="Navegación móvil"
			data-testid="bottom-nav"
			className={cn(
				"fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--border-subtle)] bg-[var(--surface-primary)]/95 backdrop-blur-md lg:hidden",
				className,
			)}
			style={{
				paddingBottom: "env(safe-area-inset-bottom, 0px)",
				height: "calc(56px + env(safe-area-inset-bottom, 0px))",
			}}
		>
			{NAV_ITEMS.slice(0, 2).map((item) => (
				<NavLink key={item.key} item={item} active={isActive(pathname, item.href)} />
			))}
			{/* FAB slot in the middle */}
			<div className="w-16 shrink-0" aria-hidden="true" />
			{NAV_ITEMS.slice(2).map((item) => (
				<NavLink key={item.key} item={item} active={isActive(pathname, item.href)} />
			))}
		</nav>
	);
}

function NavLink({ item, active }: { item: (typeof NAV_ITEMS)[number]; active: boolean }) {
	const Icon = item.icon;
	return (
		<Link
			href={item.href}
			className={cn(
				"flex flex-1 flex-col items-center gap-1 py-2 transition-colors",
				active ? "text-[var(--color-brand)]" : "text-[var(--text-muted)]",
			)}
			aria-current={active ? "page" : undefined}
		>
			<Icon className="size-5" aria-hidden="true" />
			<span className="text-[10px] font-medium leading-none">{item.label}</span>
		</Link>
	);
}
