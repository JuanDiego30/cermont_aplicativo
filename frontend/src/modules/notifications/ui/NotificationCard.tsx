"use client";

import {
	type AlertTriangle,
	Check,
	Clock,
	DollarSign,
	FileText,
	MessageSquare,
	X,
} from "lucide-react";

const ICON_MAP: Record<string, typeof AlertTriangle> = {
	evidence_rejected: X,
	evidence_approved: Check,
	ses_approved: FileText,
	ses_rejected: X,
	payment_received: DollarSign,
	report_generated: FileText,
	overdue: Clock,
	default: MessageSquare,
};

function getRelativeTime(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) {
		return "Ahora";
	}
	if (minutes < 60) {
		return `Hace ${minutes} min`;
	}
	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `Hace ${hours}h`;
	}
	return new Date(dateStr).toLocaleDateString("es-CO");
}

interface Notification {
	id: string;
	type: string;
	title: string;
	message: string;
	isRead: boolean;
	deepLink?: string;
	createdAt: string;
}

interface Props {
	notification: Notification;
	onClick: (notification: Notification) => void;
}

export function NotificationCard({ notification, onClick }: Props) {
	const Icon = ICON_MAP[notification.type] ?? ICON_MAP.default;

	return (
		<button
			type="button"
			onClick={() => onClick(notification)}
			className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-[var(--surface-secondary)] ${notification.isRead ? "" : "bg-blue-50/50"}`}
		>
			<span
				className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${notification.isRead ? "bg-gray-100" : "bg-blue-100"}`}
			>
				<Icon className="size-4 text-[var(--text-secondary)]" aria-hidden="true" />
			</span>
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium text-[var(--text-primary)]">{notification.title}</p>
				<p className="mt-0.5 text-xs text-[var(--text-secondary)]">{notification.message}</p>
				<p className="mt-1 text-xs text-[var(--text-tertiary)]">
					{getRelativeTime(notification.createdAt)}
				</p>
			</div>
			{!notification.isRead && (
				<span
					className="mt-2 size-2 shrink-0 rounded-full bg-[var(--color-brand-blue)]"
					role="status"
					aria-label="No leída"
				/>
			)}
		</button>
	);
}
