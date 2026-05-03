"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { NotificationItem } from "@/notifications/hooks/useNotifications";
import { useMarkAllNotificationsAsRead } from "@/notifications/hooks/useNotifications";

interface NotificationDropdownProps {
	notifications: NotificationItem[];
	unreadCount: number;
	onMarkAsRead: (id: string) => void;
	onClose: () => void;
}

export function NotificationDropdown({
	notifications,
	unreadCount,
	onMarkAsRead,
	onClose,
}: NotificationDropdownProps) {
	const router = useRouter();
	const { mutateAsync: markAllRead } = useMarkAllNotificationsAsRead();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	const handleMarkAllRead = async () => {
		await markAllRead();
	};

	const handleNotificationClick = async (notification: NotificationItem) => {
		onMarkAsRead(notification.id);
		if (notification.actionUrl) {
			if (notification.actionUrl.startsWith("http")) {
				window.open(notification.actionUrl, "_blank", "noopener,noreferrer");
			} else {
				router.push(notification.actionUrl);
			}
		}
	};

	const formatRelativeTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) {
			return "Ahora";
		}
		if (diffMins < 60) {
			return `Hace ${diffMins} min`;
		}
		if (diffHours < 24) {
			return `Hace ${diffHours} h`;
		}
		if (diffDays < 7) {
			return `Hace ${diffDays} d`;
		}
		return date.toLocaleDateString("es-ES");
	};

	const typeColors: Record<string, { bg: string; dot: string }> = {
		info: { bg: "bg-[var(--color-info-bg)]/70", dot: "bg-[var(--color-info)]" },
		warning: { bg: "bg-[var(--color-warning-bg)]/70", dot: "bg-[var(--color-warning)]" },
		success: { bg: "bg-[var(--color-success-bg)]/70", dot: "bg-[var(--color-success)]" },
		error: { bg: "bg-[var(--color-danger-bg)]/70", dot: "bg-[var(--color-danger)]" },
	};

	return (
		<div
			ref={containerRef}
			className="absolute right-0 z-50 mt-2 min-w-[360px] max-w-[420px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-3)]"
		>
			<header className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3">
				<h2 className="text-sm font-semibold text-[var(--text-primary)]">Notificaciones</h2>
				{unreadCount > 0 && (
					<button
						type="button"
						onClick={handleMarkAllRead}
						className="text-xs font-medium text-[var(--color-brand-blue)] hover:underline"
					>
						Marcar todas como leídas
					</button>
				)}
			</header>

			<div className="max-h-[400px] overflow-y-auto">
				{notifications.length === 0 ? (
					<p className="p-4 text-sm text-[var(--text-secondary)]">No hay notificaciones</p>
				) : (
					<ul>
						{notifications.map((notification) => {
							const colors = typeColors[notification.type] || typeColors.info;
							return (
								<li key={notification.id}>
									<button
										type="button"
										onClick={() => handleNotificationClick(notification)}
										className={`flex w-full gap-3 border-b border-[var(--border-default)] px-4 py-3 text-left transition hover:bg-[var(--surface-secondary)] ${
											notification.read ? "bg-[var(--surface-primary)]" : colors.bg
										}`}
									>
										<span
											className={`mt-1 h-2 w-2 shrink-0 rounded-full ${colors.dot} ${notification.read ? "opacity-40" : ""}`}
											aria-hidden="true"
										/>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-semibold text-[var(--text-primary)]">
												{notification.title}
											</p>
											<p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">
												{notification.message}
											</p>
											<p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
												{formatRelativeTime(notification.createdAt)}
											</p>
										</div>
									</button>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
}
