"use client";

import { useGSAP } from "@gsap/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { NetworkStatusChip } from "@/components/sync/NetworkStatusChip";
import { ThemeToggle } from "@/core/ui/ThemeToggle";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
	HeaderNotifications,
	type NotificationItem,
} from "@/modules/core/ui/layout/HeaderNotifications";
import { HeaderUserMenu } from "@/modules/core/ui/layout/HeaderUserMenu";
import { markAllAsRead, markAsRead, notificationKeys, useNotifications, useUnreadCount } from "@/modules/notifications";

gsap.registerPlugin(useGSAP);

const ROUTE_TITLES: Record<string, string> = {
	"/dashboard": "Panel de Control",
	"/orders": "Órdenes de Trabajo",
	"/maintenance": "Mantenimientos",
	"/resources": "Recursos & Kits",
	"/proposals": "Propuestas",
	"/documents": "Documentos",
	"/evidences": "Evidencias",
	"/costs": "Costos",
	"/reports": "Reportes",
	"/admin": "Administración",
	"/admin/audit": "Registro de Auditoría",
	"/profile": "Mi Perfil",
};

export default function Header({
	sidebarOpen,
	setSidebarOpen,
}: {
	sidebarOpen: boolean;
	setSidebarOpen: (arg: boolean) => void;
}) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const pathname = usePathname();
	const headerRef = useRef<HTMLElement>(null);

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);

	const cleanPath = pathname?.split("?")[0] || "";
	const pageTitle =
		ROUTE_TITLES[cleanPath] || ROUTE_TITLES[`/${cleanPath.split("/")[1]}`] || "Cermont";

	const section = cleanPath.split("/").filter(Boolean)[0];
	const moduleTitle = section ? ROUTE_TITLES[`/${section}`] || section : "Cermont";

	// Entrance animation
	useGSAP(
		() => {
			if (prefersReducedMotion()) {
				return;
			}
			gsap.from(headerRef.current, {
				y: -8,
				opacity: 0,
				duration: 0.22,
				ease: "power3.out",
			});
		},
		{ scope: headerRef, dependencies: [] },
	);

	const { data: notificationList } = useNotifications();
	const unreadCount = (useUnreadCount().data ?? 0) as number;
	const notifications = (notificationList ?? []).map(
		(n): NotificationItem => ({
			id: n._id,
			titulo: n.title,
			mensaje: n.message,
			leida: n.isRead,
			enlace_url: n.deepLink ?? null,
			created_at: n.createdAt,
		}),
	);

	const markAsReadMutation = useMutation({
		mutationFn: markAsRead,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
		},
	});

	const markAllReadMutation = useMutation({
		mutationFn: markAllAsRead,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
		},
	});

	return (
		<header
			ref={headerRef}
			className="motion-panel sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between border-b border-border-default bg-background/92 px-4 shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-xl sm:px-6"
		>
			{/* Left */}
			<div className="flex items-center gap-4">
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						setSidebarOpen(!sidebarOpen);
					}}
					aria-controls="sidebar"
					aria-expanded={sidebarOpen}
					aria-label={sidebarOpen ? "Cerrar navegación" : "Abrir navegación"}
					className="motion-button rounded-full border border-border-default p-2 text-secondary-foreground hover:bg-secondary hover:text-foreground lg:hidden"
				>
					<Menu className="size-5" aria-hidden="true" />
				</button>

				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand font-mono">
							{moduleTitle}
						</p>
						<span className="text-border-medium">•</span>
						<p className="text-[10px] font-medium text-muted-foreground font-mono uppercase">
							Arauca
						</p>
					</div>
					<h1 className="mt-1 text-sm font-semibold leading-none text-foreground [text-wrap:balance]">
						{pageTitle}
					</h1>
				</div>
			</div>

			{/* Right controls */}
			<div className="flex items-center gap-2">
				{/* Network Status Chip */}
				<NetworkStatusChip />

				<div className="h-6 w-px bg-border-default mx-1" />

				{/* Theme toggle */}
				<ThemeToggle />

				<div className="h-6 w-px bg-border-default mx-1" />

				{/* Notifications */}
				<HeaderNotifications
					notifications={notifications}
					unreadCount={unreadCount}
					showNotifications={showNotifications}
					onToggle={() => setShowNotifications((v) => !v)}
					onMarkAsRead={async (id) => {
						await markAsReadMutation.mutateAsync(id);
					}}
					onMarkAllRead={async () => {
						await markAllReadMutation.mutateAsync();
					}}
				/>

				{/* User Menu */}
				<HeaderUserMenu
					user={user}
					dropdownOpen={dropdownOpen}
					onToggleDropdown={() => setDropdownOpen((v) => !v)}
					onCloseDropdown={() => setDropdownOpen(false)}
				/>
			</div>
		</header>
	);
}
