"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export interface HeaderNotificationItem {
	id: string;
	title: string;
	message: string;
	read: boolean;
	linkUrl?: string;
	createdAt: string;
}

interface HeaderNotificationsProps {
	notifications: HeaderNotificationItem[];
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
	const router = useRouter();
	useEffect(() => {
		if (!showNotifications) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				onToggle();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [showNotifications, onToggle]);

	return (
		<li className="relative" id="header-notifications">
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={showNotifications}
				aria-controls="header-notifications-panel"
				aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
				className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--color-info-bg)] hover:text-[var(--color-brand-blue)]"
			>
				{unreadCount > 0 ? (
					<span
						aria-hidden="true"
						className="absolute -right-1 -top-1 z-10 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold text-white"
					>
						{unreadCount}
					</span>
				) : null}
				<Bell className="h-5 w-5" aria-hidden="true" />
			</button>

			{showNotifications ? (
				<div
					id="header-notifications-panel"
					className="absolute right-0 mt-2 min-w-[360px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-3)]"
				>
					<header className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3">
						<h2
							id="header-notifications-title"
							className="text-sm font-semibold text-[var(--text-primary)]"
						>
							Notifications
						</h2>
						{unreadCount > 0 ? (
							<button
								type="button"
								onClick={onMarkAllRead}
								className="text-xs font-medium text-[var(--color-brand-blue)] hover:underline"
							>
								Mark all read
							</button>
						) : null}
					</header>
					<div className="max-h-80 overflow-y-auto bg-[var(--surface-primary)]">
						{notifications.length === 0 ? (
							<p className="p-4 text-sm text-[var(--text-secondary)]">No new notifications</p>
						) : (
							<ul>
								{notifications.map((notification) => (
									<li key={notification.id}>
										<button
											type="button"
											onClick={async () => {
												await onMarkAsRead(notification.id);
												if (notification.linkUrl) {
													const url = notification.linkUrl;
													if (url.startsWith("http")) {
														window.open(url, "_blank", "noopener,noreferrer");
													} else {
														router.push(url);
													}
												}
											}}
											className={`w-full border-b border-[var(--border-default)] px-4 py-3 text-left transition hover:bg-[var(--surface-secondary)] ${
												notification.read
													? "bg-[var(--surface-primary)]"
													: "bg-[var(--color-info-bg)]/70"
											}`}
										>
											<p className="text-sm font-semibold text-[var(--text-primary)]">
												{notification.title}
											</p>
											<p className="mt-1 text-xs text-[var(--text-secondary)]">
												{notification.message}
											</p>
											<p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
												{new Date(notification.createdAt).toLocaleString("en-US")}
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
