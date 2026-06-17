"use client";

/**
 * OfflineUploadQueueStatus — Display pending offline file uploads
 *
 * Reads the same sync-queue state used by `useSyncStatus` (online flag,
 * pending mutation count, syncing flag, last sync error) and renders a
 * compact, dismissible status card designed for evidence-heavy pages
 * where the user may be working without connectivity.
 *
 * This card is meant to be embedded at the top of evidence / execution /
 * delivery-record pages. When there are no pending items AND the user is
 * online, it renders nothing — so it can always be left mounted.
 *
 * RBAC: server-side; this component is purely presentational.
 */

import { AlertTriangle, CheckCircle2, CloudOff, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/core/ui/Button";
import { useSyncStatus } from "@/lib/offline/use-sync-status";

export interface OfflineUploadQueueStatusProps {
	/**
	 * If provided, this entity id is shown to the user so they can confirm
	 * which entity's pending uploads are listed. Useful when the same page
	 * has multiple entities.
	 */
	entityHint?: string;
	/**
	 * When true, render a "Reintentar ahora" button that dispatches a
	 * `sync-queue:trigger` event the global sync manager can listen to.
	 */
	allowManualRetry?: boolean;
	className?: string;
}

type Visibility = "visible" | "dismissed";

function pluralize(count: number, singular: string, plural: string): string {
	return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

export function OfflineUploadQueueStatus({
	entityHint,
	allowManualRetry = true,
	className = "",
}: OfflineUploadQueueStatusProps) {
	const { isOnline, pendingCount, isSyncing, lastSyncError } = useSyncStatus();
	const [visibility, setVisibility] = useState<Visibility>("visible");

	// Reset dismissed state whenever the queue state meaningfully changes
	// (e.g. user goes offline again, or new pending items arrive).
	useEffect(() => {
		if (!isOnline || pendingCount > 0 || lastSyncError) {
			setVisibility("visible");
		}
	}, [isOnline, pendingCount, lastSyncError]);

	const handleManualSync = useCallback(() => {
		if (typeof window === "undefined") {
			return;
		}
		window.dispatchEvent(new CustomEvent("sync-queue:trigger"));
	}, []);

	const isOffline = !isOnline;
	const hasErrors = Boolean(lastSyncError);

	// Nothing to show → return null (no DOM noise when all is well).
	if (visibility === "dismissed") {
		return null;
	}
	if (isOnline && pendingCount === 0 && !hasErrors) {
		return null;
	}

	let icon: React.ReactNode;
	let title: string;
	let body: React.ReactNode;
	let tone: string;

	if (hasErrors) {
		icon = <AlertTriangle className="h-5 w-5" aria-hidden="true" />;
		title = "Fallos de sincronización";
		body = (
			<p className="text-xs">
				{lastSyncError}
				{pendingCount > 0
					? ` · ${pluralize(pendingCount, "cambio aún en cola", "cambios aún en cola")}.`
					: ""}
			</p>
		);
		tone = "border-red-200 bg-danger-bg text-brand-error";
	} else if (isOffline) {
		icon = <WifiOff className="h-5 w-5" aria-hidden="true" />;
		title = "Sin conexión";
		body = (
			<p className="text-xs">
				{pendingCount > 0
					? `Tus fotos y cambios se guardan en este dispositivo.${entityHint ? ` (${entityHint})` : ""}`
					: "Las fotos y cambios nuevos se guardarán localmente hasta que vuelvas a tener señal."}
			</p>
		);
		tone = "border-amber-200 bg-warning-bg text-brand-warn";
	} else if (isSyncing) {
		icon = <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />;
		title = "Sincronizando";
		body = (
			<p className="text-xs">
				Subiendo {pluralize(pendingCount, "cambio pendiente", "cambios pendientes")}…
			</p>
		);
		tone = "border-sky-200 bg-sky-50 text-brand-green";
	} else {
		// Online + pending items, not currently syncing → waiting to flush
		icon = <CloudOff className="h-5 w-5" aria-hidden="true" />;
		title = "Cambios pendientes de sincronizar";
		body = (
			<p className="text-xs">
				{pluralize(pendingCount, "cambio espera", "cambios esperan")} para subirse al servidor.
			</p>
		);
		tone = "border-emerald-200 bg-emerald-50 text-brand-annotate";
	}

	return (
		<section
			role="status"
			aria-live="polite"
			className={`flex items-start gap-3 rounded-xl border p-3 ${tone} ${className}`}
		>
			<div className="mt-0.5 shrink-0">{icon}</div>
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium">{title}</p>
				{body}
			</div>
			<div className="flex shrink-0 items-center gap-1">
				{allowManualRetry && isOnline && pendingCount > 0 ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleManualSync}
						disabled={isSyncing}
					>
						<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
						Reintentar
					</Button>
				) : null}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => setVisibility("dismissed")}
					aria-label="Cerrar aviso de sincronización"
				>
					Cerrar
				</Button>
			</div>
			{!isOffline && !hasErrors && pendingCount === 0 && isOnline ? (
				<CheckCircle2 className="h-5 w-5 shrink-0 text-brand-annotate" aria-hidden="true" />
			) : null}
		</section>
	);
}
