"use client";

import { useGSAP } from "@gsap/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ThemeToggle } from "@/core/ui/ThemeToggle";
import { apiClient } from "@/lib/http/api-client";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
	HeaderNotifications,
	type NotificationItem,
} from "@/modules/core/ui/layout/HeaderNotifications";
import { HeaderUserMenu } from "@/modules/core/ui/layout/HeaderUserMenu";

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
	"/profile": "Mi Perfil",
};

export default function Header({
	sidebarOpen,
	setSidebarOpen,
}: {
	sidebarOpen: boolean;
	setSidebarOpen: (arg: boolean) => void;
}) {
	const { accessToken, user } = useAuth();
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
				y: -20,
				opacity: 0,
				duration: 0.5,
				ease: "power2.out",
			});
		},
		{ scope: headerRef, dependencies: [] },
	);

	const { data: notificationsData } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const payload = await apiClient.get<{
					success?: boolean;
					data?: {
						notifications?: NotificationItem[];
						unreadCount?: number;
					};
				}>("/analytics/notifications?limit=20");

				return {
					notifications: payload?.data?.notifications ?? [],
					unreadCount: payload?.data?.unreadCount ?? 0,
				};
			} catch {
				return { notifications: [] as NotificationItem[], unreadCount: 0 };
			}
		},
		// Notifications are intentionally polled at a low frequency for operational alerts.
		refetchInterval: 30_000,
		enabled: Boolean(user && accessToken),
		retry: 1,
		staleTime: 25_000,
	});

	const notifications = notificationsData?.notifications ?? [];
	const unreadCount = notificationsData?.unreadCount ?? 0;

	const markAsReadMutation = useMutation({
		mutationFn: async (notificationId: string) => {
			await apiClient.patch(`/analytics/notifications/${notificationId}`);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});

	const markAllReadMutation = useMutation({
		mutationFn: async () => {
			await apiClient.post("/analytics/notifications/mark-all-read");
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});

	return (
		<header
			ref={headerRef}
			className="sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]/80 px-4 backdrop-blur-xl transition-all duration-200 sm:px-6 shadow-sm"
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
					className="rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] lg:hidden border border-[var(--border-subtle)]"
				>
					<Menu className="size-5" aria-hidden="true" />
				</button>

				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand)] font-mono">
							{moduleTitle}
						</p>
						<span className="text-[var(--border-medium)]">•</span>
						<p className="text-[10px] font-medium text-[var(--text-muted)] font-mono uppercase">
							Arauca
						</p>
					</div>
					<h1 className="text-sm font-semibold text-[var(--text-primary)] leading-none mt-1">
						{pageTitle}
					</h1>
				</div>
			</div>

			{/* Right controls */}
			<div className="flex items-center gap-2">
				{/* Theme toggle */}
				<ThemeToggle />

				<div className="h-6 w-px bg-[var(--border-subtle)] mx-1" />

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
