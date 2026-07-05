"use client";

import { CheckCheck, X } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onMarkAllRead: () => void;
	children: ReactNode;
}

export function NotificationPanel({ isOpen, onClose, onMarkAllRead, children }: Props) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50">
			<button
				type="button"
				className="absolute inset-0 bg-black/30"
				aria-label="Cerrar panel de notificaciones"
				onClick={onClose}
			/>
			<div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto border-l border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-xl">
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-primary)] px-5 py-4">
					<h2 className="text-lg font-semibold text-[var(--text-primary)]">Notificaciones</h2>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={onMarkAllRead}
							className="text-xs text-[var(--color-brand-blue)] hover:underline"
						>
							<CheckCheck className="size-4" aria-hidden="true" />
							<span className="sr-only">Marcar todas como leídas</span>
						</button>
						<button type="button" onClick={onClose} className="text-[var(--text-secondary)]">
							<X className="size-5" aria-hidden="true" />
						</button>
					</div>
				</div>
				<div className="divide-y divide-[var(--border-subtle)]">{children}</div>
			</div>
		</div>
	);
}
