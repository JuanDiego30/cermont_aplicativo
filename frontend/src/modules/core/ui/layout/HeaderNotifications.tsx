"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { formatDateTime } from "@/lib/utils/format-date";

export interface NotificationItem {
	id: string;
	titulo: string;
	mensaje: string;
	leida: boolean;
	enlace_url?: string | null;
	created_at: string;
}

interface HeaderNotificationsProps {
	notifications: NotificationItem[];
	unreadCount: number;
	showNotifications: boolean;
	onToggle: () => void;
	onMarkAsRead: (id: string) => Promise<void>;
	onMarkAllRead: () => Promise<void>;
}

export function HeaderNotifications({
	notifications,
	unreadCount,
	showNotifications,
	onToggle,
	onMarkAsRead,
	onMarkAllRead,
}: HeaderNotificationsProps) {
	const { push } = useRouter();
	const onToggleRef = useRef(onToggle);
	useEffect(() => {
		onToggleRef.current = onToggle;
	}, [onToggle]);
	useEffect(() => {
		if (!showNotifications) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				onToggleRef.current();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [showNotifications]);

	return (
		<li className="relative" id="header-notifications">
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={showNotifications}
				aria-controls="header-notifications-panel"
				aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
				className="relative flex size-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--color-info-bg)] hover:text-[var(--color-brand-blue)]"
			>
				{unreadCount > 0 ? (
					<span
						aria-hidden="true"
						className="absolute -right-1 -top-1 z-10 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold text-white"
					>
						{unreadCount}
					</span>
				) : null}
				<Bell className="size-5" aria-hidden="true" />
			</button>

			{showNotifications ? (
				<div
					id="header-notifications-panel"
					className="animate-scale-in origin-top-right absolute right-0 mt-2 min-w-[360px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-3)]"
				>
					<header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
						<h2
							id="header-notifications-title"
							className="text-sm font-semibold text-[var(--text-primary)]"
						>
							Notificaciones
						</h2>
						{unreadCount > 0 ? (
							<button
								type="button"
								onClick={onMarkAllRead}
								className="text-xs font-medium text-[var(--color-brand-blue)] hover:underline"
							>
								Marcar todas
							</button>
						) : null}
					</header>
					<div className="max-h-80 overflow-y-auto bg-[var(--surface-primary)]">
						{notifications.length === 0 ? (
							<p className="p-4 text-sm text-[var(--text-secondary)]">Sin notificaciones nuevas</p>
						) : (
							<ul>
								{notifications.map((notification) => (
									<li key={notification.id}>
										<button
											type="button"
											onClick={async () => {
												await onMarkAsRead(notification.id);
												if (notification.enlace_url) {
													// Use router.push for internal routes, window.open for external
													const url = notification.enlace_url;
													if (url.startsWith("http")) {
														window.open(url, "_blank", "noopener,noreferrer");
													} else {
														push(url);
													}
												}
											}}
											className={`w-full border-b border-[var(--border-subtle)] px-4 py-3 text-left transition hover:bg-[var(--surface-secondary)] ${
												notification.leida
													? "bg-[var(--surface-primary)]"
													: "bg-[var(--color-info-bg)]/70"
											}`}
										>
											<p className="text-sm font-semibold text-[var(--text-primary)]">
												{notification.titulo}
											</p>
											<p className="mt-1 text-xs text-[var(--text-secondary)]">
												{notification.mensaje}
											</p>
											<p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
												{formatDateTime(notification.created_at)}
											</p>
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			) : null}
		</li>
	);
}
