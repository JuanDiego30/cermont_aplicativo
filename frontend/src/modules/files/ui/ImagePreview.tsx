"use client";

/**
 * ImagePreview — Lightbox modal for a single FileAsset image
 *
 * Renders a full-viewport overlay with:
 *   - The image at its natural aspect ratio, fitted to the viewport
 *   - Close button (top-right) and Escape key to dismiss
 *   - Click on backdrop to dismiss
 *   - Optional caption (originalName, size, uploadedAt, uploaderName)
 *   - Optional `onOpenChange` callback for parent to track open state
 *
 * Purely presentational. No business logic, no fetch, no mutation. The
 * parent owns the `open` state and the `file` to display.
 */

import type { FileAssetRef } from "@cermont/shared-types";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo } from "react";

import { Button } from "@/core/ui/Button";

export interface ImagePreviewProps {
	file: FileAssetRef | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	downloadHref?: string;
	showMetadata?: boolean;
}

function formatSize(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
	try {
		return new Date(iso).toLocaleString("es-CO", {
			dateStyle: "medium",
			timeStyle: "short",
		});
	} catch {
		return iso;
	}
}

export function ImagePreview({
	file,
	open,
	onOpenChange,
	downloadHref,
	showMetadata = true,
}: ImagePreviewProps) {
	// Lock body scroll while open (Radix also does this but we belt-and-suspenders)
	useEffect(() => {
		if (!open) {
			return;
		}
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [open]);

	const handleOpenChange = useCallback(
		(next: boolean) => {
			onOpenChange(next);
		},
		[onOpenChange],
	);

	const src = useMemo(() => file?.url ?? "", [file?.url]);
	const alt = file?.originalName ?? "Imagen adjunta";
	const titleId = "image-preview-title";
	const descId = "image-preview-description";

	return (
		<Dialog.Root open={open} onOpenChange={handleOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay
					className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0"
					aria-hidden="true"
				/>
				<Dialog.Content
					className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none"
					aria-labelledby={titleId}
					aria-describedby={descId}
					onEscapeKeyDown={() => onOpenChange(false)}
					onPointerDownOutside={() => onOpenChange(false)}
				>
					<Dialog.Title id={titleId} className="sr-only">
						{alt}
					</Dialog.Title>
					<Dialog.Description id={descId} className="sr-only">
						Vista previa de la imagen. Cierra con Escape o haciendo clic fuera.
					</Dialog.Description>

					{file ? (
						<>
							<div className="relative flex max-h-[calc(100vh-160px)] w-full max-w-5xl flex-1 items-center justify-center">
								<Image
									src={src}
									alt={alt}
									width={1600}
									height={1200}
									unoptimized
									className="max-h-[calc(100vh-160px)] w-auto max-w-full rounded-lg object-contain shadow-2xl"
									priority
								/>
							</div>

							{showMetadata ? (
								<div className="mt-4 flex w-full max-w-5xl flex-col gap-2 rounded-xl bg-black/60 px-4 py-3 text-sm text-white sm:flex-row sm:items-center sm:justify-between">
									<div className="min-w-0">
										<p className="truncate font-medium">{file.originalName}</p>
										<p className="text-xs text-white/70">
											{formatSize(file.sizeBytes)} · {file.mimeType} · {formatDate(file.uploadedAt)}
										</p>
									</div>
									<div className="flex shrink-0 items-center gap-2">
										<Button
											asChild
											type="button"
											variant="outline"
											size="sm"
											className="border-white/30 bg-white/10 text-white hover:bg-white/20"
										>
											<a
												href={downloadHref ?? file.url}
												download={file.originalName}
												rel="noopener noreferrer"
											>
												<Download className="size-4" aria-hidden="true" />
												Descargar
											</a>
										</Button>
										<Dialog.Close asChild>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="text-white hover:bg-white/20"
												aria-label="Cerrar vista previa"
											>
												<X className="size-5" aria-hidden="true" />
											</Button>
										</Dialog.Close>
									</div>
								</div>
							) : (
								<div className="mt-4 flex w-full max-w-5xl justify-end">
									<Dialog.Close asChild>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="text-white hover:bg-white/20"
											aria-label="Cerrar vista previa"
										>
											<X className="size-5" aria-hidden="true" />
										</Button>
									</Dialog.Close>
								</div>
							)}
						</>
					) : null}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
