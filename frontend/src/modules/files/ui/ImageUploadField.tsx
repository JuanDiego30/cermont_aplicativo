"use client";

/**
 * ImageUploadField — Image-only upload field with camera capture + EXIF strip
 *
 * Specialized drop-in for photo evidence. Compared to `FileUploadField` it:
 *   - Restricts the `accept` MIME list to image/* only
 *   - Enables `capture="environment"` on mobile so the native camera opens
 *   - Optionally re-encodes the picked image through a canvas to strip EXIF
 *     metadata (GPS, device, timestamp) for privacy-sensitive evidence
 *   - Rejects images whose original size > `maxInputSizeBytes` and after EXIF
 *     strip the resulting blob must also fit `maxOutputSizeBytes`
 *
 * This component is a thin wrapper around `FileUploadField`'s logic: it
 * pre-processes the picked file (EXIF strip), then reuses `useUploadFile`.
 *
 * NOTE: The `category` you pass must come from
 * `@cermont/shared-types`'s `FileAssetCategory` and should be a photo category
 * (e.g. `evidence_photo`, `before_photo`, `after_photo`, `cctv_photo`).
 */

import type { FileAssetCategory, FileAssetEntityType, FileAssetRef } from "@cermont/shared-types";
import { Camera, Upload } from "lucide-react";
import NextImage from "next/image";
import { type ChangeEvent, type DragEvent, useCallback, useId, useRef, useState } from "react";

import { Button } from "@/core/ui/Button";
import { useUploadFile } from "../hooks/useFileAssets";

export interface ImageUploadFieldProps {
	entityType: FileAssetEntityType;
	entityId: string;
	category: FileAssetCategory;
	maxInputSizeBytes?: number;
	maxOutputSizeBytes?: number;
	stripExif?: boolean;
	disabled?: boolean;
	onSuccess?: (ref: FileAssetRef) => void;
	onError?: (error: Error) => void;
	label?: string;
	helperText?: string;
	className?: string;
}

const DEFAULT_MAX_INPUT = 25 * 1024 * 1024; // 25 MB raw from camera
const DEFAULT_MAX_OUTPUT = 10 * 1024 * 1024; // 10 MB post-strip
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const DEFAULT_ACCEPT = IMAGE_MIME_TYPES.join(",");
const JPEG_QUALITY = 0.85;

function isImageMime(value: string): value is (typeof IMAGE_MIME_TYPES)[number] {
	return (IMAGE_MIME_TYPES as readonly string[]).includes(value);
}

/**
 * Re-encode the image through a canvas to strip EXIF metadata.
 * Returns a new File with the same name and a deterministic JPEG mime
 * (re-encoded for consistency; PNG → JPEG is acceptable for evidence).
 * Returns the original file if re-encoding fails or the file is not an
 * image, so we never silently drop user content.
 */
async function stripExifFromImage(file: File, maxOutputBytes: number): Promise<File> {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return file;
	}
	if (!file.type.startsWith("image/")) {
		return file;
	}

	const url = URL.createObjectURL(file);
	try {
		const image = await loadHtmlImage(url);
		const canvas = document.createElement("canvas");
		canvas.width = image.naturalWidth;
		canvas.height = image.naturalHeight;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return file;
		}
		ctx.drawImage(image, 0, 0);

		const blob = await new Promise<Blob | null>((resolve) => {
			canvas.toBlob((result) => resolve(result), "image/jpeg", JPEG_QUALITY);
		});

		if (!blob) {
			return file;
		}

		if (blob.size > maxOutputBytes) {
			// Try lower quality to fit the size budget.
			const smallerBlob = await new Promise<Blob | null>((resolve) => {
				canvas.toBlob((result) => resolve(result), "image/jpeg", 0.6);
			});
			if (smallerBlob && smallerBlob.size <= maxOutputBytes) {
				return new File([smallerBlob], replaceExtension(file.name, ".jpg"), { type: "image/jpeg" });
			}
			throw new Error(
				`La imagen re-codificada (${(blob.size / 1024 / 1024).toFixed(1)} MB) excede el límite (${(maxOutputBytes / 1024 / 1024).toFixed(0)} MB).`,
			);
		}

		return new File([blob], replaceExtension(file.name, ".jpg"), { type: "image/jpeg" });
	} finally {
		URL.revokeObjectURL(url);
	}
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error("No se pudo cargar la imagen para procesar."));
		img.src = src;
	});
}

function replaceExtension(name: string, ext: string): string {
	const dotIndex = name.lastIndexOf(".");
	if (dotIndex <= 0) {
		return `${name}${ext}`;
	}
	return `${name.slice(0, dotIndex)}${ext}`;
}

