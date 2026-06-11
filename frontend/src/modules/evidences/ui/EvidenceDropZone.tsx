"use client";

import { Image as ImageIcon } from "lucide-react";
import { MAX_PHOTOS_PER_BATCH } from "../model/constants";

interface EvidenceDropZoneProps {
	onClick: () => void;
}

export function EvidenceDropZone({ onClick }: EvidenceDropZoneProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border-medium)] p-6 text-center transition-colors hover:border-[var(--color-brand)] sm:p-8"
			aria-label="Agregar imágenes"
		>
			<ImageIcon className="mx-auto mb-3 size-10 text-[var(--text-tertiary)]" aria-hidden="true" />
			<p className="text-sm font-medium text-[var(--text-primary)]">
				Arrastra imágenes o haz clic para seleccionar
			</p>
			<p className="mt-1 text-xs text-[var(--text-secondary)]">
				JPG, PNG, WebP &mdash; Máx 10MB por foto &mdash; Hasta {MAX_PHOTOS_PER_BATCH} fotos
			</p>
		</button>
	);
}
