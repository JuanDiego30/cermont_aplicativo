"use client";

import {
	AlertTriangle,
	CheckCircle2,
	Loader2,
	RefreshCw,
	Trash2,
	Wifi,
	WifiOff,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { dequeue, getAll, type SyncQueueEntry } from "@/lib/offline/sync-queue";
import { useSyncStatus } from "@/lib/offline/use-sync-status";
import { cn } from "@/lib/utils";
import { useOfflineStore } from "@/store/offline.store";

// ─── Helpers ─────────────────────────────────────────────────────────

function useClickOutside(
	ref: React.RefObject<HTMLElement | null>,
	isActive: boolean,
	onOutside: () => void,
) {
	const savedCallback = useRef(onOutside);
	savedCallback.current = onOutside;

	useEffect(() => {
		if (!isActive) {
			return;
		}
		const handler = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				savedCallback.current();
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [isActive, ref]);
}

// ─── SyncStatusPopover ──────────────────────────────────────────────

interface SyncStatusPopoverProps {
	isOnline: boolean;
	status: string;
	pendingCount: number;
	deadLetterCount: number;
	queueEntryCount: number;
	onOpenQueueDrawer: () => void;
}

function SyncStatusPopover({
	isOnline,
	status,
	pendingCount,
	deadLetterCount,
	queueEntryCount,
	onOpenQueueDrawer,
}: SyncStatusPopoverProps) {
	return (
		<div className="motion-panel absolute right-0 top-11 w-80 rounded-[var(--radius-lg)] border border-border-default bg-background p-4 shadow-[var(--shadow-3)] focus:outline-none">
			<div className="flex items-center justify-between border-b border-border-default pb-3">
				<h3 className="text-sm font-semibold text-foreground">Sincronización</h3>
				<span
					className={cn(
						"inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
						isOnline ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600",
					)}
				>
					{isOnline ? "Conectado" : "Sin conexión"}
				</span>
			</div>

			<div className="py-3 space-y-2.5">
				<div className="flex justify-between text-xs">
					<span className="text-secondary-foreground">Sincronización:</span>
					<span className="font-semibold text-foreground capitalize">
						{status === "syncing" ? "En progreso" : status === "error" ? "Error" : "Inactivo"}
					</span>
				</div>

				<div className="flex justify-between text-xs">
					<span className="text-secondary-foreground">Cola de salida:</span>
					<span className="font-semibold text-foreground font-mono">{pendingCount} pendientes</span>
				</div>

				{deadLetterCount > 0 && (
					<div className="flex justify-between text-xs text-rose-500 bg-rose-500/5 p-2 rounded-md border border-rose-500/10">
						<span className="flex items-center gap-1 font-semibold">
							<AlertTriangle className="size-3.5" /> Cambios fallidos:
						</span>
						<span className="font-bold font-mono">{deadLetterCount}</span>
					</div>
				)}
			</div>

			<div className="flex flex-col gap-2 border-t border-border-default pt-2">
				<button
					type="button"
					onClick={onOpenQueueDrawer}
					className="motion-button w-full rounded-lg border border-border-default py-2 text-center text-xs font-semibold text-secondary-foreground hover:bg-secondary"
				>
					Ver cola de salida ({queueEntryCount})
				</button>

				{isOnline && pendingCount > 0 && (
					<button
						type="button"
						onClick={() => {
							window.dispatchEvent(new Event("sync-queue:changed"));
						}}
						className="motion-button flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-center text-xs font-semibold text-white hover:bg-brand-strong"
					>
						<RefreshCw className="size-3.5 animate-spin-slow" />
						Sincronizar ahora
					</button>
				)}
			</div>
		</div>
	);
}

// ─── SyncQueueDialog ────────────────────────────────────────────────

interface SyncQueueDialogProps {
	dialogRef: React.RefObject<HTMLDialogElement | null>;
	entries: SyncQueueEntry[];
	isOnline: boolean;
	onDeleteEntry: (id: string) => void;
	onDialogClose?: () => void;
}

function SyncQueueDialog({ dialogRef, entries, isOnline, onDeleteEntry, onDialogClose }: SyncQueueDialogProps) {
	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="queue-dialog-title"
			className="motion-modal relative flex h-[500px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border-default bg-background p-6 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
			onClose={() => {
				onDialogClose?.();
			}}
		>
			<button
				type="button"
				onClick={() => dialogRef.current?.close()}
				aria-label="Cerrar modal"
				className="motion-button absolute right-4 top-4 rounded-full p-1.5 text-secondary-foreground hover:bg-secondary hover:text-foreground"
			>
				<X className="size-5" />
			</button>

			<h3 id="queue-dialog-title" className="text-lg font-bold text-foreground mb-4">
				Cola de Cambios Offline ({entries.length})
			</h3>

			<div className="flex-1 space-y-3 overflow-y-auto pr-1">
				{entries.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-64 text-center">
						<CheckCircle2 className="size-12 text-emerald-500 mb-3" />
						<p className="text-sm font-semibold text-foreground">Sin cambios pendientes</p>
						<p className="text-xs text-secondary-foreground mt-1">
							Toda la información local se encuentra sincronizada con el servidor.
						</p>
					</div>
				) : (
					entries.map((entry) => (
						<div
							key={entry.id}
							className={cn(
								"motion-list-item flex items-start justify-between rounded-xl border p-3.5",
								entry.status === "dead_letter"
									? "border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10"
									: "border-border-default bg-secondary hover:bg-background",
							)}
						>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span
										className={cn(
											"px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
											entry.method === "POST"
												? "bg-emerald-500/10 text-emerald-600"
												: entry.method === "PATCH" || entry.method === "PUT"
													? "bg-blue-500/10 text-blue-600"
													: "bg-rose-500/10 text-rose-600",
										)}
									>
										{entry.method}
									</span>
									<span className="text-xs font-semibold text-foreground font-mono">
										{entry.endpoint}
									</span>
								</div>

								<div className="text-[11px] text-secondary-foreground space-y-0.5">
									<p>Creado: {new Date(entry.createdAt).toLocaleString()}</p>
									<p className="font-mono text-[10px] text-muted-foreground">
										Idempotency: {entry.idempotencyKey.slice(0, 16)}...
									</p>
									{entry.lastError && (
										<p className="text-rose-500 mt-1 font-medium bg-rose-500/10 p-1.5 rounded border border-rose-500/10">
											Error: {entry.lastError}
										</p>
									)}
								</div>
							</div>

							<button
								type="button"
								onClick={() => onDeleteEntry(entry.id)}
								aria-label={`Eliminar cambio ${entry.id}`}
								className="motion-button self-center rounded-lg p-2 text-rose-500 hover:bg-rose-500/10"
							>
								<Trash2 className="size-4" />
							</button>
						</div>
					))
				)}
			</div>

			<div className="mt-4 pt-4 border-t border-border-default flex justify-end gap-3">
				<button
					type="button"
					onClick={() => dialogRef.current?.close()}
					className="motion-button rounded-full border border-border-default px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary"
				>
					Cerrar
				</button>
				{isOnline && entries.length > 0 && (
					<button
						type="button"
						onClick={() => {
							window.dispatchEvent(new Event("sync-queue:changed"));
						}}
						className="motion-button flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-strong"
					>
						<RefreshCw className="size-3.5" /> Sincronizar cola
					</button>
				)}
			</div>
		</dialog>
	);
}

