"use client";

import { useGSAP } from "@gsap/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/_shared/lib/http/api-client";
import { useAuthStore } from "@/_shared/store/auth.store";
import { GuideButton } from "@/_shared/onboarding/GuideButton";
import { useAuth } from "@/auth/hooks/useAuth";
import {
	type HeaderNotificationItem,
	HeaderNotifications,
} from "@/core/ui/layout/HeaderNotifications";
import { HeaderUserMenu } from "@/core/ui/layout/HeaderUserMenu";
import { HeaderThemeToggle } from "@/core/ui/layout/ThemeToggle";

gsap.registerPlugin(useGSAP);

const ROUTE_TITLES: Record<string, string> = {
	"/dashboard": "Dashboard",
	"/orders": "Work Orders",
	"/maintenance": "Maintenance Kits",
	"/resources": "Assets and Kits",
	"/proposals": "Proposals",
	"/documents": "Documents",
	"/evidences": "Evidence",
	"/costs": "Costs",
	"/reports": "Reports",
	"/admin": "Administration",
	"/profile": "My Profile",
};

interface NotificationApiItem {
	id: string;
	titulo: string;
	mensaje: string;
	leida: boolean;
	enlace_url?: string;
	created_at: string;
}

function toHeaderNotification(notification: NotificationApiItem): HeaderNotificationItem {
	return {
		id: notification.id,
		title: notification.titulo,
		message: notification.mensaje,
		read: notification.leida,
		linkUrl: notification.enlace_url || "",
		createdAt: notification.created_at,
	};
}

export default function Header({
	sidebarOpen,
	setSidebarOpen,
}: {
	sidebarOpen: boolean;
	setSidebarOpen: (arg: boolean) => void;
}) {
	const { user, accessToken } = useAuth();
	const pathname = usePathname();
	const headerRef = useRef<HTMLElement>(null);

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const pageTitle = pathname ? ROUTE_TITLES[pathname] || "Cermont" : "Cermont";
	const section = (pathname || "").split("/").filter(Boolean)[0];
	const moduleTitle = section ? ROUTE_TITLES[`/${section}`] || section : "Cermont";

	useGSAP(
		() => {
			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				gsap.from(headerRef.current, {
					y: -20,
					opacity: 0,
					duration: 0.25,
					ease: "power3.out",
					clearProps: "all",
				});
			});
			return () => mm.revert();
		},
		{ scope: headerRef, dependencies: [] },
	);

	const { data: notificationsData, refetch: refetchNotifications } = useQuery<{
		notifications: HeaderNotificationItem[];
		unreadCount: number;
	}, Error>({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const { accessToken: currentToken } = useAuthStore.getState();
				if (!currentToken) {
					return { notifications: [] as HeaderNotificationItem[], unreadCount: 0 };
				}

				interface NotificationSuccess {
					success: true;
					data: {
						notifications: NotificationApiItem[];
						unreadCount: number;
					};
				}

				interface NotificationFailure {
					success: false;
					error: {
						message: string;
					};
				}

				const payload = await apiClient.get<NotificationSuccess | NotificationFailure>(
					"/analytics/notifications?limit=20",
				);

				if (payload.success) {
					return {
						notifications: payload.data.notifications.map(toHeaderNotification),
						unreadCount: payload.data.unreadCount,
					};
				}

				return { notifications: [] as HeaderNotificationItem[], unreadCount: 0 };
			} catch {
				return { notifications: [] as HeaderNotificationItem[], unreadCount: 0 };
			}
		},
		refetchInterval: 30_000,
		enabled: Boolean(user && accessToken),
		retry: 1,
		retryDelay: 5_000,
		staleTime: 25_000,
	});

	const notifications = notificationsData ? notificationsData.notifications : [];
	const unreadCount = notificationsData ? notificationsData.unreadCount : 0;

	// Close notifications on outside click
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			const target = e.target as Node;
			const notificationContainer = document.getElementById("header-notifications");
			if (notificationContainer && !notificationContainer.contains(target)) {
				setShowNotifications(false);
			}
		}

		if (showNotifications) {
			document.addEventListener("mousedown", handleClick);
		}

		return () => document.removeEventListener("mousedown", handleClick);
	}, [showNotifications]);

	const markAsReadMutation = useMutation({
		mutationFn: async (notificationId: string) => {
			await apiClient.patch(`/analytics/notifications/${notificationId}`);
		},
		onSuccess: () => refetchNotifications(),
	});

	const markAllReadMutation = useMutation({
		mutationFn: async () => {
			await apiClient.post("/analytics/notifications/mark-all-read");
		},
		onSuccess: () => refetchNotifications(),
	});

	return (
		<header
			ref={headerRef}
			className="sticky top-0 z-30 flex h-(--header-height) items-center justify-between border-b border-(--border-default) bg-(--surface-primary) px-4 shadow-(--shadow-1) backdrop-blur-md transition-colors sm:px-6"
		>
			{/* Left */}
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						setSidebarOpen(!sidebarOpen);
					}}
					aria-controls="sidebar"
					aria-expanded={sidebarOpen}
					aria-label={sidebarOpen ? "Close sidebar navigation" : "Open sidebar navigation"}
					className="flex h-11 w-11 items-center justify-center rounded-lg text-(--text-secondary) transition-colors hover:bg-(--surface-secondary) hover:text-(--text-primary) lg:hidden"
				>
					<Menu className="h-5 w-5" aria-hidden="true" />
				</button>
				<div className="hidden sm:block">
					<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--text-tertiary)">
						{moduleTitle}
					</p>
					<p className="text-sm font-bold text-(--text-primary)">{pageTitle}</p>
					<p className="text-[11px] text-(--text-tertiary)">Cermont S.A.S. · Asset operations</p>
				</div>
				<p className="text-sm font-bold text-(--text-primary) sm:hidden">{pageTitle}</p>
			</div>

			{/* Right controls */}
			<ul className="flex items-center gap-1.5">
				<li>
					<GuideButton />
				</li>
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
				<li>
					<HeaderThemeToggle />
				</li>
				<li>
					<HeaderUserMenu
						user={user}
						dropdownOpen={dropdownOpen}
						onToggleDropdown={() => setDropdownOpen((v) => !v)}
						onCloseDropdown={() => setDropdownOpen(false)}
					/>
				</li>
			</ul>
		</header>
	);
}
