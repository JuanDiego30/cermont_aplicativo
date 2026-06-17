"use client";

import type { OfflineOutboxItem } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangle,
	CloudOff,
	CloudUpload,
	GitCompareArrows,
	RefreshCw,
	Server,
	Trash2,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ErrorFallback } from "@/components/common/ErrorFallback";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import type { BlobOutboxEntry } from "@/lib/offline/blob-outbox";
import {
	discardOfflineRecoveryItem,
	discardOfflineUpload,
	listOfflineRecoverySnapshot,
	resolveOfflineConflict,
	retryOfflineRecoveryItem,
	retryOfflineUpload,
} from "@/lib/offline/offline-recovery";
import { QUEUE_CHANGED_EVENT } from "@/lib/offline/sync-queue";
import { useSyncStatus } from "@/lib/offline/use-sync-status";
import { formatDateTime } from "@/lib/utils/format-date";

const RECOVERY_QUERY_KEY = ["offline", "recovery"] as const;

const ENTITY_LABELS: Record<OfflineOutboxItem["entityType"], string> = {
	work_request: "Solicitud de trabajo",
	site_visit: "Visita técnica",
	proposal: "Propuesta",
	purchase_order: "Orden de compra",
	work_order: "Orden de trabajo",
	planning_packet: "Planeación",
	execution_session: "Ejecución",
	checklist_submission: "Checklist",
	evidence: "Evidencia",
	technical_report: "Informe técnico",
	delivery_record: "Acta de entrega",
	client_acceptance: "Aceptación del cliente",
	service_entry_sheet: "SES / Ariba",
	invoice: "Factura",
	invoice_approval: "Aprobación de factura",
	payment_record: "Pago",
	cost_record: "Costo",
	document_evidence: "Documento",
	form_submission: "Formulario",
};

type RecoveryAction =
	| { kind: "retry"; localId: string }
	| { kind: "discard"; localId: string }
	| { kind: "keep_server"; localId: string }
	| { kind: "retry_local"; localId: string }
	| { kind: "retry_upload"; localId: string }
	| { kind: "discard_upload"; localId: string };

function executeRecoveryAction(action: RecoveryAction): Promise<void> {
	switch (action.kind) {
		case "retry":
			return retryOfflineRecoveryItem(action.localId);
		case "discard":
			return discardOfflineRecoveryItem(action.localId);
		case "keep_server":
			return resolveOfflineConflict(action.localId, "keep_server");
		case "retry_local":
			return resolveOfflineConflict(action.localId, "retry_local");
		case "retry_upload":
			return retryOfflineUpload(action.localId);
		case "discard_upload":
			return discardOfflineUpload(action.localId);
	}
}

function RecoveryStatusBadge({ status }: { status: OfflineOutboxItem["status"] }) {
	const isConflict = status === "conflict";
	return (
		<BadgePill
			className={
				isConflict
					? "bg-warning-bg text-brand-warn ring-amber-200 dark:bg-amber-950/30 dark:text-brand-warn dark:ring-amber-800"
					: "bg-danger-bg text-brand-error ring-red-200 dark:bg-red-950/30 dark:text-brand-error dark:ring-red-800"
			}
			dotClassName={isConflict ? "bg-amber-500" : "bg-red-500"}
		>
			{isConflict ? "Conflicto" : "Error"}
		</BadgePill>
	);
}

function ConflictDetails({ item }: { item: OfflineOutboxItem }) {
	if (item.status !== "conflict") {
		return null;
	}

	const conflict = item.conflict;
	return (
		<div className="grid gap-3 rounded-[var(--radius-lg)] bg-[var(--surface-secondary)] p-4 sm:grid-cols-2">
			<div>
				<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
					Servidor
				</p>
				<p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
					{conflict?.serverState ?? "Versión disponible"}
				</p>
				{typeof conflict?.serverVersion === "number" ? (
					<p className="text-xs text-[var(--text-secondary)]">Versión {conflict.serverVersion}</p>
				) : null}
			</div>
			<div>
				<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
					Dispositivo
				</p>
				<p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
					{conflict?.localState ?? "Cambio local"}
				</p>
				{typeof conflict?.localVersion === "number" ? (
					<p className="text-xs text-[var(--text-secondary)]">Versión {conflict.localVersion}</p>
				) : null}
			</div>
		</div>
	);
}

