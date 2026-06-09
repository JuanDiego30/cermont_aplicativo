"use client";

import type { EvidenceType } from "@cermont/shared-types";
import { Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useOfflineEvidence } from "../hooks/useOfflineEvidence";

// ─── Constants ───────────────────────────────────────────────────────────────

const EVIDENCE_TYPES: { value: EvidenceType; label: string }[] = [
	{ value: "before", label: "Antes" },
	{ value: "during", label: "Durante" },
	{ value: "after", label: "Después" },
	{ value: "defect", label: "Defecto" },
	{ value: "safety", label: "Seguridad HSE" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_PHOTOS_PER_BATCH = 10;

// ─── Types ───────────────────────────────────────────────────────────────────

type PhotoEntry = {
	id: string;
	file: File;
	previewUrl: string;
	title: string;
	type: EvidenceType;
	error?: string;
};

type GpsCaptureState =
	| { state: "idle" }
	| { state: "fetching" }
	| { state: "success"; location: { lat: number; lng: number } }
	| { state: "error" };

// ─── Props ───────────────────────────────────────────────────────────────────

interface EvidenceUploaderProps {
	orderId?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createUuid(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function validateFile(file: File): string | undefined {
	if (file.size > MAX_FILE_SIZE) {
		return "El archivo no debe superar 10MB";
	}
	if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
		return "Formato no válido. Use JPG, PNG o WebP";
	}
	return undefined;
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EvidenceUploader({ orderId }: EvidenceUploaderProps) {
	const uploadMutation = useOfflineEvidence();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [photos, setPhotos] = useState<PhotoEntry[]>([]);
	const [gpsCapture, setGpsCapture] = useState<GpsCaptureState>({ state: "idle" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<{
		current: number;
		total: number;
	} | null>(null);

	// Cleanup all blob URLs on unmount
	// biome-ignore lint/correctness/useExhaustiveDependencies: cleanup runs on unmount only
	useEffect(() => {
		return () => {
			for (const photo of photos) {
				URL.revokeObjectURL(photo.previewUrl);
			}
		};
	}, []);

	// ── File handling ──────────────────────────────────────────────────────

	const addFiles = useCallback((files: FileList | File[]) => {
		const fileArray = Array.from(files);
		const remaining = MAX_PHOTOS_PER_BATCH;

		if (fileArray.length > remaining) {
			toast.warning(
				`Solo se pueden subir ${remaining} fotos a la vez. Se ignoraron ${fileArray.length - remaining} archivo(s).`,
			);
		}

		const newPhotos: PhotoEntry[] = [];
		let addedCount = 0;

		for (const file of fileArray) {
			if (addedCount >= remaining) {
				break;
			}

			const validationError = validateFile(file);
			const entry: PhotoEntry = {
				id: createUuid(),
				file,
				previewUrl: URL.createObjectURL(file),
				title: "",
				type: "during",
				error: validationError,
			};
			newPhotos.push(entry);
			addedCount += 1;
		}

		setPhotos((prev) => [...prev, ...newPhotos]);
	}, []);

	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (files && files.length > 0) {
				addFiles(files);
			}
			// Reset so the same file can be re-selected
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
		[addFiles],
	);

	const handleDropZoneClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	// ── Photo entry manipulation ───────────────────────────────────────────

	const removePhoto = useCallback((id: string) => {
		setPhotos((prev) => {
			const target = prev.find((p) => p.id === id);
			if (target) {
				URL.revokeObjectURL(target.previewUrl);
			}
			return prev.filter((p) => p.id !== id);
		});
	}, []);

	const updatePhotoTitle = useCallback((id: string, title: string) => {
		setPhotos((prev) =>
			prev.map((p) =>
				p.id === id ? { ...p, title, error: title.trim() ? undefined : p.error } : p,
			),
		);
	}, []);

	const updatePhotoType = useCallback((id: string, type: EvidenceType) => {
		setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, type } : p)));
	}, []);

	// ── GPS ────────────────────────────────────────────────────────────────

	const captureGps = useCallback(() => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			setGpsCapture({ state: "error" });
			return;
		}

		setGpsCapture({ state: "fetching" });
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setGpsCapture({
					state: "success",
					location: {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					},
				});
			},
			() => {
				setGpsCapture({ state: "error" });
			},
			{ enableHighAccuracy: true, timeout: 8000 },
		);
	}, []);

	// ── Submit ─────────────────────────────────────────────────────────────

	const validateAllTitles = useCallback((): boolean => {
		let allValid = true;
		setPhotos((prev) =>
			prev.map((p) => {
				if (!p.title.trim()) {
					allValid = false;
					return { ...p, error: "El título es obligatorio" };
				}
				return { ...p, error: undefined };
			}),
		);
		return allValid;
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!orderId) {
			toast.error("Selecciona una orden de trabajo primero");
			return;
		}

		if (photos.length === 0) {
			toast.error("Agrega al menos una foto antes de subir");
			return;
		}

		if (!validateAllTitles()) {
			toast.error("Completa todos los títulos requeridos");
			return;
		}

		setIsSubmitting(true);
		setUploadProgress({ current: 0, total: photos.length });

		let successCount = 0;
		let offlineCount = 0;
		let failCount = 0;

		for (let i = 0; i < photos.length; i += 1) {
			const photo = photos[i];
			setUploadProgress({ current: i + 1, total: photos.length });

			try {
				const gpsPayload =
					gpsCapture.state === "success"
						? {
								lat: gpsCapture.location.lat,
								lng: gpsCapture.location.lng,
								capturedAt: new Date().toISOString(),
							}
						: undefined;

				const result = await uploadMutation.mutateAsync({
					orderId,
					type: photo.type,
					title: photo.title.trim(),
					capturedAt: new Date().toISOString(),
					file: photo.file,
					gpsLocation: gpsPayload,
				});

				if (result) {
					successCount += 1;
				} else {
					offlineCount += 1;
				}
			} catch {
				failCount += 1;
			}
		}

		// Clean up all preview URLs
		for (const photo of photos) {
			URL.revokeObjectURL(photo.previewUrl);
		}

		setPhotos([]);
		setGpsCapture({ state: "idle" });
		setUploadProgress(null);
		setIsSubmitting(false);

		// Summary toast
		const parts: string[] = [];
		if (successCount > 0) {
			parts.push(`${successCount} subida(s)`);
		}
		if (offlineCount > 0) {
			parts.push(`${offlineCount} guardada(s) para sincronizar`);
		}
		if (failCount > 0) {
			parts.push(`${failCount} con error`);
		}

		if (successCount > 0 || offlineCount > 0) {
			toast.success(`${parts.join(", ")}`);
		}

		if (failCount > 0) {
			toast.error(`${failCount} evidencia(s) no pudieron subirse`);
		}
	}, [orderId, photos, gpsCapture, uploadMutation, validateAllTitles]);

	// ── Derived state ──────────────────────────────────────────────────────

	const hasErrors = photos.some((p) => !!p.error || !p.title.trim());
	const canSubmit =
		!!orderId && photos.length > 0 && !hasErrors && !isSubmitting && !uploadMutation.isPending;

	const validPhotoCount = photos.filter((p) => p.title.trim()).length;

	// ── Render ─────────────────────────────────────────────────────────────

	return (
		<section aria-label="Subir evidencias fotográficas" className="space-y-6">
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept="image/jpeg,image/jpg,image/png,image/webp"
				className="hidden"
				onChange={handleFileInputChange}
			/>

			{/* ═══ Drop zone ═══ */}
			{photos.length < MAX_PHOTOS_PER_BATCH && (
				<button
					type="button"
					onClick={handleDropZoneClick}
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
			)}

			{/* ═══ Photo entry list ═══ */}
			{photos.length > 0 && (
				<div className="space-y-4">
					{photos.map((photo, index) => (
						<div
							key={photo.id}
							className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 sm:flex-row"
						>
							{/* Thumbnail */}
							<div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-28 sm:w-40">
								{/* biome-ignore lint/performance/noImgElement: blob URL preview, next/image not suitable */}
								<img
									src={photo.previewUrl}
									alt={`Vista previa ${index + 1}`}
									className="h-full w-full object-cover"
								/>
								<button
									type="button"
									onClick={() => removePhoto(photo.id)}
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
										onChange={(e) => updatePhotoTitle(photo.id, e.target.value)}
										placeholder="Ej: Sello mecánico con fuga detectada"
										maxLength={120}
										className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500 ${
											photo.error
												? "border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-400 dark:focus:ring-red-400"
												: "border-zinc-300 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:focus:border-blue-400 dark:focus:ring-blue-400"
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
										onChange={(e) => updatePhotoType(photo.id, e.target.value as EvidenceType)}
										className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
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
					))}
				</div>
			)}

			{/* ═══ GPS section ═══ */}
			<div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-700 dark:bg-zinc-900/40">
				<span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
					Geolocalización
				</span>
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
						{gpsCapture.state === "fetching" && (
							<>
								<Loader2 className="size-3.5 animate-spin text-zinc-500" />
								<span>Capturando coordenadas&hellip;</span>
							</>
						)}
						{gpsCapture.state === "success" && (
							<>
								<span className="inline-flex size-2 animate-pulse rounded-full bg-emerald-500" />
								<span className="font-medium">
									Ubicación capturada: {gpsCapture.location.lat.toFixed(5)},{" "}
									{gpsCapture.location.lng.toFixed(5)}
								</span>
							</>
						)}
						{gpsCapture.state === "error" && (
							<>
								<span className="inline-flex size-2 rounded-full bg-rose-500" />
								<span className="text-rose-700 dark:text-rose-400">
									Falla de GPS (requerido para fotos de campo)
								</span>
							</>
						)}
						{gpsCapture.state === "idle" && <span>Sin capturar</span>}
					</div>
					{(gpsCapture.state === "error" ||
						gpsCapture.state === "idle" ||
						gpsCapture.state === "success") && (
						<button
							type="button"
							onClick={captureGps}
							className="whitespace-nowrap text-[11px] font-bold text-blue-600 hover:underline dark:text-blue-400"
						>
							{gpsCapture.state === "success" ? "Actualizar GPS" : "Capturar GPS"}
						</button>
					)}
				</div>
			</div>

			{/* ═══ Submit button ═══ */}
			<div className="flex items-center gap-3">
				<button
					type="button"
					disabled={!canSubmit}
					onClick={handleSubmit}
					className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
				>
					{isSubmitting || uploadMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" aria-hidden="true" />
					) : (
						<Upload className="size-4" aria-hidden="true" />
					)}
					{isSubmitting
						? `Subiendo ${uploadProgress?.current ?? 0} de ${uploadProgress?.total ?? 0}...`
						: `Subir ${validPhotoCount} evidencia${validPhotoCount !== 1 ? "s" : ""}`}
				</button>

				{photos.length > 0 && !isSubmitting && (
					<button
						type="button"
						onClick={() => {
							for (const photo of photos) {
								URL.revokeObjectURL(photo.previewUrl);
							}
							setPhotos([]);
							setGpsCapture({ state: "idle" });
						}}
						className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						Cancelar todo
					</button>
				)}
			</div>
		</section>
	);
}