export function ImageUploadField({
	entityType,
	entityId,
	category,
	maxInputSizeBytes = DEFAULT_MAX_INPUT,
	maxOutputSizeBytes = DEFAULT_MAX_OUTPUT,
	stripExif = true,
	disabled = false,
	onSuccess,
	onError,
	label = "Subir foto",
	helperText = "JPG, PNG, WEBP o GIF. Toca para abrir la cámara o elige un archivo.",
	className = "",
}: ImageUploadFieldProps) {
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);
	const [localError, setLocalError] = useState<string | null>(null);
	const [uploadedPreview, setUploadedPreview] = useState<FileAssetRef | null>(null);

	const upload = useUploadFile();

	const validate = useCallback(
		(file: File): string | null => {
			if (file.size > maxInputSizeBytes) {
				return `La imagen excede el tamaño máximo permitido (${(maxInputSizeBytes / 1024 / 1024).toFixed(0)} MB).`;
			}
			if (!isImageMime(file.type)) {
				return `Tipo de imagen no permitido: ${file.type || "desconocido"}.`;
			}
			return null;
		},
		[maxInputSizeBytes],
	);

	const handleFile = useCallback(
		async (file: File) => {
			setLocalError(null);
			setUploadedPreview(null);
			const validationError = validate(file);
			if (validationError) {
				setLocalError(validationError);
				onError?.(new Error(validationError));
				return;
			}

			let processed: File = file;
			if (stripExif) {
				try {
					processed = await stripExifFromImage(file, maxOutputSizeBytes);
				} catch (err) {
					const error = err instanceof Error ? err : new Error("EXIF strip failed");
					setLocalError(error.message);
					onError?.(error);
					return;
				}
			}

			try {
				const ref = await upload.mutateAsync({
					file: processed,
					category,
					entityType,
					entityId,
				});
				setUploadedPreview(ref);
				onSuccess?.(ref);
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Upload failed");
				setLocalError(error.message);
				onError?.(error);
			}
		},
		[
			validate,
			stripExif,
			maxOutputSizeBytes,
			upload,
			category,
			entityType,
			entityId,
			onSuccess,
			onError,
		],
	);

	const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			void handleFile(file);
		}
		e.target.value = "";
	};

	const onDrop = (e: DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		setIsDragOver(false);
		if (disabled || upload.isPending) {
			return;
		}
		const file = e.dataTransfer.files?.[0];
		if (file) {
			void handleFile(file);
		}
	};

	const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		if (disabled || upload.isPending) {
			return;
		}
		setIsDragOver(true);
	};

	const onDragLeave = () => {
		setIsDragOver(false);
	};

	const errorMessage = localError ?? (upload.error instanceof Error ? upload.error.message : null);
	const isBusy = upload.isPending;

	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			<label
				htmlFor={inputId}
				onDrop={onDrop}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				className={[
					"flex flex-col items-center justify-center gap-2",
					"rounded-2xl border-2 border-dashed px-6 py-8",
					"cursor-pointer transition-colors",
					"focus-within:ring-2 focus-within:ring-cermont-green focus-within:ring-offset-2",
					isDragOver ? "border-cermont-green bg-success-bg" : "border-hairline bg-canvas",
					disabled || isBusy ? "cursor-not-allowed opacity-60" : "hover:border-cermont-blue",
				].join(" ")}
			>
				<Camera className="size-6 text-cermont-blue" aria-hidden="true" />
				<span className="text-sm font-medium text-charcoal">{label}</span>
				<span className="text-xs text-steel">{helperText}</span>
				<input
					ref={inputRef}
					id={inputId}
					type="file"
					accept={DEFAULT_ACCEPT}
					capture="environment"
					disabled={disabled || isBusy}
					onChange={onInputChange}
					className="sr-only"
					aria-label={label}
				/>
			</label>

			{errorMessage ? (
				<p role="alert" className="text-xs text-brand-error">
					{errorMessage}
				</p>
			) : null}

			{isBusy ? (
				<div className="flex items-center gap-2 text-xs text-slate">
					<span className="h-3 w-3 animate-spin rounded-full border-2 border-cermont-blue border-t-transparent" />
					{stripExif ? "Procesando y subiendo…" : "Subiendo…"}
				</div>
			) : null}

			{uploadedPreview ? (
				<div className="flex items-center gap-3 rounded-lg border border-hairline bg-canvas p-3">
					{uploadedPreview.mimeType.startsWith("image/") ? (
						<NextImage
							src={uploadedPreview.url}
							alt={uploadedPreview.originalName}
							width={64}
							height={64}
							className="size-16 rounded-md object-cover"
							unoptimized
						/>
					) : null}
					<div className="min-w-0">
						<p className="truncate text-sm font-medium text-ink">{uploadedPreview.originalName}</p>
						<p className="text-xs text-steel">{uploadedPreview.syncStatus ?? "synced"}</p>
					</div>
				</div>
			) : null}

			<div className="flex flex-wrap gap-2">
				<Button
					type="button"
					variant="primary"
					size="sm"
					disabled={disabled || isBusy}
					onClick={() => inputRef.current?.click()}
				>
					<Camera className="h-4 w-4" aria-hidden="true" />
					{isBusy ? "Subiendo…" : "Tomar foto"}
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled || isBusy}
					onClick={() => inputRef.current?.click()}
				>
					<Upload className="h-4 w-4" aria-hidden="true" />
					Seleccionar archivo
				</Button>
			</div>
		</div>
	);
}
