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
		<div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 sm:flex-row">
			{/* Thumbnail */}
			<div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-28 sm:w-40">
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
					className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
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
						className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
					>
						Título de la foto <span className="text-red-500">*</span>
					</label>
					<input
						id={`photo-title-${photo.id}`}
						type="text"
						value={photo.title}
						onChange={(e) => onUpdateTitle(photo.id, e.target.value)}
						placeholder="Ej: Sello mecánico con fuga detectada"
						maxLength={120}
						aria-label={`Título de la foto ${index + 1}`}
						className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500 ${
							photo.error
								? "border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-400 dark:focus:ring-red-400"
								: "border-zinc-300 focus:border-[var(--color-brand)] focus:ring-[var(--color-brand)] dark:border-zinc-600 dark:focus:border-[var(--color-cermont-blue-light)] dark:focus:ring-[var(--color-cermont-blue-light)]"
						}`}
					/>
					{photo.error && (
						<p className="text-xs text-red-600 dark:text-red-400" role="alert">
							{photo.error}
						</p>
					)}
				</div>

				{/* Type */}
				<div className="space-y-1">
					<label
						htmlFor={`photo-type-${photo.id}`}
						className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
					>
						Tipo
					</label>
					<select
						id={`photo-type-${photo.id}`}
						value={photo.type}
						onChange={(e) => onUpdateType(photo.id, e.target.value as EvidenceType)}
						className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:focus:border-[var(--color-cermont-blue-light)] dark:focus:ring-[var(--color-cermont-blue-light)]"
					>
						{EVIDENCE_TYPES.map((t) => (
							<option key={t.value} value={t.value}>
								{t.label}
							</option>
						))}
					</select>
				</div>

				{/* File info */}
				<p className="text-[11px] text-zinc-400 dark:text-zinc-500">
					{photo.file.name} &middot; {formatFileSize(photo.file.size)}
				</p>
			</div>
		</div>
	);
}
