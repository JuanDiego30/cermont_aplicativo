"use client";

import { Loader2, Upload } from "lucide-react";

interface EvidenceSubmitBarProps {
	canSubmit: boolean;
	isSubmitting: boolean;
	isPending: boolean;
	uploadProgress: { current: number; total: number } | null;
	validPhotoCount: number;
	photosLength: number;
	onSubmit: () => void;
	onCancel: () => void;
}

export function EvidenceSubmitBar({
	canSubmit,
	isSubmitting,
	isPending,
	uploadProgress,
	validPhotoCount,
	photosLength,
	onSubmit,
	onCancel,
}: EvidenceSubmitBarProps) {
	return (
		<div className="flex items-center gap-3">
			<button
				type="button"
				disabled={!canSubmit}
				onClick={onSubmit}
				className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
			>
				{isSubmitting || isPending ? (
					<Loader2 className="size-4 animate-spin" aria-hidden="true" />
				) : (
					<Upload className="size-4" aria-hidden="true" />
				)}
				{isSubmitting
					? `Subiendo ${uploadProgress?.current ?? 0} de ${uploadProgress?.total ?? 0}...`
					: `Subir ${validPhotoCount} evidencia${validPhotoCount !== 1 ? "s" : ""}`}
			</button>

			{photosLength > 0 && !isSubmitting && (
				<button
					type="button"
					onClick={onCancel}
					className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
				>
					Cancelar todo
				</button>
			)}
		</div>
	);
}
