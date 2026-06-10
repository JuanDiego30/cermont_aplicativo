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
			className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 p-6 text-center transition-colors hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500 sm:p-8"
			aria-label="Agregar imágenes"
		>
			<ImageIcon className="mx-auto mb-3 size-10 text-zinc-400" aria-hidden="true" />
			<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
				Arrastra imágenes o haz clic para seleccionar
			</p>
			<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
				JPG, PNG, WebP &mdash; Máx 10MB por foto &mdash; Hasta {MAX_PHOTOS_PER_BATCH} fotos
			</p>
		</button>
	);
}
