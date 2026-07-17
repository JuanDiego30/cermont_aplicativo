"use client";

import { CloudOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineBannerProps {
	isOnline: boolean;
	pendingCount?: number;
	onSync?: () => void;
	className?: string;
}

export function OfflineBanner({
	isOnline,
	pendingCount = 0,
	onSync,
	className,
}: OfflineBannerProps) {
	if (isOnline && pendingCount === 0) {
		return null;
	}

	const showSyncButton = !isOnline || pendingCount > 0;

	return (
		<div
			role="status"
			aria-live="polite"
			data-testid="offline-banner"
			className={cn(
				"flex items-center justify-between gap-3 rounded-[var(--radius-md)] border px-4 py-3",
				isOnline
					? "border-[var(--status-warning-muted)] bg-[var(--status-warning-muted)]"
					: "border-[var(--status-danger-muted)] bg-[var(--status-danger-muted)]",
				className,
			)}
		>
			<div className="flex items-center gap-2.5 min-w-0">
				<CloudOff
					className={cn(
						"size-5 shrink-0",
						isOnline ? "text-[var(--status-warning)]" : "text-[var(--status-danger)]",
					)}
					aria-hidden="true"
				/>
				<div className="min-w-0">
					<p className="text-sm font-semibold text-[var(--text-primary)]">
						{isOnline ? "Sincronización pendiente" : "Sin conexión"}
					</p>
					<p className="text-xs text-[var(--text-secondary)] truncate">
						{isOnline
							? `${pendingCount} ${pendingCount === 1 ? "operación pendiente" : "operaciones pendientes"} de sincronizar`
							: "Los cambios se guardarán localmente y se sincronizarán al recuperar la conexión"}
					</p>
				</div>
			</div>
			{showSyncButton && onSync && (
				<button
					type="button"
					onClick={onSync}
					disabled={!isOnline}
					className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)] disabled:opacity-50"
				>
					<RefreshCw className="size-3.5" aria-hidden="true" />
					Sincronizar
				</button>
			)}
		</div>
	);
}
