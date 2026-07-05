"use client";

import { Bell } from "lucide-react";

interface Props {
	unreadCount: number;
	onClick: () => void;
}

export function NotificationBell({ unreadCount, onClick }: Props) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="relative inline-flex size-11 items-center justify-center rounded-full hover:bg-[var(--surface-secondary)] transition"
			aria-label={`Notificaciones${unreadCount > 0 ? ` — ${unreadCount} sin leer` : ""}`}
			style={{ minWidth: 44, minHeight: 44 }}
		>
			<Bell className="size-5 text-[var(--text-primary)]" aria-hidden="true" />
			{unreadCount > 0 && (
				<span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-[#F44336] text-[10px] font-bold text-white">
					{unreadCount > 99 ? "99+" : unreadCount}
				</span>
			)}
		</button>
	);
}
