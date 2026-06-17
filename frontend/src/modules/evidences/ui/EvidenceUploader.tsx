"use client";

import { Camera, QrCode } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { useEvidenceUpload } from "../hooks/useEvidenceUpload";
import { MAX_PHOTOS_PER_BATCH } from "../model/constants";
import { EvidenceDropZone } from "./EvidenceDropZone";
import { EvidenceGpsCapture } from "./EvidenceGpsCapture";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { EvidenceSubmitBar } from "./EvidenceSubmitBar";

// Lazy load — browser-only components
const QRScanner = dynamic(() => import("./QRScanner").then((m) => ({ default: m.QRScanner })), {
	ssr: false,
});
const CameraCapture = dynamic(
	() => import("./CameraCapture").then((m) => ({ default: m.CameraCapture })),
	{ ssr: false },
);

// ─── Props ───────────────────────────────────────────────────────────────────

interface EvidenceUploaderProps {
	orderId?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EvidenceUploader({ orderId }: EvidenceUploaderProps) {
	const {
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
		isPending,
	} = useEvidenceUpload(orderId);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const { photos, gpsCapture, isSubmitting, uploadProgress } = state;
	const validPhotoCount = photos.filter((p) => p.title.trim()).length;

	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (files && files.length > 0) {
				addFiles(files);
			}
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
		[addFiles],
	);

	const handleDropZoneClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	return (
		<section aria-label="Subir evidencias fotográficas" className="space-y-6">
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept="image/jpeg,image/jpg,image/png,image/webp"
				capture="environment"
				className="hidden"
				onChange={handleFileInputChange}
				aria-label="Seleccionar archivos de imagen"
			/>

			{photos.length < MAX_PHOTOS_PER_BATCH && (
				<div className="space-y-3">
					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => setShowCamera(true)}
							className="flex items-center gap-2 rounded-lg border border-[var(--border-medium)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
							aria-label="Tomar foto con la cámara"
						>
							<Camera className="size-4" /> Tomar foto
						</button>
						<button
							type="button"
							onClick={() => setShowQRScanner(true)}
							className="flex items-center gap-2 rounded-lg border border-[var(--border-medium)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
							aria-label="Escanear código QR"
						>
							<QrCode className="size-4" /> Escanear QR
						</button>
					</div>
					<EvidenceDropZone onClick={handleDropZoneClick} />
				</div>
			)}

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

			{showCamera && (
				<CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
			)}
			{showQRScanner && (
				<QRScanner
					onScan={(data) => {
						toast.success(`Código escaneado: ${data}`);
						setShowQRScanner(false);
					}}
					onClose={() => setShowQRScanner(false)}
				/>
			)}

			<EvidenceSubmitBar
				canSubmit={canSubmit}
				isSubmitting={isSubmitting}
				isPending={isPending}
				uploadProgress={uploadProgress}
				validPhotoCount={validPhotoCount}
				photosLength={photos.length}
				onSubmit={handleSubmit}
				onCancel={handleCancelAll}
			/>
		</section>
	);
}
