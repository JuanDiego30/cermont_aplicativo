"use client";

/**
 * FileUploadField — Generic file upload field with drag-and-drop
 *
 * Wraps a native file input + drag-and-drop zone with:
 *   - Allowed MIME type filtering (image/jpeg, image/png, image/webp,
 *     image/gif, application/pdf — per @cermont/shared-types)
 *   - Optional max file size enforcement
 *   - Visual feedback for drag-over, uploading, error states
 *   - Accessible: keyboard support, aria-label, focus ring
 *   - Calls useUploadFile mutation
 *
 * This component is intentionally generic — it does not know about the
 * parent entity. The caller passes `entityType`, `entityId`, `category`,
 * and an optional `onSuccess` callback to react to the persisted ref.
 */

import {
	ALLOWED_FILE_MIME_TYPES,
	type FileAssetCategory,
	type FileAssetEntityType,
	type FileAssetRef,
} from "@cermont/shared-types";
import { Upload } from "lucide-react";
import { type ChangeEvent, type DragEvent, useCallback, useId, useRef, useState } from "react";

import { Button } from "@/core/ui/Button";
import { useUploadFile } from "../hooks/useFileAssets";

export interface FileUploadFieldProps {
	entityType: FileAssetEntityType;
	entityId: string;
	category: FileAssetCategory;
	accept?: string;
	maxSizeBytes?: number;
	disabled?: boolean;
	onSuccess?: (ref: FileAssetRef) => void;
	onError?: (error: Error) => void;
	label?: string;
	helperText?: string;
	className?: string;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB — matches backend multer limit
const DEFAULT_ACCEPT = ALLOWED_FILE_MIME_TYPES.join(",");

export function FileUploadField({
	entityType,
	entityId,
	category,
	accept = DEFAULT_ACCEPT,
	maxSizeBytes = DEFAULT_MAX_SIZE,
	disabled = false,
	onSuccess,
	onError,
	label = "Subir archivo",
	helperText,
	className = "",
}: FileUploadFieldProps) {
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);
	const [localError, setLocalError] = useState<string | null>(null);

	const upload = useUploadFile();

	const validate = useCallback(
		(file: File): string | null => {
			if (file.size > maxSizeBytes) {
				return `El archivo excede el tamaño máximo permitido (${(maxSizeBytes / 1024 / 1024).toFixed(0)} MB).`;
			}
			if (
				!ALLOWED_FILE_MIME_TYPES.includes(file.type as (typeof ALLOWED_FILE_MIME_TYPES)[number])
			) {
				return `Tipo de archivo no permitido: ${file.type || "desconocido"}.`;
			}
			return null;
		},
		[maxSizeBytes],
	);

	const handleFile = useCallback(
		async (file: File) => {
			setLocalError(null);
			const validationError = validate(file);
			if (validationError) {
				setLocalError(validationError);
				onError?.(new Error(validationError));
				return;
			}
			try {
				const ref = await upload.mutateAsync({
					file,
					category,
					entityType,
					entityId,
				});
				onSuccess?.(ref);
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Upload failed");
				setLocalError(error.message);
				onError?.(error);
			}
		},
		[validate, upload, category, entityType, entityId, onSuccess, onError],
	);

	const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			void handleFile(file);
		}
		// Reset so the same file can be re-selected after a failed upload
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
				<Upload className="h-6 w-6 text-cermont-blue" aria-hidden="true" />
				<span className="text-sm font-medium text-charcoal">{label}</span>
				<span className="text-xs text-steel">
					Arrastra un archivo aquí o haz clic para seleccionar
				</span>
				<input
					ref={inputRef}
					id={inputId}
					type="file"
					accept={accept}
					disabled={disabled || isBusy}
					onChange={onInputChange}
					className="sr-only"
					aria-label={label}
				/>
			</label>

			{helperText && !errorMessage ? <p className="text-xs text-steel">{helperText}</p> : null}

			{errorMessage ? (
				<p role="alert" className="text-xs text-brand-error">
					{errorMessage}
				</p>
			) : null}

			{isBusy ? (
				<div className="flex items-center gap-2 text-xs text-slate">
					<span className="h-3 w-3 animate-spin rounded-full border-2 border-cermont-blue border-t-transparent" />
					Subiendo…
				</div>
			) : null}

			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={disabled || isBusy}
				onClick={() => inputRef.current?.click()}
				className="self-start"
			>
				{isBusy ? "Subiendo…" : "Seleccionar archivo"}
			</Button>
		</div>
	);
}
