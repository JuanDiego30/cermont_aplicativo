"use client";

import type { EvidenceType } from "@cermont/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useOfflineEvidence } from "../hooks/useOfflineEvidence";
import type { GpsCaptureState } from "../model/constants";
import {
	createUuid,
	MAX_PHOTOS_PER_BATCH,
	type PhotoEntry,
	validateFile,
} from "../model/constants";
import { EvidenceDropZone } from "./EvidenceDropZone";
import { EvidenceGpsCapture } from "./EvidenceGpsCapture";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { EvidenceSubmitBar } from "./EvidenceSubmitBar";

// ─── Props ───────────────────────────────────────────────────────────────────

interface EvidenceUploaderProps {
	orderId?: string;
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

	// Keep a ref to latest photos for the unmount cleanup
	const photosRef = useRef(photos);
	photosRef.current = photos;

	// Cleanup all blob URLs on unmount — uses ref to avoid stale closure
	useEffect(() => {
		return () => {
			for (const photo of photosRef.current) {
				URL.revokeObjectURL(photo.previewUrl);
			}
		};
		// react-doctor(false-positive): photosRef stays in sync, cleanup reads latest version
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

	const handleCancelAll = useCallback(() => {
		for (const photo of photos) {
			URL.revokeObjectURL(photo.previewUrl);
		}
		setPhotos([]);
		setGpsCapture({ state: "idle" });
	}, [photos]);

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
				aria-label="Seleccionar archivos de imagen"
			/>

			{photos.length < MAX_PHOTOS_PER_BATCH && <EvidenceDropZone onClick={handleDropZoneClick} />}

			{photos.length > 0 && (
				<div className="space-y-4">
					{photos.map((photo, index) => (
						<EvidencePhotoCard
							key={photo.id}
							photo={photo}
							index={index}
							onRemove={removePhoto}
							onUpdateTitle={updatePhotoTitle}
							onUpdateType={updatePhotoType}
						/>
					))}
				</div>
			)}

			<EvidenceGpsCapture gpsCapture={gpsCapture} onCapture={captureGps} />

			<EvidenceSubmitBar
				canSubmit={canSubmit}
				isSubmitting={isSubmitting}
				isPending={uploadMutation.isPending}
				uploadProgress={uploadProgress}
				validPhotoCount={validPhotoCount}
				photosLength={photos.length}
				onSubmit={handleSubmit}
				onCancel={handleCancelAll}
			/>
		</section>
	);
}
