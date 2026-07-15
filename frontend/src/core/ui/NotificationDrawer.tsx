"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, X } from "lucide-react";
import { useNotifications } from "@/modules/notifications/hooks/useNotifications";
import { markAsRead } from "@/modules/notifications/api/notification.api";

interface NotificationDrawerProps {
	open: boolean;
	onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
	const { data: notifications, isLoading } = useNotifications();
	const queryClient = useQueryClient();

	const handleMarkAsRead = async (id: string) => {
		await markAsRead(id);
		queryClient.invalidateQueries({ queryKey: ["notifications"] });
	};

	if (!open) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50">
			<button
				type="button"
				className="absolute inset-0 bg-black/30 cursor-default"
				onClick={onClose}
				aria-label="Cerrar panel de notificaciones"
			/>
			<div className="absolute right-0 top-0 h-full w-full max-w-sm border-l border-[var(--border-default)] bg-[var(--surface-primary)] shadow-xl">
				<div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
					<h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
						<Bell className="size-4" />
						Notificaciones
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
						aria-label="Cerrar notificaciones"
					>
						<X className="size-5" />
					</button>
				</div>

				<div className="h-full overflow-y-auto pb-20">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="size-6 animate-spin text-brand" />
						</div>
					) : !notifications || notifications.length === 0 ? (
						<div className="px-4 py-12 text-center text-sm text-[var(--text-secondary)]">
							No tienes notificaciones
						</div>
					) : (
						<ul className="divide-y divide-[var(--border-subtle)]">
							{notifications.map((n) => (
								<li
									key={n._id}
									className={`px-4 py-3 hover:bg-[var(--surface-secondary)] ${
										!n.isRead ? "bg-brand/5" : ""
									}`}
								>
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium text-[var(--text-primary)]">
												{n.title}
											</p>
											<p className="mt-0.5 text-xs text-[var(--text-secondary)]">
												{n.message}
											</p>
										</div>
										{!n.isRead && (
											<button
												type="button"
												onClick={() => handleMarkAsRead(n._id)}
												className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium text-brand hover:bg-brand/10"
											>
												Leída
											</button>
										)}
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
