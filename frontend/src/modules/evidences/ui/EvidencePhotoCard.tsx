"use client";

import type { EvidenceType } from "@cermont/shared-types";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import type { PhotoEntry } from "../model/constants";
import { EVIDENCE_TYPES, formatFileSize } from "../model/constants";

interface EvidencePhotoCardProps {
	photo: PhotoEntry;
	index: number;
	onRemove: (id: string) => void;
	onUpdateTitle: (id: string, title: string) => void;
	onUpdateType: (id: string, type: EvidenceType) => void;
}

export function EvidencePhotoCard({
	photo,
	index,
	onRemove,
	onUpdateTitle,
	onUpdateType,
}: EvidencePhotoCardProps) {
	return (
		<div className="flex flex-col gap-4 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 sm:flex-row">
			{/* Thumbnail */}
			<div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-[var(--surface-secondary)] sm:h-28 sm:w-40">
				<Image
					src={photo.previewUrl}
					alt={`Vista previa ${index + 1}`}
					fill
					unoptimized
					sizes="(max-width: 640px) 100vw, 160px"
					className="object-cover"
				/>
				<button
					type="button"
					onClick={() => onRemove(photo.id)}
					className="absolute right-1.5 top-1.5 rounded-full bg-[var(--surface-overlay)] p-1.5 text-white hover:opacity-80"
					aria-label={`Eliminar foto ${index + 1}`}
				>
					<Trash2 className="size-3.5" />
				</button>
			</div>

			{/* Fields */}
			<div className="flex flex-1 flex-col gap-3">
				{/* Title */}
				<div className="space-y-1">
					<label
						htmlFor={`photo-title-${photo.id}`}
						className="block text-xs font-medium text-[var(--text-secondary)]"
					>
						Título de la foto <span className="text-[var(--color-danger)]">*</span>
					</label>
					<input
						id={`photo-title-${photo.id}`}
						type="text"
						value={photo.title}
						onChange={(e) => onUpdateTitle(photo.id, e.target.value)}
						placeholder="Ej: Sello mecánico con fuga detectada"
						maxLength={120}
						aria-label={`Título de la foto ${index + 1}`}
						className={`w-full rounded-lg border px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 bg-[var(--surface-primary)] ${
							photo.error
								? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
								: "border-[var(--border-medium)] focus:border-[var(--color-brand)] focus:ring-[var(--color-brand)]"
						}`}
					/>
					{photo.error && (
						<p className="text-xs text-[var(--color-danger)]" role="alert">
							{photo.error}
						</p>
					)}
				</div>

				{/* Type */}
				<div className="space-y-1">
					<label
						htmlFor={`photo-type-${photo.id}`}
						className="block text-xs font-medium text-[var(--text-secondary)]"
					>
						Tipo
					</label>
					<select
						id={`photo-type-${photo.id}`}
						value={photo.type}
						onChange={(e) => onUpdateType(photo.id, e.target.value as EvidenceType)}
						className="w-full rounded-lg border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
					>
						{EVIDENCE_TYPES.map((t) => (
							<option key={t.value} value={t.value}>
								{t.label}
							</option>
						))}
					</select>
				</div>

				{/* File info */}
				<p className="text-[11px] text-[var(--text-tertiary)]">
					{photo.file.name} &middot; {formatFileSize(photo.file.size)}
				</p>
			</div>
		</div>
	);
}