// ─── NetworkStatusChip ──────────────────────────────────────────────

export function NetworkStatusChip() {
	const { isOnline, pendingCount, isSyncing, lastSyncError } = useSyncStatus();
	const deadLetterCount = useOfflineStore((state) => state.failedCount);
	const status = isSyncing ? "syncing" : lastSyncError ? "error" : "idle";
	const [isOpen, setIsOpen] = useState(false);
	const [queueEntries, setQueueEntries] = useState<SyncQueueEntry[]>([]);
	const popoverRef = useRef<HTMLDivElement | null>(null);
	const queueDialogRef = useRef<HTMLDialogElement | null>(null);

	useClickOutside(popoverRef, isOpen, () => setIsOpen(false));

	const refreshQueueEntries = useCallback(async () => {
		try {
			const entries = await getAll();
			setQueueEntries(entries);
		} catch {
			// no-op: queue list can retry from drawer actions
		}
	}, []);

	const openQueueDrawer = useCallback(async () => {
		await refreshQueueEntries();
		queueDialogRef.current?.showModal();
	}, [refreshQueueEntries]);

	const handleDeleteEntry = useCallback(
		async (id: string) => {
			try {
				await dequeue(id);
				await refreshQueueEntries();
				window.dispatchEvent(new Event("sync-queue:changed"));
			} catch (error) {
				if (process.env.NODE_ENV !== "production") {
					console.error("Failed to delete queue entry", error);
				}
			}
		},
		[refreshQueueEntries],
	);

	// Determine status details
	let state: "online" | "offline" | "syncing" | "sync_error" = "online";
	let icon = <Wifi className="size-4" />;
	let text = "En línea";
	let badgeColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

	if (deadLetterCount > 0) {
		state = "sync_error";
		icon = <AlertTriangle className="size-4 animate-pulse" />;
		text = `${deadLetterCount} alerta${deadLetterCount > 1 ? "s" : ""}`;
		badgeColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
	} else if (status === "syncing") {
		state = "syncing";
		icon = <Loader2 className="size-4 animate-spin" />;
		text = "Sincronizando...";
		badgeColor = "bg-sky-500/10 text-sky-500 border-sky-500/20";
	} else if (!isOnline) {
		state = "offline";
		icon = <WifiOff className="size-4" />;
		text = pendingCount > 0 ? `${pendingCount} pendiente${pendingCount > 1 ? "s" : ""}` : "Offline";
		badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
	} else if (pendingCount > 0) {
		state = "online";
		icon = <Wifi className="size-4 text-emerald-500" />;
		text = `${pendingCount} pendiente${pendingCount > 1 ? "s" : ""}`;
		badgeColor = "bg-sky-500/10 text-sky-500 border-sky-500/20";
	}

	return (
		<div className="relative z-40 flex items-center" ref={popoverRef}>
			{/* Network status clickable chip badge */}
			<button
				type="button"
				onClick={() => setIsOpen((current) => !current)}
				aria-expanded={isOpen}
				aria-haspopup="true"
				aria-label={`Estado de red: ${text}. Presione para ver detalles.`}
				data-state={state}
				className={cn(
					"motion-button flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold font-mono shadow-sm bg-background",
					badgeColor,
				)}
			>
				{icon}
				<span className="hidden sm:inline">{text}</span>
			</button>

			{/* Dropdown Popover */}
			{isOpen && (
				<SyncStatusPopover
					isOnline={isOnline}
					status={status}
					pendingCount={pendingCount}
					deadLetterCount={deadLetterCount}
					queueEntryCount={queueEntries.length}
					onOpenQueueDrawer={openQueueDrawer}
				/>
			)}

			{/* Queue manager dialog — always mounted, controlled via showModal/close */}
			<SyncQueueDialog
				dialogRef={queueDialogRef}
				entries={queueEntries}
				isOnline={isOnline}
				onDeleteEntry={handleDeleteEntry}
				onDialogClose={() => {
					refreshQueueEntries().catch(() => {});
				}}
			/>
		</div>
	);
}
