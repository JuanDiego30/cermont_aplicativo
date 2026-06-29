"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/http/api-client";

/**
 * NotificationBadge — Shows unread notification count next to bell icon
 * Used in the app header to alert users of pending notifications
 */
export function NotificationBadge() {
	const { data } = useQuery<{ unread: number }>({
		queryKey: ["notifications", "unread-count"],
		queryFn: async () => {
			const json = await apiClient.get<{ success: boolean; data: { unread: number } }>(
				"/notifications/unread-count",
			);
			return json.data;
		},
		refetchInterval: 30_000,
	});

	const unread = data?.unread ?? 0;

	return (
		<Link
			href="/notifications"
			className="relative flex size-9 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
			aria-label={`Notificaciones${unread > 0 ? ` (${unread} sin leer)` : ""}`}
		>
			<Bell className="size-5" aria-hidden="true" />
			{unread > 0 && (
				<span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-bold leading-none text-white">
					{unread > 99 ? "99+" : unread}
				</span>
			)}
		</Link>
	);
}
