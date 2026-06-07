"use client";

/**
 * ResourceImageEditor — Image gallery management for a single resource
 *
 * Renders existing images as a grid with delete capability, and a file
 * upload zone to attach new images. Uses the Resource module's own
 * attach/detach mutations (images live as FileAssetRef[] on the resource).
 *
 * @see useAttachResourceImage, useDetachResourceImage
 */

import type { FileAssetRef } from "@cermont/shared-types";
import { Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { ImagePreview } from "@/modules/files/ui/ImagePreview";
import { useAttachResourceImage, useDetachResourceImage } from "../hooks/useResources";

interface ResourceImageEditorProps {
	resourceId: string;
	images: FileAssetRef[];
}

export function ResourceImageEditor({ resourceId, images }: ResourceImageEditorProps) {
	const [previewFile, setPreviewFile] = useState<FileAssetRef | null>(null);
	const [previewOpen, setPreviewOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const attachMutation = useAttachResourceImage();
	const detachMutation = useDetachResourceImage();

	const handleFileSelect = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) {
				return;
			}

			// Build a temporary FileAssetRef from the selected File
			// The parent API expects a FileAssetRef. In a real flow,
			// we would first upload the file via the files API, then
			// attach the resulting FileAssetRef.
			//
			// For now, we create a minimal FileAssetRef and let the
			// backend's attachImage service handle the file upload
			// via multipart. If the endpoint expects multipart, this
			// would need FormData. The current endpoint accepts
			// a FileAssetRef JSON body.
			//
			// NOTE: Production flow should upload file first, then
			// attach the resulting FileAssetRef. This requires a
			// two-step flow or a dedicated multipart endpoint.
			// Temporary ref — in production, upload file via files API first, then
			// call attachResourceImage with the returned FileAssetRef.
			const tempRef = {
				id: crypto.randomUUID(),
				originalName: file.name,
				storedName: file.name,
				mimeType: file.type,
				sizeBytes: file.size,
				url: URL.createObjectURL(file),
				storageKey: "",
				uploadedBy: "current",
				uploadedAt: new Date().toISOString(),
				entityType: "tool" as const,
				entityId: resourceId,
				category: "tool_image" as const,
			};

			try {
				await attachMutation.mutateAsync({ id: resourceId, image: tempRef });
			} catch {
				// Error handled by TanStack Query
			}

			// Reset input so the same file can be re-selected
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
		[resourceId, attachMutation],
	);

	const handleDetach = useCallback(
		async (imageId: string) => {
			try {
				await detachMutation.mutateAsync({ id: resourceId, imageId });
			} catch {
				// Error handled by TanStack Query
			}
		},
		[resourceId, detachMutation],
	);

	const handlePreview = useCallback((file: FileAssetRef) => {
		setPreviewFile(file);
		setPreviewOpen(true);
	}, []);

	const isPending = attachMutation.isPending || detachMutation.isPending;

	return (
		<section
			aria-labelledby="resource-image-editor-title"
			className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-sm"
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
					className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-6 text-sm text-[var(--text-tertiary)] transition-colors hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
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
							className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--surface-secondary)]"
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
								onClick={() => handleDetach(file.id)}
								className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
								aria-label={`Eliminar imagen: ${file.originalName}`}
								disabled={detachMutation.isPending}
							>
								{detachMutation.isPending ? (
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
