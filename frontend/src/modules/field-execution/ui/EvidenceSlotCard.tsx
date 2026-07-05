"use client";

import { AlertTriangle, Camera, CheckCircle2, Clock3, RotateCcw, UploadCloud } from "lucide-react";
import Image from "next/image";

export type EvidenceSlotStatus =
	| "empty"
	| "captured"
	| "uploading"
	| "uploaded"
	| "approved"
	| "rejected"
	| "error";

export type EvidenceSlotPreview = { status: "absent" } | { status: "present"; url: string };

interface EvidenceSlotCardProps {
	label: string;
	phase: "before" | "during" | "after";
	isRequired: boolean;
	isBlocking: boolean;
	status: EvidenceSlotStatus;
	preview: EvidenceSlotPreview;
	onCapture: () => void;
}

const STATUS_LABELS: Record<EvidenceSlotStatus, string> = {
	empty: "Pendiente",
	captured: "Capturada",
	uploading: "Subiendo",
	uploaded: "Cargada",
	approved: "Aprobada",
	rejected: "Rechazada",
	error: "Error de carga",
};

const STATUS_ICONS = {
	empty: Camera,
	captured: Clock3,
	uploading: UploadCloud,
	uploaded: UploadCloud,
	approved: CheckCircle2,
	rejected: RotateCcw,
	error: AlertTriangle,
} as const;

export function EvidenceSlotCard({
	label,
	phase,
	isRequired,
	isBlocking,
	status,
	preview,
	onCapture,
}: EvidenceSlotCardProps) {
	const StatusIcon = STATUS_ICONS[status];
	const needsAttention = status === "rejected" || status === "error";

	return (
		<article
			data-testid="evidence-slot-card"
			className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
						{phase === "before" ? "Antes" : phase === "during" ? "Durante" : "Después"}
					</p>
					<h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{label}</h3>
				</div>
				<StatusIcon
					className={
						needsAttention
							? "size-5 text-[var(--color-danger)]"
							: "size-5 text-[var(--color-brand)]"
					}
					aria-hidden="true"
				/>
			</div>
			{preview.status === "present" ? (
				<Image
					src={preview.url}
					alt={label}
					width={640}
					height={360}
					unoptimized
					className="mt-3 aspect-video w-full rounded-[var(--radius-md)] object-cover"
				/>
			) : null}
			<div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
				<span>{STATUS_LABELS[status]}</span>
				{isRequired ? <span>Requerida</span> : <span>Opcional</span>}
				{isBlocking ? <span>Bloquea cierre</span> : null}
			</div>
			<button
				type="button"
				onClick={onCapture}
				className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--border-default)] px-4 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
			>
				<Camera className="size-4" aria-hidden="true" />
				{status === "empty" ? "Capturar evidencia" : "Actualizar evidencia"}
			</button>
		</article>
	);
}
