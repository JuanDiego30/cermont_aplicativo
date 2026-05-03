"use client";

import { Bell } from "lucide-react";
import { useUnreadNotificationCount } from "@/notifications/hooks/useNotifications";

interface NotificationBellProps {
	onClick: () => void;
	isOpen: boolean;
}

export function NotificationBell({ onClick, isOpen }: NotificationBellProps) {
	const { data: unreadCount = 0 } = useUnreadNotificationCount();
	const displayCount = unreadCount > 99 ? "99+" : String(unreadCount);

	return (
		<button
			type="button"
			onClick={onClick}
			aria-expanded={isOpen}
			aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
			className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--color-info-bg)] hover:text-[var(--color-brand-blue)]"
		>
			{unreadCount > 0 && (
				<span
					aria-hidden="true"
					className="absolute -right-1 -top-1 z-10 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold text-white"
				>
					{displayCount}
				</span>
			)}
			<Bell className="h-5 w-5" aria-hidden="true" />
		</button>
	);
}
