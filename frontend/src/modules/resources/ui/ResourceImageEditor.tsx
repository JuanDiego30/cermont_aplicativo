"use client";

/**
 * ResourceImageEditor — Image gallery management for a single resource
 *
 * Renders existing images as a grid with delete capability, and a file
 * upload zone to attach new images. Files are persisted through the canonical
 * files service and linked to the resource by the backend.
 *
 * @see useUploadResourceImage, useDeleteResourceImage
 */

import type { FileAssetRef, ResourceType } from "@cermont/shared-types";
import { Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { ImagePreview } from "@/modules/files/ui/ImagePreview";
import { useDeleteResourceImage, useUploadResourceImage } from "../hooks/useResources";

interface ResourceImageEditorProps {
	resourceId: string;
	resourceType: ResourceType;
	images: FileAssetRef[];
}

export function ResourceImageEditor({
	resourceId,
	resourceType,
	images,
}: ResourceImageEditorProps) {
	const [previewFile, setPreviewFile] = useState<FileAssetRef | null>(null);
	const [previewOpen, setPreviewOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const uploadMutation = useUploadResourceImage();
	const deleteMutation = useDeleteResourceImage();

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) {
				return;
			}

			uploadMutation.reset();
			deleteMutation.reset();
			uploadMutation.mutate(
				{ resourceId, resourceType, file },
				{
					onSettled: () => {
						if (fileInputRef.current) {
							fileInputRef.current.value = "";
						}
					},
				},
			);
		},
		[deleteMutation, resourceId, resourceType, uploadMutation],
	);

	const handleDetach = useCallback(
		(file: FileAssetRef) => {
			uploadMutation.reset();
			deleteMutation.reset();
			deleteMutation.mutate({ resourceId, file });
		},
		[deleteMutation, resourceId, uploadMutation],
	);

	const handlePreview = useCallback((file: FileAssetRef) => {
		setPreviewFile(file);
		setPreviewOpen(true);
	}, []);

	const isPending = uploadMutation.isPending || deleteMutation.isPending;
	const operationError = uploadMutation.error ?? deleteMutation.error;
	const errorMessage =
		operationError instanceof Error ? operationError.message : "No se pudo procesar la imagen.";

	return (
		<section
			aria-labelledby="resource-image-editor-title"
			className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-sm"
		>
			<h2
				id="resource-image-editor-title"
				className="mb-4 text-sm font-semibold text-[var(--text-primary)]"
			>
				Galería de imágenes
			</h2>

			{/* Upload zone */}
			<div className="mb-4">
				<label
					htmlFor="resource-image-upload"
					className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-4 py-6 text-sm text-[var(--text-tertiary)] transition-colors hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
				>
					<Upload className="size-5" aria-hidden="true" />
					<span>Seleccionar imagen para adjuntar</span>
				</label>
				<input
					ref={fileInputRef}
					id="resource-image-upload"
					type="file"
					accept="image/*"
					className="sr-only"
					onChange={handleFileSelect}
					disabled={isPending}
				/>
				{operationError ? (
					<p className="mt-2 text-sm text-[var(--color-danger)]" role="alert">
						{errorMessage}
					</p>
				) : null}
			</div>

			{/* Image grid */}
			{images.length === 0 ? (
				<p className="py-8 text-center text-sm text-[var(--text-tertiary)]">
					No hay imágenes adjuntas. Selecciona un archivo para comenzar.
				</p>
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{images.map((file) => (
						<div
							key={file.id}
							className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)]"
						>
							<button
								type="button"
								className="size-full"
								onClick={() => handlePreview(file)}
								aria-label={`Ver imagen: ${file.originalName}`}
							>
								<Image
									src={file.url}
									alt={file.originalName}
									fill
									className="object-cover transition-transform group-hover:scale-105"
									sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
									unoptimized
								/>
							</button>

							{/* Delete overlay */}
							<button
								type="button"
								onClick={() => handleDetach(file)}
								className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
								aria-label={`Eliminar imagen: ${file.originalName}`}
								disabled={deleteMutation.isPending}
							>
								{deleteMutation.isPending ? (
									<Loader2 className="size-3.5 animate-spin" />
								) : (
									<Trash2 className="size-3.5" aria-hidden="true" />
								)}
							</button>
						</div>
					))}
				</div>
			)}

			{/* Upload/delete loading overlay */}
			{isPending ? (
				<div className="mt-3 flex items-center justify-center gap-2 text-xs text-[var(--text-tertiary)]">
					<Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
					<span>Procesando imagen…</span>
				</div>
			) : null}

			{/* Preview lightbox */}
			<ImagePreview file={previewFile} open={previewOpen} onOpenChange={setPreviewOpen} />
		</section>
	);
}