function RecoveryActions({
	item,
	isPending,
	onAction,
}: {
	item: OfflineOutboxItem;
	isPending: boolean;
	onAction: (action: RecoveryAction) => void;
}) {
	if (item.status === "conflict") {
		return (
			<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="secondary"
					disabled={isPending}
					onClick={() => onAction({ kind: "keep_server", localId: item.localId })}
				>
					<Server aria-hidden="true" />
					Usar versión del servidor
				</Button>
				<Button
					type="button"
					variant="primary"
					disabled={isPending}
					onClick={() => onAction({ kind: "retry_local", localId: item.localId })}
				>
					<CloudUpload aria-hidden="true" />
					Reintentar versión local
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
			<Button
				type="button"
				variant="secondary"
				disabled={isPending}
				onClick={() => onAction({ kind: "discard", localId: item.localId })}
			>
				<Trash2 aria-hidden="true" />
				Descartar cambio
			</Button>
			<Button
				type="button"
				variant="primary"
				disabled={isPending}
				onClick={() => onAction({ kind: "retry", localId: item.localId })}
			>
				<RefreshCw aria-hidden="true" />
				Reintentar
			</Button>
		</div>
	);
}

function RecoveryItemCard({
	item,
	isPending,
	onAction,
}: {
	item: OfflineOutboxItem;
	isPending: boolean;
	onAction: (action: RecoveryAction) => void;
}) {
	return (
		<article className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="text-base font-semibold text-[var(--text-primary)]">
							{ENTITY_LABELS[item.entityType]}
						</h2>
						<RecoveryStatusBadge status={item.status} />
					</div>
					<p className="mt-1 break-all font-mono text-xs text-[var(--text-tertiary)]">
						{item.localId}
					</p>
				</div>
				<div className="text-left text-xs text-[var(--text-secondary)] sm:text-right">
					<p>{formatDateTime(item.updatedAt)}</p>
					<p>
						{item.attempts} intento{item.attempts === 1 ? "" : "s"}
					</p>
				</div>
			</header>

			<output className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-amber-200 bg-warning-bg p-4 text-sm text-brand-warn dark:border-amber-800 dark:bg-amber-950/30 dark:text-brand-warn">
				<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
				<p>{item.conflict?.reason ?? item.lastError ?? "La sincronización no pudo completarse."}</p>
			</output>

			<ConflictDetails item={item} />
			<RecoveryActions item={item} isPending={isPending} onAction={onAction} />
		</article>
	);
}

function formatFileSize(sizeBytes: number): string {
	if (sizeBytes < 1024 * 1024) {
		return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
	}
	return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

function UploadRecoveryCard({
	entry,
	isPending,
	onAction,
}: {
	entry: BlobOutboxEntry;
	isPending: boolean;
	onAction: (action: RecoveryAction) => void;
}) {
	return (
		<article className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="break-all text-base font-semibold text-[var(--text-primary)]">
							{entry.originalName}
						</h2>
						<BadgePill
							className="bg-danger-bg text-brand-error ring-red-200 dark:bg-red-950/30 dark:text-brand-error dark:ring-red-800"
							dotClassName="bg-red-500"
						>
							Archivo con error
						</BadgePill>
					</div>
					<p className="mt-1 text-xs text-[var(--text-secondary)]">
						{entry.category} · {formatFileSize(entry.sizeBytes)}
					</p>
				</div>
				<div className="text-left text-xs text-[var(--text-secondary)] sm:text-right">
					<p>{formatDateTime(new Date(entry.createdAt))}</p>
					<p>{entry.retryCount} intentos</p>
				</div>
			</header>

			<output className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-red-200 bg-danger-bg p-4 text-sm text-brand-error dark:border-red-800 dark:bg-red-950/30 dark:text-brand-error">
				<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
				<p>{entry.lastError ?? "El archivo no pudo enviarse al servidor."}</p>
			</output>

			<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="secondary"
					disabled={isPending}
					onClick={() => onAction({ kind: "discard_upload", localId: entry.id })}
				>
					<Trash2 aria-hidden="true" />
					Descartar archivo
				</Button>
				<Button
					type="button"
					variant="primary"
					disabled={isPending}
					onClick={() => onAction({ kind: "retry_upload", localId: entry.id })}
				>
					<CloudUpload aria-hidden="true" />
					Reintentar archivo
				</Button>
			</div>
		</article>
	);
}

export function OfflineRecoveryCenter() {
	const queryClient = useQueryClient();
	const { isOnline, pendingCount, failedCount, conflictCount, isSyncing, lastSyncAt } =
		useSyncStatus();
	const {
		data: recoveryData,
		isLoading: recoveryIsLoading,
		error: recoveryError,
		refetch: recoveryRefetch,
	} = useQuery({
		queryKey: RECOVERY_QUERY_KEY,
		queryFn: listOfflineRecoverySnapshot,
		networkMode: "always",
	});
	const recoveryMutation = useMutation({
		mutationFn: executeRecoveryAction,
		onSuccess: async (_data, action) => {
			await queryClient.invalidateQueries({ queryKey: RECOVERY_QUERY_KEY });
			toast.success(
				action.kind === "keep_server" ||
					action.kind === "discard" ||
					action.kind === "discard_upload"
					? "Cambio local descartado."
					: "Cambio preparado para sincronizar.",
			);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	useEffect(() => {
		const refresh = () => {
			void queryClient.invalidateQueries({ queryKey: RECOVERY_QUERY_KEY });
		};
		window.addEventListener(QUEUE_CHANGED_EVENT, refresh);
		return () => window.removeEventListener(QUEUE_CHANGED_EVENT, refresh);
	}, [queryClient]);

	if (recoveryIsLoading) {
		return (
			<section className="space-y-6" aria-label="Cargando recuperación de sincronización">
				<Skeleton variant="text" className="h-9 w-80" />
				<Skeleton variant="kpi-card" />
				<Skeleton variant="card" />
				<Skeleton variant="card" />
			</section>
		);
	}

	if (recoveryError) {
		return (
			<ErrorFallback
				error={recoveryError}
				title="No se pudo leer la cola offline"
				description="Los cambios locales siguen almacenados. Intenta abrir nuevamente el centro de recuperación."
				resetErrorBoundary={() => recoveryRefetch()}
			/>
		);
	}

	const items = recoveryData?.items ?? [];
	const uploads = recoveryData?.uploads ?? [];

	return (
		<section className="space-y-6" aria-labelledby="offline-recovery-title">
			<header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<div className="mb-2 flex items-center gap-2 text-[var(--color-brand-blue)]">
						<GitCompareArrows className="size-5" aria-hidden="true" />
						<span className="text-xs font-semibold uppercase tracking-[0.16em]">
							Operación offline
						</span>
					</div>
					<h1
						id="offline-recovery-title"
						className="text-2xl font-semibold text-[var(--text-primary)]"
					>
						Recuperación de sincronización
					</h1>
					<p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
						Revisa cambios que el servidor no pudo aplicar. Ningún registro local se elimina sin una
						decisión explícita.
					</p>
				</div>
				<div className="text-sm text-[var(--text-secondary)]">
					<p>{isOnline ? "Conexión disponible" : "Sin conexión"}</p>
					{lastSyncAt ? <p>Última sincronización: {formatDateTime(lastSyncAt)}</p> : null}
				</div>
			</header>

			{!isOnline ? (
				<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-amber-200 bg-warning-bg p-4 text-sm text-brand-warn dark:border-amber-800 dark:bg-amber-950/30 dark:text-brand-warn">
					<CloudOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
					<p>
						Puedes revisar y resolver conflictos sin conexión. Los reintentos se enviarán al
						recuperar conectividad.
					</p>
				</div>
			) : null}

			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{[
					{ label: "Pendientes", value: pendingCount, color: "text-brand-green" },
					{ label: "Errores", value: failedCount, color: "text-brand-error" },
					{ label: "Conflictos", value: conflictCount, color: "text-brand-warn" },
					{
						label: "Estado",
						value: isSyncing ? "Enviando" : "En espera",
						color: "text-brand-annotate",
					},
				].map((metric) => (
					<div
						key={metric.label}
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-card"
					>
						<p className="text-xs font-medium text-[var(--text-tertiary)]">{metric.label}</p>
						<p className={`mt-1 text-2xl font-semibold ${metric.color}`}>{metric.value}</p>
					</div>
				))}
			</div>

			{items.length === 0 && uploads.length === 0 ? (
				<EmptyState
					icon={CloudUpload}
					title="No hay cambios que requieran intervención"
					description="La cola offline no tiene errores ni conflictos pendientes."
				/>
			) : (
				<div className="space-y-4">
					{items.map((item) => (
						<RecoveryItemCard
							key={item.localId}
							item={item}
							isPending={
								recoveryMutation.isPending && recoveryMutation.variables?.localId === item.localId
							}
							onAction={(action) => recoveryMutation.mutate(action)}
						/>
					))}
					{uploads.map((entry) => (
						<UploadRecoveryCard
							key={entry.id}
							entry={entry}
							isPending={
								recoveryMutation.isPending && recoveryMutation.variables?.localId === entry.id
							}
							onAction={(action) => recoveryMutation.mutate(action)}
						/>
					))}
				</div>
			)}
		</section>
	);
}
