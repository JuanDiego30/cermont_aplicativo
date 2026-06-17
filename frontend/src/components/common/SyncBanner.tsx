/**
 * SyncBanner — Offline/sync status banner
 *
 * Displays at the top of field pages to indicate connectivity status
 * and pending sync operations. Complements the existing OfflineBanner
 * with a more compact, page-level indicator.
 *
 * @example
 * ```tsx
 * <SyncBanner isOnline={isOnline} pendingCount={3} />
 * ```
 */

"use client";

import { AlertTriangle, CloudOff, RefreshCw, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SyncBannerProps {
	/** Whether the device is online */
	isOnline: boolean;
	/** Whether a sync operation is in progress */
	isSyncing?: boolean;
	/** Number of pending changes in the queue */
	pendingCount?: number;
	/** Last sync error message (null/empty if no error) */
	lastSyncError?: string | null;
	/** Callback to trigger manual sync */
	onSyncNow?: () => void;
	/** Additional CSS classes */
	className?: string;
}

function getBannerState(props: SyncBannerProps): {
	visible: boolean;
	icon: React.ReactNode;
	message: string;
	className: string;
} {
	const { isOnline, isSyncing, pendingCount = 0, lastSyncError } = props;

	// Offline
	if (!isOnline) {
		return {
			visible: true,
			icon: <CloudOff className="size-4 shrink-0" aria-hidden="true" />,
			message: "Sin conexión — los cambios se sincronizarán automáticamente",
			className:
				"bg-warning-bg text-brand-warn border-amber-200 dark:bg-amber-900/20 dark:text-brand-warn dark:border-amber-800",
		};
	}

	// Sync error
	if (lastSyncError) {
		return {
			visible: true,
			icon: <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />,
			message: `Error de sincronización: ${lastSyncError}`,
			className:
				"bg-danger-bg text-brand-error border-red-200 dark:bg-red-900/20 dark:text-brand-error dark:border-red-800",
		};
	}

	// Syncing
	if (isSyncing) {
		return {
			visible: true,
			icon: <RefreshCw className="size-4 shrink-0 animate-spin" aria-hidden="true" />,
			message: "Sincronizando cambios pendientes…",
			className:
				"bg-[var(--color-cermont-blue-bg)]/50 text-[var(--color-brand-blue)] border-[var(--color-cermont-blue-bg)] dark:bg-[var(--color-cermont-blue)]/20 dark:text-[var(--color-cermont-blue-light)] dark:border-[var(--color-cermont-blue)]",
		};
	}

	// Pending changes
	if (pendingCount > 0) {
		return {
			visible: true,
			icon: <Wifi className="size-4 shrink-0" aria-hidden="true" />,
			message: `${pendingCount} ${pendingCount === 1 ? "cambio pendiente" : "cambios pendientes"} de sincronizar`,
			className:
				"bg-[var(--color-cermont-blue-bg)]/50 text-[var(--color-brand-blue)] border-[var(--color-cermont-blue-bg)] dark:bg-[var(--color-cermont-blue)]/20 dark:text-[var(--color-cermont-blue-light)] dark:border-[var(--color-cermont-blue)]",
		};
	}

	// All good — hidden
	return {
		visible: false,
		icon: null,
		message: "",
		className: "",
	};
}

export function SyncBanner(props: SyncBannerProps) {
	const { visible, icon, message, className } = getBannerState(props);
	const { isOnline, pendingCount = 0, onSyncNow } = props;

	if (!visible) {
		return null;
	}

	return (
		<output
			aria-live="polite"
			className={cn("flex items-center gap-2 border-b px-4 py-2 text-sm font-medium", className)}
		>
			{icon}
			<span className="flex-1 truncate">{message}</span>
			{pendingCount > 0 && isOnline && onSyncNow && (
				<button
					type="button"
					onClick={onSyncNow}
					className={cn(
						"shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
						"bg-black/[0.08] hover:bg-black/[0.12] dark:bg-canvas/[0.12] dark:hover:bg-canvas/[0.18]",
						"focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50] focus-visible:ring-offset-1",
					)}
				>
					Sincronizar ahora
				</button>
			)}
		</output>
	);
}
