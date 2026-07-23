"use client";

import type { EvidenceType } from "@cermont/shared-types";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import {
	createUuid,
	MAX_PHOTOS_PER_BATCH,
	type PhotoEntry,
	validateFile,
} from "../model/constants";
import {
	type EvidenceUploadState,
	evidenceReducer,
	initialUploadState,
} from "../model/evidenceReducer";
import { useOfflineEvidence } from "./useOfflineEvidence";

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface UseEvidenceUploadReturn {
	state: EvidenceUploadState;
	addFiles: (files: FileList | File[]) => void;
	removePhoto: (id: string) => void;
	updatePhotoTitle: (id: string, title: string) => void;
	updatePhotoType: (id: string, type: EvidenceType) => void;
	captureGps: () => void;
	handleSubmit: () => Promise<void>;
	handleCancelAll: () => void;
	handleCameraCapture: (file: File) => void;
	showCamera: boolean;
	setShowCamera: (v: boolean) => void;
	showQRScanner: boolean;
	setShowQRScanner: (v: boolean) => void;
	canSubmit: boolean;
	hasErrors: boolean;
	validPhotoCount: number;
	isPending: boolean;
}

export function useEvidenceUpload(orderId?: string): UseEvidenceUploadReturn {
	const [state, dispatch] = useReducer(evidenceReducer, initialUploadState);
	const uploadMutation = useOfflineEvidence();
	const [showCamera, setShowCamera] = useState(false);
	const [showQRScanner, setShowQRScanner] = useState(false);

	// Keep a ref to latest photos for the unmount cleanup
	const photosRef = useRef(state.photos);
	useEffect(() => {
		photosRef.current = state.photos;
	}, [state.photos]);

	// Cleanup all blob URLs on unmount
	useEffect(() => {
		const urls = photosRef.current.map((p) => p.previewUrl);
		return () => {
			for (const url of urls) {
				URL.revokeObjectURL(url);
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

		dispatch({ type: "ADD_PHOTOS", payload: newPhotos });
	}, []);

	// ── Photo entry manipulation ───────────────────────────────────────────

	const removePhoto = useCallback((id: string) => {
		dispatch({ type: "REMOVE_PHOTO", payload: id });
	}, []);

	const updatePhotoTitle = useCallback((id: string, title: string) => {
		dispatch({ type: "UPDATE_PHOTO_TITLE", payload: { id, title } });
	}, []);

	const updatePhotoType = useCallback((id: string, type: EvidenceType) => {
		dispatch({ type: "UPDATE_PHOTO_TYPE", payload: { id, type } });
	}, []);

	// ── GPS ────────────────────────────────────────────────────────────────

	const captureGps = useCallback(() => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			dispatch({ type: "SET_GPS", payload: { state: "error" } });
			return;
		}

		dispatch({ type: "SET_GPS", payload: { state: "fetching" } });
		navigator.geolocation.getCurrentPosition(
			(position) => {
				dispatch({
					type: "SET_GPS",
					payload: {
						state: "success",
						location: {
							lat: position.coords.latitude,
							lng: position.coords.longitude,
						},
					},
				});
			},
			() => {
				dispatch({ type: "SET_GPS", payload: { state: "error" } });
			},
			{ enableHighAccuracy: true, timeout: 8000 },
		);
	}, []);

	// ── Validation ─────────────────────────────────────────────────────────

	const validateAllTitles = useCallback((): boolean => {
		let allValid = true;
		for (const photo of state.photos) {
			if (!photo.title.trim()) {
				allValid = false;
			}
		}
		if (!allValid) {
			// Mark invalid photos via dispatch
			for (const photo of state.photos) {
				if (!photo.title.trim()) {
					dispatch({
						type: "UPDATE_PHOTO_TITLE",
						payload: { id: photo.id, title: photo.title },
					});
				}
			}
		}
		return allValid;
	}, [state.photos]);

	// ── Submit ─────────────────────────────────────────────────────────────

	const handleSubmit = useCallback(async () => {
		if (!orderId) {
			toast.error("Selecciona una orden de trabajo primero");
			return;
		}

		if (state.photos.length === 0) {
			toast.error("Agrega al menos una foto antes de subir");
			return;
		}

		if (!validateAllTitles()) {
			toast.error("Completa todos los títulos requeridos");
			return;
		}

		dispatch({ type: "SET_SUBMITTING", payload: true });
		dispatch({
			type: "SET_UPLOAD_PROGRESS",
			payload: { current: 0, total: state.photos.length },
		});

		let successCount = 0;
		let offlineCount = 0;
		let failCount = 0;

		for (let i = 0; i < state.photos.length; i += 1) {
			const photo = state.photos[i];
			dispatch({
				type: "SET_UPLOAD_PROGRESS",
				payload: { current: i + 1, total: state.photos.length },
			});

			try {
				const gpsPayload =
					state.gpsCapture.state === "success"
						? {
								lat: state.gpsCapture.location.lat,
								lng: state.gpsCapture.location.lng,
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
		for (const photo of state.photos) {
			URL.revokeObjectURL(photo.previewUrl);
		}

		dispatch({ type: "RESET" });

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
	}, [orderId, state.photos, state.gpsCapture, uploadMutation, validateAllTitles]);

	// ── Derived state ──────────────────────────────────────────────────────

	const hasErrors = state.photos.some((p) => !!p.error || !p.title.trim());
	const canSubmit =
		!!orderId &&
		state.photos.length > 0 &&
		!hasErrors &&
		!state.isSubmitting &&
		!uploadMutation.isPending;

	const validPhotoCount = state.photos.filter((p) => p.title.trim()).length;

	const handleCancelAll = useCallback(() => {
		dispatch({ type: "RESET" });
	}, []);

	const handleCameraCapture = useCallback(
		(file: File) => {
			addFiles([file]);
			setShowCamera(false);
		},
		[addFiles],
	);

	return {
		state,
		addFiles,
		removePhoto,
		updatePhotoTitle,
		updatePhotoType,
		captureGps,
		handleSubmit,
		handleCancelAll,
		handleCameraCapture,
		showCamera,
		setShowCamera,
		showQRScanner,
		setShowQRScanner,
		canSubmit,
		hasErrors,
		validPhotoCount,
		isPending: uploadMutation.isPending,
	};
}
